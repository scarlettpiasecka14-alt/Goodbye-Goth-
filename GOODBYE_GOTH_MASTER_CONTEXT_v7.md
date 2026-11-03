# GOODBYE GOTH - MASTER CONTEXT / HANDOVER FILE v6

**Master context revision:** 3 November 2026. This revision preserves v5 and adds the current `Testing4` source baseline and Zombie Goth bite/tracking handover.

**Purpose:** Standing handover document for future ChatGPT chats working on Scarlett's browser game **Goodbye Goth**. Read this before making code changes so Scarlett does not need to re-explain the project.

**Owner / creator:** Scarlett  
**Game made for:** Olly, as an anniversary gift  
**Format:** Browser-based 2D RPG/adventure with exploration, encounters, minigames, combat and story screens.  
**Creator coding level:** Scarlett does not code. ChatGPT should implement requested changes and provide complete files/ZIPs or exact replacement instructions, not abstract coding advice.

---

## 1. GAME PREMISE / CANON

Olly wakes around 4:35 AM and discovers that Scarlett, his princess, has been kidnapped by goths. He enters the Goth Abyss and travels through levels to rescue her, completing challenges, puzzles and fights along the way.

The game is based on Scarlett's **Goth Girl Guide** book/world and is intentionally personal to Scarlett and Olly. The tone is gothic, cute, romantic, funny, absurd and teasing.

Do not turn the game into a generic goth RPG. Relationship jokes, shared lore and recurring jokes are part of the canon.

---

## 2. CURRENT BUILD / DEVELOPMENT STATE

### Current authoritative source baseline
**Use the GitHub repository branch `Testing4` as the current source of truth.** It was checked on 3 November 2026 at commit `2a6702bc8c02ed53a715b97f978438b8937fee0`.

Repository: `https://github.com/scarlettpiasecka14-alt/Goodbye-Goth-`  
Current branch: `Testing4`  
The repository default branch is `Version-8-safe`; do **not** use that branch as the development baseline while Scarlett identifies `Testing4` as newest.

The live entry point in `Testing4` is `index.html`, which loads `js/game.js` and `js/screen-polish.js`. `js/game.js` imports `js/story.js` and `js/levels/level1.js`. The main Level 1 gameplay and combat implementation is therefore `js/levels/level1.js`.

The active `js/levels/level1.js` identifies itself as **Goodbye Goth v8.11**. The next coding update created in this new development chat must be labelled **Goodbye Goth V9.0**. V9.0 is the next planned update label, not the current baseline.

Important: `Testing4` also contains root-level files named `game.js` and `level1.js`, but `index.html` does not load those root-level copies. Do not edit them for gameplay fixes unless the active entry point/imports are changed deliberately.

### Important current principle
Do **not** rewrite working systems unnecessarily. Use the newest `Testing4` source, inspect it before every patch, and preserve the tested combat AI/difficulty. Make small, targeted changes.

### Current major remaining Level 1 work
The Zombie Goth fight is now **confirmed complete by Scarlett**. The previous kick-style attack has been replaced by the bite/Ankle Biter move, and Scarlett confirmed the bite is now working correctly after the tracking/facing fix. The code still contains some legacy identifiers such as `heavyKick` for this bite state, while loading the `zombie-ankle-biter` artwork. Do not rename these identifiers casually; inspect every use first.

The immediate next combat development task is **Chain Goth AI**. Reuse the robust finite-state approach already used for Zombie Goth where suitable, but give Chain Goth her own movement, attack style, timing, telegraphs, hit windows, recovery, and art. Preserve the current working Zombie Goth fight and do not regress it.

Other Level 1 finishing work (including sound and any remaining victory/knockout polish) can be revisited as appropriate, but it is no longer a reason to hold back the Chain Goth AI work.

---

## 3. LEVEL STRUCTURE / PROGRESSION

Level 1 = **The Haunted Cemetery**.

Level 1 has exactly four required challenges:
1. Relationship challenge: **WOULD YOU?**
2. Princess Question
3. Zombie Goth
4. Chain Goth

After the Level 1 challenges and key are complete, the boss gate leads to Level 1.5, the first Queen Goth / Classic Goth boss section.

General loop:
**Complete challenges → unlock Queen Goth → defeat Queen Goth → unlock next level.**

Queen Goth is a category/title, not one single character.
- Queen Goth 1 = Classic Goth / Patricia, Level 1.5.
- Queen Goth 2 = Chaos Fairy Goth, Level 2.5.
- The structure continues through the game.
- Final boss at Level 12 = Luna.

---

## 4. CRITICAL LEVEL 1 PROGRESSION RULES

There are two normal Level 1 Goth enemies:
- Zombie Goth / Shambler.
- Chain Goth.

They are tracked independently. **Do not treat a KO/death as resetting the other enemy.**

### Individual defeat persistence
If Olly defeats one Goth and later gets knocked out by the other:
- The Goth he already defeated stays dead/defeated.
- The Goth he did not defeat remains alive and can be fought again.
- Olly returns at **50 HP**.

If Olly has defeated both Goths, then later gets knocked out:
- Both remain defeated.
- Neither should respawn.
- Heavy Attack remains unlocked.

### Heavy Attack unlock
Heavy Attack is **NOT** specifically tied to Chain Goth.

Correct rule:
```js
if (Zombie Goth defeated && Chain Goth defeated) {
    Heavy Attack unlocks;
}
```

The Heavy Attack unlocks when the **second** of the two normal Level 1 Goths is defeated, whichever one the player chooses to fight second.

Current key: **Z**.
Current Heavy Attack damage: **20**.
Current cooldown: **15 seconds**.

The reward screen says, in substance:
- **YOU'VE DEFEATED BOTH LEVEL 1 GOTHS!**
- **HEAVY ATTACK UNLOCKED.**
- Press **Z**.
- **KEEP EXPLORING** returns to the map.

### Current save state requirements
The saved state tracks the two enemies independently through the `enemies` array and stores `heavyUnlocked`.

The current save/load logic should continue to preserve defeated enemies and Heavy Attack progress.

---

## 5. LEVEL 1 MAP / WORLD FACTS

World canvas:
- 1536 x 1024
- GRID = 32
- COLS = 48
- ROWS = 32

Current main positions:
- Olly start approximately `(470, 520)`.
- Zombie Goth approximately `(485, 420)`.
- Chain Goth approximately `(1115, 505)`.
- WOULD YOU? approximately `(360, 800)`.
- Princess Question approximately `(760, 300)`.
- Key approximately `(1200, 700)`.
- Boss gate approximately `(1380, 820)`.

Environment is an illustrated cemetery background. Characters/markers are drawn separately.

Current map movement is controlled by WASD / arrow keys.

---

## 6. CHARACTER CANON

### Olly: locked character design
The canonical Olly design must remain consistent across all future art.
- Curly dark hair.
- **Visible beard/stubble.**
- **No moustache.**
- Expressive cartoon features.
- Black **The Weeknd** T-shirt, with the shirt graphic/text present.
- Dark backpack straps.
- Ripped dark jeans.
- Pink/magenta high-top sneakers.
- Pink skull chain charm.

Recent art inconsistency problem:
- Some generated Olly art incorrectly removed the beard.
- Some generated art omitted the The Weeknd shirt marking.
- Those are generation errors, not canon.

Future Olly sprite generation should use a locked character reference and a **pose reference** whenever possible.

### Princess Scarlett
- Mixed-race / medium-brown complexion.
- Brown hair.
- Glasses matching the locked design.
- Cute pink/princess styling.
- Not goth.

### Zombie Goth / Shambler
- Level 1 first normal Goth enemy.
- Dark/magenta gothic aesthetic.
- Pale undead complexion.
- Long messy black/dark-purple hair with pink/magenta highlights.
- Pink/red eyes.
- Large pink/red bow with skull.
- Gothic black outfit, fishnet tights, chunky platform boots, chains/cross/skull accessories.
- Current pattern label: **Scratch • Lunge**.

### Chain Goth
- Level 1 second normal Goth enemy.
- Distinct green/neon-green aesthetic.
- Uses chains / flail / mace.
- Current standard combat sprite source has historically been `assets/characters/chain-goth-clean.png` with cache-busting query strings.

Do not replace Chain Goth with Fire Goth in Level 1.

---

## 7. CURRENT ART / ANIMATION WORKFLOW

A major lesson from the Zombie Goth walking problem:

**Do not rely on ordinary image generation alone to invent precise animation poses.** Image generators repeatedly struggled with left/right direction and leg switching.

The workflow that now works better is:

**1. Generate / lock the character design**  
**2. Generate a clean reference for the required orientation or pose**  
**3. Use a pose reference when generating further frames**  
**4. Use dedicated animation/sprite software to turn the static poses into a coherent animation**  
**5. Align frames and timing, export transparent PNGs/sprite sheets**  
**6. Integrate them into the game code

This should be the default workflow for future walking/attack/reaction/death art.

Do not throw away useful static pose art just because it is not yet an animation. It can serve as a key pose/reference for animation software.

### Zombie Goth walking
The latest working direction is **strict side-profile** walking. The v7.x work uses side-profile walk frames and the game flips the art horizontally when necessary rather than generating separate left/right animation art.

The user's newer free animation-generator attempt produced a promising side-on 12-frame sequence. A GIF preview suggested that slower timing helped readability. The side-profile set is now the preferred basis for Zombie Goth walking, subject to final in-game testing.

### Zombie Goth scale
In v7.7 her combat render was increased because the first integrated side-profile walking assets made her look miniature beside Olly. Keep her combat scale visually comparable to the established combat sprite and keep her feet aligned to the combat ground line.

---

## 8. OLLY MAP WALKING VS COMBAT

### Map / exploration
Olly now has directional map walking poses in v7.7:
- **W / Up:** back-facing walk.
- **S / Down:** front-facing walk.
- **A / Left:** left-facing side walk.
- **D / Right:** right-facing side walk.

Arrow keys correspond to the same directions.

These are **map-only** poses.

### Combat
Combat remains a side-on arena.
- Olly only moves left/right.
- Existing combat punch/jump/dodge/heavy systems are preserved.
- Do not accidentally use front/back map walking poses in combat.

### Future Olly combat art
Scarlett has noted that Olly's combat art has the same beard/shirt inconsistency problem and may eventually be regenerated properly using the pose-reference workflow. This is a future animation polish task, not a reason to break the currently working combat system.

---

## 9. CURRENT COMBAT SYSTEM

Combat canvas:
- 1440 x 810.
- Ground line approximately `COMBAT_GROUND_Y = 470`.

Player:
- 100 / 100 HP at full health.
- Starts around x=270.

Normal enemy:
- 50 / 50 HP.

Boss:
- 100 / 100 HP.

Basic combat:
- Punch = 10 damage.
- Jump attack = 15 damage.
- 3-hit combo before short cooldown.
- Dodge gives short invulnerability.
- Jump is a short readable jump, not a superhero flip.
- Heavy Attack = 20 damage, 15 second cooldown, unlocked only after both normal Level 1 Goths are defeated.

### Controls
- WASD / arrow keys = movement.
- LEFT CLICK = basic punch.
- RIGHT CLICK or R = dodge.
- SPACE = jump.
- Z = Heavy Attack.
- X = save.
- Y = inventory.

### Difficulty
The current combat difficulty is considered good after playtesting with a friend. **Do not rebalance AI difficulty casually.**

### Zombie Goth AI
The current `Testing4` source uses a state-based combat loop with chase, ready/wind-up, attack, hit/stagger, recovery and death states.

Current regular attack:
- **CLAW SWIPE**.

Current close-in heavy attack:
- The previous kick-style move has been replaced in its visual design by a **bite / Ankle Biter** attack.
- The bite animation uses `assets/characters/combat/zombie-ankle-biter-01.png` through `zombie-ankle-biter-08.png` in the active `js/levels/level1.js` source.
- The animation has a crawl/approach, a bite-contact frame, a held contact moment, recoil and return frames.
- Some existing code state and variable names still say `heavyKick` / `zombieCombatFrames.heavyKick`. Treat those as legacy implementation names until intentionally and safely renamed.
- Scarlett is currently editing/refining the bite. She says the attack looks much better now.

### Zombie Goth completion status
Scarlett has now confirmed that the bite attack is working properly and the two-sided tracking/facing issue has been fixed in-game. Treat the Zombie Goth fight as complete. Preserve this working system as a regression-sensitive baseline while developing other enemies.

The bite must remain **two-sided**: the Zombie Goth should turn and bite from either side of Olly. The bite approach, animation orientation, contact/catch logic and damage should all work whether Olly is to her left or right.

### Combat spatial logic
- Zombie Goth has physical combat body/collision.
- Olly should not be able to simply walk through her while grounded.
- Olly can jump over her.
- Dodge can reposition through/around her.
- Zombie Goth turns to face Olly and pursues forwards after he changes sides.

Do not rebalance this system casually. Preserve the current liked difficulty unless Scarlett asks for a change.

---

## 10. COMBAT REACTIONS / DEFEAT FLOW STILL TO FINISH

The v7.x code already contains logical stagger/hurt state handling, flash/knockback and hurt timing. The remaining task is to make the **actual sprite art** visibly communicate the reactions rather than relying mostly on code motion/state.

### Zombie Goth hit reaction
Need a short readable sequence:
1. Impact/jolt.
2. Backward stagger.
3. Recovery to combat stance.

Heavy Attack should have a stronger visual reaction:
- Larger knockback.
- More dramatic recoil.
- Longer stagger if appropriate.

### Olly hit reaction
Need a short readable sequence:
1. Impact/flinch.
2. Hurt recoil and small knockback.
3. Return to normal combat stance.

### Bite contact
The previous kick-style Zombie Goth move has been replaced by a bite / Ankle Biter attack. Scarlett has confirmed that the bite now looks and works correctly, including the two-sided tracking/facing behaviour.

The intended read is:
**prepare → crawl/lunge toward Olly → grab/contact → bite Olly → hold → recoil/release → recover**.

Preserve the working two-direction bite/contact logic. The visual bite-contact frame and gameplay catch/damage event should remain aligned.

Implementation note: in the `Testing4` source, the bite animation assets are named `zombie-ankle-biter-01.png` etc., but its state and frame-array identifiers still include `heavyKick`. Do not mistake that legacy identifier for a requirement to restore a kick animation.

### Zombie Goth death
Need a dedicated defeat animation before the victory message appears.

Desired sequence:
**Zombie dies → death animation → “You’ve defeated the Zombie Goth” / equivalent → KEEP EXPLORING → return to map.**

### Olly defeat / kidnapping sequence
Olly does not permanently die. His combat defeat should be presented as a temporary knockout/kidnapping event.

Desired sequence:
1. Olly is knocked unconscious.
2. His knockout animation plays.
3. A gothic hand drags him off-screen.
4. A loading/story screen appears.
5. Story text explains he survived and cannot fully remember what happened after the Goths took him, but he feels worse for wear and has mysterious bites.
6. **KEEP EXPLORING** returns him to the map with **50 HP**.
7. Any Goth already defeated remains defeated; any Goth not yet defeated remains available.

Suggested story copy:
> “Lucky you, you survived the attack, you can’t remember exactly what happened after the goths took you… but you do know you feel a bit worse for wear and some mysterious bites have appeared.”

Keep the tone playful and mysterious rather than over-explaining.

---

## 11. SOUND DESIGN PLAN

Sound should now be treated as part of the Level 1 finishing pass rather than something to postpone indefinitely.

### Essential combat SFX
Add short gameplay sounds for:
- Olly punch.
- Heavy Attack.
- Jump/land.
- Dodge/swoosh.
- Olly hurt.
- Zombie Goth claw swipe.
- Zombie Goth lunge/bite.
- Zombie Goth hurt.
- Zombie Goth death.
- Footsteps/movement where practical.
- UI click/confirm.
- Final hit / victory sting.

### Vocalisations
Normal enemies do not need full voice acting.
- Zombie Goth: snarls, groans, attack noises, hurt/death sounds.
- Chain Goth: aggressive vocalisations, chain attack sounds, hurt/death sounds.
- Olly: effort/attack grunts, pain reactions, dodge/jump effort sounds.

### Background audio
Level 1 should eventually have:
- Cemetery ambient sounds.
- Background music.
- Combat music/layer if useful.
- Story/cutscene audio where appropriate.

Named Queen Goths and story characters can use scripted AI-generated voice lines later, preferably as separate audio files so dialogue can be corrected without regenerating video.

---

## 12. STORY / LORE DIRECTION

The game should give the player enough lore to understand there is a reason behind the kidnapping and challenges, but it should not dump the entire explanation in one speech.

Future questions to answer gradually:
1. Why did the Goths kidnap Scarlett?
2. Why are they interested in Olly?
3. Why are the challenges and Queen Goth fights happening?

Use dialogue, environmental clues, items, NPCs/guides, recurring jokes, boss interactions and side quests to reveal this progressively.

### Tom the Puffle
**Canonical name: Tom the Puffle.** This is based on Tom being Olly's best mate in real life.

Planned introduction around Level 2.
- Guides Olly through the Goth Abyss.
- Gives advice, lore, hints and roasts.
- Not normally part of boss fights.
- The puffles were captured by THE Queen Goth.
- Tom escaped but got stuck on Level 1.5 because he could not sneak past Classic Goth.
- Possible Level 11 return-to-family side quest.

Example canon dialogue:
- O: “so tom... any hobbies?”
- T: “football”
- O: “oh god”
- T: “liverpool is shit”
- O: “i will leave u here with classic goth.”

Tom's lore/notebook gag:
- O: “how did u take notes u have no hands”
- T: “i have hands!”
- O: “what where??”
- T: “theyre just buried under my fur how else would i be able to split the g?”

Tom can eventually give Olly a lore book/notes that can be opened at any time and explains combat mechanics such as dodge, Heavy Attack, cooldowns and power-ups.

Potential fourth-wall joke:
- O: “so why have they kidnapped my missus”
- T: “you’ve read the goth girl guide haven’t you??? lets just say they weren’t exactly flattered”

Treat future Tom implementation as planned canon, but do not add him to Level 1 unless explicitly requested.

### Luna
Planned final-boss idea, not current implementation:
- Two-stage final fight.
- Princess Scarlett may be freed before Phase 2 and help Olly.
- Tom stays outside the boss fight.

---

## 13. PROJECT STRUCTURE

### Confirmed live structure on GitHub branch `Testing4`
The current repository is `scarlettpiasecka14-alt/Goodbye-Goth-`, branch `Testing4`.

Active files and imports:
- `index.html` = shell / entry point.
- `js/game.js` = screen flow, global UI, Level 1 mounting, DOM event wiring.
- `js/story.js` = intro/story controller.
- `js/levels/level1.js` = Level 1 world, progression, combat, minigames, save/load. This is the main file for Zombie Goth and Chain Goth combat AI.
- `js/screen-polish.js` = screen polish script.
- `css/game.css` and `css/screen-polish.css` = active styling.
- `assets/...` = art, characters, environment and story media.

`index.html` currently loads:
```html
<script type="module" src="js/game.js"></script>
<script type="module" src="js/screen-polish.js"></script>
```

`js/game.js` imports:
```js
import { StoryController } from './story.js';
import { createLevel1 } from './levels/level1.js';
```

The branch also contains root-level `game.js`, `level1.js` and `game.css` files. They are not the files loaded by the current `index.html`; do not patch those similarly named root-level copies for gameplay changes unless the entry point is deliberately changed.

Do not assume old numbered files or the repository default branch are latest. Use the newest confirmed source on `Testing4` supplied by Scarlett, and inspect the active entry point and imports before coding.

### v7.7 map asset paths
The v7.7 patch uses:
- `assets/characters/map/olly-walk-front.png`
- `assets/characters/map/olly-walk-back.png`
- `assets/characters/map/olly-walk-left.png`
- `assets/characters/map/olly-walk-right.png`

Combat Olly animation assets remain separate from these.

### Current Zombie walk asset architecture
The v7.x code loads dedicated Zombie Goth combat walk frames under:
- `assets/characters/combat/zombie-walk-*.png`

The game handles the animation direction in code rather than requiring a separate full animation cycle for both directions.

---

## 14. IMPORTANT IMPLEMENTATION NOTES

### Boss gate
Older source versions had a known mismatch where `level1(9).js` expected `ui.bossReady` but some `game.js` snapshots did not create it. Verify this against the actual current build before touching the gate again.

### Existing encounter flow
The encounter system uses:
- encounter artwork
- encounter title
- encounter copy
- **I'M READY**
- **KEEP EXPLORING**

Relevant functions in the Level 1 source historically include:
- `openInteractionEncounter()`
- `closeEncounter()`
- `confirmEncounter()`

### Save/load
Current save key remains:
`goodbyeGothSave_v6`

The saved state includes Level 1 progress, HP, relationship/puzzle progress, key, Heavy Attack unlock, inventory, checkpoint and each enemy's defeated/HP state.

Do not break backward compatibility without a reason.

---

## 15. CURRENT WORKFLOW WITH SCARLETT

Scarlett wants the assistant to implement changes rather than merely describe them.

Preferred workflow:
1. Retrieve/inspect the actual current source/build before coding.
2. Keep the current working systems intact.
3. Explain any issue briefly in plain English.
4. Make the smallest necessary change.
5. Produce a downloadable ZIP with the actual changed files/assets.
6. Include a README stating what changed and exactly where to put the files in GitHub.
7. Check JavaScript syntax before claiming a patch is ready.
8. When artwork is involved, use Scarlett's supplied/reference assets rather than inventing replacements.
9. Use pose references whenever possible for new character animation.
10. Do not silently change combat balance.

Scarlett currently uses the GitHub **Testing4** branch as the development baseline and deploys through Vercel. Re-check the branch head before every code update because Scarlett may push a newer tracking or gameplay fix between sessions.

---

## 16. FUTURE ANIMATION WORKFLOW / ART PRIORITY

The most reliable current art workflow is:

**Character design → orientation/pose reference → pose-consistent static frames → dedicated animation software → alignment/timing → game integration.**

### Next likely art tasks
After the current Zombie walk/Olly map pass, likely tasks are:
- Zombie Goth hit reaction.
- Olly hurt reaction.
- Zombie bite/contact animation.
- Zombie death animation.
- Olly knockout + hand-drag sequence.

Later:
- Regenerate/standardise Olly's combat sprites using the same beard + The Weeknd locked reference.
- Richer Chain Goth combat animation.
- Queen Goth animation sets.

---

## 17. MASTER REMINDERS FOR FUTURE CHATS

- This is a real browser game, not a mock-up.
- It is an anniversary gift for Olly.
- Level 1 should be polished before moving to Level 1.5.
- Do not rebuild the map unless explicitly requested.
- Do not rebalance the currently liked combat difficulty without a concrete request.
- Heavy Attack unlocks after **both** normal Level 1 Goths are defeated, in either order.
- A defeated Goth stays defeated across Olly's temporary knockout/return.
- Olly returns from defeat at **50 HP**.
- Map Olly uses directional front/back/left/right poses; combat Olly remains side-on.
- Olly's beard and The Weeknd shirt are canonical and should never disappear from regenerated art.
- Zombie Goth should not render tiny in combat.
- The old Zombie Goth kick-style move has been replaced with a bite / Ankle Biter move.
- Zombie Goth is confirmed complete: Scarlett has approved the bite and confirmed the two-sided tracking/facing fix in-game.
- The next combat AI task is Chain Goth. Preserve the finished Zombie Goth AI and bite behaviour.
- Use pose references for future sprite generation whenever available.
- Sound belongs in the Level 1 finishing pass.
- Tom the Puffle is planned from Level 2 onward, not current Level 1 work.
- Do not bring Excel into the Goodbye Goth workflow.

---

## 18. CURRENT CHAT HANDOVER - OCTOBER 2026

Latest confirmed decisions from this development thread:

1. The Zombie Goth walk cycle was difficult because image generators repeatedly failed to understand left/right leg switching.
2. Slower animation timing improved the appearance of the free AI-generated sequence.
3. A newer generation finally produced a convincing **strict side-profile Zombie Goth** walk sequence. This is preferable to the earlier front/three-quarter frames.
4. v7.7 integrated the current Olly directional map poses and enlarged Zombie Goth's combat render.
5. Scarlett has discovered that **giving the image generator a direct pose reference** works much better than describing the pose only in text. This should be the default art-generation method going forward.
6. Scarlett is also preparing front/back/side Olly walking references for the map.
7. The Zombie Goth bite/tracking work has since been completed and confirmed in-game. Later polish (such as reactions, death/kidnapping flow and sound) can be revisited without undoing that completed fight.
8. Scarlett may later regenerate Olly's combat sprites using the same locked canonical beard + The Weeknd shirt design, but this should not disrupt the current combat system.

**Latest practical baseline:** v7.7.


---

## 19. CURRENT CHAT HANDOVER - 3 NOVEMBER 2026

### Authoritative repository and source
- Repository: `https://github.com/scarlettpiasecka14-alt/Goodbye-Goth-`
- Current development branch: **Testing4**.
- Branch head checked on 3 November 2026: `2a6702bc8c02ed53a715b97f978438b8937fee0`.
- Repository default branch is `Version-8-safe`, but Scarlett explicitly identified `Testing4` as the newest working version. Always use `Testing4` unless Scarlett identifies a newer branch.
- Current active Level 1 source: `js/levels/level1.js` (header: `Goodbye Goth v8.11`).
- Current active UI/bootstrap: `js/game.js`.
- `index.html` loads `js/game.js`, not the similarly named root-level `game.js`. It links `css/game.css` and `css/screen-polish.css`.
- The first code update in this development series is titled **Goodbye Goth V9.0**.

### Zombie Goth attack and completion
- The previous kick-style attack has been replaced by a **bite / Ankle Biter** attack.
- Scarlett has confirmed that the bite is now correct and the two-sided tracking/facing fix works in-game.
- The current `Testing4` source loads the eight `zombie-ankle-biter` frames. Some internal state/array names still use `heavyKick`; this is a legacy code label, not the intended visual move. Inspect these references before any rename or refactor.
- The regular claw-swipe attack remains alongside the bite.
- **Zombie Goth is complete.** Preserve her working combat AI, bite animation, and two-sided tracking as a regression-sensitive system.

### Next enemy
The next enemy-AI task is **Chain Goth AI**. Start from the latest `Testing4` branch and inspect the Chain Goth combat artwork and current encounter flow before making a targeted implementation plan.

### Working agreement for this chat
1. Before coding, inspect the latest `Testing4` branch head and the active source files. Do not work from stale local snapshots or root-level duplicate files.
2. Deliver targeted coding updates from the latest confirmed source.
3. Deliver actual changed files or a tested patch in a downloadable ZIP, with a README explaining what changed and exactly where each file belongs in the repository.
4. Check patch integrity and JavaScript syntax before describing a code patch as ready. Do not claim in-game testing unless it has actually been performed.
5. Update this master context when Scarlett asks, preserving useful history and concrete implementation details.

**Current status at the start of V9.0:** Zombie Goth bite and tracking/facing are confirmed complete. Chain Goth AI is the next enemy-AI task. Scarlett approved a map-interface housekeeping pass first: remove the visible right sidebar, let the cemetery map use the full width, keep Olly HP/inventory floating over the map with no HUD card background, and increase camera zoom slightly. V9.0 is the first update in this development series.


---

## 20. GOODBYE GOTH V9.0 - MAP INTERFACE HOUSEKEEPING

### User-approved visual target
- Remove the visible right-hand sidebar containing Level 1 objectives, mini-map, checkpoint and Game Progress save/load cards.
- Keep the main cemetery map as the dominant, full-width gameplay area.
- Keep Olly's HP bar and Inventory button floating over the map in the upper-right area.
- The HUD wrapper must have **no black/dark background box, border or shadow**. The HP text/bar and inventory button remain visible; the inventory button retains its own button styling.
- The top Level 1 header/status indicators remain unchanged unless Scarlett asks otherwise.
- Keep the dialogue strip below the map.
- Increase map camera zoom slightly from `1.24` to `1.30`. The same value must be used for world rendering and pointer-to-world coordinate conversion so clicks remain aligned.

### Implementation approach for V9.0
Active files: `js/game.js`, `js/levels/level1.js`, and `css/game.css`.

`js/game.js` should remove the visible `<aside class="side-column">` and its four cards. The existing Level 1 code still expects several elements (`mini-map`, objective status nodes and save/load UI nodes) to exist. The V9.0 patch therefore retains those elements in a hidden `#game-support-ui` container rather than removing their IDs and causing null-reference errors. This is a compatibility bridge, not a visible sidebar. X-key save and title-screen Load Game remain available. The visible side-panel Save/Load buttons are removed from the interface.

`css/game.css` changes the game layout to a single full-width column, lets the world canvas fill the available gameplay area, and makes `.player-hud` transparent with no card background/border/shadow. Pointer interaction should remain enabled on the inventory button.

`js/levels/level1.js` updates the version comment to V9.0 and changes both `const zoom = 1.24` values to `1.30`: once in map rendering and once in click-coordinate conversion. These two values must always match.

### V9.0 testing requirements
- Confirm the right sidebar is absent and the map expands across the freed width.
- Confirm the HUD sits over the map with no dark rectangular background behind Olly's HP.
- Confirm the inventory button is still clickable.
- Confirm map clicks on enemies, puzzle and challenge markers align after zooming.
- Confirm movement, collision, fog-of-war and interactions remain functional.
- Confirm X still saves and the title-screen Load Game still loads.
- Check desktop and narrower browser widths.
- Do not claim the patch has passed in-game testing until Scarlett tests the Vercel deployment.

### Next development task after V9.0
Once the map interface housekeeping is accepted, proceed to **Chain Goth AI**. The Zombie Goth fight is complete and should be treated as a regression-sensitive finished system.
