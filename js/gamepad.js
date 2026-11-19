/* Goodbye Goth - controller support (V9.73).
   Works by turning controller buttons into the same key presses the keyboard makes, so every fight and map move
   follows the keyboard bindings. In menus / pop-ups the D-pad or left stick moves a pink highlight, A presses it, B goes back.

   Layout (Xbox style):  stick / D-pad = move (and move the highlight in menus)
     A = jump / interact / select      B = dodge / back      X = punch      Y = heavy attack
     Start = Settings      View (Back) = backpack      bumpers + triggers are kept free for the bow later. */
import { getBindings, getPadBindings, setUsingPad } from './controls.js?v=9730';

const DEAD = 0.5;                 // stick dead zone
const BTN = { A: 0, B: 1, X: 2, Y: 3, VIEW: 8, START: 9, UP: 12, DOWN: 13, LEFT: 14, RIGHT: 15 };
const SKIP = '.story-skip-intro, .skip-cutscene-btn, [class*="skip"]';
const HUD_IDS = new Set(['inventory-button', 'hud-gear', 'gg-gear']);   // always on screen on the map: they do not count as a menu
const CAND = 'summary, button:not(:disabled), [role="button"], input[type="range"]:not(:disabled), input[type="checkbox"]:not(:disabled), select:not(:disabled)';

let capture = null;
let padIndex = -1, rafId = 0;
const held = new Set();           // movement keys we are currently holding down for the game
const prev = { A: false, B: false, X: false, Y: false, VIEW: false, START: false, dir: { up: false, down: false, left: false, right: false } };
let focusEl = null, wasMenu = false, repeatAt = { up: 0, down: 0, left: 0, right: 0 }, usingPad = false;

function pressKey(key, type) {
    if (!key) return;
    window.dispatchEvent(new KeyboardEvent(type, { key, bubbles: true, cancelable: true }));
}
function tapAction(action) { const k = getBindings()[action]; pressKey(k, 'keydown'); pressKey(k, 'keyup'); }
function setMove(dir, on) {
    const k = getBindings()[dir];
    if (!k) return;
    if (on && !held.has(dir)) { held.add(dir); pressKey(k, 'keydown'); }
    else if (!on && held.has(dir)) { held.delete(dir); pressKey(k, 'keyup'); }
}
function releaseAll() { for (const d of [...held]) setMove(d, false); }

/* ---- menu mode: which buttons can the controller reach right now? ---- */
function visible(el) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') return false;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return false;
    const cs = getComputedStyle(el);
    return cs.visibility !== 'hidden' && cs.display !== 'none' && cs.opacity !== '0';
}
function reachable(el) {
    const r = el.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return !el.closest('.gg-settings:not(.open)');   // below the fold of a scrolling page: reached by scrolling to it
    const x = Math.min(innerWidth - 1, Math.max(0, r.left + r.width / 2)), y = Math.min(innerHeight - 1, Math.max(0, r.top + r.height / 2));
    const top = document.elementFromPoint(x, y);
    return !!top && (top === el || el.contains(top) || top.contains(el));   // not hidden under a pop-up
}
function candidates() {
    const out = [];
    for (const el of document.querySelectorAll(CAND)) {
        if (el.closest('#gg-cheat-panel, .gg-cheat')) continue;
        if (el.closest('#combat .combat-arena')) continue;
        if (el.matches(SKIP)) continue;                    // skip buttons are only reached with Start, never by accident
        if (!visible(el) || !reachable(el)) continue;
        out.push(el);
    }
    return out;
}
function menuCandidates() {
    const c = candidates();
    return c.filter(el => !HUD_IDS.has(el.id) && !el.classList.contains('gg-gear') && !el.classList.contains('hud-gear'));      // HUD buttons alone mean "playing the map"
}

function setFocus(el) {
    if (focusEl && focusEl !== el) focusEl.classList.remove('gg-pad-focus');
    focusEl = el;
    if (el) { el.classList.add('gg-pad-focus'); try { el.focus({ preventScroll: true }); el.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) {} }
}
function clearFocus() { if (focusEl) focusEl.classList.remove('gg-pad-focus'); focusEl = null; }
function centre(el) { const r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }
function pickStart(list) {
    const ae = document.activeElement;
    if (ae && list.includes(ae)) return ae;
    const pref = list.find(el => el.id === 'title-art-new');
    if (pref) return pref;
    const prim = list.find(el => el.classList.contains('primary') && !el.classList.contains('inventory-close-button'));
    if (prim) return prim;
    return [...list].sort((a, b) => { const A = centre(a), B = centre(b); return (A.y - B.y) || (A.x - B.x); })[0];
}
function navigate(list, dir) {
    if (!focusEl || !list.includes(focusEl)) { setFocus(pickStart(list)); return; }
    const c0 = centre(focusEl);
    const v = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] }[dir];
    let best = null, bestScore = Infinity;
    for (const el of list) {
        if (el === focusEl) continue;
        const c = centre(el), dx = c.x - c0.x, dy = c.y - c0.y;
        const along = dx * v[0] + dy * v[1];
        if (along <= 2) continue;
        const across = Math.abs(dx * v[1] + dy * v[0]);
        const score = along + across * 2.2;
        if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) setFocus(best);
}
function nudgeSlider(el, dir) {
    const step = Number(el.step) || 1, min = Number(el.min || 0), max = Number(el.max || 100);
    const span = Math.max(step, (max - min) / 20);
    el.value = String(Math.min(max, Math.max(min, Number(el.value) + (dir === 'right' ? span : -span))));
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
}
function goBack() {
    if (document.querySelector('.gg-settings.open')) { tapKey('o'); return; }                 // Settings closes with O
    const back = document.querySelector('.slot-back, .slot-no, #inventory:not(.hidden) #inventory-close, #back-map, #encounter-explore');
    if (back && visible(back)) back.click();                                                    // pop-ups with a single button: B does nothing
}
function tapKey(k) { pressKey(k, 'keydown'); pressKey(k, 'keyup'); }

/* ---- the loop ---- */
function frame(now) {
    rafId = requestAnimationFrame(frame);
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const gp = pads[padIndex] || [...pads].find(p => p && p.connected);
    if (!gp) return;
    padIndex = gp.index;
    const b = i => !!(gp.buttons[i] && gp.buttons[i].pressed);
    const ax = gp.axes[0] || 0, ay = gp.axes[1] || 0;
    const dir = { up: b(BTN.UP) || ay < -DEAD, down: b(BTN.DOWN) || ay > DEAD, left: b(BTN.LEFT) || ax < -DEAD, right: b(BTN.RIGHT) || ax > DEAD };
    if (dir.left && dir.right) dir.left = dir.right = false;
    if (dir.up && dir.down) dir.up = dir.down = false;
    const now2 = {
        A: b(BTN.A), B: b(BTN.B), X: b(BTN.X), Y: b(BTN.Y), VIEW: b(BTN.VIEW), START: b(BTN.START)
    };
    const raw = gp.buttons.map(x => !!(x && x.pressed));
    const rawPrev = prev.raw || [];
    prev.raw = raw;
    if (capture) {                                                   // Settings is waiting for a button to give to an action
        const hit = raw.findIndex((v, i) => v && !rawPrev[i]);
        if (hit >= 0 && hit !== BTN.START && hit < 12) { const cb = capture; capture = null; cb(hit); }
        Object.assign(prev, now2); prev.dir = dir; return;
    }
    const anyInput = now2.A || now2.B || now2.X || now2.Y || now2.VIEW || now2.START || dir.up || dir.down || dir.left || dir.right;
    if (anyInput && !usingPad) { usingPad = true; document.documentElement.classList.add('gg-using-pad'); setUsingPad(true); }
    if (!usingPad) return;
    const pb = getPadBindings();
    const edgeBtn = i => !!raw[i] && !rawPrev[i];
    const edge = k => now2[k] && !prev[k];

    const list = menuCandidates();
    const menu = list.length > 0;
    if (menu !== wasMenu) { releaseAll(); if (!menu) clearFocus(); wasMenu = menu; }

    if (edge('START')) {
        const skip = [...document.querySelectorAll(SKIP)].find(visible);
        if (skip) skip.click(); else tapKey('o');                      // Start skips an intro / cutscene, otherwise opens Settings
    }
    if (edgeBtn(pb.inventory) && (!menu || document.querySelector('#inventory:not(.hidden)'))) tapAction('inventory');

    if (menu) {
        // Highlight moves with D-pad / stick (repeats while held).
        for (const d of ['up', 'down', 'left', 'right']) {
            if (dir[d] && (!prev.dir[d] || now > repeatAt[d])) {
                repeatAt[d] = now + (prev.dir[d] ? 150 : 380);
                if (focusEl && /^(left|right)$/.test(d) && focusEl.matches('input[type="range"]')) nudgeSlider(focusEl, d);
                else navigate(list, d);
            }
        }
        if (!focusEl || !list.includes(focusEl)) setFocus(pickStart(list));
        if (edge('A') && focusEl) focusEl.click();
        if (edge('B')) goBack();
    } else {
        // Playing: stick / D-pad = move, buttons = actions.
        for (const d of ['up', 'down', 'left', 'right']) setMove(d, dir[d]);
        for (const act of ['jump', 'dodge', 'attack', 'heavy']) if (edgeBtn(pb[act])) tapAction(act);
    }
    Object.assign(prev, now2); prev.dir = dir;
}

function toast(msg) {
    let t = document.getElementById('gg-pad-toast');
    if (!t) {
        t = document.createElement('div'); t.id = 'gg-pad-toast';
        t.style.cssText = 'position:fixed;left:50%;top:14px;transform:translateX(-50%);z-index:900;padding:9px 18px;border-radius:12px;background:rgba(24,12,28,.92);border:1px solid rgba(239,135,170,.6);color:#f6e6ee;font:700 13px/1.5 Georgia,serif;text-align:center;letter-spacing:.04em;pointer-events:none;transition:opacity .5s';
        document.body.appendChild(t);
    }
    t.innerHTML = msg; t.style.opacity = '1';
    clearTimeout(toast.t); toast.t = setTimeout(() => { t.style.opacity = '0'; }, 6000);
}

/* Settings > Controls > Controller: wait for the next controller button press. Returns a cancel function. */
export function listenForPadButton(cb) {
    capture = cb;
    if (!rafId) rafId = requestAnimationFrame(frame);
    return () => { if (capture === cb) capture = null; };
}
export function padConnected() { return !!(navigator.getGamepads && [...navigator.getGamepads()].some(p => p && p.connected)); }

export function initGamepad() {
    const css = document.createElement('style');
    css.textContent = '.gg-pad-focus{outline:3px solid #ff7fb5 !important;outline-offset:3px;box-shadow:0 0 18px rgba(255,127,181,.7) !important}';
    document.head.appendChild(css);
    window.addEventListener('gamepadconnected', e => {
        padIndex = e.gamepad ? e.gamepad.index : padIndex;
        if (!rafId) rafId = requestAnimationFrame(frame);
        toast('🎮 Controller connected<br>A jump / select · B dodge / back · X punch · Y heavy attack<br>Start settings · View backpack');
    });
    window.addEventListener('gamepaddisconnected', e => {
        if (!e.gamepad || e.gamepad.index !== padIndex) return;
        releaseAll(); clearFocus(); padIndex = -1; usingPad = false;
        document.documentElement.classList.remove('gg-using-pad'); setUsingPad(false);
        const left = [...(navigator.getGamepads ? navigator.getGamepads() : [])].some(p => p && p.connected);
        if (!left && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
        toast('🎮 Controller disconnected');
    });
    window.addEventListener('blur', releaseAll);
    // Using the keyboard or mouse again hides the highlight.
    const back = () => { if (usingPad) { usingPad = false; document.documentElement.classList.remove('gg-using-pad'); setUsingPad(false); clearFocus(); releaseAll(); } };
    window.addEventListener('mousemove', back, { passive: true });
    window.addEventListener('keydown', e => { if (e.isTrusted) back(); }, true);
    if (navigator.getGamepads && [...navigator.getGamepads()].some(p => p && p.connected)) rafId = requestAnimationFrame(frame);
}
