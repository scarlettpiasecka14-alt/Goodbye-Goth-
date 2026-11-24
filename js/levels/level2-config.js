/* Goodbye Goth V9.94 - Level 2 settings: "The Mystical Forest".

   Level 2 runs on the SAME engine as Level 1 (js/levels/level1.js, createLevel1(ui, { level: 2 })),
   so the map, fog, collision, "Are you ready?" screens, Princess Question, saving, knockouts,
   the 3-2-1 intros and Chain Goth's fight all behave exactly like Level 1. This file only holds
   what is DIFFERENT about Level 2: where things are, the words, the art, and how much harder
   Chain Goth is. Parts Level 1 doesn't have (Find the Princess, Devil's Fingers, Sophia the
   Chaos Fairy Goth) are borrowed from js/levels/level2.js.

   Map coordinates are map pixels on assets/environment/level2-map-bg.webp (1536 x 1024).
   To check positions against the collision, open the game with ?level=2&walk=1.

   PLACEHOLDER ART is marked "placeholder" below - Scarlett is making the real screens. */
import { LEVEL2_WALK_RLE } from './level2-walk.js?v=9940';

const ENC = 'assets/encounters/level2/';

export const LEVEL2 = {
    number: 2,
    name: 'THE MYSTICAL FOREST',
    mapBg: 'assets/environment/level2-map-bg.webp',
    walkRle: LEVEL2_WALK_RLE,
    mapZoom: 1.9,              // Scarlett asked for the closer framing on this map
    ollyMapScale: .792,        // Olly's size on this map (Level 1 uses .92)
    // Scarlett: start in the top-right clearing (not by the doorway).
    start: { x: 1180, y: 268 },
    combatBackground: 'assets/environment/combat-background-level2.webp',

    // Map enemies. Same shape as Level 1's list. 'devilsfingers' is fought through level2.js.
    enemies: () => [
        { x: 520, y: 300, type: 'chain', name: 'CHAIN GOTH', hp: 100, maxHp: 100, dead: false, pattern: 'Whip • Chain Slam' },
        { x: 935, y: 560, type: 'devilsfingers', name: "DEVIL'S FINGERS", hp: 200, maxHp: 200, dead: false, pattern: 'Burrow • Grab • Acid', custom: 'df' }
    ],
    relationshipChallenge: { x: 640, y: 800 },   // Find the Princess, on the fairy ring
    princessQuestion: { x: 1030, y: 445 },       // in front of the gazebo
    key: { x: 420, y: 428 },                      // where the pendant appears (the rune circle by the standing stones)
    gate: { x: 775, y: 200 },                     // the glowing doorway at the top middle (the orb)
    gateNear: { x: 775, y: 215, r: 150 },         // where Olly has to stand to use the pendant
    tomJournal: { x: 255, y: 505 },               // by the hollow (placed by Scarlett earlier)
    tomCutscene: 'assets/video/tom-cutscene/tom-cutscene.mp4',   // Scarlett is uploading this; until then the placeholder lines below show

    // Fog: patches over each objective (the rest of the fog banks are shared with Level 1's layout).
    fogPatches: [
        { x: 520, y: 300, rx: 175, ry: 125, a: .9, seed: .2 },
        { x: 935, y: 560, rx: 190, ry: 135, a: .94, seed: 1.7 },
        { x: 640, y: 800, rx: 185, ry: 130, a: .9, seed: 3.1 },
        { x: 1030, y: 470, rx: 160, ry: 115, a: .9, seed: 4.5 },
        { x: 255, y: 505, rx: 170, ry: 125, a: .92, seed: 5.2 },
        { x: 420, y: 428, rx: 150, ry: 110, a: .88, seed: 5.9 },
        { x: 775, y: 210, rx: 175, ry: 120, a: .96, seed: 6.6 },
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
            image: 'assets/encounters/level1/chain-goth-encounter.webp?v=2',   // placeholder: Level 1's screen until Scarlett's Level 2 one exists
            text: "Another Chain Goth. Apparently they come in packs. This one heard what you did to her sister, she's been practising in the woods, and she's furious about the eyeliner. Faster chain, shorter temper. Are you ready?"
        },
        devilsFingers: {
            role: 'devilsFingers', name: "DEVIL'S FINGERS", species: 'Clathrus archeri',
            image: ENC + 'devils-fingers-placeholder.webp',   // placeholder
            text: "The ground splits and something pink, slimy and very much alive uncurls its fingers at you. It smells like a bin. It wants a hug. Are you ready?"
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
            role: 'lockedGate', name: 'THE GLOWING DOORWAY',
            image: ENC + 'orb-placeholder.webp',   // placeholder: cropped from the map art
            text: "A hollow, glowing doorway hums at you. You step forward and it gently but firmly pushes you back out. Something tells you it wants a key... or something shinier. Go and find it."
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
        question: 'Which type of goth is known for frolicking in the woods?',
        answers: [
            { text: 'The Classic Goth', correct: false },
            { text: 'The Satanist Goth', correct: false },
            { text: 'The Chaos Fairy Goth', correct: true },
            { text: 'The Pink Princess Goth', correct: false }
        ],
        completedTitle: 'CONGRATULATIONS!',
        completedCopy: "Correct. The Chaos Fairy Goth: forages for mushrooms, knows six types of hexes and will braid your hair before emotionally devastating you. Approach with caution. And snacks."
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
        fight: 'cfg'
    },
    complete: {
        image: 'assets/arenas/cfg-arena.webp',   // placeholder
        big: 'Congratulations',
        sub: "You've survived one (1) glittery, barefoot, mushroom-foraging agent of chaos. She's left you her bow, which feels like a trap. The princess is getting closer... probably.",
        ask: 'Level 3 is still being built.'
    }
};
