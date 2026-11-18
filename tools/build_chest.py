#!/usr/bin/env python3
"""Goodbye Goth - reward chest opening (V9.58): 97-frame green-screen clip -> one WebP sheet + frame table (printed and written to js/levels/level1.js as CHEST_ATLAS_DATA).
Fixes: the clip crops the lid spikes at the top and the base at the bottom, so the canvas is extended and those parts are redrawn (spike tips continue their own edges; base is extruded);
the glow rays that bled yellow-green into the key are removed (the game draws its own soft glow).
usage: build_chest.py <raw_dir> <repo_root>   (raw_dir has f_001.png .. f_097.png, the unkeyed 1280x720 frames)"""
import sys, os, json, re
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
raw, repo = sys.argv[1], sys.argv[2]
SCALE = 0.28; PADT = 80; PADB = 16; MAX_W = 4096
def key_frame(a, bg):
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    dist = np.sqrt((r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2)
    exg = g - np.maximum(r, b)
    alpha = np.full(r.shape, 255.0)
    alpha[(dist < 55) & (exg > 8)] = 0
    nb = (dist >= 55) & (dist < 110) & (exg > 8)
    alpha[nb] = (np.clip((dist - 55) / 55, 0, 1) * 255)[nb]
    cap = np.maximum(r, b); g2 = g.copy(); sp = (alpha < 250) & (g > cap); g2[sp] = cap[sp]
    out = np.dstack([r, g2, b, alpha])
    # the yellow-green light rays: turn what is left of the green screen into a warm additive-looking glow
    G = (alpha > 0) & (g > r + 8) & (g > b + 40)
    L = np.clip(a - np.array(bg), 0, 255); m = L.max(axis=2)
    col = L / np.maximum(m, 1)[..., None] * 255 * .6 + np.array([255, 225, 140]) * .4
    ga = np.clip(m / 100, 0, 1) * 255
    out[G, 3] = 0   # the rays that spill outside the chest are dropped (the game draws its own soft glow behind the chest instead)
    return out
def extend(rgba):
    H, W = rgba.shape[:2]
    out = np.zeros((H + PADT + PADB, W, 4), np.float32); out[PADT:PADT + H] = rgba
    al = rgba[..., 3] > 100
    # spike tips cut by the top edge: continue each cut shape's own edges upward until they meet
    cols = np.where(al[0])[0]
    if cols.size:
        for grp in np.split(cols, np.where(np.diff(cols) > 3)[0] + 1):
            x0, x1 = grp.min(), grp.max()
            if x1 - x0 > 90: continue   # a wide top (the lid itself): nothing to continue
            def edge(row):
                c = np.where(al[row, max(0, x0 - 30):x1 + 30])[0] + max(0, x0 - 30); c = c[(c >= x0 - 30) & (c <= x1 + 30)]
                return c.min(), c.max()
            l0, r0 = edge(0); l8, r8 = edge(8)
            kl, kr = (l8 - l0) / 8.0, (r8 - r0) / 8.0
            if kr - kl >= -0.05: continue   # edges not converging: not a spike
            for k in range(1, PADT):
                xl, xr = l0 - kl * k, r0 - kr * k
                if xr - xl < 1.5: break
                for x in range(int(round(xl)), int(round(xr)) + 1):
                    u = (x - xl) / max(1e-3, xr - xl); sx = int(round(l0 + u * (r0 - l0)))
                    out[PADT - k, x] = rgba[1, min(W - 1, max(0, sx))] if 0 <= x < W else 0
                    out[PADT - k, x, 3] = 255
    # base cut by the bottom edge: extrude the last rows down and darken them into an outline
    last = rgba[H - 1]; solid = last[:, 3] > 100
    for k in range(1, PADB + 1):
        f = max(.25, 1 - k * .06)
        row = rgba[H - 4].copy() if k < PADB - 2 else rgba[H - 4].copy() * .3
        row[:, :3] *= f; row[:, 3] = np.where(solid, 255, 0)
        out[PADT + H - 1 + k] = row
    return out
tiles = []; bbs = []
frames = sorted(f for f in os.listdir(raw) if f.startswith('f_'))
for f in frames:
    a = np.asarray(Image.open(os.path.join(raw, f)).convert('RGB')).astype(np.float32)
    bg = a[:20, :20].reshape(-1, 3).mean(axis=0)
    e = extend(key_frame(a, bg)); im = Image.fromarray(e.clip(0, 255).astype(np.uint8), 'RGBA')
    bb = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    tiles.append((bb, im.crop(bb))); 
# one common anchor: the horizontal middle of the chest base and the bottom of the base in the first frame
bb0 = tiles[0][0]; ANCHOR = ((bb0[0] + bb0[2]) / 2, bb0[3] - PADB)
out_tiles = []
for bb, crop in tiles:
    crop = crop.resize((max(1, round(crop.width * SCALE)), max(1, round(crop.height * SCALE))), Image.LANCZOS); out_tiles.append((bb, crop))
x = y = rowh = 0; placed = []
for bb, crop in out_tiles:
    if x + crop.width > MAX_W: x = 0; y += rowh; rowh = 0
    placed.append((x, y)); x += crop.width + 2; rowh = max(rowh, crop.height + 2)
H = y + rowh; W = max(p[0] + t[1].width for p, t in zip(placed, out_tiles))
atlas = Image.new('RGBA', (W, H), (0, 0, 0, 0)); table = []
for (px, py), (bb, crop) in zip(placed, out_tiles):
    atlas.paste(crop, (px, py))
    table.append([px, py, crop.width, crop.height, round((bb[0] - ANCHOR[0]) * SCALE), round((bb[1] - ANCHOR[1]) * SCALE)])
out = os.path.join(repo, 'assets/environment/chest-open.webp'); os.makedirs(os.path.dirname(out), exist_ok=True)
atlas.save(out, 'WEBP', quality=88, alpha_quality=100, method=4)
js = os.path.join(repo, 'js/levels/level1.js'); s = open(js).read()
line = 'const CHEST_ATLAS_DATA = ' + json.dumps({'size': [W, H], 'frames': table}, separators=(',', ':')) + ';'
if 'const CHEST_ATLAS_DATA' in s: s = re.sub(r'const CHEST_ATLAS_DATA = .*?;\n', lambda m: line + '\n', s, count=1)
else: s = s.replace('const CHAIN_ATLAS_DATA =', line + '\nconst CHAIN_ATLAS_DATA =', 1)
open(js, 'w').write(s)
print('atlas', W, H, os.path.getsize(out) // 1024, 'KB', len(table), 'frames')
