// Render the app icons (drawn in code) to PNG files for the Pages build: node icons.js <outdir>
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const out = process.argv[2]; const b = await chromium.launch(); const p = await b.newPage();
  await p.goto('file://' + path.resolve(__dirname, '../PappaKennedy.html')); await p.waitForTimeout(400);
  for (const [n, f] of [[180, 'apple-touch-icon.png'], [192, 'icon-192.png'], [512, 'icon-512.png'], [32, 'favicon-32.png']]) {
    const d = await p.evaluate(n => __PK.iconURL(n), n); fs.writeFileSync(path.join(out, f), Buffer.from(d.split(',')[1], 'base64'));
  }
  // maskable: same art inside the 80% safe zone on a full-bleed background
  const m = await p.evaluate(async () => { const n = 512, c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d'); x.fillStyle = '#07040a'; x.fillRect(0, 0, n, n);
    const im = new Image(); im.src = __PK.iconURL(400); await im.decode(); x.drawImage(im, 56, 56, 400, 400); return c.toDataURL('image/png'); });
  fs.writeFileSync(path.join(out, 'icon-maskable-512.png'), Buffer.from(m.split(',')[1], 'base64'));
  await b.close(); })();
