/* Goodbye Goth - keyboard bindings. One place decides which key does which action.
   Defaults can be changed in Settings > Controls > CUSTOMISE (saved in the browser).
   Arrow keys always move too, and the mouse (right click dodge) is not rebindable. Saving lives in Settings (no key). */
const KEY = 'goodbyeGothControls_v1';
export const ACTIONS = [
    { id: 'up', label: 'Move up' },
    { id: 'down', label: 'Move down' },
    { id: 'left', label: 'Move left' },
    { id: 'right', label: 'Move right' },
    { id: 'jump', label: 'Jump / interact' },
    { id: 'dodge', label: 'Dodge' },
    { id: 'attack', label: 'Punch' },
    { id: 'heavy', label: 'Heavy attack' },
    { id: 'inventory', label: 'Inventory (backpack)' }
];
export const DEFAULTS = { up: 'w', down: 's', left: 'a', right: 'd', jump: ' ', dodge: 'r', attack: 'x', heavy: 'z', inventory: 'y' };
const ARROWS = { arrowup: 'up', arrowdown: 'down', arrowleft: 'left', arrowright: 'right' };
const RESERVED = new Set(['o', 'escape', 'tab', 'enter', '`', 'f5', 'f11', 'f12', 'meta', 'control', 'alt', 'shift', 'capslock']);

let map = { ...DEFAULTS };
try {
    const saved = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (saved && typeof saved === 'object') {
        const merged = { ...DEFAULTS };
        for (const a of ACTIONS) if (typeof saved[a.id] === 'string' && saved[a.id]) merged[a.id] = saved[a.id];
        // keep only if no key is used twice
        if (new Set(Object.values(merged)).size === ACTIONS.length) map = merged;
    }
} catch (e) {}

function persist() { try { localStorage.setItem(KEY, JSON.stringify(map)); } catch (e) {} }
export function getBindings() { return { ...map }; }
export function isDefault() { return ACTIONS.every(a => map[a.id] === DEFAULTS[a.id]); }
export function actionForKey(key) {
    const k = String(key || '').toLowerCase();
    for (const a of ACTIONS) if (map[a.id] === k) return a.id;
    return ARROWS[k] || null;
}
/* Give `action` the key `key`. If another action already uses it, the two swap keys. Returns false for keys we don't allow. */
export function setBinding(action, key) {
    const k = String(key || '').toLowerCase();
    if (!ACTIONS.some(a => a.id === action) || !k || RESERVED.has(k) || k.length > 1 && !/^(f\d{1,2}|arrow\w+|backspace|delete|insert|home|end|pageup|pagedown)$/.test(k)) return false;
    if (k.startsWith('arrow')) return false;       // arrows are always movement
    const other = ACTIONS.find(a => a.id !== action && map[a.id] === k);
    if (other) map[other.id] = map[action];
    map[action] = k;
    persist(); return true;
}
/* Drag and drop: swap the keys of two actions. */
export function swapBindings(a, b) {
    if (a === b || !(a in map) || !(b in map)) return;
    const t = map[a]; map[a] = map[b]; map[b] = t; persist();
}
export function resetBindings() { map = { ...DEFAULTS }; persist(); }
export function keyLabel(key) {
    const k = String(key || '');
    if (k === ' ') return 'SPACE';
    return k.length === 1 ? k.toUpperCase() : k.toUpperCase();
}

/* ---- V9.69: controller buttons (Gamepad API "standard" numbering) ---- */
const PAD_KEY = 'goodbyeGothPad_v1';
export const PAD_ACTIONS = ['jump', 'dodge', 'attack', 'heavy', 'inventory'];
export const PAD_DEFAULTS = { jump: 0, dodge: 1, attack: 2, heavy: 3, inventory: 8 };
export const PAD_NAMES = { 0: 'A', 1: 'B', 2: 'X', 3: 'Y', 4: 'LB', 5: 'RB', 6: 'LT', 7: 'RT', 8: 'VIEW', 9: 'START' };
export const PAD_ALLOWED = [0, 1, 2, 3, 4, 5, 6, 7, 8];     // Start, D-pad and sticks stay fixed
let padMap = { ...PAD_DEFAULTS };
try {
    const saved = JSON.parse(localStorage.getItem(PAD_KEY) || 'null');
    if (saved && typeof saved === 'object') {
        const merged = { ...PAD_DEFAULTS };
        for (const a of PAD_ACTIONS) if (PAD_ALLOWED.includes(saved[a])) merged[a] = saved[a];
        if (new Set(Object.values(merged)).size === PAD_ACTIONS.length) padMap = merged;
    }
} catch (e) {}
function persistPad() { try { localStorage.setItem(PAD_KEY, JSON.stringify(padMap)); } catch (e) {} }
export function getPadBindings() { return { ...padMap }; }
export function isPadDefault() { return PAD_ACTIONS.every(a => padMap[a] === PAD_DEFAULTS[a]); }
export function padLabel(i) { return PAD_NAMES[i] || ('BTN ' + i); }
/* Give `action` the button `btn`; if another action has it, the two swap. */
export function setPadBinding(action, btn) {
    if (!PAD_ACTIONS.includes(action) || !PAD_ALLOWED.includes(btn)) return false;
    const other = PAD_ACTIONS.find(a => a !== action && padMap[a] === btn);
    if (other) padMap[other] = padMap[action];
    padMap[action] = btn; persistPad(); return true;
}
export function resetPad() { padMap = { ...PAD_DEFAULTS }; persistPad(); }

/* On-screen prompts: show the keyboard key, or the controller button once a controller is being used. */
let padOn = false;
const EXTRA = { move: ['WASD / ARROWS', 'STICK / D-PAD'], settings: ['O', 'START'], interact: ['LEFT CLICK / ENTER', 'A'] };
export function actionHint(act) {
    if (EXTRA[act]) return EXTRA[act][padOn ? 1 : 0];
    if (padOn && PAD_ACTIONS.includes(act)) return padLabel(padMap[act]);
    return keyLabel(map[act]);
}
export function hintHTML(act) { return '<span class="gg-hint" data-act="' + act + '">' + actionHint(act) + '</span>'; }
export function refreshHints() { document.querySelectorAll('.gg-hint').forEach(e => { e.textContent = actionHint(e.dataset.act); }); }
export function setUsingPad(v) { v = !!v; if (padOn === v) return; padOn = v; refreshHints(); }
export function isUsingPad() { return padOn; }
