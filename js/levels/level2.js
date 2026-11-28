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

// --- Find the Princess minigame data -------------------------------------------------
// "Find the Lady" with mushrooms (V9.94, Scarlett's rules; restructured V10.20): Princess
// Scarlett hides under a mushroom, the mushrooms swap places faster and faster, and you
// click the one she's under. Four stages of three rounds each: toadstool only, then tall
// only, then big only (3 mushrooms apiece, so you learn to track one look-alike type at a
// time), then a final stage mixing all three (5 mushrooms). Names are the ones Scarlett
// and Olly use in real life: MUSHROOM = the red spotted toadstool (only ever ONE in the
// mixed stage - it's the special one), TALL MUSHROOM = the shaggy inkcap, BIG MUSHROOM =
// the oyster cluster. See SHELL_ROUNDS below for the exact per-round line-up.
// Art: assets/minigames/find-the-princess/ (Scarlett's own drawings, transparent PNGs
// converted to webp). `k` = drawn height relative to the round's base mushroom size.
const FP_DIR = 'assets/minigames/find-the-princess/';
const MUSHROOM_TYPES = [
    { id: 'small', label: 'MUSHROOM', src: FP_DIR + 'mushroom-toadstool.webp', k: .9 },
    { id: 'tall', label: 'TALL MUSHROOM', src: FP_DIR + 'tall-mushroom-inkcap.webp', k: 1.12 },
    { id: 'huge', label: 'BIG MUSHROOM', src: FP_DIR + 'big-mushroom-oyster.webp', k: 1 }
];
MUSHROOM_TYPES.forEach(m => { m.img = new Image(); m.img.src = m.src; });
const fpPrincessImg = new Image(); fpPrincessImg.src = FP_DIR + 'princess-scarlett.webp';
const fpFoundImg = new Image(); fpFoundImg.src = FP_DIR + 'princess-found-peek.webp';
// V10.20, Scarlett's redesign: it felt like a pure gamble because you never actually
// SAW which mushroom she'd swapped into (see the switch-reveal animation in
// updateMushroom/drawMushroomGame below) - that's the real fix. This structure change is
// the other half: four stages of three rounds apiece, so you learn to track one mushroom
// type at a time before the final stage asks you to track all three at once.
//   Stage 1 (rounds 1-3): toadstool only, 3 mushrooms.
//   Stage 2 (rounds 4-6): tall mushroom only, 3 mushrooms.
//   Stage 3 (rounds 7-9): big mushroom only, 3 mushrooms.
//   Stage 4 (rounds 10-12): all three types mixed, 5 mushrooms (toadstool + 2 tall + 2 big,
//   same "only one toadstool" rule as before).
// `types` is this round's exact mushroom line-up (shuffled into slots at round start).
// swaps/swapTime still ramp smoothly across all 12 rounds (same start/end pace as the old
// 6-round version, just spread further out).
const SHELL_ROUNDS = [
    { count: 3, types: ['small', 'small', 'small'], swaps: 5, swapTime: .62 },
    { count: 3, types: ['small', 'small', 'small'], swaps: 6, swapTime: .59 },
    { count: 3, types: ['small', 'small', 'small'], swaps: 7, swapTime: .56 },
    { count: 3, types: ['tall', 'tall', 'tall'], swaps: 7, swapTime: .54 },
    { count: 3, types: ['tall', 'tall', 'tall'], swaps: 8, swapTime: .51 },
    { count: 3, types: ['tall', 'tall', 'tall'], swaps: 9, swapTime: .48 },
    { count: 3, types: ['huge', 'huge', 'huge'], swaps: 10, swapTime: .45 },
    { count: 3, types: ['huge', 'huge', 'huge'], swaps: 11, swapTime: .42 },
    { count: 3, types: ['huge', 'huge', 'huge'], swaps: 12, swapTime: .39 },
    { count: 5, types: ['small', 'tall', 'huge', 'tall', 'huge'], swaps: 12, swapTime: .37 },
    { count: 5, types: ['small', 'tall', 'huge', 'tall', 'huge'], swaps: 13, swapTime: .34 },
    { count: 5, types: ['small', 'tall', 'huge', 'tall', 'huge'], swaps: 14, swapTime: .31 }
];
const FP_PASS_FRACTION = .6;   // Scarlett: "you have to get 60% to pass for now" -> 4 of 6
const FP_PASS_SCORE = Math.ceil(SHELL_ROUNDS.length * FP_PASS_FRACTION);
const REVEAL_SECONDS = 1.8;   // she's shown, then ducks under her mushroom, then the shuffle starts
// V10.4: one-time "meet the mushrooms" intro - each type shown big & centered with its name,
// then slides into its round-1 slot, before the first round ever begins.
const FP_INTRO_HOLD_S = 1.1;
const FP_INTRO_MOVE_S = .55;
const FP_INTRO_STEP_S = FP_INTRO_HOLD_S + FP_INTRO_MOVE_S;
const FP_END_ANIM_S = 1.6;    // end screen: other mushrooms fade, she pops out of hers

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

export function createLevel2(ui, hostOpts = null) {
    // V9.94: hostOpts = { hosted: true, isGod } when the real Level 2 (the shared Level 1
    // engine, level1.js with level 2 settings) borrows this module for the parts it
    // doesn't have itself yet: Find the Princess, the Devil's Fingers fight and the Chaos
    // Fairy Goth fight. In that mode this module never draws its own map - it only runs
    // while one of those is open, then hands the result back through a callback.
    const hosted = !!hostOpts?.hosted;
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
    const DF_MAX_HP = 200;
    let OLLY_COMBAT_MAX_HP = 100;   // V9.94: when hosted, Olly's real max HP
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
    let fsPhase = 'reveal';   // 'intro' | 'reveal' | 'shuffle' | 'guess' | 'resolve' | 'gameEnd'
    let fsPhaseT = 0;
    let fsIntroShown = false;   // V10.4: the "meet the mushrooms" intro only ever plays once per session
    let fsIntroIdx = 0;
    let fsScore = 0;
    let fsMushrooms = [];      // this round's { id, type, slot } entries
    let fsScarlettId = null;   // which mushroom id she's actually under
    let fsSwapQueue = [];      // [[slotA, slotB], ...] for the current round's shuffle
    let fsSwapIdx = 0;
    let fsActiveSwitchPlan = null;   // V10.20: decided the moment a swap BEGINS (not after), so its
    // visible reveal animation can play out across the whole hop - see planSwitchFor() below.
    let fsGuessedId = null;
    let fsResolveOk = false;
    let fsLastScarlettSlot = 0;   // where she was in the last round (the end screen pops her out of it)
    let hostFp = null;            // hosted: { overlay, onDone } for Find the Princess
    let hostFight = null;         // hosted: { onDone } for Devil's Fingers / Chaos Fairy Goth
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
        const dfc = ov.querySelector('#df-combat-canvas');
        dfc.addEventListener('mousedown', e => { if (e.button === 2) { e.preventDefault(); combatDodgeDF(); } });
        dfc.addEventListener('contextmenu', e => e.preventDefault());
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
        if (hostFight) ollyCombatHP = Math.max(1, Math.min(OLLY_COMBAT_MAX_HP, hostFight.hp));
        dfState = 'idle'; dfStateStart = dfNowMs; dfNextAttackAt = dfNowMs + 1400; dfHitApplied = false;
        dfArenaX = DF_ARENA_W * 0.74; ollyArenaX = DF_ARENA_W * 0.26; dfFacing = 'left';
        attackComboCount = 0; attackCooldownUntil = 0; heavyCooldownUntil = 0;
        playerInvulnUntil = 0; dodgeCooldownUntil = 0; acidEffectUntil = 0;
        dfDom = hosted ? buildDfDom("DEVIL'S FINGERS") : buildDfDom();
        dfSetStatus("A monstrous tangle of fingers blocks the way.");
        playSfx('click', 1);
    }
    function enterChaosFairyCombat() {
        if (mode === 'combat') return;
        loadChaosFairyAssets();
        mode = 'combat';
        fightId = 'cfg'; foeMaxHP = CFG_MAX_HP;
        dfHP = CFG_MAX_HP; ollyCombatHP = OLLY_COMBAT_MAX_HP;
        if (hostFight) ollyCombatHP = Math.max(1, Math.min(OLLY_COMBAT_MAX_HP, hostFight.hp));
        dfState = 'idle'; dfStateStart = dfNowMs; dfNextAttackAt = dfNowMs + 1800; dfHitApplied = false;
        dfArenaX = DF_ARENA_W * 0.74; ollyArenaX = DF_ARENA_W * 0.26; dfFacing = 'left';
        attackComboCount = 0; attackCooldownUntil = 0; heavyCooldownUntil = 0;
        playerInvulnUntil = 0; dodgeCooldownUntil = 0; acidEffectUntil = 0;
        cfgArrows = []; cfgStorm = null; cfgDust = []; cfgBlinkReadyAt = dfNowMs + 4000; cfgLastAttack = null; cfgFlashUntil = 0;
        dfDom = buildDfDom(hosted ? 'SOPHIA, THE CHAOS FAIRY GOTH' : 'CHAOS FAIRY GOTH (PREVIEW)', hosted ? 'SOPHIA' : 'CHAOS FAIRY GOTH', '#e86fb0', 'Something small and furious flutters between the ruins.', CFG_MAX_HP);
        dfDom.canvas.style.background = '#0c1a10';
        dfSetStatus('Something small and furious flutters between the ruins.');
        playSfx('click', 1);
    }
    function exitDevilsFingersCombat(won) {
        if (mode !== 'combat') return;
        mode = 'map';
        if (dfDom) { dfDom.ov.remove(); dfDom = null; }
        if (hostFight) {   // V9.94: hand the result back to the real Level 2
            const cb = hostFight.onDone; hostFight = null;
            stopHostLoop();
            held.left = held.right = held.up = held.down = false;
            if (cb) cb({ won, hp: ollyCombatHP });
            return;
        }
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
        if (hostOpts?.isGod?.()) return;   // cheat: no damage
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
    // V10.20: decides, for one upcoming swap, whether she switches to the other mushroom
    // involved - same 50% rule as before, just decided up front so drawMushroomGame can
    // show it happening (a visible peek-and-dash) across that swap's whole hop animation,
    // instead of it just silently taking effect once the hop was already over.
    function planSwitchFor(a, b) {
        const ma = mushroomAtSlot(a), mb = mushroomAtSlot(b);
        if (!ma || !mb) return null;
        if (ma.id === fsScarlettId && Math.random() < 0.5) return { fromId: ma.id, toId: mb.id, fromSlot: a, toSlot: b };
        if (mb.id === fsScarlettId && Math.random() < 0.5) return { fromId: mb.id, toId: ma.id, fromSlot: b, toSlot: a };
        return null;
    }

    // V10.20: each round now names its own exact mushroom line-up (see SHELL_ROUNDS) rather
    // than deriving it from the count alone - shuffled into slots so the same-type stages
    // (1-3) aren't suspiciously predictable about which slot she started under, and so the
    // mixed stage (4) randomizes where the lone toadstool and the two pairs land.
    function buildTypesForRound(r) {
        const types = [...r.types];
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
        fsLastScarlettSlot = 0;
        if (hostFp) hostFp.overlay.style.display = 'block';
        // V10.4: first time ever entering this minigame in the session, show the one-time
        // "meet the mushrooms" intro before the first round starts. Never repeats after that.
        if (!fsIntroShown) {
            fsIntroShown = true;
            fsIntroIdx = 0;
            fsPhase = 'intro';
            fsPhaseT = 0;
        } else {
            startShellRound();
        }
    }
    function exitMushroomGame(finished = false) {
        mode = 'map';
        if (hostFp) {
            hostFp.overlay.style.display = 'none';
            const cb = hostFp.onDone; hostFp.onDone = null;
            stopHostLoop();
            if (cb) cb({ finished, passed: finished && fsScore >= FP_PASS_SCORE, score: fsScore, total: SHELL_ROUNDS.length });
            return;
        }
        ui.dialogue.textContent = `${MINI_GAME_SPOT.name} is quiet again. Last go: ${fsScore}/${SHELL_ROUNDS.length} found.`;
    }
    function startShellRound() {
        const r = currentRound();
        const types = buildTypesForRound(r);
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
        const sm = fsMushrooms.find(m => m.id === fsScarlettId);
        if (sm) fsLastScarlettSlot = sm.slot;
        if (ok) { fsScore++; playSfx('round-ok'); } else playSfx('wrong-buzz');
    }
    function advanceShellRound() {
        fsRoundIdx++;
        if (fsRoundIdx >= SHELL_ROUNDS.length) {
            fsRoundIdx = SHELL_ROUNDS.length - 1;   // keep the last round's layout for the end animation
            fsPhase = 'gameEnd';
            fsPhaseT = 0;
            playSfx(fsScore >= FP_PASS_SCORE ? 'minigame-win' : 'wrong-buzz');
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
        fsPhaseT += dt;
        mistScroll += dt * 60;
        if (fsPhase === 'gameEnd') return;
        if (fsPhase === 'intro') {
            if (fsPhaseT >= FP_INTRO_STEP_S) {
                fsIntroIdx++;
                fsPhaseT = 0;
                if (fsIntroIdx >= MUSHROOM_TYPES.length) startShellRound();
            }
            return;
        }
        const r = currentRound();
        if (fsPhase === 'reveal' && fsPhaseT >= REVEAL_SECONDS) {
            fsPhase = 'shuffle'; fsPhaseT = 0;
            fsActiveSwitchPlan = fsSwapQueue.length ? planSwitchFor(...fsSwapQueue[0]) : null;
        } else if (fsPhase === 'shuffle') {
            if (fsSwapIdx >= fsSwapQueue.length) { fsPhase = 'guess'; fsPhaseT = 0; }
            else if (fsPhaseT >= r.swapTime) {
                const [a, b] = fsSwapQueue[fsSwapIdx];
                const ma = mushroomAtSlot(a), mb = mushroomAtSlot(b);
                if (ma) ma.slot = b;
                if (mb) mb.slot = a;
                // V10.4: when a swap touches her current mushroom, she has a chance to actually
                // switch to the other one involved - so memorizing her starting type isn't enough.
                // V10.20: the roll itself now happens in planSwitchFor, at the moment this swap
                // BEGAN (see above / below) - here we just apply whatever was already decided,
                // so it matches what drawMushroomGame has been visibly showing this whole hop.
                if (fsActiveSwitchPlan) fsScarlettId = fsActiveSwitchPlan.toId;
                fsSwapIdx++;
                fsPhaseT = 0;
                fsActiveSwitchPlan = (fsSwapIdx < fsSwapQueue.length) ? planSwitchFor(...fsSwapQueue[fsSwapIdx]) : null;
            }
        } else if (fsPhase === 'resolve' && fsPhaseT >= 1.6) advanceShellRound();
    }

    // Evenly-spaced screen slot for a given logical slot index among `count` mushrooms.
    function slotX(slot, count, vw) {
        const spacing = Math.min(340, (vw - 220) / Math.max(1, count - 1));
        const totalW = spacing * (count - 1);
        return vw / 2 - totalW / 2 + slot * spacing;
    }
    // Base drawn height of a mushroom this round: fits the screen height, and narrow enough
    // that 5 oyster clusters (the widest art) don't overlap their neighbours.
    function fpBaseSize(count, vw, vh) {
        const spacing = Math.min(340, (vw - 220) / Math.max(1, count - 1));
        return Math.min(vh * .34, spacing * .74);
    }
    function fpMushroomSize(type, count, vw, vh) {
        const t = typeFor(type), img = t.img;
        const h = fpBaseSize(count, vw, vh) * t.k;
        const ar = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 1;
        return { w: h * ar, h };
    }
    function shellLayout() {
        const exitRect = { x: 20, y: 14, w: 190, h: 34 };
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
    function drawImgBottom(img, cx, floorY, w, h, alpha = 1) {
        if (!img.complete || !img.naturalWidth) return;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.drawImage(img, cx - w / 2, floorY - h, w, h);
        ctx.restore();
    }
    function drawPrincess(cx, floorY, h, alpha, scale = 1) {
        const img = fpPrincessImg;
        if (!img.complete || !img.naturalWidth) return;
        const dh = h * scale, dw = dh * img.naturalWidth / img.naturalHeight;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.shadowColor = 'rgba(255,150,200,.75)'; ctx.shadowBlur = 22;
        ctx.drawImage(img, cx - dw / 2, floorY - dh, dw, dh);
        ctx.restore();
    }
    function drawSparkles(cx, cy, r, t, alpha) {
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
        ctx.fillStyle = '#ffd6ec';
        for (let i = 0; i < 9; i++) {
            const a = i / 9 * Math.PI * 2 + t * 2;
            const rr = r * (.55 + .45 * Math.sin(t * 5 + i));
            ctx.beginPath(); ctx.arc(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .6, 2.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
        }
        ctx.restore();
    }
    function fpText(text, x, y, font, color = '#fbeef6') {
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = font;
        ctx.shadowColor = 'rgba(0,0,0,.85)'; ctx.shadowBlur = 10;
        ctx.fillStyle = color;
        ctx.fillText(text, x, y);
        ctx.restore();
    }

    function drawMushroomGame() {
        const vw = ui.canvas.clientWidth || 1000;
        // Lay out against the WRAPPER's height (see the V9.84 note in git history: the
        // canvas box can be taller than what's actually visible).
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
        ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';

        // Background: the fairy ring cropped from the Level 2 map art.
        if (shellGameBackground.complete && shellGameBackground.naturalWidth) {
            const iw = shellGameBackground.naturalWidth, ih = shellGameBackground.naturalHeight;
            const scale = Math.max(vw / iw, vh / ih);
            const dw = iw * scale, dh = ih * scale;
            ctx.drawImage(shellGameBackground, vw / 2 - dw / 2, vh / 2 - dh / 2, dw, dh);
            ctx.fillStyle = 'rgba(10,8,14,.42)';
            ctx.fillRect(0, 0, vw, vh);
        } else {
            ctx.fillStyle = '#17121c';
            ctx.fillRect(0, 0, vw, vh);
        }

        const { exitRect } = shellLayout();
        ctx.fillStyle = 'rgba(20,10,24,.6)';
        roundRect(exitRect.x, exitRect.y, exitRect.w, exitRect.h, 8); ctx.fill();
        ctx.strokeStyle = 'rgba(239,183,201,.55)'; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = '#f6e6ee'; ctx.font = '600 14px "Cormorant Garamond", Georgia, serif'; ctx.textAlign = 'center';
        ctx.fillText('‹ Back to the forest', exitRect.x + exitRect.w / 2, exitRect.y + exitRect.h / 2 + 5);

        fpText('FIND THE PRINCESS', vw / 2, 52, '700 30px "Cormorant Garamond", Georgia, serif', '#f3c6d6');

        const r = currentRound();
        const floorY = vh * .8;
        const t = performance.now() / 1000;

        if (fsPhase === 'gameEnd') { drawFpEnd(vw, vh, floorY, r, t); ctx.restore(); return; }
        if (fsPhase === 'intro') { drawFpIntro(vw, vh, floorY); ctx.restore(); return; }

        fpText(`Round ${fsRoundIdx + 1} of ${SHELL_ROUNDS.length}   ·   Found her ${fsScore} time${fsScore === 1 ? '' : 's'}`, vw / 2, 80, '600 16px "Cormorant Garamond", Georgia, serif', '#e9d6e2');
        const prompt = fsPhase === 'reveal' ? "Watch the princess... she's hiding under one of these."
            : fsPhase === 'shuffle' ? 'Keep your eyes on her mushroom...'
                : fsPhase === 'guess' ? 'Which mushroom is she under? Click it.'
                    : fsResolveOk ? 'You found her!' : "That wasn't her...";
        fpText(prompt, vw / 2, 112, '700 20px "Cormorant Garamond", Georgia, serif');

        const activeSwap = (fsPhase === 'shuffle' && fsSwapIdx < fsSwapQueue.length) ? fsSwapQueue[fsSwapIdx] : null;
        const swapT = activeSwap ? Math.min(1, fsPhaseT / r.swapTime) : 0;
        const ease = swapT < .5 ? 2 * swapT * swapT : 1 - Math.pow(-2 * swapT + 2, 2) / 2;
        const base = fpBaseSize(r.count, vw, vh);

        // Work out where each mushroom is this frame. The two swapping mushrooms travel on
        // opposite arcs (one hops up and over, one dips under) so you can follow them.
        // V10.20: when this swap is also the one where she switches mushrooms (see
        // fsActiveSwitchPlan), the mushroom she's LEAVING is always the one that lifts
        // (regardless of which of the two it happens to be in the swap tuple) - that's the
        // "you have to actually see the mushroom lift" fix, and it lifts further + faster
        // than a plain decoy swap so it reads as a deliberate, bigger reveal.
        const switchSwap = activeSwap && fsActiveSwitchPlan;
        const placed = fsMushrooms.map(m => {
            let cx = slotX(m.slot, r.count, vw), dy = 0, front = 0;
            if (activeSwap) {
                const [a, b] = activeSwap;
                if (m.slot === a || m.slot === b) {
                    const from = slotX(m.slot, r.count, vw), to = slotX(m.slot === a ? b : a, r.count, vw);
                    cx = from + (to - from) * ease;
                    const up = switchSwap ? m.slot === fsActiveSwitchPlan.fromSlot : m.slot === a;
                    const liftMul = switchSwap ? (up ? -.5 : .1) : (up ? -.28 : .1);
                    dy = Math.sin(Math.PI * swapT) * base * liftMul;
                    front = up ? 1 : 2;
                }
            }
            return { m, cx, dy, front, size: fpMushroomSize(m.type, r.count, vw, vh) };
        }).sort((p, q) => p.front - q.front);

        const scarlett = placed.find(p => p.m.id === fsScarlettId);
        const princessH = base * 1.25;

        // Reveal: she stands in front of her mushroom, then shrinks down and ducks under it.
        if (fsPhase === 'reveal' && scarlett) {
            const p = fsPhaseT / REVEAL_SECONDS;
            const hide = Math.max(0, Math.min(1, (p - .55) / .35));
            drawPrincess(scarlett.cx, floorY, princessH, 1 - hide, 1 - hide * .65);
        }
        // V10.20: the actual "you can see her change mushrooms" moment. Plays across the
        // WHOLE hop (not a separate instant), peaking right as the two mushrooms cross -
        // she pops up from the one she's leaving, dashes to the one she's headed for, and
        // ducks back down, perfectly in sync with that mushroom's own lift/dip.
        if (switchSwap) {
            const fromX = slotX(fsActiveSwitchPlan.fromSlot, r.count, vw);
            const toX = slotX(fsActiveSwitchPlan.toSlot, r.count, vw);
            const dashX = fromX + (toX - fromX) * ease;
            const hump = Math.sin(Math.PI * swapT);   // 0 at the ends, 1 at swapT=.5
            drawPrincess(dashX, floorY, princessH * .8, Math.max(0, hump), .55 + .45 * hump);
        }
        placed.forEach(p => {
            let lift = 0, alpha = 1;
            if (fsPhase === 'resolve' && (p.m.id === fsGuessedId || p.m.id === fsScarlettId)) {
                const k = Math.min(1, fsPhaseT / .35);
                lift = -p.size.h * .45 * k;
                alpha = 1 - .45 * k;
            }
            ctx.save();
            ctx.fillStyle = 'rgba(0,0,0,.35)';
            ctx.beginPath(); ctx.ellipse(p.cx, floorY - 4, p.size.w * .36, p.size.h * .05, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
            drawImgBottom(p.m.img || typeFor(p.m.type).img, p.cx, floorY + p.dy + lift, p.size.w, p.size.h, alpha);
            if (fsPhase === 'resolve') {
                const ring = p.m.id === fsScarlettId ? '#9be3a8' : p.m.id === fsGuessedId ? '#e66478' : null;
                if (ring) {
                    ctx.save(); ctx.strokeStyle = ring; ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.ellipse(p.cx, floorY, p.size.w * .42, p.size.h * .07, 0, 0, Math.PI * 2); ctx.stroke();
                    ctx.restore();
                }
            }
            if (fsPhase === 'guess') {
                ctx.save(); ctx.strokeStyle = `rgba(239,183,201,${.35 + .25 * Math.sin(t * 4)})`; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.ellipse(p.cx, floorY, p.size.w * .4, p.size.h * .06, 0, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }
        });
        // Resolve: the lifted mushroom shows where she really was.
        if (fsPhase === 'resolve' && scarlett) {
            const k = Math.min(1, fsPhaseT / .35);
            drawPrincess(scarlett.cx, floorY, princessH * .7, k);
            if (fsResolveOk) drawSparkles(scarlett.cx, floorY - princessH * .45, base * .5, t, k);
        }
        ctx.restore();
    }

    // End of the game: the other mushrooms fade away and she pops out of the one she was
    // last hiding under (Scarlett's "found her" picture), then the score.
    // V10.4: one-time "meet the mushrooms" intro - each type pops up big & centered with its
    // name label, then slides into the spot it'll start round 1 in, before play begins.
    function drawFpIntro(vw, vh, floorY) {
        fpText('Meet the mushrooms...', vw / 2, 92, '700 20px "Cormorant Garamond", Georgia, serif');
        const idx = Math.min(fsIntroIdx, MUSHROOM_TYPES.length - 1);
        const type = MUSHROOM_TYPES[idx];
        const popIn = Math.min(1, fsPhaseT / .25);
        const moveP = Math.max(0, Math.min(1, (fsPhaseT - FP_INTRO_HOLD_S) / FP_INTRO_MOVE_S));
        const ease = moveP < .5 ? 2 * moveP * moveP : 1 - Math.pow(-2 * moveP + 2, 2) / 2;
        const centerX = vw / 2;
        const targetX = slotX(idx, 3, vw);
        const cx = centerX + (targetX - centerX) * ease;
        const base = fpMushroomSize(type.id, 3, vw, vh);
        const scale = (.82 + .18 * popIn) * (1 - ease * .35);   // settles smaller into its slot, like the real layout
        const h = base.h * scale, w = base.w * scale;
        const labelAlpha = Math.max(0, 1 - moveP) * popIn;
        fpText(type.label, cx, floorY - h - 22, '700 22px "Cormorant Garamond", Georgia, serif', `rgba(255,233,245,${labelAlpha.toFixed(2)})`);
        drawImgBottom(type.img, cx, floorY, w, h, popIn);
    }
    function drawFpEnd(vw, vh, floorY, r, t) {
        const p = Math.min(1, fsPhaseT / FP_END_ANIM_S);
        const fadeOthers = Math.min(1, p / .45);
        const pop = Math.max(0, Math.min(1, (p - .35) / .65));
        const popE = 1 - Math.pow(1 - pop, 3);
        fsMushrooms.forEach(m => {
            if (m.slot === fsLastScarlettSlot) return;
            const s = fpMushroomSize(m.type, r.count, vw, vh);
            drawImgBottom(typeFor(m.type).img, slotX(m.slot, r.count, vw), floorY, s.w, s.h, 1 - fadeOthers);
        });
        const hers = fsMushrooms.find(m => m.slot === fsLastScarlettSlot);
        const fromX = slotX(fsLastScarlettSlot, r.count, vw);
        if (hers && pop < 1) {
            const s = fpMushroomSize(hers.type, r.count, vw, vh);
            drawImgBottom(typeFor(hers.type).img, fromX, floorY, s.w, s.h, 1 - popE);
        }
        const img = fpFoundImg;
        if (img.complete && img.naturalWidth) {
            const endH = vh * .55, startH = fpBaseSize(r.count, vw, vh);
            const h = startH + (endH - startH) * popE;
            const w = h * img.naturalWidth / img.naturalHeight;
            const cx = fromX + (vw / 2 - fromX) * popE;
            const bottom = floorY + (vh * .74 - floorY) * popE;
            const bounce = pop >= 1 ? Math.sin(t * 2.2) * 4 : 0;
            ctx.save();
            ctx.globalAlpha = popE;
            ctx.shadowColor = 'rgba(255,150,200,.6)'; ctx.shadowBlur = 30;
            ctx.drawImage(img, cx - w / 2, bottom - h + bounce, w, h);
            ctx.restore();
            if (pop >= 1) drawSparkles(vw / 2, bottom - h * .55, h * .5, t, .9);
        }
        if (p < 1) return;
        const passed = fsScore >= FP_PASS_SCORE;
        fpText(passed ? 'You found her!' : 'She slipped away...', vw / 2, vh * .8 + 6, '700 30px "Cormorant Garamond", Georgia, serif', passed ? '#f3c6d6' : '#e9d6e2');
        fpText(`You found the princess ${fsScore} out of ${SHELL_ROUNDS.length} times.`, vw / 2, vh * .8 + 38, '600 19px "Cormorant Garamond", Georgia, serif');
        fpText(passed ? 'Click anywhere to carry on.' : `You need ${FP_PASS_SCORE} out of ${SHELL_ROUNDS.length}. Click anywhere to try again.`, vw / 2, vh * .8 + 66, '600 15px "Cormorant Garamond", Georgia, serif', '#d9c4d2');
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
    function handleMushroomClick(e) {
        const p = canvasPointLogical(e);
        const vw = ui.canvas.clientWidth || 1000;
        const wrap = ui.canvas.parentElement;
        const vh = (wrap && wrap.clientHeight) || ui.canvas.clientHeight || 600;
        const { exitRect } = shellLayout();
        if (pointInRect(p, exitRect)) { exitMushroomGame(false); return; }
        if (fsPhase === 'gameEnd') {
            if (fsPhaseT < FP_END_ANIM_S) return;
            if (fsScore >= FP_PASS_SCORE) { exitMushroomGame(true); return; }
            enterMushroomGame();
            return;
        }
        if (fsPhase !== 'guess') return;
        const r = currentRound();
        const floorY = vh * .8;   // must match drawMushroomGame()
        for (const m of fsMushrooms) {
            const cx = slotX(m.slot, r.count, vw), s = fpMushroomSize(m.type, r.count, vw, vh);
            if (Math.abs(p.x - cx) < s.w * .45 && p.y > floorY - s.h && p.y < floorY + 20) { guessSlot(m.slot); return; }
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
        } else if (!hosted) {
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
    function stopHostLoop() { if (hosted) stop(); }
    function startHostLoop() { if (!raf) { lastT = 0; raf = requestAnimationFrame(loop); } }

    // --- V9.94: hosted API used by the real Level 2 (level1.js engine) ---------------
    // Find the Princess shows full screen in its own overlay; onDone({ finished, passed, score, total }).
    function runFindPrincess(onDone) {
        if (!hostFp) {
            const overlay = document.createElement('div');
            overlay.id = 'find-princess-overlay';
            overlay.style.cssText = 'position:fixed;inset:0;z-index:10020;background:#0a0710;display:none;';
            const wrap = document.createElement('div');
            wrap.style.cssText = 'position:absolute;inset:0;overflow:hidden;';
            overlay.appendChild(wrap);
            document.body.appendChild(overlay);
            hostFp = { overlay, wrap, onDone: null };
        }
        // The minigame draws on ui.canvas, so move that canvas into the overlay.
        ui.canvas.style.cssText = 'display:block;width:100%;height:100%;';
        if (ui.canvas.parentElement !== hostFp.wrap) hostFp.wrap.appendChild(ui.canvas);
        hostFp.onDone = onDone;
        enterMushroomGame();
        startHostLoop();
    }
    // Devil's Fingers ('df') or Sophia the Chaos Fairy Goth ('cfg'). opts = { hp, maxHp }.
    // onDone({ won, hp }) with Olly's HP at the end of the fight.
    function runFight(id, opts, onDone) {
        OLLY_COMBAT_MAX_HP = Math.max(1, opts?.maxHp || 100);
        hostFight = { onDone, hp: Number.isFinite(opts?.hp) ? opts.hp : OLLY_COMBAT_MAX_HP };
        mode = 'map';
        if (id === 'cfg') enterChaosFairyCombat(); else enterDevilsFingersCombat();
        startHostLoop();
    }
    function cheatWinFight() { if (mode !== 'combat') return false; dfHP = 0; checkDfDeath(); return true; }
    function cheatLoseFight() { if (mode !== 'combat') return false; ollyCombatHP = 0; dfSetStatus('Olly is overwhelmed...'); setTimeout(() => exitDevilsFingersCombat(false), 300); return true; }

    // Hooks matching (a trimmed subset of) Level 1's contract. Level 2's own wiring in
    // game.js only calls what actually applies right now; the rest are harmless no-ops
    // kept here so this stays drop-in compatible if more of Level 2 grows into the
    // full hook contract later.
    return {
        runFindPrincess, runFight, cheatWinFight, cheatLoseFight,
        inFight: () => mode === 'combat',
        inMinigame: () => mode === 'mushroom',
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
