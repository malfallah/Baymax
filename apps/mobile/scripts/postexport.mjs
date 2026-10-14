// Prepares the static web export for GitHub Pages:
//  - 404.html → index.html so deep links (e.g. /doctors/123) load the SPA
//  - .nojekyll so files and folders starting with "_" are served
import { copyFileSync, existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = join(import.meta.dirname, '..', 'dist');
if (!existsSync(join(dist, 'index.html'))) {
  console.error('dist/index.html not found — run `expo export --platform web` first.');
  process.exit(1);
}
copyFileSync(join(dist, 'index.html'), join(dist, '404.html'));
writeFileSync(join(dist, '.nojekyll'), '');
console.log('Prepared dist/ for static hosting (404.html, .nojekyll).');
