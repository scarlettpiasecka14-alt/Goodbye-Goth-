GOODBYE GOTH V9.35 - encounter/Would You fixes, font F, themed boxes, Chain Goth's new death
==========================================================================================
UPLOAD to Testing5 (keep folders exactly as in the zip):
  css/screen-polish.css
  js/game.js
  js/levels/level1.js
  assets/characters/combat/chain-goth/chain-death.webp     (replaces the old death)
  assets/fonts/CormorantGaramond-regular-600.woff           (new folder: assets/fonts)
  assets/fonts/CormorantGaramond-italic-600.woff
  assets/fonts/OFL-CormorantGaramond.txt                    (the font's licence; keep it with the font)
  tools/build_chain_assets.py                               (optional: only the builder script)

WHAT CHANGED
1. Relationship challenge screen: the picture is large again (about 63% of the screen height). No big title. First line is slightly bigger,
   the explanation below it, then "Are you ready?" and the buttons.
2. Would You: the changing phrase is now directly under the explanation line, then the bar, then the button. The button is a normal size,
   centred. The phrase no longer turns pink when you press (the sound is the cue). The tally dots stay at the bottom.
3. Font F = Cormorant Garamond, bundled as files in assets/fonts so it works offline (no Google). Used for: the bottom message bar, fight note,
   encounter/explanation text, Would You text, Princess Question text and answers, and Patricia's speech bubble. Titles, buttons, the HUD and
   Settings are unchanged (tell me if you want it there too). It looks small, so the text sizes were increased.
4. Themed boxes: the bottom message bar and fight note are now an ink-black card with a thin double pink line, like a gothic window frame, with
   little stars on the top edge. Patricia's bubble is ink-black with cut corners, a double pink line, a thorn-shaped tail and stars either side of the text.
   These are a first attempt at "unique and themed"; tell me what to push further (bats? roses? chains? candle glow? a crest?).
5. Chain Goth: now uses your ChainGothDeath3 (frames 7-28 plus the floor frame). The old death is gone.

NOT DONE YET (from your last message about Patricia)
 - Purple-ring tutorial screen (waiting for your image), the "SHE REAPPEARS HERE" label is still in V9.34.
 - Half-health pause + zoom + "you're going to pay for that" + immediate lightning.
 - Patricia walk speed (waiting for your check of V9.34).

HONEST TESTING NOTES
Tested in automated Chrome only (not Safari): the encounter screen, Would You screen, bottom message bar, Patricia's bubble, Chain Goth death
(it lands on the floor line), no JS errors. I have NOT checked how the font looks on your Mac, or the new death's timing by eye.
