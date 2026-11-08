/* Goodbye Goth - test cheats. Press the ` key (backtick, left of 1) to open the panel. Meant for testing fights, not for the story.
   The level hands us its hooks through level.cheat. */
let panel, hooks = null, badge, godOn = false;
const CSS = `
.gg-cheat{position:fixed;right:14px;bottom:14px;z-index:9000;width:260px;background:#17101c;border:1px solid #e787ad;border-radius:14px;padding:12px 14px;
  font:13px system-ui,sans-serif;color:#f6eaf0;display:none;box-shadow:0 0 24px rgba(0,0,0,.6)}
.gg-cheat.open{display:block}
.gg-cheat h3{margin:0 0 8px;font:700 13px Georgia,serif;letter-spacing:.14em;color:#e787ad}
.gg-cheat button{display:block;width:100%;margin:6px 0;padding:8px 10px;border-radius:9px;border:1px solid rgba(239,183,201,.45);background:#2a1a30;color:#f6eaf0;
  font:700 13px system-ui,sans-serif;text-align:left;cursor:pointer}
.gg-cheat button:hover,.gg-cheat button:focus-visible{background:#402040}
.gg-cheat button.on{background:#7a2f55}
.gg-cheat p{margin:6px 0 0;opacity:.65;font-size:11px}
.gg-cheat-badge{position:fixed;left:50%;bottom:8px;transform:translateX(-50%);z-index:9000;background:rgba(122,47,85,.92);color:#fff;padding:3px 12px;border-radius:12px;
  font:700 12px system-ui,sans-serif;letter-spacing:.08em;display:none;pointer-events:none}
`;
export function registerCheats(h) { hooks = h; }
function sync() {
    godOn = !!hooks?.isGod();
    panel.querySelector('#gg-cheat-god').classList.toggle('on', godOn);
    panel.querySelector('#gg-cheat-god').textContent = godOn ? 'No damage: ON' : 'No damage: OFF';
    badge.style.display = godOn ? 'block' : 'none';
    badge.textContent = 'CHEAT: NO DAMAGE';
}
export function initCheats() {
    if (panel) return;
    const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
    badge = document.createElement('div'); badge.className = 'gg-cheat-badge'; document.body.appendChild(badge);
    panel = document.createElement('div'); panel.className = 'gg-cheat'; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Test cheats');
    panel.innerHTML = `<h3>TEST CHEATS</h3>
      <button id="gg-cheat-god" type="button"></button>
      <button id="gg-cheat-win" type="button">Skip this fight (win now)</button>
      <button id="gg-cheat-hp" type="button">Refill Olly's HP</button>
      <button id="gg-cheat-heavy" type="button">Unlock Heavy Attack</button>
      <button id="gg-cheat-close" type="button">Close (or press \`)</button>
      <p>Press the \` key anywhere to open or close this panel.</p>`;
    document.body.appendChild(panel);
    for (const t of ['keydown', 'keyup', 'pointerdown', 'mousedown'])
        panel.addEventListener(t, e => { if (t === 'keydown' && (e.key === '`' || e.key === 'Escape')) toggle(false); e.stopPropagation(); });
    panel.querySelector('#gg-cheat-god').addEventListener('click', () => { hooks?.setGod(!hooks.isGod()); sync(); });
    panel.querySelector('#gg-cheat-win').addEventListener('click', () => { hooks?.winFight(); toggle(false); });
    panel.querySelector('#gg-cheat-hp').addEventListener('click', () => hooks?.refillHp());
    panel.querySelector('#gg-cheat-heavy').addEventListener('click', () => hooks?.unlockHeavy());
    panel.querySelector('#gg-cheat-close').addEventListener('click', () => toggle(false));
    window.addEventListener('keydown', e => { if (e.key === '`' && !e.repeat) { e.preventDefault(); toggle(); } });
    sync();
}
function toggle(force) {
    const open = force === undefined ? !panel.classList.contains('open') : force;
    panel.classList.toggle('open', open); if (open) { sync(); panel.querySelector('#gg-cheat-close').focus(); }
}
