// Verify the live GitHub Pages URL: loads, manifest + icons OK, plays (and clears a row) on desktop Chromium + iPhone WebKit, rotates, no console errors.
const { chromium, webkit, devices } = require('playwright'); const path = require('path');
const BASE = process.env.BASE || 'https://antonolson47-ctrl.github.io/pappa-kennedys-electric-works/';
const NAME = "Pappa Kennedy's Electric Works";
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  for (const [label, eng, opts] of [['desktop-chromium', chromium, { viewport: { width: 1280, height: 720 } }], ['iphone-webkit', webkit, (({ defaultBrowserType, ...d }) => d)(devices['iPhone 13'])]]) {
    const b = await eng.launch(); const ctx = await b.newContext(opts); const p = await ctx.newPage(); const errs = [], bad = [];
    p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    p.on('response', r => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    const r = await p.goto(BASE + '?v=' + Date.now(), { waitUntil: 'load' }); ok(r.status() === 200, `${label}: live page HTTP ${r.status()}`);
    await p.waitForTimeout(1200);
    ok(await p.title() === NAME, `${label}: title "${await p.title()}"`);
    const man = await p.evaluate(async () => { const l = document.querySelector('link[rel=manifest]'); const j = await (await fetch(l.href)).json(); const st = []; for (const ic of j.icons) st.push((await fetch(new URL(ic.src, l.href))).status); const ap = await fetch(document.querySelector('link[rel=apple-touch-icon]').href); return { name: j.name, orientation: j.orientation, display: j.display, icons: st, apple: ap.status, appleType: ap.headers.get('content-type') }; });
    ok(man.name === NAME && man.orientation === 'any' && man.icons.length >= 3 && man.icons.every(s => s === 200) && man.apple === 200, `${label}: manifest + icons served ${JSON.stringify(man)}`);
    ok(await p.evaluate(() => __PK.scene === 'title'), `${label}: title screen running`);
    const touch = label.startsWith('iphone');
    if (touch) { const bb = await p.locator('button[data-k=new]').boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await p.keyboard.press('Enter');
    await p.waitForTimeout(700); ok(await p.evaluate(() => __PK.scene === 'play'), `${label}: game started by ${touch ? 'tap' : 'keyboard'}`);
    if (touch) await p.touchscreen.tap(200, 200); else await p.keyboard.press('KeyK');
    await p.waitForTimeout(300);
    await p.evaluate(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(1); G.fallT = -99; });
    if (touch) { const bb = await p.locator('#tc .tb[data-a=hard]').boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); } else await p.keyboard.press('Space');
    await p.waitForTimeout(1500);
    const st = await p.evaluate(() => ({ sc: __PK.scene, phase: __PK.G.phase, lines: __PK.G.lines, meter: __PK.G.meter, audio: __PK.audio.state().ctx }));
    ok(st.sc === 'play' && st.phase === 'play' && st.lines === 1 && st.meter > 0.08, `${label}: plays, row clear fills the meter ${JSON.stringify(st)}`);
    if (touch) { await p.setViewportSize(devices['iPhone 13 landscape'].viewport); await p.waitForTimeout(900); const f = await p.evaluate(() => ({ m: __PK.L.mode, sc: __PK.scene, ph: __PK.G.phase })); ok(f.m === 'landscape' && f.sc === 'play', `${label}: rotates to landscape mid-game on live site ${JSON.stringify(f)}`); await p.screenshot({ path: path.resolve(__dirname, '../screenshots/live_iphone_landscape.png') });
      await p.setViewportSize(devices['iPhone 13'].viewport); await p.waitForTimeout(900); ok(await p.evaluate(() => __PK.L.mode) === 'portrait', `${label}: rotates back to portrait`); await p.screenshot({ path: path.resolve(__dirname, '../screenshots/live_iphone_portrait.png') }); }
    else await p.screenshot({ path: path.resolve(__dirname, '../screenshots/live_desktop_gameplay.png') });
    ok(bad.length === 0, `${label}: no failed requests ${JSON.stringify(bad)}`);
    ok(errs.length === 0, `${label}: no console errors ${JSON.stringify(errs.slice(0, 5))}`);
    await b.close();
  }
  console.log(fails ? fails + ' FAILURES' : 'LIVE ALL PASS'); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
