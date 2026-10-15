#!/usr/bin/env python3
"""Safely patch Level 1 so Zombie Goth holds one static pose during the intro countdown."""
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
JS_PATH = ROOT / "js" / "levels" / "level1.js"
ASSET_PATH = ROOT / "assets" / "characters" / "combat" / "zombie-intro-static.png"
BACKUP_PATH = JS_PATH.with_name("level1.js.before-zombie-static.bak")

if not JS_PATH.is_file():
    print("Couldn't find js/levels/level1.js. Place the patch files in your game folder (the folder containing index.html), then run this again.")
    sys.exit(1)
if not ASSET_PATH.is_file():
    print("Couldn't find the included static Zombie Goth image in assets/characters/combat/.")
    sys.exit(1)

source = JS_PATH.read_text(encoding="utf-8")

# Refuse to guess if the source has changed since this patch was prepared.
changes = [
    (
        "prep frame list",
        "prep: Array.from({ length: 8 }, () => new Image())",
        "prep: [new Image()]",
    ),
    (
        "prep image source",
        "zombieCombatFrames.prep.forEach((img, i) => img.src = `assets/characters/combat/zombie-prep-${i + 1}.png?v=8600`);",
        "zombieCombatFrames.prep[0].src = 'assets/characters/combat/zombie-intro-static.png?v=1';",
    ),
    (
        "intro animation loop",
        """        if (zombieCombatState === 'intro') {
            frames = zombieCombatFrames.prep;
            // v8.9: non-walk/non-attack animation pass is 20% larger.
            targetHeight = 498;
            const t = Math.max(0, elapsed);
            const sequencePosition = Math.floor(t / ZOMBIE_PREP_FRAME_MS) % ZOMBIE_PREP_SEQUENCE.length;
            index = ZOMBIE_PREP_SEQUENCE[sequencePosition];""",
        """        if (zombieCombatState === 'intro') {
            // Hold the supplied static portrait throughout the existing countdown.
            frames = zombieCombatFrames.prep;
            targetHeight = 498;
            index = 0;""",
    ),
    (
        "intro image mirroring",
        "const sourceFacing = 'left';",
        "const sourceFacing = zombieCombatState === 'intro' ? face : 'left';",
    ),
]

# Detect an already-patched copy without touching it.
if "zombie-intro-static.png?v=1" in source and "const sourceFacing = zombieCombatState === 'intro' ? face : 'left';" in source:
    print("The static Zombie Goth countdown patch is already applied. No files were changed.")
    sys.exit(0)

for label, old, new in changes:
    count = source.count(old)
    if count != 1:
        print(f"Stopped safely: expected exactly one match for {label}, found {count}.")
        print("No JavaScript changes were made. This copy of Level 1 may differ from the version this patch targets.")
        sys.exit(1)

if not BACKUP_PATH.exists():
    shutil.copy2(JS_PATH, BACKUP_PATH)

patched = source
for _label, old, new in changes:
    patched = patched.replace(old, new, 1)

JS_PATH.write_text(patched, encoding="utf-8")
print("Patch applied successfully.")
print(f"Backup created at: {BACKUP_PATH.relative_to(ROOT)}")
print("Added static intro artwork: assets/characters/combat/zombie-intro-static.png")
print("The countdown images, countdown phase timing, and post-countdown combat animations were left unchanged.")
