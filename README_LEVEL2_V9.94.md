# Goodbye Goth V9.94: Level 2 (The Mystical Forest)

**Branch:** `Level2-dev` (made from Testing5). Nothing here is on Testing5 or the live Vercel site yet.
The other chat's Level 1 fixes from Testing5 have been merged into this branch, up to commit `ea9bb3d`.

There's nothing to upload by hand. Everything is already pushed to `Level2-dev` on GitHub.

## How Level 2 is built

Level 2 now runs on **the same engine as Level 1** (`js/levels/level1.js`), so it plays exactly like Level 1:
- fog of war
- collision
- clickable map icons
- the "Are you ready?" screens
- Princess Question
- saving and autosave
- knockouts ("Try again" or "Back to map")
- the 3-2-1 intros
- the key-and-gate flow

Level 1 runs exactly as before. Every Level 2 change only switches on when the level is 2.

## Files (GitHub path = where it lives)

| GitHub path | What it is |
|---|---|
| `js/levels/level2-config.js` | **NEW.** Everything about Level 2: where things are on the map, all the text, Chain Goth's difficulty numbers, the question, Sophia's screen |
| `js/levels/level2-walk.js` | **NEW.** Level 2 collision (generated, don't edit by hand) |
| `tools/build_level2_walk.py` | **NEW.** Makes the collision from a list of blocked shapes. Edit the shapes and re-run it |
| `js/levels/level1.js` | The shared engine. Small, marked `V9.94` changes so it can run Level 2 |
| `js/levels/level2.js` | Find the Princess rebuilt with your art. Devil's Fingers and Sophia can now be run from the real Level 2 |
| `js/game.js` | One setup for both levels. Level 1's **Ready** button now goes into the real Level 2, and a save slot remembers its level |
| `js/saves.js`, `js/cheats.js` | Slot list shows the level. New cheat codes (below) |
| `assets/minigames/find-the-princess/*.webp` | Your mushroom and princess art |
| `assets/encounters/level2/*-placeholder.webp`, `assets/items/pendant-placeholder.webp` | **Placeholder** art (see below) |

## What's in Level 2

- **Start:** the top-right clearing, by the ruined arches.
- **Five things to do:**
  1. Tom's journal (by the hollow)
  2. Find the Princess (fairy ring)
  3. Princess Question (in front of the gazebo): "According to The Goth Girl Guide™, which of these is an appropriate gift to give a goth?" (answer D, black roses and a vial of your own blood)
  4. Chain Goth (top-left)
  5. Devil's Fingers (between the big tree house and the moon-banner house)
- **Pendant:** after all five, it appears on the rune circle by the standing stones. Pick it up, go to the **glowing doorway at the top middle**, open the backpack, select the pendant and press USE. Sophia's screen then appears.
- **Harder Chain Goth:** same animations. 25% faster, 30% more damage (swipe 13, slam 20), 30% less rest after attacks, a slightly quicker swipe wind-up, and a 40% chance she whips the chain straight back for a second swipe. All numbers are in `chainHard` in `level2-config.js`.
- **Find the Princess:** 3 rounds with 3 mushrooms (mushroom, tall mushroom, big mushroom), then 3 rounds with 5 (a second tall and a second big; still only one toadstool). It gets faster each round. You need 4 out of 6 (60%) to pass. At the end the other mushrooms fade and she pops out of her last mushroom in your "found her" picture. Round speeds are in `SHELL_ROUNDS` in `level2.js`.
- **Heavy Attack** is already unlocked in Level 2, and Level 1's rewards carry over (max HP, faster Heavy Attack, veil, potion).

## Still placeholder or missing (needs your art)

- "Are you ready?" screens for **Devil's Fingers**, **Find the Princess** and the **glowing doorway**. These are marked "placeholder art".
- The **pendant** icon (a simple drawn crystal for now).
- **Sophia's** encounter screen (uses her idle picture for now), plus the **Level 2 complete** picture.
- **Chain Goth's** Level 2 screens use her Level 1 ones for now.
- **Tom's cutscene:** upload it as `assets/video/tom-cutscene/tom-cutscene.mp4`. Until then, clicking the journal shows placeholder lines.
- **Devil's Fingers and Sophia** still use the earlier preview fight screen, not Level 1's fight screen. That's the next big job. It means no 3-2-1 intro, rings or Level 1-style HUD in those two fights yet, but they use Olly's real HP, KO and Try Again.

## Testing checklist (not yet played by a person)

I ran automated browser checks and saw no errors. **Nobody has played it yet.**

**Get into Level 2**
- [ ] Add `?level=2` to the end of the web address to go straight into Level 2.
- [ ] Or play Level 1, press **Ready** on the win screen, and check that Level 2 starts.

**Map and collision**
- [ ] Olly starts in the top-right clearing.
- [ ] Walk around and check that buildings, trees, water and big mushrooms block him.
- [ ] Add `&walk=1` to see the walkable area in green.

**The five things to do**
- [ ] Fog clears as you walk.
- [ ] All five icons work.
- [ ] Tom follows you after the journal.

**Fights**
- [ ] Chain Goth feels "noticeably harder" (tell me what to tune).
- [ ] Lose a fight, then check that Try Again and Back to Map work.

**Find the Princess**
- [ ] It's easy to follow which mushroom she's under, and the speed feels right.

**Pendant, doorway and Sophia**
- [ ] The pendant appears after all five things are done.
- [ ] USE works at the doorway.
- [ ] Sophia's screen appears, then the Level 2 win screen.

**Saving**
- [ ] Save and Quit, then Load Game, and check that it comes back to Level 2.

**Level 1 (must be unchanged)**
- [ ] Both Goth fights, Heavy Attack reward, Would You?, the Princess Question and Patricia all work as before.

## New cheat codes (Option/Alt key, type the code, Enter)

| Code | What it does |
|---|---|
| `df` | Devil's Fingers fight (add `win` or `loss` to end it) |
| `sophia` | Sophia's fight |
| `chain goth` | Harder Chain Goth fight in Level 2 |
| `mushrooms` | Play Find the Princess |
| `find princess` | Mark Find the Princess as done |
| `tom` | Tom's journal |
| `question` | Princess Question |
| `pendant` | Finish everything and put the pendant (or key) in the backpack |

## Merging into Testing5 later

Once you're happy with it, I'll merge `Level2-dev` into Testing5 and sort out anything the other chat has changed in the meantime.
