#!/usr/bin/env python3
"""Zombie Goth: paint a thin black 'pen line' over the green-tinted fringe around her.   (V9.53: keeps her hair strands)
- every dark/mid pixel anywhere loses its green cast (hair, boots, clothes); the outline band loses it whatever its brightness
- the black pen line is only painted along the OUTER silhouette (the outline of her whole shape with the gaps between hair strands filled in),
  so the hair keeps its individual strands inside. Loose strands outside / along the gaps get only a light darkening.
Bright pixels (skin, nails, the bow, the skull) are left alone. Usage: blacken_zg_edges.py <file.webp> [...]"""
import sys, numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi
EDGE = 7        # filter size: ~3px band around every transparent pixel
GAP = 13        # strands closer than this are treated as one solid shape for the outer line
def fix(path):
    im = Image.open(path).convert('RGBA'); a = np.asarray(im).astype(np.float32)
    al = a[..., 3]
    er = np.asarray(im.getchannel('A').filter(ImageFilter.MinFilter(EDGE))).astype(np.float32)
    band = (al > 0) & (er < 250)                       # thin band next to any transparency (includes every strand edge)
    solid = ndi.binary_closing(np.pad(al > 128, GAP), structure=np.ones((GAP, GAP), bool))[GAP:-GAP, GAP:-GAP]
    solid = ndi.binary_fill_holes(solid)
    outer = solid & ~ndi.binary_erosion(solid, iterations=3)   # outer ~3px of the whole silhouette
    outer = ndi.binary_dilation(outer, iterations=1) & (al > 0)
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    lum0 = .3 * r + .59 * g + .11 * b
    warm = np.maximum(r, b) * .82
    g2 = np.where(lum0 < 150, np.minimum(g, warm), np.where(band, np.minimum(g, np.maximum(r, b)), g))
    b = np.where(.3 * r + .59 * g2 + .11 * b < 110, np.maximum(b, g2 * 1.08), b)
    luma = .3 * r + .59 * g2 + .11 * b
    k = np.ones_like(luma)
    k = np.where(band & (luma < 200), .62, k)          # strand edges: a lighter touch
    k = np.where(outer & band & (luma < 200), .3, k)   # outer silhouette: the black pen line
    out = np.dstack([r * k, g2 * k, b * k, al]).clip(0, 255).astype(np.uint8)
    Image.fromarray(out, 'RGBA').save(path, 'WEBP', quality=95, method=4)
if __name__ == '__main__':
    for p in sys.argv[1:]: fix(p)
    print('done', len(sys.argv) - 1)
