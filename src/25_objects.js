/* ===================== THE 10 FUNKY OBJECTS (neon line art drawn in code) ===================== */
// Each draws in a local -50..50 box. st = { p: wiring progress 0..1, on: lit amount 0..1, t: time, seed }
function segI(st, i, n) {
  const thr = (i + 1) / (n + 1); let v = 0;
  if (st.p >= thr) v = 0.5; else if (st.p > 0.001 && st.p > thr - Math.min(0.1, 0.8 / (n + 1))) v = 0.14 * flick(i * 3.1 + st.seed, 0.5);
  v = Math.max(v, st.on); return v * flick(i + st.seed * 7, st.on > 0.9 ? 0.01 : 0.03);
}
const RAINBOW = ['#ff3b5c', '#ff8a1f', '#ffe23a', '#46ff74', '#29f3ff', '#3f7dff', '#b44bff', '#ff2bd6'];
const OBJ_PATHS = {};
function OP(key, fn) { return OBJ_PATHS[key] || (OBJ_PATHS[key] = P2(fn)); }
const OBJECTS = [
  { id: 'sign', name: "PAPPA'S OPEN SIGN", short: 'OPEN SIGN', color: '#ff2bd6', color2: '#29f3ff',
    intro: "First job, baby! Wire up my shop sign so the people know Pappa's OPEN for business!",
    draw(st) {
      const n = 7; tube(OP('sign_b', p => { const r = rrPath(-48, -34, 96, 68, 10); p.addPath(r); }), '#29f3ff', 2.2, segI(st, 0, n));
      neonText("PAPPA'S", 0, -11, 15, '#ff2bd6', segI(st, 1, n), { w: 2.3 });
      const ow = textW('OPEN', 16); let x = -ow / 2; const s = 16 / 6;
      'OPEN'.split('').forEach((ch, i) => { let I = segI(st, 2 + i, n); if (i === 0 && st.on > 0.5) I *= (Math.sin(st.t * 1.7) > 0.93 ? 0.15 : 1); neonText(ch, x, 14, 16, '#ff5a2a', I, { align: 'left', w: 2.4 }); x += (GLYPHS[ch][0] + TRACK) * s; });
      const bI = segI(st, 6, n); tube(OP('sign_l', p => p.addPath(boltPath(-39, 14, 9))), '#ffe23a', 1.6, bI); tube(OP('sign_r', p => p.addPath(boltPath(39, 14, 9))), '#ffe23a', 1.6, bI);
      if (st.on > 0.5) for (let i = 0; i < 3; i++) dot(rand(-46, 46), rand(-32, 32), 3, '#ffffff', 0.3 * Math.random());
    } },
  { id: 'lava', name: 'GROOVY LAVA LAMP', short: 'LAVA LAMP', color: '#ff8a1f', color2: '#ff2bd6',
    intro: "This lava lamp been cold since 1974. Bring it back to life, Sparky!",
    draw(st) {
      const n = 4, glass = OP('lava_g', p => { p.moveTo(-13, -34); p.quadraticCurveTo(-27, 0, -21, 22); p.lineTo(21, 22); p.quadraticCurveTo(27, 0, 13, -34); p.closePath(); });
      const on = st.on, bl = Math.max(segI(st, 3, n) * 0.8, on);
      // glowing wax inside the glass
      g.save(); g.clip(glass);
      if (bl > 0.05) { glowFill(glass, '#ff2bd6', bl, 0.18); dot(0, 10, 40, '#ff2bd6', 0.5 * bl, true); }
      const sp = on > 0 ? 1 : 0.08;
      for (let i = 0; i < 5; i++) {
        const ph = i * 1.7, k = 0.5 + 0.5 * Math.sin(st.t * 0.55 * sp + ph), y = lerp(18, -26, on > 0 ? k : (i === 4 ? 0.1 : 0)), x = Math.sin(st.t * 0.4 * sp + ph * 2) * (on > 0 ? 7 : 2) + (i - 2) * 3;
        const r = 5 + (i % 3) * 2 + Math.sin(st.t + i) * 1;
        g.fillStyle = bl > 0.05 ? '#ffb02a' : '#3a1606'; g.globalAlpha = bl > 0.05 ? 0.9 : 1; g.beginPath(); g.ellipse(x, y, r, r * (1.1 + 0.2 * Math.sin(st.t * 1.3 + i)), 0, 0, TAU); g.fill(); g.globalAlpha = 1;
        if (bl > 0.05) dot(x, y, r * 2.6, '#ffc23a', 0.55 * bl);
      }
      g.fillStyle = bl > 0.05 ? '#ff9a2a' : '#3a1606'; g.beginPath(); g.ellipse(0, 22, 22, 6, 0, 0, TAU); g.fill();
      g.restore();
      tube(glass, '#ff2bd6', 2.2, segI(st, 2, n));
      tube(OP('lava_c', p => { p.moveTo(-9, -48); p.lineTo(9, -48); p.lineTo(13, -34); p.lineTo(-13, -34); p.closePath(); }), '#ffc23a', 2, segI(st, 1, n));
      tube(OP('lava_b', p => { p.moveTo(-21, 22); p.lineTo(-13, 34); p.lineTo(-26, 48); p.lineTo(26, 48); p.lineTo(13, 34); p.lineTo(21, 22); p.closePath(); p.moveTo(-13, 34); p.lineTo(13, 34); }), '#ffc23a', 2, segI(st, 0, n));
    } },
  { id: 'disco', name: 'DISCO BALL', short: 'DISCO BALL', color: '#dff6ff', color2: '#b44bff',
    intro: "Ain't no party without a disco ball. Hang it, wire it, and let it SPIN!",
    draw(st) {
      const n = 4, on = st.on, R = 30, rot = st.t * (on > 0 ? 0.9 : 0.05);
      if (on > 0.05) { // beams + spots
        g.save(); g.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 10; i++) { const a = rot * 0.6 + i * TAU / 10; g.strokeStyle = RAINBOW[i % 8]; g.globalAlpha = 0.16 * on; g.lineWidth = 5; g.beginPath(); g.moveTo(Math.cos(a) * R, Math.sin(a) * R); g.lineTo(Math.cos(a) * 160, Math.sin(a) * 160); g.stroke(); }
        g.restore(); g.globalAlpha = 1;
        for (let i = 0; i < 16; i++) { const a = -rot * 0.7 + i * TAU / 16, rr = 44 + (i % 3) * 10; dot(Math.cos(a) * rr, Math.sin(a) * rr * 0.8, 4, RAINBOW[i % 8], 0.8 * on); }
        dot(0, 0, 60, '#b44bff', 0.35 * on, true);
      }
      g.fillStyle = '#0a0c14'; g.beginPath(); g.arc(0, 4, R, 0, TAU); g.fill();
      tube(OP('disco_ch', p => { p.moveTo(0, -50); p.lineTo(0, -26); }), '#c8d6e8', 1.6, segI(st, 0, n));
      const c = new Path2D(); for (const lat of [-0.68, -0.36, 0, 0.36, 0.68]) { const y = lat * R, hw = Math.sqrt(1 - lat * lat) * R; c.moveTo(-hw, y + 4); c.quadraticCurveTo(0, y + 4 + 4 * (lat + 0.2), hw, y + 4); }
      tubeLite(c, '#9fe8ff', 1.1, segI(st, 2, n));
      const m = new Path2D(); for (let k = 0; k < 6; k++) { const th = rot + k * Math.PI / 6; if (Math.cos(th) <= 0.05) continue; for (let j = 0; j <= 10; j++) { const y = -R + j * R / 5, x = Math.sin(th) * Math.sqrt(Math.max(0, R * R - y * y)); j ? m.lineTo(x, y + 4) : m.moveTo(x, y + 4); } }
      tubeLite(m, '#d9b8ff', 1.1, segI(st, 3, n));
      tube(OP('disco_o', p => p.arc(0, 4, R, 0, TAU)), '#e8f8ff', 2.2, segI(st, 1, n));
      if (on > 0.05) for (let i = 0; i < 7; i++) { const a = (i * 2.4 + Math.floor(st.t * 6 + i) * 1.3), rr = R * 0.8 * ((i * 0.37 + 0.2) % 1); dot(Math.cos(a) * rr, 4 + Math.sin(a) * rr, 5 + (i % 2) * 3, '#ffffff', on * (0.5 + 0.5 * Math.sin(st.t * 9 + i * 2))); }
    } },
  { id: 'funk', name: "NEON 'FUNK' SIGN", short: 'FUNK SIGN', color: '#ffe23a', color2: '#ff2bd6',
    intro: "Every legit funk establishment needs a FUNK sign. Wire it up, it's the law!",
    draw(st) {
      const n = 6, on = st.on, cols = ['#ff2bd6', '#ffe23a', '#29f3ff', '#46ff74'];
      if (on > 0.05) { const bp = rrPath(-49, -40, 98, 80, 10); g.save(); g.lineCap = 'round'; for (let i = 0; i < 40; i++) { const u = i / 40; const [x, y] = rrPoint(-49, -40, 98, 80, u); const lit = (i + Math.floor(st.t * 10)) % 3 === 0; dot(x, y, lit ? 4 : 2, lit ? '#ffffff' : '#ff8a1f', on * (lit ? 0.9 : 0.4)); } g.restore(); }
      neonTextRainbow('FUNK', 0, -6, 30, cols, i => segI(st, i, n), { w: 3.2, slant: 0.12 });
      tube(OP('funk_z', p => { p.moveTo(-44, 24); const z = [[-30, 30], [-16, 22], [-2, 31], [12, 22], [26, 30], [44, 24]]; z.forEach(([a, b]) => p.lineTo(a, b)); p.moveTo(36, 18); p.lineTo(44, 24); p.lineTo(36, 30); }), '#ffe23a', 2, segI(st, 4, n));
      const sI = segI(st, 5, n); tube(OP('funk_s1', p => p.addPath(starPath(-40, -32, 6, 2, 4))), '#ffffff', 1.2, sI * (0.6 + 0.4 * Math.sin(st.t * 5))); tube(OP('funk_s2', p => p.addPath(starPath(41, -30, 5, 1.7, 4))), '#ffffff', 1.2, sI * (0.6 + 0.4 * Math.sin(st.t * 5 + 2)));
    } },
  { id: 'juke', name: 'FUNKY JUKEBOX', short: 'JUKEBOX', color: '#ff8a1f', color2: '#ffe23a',
    intro: "The jukebox been quiet too long. Plug it in and let it PLAY, baby!",
    draw(st) {
      const n = 6, on = st.on;
      g.fillStyle = '#0c0610'; g.fill(OP('juke_f', p => { p.moveTo(-34, 48); p.lineTo(-34, -14); p.arc(0, -14, 34, Math.PI, 0); p.lineTo(34, 48); p.closePath(); }));
      [['#ff3b5c', 29], ['#ffe23a', 24], ['#46ff74', 19]].forEach(([c, r], i) => { const p = OP('juke_a' + i, p => { p.moveTo(-r, 14); p.lineTo(-r, -14); p.arc(0, -14, r, Math.PI, 0); p.lineTo(r, 14); }); tube(p, c, 2, segI(st, 1 + i, n)); });
      if (on > 0.05) for (let i = 0; i < 8; i++) { const u = ((st.t * 0.25 + i / 8) % 1), side = i % 2 ? 1 : -1; const y = lerp(12, -14, u); dot(side * 26.5, y, 3, '#ffffff', on * 0.8); }
      tube(OP('juke_w', p => p.addPath(rrPath(-16, -4, 32, 18, 3))), '#29f3ff', 1.6, segI(st, 4, n));
      const rI = segI(st, 4, n), a = st.t * (on > 0 ? 4 : 0); const rec = new Path2D(); rec.arc(0, 5, 7, 0, TAU); rec.moveTo(Math.cos(a) * 2, 5 + Math.sin(a) * 2); rec.lineTo(Math.cos(a) * 6, 5 + Math.sin(a) * 6); tubeLite(rec, '#ff2bd6', 1.2, rI);
      tubeLite(OP('juke_g', p => { for (let y = 24; y <= 42; y += 4.5) { p.moveTo(-24, y); p.lineTo(24, y); } }), '#b44bff', 1.3, segI(st, 5, n));
      tube(OP('juke_o', p => { p.moveTo(-34, 48); p.lineTo(-34, -14); p.arc(0, -14, 34, Math.PI, 0); p.lineTo(34, 48); p.closePath(); p.moveTo(-34, 19); p.lineTo(34, 19); }), '#ff8a1f', 2.2, segI(st, 0, n));
      if (on > 0.05) for (let i = 0; i < 3; i++) { const u = (st.t * 0.4 + i / 3) % 1; drawNote(-30 + i * 28 + Math.sin(st.t * 2 + i) * 4, -50 - u * 22 + 10, 6, RAINBOW[(i * 3) % 8], on * (1 - u)); }
    } },
  { id: 'skate', name: 'ROLLER RINK SIGN', short: 'ROLLER SKATE', color: '#ff2bd6', color2: '#ffe23a',
    intro: "Roller rink sign's busted. Can't boogie on eight wheels in the dark, man!",
    draw(st) {
      const n = 5, on = st.on, a = st.t * (on > 0 ? 7 : 0);
      if (on > 0.05) tubeLite(OP('sk_m', p => { for (let i = 0; i < 3; i++) { p.moveTo(-48, -22 + i * 9); p.lineTo(-38 + (i % 2) * 4, -22 + i * 9); } }), '#29f3ff', 1.2, on * (0.6 + 0.4 * Math.sin(st.t * 10)));
      g.fillStyle = '#12040e'; g.fill(OP('sk_f', p => skateBoot(p)));
      tube(OP('sk_b', p => skateBoot(p)), '#ff2bd6', 2.2, segI(st, 0, n));
      tubeLite(OP('sk_l', p => { for (let i = 0; i < 4; i++) { const y = -34 + i * 7; p.moveTo(-9, y); p.lineTo(-1, y + 4); p.moveTo(-9, y + 4); p.lineTo(-1, y); } }), '#ffffff', 1, segI(st, 1, n));
      tube(OP('sk_p', p => { p.moveTo(-30, 8); p.lineTo(30, 8); p.moveTo(30, 4); p.lineTo(35, 10); }), '#c8d6e8', 1.8, segI(st, 2, n));
      for (const [wx, i] of [[-19, 0], [18, 1]]) { const w = new Path2D(); w.arc(wx, 18, 8, 0, TAU); for (let k = 0; k < 3; k++) { const b = a + k * TAU / 3; w.moveTo(wx, 18); w.lineTo(wx + Math.cos(b) * 6, 18 + Math.sin(b) * 6); } tube(w, '#ffe23a', 1.8, segI(st, 3, n)); }
      neonText('ROLLER RINK', 0, 41, 9, '#29f3ff', segI(st, 4, n) * (on > 0 && Math.floor(st.t * 3) % 6 === 0 ? 0.5 : 1), { w: 1.5 });
    } },
  { id: 'afro', name: 'GLOWING AFRO PICK SIGN', short: 'AFRO PICK', color: '#b44bff', color2: '#ffc23a',
    intro: "My barber's 'FRO-TASTIC' sign. Light it right or he's cuttin' my hair crooked!",
    draw(st) {
      const n = 4, on = st.on;
      const afro = OP('af_a', p => { const N = 15, cx = -8, cy = -6; for (let i = 0; i <= N; i++) { const a0 = i / N * TAU, a1 = (i + 0.5) / N * TAU, a2 = (i + 1) / N * TAU; const P0 = [cx + Math.cos(a0) * 30, cy + Math.sin(a0) * 29]; if (i === 0) p.moveTo(...P0); if (i < N) p.quadraticCurveTo(cx + Math.cos(a1) * 38, cy + Math.sin(a1) * 37, cx + Math.cos(a2) * 30, cy + Math.sin(a2) * 29); } p.closePath(); });
      if (on > 0.05) { glowFill(afro, '#b44bff', on, 0.12); for (let i = 0; i < 6; i++) { const a = st.t * 0.8 + i * TAU / 6; dot(-8 + Math.cos(a) * 42, -6 + Math.sin(a) * 40, 4, '#ffffff', on * (0.4 + 0.6 * Math.abs(Math.sin(st.t * 3 + i)))); } }
      tube(afro, '#b44bff', 2.2, segI(st, 0, n));
      g.save(); g.translate(22, -30); g.rotate(0.5);
      tube(OP('af_t', p => { for (let i = 0; i < 6; i++) { const x = -10 + i * 4; p.moveTo(x, 4); p.lineTo(x, 30); } p.moveTo(-11, 4); p.lineTo(11, 4); }), '#ffc23a', 1.6, segI(st, 1, n));
      tube(OP('af_h', p => { p.addPath(rrPath(-9, -22, 18, 26, 7)); }), '#ffc23a', 2, segI(st, 2, n));
      tube(OP('af_hb', p => p.addPath(boltPath(0, -9, 7))), '#29f3ff', 1.2, segI(st, 2, n));
      g.restore();
      neonText('FRO-TASTIC', 0, 42, 9.5, '#46ff74', segI(st, 3, n), { w: 1.6, slant: 0.1 });
    } },
  { id: 'van', name: "70s GROOVE VAN", short: 'GROOVE VAN', color: '#ff8a1f', color2: '#ffe23a',
    intro: "My '76 groove van needs her neon trim back. Ladies LOVE a lit-up van, baby!",
    draw(st) {
      const n = 6, on = st.on, a = st.t * (on > 0 ? 6 : 0), bob = on > 0 ? Math.sin(st.t * 8) * 0.6 : 0;
      g.save(); g.translate(0, bob);
      if (on > 0.05) { g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = '#ffe23a'; g.globalAlpha = 0.12 * on; g.beginPath(); g.moveTo(45, -4); g.lineTo(90, -22); g.lineTo(90, 18); g.closePath(); g.fill(); g.restore(); g.globalAlpha = 1; }
      const body = OP('van_b', p => { p.moveTo(-46, 8); p.lineTo(-46, -22); p.quadraticCurveTo(-46, -30, -38, -30); p.lineTo(20, -30); p.quadraticCurveTo(28, -30, 33, -20); p.lineTo(44, -8); p.quadraticCurveTo(46, -6, 46, -2); p.lineTo(46, 8); p.closePath(); });
      g.fillStyle = '#0e0608'; g.fill(body);
      [['#ff3b5c', -5], ['#ff8a1f', -1], ['#ffe23a', 3]].forEach(([c, y], i) => { const s = new Path2D(); for (let x = -43; x <= 43; x += 3) { const yy = y + Math.sin(x * 0.08 + (on > 0 ? st.t * 3 : 0)) * 3; x === -43 ? s.moveTo(x, yy) : s.lineTo(x, yy); } tubeLite(s, c, 1.5, segI(st, 2 + i, n)); });
      tube(OP('van_w', p => { p.addPath(rrPath(-40, -25, 20, 11, 3)); p.addPath(rrPath(-15, -25, 22, 11, 3)); p.moveTo(12, -25); p.lineTo(22, -25); p.quadraticCurveTo(25, -25, 27, -21); p.lineTo(31, -14); p.lineTo(12, -14); p.closePath(); }), '#29f3ff', 1.4, segI(st, 1, n));
      tube(body, '#ff8a1f', 2.2, segI(st, 0, n));
      for (const wx of [-28, 28]) { const w = new Path2D(); w.arc(wx, 10, 9, 0, TAU); for (let k = 0; k < 4; k++) { const b = a + k * TAU / 4; w.moveTo(wx + Math.cos(b) * 3, 10 + Math.sin(b) * 3); w.lineTo(wx + Math.cos(b) * 7, 10 + Math.sin(b) * 7); } g.fillStyle = '#060306'; g.beginPath(); g.arc(wx, 10, 9, 0, TAU); g.fill(); tube(w, '#ff2bd6', 1.8, segI(st, 5, n)); }
      dot(44, -3, 6, '#ffffff', segI(st, 5, n));
      g.restore();
      neonText('GROOVE VAN', 0, 36, 9, '#ff2bd6', segI(st, 5, n), { w: 1.5, slant: 0.15 });
    } },
  { id: 'express', name: 'FUNK EXPRESS MARQUEE', short: 'FUNK EXPRESS', color: '#ffc23a', color2: '#ff3b5c',
    intro: "The FUNK EXPRESS marquee! Get it lit and every cat in town comes dancin'!",
    draw(st) {
      const n = 5, on = st.on;
      g.fillStyle = '#0e0a04'; g.fill(OP('ex_f', p => p.addPath(rrPath(-48, -32, 96, 58, 7))));
      tube(OP('ex_b', p => { p.addPath(rrPath(-48, -32, 96, 58, 7)); p.addPath(rrPath(-43, -27, 86, 48, 5)); }), '#ffc23a', 1.6, segI(st, 0, n));
      const bI = segI(st, 1, n); for (let i = 0; i < 34; i++) { const [x, y] = rrPoint(-45.5, -29.5, 91, 53, i / 34); const lit = on > 0 ? ((i + Math.floor(st.t * 12)) % 4 === 0) : true; dot(x, y, lit ? 3.4 : 2, lit ? '#fff3c0' : '#ffc23a', bI * (lit ? 1 : 0.5)); }
      neonText('FUNK', 0, -11, 15, '#ff2bd6', segI(st, 2, n), { w: 2.2 });
      neonText('EXPRESS', 0, 9, 11, '#29f3ff', segI(st, 3, n), { w: 1.8 });
      const aI = segI(st, 4, n), sh = on > 0 ? (st.t * 30) % 12 : 0;
      tube(OP('ex_a', p => { p.moveTo(-34, 39); p.lineTo(30, 39); p.moveTo(24, 33); p.lineTo(32, 39); p.lineTo(24, 45); }), '#ff3b5c', 2, aI);
      if (on > 0.05) for (let x = -34 + sh; x < 28; x += 12) dot(x, 39, 4, '#ffffff', on * 0.8);
    } },
  { id: 'tree', name: 'THE CHRISTMAS TREE', short: 'XMAS TREE', color: '#46ff74', color2: '#ff3b5c',
    intro: "The big one, baby! The Christmas tree! Light it up and it's a FUNKY Christmas for everybody!",
    draw(st) {
      const on = st.on, NB = 18;
      if (on > 0.05) { // star rays + snow
        g.save(); g.globalCompositeOperation = 'lighter'; g.translate(0, -42); g.rotate(st.t * 0.4);
        for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.fillStyle = '#ffe23a'; g.globalAlpha = 0.1 * on; g.beginPath(); g.moveTo(0, 0); g.lineTo(-3, -70); g.lineTo(3, -70); g.closePath(); g.fill(); }
        g.restore(); g.globalAlpha = 1;
        for (let i = 0; i < 22; i++) { const x = ((i * 37.3) % 100) - 50 + Math.sin(st.t + i) * 3, y = ((st.t * 10 + i * 23.7) % 100) - 50; dot(x, y, 2.2, '#ffffff', 0.7 * on); }
      }
      const tree = OP('tr_t', p => { const pts = [[0, -38], [-16, -16], [-9, -16], [-26, 6], [-17, 6], [-36, 30], [36, 30], [17, 6], [26, 6], [9, -16], [16, -16]]; pts.forEach(([x, y], i) => i ? p.lineTo(x, y) : p.moveTo(x, y)); p.closePath(); });
      g.fillStyle = '#04120a'; g.fill(tree); if (on > 0.05) glowFill(tree, '#46ff74', on, 0.1);
      tube(OP('tr_k', p => p.addPath(rrPath(-6, 30, 12, 10, 2))), '#ff8a1f', 1.8, segI(st, 0, NB + 3));
      tube(tree, '#46ff74', 2.2, segI(st, 1, NB + 3));
      const gar = OP('tr_g', p => { p.moveTo(-10, -22); p.quadraticCurveTo(0, -16, 12, -24); p.moveTo(-20, -4); p.quadraticCurveTo(0, 6, 21, -6); p.moveTo(-29, 17); p.quadraticCurveTo(0, 30, 30, 15); });
      tubeLite(gar, '#ffd4f6', 1, segI(st, 2, NB + 3) * 0.7);
      const bulbs = TREE_BULBS; bulbs.forEach(([x, y], i) => { const c = ['#ff3b5c', '#29f3ff', '#ffe23a', '#46ff74', '#ff2bd6', '#ff8a1f'][i % 6]; let I = segI(st, 3 + i, NB + 3); if (on > 0.5) I *= 0.55 + 0.45 * Math.sin(st.t * 6 - i * 0.9); g.fillStyle = shade(c, -0.6); g.beginPath(); g.arc(x, y, 2.2, 0, TAU); g.fill(); dot(x, y, 7, c, I); });
      // presents
      tube(OP('tr_p1', p => { p.addPath(rrPath(-34, 34, 15, 11, 1.5)); p.moveTo(-26.5, 34); p.lineTo(-26.5, 45); }), '#ff2bd6', 1.4, segI(st, NB + 1, NB + 3));
      tube(OP('tr_p2', p => { p.addPath(rrPath(20, 36, 13, 9, 1.5)); p.moveTo(20, 40.5); p.lineTo(33, 40.5); }), '#29f3ff', 1.4, segI(st, NB + 1, NB + 3));
      const sI = Math.max(segI(st, NB + 2, NB + 3), on); tube(OP('tr_s', p => p.addPath(starPath(0, -42, 9, 3.8))), '#ffe23a', 2, sI); if (sI > 0.05) dot(0, -42, 26 * (0.8 + 0.2 * Math.sin(st.t * 4)), '#ffe23a', 0.7 * sI);
    } },
];
const TREE_BULBS = [[-6, -20], [3, -18.5], [10, -22], [-17, -3], [-9, 0], [0, 1.5], [9, 0], [17, -3], [-26, 17.5], [-18, 21.5], [-9, 23.5], [0, 24], [9, 23.5], [18, 21], [26, 17], [-12, -10], [12, -10], [0, -30]];
function rrPoint(x, y, w, h, u) { const P = 2 * (w + h); let d = ((u % 1) + 1) % 1 * P; if (d < w) return [x + d, y]; d -= w; if (d < h) return [x + w, y + d]; d -= h; if (d < w) return [x + w - d, y + h]; d -= w; return [x, y + h - d]; }
function skateBoot(p) { p.moveTo(-28, -42); p.lineTo(-6, -42); p.lineTo(-4, -12); p.quadraticCurveTo(20, -14, 28, -4); p.quadraticCurveTo(31, 0, 30, 4); p.lineTo(-30, 4); p.lineTo(-30, -20); p.quadraticCurveTo(-31, -34, -28, -42); p.closePath(); }
function drawNote(x, y, s, c, I) { if (I < 0.02) return; const p = new Path2D(); p.ellipse(x, y, s * 0.55, s * 0.4, -0.4, 0, TAU); p.moveTo(x + s * 0.5, y); p.lineTo(x + s * 0.5, y - s * 1.6); p.lineTo(x + s * 1.1, y - s * 1.2); tubeLite(p, c, s * 0.22, I); }
function drawObject(i, cx, cy, size, st) { g.save(); g.translate(cx, cy); const k = size / 100; g.scale(k, k); try { OBJECTS[i].draw(st); } finally { g.restore(); } }
