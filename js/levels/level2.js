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
const MAP_ZOOM = 1.9;   // bumped up from 1.5 per Scarlett - a closer, tighter framing
const CAM_LEAD_Y = 90;
// Olly's drawn size on this map is independent of MAP_ZOOM (both he and the background
// scale together with the camera, so zoom alone can't change his size relative to the
// map) - this is the actual fix for "Olly feels a bit big": shrink his own draw scale.
const OLLY_MAP_SCALE = 0.792;   // V9.86: +10% per Scarlett (was 0.72)

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
// Devil's Fingers (Level 2 miniboss) encounter spot. Placeholder position on the map -
// nothing in the art marks this spot yet, so Scarlett will want to move this once she's
// looked at the real map art; it's only here so the fight is actually reachable to test.
const DF_SPOT = { x: 980, y: 640, name: "Devil's Fingers" };

// Olly now starts right at the glowing tree-hollow archway near the top of the map
// (Scarlett: "his starting position to be the top-left tree hollow"), standing on its
// stone threshold just below the doorway itself, rather than down by the fairy ring.
const PLAYER_START = { x: 755, y: 300 };

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

// Find Scarlett's background - cropped straight from the fairy ring that's already
// sitting on the Level 2 map art at roughly the mini-game spot's own position (Scarlett's
// idea), rather than needing new art. Source crop: level2-map-bg.webp (380,600)-(970,1024).
const shellGameBackground = new Image();
shellGameBackground.src = 'assets/environment/find-scarlett-bg.webp';

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

// --- Devil's Fingers (Level 2 miniboss) combat ---------------------------------------
// Atlases built by tools/build_devilsfingers_assets.py from her 6 source clips (see that
// script's own docstring for the full per-clip documentation). Frame rows are the same
// [atlasX, atlasY, w, h, offX, offY] shape used by Patricia/Chain Goth in level1.js.
// Loaded lazily (only once the player actually reaches the encounter) since these are a
// few MB each and Level 2 preview has no reason to pay that cost just sitting on the map.
const DF_CLIP_NAMES = ['df_disappear', 'df_grab', 'df_creepycrawl', 'df_dfcrawl', 'df_flick', 'df_acidtrip'];
const dfAtlas = {};
let dfAssetsRequested = false, dfAtlasData = null;
function loadDevilsFingersAssets() {
    if (dfAssetsRequested) return;
    dfAssetsRequested = true;
    fetch('assets/characters/devilsfingers/atlas_data.json').then(r => r.json()).then(data => {
        dfAtlasData = data;
        for (const name of DF_CLIP_NAMES) {
            const d = data[name];
            if (!d) continue;
            const img = new Image();
            img.src = `assets/characters/devilsfingers/atlas/${name}.webp`;
            dfAtlas[name] = { img, frames: d.frames, scale: d.scale, anchor: d.anchor };
        }
    }).catch(() => {});
}
// Real frame timing, from the build script's own frame-step documentation (24fps source,
// df_disappear/df_grab packed every 3rd frame = 125ms/frame, the rest every 2nd = 83.3ms/frame).
const DF_FRAME_MS = { df_disappear: 125, df_grab: 125, df_creepycrawl: 1000 / 12, df_dfcrawl: 1000 / 12, df_flick: 1000 / 12, df_acidtrip: 1000 / 12 };
// Minimal, self-contained version of level1.js's drawChainAtlasFrame - same algorithm,
// without the Chain-Goth-specific width-stretch or "last good frame" fallback (DF's clips
// aren't continuously on screen the way she is, so a blank frame during a load stall is fine).
function drawDFAtlasFrame(c, pack, index, x, floorY, face, renderScale = 1, alpha = 1) {
    if (!pack?.img?.complete || !pack.img.naturalWidth || !pack.frames?.length) return false;
    const n = pack.frames.length, i = Math.max(0, Math.min(n - 1, Math.floor(index)));
    const f = pack.frames[i];
    const k = renderScale / pack.scale;
    c.save();
    c.globalAlpha = alpha;
    c.translate(Math.round(x), Math.round(floorY));
    c.scale(face === 'left' ? 1 : -1, 1);   // art faces left, like Patricia/Chain Goth's
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    // f[4]/f[5] (the anchor-relative offset) are in the SOURCE clip's original pixel
    // units, so they scale by renderScale directly; f[2]/f[3] (the atlas crop's own
    // width/height) are already at the atlas's packed scale, so they scale by k to land
    // at the requested renderScale. (Mixing these up is exactly what made df_grab -
    // the one clip packed at scale 0.55 instead of 1.0 - render in the wrong place.)
    c.drawImage(pack.img, f[0], f[1], f[2], f[3], Math.round(f[4] * renderScale), Math.round(f[5] * renderScale), Math.round(f[2] * k), Math.round(f[3] * k));
    c.restore();
    return true;
}

// --- Chaos Fairy Goth (Level 2 boss) assets ------------------------------------------
// Atlases built by tools/build_chaosfairy_assets.py. Every CFG clip is normalised so her
// standing figure is the same size, offsets are in normalised source px, scale is 0.5, and
// the art is drawn facing RIGHT natively (opposite of Devil's Fingers).
const CFG_CLIP_NAMES = ['cfg_idle', 'cfg_shot', 'cfg_heavy', 'cfg_electric', 'cfg_dust'];
const cfgAtlas = {};
let cfgAssetsRequested = false;
const cfgArenaBg = new Image();
function loadChaosFairyAssets() {
    if (cfgAssetsRequested) return;
    cfgAssetsRequested = true;
    cfgArenaBg.src = 'assets/arenas/cfg-arena.webp';
    fetch('assets/characters/chaosfairy/atlas_data.json').then(r => r.json()).then(data => {
        for (const name of CFG_CLIP_NAMES) {
            const d = data[name];
            if (!d) continue;
            const img = new Image();
            img.src = `assets/characters/chaosfairy/atlas/${name}.webp`;
            cfgAtlas[name] = { img, frames: d.frames, scale: d.scale, anchor: d.anchor };
        }
    }).catch(() => {});
}
function drawCFGFrame(c, pack, index, x, floorY, faceRight, rs, alpha = 1) {
    if (!pack?.img?.complete || !pack.img.naturalWidth || !pack.frames?.length) return false;
    const n = pack.frames.length, f = pack.frames[Math.max(0, Math.min(n - 1, Math.floor(index)))];
    const k = rs / pack.scale;
    c.save();
    c.globalAlpha = Math.max(0, Math.min(1, alpha));
    c.translate(Math.round(x), Math.round(floorY));
    c.scale(faceRight ? 1 : -1, 1);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(pack.img, f[0], f[1], f[2], f[3], Math.round(f[4] * rs), Math.round(f[5] * rs), Math.round(f[2] * k), Math.round(f[3] * k));
    c.restore();
    return true;
}

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

    // 'map' | 'mushroom' | 'combat'
    let mode = 'map';

    // --- Devil's Fingers combat runtime state --------------------------------------
    const DF_MAX_HP = 200, OLLY_COMBAT_MAX_HP = 100;
    const DF_PUNCH_DAMAGE = 5, DF_PUNCH_COMBO = 3, DF_PUNCH_COOLDOWN_MS = 10000;
    const DF_HEAVY_DAMAGE = 20, DF_HEAVY_COOLDOWN_MS = 60000;
    const DF_DODGE_INVULN_MS = 500, DF_DODGE_COOLDOWN_MS = 600;
    const DF_MELEE_RANGE = 170;
    const DF_ARENA_W = 1440, DF_ARENA_FLOOR_Y = 560;
    // Her 5 named attacks. hitMs are provisional "when does this actually land" timings
    // picked from the clips' own real durations (see DF_FRAME_MS/build script) - flagged
    // for Scarlett to eyeball once she can see the fight, same as the still-unpinned
    // Tentacle Swipe strike frame from the original checklist.
    const DF_ATTACKS = {
        disappear: { clip: 'df_disappear', dmg: 15, hitMs: 7310, label: 'Burrowing' },
        creepycrawl: { clip: 'df_creepycrawl', dmg: 0, hitMs: null, label: 'Crawling (brace)' },   // windup only, leads into dfcrawl
        dfcrawl: { clip: 'df_dfcrawl', dmg: 8, hitMs: 3350, label: 'Crawling' },
        flick: { clip: 'df_flick', dmg: 12, hitMs: 2450, label: 'Tentacle Swipe' },   // TODO(Scarlett): pin down the real strike frame
        acidtrip: { clip: 'df_acidtrip', dmg: 10, hitMs: 2433, label: 'Acid Bombs: The Trip' }
    };
    const DF_GRAB_CATCH_MS = 3544;   // dodge window: dodge any time before this and the grab whiffs entirely
    const DF_GRAB_QTE_MS = 2500, DF_GRAB_MASH_NEEDED = 8;
    const DF_GRAB_ESCAPE_DAMAGE = 8, DF_GRAB_FAIL_DAMAGE = 30;
    const ACID_TRIP_EFFECT_MS = 5000;   // whole-screen swirl + Olly dazed, per Scarlett

    let dfHP = DF_MAX_HP, ollyCombatHP = OLLY_COMBAT_MAX_HP;
    let dfState = 'idle', dfStateStart = 0, dfNextAttackAt = 0, dfHitApplied = false;
    let dfArenaX = DF_ARENA_W * 0.74, ollyArenaX = DF_ARENA_W * 0.26, dfFacing = 'left';
    let dfMashCount = 0, dfQteDeadline = 0, dfFreezeFrameIdx = 0, dfFailStart = 0;
    let dfLastAttackId = null;
    let attackComboCount = 0, attackCooldownUntil = 0, heavyCooldownUntil = 0;
    let playerInvulnUntil = 0, dodgeCooldownUntil = 0;
    let acidEffectUntil = 0;
    let dfCombatStatus = '';
    let dfDom = null;   // built lazily on entering the fight, torn down on exit
    let dfNowMs = 0;

    // --- Chaos Fairy Goth fight state ------------------------------------------------
    // She reuses the shared foe variables above (dfHP = her HP, dfArenaX = her x,
    // dfState/dfStateStart/dfNextAttackAt = her state machine) so Olly's punch/heavy/dodge
    // work on her unchanged. `fightId` says which boss is currently loaded.
    let fightId = 'df';
    let foeMaxHP = DF_MAX_HP;
    // PROVISIONAL numbers (flagged for Scarlett to tune once she's watched the fight).
    const CFG_MAX_HP = 250;
    const CFG_RS = 0.38;                       // render scale: ~234px tall vs Olly's 190px
    const CFG_MS = 1000 / 12;                  // atlas frame time (24fps source, every 2nd frame)
    const CFG_ARROW_Y = 120;                   // arrow travel height above the floor
    const CFG_BLINK_COOLDOWN_MS = 6000;
    const CFG_BLINK_GONE_FROM = 750, CFG_BLINK_GONE_TO = 1550;   // the ONLY window she can't be hit
    const CFG_BLINK_MOVE_AT = 1250, CFG_BLINK_END = 2583;
    const CFG_STORM_MS = 4500, CFG_STORM_RADIUS = 130, CFG_STORM_TICK_MS = 600, CFG_STORM_DMG = 4;
    const CFG_ATTACKS = {
        shot:     { dmg: 12, fireAt: 1700, end: 2500, speed: 900, label: 'Arrow' },
        heavy:    { dmg: 24, fireAt: 1900, end: 2500, speed: 560, label: 'Glowing Arrow' },
        electric: { dmg: 18, fireAt: 3300, end: 3800, speed: 1800, label: 'Lightning Arrow' }
    };
    let cfgArrows = [], cfgStorm = null, cfgDust = [];
    let cfgBlinkReadyAt = 0, cfgBlinkFromX = 0, cfgMoved = false, cfgFired = false, cfgDir = 1, cfgFlashUntil = 0;
    let cfgLastAttack = null;

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

    // --- Devil's Fingers: enter / exit ----------------------------------------------
    function buildDfDom(title = "DEVIL'S FINGERS (PREVIEW)", name = "DEVIL'S FINGERS", hpColor = '#b878e0', intro = 'A monstrous tangle of fingers blocks the way.', maxHp = DF_MAX_HP) {
        const ov = document.createElement('div');
        ov.id = 'df-combat-overlay';
        ov.style.cssText = 'position:fixed;inset:0;z-index:10030;background:#0a0710;display:flex;flex-direction:column;align-items:center;justify-content:center;';
        ov.innerHTML = `
            <div style="width:min(94vw,1200px);display:flex;flex-direction:column;gap:8px;">
                <div style="display:flex;justify-content:space-between;align-items:center;font:700 15px Georgia,serif;color:#f0e6f5;">
                    <div>OLLY <span id="df-olly-hp-text">100 / 100</span></div>
                    <div style="letter-spacing:.04em;">${title}</div>
                    <div><span id="df-enemy-hp-text">${maxHp} / ${maxHp}</span> ${name}</div>
                </div>
                <div style="display:flex;gap:10px;">
                    <div style="flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;"><div id="df-olly-hp-bar" style="height:100%;width:100%;background:#7fd68a;transition:width .15s;"></div></div>
                    <div style="flex:1;height:10px;border-radius:6px;background:rgba(255,255,255,.12);overflow:hidden;"><div id="df-enemy-hp-bar" style="height:100%;width:100%;background:${hpColor};transition:width .15s;"></div></div>
                </div>
                <div style="position:relative;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,.14);">
                    <canvas id="df-combat-canvas" width="1440" height="650" style="display:block;width:100%;height:auto;background:#140a1c;"></canvas>
                    <div id="df-acid-fx" style="position:absolute;inset:0;pointer-events:none;opacity:0;mix-blend-mode:screen;background:conic-gradient(from 0deg,#ff5ecb,#6ef0ff,#b6ff5e,#ffe65e,#ff5ecb);"></div>
                </div>
                <div id="df-combat-status" style="min-height:22px;text-align:center;font:600 14px Georgia,serif;color:#e8d9ef;">${intro}</div>
                <div style="text-align:center;font:500 12px Georgia,serif;color:#a898b0;">${actionHintFallback('attack')} punch &nbsp;·&nbsp; ${actionHintFallback('heavy')} heavy &nbsp;·&nbsp; ${actionHintFallback('dodge')}/right-click dodge</div>
            </div>`;
        document.body.appendChild(ov);
        return {
            ov,
            canvas: ov.querySelector('#df-combat-canvas'),
            ctx: ov.querySelector('#df-combat-canvas').getContext('2d'),
            status: ov.querySelector('#df-combat-status'),
            ollyHpBar: ov.querySelector('#df-olly-hp-bar'), ollyHpText: ov.querySelector('#df-olly-hp-text'),
            enemyHpBar: ov.querySelector('#df-enemy-hp-bar'), enemyHpText: ov.querySelector('#df-enemy-hp-text'),
            acidFx: ov.querySelector('#df-acid-fx')
        };
    }
    // Shows the DEFAULT key for each action (controls.js isn't imported into this file,
    // to avoid a second module instance) - if Scarlett's rebound her keys this hint line
    // will say the wrong key; fine for a combat preview, worth fixing if this goes live.
    function actionHintFallback(act) { return act === 'attack' ? 'X' : act === 'heavy' ? 'Z' : 'R'; }
    function dfSetStatus(s) { dfCombatStatus = s; if (dfDom) dfDom.status.textContent = s; }
    function enterDevilsFingersCombat() {
        if (mode === 'combat') return;
        loadDevilsFingersAssets();
        mode = 'combat';
        fightId = 'df'; foeMaxHP = DF_MAX_HP;
        dfHP = DF_MAX_HP; ollyCombatHP = OLLY_COMBAT_MAX_HP;
        dfState = 'idle'; dfStateStart = dfNowMs; dfNextAttackAt = dfNowMs + 1400; dfHitApplied = false;
        dfArenaX = DF_ARENA_W * 0.74; ollyArenaX = DF_ARENA_W * 0.26; dfFacing = 'left';
        attackComboCount = 0; attackCooldownUntil = 0; heavyCooldownUntil = 0;
        playerInvulnUntil = 0; dodgeCooldownUntil = 0; acidEffectUntil = 0;
        dfDom = buildDfDom();
        dfSetStatus("A monstrous tangle of fingers blocks the way.");
        playSfx('click', 1);
    }
    function enterChaosFairyCombat() {
        if (mode === 'combat') return;
        loadChaosFairyAssets();
        mode = 'combat';
        fightId = 'cfg'; foeMaxHP = CFG_MAX_HP;
        dfHP = CFG_MAX_HP; ollyCombatHP = OLLY_COMBAT_MAX_HP;
        dfState = 'idle'; dfStateStart = dfNowMs; dfNextAttackAt = dfNowMs + 1800; dfHitApplied = false;
        dfArenaX = DF_ARENA_W * 0.74; ollyArenaX = DF_ARENA_W * 0.26; dfFacing = 'left';
        attackComboCount = 0; attackCooldownUntil = 0; heavyCooldownUntil = 0;
        playerInvulnUntil = 0; dodgeCooldownUntil = 0; acidEffectUntil = 0;
        cfgArrows = []; cfgStorm = null; cfgDust = []; cfgBlinkReadyAt = dfNowMs + 4000; cfgLastAttack = null; cfgFlashUntil = 0;
        dfDom = buildDfDom('CHAOS FAIRY GOTH (PREVIEW)', 'CHAOS FAIRY GOTH', '#e86fb0', 'Something small and furious flutters between the ruins.', CFG_MAX_HP);
        dfDom.canvas.style.background = '#0c1a10';
        dfSetStatus('Something small and furious flutters between the ruins.');
        playSfx('click', 1);
    }
    function exitDevilsFingersCombat(won) {
        if (mode !== 'combat') return;
        mode = 'map';
        if (dfDom) { dfDom.ov.remove(); dfDom = null; }
        const cfg = fightId === 'cfg';
        ui.dialogue.textContent = won
            ? (cfg ? "The Chaos Fairy Goth drops her bow and flutters away. (PREVIEW - no reward/dialogue yet.)" : "Devil's Fingers sinks back into the earth. (PREVIEW - no reward/death sequence yet.)")
            : "Olly stumbles back to the path, shaken. (PREVIEW - no real fail-state yet; HP simply resets.)";
    }

    // --- Devil's Fingers: player actions ---------------------------------------------
    function dfInRange() { return Math.abs(ollyArenaX - dfArenaX) <= DF_MELEE_RANGE; }
    function combatAttackDF() {
        if (mode !== 'combat') return;
        if (dfState === 'grab_qte') {   // mash-X QTE: every fresh attack press counts as one mash
            dfMashCount++;
            playSfx('click');
            dfSetStatus(`Mash! (${Math.min(dfMashCount, DF_GRAB_MASH_NEEDED)}/${DF_GRAB_MASH_NEEDED})`);
            return;
        }
        if (dfNowMs < attackCooldownUntil || dfHP <= 0 || ollyCombatHP <= 0) return;
        if (cfgUntargetable()) { dfSetStatus('She vanished in the dust!'); return; }
        if (!dfInRange()) { dfSetStatus('Too far away to punch.'); return; }
        dfHP = Math.max(0, dfHP - DF_PUNCH_DAMAGE);
        attackComboCount++;
        playSfx('punch-1');
        if (attackComboCount >= DF_PUNCH_COMBO) {
            attackComboCount = 0;
            attackCooldownUntil = dfNowMs + DF_PUNCH_COOLDOWN_MS;
            dfSetStatus(`Combo complete - ${DF_PUNCH_DAMAGE} dmg. 10s cooldown!`);
        } else dfSetStatus(`Punch! ${DF_PUNCH_DAMAGE} dmg.`);
        checkDfDeath();
    }
    function combatHeavyAttackDF() {
        if (mode !== 'combat') return;
        if (dfNowMs < heavyCooldownUntil || dfHP <= 0 || ollyCombatHP <= 0) return;
        if (cfgUntargetable()) { dfSetStatus('She vanished in the dust!'); return; }
        if (!dfInRange()) { dfSetStatus('Too far away to land a heavy hit.'); return; }
        dfHP = Math.max(0, dfHP - DF_HEAVY_DAMAGE);
        heavyCooldownUntil = dfNowMs + DF_HEAVY_COOLDOWN_MS;
        playSfx('olly-heavy-attack');
        dfSetStatus(`HEAVY HIT! ${DF_HEAVY_DAMAGE} dmg. 60s cooldown.`);
        checkDfDeath();
    }
    function combatDodgeDF() {
        if (mode !== 'combat') return;
        if (dfNowMs < dodgeCooldownUntil || ollyCombatHP <= 0) return;
        dodgeCooldownUntil = dfNowMs + DF_DODGE_COOLDOWN_MS;
        playerInvulnUntil = dfNowMs + DF_DODGE_INVULN_MS;
        playSfx('olly-dodge-grunt');
        if (dfState === 'grab_approach') { dfState = 'idle'; dfStateStart = dfNowMs; dfNextAttackAt = dfNowMs + 1400; dfSetStatus('Olly dodges the grab entirely!'); }
    }
    function checkDfDeath() {
        if (dfHP <= 0) { dfSetStatus(fightId === 'cfg' ? 'The Chaos Fairy Goth tumbles out of the air!' : "Devil's Fingers collapses!"); setTimeout(() => exitDevilsFingersCombat(true), 900); }
    }
    function dealOllyDamage(n) {
        ollyCombatHP = Math.max(0, ollyCombatHP - n);
        if (ollyCombatHP <= 0) { dfSetStatus('Olly is overwhelmed...'); setTimeout(() => exitDevilsFingersCombat(false), 900); }
    }
    function dfHitCheck(dmg, label) {
        if (dfNowMs < playerInvulnUntil) { dfSetStatus(`Dodged the ${label}!`); return; }
        if (!dfInRange()) return;   // out of melee range when it landed - treat as a clean miss (range/reach tuning TBD)
        dealOllyDamage(dmg);
        dfSetStatus(`Hit by ${label}! -${dmg} HP.`);
        if (label === 'Acid Bombs: The Trip') acidEffectUntil = dfNowMs + ACID_TRIP_EFFECT_MS;
    }

    // --- Chaos Fairy Goth: AI / state machine ----------------------------------------
    // Her kit (deliberately NOT Patricia's vanish-and-stab):
    //  * shot     - side-on crouch + full draw, then a fast arrow along the floor line (dodge it)
    //  * heavy    - raised glowing hand, then a big slow arrow (easy to see coming, hits harder)
    //  * electric - nocked arrow held up and shaking while the arena dims and flickers, then a very fast bolt
    //  * blink    - twirl in fairy dust: fades out, can't be hit ~0.8s, reappears 200px+ from Olly, leaves a
    //               dust storm behind. Blink is her MOVEMENT - and she never lands a hit on arrival, and she
    //               is fully hittable the rest of the time (incl. while she is still dizzy afterwards).
    function cfgBlinkElapsed() { return dfState === 'blink' ? dfNowMs - dfStateStart : -1; }
    function cfgUntargetable() {
        if (fightId !== 'cfg') return false;
        const e = cfgBlinkElapsed();
        return e >= CFG_BLINK_GONE_FROM && e <= CFG_BLINK_GONE_TO;
    }
    function cfgBurst(x, n) {
        for (let i = 0; i < n; i++) {
            const a = Math.random() * Math.PI * 2, sp = 40 + Math.random() * 160;
            cfgDust.push({ x: x + (Math.random() - .5) * 60, y: DF_ARENA_FLOOR_Y - 20 - Math.random() * 90,
                vx: Math.cos(a) * sp, vy: Math.sin(a) * sp * .6 - 30, born: dfNowMs, life: 700 + Math.random() * 600 });
        }
    }
    function startCfgAttack(id) {
        dfState = id; dfStateStart = dfNowMs; dfHitApplied = false; cfgFired = false; cfgLastAttack = id;
        if (id === 'blink') { cfgMoved = false; cfgBlinkFromX = dfArenaX; dfSetStatus('She twirls into the dust - hit her before she goes, or get ready to chase!'); }
        else if (id === 'shot') dfSetStatus('She draws her bow...');
        else if (id === 'heavy') dfSetStatus('Her hand is glowing - big arrow coming!');
        else if (id === 'electric') dfSetStatus('The air crackles... lightning arrow! Dodge it!');
    }
    function pickNextCfgAttack() {
        const d = Math.abs(ollyArenaX - dfArenaX);
        const cornered = dfArenaX < 170 || dfArenaX > DF_ARENA_W - 170;
        const blinkReady = dfNowMs >= cfgBlinkReadyAt;
        if (blinkReady && ((d < 230 && cornered) || Math.random() < 0.3)) return 'blink';
        const pool = ['shot', 'heavy', 'electric'].filter(a => a !== cfgLastAttack);
        return pool[Math.floor(Math.random() * pool.length)];
    }
    function cfgFireArrow(id) {
        const a = CFG_ATTACKS[id];
        cfgDir = ollyArenaX < dfArenaX ? -1 : 1;
        cfgArrows.push({ x: dfArenaX + cfgDir * 70, vx: cfgDir * a.speed, dmg: a.dmg, id, label: a.label, dodged: false, born: dfNowMs });
        if (id === 'electric') cfgFlashUntil = dfNowMs + 140;
    }
    function updateChaosFairy(dt) {
        const nowMs = dfNowMs, elapsed = nowMs - dfStateStart;
        // dust particles + arrows keep moving even while she is between states
        cfgDust = cfgDust.filter(p => nowMs - p.born < p.life);
        for (const p of cfgDust) { p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.97; p.vy *= 0.97; }
        for (const ar of cfgArrows) {
            ar.x += ar.vx * dt;
            if (!ar.dodged && !ar.hit && Math.abs(ar.x - ollyArenaX) < 34) {
                if (nowMs < playerInvulnUntil) { ar.dodged = true; dfSetStatus(`Dodged the ${ar.label}!`); }
                else { ar.hit = true; dealOllyDamage(ar.dmg); dfSetStatus(`Hit by the ${ar.label}! -${ar.dmg} HP.`); }
            }
        }
        cfgArrows = cfgArrows.filter(ar => !ar.hit && ar.x > -80 && ar.x < DF_ARENA_W + 80);
        if (cfgStorm) {
            if (nowMs >= cfgStorm.until) cfgStorm = null;
            else if (nowMs >= cfgStorm.nextTick && Math.abs(ollyArenaX - cfgStorm.x) < CFG_STORM_RADIUS) {
                cfgStorm.nextTick = nowMs + CFG_STORM_TICK_MS;
                if (nowMs >= playerInvulnUntil) { dealOllyDamage(CFG_STORM_DMG); dfSetStatus(`The dust storm scours Olly! -${CFG_STORM_DMG} HP.`); }
            }
        }
        if (dfHP <= 0 || ollyCombatHP <= 0) return;

        if (dfState === 'idle') {
            // kite: keep roughly 300-520px from Olly, slowly (Olly is faster, so he can always catch her)
            const d = Math.abs(ollyArenaX - dfArenaX), away = ollyArenaX < dfArenaX ? 1 : -1;
            if (d < 300) dfArenaX += away * 70 * dt; else if (d > 520) dfArenaX -= away * 70 * dt;
            dfArenaX = Math.max(100, Math.min(DF_ARENA_W - 100, dfArenaX));
            if (nowMs >= dfNextAttackAt) startCfgAttack(pickNextCfgAttack());
            return;
        }
        if (dfState === 'blink') {
            if (!cfgMoved && elapsed >= CFG_BLINK_MOVE_AT) {
                cfgMoved = true;
                cfgStorm = { x: cfgBlinkFromX, until: nowMs + CFG_STORM_MS, nextTick: nowMs + 400 };
                cfgBurst(cfgBlinkFromX, 26);
                const side = Math.random() < 0.5 ? -1 : 1;
                const cand = [side, -side].map(sd => ollyArenaX + sd * (330 + Math.random() * 170)).map(v => Math.max(120, Math.min(DF_ARENA_W - 120, v)));
                dfArenaX = cand.find(v => Math.abs(v - ollyArenaX) >= 220) ?? cand[0];
                cfgBurst(dfArenaX, 20);
            }
            if (elapsed >= CFG_BLINK_END) { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1400; cfgBlinkReadyAt = nowMs + CFG_BLINK_COOLDOWN_MS; dfSetStatus('Dizzy from the twirl - hit her now!'); }
            return;
        }
        const a = CFG_ATTACKS[dfState];
        if (a) {
            if (!cfgFired && elapsed >= a.fireAt) { cfgFired = true; cfgFireArrow(dfState); }
            if (elapsed >= a.end) { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1500; }
        }
    }
    function cfgCurrentFrame() {
        const elapsed = dfNowMs - dfStateStart;
        if (dfState === 'shot') return { clip: 'cfg_shot', idx: Math.min(29, elapsed / CFG_MS) };
        if (dfState === 'heavy') return { clip: 'cfg_heavy', idx: Math.min(15, elapsed / CFG_MS) };
        if (dfState === 'electric') return { clip: 'cfg_electric', idx: Math.min(30, elapsed / CFG_MS) };
        if (dfState === 'blink') return { clip: 'cfg_dust', idx: Math.min(30, elapsed / (CFG_BLINK_END / 31)) };
        return { clip: 'cfg_idle', idx: (dfNowMs / CFG_MS) % 31 };
    }
    function cfgBlinkAlpha(e) {
        if (e < 0) return 1;
        if (e < CFG_BLINK_GONE_FROM) return 1 - 0.9 * (e / CFG_BLINK_GONE_FROM);   // fade down to 0.1
        if (e <= CFG_BLINK_GONE_TO) return 0;
        return Math.min(1, (e - CFG_BLINK_GONE_TO) / 450);
    }
    function drawChaosFairyScene(c, canvas, nowMs) {
        // arena (cathedral ruins) - bottom-aligned crop so the mossy ground sits under the fight
        if (cfgArenaBg.complete && cfgArenaBg.naturalWidth) c.drawImage(cfgArenaBg, 0, 160, 1440, 650, 0, 0, canvas.width, canvas.height);
        else { c.fillStyle = '#0c1a10'; c.fillRect(0, 0, canvas.width, canvas.height); }
        const elapsed = nowMs - dfStateStart;
        // dust storm patch left where she blinked from
        if (cfgStorm) {
            const left = Math.max(0, cfgStorm.until - nowMs), fade = Math.min(1, left / 700);
            c.save();
            for (let i = 0; i < 22; i++) {
                const ang = nowMs / 260 + i * 0.9, r = (i % 7) / 7 * CFG_STORM_RADIUS + 20;
                const px = cfgStorm.x + Math.cos(ang) * r, py = DF_ARENA_FLOOR_Y - 20 - (i % 5) * 26 + Math.sin(ang * 1.3) * 14;
                const g = c.createRadialGradient(px, py, 0, px, py, 34);
                g.addColorStop(0, `rgba(255,170,230,${0.5 * fade})`); g.addColorStop(1, 'rgba(255,170,230,0)');
                c.fillStyle = g; c.beginPath(); c.arc(px, py, 34, 0, Math.PI * 2); c.fill();
            }
            c.restore();
        }
        // telegraph line while she's aiming
        const atk = CFG_ATTACKS[dfState];
        if (atk && !cfgFired) {
            const aimFrom = atk.fireAt - 800;
            if (elapsed > aimFrom) {
                const dir = ollyArenaX < dfArenaX ? -1 : 1, t = Math.min(1, (elapsed - aimFrom) / 800);
                c.save();
                c.strokeStyle = dfState === 'electric' ? `rgba(150,220,255,${0.15 + 0.5 * t})` : `rgba(255,150,220,${0.12 + 0.4 * t})`;
                c.lineWidth = dfState === 'heavy' ? 7 : 3; c.setLineDash([14, 10]);
                c.beginPath(); c.moveTo(dfArenaX + dir * 70, DF_ARENA_FLOOR_Y - CFG_ARROW_Y); c.lineTo(dir > 0 ? canvas.width : 0, DF_ARENA_FLOOR_Y - CFG_ARROW_Y); c.stroke();
                c.restore();
            }
        }
        // her
        const { clip, idx } = cfgCurrentFrame();
        const be = cfgBlinkElapsed();
        const shake = dfState === 'electric' && elapsed > 1500 && !cfgFired ? (Math.random() - .5) * 7 : 0;
        const bob = dfState === 'idle' ? Math.sin(nowMs / 420) * 6 : 0;
        const faceRight = ollyArenaX > dfArenaX;
        const ok = drawCFGFrame(c, cfgAtlas[clip], idx, dfArenaX + shake, DF_ARENA_FLOOR_Y - 26 + bob, faceRight, CFG_RS, cfgBlinkAlpha(be));
        if (!ok) { c.fillStyle = 'rgba(230,110,180,.55)'; c.beginPath(); c.ellipse(dfArenaX, DF_ARENA_FLOOR_Y - 130, 55, 110, 0, 0, Math.PI * 2); c.fill(); }
        // charge glow on her hand (heavy) and crackle (electric)
        const hx = dfArenaX + (faceRight ? 1 : -1) * 60, hy = DF_ARENA_FLOOR_Y - CFG_ARROW_Y - 10;
        if (dfState === 'heavy' && !cfgFired && elapsed > 500) {
            const t = Math.min(1, (elapsed - 500) / 1400), r = 18 + 30 * t + Math.sin(nowMs / 60) * 3;
            const g = c.createRadialGradient(hx, hy, 0, hx, hy, r); g.addColorStop(0, 'rgba(255,230,160,.9)'); g.addColorStop(1, 'rgba(255,120,200,0)');
            c.fillStyle = g; c.beginPath(); c.arc(hx, hy, r, 0, Math.PI * 2); c.fill();
        }
        if (dfState === 'electric' && elapsed > 1200 && !cfgFired) {
            c.save(); c.strokeStyle = 'rgba(190,235,255,.9)'; c.lineWidth = 2; c.lineCap = 'round';
            for (let i = 0; i < 4; i++) {
                let px = hx, py = hy; c.beginPath(); c.moveTo(px, py);
                for (let k = 0; k < 4; k++) { px += (Math.random() - .5) * 46; py += (Math.random() - .5) * 46; c.lineTo(px, py); }
                c.stroke();
            }
            c.restore();
        }
        // dust particles
        for (const p of cfgDust) {
            const t = (nowMs - p.born) / p.life;
            c.fillStyle = `rgba(255,190,240,${0.7 * (1 - t)})`; c.beginPath(); c.arc(p.x, p.y, 3 + 3 * (1 - t), 0, Math.PI * 2); c.fill();
        }
        // arrows
        for (const ar of cfgArrows) {
            const big = ar.id === 'heavy', bolt = ar.id === 'electric', L = big ? 90 : bolt ? 140 : 60, y = DF_ARENA_FLOOR_Y - CFG_ARROW_Y, dir = Math.sign(ar.vx);
            c.save(); c.lineCap = 'round';
            c.strokeStyle = bolt ? 'rgba(190,235,255,.95)' : big ? 'rgba(255,225,150,.95)' : 'rgba(235,220,200,.95)';
            c.lineWidth = big ? 8 : bolt ? 4 : 3; c.shadowColor = bolt ? '#8fd8ff' : big ? '#ffb0e0' : 'transparent'; c.shadowBlur = bolt || big ? 18 : 0;
            c.beginPath(); c.moveTo(ar.x - dir * L, y + (bolt ? Math.sin(nowMs / 20) * 5 : 0)); c.lineTo(ar.x, y); c.stroke();
            c.beginPath(); c.moveTo(ar.x, y); c.lineTo(ar.x - dir * 14, y - 7); c.moveTo(ar.x, y); c.lineTo(ar.x - dir * 14, y + 7); c.stroke();
            c.restore();
        }
    }
    function drawChaosFairyLighting(c, canvas, nowMs) {
        // electric windup: the arena dims and flickers; the bolt itself throws a white flash
        let dim = 0;
        if (dfState === 'electric') {
            const e = nowMs - dfStateStart;
            dim = Math.min(1, e / 2400) * 0.5;
            if (e > 1500 && Math.sin(nowMs / 37) > 0.6) dim *= 0.4;
        }
        if (dim > 0) { c.fillStyle = `rgba(5,10,30,${dim})`; c.fillRect(0, 0, canvas.width, canvas.height); }
        if (nowMs < cfgFlashUntil) { c.fillStyle = `rgba(210,240,255,${0.5 * (cfgFlashUntil - nowMs) / 140})`; c.fillRect(0, 0, canvas.width, canvas.height); }
    }

    // --- Devil's Fingers: AI / state machine -----------------------------------------
    const DF_ATTACK_POOL = ['disappear', 'creepycrawl', 'flick', 'acidtrip', 'grab'];
    function pickNextDfAttack() {
        let id;
        do { id = DF_ATTACK_POOL[Math.floor(Math.random() * DF_ATTACK_POOL.length)]; } while (id === dfLastAttackId && DF_ATTACK_POOL.length > 1);
        dfLastAttackId = id;
        return id;
    }
    function startDfAttack(id) {
        dfState = id; dfStateStart = dfNowMs; dfHitApplied = false;
        if (id === 'grab') { dfState = 'grab_approach'; dfMashCount = 0; }
    }
    function updateDevilsFingers(dt) {
        const nowMs = dfNowMs;
        const elapsed = nowMs - dfStateStart;
        const speed = 220;
        if (held.left) ollyArenaX -= speed * dt; else if (held.right) ollyArenaX += speed * dt;
        ollyArenaX = Math.max(40, Math.min(DF_ARENA_W - 40, ollyArenaX));
        dfFacing = ollyArenaX < dfArenaX ? 'left' : 'right';

        if (fightId === 'cfg') { updateChaosFairy(dt); return; }
        if (dfHP <= 0 || ollyCombatHP <= 0) return;   // frozen on the death/collapse pause

        if (dfState === 'idle') {
            if (nowMs >= dfNextAttackAt) startDfAttack(pickNextDfAttack());
            return;
        }
        if (dfState === 'grab_approach') {
            if (elapsed >= DF_GRAB_CATCH_MS) {
                if (dfInRange()) { dfState = 'grab_qte'; dfQteDeadline = nowMs + DF_GRAB_QTE_MS; dfMashCount = 0; dfFreezeFrameIdx = elapsed / DF_FRAME_MS.df_grab; dfSetStatus("Caught! Mash your punch key to break free!"); }
                else { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1200; }
            }
            return;
        }
        if (dfState === 'grab_qte') {
            if (nowMs >= dfQteDeadline) {
                if (dfMashCount >= DF_GRAB_MASH_NEEDED) {
                    dealOllyDamage(DF_GRAB_ESCAPE_DAMAGE);
                    dfSetStatus(`Olly breaks free! -${DF_GRAB_ESCAPE_DAMAGE} HP. (placeholder escape visual)`);
                    dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1600;
                } else {
                    dfState = 'grab_fail_play'; dfFailStart = nowMs;
                    dealOllyDamage(DF_GRAB_FAIL_DAMAGE);
                    dfSetStatus(`Swallowed and spat out! -${DF_GRAB_FAIL_DAMAGE} HP.`);
                }
            }
            return;
        }
        if (dfState === 'grab_fail_play') {
            const total = 81 * DF_FRAME_MS.df_grab - DF_GRAB_CATCH_MS;
            if (nowMs - dfFailStart >= total) { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1600; }
            return;
        }
        if (dfState === 'creepycrawl') {
            if (elapsed >= 61 * DF_FRAME_MS.df_creepycrawl) startDfAttack('dfcrawl');
            return;
        }
        if (dfState === 'dfcrawl') {
            // She advances toward Olly during the real traversal - gives the "Crawling" windup/charge some actual stakes.
            dfArenaX += (ollyArenaX - dfArenaX) * Math.min(1, dt * 1.1);
            const a = DF_ATTACKS.dfcrawl;
            if (!dfHitApplied && elapsed >= a.hitMs) { dfHitApplied = true; dfHitCheck(a.dmg, a.label); }
            if (elapsed >= 73 * DF_FRAME_MS.df_dfcrawl) { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1600; }
            return;
        }
        const simple = DF_ATTACKS[dfState];
        if (simple) {
            const n = { disappear: 65, flick: 49, acidtrip: 73 }[dfState];
            if (simple.hitMs != null && !dfHitApplied && elapsed >= simple.hitMs) { dfHitApplied = true; dfHitCheck(simple.dmg, simple.label); }
            if (elapsed >= n * DF_FRAME_MS[simple.clip]) { dfState = 'idle'; dfStateStart = nowMs; dfNextAttackAt = nowMs + 1600; }
        }
    }
    function dfCurrentFrame() {
        const elapsed = dfNowMs - dfStateStart;
        if (dfState === 'idle' || dfState === 'grab_approach') return { clip: 'df_creepycrawl', idx: 0 };
        if (dfState === 'grab_qte') return { clip: 'df_grab', idx: dfFreezeFrameIdx };
        if (dfState === 'grab_fail_play') return { clip: 'df_grab', idx: DF_GRAB_CATCH_MS / DF_FRAME_MS.df_grab + (dfNowMs - dfFailStart) / DF_FRAME_MS.df_grab };
        if (dfState === 'dfcrawl') return { clip: 'df_dfcrawl', idx: elapsed / DF_FRAME_MS.df_dfcrawl };
        const a = DF_ATTACKS[dfState];
        if (a) return { clip: a.clip, idx: elapsed / DF_FRAME_MS[a.clip] };
        return { clip: 'df_creepycrawl', idx: 0 };
    }
    function drawDfOlly(c, nowMs) {
        const dazed = nowMs < acidEffectUntil;
        c.save();
        const shake = dazed ? (Math.sin(nowMs / 35) * 6) : 0;
        c.translate(ollyArenaX + shake, DF_ARENA_FLOOR_Y);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(0, 6, 34, 9, 0, 0, Math.PI * 2); c.fill();
        const img = ollySprite.front;
        if (img.complete && img.naturalWidth) {
            const h = 190, w = h * (img.naturalWidth / img.naturalHeight);
            c.save();
            if (dazed) c.transform(1, 0, Math.sin(nowMs / 90) * .05, 1, 0, 0);
            c.drawImage(img, -w / 2, -h + 6, w, h);
            c.restore();
            if (dazed) {   // placeholder "dazed" reaction until Scarlett's new Olly art exists
                c.fillStyle = '#fff';
                c.beginPath(); c.ellipse(-16, -h + 54, 11, 13, 0, 0, Math.PI * 2); c.ellipse(16, -h + 54, 11, 13, 0, 0, Math.PI * 2); c.fill();
                const spin = nowMs / 140;
                c.fillStyle = '#2a1830';
                [-16, 16].forEach(ex => { c.beginPath(); c.arc(ex + Math.cos(spin) * 5, -h + 54 + Math.sin(spin) * 5, 3.2, 0, Math.PI * 2); c.fill(); });
            }
        }
        c.restore();
    }
    function drawDevilsFingersCombat() {
        if (!dfDom) return;
        const c = dfDom.ctx, canvas = dfDom.canvas;
        const nowMs = dfNowMs;
        c.clearRect(0, 0, canvas.width, canvas.height);
        if (fightId === 'cfg') {
            drawChaosFairyScene(c, canvas, nowMs);
            drawDfOlly(c, nowMs);
            drawChaosFairyLighting(c, canvas, nowMs);
        } else {
            const g = c.createLinearGradient(0, 0, 0, canvas.height);
            g.addColorStop(0, '#241331'); g.addColorStop(1, '#0d0714');
            c.fillStyle = g; c.fillRect(0, 0, canvas.width, canvas.height);
            c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, DF_ARENA_FLOOR_Y + 10, canvas.width, canvas.height - DF_ARENA_FLOOR_Y - 10);

            const { clip, idx } = dfCurrentFrame();
            const pack = dfAtlas[clip];
            // df_grab is a full-scene baked shot (both characters already in the footage -
            // see build_devilsfingers_assets.py's own note on this clip), not composited
            // against the arena floor like her other 5 clips - so it draws screen-centered,
            // at its own scale, and Olly's normal sprite is skipped while it's playing.
            const isGrabClip = clip === 'df_grab';
            const drawn = pack && drawDFAtlasFrame(c, pack, idx, isGrabClip ? canvas.width / 2 : dfArenaX, isGrabClip ? canvas.height / 2 : DF_ARENA_FLOOR_Y, isGrabClip ? 'left' : dfFacing, 1, 1);
            if (!drawn) {   // assets still loading - a simple placeholder silhouette so the fight isn't blank
                c.fillStyle = 'rgba(120,60,150,.55)';
                c.beginPath(); c.ellipse(dfArenaX, DF_ARENA_FLOOR_Y - 90, 90, 160, 0, 0, Math.PI * 2); c.fill();
            }
            if (!isGrabClip) drawDfOlly(c, nowMs);
        }

        dfDom.ollyHpText.textContent = `${ollyCombatHP} / ${OLLY_COMBAT_MAX_HP}`;
        dfDom.ollyHpBar.style.width = `${(ollyCombatHP / OLLY_COMBAT_MAX_HP) * 100}%`;
        dfDom.enemyHpText.textContent = `${dfHP} / ${foeMaxHP}`;
        dfDom.enemyHpBar.style.width = `${(dfHP / foeMaxHP) * 100}%`;
        const acidOn = nowMs < acidEffectUntil;
        dfDom.acidFx.style.opacity = acidOn ? String(0.35 + 0.2 * Math.sin(nowMs / 90)) : '0';
        if (acidOn) dfDom.acidFx.style.transform = `rotate(${nowMs / 12}deg) scale(1.6)`;
    }

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
        if (mode === 'mushroom' || mode === 'combat') return;
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && near(TOM_JOURNAL.x, TOM_JOURNAL.y, 70)) { startTomMeeting(); return; }
        if (near(MINI_GAME_SPOT.x, MINI_GAME_SPOT.y, 70)) { enterMushroomGame(); return; }
        if (near(DF_SPOT.x, DF_SPOT.y, 80)) { enterDevilsFingersCombat(); return; }
        if (near(PRINCESS_Q_SPOT.x, PRINCESS_Q_SPOT.y, 70)) { enterChaosFairyCombat(); return; }   // PREVIEW entry for the CFG fight
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

        // Background: the fairy ring cropped from the real Level 2 map art (Scarlett's
        // idea), drawn "cover"-style so it fills the screen at any window size without
        // distorting. Falls back to a flat fill if the image hasn't loaded yet.
        if (shellGameBackground.complete && shellGameBackground.naturalWidth) {
            const iw = shellGameBackground.naturalWidth, ih = shellGameBackground.naturalHeight;
            const scale = Math.max(vw / iw, vh / ih);
            const dw = iw * scale, dh = ih * scale;
            ctx.drawImage(shellGameBackground, vw / 2 - dw / 2, vh / 2 - dh / 2, dw, dh);
            ctx.fillStyle = 'rgba(10,14,10,.32)';
            ctx.fillRect(0, 0, vw, vh);
        } else {
            ctx.fillStyle = '#17241c';
            ctx.fillRect(0, 0, vw, vh);
        }

        const { exitRect } = shellLayout();

        // exit button
        ctx.fillStyle = 'rgba(255,255,255,.14)';
        roundRect(exitRect.x, exitRect.y, exitRect.w, exitRect.h, 8); ctx.fill();
        ctx.fillStyle = '#e4f0df'; ctx.font = '600 13px Georgia'; ctx.textAlign = 'center';
        ctx.fillText('‹ Back to the Hollow', exitRect.x + exitRect.w / 2, exitRect.y + exitRect.h / 2 + 4);

        ctx.textAlign = 'left';
        ctx.fillStyle = '#e4f0df';
        ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 8;
        ctx.font = '700 20px Georgia';
        ctx.fillText('FIND SCARLETT', 24, 70);
        ctx.shadowBlur = 0;

        if (fsPhase === 'gameEnd') {
            ctx.textAlign = 'center';
            ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 10;
            ctx.fillStyle = '#e4f0df'; ctx.font = '700 28px Georgia';
            ctx.fillText('That\'s the lot!', vw / 2, vh * .4);
            ctx.font = '600 17px Georgia';
            ctx.fillText(`You found her ${fsScore} / ${SHELL_ROUNDS.length} times.`, vw / 2, vh * .4 + 36);
            ctx.font = '600 13px Georgia'; ctx.fillStyle = '#d8e8d0';
            ctx.fillText('Click anywhere to go again, or Back to the Hollow to leave.', vw / 2, vh * .4 + 64);
            ctx.shadowBlur = 0;
            ctx.restore();
            return;
        }

        const r = currentRound();
        ctx.shadowColor = 'rgba(0,0,0,.7)'; ctx.shadowBlur = 6;
        ctx.font = '600 13px Georgia'; ctx.fillStyle = '#d8e8d0';
        ctx.fillText(`Round ${fsRoundIdx + 1}/${SHELL_ROUNDS.length} • ${r.count} mushrooms • Score ${fsScore}/${SHELL_ROUNDS.length}`, 24, 92);

        ctx.textAlign = 'center';
        ctx.fillStyle = '#eef9e8'; ctx.font = '700 15px Georgia';
        const prompt = fsPhase === 'reveal' ? "Watch closely - Olly's turning her into one of these..."
            : fsPhase === 'shuffle' ? "He's mixing them up..."
                : fsPhase === 'guess' ? 'Which mushroom is she under now? Click one.'
                    : fsResolveOk ? 'Found her!' : "That wasn't her...";
        ctx.fillText(prompt, vw / 2, 130);
        ctx.shadowBlur = 0;

        // The fairy ring's own stone circle (already baked into the background art) is
        // the "floor" the mushrooms sit on now - no separate drawn floor band needed.
        const floorY = vh * .66;

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
        const floorY = vh * .66;   // must match drawMushroomGame()'s floorY
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

    // No map icon exists yet for Devil's Fingers - a procedural glowing crack in the
    // ground (placeholder) stands in until Scarlett has real marker art for this spot.
    function drawDfMarker(px, py, t) {
        ctx.save();
        const pulse = 0.8 + 0.2 * Math.sin(t * 3);
        ctx.translate(px, py);
        const glow = ctx.createRadialGradient(0, 0, 4, 0, 0, 46 * pulse);
        glow.addColorStop(0, 'rgba(150,90,200,.75)'); glow.addColorStop(1, 'rgba(90,30,140,0)');
        ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(0, 0, 46 * pulse, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(210,170,255,.9)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
        for (let i = 0; i < 5; i++) {
            const a = (i / 5) * Math.PI * 2 + t * 0.4;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 10 - 4);
            ctx.stroke();
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
        ctx.beginPath(); ctx.ellipse(0, 38 * OLLY_MAP_SCALE, 23 * OLLY_MAP_SCALE, 6 * OLLY_MAP_SCALE, 0, 0, Math.PI * 2); ctx.fill();
        let img = ollySprite.front;
        if (mapDir === 'up') img = ollySprite.back;
        else if (mapDir === 'left') img = ollySprite.left;
        else if (mapDir === 'right') img = ollySprite.right;
        if (img.complete && img.naturalWidth) {
            const s = OLLY_MAP_SCALE, h = 144 * s, w = h * (img.naturalWidth / img.naturalHeight);
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

    // Ambient fog wisps for the Mystical Forest - soft drifting green/blue glows, purely
    // atmospheric (no gameplay effect), drawn in world space so they drift past specific
    // bits of scenery rather than feeling pasted on top of the screen.
    const FOG_COUNT = 22;
    let fogWisps = null;
    function initFog() {
        fogWisps = Array.from({ length: FOG_COUNT }, () => ({
            x: Math.random() * WORLD_W,
            y: Math.random() * WORLD_H,
            vx: (Math.random() * 2 - 1) * 11,
            vy: (Math.random() * 2 - 1) * 6,
            r: 110 + Math.random() * 170,
            green: Math.random() < 0.5,
            alpha: 0.28 + Math.random() * 0.2,
            phase: Math.random() * Math.PI * 2
        }));
    }
    function updateFog(dt) {
        if (!fogWisps) initFog();
        const pad = 160;
        fogWisps.forEach(w => {
            w.x += w.vx * dt; w.y += w.vy * dt;
            if (w.x < -pad) w.x = WORLD_W + pad; else if (w.x > WORLD_W + pad) w.x = -pad;
            if (w.y < -pad) w.y = WORLD_H + pad; else if (w.y > WORLD_H + pad) w.y = -pad;
        });
    }
    function drawFog(t) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        fogWisps.forEach(w => {
            const pulse = 0.85 + 0.15 * Math.sin(t * 0.5 + w.phase);
            const rgb = w.green ? '140,220,160' : '120,190,240';
            const r = w.r * pulse;
            const grad = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, r);
            grad.addColorStop(0, `rgba(${rgb},${w.alpha * pulse})`);
            grad.addColorStop(1, `rgba(${rgb},0)`);
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.arc(w.x, w.y, r, 0, Math.PI * 2); ctx.fill();
        });
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
        drawDfMarker(DF_SPOT.x, DF_SPOT.y, t);

        const moving = (held.up || held.down || held.left || held.right) && !dialogueQueue;
        // Draw whichever of Olly/Tom is further back first, roughly, so neither always clips over the other.
        drawTom(t);
        drawOlly(t, moving);
        updateFog(dt);
        drawFog(t);
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
        if (mode === 'combat') return;   // combat has its own overlay/canvas now
        if (mode === 'mushroom') { handleMushroomClick(e); return; }
        const p = canvasPointToWorld(e);
        if (dialogueQueue) { advanceDialogue(); return; }
        if (!metTom && Math.hypot(p.x - TOM_JOURNAL.x, p.y - TOM_JOURNAL.y) < 50) { startTomMeeting(); return; }
        if (Math.hypot(p.x - MINI_GAME_SPOT.x, p.y - MINI_GAME_SPOT.y) < 55) { enterMushroomGame(); return; }
        if (Math.hypot(p.x - DF_SPOT.x, p.y - DF_SPOT.y) < 60) { enterDevilsFingersCombat(); return; }
        if (Math.hypot(p.x - PRINCESS_Q_SPOT.x, p.y - PRINCESS_Q_SPOT.y) < 60) { enterChaosFairyCombat(); return; }
    });

    function loop(ts) {
        const t = ts / 1000;
        const dt = lastT ? Math.min(.05, t - lastT) : 1 / 60;
        lastT = t;
        dfNowMs = ts;
        if (mode === 'mushroom') {
            updateMushroom(dt);
            drawMushroomGame();
        } else if (mode === 'combat') {
            updateDevilsFingers(dt);
            drawDevilsFingersCombat();
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
        combatAttack: combatAttackDF, combatHeavyAttack: combatHeavyAttackDF, combatDodge: combatDodgeDF, shootAtPointer: () => {},
        retryCombat: () => {}, backToMap: () => {}, continueCompletion: () => {}, completeRelationship: () => {},
        answerPuzzle: () => {}, startBoss: () => {},
        saveAndQuit: () => {}, saveGame: () => false, loadGame: () => false
    };
}
