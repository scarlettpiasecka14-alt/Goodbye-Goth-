#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

if [ ! -f "js/levels/level1.js" ]; then
  echo "Couldn't find js/levels/level1.js."
  echo "Please place this patch in the main Goodbye Goth project folder, beside index.html, then run it again."
  read -r -p "Press Return to close..." _
  exit 1
fi

if [ ! -f "index.html" ]; then
  echo "I found the Level 1 code, but not index.html in this folder."
  echo "Please move the patch to the main project folder, beside index.html."
  read -r -p "Press Return to close..." _
  exit 1
fi

for i in 01 02 03 04 05 06 07 08; do
  if [ ! -f "assets/characters/combat/zombie-ankle-biter-${i}.png" ]; then
    echo "Missing bite frame: assets/characters/combat/zombie-ankle-biter-${i}.png"
    echo "Extract the entire patch ZIP into the main project folder first."
    read -r -p "Press Return to close..." _
    exit 1
  fi
done

python3 - <<'PYTHON'
from pathlib import Path
from datetime import datetime
import re, shutil, subprocess, sys

path = Path("js/levels/level1.js")
source = path.read_text(encoding="utf-8")

if "zombie-ankle-biter-${String(i + 1).padStart(2, '0')}.png" in source:
    print("The Zombie Goth Ankle Biter update is already installed. No changes made.")
    sys.exit(0)

updated = source

# Expand the existing heavy-attack frame collection from four frames to eight.
updated, n_frames = re.subn(
    r"(?m)^(\s*)heavyKick:\s*\[\s*1\s*,\s*2\s*,\s*3\s*,\s*4\s*\]\.map\(\(\)\s*=>\s*new Image\(\)\),$",
    r"\1heavyKick: Array.from({ length: 8 }, () => new Image()),",
    updated,
)
if n_frames != 1:
    print(f"Stopped safely: expected one four-frame heavy-attack array, found {n_frames}.")
    sys.exit(1)

# Load the eight supplied Ankle Biter frames in numerical order.
updated, n_loader = re.subn(
    r"zombieCombatFrames\.heavyKick\.forEach\(\(img, i\) => img\.src = `assets/characters/combat/zombie-heavy-\$\{\s*i\s*\+\s*1\s*\}\.png\?v=8110`\);",
    "zombieCombatFrames.heavyKick.forEach((img, i) => img.src = `assets/characters/combat/zombie-ankle-biter-${String(i + 1).padStart(2, '0')}.png?v=10100`);",
    updated,
)
if n_loader != 1:
    print(f"Stopped safely: expected one existing heavy-attack image loader, found {n_loader}.")
    sys.exit(1)

# Rename the visible telegraph/status/damage label only. The internal
# 'heavyKick' state identifier remains unchanged to preserve the existing AI.
status_variants = [
    "The Zombie Goth is charging a HEAVY KICK.",
    "The Zombie Goth is charging a HEAVY CLAW.",
]
status_hits = sum(updated.count(s) for s in status_variants)
if status_hits != 1:
    print(f"Stopped safely: expected one heavy-attack status label, found {status_hits}.")
    sys.exit(1)
for label in status_variants:
    updated = updated.replace(label, "The Zombie Goth is charging a HEAVY BITE.")

updated, n_damage_label = re.subn(
    r"heavy\s*\?\s*'HEAVY KICK'\s*:\s*'CLAW SWIPE'",
    "heavy ? 'HEAVY BITE' : 'CLAW SWIPE'",
    updated,
)
if n_damage_label != 1:
    print(f"Stopped safely: expected one damage-reaction label, found {n_damage_label}.")
    sys.exit(1)

updated, n_warning = re.subn(
    r"HEAVY KICK\s*•\s*MOVE\s*/\s*DODGE\s*/\s*JUMP",
    "HEAVY BITE  •  MOVE / DODGE / JUMP",
    updated,
)
if n_warning != 1:
    print(f"Stopped safely: expected one heavy-attack warning label, found {n_warning}.")
    sys.exit(1)

# Keep code comments accurate without changing any other attack behaviour.
updated = updated.replace("approved four-frame heavy KICK sequence", "eight-frame heavy BITE sequence (internal state name retained for compatibility)")
updated = updated.replace("then the approved heavy KICK, followed by a longer attack break", "then the approved heavy BITE, followed by a longer attack break")

# Verify all expected references exist before touching the original file.
if updated == source:
    print("Stopped safely: no code changes were produced.")
    sys.exit(1)
if "zombie-ankle-biter-${String(i + 1).padStart(2, '0')}.png" not in updated:
    print("Stopped safely: new bite asset loader did not validate.")
    sys.exit(1)

stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
backup = path.with_name(path.name + f".before-ankle-biter-{stamp}")
shutil.copy2(path, backup)
path.write_text(updated, encoding="utf-8")

# Syntax-check with Node when available. Restore the backup if the check fails.
try:
    result = subprocess.run(["node", "--check", str(path)], capture_output=True, text=True)
except FileNotFoundError:
    print("Node.js wasn't found, so the automatic JavaScript syntax check was skipped.")
else:
    if result.returncode != 0:
        shutil.copy2(backup, path)
        print("JavaScript syntax check failed. Your original file has been restored.")
        print(result.stderr or result.stdout)
        sys.exit(1)
    print("JavaScript syntax check passed.")

print("\nSUCCESS: Zombie Goth's heavy attack now uses the eight-frame Ankle Biter animation.")
print("The regular claw attack, countdown, AI cycle, hit window, damage and recovery timings were left unchanged.")
print(f"Backup saved as: {backup}")
PYTHON

status=$?
if [ "$status" -ne 0 ]; then
  echo "The patch stopped without overwriting your original Level 1 file."
  read -r -p "Press Return to close..." _
  exit "$status"
fi

echo
read -r -p "Patch finished. Press Return to close..." _
