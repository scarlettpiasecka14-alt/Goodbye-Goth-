/* Goodbye Goth - tiny audio system (sound effects + music).
   Sounds live in assets/audio/sfx/<name>.mp3. Music lives in assets/audio/music/map.mp3 (map + story) and
   assets/audio/music/FightMusic1.mp3 and FightMusic2.mp3 (fights). A missing file is simply silent, so nothing breaks while files are still being added.
   Volumes are saved in the browser (a settings screen can use setVolume later). */
const VOL_KEY = 'goodbyeGothVolume_v1';
const vol = { master: 0, music: 0.35, sfx: 0.8 };   // master 0 = sound OFF until the player turns it on in Settings
try { Object.assign(vol, JSON.parse(localStorage.getItem(VOL_KEY) || '{}')); } catch (e) {}

/* Sound effects use the Web Audio API: each file is downloaded + decoded once, then plays with almost no delay
   (the old <audio> clones lagged behind the punch). Until a file has finished decoding, the old method is the fallback. */
let ctx = null, sfxGain = null;
const buffers = {}, loading = {};
// Long loops are streamed like music (decoding a 10-minute file into memory would be ~225MB). name -> file in assets/audio/sfx/
const STREAM = { ambience: 'Ambiance' };
function getCtx() {
    if (ctx) return ctx;
    try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        ctx = new AC(); sfxGain = ctx.createGain(); sfxGain.connect(ctx.destination);
    } catch (e) { ctx = null; }
    return ctx;
}
// V9.31: Safari can leave the audio engine "suspended" (or "interrupted") until a click / key press; wake it on every gesture so fight sounds and voice lines always play.
function unlockAudio() { if (held) return; const c = getCtx(); if (c && c.state !== 'running') c.resume().catch(() => {}); }
['pointerdown', 'mousedown', 'keydown', 'touchstart'].forEach(ev => window.addEventListener(ev, unlockAudio, true));
let held = false;   // V9.26: true while the game is paused from Settings
function wake() { if (!held && ctx && ctx.state !== 'running') ctx.resume().catch(() => {}); }
// V9.41: after switching browser tabs Safari can leave the sound engine 'suspended' / 'interrupted' for good (music kept playing, sound effects and voice lines died). Wake it when the tab comes back, and rebuild it if it will not wake.
function reviveAudio() {
    if (held || !ctx) return;
    if (ctx.state !== 'running') ctx.resume().catch(() => {});
    setTimeout(() => {
        if (held || !ctx || ctx.state === 'running' || document.hidden) return;
        try { ctx.close(); } catch (e) {}
        ctx = null; sfxGain = null; getCtx();
        if (ctx) ctx.resume().catch(() => {});
    }, 500);
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) reviveAudio(); });
window.addEventListener('focus', reviveAudio);
window.addEventListener('pageshow', reviveAudio);
let heldLoops = [];
export function setAudioHeld(on) {
    held = !!on;
    // V9.46: Settings also pauses plain <audio> sound loops (her dragging chain). The MUSIC deliberately keeps playing while Settings is open.
    if (on) { heldLoops = []; for (const n of Object.keys(loops)) { const f = loops[n].fb; if (f && !f.paused) { heldLoops.push(f); f.pause(); } } }
    else { heldLoops.forEach(f => f.play().catch(() => {})); heldLoops = []; }
    if (!ctx) return;
    if (on) { if (ctx.state === 'running') ctx.suspend().catch(() => {}); } else ctx.resume().catch(() => {});
}
function loadBuffer(name, tries = 0) {
    if (STREAM[name] || buffers[name] || loading[name]) return;
    const c = getCtx(); if (!c) return;
    // V9.46: a sound that failed to download/decode used to be marked "loading" for ever, so it stayed silent for the whole session. Now it retries.
    loading[name] = fetch(`assets/audio/sfx/${name}.mp3?v=9910`)
        .then(r => { if (!r.ok) throw new Error('missing'); return r.arrayBuffer(); })
        .then(ab => new Promise((res, rej) => c.decodeAudioData(ab, res, rej)))
        .then(buf => { buffers[name] = buf; })
        .catch(() => { delete loading[name]; if (tries < 15) setTimeout(() => loadBuffer(name, tries + 1), Math.min(6000, 800 * (tries + 1))); });
}
const fallbackCache = {};
function fallbackPlay(name, v) {
    try {
        if (!fallbackCache[name]) { fallbackCache[name] = new Audio(`assets/audio/sfx/${name}.mp3?v=9900`); fallbackCache[name].preload = 'auto'; }
        const a = fallbackCache[name].cloneNode(); a.volume = v; a.play().catch(() => {});
    } catch (e) {}
}
export function playSfx(name, gain = 1, rate = 1) {
    const v = Math.max(0, Math.min(1, vol.master * vol.sfx * gain));
    if (v <= 0) return;
    const c = getCtx();
    // V9.34: if Safari has left the audio engine suspended, play the plain <audio> way instead of queueing silently.
    if (c && buffers[name] && (c.state === 'running' || held)) {
        wake();
        const src = c.createBufferSource(), g = c.createGain();
        src.buffer = buffers[name]; src.playbackRate.value = rate; g.gain.value = v;
        src.connect(g); g.connect(sfxGain); src.start(0);
    } else { if (c && c.state !== 'running') wake(); loadBuffer(name); fallbackPlay(name, v); }
}
export function playRandomSfx(names, gain = 1) { playSfx(names[Math.floor(Math.random() * names.length)], gain); }
export function preloadSfx(names) { names.forEach(loadBuffer); }
// V9.46: download + decode EVERY sound effect straight away (about 1.3 MB in all). Before, only a handful were ready at the start, and any other sound that played before it had finished decoding went through
// a much less reliable path that Safari often silences - that is why sound effects seemed to work "on and off" (first Chain Goth hits, countdown ticks, her chain sounds).
const ALL_SFX = ['punch-1', 'punch-2', 'punch-3', 'goth-hurt-1', 'goth-hurt-2', 'goth-hurt-3', 'goth-hurt-4', 'goth-pain', 'click', 'typing', 'footsteps', 'interact', 'pickup',
    'olly-attack', 'olly-heavy-attack', 'olly-dodge-grunt', 'olly-hurt', 'olly-hurt-heavy', 'olly-jump', 'olly-land', 'olly-ko', 'olly-thud', 'chest-open',
    'chain-clatter', 'chain-drag', 'chain-drop', 'chain-impact', 'chain-impact-spin', 'chain-rattle', 'chain-spin',
    'breath-recovery', 'countdown-tick', 'fight-shout', 'zombie-death', 'tutorial', 'minigame-win', 'quiz-win', 'round-ok', 'wrong-buzz',
    'patricia-check-backpack', 'patricia-hey', 'patricia-kill-you', 'patricia-nice-try-cutie', 'patricia-nice-try', 'patricia-not-funny', 'patricia-pay-for-that', 'patricia-trying-hard',
    'patricia-ugh-stop-it', 'patricia-unfair-fight', 'patricia-who-do-you', 'patricia-grunt-1', 'patricia-grunt-3', 'patricia-grunt-4', 'patricia-grunt-5', 'patricia-grunt-6', 'patricia-grunt-7', 'patricia-grunt-8', 'patricia-grunt-9'];
ALL_SFX.forEach((n, i) => setTimeout(() => loadBuffer(n), i * 15));

/* Music "pools": each name plays one file (looping) or a playlist that moves to the next track when one ends.
   Files live in assets/audio/music/. Put the title-screen song at assets/audio/music/menu.mp3. */
const MUSIC = {
    menu: ['Menu.mp3'],
    map: ['BackgroundMusicTrack1.mp3', 'BackgroundTrack2.mp3', 'BackgroundTrack3.mp3', 'BackgroundTrack4.mp3'],
    fight: ['FightMusic1.mp3', 'FightMusic2.mp3'],
    boss: ['BossFight1.mp3', 'FightMusic1.mp3', 'FightMusic2.mp3']   // V9.34: Patricia's fight starts with BossFight1, then alternates the two fight tracks
};
let musicEl = null, musicName = '', wantMusic = '', fadeTimer = null, musicToken = 0, musicBusy = false;
function musicTarget() { return Math.max(0, Math.min(1, vol.master * vol.music)); }
// V9.44: every song has its OWN fade timer. There used to be one shared timer, so when a new song started fading in while the old one was still fading out,
// the old one's fade was cancelled half-way: it was never stopped, kept playing quietly for ever, and the Music slider could not reach it (the "intro music in the fight" bug).
function fadeTo(el, to, ms, done) {
    clearInterval(el._fade);
    const from = el.volume, t0 = performance.now();   // timed by the clock, so a busy moment (a fight loading) cannot stretch the fade
    el._fade = setInterval(() => {
        const k = Math.min(1, (performance.now() - t0) / Math.max(1, ms));
        el.volume = Math.max(0, Math.min(1, from + (to - from) * k));
        if (k >= 1) { clearInterval(el._fade); if (done) done(); }
    }, 50);
}
function nextIdx(name, list, i) { const n = (i + 1) % list.length; return (name === 'boss' && n === 0) ? 1 : n; }   // boss: the opening track plays once, then the two fight tracks alternate
let startOffset = 0;   // V9.42: playMusicFrom() - start the next track this many seconds in
function startTrack(name, token, list, i) {
    if (token !== musicToken) return;
    const el = new Audio(`assets/audio/music/${list[i]}`);
    if (startOffset > 0) { const off = startOffset; startOffset = 0; el.addEventListener('loadedmetadata', () => { try { el.currentTime = off; } catch (e) {} }, { once: true }); }
    el.loop = list.length === 1; el.volume = 0; el.preload = 'auto';
    el.addEventListener('ended', () => { if (token === musicToken && list.length > 1) { musicEl = null; startTrack(name, token, list, nextIdx(name, list, i)); } });
    el.addEventListener('error', () => { if (token === musicToken && list.length > 1) startTrack(name, token, list, nextIdx(name, list, i)); });
    el.play().then(() => { musicBusy = false; if (token !== musicToken) { el.pause(); return; } musicEl = el; musicName = name; fadeTo(el, musicTarget(), 900); }).catch(() => { musicBusy = false; });
}
/* playMusic('menu' | 'map' | 'fight' | '') - '' stops the music. Browsers only allow sound after a click/tap, so this retries on the next one. */
export function playMusicFrom(name, seconds, fadeMs = 300) { startOffset = seconds; playMusic(name, fadeMs); }
export function playMusic(name, fadeMs = 500) {
    wantMusic = name;
    if (name === musicName && musicEl && !musicEl.paused) return;
    const token = ++musicToken;
    musicBusy = true;   // V9.44: true for the whole crossfade (old track fading out, new one starting); the unlock() retry below must not mistake the gap for "nothing is playing"
    const begin = () => {
        if (token !== musicToken) { musicBusy = false; return; }
        const list = MUSIC[name];
        if (!name || !list) { musicName = ''; musicBusy = false; return; }
        const first = name === 'boss' ? 0 : (list.length > 1 ? Math.floor(Math.random() * list.length) : 0);
        startTrack(name, token, list, first);
    };
    if (musicEl) {
        const old = musicEl; musicEl = null; musicName = '';
        fadeTo(old, 0, fadeMs, () => { old.pause(); begin(); });
    } else begin();
}
// Looping effects (footsteps, typing, intro ambience): start/stop by name. Safe to call every frame - it only acts on a change.
const loops = {};
export function setLoopSfx(name, on, gain = 1) {
    if (held && on) { if (loops[name]) loops[name].want = true; return; }   // paused from Settings: do not (re)start loops behind it
    try {
        const v = Math.max(0, Math.min(1, vol.master * vol.sfx * gain));
        let L = loops[name];
        if (!L) L = loops[name] = { src: null, g: null, fb: null, want: false, gain: 1 };
        L.want = !!on; L.gain = gain;
        const c = getCtx();
        if (c && buffers[name] && !STREAM[name]) {
            if (L.fb && !L.fb.paused) { L.fb.pause(); }
            if (on && v > 0) {
                wake();
                if (L.src && L.src.context !== c) { try { L.src.stop(); } catch (e) {} L.src = null; L.g = null; }   // the sound engine was rebuilt (Safari tab switch)
                if (!L.src) {
                    L.src = c.createBufferSource(); L.g = c.createGain(); L.src.buffer = buffers[name]; L.src.loop = true;
                    L.src.connect(L.g); L.g.connect(sfxGain); L.src.start(0);
                }
                L.g.gain.value = v;
            } else if (L.src) { try { L.src.stop(); } catch (e) {} L.src.disconnect(); L.src = null; }
        } else {
            if (!on && !L.fb) return;   // never create (and so never start downloading) a sound that is not wanted yet
            if (!STREAM[name]) loadBuffer(name);   // use the plain <audio> element until the fast version is ready
            if (!L.fb) { L.fb = new Audio(`assets/audio/sfx/${STREAM[name] || name}.mp3`); L.fb.loop = true; }
            L.fb.volume = v;
            if (on && v > 0) { if (L.fb.paused) L.fb.play().catch(() => {}); }
            else if (!L.fb.paused) { L.fb.pause(); L.fb.currentTime = 0; }
        }
    } catch (e) {}
}
// Re-apply loops once their fast buffers have decoded or the volume changes.
function refreshLoops() { if (held) return; for (const n of Object.keys(loops)) setLoopSfx(n, loops[n].want, loops[n].gain); }
setInterval(refreshLoops, 1500);
export function setVolume(kind, v) {
    vol[kind] = Math.max(0, Math.min(1, v));
    try { localStorage.setItem(VOL_KEY, JSON.stringify(vol)); } catch (e) {}
    if (musicEl) { clearInterval(musicEl._fade); musicEl.volume = musicTarget(); }
    refreshLoops();
}
export function getVolumes() { return { ...vol }; }
// First click/key of the session: start whatever music we were waiting to play.
let unlocked = false;
const unlock = () => {
    getCtx(); wake();
    // (Re)start the wanted song if nothing is actually playing - e.g. after the page was reloaded, restored from the back button, or Safari paused it.
    if (wantMusic && !musicBusy && (!musicEl || musicEl.paused)) playMusic(wantMusic);
    unlocked = true;
};
window.addEventListener('pageshow', () => { if (wantMusic && !musicBusy && (!musicEl || musicEl.paused)) playMusic(wantMusic); });
export function audioNeedsClick() { return vol.master > 0 && !unlocked; }
window.addEventListener('pointerdown', unlock, { once: false });
window.addEventListener('keydown', unlock, { once: false });
