/* Goodbye Goth V9.96 - Level 2's two new enemies, running on Level 1's fight screen.

   Devil's Fingers (map fight) and Sophia the Chaos Fairy Goth (boss) were first built as a
   separate preview fight (level2.js, V9.93). They now plug into level1.js's combat engine
   instead, so they get everything the Level 1 fights have: the 3-2-1 intro, Olly's real
   moves (punch combo, jump, dodge, heavy), the warning rings, the HUD bars, hurt reactions,
   knockout + Try Again. Attacks, timings and art are unchanged from the preview.

   level1.js creates one of these per fight with createFoe(type, api). `api` is the engine's
   side of the deal (positions, damage, rings, sounds); everything here is that enemy's own
   brain + drawing. Numbers marked PROVISIONAL are still for Scarlett to tune. */

// ---------------------------------------------------------------------------------------
// Art (loaded the first time each fight starts)
const DF_CLIPS = ['df_disappear', 'df_grab', 'df_creepycrawl', 'df_dfcrawl', 'df_flick', 'df_acidtrip'];
const CFG_CLIPS = ['cfg_idle', 'cfg_shot', 'cfg_heavy', 'cfg_electric', 'cfg_dust'];
const atlases = {};
const requested = {};
function loadAtlasSet(dir, names) {
    if (requested[dir]) return;
    requested[dir] = true;
    fetch(`${dir}/atlas_data.json`).then(r => r.json()).then(data => {
        for (const name of names) {
            const d = data[name];
            if (!d) continue;
            const img = new Image();
            img.src = `${dir}/atlas/${name}.webp`;
            atlases[name] = { img, frames: d.frames, scale: d.scale };
        }
    }).catch(() => {});
}
export function preloadLevel2Foes() {
    loadAtlasSet('assets/characters/devilsfingers', DF_CLIPS);
    loadAtlasSet('assets/characters/chaosfairy', CFG_CLIPS);
}
const cfgArena = new Image();
// Same drawing maths as level1.js's atlas packs: rows are [atlasX, atlasY, w, h, offX, offY].
// nativeFace = the way the art faces ('left' for Devil's Fingers, 'right' for Sophia).
// clipMinX (source px, in the art's own facing) hides anything left of that line - used to crop the
// bow and quiver Sophia drops a little way off in her glowing-arrow clip.
function drawAtlas(c, name, index, x, floorY, face, nativeFace, rs, alpha = 1, filter = '', clipMinX = null) {
    const pack = atlases[name];
    if (!pack?.img?.complete || !pack.img.naturalWidth || !pack.frames?.length) return false;
    const n = pack.frames.length, f = pack.frames[Math.max(0, Math.min(n - 1, Math.floor(index)))];
    const k = rs / pack.scale;
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, alpha));
    if (filter) c.filter = filter;
    c.translate(Math.round(x), Math.round(floorY));
    c.scale(face === nativeFace ? 1 : -1, 1);
    if (clipMinX != null) { c.beginPath(); c.rect(clipMinX * rs, -4000, 8000, 8000); c.clip(); }
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(pack.img, f[0], f[1], f[2], f[3], Math.round(f[4] * rs), Math.round(f[5] * rs), Math.round(f[2] * k), Math.round(f[3] * k));
    c.restore();
    return true;
}

export function createFoe(type, api) {
    preloadLevel2Foes();
    return type === 'cfg' ? createChaosFairy(api) : createDevilsFingers(api);
}

// ---------------------------------------------------------------------------------------
// DEVIL'S FINGERS - five attacks: Burrowing, Crawling, Tentacle Swipe, Acid Bombs: The Trip, Grab.
function createDevilsFingers(api) {
    const MS = { df_disappear: 125, df_grab: 125, df_creepycrawl: 1000 / 12, df_dfcrawl: 1000 / 12, df_flick: 1000 / 12, df_acidtrip: 1000 / 12 };
    const COUNT = { df_disappear: 65, df_grab: 81, df_creepycrawl: 61, df_dfcrawl: 73, df_flick: 49, df_acidtrip: 73 };
    const RS = .92;              // her size next to Level 1's Olly
    const REACH = 300;           // how far her attacks reach (Level 1's Olly is bigger than the preview's)
    const ATTACKS = {            // hitMs = when it lands, from the clips' real lengths (PROVISIONAL)
        disappear: { clip: 'df_disappear', dmg: 15, hitMs: 7310, label: 'BURROWING' },
        dfcrawl: { clip: 'df_dfcrawl', dmg: 8, hitMs: 3350, label: 'CRAWLING' },
        flick: { clip: 'df_flick', dmg: 12, hitMs: 2450, label: 'TENTACLE SWIPE' },
        acidtrip: { clip: 'df_acidtrip', dmg: 10, hitMs: 2433, label: 'ACID BOMBS: THE TRIP' }
    };
    const POOL = ['disappear', 'creepycrawl', 'flick', 'acidtrip', 'grab'];
    const GRAB_CATCH_MS = 3544, GRAB_QTE_MS = 2500, MASH_NEEDED = 8, ESCAPE_DMG = 8, FAIL_DMG = 30;
    const ACID_MS = 5000;
    const WARN_MS = 1000;        // the red ring flashes during the last second before each hit
    let state = 'idle', start = 0, nextAt = 0, hitDone = false, last = null;
    let mash = 0, qteUntil = 0, freezeIdx = 0, failStart = 0, acidUntil = 0, flashUntil = 0, deathStart = 0, face = 'left';
    let tutorialAsked = false, moved = false;
    const RESURFACE_MS = 27 * 125;   // frame 27 of the burrow clip: completely underground

    function set(s, now) { state = s; start = now; hitDone = false; moved = false; }
    function toIdle(now, wait = 1600) { set('idle', now); nextAt = now + wait; }
    function pick() {
        let id;
        do { id = POOL[Math.floor(Math.random() * POOL.length)]; } while (id === last);
        last = id;
        return id;
    }
    function begin(id, now) {
        if (!tutorialAsked) { tutorialAsked = true; api.queueRingTutorial('red'); }
        if (id === 'grab') { set('grab_approach', now); mash = 0; api.status("Her fingers reach for you. DODGE!"); return; }
        set(id, now);
        api.status(id === 'creepycrawl' ? 'She starts to crawl towards you...' : id === 'disappear' ? 'She sinks into the ground... where will she come up?'
            : id === 'acidtrip' ? 'Acid bombs! DODGE them!' : 'Her tentacles coil back. DODGE!');
    }
    const hitMsOf = s => s === 'grab_approach' ? GRAB_CATCH_MS : ATTACKS[s]?.hitMs;

    return {
        name: "DEVIL'S FINGERS",
        hitRange: 270,
        bodyGap: 150,
        background: null,   // Level 2's own fight background
        hurtRate: .62,      // her groans are the Goth ones, pitched way down
        hidesOlly: () => state === 'grab_qte' || state === 'grab_fail',
        untargetable: () => state === 'grab_qte' || state === 'grab_fail' || state === 'death',
        consumePunch(now) {   // mash the punch key to break free of the grab
            if (state !== 'grab_qte') return false;
            mash++;
            api.sfx('punch-1', .5);
            api.status(`MASH PUNCH! (${Math.min(mash, MASH_NEEDED)} / ${MASH_NEEDED})`);
            return true;
        },
        onDodge(now) {
            if (state === 'grab_approach') { toIdle(now, 1400); api.status('Olly dodges the grab entirely!'); }
        },
        onHit(now) { flashUntil = now + 115; },
        start(now) { toIdle(now, 1400); api.setX(api.W - 320); },
        ready(now) { toIdle(now, 600); },   // called when the 3-2-1 ends
        die(now) { set('death', now); deathStart = now; api.status("Devil's Fingers curls up and sinks back into the earth!"); return 2400; },
        update(dt, now) {
            const x = api.getX(), px = api.playerX(), elapsed = now - start;
            if (state !== 'grab_qte' && state !== 'grab_fail') face = px < x ? 'left' : 'right';
            if (state === 'death') return;
            if (state === 'idle') {
                // she creeps in to striking distance (220-290px) - you can't just hide at the far wall
                const d = px - x, want = Math.abs(d) > 290 ? Math.sign(d) : Math.abs(d) < 220 ? -Math.sign(d) : 0;
                api.setX(Math.max(200, Math.min(api.W - 200, x + want * (Math.abs(d) > 500 ? 170 : 110) * dt)));
                // attack once she's in range (or after 2.5s anyway, so running away doesn't stall the fight)
                if (now >= nextAt && (Math.abs(d) <= 320 || now >= nextAt + 2500)) begin(pick(), now);
                return;
            }
            if (state === 'grab_approach') {
                if (elapsed >= GRAB_CATCH_MS) {
                    if (Math.abs(px - x) <= REACH && !api.isDodging(now)) {
                        set('grab_qte', now); qteUntil = now + GRAB_QTE_MS; mash = 0;
                        freezeIdx = GRAB_CATCH_MS / MS.df_grab;
                        api.status('CAUGHT! Mash your punch key to break free!');
                        api.sfx('olly-hurt', .8);
                    } else toIdle(now, 1200);
                }
                return;
            }
            if (state === 'grab_qte') {
                if (now >= qteUntil) {
                    if (mash >= MASH_NEEDED) { api.hurtDirect(ESCAPE_DMG, 'BROKE FREE'); toIdle(now); api.status(`Olly breaks free! -${ESCAPE_DMG} HP.`); }
                    else { set('grab_fail', now); failStart = now; api.hurtDirect(FAIL_DMG, 'SWALLOWED AND SPAT OUT'); }
                }
                return;
            }
            if (state === 'grab_fail') {
                if (now - failStart >= COUNT.df_grab * MS.df_grab - GRAB_CATCH_MS) toIdle(now);
                return;
            }
            if (state === 'creepycrawl') {
                if (elapsed >= COUNT.df_creepycrawl * MS.df_creepycrawl) begin('dfcrawl', now);
                return;
            }
            if (state === 'disappear' && !moved && elapsed >= RESURFACE_MS) {
                // Burrowing: while she's fully underground, she tunnels over and comes back up right next to him
                moved = true;
                const side = px < api.W / 2 ? 1 : -1;
                api.setX(Math.max(200, Math.min(api.W - 200, px + side * 210)));
            }
            if (state === 'dfcrawl') {   // she charges at him along the floor
                api.setX(Math.max(170, Math.min(api.W - 170, x + (px - x) * Math.min(1, dt * 1.1))));
            }
            const a = ATTACKS[state];
            if (a) {
                if (!hitDone && elapsed >= a.hitMs) {
                    hitDone = true;
                    if (api.hurt(a.dmg, REACH, a.label, { ignoreAir: true, push: 40 }) && state === 'acidtrip') acidUntil = now + ACID_MS;
                }
                if (elapsed >= COUNT[a.clip] * MS[a.clip]) toIdle(now);
            }
        },
        draw(c, now) {
            const elapsed = now - start, x = api.getX(), floorY = api.floorY;
            // warning ring before each hit (red = dodge it; jumping doesn't help)
            const hitMs = hitMsOf(state);
            if (hitMs != null && !hitDone) {
                const p = (elapsed - (hitMs - WARN_MS)) / WARN_MS;
                if (p >= 0 && p <= 1) api.ring(c, x, 260, 'red', p, false, now, WARN_MS);
            }
            let clip = 'df_creepycrawl', idx = 0, alpha = 1, at = x, fy = floorY, f = face;
            if (state === 'grab_qte') { clip = 'df_grab'; idx = freezeIdx; }
            else if (state === 'grab_fail') { clip = 'df_grab'; idx = GRAB_CATCH_MS / MS.df_grab + (now - failStart) / MS.df_grab; }
            else if (state === 'creepycrawl') { clip = 'df_creepycrawl'; idx = elapsed / MS.df_creepycrawl; }
            else if (state === 'death') { clip = 'df_disappear'; idx = (now - deathStart) / (MS.df_disappear / 2.2); alpha = 1 - Math.max(0, (now - deathStart - 1400) / 1000); }
            else if (ATTACKS[state]) { clip = ATTACKS[state].clip; idx = elapsed / MS[clip]; }
            else idx = 0;
            // the grab is a full baked scene with Olly in it, drawn centred on screen
            if (clip === 'df_grab') { at = api.W / 2; fy = api.H / 2 + 40; f = 'left'; }
            const bob = state === 'idle' ? Math.sin(now / 380) * 3 : 0;
            const ok = drawAtlas(c, clip, idx, at, fy + bob, f, 'left', clip === 'df_grab' ? 1.12 : RS, alpha, now < flashUntil ? 'brightness(1.9)' : '');
            if (!ok && state !== 'death') {   // still loading
                c.fillStyle = 'rgba(160,60,90,.5)';
                c.beginPath(); c.ellipse(x, floorY - 150, 110, 170, 0, 0, Math.PI * 2); c.fill();
            }
        },
        drawOver(c, now) {   // Acid Bombs: The Trip - the whole screen swirls for 5 seconds
            if (now >= acidUntil) return;
            const left = acidUntil - now, k = Math.min(1, left / 600) * (.32 + .14 * Math.sin(now / 90));
            c.save();
            c.globalCompositeOperation = 'screen';
            c.globalAlpha = k;
            const g = typeof c.createConicGradient === 'function' ? c.createConicGradient(now / 700, api.W / 2, api.H / 2) : c.createRadialGradient(api.W / 2, api.H / 2, 0, api.W / 2, api.H / 2, api.W * .7);
            ['#ff5ecb', '#6ef0ff', '#b6ff5e', '#ffe65e', '#ff5ecb'].forEach((col, i, arr) => g.addColorStop(i / (arr.length - 1), col));
            c.fillStyle = g; c.fillRect(0, 0, api.W, api.H);
            c.restore();
        }
    };
}

// ---------------------------------------------------------------------------------------
// SOPHIA, THE CHAOS FAIRY GOTH - arrows (shot / glowing heavy / lightning) and the blink.
function createChaosFairy(api) {
    cfgArena.src || (cfgArena.src = 'assets/arenas/cfg-arena.webp');
    const MS = 1000 / 12;
    const RS = .6;                       // her size next to Level 1's Olly (PROVISIONAL)
    const ARROW_Y = 165;                 // arrows fly at chest height
    const BLINK_COOLDOWN = 6000, GONE_FROM = 750, GONE_TO = 1550, MOVE_AT = 1250, BLINK_END = 2583;
    const STORM_MS = 4500, STORM_R = 150, STORM_TICK = 600, STORM_DMG = 4;
    const ATTACKS = {                    // PROVISIONAL numbers, same as the preview
        shot: { dmg: 12, fireAt: 1700, end: 2500, speed: 900, label: 'ARROW' },
        heavy: { dmg: 24, fireAt: 1900, end: 2500, speed: 560, label: 'GLOWING ARROW' },
        electric: { dmg: 18, fireAt: 3300, end: 3800, speed: 1800, label: 'LIGHTNING ARROW' }
    };
    let state = 'idle', start = 0, nextAt = 0, fired = false, moved = false, blinkFrom = 0, blinkReadyAt = 0, last = null;
    let arrows = [], storm = null, dust = [], flashUntil = 0, boltFlashUntil = 0, deathStart = 0, tutorialAsked = false;

    const blinkE = now => state === 'blink' ? now - start : -1;
    function set(s, now) { state = s; start = now; fired = false; }
    function burst(x, n, now) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160;
            dust.push({ x: x + (Math.random() - .5) * 60, y: api.floorY - 30 - Math.random() * 140, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30, born: now, life: 700 + Math.random() * 600 });
        }
    }
    function begin(id, now) {
        set(id, now); last = id;
        if (!tutorialAsked && id !== 'blink') { tutorialAsked = true; api.queueRingTutorial('red'); }
        if (id === 'blink') { moved = false; blinkFrom = api.getX(); api.status('She twirls into the dust - hit her before she goes!'); }
        else if (id === 'shot') api.status('She draws her bow... DODGE the arrow!');
        else if (id === 'heavy') api.status('Her hand is glowing - big arrow coming! DODGE!');
        else api.status('The air crackles... lightning arrow! DODGE!');
    }
    function pick(now) {
        const x = api.getX(), d = Math.abs(api.playerX() - x);
        const cornered = x < 200 || x > api.W - 200;
        if (now >= blinkReadyAt && ((d < 260 && cornered) || Math.random() < .3)) return 'blink';
        const pool = ['shot', 'heavy', 'electric'].filter(a => a !== last);
        return pool[Math.floor(Math.random() * pool.length)];
    }
    function frame(now) {
        const e = now - start;
        if (state === 'shot') return ['cfg_shot', Math.min(29, e / MS)];
        if (state === 'heavy') return ['cfg_heavy', Math.min(15, e / MS)];
        if (state === 'electric') return ['cfg_electric', Math.min(30, e / MS)];
        if (state === 'blink') return ['cfg_dust', Math.min(30, e / (BLINK_END / 31))];
        if (state === 'death') return ['cfg_dust', Math.min(30, (now - deathStart) / 55)];
        return ['cfg_idle', (now / MS) % 31];
    }
    function blinkAlpha(e) {
        if (e < 0) return 1;
        if (e < GONE_FROM) return 1 - .9 * (e / GONE_FROM);
        if (e <= GONE_TO) return 0;
        return Math.min(1, (e - GONE_TO) / 450);
    }

    return {
        name: 'SOPHIA • THE CHAOS FAIRY GOTH',
        hitRange: 250,
        bodyGap: 100,
        background: cfgArena,
        hurtRate: 1.18,
        hidesOlly: () => false,
        untargetable: now => { const e = blinkE(now); return state === 'death' || (e >= GONE_FROM && e <= GONE_TO); },
        consumePunch: () => false,
        onDodge() {},
        onHit(now) { flashUntil = now + 115; },
        start(now) { set('idle', now); nextAt = now + 1800; blinkReadyAt = now + 4000; arrows = []; storm = null; dust = []; api.setX(api.W - 320); },
        ready(now) { set('idle', now); nextAt = now + 1500; blinkReadyAt = now + 4000; },   // called when the 3-2-1 ends
        die(now) { set('death', now); deathStart = now; arrows = []; storm = null; burst(api.getX(), 40, now); api.status('Sophia tumbles out of the air in a puff of glitter!'); return 2000; },
        update(dt, now) {
            const x = api.getX(), px = api.playerX(), elapsed = now - start;
            dust = dust.filter(p => now - p.born < p.life);
            for (const p of dust) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= .97; p.vy *= .97; }
            if (state === 'death') return;
            for (const ar of arrows) {
                ar.x += ar.vx * dt;
                if (!ar.done && Math.abs(ar.x - px) < 40) {
                    ar.done = true;
                    // only a dodge avoids an arrow (red ring); jumping doesn't
                    ar.hit = api.hurt(ar.dmg, 1e5, ar.label, { ignoreAir: true, push: ar.id === 'heavy' ? 50 : 30 });
                }
            }
            arrows = arrows.filter(ar => !ar.hit && ar.x > -120 && ar.x < api.W + 120);
            if (storm) {
                if (now >= storm.until) storm = null;
                else if (now >= storm.nextTick && Math.abs(px - storm.x) < STORM_R) {
                    storm.nextTick = now + STORM_TICK;
                    api.hurt(STORM_DMG, 1e5, 'DUST STORM', { ignoreAir: true, push: 0 });
                }
            }
            if (state === 'idle') {   // she kites: keeps 300-520px away, slowly (Olly can always catch her)
                const d = Math.abs(px - x), away = px < x ? 1 : -1;
                let nx = x;
                if (d < 300) nx += away * 70 * dt; else if (d > 520) nx -= away * 70 * dt;
                api.setX(Math.max(140, Math.min(api.W - 140, nx)));
                if (now >= nextAt) begin(pick(now), now);
                return;
            }
            if (state === 'blink') {
                if (!moved && elapsed >= MOVE_AT) {
                    moved = true;
                    storm = { x: blinkFrom, until: now + STORM_MS, nextTick: now + 400 };
                    burst(blinkFrom, 26, now);
                    const side = Math.random() < .5 ? -1 : 1;
                    const cand = [side, -side].map(sd => px + sd * (330 + Math.random() * 170)).map(v => Math.max(160, Math.min(api.W - 160, v)));
                    api.setX(cand.find(v => Math.abs(v - px) >= 240) ?? cand[0]);
                    burst(api.getX(), 20, now);
                }
                if (elapsed >= BLINK_END) { set('idle', now); nextAt = now + 1400; blinkReadyAt = now + BLINK_COOLDOWN; api.status('Dizzy from the twirl - hit her now!'); }
                return;
            }
            const a = ATTACKS[state];
            if (a) {
                if (!fired && elapsed >= a.fireAt) {
                    fired = true;
                    const dir = px < x ? -1 : 1;
                    arrows.push({ x: x + dir * 90, vx: dir * a.speed, dmg: a.dmg, id: state, label: a.label });
                    api.sfx(state === 'electric' ? 'chain-impact' : 'olly-dodge-grunt', .5, state === 'electric' ? 1.6 : 2.2);
                    if (state === 'electric') boltFlashUntil = now + 140;
                }
                if (elapsed >= a.end) { set('idle', now); nextAt = now + 1500; }
            }
        },
        draw(c, now) {
            const x = api.getX(), px = api.playerX(), floorY = api.floorY, elapsed = now - start;
            if (storm) {   // glittery dust storm left where she blinked from (stings if you stand in it)
                const fade = Math.min(1, Math.max(0, storm.until - now) / 700);
                c.save();
                for (let i = 0; i < 22; i++) {
                    const ang = now / 260 + i * .9, r = (i % 7) / 7 * STORM_R + 20;
                    const sx = storm.x + Math.cos(ang) * r, sy = floorY - 30 - (i % 5) * 34 + Math.sin(ang * 1.3) * 16;
                    const g = c.createRadialGradient(sx, sy, 0, sx, sy, 40);
                    g.addColorStop(0, `rgba(255,170,230,${.5 * fade})`); g.addColorStop(1, 'rgba(255,170,230,0)');
                    c.fillStyle = g; c.beginPath(); c.arc(sx, sy, 40, 0, Math.PI * 2); c.fill();
                }
                c.restore();
            }
            const atk = ATTACKS[state];
            if (atk && !fired) {
                // red ring = dodge it, plus a dashed aim line along the arrow's path
                const p = (elapsed - (atk.fireAt - 900)) / 900;
                if (p >= 0 && p <= 1) {
                    api.ring(c, x, 200, 'red', p, false, now, 900);
                    const dir = px < x ? -1 : 1;
                    c.save();
                    c.strokeStyle = state === 'electric' ? `rgba(150,220,255,${.15 + .5 * p})` : `rgba(255,150,220,${.12 + .4 * p})`;
                    c.lineWidth = state === 'heavy' ? 7 : 3; c.setLineDash([14, 10]);
                    c.beginPath(); c.moveTo(x + dir * 90, floorY - ARROW_Y); c.lineTo(dir > 0 ? api.W : 0, floorY - ARROW_Y); c.stroke();
                    c.restore();
                }
            }
            const [clip, idx] = frame(now);
            const faceRight = px > x;
            const shake = state === 'electric' && elapsed > 1500 && !fired ? (Math.random() - .5) * 9 : 0;
            const bob = state === 'idle' ? Math.sin(now / 420) * 8 : 0;
            const alpha = state === 'death' ? 1 - Math.min(1, (now - deathStart) / 1700) : blinkAlpha(blinkE(now));
            const ok = drawAtlas(c, clip, idx, x + shake, floorY - 20 + bob, faceRight ? 'right' : 'left', 'right', RS, alpha, now < flashUntil ? 'brightness(1.9)' : '', clip === 'cfg_heavy' ? -380 : null);
            if (!ok && state !== 'death') { c.fillStyle = 'rgba(230,110,180,.5)'; c.beginPath(); c.ellipse(x, floorY - 170, 70, 150, 0, 0, Math.PI * 2); c.fill(); }
            const hx = x + (faceRight ? 1 : -1) * 90, hy = floorY - ARROW_Y - 10;
            if (state === 'heavy' && !fired && elapsed > 500) {
                const t = Math.min(1, (elapsed - 500) / 1400), r = 24 + 40 * t + Math.sin(now / 60) * 4;
                const g = c.createRadialGradient(hx, hy, 0, hx, hy, r); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,120,200,0)');
                c.fillStyle = g; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
            }
            if (state === 'electric' && elapsed > 1200 && !fired) {
                c.save(); c.strokeStyle = 'rgba(190,235,255,.9)'; c.lineWidth = 2.5; c.lineCap = 'round';
                for (let i = 0; i < 4; i++) {
                    let lx = hx, ly = hy; c.beginPath(); c.moveTo(lx, ly);
                    for (let k = 0; k < 4; k++) { lx += (Math.random() - .5) * 60; ly += (Math.random() - .5) * 60; c.lineTo(lx, ly); }
                    c.stroke();
                }
                c.restore();
            }
            for (const p of dust) {
                const t = (now - p.born) / p.life;
                c.fillStyle = `rgba(255,190,240,${.7 * (1 - t)})`; c.beginPath(); c.arc(p.x, p.y, 3 + 4 * (1 - t), 0, Math.PI * 2); c.fill();
            }
            for (const ar of arrows) {
                const big = ar.id === 'heavy', bolt = ar.id === 'electric', L = big ? 120 : bolt ? 180 : 80, y = floorY - ARROW_Y, dir = Math.sign(ar.vx);
                c.save(); c.lineCap = 'round';
                c.strokeStyle = bolt ? 'rgba(190,235,255,.95)' : big ? 'rgba(255,225,150,.95)' : 'rgba(235,220,200,.95)';
                c.lineWidth = big ? 10 : bolt ? 5 : 4; c.shadowColor = bolt ? '#8fd8ff' : big ? '#ffb0e0' : 'transparent'; c.shadowBlur = bolt || big ? 20 : 0;
                c.beginPath(); c.moveTo(ar.x - dir * L, y + (bolt ? Math.sin(now / 20) * 6 : 0)); c.lineTo(ar.x, y); c.stroke();
                c.beginPath(); c.moveTo(ar.x, y); c.lineTo(ar.x - dir * 18, y - 9); c.moveTo(ar.x, y); c.lineTo(ar.x - dir * 18, y + 9); c.stroke();
                c.restore();
            }
        },
        drawOver(c, now) {   // lightning wind-up: the arena dims and flickers; the bolt flashes white
            let dim = 0;
            if (state === 'electric') {
                const e = now - start;
                dim = Math.min(1, e / 2400) * .5;
                if (e > 1500 && Math.sin(now / 37) > .6) dim *= .4;
            }
            if (dim > 0) { c.fillStyle = `rgba(5,10,30,${dim})`; c.fillRect(0, 0, api.W, api.H); }
            if (now < boltFlashUntil) { c.fillStyle = `rgba(210,240,255,${.5 * (boltFlashUntil - now) / 140})`; c.fillRect(0, 0, api.W, api.H); }
        }
    };
}
