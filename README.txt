GOODBYE GOTH - V9.12 (small fix)
Upload to the same path on GitHub (Testing5), replacing the old file:
  js/audio.js

WHY: your Menu.mp3 is saved with a capital M, and GitHub/Vercel treat file names as case-sensitive, so the game was looking for menu.mp3 and not finding it. The game now looks for Menu.mp3 (so keep that exact name).
Also, your Ambiance.mp3 (10 min, 25MB) is now used for the intro + map ambience, streamed like music. (Decoding it like a short sound effect would use ~225MB of memory.) Keep its name as Ambiance.mp3. You can delete my placeholder assets/audio/sfx/ambience.mp3 on GitHub, it is no longer used.

TEST: Sound ON (O), reload; title song should play after your first click, fade out when you press New Game; ambience under the intro and on the map.
Not tested by listening - I can only check the code loads without errors.
