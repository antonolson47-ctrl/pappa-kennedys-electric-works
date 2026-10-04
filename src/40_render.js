/* ===================== RENDER: layout, wire-piece sprites, board, HUD, meter, FX, overlays ===================== */
const LAY = {
  portrait: { name: 'portrait', LW: 360, LH: 446, board: { x: 6, y: 6, c: 20 }, hold: { x: 214, y: 6, w: 64, h: 60 }, next: { x: 284, y: 6, w: 70, h: 150 }, stats: { x: 214, y: 70, w: 64, h: 86 },
    obj: { x: 214, y: 160, w: 140, h: 142, cx: 284, cy: 212, s: 92 }, wire: [[206, 292], [222, 292], [222, 278], [284, 278], [284, 260]], gauge: { x: 330, y: 291, r: 14 },
    mascot: { x: 214, y: 306, w: 140, h: 100, fx: 284, fy: 403, h2: 96 }, bubble: { x: 6, y: 410, w: 348, h: 32, tx: 300, ty: 404 } },
  land: { name: 'land', LW: 600, LH: 420, board: { x: 200, y: 10, c: 20 }, hold: { x: 8, y: 10, w: 86, h: 74 }, stats: { x: 100, y: 10, w: 92, h: 120 },
    mascot: { x: 8, y: 136, w: 184, h: 274, fx: 100, fy: 404, h2: 178 }, bubble: { x: 12, y: 140, w: 176, h: 62, tx: 100, ty: 214 },
    next: { x: 408, y: 10, w: 184, h: 76 }, obj: { x: 408, y: 92, w: 184, h: 318, cx: 500, cy: 186, s: 150 }, wire: [[400, 396], [420, 396], [420, 296], [500, 296], [500, 262]], gauge: { x: 548, y: 352, r: 28 } },
};
let L = { mode: 'desktop', lay: LAY.land, k: 1, ox: 0, oy: 0 };
function gameT(dx = 0, dy = 0) { g.setTransform(DPR * L.k, 0, 0, DPR * L.k, DPR * (L.ox + dx * L.k), DPR * (L.oy + dy * L.k)); }
function scrT() { g.setTransform(DPR, 0, 0, DPR, 0, 0); }
/* ---- wire-piece cell sprites (pre-rendered with real shadowBlur glow) ---- */
const SPR = new Map();
function cellSprite(ci, mask, px, kind) {
  const key = px + '|' + ci + '|' + mask + '|' + kind; let s = SPR.get(key); if (s) return s; if (SPR.size > 1200) SPR.clear();
  const pad = Math.ceil(px * 0.45), W = px + pad * 2; s = document.createElement('canvas'); s.width = s.height = W; const c = s.getContext('2d'); c.translate(pad, pad);
  const col = kind === 2 ? '#5a5f70' : PCOL[ci], S0 = px, r = S0 * 0.2, m = S0 / 2;
  const box = rrPath(S0 * 0.07, S0 * 0.07, S0 * 0.86, S0 * 0.86, r);
  if (kind === 1) { c.fillStyle = rgba(col, 0.08); c.fill(box); c.setLineDash([S0 * 0.16, S0 * 0.12]); c.strokeStyle = rgba(col, 0.6); c.lineWidth = Math.max(1, S0 * 0.06); c.shadowColor = col; c.shadowBlur = S0 * 0.2; c.stroke(box); s.pad = pad; SPR.set(key, s); return s; }
  c.fillStyle = shade(col, -0.84); c.fill(box);
  c.fillStyle = rgba(col, kind === 2 ? 0.05 : 0.12); c.fill(rrPath(S0 * 0.13, S0 * 0.12, S0 * 0.74, S0 * 0.28, r * 0.6));
  c.shadowColor = col; c.shadowBlur = kind === 2 ? 0 : S0 * 0.3; c.strokeStyle = rgba(col, 0.92); c.lineWidth = Math.max(1, S0 * 0.065); c.stroke(box);
  const dirs = [[m, -S0 * 0.02], [S0 * 1.02, m], [m, S0 * 1.02], [-S0 * 0.02, m]]; c.lineCap = 'round';
  if (mask) {
    c.beginPath(); for (let i = 0; i < 4; i++) if (mask & (1 << i)) { c.moveTo(m, m); c.lineTo(dirs[i][0], dirs[i][1]); }
    c.shadowBlur = kind === 2 ? 0 : S0 * 0.5; c.strokeStyle = col; c.lineWidth = S0 * 0.25; c.stroke();
    c.shadowBlur = 0; c.strokeStyle = kind === 2 ? 'rgba(200,200,210,0.4)' : 'rgba(255,255,255,0.88)'; c.lineWidth = S0 * 0.085; c.stroke();
  }
  c.shadowBlur = kind === 2 ? 0 : S0 * 0.4; c.fillStyle = col; c.beginPath(); c.arc(m, m, S0 * (mask ? 0.16 : 0.2), 0, TAU); c.fill();
  c.shadowBlur = 0; c.fillStyle = kind === 2 ? '#888' : '#fff'; c.beginPath(); c.arc(m, m, S0 * 0.065, 0, TAU); c.fill();
  if (!mask) { c.strokeStyle = shade(col, -0.55); c.lineWidth = S0 * 0.06; c.beginPath(); c.moveTo(m - S0 * 0.12, m + S0 * 0.12); c.lineTo(m + S0 * 0.12, m - S0 * 0.12); c.stroke(); }
  // corner screws (junction box look)
  c.fillStyle = rgba(col, 0.55); for (const [a, b] of [[0.2, 0.2], [0.8, 0.2], [0.2, 0.8], [0.8, 0.8]]) { c.beginPath(); c.arc(S0 * a, S0 * b, S0 * 0.035, 0, TAU); c.fill(); }
  s.pad = pad; SPR.set(key, s); return s;
}
function drawCell(ci, mask, x, y, c, kind = 0, alpha = 1) {
  const px = Math.max(4, Math.round(c * L.k * DPR)), s = cellSprite(ci, mask, px, kind), sc = c / px, pad = s.pad * sc;
  if (alpha !== 1) g.globalAlpha = alpha; g.drawImage(s, x - pad, y - pad, c + 2 * pad, c + 2 * pad); if (alpha !== 1) g.globalAlpha = 1;
}
function drawMini(t, cx, cy, c, alpha = 1) {
  if (!t) return; const sh = SHAPES[t][0], mk = MASKS[t][0]; let x0 = 9, x1 = -9, y0 = 9, y1 = -9; for (const [x, y] of sh) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const ox = cx - (x1 - x0 + 1) * c / 2, oy = cy - (y1 - y0 + 1) * c / 2, ci = PIECES.indexOf(t);
  sh.forEach(([x, y], i) => drawCell(ci, mk[i], ox + (x - x0) * c, oy + (y - y0) * c, c, 0, alpha));
}
function panel(r, label, col = '#29f3ff', I = 0.75) {
  const p = rrPath(r.x, r.y, r.w, r.h, 8); g.fillStyle = 'rgba(6,3,14,0.78)'; g.fill(p); tubeLite(p, col, 1.3, I);
  if (label) { const lh = Math.min(8, r.h * 0.12); g.fillStyle = 'rgba(6,3,14,1)'; const w = textW(label, lh) + 8; g.fillRect(r.x + r.w / 2 - w / 2, r.y - lh / 2 - 1, w, lh + 2); neonText(label, r.x + r.w / 2, r.y, lh, col, 0.95, { lite: true, w: 1.1 }); }
}
/* ---- particles & floating text ---- */
const FX = {
  parts: [], texts: [],
  reset() { this.parts.length = 0; this.texts.length = 0; },
  spark(x, y, n, col, spd = 140, life = 0.6, up = 1) { for (let i = 0; i < n; i++) { const a = rand(0, TAU), v = rand(0.3, 1) * spd; this.parts.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - up * spd * 0.4, l: life * rand(0.6, 1.2), m: life, c: col, s: rand(0.8, 1.8) }); } if (this.parts.length > 700) this.parts.splice(0, this.parts.length - 700); },
  cellXY(x, y) { const B = L.lay.board; return [B.x + (x + 0.5) * B.c, B.y + (y - HID + 0.5) * B.c]; },
  clear(rows, n, pts, b2b, combo) {
    for (const y of rows) for (let x = 0; x < COLS; x++) { const v = G.board[y][x], [px, py] = this.cellXY(x, y); this.spark(px, py, 2 + n, v ? PCOL[(v & 15) - 1] : '#fff', 120 + n * 40, 0.7); if (x % 3 === 0) this.spark(px, py, 2, '#ffffff', 260, 0.4); }
    const lbl = ['', 'SPLICE!', 'DOUBLE TAP!', '3-PHASE!', 'FULL CIRCUIT!'][n];
    this.text(lbl, ['', '#29f3ff', '#46ff74', '#ffe23a', '#ff2bd6'][n], n >= 4 ? 17 : 12 + n, -14);
    this.text('+' + fmt(pts), '#ffffff', 10, 6);
    if (b2b) this.text('BACK-TO-BACK!', '#ff8a1f', 11, 24); else if (combo > 0) this.text('COMBO x' + (combo + 1), '#ff8a1f', 10, 24);
    // electrons racing down the wire
    this.surge = 1;
  },
  hardDrop(c, n) { const B = L.lay.board, sh = SHAPES[c.t][c.r]; const col = PCOL[PIECES.indexOf(c.t)]; for (const [x, y] of sh) { const [px, py] = this.cellXY(c.x + x, c.y + y); this.parts.push({ trail: true, x: px, y: py, h: Math.min(n, 8) * B.c, l: 0.25, m: 0.25, c: col }); } for (const [x, y] of sh) { const [px, py] = this.cellXY(c.x + x, c.y + y); this.spark(px, py + B.c * 0.5, 2, col, 90, 0.4, 1); } },
  lock(c) { const sh = SHAPES[c.t][c.r]; const col = PCOL[PIECES.indexOf(c.t)]; const [x, y] = sh[irand(0, 3)]; const [px, py] = this.cellXY(c.x + x, c.y + y); this.spark(px, py, 3, col, 60, 0.3, 0.5); },
  text(s, c, h, dy = 0) { this.texts.push({ s, c, h, t: 0, dy }); if (this.texts.length > 8) this.texts.shift(); },
  update(dt) {
    for (const p of this.parts) { p.l -= dt; if (!p.trail) { p.vy += 380 * dt; p.vx *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt; } }
    this.parts = this.parts.filter(p => p.l > 0); for (const t of this.texts) t.t += dt; this.texts = this.texts.filter(t => t.t < 1.4); this.surge = Math.max(0, (this.surge || 0) - dt * 1.5);
  },
  draw() {
    g.globalCompositeOperation = 'lighter'; g.lineCap = 'round';
    for (const p of this.parts) {
      const a = clamp(p.l / p.m, 0, 1);
      if (p.trail) { const gr = g.createLinearGradient(p.x, p.y - p.h, p.x, p.y); gr.addColorStop(0, rgba(p.c, 0)); gr.addColorStop(1, rgba(p.c, 0.5 * a)); g.fillStyle = gr; g.fillRect(p.x - 8, p.y - p.h, 16, p.h); continue; }
      g.strokeStyle = p.c; g.globalAlpha = a; g.lineWidth = p.s; g.beginPath(); g.moveTo(p.x, p.y); g.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); g.stroke();
    }
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    for (const p of this.parts) if (!p.trail && p.s > 1.5) dot(p.x, p.y, 4, p.c, clamp(p.l / p.m, 0, 1) * 0.7);
    const B = L.lay.board, cx = B.x + COLS * B.c / 2, cy = B.y + VROWS * B.c * 0.42;
    for (const t of this.texts) { const k = t.t / 1.4, s = t.t < 0.15 ? easeBack(t.t / 0.15) : 1; g.globalAlpha = k > 0.7 ? (1 - k) / 0.3 : 1; neonText(t.s, cx, cy + t.dy - k * 26, t.h * s, t.c, 1, { w: Math.max(1.4, t.h * 0.13) }); g.globalAlpha = 1; }
  }
};
/* ---- wire meter + gauge ---- */
function polyLen(pts) { let L0 = 0; for (let i = 1; i < pts.length; i++) L0 += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return L0; }
function polyAt(pts, d) { for (let i = 1; i < pts.length; i++) { const sl = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); if (d <= sl) { const u = d / (sl || 1); return [lerp(pts[i - 1][0], pts[i][0], u), lerp(pts[i - 1][1], pts[i][1], u), i]; } d -= sl; } const l = pts[pts.length - 1]; return [l[0], l[1], pts.length - 1]; }
function drawWire(lay, frac, col, surge) {
  const pts = lay.wire, tot = polyLen(pts), full = new Path2D(); pts.forEach(([x, y], i) => i ? full.lineTo(x, y) : full.moveTo(x, y));
  g.strokeStyle = '#1a1020'; g.lineWidth = 6; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(full);
  tube(full, col, 2.6, 0);
  if (frac > 0.002) {
    const d = tot * clamp(frac, 0, 1), [ex, ey, seg] = polyAt(pts, d), lit = new Path2D(); lit.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < seg; i++) lit.lineTo(pts[i][0], pts[i][1]); lit.lineTo(ex, ey);
    tube(lit, col, 2.6, 0.85 + 0.15 * Math.sin(T * 20) + surge * 0.5, { noBase: true });
    const n = Math.max(2, Math.floor(d / 14)); for (let i = 0; i < n; i++) { const u = ((T * (0.9 + surge * 3) + i / n) % 1) * d, [px, py] = polyAt(pts, u); dot(px, py, 3.2, '#ffffff', 0.8); }
    if (frac < 0.999) { dot(ex, ey, 9 + Math.random() * 5, col, 0.9); dot(ex, ey, 4, '#ffffff', 1); if (Math.random() < 0.3) FX.spark(ex, ey, 1, '#ffffff', 60, 0.25); }
  }
  // breaker box at the source
  const [sx, sy] = pts[0]; g.fillStyle = '#120a18'; const bb = rrPath(sx - 6, sy - 9, 12, 18, 2); g.fill(bb); tubeLite(bb, '#c8d6e8', 1, 0.6); g.fillStyle = frac >= 0.999 ? '#46ff74' : '#ff3b5c'; g.fillRect(sx - 2, sy - 5, 4, 6);
}
function drawGauge(G0, frac) {
  const { x, y, r } = G0; g.fillStyle = 'rgba(6,3,14,0.9)'; g.beginPath(); g.arc(x, y, r + 3, Math.PI, 0); g.closePath(); g.fill();
  const a0 = Math.PI * 1.05, a1 = Math.PI * 1.95;
  [['#46ff74', 0, 0.5], ['#ffe23a', 0.5, 0.8], ['#ff3b5c', 0.8, 1]].forEach(([c, u0, u1]) => { const p = new Path2D(); p.arc(x, y, r, lerp(a0, a1, u0), lerp(a0, a1, u1)); tubeLite(p, c, Math.max(1.2, r * 0.09), 0.85); });
  const tk = new Path2D(); for (let i = 0; i <= 10; i++) { const a = lerp(a0, a1, i / 10), r0 = r * (i % 5 ? 0.8 : 0.7); tk.moveTo(x + Math.cos(a) * r0, y + Math.sin(a) * r0); tk.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); } g.strokeStyle = '#c8d6e8'; g.lineWidth = 0.8; g.stroke(tk);
  const na = lerp(a0, a1, clamp(frac + Math.sin(T * 23) * 0.012 * (frac > 0 ? 1 : 0), 0, 1)), np = new Path2D(); np.moveTo(x, y); np.lineTo(x + Math.cos(na) * r * 0.92, y + Math.sin(na) * r * 0.92); tube(np, '#ffffff', Math.max(1, r * 0.07), 1);
  g.fillStyle = '#ff2bd6'; g.beginPath(); g.arc(x, y, Math.max(1.5, r * 0.12), 0, TAU); g.fill();
  neonText('VOLTS', x, y + r * 0.32, Math.max(4, r * 0.24), '#ffe23a', 0.8, { lite: true, w: 0.8 });
}
/* ---- the playfield ---- */
function drawBoard(lay) {
  const B = lay.board, c = B.c, W = COLS * c, H = VROWS * c, ph = G.phase;
  g.fillStyle = 'rgba(4,2,10,0.88)'; g.fillRect(B.x, B.y, W, H);
  g.strokeStyle = 'rgba(140,70,220,0.12)'; g.lineWidth = 0.6; g.beginPath(); for (let x = 1; x < COLS; x++) { g.moveTo(B.x + x * c, B.y); g.lineTo(B.x + x * c, B.y + H); } for (let y = 1; y < VROWS; y++) { g.moveTo(B.x, B.y + y * c); g.lineTo(B.x + W, B.y + y * c); } g.stroke();
  if (G.danger && ph === 'play') { g.fillStyle = `rgba(255,40,60,${0.06 + 0.05 * Math.sin(T * 9)})`; g.fillRect(B.x, B.y, W, c * 5); }
  g.save(); g.beginPath(); g.rect(B.x - 2, B.y - 2, W + 4, H + 4); g.clip();
  const clearing = ph === 'clear' ? G.clearRows : null, ck = ph === 'clear' ? clamp(G.phaseT / 0.34, 0, 1) : 0;
  const dead = ph === 'over' ? Math.floor(G.phaseT * 16) : -1;
  for (let y = HID; y < NR; y++) {
    const row = G.board[y], py = B.y + (y - HID) * c, isClr = clearing && clearing.includes(y);
    for (let x = 0; x < COLS; x++) {
      const v = row[x]; if (!v) continue; const px = B.x + x * c;
      if (isClr) { if (Math.abs(x - 4.5) < ck * 6) continue; drawCell((v & 15) - 1, v >> 4, px, py, c, 0); continue; }
      drawCell((v & 15) - 1, v >> 4, px, py, c, dead >= 0 && NR - 1 - y < dead ? 2 : 0);
    }
    if (isClr) { g.globalCompositeOperation = 'lighter'; g.fillStyle = `rgba(255,255,255,${0.75 * (1 - ck)})`; g.fillRect(B.x, py, W, c); g.globalCompositeOperation = 'source-over'; const ar = new Path2D(); let ax = B.x; ar.moveTo(ax, py + c / 2); while (ax < B.x + W) { ax += rand(6, 14); ar.lineTo(ax, py + c / 2 + rand(-c * 0.45, c * 0.45)); } tube(ar, pick(['#29f3ff', '#ffffff', '#ffe23a']), 1.4, 1, { noBase: true }); }
  }
  const cur = G.cur;
  if (cur && ph === 'play') {
    const sh = SHAPES[cur.t][cur.r], mk = MASKS[cur.t][cur.r], ci = PIECES.indexOf(cur.t);
    if (S.ghost) { const gy = ghostY(); if (gy !== cur.y) for (const [x, y] of sh) if (gy + y >= HID) drawCell(ci, 0, B.x + (cur.x + x) * c, B.y + (gy + y - HID) * c, c, 1); }
    const lockA = onGround() ? 0.75 + 0.25 * Math.cos(G.lockT * 25) : 1;
    sh.forEach(([x, y], i) => { if (cur.y + y >= HID) drawCell(ci, mk[i], B.x + (cur.x + x) * c, B.y + (cur.y + y - HID) * c, c, 0, lockA); });
  }
  g.restore();
  const dk = G.danger && ph === 'play' ? 0.5 + 0.5 * Math.sin(T * 10) : 0;
  tube(rrPath(B.x - 3, B.y - 3, W + 6, H + 6, 6), dk > 0 ? (dk > 0.5 ? '#ff3b5c' : '#ff2bd6') : '#ff2bd6', 2, 0.85 * flick(3, 0.015));
}
function statBlock(r, rows) { const lh = Math.min(7, (r.h - 10) / (rows.length * 4.05)), vh = lh * 1.35; let y = r.y + 7 + lh / 2; for (const [lab, val, col] of rows) { neonText(lab, r.x + r.w / 2, y, lh, '#c8b8e8', 0.6, { lite: true, w: 0.8 }); y += lh * 0.9 + vh * 0.7; neonText(String(val), r.x + r.w / 2, y, vh, col, 1, { lite: true, w: Math.max(1, vh * 0.13) }); y += vh * 0.8 + lh * 1.1; } }
function drawPlay() {
  const lay = L.lay, ob = OBJECTS[G.level - 1];
  drawBackdrop(ob.color, ob.color2, 0.035);
  const sh = G.shake > 0.1 ? [rand(-1, 1) * G.shake, rand(-1, 1) * G.shake] : [0, 0];
  gameT(sh[0], sh[1]);
  drawBoard(lay);
  // hold + next
  panel(lay.hold, 'HOLD', '#29f3ff'); const hc = Math.min(lay.hold.w / 5, lay.hold.h / 3.2); drawMini(G.hold, lay.hold.x + lay.hold.w / 2, lay.hold.y + lay.hold.h / 2 + 2, hc, G.canHold ? 1 : 0.35);
  panel(lay.next, 'NEXT', '#ff2bd6'); const N = lay.next;
  if (N.h > N.w) { const c1 = Math.min(N.w / 5, 14), c2 = c1 * 0.72; drawMini(G.queue[0], N.x + N.w / 2, N.y + 32, c1); drawMini(G.queue[1], N.x + N.w / 2, N.y + 78, c2); drawMini(G.queue[2], N.x + N.w / 2, N.y + 116, c2); }
  else { const c1 = Math.min(N.h / 3.6, 16), c2 = c1 * 0.72; drawMini(G.queue[0], N.x + N.w * 0.22, N.y + N.h / 2 + 3, c1); drawMini(G.queue[1], N.x + N.w * 0.57, N.y + N.h / 2 + 3, c2); drawMini(G.queue[2], N.x + N.w * 0.83, N.y + N.h / 2 + 3, c2); }
  // stats
  panel(lay.stats, null, '#ffe23a', 0.6);
  const rows = [['LEVEL', G.level + '/10', '#ffe23a'], ['SCORE', fmt(G.score), '#ffffff'], ['ROWS', Math.min(G.lines, G.target) + '/' + G.target, '#46ff74']]; if (lay.stats.h > 100) rows.push(['HIGH', fmt(Math.max(S.hi, G.score)), '#ff2bd6']);
  statBlock(lay.stats, rows);
  // object + wiring meter
  const O = lay.obj; panel(O, ob.short, ob.color, 0.7);
  if (G.phase !== 'connect') { g.save(); g.beginPath(); g.rect(O.x + 2, O.y + 6, O.w - 4, O.h - 8); g.clip(); drawObject(G.level - 1, O.cx, O.cy, O.s, { p: G.meter, on: 0, t: T, seed: G.level }); g.restore(); }
  drawWire(lay, G.phase === 'connect' ? 1 : G.meter, '#ffe23a', FX.surge || 0);
  drawGauge(lay.gauge, G.phase === 'connect' ? 1 : G.meter);
  // mascot + bubble
  const M = lay.mascot; drawPappa(M.fx, M.fy, M.h2, { pose: Pappa.pose, t: Pappa.poseT, talk: Pappa.talking, glow: ob.color });
  if (Pappa.text && G.phase !== 'connect') { const b = lay.bubble, a = Pappa.textT < 0.15 ? Pappa.textT / 0.15 : Pappa.textT > Pappa.textDur - 0.3 ? (Pappa.textDur - Pappa.textT) / 0.3 : 1; drawBubble(b.x, b.y, b.w, b.h, Pappa.text, b.tx, b.ty, a, lay.name === 'land' ? 11 : 10.5); }
  if (G.phase !== 'connect') FX.draw();
  if (G.phase === 'intro') drawIntro(lay, ob);
  if (G.phase === 'connect') drawConnect(lay, ob);
  if (G.phase === 'over') drawOver(lay);
}
function drawIntro(lay, ob) {
  const t = G.phaseT, a = clamp(t * 4, 0, 1), LW = lay.LW, LH = lay.LH, B = lay.board, cx = B.x + COLS * B.c / 2, cy = B.y + VROWS * B.c * 0.45;
  g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.72)'; g.fillRect(B.x, cy - 62, COLS * B.c, 124);
  tubeLite(P2(p => { p.moveTo(B.x + 6, cy - 62); p.lineTo(B.x + COLS * B.c - 6, cy - 62); p.moveTo(B.x + 6, cy + 62); p.lineTo(B.x + COLS * B.c - 6, cy + 62); }), ob.color, 1.4, 0.9);
  neonTextRainbow('LEVEL ' + G.level, cx, cy - 36, 22 * (t < 0.3 ? easeBack(t / 0.3) : 1), ['#ffe23a', '#ff8a1f', '#ff2bd6', '#29f3ff'], 1, { w: 2.6 });
  neonText(ob.short, cx, cy - 4, 12, ob.color, flick(9, 0.06), { w: 1.6 });
  hudText('Wire ' + G.target + ' rows to light it up!', cx, cy + 22, 11, '#ffffff', 'center', '#ff2bd6');
  if (t > 0.5 && Math.floor(T * 2.5) % 2 === 0) hudText(IS_TOUCH ? 'TAP ANY BUTTON TO START' : 'PRESS ANY KEY TO START', cx, cy + 44, 9, '#29f3ff', 'center', '#29f3ff');
  g.globalAlpha = 1;
}
function connectGeom(lay) {
  const LW = lay.LW, LH = lay.LH;
  if (lay.name === 'portrait') return { ox: LW / 2, oy: LH * 0.44, os: LW * 0.64, tY: 26, nY: 50, pk: [56, LH - 4, 112], bx: LW * 0.66, bY: LH - 64 };
  return { ox: LW / 2, oy: LH * 0.47, os: LH * 0.62, tY: 26, nY: 52, pk: [92, LH - 6, 190], bx: LW - 96, bY: LH - 110 };
}
function drawConnect(lay, ob) {
  const t = G.phaseT, O = lay.obj, Cg = connectGeom(lay), LW = lay.LW, LH = lay.LH;
  const z = ease((t - 0.45) / 0.6), on = t < 1.05 ? 0 : t < 1.5 ? (Math.sin(t * 70) > -0.2 ? 1 : 0.15) : 1;
  if (t < 0.6) { dot(O.cx, O.cy, O.s * (0.8 + t), '#ffffff', (0.6 - t) * 0.8); if (Math.random() < 0.6) FX.spark(O.cx + rand(-30, 30), O.cy + rand(-30, 30), 2, '#ffe23a', 160, 0.4); }
  g.fillStyle = `rgba(0,0,0,${0.82 * z})`; g.fillRect(-400, -400, LW + 800, LH + 800);
  const cx = lerp(O.cx, Cg.ox, z), cy = lerp(O.cy, Cg.oy, z), s = lerp(O.s, Cg.os, z);
  if (on > 0.5 && t > 1.05) { sunburst(cx, cy, Math.max(LW, LH) * 1.2, 24, T * 0.3, 0.09 * Math.min(1, (t - 1.05) * 2)); dot(cx, cy, s * 0.9, ob.color, 0.35, true); }
  if (t > 1.05 && t < 1.2) { g.fillStyle = `rgba(255,255,255,${(1.2 - t) / 0.15 * 0.7})`; g.fillRect(-400, -400, LW + 800, LH + 800); }
  if (t > 1.05 && !G.burst) { G.burst = true; for (let i = 0; i < 6; i++) FX.spark(cx, cy, 14, RAINBOW[i], 340, 1.1); G.shake = S.shake ? 6 : 0; }
  drawObject(G.level - 1, cx, cy, s, { p: 1, on: on, t: T, seed: G.level });
  if (t < 1.05) neonText('CONNECTED!', LW / 2, Cg.tY, 20 * (t < 0.25 ? easeBack(t / 0.25) : 1), '#ffe23a', flick(5, 0.2), { w: 2.4 });
  else {
    neonTextRainbow(G.level >= 10 ? 'MERRY FUNKMAS!' : "IT'S LIT!", LW / 2, Cg.tY, 20, ['#ff2bd6', '#ffe23a', '#29f3ff', '#46ff74', '#ff8a1f'], 1, { w: 2.4 });
    neonText(ob.name, LW / 2, Cg.nY, 10, ob.color, 1, { w: 1.4 });
    const ba = clamp((t - 1.6) * 3, 0, 1); g.globalAlpha = ba;
    neonText('+' + fmt(G.bonus) + ' BONUS', Cg.bx, Cg.bY, 10, '#ffffff', 1, { w: 1.3 });
    neonText('LEVEL ' + G.level + ' COMPLETE', Cg.bx, Cg.bY + 18, 8, '#46ff74', 1, { w: 1.1 });
    if (t > 2.4 && Math.floor(T * 2.5) % 2 === 0) hudText(IS_TOUCH ? 'TAP TO CONTINUE' : 'PRESS ANY KEY', Cg.bx, Cg.bY + 38, 10, '#29f3ff', 'center', '#29f3ff');
    g.globalAlpha = 1;
  }
  drawPappa(Cg.pk[0], Cg.pk[1], Cg.pk[2] * clamp(z * 1.2, 0, 1), { pose: t > 1.05 ? 'celebrate' : 'point', t: t, talk: Pappa.talking, glow: ob.color });
  if (Pappa.text && t > 1.2) { const b = lay.name === 'portrait' ? { x: 6, y: LH - 36, w: 220, h: 32 } : { x: 6, y: LH * 0.33, w: 176, h: 56 }; drawBubble(b.x + (lay.name === 'portrait' ? 110 : 0), b.y, b.w * (lay.name === 'portrait' ? 1 : 1), b.h, Pappa.text, null, null, 1, 11); }
  FX.draw();
}
function drawOver(lay) {
  const t = G.phaseT, B = lay.board, cx = B.x + COLS * B.c / 2, cy = B.y + VROWS * B.c * 0.4;
  if (t < 1.2 && Math.random() < 0.7) FX.spark(B.x + rand(0, COLS * B.c), B.y + rand(0, VROWS * B.c), 3, pick(['#29f3ff', '#ffffff', '#ffe23a']), 200, 0.5);
  if (t < 0.25) { g.fillStyle = `rgba(200,240,255,${(0.25 - t) * 2.4})`; g.fillRect(B.x, B.y, COLS * B.c, VROWS * B.c); }
  const a = clamp((t - 0.3) * 3, 0, 1); g.globalAlpha = a; g.fillStyle = 'rgba(0,0,0,0.6)'; g.fillRect(B.x, cy - 34, COLS * B.c, 68);
  neonText('BREAKER', cx, cy - 13, 18, '#ff3b5c', flick(2, 0.12), { w: 2.2 }); neonText('TRIPPED!', cx, cy + 13, 18, '#ff3b5c', flick(4, 0.12), { w: 2.2 }); g.globalAlpha = 1;
}
