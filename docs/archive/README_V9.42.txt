GOODBYE GOTH  V9.42  (corner stamp V9.42)  - one small zip, upload on top of V9.41.
Files: index.html, js/game.js, js/settings.js, js/story.js, js/cheats.js, js/audio.js, js/levels/level1.js, css/screen-polish.css

WHERE THE CUTSCENE GOES:  assets/video/cutscene4/patricia-death.mp4   (new folder "cutscene4", exact lowercase name)
 (patriciadeath.mp4 / PatriciaDeath.mp4 / patricia-death.mov also work)

HOW IT NOW GOES
1. When Patricia's fight starts, the game quietly loads the cutscene in the background.
2. The punch that takes her to 0 HP starts it immediately: it fades over the arena (about 0.2 s) and plays. Fight music is stopped (the video carries BossFight1 itself). SKIP button bottom-right.
3. When it ends or is skipped, the arena returns with BossFight1 restarting 15 seconds into the track.
4. A chest drops in front of Olly (placeholder drawing for now, glowing). Walk up to it (within about a body length) and click it (or press the attack / jump key). Too far away: it tells you to walk up.
5. The chest lid opens (placeholder), and a reward pop-up appears in the backpack style, with TAKE ALL. CONTINUE becomes available once everything is taken.
6. CONTINUE shows the "Level 1 complete" screen.
- If the video file is missing or can't load, it carries straight on to the chest (nothing breaks).
- REWARDS ARE PLACEHOLDERS: Max HP +20 (also fully heals) and Heavy Attack recharge -20% (15s -> 12s). Tell me the final rewards/icons and I'll swap them. Both effects are saved with the save game.
- When you have the chest green screen, send it and I'll replace the placeholder drawing.

TESTED (desktop Chrome test copy): with a 3-second test video: cutscene started instantly, chest appeared after it, walking up + clicking opened the reward pop-up, TAKE ALL + CONTINUE reached the "Level 1 complete" screen; and with no video file it skipped straight to the chest. In one of three runs the test copy's video did not start (took the 3-second fallback to the chest): I couldn't tell if that is only my slow test browser, so please tell me if the cutscene ever fails to start. NOT tested: real cutscene, Safari, the BossFight1 15-second restart by ear (the code sets the start time; listen for it), reward effects after a reload.
Note: the Patricia fight's normal win screen no longer comes up first; the Level complete screen now only appears after the chest rewards.
