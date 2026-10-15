GOODBYE GOTH — SHARED SCREEN POLISH PATCH
Target: public repository branch Testing4

PURPOSE
- Remove nested card borders/backgrounds from encounter, completion and knockout screens.
- Put artwork on the plain page background, with title/copy/buttons below it.
- Give the completion and knockout artwork more usable width/height.
- Make the Heavy Attack reward use the same full-viewport treatment.
- Make the gate cutscene video fill the viewport and hide the ordinary “LOADING CUTSCENE...” label.
- Change the visible knockout button text from “BACK TO MAP” to “KEEP EXPLORING”, without changing its existing action.
- Remove inner image borders from the Princess Question and WOULD YOU? live activity screens.

FILES
- Replace index.html with the included index.html.
- Add css/screen-polish.css at that exact path.
- Add js/screen-polish.js at that exact path.

IMPORTANT
- This is an additive presentation patch. It does not replace js/game.js or js/levels/level1.js.
- It does not intentionally alter combat AI, hit detection, enemy damage, challenge answers, map logic, inventory, save/load, or progression.
- The existing cutscene play fallback and actual playback-failure message remain available.
- The new helper script only changes the knockout button's displayed label and the cutscene's normal loading message/presentation.

VALIDATION
- Check JavaScript syntax and the patch ZIP integrity before delivery.
- Live browser testing isn't available from this patch-building environment. After applying to Testing4, check encounter intro screens, both enemy completion screens, knockout, Princess Question, WOULD YOU?, Heavy Attack reward, and the gate video at desktop and mobile widths.
- Keep Version-8-safe unchanged. Apply this only to Testing4 and test before promoting anything.
