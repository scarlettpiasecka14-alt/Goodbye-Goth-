/* Goodbye Goth V9.4 - Chain Goth fight (AI + all seven animations: intro, walk, swipe, spin, stun, hurt, death) on top of V9.0 map cleanup and the v8.11 Zombie Goth AI. */
import { playSfx, playRandomSfx, playMusic, playMusicFrom, preloadSfx, setLoopSfx, setAudioHeld } from '../audio.js?v=9420';
import { activeKey } from '../saves.js?v=9420';
// Game clock: normal time, but it stands still while a tutorial pop-up is open (so nothing happens behind it).
let pausedTotal = 0, pausedAt = 0;
const gnow = () => (pausedAt || performance.now()) - pausedTotal;
// V9.26: opening Settings freezes the same clock (and the sound effects); closing it resumes exactly where it stopped.
let settingsFroze = false;
window.addEventListener('gg-settings', ev => {
    if (ev.detail?.open) {
        if (!pausedAt) { pausedAt = performance.now(); settingsFroze = true; }
        setAudioHeld(true);
    } else {
        if (settingsFroze && pausedAt) { pausedTotal += performance.now() - pausedAt; pausedAt = 0; }
        settingsFroze = false;
        setAudioHeld(false);
    }
});
const GOTH_HURT_SFX = ['goth-hurt-1', 'goth-hurt-2', 'goth-hurt-3', 'goth-hurt-4'];
// Floor warning rings. pink = attack incoming (jump or dodge), yellow = must JUMP it, red = must DODGE it (jumping won't help).
const COMBO_PUNCHES = 2;   // V9.19: two swings then a 5s rest, so punching can't just be spammed
const BITE_WINDUP_MS = 1150;   // red bite warning: long enough to see the ring and dodge
const RING_FLOOR_OFFSET = 62;   // how far below Olly's ground line the Zombie Goth's ring sits
const ATTACK_RING_RGB = { pink: '236,110,170', yellow: '255,208,64', red: '255,66,86', purple: '176,84,255' };
// ---- Ring tutorial pop-ups: shown the first time each ring colour appears, then remembered. Images: assets/tutorial/ring-<colour>.webp
const RING_TUTORIAL = {
    pink: { title: 'PINK RING', text: 'A pink ring shows an incoming attack that you can avoid however you like: dodge it, jump over the enemy, or hit them out of it.' },
    red: { title: 'RED RING', text: 'A red ring shows a stronger attack that you cannot hit them out of. You can still avoid it by dodging or by jumping.' },
    purple: { title: 'PURPLE RING', text: 'Some enemies have special abilities. When an enemy is using a special ability, the enemy and the affected areas will appear in purple rings.' },
    yellow: { title: 'YELLOW RING', text: 'A yellow ring shows a huge attack. Enemies cannot be stunned during it and you cannot dodge it - the only way to avoid it is to jump.' }
};
const TUTORIAL_KEY = 'goodbyeGothRingTutorial_v1';
function ringTutorialSeen(kind) { try { return !!(JSON.parse(localStorage.getItem(TUTORIAL_KEY) || '{}'))[kind]; } catch (e) { return false; } }
function markRingTutorialSeen(kind) { try { const o = JSON.parse(localStorage.getItem(TUTORIAL_KEY) || '{}'); o[kind] = 1; localStorage.setItem(TUTORIAL_KEY, JSON.stringify(o)); } catch (e) {} }
let tutorialHold = false, tutorialHoldStart = 0;   // true while the fight is frozen waiting to show a ring pop-up
export function resetRingTutorials() { try { localStorage.removeItem(TUTORIAL_KEY); } catch (e) {} }
function showRingTutorial(kind, onClose) {
    const info = RING_TUTORIAL[kind];
    if (!info || (pausedAt && !tutorialHold)) return false;
    markRingTutorialSeen(kind);
    if (!pausedAt) pausedAt = performance.now();
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:10040;background:rgba(6,3,10,.72);display:flex;align-items:center;justify-content:center;padding:18px;';
    const card = document.createElement('div');
    card.style.cssText = 'max-width:min(900px,94vw);max-height:94vh;display:flex;flex-direction:column;align-items:center;gap:12px;padding:16px 18px;border:1px solid rgba(239,135,170,.55);border-radius:16px;background:#1a0f1c;box-shadow:0 0 40px rgba(239,90,130,.25);text-align:center;font-family:Georgia,serif;color:#fbeef4;';
    const img = document.createElement('img');
    img.src = `assets/tutorial/ring-${kind}.webp?v=9150`; img.alt = '';
    img.style.cssText = 'max-width:100%;max-height:56vh;border-radius:10px;border:1px solid rgba(255,255,255,.12);object-fit:contain;';
    img.onerror = () => img.remove();
    const h = document.createElement('div'); h.textContent = info.title; h.style.cssText = 'font:900 18px Georgia,serif;letter-spacing:.2em;color:#ef87aa;';
    const t = document.createElement('div'); t.textContent = info.text; t.style.cssText = 'font:500 italic 19px/1.45 Georgia,serif;max-width:680px;';
    const b = document.createElement('button'); b.type = 'button'; b.textContent = 'GOT IT  ▸';
    b.style.cssText = 'padding:9px 26px;border-radius:10px;border:1px solid rgba(239,135,170,.7);background:#3a1a30;color:#fff;font:800 14px Georgia,serif;letter-spacing:.14em;cursor:pointer;';
    card.append(img, h, t, b); overlay.appendChild(card); document.body.appendChild(overlay);
    let closed = false;
    const close = () => {
        if (closed) return; closed = true;
        window.removeEventListener('keydown', onKey, true);
        overlay.remove();
        pausedTotal += performance.now() - pausedAt; pausedAt = 0; tutorialHold = false;
        if (onClose) onClose();
    };
    const onKey = e => { e.stopPropagation(); e.preventDefault(); if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey, true);
    b.addEventListener('click', e => { e.stopPropagation(); close(); });
    setTimeout(() => b.focus({ preventScroll: true }), 50);
    return true;
}
// V9.37: the warning flashes are the same length for EVERY attack: two flashes of ~220ms, finishing ~90ms before the hit lands.
// progress = 0..1 through the wind-up, windupMs = how long that wind-up is.
function ringFlashAlpha(progress, windupMs) {
    if (tutorialHold) return 1;
    const W = windupMs || 1000, t = Math.max(0, Math.min(1, progress)) * W;
    let fd = Math.min(220, W * .28), gap = Math.min(120, W * .1);
    const end2 = W - Math.min(90, W * .12);
    if (end2 - 2 * fd - gap < 0) fd = Math.max(40, (end2 - gap) / 2);
    const s2 = end2 - fd, s1 = s2 - gap - fd;
    const f = (lo, hi) => (t >= lo && t < hi) ? Math.pow(Math.sin((t - lo) / (hi - lo) * Math.PI), .6) : 0;
    return Math.max(f(s1, s1 + fd), f(s2, end2));
}
function drawAttackRing(c, x, floorY, radius, kind, progress, active, nowMs, windupMs) {
    // The ring is only a WARNING: it flashes twice during the wind-up in the attack's colour, then disappears so the animation is clear.
    const rgb = ATTACK_RING_RGB[kind] || ATTACK_RING_RGB.pink;
    if (active && !tutorialHold) return;
    const a = ringFlashAlpha(progress, windupMs);
    if (a <= .03) return;
    c.save();
    c.translate(x, floorY);
    c.scale(1, .2);
    c.beginPath();
    c.arc(0, 0, radius, 0, Math.PI * 2);
    c.fillStyle = `rgba(${rgb},${.34 * a})`;
    c.fill();
    c.lineWidth = 12;
    c.strokeStyle = `rgba(${rgb},${.98 * a})`;
    c.stroke();
    c.beginPath(); c.arc(0, 0, radius * .94, 0, Math.PI * 2);
    c.lineWidth = 4; c.strokeStyle = `rgba(255,255,255,${.55 * a})`; c.stroke();
    c.restore();
}
// V9.23: how close the map camera is (was 1.42; 1.7 in V9.23). Bigger = closer, characters and objects look larger.
const MAP_ZOOM = 1.5;
// V9.27: the map camera sits this many map-pixels above Olly, so you see more of what is ahead/north (the church corner at the start).
const CAM_LEAD_Y = 90;
const MIST_SEE_NEAR = 560, MIST_SEE_FAR = 760;   // enemies are fully visible inside 560 map-px of Olly, invisible beyond 760
const WORLD_W = 1536,
    WORLD_H = 1024;
function safeParseSave() {
    try {
        const raw = localStorage.getItem(activeKey());
        return raw ? JSON.parse(raw) : null
    } catch {
        return null
    }
}

const mapBackground = new Image();
mapBackground.src = 'assets/environment/level1-map-bg-2x.webp?v=9420';   // V9.30: pre-sharpened 2x version (same picture, twice the pixels)
// V9.30: Settings options (window.ggPrefs is created by settings.js)
const prefOn = k => !(window.ggPrefs && window.ggPrefs[k] === false);
const SH = a => prefOn('shadows') ? `rgba(0,0,0,${a})` : 'rgba(0,0,0,0)';
// make a canvas draw at the real screen resolution (it was a fixed size that the browser stretched = soft picture)
function syncHiRes(canvas, c, logicalW, logicalH) {
    const css = canvas.clientWidth || logicalW;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const k = (window.ggPrefs && window.ggPrefs.hiRes === false) ? 1 : Math.max(1, Math.min(2, css * dpr / logicalW));
    const w = Math.round(logicalW * k), h = Math.round(logicalH * k);
    if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; }
    c.setTransform(k, 0, 0, k, 0, 0);
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    return k;
}
// screen shake (big hits). Off when Settings -> Screen shake is off.
let shakeUntil = 0, shakeMag = 0, shakeStart = 0;
function kickShake(mag, ms = 260) { if (!prefOn('shake')) return; shakeStart = performance.now(); shakeUntil = shakeStart + ms; shakeMag = mag; }
const goldenKeySprite = new Image();
goldenKeySprite.src = 'assets/items/golden-key.webp?v=6515';
const gateLockSprite = new Image();
gateLockSprite.src = 'assets/encounters/level1/gate-lock.webp?v=6524';

// V9.21 inventory items (module level so the inventory code can use them at any time)
const ITEM_INFO = {
    key: { name: 'A Mysterious Key', desc: 'It seems important.', tip: 'A mysterious key. Seems important.', img: 'assets/items/golden-key.webp', label: 'KEY' },
    potion: { name: 'Potion', desc: 'Drink to restore to full HP.', tip: 'Drink to restore to full HP.', img: 'assets/items/potion-vial.webp', label: 'POTION' }
};
// V9.22: Olly's drinking animation (50 frames) used before the Patricia fight.
const DRINK_FRAMES = 50, DRINK_FRAME_MS = 50, DRINK_HEAL_FRAME = 28, DRINK_DRAW_K = 0.51;   // V9.36b: was 0.656 (he looked about 30% bigger than in the fight itself)
const DRINK_ART = { w: 369, h: 527, feetY: 524, centerX: 191 };
const drinkImgs = [];
function loadDrinkFrames() {
    if (drinkImgs.length) return;
    for (let i = 0; i < DRINK_FRAMES; i++) {
        const im = new Image();
        im.src = `assets/combat/OllyDrink/olly-drink-${String(i).padStart(2, '0')}.webp?v=9362`;
        drinkImgs.push(im);
    }
}
let selectedItem = null;
let invSig = '';
let invTipEl = null;
const ollySprite = new Image();
ollySprite.src = 'assets/characters/olly.webp?v=7110';

// v7.7: directional map walking poses.
// These are map-only sprites. Combat keeps its existing side-on movement/animations.
const ollyMapWalkSprites = {
    front: new Image(),
    back: new Image(),
    left: new Image(),
    right: new Image()
};
ollyMapWalkSprites.front.src = 'assets/characters/map/olly-walk-front.webp?v=7700';
ollyMapWalkSprites.back.src = 'assets/characters/map/olly-walk-back.webp?v=7700';
ollyMapWalkSprites.left.src = 'assets/characters/map/olly-walk-left.webp?v=7700';
ollyMapWalkSprites.right.src = 'assets/characters/map/olly-walk-right.webp?v=7700';

// Combat animation frames are cropped from the supplied sprite sheet so each
// pose keeps its own aspect ratio and stray sprite-sheet labels never render.
const ollyCombatSprites = {
    idle: new Image(),
    dodge: [1,2,3].map(n => new Image()),
    jump: [1,2,3].map(n => new Image()),
    heavy: [1,2,3,4,5].map(n => new Image()),
    punch: [1,2,3,4,5].map(n => new Image())
};

// v8.11: dedicated player reaction artwork.
// Normal damage uses the six upright hurt frames. Reaching 0 HP uses the
// eight-frame collapse sequence as a KO, not a literal death.
const ollyReactionSprites = {
    hurt: Array.from({ length: 6 }, () => new Image()),
    ko: Array.from({ length: 8 }, () => new Image())
};

const OLLY_HURT_FRAME_MS = [70, 80, 80, 90, 100, 150];
const OLLY_HURT_TOTAL_MS = OLLY_HURT_FRAME_MS.reduce((a, b) => a + b, 0);
const OLLY_KO_FRAME_MS = [90, 100, 120, 140, 170, 190, 210, 430];
const OLLY_KO_TOTAL_MS = OLLY_KO_FRAME_MS.reduce((a, b) => a + b, 0);

// v6.5.10 readability pass: use a smaller set of deliberate keyframes rather than
// playing every dramatic pose in the supplied sheets. This keeps combat readable
// at game speed while preserving the supplied artwork.
const OLLY_ANIMATIONS = {
    // v6.5.13: use the new clean three-pose jump and dodge sequences.
    // Each move is built from a small number of readable key poses rather than
    // rapidly cycling through every dramatic drawing.
    dodge: { indices:[0,1,2], frameMs:[88,210,111], height:260 }, // v6.5.16d: ~20% faster than v6.5.16c
    jump:  { indices:[0,1,2], frameMs:[120,225,165], height:208, frameYOffset:[0,-22,0] }, // v6.5.16d: ~20% faster; non-idle jump sprites remain 20% smaller
    heavy: { indices:[0,3,4], frameMs:[130,260,230], height:260, kScale:.6 },   // V9.31: one fixed scale (these crouch frames are cropped tight, so scaling each to 260px high made his head swell)
    punch: { indices:[0,1,2,3,4], frameMs:[52,62,72,78,70], height:224 }
};
const OLLY_IDLE_HEIGHT = 300; // v6.5.15: slightly larger combat idle so head/body proportions stay closer to action poses.
const OLLY_DRAW_FOOT_OFFSET = 62;
// v4.7 activity architecture: the icon belongs to the ROLE, not to the level.
// These shared icon references can be reused by every level. Only the activity
// behind the role changes from level to level.
const ICON_LIBRARY = {
    relationshipChallenge: 'assets/icons/relationship-challenge.webp?v=9420',
    princessQuestion: 'assets/icons/princess-question.webp?v=9420'
};
const relationshipChallengeIcon = new Image();
relationshipChallengeIcon.src = ICON_LIBRARY.relationshipChallenge;
const princessQuestionIcon = new Image();
// V9.27: the heart marker was an embedded copy that was cut off part-way (a corrupt image, so it drew broken). It now loads the normal icon file.
princessQuestionIcon.src = ICON_LIBRARY.princessQuestion;

const LEVEL_ACTIVITY_DATA = {
    1: {
        relationshipChallenge: {
            id: 'wouldYou',
            name: 'WOULD YOU?',
            icon: ICON_LIBRARY.relationshipChallenge
        },
        princessQuestion: {
            id: 'undressQuestion',
            name: 'Princess Question',
            icon: ICON_LIBRARY.princessQuestion
        }
    },
    2: {
        relationshipChallenge: {
            id: 'bathroomBurrito',
            name: 'BATHROOM BURRITO',
            icon: ICON_LIBRARY.relationshipChallenge
        },
        princessQuestion: {
            id: 'chaosFairyGoth',
            name: 'Which type of goth is known for frolicking in the woods?',
            icon: ICON_LIBRARY.princessQuestion
        }
    }
};
const LEVEL_NUMBER = 1;
const ACTIVITY_DATA = LEVEL_ACTIVITY_DATA[LEVEL_NUMBER];

const ENCOUNTER_DATA = {
    zombieGoth: {
        role: 'zombieGoth',
        name: 'ZOMBIE GOTH',
        image: 'assets/encounters/level1/zombie-goth-encounter.webp?v=2',
        text: 'The zombie goth reaches for you with her claws moaning about the burning sun. You stumble backwards partially blinded by the light. Are you ready?'
    },
    chainGoth: {
        role: 'chainGoth',
        name: 'CHAIN GOTH',
        image: 'assets/encounters/level1/chain-goth-encounter.webp?v=2',
        text: 'You encounter the chain goth, she raises her chain high above her head demanding eyeliner. You turn expecting a blow that never comes. Are you ready?'
    },
    relationshipChallenge: {
        role: 'relationshipChallenge',
        name: 'RELATIONSHIP CHALLENGE',
        image: 'assets/encounters/level1/relationship-challenge-encounter.webp?v=501',
        text: "You've encountered a relationship challenge.\nWould You: sometimes princesses have a lot to say and they get a little bit lost along the way. You could help by trying to figure out what she means... or you could just make fun of her.\nAre you ready?"
    },
    princessQuestion: {
        role: 'princessQuestion',
        name: 'PRINCESS QUESTION',
        image: 'assets/encounters/level1/princess-question-encounter.webp?v=501',
        text: "You've encountered a princess question. Answer correctly to prove your love for your princess. Are you ready?"
    },
    lockedGate: {
        role: 'lockedGate',
        name: 'THE GATE',
        image: 'assets/encounters/level1/gate-interaction.webp?v=6518',
        text: "You hear a rustling from beyond the gate. You peer through the bars, trying to get a better look, but the gate's locked! You'll have to find the key."
    }
};
const zombieSprites = {
    shambler: new Image(),
    chain: new Image()
};


// v7.6: Zombie Goth combat walk cycle uses the new 12-frame strict side-profile animation pass.
// All 12 supplied side-profile poses are used in order. The game flips them only when the Goth needs to face the opposite direction.
const zombieCombatFrames = {
    // v8.11: the approved crouched ready pose is the first frame of the supplied
    // heavy-attack sequence. It is used as the post-countdown ready/recovery pose.
    idle: [new Image()],
    walk: Array.from({ length: 12 }, () => new Image()),   // V9.30: back to the original 12-frame walk (her legs visibly cross)
    // Regular claw swipe.
    claw: [1, 2, 3, 4, 5].map(() => new Image()),
    // Eight Ankle Biter frames used by the existing HEAVY ATTACK state.
    heavyKick: Array.from({ length: 8 }, () => new Image()),
    // Existing supplied Zombie Goth reaction/death art.
    hurt: Array.from({ length: 19 }, () => new Image()),
    death: Array.from({ length: 45 }, () => new Image()),   // V9.24: new detailed collapse (45 frames)
    // Countdown-only staring/prep animation. It is not an attack state.
    prep: Array.from({ length: 61 }, () => new Image()),   // V9.24: new 3-2-1 fight-stance animation (61 frames)
    intro2: Array.from({ length: 121 }, () => new Image())   // V9.40: second 3-2-1 clip (121 frames, 24 fps)
};
let zombieIntroMode = 'new', zombieIntroNew = true;   // V9.41: the new 3-2-1 replaces the old claw one (cheat 'intro old' still brings the old one back for comparing)
   // V9.40: which 3-2-1 she uses this fight (cheat: intro new / old / random)
const ZOMBIE_INTRO2_FRAME_MS = 41.67;
const zombieCountdownFrames = {
    3: new Image(),
    2: new Image(),
    1: new Image(),
    fight: new Image()
};
// v7.6: use the complete 12-frame side-profile cycle at a readable pace.
// Slightly slower timing preserves the weight transfer instead of making the feet blur together.
// V9.28: the 33-frame walk clip is not a loop (starts upright, ends crouched), which made her flash every cycle. Play it forwards then backwards.
const ZOMBIE_WALK_SEQUENCE = Array.from({ length: 12 }, (_, i) => i);   // V9.30: original walk restored
// v8.7: speed up the animation cycle itself by ~15% without changing Zombie's movement speed.
const ZOMBIE_WALK_FRAME_MS = Array(12).fill(100);
const ZOMBIE_WALK_CYCLE_MS = ZOMBIE_WALK_FRAME_MS.reduce((a, b) => a + b, 0);
// Use the dedicated crouched ready pose. The attack frames belong
// exclusively to the heavy attack and must not appear as the neutral/telegraph pose.
// v8.8: short non-lethal hit is 1-2-3-4-3-2-1, using the same supplied fall poses.
// V9.29: new hurt animation (19 frames from the green-screen video): 0 = stance, 1-5 = snap back, 6-18 = recovery.
const ZOMBIE_HURT_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 14, 16, 18];
const ZOMBIE_HURT_FRAME_MS = [40, 40, 45, 50, 70, 100, 70, 60, 60, 60, 60, 60, 110];
const ZOMBIE_HURT_TOTAL_MS = ZOMBIE_HURT_FRAME_MS.reduce((a, b) => a + b, 0);
// Keep the five-second countdown, but play the supplied prep poses at a brisk,
 // even pace in a ping-pong loop so the motion does not sit on each frame.
const ZOMBIE_PREP_FRAME_MS = 100;
const ZOMBIE_PREP_SEQUENCE = [0, 1, 2, 3, 4, 5, 6, 7, 6, 5, 4, 3, 2, 1];
const ZOMBIE_PREP_CYCLE_MS = ZOMBIE_PREP_FRAME_MS * ZOMBIE_PREP_SEQUENCE.length;
const ZOMBIE_PREP_TOTAL_MS = 5000;
const ZOMBIE_COUNTDOWN_PHASE_MS = 1500;
const ZOMBIE_INTRO_TOTAL_MS = ZOMBIE_COUNTDOWN_PHASE_MS * 4;
const ZOMBIE_LONG_HURT_SEQUENCE = [0, 1, 2, 3, 4, 5, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const ZOMBIE_LONG_HURT_FRAME_MS = [50, 50, 55, 60, 80, 150, 400, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 120];
const ZOMBIE_LONG_HURT_TOTAL_MS = ZOMBIE_LONG_HURT_FRAME_MS.reduce((a, b) => a + b, 0);
// v8.7: slow the visible collapse by ~15%, then hold the final grounded pose for 5 seconds.
const ZOMBIE_DEATH_FRAME_MS = Array(45).fill(45);
const ZOMBIE_DEATH_TOTAL_MS = ZOMBIE_DEATH_FRAME_MS.reduce((a, b) => a + b, 0);
const ZOMBIE_DEATH_HOLD_FIXED = Math.max(300, 3000 - ZOMBIE_DEATH_TOTAL_MS);
const ZOMBIE_DEATH_HOLD_MS = 3000;   // placeholder, recomputed below so animation + hold = 3s
// v8.7: the supplied death PNGs have different transparent margins. These offsets
// keep the visible bottom of each frame on the combat floor instead of floating.
const ZOMBIE_DEATH_FLOOR_OFFSETS = [];   // V9.24: new death frames are bottom-aligned already

/* V9.1: Chain Goth combat animation packs.
   Each pack is ONE small image holding the chosen frames of an animation (built from the
   animator's 1440x1440 frames by tools/build_chain_assets.py). Every frame row is
   [packX, packY, packW, packH, offsetX, offsetY]; the offsets place the trimmed frame
   relative to her feet. The art faces LEFT, like the Zombie Goth art. */
const CHAIN_ATLAS_DATA = {"intro":{"size":[3927,3924],"scale":0.64,"frames":[[0,0,269,401,-211,-623],[271,0,268,401,-211,-622],[541,0,269,396,-211,-615],[812,0,269,389,-211,-605],[1083,0,274,387,-211,-601],[1359,0,277,392,-211,-610],[1638,0,300,400,-211,-621],[1940,0,333,405,-211,-629],[2275,0,359,417,-211,-649],[2636,0,376,470,-211,-731],[3014,0,380,539,-215,-839],[3396,0,418,517,-382,-804],[0,541,367,543,-436,-844],[369,541,388,463,-443,-719],[759,541,456,390,-399,-606],[1217,541,352,486,-211,-756],[1571,541,419,500,-292,-777],[1992,541,554,509,-450,-791],[2548,541,476,525,-423,-819],[3026,541,377,554,-440,-865],[3405,541,522,400,-477,-624],[0,1097,511,435,-446,-664],[513,1097,381,534,-209,-792],[896,1097,436,516,-269,-788],[1334,1097,584,519,-452,-807],[1920,1097,500,532,-427,-829],[2422,1097,385,548,-452,-856],[2809,1097,530,400,-491,-625],[3341,1097,503,429,-425,-649],[0,1647,380,526,-210,-771],[382,1647,429,524,-258,-815],[813,1647,579,511,-434,-794],[1394,1647,520,529,-429,-824],[1916,1647,372,562,-437,-877],[2290,1647,486,460,-464,-718],[2778,1647,541,409,-464,-623],[3321,1647,423,481,-279,-704],[0,2211,393,549,-210,-801],[395,2211,488,505,-330,-784],[885,2211,605,515,-462,-801],[1492,2211,497,538,-427,-839],[1991,2211,370,560,-443,-874],[2363,2211,518,401,-475,-626],[2883,2211,519,412,-442,-626],[3404,2211,405,508,-241,-740],[0,2773,410,579,-225,-830],[412,2773,543,504,-413,-782],[957,2773,596,514,-461,-798],[1555,2773,449,536,-424,-834],[2006,2773,405,559,-436,-873],[2413,2773,527,400,-467,-624],[2942,2773,508,424,-414,-634],[3452,2773,390,545,-209,-783],[0,3354,423,563,-237,-803],[425,3354,547,509,-404,-790],[974,3354,609,515,-461,-799],[1585,3354,478,535,-427,-833],[2065,3354,375,568,-431,-887],[2442,3354,513,452,-455,-706],[2957,3354,530,422,-447,-630]]},"walk":{"size":[3693,357],"scale":0.56,"frames":[[0,0,240,352,-172,-624],[242,0,246,354,-168,-630],[490,0,244,355,-188,-631],[736,0,264,352,-259,-628],[1002,0,245,347,-261,-618],[1249,0,237,340,-245,-609],[1488,0,223,343,-213,-614],[1713,0,216,348,-173,-623],[1931,0,218,353,-144,-630],[2151,0,225,355,-155,-633],[2378,0,236,352,-217,-632],[2616,0,275,347,-271,-625],[2893,0,278,345,-257,-614],[3173,0,267,347,-225,-614],[3442,0,251,352,-187,-622]]},"swipe":{"size":[4064,953],"scale":0.64,"frames":[[0,0,269,401,-211,-623],[271,0,269,401,-211,-623],[542,0,269,401,-211,-624],[813,0,269,401,-211,-624],[1084,0,268,403,-211,-626],[1354,0,263,403,-211,-627],[1619,0,253,408,-211,-630],[1874,0,251,404,-211,-627],[2127,0,268,396,-211,-614],[2397,0,291,396,-211,-614],[2690,0,300,401,-236,-622],[2992,0,356,419,-339,-650],[3350,0,341,398,-385,-619],[3693,0,371,394,-441,-620],[0,421,477,413,-457,-641],[479,421,502,463,-396,-690],[983,421,390,484,-180,-724],[1375,421,418,530,-182,-799],[1795,421,385,490,-122,-868],[2182,421,386,507,-97,-913]]},"death":{"size":[4020,1989],"scale":0.56,"frames":[[0,0,236,352,-212,-624],[238,0,236,354,-213,-627],[476,0,239,356,-215,-629],[717,0,241,359,-219,-632],[960,0,243,361,-220,-632],[1205,0,246,364,-221,-636],[1453,0,246,366,-223,-637],[1701,0,248,370,-224,-645],[1951,0,248,359,-225,-619],[2201,0,252,340,-232,-585],[2455,0,254,340,-235,-584],[2711,0,530,343,-720,-589],[3243,0,512,374,-720,-636],[0,376,561,384,-720,-655],[563,376,346,354,-273,-605],[911,376,366,361,-273,-621],[1279,376,363,325,-273,-553],[1644,376,361,327,-275,-555],[2007,376,358,329,-277,-556],[2367,376,360,333,-281,-561],[2729,376,328,346,-233,-579],[3059,376,326,320,-231,-600],[3387,376,305,332,-219,-561],[3694,376,326,322,-261,-533],[0,762,366,314,-357,-513],[368,762,349,306,-331,-499],[719,762,311,301,-264,-488],[1032,762,307,300,-253,-484],[1341,762,288,309,-220,-497],[1631,762,285,325,-212,-525],[1918,762,281,331,-200,-533],[2201,762,289,334,-216,-536],[2492,762,290,334,-216,-535],[2784,762,295,337,-221,-536],[3081,762,295,340,-220,-540],[3378,762,287,350,-207,-559],[3667,762,293,353,-213,-559],[0,1117,309,353,-240,-559],[311,1117,311,349,-241,-556],[624,1117,321,347,-256,-553],[947,1117,331,346,-227,-547],[1280,1117,347,348,-259,-547],[1629,1117,366,350,-312,-551],[1997,1117,428,298,-384,-448],[2427,1117,505,255,-411,-371],[2934,1117,508,218,-392,-305],[3444,1117,513,184,-372,-243],[0,1472,537,167,-375,-216],[539,1472,567,155,-377,-185],[1108,1472,596,162,-379,-197],[1706,1472,616,163,-380,-199],[2324,1472,617,158,-383,-188],[2943,1472,619,155,-385,-180],[0,1641,620,158,-388,-184],[622,1641,622,160,-391,-185],[1246,1641,623,161,-393,-187],[1871,1641,625,161,-396,-184],[2498,1641,626,163,-397,-184],[3126,1641,627,172,-400,-199],[0,1815,629,170,-403,-196],[631,1815,629,172,-404,-197]]},"stun":{"size":[4074,1517],"scale":0.64,"frames":[[0,0,255,380,-235,-588],[257,0,255,380,-235,-590],[514,0,252,382,-235,-592],[768,0,249,383,-235,-594],[1019,0,243,383,-235,-594],[1264,0,238,387,-235,-600],[1504,0,230,389,-234,-604],[1736,0,223,394,-234,-607],[1961,0,217,402,-234,-607],[2180,0,214,402,-228,-601],[2396,0,211,400,-220,-597],[2609,0,216,391,-213,-583],[2827,0,220,380,-211,-570],[3049,0,234,369,-211,-559],[3285,0,251,356,-211,-550],[3538,0,265,353,-211,-545],[3805,0,269,350,-211,-541],[0,404,272,350,-211,-541],[274,404,266,351,-211,-542],[542,404,260,354,-211,-547],[804,404,253,356,-211,-550],[1059,404,249,358,-212,-554],[1310,404,243,359,-212,-556],[1555,404,241,364,-212,-559],[1798,404,243,367,-212,-561],[2043,404,248,365,-212,-558],[2293,404,252,361,-212,-555],[2547,404,262,355,-212,-550],[2811,404,266,352,-212,-545],[3079,404,269,349,-212,-540],[3350,404,266,348,-212,-538],[3618,404,261,350,-212,-541],[0,773,255,353,-213,-545],[257,773,249,355,-213,-549],[508,773,241,358,-212,-555],[751,773,237,362,-212,-561],[990,773,237,367,-212,-564],[1229,773,240,371,-213,-566],[1471,773,243,370,-212,-566],[1716,773,249,370,-212,-566],[1967,773,253,365,-212,-561],[2222,773,261,360,-212,-555],[2485,773,265,356,-212,-551],[2752,773,266,354,-212,-548],[3020,773,266,352,-212,-545],[3288,773,262,353,-212,-545],[3552,773,255,355,-212,-550],[3809,773,250,360,-212,-557],[0,1146,243,363,-212,-563],[245,1146,237,366,-212,-568],[484,1146,237,368,-212,-570],[723,1146,237,369,-212,-570],[962,1146,240,369,-212,-568],[1204,1146,246,365,-212,-562],[1452,1146,252,362,-212,-558],[1706,1146,260,360,-212,-554],[1968,1146,264,355,-212,-548],[2234,1146,266,354,-212,-547],[2502,1146,266,355,-212,-550],[2770,1146,261,359,-212,-556],[3033,1146,256,362,-212,-562]]},"hurt":{"size":[4073,2138],"scale":0.64,"frames":[[0,0,269,400,-211,-622],[271,0,262,400,-211,-622],[535,0,250,399,-211,-621],[787,0,241,402,-213,-625],[1030,0,239,406,-224,-632],[1271,0,243,411,-241,-638],[1516,0,253,415,-265,-645],[1771,0,253,420,-276,-652],[2026,0,248,422,-278,-656],[2276,0,239,426,-262,-660],[2517,0,225,429,-234,-662],[2744,0,220,435,-219,-662],[2966,0,218,433,-213,-657],[3186,0,223,426,-218,-645],[3411,0,234,420,-231,-635],[3647,0,247,413,-249,-625],[0,437,260,410,-263,-619],[262,437,276,407,-279,-615],[540,437,297,406,-295,-614],[839,437,320,410,-307,-619],[1161,437,335,410,-309,-620],[1498,437,349,404,-298,-611],[1849,437,349,396,-266,-597],[2200,437,367,388,-275,-585],[2569,437,366,387,-282,-584],[2937,437,351,391,-284,-590],[3290,437,332,398,-283,-601],[3624,437,312,404,-279,-611],[0,849,287,414,-273,-621],[289,849,257,422,-264,-631],[548,849,228,423,-254,-638],[778,849,213,426,-242,-646],[993,849,221,427,-222,-654],[1216,849,240,435,-218,-661],[1458,849,260,438,-215,-664],[1720,849,265,439,-202,-665],[1987,849,262,439,-190,-665],[2251,849,267,436,-182,-660],[2520,849,284,437,-178,-662],[2806,849,308,434,-177,-657],[3116,849,318,429,-168,-649],[3436,849,307,418,-154,-632],[3745,849,291,410,-150,-620],[0,1290,276,406,-150,-613],[278,1290,263,407,-150,-615],[543,1290,250,412,-150,-622],[795,1290,239,419,-150,-633],[1036,1290,231,424,-150,-641],[1269,1290,227,428,-150,-647],[1498,1290,221,428,-150,-648],[1721,1290,224,428,-150,-648],[1947,1290,231,427,-150,-646],[2180,1290,236,426,-150,-645],[2418,1290,236,425,-150,-643],[2656,1290,234,426,-150,-644],[2892,1290,232,426,-150,-645],[3126,1290,236,425,-150,-643],[3364,1290,236,424,-150,-641],[3602,1290,234,422,-150,-639],[3838,1290,235,419,-150,-634],[0,1720,236,416,-150,-629]],"bx":[3,8,12,16,20,25,30,35,38,42,45,49,51,50,45,39,33,26,20,16,14,14,15,15,20,29,39,46,51,53,58,59,55,51,50,52,57,60,61,63,65,66,66,67,68,69,69,69,69,69,69,67,67,67,70,73,76,78,80,83,85]},"slam":{"size":[4070,1455],"scale":0.56,"frames":[[0,0,236,353,-122,-626],[238,0,241,353,-130,-626],[481,0,243,353,-124,-626],[726,0,249,353,-116,-626],[977,0,286,354,-116,-627],[1265,0,283,355,-116,-629],[1550,0,305,356,-169,-630],[1857,0,258,357,-230,-631],[2117,0,303,357,-302,-632],[2422,0,358,359,-393,-634],[2782,0,388,360,-435,-636],[3172,0,379,362,-403,-636],[3553,0,305,363,-130,-636],[0,365,307,363,-134,-636],[309,365,307,363,-134,-636],[618,365,303,363,-136,-636],[923,365,303,361,-136,-633],[1228,365,335,361,-135,-636],[1565,365,333,359,-133,-629],[1900,365,361,359,-133,-632],[2263,365,360,357,-130,-626],[2625,365,363,357,-130,-627],[2990,365,359,355,-124,-622],[3351,365,372,355,-121,-624],[3725,365,345,355,-118,-625],[0,730,234,358,-202,-629],[236,730,303,358,-308,-632],[541,730,364,358,-409,-632],[907,730,384,361,-433,-636],[1293,730,384,362,-424,-636],[1679,730,338,362,-322,-636],[2019,730,307,363,-131,-636],[2328,730,304,363,-134,-636],[2634,730,304,363,-134,-636],[2940,730,303,363,-136,-636],[3245,730,302,361,-137,-633],[3549,730,332,360,-132,-634],[0,1095,332,358,-133,-628],[334,1095,351,357,-130,-628],[687,1095,351,356,-130,-625],[1040,1095,367,356,-130,-626],[1409,1095,366,355,-129,-623],[1777,1095,357,355,-119,-622],[2136,1095,360,356,-118,-624],[2498,1095,232,357,-118,-627],[2732,1095,230,357,-116,-628]]}};
// Video frame numbers of the kept slam frames (the slam pack index -> frame of the source video; 24 fps).
const CHAIN_SLAM_VF = [37,39,41,43,45,47,49,51,53,55,57,59,61,62,63,64,65,66,67,68,69,70,71,74,77,80,83,84,86,88,90,92,94,95,96,97,98,99,100,101,102,103,106,109,112,115];
/* V9.25: Patricia (Level 1 boss) animation packs: one WebP per move, built by tools/build_patricia_assets.py.
   Frame rows are [atlasX, atlasY, w, h, offX, offY] with offsets relative to her feet (source px). Her art faces LEFT
   (except the walk, which faces right and is flipped when drawn). */
const PATRICIA_ATLAS_DATA = {"walk":{"size":[3804,2341],"scale":0.9,"frames":[[0,0,426,581,-322,-635],[428,0,428,584,-325,-640],[858,0,513,575,-341,-632],[1373,0,562,560,-358,-613],[1937,0,550,561,-356,-613],[2489,0,505,570,-357,-623],[2996,0,404,576,-323,-631],[3402,0,402,577,-317,-633],[0,586,436,583,-328,-642],[438,586,472,583,-339,-642],[912,586,544,570,-357,-628],[1458,586,522,562,-353,-617],[1982,586,484,574,-355,-625],[2468,586,431,579,-334,-632],[2901,586,384,579,-314,-633],[3287,586,415,579,-318,-634],[0,1171,413,582,-304,-639],[415,1171,481,580,-326,-637],[898,1171,548,567,-347,-623],[1448,1171,537,558,-362,-613],[1987,1171,505,563,-368,-615],[2494,1171,472,572,-363,-624],[2968,1171,419,573,-339,-629],[3389,1171,414,576,-306,-633],[0,1755,428,582,-306,-640],[430,1755,467,584,-328,-643],[899,1755,534,573,-335,-632],[1435,1755,542,564,-356,-620],[1979,1755,526,569,-364,-620]]},"idle":{"size":[4081,2067],"scale":0.9,"frames":[[0,0,463,512,-254,-566],[465,0,464,512,-254,-566],[931,0,463,512,-250,-566],[1396,0,451,513,-249,-567],[1849,0,444,514,-250,-568],[2295,0,433,516,-254,-570],[2730,0,420,517,-259,-571],[3152,0,410,515,-263,-569],[3564,0,411,514,-266,-568],[0,519,416,514,-266,-568],[418,519,437,514,-266,-568],[857,519,451,513,-262,-567],[1310,519,466,511,-260,-565],[1778,519,477,511,-256,-565],[2257,519,477,512,-254,-566],[2736,519,464,512,-251,-566],[3202,519,445,512,-249,-566],[3649,519,432,513,-249,-567],[0,1035,418,514,-249,-568],[420,1035,418,514,-250,-568],[840,1035,406,514,-251,-568],[1248,1035,428,514,-254,-568],[1678,1035,449,514,-256,-568],[2129,1035,469,513,-260,-567],[2600,1035,476,513,-260,-567],[3078,1035,471,512,-260,-566],[3551,1035,480,512,-256,-566],[0,1551,469,513,-254,-567],[471,1551,446,514,-249,-568],[919,1551,436,514,-248,-568],[1357,1551,425,514,-249,-568]]},"lunge":{"size":[4012,4233],"scale":0.8,"frames":[[0,0,411,455,-254,-566],[413,0,417,455,-255,-566],[832,0,406,455,-255,-566],[1240,0,385,456,-255,-567],[1627,0,374,456,-255,-567],[2003,0,370,456,-254,-567],[2375,0,352,456,-254,-567],[2729,0,342,456,-254,-567],[3073,0,341,455,-255,-566],[3416,0,345,455,-254,-566],[0,458,362,455,-254,-566],[364,458,389,455,-254,-566],[755,458,402,455,-254,-566],[1159,458,406,455,-254,-566],[1567,458,406,455,-254,-566],[1975,458,406,455,-257,-566],[2383,458,384,458,-254,-569],[2769,458,354,462,-249,-575],[3125,458,330,462,-234,-577],[3457,458,322,466,-221,-584],[0,926,322,464,-210,-588],[324,926,328,468,-207,-594],[654,926,344,472,-209,-599],[1000,926,380,476,-251,-604],[1382,926,483,494,-381,-627],[1867,926,634,479,-579,-608],[2503,926,471,480,-390,-609],[2976,926,436,479,-371,-608],[3414,926,398,477,-352,-605],[0,1422,393,473,-355,-600],[395,1422,410,466,-289,-592],[807,1422,434,463,-277,-570],[1243,1422,486,430,-246,-532],[1731,1422,520,430,-233,-527],[2253,1422,503,454,-205,-544],[2758,1422,511,457,-188,-561],[3271,1422,496,451,-167,-568],[0,1897,482,487,-175,-613],[484,1897,472,541,-202,-679],[958,1897,472,560,-246,-702],[1432,1897,492,555,-264,-696],[1926,1897,486,551,-263,-690],[2414,1897,536,688,-277,-861],[2952,1897,830,515,-603,-646],[0,2587,870,427,-623,-536],[872,2587,842,390,-623,-489],[1716,2587,820,390,-619,-491],[2538,2587,787,391,-618,-491],[0,3016,794,408,-616,-491],[796,3016,800,417,-617,-491],[1598,3016,804,413,-617,-490],[2404,3016,805,410,-618,-490],[3211,3016,801,407,-619,-490],[0,3435,805,400,-619,-490],[807,3435,829,390,-619,-490],[1638,3435,847,390,-619,-490],[2487,3435,858,390,-619,-490],[0,3837,865,390,-619,-490],[867,3837,854,390,-618,-490],[1723,3837,834,390,-619,-490],[2559,3837,807,394,-619,-490]]},"combo":{"size":[4081,5387],"scale":0.9,"frames":[[0,0,372,417,-215,-512],[374,0,371,418,-215,-513],[747,0,368,417,-215,-512],[1117,0,368,417,-213,-512],[1487,0,357,417,-205,-512],[1846,0,364,416,-213,-512],[2212,0,389,417,-240,-513],[2603,0,400,415,-254,-513],[3005,0,365,408,-219,-513],[3372,0,319,409,-169,-514],[0,420,425,421,-174,-518],[427,420,345,428,-184,-525],[774,420,329,437,-197,-535],[1105,420,351,445,-232,-542],[1458,420,508,448,-411,-546],[1968,420,599,447,-504,-545],[2569,420,618,441,-519,-538],[3189,420,610,432,-504,-525],[0,870,539,429,-434,-519],[541,870,392,444,-263,-527],[935,870,369,472,-239,-539],[1306,870,626,456,-249,-548],[1934,870,619,542,-243,-642],[2555,870,501,670,-237,-784],[3058,870,444,709,-233,-828],[3504,870,436,717,-231,-837],[0,1589,439,701,-206,-819],[441,1589,474,641,-231,-750],[917,1589,565,484,-231,-576],[1484,1589,584,436,-236,-523],[2070,1589,414,449,-239,-537],[2486,1589,677,463,-523,-552],[3165,1589,648,608,-492,-713],[0,2292,461,736,-278,-856],[463,2292,454,756,-259,-878],[919,2292,482,743,-277,-864],[1403,2292,504,732,-293,-851],[1909,2292,521,722,-302,-840],[2432,2292,519,656,-304,-767],[2953,2292,656,443,-459,-530],[3611,2292,470,490,-267,-542],[0,3050,645,464,-239,-553],[647,3050,662,548,-228,-647],[1311,3050,519,698,-223,-813],[1832,3050,452,733,-216,-851],[2286,3050,443,736,-215,-855],[2731,3050,456,733,-209,-851],[3189,3050,481,710,-226,-826],[0,3788,511,655,-205,-765],[513,3788,560,563,-201,-663],[1075,3788,568,473,-196,-563],[1645,3788,533,448,-200,-535],[2180,3788,426,445,-190,-531],[2608,3788,712,442,-497,-528],[0,4445,777,444,-565,-530],[779,4445,743,446,-533,-533],[1524,4445,721,448,-514,-535],[2247,4445,701,449,-496,-536],[2950,4445,675,466,-486,-555],[0,4913,657,472,-481,-562],[659,4913,654,471,-481,-560]]},"lightning":{"size":[4050,3735],"scale":0.56,"frames":[[0,0,288,319,-254,-566],[290,0,295,324,-266,-576],[587,0,310,339,-297,-600],[899,0,315,348,-333,-630],[1216,0,337,357,-369,-656],[1555,0,379,364,-432,-675],[1936,0,427,362,-514,-687],[2365,0,462,366,-578,-691],[2829,0,467,379,-589,-684],[3298,0,417,519,-475,-889],[3717,0,333,598,-311,-999],[0,600,345,601,-326,-999],[347,600,414,389,-333,-613],[763,600,389,400,-363,-567],[1154,600,732,627,-685,-999],[1888,600,773,703,-704,-999],[2663,600,806,785,-760,-999],[0,1387,806,799,-760,-999],[808,1387,806,789,-760,-999],[1616,1387,806,781,-760,-974],[2424,1387,806,806,-760,-999],[3232,1387,806,806,-760,-999],[0,2195,806,802,-760,-991],[808,2195,806,796,-760,-980],[1616,2195,806,774,-760,-942],[2424,2195,806,743,-760,-885],[3232,2195,806,755,-760,-907],[0,2999,806,730,-760,-862],[808,2999,806,718,-760,-841],[1616,2999,806,734,-760,-869],[2424,2999,806,701,-760,-810]]},"smoke":{"size":[3860,2369],"scale":0.66,"frames":[[0,0,340,376,-254,-566],[342,0,339,376,-254,-566],[683,0,350,374,-271,-568],[1035,0,395,401,-339,-575],[1432,0,407,419,-320,-584],[1841,0,463,432,-352,-590],[2306,0,385,447,-186,-601],[2693,0,556,461,-403,-598],[3251,0,294,428,-287,-580],[3547,0,313,449,-265,-587],[0,463,817,566,-590,-737],[819,463,877,603,-655,-770],[1698,463,688,654,-716,-804],[2388,463,942,677,-754,-826],[0,1142,855,661,-621,-837],[857,1142,326,393,-248,-580],[1185,1142,827,567,-604,-845],[2014,1142,812,593,-576,-859],[2828,1142,809,595,-565,-857],[0,1805,714,562,-542,-827],[716,1805,688,440,-526,-645]]},"salv":{"size":[3915,3886],"scale":0.7,"frames":[[0,0,353,402,-245,-572],[355,0,335,416,-225,-586],[692,0,322,427,-206,-604],[1016,0,358,435,-235,-625],[1376,0,440,430,-357,-629],[1818,0,558,426,-474,-617],[2378,0,603,408,-510,-591],[2983,0,601,402,-491,-583],[0,437,553,387,-418,-561],[555,437,411,372,-305,-537],[968,437,393,382,-268,-555],[1363,437,416,435,-242,-629],[1781,437,501,471,-267,-670],[2284,437,606,524,-328,-732],[2892,437,661,531,-340,-720],[0,970,680,541,-292,-735],[682,970,536,442,-213,-591],[1220,970,556,417,-184,-555],[1778,970,595,402,-195,-533],[2375,970,605,415,-184,-551],[2982,970,510,430,-110,-573],[3494,970,421,440,-45,-586],[0,1513,426,468,-39,-624],[428,1513,453,509,-67,-684],[883,1513,500,569,-159,-770],[1385,1513,530,573,-235,-794],[1917,1513,597,564,-339,-747],[2516,1513,678,640,-465,-809],[3196,1513,624,547,-347,-673],[0,2155,554,524,-333,-641],[556,2155,545,482,-319,-581],[1103,2155,555,439,-329,-519],[1660,2155,542,470,-324,-563],[2204,2155,448,495,-325,-584],[2654,2155,413,532,-315,-636],[3069,2155,424,551,-345,-666],[3495,2155,397,566,-337,-693],[0,2723,371,579,-328,-706],[373,2723,401,578,-328,-704],[776,2723,426,575,-325,-691],[1204,2723,456,569,-337,-681],[1662,2723,478,569,-338,-681],[2142,2723,500,573,-347,-687],[2644,2723,500,576,-340,-691],[3146,2723,487,578,-318,-694],[0,3304,465,579,-290,-696],[467,3304,443,580,-259,-696],[912,3304,423,580,-238,-696],[1337,3304,419,578,-238,-695]]}};
const patAtlas = {};
for (const [name, data] of Object.entries(PATRICIA_ATLAS_DATA))
    patAtlas[name] = { img: new Image(), frames: data.frames, scale: data.scale };
let patAssetsRequested = false;
function loadPatriciaAssets() {
    if (patAssetsRequested) return;
    patAssetsRequested = true;
    for (const [name, a] of Object.entries(patAtlas)) {
        const img = a.img;
        img.src = `assets/characters/patricia/atlas/pat-${name}.webp?v=9420`;
        img.decode?.().then(() => {
            if (window.createImageBitmap) createImageBitmap(img).then(bmp => { a.bmp = bmp; }).catch(() => {});
        }).catch(() => {});
    }
}
const PAT_SCALE = 0.66;               // = the atlas scale, so she is never resampled
const PAT_STAND_OFF = 215, PAT_CHASE_SPEED = 130;   // V9.41: her legs were moving faster than she travelled   // V9.36: slower (was 140)
// V9.34: her clips were generated separately, so she was a different size in each. These multipliers (measured head-to-feet against the idle clip) make her the same size in every move.
const PAT_PACK_K = { walk: .885, combo: 1.23 };   // V9.41: combo art is smaller in its picture; 1.23 makes her the same height as in every other move
const PAT_SIZE_K = 1.0;   // V9.39: full size again (shrinking her blurred her)
// V9.36: feet. How far (in source px) each grounded clip's feet sit below the idle pose's feet; the clip is shifted up/down by that so she never floats.
const PAT_FOOT_SRC = { walk: 5, combo: -50, salv: 0 };
const PAT_STAGE2_MS = 2700;   // the half-health pause
const PAT_HP = 300, PAT_STAGE2_HP = 150;
const PAT_FLOOR_SHIFT = 105;   // V9.31: Patricia's arena floor is lower than the Level 1 arena, so both fighters were floating; everything is drawn this far lower there
const PAT_OLLY_SCALE = 0.95;   // V9.30: Olly was too big next to her
// V9.31: Patricia's clips are 24 fps video (41.7 ms per source frame). The V9.25 timings below assumed ~31 fps (some moves 2x), so every move played far too fast.
// Every number here is now source-frames x 41.7 ms, so she moves exactly as in the clips.
const PAT_WALK_FRAME_MS = 78, PAT_IDLE_FRAME_MS = 83;   // V9.39: the walk/idle atlases hold (nearly) every video frame now; walk is ~2x slower than the video on purpose
const PAT_LUNGE_WINDUP_FRAMES = 37, PAT_LUNGE_WINDUP_MS = 1500, PAT_LUNGE_STRIKE_FRAMES = 24, PAT_LUNGE_FRAME_MS = 48, PAT_LUNGE_HIT_AT_MS = 290;
const PAT_LUNGE_DAMAGE = 12, PAT_LUNGE_RANGE = 360, PAT_LUNGE_PUSH = 36;
const PAT_COMBO_WINDUP_MS = 950, PAT_COMBO_FRAME_MS = 41.67, PAT_COMBO_FRAMES = 61, PAT_COMBO_HITS_AT_MS = [664, 1328, 2325];
const PAT_COMBO_DAMAGE = 8, PAT_COMBO_RANGE = 330, PAT_COMBO_PUSH = 26;
const PAT_SMOKE_FRAME_MS = 125, PAT_SMOKE_FRAMES = 21, PAT_SMOKE_GONE_AT_MS = 1120, PAT_SMOKE_REAPPEAR_AT_MS = 2100;
const PAT_VSTRIKE_APPEAR_MS = 280, PAT_VSTRIKE_DAMAGE = 15;
const PAT_LIGHT_WINDUP_FRAMES = 14, PAT_LIGHT_WINDUP_MS = 720, PAT_LIGHT_FRAMES = 9, PAT_LIGHT_FRAME_MS = 167;
const PAT_LIGHT_DAMAGE = 25, PAT_LIGHT_RANGE = 560;
// V9.34: the lightning clip ends with her floating, so the discharge frames now loop for a while, then she settles back down (windup frames played in reverse).
const PAT_LIGHT_LOOP_MS = 900, PAT_LIGHT_LOOP_FRAME_MS = 50, PAT_LIGHT_SETTLE_MS = 300, PAT_LIGHT_HIT_WINDOW_MS = 620;
// V9.41: her four hurt reactions are the jumps in the 'Salvagable?' clip (atlas 'salv' = source frames 4-52). [first, last] indexes into that atlas.
// PAT_HURT_DY = how far (source px) each piece's first frame sits below the standing line, so every reaction starts with her feet on the floor.
const PAT_HURT_SEGS = [[0, 10], [11, 21], [22, 34], [35, 48]], PAT_HURT_DY = [1, -9, 42, 119], PAT_HURT_FRAME_MS = 48, PAT_HURT_GRUNTS = ['grunt-4', 'grunt-7', 'grunt-3', 'grunt-8'];
const PAT_DEFEAT_HOLD_MS = 450;   // no death animation any more: she freezes for a beat, then the death cutscene plays
const PAT_PATTERN_1 = ['lunge', 'combo', 'vanish', 'combo', 'lunge'];
const PAT_PATTERN_2 = ['combo', 'lightning', 'vanish', 'lunge', 'combo', 'lightning', 'vanish'];
const chainAtlas = {};
for (const [name, data] of Object.entries(CHAIN_ATLAS_DATA)) {
    chainAtlas[name] = { img: new Image(), frames: data.frames, scale: data.scale, bx: data.bx };
}
zombieSprites.shambler.src = 'assets/characters/zombie-goth.webp?v=300';
zombieSprites.chain.src = 'assets/characters/chain-goth-clean.webp?v=6513';

/* V9.18: combat art is loaded in the background once the player reaches the map (or at the start of a fight),
   not while the title screen is loading. Keeps first load fast and Safari happy. */
let combatAssetsRequested = false;
function loadCombatAssets() {
    if (combatAssetsRequested) return;
    combatAssetsRequested = true;
    ollyCombatSprites.idle.src = 'assets/characters/combat/olly-idle.webp?v=6513';
    ollyCombatSprites.dodge.forEach((img, i) => img.src = `assets/characters/combat/olly-dodge-${i+1}.webp?v=6513`);
    ollyCombatSprites.jump.forEach((img, i) => img.src = `assets/characters/combat/olly-jump-${i+1}.webp?v=6513`);
    ollyCombatSprites.heavy.forEach((img, i) => img.src = `assets/characters/combat/olly-heavy-${i+1}.webp?v=6511`);
    ollyCombatSprites.punch.forEach((img, i) => img.src = `assets/characters/combat/olly-punch-${i+1}.webp?v=6511`);
    ollyReactionSprites.hurt.forEach((img, i) => img.src = `assets/characters/combat/olly-hurt-${i + 1}.webp?v=8110`);
    ollyReactionSprites.ko.forEach((img, i) => img.src = `assets/characters/combat/olly-ko-${i + 1}.webp?v=8110`);
    zombieCombatFrames.idle[0].src = 'assets/characters/combat/zombie-ready-crouch.webp?v=8111';
    zombieCombatFrames.walk.forEach((img, i) => img.src = `assets/characters/combat/zombie-walk-${i + 1}.webp?v=7600`);
    zombieCombatFrames.claw.forEach((img, i) => img.src = `assets/characters/combat/zombie-claw-${i + 1}.webp?v=8600`);
    zombieCombatFrames.heavyKick.forEach((img, i) => img.src = `assets/characters/combat/zombie-ankle-biter-${String(i + 1).padStart(2, '0')}.webp?v=10100`);
    zombieCombatFrames.hurt.forEach((img, i) => img.src = `assets/characters/combat/zombie-v2/hurt-${String(i + 1).padStart(3, '0')}.webp?v=9420`);
    zombieCombatFrames.death.forEach((img, i) => img.src = `assets/characters/combat/zombie-v2/death-${String(i + 1).padStart(3, '0')}.webp?v=9240`);
    zombieCombatFrames.intro2.forEach((img, i) => img.src = `assets/characters/combat/zombie-v2/intro2-${String(i + 1).padStart(3, '0')}.webp?v=9420`);
    zombieCombatFrames.prep.forEach((img, i) => img.src = `assets/characters/combat/zombie-v2/intro-${String(i + 1).padStart(3, '0')}.webp?v=9240`);
    zombieCountdownFrames[3].src = 'assets/characters/combat/zombie-countdown-3.webp?v=8600';
    zombieCountdownFrames[2].src = 'assets/characters/combat/zombie-countdown-2.webp?v=8600';
    zombieCountdownFrames[1].src = 'assets/characters/combat/zombie-countdown-1.webp?v=8600';
    zombieCountdownFrames.fight.src = 'assets/characters/combat/zombie-countdown-fight.webp?v=8600';
    for (const [name, a] of Object.entries(chainAtlas)) {
        const img = a.img;
        img.src = `assets/characters/combat/chain-goth/chain-${name}.webp?v=9420`;
        // Decode the big sheets in the background so the first time she uses a move there is no hitch (Safari decodes lazily).
        img.decode?.().then(() => {
            try { const t = document.createElement('canvas'); t.width = t.height = 1; t.getContext('2d').drawImage(img, 0, 0, 1, 1); } catch (e) {}
            // V9.20: keep the decoded sheet as an ImageBitmap so Safari cannot throw the decoded pixels away and
            // re-decode them mid-fight (that showed up as random hitching/freezing during her chain moves).
            if (window.createImageBitmap) createImageBitmap(img).then(bmp => { a.bmp = bmp; }).catch(() => {});
        }).catch(() => {});
    }
}
const CHAIN_RENDER_SCALE = 0.64;         // size in the arena (original pixels -> screen pixels)
const CHAIN_WIDTH_STRETCH = 1.05;         // she is drawn 5% wider than the art (set to 1 for the original proportions)
const CHAIN_INTRO_SCALE = 0.64;          // 3-2-1 pose is drawn at full fighting size (no grow-in)
const CHAIN_FLOOR_Y = 535;               // same floor line Olly and the Zombie stand on
// Intro: 14 build-up frames, then a 15-frame chain-twirl loop that repeats until FIGHT.
const CHAIN_INTRO_PRE_COUNT = 28, CHAIN_INTRO_PRE_MS = 60, CHAIN_INTRO_LOOP_COUNT = 32, CHAIN_INTRO_LOOP_MS = 51;   // each loop is about one countdown beat (1.5s)
const CHAIN_INTRO_GROW_MS = 500;         // she eases from the intro size to her normal fighting size at the very end of the countdown
const CHAIN_WALK_FRAME_MS = 56;   // V9.24: 15-frame walk loop
// Swipe pack: frames 0-5 = wind-up (chain lifts behind her), frames 6-11 = the low sweep.
const CHAIN_SWIPE_WINDUP_COUNT = 10, CHAIN_SWIPE_WINDUP_MS = 520;
const CHAIN_SWIPE_STRIKE_FIRST = 10;
const CHAIN_SWIPE_STRIKE_MS = [34, 34, 34, 34, 34, 34, 34, 34, 34, 34];   // ten frames, fast and fluid
const CHAIN_SWIPE_TOTAL_MS = CHAIN_SWIPE_STRIKE_MS.reduce((a, b) => a + b, 0);
const CHAIN_SWIPE_HIT_AT_MS = 136;       // the moment the mace sweeps across the floor in front of her
const CHAIN_SWIPE_DAMAGE = 10, CHAIN_SWIPE_RANGE = 300, CHAIN_SWIPE_PUSH = 34;
const CHAIN_STAND_OFF = 250;             // how far from Olly she likes to stand
const CHAIN_CHASE_SPEED = 170;           // quicker than the Zombie Goth (135)
const CHAIN_RECOVER_MS = 520;
// Death is a simple topple + fade until the dedicated death art is added.
// V9.24 Chain SLAM (replaces the old spin): she winds the chain overhead and slams it down TWICE.
// Slam 1 is only a warning (no damage). Slam 2 sends a wave of sparks across the floor in the direction she is facing.
// Jump over HER (land behind her) or stay in the air and it misses; stand in front of her on the ground and it hits.
const CHAIN_SLAM_MS = 24;                  // ms per source-video frame (the video is 24 fps; this plays it ~15% faster)
const CHAIN_SLAM_START_VF = 37;            // first kept video frame
const CHAIN_SLAM_LEAD_MS = 520;   // V9.37: she raises the chain for this long while the ring flashes twice; then the animation starts
const CHAIN_SLAM_WARN_AT_MS = CHAIN_SLAM_LEAD_MS + (64 - 37) * CHAIN_SLAM_MS;     // slam 1: shockwave toward Olly
const CHAIN_SLAM_HIT_AT_MS = CHAIN_SLAM_LEAD_MS + (97 - 37) * CHAIN_SLAM_MS;      // slam 2: shockwave the OTHER way
const CHAIN_SLAM_TOTAL_MS = CHAIN_SLAM_LEAD_MS + (118 - 37) * CHAIN_SLAM_MS;
const CHAIN_SLAM_CLOSE_TO = 230, CHAIN_SLAM_GLIDE = 230;     // she closes to about a jump away while winding up
const CHAIN_WAVE_REACH = 780, CHAIN_WAVE_GROW_MS = 150, CHAIN_WAVE_MS = 460;
const CHAIN_SLAM_DAMAGE = 15, CHAIN_SLAM_PUSH = 40;
// Stun is EARNED: three hits in a row (a Heavy Attack counts as two) leave her dizzy, and Olly gets his punches back to punish it.
const CHAIN_STUN_HITS = 3, CHAIN_STUN_HIT_WINDOW_MS = 5500;   // V9.31: 5.5 s to land the hits (was 4 s) = easier to stun
const CHAIN_STUN_FRAME_MS = 41,   // V9.31: stun lasts ~25% longer (2.5 s, was 2 s)
     CHAIN_STUN_FRAME_COUNT = 61, CHAIN_STUN_MS = CHAIN_STUN_FRAME_MS * CHAIN_STUN_FRAME_COUNT;
// Hurt reaction: she doubles over and straightens up. A normal punch plays the first 46 frames, a Heavy Attack plays all 61 frames more slowly.
const CHAIN_HURT_NORMAL_FRAMES = 46, CHAIN_HURT_NORMAL_MS = 1150, CHAIN_HURT_HEAVY_FRAMES = 61, CHAIN_HURT_HEAVY_MS = 1900;
const CHAIN_PATTERN = ['swipe', 'swipe', 'slam'];
// Frames where the mace touches the floor: [x, y] of the contact point, in animator pixels relative to her feet (negative x = toward Olly; measured from where the chain lies on the floor in your frames).
// A little cream spark burst is drawn on those frames so the chain feels like it really hits the ground.
const CHAIN_CONTACTS = {
    intro: { 23: [265, -32], 28: [-268, -34], 30: [270, -32], 35: [-262, -34], 37: [262, -34], 43: [-268, -34], 45: [270, -30], 51: [-272, -34], 53: [285, -30], 59: [-272, -34] },
    swipe: { 14: [-325, -30] }
};
const CHAIN_SPARK_MS = 230;
const CHAIN_DEATH_FRAME_MS = 70, CHAIN_DEATH_FALL_MS = 60 * 70, CHAIN_DEATH_HOLD_MS = 1500, CHAIN_DEATH_SCALE = 0.78;   // V9.41: slower (was real video speed) and drawn smaller   // V9.39: new 61-frame death (ChainGothDeathNew) at real video speed;   // V9.34: new death (ChainGothDeath3): 22 hit-and-fall frames + the floor frame;   // V9.24: 18 hit-and-fall frames, then she lies still before fading

let chainLastGood = null;
function drawChainAtlasFrame(c, pack, index, x, floorY, face, renderScale = CHAIN_RENDER_SCALE, alpha = 1, rotation = 0, offsetX = 0) {
    // Never let her vanish: a bad index is clamped, and if an atlas is not ready we show the last frame that did draw.
    let usePack = pack, useIndex = index;
    const n = usePack?.frames?.length || 0;
    if (n) useIndex = Number.isFinite(useIndex) ? Math.max(0, Math.min(n - 1, Math.floor(useIndex))) : 0;
    if (!usePack?.img || !usePack.img.complete || !usePack.img.naturalWidth || !usePack.frames?.[useIndex]) {
        if (!chainLastGood) return;
        usePack = chainLastGood.pack; useIndex = chainLastGood.index;
    } else chainLastGood = { pack: usePack, index: useIndex };
    pack = usePack; index = useIndex;
    const img = pack.bmp || pack.img;   // decoded ImageBitmap once ready
    const f = pack.frames[index];
    const rs = renderScale;
    const k = rs / pack.scale;          // 1 when drawn at the pack's own size = no resampling = crisp
    const snap = Math.abs(k - 1) < 0.001;
    c.save();
    c.globalAlpha = alpha;
    c.translate(Math.round(x + offsetX), floorY);
    if (rotation)
        c.rotate(rotation);
    c.scale((face === 'left' ? 1 : -1) * CHAIN_WIDTH_STRETCH, 1);   // art is authored facing left
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    if (snap)
        c.drawImage(img, f[0], f[1], f[2], f[3], Math.round(f[4] * rs), Math.round(f[5] * rs), f[2], f[3]);
    else
        c.drawImage(img, f[0], f[1], f[2], f[3], f[4] * rs, f[5] * rs, f[2] * k, f[3] * k);
    c.restore();
}

/* v6.0: a complete Level 1 rebuild.
   The background is a clean, character-free cemetery illustration.
   All gameplay characters and interactive markers are drawn independently.
   Walkability is handled by explicit collision rectangles, not by a tile grid.
*/
/* V9.23: walkability is now baked from the Level 1 map art itself.
   The cobblestone path was picked out of assets/environment/level1-map-bg.webp by colour, cleaned up, and stored as a
   384x256 grid (one cell = 4x4 map pixels). 1 = path (walkable), 0 = gardens, trees, graves, buildings, fences and the gate.
   Each row is run-length encoded: the numbers alternate "blocked run, walkable run, blocked run, ..." starting with blocked.
   To SEE it in the game, open the game with ?walk=1 on the end of the web address (a green tint shows where Olly can walk). */
const WALK_CELL = 4, WALK_COLS = 384, WALK_ROWS = 256;
const WALK_RLE = '384|384|384|384|384|384|384|384|384|384|314,1,69|308,8,68|307,10,67|305,13,66|303,16,3,6,56|287,1,7,2,4,17,3,8,55|286,32,3,9,54|286,32,2,12,52|287,48,49|288,22,3,24,47|208,4,77,20,5,11,2,11,46|204,9,5,2,69,20,5,10,4,11,45|203,10,5,3,69,19,5,9,6,10,45|201,13,3,4,69,19,5,8,8,9,45|200,22,68,19,5,7,12,4,47|200,23,67,19,4,7,64|200,26,64,20,3,6,65|118,4,79,26,63,28,66|117,6,79,26,62,27,67|116,7,11,2,67,25,63,26,67|115,9,5,8,66,29,60,24,68|115,22,66,30,4,2,53,24,68|115,23,65,37,52,23,69|115,23,66,37,51,21,71|116,22,72,31,51,18,74|116,6,4,12,74,29,51,17,75|116,5,6,11,79,23,52,16,76|117,3,7,12,78,19,57,15,76|128,11,79,17,58,14,77|128,11,79,17,58,13,78|129,1,3,6,80,15,59,13,78|133,6,80,14,60,13,78|133,7,80,13,60,13,78|133,7,81,12,60,14,77|133,8,81,11,59,16,76|134,13,5,3,67,11,59,16,76|135,23,64,11,58,17,76|136,24,4,1,57,11,58,16,77|137,29,57,12,56,16,77|137,30,57,13,54,16,77|138,29,57,17,50,16,77|141,26,57,19,48,16,77|141,25,59,19,46,17,77|142,23,60,20,44,18,77|142,19,64,19,44,19,77|142,19,64,18,41,23,77|142,19,65,16,41,24,77|142,19,65,14,43,24,77|142,19,65,12,45,23,78|143,19,64,12,46,21,79|144,22,60,12,48,19,79|145,25,56,12,49,18,79|146,25,55,12,49,18,79|146,25,54,13,49,18,79|146,25,54,13,49,18,79|146,25,54,13,49,19,78|146,26,52,14,49,19,78|145,28,49,16,49,20,77|145,29,44,20,49,20,77|144,31,40,23,48,21,77|144,32,37,25,48,22,76|144,32,37,25,48,25,73|143,34,35,26,35,39,72|143,36,33,26,31,44,71|142,38,30,28,29,47,70|142,39,28,30,26,49,70|141,42,25,32,24,50,70|141,48,17,36,14,58,70|141,174,69|140,176,68|140,177,67|126,191,29,1,37|125,192,28,3,36|124,193,24,12,31|124,91,3,100,15,21,30|124,91,4,65,6,31,8,35,20|86,3,35,41,2,48,4,62,11,73,19|53,7,24,6,34,40,4,47,5,59,15,72,18|34,6,6,17,6,22,33,40,4,39,3,4,6,59,17,70,18|33,58,33,40,4,37,7,1,7,59,18,69,18|32,60,31,40,6,35,16,59,18,69,18|32,59,32,40,6,33,19,57,20,67,19|33,57,33,40,6,20,9,3,21,54,23,57,5,3,20|33,40,12,3,34,40,8,12,3,2,37,51,25,53,31|34,38,50,40,8,9,47,45,30,50,33|38,32,52,40,9,7,50,43,31,48,34|39,30,53,40,9,6,52,41,33,46,35|39,27,56,39,11,3,55,40,34,29,2,14,35|39,25,58,39,69,39,36,28,3,12,36|39,24,59,39,69,38,38,26,4,12,36|39,23,61,38,70,37,38,26,4,12,36|39,22,68,31,71,37,38,26,4,12,36|40,20,69,30,72,37,39,25,5,10,37|40,19,71,28,73,4,3,31,38,25,5,10,37|40,18,72,28,74,2,5,30,38,24,6,10,37|40,18,73,27,81,30,37,25,6,13,34|40,18,73,27,81,30,37,25,6,13,34|40,18,73,26,82,30,37,25,6,14,33|40,18,73,26,82,30,37,25,7,13,33|40,18,73,25,83,31,36,24,8,13,33|40,18,73,24,84,31,35,8,6,10,10,12,33|40,18,73,23,84,32,35,8,27,11,33|39,20,72,22,85,33,34,7,28,11,33|39,20,71,23,84,35,33,7,28,11,33|39,21,70,23,84,38,29,8,28,15,29|38,22,70,23,84,75,26,18,28|37,24,69,22,86,74,25,7,5,7,28|37,25,31,6,31,22,89,71,24,8,5,7,28|28,7,2,25,27,11,30,22,90,72,22,8,5,7,28|25,11,2,24,24,16,28,22,91,72,21,8,5,7,28|18,18,2,25,21,19,27,21,92,72,22,7,5,7,28|17,18,3,29,15,23,24,22,92,72,25,4,6,7,27|17,17,5,29,13,25,21,24,92,70,28,3,6,7,27|17,16,7,111,92,68,30,2,7,8,26|16,16,9,110,93,66,40,9,25|13,19,9,110,93,66,40,9,25|12,10,2,8,9,110,93,66,41,8,25|11,10,3,8,9,110,93,66,41,9,24|10,11,4,8,8,110,92,67,41,9,24|10,11,4,9,6,111,92,67,41,9,24|10,11,4,126,92,67,41,11,22|10,10,5,126,92,67,14,4,22,13,21|10,10,6,125,91,69,12,6,21,13,21|11,9,6,126,90,19,2,13,4,32,10,8,19,13,22|11,8,7,128,86,21,3,11,8,3,6,21,6,12,18,12,23|11,8,8,34,5,89,24,10,49,23,33,37,18,12,23|12,7,8,33,7,89,20,14,46,25,35,36,16,12,24|12,7,8,31,14,1,5,33,3,42,17,18,43,27,35,6,3,28,5,22,24|12,6,9,30,24,14,4,12,3,47,9,22,37,32,35,6,3,54,25|12,6,10,28,26,8,11,10,4,78,14,11,8,34,37,4,4,52,27|13,5,10,27,28,7,13,7,5,80,4,61,38,2,6,50,28|13,4,12,18,37,6,16,3,6,144,47,48,30|13,4,12,14,42,4,27,142,48,47,31|14,2,14,1,4,7,75,141,49,44,33|123,135,49,43,34|125,133,49,43,34|125,133,49,42,35|126,132,49,41,36|127,131,50,39,37|129,56,5,68,51,8,3,27,37|130,55,5,68,55,3,5,26,37|130,55,5,68,63,26,37|131,54,6,67,63,26,37|131,53,8,66,63,26,37|131,51,11,66,62,26,37|69,1,61,50,13,66,61,26,37|68,3,4,15,41,47,18,21,2,7,2,33,60,26,37|67,24,41,23,3,19,23,17,2,7,3,32,60,26,37|67,24,41,23,4,17,25,15,4,5,4,32,61,25,37|68,23,41,23,4,12,34,11,4,4,6,32,60,25,37|69,22,41,23,5,6,3,1,41,5,4,4,7,32,59,26,36|69,22,41,23,6,4,47,3,6,2,8,32,59,27,35|69,22,40,23,78,33,56,28,35|69,22,40,23,79,35,53,29,34|68,24,39,23,79,43,45,30,33|68,25,38,22,81,43,43,32,32|67,27,37,22,81,44,4,10,27,37,28|68,26,37,14,3,5,81,59,25,39,27|69,27,34,14,5,3,83,59,24,39,27|70,27,33,14,92,59,23,39,27|70,37,23,14,93,1,3,55,22,39,27|71,38,21,13,99,55,20,41,26|71,39,21,12,100,55,17,43,26|71,39,21,12,100,57,7,16,6,30,25|72,42,17,12,101,78,8,30,24|72,43,16,12,101,77,10,30,23|72,43,15,13,101,76,11,31,22|72,43,15,12,102,75,13,11,4,15,22|72,43,15,12,102,74,14,10,6,14,22|73,42,15,12,102,74,14,9,8,12,23|74,41,15,11,102,75,14,9,8,11,24|74,41,15,10,102,76,14,9,9,10,24|75,40,14,10,102,77,14,8,10,9,25|76,39,13,10,103,70,2,4,15,7,12,8,25|78,37,12,10,105,68,4,2,15,7,14,7,25|79,58,106,67,21,6,16,6,25|80,57,107,66,21,5,18,6,24|82,55,108,65,22,3,20,5,24|87,8,3,38,110,63,47,3,25|88,7,4,36,112,57,80|89,5,5,35,114,55,81|90,3,6,34,116,54,81|99,34,117,52,82|99,34,118,50,83|99,34,119,49,83|99,34,120,47,84|100,33,122,45,84|106,26,129,38,85|107,25,130,37,85|107,25,131,36,85|107,25,134,32,86|108,24,136,30,86|108,24,136,30,86|109,22,138,29,86|109,22,140,27,86|109,22,141,26,86|109,22,142,2,4,19,86|109,22,148,19,86|110,20,149,20,85|111,19,150,19,85|111,18,151,19,85|111,18,152,18,85|111,18,152,19,84|111,18,153,17,85|111,18,154,16,85|110,19,157,13,85|110,19,157,13,85|110,19,157,14,84|110,19,158,13,84|110,20,157,14,83|110,20,157,15,82|110,20,157,15,82|110,20,157,16,81|110,20,142,31,81|110,20,142,32,80|109,21,51,6,7,1,77,33,79|109,22,46,22,73,43,12,30,27|109,22,45,25,71,86,26|108,23,44,27,18,138,26|107,24,43,31,14,139,26|107,23,43,42,4,139,26|107,23,43,185,26|106,24,44,184,26|106,24,45,182,27|105,25,47,126,3,51,27|105,26,47,125,5,49,27|103,29,51,32,4,84,10,32,5,6,28|75,8,17,41,45,3,4,2,5,2,3,3,4,2,5,84,11,31,6,5,28|67,3,4,68,64,1,13,60,6,12,17,30,7,4,28|66,76,144,12,17,29,9,1,30|66,76,144,11,19,28,40|67,39,1,35,144,11,20,27,40|68,37,3,34,144,10,24,23,41|68,36,4,34,145,4,31,17,45|69,33,7,33,188,1,53|70,1,4,2,4,2,3,3,4,2,4,2,9,31,243|87,2,22,30,243|118,22,244|119,19,246|120,17,247|120,17,247|121,16,247|121,16,247|121,16,247|121,16,247|384';
const WALK = (() => {
    const g = new Uint8Array(WALK_COLS * WALK_ROWS);
    WALK_RLE.split('|').forEach((row, gy) => {
        let gx = 0, v = 0;
        row.split(',').forEach(n => { n = +n; if (v) g.fill(1, gy * WALK_COLS + gx, gy * WALK_COLS + gx + n); gx += n; v ^= 1; });
    });
    return g;
})();
const WALK_DEBUG = /[?&]walk(=|&|$)/.test(typeof location !== 'undefined' ? location.search : '');
function walkAt(px, py) {
    const gx = Math.floor(px / WALK_CELL), gy = Math.floor(py / WALK_CELL);
    return gx >= 0 && gy >= 0 && gx < WALK_COLS && gy < WALK_ROWS && WALK[gy * WALK_COLS + gx] === 1;
}
function blockedWorld(px, py, r=0) {
    // Olly's feet must be on the path, and so must a point 8px to each side (so his body never overlaps a hedge).
    if (px < 36 || py < 36 || px > WORLD_W - 36 || py > WORLD_H - 36)
        return true;
    return !(walkAt(px, py) && walkAt(px - 8, py) && walkAt(px + 8, py));
}
// If a saved game (made with the old, worse collision) leaves Olly standing somewhere blocked, move him to the nearest path.
function nearestWalkable(px, py) {
    if (!blockedWorld(px, py)) return { x: px, y: py };
    for (let r = 6; r <= 300; r += 6) {
        for (let a = 0; a < 24; a++) {
            const nx = px + Math.cos(a * Math.PI / 12) * r, ny = py + Math.sin(a * Math.PI / 12) * r;
            if (!blockedWorld(nx, ny)) return { x: nx, y: ny };
        }
    }
    return { x: 240, y: 372 };
}
let walkDebugCanvas = null;
function drawWalkDebug(ctx) {
    if (!walkDebugCanvas) {
        walkDebugCanvas = document.createElement('canvas');
        walkDebugCanvas.width = WALK_COLS; walkDebugCanvas.height = WALK_ROWS;
        const c = walkDebugCanvas.getContext('2d'), img = c.createImageData(WALK_COLS, WALK_ROWS);
        for (let gy = 0; gy < WALK_ROWS; gy++) for (let gx = 0; gx < WALK_COLS; gx++) {
            const i = (gy * WALK_COLS + gx) * 4, ok = !blockedWorld(gx * WALK_CELL + 2, gy * WALK_CELL + 2);
            img.data[i] = ok ? 0 : 255; img.data[i + 1] = ok ? 255 : 0; img.data[i + 2] = ok ? 90 : 60; img.data[i + 3] = ok ? 80 : 70;
        }
        c.putImageData(img, 0, 0);
    }
    ctx.save(); ctx.imageSmoothingEnabled = false;
    ctx.drawImage(walkDebugCanvas, 0, 0, WORLD_W, WORLD_H);
    ctx.restore();
}

function drawOlly(ctx, x, y, s=.78, t=0, front=true, dir='right', moving=false, mapDir='down') {
    ctx.save();
    const bob = moving ? Math.sin(t * 18) * 1.5 : Math.sin(t * 2) * .35;
    ctx.translate(x, y - bob);
    ctx.fillStyle = SH(.34);
    ctx.beginPath();
    ctx.ellipse(0, 38 * s, 23 * s, 6 * s, 0, 0, Math.PI * 2);
    ctx.fill();

    let img = ollySprite;
    let flipX = false;

    // v7.9: use the last selected map direction even when Olly is no longer
    // moving. This creates the requested sticky facing pose for short taps.
    if (mapDir === 'up') img = ollyMapWalkSprites.back;
    else if (mapDir === 'down') img = ollyMapWalkSprites.front;
    else if (mapDir === 'left') img = ollyMapWalkSprites.left;
    else if (mapDir === 'right') img = ollyMapWalkSprites.right;

    if (img.complete && img.naturalWidth && img.naturalHeight) {
        const h = 144 * s;
        const w = h * (img.naturalWidth / img.naturalHeight);
        ctx.save();
        if (flipX) ctx.scale(-1, 1);
        ctx.drawImage(img, -w / 2, -114 * s, w, h);
        ctx.restore();
    } else if (ollySprite.complete && ollySprite.naturalWidth && ollySprite.naturalHeight) {
        const h = 144 * s;
        const w = h * (ollySprite.naturalWidth / ollySprite.naturalHeight);
        ctx.save();
        ctx.scale(dir === 'right' ? -1 : 1, 1);
        ctx.drawImage(ollySprite, -w / 2, -114 * s, w, h);
        ctx.restore();
    }
    ctx.restore();
}
function drawZombieSprite(ctx, x, y, type, s=.68, t=0, attack=false, face='left') {
    const img = zombieSprites[type] || zombieSprites.shambler;
    ctx.save();
    ctx.translate(x, y + Math.sin(t * 7) * 1.5);
    ctx.fillStyle = SH(.34);
    ctx.beginPath();
    ctx.ellipse(0, 40 * s, 28 * s, 7 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    if (img.complete && img.naturalWidth) {
        const w = 108 * s,
            h = 162 * s;
        ctx.save();
        ctx.scale(face === 'right' ? -1 : 1, 1);
        ctx.drawImage(img, -w / 2, -132 * s, w, h);
        ctx.restore();
    }
    if (attack) {
        ctx.strokeStyle = type === 'chain' ? '#cfb7a5' : '#ef91ac';
        ctx.lineWidth = 3 * s;
        ctx.beginPath();
        ctx.arc(0, -6 * s, 40 * s, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

export function createLevel1(ui) {
    setTimeout(loadCombatAssets, 2500);   // start fetching fight art in the background once the level opens
    const ctx = ui.canvas.getContext('2d'),
        cctx = ui.combatCanvas.getContext('2d'),
        rctx = ui.relationshipCanvas.getContext('2d');
    const GRID = 32,
        COLS = 48,
        ROWS = 32;
    const revealed = Array.from({
        length: ROWS
    }, () => Array(COLS).fill(false));
    // v6.5.17: exploration fog is made from separate soft cloud patches.
    // The map itself is never covered by one giant sheet. Each patch can be
    // cleared independently as Olly explores it.
    const fogCanvas = document.createElement('canvas');
    fogCanvas.width = WORLD_W;
    fogCanvas.height = WORLD_H;
    const fogCtx = fogCanvas.getContext('2d');

    const mistCanvas = document.createElement('canvas');
    mistCanvas.width = Math.floor(WORLD_W / 3);
    mistCanvas.height = Math.floor(WORLD_H / 3);
    const mistCtx = mistCanvas.getContext('2d');

    const FOG_REVEAL_RADIUS = 128;
    const FOG_START_RADIUS = 225;
    const FOG_DENSITY = .84;   // V9.27: slightly thinner, mauve-tinted fog (was a hard white-grey)
    const FOG_PATH_WIDTH = 104;
    let lastFogRevealX = null,
        lastFogRevealY = null;

    // Deliberately mixed placement: some patches hide objectives/gate, while
    // others are just atmospheric so the player cannot infer what matters.
    const FOG_PATCHES = [
        // Dense objective-adjacent patches, deliberately mixed with decoys.
        { x: 475, y: 420, rx: 175, ry: 125, a: .88, seed: .2 },
        { x: 390, y: 555, rx: 125, ry: 95, a: .58, seed: .9 },
        { x: 760, y: 300, rx: 180, ry: 130, a: .90, seed: 1.7 },
        { x: 875, y: 250, rx: 120, ry: 88, a: .48, seed: 2.4 },
        { x: 360, y: 800, rx: 175, ry: 125, a: .90, seed: 3.1 },
        { x: 470, y: 735, rx: 120, ry: 90, a: .52, seed: 3.8 },
        { x: 1115, y: 505, rx: 200, ry: 145, a: .94, seed: 4.5 },
        { x: 1215, y: 420, rx: 125, ry: 92, a: .55, seed: 5.2 },
        { x: 1380, y: 820, rx: 175, ry: 130, a: .96, seed: 5.9 },
        { x: 1245, y: 705, rx: 135, ry: 98, a: .62, seed: 6.6 },
        // Decoy patches throughout the middle so fog does not reveal the objectives.
        { x: 180, y: 230, rx: 115, ry: 82, a: .44, seed: 18.4 },
        { x: 330, y: 180, rx: 150, ry: 95, a: .62, seed: 19.1 },
        { x: 570, y: 155, rx: 105, ry: 78, a: .48, seed: 19.8 },
        { x: 690, y: 515, rx: 135, ry: 100, a: .64, seed: 20.5 },
        { x: 820, y: 610, rx: 165, ry: 110, a: .72, seed: 21.2 },
        { x: 1010, y: 650, rx: 120, ry: 90, a: .48, seed: 21.9 },
        { x: 1170, y: 580, rx: 155, ry: 110, a: .70, seed: 22.6 },
        { x: 1320, y: 300, rx: 135, ry: 100, a: .55, seed: 23.3 },
        { x: 1460, y: 250, rx: 95, ry: 75, a: .40, seed: 24.0 },
        { x: 140, y: 650, rx: 125, ry: 95, a: .52, seed: 24.7 },
        { x: 520, y: 900, rx: 145, ry: 100, a: .66, seed: 25.4 },
        { x: 700, y: 820, rx: 110, ry: 85, a: .46, seed: 26.1 },
        { x: 900, y: 900, rx: 150, ry: 100, a: .62, seed: 26.8 },
        { x: 1080, y: 820, rx: 125, ry: 92, a: .50, seed: 27.5 },
        { x: 1260, y: 930, rx: 145, ry: 90, a: .58, seed: 28.2 },
        // v6.5.23: additional broad banks increase the feeling of a fog-filled
        // cemetery without turning the map into one continuous white sheet.
        // These deliberately overlap existing patches so the fog reads as
        // connected drifting banks rather than isolated clouds.
        { x: 250, y: 350, rx: 185, ry: 120, a: .56, seed: 40.1 },
        { x: 525, y: 330, rx: 170, ry: 125, a: .66, seed: 40.8 },
        { x: 735, y: 410, rx: 190, ry: 135, a: .58, seed: 41.5 },
        { x: 970, y: 365, rx: 185, ry: 125, a: .62, seed: 42.2 },
        { x: 1260, y: 360, rx: 175, ry: 120, a: .52, seed: 42.9 },
        { x: 250, y: 610, rx: 180, ry: 125, a: .60, seed: 43.6 },
        { x: 525, y: 610, rx: 190, ry: 130, a: .48, seed: 44.3 },
        { x: 760, y: 575, rx: 175, ry: 125, a: .68, seed: 45.0 },
        { x: 985, y: 590, rx: 195, ry: 135, a: .54, seed: 45.7 },
        { x: 1260, y: 620, rx: 185, ry: 125, a: .64, seed: 46.4 },
        { x: 330, y: 875, rx: 175, ry: 110, a: .50, seed: 47.1 },
        { x: 650, y: 875, rx: 185, ry: 115, a: .62, seed: 47.8 },
        { x: 930, y: 850, rx: 190, ry: 120, a: .50, seed: 48.5 },
        { x: 1180, y: 875, rx: 180, ry: 115, a: .60, seed: 49.2 },
        { x: 1430, y: 600, rx: 125, ry: 105, a: .42, seed: 49.9 },
        { x: 90, y: 520, rx: 120, ry: 105, a: .42, seed: 50.6 },
        { x: 1020, y: 90, rx: 165, ry: 90, a: .40, seed: 51.3, edge: true },
        { x: 680, y: 980, rx: 145, ry: 72, a: .20, seed: 52.0, edge: true },
        { x: 1180, y: 225, rx: 175, ry: 110, a: .72, seed: 8.0 },
        { x: 620, y: 680, rx: 135, ry: 100, a: .60, seed: 8.7 },
        { x: 900, y: 700, rx: 165, ry: 120, a: .78, seed: 9.4 },
        { x: 1030, y: 850, rx: 140, ry: 100, a: .56, seed: 10.1 },
        { x: 600, y: 470, rx: 100, ry: 75, a: .42, seed: 10.8 },
        { x: 190, y: 520, rx: 125, ry: 92, a: .50, seed: 11.5 },
        { x: 1320, y: 560, rx: 145, ry: 105, a: .64, seed: 12.2 },
        // v6.5.28: additional layered banks for denser, more atmospheric coverage.
        { x: 160, y: 360, rx: 150, ry: 92, a: .46, seed: 60.1 },
        { x: 430, y: 280, rx: 135, ry: 88, a: .58, seed: 60.8 },
        { x: 585, y: 430, rx: 155, ry: 105, a: .74, seed: 61.5 },
        { x: 820, y: 250, rx: 150, ry: 95, a: .50, seed: 62.2 },
        { x: 1060, y: 255, rx: 145, ry: 92, a: .70, seed: 62.9 },
        { x: 1380, y: 355, rx: 150, ry: 96, a: .56, seed: 63.6 },
        { x: 1450, y: 540, rx: 120, ry: 100, a: .62, seed: 64.3 },
        { x: 250, y: 705, rx: 155, ry: 108, a: .64, seed: 65.0 },
        { x: 505, y: 760, rx: 145, ry: 112, a: .52, seed: 65.7 },
        { x: 780, y: 740, rx: 175, ry: 118, a: .72, seed: 66.4 },
        { x: 1040, y: 735, rx: 155, ry: 108, a: .56, seed: 67.1 },
        { x: 1260, y: 760, rx: 175, ry: 115, a: .68, seed: 67.8 },
        { x: 150, y: 900, rx: 125, ry: 88, a: .42, seed: 68.5 },
        { x: 420, y: 940, rx: 155, ry: 90, a: .48, seed: 69.2 },
        { x: 760, y: 920, rx: 150, ry: 92, a: .54, seed: 69.9 },
        { x: 1085, y: 955, rx: 175, ry: 94, a: .50, seed: 70.6 },
        { x: 1370, y: 890, rx: 155, ry: 100, a: .58, seed: 71.3 },
        // Edge patches stay thin because these areas can never be cleared.
        { x: 45, y: 220, rx: 90, ry: 72, a: .22, seed: 29.0, edge: true },
        { x: 60, y: 430, rx: 100, ry: 78, a: .20, seed: 29.7, edge: true },
        { x: 55, y: 690, rx: 105, ry: 82, a: .22, seed: 30.4, edge: true },
        { x: 1490, y: 430, rx: 100, ry: 78, a: .20, seed: 31.1, edge: true },
        { x: 1485, y: 700, rx: 95, ry: 75, a: .22, seed: 31.8, edge: true },
        { x: 500, y: 45, rx: 105, ry: 70, a: .22, seed: 32.5, edge: true },
        { x: 850, y: 45, rx: 115, ry: 72, a: .20, seed: 33.2, edge: true },
        { x: 1180, y: 45, rx: 120, ry: 75, a: .22, seed: 33.9, edge: true },
        { x: 500, y: 980, rx: 110, ry: 72, a: .20, seed: 34.6, edge: true },
        { x: 850, y: 980, rx: 120, ry: 75, a: .22, seed: 35.3, edge: true },
        { x: 1180, y: 980, rx: 125, ry: 78, a: .20, seed: 36.0, edge: true }
    ];

    // v6.5.21: each fog patch is a broad, overlapping cloud bank rather than
    // a collection of isolated white blobs.  A patch fades away as soon as
    // Olly touches it, revealing the whole patch rather than only the pixels
    // directly underneath him.
    const fogPatchFade = FOG_PATCHES.map(() => 0);
    const fogPatchClearing = FOG_PATCHES.map(() => null);
    const fogPatchApplied = FOG_PATCHES.map(() => 0);
    const FOG_CLEAR_MS = 1500;
    const FOG_PARTING_MS = 760;
    const fogPartingBursts = [];

    function paintFogPatches() {
        fogCtx.clearRect(0, 0, WORLD_W, WORLD_H);
        fogCtx.save();
        fogCtx.filter = 'blur(15px)';
        for (let i = 0; i < FOG_PATCHES.length; i++) {
            const patch = FOG_PATCHES[i];
            fogCtx.filter = `blur(${16 + (i % 4) * 4}px)`;
            const fade = fogPatchFade[i] || 0;
            if (fade >= .999)
                continue;

            const alphaScale = (1 - fade) * FOG_DENSITY;
            const spread = 1 + fade * .10;

            // A soft base cloud makes each patch feel continuous.
            const baseRx = patch.rx * .72 * spread;
            const baseRy = patch.ry * .58 * spread;
            const base = fogCtx.createRadialGradient(
                patch.x, patch.y, 0,
                patch.x, patch.y, Math.max(baseRx, baseRy)
            );
            const baseA = Math.min(.64, patch.a * (.48 + ((Math.sin(patch.seed * 2.7) + 1) * .10))) * alphaScale;
            base.addColorStop(0, `rgba(176,150,178,${baseA})`);
            base.addColorStop(.55, `rgba(160,136,166,${baseA * .72})`);
            base.addColorStop(1, 'rgba(140,116,150,0)');
            fogCtx.fillStyle = base;
            fogCtx.beginPath();
            fogCtx.ellipse(patch.x, patch.y, baseRx, baseRy, Math.sin(patch.seed) * .18, 0, Math.PI * 2);
            fogCtx.fill();

            // Larger overlapping wisps create one cloud bank with an uneven
            // edge, rather than a neat oval.
            const puffCount = patch.edge ? 6 : 11;
            for (let j = 0; j < puffCount; j++) {
                const a = patch.seed + j * 1.37;
                const ox = Math.sin(a * 1.91) * .43;
                const oy = Math.cos(a * 1.37) * .32;
                const scale = .78 + (Math.sin(a * 2.17) + 1) * .16;
                const px = patch.x + patch.rx * ox;
                const py = patch.y + patch.ry * oy;
                const rx = patch.rx * (.42 + (j % 3) * .035) * scale * spread;
                const ry = patch.ry * (.30 + (j % 2) * .055) * scale * spread;
                const g = fogCtx.createRadialGradient(px, py, 0, px, py, rx);
                const alpha = Math.min(.90, patch.a * (0.48 + (Math.sin(a * 1.3) + 1) * .23)) * alphaScale;
                g.addColorStop(0, `rgba(186,160,188,${alpha})`);
                g.addColorStop(.48, `rgba(166,142,172,${alpha * .72})`);
                g.addColorStop(1, 'rgba(140,116,150,0)');
                fogCtx.fillStyle = g;
                fogCtx.beginPath();
                fogCtx.ellipse(px, py, rx, ry, Math.sin(a) * .22, 0, Math.PI * 2);
                fogCtx.fill();
            }
        }
        fogCtx.restore();
    }

    function reapplyRevealedAreas() {
        // Every cleared patch gets its own persistent soft reveal mask. This
        // is important: rebuilding the fog must never repaint a patch that
        // Olly has already discovered.
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.filter = 'blur(3px)';
        for (let row = 0; row < ROWS; row++) {
            for (let col = 0; col < COLS; col++) {
                if (!revealed[row][col])
                    continue;
                const cx = col * GRID + GRID / 2;
                const cy = row * GRID + GRID / 2;
                const g = fogCtx.createRadialGradient(cx, cy, GRID * .22, cx, cy, GRID * 1.02);
                g.addColorStop(0, 'rgba(0,0,0,1)');
                g.addColorStop(.80, 'rgba(0,0,0,.98)');
                g.addColorStop(1, 'rgba(0,0,0,0)');
                fogCtx.fillStyle = g;
                fogCtx.beginPath();
                fogCtx.arc(cx, cy, GRID * 1.02, 0, Math.PI * 2);
                fogCtx.fill();
            }
        }
        fogCtx.restore();

        // A patch that has begun clearing remains spatially cleared while its
        // opacity animates down. The reveal radius expands with the fade, so
        // no portion can mysteriously return when Olly walks away.
        for (let i = 0; i < FOG_PATCHES.length; i++) {
            const fade = fogPatchFade[i] || 0;
            if (fade <= 0 && fogPatchClearing[i] === null)
                continue;
            const p = FOG_PATCHES[i];
            const expansion = .58 + fade * .62;
            fogCtx.save();
            fogCtx.globalCompositeOperation = 'destination-out';
            fogCtx.filter = 'blur(8px)';
            const rx = p.rx * expansion;
            const ry = p.ry * expansion;
            const g = fogCtx.createRadialGradient(p.x, p.y, Math.min(rx, ry) * .18, p.x, p.y, Math.max(rx, ry));
            const strength = Math.min(1, .42 + fade * .90);
            g.addColorStop(0, `rgba(0,0,0,${strength})`);
            g.addColorStop(.72, `rgba(0,0,0,${strength * .88})`);
            g.addColorStop(1, 'rgba(0,0,0,0)');
            fogCtx.fillStyle = g;
            fogCtx.beginPath();
            fogCtx.ellipse(p.x, p.y, rx, ry, Math.sin(p.seed) * .18, 0, Math.PI * 2);
            fogCtx.fill();
            fogCtx.restore();
        }
    }

    function eraseFogPatchProgress(p, delta) {
        if (delta <= 0) return;
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.filter = 'blur(8px)';
        const rx = p.rx * 1.16;
        const ry = p.ry * 1.16;
        const g = fogCtx.createRadialGradient(p.x, p.y, Math.min(rx, ry) * .16, p.x, p.y, Math.max(rx, ry));
        const strength = Math.min(1, delta * 1.35);
        g.addColorStop(0, `rgba(0,0,0,${strength})`);
        g.addColorStop(.66, `rgba(0,0,0,${strength * .92})`);
        g.addColorStop(1, 'rgba(0,0,0,0)');
        fogCtx.fillStyle = g;
        fogCtx.beginPath();
        fogCtx.ellipse(p.x, p.y, rx, ry, Math.sin(p.seed) * .18, 0, Math.PI * 2);
        fogCtx.fill();
        fogCtx.restore();
    }

    function beginFogPatchClear(index, t) {
        if (fogPatchClearing[index] !== null || fogPatchFade[index] >= .999) return;
        fogPatchClearing[index] = t;
        fogPartingBursts.push({ x, y, start: t });
        ui.dialogue.textContent = '🌫️ The fog parts around you...';
    }

    function updateFogPatchClears(t) {
        for (let i = 0; i < FOG_PATCHES.length; i++) {
            if (fogPatchClearing[i] === null) continue;
            const progress = Math.max(0, Math.min(1, (t - fogPatchClearing[i]) / FOG_CLEAR_MS));
            const eased = 1 - Math.pow(1 - progress, 2.2);
            const delta = eased - fogPatchApplied[i];
            if (delta > 0) {
                eraseFogPatchProgress(FOG_PATCHES[i], delta);
                fogPatchApplied[i] = eased;
                fogPatchFade[i] = eased;
            }
            if (progress >= 1) {
                fogPatchFade[i] = 1;
                fogPatchApplied[i] = 1;
                fogPatchClearing[i] = null;
            }
        }
    }

    function rebuildFog() {
        paintFogPatches();
        reapplyRevealedAreas();
    }

    rebuildFog();

    function markFogCells(px, py, radius) {
        const minCol = Math.max(0, Math.floor((px - radius - 32) / GRID));
        const maxCol = Math.min(COLS - 1, Math.floor((px + radius + 32) / GRID));
        const minRow = Math.max(0, Math.floor((py - radius - 32) / GRID));
        const maxRow = Math.min(ROWS - 1, Math.floor((py + radius + 32) / GRID));
        for (let row = minRow; row <= maxRow; row++) {
            for (let col = minCol; col <= maxCol; col++) {
                const cx = col * GRID + GRID / 2,
                    cy = row * GRID + GRID / 2;
                if (Math.hypot(cx - px, cy - py) <= radius + GRID * .35)
                    revealed[row][col] = true;
            }
        }
    }

    function eraseFogCircle(px, py, radius) {
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out';
        const grad = fogCtx.createRadialGradient(px, py, radius * .12, px, py, radius);
        grad.addColorStop(0, 'rgba(0,0,0,1)');
        grad.addColorStop(.70, 'rgba(0,0,0,.98)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        fogCtx.fillStyle = grad;
        fogCtx.beginPath();
        fogCtx.arc(px, py, radius, 0, Math.PI * 2);
        fogCtx.fill();
        fogCtx.restore();
    }

    function eraseFogPath(x1, y1, x2, y2) {
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.lineCap = 'round';
        fogCtx.lineWidth = FOG_PATH_WIDTH;
        fogCtx.globalAlpha = .98;
        fogCtx.beginPath();
        fogCtx.moveTo(x1, y1);
        fogCtx.lineTo(x2, y2);
        fogCtx.stroke();
        fogCtx.restore();
    }

    function revealTouchedFogPatches(px, py) {
        // Only clear the fog bank Olly actually touches. Overlapping banks
        // are visual neighbours, not one giant reveal group. Cascading the
        // reveal through overlapping patches made a single step clear most
        // of the map at once.
        const touched = new Set();
        for (let i = 0; i < FOG_PATCHES.length; i++) {
            const p = FOG_PATCHES[i];
            if (fogPatchFade[i] >= .999) continue;
            const touchRx = p.rx * (p.edge ? 1.04 : 1.08);
            const touchRy = p.ry * (p.edge ? 1.04 : 1.08);
            const dx = (px - p.x) / touchRx;
            const dy = (py - p.y) / touchRy;
            if (dx * dx + dy * dy <= 1) touched.add(i);
        }
        const nowT = gnow();
        touched.forEach(i => beginFogPatchClear(i, nowT));
    }

    function revealAround(px, py, force=false) {
        if (!force && lastFogRevealX !== null) {
            const dist = Math.hypot(px - lastFogRevealX, py - lastFogRevealY);
            if (dist < 14)
                return;
            eraseFogPath(lastFogRevealX, lastFogRevealY, px, py);
            markFogCells(px, py, FOG_REVEAL_RADIUS);
        } else {
            eraseFogCircle(px, py, FOG_START_RADIUS);
            markFogCells(px, py, FOG_START_RADIUS);
        }
        eraseFogCircle(px, py, FOG_REVEAL_RADIUS);
        revealTouchedFogPatches(px, py);
        lastFogRevealX = px;
        lastFogRevealY = py;
    }

    function updateFogParting(t) {
        if (!fogPartingBursts.length)
            return;
        fogCtx.save();
        fogCtx.globalCompositeOperation = 'destination-out';
        fogCtx.filter = 'blur(5px)';
        for (let i = fogPartingBursts.length - 1; i >= 0; i--) {
            const b = fogPartingBursts[i];
            const p = Math.max(0, Math.min(1, (t - b.start) / FOG_PARTING_MS));
            const eased = 1 - Math.pow(1 - p, 2.4);
            const radius = 52 + eased * 145;
            const g = fogCtx.createRadialGradient(b.x, b.y, radius * .45, b.x, b.y, radius);
            g.addColorStop(0, 'rgba(0,0,0,1)');
            g.addColorStop(.68, 'rgba(0,0,0,.96)');
            g.addColorStop(1, 'rgba(0,0,0,0)');
            fogCtx.fillStyle = g;
            fogCtx.beginPath();
            fogCtx.arc(b.x, b.y, radius, 0, Math.PI * 2);
            fogCtx.fill();
            if (p >= 1)
                fogPartingBursts.splice(i, 1);
        }
        fogCtx.restore();
    }

    function drawAnimatedMist(t) {
        const w = mistCanvas.width,
            h = mistCanvas.height,
            sx = w / WORLD_W,
            sy = h / WORLD_H;
        mistCtx.clearRect(0, 0, w, h);
        mistCtx.save();
        mistCtx.scale(sx, sy);
        mistCtx.filter = 'blur(3.5px)';

        for (let i = 0; i < FOG_PATCHES.length; i++) {
            const p = FOG_PATCHES[i];
            if ((fogPatchFade[i] || 0) >= .999)
                continue;
            const driftX = Math.sin(t / (3600 + i * 145) + p.seed) * (p.edge ? 7 : 14);
            const driftY = Math.cos(t / (4300 + i * 120) + p.seed) * (p.edge ? 4 : 7);
            const px = p.x + driftX;
            const py = p.y + driftY;

            // A faint moving veil underneath the visible wisps.
            const rx = p.rx * .46;
            const ry = p.ry * .30;
            const g = mistCtx.createRadialGradient(px, py, 0, px, py, rx);
            const alpha = p.edge ? .035 : .055 + p.a * .085;
            g.addColorStop(0, `rgba(236,214,234,${alpha})`);
            g.addColorStop(.62, `rgba(214,190,214,${alpha * .55})`);
            g.addColorStop(1, 'rgba(190,164,194,0)');
            mistCtx.fillStyle = g;
            mistCtx.beginPath();
            mistCtx.ellipse(px, py, rx, ry, Math.sin(p.seed) * .2, 0, Math.PI * 2);
            mistCtx.fill();

            // Long, slow S-shaped wisps. They deliberately overlap so they
            // read as one drifting bank of cemetery mist, not random strokes.
            const wispCount = p.edge ? 1 : (i % 3 === 0 ? 3 : 2);
            for (let j = 0; j < wispCount; j++) {
                const phase = t / (2500 + j * 500 + i * 43) + p.seed * .8 + j * 1.9;
                const span = p.rx * (.62 + (j % 2) * .16);
                const yBase = py + (j - (wispCount - 1) / 2) * p.ry * .17;
                const wave = Math.sin(phase) * p.ry * .09;
                const drift = Math.cos(phase * .71) * p.rx * .11;
                mistCtx.beginPath();
                mistCtx.moveTo(px - span, yBase + wave);
                mistCtx.bezierCurveTo(
                    px - span * .72, yBase - p.ry * .15 + wave,
                    px - span * .35, yBase + p.ry * .13 - wave,
                    px - span * .04, yBase + drift
                );
                mistCtx.bezierCurveTo(
                    px + span * .30, yBase - p.ry * .13 + drift,
                    px + span * .63, yBase + p.ry * .12 - wave,
                    px + span, yBase + wave * .35
                );
                mistCtx.strokeStyle = `rgba(240,218,238,${p.edge ? .08 : .17 + p.a * .065})`;
                mistCtx.lineWidth = p.edge ? 3.5 : 4.5 + (j % 2) * 1.5;
                mistCtx.lineCap = 'round';
                mistCtx.stroke();
            }
        }
        mistCtx.restore();

        // Only show animated mist where the actual fog still exists.
        mistCtx.save();
        mistCtx.globalCompositeOperation = 'destination-in';
        mistCtx.drawImage(fogCanvas, 0, 0, mistCanvas.width, mistCanvas.height);
        mistCtx.restore();
        ctx.save();
        ctx.globalAlpha = .55;
        ctx.drawImage(mistCanvas, 0, 0, WORLD_W, WORLD_H);
        ctx.restore();
    }

    const enemies = [
    {
        x: 604,
        y: 244,
        type: 'shambler',
        name: 'ZOMBIE GOTH',
        hp: 50,
        maxHp: 50,
        dead: false,
        pattern: 'Scratch • Lunge'
    },
    {
        x: 1004,
        y: 444,
        type: 'chain',
        name: 'CHAIN GOTH',
        hp: 100,
        maxHp: 100,
        dead: false,
        pattern: 'Whip • Chain Slam'
    }
    ];
    // V9.27: both markers moved out of the bushes onto open path (checked against the walk grid).
    const relationshipChallenge = {
            x: 332,
            y: 652
        },
        princessQuestion = {
            x: 1232,
            y: 64
        },
        boss = {
            x: 1380,
            y: 820
        },
        key = {
            x: 732,
            y: 576
        };
    const MAX_HP = 100;
    const COMBAT_W = 1440,
        COMBAT_H = 810,
        COMBAT_GROUND_Y = 470;
    const combatBackgroundImage = new Image();
    combatBackgroundImage.src = 'assets/environment/combat-background-level1.webp';
    const patriciaArenaImage = new Image();
    patriciaArenaImage.src = 'assets/arenas/patricia-arena.webp?v=9420';   // V9.30: Patricia's own arena

    // v6.5.16e: start just below the upper-left church, close to Zombie Goth.
    let x = 240,
        y = 372,
        cameraX = 240,
        cameraY = 372 - CAM_LEAD_Y,
        hp = 100,
        maxHp = 100,
        mode = 'map',
        walkDir = 'right',
        facingDir = 'right',
        mapDir = 'right',
        walkPulse = 0,
        kills = 0,
        relationshipDone = false,
        puzzleSolved = false,
        keyCollected = false,
        gateOpened = false,
        heavyUnlocked = false,
        heavyCdMul = 1,   // V9.42: chest reward can lower this
        keySpawnAnnounced = false,
        inventory = {},
        checkpoint = 'cemetery-entrance',
        target = null,
        isBoss = false,
        combatHp = 0,
        combatMax = 1,
        enemyAttackPhase = null,
        enemyTimer = null,
        zombieCombatX = COMBAT_W - 320,
        zombieCombatState = 'chase',
        zombieCombatStateStart = 0,
        zombieCombatAttackType = 'claw',
        zombieAttackCycle = 0,
        zombieCombatAttackHit = false,
        zombieCombatNextDecision = 0,
        zombieRecoveryDuration = 520,
        zombieCombatWalkIndex = 0,
        zombieBiteCaughtAt = 0,
        lastDodgeStart = -1e9,
        lastJumpStart = -1e9,
        zombieBiteEvaded = false,
        zombieBiteHoldUntil = 0,
        zombieBiteHoldX = 0,
        zombieCombatPrevX = COMBAT_W - 320,
        zombieHitStaggerUntil = 0,
        zombieHitReactionStart = 0,
        zombieHitDirection = 1,
        zombieHitStrength = 0,
        zombieHitFlashUntil = 0,
        zombieDeathStarted = false,
        zombieDeathEndAt = 0,
        playerHurtUntil = 0,
        playerHurtStart = 0,
        playerHurtDirection = 1,
        zombieHitLong = false,
        zombieIntroActive = false,
        zombieIntroStart = 0,
        zombieIntroEndAt = 0,
        playerDeathTriggered = false,
        combatRaf = 0,
        combatCheckpoint = null,
        bossRoomEntered = false,
        relationshipStep = 0,
        relationshipRound = 0,
        relationshipStart = 0,
        relationshipDuration = 2600,
        relationshipAnimating = false,
        relationshipRAF = 0,
        comboCount = 0,
        attackCooldownUntil = 0,
        heavyAttackCooldownUntil = 0,
        lastAttackAt = 0,
        attackAnimUntil = 0,
        heavyAttackAnimUntil = 0,
        heavyLungeStartX = 0,
        heavyLungeTargetX = 0,
        heavyStrikeApplied = false,
        jumpT = 0,
        jumping = false,
        jumpOffset = 0,
        dodgeUntil = 0,
        combatLastFrame = 0,
        combatFacing = 'right',
        combatAnimationState = 'idle',
        combatAnimationStart = 0,
        combatAnimationUntil = 0,
        combatDodgeDirection = -1,
        player = {
            x: 270,
            y: COMBAT_H / 2,
            invuln: 0,
            aimX: 0,
            aimY: 0
        };
    let now = 0,
        raf = 0,
        lastMoveTime = 0;
    const held = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    function setMoveKey(key, down) {
        const k = (key || '').toLowerCase();
        if (mode !== 'map' && mode !== 'combat')
            return;

        // v7.9: map facing is sticky. A tap changes Olly's map pose and that
        // pose remains visible until another direction is pressed. This makes
        // short taps readable instead of snapping immediately back to a default.
        if (mode === 'map' && down) {
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
        if (mode !== 'map') return;
        const speed = 240;
        let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);
        let dy = (held.down ? 1 : 0) - (held.up ? 1 : 0);
        if (!dx && !dy) { walkPulse = 0; return; }
        const len = Math.hypot(dx, dy) || 1;
        const moveX = dx / len * speed * dt;
        const moveY = dy / len * speed * dt;
        const distance = Math.hypot(moveX, moveY);
        const steps = Math.max(1, Math.ceil(distance / 6));
        const stepX = moveX / steps, stepY = moveY / steps;
        const canStand = (nx, ny) => {
            if (blockedWorld(nx, ny, 0)) return false;
            if (Math.hypot(nx - boss.x, ny - boss.y) < 24 && !unlockedBoss()) return false;
            return true;
        };
        let moved = false;
        for (let i = 0; i < steps; i++) {
            const nx = x + stepX, ny = y + stepY;
            if (canStand(nx, ny)) { x = nx; y = ny; moved = true; }
            else {
                if (canStand(nx, y)) { x = nx; moved = true; }
                if (canStand(x, ny)) { y = ny; moved = true; }
            }
        }
        if (moved) {
            revealAround(x, y);
            walkPulse = 1;
            // Directional appearance is controlled by setMoveKey(), so short
            // taps remain visible as a sticky pose. Keep movement direction
            // separate from the visual facing state.
            ui.dialogue.textContent = 'The cemetery is strangely peaceful. Somewhere nearby, a goth is probably plotting.';
        }
    }

    const W2C = (gx, gy) => ({
        x: gx,
        y: gy
    });
    function reveal() { revealAround(x, y, true); }
    function objectivesComplete() {
        return kills >= 2 && relationshipDone && puzzleSolved
    }
    function unlockedBoss() {
        return objectivesComplete() && keyCollected && gateOpened
    }
    function refreshInventoryUI() {
        initInventoryItems();
        const items = [];
        if (inventory && inventory.key) items.push('key');
        if (inventory && inventory.potion) items.push('potion');
        const count = items.length;
        const countText = `${count}/10`;
        const countEl = document.getElementById('inventory-count');
        const largeCountEl = document.getElementById('inventory-count-large');
        if (countEl) countEl.textContent = countText;
        if (largeCountEl) largeCountEl.textContent = `${count} / 10 ITEMS`;
        const sig = items.join(',');
        const slots = document.querySelectorAll('#inventory .inventory-slot');
        if (slots.length && sig !== invSig) {
            invSig = sig;
            slots.forEach((slot, i) => {
                const item = items[i];
                if (item) {
                    const info = ITEM_INFO[item];
                    slot.innerHTML = `<img class="inv-item-img" src="${info.img}?v=9420" alt="${info.name}" draggable="false"><span>${info.label}</span>`;
                    slot.dataset.item = item;
                    slot.dataset.tip = info.tip;
                    slot.classList.add('inventory-filled');
                } else {
                    slot.textContent = String(i + 1).padStart(2, '0');
                    delete slot.dataset.item;
                    delete slot.dataset.tip;
                    slot.classList.remove('inventory-filled');
                }
            });
            if (selectedItem && !items.includes(selectedItem)) hideItemPanel();
        }
        const emptyCopy = document.querySelector('#inventory .inventory-empty-copy');
        if (emptyCopy) emptyCopy.textContent = count ? 'Click an item to see what you can do with it.' : 'Nothing in here yet. A suspiciously empty bag.';
        if (!count) hideItemPanel();
    }

    // ---- V9.21 inventory items: hover text + click for actions (the key has a USE button) ----
    function gateNearPlayer() {
        return Math.hypot(x - 1380, y - 875) < 170;   // the path in front of the gate
    }
    function ensureItemPanel() {
        let panel = document.getElementById('inventory-item-panel');
        if (panel) return panel;
        const box = document.querySelector('#inventory .inventory-box');
        if (!box) return null;
        panel = document.createElement('div');
        panel.id = 'inventory-item-panel';
        panel.className = 'hidden';
        panel.innerHTML = '<div class="inv-panel-name"></div><div class="inv-panel-desc"></div><div class="inv-panel-actions"></div><div class="inv-panel-note"></div>';
        const closeBtn = box.querySelector('#inventory-close');
        box.insertBefore(panel, closeBtn || null);
        return panel;
    }
    function hideItemPanel() {
        selectedItem = null;
        const panel = document.getElementById('inventory-item-panel');
        if (panel) panel.classList.add('hidden');
    }
    function showItemPanel(item) {
        const panel = ensureItemPanel();
        const info = ITEM_INFO[item];
        if (!panel || !info) return;
        selectedItem = item;
        panel.querySelector('.inv-panel-name').textContent = info.name;
        panel.querySelector('.inv-panel-desc').textContent = info.desc;
        panel.querySelector('.inv-panel-note').textContent = '';
        const actions = panel.querySelector('.inv-panel-actions');
        actions.innerHTML = '';
        const addBtn = (label, fn, cls) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'primary inv-use-button' + (cls ? ' ' + cls : '');
            b.textContent = label;
            b.addEventListener('click', fn);
            actions.appendChild(b);
        };
        if (item === 'key') addBtn('USE', useKeyFromBag);
        if (item === 'potion') {
            addBtn('DRINK', () => potionChoice(true));
            addBtn('SAVE FOR LATER', () => potionChoice(false), 'inv-secondary');
        }
        panel.classList.remove('hidden');
    }
    function useKeyFromBag() {
        const note = document.querySelector('#inventory-item-panel .inv-panel-note');
        if (!keyCollected || gateOpened || mode !== 'map') { if (note) note.textContent = 'Nothing to use it on right now.'; return; }
        if (!gateNearPlayer()) { if (note) note.textContent = 'You need to be standing in front of the gate to use this.'; return; }
        // Close the bag and start the gate cutscene.
        ui.inventory?.classList.add('hidden');
        ui.inventory?.setAttribute('aria-hidden', 'true');
        hideItemPanel();
        hideInvTip();
        playCutscene2();
    }
    function hideInvTip() { if (invTipEl) invTipEl.style.display = 'none'; }
    function initInventoryItems() {
        const inv = document.getElementById('inventory');
        if (!inv || inv.dataset.itemsReady) return;
        inv.dataset.itemsReady = '1';
        invTipEl = document.createElement('div');
        invTipEl.id = 'inventory-tooltip';
        document.body.appendChild(invTipEl);
        const slotsBox = inv.querySelector('.inventory-slots');
        if (!slotsBox) return;
        slotsBox.addEventListener('mouseover', e => {
            const slot = e.target.closest('.inventory-slot');
            if (!slot || !slot.dataset.tip) { hideInvTip(); return; }
            invTipEl.textContent = slot.dataset.tip;
            invTipEl.style.display = 'block';
            const r = slot.getBoundingClientRect();
            const tw = invTipEl.offsetWidth;
            invTipEl.style.left = Math.max(8, Math.min(window.innerWidth - tw - 8, r.left + r.width / 2 - tw / 2)) + 'px';
            invTipEl.style.top = Math.max(8, r.top - invTipEl.offsetHeight - 8) + 'px';
        });
        slotsBox.addEventListener('mouseleave', hideInvTip);
        slotsBox.addEventListener('click', e => {
            const slot = e.target.closest('.inventory-slot');
            if (slot && slot.dataset.item) showItemPanel(slot.dataset.item);
        });
        // Whenever the bag closes (button, Y, or Use) reset the panel and tooltip.
        new MutationObserver(() => { if (inv.classList.contains('hidden')) { hideItemPanel(); hideInvTip(); } })
            .observe(inv, { attributes: true, attributeFilter: ['class'] });
    }

    function stats() {
        hp = Math.max(0, Math.min(maxHp, hp));
        ui.hpEl.textContent = `${hp} / ${maxHp} HP`;
        if (ui.hpFill)
            ui.hpFill.style.width = (hp / maxHp * 100) + '%';
        ui.gothEl.textContent = `${kills}/2`;
        ui.relEl.textContent = relationshipDone ? 'Solved' : 'Locked';
        ui.puzzleEl.textContent = puzzleSolved ? 'Answered' : 'Locked';
        refreshInventoryUI();
        if (objectivesComplete() && !keyCollected && !keySpawnAnnounced) {
            keySpawnAnnounced = true;
            ui.dialogue.textContent = '🔑 A golden key has appeared somewhere in the cemetery. Find it.';
        }
    }

    function drawMarker(ctx, img, px, py, w=68, h=68, label='', t=0) {
        ctx.save();
        const bob = Math.sin(t * 4.8) * 4.5;
        ctx.translate(0, -bob);
        ctx.globalAlpha = .98;
        ctx.shadowColor = 'rgba(255,146,195,.55)';
        ctx.shadowBlur = 14;
        if (img.complete && img.naturalWidth)
            {   // V9.27: keep the picture's own proportions (it used to be squashed into a square)
                const k = Math.min(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
                ctx.drawImage(img, px - dw / 2, py - dh / 2, dw, dh);
            }
        else {
            ctx.fillStyle = '#d9699d';
            ctx.beginPath();
            ctx.arc(px, py, 26, 0, Math.PI * 2);
            ctx.fill()
        }
        if (label) {
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#fff3f8';
            ctx.font = '700 16px Georgia';
            ctx.textAlign = 'center';
            ctx.fillText(label, px, py + h / 2 + 20)
        }
        ctx.restore();
    }
    function drawWorld(t, dt = 1 / 60) {
        const vw = ui.canvas.clientWidth || 1000,
            vh = ui.canvas.clientHeight || 600;
        {   // V9.30: draw the map at the real screen resolution
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const hi = !(window.ggPrefs && window.ggPrefs.hiRes === false);
            const wantW = hi ? Math.max(1536, Math.round(vw * dpr)) : 1536, wantH = hi ? Math.max(1024, Math.round(vh * dpr)) : 1024;
            if (ui.canvas.width !== wantW || ui.canvas.height !== wantH) { ui.canvas.width = wantW; ui.canvas.height = wantH; }
            ctx.imageSmoothingEnabled = !(window.ggPrefs && window.ggPrefs.crispMap); ctx.imageSmoothingQuality = 'high';
        }
        const sx = ui.canvas.width / vw,
            sy = ui.canvas.height / vh;
        ctx.clearRect(0, 0, ui.canvas.width, ui.canvas.height);
        ctx.save();
        ctx.scale(sx, sy);
        const zoom = MAP_ZOOM;
        const playerX = x,
            playerY = y,
            viewW = vw / zoom,
            viewH = vh / zoom;
        const targetCamX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, playerX)),
            targetCamY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, playerY - CAM_LEAD_Y));
        // Frame-rate independent camera smoothing keeps the pan consistent
        // even when Safari drops a frame.
        const camBlend = 1 - Math.exp(-10 * Math.min(dt, .05));
        cameraX += (targetCamX - cameraX) * camBlend;
        cameraY += (targetCamY - cameraY) * camBlend;
        const camX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, cameraX)),
            camY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, cameraY));
        ctx.translate(vw / 2 - camX * zoom, vh / 2 - camY * zoom);
        ctx.scale(zoom, zoom);
        if (mapBackground.complete && mapBackground.naturalWidth)
            ctx.drawImage(mapBackground, 0, 0, WORLD_W, WORLD_H);
        else {
            ctx.fillStyle = '#1b1420';
            ctx.fillRect(0, 0, WORLD_W, WORLD_H)
        }
        if (WALK_DEBUG) drawWalkDebug(ctx);
        // V9.27: Goths only emerge from the mist as you get close (so the Chain Goth is not on screen at the start).
        const mistAlpha = e => { const near = e === enemies[0] ? 150 : MIST_SEE_NEAR, far = e === enemies[0] ? 250 : MIST_SEE_FAR;   // the Zombie Goth lurks close to the start, so she only shows up very close
            return Math.max(0, Math.min(1, (far - Math.hypot(e.x - x, e.y - y)) / (far - near))); };
        if (!enemies[0].dead) {
            ctx.save(); ctx.globalAlpha = mistAlpha(enemies[0]);
            drawZombieSprite(ctx, enemies[0].x, enemies[0].y, 'shambler', .84, t / 1000, false);
            ctx.restore();
        }
        if (!enemies[1].dead) {
            ctx.save(); ctx.globalAlpha = mistAlpha(enemies[1]);
            drawZombieSprite(ctx, enemies[1].x, enemies[1].y, 'chain', .9594, t / 1000, false);
            ctx.restore();
        }
        if (!relationshipDone)
            drawMarker(ctx, relationshipChallengeIcon, relationshipChallenge.x, relationshipChallenge.y, 90, 90, '', t / 1000);
        if (!puzzleSolved)
            drawMarker(ctx, princessQuestionIcon, princessQuestion.x, princessQuestion.y, 100, 100, '', t / 1000);
        if (!keyCollected && objectivesComplete()) {
            ctx.save();
            ctx.translate(key.x, key.y + Math.sin(t / 280) * 4);
            ctx.shadowColor = '#ffe49b';
            ctx.shadowBlur = 22;
            if (goldenKeySprite.complete && goldenKeySprite.naturalWidth) {
                const ks = 88 / Math.max(goldenKeySprite.naturalWidth, goldenKeySprite.naturalHeight);
                ctx.drawImage(goldenKeySprite, -goldenKeySprite.naturalWidth * ks / 2, -goldenKeySprite.naturalHeight * ks / 2, goldenKeySprite.naturalWidth * ks, goldenKeySprite.naturalHeight * ks);
            }
            ctx.restore();
        }
        if (!gateOpened && gateLockSprite.complete && gateLockSprite.naturalWidth) {
            ctx.save();
            ctx.translate(boss.x, boss.y - 58 + Math.sin(t / 360) * 3);
            ctx.shadowColor = 'rgba(0,0,0,.75)';
            ctx.shadowBlur = 12;
            const gs = 58 / Math.max(gateLockSprite.naturalWidth, gateLockSprite.naturalHeight);
            ctx.drawImage(gateLockSprite, -gateLockSprite.naturalWidth * gs / 2, -gateLockSprite.naturalHeight * gs / 2, gateLockSprite.naturalWidth * gs, gateLockSprite.naturalHeight * gs);
            ctx.restore();
        }
        const mapMoving = mode === 'map' && (held.up || held.down || held.left || held.right);
        drawOlly(ctx, playerX, playerY, .92, t / 1000, true, facingDir, mapMoving, walkDir);
        // v6.5.16e: unexplored cemetery remains covered; revealed areas stay clear.
        updateFogPatchClears(t);
        updateFogParting(t);
        if (prefOn('fog')) {
            ctx.drawImage(fogCanvas, 0, 0, WORLD_W, WORLD_H);
            drawAnimatedMist(t);
        }
        ctx.restore();
    }
    function canvasPointToWorld(e) {
        const rect = ui.canvas.getBoundingClientRect(),
            vw = ui.canvas.clientWidth || 1000,
            vh = ui.canvas.clientHeight || 600;
        const zoom = MAP_ZOOM;
        const sx = (e.clientX - rect.left) * (vw / rect.width),
            sy = (e.clientY - rect.top) * (vh / rect.height),
            viewW = vw / zoom,
            viewH = vh / zoom;
        const camX = Math.max(viewW / 2, Math.min(WORLD_W - viewW / 2, x)),
            camY = Math.max(viewH / 2, Math.min(WORLD_H - viewH / 2, y - CAM_LEAD_Y));
        return {
            x: (sx - vw / 2 + camX * zoom) / zoom,
            y: (sy - vh / 2 + camY * zoom) / zoom
        };
    }
    // v6.5.17: only the immediate church area starts revealed. Fog patches
    // elsewhere remain intact until Olly actually explores them.
    function revealInitialUpperLeft() {
        eraseFogCircle(x, y, FOG_START_RADIUS);
        markFogCells(x, y, FOG_START_RADIUS);
        lastFogRevealX = x;
        lastFogRevealY = y;
    }
    revealInitialUpperLeft();
    let pendingInteraction = null;
    let gateEncounterShown = false;
    function openInteractionEncounter(kind, enemy=null) {
        const data = ENCOUNTER_DATA[kind];
        if (!data)
            return;
        playSfx('click');   // clicking a map icon (assets/audio/sfx/interact.mp3)
        pendingInteraction = {
            kind,
            enemy
        };
        combatCheckpoint = {
            x,
            y
        };
        mode = 'encounter';
        ui.encounterImage.src = data.image;
        // V9.34: the Would You screen already says "relationship challenge" in the picture, so the big title is hidden and the first line is just a bit bigger.
        const relEnc = kind === 'relationshipChallenge';
        ui.encounter.classList.toggle('enc-rel', relEnc);
        ui.encounterName.textContent = data.name;
        ui.encounterName.style.display = relEnc ? 'none' : '';
        if (relEnc && data.text.includes('\n')) {
            const cut = data.text.indexOf('\n');
            ui.encounterText.textContent = '';
            const lead = document.createElement('span'); lead.className = 'enc-lead'; lead.textContent = data.text.slice(0, cut);
            ui.encounterText.append(lead, document.createTextNode(data.text.slice(cut + 1)));
        } else ui.encounterText.textContent = data.text;
        if (ui.encounterReady) {
            ui.encounterReady.textContent = 'I\'M READY';
            ui.encounterReady.classList.remove('hidden');
        }
        if (kind === 'lockedGate' && ui.encounterReady) {
            ui.encounterReady.classList.add('hidden');
        }
        ui.encounter.classList.remove('hidden');
    }
    function closeEncounter() {
        ui.encounter.classList.add('hidden');
        pendingInteraction = null;
        if (ui.encounterReady) {
            ui.encounterReady.classList.remove('hidden');
            ui.encounterReady.textContent = 'I\'M READY';
        }
        mode = 'map';
    }
    function confirmEncounter() {
        const p = pendingInteraction;
        if (!p)
            return;
        ui.encounter.classList.add('hidden');
        pendingInteraction = null;
        if (p.kind === 'zombieGoth' || p.kind === 'chainGoth') {
            target = p.enemy;
            mode = 'map';
            startCombat(false);
            return;
        }
        if (p.kind === 'relationshipChallenge') {
            mode = 'map';
            startRelationship();
            return;
        }
        if (p.kind === 'princessQuestion') {
            mode = 'map';
            openPrincessQuestion();
            return;
        }
    }
    function matchArtworkLetterboxing(img) {
        if (!img) return;
        // Use the page's actual background colour for any object-fit letterboxing.
        // This changes the framing only; the underlying artwork remains untouched.
        let pageBackground = '#18121b';
        try {
            const computedBackground = window.getComputedStyle(document.body).backgroundColor;
            if (computedBackground && computedBackground !== 'rgba(0, 0, 0, 0)') {
                pageBackground = computedBackground;
            }
        } catch (_) { /* Keep the matching plum fallback in non-browser test contexts. */ }
        img.style.setProperty('background', pageBackground, 'important');
        // The old wide image element forced object-fit:contain to paint black side bars.
        // Let the element itself follow the artwork's native aspect ratio instead.
        img.style.setProperty('width', 'auto', 'important');
        img.style.setProperty('height', 'auto', 'important');
        img.style.setProperty('max-width', '96vw', 'important');
        img.style.setProperty('object-fit', 'contain', 'important');
        img.style.setProperty('display', 'block', 'important');
        img.style.setProperty('margin-left', 'auto', 'important');
        img.style.setProperty('margin-right', 'auto', 'important');
    }

    function openPrincessQuestion() {
        mode = 'puzzle';
        const img = document.querySelector('#puzzle .quiz-image');
        if (img) {
            img.src = 'assets/encounters/level1/princess-question-art.webp?v=501';
            matchArtworkLetterboxing(img);
        }
        ui.puzzle.classList.remove('hidden');
        ui.puzzleFeedback.textContent = 'Choose wisely. The Goths have inexplicably made this a formal assessment.';
    }
    function playCutscene2() {
        if (mode !== 'map' || !keyCollected || gateOpened) return;

        mode = 'cutscene2';
        playMusic('');   // the cutscene has its own sound
        const overlay = document.createElement('div');
        overlay.id = 'level1-cutscene2-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:#09070d;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;box-sizing:border-box;';

        const frame = document.createElement('div');
        frame.style.cssText = 'position:relative;width:min(1280px,96vw);height:min(760px,92vh);display:flex;align-items:center;justify-content:center;background:#120d16;border:1px solid #6f4a61;border-radius:18px;box-shadow:0 18px 70px rgba(0,0,0,.55);overflow:hidden;';
        overlay.appendChild(frame);

        const video = document.createElement('video');
        video.id = 'level1-cutscene2';
        video.playsInline = true;
        video.preload = 'auto';
        video.controls = false;
        video.autoplay = true;
        video.style.cssText = 'max-width:100%;max-height:100%;width:100%;height:100%;object-fit:contain;background:#09070d;';
        frame.appendChild(video);

        const status = document.createElement('div');
        status.textContent = 'LOADING CUTSCENE...';
        status.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);padding:14px 20px;border:1px solid #8d5f78;border-radius:12px;background:rgba(22,14,25,.9);color:#f5dce7;font:700 18px Georgia,serif;letter-spacing:.4px;z-index:2;';
        frame.appendChild(status);

        const playButton = document.createElement('button');
        playButton.textContent = '▶ PLAY CUTSCENE';
        playButton.style.cssText = 'position:absolute;left:50%;bottom:24px;transform:translateX(-50%);padding:12px 22px;border:1px solid #d98ba8;border-radius:12px;background:#382132;color:#f8eaf0;font:700 16px Georgia,serif;cursor:pointer;display:none;z-index:3;';
        frame.appendChild(playButton);

        const closeButton = document.createElement('button');
        closeButton.textContent = 'BACK TO MAP';
        closeButton.style.cssText = 'position:absolute;left:50%;bottom:24px;transform:translateX(-50%);padding:12px 22px;border:1px solid #9b6f86;border-radius:12px;background:#241726;color:#f8eaf0;font:700 16px Georgia,serif;cursor:pointer;display:none;z-index:3;';
        frame.appendChild(closeButton);

        document.body.appendChild(overlay);

        let finished = false;
        let attemptedFallback = false;
        const sources = [
            'assets/video/cutscene2/cutscene2.mp4?v=9420',
            'assets/video/cutscene2/cutscene2.mov?v=9420'
        ];

        const finish = () => {
            if (finished) return;
            finished = true;
            video.pause();
            video.removeAttribute('src');
            video.load();
            overlay.remove();
            gateOpened = true;
            inventory.key = 0;   // V9.30: the key is used up when the gate opens
            refreshInventoryUI();
            mode = 'map';
            playMusic('map');
            stats();
            ui.dialogue.textContent = '🔓 The gate opens. Whatever is beyond it is no longer your problem for the moment...';
            showBossIntro();   // V9.19: "You've encountered Patricia" screen
        };

        const showFailure = () => {
            if (finished) return;
            status.textContent = 'Cutscene could not be played. Make sure cutscene2.mp4 is in assets/video/cutscene2/.';
            playButton.style.display = 'none';
            closeButton.style.display = 'block';
        };

        const tryPlay = () => {
            status.style.display = 'none';
            video.play().then(() => {
                playButton.style.display = 'none';
            }).catch(() => {
                playButton.style.display = 'block';
            });
        };

        // V9.40: skip button for the gate cutscene
        const gateSkip = document.createElement('button');
        gateSkip.type = 'button'; gateSkip.textContent = 'SKIP CUTSCENE ▸';
        gateSkip.style.cssText = 'position:absolute;right:22px;bottom:22px;padding:8px 16px;border:1px solid rgba(255,255,255,.35);border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Georgia,serif;cursor:pointer;opacity:.85;z-index:5;';
        gateSkip.addEventListener('click', finish);
        overlay.appendChild(gateSkip);
        video.addEventListener('loadeddata', tryPlay, { once:false });
        video.addEventListener('canplay', tryPlay, { once:false });
        video.addEventListener('ended', finish, { once:true });
        video.addEventListener('error', () => {
            if (!attemptedFallback) {
                attemptedFallback = true;
                status.textContent = 'Trying alternate video format...';
                video.src = sources[1];
                video.load();
                return;
            }
            showFailure();
        }, { once:false });

        playButton.addEventListener('click', () => {
            video.play().then(() => {
                playButton.style.display = 'none';
            }).catch(() => {
                playButton.style.display = 'block';
            });
        });
        closeButton.addEventListener('click', () => {
            if (finished) return;
            finished = true;
            video.pause();
            overlay.remove();
            mode = 'map';
            ui.dialogue.textContent = 'The cutscene could not be played yet. The gate remains locked.';
        }, { once:true });

        video.src = sources[0];
        video.load();
    }


    ui.combatCanvas.addEventListener('pointerdown', () => { if (patReward) patChestInteract(); });   // V9.42: click the chest
    ui.canvas.addEventListener('pointerdown', e => {
        if (mode !== 'map')
            return;
        const pt = canvasPointToWorld(e);
        const near = (px, py, r) => Math.hypot(pt.x - px, pt.y - py) < r;
        const enemyHit = enemies.find(z => !z.dead && near(z.x, z.y, 70));
        if (enemyHit) {
            openInteractionEncounter(enemyHit.type === 'shambler' ? 'zombieGoth' : 'chainGoth', enemyHit);
            return;
        }
        if (!relationshipDone && near(relationshipChallenge.x, relationshipChallenge.y, 58)) {
            openInteractionEncounter('relationshipChallenge');
            return;
        }
        if (!puzzleSolved && near(princessQuestion.x, princessQuestion.y, 58)) {
            openInteractionEncounter('princessQuestion');
            return;
        }
        if (objectivesComplete() && !keyCollected && near(key.x, key.y, 55)) {
            keyCollected = true;
            playSfx('pickup');   // assets/audio/sfx/pickup.mp3
            inventory.key = 1;
            refreshInventoryUI();
            ui.dialogue.textContent = '🔑 A little brass key drops onto the cobblestones. Finally, a sensible piece of game design. Take it to the gate: open your backpack (Y), select the key and press USE.';
            stats();
            return;
        }
        // Gate is click-to-interact only. Walking nearby never changes mode.
        // The clickable target is the lock icon itself.
        if (near(boss.x, boss.y - 58, 66)) {
            if (!keyCollected) {
                openInteractionEncounter('lockedGate');
                return;
            }
            if (!gateOpened) {
                ui.dialogue.textContent = '🔒 The gate is locked. Open your backpack (Y), select the key and press USE while standing in front of it.';
                return;
            }
        }
    });

    function move(dir) {
        setMoveKey(dir, true);
        setTimeout(() => setMoveKey(dir, false), 45);
    }
    function checkTriggers() {}
    function interact() {
        return
    }

    function drawEncounter() {}

    function resetCombatVisual() {
        enemyAttackPhase = null;
        zombieCombatX = COMBAT_W - 320;
        zombieCombatPrevX = zombieCombatX;
        zombieCombatState = 'ready';
        zombieCombatStateStart = gnow();
        zombieCombatAttackType = 'claw';
        zombieAttackCycle = 0;
        zombieCombatAttackHit = false;
        zombieBiteCaughtAt = 0;
        zombieBiteHoldUntil = 0;
        zombieBiteHoldX = 0;
        zombieBiteEvaded = false;
        lastDodgeStart = -1e9;
        lastJumpStart = -1e9;
        zombieRecoveryDuration = 520;
        zombieCombatNextDecision = gnow() + 450;
        zombieCombatWalkIndex = 0;
        zombieHitStaggerUntil = 0;
        zombieHitReactionStart = 0;
        zombieHitDirection = 1;
        zombieHitStrength = 0;
        zombieHitFlashUntil = 0;
        zombieHitLong = false;
        zombieIntroActive = false;
        zombieIntroStart = 0;
        zombieIntroEndAt = 0;
        zombieDeathStarted = false;
        zombieDeathEndAt = 0;
        playerHurtUntil = 0;
        playerHurtStart = 0;
        playerHurtDirection = 1;
        playerDeathTriggered = false;
        enemyLeaving = null;
        comboCount = 0;
        attackCooldownUntil = 0;
        heavyAttackCooldownUntil = 0;
        lastAttackAt = 0;
        attackAnimUntil = 0;
        heavyAttackAnimUntil = 0;
        jumping = false;
        jumpT = 0;
        jumpOffset = 0;
        dodgeUntil = 0;
        combatLastFrame = 0;
        combatAnimationState = 'idle';
        combatAnimationStart = 0;
        combatAnimationUntil = 0;
        combatDodgeDirection = -1;
        const enemyX = COMBAT_W - 320;
        player = {
            x: 270,
            y: COMBAT_GROUND_Y,
            invuln: 0,
            aimX: enemyX,
            aimY: COMBAT_GROUND_Y
        };
        combatFacing = enemyX >= player.x ? 'right' : 'left';
    }
    function updateCombatMovement(dt) {
        if (mode !== 'combat' || zombieIntroActive || patFrozen() || playerDeathTriggered)
            return;

        const speed = 430;
        const playerMinX = 140;
        const playerMaxX = COMBAT_W - 140;
        const nowMs = gnow();
        if (nowMs < zombieBiteHoldUntil) {
            player.x = zombieBiteHoldX;
            player.y = COMBAT_GROUND_Y;
            jumping = false;
            jumpT = 1;
            jumpOffset = 0;
            return;
        }
        let dx = (held.right ? 1 : 0) - (held.left ? 1 : 0);

        if (dx && !(heavyAttackAnimUntil > nowMs)) {
            const airborne = jumping || jumpOffset < -8;
            const nextX = Math.max(playerMinX, Math.min(playerMaxX, player.x + dx * (airborne ? 720 : speed) * dt));   // faster in the air so a jump can clear Chain Goth
            const grounded = !jumping && jumpOffset > -8 && nowMs >= dodgeUntil;
            const gap = 92;

            // On the ground, the Goth has a physical presence. During a jump or
            // dodge, Olly can cross her and reposition on the other side.
            if (grounded && Math.abs(nextX - zombieCombatX) < gap) {
                player.x = nextX < zombieCombatX
                    ? Math.max(playerMinX, zombieCombatX - gap)
                    : Math.min(playerMaxX, zombieCombatX + gap);
            } else {
                player.x = nextX;
            }
            combatFacing = dx < 0 ? 'left' : 'right';
        }

        player.y = COMBAT_GROUND_Y;

        if (heavyAttackAnimUntil > nowMs) {
            const total = 620;
            const startMs = heavyAttackAnimUntil - total;
            const p = Math.max(0, Math.min(1, (nowMs - startMs) / total));
            const targetX = Math.max(playerMinX, Math.min(playerMaxX, heavyLungeTargetX));
            const eased = p < .62
                ? (p / .62) * (1 - Math.pow(1 - (p / .62), 3))
                : .90 + ((p - .62) / .38) * .10;
            player.x = heavyLungeStartX + (targetX - heavyLungeStartX) * eased;
            player.x = Math.max(playerMinX, Math.min(playerMaxX, player.x));
            jumpOffset = 0;
        }

        if (jumping) {
            const jumpDuration = .51;
            jumpT += dt / jumpDuration;
            if (jumpT >= 1) {
                jumpT = 1;
                jumping = false;
                playSfx('olly-land', .7);
            }
            jumpOffset = -Math.sin(jumpT * Math.PI) * 68;
        } else {
            jumpOffset = 0;
            if (combatAnimationState === 'jump')
                combatAnimationState = 'idle';
        }

        // If the Zombie advances into Olly between input frames, resolve the
        // overlap from the same physical gap. This stops the enemy from bodying
        // Olly into the arena edge while still allowing jump/dodge crossovers.
        resolveCombatBodyCollision(nowMs);
    }

    function resolveCombatBodyCollision(nowMs) {
        if (!isAIFight())
            return;
        if (jumping || jumpOffset < -18 || nowMs < dodgeUntil || heavyAttackAnimUntil > nowMs)
            return;

        const minGap = 108;
        const playerMinX = 140;
        const playerMaxX = COMBAT_W - 140;
        const dx = player.x - zombieCombatX;

        if (Math.abs(dx) < minGap) {
            const side = dx === 0
                ? (combatFacing === 'left' ? 1 : -1)
                : (dx < 0 ? -1 : 1);
            player.x = Math.max(
                playerMinX,
                Math.min(playerMaxX, zombieCombatX + side * minGap)
            );
        }
    }

    function jump() {
        if (pausedAt) return;
        const nowMs = gnow();
        if (mode !== 'combat' || zombieIntroActive || patFrozen() || playerDeathTriggered || jumping || heavyAttackAnimUntil > nowMs || nowMs < zombieBiteHoldUntil)
            return;
        jumping = true;
        lastJumpStart = gnow();
        playSfx('olly-jump', .45);   // soft take-off whoosh (the thud plays on landing)
        jumpT = 0;
        combatAnimationState = 'jump';
        combatAnimationStart = gnow();
        combatAnimationUntil = combatAnimationStart + 510; // v6.5.16d
        ui.combatStatus.textContent = '🦘 You jump.';
    }
    function drawCombatBackground(c) {
        c.clearRect(0, 0, COMBAT_W, COMBAT_H);
        const bgImg = (isBoss && patriciaArenaImage.complete && patriciaArenaImage.naturalWidth > 0) ? patriciaArenaImage : combatBackgroundImage;
        if (bgImg.complete && bgImg.naturalWidth > 0) {
            c.drawImage(bgImg, 0, 0, COMBAT_W, COMBAT_H);
        } else {
            const g = c.createLinearGradient(0, 0, 0, COMBAT_H);
            g.addColorStop(0, '#23192a');
            g.addColorStop(.52, '#17111b');
            g.addColorStop(1, '#0b080e');
            c.fillStyle = g;
            c.fillRect(0, 0, COMBAT_W, COMBAT_H);
            c.fillStyle = '#201824';
            c.fillRect(0, COMBAT_H - 150, COMBAT_W, 150);
            c.fillStyle = '#4b3b50';
            for (let i = 0; i < 18; i++) {
                const gx = 40 + i * 84;
                c.fillRect(gx, COMBAT_H - 220, 5, 70);
                c.fillRect(gx - 14, COMBAT_H - 220, 33, 5);
            }
        }
    }
    function getCombatAnimationFrame(nowMs) {
        const state = combatAnimationState;
        let cfg = null,
            frames = null;
        if (state === 'dodge') {
            cfg = OLLY_ANIMATIONS.dodge;
            frames = ollyCombatSprites.dodge;
        } else if (state === 'heavy') {
            cfg = OLLY_ANIMATIONS.heavy;
            frames = ollyCombatSprites.heavy;
        } else if (state === 'punch') {
            cfg = OLLY_ANIMATIONS.punch;
            frames = ollyCombatSprites.punch;
        } else if (state === 'hurt') {
            let acc = 0;
            const elapsed = Math.max(0, Math.min(OLLY_HURT_TOTAL_MS - 1, nowMs - combatAnimationStart));
            let index = 0;
            for (let i = 0; i < OLLY_HURT_FRAME_MS.length; i++) {
                acc += OLLY_HURT_FRAME_MS[i];
                if (elapsed < acc) {
                    index = i;
                    break;
                }
            }
            return {
                img: ollyReactionSprites.hurt[index],
                state: 'hurt',
                progress: elapsed / OLLY_HURT_TOTAL_MS,
                frameIndex: index,
                drawDir: combatFacing,
                height: 300,
                duration: OLLY_HURT_TOTAL_MS
            };
        } else if (state === 'ko') {
            let acc = 0;
            const elapsed = Math.max(0, Math.min(OLLY_KO_TOTAL_MS - 1, nowMs - combatAnimationStart));
            let index = ollyReactionSprites.ko.length - 1;
            for (let i = 0; i < OLLY_KO_FRAME_MS.length; i++) {
                acc += OLLY_KO_FRAME_MS[i];
                if (elapsed < acc) {
                    index = i;
                    break;
                }
            }
            return {
                img: ollyReactionSprites.ko[index],
                state: 'ko',
                progress: elapsed / OLLY_KO_TOTAL_MS,
                frameIndex: index,
                drawDir: combatFacing,
                kScale: 300 / 647,   // one scale for every KO frame, matched to the 300px idle height, so he no longer swells as he falls
                duration: OLLY_KO_TOTAL_MS
            };
        } else if (jumping || state === 'jump') {
            cfg = OLLY_ANIMATIONS.jump;
            frames = ollyCombatSprites.jump;
        } else {
            return {
                // Use the new canonical Olly art for combat idle as well.
                // Existing punch/dodge/jump/heavy animations remain untouched.
                img: (ollySprite.complete && ollySprite.naturalWidth) ? ollySprite : ollyCombatSprites.idle,
                state: 'idle',
                progress: 0,
                drawDir: combatFacing,
                height: OLLY_IDLE_HEIGHT
            };
        }

        const total = cfg.frameMs.reduce((a,b) => a + b, 0);
        let elapsed = Math.max(0, Math.min(total - 1, nowMs - combatAnimationStart));
        let acc = 0;
        let localIndex = 0;
        for (let i = 0; i < cfg.frameMs.length; i++) {
            acc += cfg.frameMs[i];
            if (elapsed < acc) {
                localIndex = i;
                break;
            }
        }
        const sourceIndex = cfg.indices[Math.min(localIndex, cfg.indices.length - 1)];
        const img = frames[sourceIndex];
        return {
            img,
            state,
            progress: elapsed / total,
            frameIndex: sourceIndex,
            drawDir: combatFacing,
            height: cfg.height,
            kScale: cfg.kScale,
            visualOffsetY: cfg.frameYOffset ? (cfg.frameYOffset[Math.min(localIndex, cfg.frameYOffset.length - 1)] || 0) : 0,
            duration: total
        };
    }


    function getZombieCombatFrame(nowMs) {
        const elapsed = Math.max(0, nowMs - zombieCombatStateStart);
        let frames = zombieCombatFrames.idle;
        let frameMs = 180;
        let index = 0;
        let targetHeight = 380;

        // v7.9: walking frames receive the new enlarged arena render and floor alignment.

        if (zombieCombatState === 'intro' && zombieIntroNew) {
            frames = zombieCombatFrames.intro2; targetHeight = 400;
            index = Math.min(frames.length - 1, Math.floor(elapsed / ZOMBIE_INTRO2_FRAME_MS));
        } else if (zombieCombatState === 'intro') {
            frames = zombieCombatFrames.claw;   // V9.34: the 3-2-1 now uses her claw-swipe frames, spread slowly over the countdown (the old freeze was too quick)
            targetHeight = 315;
            // V9.24: the new 61-frame 3-2-1 animation plays once across the countdown, then holds its last pose.
            {   // V9.30: only the calm first part of the clip is used (the later frames shuffle her feet on the spot, which looked like a treadmill)
                const e = Math.max(0, elapsed);
                index = Math.min(frames.length - 1, Math.floor(e / (ZOMBIE_INTRO_TOTAL_MS * .19)));
            }
        } else if (zombieCombatState === 'chase') {
            frames = zombieCombatFrames.walk;
            // v8.9: walk is 10% smaller than the v8.8 visible walk size.
            targetHeight = 340;
            const cycleTime = ((zombieCombatWalkIndex % ZOMBIE_WALK_CYCLE_MS) + ZOMBIE_WALK_CYCLE_MS) % ZOMBIE_WALK_CYCLE_MS;
            let acc = 0;
            let sequenceIndex = 0;
            for (let i = 0; i < ZOMBIE_WALK_FRAME_MS.length; i++) {
                acc += ZOMBIE_WALK_FRAME_MS[i];
                if (cycleTime < acc) {
                    sequenceIndex = i;
                    break;
                }
            }
            index = ZOMBIE_WALK_SEQUENCE[sequenceIndex];
        } else if (zombieCombatState === 'claw') {
            frames = zombieCombatFrames.claw;
            // v8.11: regular attack is smaller than the walk.
            targetHeight = 315;
            const total = 720;
            index = Math.min(frames.length - 1, Math.floor(Math.min(.999, elapsed / total) * frames.length));
        } else if (zombieCombatState === 'heavyKick') {
            frames = zombieCombatFrames.heavyKick;
            targetHeight = 410;
            if (zombieBiteCaughtAt > 0) {
                const sinceCatch = Math.max(0, nowMs - zombieBiteCaughtAt);
                if (sinceCatch < 1000) index = 5;       // Frame 06: bite contact, held for one second.
                else if (sinceCatch < 1200) index = 6;  // Frame 07: recoil.
                else index = 7;                         // Frame 08: return to crouch.
            } else {
                // V9.30: she keeps crawling after Olly (loop the crawl frames) instead of freezing on the last lunge pose.
                const CRAWL_LOOP = [1, 2, 3, 4, 3, 2];
                if (elapsed < 140) index = 0;
                else index = CRAWL_LOOP[Math.floor((elapsed - 140) / 105) % CRAWL_LOOP.length];
            }
        } else if (zombieCombatState === 'death') {
            frames = zombieCombatFrames.death;
            targetHeight = 360;
            let acc = 0;
            index = frames.length - 1;
            for (let i = 0; i < ZOMBIE_DEATH_FRAME_MS.length; i++) {
                acc += ZOMBIE_DEATH_FRAME_MS[i];
                if (elapsed < acc) {
                    index = i;
                    break;
                }
            }
        } else if (zombieCombatState === 'hit') {
            frames = zombieCombatFrames.hurt;
            targetHeight = 330;   // V9.29: new hurt frames are drawn at their natural size (scale 1 below)
            const seq = zombieHitLong ? ZOMBIE_LONG_HURT_SEQUENCE : ZOMBIE_HURT_SEQUENCE;
            const times = zombieHitLong ? ZOMBIE_LONG_HURT_FRAME_MS : ZOMBIE_HURT_FRAME_MS;
            let acc = 0;
            index = seq[seq.length - 1];
            for (let i = 0; i < times.length; i++) {
                acc += times[i];
                if (elapsed < acc) {
                    index = seq[i];
                    break;
                }
            }
        } else if (zombieCombatState === 'ready' || zombieCombatState === 'windup') {
            frames = zombieIntroNew ? zombieCombatFrames.intro2 : zombieCombatFrames.prep;   // V9.30: ready pose = settled stance of the 3-2-1 animation
            targetHeight = 400;
            index = zombieIntroNew ? 120 : 15;
        } else if (zombieCombatState === 'recover') {
            // After an attack, visibly walk/reposition instead of snapping back
            // into the crouch. The crouch returns before the next attack.
            frames = zombieCombatFrames.walk;
            targetHeight = 340;
            const cycleTime = ((zombieCombatWalkIndex % ZOMBIE_WALK_CYCLE_MS) + ZOMBIE_WALK_CYCLE_MS) % ZOMBIE_WALK_CYCLE_MS;
            let acc = 0;
            let sequenceIndex = 0;
            for (let i = 0; i < ZOMBIE_WALK_FRAME_MS.length; i++) {
                acc += ZOMBIE_WALK_FRAME_MS[i];
                if (cycleTime < acc) {
                    sequenceIndex = i;
                    break;
                }
            }
            index = ZOMBIE_WALK_SEQUENCE[sequenceIndex];
        } else {
            index = Math.floor(elapsed / frameMs) % frames.length;
        }

        // One fixed scale per animation set (never per frame) so she stays the same size within and between animations.
        // Scales were matched by the size of her hair bow across the walk, crouch, claw and bite art.
        let scale = 0;
        if (zombieCombatState === 'chase' || zombieCombatState === 'recover') scale = .4595;   // V9.30: original walk art scale
        else if (zombieCombatState === 'claw' || (zombieCombatState === 'intro' && !zombieIntroNew)) scale = .62;
        else if (zombieCombatState === 'heavyKick') scale = .62;
        else if (zombieCombatState === 'ready' || zombieCombatState === 'windup' || (zombieCombatState === 'intro' && zombieIntroNew) || zombieCombatState === 'death' || zombieCombatState === 'hit') scale = 1;   // V9.24 frames are pre-scaled
        return { img: frames[index], targetHeight, frameIndex: index, scale };
    }

    function drawCombatImage(c, img, x, groundY, targetHeight, face, maxWidth = 270, alpha = 1, offsetX = 0, rotation = 0, sourceFacing = 'right', offsetY = 0) {
        if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight)
            return;
        const naturalScale = targetHeight / img.naturalHeight;
        let drawW = img.naturalWidth * naturalScale;
        let drawH = targetHeight;
        if (drawW > maxWidth) {
            const scale = maxWidth / img.naturalWidth;
            drawW = maxWidth;
            drawH = img.naturalHeight * scale;
        }
        c.save();
        c.globalAlpha = alpha;
        c.translate(x + offsetX, groundY + 40 + offsetY);
        if (rotation)
            c.rotate(rotation);
        // Each animation set can have its own native facing direction.
        // The current Zombie combat assets are authored facing LEFT.
        c.scale(face === sourceFacing ? 1 : -1, 1);
        c.imageSmoothingEnabled = true;
        c.imageSmoothingQuality = 'high';
        c.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
        c.restore();
    }

    function drawZombieCombat(c, enemyX, enemyY, nowMs) {
        if (isPatriciaFight()) {
            drawPatriciaCombat(c, enemyX, enemyY, nowMs);
            return;
        }
        if (isChainFight()) {
            drawChainCombat(c, enemyX, enemyY, nowMs);
            return;
        }
        const useAI = !isBoss && target?.type === 'shambler';
        if (!useAI) {
            const legacyScale = target?.type === 'chain' ? 2.55 : 2.08;
            const renderY = target?.type === 'chain' ? enemyY - 15 : enemyY;
            drawZombieSprite(c, enemyX, renderY, target?.type || (isBoss ? 'chain' : 'shambler'), legacyScale, nowMs / 1000, false, player.x < enemyX ? 'left' : 'right');
            return;
        }

        let frame = getZombieCombatFrame(nowMs);
        let offsetX = 0;
        let rotation = 0;
        let alpha = 1;

        if (zombieCombatState === 'hit') {
            const total = zombieHitStaggerUntil - zombieHitReactionStart || 1;
            const p = Math.max(0, Math.min(1, (nowMs - zombieHitReactionStart) / total));
            const ease = 1 - Math.pow(1 - p, 2);
            offsetX = zombieHitDirection * zombieHitStrength * (1 - ease);
            rotation = zombieHitDirection * -0.13 * (1 - ease);
            alpha = nowMs < zombieHitFlashUntil ? .72 : 1;
        }

        if (zombieCombatState === 'windup' && !enemyLeaving) {   // she coils and trembles harder as the attack nears, instead of freezing
            const wp = Math.max(0, Math.min(1, (nowMs - zombieCombatStateStart) / (zombieCombatAttackType === 'heavyKick' ? BITE_WINDUP_MS : 620)));
            offsetX += Math.sin(nowMs / 26) * (1.5 + 4.5 * wp);
        }
        const face = enemyLeaving ? (enemyLeaving.dir < 0 ? 'left' : 'right') : (player.x < enemyX ? 'left' : 'right');
        const walking = zombieCombatState === 'chase';
        const dying = zombieCombatState === 'death';
        // v8.6: attack/death/pre-post assets are authored facing LEFT.
        // Flip only when Olly is to the right of Zombie so the action points toward him.
        const sourceFacing = 'left';
        // The new walk frames are tightly cropped to the actual character pixels.
        // Their bottom edge should sit directly on the same combat floor as Olly.
        // Existing attack frames retain their previous rendering offset.
        // v8.9: walk and attack are deliberately 10% smaller; every other
        // Zombie combat animation is 20% larger than its v8.8 size.
        const renderGroundY = (walking || dying || zombieCombatState === 'recover' || zombieCombatState === 'intro' || zombieCombatState === 'ready' || zombieCombatState === 'windup' || zombieCombatState === 'hit') ? enemyY + 25 : enemyY + 22;
        // The Ankle Biter frames are wide, low-to-the-ground poses. Give this
        // attack a width cap matching Zombie Goth's normal combat footprint so
        // the horizontal artwork does not become enormous on screen.
        // Increased by a further 10% so the bite-contact pose reads clearly.
        const renderMaxWidth = 1400;
        const renderHeight = (frame.scale && frame.img && frame.img.naturalHeight) ? Math.round(frame.img.naturalHeight * frame.scale) : Math.round(frame.targetHeight);
        const deathFloorOffset = dying ? (ZOMBIE_DEATH_FLOOR_OFFSETS[frame.frameIndex] || 0) : 0;
        drawCombatImage(c, frame.img, enemyX, renderGroundY, renderHeight, face, renderMaxWidth, alpha, offsetX, rotation, sourceFacing, deathFloorOffset);

        // Small impact sparks make the hit reaction readable without needing
        // another sprite sheet.
        if (zombieCombatState === 'hit') {
            const elapsed = nowMs - zombieHitReactionStart;
            if (elapsed < 240) {
                const p = elapsed / 240;
                const burstX = enemyX - zombieHitDirection * 18;
                const burstY = enemyY - 150;
                c.save();
                c.globalAlpha = Math.max(0, 1 - p);
                c.strokeStyle = '#f3bfd3';
                c.lineWidth = 4;
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 * i) / 6 + .25;
                    const r1 = 8 + p * 5;
                    const r2 = 20 + p * 28;
                    c.beginPath();
                    c.moveTo(burstX + Math.cos(a) * r1, burstY + Math.sin(a) * r1);
                    c.lineTo(burstX + Math.cos(a) * r2, burstY + Math.sin(a) * r2);
                    c.stroke();
                }
                c.restore();
            }
        }
    }

    function triggerZombieDeath(nowMs) {
        if (mode !== 'combat' || isBoss || target?.type !== 'shambler' || zombieDeathStarted)
            return;

        zombieDeathStarted = true;
        playSfx('zombie-death', .9);
        zombieDeathEndAt = nowMs + ZOMBIE_DEATH_TOTAL_MS + ZOMBIE_DEATH_HOLD_FIXED;
        zombieCombatState = 'death';
        zombieCombatStateStart = nowMs;
        zombieCombatAttackHit = true;
        enemyAttackPhase = 'death';
        zombieCombatNextDecision = Infinity;
        ui.combatStatus.textContent = '💀 ZOMBIE GOTH DEFEATED.';
    }

    function chooseZombieAttack(nowMs) {
        // v8.11: deterministic pattern = at least two normal attacks,
        // then the approved heavy attack, followed by a longer attack break.
        const isHeavy = zombieAttackCycle >= 2;
        zombieCombatAttackType = isHeavy ? 'heavyKick' : 'claw';
        if (isHeavy) {
            zombieBiteEvaded = false;
            zombieBiteCaughtAt = 0;
            zombieBiteHoldUntil = 0;
            zombieBiteHoldX = 0;
        }
        zombieAttackCycle = (zombieAttackCycle + 1) % 3;
        zombieCombatAttackHit = false;
        zombieCombatState = 'windup';
        zombieCombatStateStart = nowMs;
        enemyAttackPhase = 'windup';
        queueRingTutorial(isHeavy ? 'red' : 'pink');
        ui.combatStatus.textContent = isHeavy
            ? '⚠️ The Zombie Goth is charging a HEAVY ATTACK.'
            : 'The Zombie Goth draws back her claws.';
    }

    function updateZombieAI(dt, nowMs) {
        if (mode !== 'combat' || isBoss || target?.type !== 'shambler' || playerDeathTriggered)
            return;

        if (zombieIntroActive) {
            if (nowMs >= zombieIntroEndAt) {
                zombieIntroActive = false;
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs;
                zombieCombatWalkIndex = 0;
                enemyAttackPhase = null;
                ui.combatStatus.textContent = 'The Zombie Goth is coming for you. Get ready.';
            }
            return;
        }

        if (zombieCombatState === 'death') {
            if (nowMs >= zombieDeathEndAt)
                endCombat(true);
            return;
        }

        if (zombieCombatState === 'hit') {
            if (nowMs >= zombieHitStaggerUntil) {
                zombieHitLong = false;
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 220;
                enemyAttackPhase = null;
            }
            return;
        }

        const dx = player.x - zombieCombatX;
        const distance = Math.abs(dx);
        const direction = dx < 0 ? -1 : 1;

        if (zombieCombatState === 'ready') {
            // Show the crouched pose only when she is close enough to attack.
            // If Olly has moved away, return straight to the walking chase.
            if (distance > 135) {
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs;
            } else if (nowMs - zombieCombatStateStart >= 360) {
                chooseZombieAttack(nowMs);
            }
            return;
        }

        if (zombieCombatState === 'chase') {
            if (distance > 135) {
                const desiredX = player.x - direction * 100;
                const targetX = Math.max(280, Math.min(COMBAT_W - 280, desiredX));
                const step = Math.min(Math.abs(targetX - zombieCombatX), 175 * dt);   // V9.28: was 135
                zombieCombatX += (targetX >= zombieCombatX ? 1 : -1) * step;
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
                zombieCombatWalkIndex += dt * 1000;
                zombieCombatPrevX = zombieCombatX;
                return;
            }
            if (nowMs >= zombieCombatNextDecision)
                chooseZombieAttack(nowMs);
            return;
        }

        if (zombieCombatState === 'windup') {
            const windup = zombieCombatAttackType === 'heavyKick' ? BITE_WINDUP_MS : 560;   // long enough to read the warning ring
            // V9.28: she keeps stalking Olly while she winds up (she used to stand still, so stepping away was free)
            if (distance > 105) {
                zombieCombatX += direction * Math.min(distance - 105, 120 * dt);
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
                zombieCombatWalkIndex += dt * 1000;
            }
            if (nowMs - zombieCombatStateStart >= windup) {
                zombieCombatState = zombieCombatAttackType;
                zombieCombatStateStart = nowMs;
                zombieCombatAttackHit = false;
                enemyAttackPhase = 'active';
            }
            return;
        }

        if (zombieCombatState === 'claw' || zombieCombatState === 'heavyKick') {
            const elapsed = nowMs - zombieCombatStateStart;
            const heavy = zombieCombatState === 'heavyKick';

            if (heavy) {
                // Crawl towards Olly at a slightly slower pace. If she reaches
                // him while he is grounded and not dodging, the bite connects.
                // Jumping or dodging can still avoid the catch.
                // V9.19: a dodge that starts while the red ring is closing in (or just as she lunges) beats the bite.
                // Before, the 0.6s dodge was often over by the time she reached him, so well-timed dodges still got caught.
                if (!zombieBiteEvaded && zombieBiteCaughtAt === 0 && Math.max(lastDodgeStart, lastJumpStart) >= zombieCombatStateStart - 800 && Math.max(lastDodgeStart, lastJumpStart) <= zombieCombatStateStart + 350) {
                    zombieBiteEvaded = true;
                    ui.combatStatus.textContent = '↪ BITE avoided!';
                }
                if (zombieBiteCaughtAt === 0) {   // V9.30: keeps chasing even after a dodge (she just can't bite him)
                    const trackingDx = player.x - zombieCombatX;
                    const trackingDirection = trackingDx < 0 ? -1 : 1;
                    const trackingGap = 112;
                    const desiredX = player.x - trackingDirection * trackingGap;
                    const targetX = Math.max(170, Math.min(COMBAT_W - 170, desiredX));
                    const crawlStep = Math.min(Math.abs(targetX - zombieCombatX), (zombieBiteEvaded ? 300 : 400) * dt);
                    if (crawlStep > 0.5) {
                        zombieCombatX += (targetX >= zombieCombatX ? 1 : -1) * crawlStep;
                        zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
                        zombieCombatWalkIndex += dt * 1000;
                    }

                    const catchDistance = Math.abs(player.x - zombieCombatX);
                    const canCatch = nowMs >= dodgeUntil && !zombieBiteEvaded;   // red attack: dodging OR jumping (timed like a dodge) avoids the bite
                    if (canCatch && catchDistance <= 215) {   // V9.28: longer red-attack reach (was 155)
                        zombieBiteCaughtAt = nowMs || 1;
                        zombieBiteHoldX = player.x;
                        zombieBiteHoldUntil = nowMs + 1000;
                        zombieCombatAttackHit = true;
                        applyZombieDamage(10, 220, 0, nowMs, 'HEAVY ATTACK', true);
                        // Keep the hold anchor aligned if arena-edge handling nudges Olly inward.
                        zombieBiteHoldX = player.x;
                    }
                } else if (nowMs < zombieBiteHoldUntil) {
                    // Keep Olly exactly where the bite made contact.
                    player.x = zombieBiteHoldX;
                    jumping = false;
                    jumpT = 1;
                    jumpOffset = 0;
                }
            }

            if (!heavy && !zombieCombatAttackHit && elapsed >= 300 && elapsed <= 500) {
                zombieCombatAttackHit = true;
                applyZombieDamage(7, 165, 38, nowMs, 'CLAW SWIPE');
            }

            // A successful bite holds contact for 1s, then plays recoil and
            // return frames for another 400ms. A missed bite times out cleanly.
            const attackCompleteAt = heavy
                ? (zombieBiteCaughtAt > 0 ? (zombieBiteHoldUntil - zombieCombatStateStart + 400) : 2200)
                : 720;
            if (elapsed >= attackCompleteAt) {
                zombieCombatState = 'recover';
                zombieCombatStateStart = nowMs;
                zombieRecoveryDuration = heavy ? 1250 : 520;
                enemyAttackPhase = 'recover';
            }
            return;
        }

        if (zombieCombatState === 'recover') {
            // Use recovery to step back into a readable melee distance. This is
            // also the requested walk phase between claw/kick attacks.
            const desiredX = player.x - direction * 100;
            const step = Math.min(Math.abs(desiredX - zombieCombatX), 95 * dt);
            if (step > 0.5) {
                zombieCombatX += (desiredX >= zombieCombatX ? 1 : -1) * step;
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
            }
            zombieCombatWalkIndex += dt * 1000;
            if (nowMs - zombieCombatStateStart >= zombieRecoveryDuration) {
                zombieCombatState = 'ready';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 360;
                enemyAttackPhase = null;
            }
            return;
        }
    }


    function triggerZombieHitReaction(nowMs, heavy = false, longHit = false) {
        if (!isAIFight())
            return;
        if (isPatriciaFight()) { onPatriciaHit(nowMs, heavy); return; }
        const hurtRate = isChainFight() ? .82 : 1;   // Chain Goth reuses the zombie groans, pitched lower, until she has her own
        if (heavy) playSfx('goth-pain', .9, hurtRate); else playSfx(GOTH_HURT_SFX[Math.floor(Math.random() * GOTH_HURT_SFX.length)], .7, hurtRate);

        // V9.20 ring tiers: pink attacks can be interrupted; red and yellow attacks cannot (the hit still does damage).
        if (!isChainFight() && zombieCombatAttackType === 'heavyKick' && (zombieCombatState === 'windup' || zombieCombatState === 'heavyKick')) {
            zombieHitFlashUntil = nowMs + 115;
            return;
        }
        // Chain Goth cannot be knocked out of her swipe or spin, and she shrugs off hits while dizzy (the hits still count).
        if (isChainFight()) {
            if (zombieCombatState === 'windup' || zombieCombatState === 'swipe' || zombieCombatState === 'slam') {
                zombieHitFlashUntil = nowMs + 115;
                return;
            }
            if (zombieCombatState === 'stun') {
                zombieHitFlashUntil = nowMs + 115;
                return;
            }
            // Earned stun: three hits in quick succession (Heavy Attack = 2) make her dizzy.
            if (nowMs - chainStunLastHit > CHAIN_STUN_HIT_WINDOW_MS)
                chainStunHits = 0;
            chainStunHits += heavy ? 2 : 1;
            chainStunLastHit = nowMs;
            if (chainStunHits >= CHAIN_STUN_HITS) {
                startChainStun(nowMs);
                return;
            }
        }

        // Every clear hit still deals its damage, but repeated hits during the
        // same stagger do not endlessly extend the stun animation.
        if (zombieCombatState !== 'hit' || nowMs >= zombieHitStaggerUntil || longHit || heavy) {
            const awayDir = zombieCombatX >= player.x ? 1 : -1;
            let duration = longHit
                ? ZOMBIE_LONG_HURT_TOTAL_MS
                : (heavy ? Math.max(620, ZOMBIE_HURT_TOTAL_MS + 60) : ZOMBIE_HURT_TOTAL_MS);
            let strength = longHit ? 42 : (heavy ? 62 : 34);
            if (isChainFight()) {
                chainHurtHeavy = !!(heavy || longHit);
                duration = chainHurtHeavy ? CHAIN_HURT_HEAVY_MS : CHAIN_HURT_NORMAL_MS;
                strength = chainHurtHeavy ? 36 : 18;
            }

            zombieHitLong = !!longHit;
            zombieCombatState = 'hit';
            zombieCombatStateStart = nowMs;
            enemyAttackPhase = 'hit';
            zombieCombatAttackHit = true;
            zombieHitStaggerUntil = nowMs + duration;
            zombieHitReactionStart = nowMs;
            zombieHitDirection = awayDir;
            zombieHitStrength = strength;
            zombieHitFlashUntil = nowMs + 115;
            zombieCombatNextDecision = nowMs + duration + 180;

            zombieCombatX = Math.max(
                170,
                Math.min(COMBAT_W - 170, zombieCombatX + awayDir * strength)
            );
        }
    }

    let cheatGod = false;
    function applyZombieDamage(damage, range, pushDistance, nowMs, attackName, ignoreAir = false, ignoreDodge = false) {
        const horizontalDistance = Math.abs(zombieCombatX - player.x);
        const airborne = !ignoreAir && (jumping || jumpOffset < -20);
        const dodging = !ignoreDodge && player.invuln > nowMs;
        if (horizontalDistance > range || airborne || dodging) {
            ui.combatStatus.textContent = `↪ ${attackName} missed!`;
            if (isPatriciaFight() && (airborne || dodging)) patNote(patEvadeLog, nowMs);
            if (isPatriciaFight() && (airborne || dodging)) patSay(Math.random() < .5 ? 'nice-try' : 'nice-try-cutie', { cd: 7000, chance: .9, gap: 0 });   // V9.31: Olly dodged / jumped her attack
            return;
        }
        if (cheatGod) {
            ui.combatStatus.textContent = `🛡 ${attackName} blocked (cheat: no damage).`;
            return;
        }

        hp = Math.max(0, hp - damage);
        stats();
        playSfx(/HEAVY|SPIN/.test(attackName) || damage >= 15 ? 'olly-hurt-heavy' : 'olly-hurt', .9);

        const awayDir = player.x < zombieCombatX ? -1 : 1;
        playerHurtUntil = nowMs + OLLY_HURT_TOTAL_MS;
        playerHurtStart = nowMs;
        playerHurtDirection = awayDir;
        combatAnimationState = 'hurt';
        combatAnimationStart = nowMs;
        combatAnimationUntil = nowMs + OLLY_HURT_TOTAL_MS;
        ui.combatStatus.textContent = `💥 ${attackName}! -${damage} HP.`;
        kickShake(damage >= 15 ? 11 : (damage >= 10 ? 8 : 5), damage >= 15 ? 360 : 240);   // V9.30
        if (isPatriciaFight() && hp > 0 && hp <= maxHp * .3) patSay('kill-you', { once: 'lowOlly', gap: 0 });   // V9.31

        // Knockback always travels AWAY from the Zombie. Avoid repeated
        // full-distance corner shoves that can make the encounter unreadable.
        const requestedPush = Math.min(pushDistance, attackName === 'LUNGE + BITE' ? 72 : 34);
        let pushedX = player.x + awayDir * requestedPush;
        const edge = 165;
        if (pushedX < edge) {
            // Near the left wall, give Olly a little inward slide instead of
            // repeatedly pinning him against the boundary.
            pushedX = Math.max(edge, player.x + Math.min(18, requestedPush * .5));
        } else if (pushedX > COMBAT_W - edge) {
            pushedX = Math.min(COMBAT_W - edge, player.x - Math.min(18, requestedPush * .5));
        }
        player.x = Math.max(140, Math.min(COMBAT_W - 140, pushedX));
        if (hp <= 0 && !playerDeathTriggered) {
            triggerPlayerKO(nowMs);
        }
    }

    // After Olly has fallen, a short cutscene plays (a hand dragging him away) before the KNOCKED OUT pop-up.
    // File: assets/video/cutscene3/olly-taken.mp4  (a .mov of the same name is tried second). Missing file = skipped silently.
    function playTakenCutscene(done, customSources) {
        let finished = false;
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10050;background:#000;display:flex;align-items:center;justify-content:center;';
        const video = document.createElement('video');
        video.playsInline = true; video.autoplay = true; video.controls = false; video.preload = 'auto';
        video.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
        overlay.appendChild(video);
        const skip = document.createElement('button');
        skip.type = 'button'; skip.textContent = 'SKIP ▸';
        skip.style.cssText = 'position:absolute;right:22px;bottom:22px;padding:8px 16px;border:1px solid rgba(255,255,255,.35);border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Georgia,serif;cursor:pointer;opacity:.8;';
        overlay.appendChild(skip);
        const finish = () => {
            if (finished) return; finished = true;
            try { video.pause(); video.removeAttribute('src'); video.load(); } catch (e) {}
            overlay.remove(); done();
        };
        const sources = customSources || ['assets/video/cutscene3/ollytaken.mp4?v=9420', 'assets/video/cutscene3/olly-taken.mp4?v=9420', 'assets/video/cutscene3/ollytaken.mov?v=9420', 'assets/video/cutscene3/olly-taken.mov?v=9420'];
        let i = 0;
        const next = () => { if (i >= sources.length) { finish(); return; } video.src = sources[i++]; video.load(); video.play().catch(() => {}); };
        video.addEventListener('error', next);
        video.addEventListener('ended', finish);
        skip.addEventListener('click', finish);
        document.body.appendChild(overlay);
        playMusic('');
        next();
    }
    function triggerPlayerKO(nowMs) {
        if (mode !== 'combat' || playerDeathTriggered)
            return;
        playerDeathTriggered = true;
        playerHurtUntil = 0;
        combatAnimationState = 'ko';
        combatAnimationStart = nowMs;
        combatAnimationUntil = nowMs + OLLY_KO_TOTAL_MS;
        jumping = false;
        jumpT = 1;
        jumpOffset = 0;
        dodgeUntil = 0;
        attackAnimUntil = 0;
        heavyAttackAnimUntil = 0;
        enemyAttackPhase = null;
        ui.combatStatus.textContent = '💫 OLLY HAS BEEN KNOCKED OUT.';
        // The winner groans and strolls off the other way for 3 seconds before the 'taken' cutscene.
        if (isAIFight()) {
            const dir = zombieCombatX >= player.x ? 1 : -1;
            enemyLeaving = { dir };
            zombieCombatState = 'chase';
            zombieCombatStateStart = nowMs;
            zombieCombatWalkIndex = 0;
            zombieCombatAttackHit = true;
            // Olly's knockout sounds come first; only then does the winner groan and walk off (no chain noises muddying it).
            setTimeout(() => {
                if (!playerDeathTriggered || mode !== 'combat') return;
                if (isPatriciaFight()) { /* V9.30: no zombie groan for Patricia */ }
                else if (isChainFight()) playSfx(GOTH_HURT_SFX[0], .8, .82);
                else playSfx(GOTH_HURT_SFX[Math.floor(Math.random() * GOTH_HURT_SFX.length)], .8);
            }, 1100);
        }
        playSfx('olly-hurt-heavy', .9);
        playSfx('olly-ko', 1);   // the "ugh" as he drops
        setTimeout(() => { if (playerDeathTriggered) playSfx('olly-thud', 1); }, 860);   // and the thud as he hits the floor
        setLoopSfx('chain-drag', false);
        setTimeout(() => playTakenCutscene(() => endCombat(false)), Math.max(OLLY_KO_TOTAL_MS + 280, 3000));
    }

    // ------------------------------------------------------------------
    // V9.1: Chain Goth fight. Same finite-state approach as the Zombie Goth
    // (intro -> chase -> wind-up -> attack -> recover, plus hit and death) and it
    // shares the Zombie's state variables, but it has its own art, timing and
    // attack. The Zombie functions above are untouched.
    // ------------------------------------------------------------------
    function isAIFight() {
        return mode === 'combat' && (isBoss || target?.type === 'shambler' || target?.type === 'chain');
    }

    function isChainFight() {
        return mode === 'combat' && !isBoss && target?.type === 'chain';
    }
    function isPatriciaFight() {
        return mode === 'combat' && isBoss;
    }

    let chainDeathFace = 'left';
    let chainHurtHeavy = false;
    let chainPatternStep = 0;
    let chainStunHits = 0;
    let chainStunLastHit = -1e9;
    let chainSparks = [];
    let chainLastFrameKey = '';
    let chainLastPack = '';
    let chainLastIndex = -1;
    let chainSpinHitsDone = 0;
    let chainSlamFace = 'left', chainSlamWarned = false, chainSlamWaveHit = 0, chainSlamHitSound = 0;
    // God-of-War style stun meter in the enemy plate: fills with each hit, fades if you stop, goes gold and drains while she is stunned.
    let stunMeterW = '', stunMeterFull = null;
    function updateChainStunMeter(nowMs) {
        let pct = 0, full = false;
        if (zombieCombatState === 'stun') {
            pct = Math.max(0, 1 - (nowMs - zombieCombatStateStart) / CHAIN_STUN_MS);
            full = true;
        } else if (chainStunHits > 0) {
            const since = nowMs - chainStunLastHit;
            const keep = Math.max(0, Math.min(1, (CHAIN_STUN_HIT_WINDOW_MS - since) / 800));
            pct = Math.min(1, chainStunHits / CHAIN_STUN_HITS) * keep;
        }
        // Only touch the page when something actually changed (writing to the DOM 60 times a second made Safari stutter).
        const w = (pct * 100).toFixed(0) + '%';
        if (w !== stunMeterW) { stunMeterW = w; ui.enemyStun.style.width = w; }
        if (full !== stunMeterFull) { stunMeterFull = full; ui.enemyStunWrap.classList.toggle('full', full); ui.enemyStunLabel.textContent = full ? 'STUNNED!' : 'STUN'; }
    }
    function getChainCombatFrame(nowMs) {
        const elapsed = Math.max(0, nowMs - zombieCombatStateStart);
        const walkFrames = chainAtlas.walk?.frames?.length || 1;
        if (zombieCombatState === 'intro') {
            const preMs = CHAIN_INTRO_PRE_COUNT * CHAIN_INTRO_PRE_MS;
            const index = elapsed < preMs
                ? Math.floor(elapsed / CHAIN_INTRO_PRE_MS)
                : CHAIN_INTRO_PRE_COUNT + (Math.floor((elapsed - preMs) / CHAIN_INTRO_LOOP_MS) % CHAIN_INTRO_LOOP_COUNT);
            const left = ZOMBIE_INTRO_TOTAL_MS - elapsed;
            const grow = Math.max(0, Math.min(1, 1 - left / CHAIN_INTRO_GROW_MS));
            const eased = grow * grow * (3 - 2 * grow);
            return { pack: chainAtlas.intro, index, scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'chase' || zombieCombatState === 'recover') {
            const index = Math.floor(Math.max(0, zombieCombatWalkIndex) / CHAIN_WALK_FRAME_MS) % walkFrames;
            return { pack: chainAtlas.walk, index, scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'windup') {
            const p = Math.min(.999, elapsed / CHAIN_SWIPE_WINDUP_MS);
            return { pack: chainAtlas.swipe, index: Math.floor(p * CHAIN_SWIPE_WINDUP_COUNT), scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'slam') {
            const vf = CHAIN_SLAM_START_VF + Math.max(0, elapsed - CHAIN_SLAM_LEAD_MS) / CHAIN_SLAM_MS;
            let i = 0;
            for (let k = 0; k < CHAIN_SLAM_VF.length; k++) if (CHAIN_SLAM_VF[k] <= vf) i = k;
            return { pack: chainAtlas.slam, index: i, scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'stun') {
            const i = Math.min(CHAIN_STUN_FRAME_COUNT - 1, Math.floor(elapsed / CHAIN_STUN_FRAME_MS));
            return { pack: chainAtlas.stun, index: i, scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'hit') {
            const total = Math.max(1, zombieHitStaggerUntil - zombieHitReactionStart);
            const count = chainHurtHeavy ? CHAIN_HURT_HEAVY_FRAMES : CHAIN_HURT_NORMAL_FRAMES;
            const p = Math.max(0, Math.min(.999, (nowMs - zombieHitReactionStart) / total));
            return { pack: chainAtlas.hurt, index: Math.min(count - 1, Math.floor(p * count)), scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'swipe') {
            let acc = 0;
            let index = CHAIN_SWIPE_STRIKE_FIRST + CHAIN_SWIPE_STRIKE_MS.length - 1;
            for (let i = 0; i < CHAIN_SWIPE_STRIKE_MS.length; i++) {
                acc += CHAIN_SWIPE_STRIKE_MS[i];
                if (elapsed < acc) {
                    index = CHAIN_SWIPE_STRIKE_FIRST + i;
                    break;
                }
            }
            return { pack: chainAtlas.swipe, index, scale: CHAIN_RENDER_SCALE };
        }
        if (zombieCombatState === 'death') {
            const n = chainAtlas.death?.frames?.length || 1;
            const t = Math.max(0, nowMs - zombieCombatStateStart);
            return { pack: chainAtlas.death, index: Math.min(n - 1, Math.floor(t / CHAIN_DEATH_FRAME_MS)), scale: CHAIN_RENDER_SCALE * CHAIN_DEATH_SCALE };
        }
        // ready uses the neutral standing pose.
        return { pack: chainAtlas.swipe, index: 0, scale: CHAIN_RENDER_SCALE };
    }

    // Yellow danger zone in front of her (she is about to slam) + the spark wave itself.
    // Two shockwaves: the first runs toward Olly's side, the second runs the OTHER way (so standing behind her is no safer). Only jumping avoids them.
    function drawChainSlamFloor(c, x, face, t, nowMs) {
        const aimDir = face === 'left' ? -1 : 1;
        const y = CHAIN_FLOOR_Y + 12;
        const mkStrip = (x0, dir) => (len, fillA, rim) => {   // a flat, soft-edged strip on the floor from her feet out to 'len'
            if (len < 4) return;
            c.save();
            c.translate(x0 + dir * len / 2, y);
            c.scale(1, .2);
            const g = c.createRadialGradient(0, 0, len * .08, 0, 0, len / 2);
            g.addColorStop(0, `rgba(255,226,90,${fillA})`);
            g.addColorStop(.7, `rgba(255,214,60,${fillA * .75})`);
            g.addColorStop(1, 'rgba(255,214,60,0)');
            c.fillStyle = g;
            c.beginPath(); c.ellipse(0, 0, len / 2, 150, 0, 0, Math.PI * 2); c.fill();
            if (rim > 0) { c.lineWidth = 6; c.strokeStyle = `rgba(255,225,110,${rim})`; c.beginPath(); c.ellipse(0, 0, len / 2 - 3, 147, 0, 0, Math.PI * 2); c.stroke(); }
            c.restore();
        };
        if (t < CHAIN_SLAM_WARN_AT_MS) {   // the warning: the danger strips (both ways) flash twice with the ring, then vanish
            const fl = ringFlashAlpha(t / CHAIN_SLAM_WARN_AT_MS, CHAIN_SLAM_WARN_AT_MS);
            if (fl > .03) { mkStrip(x + aimDir * 30, aimDir)(CHAIN_WAVE_REACH, .34 * fl, .8 * fl); mkStrip(x - aimDir * 30, -aimDir)(CHAIN_WAVE_REACH, .34 * fl, .8 * fl); }
        }
        const wave = (dir, waveT) => {
            if (waveT < 0 || waveT >= CHAIN_WAVE_MS) return;
            const x0 = x + dir * 30, strip = mkStrip(x0, dir);
            const grow = Math.min(1, waveT / CHAIN_WAVE_GROW_MS);
            const reach = CHAIN_WAVE_REACH * (1 - Math.pow(1 - grow, 2));
            const fade = Math.max(0, 1 - Math.max(0, waveT - CHAIN_WAVE_GROW_MS) / (CHAIN_WAVE_MS - CHAIN_WAVE_GROW_MS));
            c.save();
            c.globalAlpha = fade;
            strip(reach, .26, .8);
            // bright leading edge
            c.save(); c.translate(x0 + dir * reach, y); c.scale(1, .2);
            const gl = c.createRadialGradient(0, 0, 0, 0, 0, 150);
            gl.addColorStop(0, 'rgba(255,255,220,.95)'); gl.addColorStop(1, 'rgba(235,255,110,0)');
            c.fillStyle = gl; c.beginPath(); c.arc(0, 0, 150, 0, Math.PI * 2); c.fill(); c.restore();
            // V9.30: far more dramatic flying sparks: streaks that fly up in arcs, hot white cores, orange embers, plus a burst at her feet
            // (deterministic scatter so they do not shimmer randomly)
            c.globalCompositeOperation = 'lighter';
            c.lineCap = 'round';
            for (let k = 0; k < 170; k++) {
                const u = (Math.sin(k * 91.7) * .5 + .5), v = (Math.sin(k * 37.3 + 1.7) * .5 + .5), w2 = (Math.sin(k * 12.9 + .4) * .5 + .5), z = (Math.sin(k * 5.3 + 2.2) * .5 + .5);
                const life = Math.min(1, waveT / (320 + 260 * w2));
                const px = x0 + dir * (u * reach) + dir * 40 * life;
                const peak = 40 + 190 * w2 * w2 + 40 * z;
                const lift = 4 * life * (1 - life) * peak;
                const py = y + (v - .5) * 30 - lift;
                const prevLife = Math.max(0, life - .09);
                const ppx = x0 + dir * (u * reach) + dir * 40 * prevLife;
                const ppy = y + (v - .5) * 30 - 4 * prevLife * (1 - prevLife) * peak;
                const a = Math.max(0, 1 - life * .85);
                const hot = k % 4 === 0;
                c.strokeStyle = hot ? `rgba(255,255,235,${a})` : (k % 2 ? `rgba(255,224,90,${a})` : `rgba(255,150,40,${a})`);
                c.lineWidth = hot ? 4.5 : 2.5 + 2 * w2;
                c.beginPath(); c.moveTo(ppx, ppy); c.lineTo(px, py); c.stroke();
                if (w2 > .55) { c.fillStyle = c.strokeStyle; c.beginPath(); c.arc(px, py, 2.5 + 3 * w2, 0, Math.PI * 2); c.fill(); }
            }
            // burst fountain right where the chain hit the floor
            if (waveT < 420) {
                const bp = waveT / 420;
                for (let k = 0; k < 40; k++) {
                    const ang = -Math.PI / 2 + (Math.sin(k * 17.1) * .5) * 2.1 + dir * .45;
                    const sp = 120 + 260 * (Math.sin(k * 8.7) * .5 + .5);
                    const bx = x0 + Math.cos(ang) * sp * bp, by = y + Math.sin(ang) * sp * bp + 520 * bp * bp * .35;
                    c.strokeStyle = `rgba(255,${200 + (k % 3) * 20},90,${1 - bp})`; c.lineWidth = 3.5;
                    c.beginPath(); c.moveTo(bx - Math.cos(ang) * 14, by - Math.sin(ang) * 14); c.lineTo(bx, by); c.stroke();
                }
                const fl = c.createRadialGradient(x0, y - 20, 0, x0, y - 20, 170);
                fl.addColorStop(0, `rgba(255,255,230,${.9 * (1 - bp)})`); fl.addColorStop(1, 'rgba(255,200,60,0)');
                c.fillStyle = fl; c.beginPath(); c.arc(x0, y - 20, 170, 0, Math.PI * 2); c.fill();
            }
            c.globalCompositeOperation = 'source-over';
            c.restore();
        };
        wave(aimDir, t - CHAIN_SLAM_WARN_AT_MS);
        wave(-aimDir, t - CHAIN_SLAM_HIT_AT_MS);
    }

    function drawChainCombat(c, enemyX, enemyY, nowMs) {
        const frame = getChainCombatFrame(nowMs);
        if (zombieCombatState !== 'death') chainDeathFace = enemyLeaving ? (enemyLeaving.dir < 0 ? 'left' : 'right') : (player.x < enemyX ? 'left' : 'right');
        const face = zombieCombatState === 'slam' ? chainSlamFace : chainDeathFace;   // she keeps facing the way she started the slam
        let offsetX = 0;
        const hurtBx = frame.pack === chainAtlas.hurt ? (chainAtlas.hurt.bx?.[frame.index] || 0) : 0;
        // Plant her feet: the hurt art drifts backwards, so cancel that drift (the game already shoves her back a little).
        offsetX -= hurtBx * frame.scale * (face === 'left' ? 1 : -1);
        let rotation = 0;
        let alpha = 1;

        if (zombieCombatState === 'hit') {
            const total = zombieHitStaggerUntil - zombieHitReactionStart || 1;
            const p = Math.max(0, Math.min(1, (nowMs - zombieHitReactionStart) / total));
            const ease = 1 - Math.pow(1 - p, 2);
            offsetX += zombieHitDirection * zombieHitStrength * (1 - ease);
            alpha = nowMs < zombieHitFlashUntil ? .72 : 1;
        } else if (zombieCombatState === 'slam' || zombieCombatState === 'stun') {
            alpha = nowMs < zombieHitFlashUntil ? .72 : 1;
        } else if (zombieCombatState === 'death') {
            const t = Math.max(0, nowMs - zombieCombatStateStart);
            const fadeStart = CHAIN_DEATH_FALL_MS + CHAIN_DEATH_HOLD_MS * .55;
            alpha = t < fadeStart ? 1 : Math.max(0, 1 - (t - fadeStart) / (CHAIN_DEATH_HOLD_MS * .45));
        }

        // Soft floor shadow so she sits on the ground like Olly does.
        if (zombieCombatState !== 'death') {
            c.save();
            c.fillStyle = SH(.28);
            c.beginPath();
            c.ellipse(enemyX + offsetX, CHAIN_FLOOR_Y + 6, 66 * (frame.scale / CHAIN_RENDER_SCALE), 11, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();
        }

        // Warning rings on the floor: red = swipe (dodge), yellow = slam (jump OVER her).
        if (zombieCombatState === 'slam') {
            const st = nowMs - zombieCombatStateStart;
            if (st < CHAIN_SLAM_WARN_AT_MS)
                drawAttackRing(c, enemyX, CHAIN_FLOOR_Y + 8, 300, 'yellow', Math.min(1, st / CHAIN_SLAM_WARN_AT_MS), false, nowMs, CHAIN_SLAM_WARN_AT_MS);
            drawChainSlamFloor(c, enemyX, face, st, nowMs);
        } else if (zombieCombatState === 'windup' && zombieCombatAttackType === 'swipe') {
            drawAttackRing(c, enemyX, CHAIN_FLOOR_Y + 8, CHAIN_SWIPE_RANGE, 'red', Math.min(1, (nowMs - zombieCombatStateStart) / CHAIN_SWIPE_WINDUP_MS), false, nowMs, CHAIN_SWIPE_WINDUP_MS);
        } else if (zombieCombatState === 'swipe') {
            drawAttackRing(c, enemyX, CHAIN_FLOOR_Y + 8, CHAIN_SWIPE_RANGE, 'red', 1, true, nowMs);
        }

        // V9.28: the walk art was drawn facing RIGHT (every other chain animation faces left), so flip it or she walks backwards.
        const drawFace = face;   // V9.30: the walk art now natively faces left like the rest of her animations
        const slamGlow = zombieCombatState === 'slam' && nowMs - zombieCombatStateStart < CHAIN_SLAM_WARN_AT_MS;
        if (slamGlow) {   // the yellow "ghost": she glows yellow while the slam is coming
            c.save(); c.shadowColor = 'rgba(255,214,60,1)'; c.shadowBlur = 34 + (prefOn('calm') ? 0 : 12 * Math.sin(nowMs / 70));
        }
        drawChainAtlasFrame(c, frame.pack, frame.index, enemyX, CHAIN_FLOOR_Y, drawFace, frame.scale, alpha, rotation, offsetX);
        if (slamGlow) c.restore();
        updateChainStunMeter(nowMs);

        // Stun feedback: a clear label over her head while she is stunned, and 1-2 pips while a stun is building.
        if (zombieCombatState === 'stun') {
            const t = nowMs - zombieCombatStateStart;
            const bob = Math.sin(nowMs / 140) * 4;
            const fade = Math.min(1, (CHAIN_STUN_MS - t) / 260, t / 120 + .3);
            c.save();
            c.globalAlpha = Math.max(0, fade);
            c.textAlign = 'center';
            c.font = '900 30px system-ui';
            c.lineWidth = 6;
            c.strokeStyle = 'rgba(20,8,24,.95)';
            c.fillStyle = '#ffe27a';
            c.strokeText('ENEMY STUNNED!', enemyX, CHAIN_FLOOR_Y - 395 + bob);
            c.fillText('ENEMY STUNNED!', enemyX, CHAIN_FLOOR_Y - 395 + bob);
            c.font = '900 24px system-ui';
            for (let i = 0; i < 3; i++) {
                const a = nowMs / 260 + i * 2.1;
                c.fillText('★', enemyX + Math.cos(a) * 46, CHAIN_FLOOR_Y - 360 + Math.sin(a) * 9 + bob);
            }
            c.restore();
        }

        // Ground-contact sparks (see CHAIN_CONTACTS). A spark fires for every contact frame that was passed since the last drawn frame,
        // so slow computers that skip animation frames still see every impact.
        const packName = frame.pack === chainAtlas.intro ? 'intro' : (frame.pack === chainAtlas.swipe ? 'swipe' : '');
        const dirSign = face === 'left' ? 1 : -1;
        if (packName) {
            const table = CHAIN_CONTACTS[packName] || {};
            const same = chainLastPack === packName;
            const prev = same ? chainLastIndex : -1;
            const cur = frame.index;
            for (const key of Object.keys(table)) {
                const fi = Number(key);
                let hit;
                if (!same) hit = fi === cur;
                else if (cur >= prev) hit = fi > prev && fi <= cur;
                else hit = fi > prev || fi <= cur;          // the intro loop wrapped round
                if (hit && !(same && cur === prev)) {
                    const pt = table[key];
                    chainSparks.push({ t: nowMs, x: enemyX + offsetX + dirSign * pt[0] * frame.scale * CHAIN_WIDTH_STRETCH, y: CHAIN_FLOOR_Y + pt[1] * frame.scale });
                }
            }
        }
        // V9.37: while the chain swings between its two ground contacts in the 3-2-1, it DRAGS along the floor: a line of sparks between the two bursts
        if (packName === 'intro') {
            const table = CHAIN_CONTACTS.intro, keys = Object.keys(table).map(Number).sort((u, v) => u - v), cur = frame.index;
            if (cur > keys[0] && cur <= keys[keys.length - 1]) {
                let i0 = 0; for (let i = 0; i < keys.length - 1; i++) if (keys[i] <= cur) i0 = i;
                const k0 = keys[i0], k1 = keys[i0 + 1], u = Math.max(0, Math.min(1, (cur - k0) / (k1 - k0)));
                const x0l = table[k0][0], x1l = table[k1][0], tipL = x0l + (x1l - x0l) * u;
                const wx = lx => enemyX + offsetX + dirSign * lx * frame.scale * CHAIN_WIDTH_STRETCH;
                c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
                const N = 22;
                for (let j = 0; j < N; j++) {
                    const q = j / (N - 1), lx = x0l + (tipL - x0l) * q;      // from the contact it left, up to the chain's current position
                    const ph = Math.sin(nowMs / 37 + j * 12.9) * .5 + .5, ph2 = Math.sin(nowMs / 53 + j * 7.3) * .5 + .5;
                    const al = (.25 + .65 * q) * (.55 + .45 * ph);
                    const px = wx(lx), py = CHAIN_FLOOR_Y - 33 * frame.scale + (ph2 - .5) * 7;
                    const len = 5 + 14 * ph * (.4 + q), up = 3 + 16 * ph2 * (.3 + q);
                    c.strokeStyle = j % 3 === 0 ? `rgba(255,248,220,${al})` : `rgba(255,201,94,${al})`; c.lineWidth = j % 3 === 0 ? 3.2 : 2.2;
                    c.beginPath(); c.moveTo(px, py); c.lineTo(px - dirSign * (x1l >= x0l ? -1 : 1) * len * .6, py - up); c.stroke();
                }
                c.restore();
            }
        }
        chainLastPack = packName;
        chainLastIndex = frame.index;
        chainSparks = chainSparks.filter(sp => nowMs - sp.t < CHAIN_SPARK_MS);
        for (const sp of chainSparks) {
            const p = (nowMs - sp.t) / CHAIN_SPARK_MS;
            c.save();
            c.globalAlpha = Math.max(0, 1 - p);
            c.lineCap = 'round';
            for (let i = 0; i < 9; i++) {
                const a = -Math.PI * (0.08 + 0.84 * (i / 8)) + Math.sin(i * 12.9) * .12;   // fan upward from the floor
                const r1 = 6 + p * 14, r2 = 16 + p * 46 + (i % 3) * 7;
                c.strokeStyle = i % 2 ? '#fff0b8' : '#ffc95e';
                c.lineWidth = i % 3 === 0 ? 4 : 2.5;
                c.beginPath();
                c.moveTo(sp.x + Math.cos(a) * r1, sp.y + Math.sin(a) * r1 * .8);
                c.lineTo(sp.x + Math.cos(a) * r2, sp.y + Math.sin(a) * r2 * .8);
                c.stroke();
            }
            c.fillStyle = '#fffbe6';
            c.beginPath();
            c.arc(sp.x, sp.y, Math.max(0, 9 * (1 - p)), 0, Math.PI * 2);
            c.fill();
            c.restore();
        }

        // Impact sparks, same as the Zombie hit reaction.
        if (zombieCombatState === 'hit') {
            const elapsed = nowMs - zombieHitReactionStart;
            if (elapsed < 240) {
                const p = elapsed / 240;
                const burstX = enemyX - zombieHitDirection * 18;
                const burstY = enemyY - 150;
                c.save();
                c.globalAlpha = Math.max(0, 1 - p);
                c.strokeStyle = '#c8f08a';
                c.lineWidth = 4;
                for (let i = 0; i < 6; i++) {
                    const a = (Math.PI * 2 * i) / 6 + .25;
                    const r1 = 8 + p * 5;
                    const r2 = 20 + p * 28;
                    c.beginPath();
                    c.moveTo(burstX + Math.cos(a) * r1, burstY + Math.sin(a) * r1);
                    c.lineTo(burstX + Math.cos(a) * r2, burstY + Math.sin(a) * r2);
                    c.stroke();
                }
                c.restore();
            }
        }
    }

    // ------------------------------------------------------------------
    // V9.25: PATRICIA (Level 1 boss). Same finite-state style as the Goths.
    // 300 HP, two stages (stage 2 starts at 150 HP and is also the retry checkpoint).
    // Moves: LUNGE (red ring: dodge or jump), SWORD COMBO x3 (red: dodge or jump), VANISH STRIKE (purple smoke,
    // she reappears on the other side of Olly), LIGHTNING SLAM (yellow: only jumping avoids it). Stage 2 adds lightning.
    // ------------------------------------------------------------------
    let patStage = 1, patCheckpoint = false, patStep = 0, patFace = 'left', patHitsDone = 0, patDoneOnce = false;
    let patVanishX = 0, patPlayerNoteAt = 0, patLastHurtGrunt = -1e9, patMoving = false, patMoveUntil = 0;
    // ---- V9.31: Patricia's voice lines. One voice at a time (a line never talks over another); attack grunts give way to lines. ----
    // Line -> length in ms. Which moment plays which line is decided in patSay(...) calls below (search "patSay").
    const PAT_VOICE_MS = { 'hey': 630, 'ugh-stop-it': 2010, 'nice-try': 1930, 'nice-try-cutie': 2530, 'who-do-you': 2900, 'pay-for-that': 2900, 'not-funny': 2200, 'kill-you': 5040, 'trying-hard': 2430,
        'grunt-1': 290, 'grunt-3': 620, 'grunt-4': 240, 'grunt-5': 890, 'grunt-6': 310, 'grunt-7': 410, 'grunt-8': 430, 'grunt-9': 1010 };
    const PAT_GRUNTS = ['grunt-1', 'grunt-3', 'grunt-4', 'grunt-5', 'grunt-6', 'grunt-7', 'grunt-8', 'grunt-9'];
    let patVoiceUntil = 0, patVoiceLast = {}, patVoiceOnce = {}, patLastGrunt = '', patVoiceIsGrunt = false, patLastAnyLine = 0, patStage2At = -1e9;
    function patVoiceReset() { patPunchLog = []; patEvadeLog = []; patJumpLog = []; patLastKind = ''; patCounter = false; patVoiceUntil = 0; patVoiceLast = {}; patVoiceOnce = {}; patLastGrunt = ''; patVoiceIsGrunt = false; patLastAnyLine = gnow(); patStage2At = -1e9; preloadSfx(Object.keys(PAT_VOICE_MS).map(n => 'patricia-' + n)); }
    // opts: cd = min ms before the SAME line repeats, chance = 0..1, once = key (only ever plays once per fight), gap = quiet ms needed after the previous voice
    function patSay(name, opts = {}) {
        if (!isPatriciaFight() || zombieDeathStarted || playerDeathTriggered || patSpeech || (typeof prefight !== 'undefined' && prefight && !prefight.ready)) return false;
        const nowMs = gnow();
        if (opts.once && patVoiceOnce[opts.once]) return false;
        if (nowMs < patVoiceUntil + (opts.gap ?? 500) && !(patVoiceIsGrunt && !PAT_GRUNTS.includes(name))) return false;   // a real line may cut off an attack grunt
        if (opts.cd && nowMs - (patVoiceLast[name] || -1e9) < opts.cd) return false;
        if (opts.chance !== undefined && Math.random() > opts.chance) return false;
        if (opts.once) patVoiceOnce[opts.once] = 1;
        patVoiceLast[name] = nowMs; patVoiceUntil = nowMs + (PAT_VOICE_MS[name] || 1500); patVoiceIsGrunt = false; patLastAnyLine = nowMs;
        playSfx('patricia-' + name, 1);
        return true;
    }
    function patGrunt() {
        if (!isPatriciaFight() || zombieDeathStarted || gnow() < patVoiceUntil) return;
        let g; do { g = PAT_GRUNTS[Math.floor(Math.random() * PAT_GRUNTS.length)]; } while (g === patLastGrunt && PAT_GRUNTS.length > 1);
        patLastGrunt = g; patVoiceUntil = gnow() + PAT_VOICE_MS[g]; patVoiceIsGrunt = true; playSfx('patricia-' + g, .95);
    }
    function initPatricia(resume) {
        loadPatriciaAssets();
        patVoiceReset();
        patDeathPrep();   // V9.42: load the death cutscene in the background so it can start the instant she falls
        patReward = null;
        chainLastGood = null;   // V9.39: never show the Chain Goth's last frame (the dead chain on the floor) before Patricia's art has loaded
        patStage = resume ? 2 : 1;
        patStep = 0; patFace = 'left'; patHitsDone = 0; patDoneOnce = false;
        zombieCombatX = COMBAT_W - 320;
        zombieCombatState = 'intro';
        zombieCombatStateStart = gnow();
        zombieCombatNextDecision = Infinity;
        zombieCombatAttackType = 'none';
        enemyLeaving = null;
        zombieDeathStarted = false;
        if (resume) {
            combatHp = PAT_STAGE2_HP;
            const t = gnow();
            prefightHold = false;
            zombieIntroActive = true;
            zombieIntroStart = t;
            zombieIntroEndAt = t + ZOMBIE_INTRO_TOTAL_MS;
            enemyAttackPhase = 'intro';
        }
    }
    function patGone() {   // while she is a cloud of smoke Olly cannot hit her
        return isPatriciaFight() && zombieCombatState === 'smoke' && (gnow() - zombieCombatStateStart) >= PAT_SMOKE_GONE_AT_MS && (gnow() - zombieCombatStateStart) < PAT_SMOKE_REAPPEAR_AT_MS;
    }
    function patInvuln() { return isPatriciaFight() && zombieCombatState === 'smoke'; }   // V9.41: she cannot be hurt at all while she is in her smoke cloud
    function patSide() { return player.x >= zombieCombatX ? 1 : -1; }
    function patBeginAttack(kind, nowMs) {
        if (kind !== 'vanish') patGrunt();   // V9.31: an effort grunt as she starts each attack
        patFace = patSide() < 0 ? 'left' : 'right';
        patHitsDone = 0;
        zombieCombatAttackHit = false;
        zombieCombatAttackType = kind;
        zombieCombatStateStart = nowMs;
        enemyAttackPhase = 'windup';
        chainSwipeAim = patSide();
        if (kind === 'lunge') {
            zombieCombatState = 'lunge'; queueRingTutorial('red');
            // (no chain noises for Patricia)
            ui.combatStatus.textContent = 'Patricia raises her sword. DODGE or JUMP!';
        } else if (kind === 'combo') {
            zombieCombatState = 'combo'; queueRingTutorial('red');
            ui.combatStatus.textContent = 'A three-hit sword combo. Keep moving!';
        } else if (kind === 'lightning') {
            zombieCombatState = 'lightning'; queueRingTutorial('yellow');
            // (no chain noises for Patricia)
            ui.combatStatus.textContent = 'Lightning! The whole floor is dangerous. JUMP!';
        } else {   // vanish
            zombieCombatState = 'smoke'; queueRingTutorial('purple');
            patVanishX = patBehindX();   // V9.36: this is only where she is heading NOW; it follows Olly until she appears
            // (no chain noises for Patricia)
            ui.combatStatus.textContent = 'Patricia vanishes in smoke. Watch where she appears!';
        }
    }
    // V9.36: she reads Olly. Recent behaviour changes what she does (see the weights below).
    let patPunchLog = [], patEvadeLog = [], patJumpLog = [], patLastKind = '', patWasAir = false, patCounter = false;
    function patNote(arr, nowMs) { arr.push(nowMs); while (arr.length > 8) arr.shift(); }
    function patRecent(arr, ms, nowMs) { return arr.filter(t => nowMs - t < ms).length; }
    function patBehindX() {   // directly behind Olly (the side he is NOT facing), always from his live position
        const dir = combatFacing === 'left' ? 1 : -1;
        let x = player.x + dir * 150;
        if (x < 170 || x > COMBAT_W - 170) x = player.x - dir * 150;
        return Math.max(170, Math.min(COMBAT_W - 170, x));
    }
    function patFrozen() { return isPatriciaFight() && zombieCombatState === 'stage2'; }
    function patChooseAttack(nowMs, forced) {
        const gap = Math.abs(player.x - zombieCombatX);
        const punches = patRecent(patPunchLog, 3000, nowMs), evades = patRecent(patEvadeLog, 10000, nowMs), jumps = patRecent(patJumpLog, 5000, nowMs);
        const w = { lunge: 3, combo: 3, vanish: 2, lightning: patStage === 2 ? 2.5 : 0 };
        if (gap > 270) { w.combo = 0; w.lunge += 3; w.vanish += 3; }   // too far to swing at him: close in or teleport
        else if (gap < 200) { w.combo += 3; w.lunge -= 1.5; }
        if (punches >= 3) w.combo += 6;                                 // he is spamming punches: punish it
        if (jumps >= 2) { if (w.lightning) w.lightning += 7; w.lunge += 1; }   // he keeps jumping: lightning only hits jumpers' landing
        if (evades >= 2) w.vanish += 4;                                // he keeps dodging: go around him
        if (w[patLastKind]) w[patLastKind] *= .2;                       // never the same move twice in a row
        let next = forced;
        if (!next) {
            let tot = 0; for (const k in w) tot += Math.max(0, w[k]);
            let r = Math.random() * tot; next = 'lunge';
            for (const k in w) { const v = Math.max(0, w[k]); if (r < v) { next = k; break; } r -= v; }
        }
        patLastKind = next; patStep++;
        patBeginAttack(next, nowMs);
    }
    function patToRecover(nowMs, ms) {
        zombieCombatState = 'recover';
        zombieCombatStateStart = nowMs;
        zombieRecoveryDuration = ms;
        enemyAttackPhase = 'recover';
        zombieCombatAttackType = 'none';
    }
    function patDamage(dmg, range, push, name, nowMs, ignoreAir = false, ignoreDodge = false) {
        applyZombieDamage(dmg, range, push, nowMs, name, ignoreAir, ignoreDodge);
    }
    function onPatriciaHit(nowMs, heavy) {
        // V9.30: no zombie groans for Patricia (her own hurt voice lines are still to come)
        zombieHitFlashUntil = nowMs + 120;
        if (patStage === 1 && combatHp <= PAT_STAGE2_HP && combatHp > 0) { patStartStage2(nowMs); return; }   // V9.36: the hit that takes her to half health
        const st = zombieCombatState;
        if (!heavy) { patNote(patPunchLog, nowMs); if (patRecent(patPunchLog, 3000, nowMs) >= 3 && (st === 'chase' || st === 'recover' || st === 'ready')) patCounter = true; }
        // V9.31 voice: a heavy hit makes her complain; the first one earns "who do you think you are"; light punches only sometimes get a "hey" / "ugh".
        if (heavy) { if (!patSay('who-do-you', { once: 'firstHeavy', gap: 0 }) && !patSay('ugh-stop-it', { cd: 9000, gap: 0 })) { patVoiceUntil = 0; patGrunt(); } }   // a Heavy hit always gets a sound
        else if (combatHp <= PAT_HP * .25 && patSay('not-funny', { once: 'lowHp', gap: 0 })) { }
        else if (!patSay(Math.random() < .5 ? 'hey' : 'ugh-stop-it', { cd: 7000, chance: .4 })) { if (Math.random() < .4 && nowMs - patLastHurtGrunt > 1300) { patLastHurtGrunt = nowMs; patGrunt(); } }
        // V9.39: every hit makes her flinch (a punch = short flinch, Heavy = the long one). Mid-attack she only flinches during the WIND-UP (before the strike lands).
        const e = nowMs - zombieCombatStateStart;
        const canFlinch = st === 'chase' || st === 'recover' || st === 'ready' || (st === 'lunge' && e < PAT_LUNGE_WINDUP_MS) || (st === 'combo' && e < PAT_COMBO_WINDUP_MS);
        if (canFlinch) {
            // V9.41: pick one of the four reactions (never the same twice in a row); a Heavy always gets one of the two big ones
            let k; do { k = heavy ? 2 + Math.floor(Math.random() * 2) : Math.floor(Math.random() * 4); } while (k === patHurtLast);
            patHurtLast = patHurtSeg = k;
            patHurtMs = (PAT_HURT_SEGS[k][1] - PAT_HURT_SEGS[k][0] + 1) * PAT_HURT_FRAME_MS;
            if (nowMs >= patVoiceUntil) { patVoiceUntil = nowMs + 400; patVoiceIsGrunt = true; playSfx('patricia-' + PAT_HURT_GRUNTS[k], .95); }   // each reaction has its own noise
            zombieCombatState = 'phurt';
            zombieCombatStateStart = nowMs;
            enemyAttackPhase = 'hurt';
            zombieCombatNextDecision = Infinity;
            zombieCombatAttackType = 'none';
        }
    }
    function patStartStage2(nowMs) {   // V9.36: the fight pauses, the camera pushes in on her, she reacts and warns him; then she goes straight into lightning
        patStage = 2; patCheckpoint = true; patStep = 0; patCounter = false;
        zombieCombatState = 'stage2'; zombieCombatStateStart = nowMs; enemyAttackPhase = 'hurt';
        zombieCombatNextDecision = Infinity; zombieCombatAttackType = 'none'; patStage2At = nowMs;
        patVoiceUntil = 0; patVoiceIsGrunt = true; patSay('pay-for-that', { gap: 0 });
        ui.combatStatus.textContent = 'HALF HEALTH! Patricia is furious: lightning is next.';
        try { ui.enemyHp.style.background = 'linear-gradient(90deg,#8e1230,#ff3d6e)'; ui.enemyHp.parentElement.classList.add('pat-enraged'); } catch (e) {}
    }
    function triggerPatriciaDefeat(nowMs) {
        if (!isPatriciaFight() || zombieDeathStarted) return;
        zombieDeathStarted = true;
        zombieCombatState = 'death';
        zombieCombatStateStart = nowMs;
        enemyAttackPhase = 'death';
        zombieCombatNextDecision = Infinity;
        zombieDeathEndAt = nowMs + PAT_DEFEAT_HOLD_MS;
        ui.combatStatus.textContent = 'Patricia is down.';
        patReward = { phase: 'cutscene' };
        held.up = held.down = held.left = held.right = false;
        if (patVid && patVid.v.error) patVid.failed = true;
        if (patVid && !patVid.failed) {   // the cutscene is (almost always) already loaded: straight in
            patVid.ov.style.opacity = '1'; patVid.ov.style.pointerEvents = 'auto'; patVid.skip.style.display = 'block';
            try { patVid.v.currentTime = 0; } catch (e) {}
            patVid.v.muted = false;
            patVid.v.play().catch(() => { patVid.v.muted = true; patVid.v.play().catch(() => {}); });
            setTimeout(() => { if (patVid && patVid.started && !patVid.done && patVid.v.currentTime < .05) patCutsceneDone(); }, 3000);   // it never started: carry on rather than sit on black
            playMusic('', 120);   // the video carries the boss music itself
            patVid.started = true;
        } else setTimeout(patCutsceneDone, 600);   // no cutscene file yet: skip it
    }

    function updatePatriciaAI(dt, nowMs) {
        if (!isPatriciaFight() || playerDeathTriggered)
            return;
        const st = zombieCombatState;
        const elapsed = nowMs - zombieCombatStateStart;
        const toward = patSide();

        if (st === 'intro') {
            if (!zombieIntroActive) {
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 700;
                enemyAttackPhase = null;
                ui.combatStatus.textContent = 'FIGHT! Patricia has 300 HP. Make it count.';
            }
            return;
        }
        if (st === 'death') {
            // V9.42: the fight no longer ends here: cutscene -> chest -> rewards -> level complete (see patCutsceneDone / patChestInteract)
            return;
        }
        if (st === 'phurt') {
            if (elapsed >= patHurtMs) { patToRecover(nowMs, 380); }
            return;
        }
        if (st === 'stage2') {
            patFace = player.x < zombieCombatX ? 'left' : 'right';
            if (elapsed >= PAT_STAGE2_MS) patBeginAttack('lightning', nowMs);   // straight into the lightning
            return;
        }
        { const air = jumping || jumpOffset < -20; if (air && !patWasAir) patNote(patJumpLog, nowMs); patWasAir = air; }
        // Half health (fallback if the hit path missed it): she snaps into stage 2 as soon as she is between moves.
        if (patStage === 1 && combatHp <= PAT_STAGE2_HP && combatHp > 0 && (st === 'chase' || st === 'recover' || st === 'ready')) { patStartStage2(nowMs); return; }

        if (st === 'chase' || st === 'recover' || st === 'ready') {
            // V9.34: she only ever walks TOWARD Olly (no walking backwards), and only plays the walk while she is really moving (no gliding in the idle pose).
            const gap = Math.abs(player.x - zombieCombatX);
            if (gap > PAT_STAND_OFF) {
                const step = Math.min(gap - PAT_STAND_OFF, PAT_CHASE_SPEED * (patStage === 2 ? 1.15 : 1) * dt);
                if (step > .3) {
                    zombieCombatX += toward * step;
                    zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
                    zombieCombatWalkIndex += dt * 1000;
                    patMoveUntil = nowMs + 140;
                }
            }
            patMoving = nowMs < patMoveUntil;
            if (st === 'recover' && elapsed >= zombieRecoveryDuration) {
                zombieCombatState = 'chase'; zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + (patStage === 2 ? 260 : 520) + Math.random() * 380;
                enemyAttackPhase = null;
            } else if (patCounter && elapsed > 200 && gap < PAT_STAND_OFF + 110) {
                patCounter = false; patPunchLog = []; patChooseAttack(nowMs, 'combo');   // he spammed punches: she answers at once
            } else if (st === 'chase' && nowMs >= zombieCombatNextDecision && (gap < PAT_STAND_OFF + 80 || nowMs > zombieCombatNextDecision + 1400)) {
                patChooseAttack(nowMs);
            }
            return;
        }

        if (st === 'lunge') {
            const strikeAt = PAT_LUNGE_WINDUP_MS;
            if (elapsed >= strikeAt && !zombieCombatAttackHit && elapsed >= strikeAt + PAT_LUNGE_HIT_AT_MS) {
                zombieCombatAttackHit = true;
                playSfx('chain-impact', .9, 1.1);
                enemyAttackPhase = 'active';
                patDamage(PAT_LUNGE_DAMAGE, PAT_LUNGE_RANGE, PAT_LUNGE_PUSH, 'SWORD LUNGE', nowMs);
            }
            if (elapsed < strikeAt && Math.abs(player.x - zombieCombatX) > 620) { patToRecover(nowMs, 250); return; }   // V9.39: Olly is nowhere near: she gives up the lunge
            // V9.36: she keeps her eyes on Olly (and sidles closer) until just before the thrust, then lunges at where he IS
            if (elapsed < strikeAt - 260) {
                patFace = player.x < zombieCombatX ? 'left' : 'right';
                const g = Math.abs(player.x - zombieCombatX);
                if (g > 230) zombieCombatX += (patFace === 'left' ? -1 : 1) * Math.min(g - 230, 70 * dt);
            }
            if (elapsed >= strikeAt && elapsed < strikeAt + 300) {
                const d = patFace === 'left' ? -1 : 1, g = (player.x - zombieCombatX) * d;
                if (g > 150) zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX + d * Math.min(g - 150, 700 * dt)));
            }
            if (elapsed >= strikeAt + PAT_LUNGE_STRIKE_FRAMES * PAT_LUNGE_FRAME_MS + 120) patToRecover(nowMs, 650);
            return;
        }
        if (st === 'combo') {
            if (patHitsDone < PAT_COMBO_HITS_AT_MS.length && Math.abs(player.x - zombieCombatX) > 440) { patToRecover(nowMs, 250); return; }   // V9.39: Olly ran away: she stops swinging
            if (elapsed < PAT_COMBO_WINDUP_MS - 150) {   // V9.36: she tracks him through the wind-up
                patFace = player.x < zombieCombatX ? 'left' : 'right';
                const g = Math.abs(player.x - zombieCombatX);
                if (g > 200) zombieCombatX += (patFace === 'left' ? -1 : 1) * Math.min(g - 200, 80 * dt);
            }
            const t = elapsed - PAT_COMBO_WINDUP_MS;
            while (t >= 0 && patHitsDone < PAT_COMBO_HITS_AT_MS.length && t >= PAT_COMBO_HITS_AT_MS[patHitsDone]) {
                patHitsDone++;
                enemyAttackPhase = 'active';
                playSfx('chain-impact', .8, 1.2);
                patDamage(PAT_COMBO_DAMAGE, PAT_COMBO_RANGE, PAT_COMBO_PUSH, 'SWORD COMBO', nowMs);
            }
            if (t >= PAT_COMBO_FRAMES * PAT_COMBO_FRAME_MS + 80) patToRecover(nowMs, 700);
            return;
        }
        if (st === 'smoke') {
            if (elapsed < PAT_SMOKE_REAPPEAR_AT_MS) patVanishX = patBehindX();   // V9.36: she follows Olly's LIVE position while she is gone
            if (elapsed >= PAT_SMOKE_REAPPEAR_AT_MS && !zombieCombatAttackHit) {
                // she steps out of the smoke on the other side of Olly and turns on him
                zombieCombatAttackHit = true;
                zombieCombatX = patBehindX();
                patFace = player.x < zombieCombatX ? 'left' : 'right';
                zombieCombatState = 'vstrike';
                zombieCombatStateStart = nowMs;
                zombieCombatAttackHit = false;
                enemyAttackPhase = 'windup';
                // (no chain noises for Patricia)
                ui.combatStatus.textContent = 'Behind you! DODGE or JUMP!';
                patGrunt();
            }
            return;
        }
        if (st === 'vstrike') {
            const strikeAt = PAT_VSTRIKE_APPEAR_MS;
            if (!zombieCombatAttackHit && elapsed >= strikeAt + PAT_LUNGE_HIT_AT_MS) {
                zombieCombatAttackHit = true;
                playSfx('chain-impact', .95, 1.0);
                enemyAttackPhase = 'active';
                patDamage(PAT_VSTRIKE_DAMAGE, PAT_LUNGE_RANGE, PAT_LUNGE_PUSH + 6, 'VANISH STRIKE', nowMs);
            }
            if (elapsed >= strikeAt + PAT_LUNGE_STRIKE_FRAMES * PAT_LUNGE_FRAME_MS + 120) patToRecover(nowMs, 700);
            return;
        }
        if (st === 'lightning') {
            const strikeAt = PAT_LIGHT_WINDUP_MS;
            if (elapsed >= strikeAt && elapsed < strikeAt + PAT_LIGHT_HIT_WINDOW_MS && !zombieCombatAttackHit) {
                if (elapsed - strikeAt < 60 && patHitsDone === 0) { patHitsDone = 1; playSfx('chain-impact-spin', 1, .7); }
                const airborne = jumping || jumpOffset < -20;
                if (Math.abs(player.x - zombieCombatX) <= PAT_LIGHT_RANGE && !airborne) {
                    zombieCombatAttackHit = true;
                    patDamage(PAT_LIGHT_DAMAGE, 1e5, 44, 'LIGHTNING SLAM', nowMs, true, true);
                }
            }
            if (elapsed >= strikeAt + PAT_LIGHT_LOOP_MS + PAT_LIGHT_SETTLE_MS) patToRecover(nowMs, 700);
            return;
        }
        // anything unexpected: carry on
        patToRecover(nowMs, 500);
    }

    // V9.39: idle plays forwards then backwards (ping-pong) so there is never a jump from the last frame to the first
    function patIdle(nowMs) {
        const n = patAtlas.idle.frames.length, cyc = (n - 1) * 2, k = Math.floor(nowMs / PAT_IDLE_FRAME_MS) % cyc;
        return { pack: patAtlas.idle, index: k < n ? k : cyc - k, flipArt: false };
    }
    let patHurtMs = 500, patHurtSeg = 0, patHurtLast = -1, patReward = null, patVid = null;
    // V9.36: every frame carries a "next" frame and how far we are towards it (frac), so the drawing can cross-fade: no more "bitty" steps.
    function getPatriciaFrame(nowMs) {
        const st = zombieCombatState;
        const elapsed = Math.max(0, nowMs - zombieCombatStateStart);
        const mk = (pack, t, n, loop, base = 0, flipArt = false) => {
            t = Math.max(0, t);
            let i = Math.floor(t), fr = t - i;
            if (loop) i %= n;
            else if (i >= n - 1) { i = n - 1; fr = 0; }
            const nx = loop ? (i + 1) % n : Math.min(n - 1, i + 1);
            return { pack, index: base + i, next: base + nx, frac: fr, flipArt };
        };
        if ((st === 'chase' || st === 'recover' || st === 'ready') && patMoving)
            return mk(patAtlas.walk, Math.max(0, zombieCombatWalkIndex) / PAT_WALK_FRAME_MS, patAtlas.walk.frames.length, true, 0, true);
        if (st === 'recover' || st === 'ready' || st === 'intro')
            return patIdle(nowMs);
        if (st === 'lunge' || st === 'vstrike') {
            const wind = st === 'lunge' ? PAT_LUNGE_WINDUP_MS : PAT_VSTRIKE_APPEAR_MS;
            if (elapsed < wind) {
                const p = Math.min(.999, elapsed / wind);
                const from = st === 'lunge' ? 0 : 21;   // (the vanish strike appears already crouched: it only plays the second half of the wind-up)
                return mk(patAtlas.lunge, from + p * (PAT_LUNGE_WINDUP_FRAMES - from), PAT_LUNGE_WINDUP_FRAMES, false);
            }
            return mk(patAtlas.lunge, (elapsed - wind) / PAT_LUNGE_FRAME_MS, PAT_LUNGE_STRIKE_FRAMES, false, PAT_LUNGE_WINDUP_FRAMES);
        }
        if (st === 'combo')
            return mk(patAtlas.combo, (elapsed - PAT_COMBO_WINDUP_MS) / PAT_COMBO_FRAME_MS, PAT_COMBO_FRAMES, false);
        if (st === 'smoke')
            return mk(patAtlas.smoke, elapsed / PAT_SMOKE_FRAME_MS, PAT_SMOKE_FRAMES, false);
        if (st === 'lightning') {
            if (elapsed < PAT_LIGHT_WINDUP_MS)
                return mk(patAtlas.lightning, elapsed / PAT_LIGHT_WINDUP_MS * PAT_LIGHT_WINDUP_FRAMES, PAT_LIGHT_WINDUP_FRAMES, false);
            const t = elapsed - PAT_LIGHT_WINDUP_MS;
            if (t < PAT_LIGHT_LOOP_MS) {   // the discharge frames loop (ping-pong 16..30)
                if (t < 130) return mk(patAtlas.lightning, PAT_LIGHT_WINDUP_FRAMES + t / 65, 16, false);
                const first = 16, n = 15, cyc = (n - 1) * 2, k = Math.floor(t / PAT_LIGHT_LOOP_FRAME_MS);
                const m2 = k % cyc;
                return { pack: patAtlas.lightning, index: first + (m2 < n ? m2 : cyc - m2), flipArt: false };
            }
            const u = Math.min(.999, (t - PAT_LIGHT_LOOP_MS) / PAT_LIGHT_SETTLE_MS);   // settle: the rising frames played backwards
            return { pack: patAtlas.lightning, index: Math.max(0, 10 - Math.floor(u * 11)), flipArt: false };
        }
        if (st === 'phurt') {
            const sg = PAT_HURT_SEGS[patHurtSeg];
            return { pack: patAtlas.salv, index: sg[0] + Math.min(sg[1] - sg[0], Math.floor(elapsed / PAT_HURT_FRAME_MS)), flipArt: false, dySrc: PAT_HURT_DY[patHurtSeg] };
        }
        if (st === 'stage2') {   // all four reactions one after another
            let t = elapsed;
            for (let k = 0; k < 4; k++) {
                const sg = PAT_HURT_SEGS[k], n = sg[1] - sg[0] + 1;
                if (t < n * PAT_HURT_FRAME_MS || k === 3) return { pack: patAtlas.salv, index: sg[0] + Math.min(n - 1, Math.floor(t / PAT_HURT_FRAME_MS)), flipArt: false, dySrc: PAT_HURT_DY[k] };
                t -= n * PAT_HURT_FRAME_MS;
            }
        }
        if (st === 'death')
            return { pack: patAtlas.idle, index: 0, flipArt: false };   // V9.41: no death animation
        return patIdle(nowMs);
    }

    // ---- V9.42: Patricia's fall -> death cutscene (preloaded) -> chest in the arena -> reward pop-up -> Level 1 complete ----
    // Cutscene file: assets/video/cutscene4/patricia-death.mp4 (the video carries the BossFight1 music; afterwards BossFight1 restarts 15 s in).
    // REWARDS ARE PLACEHOLDERS: edit PAT_REWARDS (icon, name, description, what it does).
    const PAT_REWARDS = [
        { id: 'maxhp', icon: '❤', name: 'Max HP +20', desc: 'Olly can take a little more punishment. (Fully heals him too.)', apply() { maxHp += 20; hp = maxHp; stats(); } },
        { id: 'heavycd', icon: '⚡', name: 'Heavy Attack recharge -20%', desc: 'Heavy Attack comes back faster (15s becomes 12s).', apply() { heavyCdMul = Math.max(.3, heavyCdMul * .8); } },
    ];
    const PAT_CUTSCENE_FILES = ['assets/video/cutscene4/patricia-death.mp4', 'assets/video/cutscene4/patriciadeath.mp4', 'assets/video/cutscene4/PatriciaDeath.mp4', 'assets/video/cutscene4/patricia-death.mov'];
    function patDeathPrep() {
        if (patVid) return;
        const ov = document.createElement('div');
        ov.id = 'pat-death-overlay';
        ov.style.cssText = 'position:fixed;inset:0;z-index:10050;background:#000;opacity:0;pointer-events:none;transition:opacity .2s ease;display:flex;align-items:center;justify-content:center;';
        const v = document.createElement('video');
        v.playsInline = true; v.preload = 'auto'; v.controls = false;
        v.style.cssText = 'width:100%;height:100%;object-fit:contain;background:#000;';
        const skip = document.createElement('button');
        skip.type = 'button'; skip.textContent = 'SKIP ▸'; skip.style.display = 'none';
        skip.style.cssText += 'display:none;position:absolute;right:22px;bottom:22px;padding:8px 16px;border:1px solid rgba(255,255,255,.35);border-radius:10px;background:rgba(0,0,0,.55);color:#fff;font:700 13px Georgia,serif;cursor:pointer;opacity:.85;';
        ov.appendChild(v); ov.appendChild(skip); document.body.appendChild(ov);
        patVid = { ov, v, skip, ready: false, failed: false, started: false, done: false };
        let i = 0;
        const next = () => { if (i >= PAT_CUTSCENE_FILES.length) { patVid.failed = true; return; } v.src = PAT_CUTSCENE_FILES[i++] + '?v=9420'; v.load(); };
        v.addEventListener('error', next);
        v.addEventListener('canplaythrough', () => { patVid.ready = true; });
        v.addEventListener('loadeddata', () => { patVid.ready = true; });
        v.addEventListener('ended', () => patCutsceneDone());
        skip.addEventListener('click', () => patCutsceneDone());
        next();
        // warm-up: a muted play/pause makes the browser really download and decode the first frames now (preload alone is only a hint)
        v.muted = true;
        v.play().then(() => { if (!patVid.started) { v.pause(); try { v.currentTime = 0; } catch (e) {} } v.muted = false; }).catch(() => { v.muted = false; });
    }
    function patDeathCleanup() {
        if (patVid) { try { patVid.v.pause(); patVid.v.removeAttribute('src'); patVid.v.load(); } catch (e) {} patVid.ov.remove(); patVid = null; }
        const ro = document.getElementById('pat-reward-overlay'); if (ro) ro.remove();
        patReward = null;
    }
    function patCutsceneDone() {
        if (!patReward || patReward.phase !== 'cutscene') return;
        if (patVid) { patVid.done = true; try { patVid.v.pause(); } catch (e) {} patVid.ov.style.opacity = '0'; patVid.ov.style.pointerEvents = 'none'; patVid.skip.style.display = 'none'; }
        playMusicFrom('boss', 15, 400);   // the cutscene music carries on from where the video left it
        const dir = player.x < COMBAT_W / 2 ? 1 : -1;
        patReward = { phase: 'chest', t0: gnow(), x: Math.max(240, Math.min(COMBAT_W - 240, player.x + dir * 320)) };
        ui.combatStatus.textContent = 'A chest has appeared! Walk up to it and click it.';
    }
    function patChestInteract() {
        if (!patReward || patReward.phase !== 'chest') return;
        if (gnow() - patReward.t0 < 700) return;   // still dropping in
        if (Math.abs(player.x - patReward.x) > 210) { ui.combatStatus.textContent = 'Walk up to the chest first.'; return; }
        patReward.phase = 'open'; patReward.openAt = gnow();
        playSfx('pickup', 1);
        setTimeout(patShowRewards, 1100);
    }
    function patShowRewards() {
        if (!patReward) return;
        patReward.phase = 'rewards';
        const taken = new Set();
        const ov = document.createElement('div');
        ov.id = 'pat-reward-overlay'; ov.className = 'overlay';
        ov.style.cssText = 'position:fixed;inset:0;z-index:10040;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.6);';
        const box = document.createElement('div');
        box.className = 'overlay-box center inventory-box';
        box.innerHTML = '<div class="inventory-kicker">THE CHEST OPENS</div><h2 class="story-title">REWARDS</h2><div class="inventory-capacity">Take what you earned.</div><div class="inventory-slots gg-reward-slots"></div><div class="inv-panel-note gg-reward-note"></div><button type="button" class="primary gg-reward-done" disabled>CONTINUE</button>';
        const grid = box.querySelector('.gg-reward-slots'), note = box.querySelector('.gg-reward-note'), done = box.querySelector('.gg-reward-done');
        grid.style.cssText = 'grid-template-columns:repeat(auto-fit,minmax(150px,210px)) !important;justify-content:center !important;';
        const finish = () => { ov.remove(); patReward = null; endCombat(true); };
        PAT_REWARDS.forEach(r => {
            const b = document.createElement('button');
            b.type = 'button'; b.className = 'inventory-slot inventory-filled gg-reward';
            b.innerHTML = `<div style="font-size:2.3rem;line-height:1">${r.icon}</div><span style="font-size:.95rem!important;max-width:100%">${r.name}</span>`;
            b.style.aspectRatio = 'auto'; b.style.padding = '14px 8px'; b.style.cursor = 'pointer';
            b.addEventListener('mouseenter', () => { note.textContent = r.desc; });
            b.addEventListener('click', () => {
                if (taken.has(r.id)) return; taken.add(r.id); r.apply(); playSfx('pickup', 1);
                b.style.opacity = '.45'; b.querySelector('span').textContent = r.name + ' ✓'; note.textContent = r.desc;
                if (taken.size === PAT_REWARDS.length) done.disabled = false;
            });
            grid.appendChild(b);
        });
        const takeAll = document.createElement('button');
        takeAll.type = 'button'; takeAll.textContent = 'TAKE ALL'; takeAll.className = 'inventory-close-button';
        takeAll.addEventListener('click', () => { grid.querySelectorAll('.gg-reward').forEach(b => b.click()); });
        box.insertBefore(takeAll, done);
        done.addEventListener('click', finish);
        ov.appendChild(box); document.body.appendChild(ov);
    }
    function drawPatChest(c, nowMs) {   // PLACEHOLDER chest, drawn with shapes until the real animation is ready
        const R = patReward, t = nowMs - R.t0, cx = R.x, fy = CHAIN_FLOOR_Y;
        const drop = Math.max(0, 1 - t / 650), bounce = t > 650 && t < 950 ? Math.sin((t - 650) / 300 * Math.PI) * 14 : 0;
        const dy = -(drop * drop) * 520 - bounce;
        const opening = R.phase === 'open' || R.phase === 'rewards', op = opening ? Math.min(1, (nowMs - R.openAt) / 700) : 0;
        c.save();
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(cx, fy + 6, 92 * (1 - drop * .5), 14, 0, 0, Math.PI * 2); c.fill();
        c.translate(cx, fy + dy);
        if (!opening && t > 700) { const g = c.createRadialGradient(0, -60, 10, 0, -60, 190); const a = .28 + .12 * Math.sin(nowMs / 260); g.addColorStop(0, `rgba(255,170,210,${a})`); g.addColorStop(1, 'rgba(255,120,190,0)'); c.fillStyle = g; c.fillRect(-200, -260, 400, 400); }
        const W = 150, H = 82;
        const body = c.createLinearGradient(0, -H, 0, 0); body.addColorStop(0, '#5a2f3c'); body.addColorStop(1, '#2b1620');
        c.fillStyle = body; c.strokeStyle = '#d8b66a'; c.lineWidth = 4;
        c.beginPath(); c.roundRect(-W / 2, -H, W, H, 8); c.fill(); c.stroke();
        c.fillStyle = '#d8b66a'; c.fillRect(-W / 2 + 22, -H, 12, H); c.fillRect(W / 2 - 34, -H, 12, H);
        // lid (tilts up when opening)
        c.save(); c.translate(-W / 2, -H); c.rotate(-op * 1.15);
        const lid = c.createLinearGradient(0, -44, 0, 0); lid.addColorStop(0, '#6d3846'); lid.addColorStop(1, '#40212c');
        c.fillStyle = lid; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(W / 2, -64, W, 0); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = '#d8b66a'; c.fillRect(22, -30, 12, 30); c.fillRect(W - 34, -30, 12, 30);
        c.restore();
        if (op < 1) { c.fillStyle = '#f0d48a'; c.beginPath(); c.roundRect(-11, -H - 6, 22, 26, 4); c.fill(); c.strokeStyle = '#7a5a1c'; c.lineWidth = 2; c.stroke(); }
        if (opening) { const g = c.createRadialGradient(0, -H, 5, 0, -H, 40 + op * 220); g.addColorStop(0, `rgba(255,240,200,${.9 * (1 - op * .3)})`); g.addColorStop(1, 'rgba(255,200,120,0)'); c.fillStyle = g; c.fillRect(-300, -H - 260, 600, 340); }
        c.restore();
        if (R.phase === 'chest' && t > 800 && Math.abs(player.x - R.x) <= 210) {
            c.save(); c.font = '700 30px "Cormorant Garamond", Georgia, serif'; c.textAlign = 'center'; c.lineWidth = 5; c.strokeStyle = '#1a0c18'; c.fillStyle = '#ffe3ee';
            const by = fy - 150 + Math.sin(nowMs / 240) * 5; c.strokeText('CLICK TO OPEN', cx, by); c.fillText('CLICK TO OPEN', cx, by); c.restore();
        }
    }
    function patPuffs(c, x, y, p, nowMs, n) {
        if (p <= .01) return;
        c.save();
        for (let i = 0; i < n; i++) {
            const u = ((nowMs / 1250) + i / n) % 1, r1 = Math.sin(i * 12.9898) * 43758.5453, rr = r1 - Math.floor(r1);
            const px = x + (rr - .5) * 150 * (.5 + u), py = y - 14 - u * (120 + (i % 4) * 38), rad = 26 + u * 62 + (i % 3) * 9;
            const a = p * (1 - u) * Math.min(1, u / .12) * .55;
            const g = c.createRadialGradient(px, py, 0, px, py, rad);
            g.addColorStop(0, `rgba(196,128,255,${a})`); g.addColorStop(.55, `rgba(120,50,190,${a * .6})`); g.addColorStop(1, 'rgba(70,20,120,0)');
            c.fillStyle = g; c.beginPath(); c.arc(px, py, rad, 0, Math.PI * 2); c.fill();
        }
        c.restore();
    }
    function drawPatriciaCombat(c, enemyX, enemyY, nowMs) {
        if (patReward && patReward.phase !== 'cutscene') { drawPatChest(c, nowMs); return; }
        const st = zombieCombatState;
        const frame = getPatriciaFrame(nowMs);
        const locked = (st === 'lunge' || st === 'combo' || st === 'lightning' || st === 'vstrike' || st === 'smoke' || st === 'phurt' || st === 'stage2' || st === 'death');
        let face;
        if (enemyLeaving) face = enemyLeaving.dir < 0 ? 'left' : 'right';
        else if (locked) face = patFace;
        else { face = player.x < enemyX ? 'left' : 'right'; patFace = face; }
        const drawFace = frame.flipArt ? (face === 'left' ? 'right' : 'left') : face;
        const alpha = nowMs < zombieHitFlashUntil ? .75 : 1;
        // floor shadow
        if (st !== 'death' && !patGone()) {
            c.save(); c.fillStyle = SH(.30);
            c.beginPath(); c.ellipse(enemyX, CHAIN_FLOOR_Y + 6, 74, 12, 0, 0, Math.PI * 2); c.fill(); c.restore();
        }
        // V9.36: warning rings flash twice during the wind-up, then go (red = dodge or jump, yellow = only jumping works, purple = special ability)
        const ringY = CHAIN_FLOOR_Y + 8, tt = nowMs - zombieCombatStateStart;
        if (st === 'lunge') drawAttackRing(c, enemyX, ringY, PAT_LUNGE_RANGE - 40, 'red', tt / PAT_LUNGE_WINDUP_MS, tt >= PAT_LUNGE_WINDUP_MS, nowMs, PAT_LUNGE_WINDUP_MS);
        else if (st === 'combo') drawAttackRing(c, enemyX, ringY, PAT_COMBO_RANGE - 30, 'red', tt / PAT_COMBO_WINDUP_MS, tt >= PAT_COMBO_WINDUP_MS, nowMs, PAT_COMBO_WINDUP_MS);
        else if (st === 'lightning') drawAttackRing(c, enemyX, ringY, PAT_LIGHT_RANGE, 'yellow', tt / PAT_LIGHT_WINDUP_MS, tt >= PAT_LIGHT_WINDUP_MS, nowMs, PAT_LIGHT_WINDUP_MS);
        else if (st === 'smoke') {
            const pr = tt / PAT_SMOKE_REAPPEAR_AT_MS;
            if (tt < PAT_SMOKE_GONE_AT_MS) drawAttackRing(c, enemyX, ringY, 150, 'purple', pr, false, nowMs, PAT_SMOKE_REAPPEAR_AT_MS);   // her own ring: she is using a special ability
            drawAttackRing(c, patVanishX, ringY, 230, 'purple', pr, false, nowMs, PAT_SMOKE_REAPPEAR_AT_MS);                                // where she will strike
        }
        // V9.41: our own soft purple smoke puffs on top of the clip (hides hard edges, makes the vanish / reappear flow)
        if (st === 'smoke') {
            const cl = v => Math.max(0, Math.min(1, v));
            patPuffs(c, enemyX, CHAIN_FLOOR_Y, cl(tt / 350) * (1 - cl((tt - PAT_SMOKE_GONE_AT_MS) / 500)), nowMs, 16);
            patPuffs(c, patVanishX, CHAIN_FLOOR_Y, cl((tt - 1250) / 400) * (1 - cl((tt - PAT_SMOKE_REAPPEAR_AT_MS) / 400)), nowMs, 16);
        } else if (st === 'vstrike') patPuffs(c, enemyX, CHAIN_FLOOR_Y, 1 - Math.min(1, tt / 500), nowMs, 14);
        const packName = Object.keys(patAtlas).find(k => patAtlas[k] === frame.pack);
        const rs = PAT_SCALE * PAT_SIZE_K * (PAT_PACK_K[packName] || 1);
        const dy = -((PAT_FOOT_SRC[packName] || 0) + (frame.dySrc || 0)) * rs;   // keeps her feet on the same line in every clip
        c.save(); c.translate(0, dy);
        drawChainAtlasFrame(c, frame.pack, frame.index, enemyX, CHAIN_FLOOR_Y, drawFace, rs, alpha, 0, 0);
        c.restore();
        if (patSpeech) drawSpeechBubble(c, enemyX - 20, 178, patSpeech.text, nowMs - patSpeech.start, -250);   // bubble sits beside her head so it never covers her HP box
    }
    // V9.30: comic speech bubble above a character's head (tail points down at (x, tipY)).
    function drawSpeechBubble(c, x, tipY, text, age, shiftX = 0) {
        // V9.34: gothic bubble: ink-black, cut corners, double pink line, a long thorn-like tail and little stars.
        const pop = Math.min(1, age / 160);
        if (pop <= 0) return;
        try { document.fonts?.load('italic 600 30px "Cormorant Garamond"'); } catch (e) {}
        c.save();
        c.font = 'italic 600 34px "Cormorant Garamond", Georgia, serif';
        const w = Math.min(680, c.measureText(text).width + 90), h = 70, k = 14;
        const bx = Math.max(16, Math.min(COMBAT_W - w - 16, x + shiftX - w / 2)), by = tipY - 22 - h;
        const baseL = Math.max(bx + 30, Math.min(bx + w - 70, x - 14));
        c.translate(x, tipY); c.scale(.85 + .15 * pop, .85 + .15 * pop); c.translate(-x, -tipY);
        c.globalAlpha = pop;
        const shape = (ins) => {
            const l = bx + ins, r = bx + w - ins, t = by + ins, b = by + h - ins, kk = Math.max(2, k - ins);
            c.beginPath();
            c.moveTo(l + kk, t); c.lineTo(r - kk, t); c.lineTo(r, t + kk); c.lineTo(r, b - kk); c.lineTo(r - kk, b);
            if (!ins) { c.lineTo(baseL + 34, b); c.quadraticCurveTo(baseL + 20, b + 8, x, tipY); c.quadraticCurveTo(baseL + 8, b + 4, baseL, b); }
            c.lineTo(l + kk, b); c.lineTo(l, b - kk); c.lineTo(l, t + kk); c.closePath();
        };
        c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 12; c.shadowOffsetY = 4;
        shape(0); c.fillStyle = '#12061a'; c.fill();
        c.shadowColor = 'transparent';
        c.lineJoin = 'miter'; c.strokeStyle = '#ef87aa'; c.lineWidth = 3; c.stroke();
        shape(7); c.strokeStyle = 'rgba(239,135,170,.45)'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#ef87aa'; c.font = '700 16px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
        c.fillText('\u2726', bx + 20, by + h / 2); c.fillText('\u2726', bx + w - 20, by + h / 2);
        c.font = 'italic 600 34px "Cormorant Garamond", Georgia, serif'; c.fillStyle = '#ffe9f1';
        c.fillText(text, bx + w / 2, by + h / 2 + 2);
        c.restore();
    }

    function triggerChainDeath(nowMs) {
        if (!isChainFight() || zombieDeathStarted)
            return;
        zombieDeathStarted = true;
        playSfx('zombie-death', .9, .85);   // her groan, pitched lower (no grunts of her own yet)
        playSfx('chain-drop', 1);
        setTimeout(() => playSfx('chain-clatter', .9), 500);   // her chain falls and clatters
        zombieDeathEndAt = nowMs + CHAIN_DEATH_FALL_MS + CHAIN_DEATH_HOLD_MS;
        zombieCombatState = 'death';
        zombieCombatStateStart = nowMs;
        zombieCombatAttackHit = true;
        enemyAttackPhase = 'death';
        zombieCombatNextDecision = Infinity;
        ui.combatStatus.textContent = '💀 CHAIN GOTH DEFEATED.';
    }

    function startChainStun(nowMs) {
        chainStunHits = 0;
        zombieCombatState = 'stun';
        zombieCombatStateStart = nowMs;
        zombieCombatAttackHit = true;
        zombieHitFlashUntil = nowMs + 115;
        enemyAttackPhase = 'stun';
        zombieCombatNextDecision = Infinity;
        // Give Olly his punches back so the stun is a real chance to hit her.
        comboCount = 0;
        attackCooldownUntil = 0;
        ui.combatStatus.textContent = '⭐ ENEMY STUNNED! Hit her now!';
    }

    function chooseChainAttack(nowMs) {
        const next = CHAIN_PATTERN[chainPatternStep % CHAIN_PATTERN.length];
        chainPatternStep++;
        if (next === 'slam') {
            zombieCombatAttackType = 'slam';
            zombieCombatAttackHit = false;
            zombieCombatState = 'slam';
            zombieCombatStateStart = nowMs;
            enemyAttackPhase = 'windup';
            chainSwipeAim = player.x >= zombieCombatX ? 1 : -1;   // the side she is aiming at
            chainSlamFace = chainSwipeAim < 0 ? 'left' : 'right';   // she only ever starts the slam facing Olly
            chainSlamWarned = false; chainSlamWaveHit = 0; chainSlamHitSound = 0;
            playSfx('chain-rattle', .8);
            queueRingTutorial('yellow');
            ui.combatStatus.textContent = 'Two shockwaves, one each way. You cannot dodge them: JUMP!';
            return;
        }
        zombieCombatAttackType = 'swipe';
        zombieCombatAttackHit = false;
        zombieCombatState = 'windup';
        zombieCombatStateStart = nowMs;
        enemyAttackPhase = 'windup';
        playSfx('chain-rattle', .7);
        chainSwipeAim = player.x >= zombieCombatX ? 1 : -1;   // the side she is aiming at
        queueRingTutorial('red');
        ui.combatStatus.textContent = 'The Chain Goth whips her chain back. DODGE it!';
    }

    function updateChainAI(dt, nowMs) {
        if (!isChainFight() || playerDeathTriggered)
            return;

        if (zombieIntroActive) {
            if (nowMs >= zombieIntroEndAt) {
                zombieIntroActive = false;
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs;
                zombieCombatWalkIndex = 0;
                enemyAttackPhase = null;
                ui.combatStatus.textContent = 'The Chain Goth is coming for you. Get ready.';
            }
            return;
        }

        if (zombieCombatState === 'death') {
            if (nowMs >= zombieDeathEndAt)
                endCombat(true);
            return;
        }

        if (zombieCombatState === 'hit') {
            if (nowMs >= zombieHitStaggerUntil) {
                zombieHitLong = false;
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 220;
                enemyAttackPhase = null;
            }
            return;
        }

        const dx = player.x - zombieCombatX;
        const distance = Math.abs(dx);
        const direction = dx < 0 ? -1 : 1;

        if (zombieCombatState === 'ready') {
            if (distance > CHAIN_STAND_OFF + 40) {
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs;
            } else if (nowMs - zombieCombatStateStart >= 280) {
                chooseChainAttack(nowMs);
            }
            return;
        }

        if (zombieCombatState === 'chase') {
            if (distance > CHAIN_STAND_OFF) {
                const desiredX = player.x - direction * (CHAIN_STAND_OFF - 20);
                const targetX = Math.max(280, Math.min(COMBAT_W - 280, desiredX));
                const step = Math.min(Math.abs(targetX - zombieCombatX), CHAIN_CHASE_SPEED * dt);
                zombieCombatX += (targetX >= zombieCombatX ? 1 : -1) * step;
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
                zombieCombatWalkIndex += dt * 1000;
                zombieCombatPrevX = zombieCombatX;
                return;
            }
            if (nowMs >= zombieCombatNextDecision)
                chooseChainAttack(nowMs);
            return;
        }

        if (zombieCombatState === 'windup') {
            if (nowMs - zombieCombatStateStart >= CHAIN_SWIPE_WINDUP_MS) {
                zombieCombatState = 'swipe';
                zombieCombatStateStart = nowMs;
                zombieCombatAttackHit = false;
                enemyAttackPhase = 'active';
            }
            return;
        }

        if (zombieCombatState === 'swipe') {
            const elapsed = nowMs - zombieCombatStateStart;
            // The sweep is low along the floor in front of her: jumping or dodging avoids it.
            if (!zombieCombatAttackHit && elapsed >= CHAIN_SWIPE_HIT_AT_MS) {
                zombieCombatAttackHit = true;
                playSfx('chain-impact', .9);
                // Red swipe (short reach): only a dodge avoids it. Jumping (even over her) does not.
                applyZombieDamage(CHAIN_SWIPE_DAMAGE, CHAIN_SWIPE_RANGE, CHAIN_SWIPE_PUSH, nowMs, 'CHAIN SWIPE', false, false);   // red tier: dodge or jump both avoid it
            }
            if (elapsed >= CHAIN_SWIPE_TOTAL_MS + 60) {
                zombieCombatState = 'recover';
                zombieCombatStateStart = nowMs;
                zombieRecoveryDuration = CHAIN_RECOVER_MS;
                enemyAttackPhase = 'recover';
            }
            return;
        }

        if (zombieCombatState === 'slam') {
            const elapsed = nowMs - zombieCombatStateStart;
            const aim = chainSwipeAim;
            // While she winds up she steps in towards Olly until he is about a jump away.
            if (elapsed < CHAIN_SLAM_WARN_AT_MS && (player.x - zombieCombatX) * aim > CHAIN_SLAM_CLOSE_TO) {
                const step = Math.min((player.x - zombieCombatX) * aim - CHAIN_SLAM_CLOSE_TO, CHAIN_SLAM_GLIDE * dt);
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX + aim * step));
            }
            // V9.37: two shockwaves. Wave 0 runs toward Olly's side, wave 1 runs the other way. Both hurt anything on the ground (only jumping avoids them).
            [[CHAIN_SLAM_WARN_AT_MS, aim], [CHAIN_SLAM_HIT_AT_MS, -aim]].forEach(([at, dirW], wi) => {
                if (elapsed < at || elapsed >= at + CHAIN_WAVE_MS) return;
                const bit = 1 << wi, waveT = elapsed - at;
                if (!((chainSlamHitSound | 0) & bit)) { chainSlamHitSound = (chainSlamHitSound | 0) | bit; playSfx('chain-impact-spin', .95); ui.combatStatus.textContent = wi === 0 ? 'Shockwave! ...and another one the other way. JUMP!' : 'The second shockwave! JUMP!'; }
                if ((chainSlamWaveHit | 0) & bit) return;
                const grow = Math.min(1, waveT / CHAIN_WAVE_GROW_MS);
                const reach = 30 + CHAIN_WAVE_REACH * (1 - Math.pow(1 - grow, 2));
                const rel = (player.x - zombieCombatX) * dirW;   // > 0 = in the direction this wave is travelling
                const airborne = jumping || jumpOffset < -20;
                if (rel > -20 && rel < reach && !airborne) {
                    chainSlamWaveHit = (chainSlamWaveHit | 0) | bit;
                    applyZombieDamage(CHAIN_SLAM_DAMAGE, 1e5, CHAIN_SLAM_PUSH, nowMs, 'CHAIN SLAM', true, true);
                }
            });
            if (elapsed >= CHAIN_SLAM_TOTAL_MS) {
                zombieCombatState = 'recover';
                zombieCombatStateStart = nowMs;
                zombieRecoveryDuration = CHAIN_RECOVER_MS + 250;
                enemyAttackPhase = 'recover';
            }
            return;
        }

        if (zombieCombatState === 'stun') {
            if (nowMs - zombieCombatStateStart >= CHAIN_STUN_MS) {
                chainStunHits = 0;
                zombieCombatState = 'chase';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 300;
                zombieCombatWalkIndex = 0;
                enemyAttackPhase = null;
                ui.combatStatus.textContent = 'The Chain Goth shakes it off.';
            }
            return;
        }

        if (zombieCombatState === 'recover') {
            const desiredX = player.x - direction * (CHAIN_STAND_OFF - 20);
            const step = Math.min(Math.abs(desiredX - zombieCombatX), 95 * dt);
            if (step > 0.5) {
                zombieCombatX += (desiredX >= zombieCombatX ? 1 : -1) * step;
                zombieCombatX = Math.max(170, Math.min(COMBAT_W - 170, zombieCombatX));
            }
            zombieCombatWalkIndex += dt * 1000;
            if (nowMs - zombieCombatStateStart >= zombieRecoveryDuration) {
                zombieCombatState = 'ready';
                zombieCombatStateStart = nowMs;
                zombieCombatNextDecision = nowMs + 280;
                enemyAttackPhase = null;
            }
            return;
        }
    }

    let lastCountPhase = -1;
    function drawZombieCountdown(c, nowMs) {
        if (prefightHold) return;
        if (!zombieIntroActive) { lastCountPhase = -1; return; }
        const elapsed = Math.max(0, nowMs - zombieIntroStart);
        const phase = Math.min(3, Math.floor(elapsed / ZOMBIE_COUNTDOWN_PHASE_MS));
        if (phase !== lastCountPhase) { lastCountPhase = phase; playSfx(phase === 3 ? 'fight-shout' : 'countdown-tick', .9); }   // one tick per number, a shout on FIGHT
        const phaseT = (elapsed % ZOMBIE_COUNTDOWN_PHASE_MS) / ZOMBIE_COUNTDOWN_PHASE_MS;
        const img = phase === 0 ? zombieCountdownFrames[3]
            : phase === 1 ? zombieCountdownFrames[2]
            : phase === 2 ? zombieCountdownFrames[1]
            : zombieCountdownFrames.fight;
        if (!img || !img.complete || !img.naturalWidth || !img.naturalHeight) return;
        const isFight = phase === 3;
        const pulse = isFight ? 1 + Math.sin(phaseT * Math.PI) * .07 : .96 + Math.sin(phaseT * Math.PI) * .04;
        const maxW = isFight ? 560 : 240;
        const maxH = isFight ? 220 : 210;
        const scale = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight) * pulse;
        const w = img.naturalWidth * scale;
        const h = img.naturalHeight * scale;
        c.save();
        c.globalAlpha = isFight ? 1 : .96;
        c.shadowColor = 'rgba(239,135,170,.65)';
        c.shadowBlur = isFight ? 24 : 14;
        c.translate(COMBAT_W / 2, COMBAT_H / 2 - 50);
        c.drawImage(img, -w / 2, -h / 2, w, h);
        c.restore();
    }

    function drawCombat() {
        syncHiRes(ui.combatCanvas, cctx, COMBAT_W, COMBAT_H);
        let zoomed = false;
        if (isBoss && zombieCombatState === 'stage2') {   // V9.36: half-health beat: the camera pushes in on Patricia, then eases back
            const e = gnow() - zombieCombatStateStart, up = Math.min(1, e / 600), down = Math.min(1, (PAT_STAGE2_MS - e) / 450);
            const z = 1 + .15 * Math.sin(Math.max(0, Math.min(up, down)) * Math.PI / 2);
            if (z > 1.002) { zoomed = true; cctx.save(); const cx = Math.max(300, Math.min(COMBAT_W - 300, zombieCombatX)), cy = 420; cctx.translate(cx, cy); cctx.scale(z, z); cctx.translate(-cx, -cy); }
        }
        drawCombatBackground(cctx);
        const shakeNow = performance.now();
        if (shakeNow < shakeUntil) {   // screen shake: the whole arena jolts, then settles
            const p = 1 - (shakeNow - shakeStart) / Math.max(1, shakeUntil - shakeStart);
            cctx.save(); cctx.translate(Math.sin(shakeNow / 21) * shakeMag * p, Math.cos(shakeNow / 17) * shakeMag * .6 * p);
            drawCombatInner();
            cctx.restore();
        } else drawCombatInner();
        if (zoomed) cctx.restore();
    }
    function drawCombatInner() {
        if (isBoss) { cctx.save(); cctx.translate(0, PAT_FLOOR_SHIFT); }
        drawCombatInner2();
        if (isBoss) cctx.restore();
    }
    function drawCombatInner2() {

        const enemyX = zombieCombatX;
        const enemyY = COMBAT_GROUND_Y;
        const nowMs = gnow();
        const enemyType = target?.type || (isBoss ? 'chain' : 'shambler');

        if (combatAnimationUntil && nowMs >= combatAnimationUntil && combatAnimationState !== 'idle') {
            if (combatAnimationState === 'ko') {
                // Hold the final KO frame until the knockout flow moves to the
                // checkpoint/death screen.
                combatAnimationUntil = 0;
            } else if (combatAnimationState !== 'jump' || !jumping) {
                combatAnimationState = 'idle';
                combatAnimationUntil = 0;
            }
        }

        const anim = getCombatAnimationFrame(nowMs);
        const renderHurt = playerHurtUntil > nowMs;
        if (drinkAnim) drawOllyDrink(cctx, player.x, player.y, nowMs);
        else if (isBoss) {   // V9.30: Olly is smaller next to Patricia (scaled around his feet)
            const fy = player.y + OLLY_DRAW_FOOT_OFFSET + 20, k = PAT_OLLY_SCALE;
            cctx.save(); cctx.translate(player.x, fy); cctx.scale(k, k); cctx.translate(-player.x, -fy);
            drawOllyWorldCombat(cctx, player.x, player.y, anim, nowMs / 1000, renderHurt, jumpOffset);
            cctx.restore();
        }
        else drawOllyWorldCombat(cctx, player.x, player.y, anim, nowMs / 1000, renderHurt, jumpOffset);
        if (nowMs < attackCooldownUntil && !playerDeathTriggered) {   // V9.19: make the punch rest impossible to miss
            const left = ((attackCooldownUntil - nowMs) / 1000).toFixed(1);
            cctx.save(); cctx.textAlign = 'center'; cctx.font = '700 26px system-ui, sans-serif';
            cctx.lineWidth = 5; cctx.strokeStyle = 'rgba(10,6,14,.85)'; cctx.fillStyle = '#ffd9e6';
            const tx = player.x, ty = player.y - 330 + jumpOffset;
            cctx.strokeText(`Out of breath ${left}s`, tx, ty); cctx.fillText(`Out of breath ${left}s`, tx, ty);
            cctx.restore();
        }
        if (!isBoss && target?.type === 'shambler' && !zombieIntroActive) {
            const heavyRing = zombieCombatAttackType === 'heavyKick';
            const ringKind = heavyRing ? 'red' : 'pink', ringR = heavyRing ? 235 : 165, ringY = COMBAT_GROUND_Y + RING_FLOOR_OFFSET;
            if (zombieCombatState === 'windup')
                drawAttackRing(cctx, enemyX, ringY, ringR, ringKind, (nowMs - zombieCombatStateStart) / (heavyRing ? BITE_WINDUP_MS : 560), false, nowMs, heavyRing ? BITE_WINDUP_MS : 560);
            else if (zombieCombatState === 'claw' || zombieCombatState === 'heavyKick')
                drawAttackRing(cctx, enemyX, ringY, ringR, ringKind, 1, true, nowMs);
        }
        drawZombieCombat(cctx, enemyX, enemyY, nowMs);
        drawZombieCountdown(cctx, nowMs);

        // (Olly's HP now lives in the HTML HUD top-left, so the old canvas panel is gone.)

        // Readable but not boring attack telegraph. It sits high enough to avoid
        // covering either fighter and pulses only during the wind-up.
        // (The old "ATTACK INCOMING" banner is replaced by the floor rings.)

        updateComboHud(nowMs);
    }

    // Olly's punch meter lives in his HUD (next to HP): 3 pips fill, then a 5s cooldown.
    let comboHudKey = '';
    function updateComboHud(nowMs) {
        const el = document.getElementById('combo-hud');
        if (!el) return;
        const cooling = nowMs < attackCooldownUntil;
        const secs = cooling ? Math.ceil((attackCooldownUntil - nowMs) / 100) / 10 : 0;
        const key = (cooling ? 'c' + secs : 'n' + comboCount) + (mode === 'combat' ? 'm' : 'x');
        if (key === comboHudKey) return;
        comboHudKey = key;
        el.style.display = mode === 'combat' ? 'flex' : 'none';
        el.classList.toggle('tired', cooling);
        el.querySelectorAll('.combo-pips i').forEach((pip, i) => pip.classList.toggle('on', !cooling && i < comboCount));
        el.querySelector('#combo-text').textContent = cooling ? `Resting ${secs.toFixed(1)}s` : 'Combo';
    }

    function drawOllyWorldCombat(c, px, py, anim, t, hurt, offsetY=0) {
        c.save();
        const visualY = py + offsetY + (anim?.visualOffsetY || 0) + OLLY_DRAW_FOOT_OFFSET;

        let drawX = px;
        if (anim?.state === 'ko') {
            const elapsed = nowForReaction(gnow(), combatAnimationStart);
            const p = Math.max(0, Math.min(1, elapsed / OLLY_KO_TOTAL_MS));
            drawX += playerHurtDirection * 18 * Math.min(1, p * 1.4);
            c.translate(drawX, visualY);
        } else if (hurt) {
            const elapsed = nowForReaction(gnow(), playerHurtStart);
            const p = Math.max(0, Math.min(1, elapsed / OLLY_HURT_TOTAL_MS));
            const recoil = playerHurtDirection * 16 * (1 - p);
            const shake = Math.sin(gnow() / 28) * 3.5 * (1 - p);
            drawX += recoil + shake;
            c.translate(drawX, visualY);
        } else {
            c.translate(drawX, visualY);
        }
        // Keep the shadow on the actual combat floor, separate from the animation pose.
        c.fillStyle = SH(.28);
        c.beginPath();
        c.ellipse(0, 20 - offsetY, 46, 10, 0, 0, Math.PI * 2);
        c.fill();
        const img = anim?.img;
        if (img && img.complete && img.naturalWidth) {
            const dir = anim.drawDir || combatFacing;
            let finalW, finalH;
            if (anim.kScale) {
                finalW = img.naturalWidth * anim.kScale;
                finalH = img.naturalHeight * anim.kScale;
            } else if (anim.targetWidth) {
                const naturalScale = anim.targetWidth / img.naturalWidth;
                finalW = anim.targetWidth;
                finalH = img.naturalHeight * naturalScale;
            } else {
                const targetH = anim.height || OLLY_IDLE_HEIGHT;
                const naturalScale = targetH / img.naturalHeight;
                finalW = img.naturalWidth * naturalScale;
                finalH = targetH;
            }
            c.save();
            c.scale(dir === 'left' ? -1 : 1, 1);
            c.drawImage(img, -finalW / 2, -finalH, finalW, finalH);
            c.restore();
        }
        c.restore();
    }

    function nowForReaction(nowMs, startMs) {
        return Math.max(0, nowMs - startMs);
    }

    function startCombat(bossFight, resume = false) {
        loadCombatAssets();
        playMusic(bossFight ? 'boss' : 'fight');   // V9.30: Patricia gets her own track (PatriciaBoss.mp3); falls back to the fight music until it exists
        preloadSfx(['punch-1', 'punch-2', 'punch-3', 'goth-pain', ...GOTH_HURT_SFX, 'olly-hurt', 'olly-hurt-heavy', 'olly-ko', 'olly-thud', 'olly-attack', 'olly-heavy-attack', 'olly-jump', 'olly-land', 'olly-dodge-grunt', 'chain-clatter', 'chain-drop', 'chain-rattle', 'chain-spin', 'chain-impact', 'chain-impact-spin', 'breath-recovery', 'countdown-tick', 'fight-shout', 'zombie-death', 'pickup', 'interact', 'tutorial', 'olly-ko']);
        isBoss = bossFight;
        mode = 'combat';
        combatMax = bossFight ? PAT_HP : (target?.maxHp || 50);
        combatHp = combatMax;
        resetCombatVisual();
        if (bossFight) initPatricia(resume);
        if (!bossFight && (target?.type === 'shambler' || target?.type === 'chain')) {
            const introStart = gnow();
            zombieIntroNew = target?.type === 'shambler' && (zombieIntroMode === 'new' || (zombieIntroMode === 'random' && Math.random() < .5));   // V9.40
            zombieCombatX = COMBAT_W - 320;
            zombieIntroActive = true;
            zombieIntroStart = introStart;
            zombieIntroEndAt = introStart + ZOMBIE_INTRO_TOTAL_MS;
            zombieCombatState = 'intro';
            zombieCombatStateStart = introStart;
            zombieCombatNextDecision = Infinity;
            enemyAttackPhase = 'intro';
            chainPatternStep = 0;
            chainSpinHitsDone = 0;
            chainSlamHitSound = false;
            chainHurtHeavy = false;
            chainSparks = [];
            chainLastFrameKey = '';
            chainLastPack = '';
            chainLastIndex = -1;
            chainStunHits = 0;
            chainStunLastHit = -1e9;
        }
        ui.combatName.textContent = bossFight ? 'PATRICIA • THE CLASSIC GOTH' : target?.name || 'ZOMBIE GOTH';
        try {   // V9.34: a marker at 50% on Patricia's bar so the half-health point is visible
            const bar = ui.enemyHp.parentElement; bar.style.position = 'relative'; bar.classList.remove('pat-enraged'); ui.enemyHp.style.background = '';
            bar.querySelectorAll('.pat-half-tick').forEach(n => n.remove());
            if (bossFight && !resume) { const t = document.createElement('div'); t.className = 'pat-half-tick'; t.style.cssText = 'position:absolute;left:50%;top:-2px;bottom:-2px;width:3px;margin-left:-1px;background:#fff;box-shadow:0 0 6px #fff;pointer-events:none;z-index:2'; bar.appendChild(t); }
            else if (bossFight && resume) { ui.enemyHp.style.background = 'linear-gradient(90deg,#8e1230,#ff3d6e)'; }
        } catch (e) {}
        ui.enemyHp.style.width = (combatHp / combatMax * 100) + '%';
        ui.enemyStunWrap.classList.toggle('hidden', target?.type !== 'chain');
        ui.enemyStun.style.width = '0%'; stunMeterW = ''; stunMeterFull = null;
        ui.enemyStunWrap.classList.remove('full');
        ui.enemyStunLabel.textContent = 'STUN';
        ui.enemyHpText.textContent = `${combatHp} / ${combatMax}`;
        ui.combatStatus.textContent =
            (target?.type === 'chain')
                ? 'The Chain Goth is quick. Defeat both Level 1 Goths to unlock Heavy Attack. Make it count.'
                : (bossFight ? (resume ? 'Patricia is on her second wind. GET READY...' : 'Patricia is waiting. Your Heavy Attack is ready.') : 'GET READY...');
        ui.combat.classList.remove('hidden');
        clearInterval(enemyTimer);
        enemyTimer = null;
        cancelAnimationFrame(combatRaf);
        combatLastFrame = gnow();
        const loop = () => {
            if (mode !== 'combat')
                return;
            const t = gnow();
            if (pendingTutorial && performance.now() >= pendingTutorial.at) {
                const kind = pendingTutorial.kind; pendingTutorial = null;
                if (!playerDeathTriggered && !zombieDeathStarted) showRingTutorial(kind, () => { held.up = held.down = held.left = held.right = false; });
                else { pausedTotal += performance.now() - pausedAt; pausedAt = 0; tutorialHold = false; }
            }
            const dt = Math.min(.033, (t - combatLastFrame) / 1000 || 0);
            combatLastFrame = t;
            updatePrefight(t);
            updateCombatMovement(dt);
            if (enemyLeaving) {   // walk off-screen after a KO
                zombieCombatX += enemyLeaving.dir * 150 * dt;
                zombieCombatWalkIndex += dt * 1000;
            }
            setLoopSfx('chain-drag', isChainFight() && zombieCombatState === 'chase' && !zombieIntroActive && !zombieDeathStarted && !playerDeathTriggered, .5);
            setLoopSfx('footsteps', (held.left !== held.right) && !jumping && !zombieIntroActive && !playerDeathTriggered && t >= dodgeUntil, .8);
            updateZombieAI(dt, t);
            updateChainAI(dt, t);
            updatePatriciaAI(dt, t);
            resolveCombatBodyCollision(t);
            resolveHeavyStrike(t);
            drawCombat();
            combatRaf = requestAnimationFrame(loop);
        };
        combatRaf = requestAnimationFrame(loop);
    }
    let lastGruntAt = 0;
    let pendingTutorial = null, chainSwipeAim = 1;
    let enemyLeaving = null;   // set when an enemy has knocked Olly out and is walking away
    function queueRingTutorial(kind) {   // the ring is drawn first, then the pop-up appears a moment later
        if (pendingTutorial || pausedAt || ringTutorialSeen(kind) || playerDeathTriggered || zombieDeathStarted) return;
        // Step 1: the ring appears and the fight freezes with it on screen for 1s. Step 2: 1s held still. Step 3: the pop-up.
        pausedAt = performance.now(); tutorialHold = true; tutorialHoldStart = pausedAt;
        pendingTutorial = { kind, at: pausedAt + 2000 };
        playSfx('tutorial', .8);   // so the freeze reads as intentional, not a crash
    }
    function combatAttack() {
        if (patReward) { patChestInteract(); return; }   // V9.42: after Patricia falls, attack / click = open the chest
        if (pausedAt) return;
        if (mode !== 'combat' || zombieIntroActive || patFrozen() || playerDeathTriggered)
            return;

        const nowMs = gnow();
        if (nowMs < attackCooldownUntil) {
            const seconds = Math.ceil((attackCooldownUntil - nowMs) / 1000);
            ui.combatStatus.textContent = `⏳ Combo recovering. ${seconds}s.`;
            return;
        }

        // Universal punch cadence. Every enemy now obeys the same minimum
        // interval, so Zombie Goth cannot be click-spammed.
        if (nowMs - lastAttackAt < 334)
            return;

        const enemyX = zombieCombatX,
            enemyY = COMBAT_GROUND_Y,
            dx = enemyX - player.x,
            dy = enemyY - (player.y + jumpOffset);

        combatFacing = dx < 0 ? 'left' : 'right';
        if (nowMs - lastAttackAt > 1500) comboCount = 0;   // a pause resets the combo
        lastAttackAt = nowMs;
        if (nowMs - lastGruntAt > 1500) { lastGruntAt = nowMs; playSfx('olly-attack', .8); }   // effort grunt, not on every punch
        attackAnimUntil = nowMs + 334;
        combatAnimationState = 'punch';
        combatAnimationStart = nowMs;
        combatAnimationUntil = nowMs + 334;

        const horizontalDistance = Math.abs(dx);
        const verticalDistance = Math.abs(dy);
        const hit = isAIFight()
            ? horizontalDistance <= (isPatriciaFight() ? 260 : (isChainFight() ? 280 : 205)) && verticalDistance <= 105 && !patGone() && !patInvuln()   // Chain Goth keeps ~250px away, so her reach is longer
            : Math.hypot(dx, dy) <= 180;

        if (hit) {
            const damage = 10;
            combatHp = Math.max(0, combatHp - damage);
            ui.enemyHp.style.width = (combatHp / combatMax * 100) + '%';
            ui.enemyHpText.textContent = `${combatHp} / ${combatMax}`;
            comboCount++;
            playRandomSfx(['punch-1', 'punch-2', 'punch-3']);
            ui.combatStatus.textContent = `👊 HIT! ${damage} damage.`;
            if (combatHp <= 0) {
                if (target?.type === 'shambler')
                    triggerZombieDeath(nowMs);
                else if (isChainFight())
                    triggerChainDeath(nowMs);
                else if (isPatriciaFight())
                    triggerPatriciaDefeat(nowMs);
                else
                    setTimeout(() => endCombat(true), 180);
                return;
            }
            triggerZombieHitReaction(nowMs, false, false);
        } else {
            ui.combatStatus.textContent = '👊 Too far. Get closer.';
            if (isPatriciaFight()) patSay('trying-hard', { cd: 12000, chance: .6 });   // V9.31: his punch missed
            comboCount++;   // a miss still uses up a punch, so you can't spam to dodge the cooldown
        }

        if (comboCount >= COMBO_PUNCHES) {
            comboCount = COMBO_PUNCHES;
            attackCooldownUntil = nowMs + 5000;
            playSfx('breath-recovery', .85);
            ui.combatStatus.textContent += ' ⚠️ Combo complete. 5s cooldown!';
        }
    }

    function combatHeavyAttack() {
        if (patReward) return;
        if (pausedAt) return;
        if (mode !== 'combat' || zombieIntroActive || patFrozen() || playerDeathTriggered)
            return;

        // v7.4: Heavy Attack unlocks after both Level 1 Goths have been defeated,
        // regardless of which Goth was fought first. Boss fights still permit Heavy.
        const heavyAvailable = heavyUnlocked || !!isBoss;
        if (!heavyAvailable) {
            ui.combatStatus.textContent = '🔒 Heavy Attack unlocks after you defeat both Level 1 Goths.';
            return;
        }

        const nowMs = gnow();
        if (nowMs < heavyAttackCooldownUntil) {
            const seconds = Math.ceil((heavyAttackCooldownUntil - nowMs) / 1000);
            ui.combatStatus.textContent = `💥 Heavy attack recovering. ${seconds}s.`;
            return;
        }
        if (jumping || nowMs < attackAnimUntil || nowMs < dodgeUntil)
            return;

        const enemyX = zombieCombatX,
            playerMinX = 140,
            playerMaxX = COMBAT_W - 140,
            dx = enemyX - player.x;
        combatFacing = dx < 0 ? 'left' : 'right';

        heavyAttackCooldownUntil = nowMs + 15000 * heavyCdMul;
        playSfx('olly-heavy-attack', 1);
        heavyAttackAnimUntil = nowMs + 620;
        combatAnimationState = 'heavy';
        combatAnimationStart = nowMs;
        combatAnimationUntil = nowMs + 620;
        heavyStrikeApplied = false;
        jumpOffset = 0;
        jumping = false;

        heavyLungeStartX = player.x;
        // Bring the player to a reliable attack position. This makes the 15s
        // heavy attack useful without requiring the player to stand on the Goth.
        heavyLungeTargetX = dx >= 0
            ? Math.min(enemyX - 145, playerMaxX)
            : Math.max(enemyX + 145, playerMinX);
        ui.combatStatus.textContent = '💥 HEAVY ATTACK!';
    }

    function resolveHeavyStrike(nowMs) {
        if (heavyStrikeApplied || heavyAttackAnimUntil <= 0 || nowMs < heavyAttackAnimUntil - 300)
            return;

        heavyStrikeApplied = true;
        const enemyX = zombieCombatX,
            enemyY = COMBAT_GROUND_Y,
            distance = Math.hypot(enemyX - player.x, enemyY - player.y);

        if (distance <= 230 && !patGone() && !patInvuln()) {
            const damage = 20;
            combatHp = Math.max(0, combatHp - damage);
            ui.enemyHp.style.width = (combatHp / combatMax * 100) + '%';
            ui.enemyHpText.textContent = `${combatHp} / ${combatMax}`;
            playSfx('punch-2', 1);
            ui.combatStatus.textContent = `💥 HEAVY HIT! ${damage} damage. Heavy attack on cooldown for 15s.`;
            if (combatHp <= 0) {
                if (target?.type === 'shambler')
                    triggerZombieDeath(nowMs);
                else if (isChainFight())
                    triggerChainDeath(nowMs);
                else if (isPatriciaFight())
                    triggerPatriciaDefeat(nowMs);
                else
                    setTimeout(() => endCombat(true), 180);
            } else {
                triggerZombieHitReaction(nowMs, true);
            }
        } else {
            ui.combatStatus.textContent = '💥 Heavy attack missed.';
        }
    }
    function combatDodge() {
        if (patReward) return;
        if (pausedAt) return;
        if (mode !== 'combat' || zombieIntroActive || patFrozen() || playerDeathTriggered)
            return;
        const nowMs = gnow();
        if (nowMs < zombieBiteHoldUntil) return;
        if (nowMs < dodgeUntil) {
            ui.combatStatus.textContent = '↪ Dodge is still recovering.';
            return;
        }

        const enemyX = zombieCombatX,
            playerMinX = 140,
            playerMaxX = COMBAT_W - 140;
        // Always dodge AWAY from the enemy (backwards), whichever way Olly happens to be facing or walking.
        // If his back is to the wall there is no room, so he rolls THROUGH her to the other side instead.
        let direction = player.x <= enemyX ? -1 : 1;
        const room = direction < 0 ? player.x - playerMinX : playerMaxX - player.x;
        let distance = 180;
        if (room < 110 && Math.abs(enemyX - player.x) <= 340) { direction = -direction; distance = Math.abs(enemyX - player.x) + 170; }   // cornered next to her: roll through to the other side
        combatDodgeDirection = direction;
        player.x = Math.max(playerMinX, Math.min(playerMaxX, player.x + direction * distance));
        combatFacing = enemyX >= player.x ? 'right' : 'left';   // keep facing her
        player.y = COMBAT_GROUND_Y;
        player.invuln = nowMs + 600;
        dodgeUntil = nowMs + 600;
        lastDodgeStart = nowMs;
        playSfx('olly-jump', .8);          // whoosh
        // V9.31: no grunt on dodge (it sounded like he was hurt)
        combatAnimationState = 'dodge';
        combatAnimationStart = nowMs;
        combatAnimationUntil = nowMs + 409; // v6.5.16d: 20% faster dodge animation
        jumpOffset = 0;
        ui.combatStatus.textContent = '↪ DODGE!';
    }
    function showHeavyAttackReward() {
        heavyUnlocked = true;
        mode = 'reward';

        const overlay = document.createElement('div');
        overlay.id = 'level1-heavy-reward-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:10000;background:rgba(9,7,13,.97);display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;box-sizing:border-box;';

        const box = document.createElement('div');
        box.style.cssText = 'width:min(1120px,94vw);max-height:94vh;display:flex;flex-direction:column;align-items:center;gap:16px;background:#18101d;border:1px solid #6f4a61;border-radius:18px;padding:22px;box-sizing:border-box;box-shadow:0 18px 70px rgba(0,0,0,.55);overflow:auto;';
        overlay.appendChild(box);

        const img = document.createElement('img');
        img.src = 'assets/encounters/level1/heavy-attack-reward.webp?v=6529';
        img.alt = 'Heavy Attack reward artwork';
        img.style.cssText = 'display:block;max-width:100%;max-height:62vh;object-fit:contain;border-radius:12px;';
        box.appendChild(img);

        const title = document.createElement('div');
        title.textContent = 'HEAVY ATTACK UNLOCKED!';
        title.style.cssText = 'color:#f3c6d6;font:900 clamp(22px,3vw,34px) Georgia,serif;text-align:center;';
        box.appendChild(title);

        const copy = document.createElement('div');
        copy.innerHTML = 'Press <strong>Z</strong> to unleash it. It deals 20 damage and has a 15 second cooldown.';   // V9.31: no second "unlocked" line
        copy.style.cssText = 'color:#f5eaf0;font:700 clamp(16px,2vw,20px) Georgia,serif;text-align:center;line-height:1.45;';
        box.appendChild(copy);

        const button = document.createElement('button');
        button.textContent = 'KEEP EXPLORING';
        button.style.cssText = 'padding:13px 28px;border:1px solid #d98ba8;border-radius:12px;background:#382132;color:#f8eaf0;font:700 17px Georgia,serif;cursor:pointer;';
        box.appendChild(button);

        document.body.appendChild(overlay);
        button.addEventListener('click', () => {
            overlay.remove();
            mode = 'map';
            ui.dialogue.textContent = 'The cemetery is going to regret that.';
            stats();
        }, { once:true });
    }

    let completionNextAction = null;
    function showCompletionScreen(image, alt, title, copy, buttonLabel, nextAction = null) {
        completionNextAction = nextAction;
        ui.completionImage.src = image;
        ui.completionImage.alt = alt;
        ui.completionTitle.textContent = title;
        ui.completionCopy.textContent = copy;
        ui.completionContinue.textContent = buttonLabel;
        ui.completion.classList.remove('hidden');
        mode = 'completion';
    }
    function continueCompletion() {
        if (mode !== 'completion') return;
        ui.completion.classList.add('hidden');
        const nextAction = completionNextAction;
        completionNextAction = null;
        if (nextAction === 'heavy-reward') { showHeavyAttackReward(); return; }
        mode = 'map';
        stats();
    }

    function endCombat(won) {
        patDeathCleanup();
        comboCount = 0; attackCooldownUntil = 0; lastAttackAt = 0;   // V9.28: combo resets when a fight ends
        { const ch = document.getElementById('combo-hud'); if (ch) ch.style.display = 'none'; comboHudKey = ''; }
        setLoopSfx('chain-drag', false);
        clearInterval(enemyTimer);
        enemyTimer = null;
        cancelAnimationFrame(combatRaf);
        ui.combat.classList.add('hidden');
        playMusic('map');
        mode = 'map';
        if (won) {
            if (isBoss) {
                hp = maxHp;
                stats();
                ui.win.classList.remove('hidden');
                return;
            }
            if (target) {
                const defeatedType = target.type;
                target.dead = true;
                target.hp = 0;
                kills++;
                target = null;

                const bothLevel1GothsDefeated = enemies.every(e => e.dead);
                const isZombie = defeatedType === 'shambler' || defeatedType === 'zombie';
                const defeatArt = isZombie
                    ? 'assets/encounters/level1/zombie-goth-defeated.webp?v=1'
                    : 'assets/encounters/level1/chain-goth-defeated.webp?v=1';
                const defeatTitle = isZombie ? 'ZOMBIE GOTH DEFEATED!' : 'CHAIN GOTH DEFEATED!';
                const defeatCopy = isZombie
                    ? "The Zombie Goth collapses at last. Her quest for fishnets has been cut short, and you've narrowly avoided becoming tonight's dinner. A productive evening all round."
                    : "With one final clatter, the Chain Goth hits the ground. The chains are quiet, the immediate threat is over, and the path ahead is marginally safer. Let's not get carried away.";

                if (bothLevel1GothsDefeated && !heavyUnlocked) {
                    heavyUnlocked = true;
                    stats();
                    showCompletionScreen(defeatArt, defeatTitle, defeatTitle, defeatCopy, 'CONTINUE', 'heavy-reward');
                    return;
                }

                showCompletionScreen(defeatArt, defeatTitle, defeatTitle, defeatCopy, 'KEEP EXPLORING');
                return;
            }
        }
        else {
            hp = Math.max(1, Math.ceil(maxHp * 0.5));
            const deathTitle = ui.death?.querySelector('.death-title');
            if (deathTitle) deathTitle.textContent = 'KNOCKED OUT';
            ui.deathText.textContent = "You wake with a pounding headache. You're alive, if somewhat worse for wear. You're not entirely sure what the Goths did while you were out, and frankly, you're not sure you want to know.";
            if (ui.backMap) { ui.backMap.textContent = isBoss ? 'SAVE AND QUIT' : 'BACK TO MAP'; ui.backMap.dataset.mode = isBoss ? 'quit' : ''; }   // V9.31: after Patricia the choice is Try Again / Save and Quit
            ui.death.classList.remove('hidden');
            mode = 'dead';
        }
        stats();
    }
    function retryCombat() {
        ui.death.classList.add('hidden');
        hp = Math.max(1, Math.ceil(maxHp * 0.5));
        stats();
        if (combatCheckpoint) {
            x = combatCheckpoint.x;
            y = combatCheckpoint.y;
            reveal();
        }
        mode = 'map';
        if (target || isBoss)
            setTimeout(() => startCombat(isBoss, isBoss && patCheckpoint), 100);
    }
    function backToMap() {
        ui.death.classList.add('hidden');
        // Knockout recovery: Olly always re-enters the map at 50 HP.
        hp = Math.max(1, Math.ceil(maxHp * 0.5));
        if (combatCheckpoint) {
            x = combatCheckpoint.x;
            y = combatCheckpoint.y;
            reveal();
        }
        mode = 'map';
        ui.dialogue.textContent = 'You retreat to the checkpoint. The goths are still waiting.';
        stats();
    }

    function shootAtPointer() {
        if (mode === 'combat')
            combatAttack();
    }

    // ---- V9.27 "Would You" game: 7 rounds, decoy "Would you..." phrases, a smaller target each round, a miss restarts the ramble ----
    const WY_ROUNDS = 10;
    const WY_DURATION = [3000, 2750, 2500, 2300, 2100, 1900, 1750, 1600, 1450, 1300];
    const WY_ZONE_START = [.78, .80, .82, .83, .84, .86, .88, .89, .90, .91];
    const WY_ZONE_WIDTH = [.12, .11, .10, .095, .09, .08, .07, .065, .06, .055];
    const WY_SCRIPTS = [
        [[0, '“Can I ask you a question...”'], [.2, '“Have you ever...”'], [.4, '“Do you like...”'], [.6, '“What was I going to say?”']],
        [[0, '“Okay, so, hypothetically...”'], [.2, '“If I were to say...”'], [.4, '“Would you rather... no, wait.”'], [.62, '“Hang on.”']],
        [[0, '“Do you ever think about...”'], [.2, '“Would you mind if...”'], [.42, '“Sorry. Ignore me.”'], [.62, '“Where was I?”']],
        [[0, '“I had a really good point...”'], [.2, '“Would you ever...”'], [.4, '“Actually, never mind.”'], [.6, '“That was stupid. Forget it.”']],
        [[0, '“So the other day I was thinking...”'], [.18, '“Would you consider...”'], [.38, '“Would you like to...”'], [.58, '“No. Wrong question.”'], [.72, '“Hang on, hang on...”']],
        [[0, '“Don’t laugh, but...”'], [.16, '“Would you... could you...”'], [.34, '“Would you maybe... no.”'], [.52, '“I lost it. It’s gone.”'], [.7, '“Hold on...”']],
        [[0, '“Right. This is it. Properly.”'], [.14, '“Would you...”'], [.3, '“Would you... ugh.”'], [.46, '“Would you... um...”'], [.62, '“Shh, I’m concentrating.”'], [.78, '“Wait for it...”']],
        [[0, '“Okay. Okay. Deep breath.”'], [.15, '“Would you... no.”'], [.3, '“I’m doing it wrong.”'], [.48, '“Would you ever... hang on.”'], [.66, '“Nearly there...”']],
        [[0, '“You’re going to laugh at this.”'], [.14, '“Would you kindly...”'], [.3, '“That’s not what I meant.”'], [.46, '“Would you... eventually...”'], [.64, '“Don’t look at me.”']],
        [[0, '“Final one. I promise.”'], [.12, '“Would you possibly...”'], [.28, '“Would you... oh, come on.”'], [.44, '“Why is this so hard?”'], [.6, '“Would you... almost...”'], [.74, '“Steady...”']]
    ];
    let wyLine = '';
    function wyZone(round = relationshipRound) {
        return { start: WY_ZONE_START[round] ?? .9, width: WY_ZONE_WIDTH[round] ?? .06 };
    }
    function renderWouldPips() {
        const el = document.getElementById('would-pips');
        if (!el) return;
        el.innerHTML = '';
        for (let i = 0; i < WY_ROUNDS; i++) {
            const d = document.createElement('i');
            if (i < relationshipStep) d.className = 'done';
            else if (i === relationshipStep) d.className = 'now';
            el.appendChild(d);
        }
    }
    function startRelationship() {
        mode = 'relationship';
        relationshipRound = 0;
        relationshipStep = 0;
        relationshipDuration = WY_DURATION[0];
        relationshipStart = gnow();
        wyLine = '';
        ui.relationship.classList.remove('hidden');
        const relationshipImage = ui.relationship.querySelector('.relationship-image');
        matchArtworkLetterboxing(relationshipImage);
        const relationshipCopy = ui.relationship.querySelector('.ironic-copy');
        if (relationshipCopy) {
            relationshipCopy.textContent = 'Press WOULD YOU? when she says it in capitals.';
            relationshipCopy.style.textAlign = 'center';
            relationshipCopy.style.whiteSpace = 'pre-line';
            relationshipCopy.style.setProperty('line-height', '1.22', 'important');
            relationshipCopy.style.setProperty('margin-bottom', '2px', 'important');
            relationshipCopy.style.width = '100%';
            relationshipCopy.style.boxSizing = 'border-box';
            relationshipCopy.style.marginLeft = 'auto';
            relationshipCopy.style.marginRight = 'auto';
        }
        ui.wouldFeedback.textContent = '';
        ui.wouldDisplay.textContent = WY_SCRIPTS[0][0][1];
        ui.wouldDisplay.classList.remove('would-now');
        renderWouldPips();
        animateRelationship();
    }
    function animateRelationship() {
        cancelAnimationFrame(relationshipRAF);
        const tick = t => {
            if (mode !== 'relationship')
                return;
            const elapsed = gnow() - relationshipStart;
            const pct = Math.min(1, elapsed / relationshipDuration);
            const { start: zoneStart, width: zoneWidth } = wyZone();
            ui.timingCursor.style.left = `${pct * 100}%`;
            ui.timingZone.style.left = `${zoneStart * 100}%`;
            ui.timingZone.style.width = `${zoneWidth * 100}%`;
            let line = WY_SCRIPTS[relationshipRound][0][1];
            for (const [at, text] of WY_SCRIPTS[relationshipRound]) if (pct >= at && pct < zoneStart) line = text;
            const now = pct >= zoneStart;
            if (now) line = '“WOULD YOU?”';
            if (line !== wyLine) { wyLine = line; ui.wouldDisplay.textContent = line; }
            ui.wouldDisplay.classList.toggle('would-now', now);
            if (pct >= 1) {
                relationshipStart = gnow();
                ui.wouldFeedback.textContent = 'Too late. She rambles again.';
            }
            relationshipRAF = requestAnimationFrame(tick);
        };
        relationshipRAF = requestAnimationFrame(tick);
    }
    function completeRelationship() {
        if (mode !== 'relationship' || pausedAt)
            return;
        const elapsed = gnow() - relationshipStart;
        const pct = elapsed / relationshipDuration;
        const { start: zoneStart, width: zoneWidth } = wyZone();
        const zoneEnd = zoneStart + zoneWidth;
        if (pct >= zoneStart && pct <= zoneEnd) {
            relationshipStep++;
            if (relationshipStep >= WY_ROUNDS) {
                relationshipDone = true;
                mode = 'map';
                cancelAnimationFrame(relationshipRAF);
                ui.relationship.classList.add('hidden');
                renderWouldPips();
                stats();
                playSfx('minigame-win', 1.6);
                showCompletionScreen('assets/encounters/level1/relationship-challenge-completed.webp?v=1', 'Relationship Challenge complete', 'CHALLENGE COMPLETE!', "You've successfully endured this highly scientific test of patience. What it's actually proved remains unclear, but you've passed, and that's what matters. Probably.", 'KEEP EXPLORING');
            } else {
                relationshipRound++;
                relationshipDuration = WY_DURATION[relationshipRound] || 1500;
                relationshipStart = gnow();
                wyLine = '';
                renderWouldPips();
                playSfx('round-ok', 1.5);
                ui.wouldFeedback.textContent = '✅';
            }
        } else {
            // A miss: she loses the thread and starts the ramble again from the top.
            relationshipStart = gnow();
            wyLine = '';
            ui.wouldFeedback.textContent = pct < zoneStart ? '❌ Too early. Decoy. Starting again.' : '❌ Too late. Starting again.';   // V9.30: no buzz here (the wrong-answer sound is for the Princess Question only)
        }
    }
    function answerPuzzle(answer) {
        if (mode !== 'puzzle')
            return;
        if (answer === 'correct') {
            puzzleSolved = true;
            mode = 'map';
            ui.puzzle.classList.add('hidden');
            stats();
            playSfx('quiz-win', 1.6);
            showCompletionScreen('assets/encounters/level1/princess-question-completed.webp?v=1', 'Princess Question complete', 'CONGRATULATIONS!', "You've answered the Princess Question correctly, proving that love and intelligence can, on rare occasions, coexist. Princess Scarlett would be proud. Try not to let it go to your head.", 'KEEP EXPLORING');
        } else {
            playSfx('wrong-buzz', 1.4);
            ui.puzzleFeedback.textContent = '❌ Incorrect. The princess remains imprisoned, and somewhere a goth has just judged you.';
        }
    }
    let bossIntroPending = false;   // true while the Patricia screen is up (also saved, so Load Game brings it back)
    function showBossIntro() {
        bossIntroPending = true;
        mode = 'bossintro';
        playMusic('map');
        ui.bossIntro.classList.remove('hidden');
    }
    function saveAndQuit() {
        if (isBoss && mode !== 'map') bossIntroPending = true;   // quitting during / after the Patricia fight: Load Game brings you back to her screen
        saveGame(true);
        location.reload();   // back to the title screen; Load Game returns to this screen
    }
    function startBoss() {
        bossIntroPending = false;
        ui.bossReady?.classList.add('hidden');
        ui.bossIntro.classList.add('hidden');
        target = null;
        combatCheckpoint = {
            x,
            y
        };
        patCheckpoint = false;
        startCombat(true);
        beginBossPrefight();
    }

    // ---- V9.22 pre-fight: Patricia talks, the potion appears in the bag, then Drink / Save for later -> 3-2-1 -> fight ----
    let prefight = null, prefightHold = false, prefightToken = 0, drinkAnim = null;
    let patSpeech = null;   // V9.30: { text, start, until } speech bubble over Patricia's head
    function setBagGlow(on) { document.getElementById('inventory-button')?.classList.toggle('inv-glow', !!on); }
    function closeBag() {
        ui.inventory?.classList.add('hidden');
        ui.inventory?.setAttribute('aria-hidden', 'true');
        hideItemPanel();
        hideInvTip();
    }
    function beginBossPrefight() {
        const token = ++prefightToken;
        prefight = { ready: false };
        prefightHold = true;
        drinkAnim = null;
        zombieIntroActive = true;
        zombieIntroStart = gnow();
        zombieIntroEndAt = Infinity;
        loadDrinkFrames();
        preloadSfx(['patricia-unfair-fight', 'patricia-check-backpack']);
        ui.combatStatus.textContent = '';
        const later = (ms, fn) => setTimeout(() => { if (token === prefightToken && mode === 'combat') fn(); }, ms);
        // V9.30: she speaks in a bubble over her head. 2 s after the fight loads she says line 1; line 2 only starts once line 1 has finished (they used to overlap).
        const L1 = 2690, L2 = 1910, GAP = 450, PAT_SPEECH_DELAY = 2000;   // V9.31: 2 s after the fight loads (was 1 s)
        patSpeech = null;
        later(PAT_SPEECH_DELAY, () => { patSpeech = { text: 'I wouldn\'t enjoy an unfair fight...', start: gnow(), until: Infinity }; ui.combatStatus.textContent = ''; playSfx('patricia-unfair-fight', 1); });
        later(PAT_SPEECH_DELAY + L1 + GAP, () => {
            patSpeech = { text: 'Check your backpack.', start: gnow(), until: Infinity };
            playSfx('patricia-check-backpack', 1);
            if (!inventory.potion) inventory.potion = 1;
            refreshInventoryUI();
        });
        later(PAT_SPEECH_DELAY + L1 + GAP + L2 + 500, () => {
            patSpeech = null;
            if (prefight) prefight.ready = true;
            ui.combatStatus.textContent = 'Press Y to open your backpack.';
            setBagGlow(true);
        });
    }
    function potionChoice(drink) {
        const note = document.querySelector('#inventory-item-panel .inv-panel-note');
        if (prefight) {
            if (!prefight.ready) { if (note) note.textContent = 'Let her finish...'; return; }
            closeBag(); setBagGlow(false);
            prefight.ready = false;
            if (drink) { drinkAnim = { start: gnow(), healed: false }; inventory.potion = 0; refreshInventoryUI(); }
            else startPrefightCountdown();
            return;
        }
        if (mode === 'map' && drink) {   // outside the boss fight: just heal
            hp = maxHp; inventory.potion = 0; closeBag(); stats();
            ui.dialogue.textContent = 'You drink the potion. Full HP again.';
            return;
        }
        if (note) note.textContent = drink ? 'Not now.' : 'It stays in your bag.';
    }
    function startPrefightCountdown() {
        const t = gnow();
        prefightHold = false;
        zombieIntroStart = t;
        zombieIntroEndAt = t + ZOMBIE_INTRO_TOTAL_MS;
        ui.combatStatus.textContent = 'GET READY...';
    }
    function updatePrefight(t) {
        if (drinkAnim) {
            const f = Math.floor((t - drinkAnim.start) / DRINK_FRAME_MS);
            if (f >= DRINK_HEAL_FRAME && !drinkAnim.healed) { drinkAnim.healed = true; drinkAnim.healT = t; hp = maxHp; stats(); }
            if (f >= DRINK_FRAMES + 6) { drinkAnim = null; startPrefightCountdown(); }
        }
        if (isBoss && zombieIntroActive && !prefightHold && t >= zombieIntroEndAt) {
            zombieIntroActive = false;
            prefight = null;
            ui.combatStatus.textContent = 'Patricia is waiting. Your Heavy Attack is ready.';
        }
    }
    function drawOllyDrink(c, px, py, t) {
        const f = Math.max(0, Math.min(DRINK_FRAMES - 1, Math.floor((t - drinkAnim.start) / DRINK_FRAME_MS)));
        const img = drinkImgs[f];
        const k = DRINK_DRAW_K;
        c.save();
        c.translate(px, py + OLLY_DRAW_FOOT_OFFSET);
        c.fillStyle = SH(.28);
        c.beginPath(); c.ellipse(0, 20, 46, 10, 0, 0, Math.PI * 2); c.fill();
        if (drinkAnim.healed) {   // soft green glow after the first sip lands
            const a = Math.max(0, 1 - (t - drinkAnim.healT) / 900);
            if (a > 0) {
                const g = c.createRadialGradient(0, -150, 20, 0, -150, 190);
                g.addColorStop(0, `rgba(140,255,120,${.45 * a})`); g.addColorStop(1, 'rgba(140,255,120,0)');
                c.fillStyle = g; c.fillRect(-220, -360, 440, 440);
            }
        }
        if (img && img.complete && img.naturalWidth) {
            c.scale(-1, 1);   // the drink art faces left; Olly faces right in the arena
            c.drawImage(img, -DRINK_ART.centerX * k, -DRINK_ART.feetY * k, DRINK_ART.w * k, DRINK_ART.h * k);
        }
        c.restore();
    }
    function saveGame(silent = false) {
        try {
            const state = {
                version: 5,
                savedAt: new Date().toISOString(),
                level: 1,
                x,
                y,
                hp,
                maxHp,
                heavyCdMul,
                kills,
                relationshipDone,
                puzzleSolved,
                keyCollected,
                gateOpened,
                bossIntroPending,
                heavyUnlocked,
                inventory,
                checkpoint,
                enemies: enemies.map(e => ({
                    dead: e.dead,
                    hp: e.hp
                }))
            };
            localStorage.setItem(activeKey(), JSON.stringify(state));
            if (!silent) ui.dialogue.textContent = '💾 Game saved. The Goths will have to wait.';
            return true;
        } catch (err) {
            console.error('Goodbye Goth save failed', err);
            return false;
        }
    }
    function loadGame() {
        const state = safeParseSave();
        if (!state || ![2, 3, 4, 5].includes(state.version))
            return false;
        try {
            x = Number.isFinite(state.x) ? Math.min(WORLD_W - 40, Math.max(40, state.x)) : x;
            y = Number.isFinite(state.y) ? Math.min(WORLD_H - 40, Math.max(40, state.y)) : y;
            { const safe = nearestWalkable(x, y); x = safe.x; y = safe.y; }   // V9.23: old saves may be on a spot that is now blocked
            maxHp = Number.isFinite(state.maxHp) ? Math.max(100, state.maxHp) : 100;
            heavyCdMul = Number.isFinite(state.heavyCdMul) ? Math.max(.3, Math.min(1, state.heavyCdMul)) : 1;
            if (state.version >= 4) {
                hp = Number.isFinite(state.hp) ? state.hp : maxHp;
            }
            else {
                const legacyHearts = Number.isFinite(state.hp) ? state.hp : 5;
                hp = Math.round(Math.max(0, Math.min(5, legacyHearts)) / 5 * maxHp);
            }
            kills = Number.isFinite(state.kills) ? state.kills : kills;
            relationshipDone = !!state.relationshipDone;
            puzzleSolved = !!state.puzzleSolved;
            keyCollected = !!state.keyCollected;
            gateOpened = !!state.gateOpened;
            keySpawnAnnounced = keyCollected;
            inventory = state.inventory && typeof state.inventory === 'object' ? state.inventory : {};
            if (keyCollected && !gateOpened) inventory.key = 1; else inventory.key = 0;   // V9.30: a used key is gone
            checkpoint = state.checkpoint || 'cemetery-entrance';
            if (Array.isArray(state.enemies)) {
                state.enemies.forEach((saved, i) => {
                    if (enemies[i]) {
                        enemies[i].dead = !!saved.dead;
                        if (Number.isFinite(saved.hp))
                            enemies[i].hp = saved.hp;
                    }
                })
            }
            heavyUnlocked = state.version >= 5 ? !!state.heavyUnlocked : false;
            if (enemies.every(e => e.dead))
                heavyUnlocked = true;
            mode = 'map';
            target = null;
            bossRoomEntered = false;
            cameraX = x;
            cameraY = y - CAM_LEAD_Y;
            stats();
            lastFogRevealX = null;
            lastFogRevealY = null;
            revealAround(x, y, true);
            ui.dialogue.textContent = '📂 Game loaded. Welcome back to the cemetery.';
            if (state.bossIntroPending) { gateOpened = true; showBossIntro(); }
            return true;
        } catch (err) {
            console.error('Goodbye Goth load failed', err);
            return false;
        }
    }
    function start() {
        gateEncounterShown = false;
        cameraX = x;
        cameraY = y - CAM_LEAD_Y;
        stats();
        cancelAnimationFrame(relationshipRAF);
        clearInterval(enemyTimer);
        cancelAnimationFrame(raf);
        const loop = t => {
            const dt = Math.min(0.05, (t - (now || t)) / 1000);
            now = t;
            if (mode === 'map')
                updateMovement(dt);
            setLoopSfx('ambience', mode === 'map', .3);
            setLoopSfx('footsteps', mode === 'map' && (held.up || held.down || held.left || held.right) && !ui.inventory?.matches?.(':not(.hidden)'), .8);
            drawWorld(t, dt);
            if (walkPulse > 0)
                walkPulse = 0;
            raf = requestAnimationFrame(loop)
        };
        raf = requestAnimationFrame(loop);
        // V9.31: autosave into the slot you are playing in: every 15 s on the map, and whenever the tab is hidden / closed.
        clearInterval(autosaveTimer);
        autosaveTimer = setInterval(() => { if (mode === 'map') saveGame(true); }, 15000);
        setTimeout(() => { if (mode === 'map' && !safeParseSave()) saveGame(true); }, 2500);   // a brand-new slot gets its first save right away
        const flush = () => { if (mode === 'map' || mode === 'bossintro') saveGame(true); };
        window.removeEventListener('pagehide', window.__ggFlush || (() => {}));
        window.__ggFlush = flush; window.addEventListener('pagehide', flush);
        document.addEventListener('visibilitychange', () => { if (document.hidden) flush(); });
    }
    let autosaveTimer = null;
    function primaryAction() {
        if (mode === 'encounter')
            startEncounterFight();
        else if (mode === 'combat') { if (patReward) patChestInteract(); else jump(); }
        else if (mode === 'map')
            checkTriggers()
    }

    const cheat = {
        setIntro: m => { zombieIntroMode = m; },
        isGod: () => cheatGod,
        setGod: v => { cheatGod = !!v; },
        refillHp: () => { hp = maxHp; stats(); },
        unlockHeavy: () => { heavyUnlocked = true; stats(); },
        inFight: () => mode === 'combat' && !playerDeathTriggered,
        winFight: () => {
            if (mode !== 'combat' || playerDeathTriggered) return false;
            const nowMs = gnow();
            combatHp = 0;
            ui.enemyHp.style.width = '0%';
            ui.enemyHpText.textContent = `0 / ${combatMax}`;
            if (isPatriciaFight()) { prefightToken++; prefight = null; prefightHold = false; zombieIntroActive = false; patSpeech = null; triggerPatriciaDefeat(nowMs); }
            else if (target?.type === 'shambler') triggerZombieDeath(nowMs);
            else if (isChainFight()) triggerChainDeath(nowMs);
            else setTimeout(() => endCombat(true), 180);
            return true;
        },
        // V9.32: knock Olly out (shows the KNOCKED OUT screen)
        loseFight: () => {
            if (mode !== 'combat' || playerDeathTriggered) return false;
            if (isPatriciaFight()) { prefightToken++; prefight = null; prefightHold = false; zombieIntroActive = false; patSpeech = null; }
            hp = 0; stats(); triggerPlayerKO(gnow());
            return true;
        },
        // V9.32: start a fight straight from the map. kind: 'zombie' | 'chain' | 'patricia'. skipIntro (Patricia only) = no speech / potion scene.
        startFight: (kind, skipIntro = false) => {
            if (mode === 'bossintro' && kind === 'patricia') { startBoss(); }
            else if (mode !== 'map') return false;
            else if (kind === 'patricia') { startBoss(); }
            else {
                target = enemies[kind === 'zombie' ? 0 : 1];
                combatCheckpoint = { x, y };
                startCombat(false);
            }
            if (kind === 'patricia' && skipIntro) { prefightToken++; prefight = null; prefightHold = false; zombieIntroActive = false; patSpeech = null; zombieCombatState = 'chase'; zombieCombatStateStart = gnow(); zombieCombatNextDecision = gnow() + 300; ui.combatStatus.textContent = ''; setBagGlow(false); }
            return true;
        },
        mode: () => mode
    };

    return {
        cheat,
        start,
        move,
        setMoveKey,
        primaryAction,
        interact,
        confirmEncounter,
        closeEncounter,
        combatAttack,
        combatHeavyAttack,
        combatDodge,
        shootAtPointer,
        retryCombat,
        backToMap,
        continueCompletion,
        completeRelationship,
        answerPuzzle,
        startBoss,
        saveAndQuit,
        saveGame,
        loadGame
    };
}

