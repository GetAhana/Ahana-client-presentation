import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { summitPlumbing } from './sample-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

const inject =
  'window.AHANA_DATA = ' +
  JSON.stringify(summitPlumbing) +
  '; /* __AHANA_INJECT__ — sample: Summit Plumbing Co. */';

let html = template.replace(
  /window\.AHANA_DATA = \{\{DECK_JSON\}\}; \/\* __AHANA_INJECT__ \*\//,
  inject
);
html = html.replace(
  '<title>Digital Success Consultation — Ahana</title>',
  '<title>Summit Plumbing Co. — Digital Success Consultation (Sample)</title>'
);
html = html.replace(
  '<!-- ===== Make pulls this template',
  '<!-- SAMPLE CLIENT — Summit Plumbing Co., Austin TX. Open in a browser; deck auto-starts.\n     ===== Make pulls this template'
);

const outDir = path.join(root, 'samples');
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'summit-plumbing-sample.html');
fs.writeFileSync(outPath, html);
console.log('Wrote', outPath);
