/* Goodbye Goth - tiny audio system (sound effects + music).
   Sounds live in assets/audio/sfx/<name>.mp3. Music lives in assets/audio/music/map.mp3 (map + story) and
   assets/audio/music/fight.mp3 (fights). A missing file is simply silent, so nothing breaks while files are still being added.
   Volumes are saved in the browser (a settings screen can use setVolume later). */
const VOL_KEY = 'goodbyeGothVolume_v1';
const vol = { master: 0, music: 0.35, sfx: 0.8 };   // master 0 = sound OFF until the player turns it on in Settings
try { Object.assign(vol, JSON.parse(localStorage.getItem(VOL_KEY) || '{}')); } catch (e) {}

const sfxCache = {};
function getSfx(name) {
    if (!sfxCache[name]) {
        const a = new Audio(`assets/audio/sfx/${name}.mp3?v=9700`);
        a.preload = 'auto';
        sfxCache[name] = a;
    }
    return sfxCache[name];
}
export function playSfx(name, gain = 1) {
    try {
        const base = getSfx(name);
        const a = base.cloneNode();                 // lets the same sound overlap itself
        a.volume = Math.max(0, Math.min(1, vol.master * vol.sfx * gain));
        if (a.volume <= 0) return;
        a.play().catch(() => {});
    } catch (e) {}
}
export function playRandomSfx(names, gain = 1) { playSfx(names[Math.floor(Math.random() * names.length)], gain); }
export function preloadSfx(names) { names.forEach(getSfx); }

let musicEl = null, musicName = '', wantMusic = '', fadeTimer = null;
function musicTarget() { return Math.max(0, Math.min(1, vol.master * vol.music)); }
function fadeTo(el, to, ms, done) {
    clearInterval(fadeTimer);
    const from = el.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
    fadeTimer = setInterval(() => {
        i++; el.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
        if (i >= steps) { clearInterval(fadeTimer); if (done) done(); }
    }, 50);
}
/* playMusic('map' | 'fight' | '') - '' stops the music. Browsers only allow sound after a click/tap, so this retries on the next one. */
export function playMusic(name) {
    wantMusic = name;
    if (name === musicName && musicEl && !musicEl.paused) return;
    const start = () => {
        if (!name) { musicName = ''; return; }
        const el = new Audio(`assets/audio/music/${name}.mp3?v=9700`);
        el.loop = true; el.volume = 0;
        el.play().then(() => { musicEl = el; musicName = name; fadeTo(el, musicTarget(), 900); })
            .catch(() => {});
    };
    if (musicEl && musicEl.src) {
        const old = musicEl; musicEl = null; musicName = '';
        fadeTo(old, 0, 500, () => { old.pause(); start(); });
    } else start();
}
export function setVolume(kind, v) {
    vol[kind] = Math.max(0, Math.min(1, v));
    try { localStorage.setItem(VOL_KEY, JSON.stringify(vol)); } catch (e) {}
    if (musicEl) { clearInterval(fadeTimer); musicEl.volume = musicTarget(); }
}
export function getVolumes() { return { ...vol }; }
// First click/key of the session: start whatever music we were waiting to play.
const unlock = () => { if (wantMusic && !musicName) playMusic(wantMusic); };
window.addEventListener('pointerdown', unlock, { once: false });
window.addEventListener('keydown', unlock, { once: false });
