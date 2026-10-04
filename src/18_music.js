/* ===================== MUSIC: procedural funk/disco engine (original grooves) ===================== */
const NOTE_I = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const mf = m => 440 * Math.pow(2, (m - 69) / 12);
// upper-structure voicings (semitones above the root) used by guitar / clav / horns / strings
const VOIC = { '': [4, 7, 12], 'm': [3, 7, 12], '7': [4, 10, 16], 'm7': [3, 10, 15], 'maj7': [4, 11, 16], '9': [4, 10, 14], 'm9': [3, 10, 14], '7#9': [4, 10, 15], '13': [4, 10, 21], 'm11': [3, 10, 17], '6': [4, 9, 14] };
function parseChord(s) { const m = /^([A-G])(#|b)?(.*)$/.exec(s); const r = (NOTE_I[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + 12) % 12; return { r, q: m[3], v: VOIC[m[3]] || VOIC['7'], name: s }; }
const pc = s => parseChord(s).r;
// Tracks: chords = one per bar (8-bar loop). Patterns are 16 steps per bar; arrays alternate bar by bar.
// bass/clav/horn tokens: number = semitones (bass/clav: above chord root; horn/lead: above track key), ^ accent/pop, x dead note, - tie, . rest, S = chord stab
const TRACKS = {
  title: { name: "Pappa's Theme", bpm: 104, swing: 0.12, key: 'A', chords: 'A7#9 A7#9 D9 A7#9 E9 D9 A7#9 E7#9',
    bass: ['0 . x 0 . . 12^ . 10 . 7 . 0 . 3 4', '0 . . 0 x . 7 . 10 . 12^ . 10 7 5 x'],
    gtr: ['.x.X.x.x.x.X.xx.'], gmode: 'scratch',
    clav: ['. . 12 . 10 . 7 . . 12 . 10 . 7 5 .', '. . 12 . 10 . 7 . . 3 4 . 7 . . .'],
    horn: ['S - . . . . . . . . . . . . . .', '. . . . . . 7 . 10 . 12 - 10 . 7 .'], hornBars: [0, 1, 4, 5],
    K: 'x.....x.x.....x.', Sn: '....x..g.g..x..g', H: 'x.x.x.x.x.x.x.ox', P: '' },
  boogie: { name: 'Breaker Box Boogie', bpm: 108, swing: 0.1, key: 'E', chords: 'E9 E9 E9 E9 E9 E9 A9 A9',
    bass: ['0 . x 0 . . 12^ . 10 . 7 . . 5 7 x', '0 . . 0 x 3 4 . 7 . 10 . 12^ . 10 7'],
    gtr: ['x.xX.xx.x.xX.x.x', '.xxX.x.xx.xX.xxx'], gmode: 'scratch', clav: null,
    horn: ['S - . . . . . . . . S . . . . .', '7 . 10 . 12 . . 10 7 . 5 . 7 - - .'], hornBars: [3, 7, 0, 4],
    K: 'x.....x.x.....x.', Sn: '....x..g.g..x..g', H: 'x.x.x.x.x.x.x.ox', P: '...h..l...h.h...' },
  disco: { name: 'Disco Voltage', bpm: 118, swing: 0, key: 'F#', chords: 'F#m9 F#m9 Bm9 C#7 F#m9 F#m9 Bm9 C#7#9',
    bass: ['0 . 12^ . 0 . 12^ . 0 . 12^ . 10 . 12^ .', '0 . 12^ 0 . 7 12^ . 0 . 12^ . 7 . 10 .'],
    gtr: ['..X...X.xxX...X.', 'x.X..xX...X.xxX.'], gmode: 'chop', clav: null, strings: true,
    horn: ['. . . . 12 - 14 . 15 - 14 . 12 . 10 .', '12 - - - . . . . . . . . . . . .'], hornBars: [2, 3, 6, 7],
    K: 'x...x...x...x...', Sn: '....x.......x...', C: '....x.......x...', H: 'xxoxxxoxxxoxxxox', J: '..x...x...x...x.' },
  neutral: { name: 'Hot Neutral Ground', bpm: 98, swing: 0.16, key: 'D', chords: 'Dm7 Dm7 Dm7 G7 Dm7 Dm7 Bb7 A7#9',
    bass: ['0 . . . . . 0 . . 10 . 12^ . . 7 .', '0 . . 0 . . . 3 . 5 . . 7 . 5 3'],
    gtr: ['....X.......X.x.'], gmode: 'wah',
    clav: ['0 . 3 0 . 5 . 0 7 . 5 3 . 0 . x', '12 . 10 . 7 . 5 . 3 . 5 . 7 . 0 .'],
    horn: ['. . . . . . . . 12 . 10 . 12 . 15 -', '17 - - . 15 . 12 . 10 - . . . . . .'], hornBars: [3, 7],
    K: 'x.........x..x..', Sn: '....x..g.g..x...', H: 'x.xxx.xxx.xxx.xo', P: '..h..l.h..h.l...' },
  strut: { name: 'Ampere Strut', bpm: 112, swing: 0.08, key: 'Bb', chords: 'Bb7 Bb7 Eb9 Bb7 F9 Eb9 Bb7 F7#9',
    bass: ['0 . 7 . 10 . 12^ . 0 . x 0 3 4 7 .', '0 . . 0 . 10 12^ . 7 . 5 . 3 . 0 x'],
    gtr: ['x.x.X.x.x.xxX.x.'], gmode: 'scratch', clav: null,
    horn: ['0 . 3 . 5 . 6 7 - . 10 . 7 . 5 .', '3 - 0 . . . . . . . S . S . . .'], hornBars: [0, 1, 4, 5],
    K: 'x..x....x..x....', Sn: '....x.......x...', H: 'xxxxxxxxxxxxxxxx', B: '..x...x...x.x...' },
  cruise: { name: 'Conduit Cruise', bpm: 122, swing: 0, key: 'F', chords: 'Fmaj7 Em7 Dm7 Cmaj7 Bbmaj7 Am7 Gm7 C9',
    bass: ['0 . 12^ . 7 . 12^ . 0 . 12^ . 7 . 10 .', '0 12^ . 0 12^ . 0 . 7 . 12^ . 5 . 7 .'],
    gtr: ['..X.x.X...X.x.X.'], gmode: 'chop', strings: true,
    clav: ['. . 12 . . 7 . . 12 . 10 . . 7 . .'],
    horn: ['. . . . . . . . 12 - 11 - 9 - 7 -', '9 - - - . . . . . . . . . . . .'], hornBars: [3, 7],
    K: 'x...x...x...x...', Sn: '....x.......x...', C: '....x.......x...', H: 'x.o.x.o.x.o.x.o.', J: 'x.x.x.x.x.x.x.x.' },
  shake: { name: 'Three-Phase Shake', bpm: 126, swing: 0, key: 'G', chords: 'G7#9 G7#9 G7#9 G7#9 C9 C9 G7#9 D9',
    bass: ['0 . 0 12^ . 0 10 . 0 . 7 . 10 12^ x 0', '0 x 0 . 12^ . 10 7 . 5 . 7 . 3 4 .'],
    gtr: ['xxXxxxXxxxXxxXxx'], gmode: 'wah', clav: ['0 . . 0 . . 10 . . 0 . 7 . . 5 .'],
    horn: ['S . . . . . S . . . . . . . . .', '. . 10 . 12 . 10 . 7 . 5 . 3 . 0 .'], hornBars: [0, 1, 2, 3, 4, 5, 6, 7],
    K: 'x...x...x...x.x.', Sn: '....x.......x...', C: '....x.......x..x', H: 'x.o.x.o.x.o.x.o.', P: 'h.l.h.h.l.h.l.hh' },
  holiday: { name: 'Funky Holiday Lights', bpm: 116, swing: 0.06, key: 'C', chords: 'Cmaj7 Am7 Dm7 G9 Cmaj7 A7 Dm7 G13',
    bass: ['0 . 12^ . 0 . 12^ . 7 . 12^ . 10 . 7 .', '0 . 12^ 0 . 7 12^ . 0 . 12^ . 5 . 7 .'],
    gtr: ['..X...X.x.X...X.'], gmode: 'chop', strings: true, clav: null,
    horn: ['12 . 16 . 19 . 16 . 21 - 19 . 16 . 12 .', '14 - 17 . 21 . 19 - 17 . 14 . 12 - - .'], hornBars: [0, 1, 2, 3, 4, 5, 6, 7], lead: 'bell',
    K: 'x...x...x...x...', Sn: '....x.......x...', C: '....x.......x...', H: 'x.o.x.o.x.o.x.o.', J: 'xxxxxxxxxxxxxxxx' },
};
const GAME_TRACKS = ['boogie', 'disco', 'neutral', 'strut', 'cruise', 'shake'];
for (const id in TRACKS) { const d = TRACKS[id]; d.id = id; d.ch = d.chords.split(' ').map(parseChord); const tk = s => s.split(' '); d.bassA = d.bass.map(tk); d.clavA = d.clav ? d.clav.map(tk) : null; d.hornA = d.horn ? d.horn.map(tk) : null; d.keyPc = pc(d.key + '7'); }

const Music = {
  cur: null, name: '', step: 0, nextT: 0, timer: null, gain: null, pulse: null, pending: null, intensity: 1, bpmAdd: 0, started: 0, rotateAt: 0, auto: false, paused: false,
  waves() { if (this.pulse) return; const n = 32, re = new Float32Array(n), im = new Float32Array(n); for (let i = 1; i < n; i++) im[i] = 2 / (i * Math.PI) * Math.sin(i * Math.PI * 0.28); this.pulse = AC.createPeriodicWave(re, im); },
  play(id, opts = {}) {
    hitA('music_' + id); if (this.name === id && this.gain && !opts.restart) return; this.name = id; this.cur = TRACKS[id] || null; this.step = 0; this.pending = null;
    if (!this.cur) { this.stop(); return; }
    this.started = aNow(); this.rotateAt = aNow() + rand(90, 115);
    if (!AC) return; this.waves();
    if (this.gain) { const old = this.gain; old.gain.setTargetAtTime(0.0001, AC.currentTime, 0.12); setTimeout(() => { try { old.disconnect(); } catch (e) { } }, 900); }
    this.gain = AC.createGain(); this.gain.gain.value = 0.0001; this.gain.gain.setTargetAtTime(1, AC.currentTime + 0.03, 0.06); this.gain.connect(BUS.duck);
    this.nextT = AC.currentTime + 0.06; this.crashNext = true;
    if (!this.timer) this.timer = setInterval(() => this.tick(), 25);
  },
  queue(id) { if (!this.gain || !AC) { this.play(id); return; } if (id === this.name) return; this.pending = id; hitA('musicQueue_' + id); },
  next() { const pool = GAME_TRACKS.filter(x => x !== this.name); this.queue(pick(pool)); },
  stop() { this.name = ''; this.cur = null; if (this.gain && AC) { const old = this.gain; old.gain.setTargetAtTime(0.0001, AC.currentTime, 0.1); setTimeout(() => { try { old.disconnect(); } catch (e) { } }, 800); this.gain = null; } },
  resume() { if (AC && this.cur && !this.gain) { const n = this.name; this.name = ''; this.play(n); } },
  duck(v, tc = 0.15) { if (AC) BUS.duck.gain.setTargetAtTime(v, AC.currentTime, tc); },
  setPaused(p) { this.paused = p; this.duck(p ? 0.0001 : 1, 0.08); },
  update() { if (this.auto && AC && this.cur && !this.paused && !this.pending && aNow() > this.rotateAt) this.next(); },
  tick() {
    if (!AC || !this.cur || !this.gain) return; if (AC.state !== 'running') { this.nextT = AC.currentTime + 0.05; return; }
    if (this.nextT < AC.currentTime - 0.3) this.nextT = AC.currentTime + 0.02;
    let guard = 0;
    while (this.nextT < AC.currentTime + 0.12 && guard++ < 16) {
      if (this.pending && this.step % 16 === 0) { const id = this.pending; this.pending = null; this.name = id; this.cur = TRACKS[id]; this.step = 0; this.crashNext = true; this.started = aNow(); this.rotateAt = aNow() + rand(90, 115); hitA('music_' + id); }
      const s = this.cur, sd = 60 / (s.bpm + this.bpmAdd) / 4;
      if (!this.paused && !S.mute && S.musicVol > 0.001) try { this.note(this.step, this.nextT, sd); } catch (e) { }
      this.step++; this.nextT += sd;
    }
  },
  note(st, t0, sd) {
    const s = this.cur, out = this.gain, bar = Math.floor(st / 16), b16 = st % 16, bar8 = bar % 8, block = Math.floor(bar / 8), ch = s.ch[bar8];
    const t = t0 + (b16 % 2 ? s.swing * sd : 0), I = this.intensity;
    const breakdown = block % 4 === 2 && bar8 < 2, full = block > 0 || I >= 2, fill = bar8 === 7 && block % 2 === 1 && b16 >= 12;
    const root = ch.r, bassRoot = 28 + ((root - 4 + 12) % 12), compRoot = 60 + root - (root > 5 ? 12 : 0);
    const comp = ch.v.map(v => compRoot + v);
    // ---- drums
    if (this.crashNext && b16 === 0) { this.crashNext = false; this.crash(t, out); }
    else if (bar8 === 0 && b16 === 0 && block > 0) this.crash(t, out);
    if (fill) { this.snare(t, 0.35 + (b16 - 12) * 0.15, out); if (b16 === 12) this.kick(t, 1, out); }
    else {
      if (s.K[b16] === 'x' && !(breakdown && b16 % 8)) this.kick(t, 1, out);
      const sn = s.Sn[b16]; if (sn === 'x') this.snare(t, 1, out); else if (sn === 'g' && !breakdown) this.snare(t, 0.22, out);
      if (s.C && s.C[b16] === 'x' && full) this.clap(t, out);
    }
    const h = s.H[b16]; if (h === 'x' || h === 'X') this.hat(t, false, (b16 % 4 === 0 ? 1 : 0.65) * (breakdown ? 0.6 : 1), out); else if (h === 'o') this.hat(t, true, 1, out);
    else if (I >= 3 && b16 % 2 === 1) this.hat(t, false, 0.35, out);
    if (s.J && s.J[b16] === 'x' && (full || s.id === 'holiday')) (s.id === 'holiday' ? this.jingle(t, out) : this.tamb(t, out));
    if (s.P && s.P[b16] && s.P[b16] !== '.' && I >= 1 && !breakdown) this.conga(t, s.P[b16] === 'h', out);
    if (s.B && s.B[b16] === 'x' && full) this.cowbell(t, out);
    // ---- bass
    const bt = s.bassA[bar % s.bassA.length], tok = bt[b16];
    if (tok && tok !== '.' && tok !== '-') {
      let len = 1; while (bt[b16 + len] === '-' && b16 + len < 16) len++;
      if (tok === 'x') this.bass(t, bassRoot, sd, false, true, out);
      else { const acc = tok.endsWith('^'), n = parseInt(tok, 10); this.bass(t, bassRoot + n, len > 1 ? len * sd * 0.95 : sd * 1.5, acc, false, out); }
    }
    if (breakdown) return;
    // ---- guitar
    const gp = s.gtr[bar % s.gtr.length], gc = gp[b16];
    if (gc === 'x' || gc === 'X') {
      if (s.gmode === 'scratch') this.scratch(t, comp, gc === 'X', out);
      else if (s.gmode === 'chop') { if (gc === 'X') this.chop(t, comp.map(m => m + 12), sd * 1.2, out); else this.scratch(t, comp, false, out, 0.6); }
      else this.wah(t, comp, gc === 'X', st, out);
    }
    // ---- clav
    if (s.clavA && (full || I >= 1)) {
      const ct = s.clavA[bar % s.clavA.length], c = ct[b16];
      if (c && c !== '.' && c !== '-') { if (c === 'x') this.clav(t, compRoot, sd * 0.4, false, out, true); else this.clav(t, compRoot + parseInt(c, 10), sd * 0.9, c.endsWith('^'), out); }
    }
    // ---- strings (pads on chord changes)
    if (s.strings && full && I >= 1 && b16 === 0 && (bar8 >= 4 || block % 2 === 1)) this.pad(t, comp.map(m => m + 12), sd * 15.5, out);
    // ---- horns / lead
    if (s.hornA && (I >= 1 || bar8 === 0) && (full || bar8 >= 4)) {
      const hb = s.hornBars, idx = hb.indexOf(bar8);
      if (idx >= 0) {
        const ht = s.hornA[idx % s.hornA.length], hk = ht[b16];
        if (hk && hk !== '.' && hk !== '-') {
          let len = 1; while (ht[b16 + len] === '-' && b16 + len < 16) len++;
          const keyBase = 60 + s.keyPc - (s.keyPc > 4 ? 12 : 0);
          if (hk === 'S') this.horn(t, comp.map(m => m + 12), Math.max(sd * 1.2, len * sd * 0.9), true, out);
          else { const n = keyBase + parseInt(hk, 10); if (s.lead === 'bell') { this.bell(t, n + 12, out); if (I >= 2) this.horn(t, [n], len * sd * 0.9, false, out, 0.6); } else this.horn(t, I >= 2 ? [n, n - 5 + (n % 2)] : [n], len * sd * 0.92, hk.endsWith('^'), out); }
        }
      }
    }
  },
  // ---------- instruments ----------
  osc(type, f) { const o = AC.createOscillator(); if (type === 'pulse') o.setPeriodicWave(this.pulse); else o.type = type; o.frequency.value = f; return o; },
  noise(t, ftype, f, q, dur, gain, out, kind = 'w') { const s = AC.createBufferSource(); s.buffer = NZ[kind]; const fl = AC.createBiquadFilter(); fl.type = ftype; fl.frequency.value = f; fl.Q.value = q; const gn = AC.createGain(); gn.gain.setValueAtTime(gain, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(gn); gn.connect(out); s.start(t, Math.random() * 1.5); s.stop(t + dur + 0.02); },
  kick(t, v, out) { const o = AC.createOscillator(), gn = AC.createGain(); o.frequency.setValueAtTime(165, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.09); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.85 * v, t + 0.003); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.3); o.connect(gn); gn.connect(out); o.start(t); o.stop(t + 0.32); this.noise(t, 'highpass', 3000, 0.7, 0.012, 0.12 * v, out); },
  snare(t, v, out) { this.noise(t, 'bandpass', 1900, 0.8, v < 0.5 ? 0.05 : 0.14, 0.42 * v, out); this.noise(t, 'highpass', 5000, 0.7, 0.08, 0.12 * v, out); const o = AC.createOscillator(), gn = AC.createGain(); o.type = 'triangle'; o.frequency.setValueAtTime(210, t); o.frequency.exponentialRampToValueAtTime(160, t + 0.06); gn.gain.setValueAtTime(0.25 * v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); o.connect(gn); gn.connect(out); o.start(t); o.stop(t + 0.1); },
  clap(t, out) { for (let i = 0; i < 3; i++) this.noise(t + i * 0.011, 'bandpass', 1300, 1.1, 0.02, 0.22, out); this.noise(t + 0.033, 'bandpass', 1200, 0.9, 0.13, 0.2, out); },
  hat(t, open, v, out) { this.noise(t, 'highpass', 7600, 0.8, open ? 0.2 : 0.035, (open ? 0.1 : 0.085) * v, out); },
  crash(t, out) { this.noise(t, 'highpass', 4800, 0.6, 1.3, 0.14, out); this.noise(t, 'bandpass', 9000, 1, 0.5, 0.07, out); },
  tamb(t, out) { for (let i = 0; i < 2; i++) this.noise(t + i * 0.012, 'bandpass', 9000, 2.5, 0.06, 0.07, out); },
  jingle(t, out) { for (let i = 0; i < 3; i++) this.noise(t + i * 0.01 + Math.random() * 0.006, 'bandpass', 8500 + Math.random() * 2500, 4, 0.05, 0.05, out); },
  conga(t, hi, out) { const o = AC.createOscillator(), gn = AC.createGain(), f = hi ? 370 : 245; o.frequency.setValueAtTime(f * 1.15, t); o.frequency.exponentialRampToValueAtTime(f, t + 0.03); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.22, t + 0.003); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); o.connect(gn); gn.connect(out); o.start(t); o.stop(t + 0.22); },
  cowbell(t, out) { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 2600; bp.Q.value = 1.5; const gn = AC.createGain(); gn.gain.setValueAtTime(0.09, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.2); for (const f of [545, 815]) { const o = this.osc('square', f); o.connect(bp); o.start(t); o.stop(t + 0.22); } bp.connect(gn); gn.connect(out); },
  bass(t, m, dur, acc, ghost, out) {
    if (ghost) { this.noise(t, 'lowpass', 500, 1, 0.05, 0.22, out, 'p'); return; }
    const f = mf(m), o1 = this.osc('sawtooth', f), o2 = this.osc('sine', f), fl = AC.createBiquadFilter(), gn = AC.createGain(), g2 = AC.createGain();
    fl.type = 'lowpass'; fl.Q.value = acc ? 7 : 4; fl.frequency.setValueAtTime(acc ? 3400 : 1400, t); fl.frequency.exponentialRampToValueAtTime(acc ? 650 : 280, t + 0.14);
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(acc ? 0.36 : 0.3, t + 0.004); gn.gain.setTargetAtTime(acc ? 0.16 : 0.2, t + 0.02, 0.08); gn.gain.setTargetAtTime(0.0001, t + dur, 0.02);
    g2.gain.value = 0.9; o1.connect(fl); fl.connect(gn); o2.connect(g2); g2.connect(gn); gn.connect(out);
    o1.start(t); o2.start(t); o1.stop(t + dur + 0.15); o2.stop(t + dur + 0.15);
    if (acc) this.noise(t, 'highpass', 2500, 0.8, 0.012, 0.12, out);
  },
  scratch(t, notes, acc, out, k = 1) {
    this.noise(t, 'bandpass', 2300, 1.3, 0.028, (acc ? 0.13 : 0.08) * k, out);
    if (acc) { const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 1700; bp.Q.value = 0.8; const gn = AC.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.09 * k, t + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, t + 0.08); for (const m of notes) { const o = this.osc('sawtooth', mf(m + 12)); o.connect(bp); o.start(t); o.stop(t + 0.1); } bp.connect(gn); gn.connect(out); }
  },
  chop(t, notes, dur, out) {
    const hp = AC.createBiquadFilter(); hp.type = 'bandpass'; hp.frequency.value = 1500; hp.Q.value = 0.7; const gn = AC.createGain();
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.085, t + 0.003); gn.gain.exponentialRampToValueAtTime(0.0001, t + Math.max(0.09, dur));
    for (const m of notes) for (const d of [-8, 8]) { const o = this.osc('sawtooth', mf(m)); o.detune.value = d; o.connect(hp); o.start(t); o.stop(t + dur + 0.1); }
    hp.connect(gn); gn.connect(out);
  },
  wah(t, notes, acc, st, out) {
    const bp = AC.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 5; const ph = (st % 32) / 32; const fc = 450 + 2100 * (0.5 + 0.5 * Math.sin(ph * TAU * 2 - 1.2));
    bp.frequency.setValueAtTime(fc * 0.8, t); bp.frequency.linearRampToValueAtTime(fc * 1.25, t + 0.06);
    const gn = AC.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(acc ? 0.2 : 0.11, t + 0.003); gn.gain.exponentialRampToValueAtTime(0.0001, t + (acc ? 0.12 : 0.05));
    for (const m of notes) { const o = this.osc('sawtooth', mf(m + 12)); o.connect(bp); o.start(t); o.stop(t + 0.14); }
    bp.connect(gn); gn.connect(out);
  },
  clav(t, m, dur, acc, out, dead) {
    const o = this.osc('pulse', mf(m)), lp = AC.createBiquadFilter(), gn = AC.createGain(); lp.type = 'lowpass'; lp.Q.value = 3; lp.frequency.setValueAtTime(dead ? 1200 : 4200, t); lp.frequency.exponentialRampToValueAtTime(900, t + 0.1);
    const pk = dead ? 0.05 : acc ? 0.17 : 0.13; gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(pk, t + 0.002); gn.gain.setTargetAtTime(pk * 0.35, t + 0.01, 0.05); gn.gain.setTargetAtTime(0.0001, t + (dead ? 0.02 : dur), 0.015);
    o.connect(lp); lp.connect(gn); gn.connect(out); o.start(t); o.stop(t + dur + 0.12);
  },
  horn(t, notes, dur, acc, out, k = 1) {
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.Q.value = 1.2; lp.frequency.setValueAtTime(500, t); lp.frequency.linearRampToValueAtTime(acc ? 3600 : 2800, t + 0.035); lp.frequency.setTargetAtTime(1600, t + 0.05, 0.12);
    const gn = AC.createGain(), pk = (acc ? 0.15 : 0.12) * k / Math.sqrt(notes.length); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(pk, t + 0.018); gn.gain.setTargetAtTime(pk * 0.75, t + 0.03, 0.1); gn.gain.setTargetAtTime(0.0001, t + dur, 0.04);
    for (const m of notes) for (const d of [-7, 7]) { const o = this.osc('sawtooth', mf(m)); o.detune.setValueAtTime(d - 60, t); o.detune.linearRampToValueAtTime(d, t + 0.045); o.connect(lp); o.start(t); o.stop(t + dur + 0.3); }
    lp.connect(gn); gn.connect(out);
  },
  pad(t, notes, dur, out) {
    const lp = AC.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2200; lp.Q.value = 0.4; const gn = AC.createGain();
    gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(0.06, t + 0.35); gn.gain.setValueAtTime(0.06, t + dur - 0.3); gn.gain.linearRampToValueAtTime(0.0001, t + dur + 0.4);
    for (const m of notes) for (const d of [-11, 11]) { const o = this.osc('sawtooth', mf(m)); o.detune.value = d; o.connect(lp); o.start(t); o.stop(t + dur + 0.5); }
    lp.connect(gn); gn.connect(out);
  },
  bell(t, m, out) { for (const [r, a, d] of [[1, 0.09, 0.7], [4, 0.025, 0.25], [2.01, 0.03, 0.4]]) { const o = this.osc('sine', mf(m) * r), gn = AC.createGain(); gn.gain.setValueAtTime(0.0001, t); gn.gain.linearRampToValueAtTime(a, t + 0.002); gn.gain.exponentialRampToValueAtTime(0.0001, t + d); o.connect(gn); gn.connect(out); o.start(t); o.stop(t + d + 0.05); } },
};
