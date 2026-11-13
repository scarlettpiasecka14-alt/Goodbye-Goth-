/* Goodbye Goth - test cheats. Press Cmd+S (Ctrl+S on Windows) or the ` key to open the panel, then type a code and press Enter. Meant for testing, not for the story.
   The level hands us its hooks through level.cheat. */
let panel, hooks = null, badge, godOn = false;
const CSS = `
.gg-cheat{position:fixed;right:14px;bottom:14px;z-index:9000;width:300px;background:#17101c;border:1px solid #e787ad;border-radius:14px;padding:12px 14px;
  font:13px system-ui,sans-serif;color:#f6eaf0;display:none;box-shadow:0 0 24px rgba(0,0,0,.6)}
.gg-cheat.open{display:block}
.gg-cheat h3{margin:0 0 8px;font:700 13px Georgia,serif;letter-spacing:.14em;color:#e787ad}
.gg-cheat button{display:block;width:100%;margin:6px 0;padding:8px 10px;border-radius:9px;border:1px solid rgba(239,183,201,.45);background:#2a1a30;color:#f6eaf0;
  font:700 13px system-ui,sans-serif;text-align:left;cursor:pointer}
.gg-cheat button:hover,.gg-cheat button:focus-visible{background:#402040}
.gg-cheat button.on{background:#7a2f55}
.gg-cheat input{width:100%;box-sizing:border-box;padding:8px 10px;border-radius:9px;border:1px solid #e787ad;background:#0d0810;color:#fff;font:14px system-ui,sans-serif;margin:0 0 4px}
.gg-cheat .gg-cheat-out{min-height:16px;margin:2px 0 6px;font-size:12px;color:#ffd2e2}
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
      <input id="gg-cheat-cmd" type="text" autocomplete="off" spellcheck="false" placeholder="type a code, then Enter (help)">
      <div class="gg-cheat-out" id="gg-cheat-out"></div>
      <button id="gg-cheat-god" type="button"></button>
      <button id="gg-cheat-win" type="button">Skip this fight (win now)</button>
      <button id="gg-cheat-hp" type="button">Refill Olly's HP</button>
      <button id="gg-cheat-heavy" type="button">Unlock Heavy Attack</button>
      <button id="gg-cheat-close" type="button">Close (or press \`)</button>
      <p>Cmd+S (Ctrl+S) or the \` key opens / closes this panel. Type <b>help</b> for the list of codes.</p>`;
    document.body.appendChild(panel);
    for (const t of ['keydown', 'keyup', 'pointerdown', 'mousedown'])
        panel.addEventListener(t, e => { if (t === 'keydown' && (e.key === '`' || e.key === 'Escape')) toggle(false); e.stopPropagation(); });
    panel.querySelector('#gg-cheat-god').addEventListener('click', () => { hooks?.setGod(!hooks.isGod()); sync(); });
    panel.querySelector('#gg-cheat-win').addEventListener('click', () => { hooks?.winFight(); toggle(false); });
    panel.querySelector('#gg-cheat-hp').addEventListener('click', () => hooks?.refillHp());
    panel.querySelector('#gg-cheat-heavy').addEventListener('click', () => hooks?.unlockHeavy());
    panel.querySelector('#gg-cheat-close').addEventListener('click', () => toggle(false));
    const cmd = panel.querySelector('#gg-cheat-cmd'), out = panel.querySelector('#gg-cheat-out');
    cmd.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); out.textContent = runCode(cmd.value); cmd.value = ''; sync(); } });
    window.addEventListener('keydown', e => {
        if (e.repeat) return;
        if (e.key === '`' && document.activeElement !== cmd) { e.preventDefault(); toggle(); }
        else if ((e.metaKey || e.ctrlKey) && !e.altKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); toggle(); }   // overrides the browser's "save page"
    }, true);
    sync();
}
function toggle(force) {
    const open = force === undefined ? !panel.classList.contains('open') : force;
    panel.classList.toggle('open', open); if (open) { sync(); panel.querySelector('#gg-cheat-cmd').focus(); }
}

const HELP = 'Codes: patricia | patricia skip | patricia win | patricia loss | chain goth | chain win | chain loss | zombie goth | zombie win | zombie loss | win | loss | god | god off | heal | heavy | map';
function runCode(raw) {
    if (!hooks) return 'Start a game first.';
    const c = String(raw || '').toLowerCase().replace(/[^a-z ]/g, ' ').replace(/\s+/g, ' ').trim();
    if (!c) return '';
    if (c === 'help' || c === '?') return HELP;
    if (c === 'god' || c === 'god on') { hooks.setGod(true); return 'No damage: ON'; }
    if (c === 'god off') { hooks.setGod(false); return 'No damage: OFF'; }
    if (c === 'heal' || c === 'hp') { hooks.refillHp(); return 'HP refilled.'; }
    if (c === 'heavy') { hooks.unlockHeavy(); return 'Heavy Attack unlocked.'; }
    const m = c.match(/^(patricia|queen goth|chain goth|chain|zombie goth|zombie)(?: (skip|fight|start|win|loss|lose|lost))?$|^(win|loss|lose|lost)$/);
    if (!m) return 'Unknown code. Type help.';
    const who = m[1] ? (m[1].startsWith('chain') ? 'chain' : m[1].startsWith('zombie') ? 'zombie' : 'patricia') : null;
    const act = m[2] || m[3] || 'start';
    const result = act === 'win' ? 'win' : (act === 'loss' || act === 'lose' || act === 'lost') ? 'loss' : null;
    const end = () => result === 'win' ? hooks.winFight() : hooks.loseFight();
    if (!who) return end() ? (result === 'win' ? 'Fight won.' : 'Olly knocked out.') : 'You are not in a fight.';
    if (result && hooks.inFight()) return end() ? (result === 'win' ? 'Fight won.' : 'Olly knocked out.') : 'Could not do that right now.';   // already in a fight: just end it
    if (!hooks.startFight(who, act === 'skip' || !!result)) return 'Go back to the map first (or type win / loss to end the current fight).';
    if (!result) return who + ' fight started.';
    setTimeout(() => { end(); }, who === 'patricia' ? 700 : 2500);
    return who + (result === 'win' ? ' fight started, winning it...' : ' fight started, losing it...');
}
