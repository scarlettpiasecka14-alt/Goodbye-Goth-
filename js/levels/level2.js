/* Goodbye Goth - Level 2 scaffolding ("The Whispering Hollow").
   V9.84-preview: map + movement + Tom's hollow/journal meeting + a first playable draft
   of the "Princess Burrito" minigame. NOT wired into the real Level 1 -> Level 2 handoff
   yet (see js/game.js mountLevel2 + the ?level=2 debug entry point). Scope deliberately
   stops here per Scarlett's "don't implement all of this at once" - no real content for
   the princess-question icon yet, no mushroom-jump traversal, no Latin names.

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
const MINI_GAME_SPOT = { x: 650, y: 790, name: 'PRINCESS BURRITO' };
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

// --- Princess Burrito minigame data -----------------------------------------------
// First-draft content. Station-based (no running-around-the-kitchen Olly, per
// Scarlett), click-only, placeholder "programmer art" chips instead of real
// ingredient illustrations so this plays and reads cleanly before any new art exists.
// Swap the colours/labels for real icon art later without touching the game logic.
const INGREDIENTS = [
    { id: 'cheese', label: 'CHEESE', color: '#f4c54d' },
    { id: 'sourcream', label: 'SOUR CREAM', color: '#f6f1e6' },
    { id: 'tomato', label: 'TOMATO', color: '#e2503c' },
    { id: 'love', label: 'LOVE', color: '#ef6fa8' }
];
const SCARLETT_CHIP = { id: 'scarlett', label: 'SCARLETT', color: '#caa6ff' };

// Scarlett must always be placed first (she's the wrap, not a topping); order after
// that is NOT checked - v1 just needs the right set of ingredients, not the exact
// click sequence, to keep "remember what was asked for" the actual challenge rather
// than also demanding a precise click order.
// Customers are generic people, not named cast members - there's no portrait/sprite
// shown for whoever's ordering, so naming them Patricia/Tom/etc. would read as those
// characters without anything on screen actually being them. If/when this gets real
// customer art or sprites, swap these back to named cast and the in-character jokes
// (Tom's football banter, Patricia's "don't disappoint me, Olly") can come back too.
const BURRITO_ORDERS = [
    { round: 1, customer: 'Hungry Customer', line: "One Scarlett... with cheese. Make it quick.", items: ['scarlett', 'cheese'] },
    { round: 2, customer: 'Picky Customer', line: "Scarlett, sour cream, no tomato. I'm watching my figure.", items: ['scarlett', 'sourcream'] },
    { round: 2, customer: 'Polite Customer', line: "Scarlett and tomato, please. Can't skip my veg.", items: ['scarlett', 'tomato'] },
    { round: 2, customer: 'Demanding Customer', line: "Surprise me. Cheese AND sour cream. Don't disappoint me.", items: ['scarlett', 'cheese', 'sourcream'] },
    { round: 3, customer: 'Sentimental Customer', line: "Cheese, tomato, extra love. I'm feeling sentimental.", items: ['scarlett', 'cheese', 'tomato', 'love'] },
    { round: 3, customer: 'Hopeless Romantic', line: "Just love. Hold everything else.", items: ['scarlett', 'love'] },
    { round: 3, customer: 'Fussy Customer', line: "Everything except sour cream - I'm lactose intolerant, apparently.", items: ['scarlett', 'cheese', 'tomato', 'love'] },
    { round: 3, customer: 'Big Spender', line: "All four. Impress me.", items: ['scarlett', 'cheese', 'sourcream', 'tomato', 'love'] },
    { round: 3, customer: 'Mysterious Customer', line: "Just Scarlett. I don't share.", items: ['scarlett'] }
];
// Seconds the order is shown for before it's hidden, and seconds allowed to assemble
// it from memory after that. Tightens each round - tune freely, these are first-draft guesses.
const ROUND_TIMING = { 1: { reveal: 4, assemble: 9 }, 2: { reveal: 3, assemble: 7.5 }, 3: { reveal: 2, assemble: 6.5 } };

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

    // 'map' | 'burrito'
    let mode = 'map';

    // --- Princess Burrito runtime state ---
    let bgOrderIdx = 0;
    let bgPhase = 'reveal';   // 'reveal' | 'assemble' | 'resolve' | 'gameEnd'
    let bgPhaseT = 0;
    let bgPlaced = [];
    let bgScore = 0;
    let bgResolveOk = false;
    let beltScroll = 0;

    function near(px, py, r) { return Math.hypot(x - px, y - py) < r; }

    function setMoveKey(key, down) {
        if (mode === 'burrito') return;
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
        if (mode === 'burrito') return;
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && near(TOM_JOURNAL.x, TOM_JOURNAL.y, 70)) { startTomMeeting(); return; }
        if (near(MINI_GAME_SPOT.x, MINI_GAME_SPOT.y, 70)) { enterBurritoGame(); return; }
        if (near(PRINCESS_Q_SPOT.x, PRINCESS_Q_SPOT.y, 70)) {
            ui.dialogue.textContent = `${PRINCESS_Q_SPOT.name} - nothing here yet.`;
            return;
        }
    }

    // --- Princess Burrito: game logic ---
    function currentOrder() { return BURRITO_ORDERS[bgOrderIdx]; }
    function currentTiming() { return ROUND_TIMING[currentOrder().round]; }
    function orderNumberInRound() {
        const order = currentOrder();
        const roundOrders = BURRITO_ORDERS.filter(o => o.round === order.round);
        return `${roundOrders.indexOf(order) + 1}/${roundOrders.length}`;
    }
    function labelFor(id) { return id === 'scarlett' ? SCARLETT_CHIP.label : (INGREDIENTS.find(i => i.id === id)?.label || id); }

    function enterBurritoGame() {
        mode = 'burrito';
        bgOrderIdx = 0;
        bgScore = 0;
        startBurritoOrder();
    }
    function exitBurritoGame() {
        mode = 'map';
        ui.dialogue.textContent = `${MINI_GAME_SPOT.name} is quiet again. Last shift: ${bgScore}/${BURRITO_ORDERS.length} orders right.`;
    }
    function startBurritoOrder() {
        bgPhase = 'reveal';
        bgPhaseT = 0;
        bgPlaced = [];
    }
    function resolveBurritoOrder(ok) {
        bgResolveOk = ok;
        bgPhase = 'resolve';
        bgPhaseT = 0;
        if (ok) { bgScore++; playSfx('round-ok'); } else playSfx('wrong-buzz');
    }
    function advanceBurritoOrder() {
        bgOrderIdx++;
        if (bgOrderIdx >= BURRITO_ORDERS.length) {
            bgPhase = 'gameEnd';
            bgPhaseT = 0;
            playSfx('minigame-win');
            return;
        }
        startBurritoOrder();
    }
    function placeBurritoItem(id) {
        if (bgPhase !== 'assemble') return;
        if (bgPlaced.length === 0 && id !== 'scarlett') { playSfx('wrong-buzz'); return; }   // she has to go on first
        if (bgPlaced.includes(id)) { playSfx('wrong-buzz'); return; }   // no duplicates
        const order = currentOrder();
        playSfx('click');
        if (!order.items.includes(id)) { resolveBurritoOrder(false); return; }   // wrong ingredient entirely
        bgPlaced.push(id);
        if (bgPlaced.length === order.items.length) resolveBurritoOrder(true);   // right set, right length -> done
    }
    function updateBurrito(dt) {
        if (bgPhase === 'gameEnd') return;
        bgPhaseT += dt;
        beltScroll += dt * 60;
        const timing = currentTiming();
        if (bgPhase === 'reveal' && bgPhaseT >= timing.reveal) { bgPhase = 'assemble'; bgPhaseT = 0; }
        else if (bgPhase === 'assemble' && bgPhaseT >= timing.assemble) resolveBurritoOrder(false);
        else if (bgPhase === 'resolve' && bgPhaseT >= 1.1) advanceBurritoOrder();
    }

    function burritoLayout(vw, vh) {
        const chipW = Math.min(150, (vw - 80) / 5), chipH = 54, gap = 12;
        const trayTotalW = INGREDIENTS.length * chipW + (INGREDIENTS.length - 1) * gap;
        const tray = INGREDIENTS.map((ing, i) => ({
            ...ing,
            rect: { x: vw / 2 - trayTotalW / 2 + i * (chipW + gap), y: vh - 80, w: chipW, h: chipH }
        }));
        const scarlettChip = { ...SCARLETT_CHIP, rect: { x: 24, y: vh * 0.56, w: Math.min(140, chipW + 10), h: chipH } };
        const exitRect = { x: 20, y: 14, w: 168, h: 34 };
        return { tray, scarlettChip, exitRect };
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
    function drawChip(chip, state) {
        const r = chip.rect;
        ctx.save();
        ctx.globalAlpha = state === 'disabled' ? .4 : 1;
        ctx.fillStyle = chip.color;
        roundRect(r.x, r.y, r.w, r.h, 10);
        ctx.fill();
        if (state === 'placed') {
            ctx.strokeStyle = '#fff'; ctx.lineWidth = 3;
            roundRect(r.x, r.y, r.w, r.h, 10);
            ctx.stroke();
        }
        ctx.fillStyle = '#241018';
        ctx.font = '700 13px Georgia';
        ctx.textAlign = 'center';
        ctx.fillText(chip.label, r.x + r.w / 2, r.y + r.h / 2 + 5);
        ctx.restore();
    }
    function drawTortilla(cx, cy) {
        ctx.save();
        ctx.translate(cx, cy);
        let scale = 1, rot = 0, alpha = 1;
        if (bgPhase === 'resolve') {
            const p = Math.min(1, bgPhaseT / .9);
            if (bgResolveOk) { scale = 1 - p * .9; alpha = 1 - p; }
            else rot = Math.sin(bgPhaseT * 40) * (1 - p) * .14;
        }
        ctx.globalAlpha = alpha;
        ctx.rotate(rot);
        ctx.scale(scale, scale);
        ctx.fillStyle = '#e8c383';
        ctx.beginPath(); ctx.ellipse(0, 0, 80, 46, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#c79b52'; ctx.lineWidth = 3; ctx.stroke();
        bgPlaced.forEach((id, i) => {
            const ing = id === 'scarlett' ? SCARLETT_CHIP : INGREDIENTS.find(ii => ii.id === id);
            ctx.fillStyle = ing.color;
            ctx.beginPath(); ctx.arc(-54 + i * 24, -2, 9, 0, Math.PI * 2); ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; ctx.stroke();
        });
        ctx.restore();
    }

    function drawBurrito() {
        const vw = ui.canvas.clientWidth || 1000;
        // V9.84-preview: the #world2 canvas sizes its own CSS box from its width/height
        // HTML attributes' aspect ratio (1536:1024) against whatever width it's given,
        // which comes out taller than the .world-wrap container actually allows - the
        // wrapper clips the overflow (so Level 1/2's map still looks right, since the
        // map's own camera math doesn't care), but it means ui.canvas.clientHeight is
        // NOT the visible height. Lay out the burrito UI against the WRAPPER's height
        // instead, so nothing (the ingredient tray especially) ends up positioned in
        // the clipped-off strip below what's actually on screen.
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

        ctx.fillStyle = '#271822';
        ctx.fillRect(0, 0, vw, vh);

        const { tray, scarlettChip, exitRect } = burritoLayout(vw, vh);

        // exit button
        ctx.fillStyle = 'rgba(255,255,255,.1)';
        roundRect(exitRect.x, exitRect.y, exitRect.w, exitRect.h, 8); ctx.fill();
        ctx.fillStyle = '#f3dce8'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('‹ Back to the Hollow', exitRect.x + exitRect.w / 2, exitRect.y + exitRect.h / 2 + 4);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#f3dce8';
        ctx.font = '700 20px Georgia';
        ctx.fillText('PRINCESS BURRITO', 24, 70);

        if (bgPhase === 'gameEnd') {
            ctx.textAlign = 'center';
            ctx.fillStyle = '#f3dce8'; ctx.font = '700 28px Georgia';
            ctx.fillText('Service Done!', vw / 2, vh * .4);
            ctx.font = '600 17px Georgia';
            ctx.fillText(`You got ${bgScore} / ${BURRITO_ORDERS.length} orders right.`, vw / 2, vh * .4 + 36);
            ctx.font = '600 13px Georgia'; ctx.fillStyle = '#c9a3b8';
            ctx.fillText('Click anywhere to run another shift, or Back to the Hollow to leave.', vw / 2, vh * .4 + 64);
            ctx.restore();
            return;
        }

        const order = currentOrder();
        ctx.font = '600 13px Georgia'; ctx.fillStyle = '#c9a3b8';
        ctx.fillText(`Round ${order.round} • Order ${orderNumberInRound()} • Score ${bgScore}/${BURRITO_ORDERS.length}`, 24, 92);

        // order banner
        ctx.textAlign = 'center';
        ctx.fillStyle = '#1c1118';
        roundRect(vw / 2 - 260, 110, 520, 60, 10); ctx.fill();
        ctx.fillStyle = '#f9e3ee'; ctx.font = '600 14px Georgia';
        ctx.fillText(order.customer + ':', vw / 2, 130);
        ctx.font = 'italic 13px Georgia'; ctx.fillStyle = '#e3b9cf';
        wrapText(`"${order.line}"`, vw / 2, 148, 480, 15);

        // reveal / hidden ingredient list + timer bar
        const timing = currentTiming();
        ctx.font = '700 15px Georgia';
        if (bgPhase === 'reveal') {
            ctx.fillStyle = '#ffe9b8';
            ctx.fillText(order.items.map(labelFor).join(' + '), vw / 2, 198);
            drawTimerBar(vw / 2 - 120, 206, 240, 6, 1 - bgPhaseT / timing.reveal, '#ffe9b8');
        } else {
            ctx.fillStyle = '#8a6b78';
            ctx.fillText('? ? ?  (remember the order!)', vw / 2, 198);
            if (bgPhase === 'assemble') drawTimerBar(vw / 2 - 120, 206, 240, 6, 1 - bgPhaseT / timing.assemble, '#ff9ab0');
        }

        // conveyor belt
        const beltY = vh * .34, beltH = Math.max(90, vh * .18);
        ctx.save();
        ctx.beginPath(); ctx.rect(0, beltY, vw, beltH); ctx.clip();
        ctx.fillStyle = '#4a3340';
        ctx.fillRect(0, beltY, vw, beltH);
        ctx.strokeStyle = 'rgba(255,255,255,.08)'; ctx.lineWidth = 10;
        const stripe = 46;
        for (let bx = -stripe + (beltScroll % stripe); bx < vw + stripe; bx += stripe) {
            ctx.beginPath(); ctx.moveTo(bx, beltY); ctx.lineTo(bx - beltH * .6, beltY + beltH); ctx.stroke();
        }
        ctx.restore();

        drawTortilla(vw / 2, beltY + beltH / 2);

        drawChip(scarlettChip, bgPlaced.includes('scarlett') ? 'placed' : 'normal');
        tray.forEach(c => {
            const state = bgPlaced.includes(c.id) ? 'placed' : (bgPlaced.length === 0 ? 'disabled' : 'normal');
            drawChip(c, state);
        });

        if (bgPhase === 'resolve') {
            ctx.fillStyle = bgResolveOk ? 'rgba(130,220,150,.94)' : 'rgba(230,100,120,.94)';
            roundRect(vw / 2 - 140, beltY + beltH + 16, 280, 44, 10); ctx.fill();
            ctx.fillStyle = '#1c1118'; ctx.font = '700 16px Georgia'; ctx.textAlign = 'center';
            ctx.fillText(bgResolveOk ? 'SERVED!' : 'MISSED!', vw / 2, beltY + beltH + 16 + 29);
        }

        ctx.restore();
    }

    function canvasPointLogical(e) {
        // Mirrors drawBurrito()'s coordinate space: X against the canvas's own box,
        // Y against the wrapper (the thing that actually clips what's visible/clickable).
        const rect = ui.canvas.getBoundingClientRect();
        const wrap = ui.canvas.parentElement;
        const wrapRect = wrap ? wrap.getBoundingClientRect() : rect;
        const vw = ui.canvas.clientWidth || 1000;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        return { x: (e.clientX - rect.left) * (vw / rect.width), y: (e.clientY - wrapRect.top) * (vh / wrapRect.height) };
    }
    function pointInRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
    function handleBurritoClick(e) {
        const p = canvasPointLogical(e);
        const vw = ui.canvas.clientWidth || 1000;
        const wrap = ui.canvas.parentElement;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        const { tray, scarlettChip, exitRect } = burritoLayout(vw, vh);
        if (pointInRect(p, exitRect)) { exitBurritoGame(); return; }
        if (bgPhase === 'gameEnd') { enterBurritoGame(); return; }
        if (pointInRect(p, scarlettChip.rect)) { placeBurritoItem('scarlett'); return; }
        for (const c of tray) if (pointInRect(p, c.rect)) { placeBurritoItem(c.id); return; }
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
        if (mode === 'burrito') { handleBurritoClick(e); return; }
        const p = canvasPointToWorld(e);
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && Math.hypot(p.x - TOM_JOURNAL.x, p.y - TOM_JOURNAL.y) < 50) { startTomMeeting(); return; }
        if (Math.hypot(p.x - MINI_GAME_SPOT.x, p.y - MINI_GAME_SPOT.y) < 55) { enterBurritoGame(); return; }
        if (Math.hypot(p.x - PRINCESS_Q_SPOT.x, p.y - PRINCESS_Q_SPOT.y) < 60) { ui.dialogue.textContent = `${PRINCESS_Q_SPOT.name} - nothing here yet.`; return; }
    });

    function loop(ts) {
        const t = ts / 1000;
        const dt = lastT ? Math.min(.05, t - lastT) : 1 / 60;
        lastT = t;
        if (mode === 'burrito') {
            updateBurrito(dt);
            drawBurrito();
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
