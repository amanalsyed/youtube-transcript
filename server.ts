import express, { Request, Response } from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { analyzeInputUrl, fetchYouTubeTranscript } from './server/youtube';
import { transcriptRateLimiter } from './server/rateLimiter';
import { POPULAR_TRANSLATION_LANGUAGES, translateTranscriptSegments } from './server/translator';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Performance & Security middleware
  app.use((req: Request, res: Response, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  // Health check
  app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Crawlability: robots.txt
  app.get('/robots.txt', (req: Request, res: Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const robotsTxt = `# https://www.robotstxt.org/robotstxt.html
User-agent: *
Allow: /
Allow: /api/health
Disallow: /api/transcript

# Sitemaps
Sitemap: ${protocol}://${host}/sitemap.xml
`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(robotsTxt);
  });

  // Crawlability: sitemap.xml
  app.get('/sitemap.xml', (req: Request, res: Response) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https';
    const host = req.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const today = new Date().toISOString().split('T')[0];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/#how-it-works</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#features</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/#faq</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(sitemapXml);
  });

  // Handler for transcript request with rate limiting and comprehensive error response
  const handleTranscriptRequest = async (req: Request, res: Response) => {
    const rawInput = (req.body?.url || req.query?.url || req.query?.videoId || req.body?.videoId) as string;
    const targetLang = (req.body?.lang || req.query?.lang) as string | undefined;

    if (!rawInput || typeof rawInput !== 'string') {
      res.status(400).json({
        success: false,
        errorCode: 'INVALID_URL',
        error: 'Please provide a valid YouTube video URL or ID.',
        errorDetails: {
          code: 'INVALID_URL',
          title: 'Missing Video Link',
          message: 'No YouTube URL or video ID was provided. Please paste a link to get started.',
          suggestions: [
            'Paste a YouTube link like https://www.youtube.com/watch?v=...',
            'Or paste a Shorts link like https://www.youtube.com/shorts/...',
          ],
          retryable: false,
        },
      });
      return;
    }

    const analysis = analyzeInputUrl(rawInput);
    if (!analysis.videoId) {
      res.status(400).json({
        success: false,
        errorCode: analysis.errorCode || 'INVALID_URL',
        error: analysis.errorReason || 'Invalid YouTube URL. Please enter a valid video link.',
        errorDetails: {
          code: analysis.errorCode || 'INVALID_URL',
          title: 'Invalid YouTube Link',
          message: analysis.errorReason || 'The link provided is not a supported YouTube video URL.',
          suggestions: [
            'Make sure the URL starts with youtube.com/watch?v= or youtu.be/',
            'For YouTube Shorts, use youtube.com/shorts/<id>',
            'Check for missing or extra characters in the link',
          ],
          retryable: false,
        },
      });
      return;
    }

    try {
      const result = await fetchYouTubeTranscript(analysis.videoId, targetLang);
      if (!result.success) {
        let statusCode = 400;
        if (result.errorCode === 'NO_CAPTIONS' || result.errorCode === 'VIDEO_NOT_FOUND') {
          statusCode = 404;
        } else if (result.errorCode === 'RATE_LIMITED') {
          statusCode = 429;
        } else if (result.errorCode === 'PRIVATE_VIDEO') {
          statusCode = 403;
        }
        res.status(statusCode).json(result);
        return;
      }
      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/transcript:', err);
      res.status(500).json({
        success: false,
        errorCode: 'FETCH_ERROR',
        error: 'An unexpected server error occurred while retrieving the transcript. Please try again.',
        errorDetails: {
          code: 'FETCH_ERROR',
          title: 'Server Error',
          message: 'An internal server error occurred while processing the transcript.',
          suggestions: ['Click retry in a few moments', 'Verify the video is accessible on YouTube'],
          retryable: true,
        },
      });
    }
  };

  // Mount rate-limiter on /api/transcript
  app.post('/api/transcript', transcriptRateLimiter, handleTranscriptRequest);
  app.get('/api/transcript', transcriptRateLimiter, handleTranscriptRequest);

  // List available target translation languages
  app.get('/api/translate/languages', (req: Request, res: Response) => {
    res.json({
      success: true,
      languages: POPULAR_TRANSLATION_LANGUAGES,
    });
  });

  // Handler for translating transcript segments
  app.post('/api/translate', async (req: Request, res: Response) => {
    try {
      const { segments, targetLang, videoId } = req.body || {};

      if (!segments || !Array.isArray(segments) || segments.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Missing transcript segments to translate.',
        });
        return;
      }

      if (!targetLang || typeof targetLang !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Missing target language code (e.g., "es", "fr", "de").',
        });
        return;
      }

      const result = await translateTranscriptSegments(segments, targetLang, videoId);
      if (!result.success) {
        res.status(500).json(result);
        return;
      }

      res.json(result);
    } catch (err: unknown) {
      console.error('Error in /api/translate:', err);
      const msg = err instanceof Error ? err.message : 'Unknown translation error';
      res.status(500).json({
        success: false,
        error: `Server translation failed: ${msg}`,
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // Cache static assets (JS, CSS, images) with long max-age, index.html with no-cache
    app.use(
      express.static(distPath, {
        maxAge: '1y',
        immutable: true,
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, must-revalidate');
          }
        },
      })
    );
    app.get('*', (req: Request, res: Response) => {
      res.setHeader('Cache-Control', 'no-cache, must-revalidate');
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`YouTube Transcript Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
