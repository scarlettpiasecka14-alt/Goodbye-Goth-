#!/usr/bin/env python3
"""Safely apply Goodbye Goth V9.0 map/HUD housekeeping to a local Testing5 checkout."""
from __future__ import annotations

import re
import subprocess
import sys
from pathlib import Path
from typing import Optional, Tuple

EXPECTED_BRANCH = "Testing5"
HUD_START = '<div id="player-hud" class="player-hud" aria-label="Olly health">'
SIDEBAR_RE = re.compile(r'\s*<aside class="side-column">.*?</aside>', re.DOTALL)

HUD_SUPPORT = '''      <div id="game-support-ui" hidden aria-hidden="true">
        <div id="goal-goths">○ Defeat the required Zombie Goths (0/2)</div>
        <div id="goal-rel">○ Complete the WOULD YOU? Puzzle</div>
        <div id="goal-puzzle">○ Answer the Princess Question</div>
        <div id="goal-boss">🔒 Boss gate locked</div>
        <canvas id="mini-map" class="mini-map" width="250" height="180"></canvas>
        <div id="checkpoint" class="small">Cemetery entrance</div>
        <button id="save-game" type="button">SAVE GAME</button>
        <button id="load-game" type="button">LOAD GAME</button>
        <div id="save-status" class="small save-status" aria-live="polite"></div>
      </div>'''

HUD_MARKUP = '''            <div id="player-hud" class="player-hud" aria-label="Olly health">
              <div class="player-hud-name">OLLY</div>
              <div class="player-hud-bar"><div id="player-hp-fill" class="player-hp-fill"></div></div>
              <div id="player-hp-text" class="player-hp-text">100 / 100 HP</div>
              <button id="inventory-button" type="button" style="width:100%;margin-top:7px;min-height:34px;padding:6px 10px;font-size:12px;">🎒 INVENTORY <span id="inventory-count">0/10</span></button>
            </div>'''

CSS_MARKER = "/* GOODBYE GOTH V9.0 CORRECTED: map-anchored transparent HUD */"
CSS_OVERRIDE = '''

/* GOODBYE GOTH V9.0 CORRECTED: map-anchored transparent HUD */
/* Keep this block last: older layout experiments earlier in this stylesheet
   must not restore the right-hand column or the opaque HUD card. */
.game-screen .game-layout {
  display: flex !important;
  flex-direction: column !important;
  grid-template-columns: minmax(0, 1fr) !important;
  gap: 4px !important;
  padding: 4px !important;
  width: 100% !important;
  flex: 1 1 auto !important;
  min-width: 0 !important;
  min-height: 0 !important;
}
.game-screen .play-column {
  display: flex !important;
  flex: 1 1 auto !important;
  flex-direction: column !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
}
.game-screen .world-wrap {
  position: relative !important;
  display: flex !important;
  flex: 1 1 auto !important;
  flex-direction: column !important;
  justify-content: stretch !important;
  width: 100% !important;
  min-width: 0 !important;
  min-height: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
}
.game-screen #world {
  display: block !important;
  width: 100% !important;
  height: auto !important;
  flex: 1 1 0 !important;
  min-height: 0 !important;
  max-height: none !important;
  aspect-ratio: auto !important;
  object-fit: fill !important;
}
.game-screen .world-wrap > .player-hud {
  position: absolute !important;
  top: 12px !important;
  right: 14px !important;
  z-index: 15 !important;
  width: 205px !important;
  padding: 0 !important;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  pointer-events: none !important;
}
.game-screen .world-wrap > .player-hud .player-hud-name,
.game-screen .world-wrap > .player-hud .player-hp-text {
  text-shadow: 0 1px 4px rgba(0, 0, 0, .95);
}
.game-screen .world-wrap > .player-hud #inventory-button {
  pointer-events: auto !important;
}
.game-screen #game-support-ui {
  display: none !important;
}
@media (max-width: 700px) {
  .game-screen .game-layout {
    display: flex !important;
    flex-direction: column !important;
    grid-template-columns: minmax(0, 1fr) !important;
  }
  .game-screen .world-wrap {
    min-height: 0 !important;
  }
  .game-screen .world-wrap > .player-hud {
    top: 8px !important;
    right: 8px !important;
    width: min(190px, 42vw) !important;
  }
}
'''


def run_git(repo: Path, *args: str) -> str:
    proc = subprocess.run(["git", "-C", str(repo), *args], text=True, capture_output=True)
    if proc.returncode:
        raise RuntimeError(proc.stderr.strip() or proc.stdout.strip() or f"git {' '.join(args)} failed")
    return proc.stdout.strip()


def find_repo(start: Path) -> Path:
    return Path(run_git(start, "rev-parse", "--show-toplevel"))


def extract_div_block(source: str, start_marker: str) -> Optional[Tuple[str, int, int]]:
    """Extract one balanced div block, accounting for nested HUD divs."""
    start = source.find(start_marker)
    if start < 0:
        return None
    token_re = re.compile(r'<div\b[^>]*>|</div\s*>', re.IGNORECASE)
    depth = 0
    for match in token_re.finditer(source, start):
        token = match.group(0)
        if token.lower().startswith('</div'):
            depth -= 1
            if depth == 0:
                return source[start:match.end()], start, match.end()
        else:
            depth += 1
    raise RuntimeError("Found the HUD opening tag but could not find its matching closing div. No files changed.")


def main() -> int:
    start = Path.cwd()
    try:
        repo = find_repo(start)
        branch = run_git(repo, "branch", "--show-current")
        if branch != EXPECTED_BRANCH:
            raise RuntimeError(f"Expected branch {EXPECTED_BRANCH}, but this checkout is on '{branch}'. No files changed.")

        dirty = run_git(repo, "status", "--porcelain")
        if dirty:
            raise RuntimeError(
                "Your working tree has uncommitted changes. Commit or stash them first. "
                "The installer will not overwrite user work.\n" + dirty
            )

        paths = {
            "game": repo / "js/game.js",
            "level": repo / "js/levels/level1.js",
            "css": repo / "css/game.css",
        }
        for label, path in paths.items():
            if not path.is_file():
                raise RuntimeError(f"Required file is missing: {path.relative_to(repo)}. No files changed.")

        game = paths["game"].read_text(encoding="utf-8")
        level = paths["level"].read_text(encoding="utf-8")
        css = paths["css"].read_text(encoding="utf-8")

        # If already applied, do not move or duplicate markup a second time.
        if CSS_MARKER in css and 'id="game-support-ui"' in game and re.search(
            r'<div class="world-wrap">\s*<canvas id="world"[^>]*></canvas>\s*<div id="player-hud"', game
        ):
            print("V9.0 corrected layout is already present. No changes needed.")
            return 0

        # 1) Put the floating HUD inside the world wrapper, immediately above the map.
        hud_match = extract_div_block(game, HUD_START)
        if hud_match:
            hud_block, hud_start, hud_end = hud_match
            game = game[:hud_start] + game[hud_end:]
        else:
            if 'id="player-hud"' in game:
                raise RuntimeError("Found an unexpected existing HUD structure. No files changed.")
            hud_block = HUD_MARKUP

        canvas_line = '<canvas id="world" width="1536" height="1024" tabindex="0" aria-label="Level 1 haunted cemetery"></canvas>'
        if canvas_line not in game:
            raise RuntimeError("Expected Level 1 world canvas markup not found. No files changed.")
        world_start = game.find('<div class="world-wrap">')
        world_end = game.find('</div>', world_start)
        hud_now_in_world = world_start >= 0 and world_end >= 0 and HUD_START in game[world_start:world_end]
        if not hud_now_in_world:
            game = game.replace(canvas_line, canvas_line + "\n" + HUD_MARKUP, 1)

        # 2) Replace the visible sidebar with hidden legacy nodes required by Level 1 logic.
        sidebar = SIDEBAR_RE.search(game)
        if sidebar:
            game = game[:sidebar.start()] + "\n" + HUD_SUPPORT + game[sidebar.end():]
        elif 'id="game-support-ui"' not in game:
            layout_close = '\n      </div>\n\n      <div id="inventory"'
            if layout_close not in game:
                raise RuntimeError("Could not find sidebar or safe compatibility insertion point. No files changed.")
            game = game.replace(layout_close, '\n      </div>\n\n' + HUD_SUPPORT + '\n\n      <div id="inventory"', 1)

        if '<aside class="side-column">' in game:
            raise RuntimeError("Visible sidebar remains after transformation. No files changed.")
        required_ids = ["mini-map", "goal-goths", "goal-rel", "goal-puzzle", "goal-boss", "checkpoint", "save-game", "load-game", "save-status"]
        if not all(f'id="{item}"' in game for item in required_ids):
            raise RuntimeError("A required legacy support element is missing. No files changed.")

        # 3) Increase camera zoom in BOTH drawing and pointer conversion.
        count = level.count("const zoom = 1.24;")
        if count == 2:
            level = level.replace("const zoom = 1.24;", "const zoom = 1.30;")
        elif level.count("const zoom = 1.30;") != 2:
            raise RuntimeError(f"Expected two matching map zoom values (found 1.24 x {count}); no files changed.")

        level = re.sub(r"^/\* Goodbye Goth v[^\n]*\*/", "/* Goodbye Goth V9.0 - full-width cemetery map and map-anchored HUD. */", level, count=1, flags=re.MULTILINE)
        if not level.startswith("/* Goodbye Goth V9.0"):
            raise RuntimeError("Could not safely update the Level 1 version marker. No files changed.")

        # 4) Append a final, high-specificity CSS override so older rules cannot win.
        if CSS_MARKER not in css:
            css += CSS_OVERRIDE

        # All checks have passed. Make backups before writing any file.
        backup_dir = repo / ".goodbye-goth-v9.0-backup"
        if backup_dir.exists():
            raise RuntimeError("Backup folder already exists. Rename it before re-running. No files changed.")
        backup_dir.mkdir()
        for label, path in paths.items():
            backup = backup_dir / path.name
            backup.write_bytes(path.read_bytes())

        try:
            paths["game"].write_text(game, encoding="utf-8")
            paths["level"].write_text(level, encoding="utf-8")
            paths["css"].write_text(css, encoding="utf-8")
        except Exception:
            for label, path in paths.items():
                backup = backup_dir / path.name
                if backup.exists():
                    path.write_bytes(backup.read_bytes())
            raise

        print("Goodbye Goth V9.0 corrected map layout applied locally to Testing5.")
        print("Changed files:")
        for path in paths.values():
            print(f"  - {path.relative_to(repo)}")
        print("Backups:")
        print(f"  - {backup_dir.relative_to(repo)}/")
        print("Next: review the changes, run tests, then commit and push to Testing5.")
        return 0
    except Exception as exc:
        print(f"ERROR: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
