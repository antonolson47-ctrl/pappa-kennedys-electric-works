// renders all 10 objects (unlit / half-wired / lit) + Pappa poses into one sheet for art review
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1500, height: 900 } });
  await p.goto('file://' + path.resolve(__dirname, '../PappaKennedy.html')); await p.waitForTimeout(500);
  await p.evaluate(() => { __PK.go({ name: 'gal', draw() { const g = document.getElementById('cv').getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#050208'; g.fillRect(0, 0, 3000, 3000); g.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    for (let i = 0; i < 10; i++) { const x = 75 + (i % 5) * 150 + (i >= 5 ? 0 : 0), y = i < 5 ? 80 : 410; __PK.drawObject(i, x, y, 120, { p: 0, on: 0, t: 3, seed: i }); __PK.drawObject(i, x + 750, y, 120, { p: 1, on: 1, t: window.__t || 3, seed: i }); __PK.drawObject(i, x, y + 150, 120, { p: 0.55, on: 0, t: 3, seed: i }); }
    const poses = ['idle', 'groove', 'point', 'spin', 'split', 'slide', 'shock', 'sweat', 'celebrate', 'sad']; poses.forEach((ps, i) => drawPappa(75 + i * 140 + 760 * 0, 890, 200, { pose: ps, t: 0.5 })); } }); });
  await p.waitForTimeout(400); await p.screenshot({ path: process.argv[2] || '/tmp/pk/gallery.png' }); await b.close();
})();
