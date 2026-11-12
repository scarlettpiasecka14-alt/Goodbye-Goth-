/* Goodbye Goth - keyboard bindings. One place decides which key does which action.
   Defaults can be changed in Settings > Controls > CUSTOMISE (saved in the browser).
   Arrow keys always move too, and the mouse (left click punch, right click dodge) is not rebindable. Saving lives in Settings (no key). */
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
