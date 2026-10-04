/* ===================== MAIN LOOP, ICONS, TEST HOOKS ===================== */
function drawAppIcon(c, n) {
  const og = g; g = c;
  try {
    c.setTransform(n / 64, 0, 0, n / 64, 0, 0); c.fillStyle = '#0a0410'; c.fillRect(0, 0, 64, 64);
    sunburst(32, 30, 60, 14, 0.1, 0.18); tube(rrPath(3, 3, 58, 58, 12), '#ff2bd6', 1.6, 1);
    drawPappa(31, 132, 118, { pose: 'idle', t: 0, glow: '#b44bff' });
    c.setTransform(n / 64, 0, 0, n / 64, 0, 0); tube(boltPath(53, 50, 8), '#ffe23a', 1.2, 1);
  } finally { g = og; }
}
function iconURL(n) { const c = document.createElement('canvas'); c.width = c.height = n; drawAppIcon(c.getContext('2d'), n); return c.toDataURL('image/png'); }
(function headIcons() {
  try {
    const add = (rel, href, sizes) => { const l = document.createElement('link'); l.rel = rel; l.href = href; if (sizes) l.sizes = sizes; document.head.appendChild(l); };
    if (!document.querySelector('link[rel=icon]')) add('icon', iconURL(64));
    if (!document.querySelector('link[rel=apple-touch-icon]')) add('apple-touch-icon', iconURL(180), '180x180');
    if (!document.querySelector('link[rel=manifest]') && /^https?:$/.test(location.protocol)) {
      const man = { name: "Pappa Kennedy's Electric Works", short_name: 'Pappa Kennedy', start_url: location.href.split('#')[0], scope: location.href.replace(/[^/]*$/, ''), display: 'fullscreen', orientation: 'any', background_color: '#07040a', theme_color: '#07040a', icons: [{ src: iconURL(192), sizes: '192x192', type: 'image/png' }, { src: iconURL(512), sizes: '512x512', type: 'image/png' }] };
      add('manifest', URL.createObjectURL(new Blob([JSON.stringify(man)], { type: 'application/manifest+json' })));
    }
  } catch (e) { }
})();
let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, Math.max(0, (now - last) / 1000)); last = now; T += dt; DT = dt;
  try {
    if (scene && scene.update) scene.update(dt);
    Music.update(); Hum.update(dt);
    g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.shadowBlur = 0;
    if (scene && scene.draw) scene.draw();
  } catch (e) { console.error(e); }
  requestAnimationFrame(frame);
}
window.__PK = {
  get S() { return S; }, get G() { return G; }, get L() { return L; }, get scene() { return scene ? scene.name : null; }, get touch() { return IS_TOUCH; }, get T() { return T; },
  go, Title, Levels, Help, Options, Play, Victory, Pause, OBJECTS, LEVELS, TRACKS, Pappa, Music, FX, newGame, startLevel, beginPlay, press, release, setTouchMode, iconURL, fits, rotate, move, hardDrop, holdPiece, gameUpdate, connectDone, drawObject, fit,
  start(level) { newGame(level || 1); go(Play); return G; },
  // put an I piece over a 1-wide hole with n full-minus-one rows at the bottom (for tests)
  setupClear(n = 1, col = 0) { const b = G.board; for (let y = NR - n; y < NR; y++) for (let x = 0; x < COLS; x++) b[y][x] = x === col ? 0 : ((x % 7) + 1) | ((x > 0 && x - 1 !== col ? 8 : 0) << 4) | ((x < COLS - 1 && x + 1 !== col ? 2 : 0) << 4); G.cur = { t: 'I', r: 1, x: col - 2, y: 2 }; G.lockT = 0; G.lowest = 2; return true; },
  setBoardRows(rows) { G.board = emptyBoard(); rows.forEach((r, i) => { const y = NR - rows.length + i; for (let x = 0; x < COLS; x++) if (r[x] !== '.') G.board[y][x] = (PIECES.indexOf(r[x]) + 1) || 1; }); },
  audio: { get counts() { return AUD.counts; }, get log() { return AUD.log; }, state() { return { ctx: AC ? AC.state : 'none', music: Music.name, track: Music.cur ? Music.cur.name : '', mute: S.mute, musicVol: S.musicVol, sfxVol: S.sfxVol, voices: AUD.voices }; }, reset() { AUD.counts = {}; AUD.log = []; } },
};
loadSave(); TC.build(); if (COARSE || FORCE_TOUCH) setTouchMode(true); fit(); go(Title); requestAnimationFrame(frame);
