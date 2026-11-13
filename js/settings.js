/* Goodbye Goth - settings screen (sound, brightness, fullscreen, controls list).
   Everything is built here and lives on <body>, so it survives the game swapping screens.
   Opened from the title menu (SETTINGS) or by pressing O anywhere outside a fight; closes with O, Esc or CLOSE. */
import { getVolumes, setVolume } from './audio.js?v=9420';
import { ACTIONS, DEFAULTS, getBindings, swapBindings, setBinding, resetBindings, keyLabel, isDefault } from './controls.js?v=9420';

// V9.30: display / accessibility preferences. Saved in the browser; the game reads window.ggPrefs.
const PREFS_KEY = 'goodbyeGothPrefs_v1';
const PREF_DEFAULTS = { contrast: 100, hud: 100, text: 100, hiContrastText: false, shake: true, fog: true, shadows: true, hiRes: true, crispMap: false, calm: false };
export const prefs = Object.assign({}, PREF_DEFAULTS);
try { Object.assign(prefs, JSON.parse(localStorage.getItem(PREFS_KEY) || '{}')); } catch (e) {}
window.ggPrefs = prefs;
function savePrefs() { try { localStorage.setItem(PREFS_KEY, JSON.stringify(prefs)); } catch (e) {} }
function applyPrefs() {
    const r = document.documentElement, b = document.body;
    r.style.setProperty('--gg-hud', String(prefs.hud / 100));
    r.style.setProperty('--gg-text', String(prefs.text / 100));
    r.style.setProperty('--gg-contrast', String(prefs.contrast / 100));
    if (b) { b.classList.toggle('gg-hc', !!prefs.hiContrastText); b.classList.toggle('gg-calm', !!prefs.calm); }
    const app = document.getElementById('app'); if (app) app.style.filter = prefs.contrast === 100 ? '' : `contrast(${prefs.contrast / 100})`;
}
const BRIGHT_KEY = 'goodbyeGothBrightness_v1';
let brightness = 100;
try { const b = parseInt(localStorage.getItem(BRIGHT_KEY), 10); if (b >= 50 && b <= 130) brightness = b; } catch (e) {}

const CSS = `
.gg-bright{position:fixed;inset:0;z-index:20000;pointer-events:none;opacity:0}
.gg-settings{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(6,4,10,.82);
  font-family:Georgia,serif;color:#f6eaf0}
.gg-settings.open{display:flex}
.gg-card{width:min(600px,92vw);max-height:92vh;overflow:auto;background:#17101c;border:1px solid rgba(239,183,201,.45);border-radius:18px;padding:22px 26px;
  box-shadow:0 0 40px rgba(231,135,173,.18)}
.gg-card h1{margin:0 0 14px;font-size:26px;letter-spacing:.18em;text-align:center}
.gg-card h2{margin:18px 0 8px;font-size:13px;letter-spacing:.18em;color:#e787ad}
.gg-row{display:grid;grid-template-columns:130px 1fr 52px;align-items:center;gap:12px;margin:9px 0;font-size:15px}
.gg-row output{text-align:right;font-family:system-ui,sans-serif;font-size:13px;opacity:.85}
.gg-row input[type=range]{width:100%;accent-color:#e787ad}
.gg-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.gg-top,.gg-modes{margin:0 0 10px}
.gg-btn{flex:1;min-width:140px;padding:10px 14px;border-radius:10px;border:1px solid rgba(239,183,201,.5);background:#2a1a30;color:#f6eaf0;
  font:700 14px Georgia,serif;letter-spacing:.1em;cursor:pointer}
.gg-btn:hover,.gg-btn:focus-visible{background:#402040}
.gg-btn.primary{background:#7a2f55}
.gg-keys{display:grid;grid-template-columns:auto 1fr auto 1fr;gap:5px 14px;font-size:14px;margin:0}
.gg-sec{border-top:1px solid rgba(239,183,201,.2);margin:0}
.gg-sec>summary{list-style:none;cursor:pointer;padding:11px 2px;font-size:13px;letter-spacing:.18em;color:#e787ad;font-weight:700;display:flex;justify-content:space-between;align-items:center;user-select:none}
.gg-sec>summary::-webkit-details-marker{display:none}
.gg-sec>summary::after{content:'▾';font-size:14px;transition:transform .15s}
.gg-sec[open]>summary::after{transform:rotate(180deg)}
.gg-sec>.gg-body{padding:2px 2px 12px}
.gg-toggle{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:9px 0;font-size:15px;cursor:pointer}
.gg-toggle input{width:20px;height:20px;accent-color:#e787ad;cursor:pointer}
.gg-keys dt{font-family:system-ui,sans-serif;font-weight:700;font-size:12px;letter-spacing:.06em;color:#efb7c9;white-space:nowrap}
.gg-keys dd{margin:0}
.gg-tabs{display:flex;gap:8px;margin:0 0 10px}
.gg-tab{flex:1;padding:8px 10px;border-radius:10px;border:1px solid rgba(239,183,201,.4);background:#1f1426;color:#f6eaf0;font:700 13px Georgia,serif;letter-spacing:.1em;cursor:pointer}
.gg-tab[aria-selected=true]{background:#7a2f55;border-color:#efb7c9}
.gg-slots{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}
.gg-slot{display:flex;align-items:center;gap:8px;padding:6px 8px;border:1px dashed rgba(239,183,201,.35);border-radius:10px;background:#1b1221}
.gg-slot.over{border-color:#ffe27a;background:#2c1d33}
.gg-slot.listening{border-color:#ffe27a;box-shadow:0 0 0 2px rgba(255,226,122,.35)}
.gg-keycap{min-width:46px;text-align:center;padding:5px 8px;border-radius:7px;border:1px solid #efb7c9;background:#2a1a30;color:#fff;font:700 12px system-ui,sans-serif;cursor:pointer}
.gg-chip{flex:1;padding:6px 8px;border-radius:8px;background:#7a2f55;font:700 12px system-ui,sans-serif;cursor:grab;user-select:none}
.gg-chip:active{cursor:grabbing}
.gg-note{font-size:12px;opacity:.7;margin:6px 0 0;font-family:system-ui,sans-serif}
`;

let overlay, bright, soundBtn;
const pct = v => Math.round(v * 100);

function applyBrightness() {
    if (!bright) return;
    if (brightness < 100) { bright.style.background = '#000'; bright.style.mixBlendMode = 'normal'; bright.style.opacity = String((100 - brightness) / 100 * 0.85); }
    else if (brightness > 100) { bright.style.background = '#fff'; bright.style.mixBlendMode = 'soft-light'; bright.style.opacity = String((brightness - 100) / 30 * 0.7); }
    else bright.style.opacity = '0';
}
function bindSlider(id, getV, setV) {
    const input = overlay.querySelector('#' + id), out = overlay.querySelector('#' + id + '-out');
    const show = () => { out.textContent = input.value + '%'; };
    input.value = getV(); show();
    input.addEventListener('input', () => { setV(Number(input.value)); show(); });
}
function refreshSoundBtn() {
    const on = getVolumes().master > 0;
    soundBtn.textContent = on ? '🔊 SOUND: ON' : '🔇 SOUND: OFF';
}
// V9.26: opening Settings pauses the game (the fight clock + sound effects); closing it carries on exactly where it stopped.
function announce(open) { try { window.dispatchEvent(new CustomEvent('gg-settings', { detail: { open } })); } catch (e) {} }
export function openSettings() { if (!overlay) initSettings(); const was = overlay.classList.contains('open'); overlay.classList.add('open'); refreshSoundBtn(); overlay.querySelector('#gg-close').focus(); if (!was) announce(true); }
export function closeSettings() { const was = overlay?.classList.contains('open'); overlay?.classList.remove('open'); if (was) announce(false); }

function renderControls() {
    const b = getBindings();
    const def = overlay.querySelector('#gg-controls-default');
    const rows = ACTIONS.map(a => `<dt>${keyLabel(b[a.id])}</dt><dd>${a.label}</dd>`).join('');
    def.innerHTML = `<dl class="gg-keys">${rows}<dt>LEFT CLICK</dt><dd>Attack</dd><dt>RIGHT CLICK</dt><dd>Dodge</dd><dt>ARROW KEYS</dt><dd>Also move</dd></dl>` +
        (isDefault() ? '' : '<p class="gg-note">These are your customised keys. Press RESET TO DEFAULT in Customise to go back.</p>');
    const slots = overlay.querySelector('#gg-slots'); slots.innerHTML = '';
    for (const a of ACTIONS) {
        const slot = document.createElement('div'); slot.className = 'gg-slot'; slot.dataset.action = a.id;
        const cap = document.createElement('button'); cap.type = 'button'; cap.className = 'gg-keycap'; cap.textContent = keyLabel(b[a.id]); cap.title = 'Click, then press a key';
        const chip = document.createElement('div'); chip.className = 'gg-chip'; chip.textContent = a.label; chip.draggable = true;
        chip.addEventListener('dragstart', ev => { ev.dataTransfer.setData('text/plain', a.id); ev.dataTransfer.effectAllowed = 'move'; });
        slot.addEventListener('dragover', ev => { ev.preventDefault(); slot.classList.add('over'); });
        slot.addEventListener('dragleave', () => slot.classList.remove('over'));
        slot.addEventListener('drop', ev => { ev.preventDefault(); slot.classList.remove('over'); const from = ev.dataTransfer.getData('text/plain'); if (from) { swapBindings(from, a.id); renderControls(); } });
        cap.addEventListener('click', () => {
            slot.classList.add('listening'); cap.textContent = 'press…';
            const onKey = ev => {
                ev.preventDefault(); ev.stopPropagation(); window.removeEventListener('keydown', onKey, true);
                if (ev.key !== 'Escape') setBinding(a.id, ev.key);
                renderControls();
            };
            window.addEventListener('keydown', onKey, true);
        });
        slot.append(cap, chip); slots.appendChild(slot);
    }
}
function showControlsTab(custom) {
    overlay.querySelector('#gg-controls-default').hidden = custom;
    overlay.querySelector('#gg-controls-custom').hidden = !custom;
    overlay.querySelector('#gg-tab-default').setAttribute('aria-selected', String(!custom));
    overlay.querySelector('#gg-tab-custom').setAttribute('aria-selected', String(custom));
    renderControls();
}

export function initSettings() {
    if (overlay) return;
    const style = document.createElement('style'); style.textContent = CSS + `
.gg-gear{position:fixed;left:6px;bottom:6px;z-index:900;width:34px;height:34px;border-radius:50%;border:1px solid rgba(217,139,168,.5);background:rgba(20,12,24,.78);color:#e9c9d8;font-size:19px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0}
.gg-gear:hover{background:rgba(60,28,50,.92);color:#fff}`; document.head.appendChild(style);
    const gear = document.createElement('button');
    gear.className = 'gg-gear'; gear.type = 'button'; gear.title = 'Settings (O)'; gear.setAttribute('aria-label', 'Settings'); gear.textContent = '⚙';
    gear.addEventListener('click', () => { gear.blur(); openSettings(); }); document.body.appendChild(gear);

    bright = document.createElement('div'); bright.className = 'gg-bright'; document.body.appendChild(bright); applyBrightness();

    // O opens/closes Settings (also in a fight: it pauses the fight).
    window.addEventListener('keydown', ev => {
        if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.repeat) return;
        if (ev.key !== 'o' && ev.key !== 'O') return;
        if (ev.target && /^(INPUT|TEXTAREA)$/.test(ev.target.tagName) && ev.target.type !== 'checkbox' && ev.target.type !== 'range') return;   // V9.32: typing a cheat code must not open Settings
        if (overlay.classList.contains('open')) { if (!overlay.querySelector('.gg-slot.listening')) closeSettings(); return; }
        openSettings();
    }, true);

    overlay = document.createElement('div'); overlay.className = 'gg-settings'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-label', 'Settings');
    overlay.innerHTML = `
      <div class="gg-card">
        <h1>SETTINGS</h1>
        <div class="gg-btns gg-top"><button id="gg-full" class="gg-btn" type="button">⛶ FULLSCREEN</button></div>
        <details class="gg-sec"><summary>GAME</summary><div class="gg-body">
          <div class="gg-btns"><button id="gg-save" class="gg-btn" type="button">💾 SAVE GAME</button><button id="gg-savequit" class="gg-btn" type="button">💾 SAVE AND QUIT</button></div>
          <p class="gg-note" id="gg-save-note">The game also saves itself every few seconds. Save and Quit saves and takes you back to the title screen; use LOAD GAME there to come back.</p>
        </div></details>
        <details class="gg-sec"><summary>SOUND</summary><div class="gg-body">
          <div class="gg-btns"><button id="gg-sound" class="gg-btn" type="button"></button></div>
          <div class="gg-row"><label for="gg-master">Master volume</label><input id="gg-master" type="range" min="0" max="100" step="5"><output id="gg-master-out"></output></div>
          <div class="gg-row"><label for="gg-music">Music</label><input id="gg-music" type="range" min="0" max="100" step="5"><output id="gg-music-out"></output></div>
          <div class="gg-row"><label for="gg-sfx">Sound effects</label><input id="gg-sfx" type="range" min="0" max="100" step="5"><output id="gg-sfx-out"></output></div>
        </div></details>
        <details class="gg-sec"><summary>DISPLAY</summary><div class="gg-body">
          <div class="gg-row"><label for="gg-bright">Brightness</label><input id="gg-bright" type="range" min="50" max="130" step="5"><output id="gg-bright-out"></output></div>
          <div class="gg-row"><label for="gg-contrast">Contrast</label><input id="gg-contrast" type="range" min="80" max="140" step="5"><output id="gg-contrast-out"></output></div>
          <div class="gg-row"><label for="gg-hud">HUD size</label><input id="gg-hud" type="range" min="70" max="150" step="5"><output id="gg-hud-out"></output></div>
          <div class="gg-row"><label for="gg-text">Text size</label><input id="gg-text" type="range" min="80" max="150" step="5"><output id="gg-text-out"></output></div>
          <label class="gg-toggle"><span>High-contrast text</span><input id="gg-hc" type="checkbox"></label>
        </div></details>
        <details class="gg-sec"><summary>EFFECTS &amp; QUALITY</summary><div class="gg-body">
          <label class="gg-toggle"><span>Screen shake</span><input id="gg-shake" type="checkbox"></label>
          <label class="gg-toggle"><span>Fog on the map</span><input id="gg-fog" type="checkbox"></label>
          <label class="gg-toggle"><span>Shadows under characters</span><input id="gg-shadows" type="checkbox"></label>
          <label class="gg-toggle"><span>Reduce flashing &amp; pulsing</span><input id="gg-calm" type="checkbox"></label>
          <label class="gg-toggle"><span>Sharp picture (full screen resolution)</span><input id="gg-hires" type="checkbox"></label>
          <label class="gg-toggle"><span>Crisp pixel map (instead of smooth)</span><input id="gg-crisp" type="checkbox"></label>
          <p class="gg-note">If the game ever feels slow, turn off Sharp picture, Fog or Shadows.</p>
        </div></details>
        <details class="gg-sec"><summary>CONTROLS</summary><div class="gg-body">
          <div class="gg-tabs" role="tablist">
            <button class="gg-tab" id="gg-tab-default" role="tab" type="button">DEFAULT</button>
            <button class="gg-tab" id="gg-tab-custom" role="tab" type="button">CUSTOMISE</button>
          </div>
          <div id="gg-controls-default"></div>
          <div id="gg-controls-custom" hidden>
            <div class="gg-slots" id="gg-slots"></div>
            <p class="gg-note">Drag an action onto another box to swap keys, or click a key and press the one you want. Arrow keys always move, X punches, right click dodges.</p>
            <div class="gg-btns"><button id="gg-reset-keys" class="gg-btn" type="button">RESET TO DEFAULT</button></div>
          </div>
        </div></details>
        <div class="gg-btns" style="margin-top:14px"><button id="gg-close" class="gg-btn primary" type="button">CLOSE</button></div>
      </div>`;
    document.body.appendChild(overlay);
    soundBtn = overlay.querySelector('#gg-sound');

    // Keys pressed in the menu must not move Olly or punch.
    for (const type of ['keydown', 'keyup', 'pointerdown', 'mousedown', 'contextmenu'])
        overlay.addEventListener(type, ev => { if (type === 'keydown' && ev.key === 'Escape') closeSettings(); if (type !== 'contextmenu') ev.stopPropagation(); });
    overlay.addEventListener('click', ev => { if (ev.target === overlay && !dragMoved) closeSettings(); dragMoved = false; ev.stopPropagation(); });
    // V9.26: drag the title bar to move the Settings window (handy for screenshots); the eye button makes the dark backdrop clear.
    const card = overlay.querySelector('.gg-card'), title = overlay.querySelector('.gg-card h1');
    title.style.cursor = 'move'; title.title = 'Drag to move'; title.style.userSelect = 'none'; title.style.touchAction = 'none';
    let dragMoved = false, offX = 0, offY = 0, drag = null;
    const place = () => { card.style.transform = `translate(${offX}px,${offY}px)`; };
    title.addEventListener('pointerdown', ev => { drag = { x: ev.clientX - offX, y: ev.clientY - offY }; dragMoved = false; try { title.setPointerCapture(ev.pointerId); } catch (e) {} });
    title.addEventListener('pointermove', ev => { if (!drag) return; offX = ev.clientX - drag.x; offY = ev.clientY - drag.y; dragMoved = true; place(); });
    const endDrag = () => { drag = null; };
    title.addEventListener('pointerup', endDrag); title.addEventListener('pointercancel', endDrag);
    // V9.31: the old "clear background" toggle is now two buttons: DARK MODE (dark backdrop) and LIGHT MODE (see-through backdrop).
    const modes = document.createElement('div'); modes.className = 'gg-btns gg-modes';
    modes.innerHTML = '<button type="button" class="gg-btn" id="gg-mode-dark">☾ DARK MODE</button><button type="button" class="gg-btn" id="gg-mode-light">☀ LIGHT MODE</button>';
    const setMode = light => { overlay.classList.toggle('clear', light); overlay.style.background = light ? 'transparent' : ''; modes.querySelector('#gg-mode-dark').classList.toggle('primary', !light); modes.querySelector('#gg-mode-light').classList.toggle('primary', light); };
    modes.querySelector('#gg-mode-dark').addEventListener('click', () => setMode(false));
    modes.querySelector('#gg-mode-light').addEventListener('click', () => setMode(true));
    overlay.querySelector('.gg-top').after(modes); setMode(false);

    bindSlider('gg-master', () => pct(getVolumes().master), v => { setVolume('master', v / 100); refreshSoundBtn(); });
    bindSlider('gg-music', () => pct(getVolumes().music), v => setVolume('music', v / 100));
    bindSlider('gg-sfx', () => pct(getVolumes().sfx), v => setVolume('sfx', v / 100));
    bindSlider('gg-bright', () => brightness, v => { brightness = v; applyBrightness(); try { localStorage.setItem(BRIGHT_KEY, String(v)); } catch (e) {} });

    const prefSlider = (id, key) => bindSlider(id, () => prefs[key], v => { prefs[key] = v; savePrefs(); applyPrefs(); });
    prefSlider('gg-contrast', 'contrast'); prefSlider('gg-hud', 'hud'); prefSlider('gg-text', 'text');
    const prefBox = (id, key) => { const el = overlay.querySelector('#' + id); el.checked = !!prefs[key]; el.addEventListener('change', () => { prefs[key] = el.checked; savePrefs(); applyPrefs(); }); };
    prefBox('gg-hc', 'hiContrastText'); prefBox('gg-shake', 'shake'); prefBox('gg-fog', 'fog'); prefBox('gg-shadows', 'shadows');
    prefBox('gg-calm', 'calm'); prefBox('gg-hires', 'hiRes'); prefBox('gg-crisp', 'crispMap');
    applyPrefs();
    soundBtn.addEventListener('click', () => {
        const on = getVolumes().master > 0;
        setVolume('master', on ? 0 : 1);
        const m = overlay.querySelector('#gg-master'); m.value = pct(getVolumes().master); m.dispatchEvent(new Event('input'));
        refreshSoundBtn();
    });
    overlay.querySelector('#gg-full').addEventListener('click', () => {
        try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) {}
    });
    const saveBtn = overlay.querySelector('#gg-save'), saveNote = overlay.querySelector('#gg-save-note');
    saveBtn.addEventListener('click', () => {
        const ok = typeof window.ggSaveGame === 'function' ? window.ggSaveGame() : null;
        saveNote.textContent = ok === null ? 'Start a game first, then you can save it here.' : ok ? 'Saved ✓ Your progress is stored in this browser.' : 'Save failed. Your browser may be blocking storage.';
        saveBtn.textContent = ok ? '💾 SAVED ✓' : '💾 SAVE GAME';
        setTimeout(() => { saveBtn.textContent = '💾 SAVE GAME'; }, 1800);
    });
    overlay.querySelector('#gg-savequit').addEventListener('click', () => {
        if (typeof window.ggSaveAndQuit === 'function') { window.ggSaveAndQuit(); }
        else { saveNote.textContent = 'Start a game first, then you can save and quit.'; }
    });
    overlay.querySelector('#gg-close').addEventListener('click', closeSettings);
    overlay.querySelector('#gg-tab-default').addEventListener('click', () => showControlsTab(false));
    overlay.querySelector('#gg-tab-custom').addEventListener('click', () => showControlsTab(true));
    overlay.querySelector('#gg-reset-keys').addEventListener('click', () => { resetBindings(); renderControls(); });
    showControlsTab(false);
}
