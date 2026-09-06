/**
 * Server-Side Status Route for LIGHTNING ATI.
 * Deployed as a Vercel Serverless Function at /api/lightning/status.
 *
 * Exposes active backend host and model identifier without leaking secret keys.
 */

export default async function handler(req: any, res?: any) {
  const setHeader = (key: string, val: string) => {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader(key, val);
    }
  };

  setHeader('Access-Control-Allow-Origin', '*');
  setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  const method = req.method || (req instanceof Request ? req.method : 'GET');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  const upstreamUrl = process.env.LIGHTNING_UPSTREAM_URL || 'http://127.0.0.1:8000';
  let host = '127.0.0.1:8000';

  try {
    const parsed = new URL(upstreamUrl);
    host = parsed.host;
  } catch {
    host = upstreamUrl.replace(/^https?:\/\//, '').split('/')[0] || '127.0.0.1:8000';
  }

  const data = {
    status: 'online',
    model: 'LIGHTNING-1',
    backend: host,
  };

  if (res && typeof res.status === 'function') {
    return res.status(200).json(data);
  }
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
