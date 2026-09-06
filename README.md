# Goodbye Goth v0.5

Persistent project for Scarlett's anniversary game.

## v0.4 focus
- Restored short loading/title screen.
- Four-scene illustrated intro.
- Improved screen-fit layout so gameplay and options fit together more cleanly.
- More detailed cemetery presentation, including graves, statues, paths, lanterns, trees and gates.
- Olly shown from behind in exploration, with bow; front-facing in combat.
- Zombie Goths remain separate from Queen bosses and now have different visual/attack patterns.
- Combat is real-time: movement, aiming, arrow projectiles, enemy telegraphs, dodge timing, player damage and death state.
- Clear YOU DIED consequence with checkpoint retry/back-to-map options.
- Level 1 relationship challenge is enterable and playable.
- Princess puzzle uses dedicated princess-themed art.
- Classic Goth remains reserved for the Level 1 boss.

## Current known design target
This is still a Level 1 foundation, not the final 12-level game. Character art will be refined to the approved storyboard likenesses as dedicated assets are produced.

## Canonical project rules
12 unique Goth Queen bosses; Zombie Goths are a separate enemy family and must not copy Queen silhouettes or signature mechanics.

Every level will ultimately contain exploration, Zombie Goth fights, one unique Relationship Challenge, one separate Puzzle/Question, and one unique Queen boss. Boss gates unlock only after the required level objectives are complete.

## Deployment
Keep GitHub as the master repository and Netlify as the published site. Replace files inside the existing repository for future versions.

## v0.5 development strategy
This version intentionally isolates the title/intro/layout/relationship systems. Combat is the next separate pass so combat bugs do not destabilise the rest of the game.


V0.9: Story intro visuals now use clean crops from the approved storyboard reference, with no baked-in title-screen strip. Gameplay code unchanged.
