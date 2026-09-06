import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

function lightningDevProxyPlugin(env: Record<string, string>) {
  return {
    name: 'lightning-dev-proxy',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        const url = req.url ? req.url.split('?')[0] : '';

        if (url === '/api/lightning/status' && req.method === 'GET') {
          const upstreamUrl =
            env.LIGHTNING_UPSTREAM_URL ||
            process.env.LIGHTNING_UPSTREAM_URL ||
            'http://127.0.0.1:8000';
          let host = '127.0.0.1:8000';
          try {
            host = new URL(upstreamUrl).host;
          } catch {
            host = upstreamUrl.replace(/^https?:\/\//, '').split('/')[0] || '127.0.0.1:8000';
          }
          res.setHeader('Content-Type', 'application/json');
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'online',
              model: 'LIGHTNING-1',
              backend: host,
            })
          );
        }

        if (url === '/api/lightning/generate-prompt' && req.method === 'POST') {
          const chunks: any[] = [];
          req.on('data', (chunk: any) => chunks.push(chunk));
          req.on('end', async () => {
            try {
              const rawBody = Buffer.concat(chunks).toString('utf-8');
              const body = rawBody ? JSON.parse(rawBody) : {};
              const idea = body.idea ? String(body.idea).trim() : '';

              if (!idea) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Bad Request',
                    detail: 'Please provide a website idea in the "idea" field.',
                  })
                );
              }

              const upstreamUrl =
                env.LIGHTNING_UPSTREAM_URL ||
                process.env.LIGHTNING_UPSTREAM_URL ||
                'http://127.0.0.1:8000';
              const cleanUpstream = upstreamUrl.replace(/\/+$/, '');
              const targetUrl = `${cleanUpstream}/api/v1/generate-prompt`;
              const apiKey = env.LIGHTNING_API_KEY || process.env.LIGHTNING_API_KEY;

              const headers: Record<string, string> = {
                'Content-Type': 'application/json',
              };
              if (apiKey) {
                headers['Authorization'] = `Bearer ${apiKey}`;
                headers['X-API-Key'] = apiKey;
              }

              const upstreamRes = await fetch(targetUrl, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                  idea,
                  target_platform: body.target_platform || 'lovable',
                  preferences: body.preferences || {},
                }),
                signal: AbortSignal.timeout(60000),
              });

              const data = await upstreamRes.json().catch(() => null);
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = upstreamRes.status;
              return res.end(JSON.stringify(data || { error: 'Upstream returned no data' }));
            } catch (err: any) {
              const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError';
              const statusCode = isTimeout ? 504 : 502;
              const upstreamUrl =
                env.LIGHTNING_UPSTREAM_URL ||
                process.env.LIGHTNING_UPSTREAM_URL ||
                'http://127.0.0.1:8000';
              res.setHeader('Content-Type', 'application/json');
              res.statusCode = statusCode;
              return res.end(
                JSON.stringify({
                  error: isTimeout ? 'Gateway Timeout' : 'Bad Gateway',
                  detail: isTimeout
                    ? 'The upstream LIGHTNING engine timed out. Please try again.'
                    : `Unable to connect to upstream LIGHTNING server at ${upstreamUrl}. Ensure your backend is running.`,
                })
              );
            }
          });
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss(), lightningDevProxyPlugin(env)],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
