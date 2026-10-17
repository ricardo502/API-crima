// Mantenimiento opcional. browser.js ya está guardado en Git;
// abrir index.html o publicar en Pages no requieren ejecutar este archivo.
import { readFile, writeFile } from 'node:fs/promises';
const sources = await Promise.all(['weather.mjs', 'api.mjs', 'app.js'].map(file => readFile(new URL(`../${file}`, import.meta.url), 'utf8')));
const body = sources.map(source => source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')).join('\n');
await writeFile(new URL('../browser.js', import.meta.url), `// Script clásico compatible con archivos locales y GitHub Pages.\n(() => {\n'use strict';\n${body}\n})();\n`);
