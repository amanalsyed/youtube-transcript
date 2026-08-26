import type { IncomingMessage, ServerResponse } from 'http';

export default function handler(req: IncomingMessage, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
