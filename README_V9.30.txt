GOODBYE GOTH - V9.30
====================
Everything from V9.27 to V9.29 is INCLUDED again, plus the V9.30 changes. Upload ALL of it
to branch Testing5, keeping the folders exactly as they are in this ZIP, then wait for Vercel
and reload normally (all file versions were bumped to 9300, so no hard refresh is needed).

NEW IN V9.30
------------
MAP / LEVEL 1
- Icons moved to your X marks: Zombie Goth (pink), Princess Question (purple, top right),
  Chain Goth (green), key spawn (yellow), puzzle piece (grey). All checked against the walk grid.
- Puzzle piece and Princess Question icons smaller; Olly bigger on the map.
- Zombie Goth is hidden at the start (she is further from the start now AND only fades in when close).
- Map picture sharper: it now draws at your screen's real resolution (it used to be a small
  fixed canvas stretched up) and uses a pre-sharpened 2x copy of the map (new file level1-map-bg-2x.webp).
- The key now disappears from the backpack once the gate opens (Patricia fight and Load Game too).

WOULD YOU / PRINCESS QUESTION
- Would You: 10 rounds, smaller bubble, almost no text on screen, NO wrong-answer buzz
  (challenge-complete and round-ok sounds stay).
- Princess Question: bigger picture, smaller question and answers. The wrong-answer buzz stays there
  only (placeholder until you give me voice lines).

ZOMBIE GOTH
- Back to the ORIGINAL 12-frame walk (legs visibly cross). The V9.24 walk never crossed its legs.
- 3-2-1: only the calm first part of the new clip is used (the later frames shuffled her feet on the spot = treadmill).
- Red attack: she now crawls after Olly the whole time (loops the crawl frames) and keeps chasing even
  after he dodges - she just can't bite him. (She used to chase; V9.28 let her stand still.)

CHAIN GOTH
- Walk rebuilt from the face-visible side of your walk sheet (frames 4-18) and flipped as needed.
- Yellow slam sparks: many more, streaking, with a fountain burst where the chain hits and a bright flash.
- Death/other sprites cache-busted (9300). The death sheet used is ChainGothDeath-retry (the newest one in the repo).

PATRICIA
- Her own arena (assets/arenas/patricia-arena.webp) is now used in the fight.
- Olly drawn at 80% size in her fight (so he is not bigger than her, especially on the heavy attack).
- "I wouldn't enjoy an unfair fight..." / "Check your backpack." are now speech bubbles over her head;
  1 second after the fight loads the first line plays, the second starts only after the first has finished (no overlap).
- Removed ALL zombie groans/hurt sounds from her fight (hit, stage 2, defeat, Olly KO). Chain-rattle noises on her moves removed too.
  Sword impacts still use the normal impact thump. She is silent when hit until you give me her voice lines.
- Boss music slot: put her track at assets/audio/music/PatriciaBoss.mp3. Until that file exists the normal fight music plays.
- Move speeds: I could NOT find a cause for 'too fast'. The timings in the game match the preview timings, so I left them. If it is still too fast on your Mac (could be a 120Hz screen), tell me and I will add a speed fix.

SETTINGS
- Sections are now drop-downs: GAME, SOUND, DISPLAY, EFFECTS & QUALITY, CONTROLS.
- Controls list is in 2 columns.
- New: Contrast, HUD size, Text size, High-contrast text, Screen shake, Fog, Shadows,
  Reduce flashing, Sharp picture (full resolution), Crisp pixel map.
- Screen shake is new (small jolt on big hits).

FILES TO UPLOAD (keep the folders)
- index.html
- css/screen-polish.css
- js/audio.js, js/controls.js, js/game.js, js/settings.js, js/story.js
- js/levels/level1.js
- assets/audio/sfx/minigame-win.mp3, quiz-win.mp3, round-ok.mp3, wrong-buzz.mp3
- assets/characters/combat/zombie-v2/hurt-001.webp ... hurt-019.webp   (19 files)
- assets/characters/combat/chain-goth/chain-walk.webp   (REPLACES the old one)
- assets/environment/level1-map-bg-2x.webp   (NEW)
- assets/characters/patricia/atlas/ (8 files: pat-*.webp, from V9.29)
- tools/build_zombie_hurt.py, tools/build_chain_assets.py

TESTING CHECKLIST
1. Reload. Start view: church visible, no zombie, icons in the new places and smaller.
2. Walk to each icon (puzzle piece, Princess Question top right, zombie, chain).
3. Zombie fight: walk cycle shows legs crossing; 3-2-1 no treadmill; red attack - dodge it, she keeps crawling after you.
4. Chain fight: you can see her face when she walks; slam sparks.
5. Would You: 10 rounds, small bubble, no buzz. Princess Question: big picture, small text, wrong answer buzzes.
6. Patricia: her arena, speech bubbles + no overlap, Olly smaller, no zombie noises, key not in backpack.
7. Press O -> Settings: sections open/close, controls in 2 columns, every new option does something.

HONEST TEST NOTE
Tested in automated Chrome only (not Safari). I have not heard any of the sounds, and I could not play a long
Patricia fight by hand.
