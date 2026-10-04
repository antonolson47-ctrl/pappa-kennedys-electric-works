// quick dev smoke: load, screenshot title + gameplay in a few viewports, report console errors
const { chromium, webkit, devices } = require('playwright'); const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '../PappaKennedy.html'); const OUT = process.argv[2] || '/tmp/pk';
(async () => {
  require('fs').mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(); const errs = [];
  for (const [tag, opt] of [['desk', { viewport: { width: 1280, height: 720 } }], ['port', { ...devices['iPhone 13'], defaultBrowserType: undefined }], ['land', { ...devices['iPhone 13 landscape'], defaultBrowserType: undefined }]]) {
    delete opt.defaultBrowserType; const ctx = await b.newContext(opt); const p = await ctx.newPage();
    p.on('pageerror', e => errs.push(tag + ' pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(tag + ': ' + m.text()); });
    await p.goto(URL); await p.waitForTimeout(1500); await p.screenshot({ path: `${OUT}/${tag}_title.png` });
    await p.evaluate(() => { __PK.start(3); }); await p.waitForTimeout(600); await p.screenshot({ path: `${OUT}/${tag}_intro.png` });
    await p.evaluate(() => { __PK.beginPlay(); __PK.setBoardRows(['..........', 'IIOOT.SSZZ', 'JJ.LLTTOOI', 'ZZSS.JJLLI', 'OOTTIIZZ.J']); }); await p.waitForTimeout(1200);
    await p.evaluate(() => { __PK.G.lines = 4; __PK.Pappa.react('clear', 2); }); await p.waitForTimeout(700);
    await p.screenshot({ path: `${OUT}/${tag}_play.png` });
    await p.evaluate(() => { __PK.G.lines = __PK.G.target - 1; __PK.setupClear(1); __PK.hardDrop(); }); await p.waitForTimeout(2600); await p.screenshot({ path: `${OUT}/${tag}_connect.png` });
    await ctx.close();
  }
  console.log(errs.length ? errs.join('\n') : 'no errors'); await b.close();
})().catch(e => { console.error(e); process.exit(2); });
