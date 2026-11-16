GOODBYE GOTH - V9.31
====================
Upload every file in this ZIP to branch Testing5, keeping the folders exactly as they are. I compared against what is on GitHub
right now: only these 10 files differ, so only these are included (all assets from V9.30 are already there).

FILES TO UPLOAD (GitHub path = same path as in the ZIP)
- index.html
- css/screen-polish.css
- js/audio.js, js/controls.js, js/game.js, js/saves.js (NEW), js/screen-polish.js, js/settings.js, js/story.js
- js/levels/level1.js
(All versions are bumped to 9310, so a normal reload is enough.)

WHAT'S NEW
SAVING
- Why your progress vanished: the game only saved when you pressed Save in Settings. Now it AUTOSAVES every 15 seconds on the map,
  right after you start, and whenever you close / refresh / switch tab. Refreshing no longer loses anything.
- 3 save slots. NEW GAME asks which slot and, if it has a save, asks "replace it?" before wiping anything. LOAD GAME shows the three
  slots (Goths beaten / HP / last saved). An old single save, if it survived, becomes Slot 1.
- Settings has SAVE GAME and SAVE AND QUIT (saves, then back to the title screen).
- After Patricia knocks you out the buttons are TRY AGAIN and SAVE AND QUIT; Load Game puts you back on her screen.
SETTINGS
- FULLSCREEN is the top button. "Clear background" is now DARK MODE / LIGHT MODE buttons (light = see-through).
- The gear is always visible in the bottom-left corner (slides, fights, everything). O still works.
CONTROLS
- Punch is X only (left-click no longer punches; right-click still dodges). Settings text updated.
  The Controls slide before Level 1 still says "X / LEFT CLICK" - I left slide wording for the writing pass (say if you want it now).
WOULD YOU
- The explanation is on the encounter slide ("You've encountered a relationship challenge. Would You: sometimes princesses..."). The game
  screen keeps one short line.
LOOK
- Text boxes (map dialogue, fight line, encounter / complete slides, Would You bubble, Princess Question, Patricia card, Heavy Attack
  screen) restyled: plum sticker cards, chunky pink outline, stitched inner line, rounded hand-lettered font (Google font "Pangolin",
  needs internet; falls back to a rounded comic font). Tell me if it's the right vibe.
- Explanation screens cover the whole browser window even when not fullscreen.
- Heavy Attack screen no longer says "unlocked" twice.
ZOMBIE GOTH: 3-2-1 = she moves once, then freezes in her attack-ready pose.
OLLY: no grunt on dodge (it sounded like hurt). Heavy attack: head no longer swells (crouch frames were stretched; now one fixed scale).
CHAIN GOTH: easier to stun (5.5 s to land the 3 hits, was 4 s) and stun lasts ~25% longer; yellow slam ~11% quicker.
  Death: the game uses the newest death sheet in the repo (ChainGothDeath-retry, identical to the chaingothdeath folder). If yours is
  newer, send it to me in the chat (or upload it in a new folder ChainGothDeath-v3) and I'll swap it in. Renaming alone won't change anything.
PATRICIA
- Speed: likely cause found. Her clips are 24 fps video; I had timed her as if ~31 fps and some moves (windup, smoke, hurt) at about 2x.
  Everything is now timed at true 24 fps (sword windup 0.76 s -> 1.5 s, smoke 2x slower, walk/combo 1.3x slower). Tell me if any move is still off.
- Floating: her arena floor is lower, so both fighters are drawn ~105 px lower and stand on the floor.
- "Unfair fight" starts 2 s after the fight loads.
- Olly's sounds / her voice lines: could not reproduce here. Likely Safari leaving the sound engine paused until a click/key; it is now woken on
  every click and key press. Only two Patricia lines exist (unfair fight, check backpack); hurt/attack lines have no audio yet.

TESTING CHECKLIST (please try on your Mac in Safari)
1. NEW GAME shows 3 slots. Play a bit, refresh, LOAD GAME -> your progress is there.
2. Settings: Fullscreen on top, Dark/Light, Game -> Save Game and Save and Quit.
3. Gear visible on slides, fights, Heavy Attack screen.
4. Zombie: 3-2-1 one move then frozen. Dodge: no hurt grunt. Heavy attack: head normal.
5. Chain Goth: stun easier / longer; slam a touch quicker.
6. Patricia: feet on the floor, speech after 2 s, normal pace, Olly sounds. Get KO'd -> TRY AGAIN / SAVE AND QUIT.
7. Relationship challenge slide has the new text.

HONEST TEST NOTE
Tested in automated Chrome only: slots, load, autosave, save-and-quit, settings, Patricia fight + death screen, zombie intro, no JS errors.
NOT tested: Safari, any sound by ear, the Pangolin font, how Patricia's speed feels, Chain Goth stun/slam by hand.
