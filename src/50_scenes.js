/* ===================== SCENES & MENUS ===================== */
const DEDICATION = 'Made for Kennedy, the funkiest electrician alive. Love, Anton';
/* ---------------- TITLE ---------------- */
const Title = {
  name: 'title', t: 0,
  enter() {
    this.t = 0; Music.auto = false; Music.intensity = 2; Music.bpmAdd = 0; Music.play('title'); Music.duck(1); Hum.set(0.012); Pappa.reset();
    const cont = S.unlocked > 1;
    const s = sheet(`<div class="row" style="margin-top:0">${cont ? `<button class="btn pink big" data-k="cont">▶ CONTINUE · LEVEL ${S.unlocked}</button><button class="btn" data-k="new">NEW GAME</button>` : `<button class="btn pink big" data-k="new">▶ PLAY</button>`}</div>
      <div class="row"><button class="btn gold" data-k="levels">LEVELS</button><button class="btn" data-k="help">HOW TO PLAY</button><button class="btn" data-k="opts">OPTIONS</button></div>
      <div class="small ctr" style="margin-top:6px">HIGH SCORE <b style="color:#ffe23a">${fmt(S.hi)}</b> · ${S.lit.filter(Boolean).length}/10 objects lit${S.won ? ' · 🎄 CERTIFIED FUNK ELECTRICIAN' : ''}</div>`, 'title');
    on(s, { new: () => { newGame(1); go(Play); }, cont: () => { newGame(S.unlocked); go(Play); }, levels: () => go(Levels), help: () => go(Help), opts: () => go(Options, Title) });
    this.sheet = s;
  },
  update(dt) { this.t += dt; if (this.t > 0.2 && !this.flk) { this.flk = true; SFX.flicker(); } },
  draw() {
    drawBackdrop('#ff2bd6', '#29f3ff', 0.07); scrT();
    const sh = this.sheet ? this.sheet.getBoundingClientRect() : { top: VH * 0.7 }, areaH = Math.max(120, sh.top - 8), wide = VW > areaH * 1.25;
    const tx = wide ? VW * 0.42 : VW / 2, tw = wide ? VW * 0.62 : VW * 0.9;
    const h1 = Math.min(tw / 11.6, areaH * 0.085), h2 = Math.min(tw / 13.4, areaH * 0.1);
    const y1 = Math.max(wide ? 8 : 50, areaH * 0.04) + h1 * 0.5, y2 = y1 + h1 * 0.85 + h2 * 1.05;
    sunburst(tx, y2, Math.max(VW, VH), 20, T * 0.08, 0.06);
    const lit = i => this.t > 0.25 + i * 0.07 ? flick(i * 1.3, 0.02) : (Math.random() < 0.3 ? 0.3 : 0);
    neonText("PAPPA KENNEDY'S", tx, y1, h1, '#ff2bd6', lit(0), { w: h1 * 0.12, slant: 0.1 });
    neonTextRainbow('ELECTRIC WORKS', tx, y2, h2, ['#29f3ff', '#ffe23a', '#46ff74', '#ff8a1f', '#ff3b5c', '#b44bff', '#29f3ff', '#ffe23a'], i => lit(i + 2), { w: h2 * 0.13 });
    const bw = textW('ELECTRIC WORKS', h2); tube(boltPath(tx - bw / 2 - h2 * 0.55, y2, h2 * 0.6), '#ffe23a', h2 * 0.08, lit(1)); tube(boltPath(tx + bw / 2 + h2 * 0.55, y2, h2 * 0.6), '#ffe23a', h2 * 0.08, lit(1));
    const subY = y2 + h2 * 0.9; hudText('A FUNKY NEON WIRING PUZZLE', tx, subY, clamp(h1 * 0.42, 9, 16), '#ffe9fb', 'center', '#ff2bd6');
    // Pappa grooving
    const pTop = wide ? areaH * 0.12 : subY + 14, pBot = areaH - 18, ph = clamp(pBot - pTop, 60, 420), px = wide ? VW * 0.82 : VW / 2;
    if (!wide) sunburst(px, pBot - ph * 0.55, ph * 0.9, 16, -T * 0.2, 0.08, ['#ffc23a', '#ff8a1f', '#ff2bd6']);
    drawPappa(px, pBot, ph, { pose: 'title', t: this.t, glow: '#b44bff' });
    if (!wide) { const d1 = VW * 0.2, d2 = VW * 0.8; drawObject(2, d1, pBot - ph * 0.62, Math.min(ph * 0.42, VW * 0.3), { p: 1, on: 1, t: T, seed: 3 }); drawObject(1, d2, pBot - ph * 0.42, Math.min(ph * 0.5, VW * 0.3), { p: 1, on: 1, t: T, seed: 2 }); }
    else { drawObject(2, VW * 0.12, areaH * 0.62, Math.min(areaH * 0.42, VW * 0.16), { p: 1, on: 1, t: T, seed: 3 }); drawObject(1, VW * 0.62, areaH * 0.72, Math.min(areaH * 0.42, VW * 0.14), { p: 1, on: 1, t: T, seed: 2 }); }
    hudText(DEDICATION, VW / 2, areaH - 4, clamp(VW * 0.026, 9, 13), '#ffd4f6', 'center', '#b44bff', 'italic bold');
  }
};
/* ---------------- LEVEL SELECT ---------------- */
function renderThumb(cvs, i, lit) {
  const c = cvs.getContext('2d'), n = cvs.width; const og = g; g = c;
  try { c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = '#050208'; c.fillRect(0, 0, n, n); drawObject(i, n / 2, n / 2, n * 0.8, { p: lit ? 1 : 0, on: lit ? 1 : 0, t: 2 + i, seed: i }); } finally { g = og; }
}
const Levels = {
  name: 'levels',
  enter() {
    let cards = ''; for (let i = 0; i < 10; i++) { const lk = i + 1 > S.unlocked, lit = !!S.lit[i]; cards += `<div class="lv ${lk ? 'locked' : 'on'} ${lit ? 'lit' : ''}" data-l="${i + 1}"><span class="n">${i + 1}</span><canvas width="120" height="120"></canvas>${lk ? '🔒 ' : ''}${esc(OBJECTS[i].short)}<br><span class="small">${LEVELS[i].target} rows${lit ? ' · LIT ✓' : ''}</span></div>`; }
    const s = sheet(`<h2>PICK A JOB</h2><div class="small ctr">Finish a level to unlock the next one. Every level is a new funky thing to wire up.</div><div class="scroll" style="margin-top:8px"><div class="lvls">${cards}</div></div><div class="row"><button class="btn" data-k="back">◀ BACK</button></div>`, 'center gold');
    s.style.width = 'min(96vw,640px)';
    s.querySelectorAll('.lv').forEach(d => { const i = +d.dataset.l - 1; renderThumb(d.querySelector('canvas'), i, !!S.lit[i] || i + 1 <= S.unlocked && false); if (!d.classList.contains('locked')) d.addEventListener('click', e => { e.stopPropagation(); audioInit(); SFX.ui('ok'); newGame(i + 1); go(Play); }); });
    on(s, { back: () => go(Title) });
  },
  draw() { drawBackdrop('#ffe23a', '#ff2bd6', 0.05); }
};
/* ---------------- HELP ---------------- */
const Help = {
  name: 'help',
  enter() {
    const s = sheet(`<h2>HOW TO PLAY</h2><div class="scroll">
      <p>Wire pieces fall into the panel. Slide and spin them so they fill <b>complete rows</b>. Every full row sends current down the wire toward tonight's funky object. Wire enough rows (watch the glowing wire and the <b>VOLTS</b> meter) and the object <b>lights up</b>. Then it's on to the next job.</p>
      <p>10 levels, 10 different things to light, and level 10 is the big <b>Christmas tree</b>. If the stack reaches the top, the breaker trips and you got <b>shocked</b>, baby.</p>
      <h3>Touch</h3><div class="kv"><b>◀ ▶</b><span>move (hold to slide)</span><b>↺ ↻</b><span>rotate left / right</span><b>SOFT</b><span>drop faster (hold)</span><b>DROP</b><span>slam it down</span><b>HOLD</b><span>stash the piece for later</span><b>Gestures</b><span>on the panel: drag to move, tap to rotate, flick down to drop, flick up to hold</span></div>
      <h3>Keyboard</h3><div class="kv"><b><span class="key">←</span><span class="key">→</span></b><span>move</span><b><span class="key">↓</span></b><span>soft drop</span><b><span class="key">SPACE</span></b><span>hard drop</span><b><span class="key">↑</span><span class="key">X</span></b><span>rotate right</span><b><span class="key">Z</span><span class="key">CTRL</span></b><span>rotate left</span><b><span class="key">C</span><span class="key">SHIFT</span></b><span>hold</span><b><span class="key">P</span><span class="key">ESC</span></b><span>pause</span><b><span class="key">M</span></b><span>mute</span></div>
      <h3>Scoring</h3><p class="small">1 row 100 · 2 rows 300 · 3 rows 500 · 4 rows (a FULL CIRCUIT) 800, all × level. Back-to-back full circuits ×1.5, combos add bonus, soft drop +1 and hard drop +2 per cell, and every lit object pays 1000 × level.</p>
      </div><div class="row"><button class="btn pink" data-k="back">GOT IT ▶</button></div>`, 'center cyan');
    on(s, { back: () => go(Title) });
  },
  draw() { drawBackdrop('#29f3ff', '#ff2bd6', 0.05); }
};
/* ---------------- OPTIONS (shared) ---------------- */
function optionsHTML() {
  return `<div class="sl"><span>Music</span><input type="range" min="0" max="100" value="${Math.round(S.musicVol * 100)}" data-o="musicVol"><span class="v">${Math.round(S.musicVol * 100)}</span></div>
  <div class="sl"><span>Sound FX</span><input type="range" min="0" max="100" value="${Math.round(S.sfxVol * 100)}" data-o="sfxVol"><span class="v">${Math.round(S.sfxVol * 100)}</span></div>
  <label class="tog"><input type="checkbox" data-t="mute" ${S.mute ? 'checked' : ''}> Mute everything</label>
  <label class="tog"><input type="checkbox" data-t="gestures" ${S.gestures ? 'checked' : ''}> Swipe / tap gestures on the panel</label>
  <label class="tog"><input type="checkbox" data-t="ghost" ${S.ghost ? 'checked' : ''}> Ghost piece (landing preview)</label>
  <label class="tog"><input type="checkbox" data-t="shake" ${S.shake ? 'checked' : ''}> Screen shake</label>
  <div class="small">Now playing: <span id="np">${esc(Music.cur ? Music.cur.name : '—')}</span></div>`;
}
function bindOptions(s) {
  s.querySelectorAll('input[type=range]').forEach(r => { const f = () => { S[r.dataset.o] = r.value / 100; r.nextElementSibling.textContent = r.value; applyVol(); save(); }; r.addEventListener('input', f); r.addEventListener('change', () => { f(); if (r.dataset.o === 'sfxVol') SFX.clear(1); }); });
  s.querySelectorAll('input[type=checkbox]').forEach(c => c.addEventListener('change', () => { S[c.dataset.t] = c.checked; save(); applyVol(); syncMuteBtn(); }));
}
const Options = {
  name: 'options', back: null,
  enter(back) { this.back = back || Title; const s = sheet(`<h2>OPTIONS</h2><div class="scroll">${optionsHTML()}<div class="row"><button class="btn" data-k="track">NEXT TRACK ♫</button><button class="btn dim" data-k="reset">RESET SAVE</button></div></div><div class="row"><button class="btn pink" data-k="back">◀ BACK</button></div>`, 'center cyan'); bindOptions(s);
    on(s, { back: () => go(this.back), track: () => { const ids = Object.keys(TRACKS); const i = ids.indexOf(Music.name); Music.play(ids[(i + 1) % ids.length]); setTimeout(() => { const n = $('#np'); if (n) n.textContent = Music.cur.name; }, 50); }, reset: b => { if (b.dataset.sure) { localStorage.removeItem(SAVE_KEY); location.reload(); } else { b.dataset.sure = 1; b.textContent = 'TAP AGAIN TO ERASE'; } } }); },
  draw() { drawBackdrop('#29f3ff', '#b44bff', 0.05); }
};
/* ---------------- PLAY ---------------- */
const Play = {
  name: 'play',
  enter() { Hum.set(0.006); },
  update(dt) { gameUpdate(dt); if (!G.paused) { FX.update(dt); Pappa.update(dt); } },
  draw() { drawPlay(); },
  exit() { releaseAllInput(); TC.releaseAll(); Music.auto = false; Hum.buzz = 0; if (G) G.paused = false; Music.setPaused(false); }
};
const Pause = {
  sheet: null,
  open() {
    if (scene !== Play || !G || G.paused || G.phase === 'over') return; G.paused = true; releaseAllInput(); TC.releaseAll(); Music.setPaused(true); SFX.ui('ok'); hitA('pause');
    const s = sheet(`<h2>PAUSED</h2><div class="quote">"${esc(Pappa.line('pause'))}"</div><div class="scroll">${optionsHTML()}</div>
      <div class="row"><button class="btn pink big" data-k="resume">▶ RESUME</button></div><div class="row"><button class="btn" data-k="restart">RESTART LEVEL</button><button class="btn" data-k="track">NEXT TRACK ♫</button><button class="btn gold" data-k="quit">MENU</button></div>`, 'center');
    bindOptions(s); this.sheet = s;
    on(s, { resume: () => this.close(), restart: () => { this.close(true); newGame(G.level); go(Play); }, quit: () => { this.close(true); S.hi = Math.max(S.hi, G.score); save(); go(Title); }, track: () => { Music.next(); setTimeout(() => { const n = $('#np'); if (n) n.textContent = TRACKS[Music.pending || Music.name].name; }, 30); } });
    TC.sync();
  },
  close(silent) { if (this.sheet) { this.sheet.remove(); this.sheet = null; } if (G) G.paused = false; Music.setPaused(false); if (!silent) hitA('resume'); TC.sync(); },
  toggle() { if (G && G.paused) this.close(); else this.open(); }
};
function showGameOver() {
  const lv = G.level, s = sheet(`<h2>YOU GOT SHOCKED!</h2><div class="quote">"${esc(Pappa.text || 'You got shocked, baby!')}"<br><span class="small">: Pappa Kennedy</span></div>
    <div class="score">${fmt(G.score)}</div><div class="small ctr">${G.newHi ? '★ NEW HIGH SCORE! ★' : 'HIGH SCORE ' + fmt(S.hi)} · Level ${lv} · ${G.totalLines} rows wired</div>
    <div class="row"><button class="btn pink big" data-k="retry">⚡ TRY LEVEL ${lv} AGAIN</button></div><div class="row"><button class="btn gold" data-k="levels">LEVELS</button><button class="btn" data-k="menu">MENU</button></div>`, 'center red');
  on(s, { retry: () => { newGame(lv); go(Play); }, levels: () => go(Levels), menu: () => go(Title) }); TC.sync(); hitA('gameOverSheet');
}
/* ---------------- VICTORY ---------------- */
const Victory = {
  name: 'victory', t: 0,
  enter() {
    this.t = 0; Music.auto = false; Music.intensity = 3; Music.play('holiday'); Music.duck(1);
    const sc = G ? G.score : 0, prev = S.hi; S.hi = Math.max(S.hi, sc); save(); Pappa.say('victory', 'celebrate', 'hyeah', 6);
    const s = sheet(`<h2>MERRY FUNKMAS!</h2><div class="quote">All ten jobs wired and lit. Pappa Kennedy says you're a certified FUNK ELECTRICIAN, baby!</div>
      <div class="score">${fmt(sc)}</div><div class="small ctr">${sc >= prev && sc > 0 ? '★ NEW HIGH SCORE! ★' : 'HIGH SCORE ' + fmt(S.hi)}</div>
      <div class="row"><button class="btn pink" data-k="again">PLAY AGAIN</button><button class="btn gold" data-k="levels">LEVELS</button><button class="btn" data-k="menu">MENU</button></div>`, 'gold');
    on(s, { again: () => { newGame(1); go(Play); }, levels: () => go(Levels), menu: () => go(Title) }); this.sheet = s; hitA('victory');
  },
  update(dt) { this.t += dt; Pappa.update(dt); if (Math.random() < dt * 3) { this.fw = this.fw || []; this.fw.push({ x: rand(0.1, 0.9), y: rand(0.08, 0.4), t: 0, c: pick(RAINBOW) }); } if (this.fw) { this.fw.forEach(f => f.t += dt); this.fw = this.fw.filter(f => f.t < 1.2); } },
  draw() {
    drawBackdrop('#46ff74', '#ff3b5c', 0.08); scrT();
    const sh = this.sheet ? this.sheet.getBoundingClientRect() : { top: VH * 0.7 }, areaH = Math.max(140, sh.top - 6), wide = VW > areaH * 1.3;
    for (const f of this.fw || []) { const r = easeOut(f.t / 1.2) * Math.min(VW, VH) * 0.14; for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; dot(f.x * VW + Math.cos(a) * r, f.y * areaH + Math.sin(a) * r, 5, f.c, 1 - f.t / 1.2); } }
    const tfs = Math.min(clamp(VW / 13, 14, 40), (VW - 130) / textW('MERRY FUNKMAS!', 1)), tY = Math.max(20 + tfs * 0.3, areaH * 0.06), tTop = tY + tfs * 1.15, tBot = areaH - 18;
    const ts = Math.min((tBot - tTop) * 1.02, wide ? VW * 0.45 : VW * 0.95), tx = wide ? VW * 0.4 : VW / 2, tcy = (tTop + tBot) / 2;
    sunburst(tx, tcy, Math.max(VW, VH), 24, T * 0.2, 0.08, ['#46ff74', '#ff3b5c', '#ffe23a']);
    drawObject(9, tx, tcy, ts, { p: 1, on: 1, t: T, seed: 10 });
    const ph = wide ? areaH * 0.7 : areaH * 0.38; drawPappa(wide ? VW * 0.8 : VW * 0.82, areaH - 4, ph, { pose: 'celebrate', t: this.t, talk: Pappa.talking, glow: '#46ff74' });
    neonTextRainbow('MERRY FUNKMAS!', VW / 2, tY, tfs, ['#ff3b5c', '#46ff74', '#ffe23a', '#29f3ff', '#ff2bd6'], 1, { w: tfs * 0.13 });
    hudText('🎄 ' + DEDICATION, VW / 2, areaH - 6, clamp(VW * 0.025, 9, 13), '#ffd4f6', 'center', '#46ff74', 'italic bold');
  }
};
