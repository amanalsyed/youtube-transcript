import type { IncomingMessage, ServerResponse } from 'http';
import { fetchYouTubeTranscript } from '../server/youtube';

interface VercelRequest extends IncomingMessage {
  query?: Record<string, string>;
  body?: any;
  method?: string;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
  send: (data: any) => void;
  setHeader: (name: string, value: string | number | readonly string[]) => this;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).send('OK');
  }

  const rawInput = (req.body?.url || req.query?.url || req.query?.videoId || req.body?.videoId) as string;
  const targetLang = (req.query?.lang || req.body?.lang) as string | undefined;

  if (!rawInput) {
    return res.status(400).json({
      success: false,
      error: "Missing required 'url' or 'videoId' parameter.",
    });
  }

  try {
    const result = await fetchYouTubeTranscript(rawInput, targetLang);
    return res.status(result.success ? 200 : 400).json(result);
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: error?.message || 'Internal server error while fetching transcript',
    });
  }
}
