Goodbye Goth v4.7.7: canonical Princess Question icon embedded as a fallback in Level 1 so the gothic-heart sprite cannot disappear due to asset path/cache issues. No other gameplay or map systems changed.

## Agreed roadmap (Nov 2026, V9.52)
Vision: a standalone offline game like Slay the Spire (click the app icon and it plays), 10 levels planned, only Level 1 built so far.
1. Patricia: Scarlett screen-records the fight (with audio, timestamps of what feels off) and sends it; fix timing/feel, voice-line variety (each line at least once per fight), quality (fill the frame), death cutscene music check.
2. Clean up files (Level 1 assets are ~825 MB; set a per-level size budget; remove unused old frames/source videos) and package as a desktop app (Electron + automatic GitHub builds for Windows and Mac). Needs: local server inside the app (audio loader uses fetch), saves written as a real file in the player's folder, app icon/title, fullscreen (F11 / Settings), Quit button. Unsigned apps show a first-run warning.
3. Controller support (Gamepad API): movement/combat plus menu navigation, on-screen button prompts that switch with the input device. Test in the packaged app.
4. Level 1 ending art/animations, missing sound effects, rewrite all text in the style of the original book, general bug fixing.
5. High-end PC check: 120-144 Hz refresh (game speed must not change), 4K sharpness, ultrawide borders. AMD vs Nvidia does not matter (2D canvas).
6. Optional: cheap visual polish (vignette, grain, colour grade, glows); real shaders (WebGL) skipped for now.

## Notes 18 Nov (V9.56)
- ZG fight confirmed complete. TODO (art only, not animation): change the "defeated" art for ZG and Chain Goth.
- Chain Goth death: was shrinking during the animation -> k ramp flattened in V9.56 (1.0 -> .9 -> .86). Check in game.
- Scarlett will regenerate the ZG 3-2-1 FIGHT clip (quality is below the rest of the fight).
- Patricia: hurt reactions are the main problem; she freezes before attacks -> Scarlett will generate an "attack ready" side-on pose clip. She looks small / low contrast / thin, especially in her walk. Big sword attack is her best animation. Splitting the sword combo is approved.
- Scarlett will generate for Patricia: (1) hurt reactions, (2) half-health cutscene on green screen (replaces the current half-HP sequence), (3) attack-ready animation. All need keying.
- Patricia animations feel a bit SLOW (noted only, do not change yet; she is not 100% sure).
- Chest bug: Olly could not walk up to the chest (Patricia's invisible body still blocked him). Fixed V9.56: no collision once she has fallen.
- Then standardise Patricia size/contrast (walk is tiny and thin), brightness against the dark arena.

## Controller layout (agreed 18 Nov) and bow plan
- Controller: left stick/D-pad move (also in menus); A = select/interact/continue (and jump in fights, opens chests); B = dodge in fights, back/cancel in menus; X = punch; Y = heavy attack; Start = Settings; View/Select = inventory (backpack). Bumpers/triggers are kept free on purpose for the bow.
- Bow (after Level 2.5 boss Chaos Fairy Goth: Olly takes her magic bow + arrows): controller = LT raises/aims, right stick fine aim, RT draws and fires (release RT = shoot; release LT = lower bow without shooting), left stick still moves. Keyboard/mouse = hold right mouse button to aim, move mouse, release to shoot. Right click is currently DODGE, so it only aims while the bow is equipped; dodge stays on R.
- Testing: Scarlett has an Xbox controller; connect over Bluetooth (hold pairing button) or USB, check on gamepad-tester.com.

## V9.57 (18 Nov)
- New defeated art installed (Chain Goth = green with mace; Zombie Goth = pink with bow), cache-bust ?v=2.
- Chain Goth 3-2-1 is now the new green-screen clip (tools/build_chain_intro_v2.py, 121 frames @45 ms, plays once then holds the standing pose). No code-added sparks on it (the clip has its own).
- Removed the yellow glow around Chain Goth's whole body during the slam warning; the warning is the floor ring + danger strips only.

## V9.58 (18 Nov)
- Patricia's reward chest is now the real opening clip (tools/build_chest.py -> assets/environment/chest-open.webp, CHEST_ATLAS_DATA in level1.js, sound assets/audio/sfx/chest-open.mp3). Spike tips cut by the video's top edge are redrawn, bottom extruded, stray green glow removed; rewards pop up 2.9 s after clicking. Seen in a test browser: chest drops in and waits closed; opening not yet seen in game.
- Desktop app (Electron): Mac builds are ad-hoc signed from now on. Scarlett reported on the first build: "damaged" warning (fixed by xattr -cr on the app) and INPUT LAG of about 3 s in the app (not in Safari). To investigate: x64 build run on an Apple-silicon Mac (Rosetta), app stored on iCloud Desktop, GPU/frame rate in Electron.

## V9.65 controller support (built, tested only with a fake controller in a headless browser)
- js/gamepad.js: Gamepad API -> synthesises the same key presses as the keyboard (uses current bindings), so fights/map follow the keyboard code. A jump/interact, B dodge, X punch, Y heavy, Start = Settings (or skips an intro/cutscene when a skip button is showing), View = backpack. Stick or D-pad moves.
- Menus/pop-ups: D-pad/stick moves a pink highlight (.gg-pad-focus), A presses it, B goes back (closes Settings/backpack, BACK/NO on slot screens), left/right changes sliders. Skip buttons are never highlighted (Start only).
- Highlight hides again when the mouse or keyboard is used. Toast shows the layout when a controller connects.
- V9.66: prompts swap to pad button names once a pad is used (controls.js actionHint/hintHTML, .gg-hint spans refreshed by setUsingPad); Space/Enter/A skip story typing; Settings > Controls > CONTROLLER rebinds jump/dodge/punch/heavy/backpack (saved in localStorage goodbyeGothPad_v1; Start, D-pad, sticks fixed); summaries in Settings are reachable with the pad.
- Still not done: bumpers/triggers reserved for the bow; combat-tutorial pop-ups not checked for key names; only tested with a fake controller.
