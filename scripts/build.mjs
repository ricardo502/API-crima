import { mkdir, copyFile } from 'node:fs/promises';
const files = ['index.html', 'style.css', 'app.js', 'config.js', 'weather.mjs'];
await mkdir('dist', { recursive: true });
await Promise.all(files.map(file => copyFile(file, `dist/${file}`)));
console.log('Sitio preparado en dist/');
