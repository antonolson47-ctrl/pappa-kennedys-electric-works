/* ===================== CORE: utils, save, colors, scenes ===================== */
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const rand = (a, b) => a + Math.random() * (b - a);
const irand = (a, b) => Math.floor(rand(a, b + 1));
const pick = a => a[Math.floor(Math.random() * a.length)];
const chance = p => Math.random() < p;
const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
const easeOut = t => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const easeBack = t => { t = clamp(t, 0, 1); const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const approach = (v, t, k) => v + (t - v) * (1 - Math.exp(-k));
const TAU = Math.PI * 2;
const cv = $('#cv');
let g = cv.getContext('2d');
let DPR = 1, VW = 360, VH = 640, T = 0, DT = 0;
let IS_TOUCH = false;
const COARSE = !!(window.matchMedia && matchMedia('(pointer:coarse)').matches) || ('ontouchstart' in window && navigator.maxTouchPoints > 0);
const FORCE_TOUCH = /[?&]touch=1/.test(location.search);

/* ---------- save ---------- */
const SAVE_KEY = 'pappa_kennedy_v1';
const S = { musicVol: 0.6, sfxVol: 0.85, mute: false, gestures: true, ghost: true, shake: true, unlocked: 1, hi: 0, hiLines: 0, lit: [], best: {}, plays: 0, won: 0 };
function loadSave() { try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); for (const k in S) if (d[k] !== undefined) S[k] = d[k]; } catch (e) { } S.unlocked = clamp(S.unlocked | 0 || 1, 1, 10); if (!Array.isArray(S.lit)) S.lit = []; }
function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { } }

/* ---------- colors ---------- */
const _rgb = new Map();
function hexRGB(h) { let c = _rgb.get(h); if (c) return c; let s = h.replace('#', ''); if (s.length === 3) s = s.split('').map(x => x + x).join(''); c = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)]; _rgb.set(h, c); return c; }
function rgba(h, a) { const c = hexRGB(h); return `rgba(${c[0]},${c[1]},${c[2]},${a})`; }
const _sh = new Map();
function shade(hex, k) { // k<0 darker, k>0 lighter (toward white)
  const key = hex + k; let r = _sh.get(key); if (r) return r;
  let [R, G, B] = hexRGB(hex);
  if (k < 0) { R *= 1 + k; G *= 1 + k; B *= 1 + k; } else { R += (255 - R) * k; G += (255 - G) * k; B += (255 - B) * k; }
  const h = v => ('0' + Math.round(clamp(v, 0, 255)).toString(16)).slice(-2); r = '#' + h(R) + h(G) + h(B); _sh.set(key, r); return r;
}
function hsl(h, s, l) { return `hsl(${h},${s}%,${l}%)`; }
const NEON = { pink: '#ff2bd6', cyan: '#29f3ff', yellow: '#ffe23a', orange: '#ff8a1f', green: '#46ff74', red: '#ff3b5c', blue: '#3f7dff', purple: '#b44bff', white: '#ffffff', gold: '#ffc23a', mint: '#6dffd8' };

/* ---------- scenes + DOM helpers ---------- */
let scene = null;
const UI = $('#ui');
function go(sc, arg) { if (scene && scene.exit) scene.exit(); scene = sc; UI.innerHTML = ''; if (sc.enter) sc.enter(arg); if (typeof TC !== 'undefined' && TC.built) TC.sync(); hitA('scene_' + sc.name); }
function el(html) { const d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstChild; }
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function sheet(html, cls = '') { const s = el(`<div class="sheet ${cls}">${html}</div>`); UI.appendChild(s); bindButtons(s); return s; }
function bindButtons(root) { root.querySelectorAll('button[data-k]').forEach(b => { b.addEventListener('click', e => { e.stopPropagation(); audioInit(); const k = b.dataset.k; SFX.ui(k === 'back' ? 'back' : 'ok'); const h = root._h && root._h[k]; if (h) h(b); }); }); }
function on(root, handlers) { root._h = handlers; return root; }
function menuKey(e) {
  const bs = [...UI.querySelectorAll('button.btn, .lv:not(.locked)')].filter(b => b.offsetParent && !b.disabled); if (!bs.length) return false;
  let i = bs.findIndex(b => b.classList.contains('sel'));
  if (/^(ArrowRight|ArrowDown|Tab)$/.test(e.code)) { i = (i + 1) % bs.length; } else if (/^(ArrowLeft|ArrowUp)$/.test(e.code)) { i = (i - 1 + bs.length) % bs.length; }
  else if (e.code === 'Enter' || e.code === 'Space') { (bs[i] || bs[0]).click(); return true; } else return false;
  bs.forEach(b => b.classList.remove('sel')); bs[i].classList.add('sel'); if (bs[i].scrollIntoView) try { bs[i].scrollIntoView({ block: 'nearest' }); } catch (er) { } SFX.ui('move'); return true;
}
function fmt(n) { return String(Math.floor(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
