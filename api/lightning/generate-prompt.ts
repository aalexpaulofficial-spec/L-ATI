/**
 * Server-Side Proxy Route for LIGHTNING ATI.
 * Deployed as a Vercel Serverless Function at /api/lightning/generate-prompt.
 *
 * Security:
 * - Browser NEVER communicates with upstream directly.
 * - API keys and upstream URLs are kept server-side.
 */

export default async function handler(req: any, res?: any) {
  // CORS configuration
  const setHeader = (key: string, val: string) => {
    if (res && typeof res.setHeader === 'function') {
      res.setHeader(key, val);
    }
  };

  setHeader('Access-Control-Allow-Origin', '*');
  setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  const method = req.method || (req instanceof Request ? req.method : 'POST');
  if (method === 'OPTIONS') {
    if (res && typeof res.status === 'function') {
      return res.status(200).end();
    }
    return new Response(null, { status: 200 });
  }

  if (method !== 'POST') {
    const errorJson = {
      error: 'Method Not Allowed',
      detail: `Method ${method} is not supported. Use POST.`,
    };
    if (res && typeof res.status === 'function') {
      res.setHeader('Allow', 'POST');
      return res.status(405).json(errorJson);
    }
    return new Response(JSON.stringify(errorJson), {
      status: 405,
      headers: { 'Content-Type': 'application/json', Allow: 'POST' },
    });
  }

  // Parse body safely
  let body: any = null;
  try {
    if (req.body) {
      body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    } else if (typeof req.json === 'function') {
      body = await req.json();
    }
  } catch {
    const err = { error: 'Invalid JSON', detail: 'Request body must be valid JSON' };
    if (res && typeof res.status === 'function') {
      return res.status(400).json(err);
    }
    return new Response(JSON.stringify(err), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const idea = body?.idea ? String(body.idea).trim() : '';
  if (!idea) {
    const err = {
      error: 'Bad Request',
      detail: 'Please provide a website idea in the "idea" field.',
    };
    if (res && typeof res.status === 'function') {
      return res.status(400).json(err);
    }
    return new Response(JSON.stringify(err), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const targetPlatform = body?.target_platform || 'lovable';
  const preferences = body?.preferences || {};

  // Server-side environment resolution
  const isProd = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  let upstreamUrl = process.env.LIGHTNING_UPSTREAM_URL;

  if (!upstreamUrl) {
    if (isProd) {
      const err = {
        error: 'Configuration Error',
        detail:
          'LIGHTNING_UPSTREAM_URL is not set in production. Please set this environment variable in your Vercel Project Settings.',
      };
      if (res && typeof res.status === 'function') {
        return res.status(503).json(err);
      }
      return new Response(JSON.stringify(err), {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    // Default fallback for local development
    upstreamUrl = 'http://127.0.0.1:8000';
  }

  const cleanUpstream = upstreamUrl.replace(/\/+$/, '');
  const targetUrl = `${cleanUpstream}/api/v1/generate-prompt`;

  // Server-side headers: client never sees the secret API key
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const apiKey = process.env.LIGHTNING_API_KEY;
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
    headers['X-API-Key'] = apiKey;
  }

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        idea,
        target_platform: targetPlatform,
        preferences,
      }),
      signal: AbortSignal.timeout(60000),
    });

    const data = await upstreamRes.json().catch(() => null);

    if (!upstreamRes.ok) {
      const errDetail =
        data?.detail || data?.error || `Upstream returned status code ${upstreamRes.status}`;
      const err = {
        error: 'Upstream Error',
        detail: errDetail,
      };
      if (res && typeof res.status === 'function') {
        return res.status(upstreamRes.status).json(err);
      }
      return new Response(JSON.stringify(err), {
        status: upstreamRes.status,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (res && typeof res.status === 'function') {
      return res.status(200).json(data);
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    let statusCode = 502;
    let message = `Unable to connect to upstream LIGHTNING server at ${cleanUpstream}. Ensure the backend is running.`;

    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      statusCode = 504;
      message = 'The upstream LIGHTNING engine timed out. Please try again.';
    }

    const errPayload = {
      error: statusCode === 504 ? 'Gateway Timeout' : 'Bad Gateway',
      detail: message,
    };

    if (res && typeof res.status === 'function') {
      return res.status(statusCode).json(errPayload);
    }
    return new Response(JSON.stringify(errPayload), {
      status: statusCode,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
