/* ===================== AUDIO: 100% procedural WebAudio (no samples) ===================== */
let AC = null, BUS = {}, NZ = null;
const AUD = { counts: {}, log: [], voices: 0, cd: {} };
function aNow() { return AC ? AC.currentTime : 0; }
function hitA(n) { AUD.counts[n] = (AUD.counts[n] || 0) + 1; AUD.log.push(n); if (AUD.log.length > 300) AUD.log.shift(); }
function sfxOK(name, cd) { hitA(name); if (!AC || AC.state === 'closed' || S.mute || S.sfxVol < 0.001) return false; if (cd) { const t = aNow(); if (AUD.cd[name] != null && t - AUD.cd[name] < cd) return false; AUD.cd[name] = t; } return AUD.voices < 64; }
function mkNoise(c) {
  const len = c.sampleRate * 2, mk = () => c.createBuffer(1, len, c.sampleRate), w = mk(), p = mk(), b = mk();
  const W = w.getChannelData(0), Pn = p.getChannelData(0), B = b.getChannelData(0); let b0 = 0, b1 = 0, b2 = 0, br = 0;
  for (let i = 0; i < len; i++) { const x = Math.random() * 2 - 1; W[i] = x; b0 = .99765 * b0 + x * .099046; b1 = .963 * b1 + x * .2965164; b2 = .57 * b2 + x * 1.0526913; Pn[i] = (b0 + b1 + b2 + x * .1848) * .2; br = (br + .02 * x) / 1.02; B[i] = br * 3.5; }
  return { w, p, b };
}
function mkImpulse(c, secs) { const n = Math.floor(c.sampleRate * secs), b = c.createBuffer(2, n, c.sampleRate); for (let ch = 0; ch < 2; ch++) { const d = b.getChannelData(ch); for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / n, 3) * (i < 60 ? i / 60 : 1); } return b; }
function curve(k) { const n = 1024, c = new Float32Array(n); for (let i = 0; i < n; i++) { const x = i / (n - 1) * 2 - 1; c[i] = (1 + k) * x / (1 + k * Math.abs(x)); } return c; }
function buildGraph() {
  const c = AC, B = {};
  B.master = c.createGain(); B.master.gain.value = S.mute ? 0 : 0.9;
  B.lim = c.createDynamicsCompressor(); B.lim.threshold.value = -9; B.lim.knee.value = 4; B.lim.ratio.value = 10; B.lim.attack.value = 0.003; B.lim.release.value = 0.18;
  B.master.connect(B.lim); B.lim.connect(c.destination);
  B.rev = c.createConvolver(); B.rev.buffer = mkImpulse(c, 1.4); B.revOut = c.createGain(); B.revOut.gain.value = 0.45; B.rev.connect(B.revOut); B.revOut.connect(B.master);
  B.sfx = c.createGain(); B.sfx.gain.value = S.sfxVol; B.sfx.connect(B.master);
  B.sfxRev = c.createGain(); B.sfxRev.gain.value = 0.2; B.sfx.connect(B.sfxRev); B.sfxRev.connect(B.rev);
  B.music = c.createGain(); B.music.gain.value = S.musicVol * 0.6; B.music.connect(B.master);
  B.duck = c.createGain(); B.duck.gain.value = 1; B.duck.connect(B.music);
  B.musRev = c.createGain(); B.musRev.gain.value = 0.1; B.duck.connect(B.musRev); B.musRev.connect(B.rev);
  B.drive = curve(4); B.crunch = curve(30);
  BUS = B; NZ = mkNoise(c);
  Hum.start();
}
function audioInit() {
  if (!AC) { try { const C = window.AudioContext || window.webkitAudioContext; if (!C) return; AC = new C(); buildGraph(); hitA('audioInit'); } catch (e) { AC = null; return; } }
  if (AC.state === 'suspended' || AC.state === 'interrupted') { try { const p = AC.resume(); if (p && p.catch) p.catch(() => { }); } catch (e) { } }
}
function applyVol() { if (!AC) return; const t = AC.currentTime; BUS.master.gain.setTargetAtTime(S.mute ? 0 : 0.9, t, 0.03); BUS.sfx.gain.setTargetAtTime(S.sfxVol, t, 0.03); BUS.music.gain.setTargetAtTime(S.musicVol * 0.6, t, 0.03); }
function toggleMute() { S.mute = !S.mute; save(); applyVol(); syncMuteBtn(); hitA('mute_' + S.mute); }

/* ---- building blocks ---- */
function vEnd(node) { AUD.voices++; node.onended = () => { AUD.voices--; }; }
function env(gn, t, a, peak, d, sus = 0) { const p = gn.gain; p.setValueAtTime(0.0001, t); p.linearRampToValueAtTime(peak, t + a); p.exponentialRampToValueAtTime(Math.max(0.0001, sus || 0.0001), t + a + d); }
function thump(t, f0, f1, dur, gain, out, type = 'sine', drive = false) {
  const o = AC.createOscillator(), gn = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur * 0.8);
  env(gn, t, 0.003, gain, dur); let n = o; if (drive) { const ws = AC.createWaveShaper(); ws.curve = BUS.drive; o.connect(ws); n = ws; }
  n.connect(gn); gn.connect(out || BUS.sfx); o.start(t); o.stop(t + dur + 0.05); vEnd(o);
}
function nz(t, kind, ftype, f, q, dur, gain, out, a = 0.002, f2, crunch = false) {
  const s = AC.createBufferSource(); s.buffer = NZ[kind]; const fl = AC.createBiquadFilter(); fl.type = ftype; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur); fl.Q.value = q;
  const gn = AC.createGain(); env(gn, t, a, gain, dur); let n = s;
  if (crunch) { const ws = AC.createWaveShaper(); ws.curve = BUS.crunch; s.connect(ws); n = ws; }
  n.connect(fl); fl.connect(gn); gn.connect(out || BUS.sfx); s.start(t, Math.random() * 1.5); s.stop(t + dur + a + 0.05); vEnd(s);
}
function tone(t, f, dur, gain, type = 'sine', out, a = 0.004, f2) { const o = AC.createOscillator(), gn = AC.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + dur); env(gn, t, a, gain, dur); o.connect(gn); gn.connect(out || BUS.sfx); o.start(t); o.stop(t + dur + a + 0.05); vEnd(o); }
function swoosh(t, dur, f0, f1, gain, q = 1.4) {
  const s = AC.createBufferSource(); s.buffer = NZ.p; const fl = AC.createBiquadFilter(); fl.type = 'bandpass'; fl.Q.value = q; fl.frequency.setValueAtTime(f0, t); fl.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const gn = AC.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(gain, t + dur * 0.6); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  s.connect(fl); fl.connect(gn); gn.connect(BUS.sfx); s.start(t, Math.random()); s.stop(t + dur + 0.05); vEnd(s);
}
// formant voice syllable (sawtooth -> formant band-passes): Pappa's grunts
const VOW = { a: [800, 1200], e: [500, 1900], i: [320, 2300], o: [480, 850], u: [330, 800], ae: [700, 1700], uh: [600, 1100], eh: [580, 1800] };
function syl(t, f0, f1, dur, vow, gain, breath = 0.15, vow2) {
  const o = AC.createOscillator(); o.type = 'sawtooth'; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
  const vib = AC.createOscillator(), vg = AC.createGain(); vib.frequency.value = 6 + Math.random() * 2; vg.gain.value = f0 * 0.025; vib.connect(vg); vg.connect(o.frequency);
  const gn = AC.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(gain, t + Math.min(0.03, dur * 0.2)); gn.gain.setValueAtTime(gain, t + dur * 0.6); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  const [F1, F2] = VOW[vow] || VOW.a, V2 = VOW[vow2 || vow] || VOW.a;
  for (const [f, f2, q, k] of [[F1, V2[0], 6, 1], [F2, V2[1], 8, 0.6], [2700, 2700, 9, 0.25]]) { const b = AC.createBiquadFilter(); b.type = 'bandpass'; b.frequency.setValueAtTime(f, t); if (f2 !== f) b.frequency.linearRampToValueAtTime(f2, t + dur * 0.7); b.Q.value = q; const kg = AC.createGain(); kg.gain.value = k * 2.2; o.connect(b); b.connect(kg); kg.connect(gn); }
  gn.connect(BUS.sfx); o.start(t); vib.start(t); o.stop(t + dur + 0.05); vib.stop(t + dur + 0.05); vEnd(o);
  if (breath > 0) nz(t, 'w', 'bandpass', F2, 2, dur * 0.7, gain * breath);
}
/* ---- neon transformer hum (ambient bed + danger buzz) ---- */
const Hum = {
  g: null, lvl: 0, target: 0.0, buzz: 0,
  start() {
    if (!AC || this.g) return; const c = AC;
    const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = 120;
    const o2 = c.createOscillator(); o2.type = 'square'; o2.frequency.value = 240.6;
    const lp = c.createBiquadFilter(); lp.type = 'bandpass'; lp.frequency.value = 480; lp.Q.value = 1.2;
    const g2 = c.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(lp); o.connect(lp);
    this.g = c.createGain(); this.g.gain.value = 0; lp.connect(this.g); this.g.connect(BUS.sfx);
    this.lp = lp; o.start(); o2.start();
  },
  set(v) { this.target = v; },
  update(dt) { if (!this.g) return; const tgt = S.mute ? 0 : this.target + this.buzz * (0.6 + 0.4 * Math.sin(T * 31)); this.lvl = approach(this.lvl, tgt, dt * 6); this.g.gain.setTargetAtTime(this.lvl, AC.currentTime, 0.05); this.lp.frequency.setTargetAtTime(420 + this.buzz * 900, AC.currentTime, 0.1); }
};
/* ---- SFX library ---- */
const SFX = {
  move() { if (!sfxOK('move', 0.025)) return; const t = aNow(); tone(t, 1250, 0.025, 0.03, 'square'); nz(t, 'w', 'highpass', 6000, 1, 0.012, 0.04); },
  rotate(dir = 1) { if (!sfxOK('rotate', 0.02)) return; const t = aNow(); tone(t, dir > 0 ? 620 : 900, 0.07, 0.045, 'square', null, 0.002, dir > 0 ? 1300 : 480); nz(t, 'w', 'highpass', 5000, 1, 0.025, 0.06); },
  soft() { if (!sfxOK('soft', 0.04)) return; tone(aNow(), 200, 0.025, 0.025, 'triangle'); },
  lock() { if (!sfxOK('lock', 0.04)) return; const t = aNow(); thump(t, 200, 90, 0.08, 0.32, null, 'triangle'); nz(t, 'p', 'bandpass', 1700, 3, 0.035, 0.28); tone(t + 0.01, 2400, 0.02, 0.03, 'square'); },
  hard(cells = 10) { if (!sfxOK('hard', 0.03)) return; const t = aNow(), k = clamp(cells / 14, 0.4, 1); swoosh(t - 0.002, 0.08, 3000, 600, 0.12 * k); thump(t + 0.02, 150, 40, 0.22, 0.85 * k, null, 'sine', true); nz(t + 0.02, 'w', 'bandpass', 2600, 0.8, 0.07, 0.35 * k); nz(t + 0.03, 'w', 'highpass', 4000, 1, 0.05, 0.12, null, 0.001, 0, true); },
  hold() { if (!sfxOK('hold', 0.05)) return; const t = aNow(); nz(t, 'w', 'bandpass', 3200, 4, 0.02, 0.35); tone(t, 1800, 0.03, 0.05, 'square'); nz(t + 0.06, 'w', 'bandpass', 2400, 4, 0.02, 0.3); tone(t + 0.06, 1200, 0.04, 0.05, 'square'); },
  zap(p = 1) { if (!sfxOK('zap', 0.03)) return; const t = aNow(); for (let i = 0; i < 6 + p * 4; i++) nz(t + rand(0, 0.12 * p), 'w', 'highpass', rand(2500, 7000), 1, rand(0.006, 0.02), 0.25 * p, null, 0.001, 0, true); tone(t, 1900, 0.25 * p, 0.07, 'sawtooth', null, 0.003, 90); tone(t, 120, 0.25, 0.08 * p, 'sawtooth', null, 0.003, 60); },
  clear(n) {
    if (!sfxOK('clear' + n)) return; const t = aNow(); this.zap(0.6 + n * 0.25);
    const base = [523, 659, 784, 1047, 1319, 1568]; const notes = n >= 4 ? [0, 1, 2, 3, 4, 5] : base.slice(0, 2 + n).map((_, i) => i);
    notes.forEach((i, k) => { tone(t + 0.05 + k * 0.045, base[i], 0.35, 0.05, 'square', null, 0.003); tone(t + 0.05 + k * 0.045, base[i] * 2.005, 0.3, 0.025, 'sine'); });
    thump(t, 110, 40, 0.3, 0.5 + n * 0.12, null, 'sine', true);
    if (n >= 4) { tone(t, 90, 0.9, 0.12, 'sawtooth', null, 0.01, 1500); swoosh(t, 0.9, 400, 6000, 0.25, 0.9); thump(t + 0.3, 70, 25, 0.8, 1.1, null, 'sine', true); for (const f of [784, 988, 1175, 1568]) tone(t + 0.32, f, 0.9, 0.05, 'triangle', null, 0.005); }
  },
  buzz() { if (!sfxOK('buzz', 0.2)) return; const t = aNow(); const o = AC.createOscillator(), gn = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.value = 118; f.type = 'bandpass'; f.frequency.value = 900; f.Q.value = 1; env(gn, t, 0.01, 0.09, 0.3); o.connect(f); f.connect(gn); gn.connect(BUS.sfx); o.start(t); o.stop(t + 0.35); vEnd(o); },
  breaker() { if (!sfxOK('breaker')) return; const t = aNow(); thump(t, 80, 32, 0.45, 1.2, null, 'sine', true); nz(t, 'w', 'bandpass', 900, 7, 0.18, 0.6); nz(t, 'w', 'highpass', 3000, 1, 0.02, 0.5); tone(t + 0.005, 1450, 0.12, 0.06, 'square', null, 0.001, 900); nz(t + 0.03, 'b', 'lowpass', 300, 1, 0.3, 0.6); },
  lightsOn() {
    if (!sfxOK('lightsOn')) return; const t = aNow();
    // rising transformer hum
    const o = AC.createOscillator(), gn = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(60, t); o.frequency.exponentialRampToValueAtTime(240, t + 0.55); f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.exponentialRampToValueAtTime(3000, t + 0.55); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.16, t + 0.5); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.7); o.connect(f); f.connect(gn); gn.connect(BUS.sfx); o.start(t); o.stop(t + 0.75); vEnd(o);
    const t2 = t + 0.55; for (let i = 0; i < 10; i++) nz(t + rand(0, 0.5), 'w', 'highpass', 4000, 1, 0.012, 0.2, null, 0.001, 0, true);
    thump(t2, 90, 30, 0.9, 1.2, null, 'sine', true); swoosh(t2, 1.2, 300, 7000, 0.3, 0.8);
    [261.6, 329.6, 392, 493.9, 587.3, 784, 987.8, 1174.7].forEach((fq, i) => { tone(t2 + i * 0.018, fq, 2.2, 0.045, i % 2 ? 'triangle' : 'sawtooth', null, 0.01); tone(t2 + i * 0.018, fq * 1.004, 2.0, 0.03, 'sine', null, 0.01); });
    for (let i = 0; i < 12; i++) tone(t2 + 0.1 + i * 0.07, pick([1568, 2093, 2637, 3136]), 0.25, 0.03, 'sine');
  },
  flicker() { if (!sfxOK('flicker', 0.05)) return; const t = aNow(); nz(t, 'w', 'bandpass', 2000, 2, 0.03, 0.2); tone(t, 118, 0.06, 0.08, 'sawtooth'); },
  danger() { if (!sfxOK('danger', 1.2)) return; const t = aNow(); tone(t, 880, 0.12, 0.05, 'square'); tone(t + 0.15, 660, 0.12, 0.05, 'square'); },
  over() {
    if (!sfxOK('over')) return; const t = aNow();
    const o = AC.createOscillator(), gn = AC.createGain(), f = AC.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(700, t); o.frequency.exponentialRampToValueAtTime(35, t + 1.4); f.type = 'lowpass'; f.frequency.setValueAtTime(4000, t); f.frequency.exponentialRampToValueAtTime(150, t + 1.4); env(gn, t, 0.01, 0.2, 1.4); o.connect(f); f.connect(gn); gn.connect(BUS.sfx); o.start(t); o.stop(t + 1.5); vEnd(o);
    for (let i = 0; i < 18; i++) nz(t + rand(0, 0.9), 'w', 'highpass', rand(2000, 6000), 1, rand(0.01, 0.04), 0.3, null, 0.001, 0, true);
    thump(t, 100, 30, 0.6, 1.1, null, 'sine', true); nz(t, 'w', 'lowpass', 3000, 0.6, 0.5, 0.5, null, 0.002, 200, true);
  },
  levelStart() { if (!sfxOK('levelStart')) return; const t = aNow(); [392, 523, 659].forEach((f, i) => tone(t + i * 0.08, f, 0.18, 0.06, 'square')); tone(t + 0.24, 784, 0.4, 0.06, 'square'); },
  combo(n) { if (!sfxOK('combo', 0.05)) return; tone(aNow(), 600 + n * 90, 0.12, 0.05, 'triangle'); },
  ui(k = 'move') { if (!sfxOK('ui_' + k, 0.03)) return; const t = aNow(); if (k === 'move') tone(t, 880, 0.04, 0.04, 'square'); else if (k === 'ok') { tone(t, 660, 0.05, 0.06, 'square'); tone(t + 0.05, 990, 0.09, 0.06, 'square'); } else if (k === 'back') tone(t, 440, 0.08, 0.05, 'square', null, 0.004, 300); },
  // ---- Pappa Kennedy's voice (formant grunts, not speech) ----
  voice(kind) {
    if (!sfxOK('voice_' + kind, 0.25)) return; const t = aNow();
    if (kind === 'hyeah') { nz(t, 'w', 'bandpass', 1800, 1.5, 0.06, 0.12); syl(t + 0.04, 300, 420, 0.13, 'i', 0.2, 0.3, 'e'); syl(t + 0.16, 430, 330, 0.3, 'ae', 0.22, 0.25, 'a'); }
    else if (kind === 'huh') { syl(t, 230, 170, 0.15, 'uh', 0.22, 0.5); }
    else if (kind === 'uhuh') { syl(t, 240, 180, 0.12, 'uh', 0.2, 0.5); syl(t + 0.22, 260, 190, 0.14, 'uh', 0.22, 0.5); }
    else if (kind === 'ow') { syl(t, 330, 480, 0.12, 'a', 0.2, 0.3); syl(t + 0.11, 480, 260, 0.32, 'a', 0.22, 0.3, 'u'); }
    else if (kind === 'ooh') { syl(t, 190, 330, 0.45, 'o', 0.18, 0.2, 'u'); }
    else if (kind === 'whoa') { syl(t, 170, 230, 0.2, 'u', 0.2, 0.3, 'o'); syl(t + 0.18, 230, 140, 0.35, 'o', 0.2, 0.3, 'a'); }
    else if (kind === 'heh') { for (let i = 0; i < 3; i++) syl(t + i * 0.13, 220 - i * 10, 200 - i * 10, 0.09, 'eh', 0.16, 0.6); }
    else if (kind === 'getup') { syl(t, 210, 260, 0.14, 'e', 0.2, 0.3); syl(t + 0.18, 300, 380, 0.16, 'uh', 0.22, 0.3); syl(t + 0.4, 420, 520, 0.28, 'a', 0.24, 0.3, 'uh'); }
    else if (kind === 'yow') { syl(t, 380, 600, 0.14, 'i', 0.22, 0.3, 'a'); syl(t + 0.13, 600, 300, 0.4, 'a', 0.24, 0.3, 'o'); }
    else if (kind === 'aww') { syl(t, 260, 150, 0.6, 'a', 0.18, 0.3, 'o'); }
  },
};
