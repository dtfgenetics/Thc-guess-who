import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const root = resolve('dist');
const base = process.env.VITE_BASE_PATH || '/games/who-took-it/';
if (!base.startsWith('/') || !base.endsWith('/')) throw new Error('Invalid preview base path');
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff': 'font/woff',
  '.woff2': 'font/woff2', '.ico': 'image/x-icon', '.gif': 'image/gif'
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', 'http://localhost');
    const pathname = decodeURIComponent(url.pathname);
    if (!pathname.startsWith(base)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const relative = pathname.slice(base.length) || 'index.html';
    const file = resolve(root, relative);
    if (file !== root && !file.startsWith(root + sep)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const data = await readFile(file);
    res.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' });
    res.end(data);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(4173, '127.0.0.1', () => {
  console.log('Production preview: http://127.0.0.1:4173' + base);
});
