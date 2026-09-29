Goodbye Goth v7.0.10 - Zombie combat reactions / sprite cleanup / attack warning

BASE:
- Built directly from the supplied v7.0.9 Zombie Facing / Telegraph build.
- Exploration, gate, challenges, story, Chain Goth logic and Heavy Attack unlock are preserved.
- Zombie AI speed, damage, wind-up and recovery values are preserved.

CHANGES:
- Zombie combat images are re-cleaned from the existing cropped frames with the baked checkerboard removed and fresh cache-busted asset URLs.
- Zombie hit reaction: clear stagger, backward stumble, brief flash and impact sparks.
- Heavy Attack causes a stronger Zombie stagger.
- Olly visibly flinches and recoils when hit.
- Olly's punch hit detection now uses a clear horizontal combat hitbox against Zombie Goth, so a visibly connected hit still damages her during her own wind-up/attack states.
- A hit immediately interrupts the Zombie's current attack and sends her back into chase after the stagger.
- Ground collision is resolved after both player movement and Zombie AI movement, preventing body-blocking / corner pinning while preserving jump-over and dodge-through behaviour.
- Attack telegraph is restored as an animated warning banner: “! ATTACK INCOMING !” with a smaller “CLAW SWIPE” or “LUNGE + BITE” cue and MOVE / DODGE / JUMP.
- Olly's canonical sprite is cache-busted so the current asset is used reliably.

TEST:
1. Enter Zombie Goth combat.
2. Walk directly into her and confirm Olly stops at her body instead of walking through.
3. Jump over her. You should land on the other side without getting trapped inside her.
4. During the warning banner, let her attack. The banner should pulse and the attack animation should play.
5. Punch during her wind-up or attack. Her HP should drop immediately, she should stagger backward, and her attack should be interrupted.
6. Let her hit Olly. Olly should visibly recoil/flinch and be pushed away.
7. Test Heavy Attack after Chain Goth. A successful Heavy hit on Zombie should produce the stronger stagger.
