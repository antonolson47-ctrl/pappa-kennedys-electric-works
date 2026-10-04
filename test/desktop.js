// Desktop Chromium: keyboard play, rotation/kicks/hold/drops, row clear -> meter, target -> object lights -> next level,
// all 10 objects lit, level 10 tree -> victory, game over, pause/mute, saves, music rotation. Saves screenshots.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const URL = process.env.URL || 'file://' + path.resolve(__dirname, '../PappaKennedy.html');
const SHOTS = path.resolve(__dirname, '../screenshots'); fs.mkdirSync(SHOTS, { recursive: true });
let fails = 0; const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] }); const ctx = await b.newContext({ viewport: { width: 1280, height: 720 } }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('pageerror: ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.addInitScript(() => localStorage.clear());
  await p.goto(URL); await p.waitForTimeout(1200);
  const ev = (f, a) => p.evaluate(f, a); const G = () => p.evaluate(() => { const G = __PK.G; return G && { phase: G.phase, level: G.level, lines: G.lines, target: G.target, meter: G.meter, score: G.score, cur: G.cur && { ...G.cur }, hold: G.hold, canHold: G.canHold, paused: G.paused }; });
  ok(await ev(() => __PK.scene) === 'title', 'title scene on load');
  ok(await p.title() === "Pappa Kennedy's Electric Works", 'page title');
  await p.screenshot({ path: `${SHOTS}/desktop_title.png` });
  // ---- keyboard into the game
  await p.keyboard.press('Enter'); await p.waitForTimeout(300);
  ok(await ev(() => __PK.scene) === 'play', 'Enter on title -> play');
  let s = await G(); ok(s.phase === 'intro' && s.level === 1, 'level 1 intro card');
  await p.waitForTimeout(500); await p.keyboard.press('KeyK'); await p.waitForTimeout(100); s = await G(); ok(s.phase === 'play' && s.cur, 'any key starts play, piece spawned (' + (s.cur && s.cur.t) + ')');
  const au = await ev(() => __PK.audio.state()); ok(au.ctx === 'running' && au.music, 'WebAudio running + music ' + JSON.stringify(au));
  // ---- moves / rotation / kicks
  await ev(() => { __PK.G.cur = { t: 'T', r: 0, x: 3, y: 5 }; __PK.G.fallT = -99; });
  await p.keyboard.press('ArrowLeft'); s = await G(); ok(s.cur.x === 2, 'ArrowLeft moves left');
  await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowRight'); s = await G(); ok(s.cur.x === 4, 'ArrowRight moves right');
  await p.keyboard.press('ArrowUp'); s = await G(); ok(s.cur.r === 1, 'ArrowUp rotates clockwise');
  await p.keyboard.press('KeyX'); s = await G(); ok(s.cur.r === 2, 'X rotates clockwise');
  await p.keyboard.press('KeyZ'); s = await G(); ok(s.cur.r === 1, 'Z rotates counter-clockwise');
  await p.keyboard.down('ArrowLeft'); await p.waitForTimeout(600); await p.keyboard.up('ArrowLeft'); s = await G(); ok(s.cur.x === -1 || s.cur.x === 0, 'holding Left auto-repeats to the wall (x=' + s.cur.x + ')');
  const kick = await ev(() => { const G = __PK.G; G.cur = { t: 'I', r: 1, x: -2, y: 6 }; const ok1 = __PK.rotate(1); const a = { ...G.cur }; G.cur = { t: 'T', r: 1, x: -1, y: 6 }; const ok2 = __PK.rotate(-1); return { ok1, a, ok2, b: { ...G.cur } }; });
  ok(kick.ok1 && kick.a.r === 2 && kick.a.x >= 0 && kick.ok2 && kick.b.x >= 0, 'wall kicks: I and T rotate off the left wall ' + JSON.stringify(kick));
  await ev(() => { __PK.G.cur = { t: 'T', r: 0, x: 3, y: 2 }; __PK.G.fallT = 0; __PK.G.lockT = 0; }); const sp0 = await G(); await p.keyboard.down('ArrowDown'); await p.waitForTimeout(250); await p.keyboard.up('ArrowDown'); const sp1 = await G(); ok(sp1.cur && sp1.cur.y > sp0.cur.y + 2 && sp1.score > sp0.score, `soft drop speeds fall (${sp0.cur.y} -> ${sp1.cur && sp1.cur.y}) and scores`);
  await ev(() => { __PK.G.fallT = 0; });
  const t0 = (await G()).cur.t; await p.keyboard.press('KeyC'); s = await G(); ok(s.hold === t0 && !s.canHold, 'C holds the piece (' + t0 + ')');
  await p.keyboard.press('ShiftLeft'); s = await G(); ok(s.hold === t0, 'second hold blocked until lock');
  const sc0 = (await G()).score; await p.keyboard.press('Space'); await p.waitForTimeout(80); s = await G(); ok(s.score >= sc0 + 2 && s.canHold, 'Space hard-drops + locks (score ' + sc0 + ' -> ' + s.score + ')');
  // ghost + lock delay sanity
  const ld = await ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); G.cur = { t: 'O', r: 0, x: 3, y: 20 }; G.lockT = 0; G.fallT = 0; return { y: G.cur.y }; }); await p.waitForTimeout(250); const ld1 = await G(); ok(ld1.cur && ld1.cur.t === 'O' && ld1.cur.y === 20, 'lock delay: piece on the floor not locked instantly'); await p.waitForTimeout(500); const ld2 = await G(); ok(!ld2.cur || ld2.cur.t !== 'O' || ld2.cur.y !== 20, 'lock delay expires -> locks');
  // ---- row clear updates the meter
  await ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); G.lines = 0; G.meter = 0; __PK.setupClear(1); }); const m0 = (await G()).meter;
  await p.keyboard.press('Space'); await p.waitForTimeout(150); s = await G(); ok(s.phase === 'clear', 'completed row -> clear animation');
  await p.waitForTimeout(700); s = await G(); ok(s.lines === 1 && s.meter > m0 + 0.08, `row clear updates wiring meter (lines ${s.lines}/${s.target}, meter ${m0.toFixed(2)} -> ${s.meter.toFixed(3)})`);
  const said = await ev(() => Object.keys(__PK.audio.counts).filter(k => k.startsWith('say_') || k.startsWith('voice_'))); console.log('INFO Pappa reactions so far (single-line reactions are random by design): ' + said.join(','));
  // a 4-row FULL CIRCUIT for a Pappa reaction screenshot
  await ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(4, 9); G.lines = 1; }); await p.keyboard.press('Space'); await p.waitForTimeout(500);
  s = await G(); ok(s.lines === 5, 'four rows cleared at once (lines=' + s.lines + ')'); ok(await ev(() => __PK.audio.counts.say_quad === 1), 'Pappa FULL CIRCUIT reaction');
  await ev(() => { __PK.setBoardRows(['..........', 'IIOO..SSZZ', 'JJ.LLTTOOI', 'ZZSS.JJLLI', 'OOTTIIZZ.J', 'LLJJ.OOSSZ']); }); await p.waitForTimeout(500);
  await p.screenshot({ path: `${SHOTS}/desktop_gameplay_pappa_reacts.png` });
  // ---- reach the target: object lights, next level
  await ev(() => { const G = __PK.G; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(1); }); await p.keyboard.press('Space'); await p.waitForTimeout(700);
  s = await G(); ok(s.phase === 'connect' && s.lines >= s.target, 'target reached -> CONNECTED celebration');
  await p.waitForTimeout(2300); await p.screenshot({ path: `${SHOTS}/desktop_lit_01_open_sign.png` });
  ok(await ev(() => (__PK.audio.counts.breaker || 0) >= 1 && (__PK.audio.counts.lightsOn || 0) >= 1), 'breaker clunk + lights-on SFX fired');
  await p.keyboard.press('Enter'); await p.waitForTimeout(300); s = await G(); ok(s.level === 2 && s.phase === 'intro' && s.lines === 0, 'advanced to level 2 (fresh panel)');
  const sv = await ev(() => JSON.parse(localStorage.getItem('pappa_kennedy_v1'))); ok(sv.unlocked === 2 && sv.lit[0] === true && sv.hi > 0, 'progress + high score saved to localStorage ' + JSON.stringify({ u: sv.unlocked, hi: sv.hi }));
  // ---- every object renders and lights (brightness check) + screenshots
  const names = ['open_sign', 'lava_lamp', 'disco_ball', 'funk_sign', 'jukebox', 'roller_skate', 'afro_pick', 'groove_van', 'funk_express', 'xmas_tree'];
  const lum = () => p.evaluate(() => { const c = document.getElementById('cv'), x = c.getContext('2d'), L = __PK.L, lay = L.lay, O = lay.obj, d = devicePixelRatio > 2 ? 2 : devicePixelRatio || 1; const px = (L.ox + O.cx * L.k) * d, py = (L.oy + O.cy * L.k) * d, r = O.s * L.k * d * 0.5; const im = x.getImageData(px - r, py - r, r * 2, r * 2).data; let s = 0; for (let i = 0; i < im.length; i += 4) s += im[i] + im[i + 1] + im[i + 2]; return s / (im.length / 4) / 3; });
  const lumC = () => p.evaluate(() => { const c = document.getElementById('cv'), x = c.getContext('2d'), w = c.width, h = c.height; const im = x.getImageData(w * 0.3, h * 0.2, w * 0.4, h * 0.55).data; let s = 0; for (let i = 0; i < im.length; i += 4) s += im[i] + im[i + 1] + im[i + 2]; return s / (im.length / 4) / 3; });
  const lit = [];
  for (let lv = 1; lv <= 10; lv++) {
    await ev(lv => { __PK.start(lv); __PK.beginPlay(); }, lv); await p.waitForTimeout(250);
    const before = await lum();
    await ev(() => { const G = __PK.G; G.lines = G.target - 1; G.board = G.board.map(r => r.fill(0)); __PK.setupClear(1); __PK.hardDrop(); }); await p.waitForTimeout(3000);
    const st = await G(), after = await lumC(); lit.push(`${lv}:${before.toFixed(1)}->${after.toFixed(1)}`);
    ok(st.phase === 'connect' && after > before * 1.3 + 3, `level ${lv} (${names[lv - 1]}) lights up (unlit panel lum ${before.toFixed(1)} -> lit ${after.toFixed(1)})`);
    if (lv !== 1) await p.screenshot({ path: `${SHOTS}/desktop_lit_${String(lv).padStart(2, '0')}_${names[lv - 1]}.png` });
    if (lv === 10) { ok(await ev(() => __PK.G.level === 10 && __PK.OBJECTS[9].id === 'tree'), 'level 10 is the Christmas tree'); await p.keyboard.press('Enter'); await p.waitForTimeout(800); ok(await ev(() => __PK.scene) === 'victory', 'after the tree lights -> victory screen'); await p.waitForTimeout(1200); await p.screenshot({ path: `${SHOTS}/desktop_victory.png` }); }
  }
  ok(await ev(() => JSON.parse(localStorage.getItem('pappa_kennedy_v1')).lit.filter(Boolean).length) === 10, 'all 10 objects marked lit in save');
  // ---- level select
  await ev(() => __PK.go(__PK.Levels)); await p.waitForTimeout(400); ok(await p.locator('.lv:not(.locked)').count() === 10, 'level select shows 10 unlocked levels'); await p.screenshot({ path: `${SHOTS}/desktop_level_select.png` });
  await p.locator('.lv[data-l="3"]').click(); await p.waitForTimeout(300); s = await G(); ok(s.level === 3 && await ev(() => __PK.scene) === 'play', 'level select -> level 3');
  // ---- pause / mute
  await p.keyboard.press('Enter'); await p.waitForTimeout(100); await p.keyboard.press('KeyP'); await p.waitForTimeout(200); ok((await G()).paused, 'P pauses'); await p.screenshot({ path: `${SHOTS}/desktop_pause.png` });
  await p.keyboard.press('Escape'); await p.waitForTimeout(200); ok(!(await G()).paused, 'Esc resumes');
  await p.keyboard.press('KeyM'); ok(await ev(() => __PK.S.mute) === true, 'M mutes'); await p.keyboard.press('KeyM'); ok(await ev(() => __PK.S.mute) === false, 'M unmutes');
  // ---- game over (stack to the top)
  await ev(() => { const G = __PK.G; for (let y = 2; y < 22; y++) for (let x = 0; x < 10; x++) G.board[y][x] = (x === (y % 10)) ? 0 : ((x + y) % 7) + 1; G.cur = { t: 'O', r: 0, x: 3, y: 0 }; }); await p.keyboard.press('Space'); await p.waitForTimeout(700);
  s = await G(); ok(s.phase === 'over', 'stack overflow -> game over (breaker tripped)'); await p.screenshot({ path: `${SHOTS}/desktop_gameover_pappa_shocked.png` });
  await p.waitForTimeout(1800); ok(await p.locator('.sheet button[data-k=retry]').count() === 1, 'game over sheet with retry'); await p.screenshot({ path: `${SHOTS}/desktop_gameover_sheet.png` });
  await p.locator('.sheet button[data-k=retry]').click(); await p.waitForTimeout(200); s = await G(); ok(s.level === 3 && s.phase === 'intro', 'retry restarts the level');
  // ---- music: >= 6 game tracks, rotation timer + level-change switch
  const tr = await ev(() => Object.keys(__PK.TRACKS)); ok(tr.length >= 8, 'tracks: ' + tr.join(', '));
  await ev(() => { __PK.beginPlay(); __PK.Music.rotateAt = 0; }); await p.waitForTimeout(3500); const m1 = await ev(() => __PK.audio.counts); const rot = Object.keys(m1).filter(k => k.startsWith('musicQueue_')); ok(rot.length >= 1, 'music rotates on timer/level change: ' + rot.join(','));
  for (const id of tr) { await ev(id => __PK.Music.play(id), id); await p.waitForTimeout(700); }
  ok(await ev(() => __PK.audio.state().ctx) === 'running', 'all tracks scheduled without errors');
  // ---- help & options screens
  await ev(() => __PK.go(__PK.Help)); await p.waitForTimeout(200); await p.screenshot({ path: `${SHOTS}/desktop_how_to_play.png` });
  await ev(() => __PK.go(__PK.Options)); await p.waitForTimeout(200); await p.locator('input[data-o=musicVol]').fill('30'); ok(Math.abs(await ev(() => __PK.S.musicVol) - 0.3) < 0.01, 'music volume slider works');
  await p.locator('input[data-o=sfxVol]').fill('70'); ok(Math.abs(await ev(() => __PK.S.sfxVol) - 0.7) < 0.01, 'sfx volume slider works');
  ok(errs.length === 0, 'no console errors ' + JSON.stringify(errs.slice(0, 5)));
  console.log(`desktop: ${fails ? fails + ' FAILURES' : 'ALL PASS'}`); await b.close(); process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
