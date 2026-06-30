import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { summitPlumbing } from './sample-data.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

const PDF_CSS = `
/* PDF export — all slides, no rep chrome */
html.pdf-mode body{overflow:visible;background:#0F0F10}
html.pdf-mode .control,html.pdf-mode .preflight,html.pdf-mode .chrome,html.pdf-mode .panel,html.pdf-mode .progress{display:none!important}
html.pdf-mode .deck-wrap{position:static;display:block!important;height:auto;min-height:0}
html.pdf-mode .deck{position:static;overflow:visible;height:auto}
html.pdf-mode .slide{position:relative!important;display:flex!important;opacity:1!important;transform:none!important;animation:none!important;min-height:100vh;height:auto;page-break-after:always;break-after:page;padding:48px 64px 64px}
html.pdf-mode .slide:last-child{page-break-after:auto}
html.pdf-mode input[type=range]{display:none!important}
html.pdf-mode .roi-verdict{display:block!important}
@media print{
  html.pdf-mode .control,html.pdf-mode .preflight,html.pdf-mode .chrome,html.pdf-mode .panel,html.pdf-mode .progress{display:none!important}
  html.pdf-mode .slide{display:flex!important;page-break-after:always;break-after:page;-webkit-print-color-adjust:exact;print-color-adjust:exact}
}
`;

const PDF_BOOT = `
function finalizeForPdf(){
  document.getElementById('control').hidden=true;
  document.getElementById('deckWrap').hidden=false;
  document.getElementById('preflight').hidden=true;
  document.body.classList.add('presenting','pdf-export');
  state.data=emptyData();
  var inj=getInjected();if(inj)mergeDeep(state.data,inj);
  buildDeck();
  document.querySelectorAll('.slide').forEach(function(el){el.classList.add('active');});
  document.querySelectorAll('[data-countup]').forEach(function(el){
    var t=+el.dataset.countup,pre=el.dataset.prefix!=null?el.dataset.prefix:'$';
    el.textContent=pre+Math.round(t).toLocaleString('en-US');
  });
  document.querySelectorAll('[data-roi]').forEach(function(roi){
    if(!roi.dataset.wired){wireROI(roi);roi.dataset.wired='1';}
  });
}
`;

function buildPdfHtml() {
  let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const inject =
    'window.AHANA_DATA = ' +
    JSON.stringify(summitPlumbing) +
    '; /* __AHANA_INJECT__ — PDF sample */';
  html = html.replace(
    /window\.AHANA_DATA = \{\{DECK_JSON\}\}; \/\* __AHANA_INJECT__ \*\//,
    inject
  );
  html = html.replace('<html lang="en">', '<html lang="en" class="pdf-mode">');
  html = html.replace(
    '<title>Digital Success Consultation — Ahana</title>',
    '<title>Summit Plumbing Co. — Consultation Deck (PDF)</title>'
  );
  html = html.replace('</style>', PDF_CSS + '\n</style>');
  html = html.replace(
    '/* =====================================================================\n   BOOT\n   ===================================================================== */\nfunction boot(){',
    () => PDF_BOOT + '\n/* =====================================================================\n   BOOT\n   ===================================================================== */\nfunction boot(){'
  );
  html = html.replace(
    'function boot(){\n  state.data=emptyData();',
    () =>
      'function boot(){\n  if(document.documentElement.classList.contains(\'pdf-mode\')){finalizeForPdf();return;}\n  state.data=emptyData();'
  );
  return html;
}

async function main() {
  const outDir = path.join(root, 'samples');
  fs.mkdirSync(outDir, { recursive: true });
  const htmlPath = path.join(outDir, 'summit-plumbing-sample-pdf.html');
  const pdfPath = path.join(outDir, 'summit-plumbing-sample.pdf');
  fs.writeFileSync(htmlPath, buildPdfHtml());
  console.log('Wrote', htmlPath);

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto('file:///' + htmlPath.replace(/\\/g, '/'), {
      waitUntil: 'networkidle0',
      timeout: 60000,
    });
    await page.waitForFunction(
      () => document.querySelectorAll('.slide').length >= 10,
      { timeout: 30000 }
    );
    await page.evaluate(() => document.fonts && document.fonts.ready);
    await new Promise((r) => setTimeout(r, 1500));
    await page.pdf({
      path: pdfPath,
      format: 'Letter',
      landscape: true,
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: false,
    });
    console.log('Wrote', pdfPath);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
