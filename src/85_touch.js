/* ===================== LAYOUT (fit), TOUCH CONTROLS, GESTURES, KEYBOARD ===================== */
const saProbe = document.createElement('div');
saProbe.style.cssText = 'position:fixed;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';
document.body.appendChild(saProbe);
function safeInsets() { const c = getComputedStyle(saProbe); return { t: parseFloat(c.paddingTop) || 0, r: parseFloat(c.paddingRight) || 0, b: parseFloat(c.paddingBottom) || 0, l: parseFloat(c.paddingLeft) || 0 }; }
function fit() {
  const sa = safeInsets(); VW = window.innerWidth; VH = window.innerHeight; DPR = Math.min(2, window.devicePixelRatio || 1);
  const W = Math.round(VW * DPR), H = Math.round(VH * DPR); if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
  const portrait = VH > VW * 1.05, gap = 8, btn = {}; let mode, lay, k, ox, oy, pz, mz;
  if (IS_TOUCH && portrait) {
    mode = 'portrait'; lay = LAY.portrait; const aw = VW - sa.l - sa.r, ctlMin = 44 + 6 + 2 * 54 + gap + 12;
    k = Math.min(aw / lay.LW, (VH - sa.t - sa.b - ctlMin - 4) / lay.LH); ox = sa.l + (aw - lay.LW * k) / 2; oy = sa.t + 2;
    const top = oy + lay.LH * k + 4, bottom = VH - sa.b - 10, rowsTop = top + 44 + 6;
    const bh = clamp((bottom - rowsTop - gap) / 2, 48, 96), bw = clamp((aw / 2 - 14 - gap * 1.5) / 2, 48, 120);
    const y2 = bottom - bh, y1 = y2 - gap - bh, xL = sa.l + 10, xR = VW - sa.r - 10;
    Object.assign(btn, { left: [xL, y1, bw, bh], right: [xL + bw + gap, y1, bw, bh], soft: [xL, y2, bw * 2 + gap, bh], hold: [xR - 2 * bw - gap, y1, bw, bh], ccw: [xR - bw, y1, bw, bh], hard: [xR - 2 * bw - gap, y2, bw, bh], cw: [xR - bw, y2, bw, bh] });
    const py = Math.min(top, y1 - 44 - 6); pz = [VW / 2 - 50, py]; mz = [VW / 2 + 6, py];
  } else if (IS_TOUCH) {
    mode = 'landscape'; lay = LAY.land; const aw = VW - sa.l - sa.r, ah = VH - sa.t - sa.b, sideMin = 2 * 52 + gap + 18;
    k = Math.min((ah - 6) / lay.LH, (aw - 2 * sideMin) / lay.LW); ox = sa.l + (aw - lay.LW * k) / 2; oy = sa.t + (ah - lay.LH * k) / 2;
    const wL = ox - 8 - (sa.l + 8), wR = VW - sa.r - 8 - (ox + lay.LW * k + 8);
    const bw = clamp((Math.min(wL, wR) - gap) / 2, 48, 92), bottom = VH - sa.b - 10, top0 = sa.t + 8 + 44 + gap;
    const bh = clamp(Math.min((bottom - top0 - 2 * gap) / 3, bw * 1.15), 48, 88);
    const yS = bottom - bh, yLR = yS - gap - bh, yH = yLR - gap - bh;
    const xl0 = sa.l + 8 + (wL - (2 * bw + gap)) / 2, xr0 = ox + lay.LW * k + 8 + (wR - (2 * bw + gap)) / 2;
    Object.assign(btn, { soft: [xl0, yS, 2 * bw + gap, bh], left: [xl0, yLR, bw, bh], right: [xl0 + bw + gap, yLR, bw, bh], hold: [xl0, yH, 2 * bw + gap, bh], hard: [xr0, yS, 2 * bw + gap, bh], ccw: [xr0, yLR, bw, bh], cw: [xr0 + bw + gap, yLR, bw, bh] });
    pz = [xl0, sa.t + 8]; mz = [xr0 + 2 * bw + gap - 44, sa.t + 8];
  } else {
    mode = 'desktop'; lay = portrait ? LAY.portrait : LAY.land; k = Math.min(VW / lay.LW, VH / lay.LH) * (portrait ? 0.99 : 0.97); ox = (VW - lay.LW * k) / 2; oy = (VH - lay.LH * k) / 2;
    pz = [VW - sa.r - 104, sa.t + 8]; mz = [VW - sa.r - 52, sa.t + 8];
  }
  L = { mode, lay, k, ox, oy, btn, sa, vw: VW, vh: VH, portrait, pz, mz };
  const rs = document.documentElement.style; rs.setProperty('--fs', clamp(Math.min(VW, VH) * 0.04, 13, 20).toFixed(1) + 'px'); rs.setProperty('--shH', Math.round(VH * (portrait ? 0.5 : 0.62)) + 'px');
  document.querySelectorAll('#tc .tb').forEach(e => { const r = btn[e.dataset.a]; if (r) { e.style.left = r[0] + 'px'; e.style.top = r[1] + 'px'; e.style.width = r[2] + 'px'; e.style.height = r[3] + 'px'; e.style.fontSize = clamp(Math.min(r[2], r[3]) * 0.16, 9, 14) + 'px'; } });
  if (typeof TC !== 'undefined' && TC.built) TC.sync();
  hitA('fit');
}
let fitTimer = 0;
function refit() { fit(); clearTimeout(fitTimer); fitTimer = setTimeout(fit, 250); setTimeout(fit, 700); }
addEventListener('resize', refit); addEventListener('orientationchange', refit);
if (window.visualViewport) visualViewport.addEventListener('resize', refit);
if (screen.orientation && screen.orientation.addEventListener) screen.orientation.addEventListener('change', refit);

function setTouchMode(on) { on = !!on; if (IS_TOUCH === on) return; IS_TOUCH = on; document.body.classList.toggle('touch', on); fit(); if (TC.built) TC.sync(); hitA('touchMode_' + on); }
document.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') setTouchMode(true); }, true);
document.addEventListener('touchstart', () => setTouchMode(true), { capture: true, passive: true });
['touchend', 'pointerup', 'click', 'keydown'].forEach(ev => document.addEventListener(ev, () => { audioInit(); Music.resume(); }, { capture: true, passive: true }));
document.addEventListener('gesturestart', e => e.preventDefault()); document.addEventListener('dblclick', e => e.preventDefault());
document.addEventListener('touchmove', e => { if (!e.target.closest || !e.target.closest('.scroll,input')) e.preventDefault(); }, { passive: false });
document.addEventListener('visibilitychange', () => { if (document.hidden) { if (scene === Play) Pause.open(); if (AC) try { AC.suspend(); } catch (e) { } } else if (AC) try { AC.resume(); } catch (e) { } });
const MUTE_SVG = ['<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12"/></svg>', '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9h4l5-4v14l-5-4H4z" fill="#fff"/><path d="M16 9l6 6M22 9l-6 6"/></svg>'];
function syncMuteBtn() { $('#bMute').innerHTML = MUTE_SVG[S.mute ? 1 : 0]; }
/* ---- on-screen buttons ---- */
const TC = {
  built: false, map: new Map(), held: {},
  build() {
    document.querySelectorAll('#tc .tb').forEach(btn => {
      const a = btn.dataset.a;
      btn.addEventListener('touchstart', e => { e.preventDefault(); audioInit(); for (const t of e.changedTouches) this.map.set('t' + t.identifier, btn); this.down(btn, a); }, { passive: false });
      const up = e => { e.preventDefault(); for (const t of e.changedTouches) { const b = this.map.get('t' + t.identifier); this.map.delete('t' + t.identifier); if (b) this.up(b, b.dataset.a); } };
      btn.addEventListener('touchend', up, { passive: false }); btn.addEventListener('touchcancel', up, { passive: false });
      btn.addEventListener('mousedown', e => { e.preventDefault(); this.down(btn, a); const mu = () => { this.up(btn, a); removeEventListener('mouseup', mu); }; addEventListener('mouseup', mu); });
      btn.addEventListener('contextmenu', e => e.preventDefault());
    });
    $('#bPause').addEventListener('click', e => { e.stopPropagation(); audioInit(); Pause.toggle(); });
    $('#bMute').addEventListener('click', e => { e.stopPropagation(); audioInit(); toggleMute(); });
    syncMuteBtn(); this.built = true; this.sync();
  },
  down(btn, a) { btn.classList.add('dn'); this.held[a] = (this.held[a] || 0) + 1; hitA('tc_' + a); press(a); },
  up(btn, a) { this.held[a] = Math.max(0, (this.held[a] || 1) - 1); if (!this.held[a]) { btn.classList.remove('dn'); release(a); } },
  releaseAll() { for (const a in this.held) this.held[a] = 0; this.map.clear(); document.querySelectorAll('#tc .tb.dn').forEach(b => b.classList.remove('dn')); },
  sync() {
    const inPlay = scene === Play && G && !G.paused && G.phase !== 'over';
    $('#tc').classList.toggle('on', !!inPlay); $('#bPause').classList.toggle('hide', !inPlay);
    const bp = $('#bPause'), bm = $('#bMute'), sa = L.sa || { t: 0, r: 0 }, pz = L.pz || [0, 0], mz = inPlay ? (L.mz || [0, 0]) : [VW - sa.r - 52, sa.t + 8];
    bp.style.left = pz[0] + 'px'; bp.style.top = pz[1] + 'px'; bm.style.left = mz[0] + 'px'; bm.style.top = mz[1] + 'px';
  }
};
/* ---- gestures on the canvas (swipe/drag to move, tap to rotate, flick down to drop, flick up to hold) ---- */
const GS = { id: null };
function softStep() { const c = G && G.cur; if (c && fits(c.t, c.r, c.x, c.y + 1)) { c.y++; G.score += 1; G.fallT = 0; if (c.y > G.lowest) { G.lowest = c.y; G.lockMoves = 0; } return true; } return false; }
cv.addEventListener('pointerdown', e => {
  audioInit(); if (scene !== Play || !G || G.paused) return;
  if (G.phase === 'intro' || G.phase === 'connect') { press('tap'); return; }
  if (!S.gestures || G.phase !== 'play' || e.pointerType === 'mouse') return;
  GS.id = e.pointerId; GS.x = GS.sx = e.clientX; GS.y = GS.sy = e.clientY; GS.t = performance.now(); GS.mx = 0; GS.my = 0; GS.moved = false;
});
cv.addEventListener('pointermove', e => {
  if (GS.id !== e.pointerId || !G || G.phase !== 'play') return; const cell = L.lay.board.c * L.k * 0.9;
  const dx = e.clientX - GS.sx, dy = e.clientY - GS.sy;
  while (dx - GS.mx * cell > cell) { GS.mx++; move(1); GS.moved = true; } while (dx - GS.mx * cell < -cell) { GS.mx--; move(-1); GS.moved = true; }
  if (Math.abs(dy) > Math.abs(dx) * 1.2) while (dy - GS.my * cell > cell) { GS.my++; softStep(); GS.moved = true; }
});
const gEnd = e => {
  if (GS.id !== e.pointerId) return; GS.id = null; if (!G || G.phase !== 'play') return;
  const dt = performance.now() - GS.t, dx = e.clientX - GS.sx, dy = e.clientY - GS.sy, cell = L.lay.board.c * L.k;
  if (!GS.moved && Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300) { rotate(1); hitA('gest_tap'); }
  else if (dy > cell * 2.5 && dy / Math.max(dt, 1) > 0.9 && Math.abs(dy) > Math.abs(dx) * 1.5) { hardDrop(); hitA('gest_flick'); }
  else if (dy < -cell * 2.5 && Math.abs(dy) > Math.abs(dx) * 1.5 && dt < 400) { holdPiece(); hitA('gest_up'); }
};
cv.addEventListener('pointerup', gEnd); cv.addEventListener('pointercancel', e => { if (GS.id === e.pointerId) GS.id = null; });
/* ---- keyboard ---- */
const KEYS = { ArrowLeft: 'left', ArrowRight: 'right', ArrowDown: 'soft', ArrowUp: 'cw', KeyX: 'cw', KeyZ: 'ccw', ControlLeft: 'ccw', ControlRight: 'ccw', Space: 'hard', KeyC: 'hold', ShiftLeft: 'hold', ShiftRight: 'hold', KeyA: 'left', KeyD: 'right', KeyS: 'soft', KeyW: 'cw', KeyQ: 'ccw', KeyE: 'cw' };
addEventListener('keydown', e => {
  const a = KEYS[e.code];
  if ((a || e.code === 'Escape' || e.code === 'KeyP') && IS_TOUCH && !COARSE && !FORCE_TOUCH) setTouchMode(false);
  if (e.code === 'KeyM') { toggleMute(); return; }
  if (scene === Play && G) {
    if (e.code === 'Escape' || e.code === 'KeyP') { e.preventDefault(); if (G.phase !== 'over') Pause.toggle(); return; }
    if (G.paused || G.phase === 'over') { if (menuKey(e)) e.preventDefault(); return; }
    if (G.phase === 'intro' || G.phase === 'connect') { if (!e.repeat) press('key'); e.preventDefault(); return; }
    if (a) { e.preventDefault(); if (!e.repeat) press(a); }
    return;
  }
  if (scene && scene.key && scene.key(e)) { e.preventDefault(); return; }
  if (menuKey(e)) e.preventDefault();
});
addEventListener('keyup', e => { const a = KEYS[e.code]; if (a && scene === Play) release(a); });
addEventListener('blur', () => { if (scene === Play) { TC.releaseAll(); releaseAllInput(); } });
