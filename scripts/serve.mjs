import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
const allowed = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/weather.mjs', ['weather.mjs', 'text/javascript; charset=utf-8']],
  ['/config.js', ['config.js', 'text/javascript; charset=utf-8']],
  ['/api.mjs', ['api.mjs', 'text/javascript; charset=utf-8']],
]);
const port = Number(process.env.PORT || 4173);
createServer(async (req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
  const url = new URL(req.url, 'http://localhost');
  const file = allowed.get(url.pathname);
  if (!file) { res.writeHead(404); res.end('No encontrado'); return; }
  try {
    const content = await readFile(new URL(`../${file[0]}`, import.meta.url));
    res.writeHead(200, { 'Content-Type': file[1], 'Cache-Control': 'no-store' });
    res.end(req.method === 'HEAD' ? undefined : content);
  } catch { res.writeHead(500); res.end('No se pudo leer el archivo'); }
}).listen(port, process.env.HOST || '127.0.0.1', () => console.log(`Local: http://127.0.0.1:${port}`));
