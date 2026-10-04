// Mobile test: real touchscreen taps in WebKit (iPhone 13 profile) and Chromium (Pixel 7), portrait <-> landscape incl. rotation mid-game.
// Usage: node mobile.js iphone | pixel
const { webkit, chromium, devices } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = process.env.URL || 'file://' + path.resolve(__dirname, '../PappaKennedy.html');
const SHOTS = path.resolve(__dirname, '../screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
const which = process.argv[2] || 'iphone';
const PROFILES = { iphone: { engine: webkit, port: devices['iPhone 13'], land: devices['iPhone 13 landscape'] }, pixel: { engine: chromium, port: devices['Pixel 7'], land: devices['Pixel 7 landscape'] } };
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
const J = o => JSON.stringify(o);
(async () => {
  const P = PROFILES[which]; const b = await P.engine.launch();
  const { defaultBrowserType, ...dev } = P.port;
  const ctx = await b.newContext({ ...dev }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => localStorage.clear());
  await p.goto(URL); await p.waitForTimeout(1000);
  const ev = (f, a) => p.evaluate(f, a);
  const tap = async (sel) => { const bb = await p.locator(sel).first().boundingBox(); if (!bb) throw new Error('no box ' + sel); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(120); };
  const sc = () => ev(() => __PK.scene);
  const G = () => ev(() => { const G = __PK.G; return G && { phase: G.phase, level: G.level, lines: G.lines, target: G.target, meter: G.meter, score: G.score, cur: G.cur && { ...G.cur }, hold: G.hold, canHold: G.canHold, paused: G.paused }; });
  const freeze = () => ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); G.cur = { t: 'T', r: 0, x: 3, y: 6 }; G.fallT = -99; G.lockT = 0; G.canHold = true; G.inp.soft = false; });
  const noScroll = async (tag) => { const r = await ev(() => ({ sh: document.scrollingElement.scrollHeight, sw: document.scrollingElement.scrollWidth, ih: innerHeight, iw: innerWidth, sy: scrollY, sx: scrollX, scale: visualViewport ? visualViewport.scale : 1 })); ok(r.sh <= r.ih + 1 && r.sw <= r.iw + 1 && r.sy === 0 && r.sx === 0 && Math.abs(r.scale - 1) < 0.01, `${tag}: no scroll/zoom ${J(r)}`); };
  const layout = async (tag, expectMode) => {
    const r = await ev(() => {
      const L = __PK.L, vw = innerWidth, vh = innerHeight;
      const btns = [...document.querySelectorAll('#tc .tb')].map(e => { const q = e.getBoundingClientRect(); return { a: e.dataset.a, x: q.left, y: q.top, w: q.width, h: q.height, vis: getComputedStyle(e).display !== 'none' && getComputedStyle(document.getElementById('tc')).display !== 'none' && q.width > 0 }; });
      const top = ['#bPause', '#bMute'].map(s => { const q = document.querySelector(s).getBoundingClientRect(); return { a: s, x: q.left, y: q.top, w: q.width, h: q.height }; });
      const c = document.getElementById('cv').getBoundingClientRect();
      return { vw, vh, mode: L.mode, g: { x: L.ox, y: L.oy, w: L.lay.LW * L.k, h: L.lay.LH * L.k }, c: { x: c.left, y: c.top, w: c.width, h: c.height }, k: L.k, btns, top };
    });
    ok(r.mode === expectMode, `${tag}: fit mode ${r.mode} (vp ${r.vw}x${r.vh}, scale ${r.k.toFixed(2)})`);
    const inVp = q => q.x >= -0.5 && q.y >= -0.5 && q.x + q.w <= r.vw + 0.5 && q.y + q.h <= r.vh + 0.5;
    ok(inVp(r.g) && inVp(r.c), `${tag}: game area fully inside viewport (no cropping) ${J(r.g)}`);
    const all = r.btns.concat(r.top);
    ok(r.btns.length === 7 && r.btns.every(q => q.vis), `${tag}: all ${r.btns.length} touch buttons visible`);
    ok(all.every(inVp), `${tag}: all buttons inside viewport`);
    const minB = Math.min(...r.btns.map(q => Math.min(q.w, q.h))); ok(minB >= 48, `${tag}: touch buttons >= 48px (min ${minB.toFixed(1)})`);
    let ov = []; for (let i = 0; i < all.length; i++) for (let j = i + 1; j < all.length; j++) { const A = all[i], B = all[j]; if (A.x < B.x + B.w - 1 && B.x < A.x + A.w - 1 && A.y < B.y + B.h - 1 && B.y < A.y + A.h - 1) ov.push(A.a + '/' + B.a); }
    ok(ov.length === 0, `${tag}: no overlapping buttons ${ov.join(',')}`);
    const hitsGame = q => q.x < r.g.x + r.g.w - 1 && r.g.x < q.x + q.w - 1 && q.y < r.g.y + r.g.h - 1 && r.g.y < q.y + q.h - 1;
    ok(!all.some(hitsGame), `${tag}: no button covers the game area`);
    if (expectMode === 'portrait') ok(r.btns.every(q => q.y >= r.g.y + r.g.h - 0.5), `${tag}: controls below the playfield`);
    else ok(r.btns.every(q => q.x + q.w <= r.g.x + 1 || q.x >= r.g.x + r.g.w - 1) && r.btns.some(q => q.x < r.g.x) && r.btns.some(q => q.x > r.g.x + r.g.w - 1), `${tag}: controls on both sides of the playfield`);
    return r;
  };
  // ---- title via touch
  ok(await ev(() => __PK.touch), 'touch mode detected');
  ok(await ev(() => { const m = document.querySelector('meta[name=viewport]').content; return /user-scalable=no/.test(m) && /maximum-scale=1/.test(m); }), 'viewport meta disables zoom');
  await noScroll('title'); await p.waitForTimeout(600);
  await p.screenshot({ path: `${SHOTS}/${which}_portrait_title.png` });
  await tap('button[data-k=new]'); ok(await sc() === 'play', 'tap PLAY -> game');
  let s = await G(); ok(s.phase === 'intro' && s.level === 1, 'level 1 intro card');
  await p.waitForTimeout(500); await p.screenshot({ path: `${SHOTS}/${which}_portrait_intro.png` });
  await p.touchscreen.tap(200, 200); await p.waitForTimeout(150); s = await G(); ok(s.phase === 'play' && s.cur, 'tap on intro starts play');
  await p.waitForTimeout(300);
  await layout('portrait play', 'portrait'); await noScroll('portrait play');
  // ---- every button by real touch
  const res = [];
  const tests = {
    left: (a, b) => b.cur.x === a.cur.x - 1, right: (a, b) => b.cur.x === a.cur.x + 1,
    cw: (a, b) => b.cur.r === (a.cur.r + 1) % 4, ccw: (a, b) => b.cur.r === (a.cur.r + 3) % 4,
    soft: (a, b) => b.score > a.score || (b.cur && b.cur.y > a.cur.y), hard: (a, b) => b.score >= a.score + 10 && b.canHold, hold: (a, b) => b.hold === 'T' && !b.canHold,
  };
  for (const a of ['left', 'right', 'cw', 'ccw', 'soft', 'hard', 'hold']) {
    await freeze(); if (a === 'soft') await ev(() => { __PK.G.fallT = 0; });
    const n0 = await ev(a => __PK.audio.counts['tc_' + a] || 0, a); const before = await G();
    if (a === 'soft') { const bb = await p.locator('#tc .tb[data-a=soft]').boundingBox(); await p.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.waitForTimeout(40); } else await tap(`#tc .tb[data-a="${a}"]`);
    const after = await G(); const n1 = await ev(a => __PK.audio.counts['tc_' + a] || 0, a);
    const good = n1 === n0 + 1 && after.cur !== undefined && tests[a](before, after);
    res.push(a + (good ? '✓' : '✗' + J({ n0, n1, b: before.cur, a: after.cur, s0: before.score, s1: after.score })));
  }
  ok(res.every(x => x.endsWith('✓')), 'each touch button works by real tap: ' + res.join(' '));
  // double tap must not zoom
  const rb = await p.locator('#tc .tb[data-a=cw]').boundingBox(); await p.touchscreen.tap(rb.x + 20, rb.y + 20); await p.waitForTimeout(60); await p.touchscreen.tap(rb.x + 20, rb.y + 20); await p.waitForTimeout(300);
  await noScroll('after double-tap');
  // ---- gestures: tap on playfield rotates
  await freeze(); const g0 = await G(); const B = await ev(() => { const L = __PK.L, bd = L.lay.board; return { x: L.ox + (bd.x + bd.c * 5) * L.k, y: L.oy + (bd.y + bd.c * 14) * L.k }; });
  await p.touchscreen.tap(B.x, B.y); await p.waitForTimeout(100); const g1 = await G();
  ok(g1.cur.r === (g0.cur.r + 1) % 4, 'gesture: tap on playfield rotates');
  // ---- row clear via DROP tap updates the meter
  await ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); G.lines = 0; G.meter = 0; __PK.setupClear(1); G.fallT = -99; });
  const m0 = (await G()).meter; await tap('#tc .tb[data-a=hard]'); await p.waitForTimeout(900);
  s = await G(); ok(s.lines === 1 && s.meter > m0 + 0.08, `row clear (DROP tap) updates the wiring meter (lines ${s.lines}/${s.target}, meter ${m0.toFixed(2)} -> ${s.meter.toFixed(3)})`);
  // play a few seconds normally, gameplay screenshot with a stack
  await ev(() => { __PK.setBoardRows(['..........', '.....O....', 'T..IIIIZZ.', 'TT.SS.LZZ.', 'TJSSOOL.IJ', 'JJJ.OOLLIJ']); const G = __PK.G; G.cur = { t: 'S', r: 0, x: 3, y: 8 }; G.fallT = 0; });
  await p.waitForTimeout(1200); await p.screenshot({ path: `${SHOTS}/${which}_portrait_gameplay.png` });
  // ---- rotate to landscape mid-game
  const t0 = await ev(() => ({ lt: __PK.G.levelTime, sc: __PK.G.score, lines: __PK.G.lines }));
  await p.setViewportSize(P.land.viewport); await p.waitForTimeout(900);
  await layout('rotated to landscape mid-game', 'landscape'); await noScroll('landscape play');
  const t1 = await ev(() => ({ lt: __PK.G.levelTime, scene: __PK.scene, phase: __PK.G.phase, lines: __PK.G.lines }));
  ok(t1.scene === 'play' && t1.phase === 'play' && t1.lt > t0.lt && t1.lines === t0.lines, `game continues after rotation to landscape (time ${t0.lt.toFixed(1)} -> ${t1.lt.toFixed(1)}, lines kept ${t1.lines})`);
  await p.waitForTimeout(600); await p.screenshot({ path: `${SHOTS}/${which}_landscape_gameplay.png` });
  const lres = [];
  for (const a of ['left', 'right', 'cw', 'ccw', 'hold', 'hard']) { await freeze(); const before = await G(); await tap(`#tc .tb[data-a="${a}"]`); const after = await G(); lres.push(a + (tests[a](before, after) ? '✓' : '✗')); }
  ok(lres.every(x => x.endsWith('✓')), 'landscape taps work: ' + lres.join(' '));
  // ---- rotate back to portrait
  await p.setViewportSize(P.port.viewport); await p.waitForTimeout(900);
  await layout('rotated back to portrait', 'portrait'); await noScroll('portrait again');
  const t2 = await ev(() => ({ scene: __PK.scene, phase: __PK.G.phase, level: __PK.G.level }));
  ok(t2.scene === 'play' && t2.phase === 'play' && t2.level === 1, 'game continues after rotating back to portrait');
  const au = await ev(() => __PK.audio.state()); ok(au.ctx === 'running' && !!au.music, 'WebAudio unlocked by touch + music playing ' + J(au));
  // ---- reaching the target lights the object and advances (by DROP tap)
  await ev(() => { const G = __PK.G; G.lines = G.target - 1; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(1); G.fallT = -99; });
  await tap('#tc .tb[data-a=hard]'); await p.waitForTimeout(1600);
  s = await G(); ok(s.phase === 'connect' && s.lines >= s.target, 'target reached -> connection made, object lights (' + s.phase + ')');
  await p.waitForTimeout(1400); await p.screenshot({ path: `${SHOTS}/${which}_portrait_lit_open_sign.png` });
  await p.touchscreen.tap(200, 200); await p.waitForTimeout(300); s = await G();
  ok(s.level === 2 && s.phase === 'intro', 'tap after celebration -> level 2 intro');
  // ---- disco ball lit (level 3) and Christmas tree (level 10), portrait + landscape
  // (muted for the fast-forwards: Playwright's Linux WebKit can crash under sustained audio load)
  await ev(() => { __PK.S.mute = true; });
  const lightUp = async lv => { await ev(lv => { __PK.start(lv); __PK.beginPlay(); const G = __PK.G; G.lines = G.target - 1; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(1); G.fallT = -99; }, lv); await tap('#tc .tb[data-a=hard]'); await p.waitForTimeout(2800); return G(); };
  s = await lightUp(3); ok(s.level === 3 && s.phase === 'connect', 'level 3 disco ball lights');
  await p.screenshot({ path: `${SHOTS}/${which}_portrait_lit_disco_ball.png` });
  s = await lightUp(10); ok(s.level === 10 && s.phase === 'connect', 'level 10 Christmas tree lights');
  await p.screenshot({ path: `${SHOTS}/${which}_portrait_lit_xmas_tree.png` });
  await p.setViewportSize(P.land.viewport); await p.waitForTimeout(800); await noScroll('landscape celebration');
  await p.screenshot({ path: `${SHOTS}/${which}_landscape_lit_xmas_tree.png` });
  await p.touchscreen.tap(300, 200); await p.waitForTimeout(800); ok(await sc() === 'victory', 'tap after tree -> victory screen');
  ok(await ev(() => { const s = document.querySelector('.sheet'); if (!s) return false; const q = s.getBoundingClientRect(); return q.top >= 0 && q.bottom <= innerHeight + 1 && q.left >= 0 && q.right <= innerWidth + 1; }), 'landscape: victory sheet fits the screen');
  await p.waitForTimeout(800); await p.screenshot({ path: `${SHOTS}/${which}_landscape_victory.png` });
  await p.setViewportSize(P.port.viewport); await p.waitForTimeout(800); await p.screenshot({ path: `${SHOTS}/${which}_portrait_victory.png` });
  // ---- level select by touch
  await tap('button[data-k=levels]'); ok(await sc() === 'levels', 'victory -> level select by tap'); await p.waitForTimeout(400);
  ok(await p.locator('.lv:not(.locked)').count() >= 4, 'unlocked levels shown');
  await p.screenshot({ path: `${SHOTS}/${which}_portrait_levels.png` });
  await tap('.lv[data-l="3"]'); s = await G(); ok(await sc() === 'play' && s.level === 3, 'tap level card 3 -> plays level 3');
  await ev(() => { __PK.S.mute = false; });
  // ---- pause by touch
  await p.touchscreen.tap(200, 200); await p.waitForTimeout(300);
  await tap('#bPause'); ok((await G()).paused === true, 'pause button works by touch');
  await p.screenshot({ path: `${SHOTS}/${which}_portrait_pause.png` });
  await tap('button[data-k=resume]'); ok((await G()).paused === false, 'resume works by touch');
  const m1 = await ev(() => __PK.S.mute); await tap('#bMute'); ok(await ev(() => __PK.S.mute) === !m1, 'mute button works by touch');
  await tap('#bMute');
  // ---- Pappa reacting (danger stack) screenshot
  await ev(() => { if (__PK.G.phase === 'intro') __PK.beginPlay(); }); await p.waitForTimeout(100);
  await ev(() => { __PK.setBoardRows(['....O.....', '...OO.....', '..TTT.....', '...OOO....', '.T.IIIIZ..', 'TTTSS.LZZ.', 'TJSSOOL.IJ', 'JJJ.OOLLIJ', 'J.ZZ.LLLIJ', 'LZZ.SSTTTO', 'LL.SSZZT.O', 'L.IIIIZZOO', 'OOSS.TTTJJ', 'OSS.ZZT.JL', 'IIII.ZZLLL', 'TTT.SS.OOJ']); const G = __PK.G; G.cur = { t: 'L', r: 0, x: 3, y: 2 }; G.fallT = -99; G.dangerSaid = -99; G.danger = false; });
  await p.waitForTimeout(1500); await p.screenshot({ path: `${SHOTS}/${which}_portrait_pappa_danger.png` }); ok(await ev(() => __PK.G.danger && (__PK.audio.counts.say_danger || 0) > 0), 'near-death stack -> Pappa danger reaction');
  ok(errs.length === 0, 'no console errors ' + J(errs.slice(0, 5)));
  console.log(`${which}: ${fails ? fails + ' FAILURES' : 'ALL PASS'}`);
  await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
