#!/usr/bin/env python3
"""Goodbye Goth - Chain Goth animation packer.

Takes the big 1440x1440 animator frames, keeps only the chosen frames, trims each to
its visible pixels, shrinks them, and packs them into ONE small WebP image per
animation. Prints the frame table that the game code uses.

usage: build_chain_assets.py <repo_root> [animation ...]
"""
import sys, os, json
from PIL import Image

ANCHOR = (720, 1030)      # feet position shared by every animator canvas (source px)
MAX_W = 4096

# name -> (source folder inside assets/characters/combat, frame numbers to keep, atlas scale)
# The atlas scale is the exact size the frames are drawn at in the arena, so the game never has to
# resample them (that is what kept them crisp). 0.56 = same size as Olly's opponent walk.
ANIMS = {
    'intro': ('321 fight', list(range(0, 60)), 0.50),                 # frames 0-27 build up, 28-59 loop
    'walk':  ('CGwalk',    list(range(14, 38, 2)), 0.56),
    'swipe': ('chaingothchainswipe', list(range(0, 20)), 0.56),       # 0-9 wind-up, 10-19 sweep
    'death': ('chaingothdeath', list(range(6, 37)) + [60], 0.56),     # 6-36 hit + fall, 60 = lying on the floor
}

def pack(repo, name, folder, frames, ATLAS_SCALE):
    src_dir = os.path.join(repo, 'assets/characters/combat', folder, 'frames')
    tiles = []
    for n in frames:
        im = Image.open(os.path.join(src_dir, 'frame_%04d.png' % n)).convert('RGBA')
        bb = im.getchannel('A').getbbox()
        pad = 3
        bb = (max(0, bb[0]-pad), max(0, bb[1]-pad), min(im.width, bb[2]+pad), min(im.height, bb[3]+pad))
        crop = im.crop(bb)
        w = max(1, round(crop.width * ATLAS_SCALE)); h = max(1, round(crop.height * ATLAS_SCALE))
        crop = crop.resize((w, h), Image.LANCZOS)
        tiles.append((n, bb, crop))
    # shelf packing
    x = y = rowh = 0; placed = []
    for n, bb, crop in tiles:
        if x + crop.width > MAX_W:
            x = 0; y += rowh; rowh = 0
        placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
    H = y + rowh
    W = max(p[0] + t[2].width for p, t in zip(placed, tiles))
    atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    table = []
    for (px, py), (n, bb, crop) in zip(placed, tiles):
        atlas.paste(crop, (px, py))
        # [atlasX, atlasY, atlasW, atlasH, offsetX, offsetY] ; offsets = top-left of the
        # trimmed frame relative to the feet anchor, in SOURCE pixels
        table.append([px, py, crop.width, crop.height, bb[0]-ANCHOR[0], bb[1]-ANCHOR[1]])
    out_dir = os.path.join(repo, 'assets/characters/combat/chain-goth')
    os.makedirs(out_dir, exist_ok=True)
    out = os.path.join(out_dir, 'chain-%s.webp' % name)
    atlas.save(out, 'WEBP', quality=90, alpha_quality=100, method=6)
    return out, atlas.size, table, ATLAS_SCALE

if __name__ == '__main__':
    repo = sys.argv[1]
    names = sys.argv[2:] or list(ANIMS)
    result = {}
    for name in names:
        folder, frames, sc = ANIMS[name]
        out, size, table, sc = pack(repo, name, folder, frames, sc)
        kb = os.path.getsize(out) / 1024
        print('%-6s %2d frames  atlas %dx%d  %.0f KB  -> %s' % (name, len(frames), size[0], size[1], kb, os.path.relpath(out, repo)), file=sys.stderr)
        result[name] = {'size': list(size), 'scale': sc, 'frames': table}
    print(json.dumps(result, separators=(',', ':')))
