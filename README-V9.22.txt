GOODBYE GOTH V9.22 - Patricia pre-fight potion scene (includes everything from V9.21)

This ZIP replaces V9.21: you do NOT need to upload V9.21 as well. If you already uploaded the
separate OllyDrink-art.zip, this one overwrites those same files, which is fine.

Upload to branch Testing5 with the folders named exactly like this (check GitHub's pre-commit list:
every path must start with index.html, css/, js/ or assets/ - no wrapper folder):
  index.html
  css/screen-polish.css
  js/game.js
  js/settings.js
  js/story.js
  js/levels/level1.js
  assets/audio/sfx/patricia-unfair-fight.mp3
  assets/audio/sfx/patricia-check-backpack.mp3
  assets/items/potion-vial.webp
  assets/combat/OllyDrink/olly-drink-00.webp ... olly-drink-49.webp, manifest.json   (51 files)
(About 62 files, so one commit is fine.)

What happens now
1. Click "I'm Ready" on the Patricia screen. The fight screen appears but nothing attacks yet.
2. Patricia: "I wouldn't enjoy an unfair fight..." then "Check your backpack." (subtitles show in the text bar, so it works with sound off.)
3. The potion appears in the backpack (it was empty of a potion before). After her line, the Inventory button glows and the bar says "Press Y to open your backpack."
4. Hover the potion: "Drink to restore to full HP."  Click it: a panel with DRINK and SAVE FOR LATER.
5. DRINK: the bag closes, Olly drinks the potion (your vial), a green glow, HP goes to full, potion is used up, then the 3-2-1 countdown, then the fight.
   SAVE FOR LATER: the bag closes, the 3-2-1 countdown starts straight away, and the potion stays in the bag.
6. Until a choice is made the fight does not start, so the player can take their time.

Also in this version
- V9.21 key changes (real key art, hover text, USE at the gate).
- The backpack now opens ON TOP of the fight screen (it was hidden behind it before).
- Outside the boss fight, a potion's DRINK just heals to full (nothing else uses it yet).

Not done yet (next stages)
- This is still the PLACEHOLDER boss fight (green zombie-looking Queen, 100 HP). The real Patricia comes next.
- Dying and retrying does not replay this scene yet, and drinking/saving the potion in a retry is not wired up. That comes with the real fight so the potion rules (unused potion never disappears) are done properly.
- No drinking sound: I wasn't given one. The drink animation snaps back to his fighting stance at the end; I can smooth that if it bothers you.

Checked: all JS passes a syntax check. I ran the game in a headless browser with a saved game for BOTH choices (Drink and Save for later): subtitles, potion appearing, hover text, panel, Olly drinking facing the Queen, HP going to full, countdown, then the fight starting. No errors. I have NOT heard the audio play or played it by hand in Safari.

Your testing checklist (Safari, hard refresh Cmd+Shift+R, sound ON in Settings to hear her)
[ ] Click "I'm Ready": you hear/see the two Patricia lines and cannot move yet.
[ ] The Inventory button glows after "Check your backpack".
[ ] Press Y: potion shown with the real vial picture. Hover: "Drink to restore to full HP."
[ ] Try picking before she finishes: it says "Let her finish..."
[ ] DRINK: he drinks facing the Queen, HP bar fills, countdown, fight starts.
[ ] Start over (Load Game again) and choose SAVE FOR LATER: countdown starts, potion still in the bag afterwards.
[ ] Closing the bag without choosing does nothing; the fight waits.
