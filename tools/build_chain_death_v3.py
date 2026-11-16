#!/usr/bin/env python3
"""Goodbye Goth - Chain Goth death, part 3 (V9.44): the kneel -> fall sideways -> lying frames.
Source: assets/characters/combat/ChainGothDeathV3/frame_NNNN.png (green screen already removed; 1280x720 video frames).
Packs them into assets/characters/combat/chain-goth/chain-deathc.webp and prints the frame table for CHAIN_ATLAS_DATA.deathc.
usage: build_chain_death_v3.py <repo_root>"""
import sys, os, json, glob
from PIL import Image
ANCHOR = (737, 670)   # where her floor point is in the video frame (lined up with her kneeling pose in the older death frames)
UNIT = 0.756          # video px -> standard animator px (same size as her kneeling pose in the older frames)
SCALE = 0.64; MAX_W = 4096
repo = sys.argv[1]
files = sorted(glob.glob(os.path.join(repo, 'assets/characters/combat/ChainGothDeathV3/frame_*.png')))
tiles = []
for f in files:
    im = Image.open(f).convert('RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 12 else 0).getbbox()
    bb = (max(0, bb[0]-3), max(0, bb[1]-3), min(im.width, bb[2]+3), min(im.height, bb[3]+3))
    crop = im.crop(bb)
    crop = crop.resize((max(1, round(crop.width*UNIT*SCALE)), max(1, round(crop.height*UNIT*SCALE))), Image.LANCZOS)
    tiles.append((bb, crop))
x = y = rowh = 0; placed = []
for bb, crop in tiles:
    if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
    placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, tiles))
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
for (px, py), (bb, crop) in zip(placed, tiles):
    atlas.paste(crop, (px, py))
    table.append([px, py, crop.width, crop.height, round((bb[0]-ANCHOR[0])*UNIT), round((bb[1]-ANCHOR[1])*UNIT)])
atlas.save(os.path.join(repo, 'assets/characters/combat/chain-goth/chain-deathc.webp'), 'WEBP', quality=90, alpha_quality=100, method=4)
print(json.dumps({'size': [W, H], 'scale': SCALE, 'frames': table}, separators=(',', ':')))
