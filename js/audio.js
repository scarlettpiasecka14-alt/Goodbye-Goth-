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
        const a = new Audio(`assets/audio/sfx/${name}.mp3?v=9900`);
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

/* Music "pools": each name plays one file (looping) or a playlist that moves to the next track when one ends.
   Files live in assets/audio/music/. Put the title-screen song at assets/audio/music/menu.mp3. */
const MUSIC = {
    menu: ['menu.mp3'],
    map: ['BackgroundMusicTrack1.mp3', 'BackgroundTrack2.mp3', 'BackgroundTrack3.mp3', 'BackgroundTrack4.mp3'],
    fight: ['fight.mp3']
};
let musicEl = null, musicName = '', wantMusic = '', fadeTimer = null, musicToken = 0;
function musicTarget() { return Math.max(0, Math.min(1, vol.master * vol.music)); }
function fadeTo(el, to, ms, done) {
    clearInterval(fadeTimer);
    const from = el.volume, steps = Math.max(1, Math.round(ms / 50)); let i = 0;
    fadeTimer = setInterval(() => {
        i++; el.volume = Math.max(0, Math.min(1, from + (to - from) * (i / steps)));
        if (i >= steps) { clearInterval(fadeTimer); if (done) done(); }
    }, 50);
}
function startTrack(name, token, list, i) {
    if (token !== musicToken) return;
    const el = new Audio(`assets/audio/music/${list[i]}`);
    el.loop = list.length === 1; el.volume = 0; el.preload = 'auto';
    el.addEventListener('ended', () => { if (token === musicToken && list.length > 1) { musicEl = null; startTrack(name, token, list, (i + 1) % list.length); } });
    el.addEventListener('error', () => { if (token === musicToken && list.length > 1) startTrack(name, token, list, (i + 1) % list.length); });
    el.play().then(() => { if (token !== musicToken) { el.pause(); return; } musicEl = el; musicName = name; fadeTo(el, musicTarget(), 900); }).catch(() => {});
}
/* playMusic('menu' | 'map' | 'fight' | '') - '' stops the music. Browsers only allow sound after a click/tap, so this retries on the next one. */
export function playMusic(name) {
    wantMusic = name;
    if (name === musicName && musicEl && !musicEl.paused) return;
    const token = ++musicToken;
    const begin = () => {
        if (token !== musicToken) return;
        const list = MUSIC[name];
        if (!name || !list) { musicName = ''; return; }
        const first = list.length > 1 ? Math.floor(Math.random() * list.length) : 0;
        startTrack(name, token, list, first);
    };
    if (musicEl) {
        const old = musicEl; musicEl = null; musicName = '';
        fadeTo(old, 0, 500, () => { old.pause(); begin(); });
    } else begin();
}
// Looping effects (footsteps, typing): start/stop by name.
const loops = {};
export function setLoopSfx(name, on, gain = 1) {
    try {
        let a = loops[name];
        if (!a) { a = loops[name] = new Audio(`assets/audio/sfx/${name}.mp3`); a.loop = true; }
        a.volume = Math.max(0, Math.min(1, vol.master * vol.sfx * gain));
        if (on && a.volume > 0) { if (a.paused) a.play().catch(() => {}); }
        else if (!a.paused) { a.pause(); a.currentTime = 0; }
    } catch (e) {}
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
