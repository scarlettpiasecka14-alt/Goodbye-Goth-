/* Goodbye Goth - Level 3 scaffolding (theme TBD).
   V9.85-preview: this is the "Princess Burrito" minigame, relocated here wholesale from
   level2.js. It was built as part of the Level 2 scaffolding before Scarlett remembered
   Level 2 is actually the Mystical Forest (mushroom-themed) - Princess Burrito doesn't
   fit there, so rather than throw the work away it's parked here until Level 3 gets a
   real theme/map of its own. The game logic/engine is untouched and still fully playable
   (station-based, reveal -> hide -> assemble from memory before a tightening timer,
   3 rounds of 1 -> 3 -> 5 orders) - only the wrapper around it changed: there's no map
   or character to walk up to yet, so entering Level 3 (debug-only, via ?level=3) drops
   you straight into the minigame full-screen, with a "Back to boot" exit instead of
   "Back to the Hollow".

   Reuses the same canvas-sizing approach as level1.js/level2.js, and is a fully separate
   module - no shared state with either. */

import { playSfx } from '../audio.js?v=9820';

// --- Princess Burrito minigame data (unchanged from level2.js) --------------------
const INGREDIENTS = [
    { id: 'cheese', label: 'CHEESE', color: '#f4c54d' },
    { id: 'sourcream', label: 'SOUR CREAM', color: '#f6f1e6' },
    { id: 'tomato', label: 'TOMATO', color: '#e2503c' },
    { id: 'love', label: 'LOVE', color: '#ef6fa8' }
];
const SCARLETT_CHIP = { id: 'scarlett', label: 'SCARLETT', color: '#caa6ff' };

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
const ROUND_TIMING = { 1: { reveal: 4, assemble: 9 }, 2: { reveal: 3, assemble: 7.5 }, 3: { reveal: 2, assemble: 6.5 } };

const SH = a => `rgba(0,0,0,${a})`;

export function createLevel3(ui) {
    const ctx = ui.canvas.getContext('2d');

    let raf = 0, lastT = 0;

    let bgOrderIdx = 0;
    let bgPhase = 'reveal';   // 'reveal' | 'assemble' | 'resolve' | 'gameEnd'
    let bgPhaseT = 0;
    let bgPlaced = [];
    let bgScore = 0;
    let bgResolveOk = false;
    let beltScroll = 0;

    function currentOrder() { return BURRITO_ORDERS[bgOrderIdx]; }
    function currentTiming() { return ROUND_TIMING[currentOrder().round]; }
    function orderNumberInRound() {
        const order = currentOrder();
        const roundOrders = BURRITO_ORDERS.filter(o => o.round === order.round);
        return `${roundOrders.indexOf(order) + 1}/${roundOrders.length}`;
    }
    function labelFor(id) { return id === 'scarlett' ? SCARLETT_CHIP.label : (INGREDIENTS.find(i => i.id === id)?.label || id); }

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
    function restartGame() {
        bgOrderIdx = 0;
        bgScore = 0;
        startBurritoOrder();
    }
    function placeBurritoItem(id) {
        if (bgPhase !== 'assemble') return;
        if (bgPlaced.length === 0 && id !== 'scarlett') { playSfx('wrong-buzz'); return; }
        if (bgPlaced.includes(id)) { playSfx('wrong-buzz'); return; }
        const order = currentOrder();
        playSfx('click');
        if (!order.items.includes(id)) { resolveBurritoOrder(false); return; }
        bgPlaced.push(id);
        if (bgPlaced.length === order.items.length) resolveBurritoOrder(true);
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

    function draw() {
        const vw = ui.canvas.clientWidth || 1000;
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

        ctx.fillStyle = 'rgba(255,255,255,.1)';
        roundRect(exitRect.x, exitRect.y, exitRect.w, exitRect.h, 8); ctx.fill();
        ctx.fillStyle = '#f3dce8'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('‹ Exit Preview', exitRect.x + exitRect.w / 2, exitRect.y + exitRect.h / 2 + 4);

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
            ctx.fillText('Click anywhere to run another shift, or Exit Preview to leave.', vw / 2, vh * .4 + 64);
            ctx.restore();
            return;
        }

        const order = currentOrder();
        ctx.font = '600 13px Georgia'; ctx.fillStyle = '#c9a3b8';
        ctx.fillText(`Round ${order.round} • Order ${orderNumberInRound()} • Score ${bgScore}/${BURRITO_ORDERS.length}`, 24, 92);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#1c1118';
        roundRect(vw / 2 - 260, 110, 520, 60, 10); ctx.fill();
        ctx.fillStyle = '#f9e3ee'; ctx.font = '600 14px Georgia';
        ctx.fillText(order.customer + ':', vw / 2, 130);
        ctx.font = 'italic 13px Georgia'; ctx.fillStyle = '#e3b9cf';
        wrapText(`"${order.line}"`, vw / 2, 148, 480, 15);

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
        const rect = ui.canvas.getBoundingClientRect();
        const wrap = ui.canvas.parentElement;
        const wrapRect = wrap ? wrap.getBoundingClientRect() : rect;
        const vw = ui.canvas.clientWidth || 1000;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        return { x: (e.clientX - rect.left) * (vw / rect.width), y: (e.clientY - wrapRect.top) * (vh / wrapRect.height) };
    }
    function pointInRect(p, r) { return p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h; }
    function handleClick(e) {
        const p = canvasPointLogical(e);
        const vw = ui.canvas.clientWidth || 1000;
        const wrap = ui.canvas.parentElement;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        const { tray, scarlettChip, exitRect } = burritoLayout(vw, vh);
        if (pointInRect(p, exitRect)) { ui.onExit?.(); return; }
        if (bgPhase === 'gameEnd') { restartGame(); return; }
        if (pointInRect(p, scarlettChip.rect)) { placeBurritoItem('scarlett'); return; }
        for (const c of tray) if (pointInRect(p, c.rect)) { placeBurritoItem(c.id); return; }
    }

    ui.canvas.addEventListener('pointerdown', handleClick);

    function loop(ts) {
        const t = ts / 1000;
        const dt = lastT ? Math.min(.05, t - lastT) : 1 / 60;
        lastT = t;
        updateBurrito(dt);
        draw();
        raf = requestAnimationFrame(loop);
    }

    function start() {
        restartGame();
        raf = requestAnimationFrame(loop);
    }
    function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; ui.canvas.removeEventListener('pointerdown', handleClick); }

    return {
        cheat: () => {},
        start, stop,
        move: () => {},
        setMoveKey: () => {},
        primaryAction: () => {},
        interact: () => {},
        confirmEncounter: () => {}, closeEncounter: () => {},
        combatAttack: () => {}, combatHeavyAttack: () => {}, combatDodge: () => {}, shootAtPointer: () => {},
        retryCombat: () => {}, backToMap: () => {}, continueCompletion: () => {}, completeRelationship: () => {},
        answerPuzzle: () => {}, startBoss: () => {},
        saveAndQuit: () => {}, saveGame: () => false, loadGame: () => false
    };
}
