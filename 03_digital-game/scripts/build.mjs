import { build, context } from 'esbuild';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const dev = process.argv.includes('--dev');
const base = dev ? '/' : (process.env.VITE_BASE_PATH || '/games/who-took-it/');
if (!base.startsWith('/') || !base.endsWith('/')) {
  throw new Error('VITE_BASE_PATH must begin and end with /');
}

const dist = resolve('dist');
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });
const args = {
  entryPoints: ['src/main.jsx'],
  bundle: true,
  platform: 'browser',
  format: 'esm',
  target: ['es2022'],
  jsx: 'automatic',
  outdir: resolve(dist, 'assets'),
  entryNames: 'app',
  assetNames: 'media-[hash]',
  publicPath: `${base}assets`,
  minify: !dev,
  sourcemap: dev || process.env.VITE_ENABLE_SOURCEMAPS === 'true',
  loader: {
    '.png': 'file', '.jpg': 'file', '.jpeg': 'file',
    '.webp': 'file', '.svg': 'file', '.woff': 'file',
    '.woff2': 'file', '.gif': 'file'
  },
  define: {
    'import.meta.env.BASE_URL': JSON.stringify(base),
    'import.meta.env.DEV': JSON.stringify(dev),
    'import.meta.env.PROD': JSON.stringify(!dev),
    'process.env.NODE_ENV': JSON.stringify(dev ? 'development' : 'production')
  },
  logLevel: 'info'
};

const source = await readFile('index.html', 'utf8');
const entry = '<script type="module" src="/src/main.jsx"></script>';
if (source.split(entry).length !== 2) throw new Error('Source HTML entry point changed; update build integration');
const html = source.replace(entry, `<link rel="stylesheet" href="${base}assets/app.css" /><script type="module" src="${base}assets/app.js"></script>`);
await writeFile(resolve(dist, 'index.html'), html);
await cp('public', dist, { recursive: true, force: true });

if (dev) {
  const ctx = await context(args);
  await ctx.watch();
  const server = await ctx.serve({ servedir: dist, host: '127.0.0.1', port: 5173 });
  console.log(`Development site at http://127.0.0.1:${server.port}/`);
} else {
  await build(args);
}
