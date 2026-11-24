/* Goodbye Goth V9.94 - Level 2 settings: "The Mystical Forest".

   Level 2 runs on the SAME engine as Level 1 (js/levels/level1.js, createLevel1(ui, { level: 2 })),
   so the map, fog, collision, "Are you ready?" screens, Princess Question, saving, knockouts,
   the 3-2-1 intros and Chain Goth's fight all behave exactly like Level 1. This file only holds
   what is DIFFERENT about Level 2: where things are, the words, the art, and how much harder
   Chain Goth is. Find the Princess is borrowed from js/levels/level2.js; Devil's Fingers and Sophia the Chaos
   Fairy Goth fight on Level 1's fight screen through js/levels/level2-foes.js (V9.96).

   Map coordinates are map pixels on assets/environment/level2-map-bg.webp (1536 x 1024).
   To check positions against the collision, open the game with ?level=2&walk=1.

   PLACEHOLDER ART is marked "placeholder" below - Scarlett is making the real screens. */
import { LEVEL2_WALK_RLE } from './level2-walk.js?v=9970';

const ENC = 'assets/encounters/level2/';

export const LEVEL2 = {
    number: 2,
    name: 'THE MYSTICAL FOREST',
    mapBg: 'assets/environment/level2-map-bg.webp',
    walkRle: LEVEL2_WALK_RLE,
    mapZoom: 1.9,              // Scarlett asked for the closer framing on this map
    ollyMapScale: .792,        // Olly's size on this map (Level 1 uses .92)
    // V9.97: repositioned to match Scarlett's annotated map screenshot exactly
    // (yellow = start, red = Devil's Fingers on the mushroom waterfall, white = Tom's book,
    // pink = relationship challenge in the fairy ring, orange = Princess Question, blue = pendant).
    start: { x: 543, y: 214 },
    combatBackground: 'assets/environment/combat-background-level2.webp',

    // Map enemies. Same shape as Level 1's list. 'devilsfingers' is fought through level2.js.
    enemies: () => [
        { x: 520, y: 300, type: 'chain', name: 'CHAIN GOTH', hp: 100, maxHp: 100, dead: false, pattern: 'Whip • Chain Slam' },
        // V9.97: moved onto the mushroom waterfall on the right (Scarlett: Olly has to climb/jump
        // the waterfall to reach her). No new climb/jump mechanic exists yet - for now this is a
        // normal walkable point at the foot of the falls; see the chat reply re: scoping that properly.
        { x: 1290, y: 560, type: 'devilsfingers', name: "DEVIL'S FINGERS", hp: 200, maxHp: 200, dead: false, pattern: 'Burrow • Grab • Acid', foe: 'devilsfingers' }   // V9.96: fought on Level 1's fight screen (level2-foes.js)
    ],
    relationshipChallenge: { x: 752, y: 969 },   // Find the Princess, in the fairy ring
    princessQuestion: { x: 1225, y: 460 },       // by the gazebo / mushroom-waterfall clearing
    key: { x: 344, y: 925 },                      // where the pendant appears
    gate: { x: 790, y: 230 },                     // the glowing doorway at the top middle (the orb)
    gateNear: { x: 790, y: 245, r: 150 },         // where Olly has to stand to use the pendant
    tomJournal: { x: 199, y: 664 },               // by the hollow
    tomCutscene: 'assets/video/tom-cutscene/tom-cutscene.mp4',   // Scarlett is uploading this; until then the placeholder lines below show

    // Fog: patches over each objective (the rest of the fog banks are shared with Level 1's layout).
    fogPatches: [
        { x: 520, y: 300, rx: 175, ry: 125, a: .9, seed: .2 },
        { x: 1290, y: 560, rx: 190, ry: 135, a: .94, seed: 1.7 },
        { x: 752, y: 969, rx: 185, ry: 130, a: .9, seed: 3.1 },
        { x: 1225, y: 480, rx: 160, ry: 115, a: .9, seed: 4.5 },
        { x: 199, y: 664, rx: 170, ry: 125, a: .92, seed: 5.2 },
        { x: 344, y: 925, rx: 150, ry: 110, a: .88, seed: 5.9 },
        { x: 790, y: 240, rx: 175, ry: 120, a: .96, seed: 6.6 },
        { x: 1300, y: 250, rx: 140, ry: 95, a: .6, seed: 7.3 },
        { x: 1100, y: 880, rx: 160, ry: 110, a: .62, seed: 8.0 },
        { x: 300, y: 900, rx: 150, ry: 100, a: .58, seed: 8.7 }
    ],

    // How much harder Chain Goth is here (Scarlett picked "noticeably harder"; same animations).
    chainHard: {
        speed: 1.25,       // walks/closes in 25% faster
        damage: 1.3,       // swipe 10 -> 13, slam 15 -> 20
        recover: .7,       // 30% less breathing room after each attack
        windup: .9,        // swipe wind-up 10% quicker (still readable)
        followUp: .4,      // 40% chance she whips the chain straight back for a second swipe
        pattern: ['swipe', 'swipe', 'slam', 'swipe', 'slam']
    },

    dialogue: {
        walking: 'The forest hums to itself. Something glittery is definitely watching you.',
        start: 'You step out of the trees into a clearing. Somewhere in this forest, a fairy is plotting.',
        keyAppears: '✨ Something has started glowing among the standing stones. Go and find it.',
        keyPickup: '✨ A glowing pendant lies on the rune circle. You put it on. Take it to the glowing doorway at the top of the forest: open your backpack ({inv}), select the pendant and press USE.',
        gateLocked: '🔒 The doorway hums and pushes you back. Open your backpack ({inv}), select the pendant and press USE while standing in front of it.',
        gateOpened: '✨ The doorway swallows the pendant\'s glow and lets you through...',
        loaded: '📂 Game loaded. Welcome back to the forest.',
        retreat: 'You retreat into the trees. The forest is still waiting.'
    },

    keyItem: { id: 'key', name: 'Glowing Pendant', label: 'PENDANT', img: 'assets/items/pendant-placeholder.webp',
        tip: 'A glowing pendant. The doorway at the top of the forest wants it.',
        desc: 'It hums when you face the glowing doorway at the top of the forest. Stand in front of it and press USE.' },

    encounters: {
        chainGoth: {
            role: 'chainGoth', name: 'CHAIN GOTH', species: 'Gothica Catenata',
            image: ENC + 'chain-goth-encounter.webp',
            text: "YOU'VE ENCOUNTERED... CHAIN GOTH!\nOh, an old foe. And she doesn't look particularly pleased to see you.\nWait... is that a BIGGER chain?\nOh, brilliant. Here we go again.\nAre you ready?"
        },
        devilsFingers: {
            role: 'devilsFingers', name: "DEVIL'S FINGERS", species: 'Clathrus archeri',
            image: ENC + 'devils-fingers-encounter.webp',
            text: "YOU'VE ENCOUNTERED... A MUSHROOM?\nWait... what?\nYou step a little closer. What's that smell?\nBefore you can investigate, acid suddenly spurts from the Devil's Fingers' core and straight into your face.\nSuddenly, everything feels a little... whirly.\nAre you ready?"
        },
        relationshipChallenge: {
            role: 'relationshipChallenge', name: 'FIND THE PRINCESS',
            image: ENC + 'find-the-princess-placeholder.webp',   // placeholder
            text: "You've encountered a relationship challenge.\nFind the Princess: the princess has hidden herself under a mushroom (as you do). Keep your eyes on her mushroom while they shuffle about, then find her. Mushroom, tall mushroom, big mushroom. Simple. Are you ready?"
        },
        princessQuestion: {
            role: 'princessQuestion', name: 'PRINCESS QUESTION',
            image: 'assets/encounters/level1/princess-question-encounter.webp',   // same art as Level 1 (Scarlett: "exactly the same")
            text: 'A Princess Question. Answer it correctly or remain hopelessly lost in the woods. Are you ready?'
        },
        lockedGate: {
            role: 'lockedGate', name: 'THE GATE',
            image: 'assets/story/level2-gate-repels-olly.webp',   // V9.97: Scarlett's real art
            text: "You approach the glowing orb, reaching towards it, completely entranced.\nJust as your fingertips are about to touch the gate, an invisible force throws you backwards.\nStrange... there must be some way through.\nYou'll have to find it."
        },
        tomJournal: {
            role: 'tomJournal', name: 'THE HOLLOW',
            image: ENC + 'hollow-interaction.webp',
            text: "A battered little journal lies in the grass outside a hollow. It's covered in tiny, very neat handwriting. Somebody clearly loves this book. Do you pick it up?"
        }
    },
    tomPlaceholderLines: [
        'Olly picks up a small, battered journal lying by the hollow...',
        "???: That's my book, give it back!",
        'Olly: Huh?',
        "???: Hi, I'm Tom. Tom the Puffle.",
        "(Tom's full cutscene goes here once it's uploaded.)",
        'Tom tucks his journal under one arm and hops along behind you.'
    ],

    princessQuestionData: {
        image: 'assets/encounters/level1/princess-question-art.webp?v=501',
        // V9.95: harder - every answer is something from the book, only one is the Guide's actual gift advice
        // (Chapter Four, Step Five: black roses + a vial of your own blood; a dagger pin for her fishnets also acceptable).
        question: 'According to The Goth Girl Guide™, which of these is an appropriate gift to give a goth?',
        answers: [
            { text: 'A Hello Kitty plush and a strawberry milk', correct: false },
            { text: 'A copy of Frankenstein and a midnight graveyard picnic', correct: false },
            { text: 'An iced Americano and a bag of ready salted crisps', correct: false },
            { text: 'A bouquet of black roses and a vial of your own blood', correct: true }
        ],
        completedTitle: 'CONGRATULATIONS!',
        completedCopy: "Correct. Black roses and a vial of your own blood: the only acceptable offering. The crisps are for aftercare, and the Frankenstein is a date, not a gift. Do keep up."
    },

    findPrincessCompleted: {
        image: 'assets/minigames/find-the-princess/princess-found-peek.webp',
        title: 'CHALLENGE COMPLETE!',
        copy: "You found her. She was under a mushroom the whole time, which honestly says a lot about both of you."
    },

    defeat: {
        chain: { image: 'assets/encounters/level1/chain-goth-defeated.webp?v=2', title: 'CHAIN GOTH DEFEATED!',
            copy: "Chain Goth number two goes down. Her chain clatters into the moss, and somewhere in the trees you're fairly sure you hear a third one taking notes." },
        devilsfingers: { image: ENC + 'devils-fingers-placeholder.webp', title: "DEVIL'S FINGERS DEFEATED!",
            copy: "Devil's Fingers curls up and sinks back into the earth, leaving nothing but a smell you'll be thinking about for weeks." }
    },

    boss: {
        name: 'Sophia, The Chaos Fairy Goth', species: 'Gothica Chaotica',
        image: 'assets/characters/chaosfairy/chaosfairy-idle.webp',   // placeholder until her encounter art exists
        text: "She's been watching you since you arrived. She's braided three of the trees together out of boredom, and now she's decided you look fun to ruin. Floaty dress, questionable footwear, a magic bow. Run.",
        fight: 'cfg',
        combatName: 'SOPHIA • THE CHAOS FAIRY GOTH',
        maxHp: 320   // PROVISIONAL - Patricia (Level 1's boss) is 300, Sophia needs to beat that
    },
    complete: {
        image: 'assets/arenas/cfg-arena.webp',   // placeholder
        big: 'Congratulations',
        sub: "You've survived one (1) glittery, barefoot, mushroom-foraging agent of chaos. She's left you her bow, which feels like a trap. The princess is getting closer... probably.",
        ask: 'Level 3 is still being built.'
    }
};
