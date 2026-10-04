/* ===================== PAPPA KENNEDY: original funk-star electrician mascot ===================== */
const PK_SKIN = '#8d5a3b', PK_SKIN_D = '#6a3f27', PK_HAIR = '#24140c', PK_SUIT = '#7b2fe0', PK_SUIT_D = '#4c1594', PK_GOLD = '#ffc23a', PK_OUT = '#12060f';
function ik(ax, ay, bx, by, l1, l2, side) { // 2-bone IK: returns joint position
  let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy) || 0.001; const max = l1 + l2 - 0.01; if (d > max) { bx = ax + dx / d * max; by = ay + dy / d * max; dx = bx - ax; dy = by - ay; d = max; }
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(0, l1 * l1 - a * a)), mx = ax + dx * a / d, my = ay + dy * a / d;
  return [mx + side * (-dy / d) * hh, my + side * (dx / d) * hh, bx, by];
}
function pkPose(pose, t) {
  const beat = T * Math.PI * 1.8, s = Math.sin(beat), bob = Math.abs(Math.sin(beat)) * 3;
  const P = { hx: Math.sin(beat / 2) * 3, hy: -84 + bob, lean: 0, tilt: Math.sin(beat / 2) * 0.05, fL: [-17, 0], fR: [17, 0], hL: [-34, -98 + s * 3], hR: [34, -98 - s * 3], eL: -1, eR: 1, mouth: 'grin', sx: 1, spike: 0, sweat: 0, smoke: 0, skel: false };
  if (pose === 'groove') { P.hx = s * 8; P.lean = s * 0.08; P.fL = [-18 + s * 6, -Math.max(0, -s) * 9]; P.fR = [18 + s * 6, -Math.max(0, s) * 9]; P.hL = [-36 + s * 6, -112 + s * 16]; P.hR = [36 + s * 6, -112 - s * 16]; P.mouth = 'open'; }
  else if (pose === 'point') { const up = Math.sin(beat / 2) > 0; P.hx = up ? -5 : 5; P.lean = up ? 0.12 : -0.1; if (up) { P.hR = [56, -200]; P.hL = [-20, -84]; P.eL = 1; } else { P.hR = [-40, -52]; P.hL = [-24, -86]; P.eR = -1; P.eL = 1; } P.fR = [22, -(up ? 0 : 4)]; P.mouth = up ? 'open' : 'grin'; }
  else if (pose === 'spin') { P.sx = Math.cos(t * 11); P.hL = [-62, -132]; P.hR = [62, -132]; P.fL = [-8, 0]; P.fR = [8, -10]; P.mouth = 'open'; }
  else if (pose === 'split') { const k = ease(Math.min(1, t * 4)) * (t < 1.6 ? 1 : Math.max(0, 1 - (t - 1.6) * 3)); P.hy = -84 + 44 * k; P.fL = [-17 - 46 * k, 0]; P.fR = [17 + 46 * k, 0]; P.hL = [-46, -168 + 40 * k]; P.hR = [46, -168 + 40 * k]; P.mouth = 'open'; }
  else if (pose === 'slide') { const k = Math.sin(t * 4); P.hx = k * 14; P.fL = [-20 + k * 26, 0]; P.fR = [20 + k * 6, -3]; P.lean = -k * 0.1; P.hL = [-40, -124]; P.hR = [40, -76]; P.mouth = 'grin'; }
  else if (pose === 'shock') { const j = () => rand(-3, 3); P.hx = j(); P.hy = -88 + j(); P.hL = [-64 + j(), -158 + j()]; P.hR = [64 + j(), -158 + j()]; P.fL = [-26, 0]; P.fR = [26, -8 + j()]; P.mouth = 'o'; P.spike = 1; P.skel = Math.floor(t * 14) % 2 === 0 && t < 1.4; P.smoke = 1; }
  else if (pose === 'sweat') { const k = Math.sin(t * 16); P.hy = -80; P.fL = [-12, 0]; P.fR = [12, 0]; P.hL = [-30, -90 + k]; P.hR = [12, -168 + Math.sin(t * 7) * 4]; P.eR = 1; P.mouth = 'grit'; P.sweat = 1; P.lean = k * 0.02; }
  else if (pose === 'celebrate') { const j = Math.abs(Math.sin(t * 6)) * 16; P.hy = -84 - j; P.fL = [-17, -j]; P.fR = [17, -j]; P.hL = [-48, -204 - j]; P.hR = [48, -204 - j]; P.mouth = 'open'; }
  else if (pose === 'sad') { P.lean = 0.06; P.tilt = 0.25; P.hL = [-26, -64]; P.hR = [26, -64]; P.mouth = 'frown'; P.smoke = 0.6; P.spike = 0.5; P.hy = -82; }
  else if (pose === 'title') { const up = Math.sin(beat / 2) > 0; P.hx = s * 5; P.lean = s * 0.06; P.hR = up ? [54, -196] : [44, -120]; P.hL = up ? [-24, -86] : [-44, -120 + s * 8]; P.fL = [-20 + s * 4, -Math.max(0, -s) * 7]; P.fR = [20 + s * 4, -Math.max(0, s) * 7]; P.mouth = 'open'; }
  return P;
}
function rot(x, y, a) { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }
function drawPappa(x, y, h, o = {}) {
  const pose = o.pose || 'idle', t = o.t || 0, P = pkPose(pose, t), k = h / 220;
  if (o.talk && P.mouth !== 'o') P.mouth = Math.floor(T * 9) % 2 ? 'open' : 'grin';
  g.save(); g.translate(x, y); g.scale(k * (Math.abs(P.sx) < 0.15 ? 0.15 * Math.sign(P.sx || 1) : P.sx), k);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // spotlight + floor shadow
  dot(0, -100, 130, o.glow || '#ff2bd6', 0.22, true);
  g.fillStyle = 'rgba(0,0,0,0.5)'; g.beginPath(); g.ellipse(0, 2, 44, 7, 0, 0, TAU); g.fill();
  const H = [P.hx, P.hy], neck = [H[0] + rot(0, -52, P.lean)[0], H[1] + rot(0, -52, P.lean)[1]];
  const sh = s => { const r = rot(s * 22, 4, P.lean); return [neck[0] + r[0], neck[1] + r[1]]; };
  const sL = sh(-1), sR = sh(1);
  const hip = s => { const r = rot(s * 10, 0, P.lean * 0.5); return [H[0] + r[0], H[1] + r[1]]; };
  const skel = P.skel, SUIT = skel ? '#0d1530' : PK_SUIT, SUITD = skel ? '#0a0f22' : PK_SUIT_D, SKIN = skel ? '#0d1530' : PK_SKIN;
  const bones = [];
  // ---- legs
  for (const side of [-1, 1]) {
    const hp = hip(side), f = side < 0 ? P.fL : P.fR, kn = ik(hp[0], hp[1], f[0], f[1] - 8, 40, 40, side < 0 ? 1 : -1);
    g.strokeStyle = PK_OUT; g.lineWidth = 21; g.beginPath(); g.moveTo(hp[0], hp[1]); g.lineTo(kn[0], kn[1]); g.stroke();
    g.strokeStyle = SUIT; g.lineWidth = 16; g.stroke();
    // bell-bottom flare
    const ax = kn[2], ay = kn[3], dx = ax - kn[0], dy = ay - kn[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
    const bell = new Path2D(); bell.moveTo(kn[0] + nx * 8, kn[1] + ny * 8); bell.lineTo(ax + nx * 17 + dx / L * 4, ay + ny * 17 + dy / L * 4); bell.quadraticCurveTo(ax + dx / L * 9, ay + dy / L * 9, ax - nx * 17 + dx / L * 4, ay - ny * 17 + dy / L * 4); bell.lineTo(kn[0] - nx * 8, kn[1] - ny * 8); bell.closePath();
    g.fillStyle = SUIT; g.fill(bell); g.strokeStyle = PK_OUT; g.lineWidth = 2.5; g.stroke(bell);
    if (!skel) { g.strokeStyle = '#ffffff'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(hp[0] + side * 7, hp[1] + 4); g.lineTo(kn[0] + side * 7, kn[1]); g.lineTo(ax + side * 15, ay + 2); g.stroke(); }
    // platform shoe
    const sx0 = f[0] - 14 + side * 2, sy0 = f[1];
    g.fillStyle = skel ? '#222' : PK_GOLD; g.strokeStyle = PK_OUT; g.lineWidth = 2.5; const shoe = rrPath(sx0, sy0 - 12, 28, 9, 4); g.fill(shoe); g.stroke(shoe);
    g.fillStyle = skel ? '#111' : '#d88a14'; const sole = rrPath(sx0 - 1, sy0 - 5, 30, 6, 2); g.fill(sole); g.stroke(sole);
    if (!skel) dot(sx0 + 8, sy0 - 9, 5, '#fff7c0', 0.5 + 0.5 * Math.sin(T * 5 + side));
    bones.push([hp, [kn[0], kn[1]], [ax, ay]]);
  }
  // ---- torso
  const tp = new Path2D(); const a = hip(-1.6), b = hip(1.6); tp.moveTo(a[0], a[1] + 6); tp.lineTo(sL[0] - 3, sL[1] - 2); tp.quadraticCurveTo(neck[0], neck[1] - 6, sR[0] + 3, sR[1] - 2); tp.lineTo(b[0], b[1] + 6); tp.closePath();
  g.fillStyle = SUIT; g.fill(tp); g.strokeStyle = PK_OUT; g.lineWidth = 2.5; g.stroke(tp);
  if (!skel) {
    // V-neck chest + gold chain
    const vn = new Path2D(), c0 = rot(0, 26, P.lean); vn.moveTo(neck[0] - 9, neck[1]); vn.lineTo(neck[0] + c0[0], neck[1] + c0[1]); vn.lineTo(neck[0] + 9, neck[1]); vn.closePath(); g.fillStyle = PK_SKIN; g.fill(vn);
    g.strokeStyle = PK_GOLD; g.lineWidth = 1.6; g.beginPath(); g.moveTo(neck[0] - 7, neck[1] + 2); g.quadraticCurveTo(neck[0] + c0[0] * 0.6, neck[1] + c0[1] * 0.75, neck[0] + 7, neck[1] + 2); g.stroke();
    tube(boltPath(neck[0] + c0[0] * 0.55, neck[1] + c0[1] * 0.72, 4), PK_GOLD, 1, 0.8);
    // collar wings
    g.fillStyle = '#fff'; g.strokeStyle = PK_OUT; g.lineWidth = 2;
    for (const sd of [-1, 1]) { const cp = new Path2D(); cp.moveTo(neck[0] + sd * 4, neck[1] - 3); cp.lineTo(neck[0] + sd * 26, neck[1] + 12); cp.lineTo(neck[0] + sd * 9, neck[1] + 7); cp.closePath(); g.fill(cp); g.stroke(cp); }
    // sequins
    for (let i = 0; i < 9; i++) { const u = (i * 0.618) % 1, v = (i * 0.414 + 0.2) % 1; const px = lerp(a[0], b[0], u) * (1 - v) + lerp(sL[0], sR[0], u) * v, py = lerp(a[1], sL[1], v); dot(px, py, 4, i % 2 ? '#ff9cf0' : '#9ef6ff', 0.4 + 0.6 * Math.max(0, Math.sin(T * 4 + i * 1.7))); }
    // tool belt
    const bl = hip(-1.75), br = hip(1.75); g.fillStyle = '#5a3015'; g.beginPath(); g.moveTo(bl[0], bl[1] - 1); g.lineTo(br[0], br[1] - 1); g.lineTo(br[0], br[1] + 7); g.lineTo(bl[0], bl[1] + 7); g.closePath(); g.fill(); g.stroke();
    const mid = hip(0); g.fillStyle = PK_GOLD; const bk = rrPath(mid[0] - 6, mid[1] - 1, 12, 9, 2); g.fill(bk); g.stroke(bk); tube(boltPath(mid[0], mid[1] + 3.5, 3.5), '#ffffff', 0.8, 0.6);
    for (const sd of [-1, 1]) { const pp = hip(sd * 1.6); g.fillStyle = '#7a4520'; const pch = rrPath(pp[0] - 6, pp[1] + 4, 12, 14, 3); g.fill(pch); g.stroke(pch); g.strokeStyle = sd < 0 ? '#ffe23a' : '#ff3b5c'; g.lineWidth = 3; g.beginPath(); g.moveTo(pp[0] - 2 * sd, pp[1] + 4); g.lineTo(pp[0] - 3 * sd, pp[1] - 6); g.stroke(); g.strokeStyle = '#c8d6e8'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(pp[0] + 2 * sd, pp[1] + 4); g.lineTo(pp[0] + 3 * sd, pp[1] - 4); g.stroke(); g.strokeStyle = PK_OUT; g.lineWidth = 2; }
  }
  // ---- arms
  for (const side of [-1, 1]) {
    const s0 = side < 0 ? sL : sR, hd = side < 0 ? P.hL : P.hR, el = ik(s0[0], s0[1], hd[0], hd[1], 31, 31, (side < 0 ? P.eL : P.eR) * (side < 0 ? 1 : -1) * -1);
    g.strokeStyle = PK_OUT; g.lineWidth = 16; g.beginPath(); g.moveTo(s0[0], s0[1]); g.lineTo(el[0], el[1]); g.lineTo(el[2], el[3]); g.stroke();
    g.strokeStyle = SUIT; g.lineWidth = 12; g.stroke();
    // bell sleeve cuff
    const dx = el[2] - el[0], dy = el[3] - el[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L, cx = el[2] - dx / L * 6, cy = el[3] - dy / L * 6;
    const cf = new Path2D(); cf.moveTo(cx - dx / L * 8 + nx * 6, cy - dy / L * 8 + ny * 6); cf.lineTo(cx + nx * 11, cy + ny * 11); cf.lineTo(cx - nx * 11, cy - ny * 11); cf.lineTo(cx - dx / L * 8 - nx * 6, cy - dy / L * 8 - ny * 6); cf.closePath();
    g.fillStyle = skel ? SUITD : '#ff2bd6'; g.fill(cf); g.strokeStyle = PK_OUT; g.lineWidth = 2; g.stroke(cf);
    g.fillStyle = SKIN; g.beginPath(); g.arc(el[2], el[3], 6.5, 0, TAU); g.fill(); g.stroke();
    bones.push([s0, [el[0], el[1]], [el[2], el[3]]]);
  }
  // ---- head
  const hc = [neck[0] + rot(0, -22, P.lean + P.tilt)[0], neck[1] + rot(0, -22, P.lean + P.tilt)[1]];
  g.save(); g.translate(hc[0], hc[1]); g.rotate(P.lean + P.tilt);
  // afro
  const af = new Path2D(), N = 18, acx = 0, acy = -14, R = 35, sp = P.spike;
  for (let i = 0; i <= N; i++) { const a0 = i / N * TAU, a1 = (i + 0.5) / N * TAU; const r0 = R + (i % 2) * 2, r1 = R + 8 + sp * 14 * (i % 2 ? 1 : 0.6) + Math.sin(T * 3 + i) * 0.6; const p0 = [acx + Math.cos(a0) * r0, acy + Math.sin(a0) * r0 * 0.92]; if (i === 0) af.moveTo(p0[0], p0[1]); else af.quadraticCurveTo(acx + Math.cos(a1 - TAU / N) * r1, acy + Math.sin(a1 - TAU / N) * r1 * 0.92, p0[0], p0[1]); }
  af.closePath(); g.fillStyle = PK_HAIR; g.fill(af); g.strokeStyle = PK_OUT; g.lineWidth = 2.5; g.stroke(af);
  g.save(); g.clip(af); g.globalCompositeOperation = 'lighter'; g.strokeStyle = '#b44bff'; g.globalAlpha = 0.35; g.lineWidth = 6; g.beginPath(); g.arc(acx, acy, R + 4, -2.6, -0.6); g.stroke(); g.restore(); g.globalAlpha = 1;
  // hard hat perched on top
  g.save(); g.translate(4, acy - R - 4 - sp * 6); g.rotate(0.12 + sp * 0.4);
  g.fillStyle = skel ? '#333' : '#ffd23a'; g.strokeStyle = PK_OUT; g.lineWidth = 2.2; g.beginPath(); g.ellipse(0, 0, 14, 11, 0, Math.PI, 0); g.closePath(); g.fill(); g.stroke();
  const brim = rrPath(-18, -2, 36, 5, 2.5); g.fill(brim); g.stroke(brim); g.strokeStyle = '#e0a400'; g.beginPath(); g.moveTo(0, -11); g.lineTo(0, -2); g.stroke();
  g.restore();
  if (skel) { // x-ray skull
    g.fillStyle = '#e8f4ff'; g.beginPath(); g.ellipse(0, 0, 13, 15, 0, 0, TAU); g.fill(); g.fillStyle = '#0d1530'; g.beginPath(); g.ellipse(-5, 3, 2, 3, 0, 0, TAU); g.ellipse(5, 3, 2, 3, 0, 0, TAU); g.fill(); g.fillRect(-6, 9, 12, 2);
  } else {
    // ears, face, sideburns
    g.fillStyle = PK_SKIN; g.strokeStyle = PK_OUT; g.lineWidth = 2.2;
    g.beginPath(); g.ellipse(-15, 2, 3.5, 5, 0, 0, TAU); g.fill(); g.stroke(); g.beginPath(); g.ellipse(15, 2, 3.5, 5, 0, 0, TAU); g.fill(); g.stroke();
    g.beginPath(); g.ellipse(0, 0, 15, 17.5, 0, 0, TAU); g.fill(); g.stroke();
    g.fillStyle = PK_HAIR; g.fillRect(-15, -6, 4, 13); g.fillRect(11, -6, 4, 13);
    // nose + mustache
    g.strokeStyle = PK_SKIN_D; g.lineWidth = 2; g.beginPath(); g.moveTo(-2, 3); g.quadraticCurveTo(0, 7, 3, 5); g.stroke();
    // mouth
    g.strokeStyle = PK_OUT; g.lineWidth = 1.8;
    if (P.mouth === 'grin') { g.fillStyle = '#fff'; g.beginPath(); g.moveTo(-8, 9); g.quadraticCurveTo(0, 17, 8, 9); g.closePath(); g.fill(); g.stroke(); g.fillStyle = PK_GOLD; g.fillRect(2, 9.6, 3, 2.6); }
    else if (P.mouth === 'open') { g.fillStyle = '#3a0712'; g.beginPath(); g.moveTo(-8, 9); g.quadraticCurveTo(0, 22, 8, 9); g.closePath(); g.fill(); g.stroke(); g.fillStyle = '#fff'; g.fillRect(-6, 9, 12, 2.6); g.fillStyle = PK_GOLD; g.fillRect(2, 9, 3, 2.6); g.fillStyle = '#ff6b8a'; g.beginPath(); g.ellipse(0, 15, 4, 2.2, 0, 0, TAU); g.fill(); }
    else if (P.mouth === 'o') { g.fillStyle = '#3a0712'; g.beginPath(); g.ellipse(0, 12, 4.5, 5.5, 0, 0, TAU); g.fill(); g.stroke(); }
    else if (P.mouth === 'grit') { g.fillStyle = '#fff'; const m = rrPath(-8, 8.5, 16, 6, 2); g.fill(m); g.stroke(m); g.beginPath(); g.moveTo(-8, 11.5); g.lineTo(8, 11.5); for (let i = -4; i <= 4; i += 4) { g.moveTo(i, 8.5); g.lineTo(i, 14.5); } g.stroke(); }
    else { g.beginPath(); g.moveTo(-7, 14); g.quadraticCurveTo(0, 8, 7, 14); g.stroke(); }
    g.fillStyle = PK_HAIR; g.beginPath(); g.moveTo(-10, 8.5); g.quadraticCurveTo(-5, 4, 0, 6.5); g.quadraticCurveTo(5, 4, 10, 8.5); g.quadraticCurveTo(5, 7, 0, 8.5); g.quadraticCurveTo(-5, 7, -10, 8.5); g.fill();
  }
  // star-shaped sunglasses (glowing)
  const shc = skel ? '#29f3ff' : '#ff2bd6';
  g.strokeStyle = PK_GOLD; g.lineWidth = 1.6; g.beginPath(); g.moveTo(-3, -3); g.quadraticCurveTo(0, -5, 3, -3); g.stroke();
  for (const sd of [-1, 1]) { const st = starPath(sd * 8, -2, 9.5, 4.6, 5, -Math.PI / 2 + sd * 0.15); g.fillStyle = '#1a0016'; g.fill(st); tube(st, shc, 1.5, 0.9); dot(sd * 8 - 2, -5, 5, '#ffffff', 0.5 + 0.5 * Math.max(0, Math.sin(T * 3 + sd))); }
  g.restore();
  // x-ray bones
  if (skel) { g.strokeStyle = '#e8f4ff'; g.lineWidth = 3; g.beginPath(); g.moveTo(H[0], H[1]); g.lineTo(neck[0], neck[1]); for (let i = 0; i < 4; i++) { const yy = lerp(neck[1] + 8, H[1] - 10, i / 3); g.moveTo(neck[0] - 12, yy); g.quadraticCurveTo(neck[0], yy + 4, neck[0] + 12, yy); } for (const bn of bones) { g.moveTo(bn[0][0], bn[0][1]); g.lineTo(bn[1][0], bn[1][1]); g.lineTo(bn[2][0], bn[2][1]); } g.stroke(); dot(0, -100, 140, '#29f3ff', 0.4); }
  // sweat / smoke / sparks
  if (P.sweat) for (let i = 0; i < 3; i++) { const u = (T * 1.4 + i / 3) % 1; g.fillStyle = '#9ef6ff'; g.globalAlpha = 1 - u; g.beginPath(); g.ellipse(hc[0] + (i - 1) * 16 + 4, hc[1] - 6 + u * 26, 2.4, 3.4, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (P.smoke) for (let i = 0; i < 4; i++) { const u = (T * 0.6 + i / 4) % 1; g.fillStyle = '#9a9aa8'; g.globalAlpha = (1 - u) * 0.45 * P.smoke; g.beginPath(); g.arc(hc[0] + Math.sin(T * 2 + i) * 10, hc[1] - 50 - u * 50, 7 + u * 12, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (pose === 'shock') for (let i = 0; i < 3; i++) { const p = new Path2D(); let px = rand(-60, 60), py = rand(-210, -40); p.moveTo(px, py); for (let j = 0; j < 4; j++) { px += rand(-12, 12); py += rand(6, 14); p.lineTo(px, py); } tubeLite(p, '#29f3ff', 1.6, 1); }
  g.restore();
}

/* ---- personality: reactions, catchphrases (original), poses ---- */
const LINES = {
  start: ["Pappa Kennedy's in the house! Let's wire some FUNK!", "Hard hat on, afro high. Let's get to WORK, baby!", "Grab your wire strippers. It's showtime!"],
  single: ["Hyeah! That's one hot wire!", "Clean splice, baby!", "Wire nut WIN!", "Smooth like copper.", "Hot, neutral, and GROOVY!", "Ohm my goodness!", "Watt's up, Sparky?", "Strip it, twist it, FUNK it!", "That's how you ground it, baby!", "Positively charged!", "Ooh, that's up to code AND up to funk!"],
  double: ["Two-way switch, baby!", "Double the current, double the FUNK!", "Two rows! Now we're conductin'!", "Daisy-chain that funk!", "Uh! Uh! Two for the price of one!", "That's a duplex outlet of SOUL!"],
  triple: ["Three-phase FUNK! Hyeah!", "Triple-pole, triple soul!", "Three rows! Somebody hand me darker shades!", "That's 3-phase power, mama!", "Three! Somebody call the fire marshal, it's HOT in here!"],
  quad: ["FOUR ROWS! 200 amps of pure FUNK!", "MEGAWATT, BABY! Get up and get WIRED!", "Four rows! The power company wants to hire YOU!", "Sweet mercy, that's a full circuit!", "Good gravy, you just lit up three counties!", "FOUR! My afro just grew two inches!"],
  b2b: ["Back-to-back megawatts! You're a walking power plant!", "Again?! Somebody check this kid's license!"],
  combo: ["Keep it flowin'!", "Chain reaction, baby!", "The current keeps comin'!", "Don't stop the juice!", "Combo! That's a series circuit of SOUL!"],
  danger: ["Whoa, that panel's overloaded!", "That ain't up to code, brother!", "Inspector's comin', CLEAN IT UP!", "I smell burnin' insulation...", "Call your union rep, this is a hazard!", "My afro's standin' up and it ain't the humidity!", "OSHA's watchin', and they look disappointed.", "Did you learn wiring from a comment section?", "Uh-oh. That stack's taller than my platform shoes!", "That's a fire hazard and a FASHION hazard!"],
  over: ["You got shocked, baby!", "Breaker tripped! Shake it off, sugar.", "That's a code violation AND a fashion violation.", "Somebody's gettin' written up.", "Well, THAT's gonna leave a mark on the permit.", "I been shocked so many times my hair did THIS."],
  done: ["LET THERE BE FUNK!", "Hyeah! It's ALIVE!", "The lights are on and somebody's HOME!", "Connected! Pappa's proud of you, baby!", "That's what I call a LIVE WIRE!", "Get up, get LIT!"],
  banter: ["Measure twice, groove once.", "Lefty loosey, righty... dancey!", "Wire it like your mama's watchin'.", "I charge double for this kind of mess.", "Don't be a resistor, be a CONDUCTOR!", "Resistance is futile. It's 4.7 ohms.", "My tool belt got more sequins than your whole closet.", "Union break's at three. Funk break's ALL DAY.", "Electricity is just funk you can't see, baby.", "Never trust an electrician with eyebrows. Ask me how I know.", "These platform shoes? Non-conductive. Safety FIRST, baby.", "If it's stupid but it works... it's still a code violation."],
  hold: ["Save it for later. That's what the junction box is for.", "Holdin' that one in my tool belt."],
  perfect: ["Spotless panel! The inspector just cried!"],
  pause: ["Taking a union break, huh?", "Five minutes. Then back to the FUNK."],
  victory: ["Merry Christmas, baby! The whole block is LIT!"],
};
const Pappa = {
  pose: 'idle', poseT: 0, poseDur: 0, text: '', textT: 0, textDur: 0, recent: {}, lastTalk: -99, banterAt: 30,
  setPose(p, dur = 2) { this.pose = p; this.poseT = 0; this.poseDur = dur; },
  line(cat) { const L = LINES[cat]; if (!L) return cat; const r = this.recent[cat] || []; let pool = L.filter(x => !r.includes(x)); if (!pool.length) pool = L; const s = pick(pool); r.push(s); if (r.length > Math.min(4, L.length - 1)) r.shift(); this.recent[cat] = r; return s; },
  say(cat, pose, voice, dur) { const text = this.line(cat); this.text = text; this.textT = 0; this.textDur = dur || clamp(1.6 + text.length * 0.055, 2.2, 5); this.lastTalk = T; if (pose) this.setPose(pose, Math.max(1.6, this.textDur * 0.8)); if (voice) SFX.voice(voice); hitA('say_' + cat); return text; },
  react(kind, n) {
    const busy = T - this.lastTalk < 1.2;
    if (kind === 'clear') {
      if (n >= 4) return this.say('quad', 'split', 'hyeah');
      if (n === 3) return this.say('triple', 'spin', 'yow');
      if (n === 2) return chance(0.8) || !busy ? this.say('double', 'point', 'uhuh') : null;
      if (!busy && chance(0.55)) return this.say('single', pick(['groove', 'point', 'slide']), chance(0.6) ? 'huh' : null);
      this.setPose(pick(['groove', 'point']), 1.6); return null;
    }
    if (kind === 'b2b') return this.say('b2b', 'split', 'hyeah');
    if (kind === 'combo') { if (!busy) return this.say('combo', 'slide', 'huh'); return null; }
    if (kind === 'danger') return this.say('danger', 'sweat', 'whoa');
    if (kind === 'over') return this.say('over', 'shock', 'ow', 4);
    if (kind === 'done') return this.say('done', 'celebrate', pick(['hyeah', 'getup']));
    if (kind === 'banter') return this.say('banter', 'idle', 'heh');
    if (kind === 'hold') { if (!busy && chance(0.12)) return this.say('hold', null, null); return null; }
    if (kind === 'perfect') return this.say('perfect', 'celebrate', 'hyeah');
  },
  update(dt) {
    this.poseT += dt; if (this.poseDur > 0 && this.poseT > this.poseDur) { this.pose = this.pose === 'shock' ? 'sad' : 'idle'; this.poseT = 0; this.poseDur = this.pose === 'sad' ? 99 : 0; }
    if (this.text) { this.textT += dt; if (this.textT > this.textDur) this.text = ''; }
  },
  get talking() { return !!this.text && this.textT < this.textDur - 0.4; },
  reset() { this.pose = 'idle'; this.poseT = 0; this.poseDur = 0; this.text = ''; }
};
// speech bubble (canvas) — box rect + tail target
function drawBubble(x, y, w, h, text, tx, ty, alpha = 1, px = 11) {
  if (!text || alpha <= 0.01) return;
  const lines = wrapLines(text, px, w - 14); let fs = px; let ls = lines; if (ls.length * fs * 1.2 > h - 8) { fs = px * 0.86; ls = wrapLines(text, fs, w - 12); }
  const bh = Math.min(h, ls.length * fs * 1.22 + 12), by = y + (h - bh) / 2;
  g.save(); g.globalAlpha = alpha;
  const p = rrPath(x, by, w, bh, 9); g.fillStyle = 'rgba(14,4,22,0.92)'; g.fill(p);
  if (tx != null) { const cx = clamp(tx, x + 14, x + w - 14), cy = ty < by ? by : by + bh; g.beginPath(); g.moveTo(cx - 7, cy); g.lineTo(tx, ty); g.lineTo(cx + 7, cy); g.closePath(); g.fill(); g.strokeStyle = '#ffe23a'; g.lineWidth = 1.5; g.stroke(); }
  tubeLite(p, '#ffe23a', 1.4, 0.9);
  ls.forEach((ln, i) => hudText(ln, x + w / 2, by + 6 + fs * 0.6 + i * fs * 1.22, fs, '#ffffff', 'center', '#ff2bd6'));
  g.restore();
}
