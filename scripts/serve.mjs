import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createProviders } from './providers.mjs';
const providers = createProviders();
const allowed = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/weather.mjs', ['weather.mjs', 'text/javascript; charset=utf-8']],
  ['/config.js', ['config.js', 'text/javascript; charset=utf-8']],
]);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    try {
      let data;
      if (url.pathname === '/api/places') data = await providers.geocode(url.searchParams.get('q'));
      else if (url.pathname === '/api/weather') data = await providers.forecast(url.searchParams.get('lat'), url.searchParams.get('lon'));
      else { res.writeHead(404); res.end(); return; }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(data));
    } catch (error) {
      res.writeHead(error.status || 502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...(error.status === 429 ? { 'Retry-After': '2' } : {}) });
      res.end(JSON.stringify({ error: error.message }));
    }
    return;
  }
  const file = allowed.get(url.pathname);
  if (!file) { res.writeHead(404); res.end('No encontrado'); return; }
  try {
    const content = await readFile(new URL(`../${file[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end('No se pudo leer el archivo'); }
}).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
