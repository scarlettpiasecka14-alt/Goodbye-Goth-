/* Goodbye Goth - settings screen (sound, brightness, fullscreen, controls list).
   Everything is built here and lives on <body>, so it survives the game swapping screens.
   Opened from the title menu (SETTINGS) and the small gear button; closes with Esc or CLOSE. */
import { getVolumes, setVolume } from './audio.js';

const BRIGHT_KEY = 'goodbyeGothBrightness_v1';
let brightness = 100;
try { const b = parseInt(localStorage.getItem(BRIGHT_KEY), 10); if (b >= 50 && b <= 130) brightness = b; } catch (e) {}

const CSS = `
.gg-gear{position:fixed;top:10px;left:50%;transform:translateX(-50%);z-index:900;width:38px;height:38px;border-radius:50%;
  border:1px solid rgba(239,183,201,.4);background:rgba(18,12,22,.72);color:#f6eaf0;font-size:20px;line-height:1;cursor:pointer;opacity:.75;
  display:flex;align-items:center;justify-content:center;padding:0}
.gg-gear:hover,.gg-gear:focus-visible{opacity:1;background:rgba(64,32,64,.9)}
.gg-bright{position:fixed;inset:0;z-index:20000;pointer-events:none;opacity:0}
.gg-settings{position:fixed;inset:0;z-index:10000;display:none;align-items:center;justify-content:center;background:rgba(6,4,10,.82);
  font-family:Georgia,serif;color:#f6eaf0}
.gg-settings.open{display:flex}
.gg-card{width:min(560px,92vw);max-height:92vh;overflow:auto;background:#17101c;border:1px solid rgba(239,183,201,.45);border-radius:18px;padding:22px 26px;
  box-shadow:0 0 40px rgba(231,135,173,.18)}
.gg-card h1{margin:0 0 14px;font-size:26px;letter-spacing:.18em;text-align:center}
.gg-card h2{margin:18px 0 8px;font-size:13px;letter-spacing:.18em;color:#e787ad}
.gg-row{display:grid;grid-template-columns:130px 1fr 52px;align-items:center;gap:12px;margin:9px 0;font-size:15px}
.gg-row output{text-align:right;font-family:system-ui,sans-serif;font-size:13px;opacity:.85}
.gg-row input[type=range]{width:100%;accent-color:#e787ad}
.gg-btns{display:flex;gap:10px;flex-wrap:wrap;margin-top:6px}
.gg-btn{flex:1;min-width:140px;padding:10px 14px;border-radius:10px;border:1px solid rgba(239,183,201,.5);background:#2a1a30;color:#f6eaf0;
  font:700 14px Georgia,serif;letter-spacing:.1em;cursor:pointer}
.gg-btn:hover,.gg-btn:focus-visible{background:#402040}
.gg-btn.primary{background:#7a2f55}
.gg-keys{display:grid;grid-template-columns:auto 1fr;gap:5px 16px;font-size:14px;margin:0}
.gg-keys dt{font-family:system-ui,sans-serif;font-weight:700;font-size:12px;letter-spacing:.06em;color:#efb7c9;white-space:nowrap}
.gg-keys dd{margin:0}
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
export function openSettings() { if (!overlay) initSettings(); overlay.classList.add('open'); refreshSoundBtn(); overlay.querySelector('#gg-close').focus(); }
export function closeSettings() { overlay?.classList.remove('open'); }

export function initSettings() {
    if (overlay) return;
    const style = document.createElement('style'); style.textContent = CSS; document.head.appendChild(style);

    bright = document.createElement('div'); bright.className = 'gg-bright'; document.body.appendChild(bright); applyBrightness();

    const gear = document.createElement('button');
    gear.className = 'gg-gear'; gear.type = 'button'; gear.title = 'Settings'; gear.setAttribute('aria-label', 'Settings'); gear.textContent = '⚙';
    gear.addEventListener('click', openSettings); document.body.appendChild(gear);

    overlay = document.createElement('div'); overlay.className = 'gg-settings'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-label', 'Settings');
    overlay.innerHTML = `
      <div class="gg-card">
        <h1>SETTINGS</h1>
        <h2>SOUND</h2>
        <div class="gg-btns"><button id="gg-sound" class="gg-btn" type="button"></button></div>
        <div class="gg-row"><label for="gg-master">Master volume</label><input id="gg-master" type="range" min="0" max="100" step="5"><output id="gg-master-out"></output></div>
        <div class="gg-row"><label for="gg-music">Music</label><input id="gg-music" type="range" min="0" max="100" step="5"><output id="gg-music-out"></output></div>
        <div class="gg-row"><label for="gg-sfx">Sound effects</label><input id="gg-sfx" type="range" min="0" max="100" step="5"><output id="gg-sfx-out"></output></div>
        <h2>DISPLAY</h2>
        <div class="gg-row"><label for="gg-bright">Brightness</label><input id="gg-bright" type="range" min="50" max="130" step="5"><output id="gg-bright-out"></output></div>
        <div class="gg-btns"><button id="gg-full" class="gg-btn" type="button">⛶ FULLSCREEN</button></div>
        <h2>CONTROLS</h2>
        <dl class="gg-keys">
          <dt>WASD / ARROWS</dt><dd>Move</dd><dt>SPACE</dt><dd>Jump</dd><dt>LEFT CLICK</dt><dd>Attack / interact</dd>
          <dt>RIGHT CLICK</dt><dd>Roll (dodge)</dd><dt>ENTER</dt><dd>Interact</dd><dt>Y</dt><dd>Open inventory</dd><dt>X</dt><dd>Save game</dd>
        </dl>
        <p class="gg-note">Controller support and changing keys are planned.</p>
        <div class="gg-btns" style="margin-top:18px"><button id="gg-close" class="gg-btn primary" type="button">CLOSE</button></div>
      </div>`;
    document.body.appendChild(overlay);
    soundBtn = overlay.querySelector('#gg-sound');

    // Keys pressed in the menu must not move Olly or punch.
    for (const type of ['keydown', 'keyup', 'pointerdown', 'mousedown', 'contextmenu'])
        overlay.addEventListener(type, ev => { if (type === 'keydown' && ev.key === 'Escape') closeSettings(); if (type !== 'contextmenu') ev.stopPropagation(); });
    overlay.addEventListener('click', ev => { if (ev.target === overlay) closeSettings(); ev.stopPropagation(); });

    bindSlider('gg-master', () => pct(getVolumes().master), v => { setVolume('master', v / 100); refreshSoundBtn(); });
    bindSlider('gg-music', () => pct(getVolumes().music), v => setVolume('music', v / 100));
    bindSlider('gg-sfx', () => pct(getVolumes().sfx), v => setVolume('sfx', v / 100));
    bindSlider('gg-bright', () => brightness, v => { brightness = v; applyBrightness(); try { localStorage.setItem(BRIGHT_KEY, String(v)); } catch (e) {} });

    soundBtn.addEventListener('click', () => {
        const on = getVolumes().master > 0;
        setVolume('master', on ? 0 : 1);
        const m = overlay.querySelector('#gg-master'); m.value = pct(getVolumes().master); m.dispatchEvent(new Event('input'));
        refreshSoundBtn();
    });
    overlay.querySelector('#gg-full').addEventListener('click', () => {
        try { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); } catch (e) {}
    });
    overlay.querySelector('#gg-close').addEventListener('click', closeSettings);
}
