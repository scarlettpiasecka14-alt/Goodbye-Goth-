/* Goodbye Goth V9.31 - save slots. Three slots in this browser. The slot you are playing in is auto-saved. */
export const SLOT_COUNT = 3;
const ACTIVE_KEY = 'goodbyeGothActiveSlot_v1';
const LEGACY_KEY = 'goodbyeGothSave_v6';          // the single save used before V9.31
const slotKey = n => `goodbyeGothSave_slot${n}`;
const ls = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} }
};
// An old single-slot save becomes slot 1 (only if slot 1 is empty), so nobody loses progress.
(function migrate() {
    const old = ls.get(LEGACY_KEY);
    if (old && !ls.get(slotKey(1))) { ls.set(slotKey(1), old); ls.set(ACTIVE_KEY, '1'); }
})();
export function getActiveSlot() { const n = parseInt(ls.get(ACTIVE_KEY), 10); return n >= 1 && n <= SLOT_COUNT ? n : 1; }
export function setActiveSlot(n) { ls.set(ACTIVE_KEY, String(n)); }
export function activeKey() { return slotKey(getActiveSlot()); }
export function readSlot(n) { try { const r = ls.get(slotKey(n)); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
export function clearSlot(n) { ls.del(slotKey(n)); }
export function slotSummary(n) {
    const s = readSlot(n);
    if (!s) return null;
    const when = s.savedAt ? new Date(s.savedAt) : null;
    return { hp: s.hp, maxHp: s.maxHp, kills: s.kills || 0, when: when && !isNaN(when) ? when.toLocaleString([], { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '' };
}
export function anySave() { for (let i = 1; i <= SLOT_COUNT; i++) if (readSlot(i)) return true; return false; }
