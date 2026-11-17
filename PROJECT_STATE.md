Goodbye Goth v4.7.7: canonical Princess Question icon embedded as a fallback in Level 1 so the gothic-heart sprite cannot disappear due to asset path/cache issues. No other gameplay or map systems changed.

## Agreed roadmap (Nov 2026, V9.52)
Vision: a standalone offline game like Slay the Spire (click the app icon and it plays), 10 levels planned, only Level 1 built so far.
1. Patricia: Scarlett screen-records the fight (with audio, timestamps of what feels off) and sends it; fix timing/feel, voice-line variety (each line at least once per fight), quality (fill the frame), death cutscene music check.
2. Clean up files (Level 1 assets are ~825 MB; set a per-level size budget; remove unused old frames/source videos) and package as a desktop app (Electron + automatic GitHub builds for Windows and Mac). Needs: local server inside the app (audio loader uses fetch), saves written as a real file in the player's folder, app icon/title, fullscreen (F11 / Settings), Quit button. Unsigned apps show a first-run warning.
3. Controller support (Gamepad API): movement/combat plus menu navigation, on-screen button prompts that switch with the input device. Test in the packaged app.
4. Level 1 ending art/animations, missing sound effects, rewrite all text in the style of the original book, general bug fixing.
5. High-end PC check: 120-144 Hz refresh (game speed must not change), 4K sharpness, ultrawide borders. AMD vs Nvidia does not matter (2D canvas).
6. Optional: cheap visual polish (vignette, grain, colour grade, glows); real shaders (WebGL) skipped for now.
