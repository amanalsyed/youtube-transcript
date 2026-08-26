import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  timestamps: number[];
}

const ipRequestMap = new Map<string, RateLimitRecord>();

// Config
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 35; // 35 requests per minute per IP

// Clean up stale IPs periodically (every 5 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestMap.entries()) {
    record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);
    if (record.timestamps.length === 0) {
      ipRequestMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || req.ip || '127.0.0.1';
}

export function transcriptRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = getClientIp(req);
  const now = Date.now();

  let record = ipRequestMap.get(ip);
  if (!record) {
    record = { timestamps: [] };
    ipRequestMap.set(ip, record);
  }

  // Remove timestamps outside the sliding window
  record.timestamps = record.timestamps.filter((t) => now - t < WINDOW_MS);

  const currentCount = record.timestamps.length;
  const remaining = Math.max(0, MAX_REQUESTS - currentCount);
  const oldestTimestamp = record.timestamps[0] || now;
  const resetTimeSeconds = Math.ceil((oldestTimestamp + WINDOW_MS - now) / 1000);

  // Set standard RateLimit headers
  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS.toString());
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Reset', resetTimeSeconds.toString());

  if (currentCount >= MAX_REQUESTS) {
    const retryAfter = Math.max(1, resetTimeSeconds);
    res.setHeader('Retry-After', retryAfter.toString());
    res.status(429).json({
      success: false,
      errorCode: 'RATE_LIMITED',
      retryAfter,
      error: `Rate limit reached. Please wait ${retryAfter} seconds before requesting another transcript.`,
      errorDetails: {
        code: 'RATE_LIMITED',
        title: 'Rate Limit Reached',
        message: `You have made multiple requests in a short period. Please wait ${retryAfter} seconds before trying again.`,
        suggestions: [
          'Wait a few seconds for the cooldown to reset',
          'Use previously fetched transcripts from your local History',
          'Avoid rapid repetitive clicking',
        ],
        retryable: true,
      },
    });
    return;
  }

  // Add current request
  record.timestamps.push(now);
  next();
}
