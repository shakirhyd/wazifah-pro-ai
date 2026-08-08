import fs from 'node:fs';
import path from 'node:path';

const clientDir = path.resolve(process.cwd(), 'dist/client');
const assetsDir = path.join(clientDir, 'assets');

if (!fs.existsSync(clientDir)) {
  console.log('dist/client directory not found, skipping postbuild.');
  process.exit(0);
}

// 1. Create .nojekyll for GitHub Pages
fs.writeFileSync(path.join(clientDir, '.nojekyll'), '');
console.log('Created .nojekyll in dist/client');

// 2. Find entry JS and CSS files in dist/client/assets
let jsFile = '';
let cssFile = '';

if (fs.existsSync(assetsDir)) {
  const files = fs.readdirSync(assetsDir);
  jsFile = files.find(f => f.startsWith('index-') && f.endsWith('.js')) || '';
  cssFile = files.find(f => f.startsWith('styles-') && f.endsWith('.css')) || '';
}

const jsScript = jsFile ? `<script type="module" src="./assets/${jsFile}"></script>` : '';
const cssLink = cssFile ? `<link rel="stylesheet" href="./assets/${cssFile}">` : '';

const indexHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <meta name="theme-color" content="#0f172a" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="WazifahBuddy" />
    <link rel="icon" type="image/png" sizes="192x192" href="./pwa-192x192.png" />
    <link rel="apple-touch-icon" href="./apple-touch-icon.png" />
    <link rel="manifest" href="./manifest.json" />
    <title>Wazifah Tracker — Tasbeeh Counter</title>
    ${cssLink}
  </head>
  <body>
    <div id="root"></div>
    ${jsScript}
  </body>
</html>
`;

fs.writeFileSync(path.join(clientDir, 'index.html'), indexHtml);
fs.writeFileSync(path.join(clientDir, '404.html'), indexHtml);
console.log('Successfully generated index.html and 404.html in dist/client');
