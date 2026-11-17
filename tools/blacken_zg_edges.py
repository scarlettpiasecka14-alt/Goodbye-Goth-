#!/usr/bin/env python3
"""Zombie Goth: paint a thin black 'pen line' over the green-tinted fringe around her hair/body.
For every pixel within EDGE px of transparency: remove any green cast (green capped at max(red, blue)); if the pixel is dark/mid, darken it to near-black.
Bright pixels (skin, nails, the bow, the skull) are left alone. Usage: blacken_zg_edges.py <file.webp> [...]"""
import sys, numpy as np
from PIL import Image, ImageFilter
EDGE = 7   # filter size: ~3px band
def fix(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    er = np.asarray(im.getchannel('A').filter(ImageFilter.MinFilter(EDGE))).astype(np.float32)
    band = (a[..., 3] > 0) & (er < 250)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # any dark/mid pixel anywhere (hair, boots, clothes) loses its green cast; the outline band loses it whatever its brightness
    lum0 = .3 * r + .59 * g + .11 * b
    warm = np.maximum(r, b) * .82   # dark pixels where red ~ green read as olive/green next to the pink arena, so green is held clearly below red/blue
    g2 = np.where(lum0 < 150, np.minimum(g, warm), np.where(band, np.minimum(g, np.maximum(r, b)), g))
    # dark browns (red > green > blue) read as olive/green against the pink arena: push blue up to green's level so dark areas read maroon/black instead
    b = np.where(.3 * r + .59 * g2 + .11 * b < 110, np.maximum(b, g2 * 1.08), b)
    luma = .3 * r + .59 * g2 + .11 * b
    dark = band & (luma < 200)
    k = np.where(dark, .3, 1.0)
    out = np.dstack([r * k, g2 * k, b * k, a[..., 3]]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(path, 'WEBP', quality=95, method=4)
if __name__ == '__main__':
    for p in sys.argv[1:]: fix(p)
    print('done', len(sys.argv) - 1)
