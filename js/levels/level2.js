/* Goodbye Goth - Level 2 scaffolding ("The Whispering Hollow", part of the Mystical Forest).
   V9.86-preview: map + movement + Tom's hollow/journal meeting + a first playable draft
   of the "Find Scarlett" minigame. NOT wired into the real Level 1 -> Level 2 handoff
   yet (see js/game.js mountLevel2 + the ?level=2 debug entry point). Scope deliberately
   stops here per Scarlett's "don't implement all of this at once" - no real content for
   the princess-question icon yet, no mushroom-jump traversal, no Latin names.

   The "Princess Burrito" minigame that used to live at this spot was moved wholesale to
   level3.js - it didn't fit once Scarlett remembered Level 2 is the Mystical Forest
   (mushroom country), not a food-themed level. A short-lived "Mushroom Reading" game
   (guess which touch meant which mushroom) replaced it briefly, then got swapped for
   this instead, on Scarlett's better idea: a shell/cup game ("find the lady") where
   Olly turns Scarlett into one of three mushroom forms and you have to track which one
   she's under as they shuffle positions, 3 cups then 5 cups, each stage three rounds and
   getting faster. The internal mode name still says 'mushroom' (harmless, just an
   internal state label) from that earlier version.

   Reuses the same camera/world-size constants as level1.js (WORLD_W/H = 1536x1024,
   which is the native resolution of the new map art) so the two levels feel consistent,
   but this file does NOT share any state with level1.js - it's a fully separate module,
   on purpose, so nothing here can affect the real Level 1 playthrough. */

import { playSfx } from '../audio.js?v=9820';

const WORLD_W = 1536, WORLD_H = 1024;
const MAP_ZOOM = 1.5;
const CAM_LEAD_Y = 90;

// Rough spot-check against the map art (assets/environment/level2-map-bg.webp):
// the hollow is the lantern-lit cave on the left edge; the journal icon sits just
// outside its mouth so Olly has to actually walk up to it. Precise values can be
// nudged later once Scarlett reviews this against the real art in-browser.
const TOM_HOLLOW = { x: 150, y: 470 };
const TOM_JOURNAL = { x: 255, y: 505 };
// Placeholder icons reuse Level 1's icon art; the IDs/names already match what
// Scarlett named these two activities for Level 2 in level1.js's LEVEL_ACTIVITY_DATA[2]
// (not live there yet, but the names are hers) so the flavour text lines up once the
// real content goes in.
const MINI_GAME_SPOT = { x: 650, y: 790, name: 'FIND SCARLETT' };
const PRINCESS_Q_SPOT = { x: 1300, y: 230, name: 'Chaos Fairy Goth clue' };

const PLAYER_START = { x: 700, y: 830 };

// Placeholder-only lines, built from the fragments Scarlett already gave for Tom's
// intro ("That's my book, give it back!" / "Huh?" / "Hi, I'm Tom, Tom the Puffle.").
// She said she'll write the full script herself later (a lot of it already exists in
// her cutscene file) - this array is here purely so the trigger mechanism works end to
// end; swap these strings for her real lines whenever she sends them.
const TOM_INTRO_SCRIPT = [
    "Olly picks up a small, battered journal lying by the hollow's entrance...",
    "???: That's my book, give it back!",
    "Olly: Huh?",
    "???: Hi, I'm Tom. Tom the Puffle.",
    "Tom: (placeholder - Scarlett's full intro cutscene goes here, including the hands/writing exchange)",
    "Tom will keep his journal with him from now on. You can hear him shuffling along behind you."
];

// --- Find Scarlett minigame data -----------------------------------------------------
// A shell/cup game ("find the lady"): Olly turns Scarlett into one of these three
// mushroom forms, they shuffle positions, and the player has to track which one she's
// actually under. The three forms are Scarlett's own real mental picture of each size:
// 'mushroom' = a classic red-and-white spotted toadstool, 'tall mushroom' = the tall
// pale shaggy-cap type she sent a reference photo for, 'huge mushroom' = an oyster
// mushroom cluster. Placeholder "programmer art" shapes approximating each - swap for
// real illustrations later without touching any logic below.
const MUSHROOM_TYPES = [
    { id: 'small', label: 'MUSHROOM' },
    { id: 'tall', label: 'TALL MUSHROOM' },
    { id: 'huge', label: 'HUGE MUSHROOM' }
];
// Six rounds: the 3-mushroom shuffle three times, then the 5-mushroom shuffle three
// times, each stage getting faster (more swaps, less time per swap) as it goes -
// Scarlett's "3 mushrooms can be 3x and the 5 mushrooms 3x as well". Tune freely.
const SHELL_ROUNDS = [
    { count: 3, swaps: 4, swapTime: .55 },
    { count: 3, swaps: 6, swapTime: .45 },
    { count: 3, swaps: 8, swapTime: .35 },
    { count: 5, swaps: 7, swapTime: .5 },
    { count: 5, swaps: 10, swapTime: .4 },
    { count: 5, swaps: 13, swapTime: .32 }
];
const REVEAL_SECONDS = 1.6;   // how long Scarlett is shown peeking out before the shuffle starts

const mapBackground = new Image();
mapBackground.src = 'assets/environment/level2-map-bg.webp';

const ollySprite = {
    front: new Image(), back: new Image(), left: new Image(), right: new Image()
};
// V1 reuses Level 1's map-walk art directly (same character, same poses) rather than
// duplicating the asset. If Scarlett wants Olly's Level 2 look to differ later, point
// these at new files.
ollySprite.front.src = 'assets/characters/map/olly-walk-front.webp?v=7700';
ollySprite.back.src = 'assets/characters/map/olly-walk-back.webp?v=7700';
ollySprite.left.src = 'assets/characters/map/olly-walk-right.webp?v=7700';
ollySprite.right.src = 'assets/characters/map/olly-walk-left.webp?v=7700';

const tomSprite = new Image();
tomSprite.src = 'assets/characters/tom/tom-front.webp';
// No back/side sprite yet (Scarlett: "I don't have the back of Tom yet") - he's drawn
// front-on regardless of travel direction until that art exists.

const journalIcon = new Image();
journalIcon.src = 'assets/icons/tom-journal.webp';
const miniGameIcon = new Image();
miniGameIcon.src = 'assets/icons/relationship-challenge.webp?v=9420';
const princessQIcon = new Image();
princessQIcon.src = 'assets/icons/princess-question.webp?v=9420';

const SH = a => `rgba(0,0,0,${a})`;

export function createLevel2(ui) {
    const ctx = ui.canvas.getContext('2d');

    let x = PLAYER_START.x, y = PLAYER_START.y;
    let cameraX = x, cameraY = y - CAM_LEAD_Y;
    let mapDir = 'down', walkDir = 'down', facingDir = 'right';
    const held = { up: false, down: false, left: false, right: false };

    let metTom = false;
    let tomX = TOM_HOLLOW.x, tomY = TOM_HOLLOW.y;   // eased toward a trailing position once he's following
    let dialogueQueue = null, dialogueIdx = 0;
    let raf = 0, lastT = 0;

    // 'map' | 'mushroom'
    let mode = 'map';

    // --- Find Scarlett runtime state ---
    let fsRoundIdx = 0;
    let fsPhase = 'reveal';   // 'reveal' | 'shuffle' | 'guess' | 'resolve' | 'gameEnd'
    let fsPhaseT = 0;
    let fsScore = 0;
    let fsMushrooms = [];      // this round's { id, type, slot } entries
    let fsScarlettId = null;   // which mushroom id she's actually under
    let fsSwapQueue = [];      // [[slotA, slotB], ...] for the current round's shuffle
    let fsSwapIdx = 0;
    let fsGuessedId = null;
    let fsResolveOk = false;
    let mistScroll = 0;

    function near(px, py, r) { return Math.hypot(x - px, y - py) < r; }

    function setMoveKey(key, down) {
        if (mode === 'mushroom') return;
        const k = (key || '').toLowerCase();
        if (dialogueQueue) return;   // can't walk mid-cutscene
        if (down) {
            if (k === 'arrowup' || k === 'w') mapDir = 'up';
            else if (k === 'arrowdown' || k === 's') mapDir = 'down';
            else if (k === 'arrowleft' || k === 'a') mapDir = 'left';
            else if (k === 'arrowright' || k === 'd') mapDir = 'right';
            walkDir = mapDir;
            facingDir = mapDir === 'left' ? 'left' : 'right';
        }
        if (k === 'arrowup' || k === 'w') held.up = down;
        if (k === 'arrowdown' || k === 's') held.down = down;
        if (k === 'arrowleft' || k === 'a') held.left = down;
        if (k === 'arrowright' || k === 'd') held.right = down;
    }

    function updateMovement(dt) {
        if (dialogueQueue) { walkPulse = 0; return; }
        const speed = 240;
        let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
        let dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
        if (!dx && !dy) { walkPulse = 0; return; }
        const len = Math.hypot(dx, dy) || 1;
        const nx = Math.max(40, Math.min(WORLD_W - 40, x + dx / len * speed * dt));
        const ny = Math.max(40, Math.min(WORLD_H - 40, y + dy / len * speed * dt));
        // V1 collision: just the world edges, per Scarlett ("doesn't need to be perfect").
        // A real hand-authored walk mask (like level1.js's WALK_RLE) can come later.
        x = nx; y = ny; walkPulse = 1;
    }
    let walkPulse = 0;

    function advanceDialogue() {
        if (!dialogueQueue) return;
        dialogueIdx++;
        if (dialogueIdx >= dialogueQueue.length) {
            dialogueQueue = null;
            ui.dialogue.textContent = metTom
                ? "Tom hops along beside you, journal tucked under one arm."
                : '';
        } else {
            ui.dialogue.textContent = dialogueQueue[dialogueIdx];
        }
    }

    function startTomMeeting() {
        metTom = true;
        dialogueQueue = TOM_INTRO_SCRIPT;
        dialogueIdx = 0;
        ui.dialogue.textContent = dialogueQueue[0];
    }

    function primaryAction() {
        if (mode === 'mushroom') return;
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && near(TOM_JOURNAL.x, TOM_JOURNAL.y, 70)) { startTomMeeting(); return; }
        if (near(MINI_GAME_SPOT.x, MINI_GAME_SPOT.y, 70)) { enterMushroomGame(); return; }
        if (near(PRINCESS_Q_SPOT.x, PRINCESS_Q_SPOT.y, 70)) {
            ui.dialogue.textContent = `${PRINCESS_Q_SPOT.name} - nothing here yet.`;
            return;
        }
    }

    // --- Find Scarlett: game logic ---
    function currentRound() { return SHELL_ROUNDS[fsRoundIdx]; }
    function typeFor(id) { return MUSHROOM_TYPES.find(m => m.id === id); }
    function mushroomAtSlot(slot) { return fsMushrooms.find(m => m.slot === slot); }

    // 3 cups = one of each type; 5 cups = the 3 types plus 2 repeats - deliberately
    // reuses a type so two mushrooms can look identical, which is what makes tracking
    // the right one through the shuffle an actual challenge once there are 5 of them.
    function buildTypesForCount(count) {
        const base = ['small', 'tall', 'huge'];
        const types = count <= 3 ? base.slice(0, count) : [...base];
        while (types.length < count) types.push(base[types.length % base.length]);
        for (let i = types.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [types[i], types[j]] = [types[j], types[i]];
        }
        return types;
    }
    function buildSwapQueue(count, swaps) {
        const q = [];
        for (let i = 0; i < swaps; i++) {
            const a = Math.floor(Math.random() * count);
            let b; do { b = Math.floor(Math.random() * count); } while (b === a);
            q.push([a, b]);
        }
        return q;
    }

    function enterMushroomGame() {
        mode = 'mushroom';
        fsRoundIdx = 0;
        fsScore = 0;
        startShellRound();
    }
    function exitMushroomGame() {
        mode = 'map';
        ui.dialogue.textContent = `${MINI_GAME_SPOT.name} is quiet again. Last go: ${fsScore}/${SHELL_ROUNDS.length} found.`;
    }
    function startShellRound() {
        const r = currentRound();
        const types = buildTypesForCount(r.count);
        fsMushrooms = types.map((type, i) => ({ id: i, type, slot: i }));
        fsScarlettId = Math.floor(Math.random() * r.count);
        fsSwapQueue = buildSwapQueue(r.count, r.swaps);
        fsSwapIdx = 0;
        fsGuessedId = null;
        fsPhase = 'reveal';
        fsPhaseT = 0;
    }
    function resolveShellRound(ok) {
        fsResolveOk = ok;
        fsPhase = 'resolve';
        fsPhaseT = 0;
        if (ok) { fsScore++; playSfx('round-ok'); } else playSfx('wrong-buzz');
    }
    function advanceShellRound() {
        fsRoundIdx++;
        if (fsRoundIdx >= SHELL_ROUNDS.length) {
            fsPhase = 'gameEnd';
            fsPhaseT = 0;
            playSfx('minigame-win');
            return;
        }
        startShellRound();
    }
    function guessSlot(slot) {
        if (fsPhase !== 'guess') return;
        const m = mushroomAtSlot(slot);
        if (!m) return;
        playSfx('click');
        fsGuessedId = m.id;
        resolveShellRound(m.id === fsScarlettId);
    }
    function updateMushroom(dt) {
        if (fsPhase === 'gameEnd') return;
        fsPhaseT += dt;
        mistScroll += dt * 60;
        const r = currentRound();
        if (fsPhase === 'reveal' && fsPhaseT >= REVEAL_SECONDS) { fsPhase = 'shuffle'; fsPhaseT = 0; }
        else if (fsPhase === 'shuffle') {
            if (fsSwapIdx >= fsSwapQueue.length) { fsPhase = 'guess'; fsPhaseT = 0; }
            else if (fsPhaseT >= r.swapTime) {
                const [a, b] = fsSwapQueue[fsSwapIdx];
                const ma = mushroomAtSlot(a), mb = mushroomAtSlot(b);
                if (ma) ma.slot = b;
                if (mb) mb.slot = a;
                fsSwapIdx++;
                fsPhaseT = 0;
            }
        } else if (fsPhase === 'resolve' && fsPhaseT >= 1.3) advanceShellRound();
    }

    // Evenly-spaced screen slot for a given logical slot index among `count` mushrooms.
    function slotX(slot, count, vw) {
        const spacing = Math.min(230, (vw - 140) / Math.max(1, count - 1 || 1));
        const totalW = spacing * (count - 1);
        return vw / 2 - totalW / 2 + slot * spacing;
    }
    function shellLayout() {
        const exitRect = { x: 20, y: 14, w: 168, h: 34 };
        return { exitRect };
    }

    function roundRect(px, py, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(px + r, py);
        ctx.arcTo(px + w, py, px + w, py + h, r);
        ctx.arcTo(px + w, py + h, px, py + h, r);
        ctx.arcTo(px, py + h, px, py, r);
        ctx.arcTo(px, py, px + w, py, r);
        ctx.closePath();
    }
    function drawTimerBar(px, py, w, h, pct, color) {
        ctx.fillStyle = 'rgba(255,255,255,.14)';
        ctx.fillRect(px, py, w, h);
        ctx.fillStyle = color;
        ctx.fillRect(px, py, w * Math.max(0, Math.min(1, pct)), h);
    }
    function wrapText(text, cx, cy, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '', lines = [];
        for (const w of words) {
            const test = line ? line + ' ' + w : w;
            if (ctx.measureText(test).width > maxWidth && line) { lines.push(line); line = w; }
            else line = test;
        }
        lines.push(line);
        lines.forEach((l, i) => ctx.fillText(l, cx, cy + i * lineHeight));
    }
    // Draws one mushroom "cup" at (cx, floorY), sized/shaped per type. `peek` shows a
    // little lavender glow + eyes at the base when this is the one hiding Scarlett (used
    // during the reveal, and again during resolve to show where she really was); `lifted`
    // tilts/raises the cap like it's being lifted to check underneath, used on resolve.
    function drawMushroomCup(type, cx, floorY, peek, lifted, ring) {
        ctx.save();
        ctx.translate(cx, floorY);
        const lift = lifted ? -18 : 0;
        if (peek) {
            ctx.fillStyle = 'rgba(202,166,255,.85)';
            ctx.beginPath(); ctx.arc(0, -6, 12, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2a1830';
            ctx.beginPath(); ctx.arc(-4, -8, 1.6, 0, Math.PI * 2); ctx.arc(4, -8, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        ctx.translate(0, lift);
        if (type === 'small') {
            // classic red-and-white spotted toadstool
            ctx.fillStyle = '#efe3d6'; roundRect(-6, -34, 12, 34, 4); ctx.fill();
            ctx.fillStyle = '#d14b3f';
            ctx.beginPath(); ctx.ellipse(0, -34, 24, 16, 0, Math.PI, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#fbeee0';
            [[-11, -40], [3, -44], [13, -36]].forEach(([dx, dy]) => { ctx.beginPath(); ctx.arc(dx, dy, 3, 0, Math.PI * 2); ctx.fill(); });
            ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.ellipse(0, -34, 24, 16, 0, Math.PI, Math.PI * 2); ctx.stroke();
        } else if (type === 'tall') {
            // tall, pale, narrow shaggy-cap mushroom
            ctx.fillStyle = '#efe6d2'; roundRect(-5, -58, 10, 58, 4); ctx.fill();
            ctx.fillStyle = '#f3ecd9';
            ctx.beginPath(); ctx.ellipse(0, -62, 14, 26, 0, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 1.5;
            for (let s = -1; s <= 1; s++) { ctx.beginPath(); ctx.moveTo(s * 7, -84); ctx.lineTo(s * 9, -42); ctx.stroke(); }
            ctx.beginPath(); ctx.ellipse(0, -62, 14, 26, 0, 0, Math.PI * 2); ctx.stroke();
        } else {
            // oyster mushroom - a low shelf-cluster of overlapping fans, barely any stem
            ctx.fillStyle = '#efe3d6'; roundRect(-6, -14, 12, 14, 3); ctx.fill();
            const fans = [{ dx: -16, dy: -18, r: 22, a: .95 }, { dx: 10, dy: -22, r: 26, a: 1 }, { dx: -2, dy: -12, r: 20, a: .9 }];
            fans.forEach(f => {
                ctx.save(); ctx.globalAlpha = f.a; ctx.fillStyle = '#cfc9bd';
                ctx.beginPath(); ctx.ellipse(f.dx, f.dy, f.r, f.r * .62, -0.3, Math.PI * .6, Math.PI * 2.1); ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,.18)'; ctx.lineWidth = 1.5; ctx.stroke();
                ctx.restore();
            });
        }
        ctx.restore();
        if (ring) {
            ctx.save();
            ctx.strokeStyle = ring; ctx.lineWidth = 4;
            ctx.beginPath(); ctx.ellipse(cx, floorY + 6, 34, 10, 0, 0, Math.PI * 2); ctx.stroke();
            ctx.restore();
        }
    }

    function drawMushroomGame() {
        const vw = ui.canvas.clientWidth || 1000;
        // V9.84-preview: the #world2 canvas sizes its own CSS box from its width/height
        // HTML attributes' aspect ratio (1536:1024) against whatever width it's given,
        // which comes out taller than the .world-wrap container actually allows - the
        // wrapper clips the overflow (so Level 1/2's map still looks right, since the
        // map's own camera math doesn't care), but it means ui.canvas.clientHeight is
        // NOT the visible height. Lay out the UI against the WRAPPER's height instead,
        // so nothing (the mushrooms especially) ends up positioned in the clipped-off
        // strip below what's actually on screen.
        const canvasVh = ui.canvas.clientHeight || 600;
        const wrap = ui.canvas.parentElement;
        const vh = (wrap && wrap.clientHeight) || canvasVh;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const wantW = Math.max(1536, Math.round(vw * dpr)), wantH = Math.max(1024, Math.round(canvasVh * dpr));
        if (ui.canvas.width !== wantW || ui.canvas.height !== wantH) { ui.canvas.width = wantW; ui.canvas.height = wantH; }
        const sx = ui.canvas.width / vw, sy = ui.canvas.height / canvasVh;
        ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
        ctx.save();
        ctx.scale(sx, sy);

        ctx.fillStyle = '#17241c';
        ctx.fillRect(0, 0, vw, vh);

        const { exitRect } = shellLayout();

        // exit button
        ctx.fillStyle = 'rgba(255,255,255,.1)';
        roundRect(exitRect.x, exitRect.y, exitRect.w, exitRect.h, 8); ctx.fill();
        ctx.fillStyle = '#e4f0df'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('‹ Back to the Hollow', exitRect.x + exitRect.w / 2, exitRect.y + exitRect.h / 2 + 4);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#e4f0df';
        ctx.font = '700 20px Georgia';
        ctx.fillText('FIND SCARLETT', 24, 70);

        if (fsPhase === 'gameEnd') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#e4f0df'; ctx.font = '700 28px Georgia';
            ctx.fillText('That\'s the lot!', vw / 2, vh * .4);
            ctx.font = '600 17px Georgia';
            ctx.fillText(`You found her ${fsScore} / ${SHELL_ROUNDS.length} times.`, vw / 2, vh * .4 + 36);
            ctx.font = '600 13px Georgia'; ctx.fillStyle = '#a8c2a0';
            ctx.fillText('Click anywhere to go again, or Back to the Hollow to leave.', vw / 2, vh * .4 + 64);
            ctx.restore();
            return;
        }

        const r = currentRound();
        ctx.font = '600 13px Georgia'; ctx.fillStyle = '#a8c2a0';
        ctx.fillText(`Round ${fsRoundIdx + 1}/${SHELL_ROUNDS.length} • ${r.count} mushrooms • Score ${fsScore}/${SHELL_ROUNDS.length}`, 24, 92);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#eef9e8'; ctx.font = '700 15px Georgia';
        const prompt = fsPhase === 'reveal' ? "Watch closely - Olly's turning her into one of these..."
            : fsPhase === 'shuffle' ? "He's mixing them up..."
                : fsPhase === 'guess' ? 'Which mushroom is she under now? Click one.'
                    : fsResolveOk ? 'Found her!' : "That wasn't her...";
        ctx.fillText(prompt, vw / 2, 130);

        // misty forest floor the mushrooms stand on
        const floorY = vh * .62, floorBandH = Math.max(80, vh * .16);
        ctx.save();
        ctx.beginPath(); ctx.rect(0, floorY - floorBandH * .6, vw, floorBandH); ctx.clip();
        ctx.fillStyle = '#243a2c';
        ctx.fillRect(0, floorY - floorBandH * .6, vw, floorBandH);
        ctx.strokeStyle = 'rgba(255,255,255,.07)'; ctx.lineWidth = 10;
        const stripe = 46;
        for (let bx = -stripe + (mistScroll % stripe); bx < vw + stripe; bx += stripe) {
            ctx.beginPath(); ctx.moveTo(bx, floorY - floorBandH * .6); ctx.lineTo(bx - floorBandH * .4, floorY + floorBandH * .4); ctx.stroke();
        }
        ctx.restore();

        const activeSwap = (fsPhase === 'shuffle' && fsSwapIdx < fsSwapQueue.length) ? fsSwapQueue[fsSwapIdx] : null;
        const swapT = activeSwap ? Math.min(1, fsPhaseT / r.swapTime) : 0;
        const showPeek = fsPhase === 'reveal' || fsPhase === 'resolve';
        const lifted = fsPhase === 'resolve';

        fsMushrooms.forEach(m => {
            let cx = slotX(m.slot, r.count, vw);
            if (activeSwap) {
                const [a, b] = activeSwap;
                if (m.slot === a) cx = slotX(a, r.count, vw) + (slotX(b, r.count, vw) - slotX(a, r.count, vw)) * swapT;
                else if (m.slot === b) cx = slotX(b, r.count, vw) + (slotX(a, r.count, vw) - slotX(b, r.count, vw)) * swapT;
            }
            const isScarlett = m.id === fsScarlettId;
            let ring = null;
            if (fsPhase === 'resolve') {
                if (isScarlett) ring = '#82dc96';
                else if (m.id === fsGuessedId) ring = '#e66478';
            }
            drawMushroomCup(m.type, cx, floorY, showPeek && isScarlett, lifted, ring);
        });

        ctx.restore();
    }

    function canvasPointLogical(e) {
        // Mirrors drawMushroomGame()'s coordinate space: X against the canvas's own box,
        // Y against the wrapper (the thing that actually clips what's visible/clickable).
        const rect = ui.canvas.getBoundingClientRect();
        const wrap = ui.canvas.parentElement;
        const wrapRect = wrap ? wrap.getBoundingClientRect() : rect;
        const vw = ui.canvas.clientWidth || 1000;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        return { x: (e.clientX - rect.left) * (vw / rect.width), y: (e.clientY - wrapRect.top) * (vh / wrapRect.height) };
    }
    function pointInRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
    function handleMushroomClick(e) {
        const p = canvasPointLogical(e);
        const vw = ui.canvas.clientWidth || 1000;
        const wrap = ui.canvas.parentElement;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        const { exitRect } = shellLayout();
        if (pointInRect(p, exitRect)) { exitMushroomGame(); return; }
        if (fsPhase === 'gameEnd') { enterMushroomGame(); return; }
        if (fsPhase !== 'guess') return;
        const r = currentRound();
        const floorY = vh * .62;
        for (const m of fsMushrooms) {
            const cx = slotX(m.slot, r.count, vw);
            if (Math.hypot(p.x - cx, p.y - floorY) < 46) { guessSlot(m.slot); return; }
        }
    }

    function drawMarker(img, px, py, w, h, t) {
        ctx.save();
        const bob = Math.sin(t * 4.8) * 4.5;
        ctx.translate(0, -bob);
        ctx.globalAlpha = .98;
        ctx.shadowColor = 'rgba(255,146,195,.55)';
        ctx.shadowBlur = 14;
        if (img.complete && img.naturalWidth) {
            const k = Math.min(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
            ctx.drawImage(img, px - dw / 2, py - dh / 2, dw, dh);
        } else {
            ctx.fillStyle = '#d9699d';
            ctx.beginPath(); ctx.arc(px, py, 26, 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }

    function drawOlly(t, moving) {
        ctx.save();
        const stepPhase = moving ? Math.sin(t * 9) : 0;
        const bob = moving ? Math.abs(stepPhase) * 3.2 : Math.sin(t * 2) * .35;
        const sideways = moving && (mapDir === 'left' || mapDir === 'right');
        const leanSign = mapDir === 'left' ? -1 : 1;
        const lean = sideways ? leanSign * .055 : 0;
        const strideSway = sideways ? stepPhase * 2 * leanSign : 0;
        ctx.translate(x + strideSway, y - bob);
        ctx.fillStyle = SH(.34);
        ctx.beginPath(); ctx.ellipse(0, 38 * .92, 23 * .92, 6 * .92, 0, 0, Math.PI * 2); ctx.fill();
        let img = ollySprite.front;
        if (mapDir === 'up') img = ollySprite.back;
        else if (mapDir === 'left') img = ollySprite.left;
        else if (mapDir === 'right') img = ollySprite.right;
        if (img.complete && img.naturalWidth) {
            const s = .92, h = 144 * s, w = h * (img.naturalWidth / img.naturalHeight);
            ctx.save();
            ctx.transform(1, 0, lean, 1, 0, 0);
            ctx.drawImage(img, -w / 2, -114 * s, w, h);
            ctx.restore();
        }
        ctx.restore();
    }

    function drawTom(t) {
        if (!metTom) return;
        // Simple lag-follow: Tom eases toward a spot just behind/beside Olly, with a
        // puffle hop. No side/back art yet, so he's always drawn front-on.
        const targetX = x - (facingDir === 'left' ? -46 : 46), targetY = y + 18;
        tomX += (targetX - tomX) * .08;
        tomY += (targetY - tomY) * .08;
        const hop = Math.abs(Math.sin(t * 6)) * 10;
        ctx.save();
        ctx.translate(tomX, tomY - hop);
        ctx.fillStyle = SH(.3);
        ctx.beginPath(); ctx.ellipse(0, 20, 16, 5, 0, 0, Math.PI * 2); ctx.fill();
        if (tomSprite.complete && tomSprite.naturalWidth) {
            const h = 70, w = h * (tomSprite.naturalWidth / tomSprite.naturalHeight);
            ctx.drawImage(tomSprite, -w / 2, -h * .82, w, h);
        }
        ctx.restore();
    }

    function drawWorld(t, dt) {
        const vw = ui.canvas.clientWidth || 1000, vh = ui.canvas.clientHeight || 600;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const wantW = Math.max(1536, Math.round(vw * dpr)), wantH = Math.max(1024, Math.round(vh * dpr));
        if (ui.canvas.width !== wantW || ui.canvas.height !== wantH) { ui.canvas.width = wantW; ui.canvas.height = wantH; }
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
        const sx = ui.canvas.width / vw, sy = ui.canvas.height / vh;
        ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
        ctx.save();
        ctx.scale(sx, sy);
        const zoom = MAP_ZOOM, viewW = vw / zoom, viewH = vh / zoom;
        const targetCamX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, x)),
            targetCamY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, y - CAM_LEAD_Y));
        const camBlend = 1 - Math.exp(-10 * Math.min(dt, .05));
        cameraX += (targetCamX - cameraX) * camBlend;
        cameraY += (targetCamY - cameraY) * camBlend;
        const camX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, cameraX)),
            camY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, cameraY));
        ctx.translate(vw / 2 - camX * zoom, vh / 2 - camY * zoom);
        ctx.scale(zoom, zoom);
        if (mapBackground.complete && mapBackground.naturalWidth) ctx.drawImage(mapBackground, 0, 0, WORLD_W, WORLD_H);
        else { ctx.fillStyle = '#17202a'; ctx.fillRect(0, 0, WORLD_W, WORLD_H); }

        if (!metTom) drawMarker(journalIcon, TOM_JOURNAL.x, TOM_JOURNAL.y, 70, 70, t);
        drawMarker(miniGameIcon, MINI_GAME_SPOT.x, MINI_GAME_SPOT.y, 90, 90, t);
        drawMarker(princessQIcon, PRINCESS_Q_SPOT.x, PRINCESS_Q_SPOT.y, 100, 100, t);

        const moving = (held.up || held.down || held.left || held.right) && !dialogueQueue;
        // Draw whichever of Olly/Tom is further back first, roughly, so neither always clips over the other.
        drawTom(t);
        drawOlly(t, moving);
        ctx.restore();
    }

    function canvasPointToWorld(e) {
        const rect = ui.canvas.getBoundingClientRect(), vw = ui.canvas.clientWidth || 1000, vh = ui.canvas.clientHeight || 600;
        const zoom = MAP_ZOOM;
        const sx = (e.clientX - rect.left) * (vw / rect.width), sy = (e.clientY - rect.top) * (vh / rect.height);
        const viewW = vw / zoom, viewH = vh / zoom;
        const camX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, cameraX)),
            camY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, cameraY));
        return { x: (sx - vw / 2 + camX * zoom) / zoom, y: (sy - vh / 2 + camY * zoom) / zoom };
    }

    ui.canvas.addEventListener('pointerdown', e => {
        if (mode === 'mushroom') { handleMushroomClick(e); return; }
        const p = canvasPointToWorld(e);
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && Math.hypot(p.x - TOM_JOURNAL.x, p.y - TOM_JOURNAL.y) < 50) { startTomMeeting(); return; }
        if (Math.hypot(p.x - MINI_GAME_SPOT.x, p.y - MINI_GAME_SPOT.y) < 55) { enterMushroomGame(); return; }
        if (Math.hypot(p.x - PRINCESS_Q_SPOT.x, p.y - PRINCESS_Q_SPOT.y) < 60) { ui.dialogue.textContent = `${PRINCESS_Q_SPOT.name} - nothing here yet.`; return; }
    });

    function loop(ts) {
        const t = ts / 1000;
        const dt = lastT ? Math.min(.05, t - lastT) : 1 / 60;
        lastT = t;
        if (mode === 'mushroom') {
            updateMushroom(dt);
            drawMushroomGame();
        } else {
            updateMovement(dt);
            drawWorld(t, dt);
        }
        raf = requestAnimationFrame(loop);
    }

    function start() {
        ui.dialogue.textContent = "The Hollow is somewhere nearby. There's a book lying in the grass...";
        raf = requestAnimationFrame(loop);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }

    // Hooks matching (a trimmed subset of) Level 1's contract. Level 2's own wiring in
    // game.js only calls what actually applies right now; the rest are harmless no-ops
    // kept here so this stays drop-in compatible if more of Level 2 grows into the
    // full hook contract later.
    return {
        cheat: () => {},
        start, stop,
        move: () => {},
        setMoveKey,
        primaryAction,
        interact: primaryAction,
        confirmEncounter: () => {}, closeEncounter: () => {},
        combatAttack: () => {}, combatHeavyAttack: () => {}, combatDodge: () => {}, shootAtPointer: () => {},
        retryCombat: () => {}, backToMap: () => {}, continueCompletion: () => {}, completeRelationship: () => {},
        answerPuzzle: () => {}, startBoss: () => {},
        saveAndQuit: () => {}, saveGame: () => false, loadGame: () => false
    };
}
