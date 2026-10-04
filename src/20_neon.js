/* ===================== NEON: glowing tubes, stroke font, glow sprites, backdrop ===================== */
// --- neon tube stroke: dark glass tube + layered additive glow + hot white core
function tube(path, color, w, I = 1, opt) {
  const c = g; c.lineCap = 'round'; c.lineJoin = 'round';
  const ga = c.globalAlpha;
  if (!opt || !opt.noBase) { c.strokeStyle = shade(color, -0.74); c.lineWidth = w; c.stroke(path); }
  if (I > 0.01) {
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = color;
    c.globalAlpha = ga * 0.06 * I; c.lineWidth = w * 9; c.stroke(path);
    c.globalAlpha = ga * 0.13 * I; c.lineWidth = w * 4.6; c.stroke(path);
    c.globalAlpha = ga * 0.34 * I; c.lineWidth = w * 2.3; c.stroke(path);
    c.globalAlpha = ga * Math.min(1, 0.35 + 0.65 * I); c.lineWidth = w; c.stroke(path);
    c.globalAlpha = ga * 0.85 * Math.min(1, I); c.strokeStyle = shade(color, 0.72); c.lineWidth = w * 0.42; c.stroke(path);
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga;
  }
}
// cheaper glow (3 layers) for big/many paths
function tubeLite(path, color, w, I = 1) {
  const c = g, ga = c.globalAlpha; c.lineCap = 'round'; c.lineJoin = 'round';
  c.strokeStyle = shade(color, -0.74); c.lineWidth = w; c.stroke(path);
  if (I > 0.01) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = color; c.globalAlpha = ga * 0.16 * I; c.lineWidth = w * 4; c.stroke(path); c.globalAlpha = ga * Math.min(1, 0.4 + 0.6 * I); c.lineWidth = w; c.stroke(path); c.globalAlpha = ga * 0.8 * I; c.strokeStyle = shade(color, 0.7); c.lineWidth = w * 0.4; c.stroke(path); c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga; }
}
// glowing fill (for shapes that should be solid light)
function glowFill(path, color, I = 1, a = 1) {
  const c = g, ga = c.globalAlpha; c.globalCompositeOperation = 'lighter'; c.fillStyle = color; c.globalAlpha = ga * a * I; c.fill(path); c.globalCompositeOperation = 'source-over'; c.globalAlpha = ga;
}
function P2(fn) { const p = new Path2D(); fn(p); return p; }
function rrPath(x, y, w, h, r) { const p = new Path2D(); r = Math.min(r, w / 2, h / 2); p.moveTo(x + r, y); p.arcTo(x + w, y, x + w, y + h, r); p.arcTo(x + w, y + h, x, y + h, r); p.arcTo(x, y + h, x, y, r); p.arcTo(x, y, x + w, y, r); p.closePath(); return p; }
function circPath(x, y, r) { const p = new Path2D(); p.arc(x, y, r, 0, TAU); return p; }
function starPath(x, y, r1, r2, n = 5, rot = -Math.PI / 2) { const p = new Path2D(); for (let i = 0; i < n * 2; i++) { const r = i % 2 ? r2 : r1, a = rot + i * Math.PI / n; i ? p.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r) : p.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } p.closePath(); return p; }
function boltPath(x, y, s) { const p = new Path2D(); const pts = [[0.15, -1], [-0.45, 0.1], [0.02, 0.1], [-0.2, 1], [0.5, -0.2], [0.04, -0.2], [0.3, -1]]; pts.forEach(([a, b], i) => i ? p.lineTo(x + a * s, y + b * s) : p.moveTo(x + a * s, y + b * s)); p.closePath(); return p; }

/* ---- glow sprites (radial light blobs) ---- */
const _gs = new Map();
function glowSprite(color) {
  let s = _gs.get(color); if (s) return s; s = document.createElement('canvas'); s.width = s.height = 64; const c = s.getContext('2d');
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.12, rgba(color, 0.95)); gr.addColorStop(0.35, rgba(color, 0.35)); gr.addColorStop(1, rgba(color, 0));
  c.fillStyle = gr; c.fillRect(0, 0, 64, 64); _gs.set(color, s); return s;
}
const _gsoft = new Map();
function softSprite(color) {
  let s = _gsoft.get(color); if (s) return s; s = document.createElement('canvas'); s.width = s.height = 64; const c = s.getContext('2d');
  const gr = c.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, rgba(color, 0.9)); gr.addColorStop(0.4, rgba(color, 0.35)); gr.addColorStop(1, rgba(color, 0));
  c.fillStyle = gr; c.fillRect(0, 0, 64, 64); _gsoft.set(color, s); return s;
}
function dot(x, y, r, color, a = 1, soft = false) { if (a <= 0.01) return; const ga = g.globalAlpha; g.globalCompositeOperation = 'lighter'; g.globalAlpha = ga * Math.min(1, a); g.drawImage(soft ? softSprite(color) : glowSprite(color), x - r, y - r, r * 2, r * 2); g.globalAlpha = ga; g.globalCompositeOperation = 'source-over'; }

/* ---- neon stroke font (single-line tube letters, drawn in code) ---- */
const GLYPHS = {
  A: [4, 'M0 6L2 0L4 6M0.7 4L3.3 4'], B: [4, 'M0 6L0 0L2.4 0Q4 0 4 1.5Q4 3 2.4 3L0 3M2.4 3Q4 3 4 4.5Q4 6 2.4 6L0 6'], C: [4, 'M4 1Q3.2 0 2 0Q0 0 0 3Q0 6 2 6Q3.2 6 4 5'],
  D: [4, 'M0 0L0 6L1.8 6Q4 6 4 3Q4 0 1.8 0Z'], E: [3.6, 'M3.6 0L0 0L0 6L3.6 6M0 3L2.8 3'], F: [3.6, 'M3.6 0L0 0L0 6M0 3L2.8 3'],
  G: [4, 'M4 1Q3.2 0 2 0Q0 0 0 3Q0 6 2 6Q4 6 4 3.6L2.3 3.6'], H: [4, 'M0 0L0 6M4 0L4 6M0 3L4 3'], I: [2, 'M0 0L2 0M1 0L1 6M0 6L2 6'],
  J: [3.6, 'M3.6 0L3.6 4.4Q3.6 6 1.8 6Q0 6 0 4.4'], K: [4, 'M0 0L0 6M4 0L0 3.6M1.3 2.6L4 6'], L: [3.4, 'M0 0L0 6L3.4 6'],
  M: [5, 'M0 6L0 0L2.5 4L5 0L5 6'], N: [4, 'M0 6L0 0L4 6L4 0'], O: [4, 'M2 0Q0 0 0 3Q0 6 2 6Q4 6 4 3Q4 0 2 0Z'],
  P: [4, 'M0 6L0 0L2.4 0Q4 0 4 1.6Q4 3.2 2.4 3.2L0 3.2'], Q: [4, 'M2 0Q0 0 0 3Q0 6 2 6Q4 6 4 3Q4 0 2 0ZM2.6 4.6L4.2 6.3'],
  R: [4, 'M0 6L0 0L2.4 0Q4 0 4 1.6Q4 3.2 2.4 3.2L0 3.2M2.2 3.2L4 6'], S: [4, 'M4 1Q3.4 0 2 0Q0 0 0 1.5Q0 3 2 3Q4 3 4 4.5Q4 6 2 6Q0.6 6 0 5'],
  T: [4, 'M0 0L4 0M2 0L2 6'], U: [4, 'M0 0L0 4Q0 6 2 6Q4 6 4 4L4 0'], V: [4, 'M0 0L2 6L4 0'], W: [5.4, 'M0 0L1.3 6L2.7 2L4.1 6L5.4 0'],
  X: [4, 'M0 0L4 6M4 0L0 6'], Y: [4, 'M0 0L2 3L4 0M2 3L2 6'], Z: [4, 'M0 0L4 0L0 6L4 6'],
  0: [3.6, 'M1.8 0Q0 0 0 3Q0 6 1.8 6Q3.6 6 3.6 3Q3.6 0 1.8 0Z'], 1: [2.4, 'M0 1.2L1.4 0L1.4 6'], 2: [3.6, 'M0 1.3Q0.5 0 1.8 0Q3.6 0 3.6 1.8Q3.6 3 0 6L3.6 6'],
  3: [3.6, 'M0 0.8Q0.7 0 1.8 0Q3.6 0 3.6 1.5Q3.6 3 1.6 3Q3.6 3 3.6 4.5Q3.6 6 1.8 6Q0.7 6 0 5.2'], 4: [3.8, 'M2.8 6L2.8 0L0 4.2L3.8 4.2'],
  5: [3.6, 'M3.6 0L0.4 0L0 2.8Q0.9 2.3 1.8 2.3Q3.6 2.3 3.6 4.2Q3.6 6 1.8 6Q0.6 6 0 5.2'], 6: [3.6, 'M3.3 0.6Q2.8 0 1.8 0Q0 0 0 3.5Q0 6 1.8 6Q3.6 6 3.6 4.2Q3.6 2.5 1.8 2.5Q0.5 2.5 0 3.6'],
  7: [3.6, 'M0 0L3.6 0L1.3 6'], 8: [3.6, 'M1.8 3Q0.2 3 0.2 1.5Q0.2 0 1.8 0Q3.4 0 3.4 1.5Q3.4 3 1.8 3Q0 3 0 4.5Q0 6 1.8 6Q3.6 6 3.6 4.5Q3.6 3 1.8 3Z'],
  9: [3.6, 'M0.3 5.4Q0.8 6 1.8 6Q3.6 6 3.6 2.5Q3.6 0 1.8 0Q0 0 0 1.8Q0 3.5 1.8 3.5Q3.1 3.5 3.6 2.4'],
  "'": [0.8, 'M0.5 0L0.3 1.6'], '!': [0.8, 'M0.4 0L0.4 4.2M0.4 5.7L0.4 6'], '?': [3.6, 'M0 1.2Q0.4 0 1.8 0Q3.6 0 3.6 1.6Q3.6 2.8 1.8 3.4L1.8 4.4M1.8 5.7L1.8 6'],
  '-': [3, 'M0.3 3.2L2.7 3.2'], '.': [0.8, 'M0.4 5.7L0.4 6'], ',': [0.8, 'M0.5 5.6L0.2 6.8'], ':': [0.8, 'M0.4 1.8L0.4 2.1M0.4 5.7L0.4 6'], '/': [3, 'M3 0L0 6'],
  '+': [3.6, 'M1.8 1.4L1.8 4.6M0.2 3L3.4 3'], '&': [4, 'M4 6L0.8 2Q0.3 1.3 0.6 0.6Q1 0 1.8 0Q2.8 0 2.8 1Q2.8 2 1.6 2.8Q0 3.8 0 4.6Q0 6 1.8 6Q3 6 4 3.8'],
  '#': [4, 'M1.3 0.5L0.8 5.5M3.2 0.5L2.7 5.5M0 2L4 2M0 4L4 4'], ' ': [2.2, ''], '*': [4, 'M2 0.6L2 5.4M0 1.8L4 4.2M4 1.8L0 4.2'],
};
const GCMD = {};
for (const ch in GLYPHS) { const src = GLYPHS[ch][1], cmds = []; const re = /([MLQZ])([^MLQZ]*)/g; let m; while ((m = re.exec(src))) cmds.push([m[1], ...m[2].trim().split(/[\s,]+/).filter(Boolean).map(Number)]); GCMD[ch] = cmds; }
const TRACK = 1.05;
function textW(str, h) { const s = h / 6; let w = 0; for (const ch of str) { const gl = GLYPHS[ch] || GLYPHS[ch.toUpperCase()] || GLYPHS['?']; w += gl[0] + TRACK; } return Math.max(0, w - TRACK) * s; }
const _tp = new Map();
function textPath(str, x, y, h, align = 'center', slant = 0) {
  str = String(str).toUpperCase(); const key = str + '|' + x.toFixed(1) + '|' + y.toFixed(1) + '|' + h.toFixed(2) + '|' + align + '|' + slant; let r = _tp.get(key); if (r) return r;
  const s = h / 6, w = textW(str, h); let cx = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x; const y0 = y - h / 2; const p = new Path2D();
  const X = (a, b) => cx + a * s + (6 - b) * s * slant, Y = b => y0 + b * s;
  for (const ch of str) {
    const gl = GLYPHS[ch] || GLYPHS['?'], cmds = GCMD[GLYPHS[ch] ? ch : '?'];
    for (const c of cmds) { if (c[0] === 'M') p.moveTo(X(c[1], c[2]), Y(c[2])); else if (c[0] === 'L') p.lineTo(X(c[1], c[2]), Y(c[2])); else if (c[0] === 'Q') p.quadraticCurveTo(X(c[1], c[2]), Y(c[2]), X(c[3], c[4]), Y(c[4])); else if (c[0] === 'Z') p.closePath(); }
    cx += (gl[0] + TRACK) * s;
  }
  r = { p, w }; if (_tp.size > 600) _tp.clear(); _tp.set(key, r); return r;
}
// neon tube text; y = vertical centre
function neonText(str, x, y, h, color, I = 1, o = {}) { const tp = textPath(str, x, y, h, o.align || 'center', o.slant || 0); (o.lite ? tubeLite : tube)(tp.p, color, o.w || h * 0.12, I, o); return tp.w; }
// multi-colour (per letter) neon text
function neonTextRainbow(str, x, y, h, colors, I = 1, o = {}) {
  const w = textW(str, h); let cx = (o.align || 'center') === 'center' ? x - w / 2 : x; const s = h / 6; let i = 0;
  for (const ch of String(str).toUpperCase()) { const gl = GLYPHS[ch] || GLYPHS['?']; if (ch !== ' ') { const Ii = typeof I === 'function' ? I(i) : I; neonText(ch, cx, y, h, colors[i % colors.length], Ii, { align: 'left', w: o.w || h * 0.12, slant: o.slant || 0 }); i++; } cx += (gl[0] + TRACK) * s; }
  return w;
}
// plain HUD text with glow (canvas font, for long sentences)
function hudText(str, x, y, px, color, align = 'center', glow = color, weight = 'bold') {
  g.font = `${weight} ${px}px 'Trebuchet MS','Avenir Next',Verdana,Arial,sans-serif`; g.textAlign = align; g.textBaseline = 'middle';
  g.shadowColor = glow; g.shadowBlur = px * 0.6; g.fillStyle = color; g.fillText(str, x, y); g.shadowBlur = 0;
}
function wrapLines(str, px, maxW, weight = 'bold') { g.font = `${weight} ${px}px 'Trebuchet MS','Avenir Next',Verdana,Arial,sans-serif`; const words = String(str).split(' '), out = []; let ln = ''; for (const w of words) { const t = ln ? ln + ' ' + w : w; if (g.measureText(t).width > maxW && ln) { out.push(ln); ln = w; } else ln = t; } if (ln) out.push(ln); return out; }
function groovyText(str, x, y, px, fill, outline = '#000', align = 'center') {
  g.font = `900 ${px}px 'Cooper Black','Bookman Old Style','Chalkboard SE','Arial Rounded MT Bold','Trebuchet MS',sans-serif`; g.textAlign = align; g.textBaseline = 'middle'; g.lineJoin = 'round';
  g.lineWidth = px * 0.16; g.strokeStyle = outline; g.strokeText(str, x, y); g.fillStyle = fill; g.fillText(str, x, y);
}

/* ---- flicker helper: neon that occasionally stutters ---- */
function flick(seed, rate = 0.04) { const k = Math.sin(seed * 12.9898 + Math.floor(T * 14) * 78.233) * 43758.5453; const r = k - Math.floor(k); return r < rate ? 0.25 + r * 4 : 1; }

/* ---- backdrop: brick wall + neon wash + 70s sunburst ---- */
let BG = null, BGkey = '';
function buildBG() {
  const key = cv.width + 'x' + cv.height; if (BG && BGkey === key) return; BGkey = key;
  BG = document.createElement('canvas'); BG.width = cv.width; BG.height = cv.height; const c = BG.getContext('2d'), W = BG.width, H = BG.height;
  c.fillStyle = '#060308'; c.fillRect(0, 0, W, H);
  const bh = Math.max(14, Math.min(W, H) / 26), bw = bh * 2.3, m = Math.max(1.5, bh * 0.1);
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  for (let r = 0, y = 0; y < H; r++, y += bh) for (let x = (r % 2 ? -bw / 2 : 0); x < W; x += bw) {
    const v = rnd(), l = 5 + v * 5; c.fillStyle = `hsl(${340 + rnd() * 20},${30 + rnd() * 20}%,${l}%)`; c.fillRect(x + m / 2, y + m / 2, bw - m, bh - m);
    c.fillStyle = 'rgba(255,255,255,0.025)'; c.fillRect(x + m / 2, y + m / 2, bw - m, m);
    if (rnd() < 0.3) { c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + m / 2 + rnd() * bw * 0.6, y + m / 2 + rnd() * bh * 0.5, bw * 0.25, bh * 0.25); }
  }
  const vg = c.createRadialGradient(W / 2, H * 0.45, Math.min(W, H) * 0.2, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, 'rgba(0,0,0,0.25)'); vg.addColorStop(1, 'rgba(0,0,0,0.88)');
  c.fillStyle = vg; c.fillRect(0, 0, W, H);
}
const SHAG = ['#ff8a1f', '#ffc23a', '#ff2bd6', '#b44bff', '#ff3b5c'];
function sunburst(cx, cy, R, n, rot, a = 0.08, cols = SHAG) {
  g.save(); g.translate(cx, cy); g.rotate(rot); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = a0 + TAU / n * 0.5; g.fillStyle = cols[i % cols.length]; g.globalAlpha = a; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a0) * R, Math.sin(a0) * R); g.lineTo(Math.cos(a1) * R, Math.sin(a1) * R); g.closePath(); g.fill(); }
  g.restore(); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
}
function drawBackdrop(hue = NEON.pink, hue2 = NEON.cyan, burstA = 0.05) {
  buildBG(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(BG, 0, 0);
  const W = cv.width, H = cv.height, M = Math.max(W, H);
  if (burstA > 0) sunburst(W / 2, H * 0.42, M * 0.9, 18, T * 0.05, burstA);
  dot(W * 0.15, H * 0.2, M * 0.45, hue, 0.16 + 0.03 * Math.sin(T * 1.3), true); dot(W * 0.88, H * 0.75, M * 0.5, hue2, 0.13 + 0.03 * Math.sin(T * 1.1 + 2), true);
}
