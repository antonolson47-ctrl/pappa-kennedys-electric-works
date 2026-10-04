/* ===================== GAME ENGINE: wire pieces, rotation w/ kicks, hold, lock delay, levels ===================== */
const COLS = 10, VROWS = 20, HID = 2, NR = VROWS + HID;
const PIECES = 'IOTSZJL';
const PCOL = ['#29f3ff', '#ffe23a', '#c056ff', '#46ff74', '#ff3b5c', '#3f7dff', '#ff8a1f']; // I O T S Z J L
const PNAME = { I: 'LONG CONDUIT', O: 'JUNCTION BOX', T: 'T-SPLICE', S: 'S-BEND', Z: 'Z-BEND', J: 'J-HOOK', L: 'L-ELBOW' };
const BASE = { I: [[0, 1], [1, 1], [2, 1], [3, 1]], O: [[1, 0], [2, 0], [1, 1], [2, 1]], T: [[1, 0], [0, 1], [1, 1], [2, 1]], S: [[1, 0], [2, 0], [0, 1], [1, 1]], Z: [[0, 0], [1, 0], [1, 1], [2, 1]], J: [[0, 0], [0, 1], [1, 1], [2, 1]], L: [[2, 0], [0, 1], [1, 1], [2, 1]] };
const SHAPES = {}, MASKS = {};
for (const t of PIECES) {
  const n = t === 'I' || t === 'O' ? 4 : 3; SHAPES[t] = []; MASKS[t] = [];
  let cur = BASE[t];
  for (let r = 0; r < 4; r++) {
    SHAPES[t].push(cur);
    MASKS[t].push(cur.map(([x, y]) => (cur.some(c => c[0] === x && c[1] === y - 1) ? 1 : 0) | (cur.some(c => c[0] === x + 1 && c[1] === y) ? 2 : 0) | (cur.some(c => c[0] === x && c[1] === y + 1) ? 4 : 0) | (cur.some(c => c[0] === x - 1 && c[1] === y) ? 8 : 0)));
    if (t !== 'O') cur = cur.map(([x, y]) => [n - 1 - y, x]);
  }
}
// SRS kick tables (x right, y UP as in the standard tables; converted when applied)
const KICK_JLSTZ = { '0>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '1>0': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '1>2': [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]], '2>1': [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]], '2>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]], '3>2': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '3>0': [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]], '0>3': [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]] };
const KICK_I = { '0>1': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '1>0': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '1>2': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]], '2>1': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '2>3': [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]], '3>2': [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]], '3>0': [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]], '0>3': [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]] };
const LEVELS = [6, 8, 10, 10, 12, 12, 14, 14, 16, 18].map((target, i) => ({ target, obj: i }));
const LOCK_DELAY = 0.5, LOCK_MOVES = 15, DAS = 0.16, ARR = 0.045;
function gravInt() { const p = G ? clamp(G.lines / G.target, 0, 1) : 0; return 0.9 * Math.pow(0.86, G.level - 1) * (1 - 0.18 * p); }
let G = null;
function emptyBoard() { const b = []; for (let y = 0; y < NR; y++) b.push(new Array(COLS).fill(0)); return b; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function newGame(level) {
  G = { level, score: 0, totalLines: 0, startLevel: level, paused: false, time: 0, shake: 0, maxCombo: 0, quads: 0 };
  S.plays++; save(); startLevel(level);
}
function startLevel(level) {
  Object.assign(G, { level, lines: 0, target: LEVELS[level - 1].target, board: emptyBoard(), bag: [], queue: [], hold: null, canHold: true, combo: -1, b2b: false, cur: null, phase: 'intro', phaseT: 0, meter: 0, danger: false, dangerSaid: -99, fallT: 0, lockT: 0, lockMoves: 0, lowest: 0, inp: { dir: 0, dasT: 0, arrT: 0, soft: false, left: false, right: false }, clearRows: [], overShown: false, connectDone: false, lit: 0, levelTime: 0, lastBanter: T });
  refill(); FX.reset(); Pappa.reset();
  Pappa.text = OBJECTS[level - 1].intro; Pappa.textT = 0; Pappa.textDur = 4.2; Pappa.lastTalk = T; Pappa.setPose('point', 2.5);
  Music.intensity = level >= 8 ? 3 : level >= 5 ? 2 : 1; Music.bpmAdd = (level - 1) * 0.8; Music.auto = true;
  Music.queue(level === 10 ? 'holiday' : GAME_TRACKS[(level - 1) % GAME_TRACKS.length]); Music.duck(1);
  SFX.levelStart(); hitA('level_' + level);
}
function beginPlay() { if (G.phase !== 'intro') return; G.phase = 'play'; G.phaseT = 0; spawn(); hitA('beginPlay'); }
function refill() { while (G.queue.length < 5) { if (!G.bag.length) G.bag = shuffle(PIECES.split('')); G.queue.push(G.bag.pop()); } }
function fits(t, r, x, y) { const sh = SHAPES[t][r]; for (let i = 0; i < 4; i++) { const X = x + sh[i][0], Y = y + sh[i][1]; if (X < 0 || X >= COLS || Y >= NR) return false; if (Y >= 0 && G.board[Y][X]) return false; } return true; }
function spawn(t) {
  t = t || G.queue.shift(); refill();
  const p = { t, r: 0, x: 3, y: 0 };
  if (!fits(p.t, p.r, p.x, p.y)) { G.cur = p; gameOver(); return false; }
  if (fits(p.t, p.r, p.x, p.y + 1)) p.y++;
  G.cur = p; G.lockT = 0; G.lockMoves = 0; G.lowest = p.y; G.fallT = 0; G.lastRot = false;
  // immediate DAS carry-over
  return true;
}
function onGround() { const c = G.cur; return c && !fits(c.t, c.r, c.x, c.y + 1); }
function moved() { if (onGround()) { if (G.lockMoves < LOCK_MOVES) { G.lockT = 0; G.lockMoves++; } } }
function move(dx, auto) { const c = G.cur; if (!c) return false; if (fits(c.t, c.r, c.x + dx, c.y)) { c.x += dx; G.lastRot = false; moved(); SFX.move(); return true; } return false; }
function rotate(dir) {
  const c = G.cur; if (!c) return false;
  if (c.t === 'O') { SFX.rotate(dir); hitA('rot_' + dir); return true; }
  const to = (c.r + dir + 4) % 4, tbl = (c.t === 'I' ? KICK_I : KICK_JLSTZ)[c.r + '>' + to];
  for (const [kx, ky] of tbl) { if (fits(c.t, to, c.x + kx, c.y - ky)) { c.x += kx; c.y -= ky; c.r = to; G.lastRot = true; if (c.y > G.lowest) { G.lowest = c.y; G.lockMoves = 0; } moved(); SFX.rotate(dir); hitA('rot_' + dir); return true; } }
  hitA('rotFail'); return false;
}
function ghostY() { const c = G.cur; let y = c.y; while (fits(c.t, c.r, c.x, y + 1)) y++; return y; }
function hardDrop() {
  const c = G.cur; if (!c) return; const y0 = c.y, y = ghostY(); const n = y - y0; c.y = y; G.score += 2 * n;
  FX.hardDrop(c, n); SFX.hard(n); G.shake = Math.max(G.shake, S.shake ? 2.5 : 0); hitA('hardDrop'); lockPiece();
}
function lockPiece() {
  const c = G.cur; if (!c) return; const sh = SHAPES[c.t][c.r], mk = MASKS[c.t][c.r], ci = PIECES.indexOf(c.t); let above = true;
  for (let i = 0; i < 4; i++) { const X = c.x + sh[i][0], Y = c.y + sh[i][1]; if (Y >= 0) G.board[Y][X] = (ci + 1) | (mk[i] << 4); if (Y >= HID) above = false; }
  G.cur = null; G.canHold = true; SFX.lock(); FX.lock(c); hitA('lock');
  if (above) { gameOver(); return; }
  const rows = []; for (let y = 0; y < NR; y++) if (G.board[y].every(v => v)) rows.push(y);
  if (rows.length) {
    const n = rows.length; let pts = [0, 100, 300, 500, 800][n] * G.level, b2b = false;
    if (n === 4) { if (G.b2b) { pts = Math.floor(pts * 1.5); b2b = true; } G.b2b = true; G.quads++; } else G.b2b = false;
    G.combo++; if (G.combo > 0) pts += 50 * G.combo * G.level; G.maxCombo = Math.max(G.maxCombo, G.combo);
    G.score += pts; G.phase = 'clear'; G.phaseT = 0; G.clearRows = rows; G.lastClear = { n, pts, b2b, combo: G.combo };
    SFX.clear(n); FX.clear(rows, n, pts, b2b, G.combo); G.shake = S.shake ? (n >= 4 ? 9 : n * 2) : 0;
    if (b2b) Pappa.react('b2b'); else if (G.combo >= 2 && n < 3) Pappa.react('combo'); else Pappa.react('clear', n);
    hitA('clear_' + n);
  } else { G.combo = -1; spawn(); }
}
function finishClear() {
  const rows = G.clearRows, n = rows.length, b = G.board;
  for (const y of rows) { if (y > 0) for (let x = 0; x < COLS; x++) if (b[y - 1][x]) b[y - 1][x] &= ~(4 << 4); if (y < NR - 1) for (let x = 0; x < COLS; x++) if (b[y + 1][x]) b[y + 1][x] &= ~(1 << 4); }
  for (const y of rows.slice().sort((a, c) => c - a)) b.splice(y, 1);
  for (let i = 0; i < n; i++) b.unshift(new Array(COLS).fill(0));
  G.clearRows = []; G.lines += n; G.totalLines += n; G.phase = 'play'; G.phaseT = 0;
  if (b.every(r => r.every(v => !v))) { G.score += 2000 * G.level; FX.text('SPOTLESS PANEL!', '#ffffff', 16); Pappa.react('perfect'); }
  if (G.lines >= G.target) { levelComplete(); return; }
  spawn();
}
function holdPiece() {
  const c = G.cur; if (!c || !G.canHold) { hitA('holdDenied'); return false; }
  const t = c.t; G.cur = null;
  if (G.hold) { const h = G.hold; G.hold = t; spawn(h); } else { G.hold = t; spawn(); }
  G.canHold = false; SFX.hold(); Pappa.react('hold'); hitA('hold'); return true;
}
function levelComplete() {
  G.phase = 'connect'; G.phaseT = 0; G.cur = null; G.lines = Math.max(G.lines, G.target);
  const bonus = 1000 * G.level; G.score += bonus; G.bonus = bonus;
  S.lit[G.level - 1] = true; S.unlocked = Math.max(S.unlocked, Math.min(10, G.level + 1)); S.hi = Math.max(S.hi, G.score); S.hiLines = Math.max(S.hiLines, G.totalLines); if (G.level === 10) S.won++; save();
  SFX.breaker(); Pappa.react('done'); Music.duck(0.45); Hum.buzz = 0; hitA('levelComplete_' + G.level);
}
function connectDone() {
  if (G.connectDone) return; G.connectDone = true;
  if (G.level >= 10) { go(Victory); return; }
  startLevel(G.level + 1);
}
function gameOver() {
  G.phase = 'over'; G.phaseT = 0; const prevHi = S.hi; S.hi = Math.max(S.hi, G.score); S.hiLines = Math.max(S.hiLines, G.totalLines); G.newHi = G.score > prevHi && G.score > 0; save();
  SFX.over(); Pappa.react('over'); Music.duck(0.15, 0.4); Hum.buzz = 0; G.shake = S.shake ? 10 : 0; hitA('gameOver');
}
function stackTop() { for (let y = 0; y < NR; y++) if (G.board[y].some(v => v)) return y; return NR; }
// ---- input ----
function press(a) {
  hitA('press_' + a); if (!G || scene !== Play) return;
  if (G.paused) return;
  if (G.phase === 'intro') { if (G.phaseT > 0.35) beginPlay(); return; }
  if (G.phase === 'connect') { if (G.phaseT > 2.4) connectDone(); return; }
  if (G.phase !== 'play' || !G.cur) { if (a === 'left' || a === 'right') { G.inp[a] = true; G.inp.dir = a === 'left' ? -1 : 1; G.inp.dasT = 0; } if (a === 'soft') G.inp.soft = true; return; }
  switch (a) {
    case 'left': case 'right': { const d = a === 'left' ? -1 : 1; G.inp[a] = true; G.inp.dir = d; G.inp.dasT = 0; G.inp.arrT = 0; move(d); break; }
    case 'soft': G.inp.soft = true; softStep(); break;
    case 'hard': hardDrop(); break;
    case 'cw': rotate(1); break;
    case 'ccw': rotate(-1); break;
    case 'hold': holdPiece(); break;
  }
}
function release(a) {
  if (!G) return;
  if (a === 'left' || a === 'right') { G.inp[a] = false; const o = a === 'left' ? 'right' : 'left'; if (G.inp[o]) { G.inp.dir = o === 'left' ? -1 : 1; G.inp.dasT = 0; } else G.inp.dir = 0; }
  if (a === 'soft') G.inp.soft = false;
}
function releaseAllInput() { if (G && G.inp) Object.assign(G.inp, { dir: 0, soft: false, left: false, right: false }); }
function gameUpdate(dt) {
  if (!G || G.paused) return;
  G.phaseT += dt; G.time += dt; G.shake = Math.max(0, G.shake - dt * 30);
  G.meter = approach(G.meter, clamp(G.lines / G.target, 0, 1), dt * 5);
  if (G.phase === 'intro') { if (G.phaseT > 3.2) beginPlay(); return; }
  if (G.phase === 'clear') { if (G.phaseT >= 0.34) finishClear(); return; }
  if (G.phase === 'connect') { G.lit = G.phaseT; if (G.phaseT > 0.55 && !G.lightsSfx) { G.lightsSfx = true; SFX.lightsOn(); } if (G.phaseT > 6.5) connectDone(); return; }
  G.lightsSfx = false;
  if (G.phase === 'over') { if (G.phaseT > 1.9 && !G.overShown) { G.overShown = true; showGameOver(); } return; }
  if (G.phase !== 'play') return;
  G.levelTime += dt;
  if (!G.cur) return;
  const c = G.cur, I = G.inp;
  if (I.dir) { I.dasT += dt; if (I.dasT > DAS) { I.arrT += dt; let n = 0; while (I.arrT > ARR && n++ < 10) { I.arrT -= ARR; if (!move(I.dir, true)) { I.arrT = 0; break; } } } }
  const gi = gravInt(), iv = I.soft ? Math.min(gi, 0.032) : gi;
  G.fallT += dt; let steps = 0;
  while (G.fallT >= iv && steps++ < 25) { G.fallT -= iv; if (fits(c.t, c.r, c.x, c.y + 1)) { c.y++; if (I.soft) { G.score += 1; SFX.soft(); } if (c.y > G.lowest) { G.lowest = c.y; G.lockMoves = 0; } G.lockT = 0; } else { G.fallT = 0; break; } }
  if (onGround()) { G.lockT += dt; if (G.lockT >= LOCK_DELAY) lockPiece(); }
  if (!G.cur) return;
  // danger + banter
  const top = stackTop(), dg = top < HID + 5; if (dg !== G.danger) { G.danger = dg; if (dg && T - G.dangerSaid > 12) { G.dangerSaid = T; Pappa.react('danger'); SFX.danger(); } }
  Hum.buzz = G.danger ? 0.05 : 0;
  if (T - Pappa.lastTalk > 26 && T - G.lastBanter > 26) { G.lastBanter = T; Pappa.react('banter'); }
}
