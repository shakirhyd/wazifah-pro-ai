import fs from 'node:fs';
import path from 'node:path';

const distDir = path.resolve(process.cwd(), 'dist');
const clientDir = path.resolve(process.cwd(), 'dist/client');
const targetDir = fs.existsSync(clientDir) ? clientDir : distDir;

if (!fs.existsSync(targetDir)) {
  console.log('Target build directory not found, skipping postbuild.');
  process.exit(0);
}

// 1. Create .nojekyll for GitHub Pages
fs.writeFileSync(path.join(targetDir, '.nojekyll'), '');
console.log('Created .nojekyll in target directory');

// 2. Process index.html
const indexPath = path.join(targetDir, 'index.html');
if (fs.existsSync(indexPath)) {
  let html = fs.readFileSync(indexPath, 'utf-8');

  // Inject base tag script if not present
  if (!html.includes('var baseEl = document.createElement(\'base\')')) {
    const baseScript = `<script>
      (function() {
        var path = window.location.pathname;
        var base = '/';
        if (path && path !== '/') {
          var segments = path.split('/').filter(Boolean);
          if (segments.length > 0 && !segments[0].includes('.')) {
            if (window.location.hostname.endsWith('github.io') || segments[0] === 'wazifah-pro-ai') {
              base = '/' + segments[0] + '/';
            }
          }
        }
        var baseEl = document.createElement('base');
        baseEl.href = base;
        document.head.appendChild(baseEl);
      })();
    </script>`;
    html = html.replace('<head>', `<head>\n    ${baseScript}`);
    fs.writeFileSync(indexPath, html, 'utf-8');
  }

  // Generate 404.html for GitHub Pages single-page routing
  fs.writeFileSync(path.join(targetDir, '404.html'), html, 'utf-8');
  console.log('Successfully updated index.html and generated 404.html');
}

// 3. Copy public files to targetDir if needed
const publicDir = path.resolve(process.cwd(), 'public');
if (fs.existsSync(publicDir)) {
  const publicFiles = fs.readdirSync(publicDir);
  for (const file of publicFiles) {
    const srcFile = path.join(publicDir, file);
    const destFile = path.join(targetDir, file);
    if (fs.statSync(srcFile).isFile() && !fs.existsSync(destFile)) {
      fs.copyFileSync(srcFile, destFile);
    }
  }
}

