#!/usr/bin/env python3
"""Zombie Goth: give her the same glowing pink eyes in every animation that her 3-2-1 intro has.
Anchors on the pink hair bow, searches the eye zone (in bow-size units) for white/red eye pixels, turns them into a bright white-pink core and adds a magenta halo.
Frames where no eye pixels are found (eyes shut, face hidden) are left alone.  Usage: glow_zg_eyes.py <set> <file.webp> ...   (set = walk | claw | bite | wide)"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage as ndi
ZONES = {'walk': (-2.6, -.1, 1.9, 3.7), 'claw': (-4.9, -.8, 1.7, 3.8), "bite": (-4.9, -.8, 1.7, 3.9), 'wide': (-5.0, -.3, 1.4, 4.2)}   # umin, umax, vmin, vmax (bow-size units, from the bow centre)
def bow(a):
    r, g, b, al = [a[..., i] for i in range(4)]
    m = (al > 200) & (r > 150) & (g < 110) & (b > 50) & (b < 190) & (r - g > 80); m = ndi.binary_closing(m, iterations=2)
    lab, n = ndi.label(m)
    if n == 0: return None
    sizes = ndi.sum(m, lab, range(1, n + 1)); k = int(np.argmax(sizes)) + 1
    cy, cx = ndi.center_of_mass(lab == k); return cx, cy, float(np.sqrt(sizes.max())), lab == k
def glow(path, zone):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32); ai = a.astype(int)
    bw = bow(ai)
    if bw is None: return False
    bx, by, bs, bm = bw
    r, g, b, al = [ai[..., i] for i in range(4)]
    lum = .3 * r + .59 * g + .11 * b; mx = np.maximum(np.maximum(r, g), b); mn = np.minimum(np.minimum(r, g), b); sat = (mx - mn) / (mx + 1)
    white = (al > 200) & (lum > 175) & (sat < .25)
    iris = (al > 200) & (r > 165) & (g < 100) & (b < 140) & (r - g > 90)
    h, w = al.shape; yy, xx = np.mgrid[0:h, 0:w]
    u0, u1, v0, v1 = zone
    win = (xx > bx + u0 * bs) & (xx < bx + u1 * bs) & (yy > by + v0 * bs) & (yy < by + v1 * bs)
    cand = (white | iris) & win & ~ndi.binary_dilation(bm, iterations=5)
    cand = ndi.binary_opening(cand, iterations=1) if cand.sum() > 40 else cand
    lab, n = ndi.label(ndi.binary_dilation(cand, iterations=1))
    eye = np.zeros_like(cand)
    for k in range(1, n + 1):
        m = (lab == k) & cand
        if (.12 * bs) ** 2 * 3 < m.sum() < (1.5 * bs) ** 2: eye |= m
    if eye.sum() < 6: return False
    core = ndi.binary_dilation(eye, iterations=1) & (al > 100)
    halo = ndi.gaussian_filter(core.astype(np.float32), sigma=max(1.5, .33 * bs)); halo = np.clip(halo * 1.45, 0, 1)
    col = np.array([255, 70, 160], np.float32)
    rgb = a[..., :3]
    rgb = 255 - (255 - rgb) * (1 - (halo[..., None] * col / 255.0))          # screen-blend the magenta halo
    rgb = np.where(core[..., None], np.array([255, 238, 246], np.float32), rgb)
    alpha = np.where(halo > .25, np.maximum(a[..., 3], 0), a[..., 3])
    Image.fromarray(np.dstack([rgb, alpha]).clip(0, 255).astype(np.uint8), 'RGBA').save(path, 'WEBP', quality=95, method=4)
    return True
if __name__ == '__main__':
    zone = ZONES[sys.argv[1]]; ok = sum(glow(p, zone) for p in sys.argv[2:])
    print(f'{sys.argv[1]}: glow added to {ok} of {len(sys.argv) - 2} frames')
