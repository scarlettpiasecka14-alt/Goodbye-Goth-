GOODBYE GOTH V9.34  -  visuals back to V9.25 + Patricia fixes + cheat codes
===========================================================================
UPLOAD to branch Testing5 (keep the folders exactly as in this zip):
  css/screen-polish.css
  index.html
  js/audio.js
  js/cheats.js            <- the Cmd+S command box (you hadn't uploaded this one)
  js/game.js
  js/levels/level1.js
  js/settings.js
  assets/audio/music/BossFight1.mp3     <- your boss track (new file)

WHAT CHANGED
1. LOOK: back to the V9.25 look. Removed the cute sticker boxes, the Pangolin font (no Google font any more, so it works offline), the
   heavy-attack box and the bubble-style Would You box. Kept the things that WORK: gear always visible, explanation screens
   full-window, save slots, Save and Quit, Dark/Light mode buttons, Fullscreen at the top of Settings.
2. Relationship challenge screen: the big title is gone; "You've encountered a relationship challenge." is slightly bigger with the
   explanation under it; the picture is a bit smaller so everything fits.
3. Would You: the win/tally dots now sit at the BOTTOM, below the button.
4. Zombie Goth 3-2-1: now plays her claw swipe slowly across the countdown (instead of the quick freeze).
5. Patricia:
   - Same size in every move (her walk was ~13% too big and her combo ~10% too small; now matched).
   - No more gliding: she only plays the walk while she is really moving, otherwise she idles.
   - She never walks backwards any more (she only walks toward Olly). Walk is a bit slower and calmer.
   - Vanish: she now really reappears on the FAR side of Olly (it was a sign bug, so she came back where she started).
     The purple ring says "SHE REAPPEARS HERE". (The ring you saw is this purple ring.)
   - Half health: a white tick at 50% on her health bar, a red flash + big "HALF HEALTH!" banner, and her bar turns deep red.
   - Lightning: she rises, the lightning loops for a bit, then she settles back down (no more stuck in the air).
   - Voice: attack grunts can now be cut off by real lines; heavy hits always make a sound; light hits sometimes grunt;
     "nice try" plays almost every time you dodge or jump her attack; "you're trying so hard" more often after a missed punch.
   - Boss music: BossFight1 plays first, then FightMusic1 and FightMusic2 alternate. (Other fights unchanged.)
6. Sound in Safari: if Safari leaves the sound engine suspended, effects now fall back to the normal audio method instead of
   staying silent. I could NOT reproduce your silent Olly sounds, so this is a likely fix, not a confirmed one.
7. Cheat codes (Cmd+S or ` ): patricia, patricia skip, patricia win, patricia loss, chain goth, chain win, chain loss,
   zombie goth, zombie win, zombie loss, win, loss, god, god off, heal, heavy, help.

NOT DONE YET (waiting for you)
 - Chain Goth's new death: upload it as ChainGothDeath-v3 (or send it here) and I will switch it over.
 - Text box and font options, Patricia speech bubble options (after you confirm the revert looks right).
 - Her other points: replacement gate cutscene, hurt/death art, etc.

HONEST TESTING NOTES
Tested in automated Chrome only (not Safari): encounter screen, Would You screen, zombie 3-2-1, Patricia fight start to stage 2, vanish
position, lightning frame sequence, cheat codes, no JS errors. NOT checked by ear or by feel: all sounds, Patricia's walk speed, and
how the lightning loop looks in motion. Please tell me which of those still look wrong.
