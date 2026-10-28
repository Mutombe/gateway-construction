"""
Ray-marched construction objects for the Gateway Construction site.

Each object is a signed distance function (SDF). For every pixel a ray is fired
from a virtual camera and stepped forward by the SDF until it touches the
surface. Shading uses a fake photo studio (sky, floor, softbox strips) so the
metal and lacquer read as real materials.

Usage:  python render3d.py <out_dir> [name ...]
Output: obj-<name>.webp, 480x480, transparent background.
"""
import sys, os
import numpy as np
from PIL import Image

SIZE = 560          # final canvas before crop
SS = 2              # supersampling factor
OUT = 480

# ---------- vector helpers -------------------------------------------------
def norm(v):
    return v / np.linalg.norm(v, axis=-1, keepdims=True).clip(1e-9)

def dot(a, b):
    return np.sum(a * b, axis=-1)

def rot(ax, ay, az):
    ax, ay, az = np.radians([ax, ay, az])
    rx = np.array([[1, 0, 0], [0, np.cos(ax), -np.sin(ax)], [0, np.sin(ax), np.cos(ax)]])
    ry = np.array([[np.cos(ay), 0, np.sin(ay)], [0, 1, 0], [-np.sin(ay), 0, np.cos(ay)]])
    rz = np.array([[np.cos(az), -np.sin(az), 0], [np.sin(az), np.cos(az), 0], [0, 0, 1]])
    return rz @ ry @ rx

# ---------- SDF primitives -------------------------------------------------
def sd_box(p, b, r=0.0):
    q = np.abs(p) - (np.array(b) - r)
    return np.linalg.norm(np.maximum(q, 0), axis=-1) + np.minimum(q.max(axis=-1), 0) - r

def sd_capped_cone(p, h, r1, r2):
    q = np.stack([np.hypot(p[..., 0], p[..., 2]), p[..., 1]], -1)
    k1 = np.array([r2, h]); k2 = np.array([r2 - r1, 2 * h])
    ca = np.stack([q[..., 0] - np.minimum(q[..., 0], np.where(q[..., 1] < 0, r1, r2)),
                   np.abs(q[..., 1]) - h], -1)
    t = np.clip(dot(k1 - q, k2[None]) / dot(k2, k2), 0, 1)
    cb = q - k1 + k2 * t[..., None]
    s = np.where((cb[..., 0] < 0) & (ca[..., 1] < 0), -1.0, 1.0)
    return s * np.sqrt(np.minimum(dot(ca, ca), dot(cb, cb)))

def sd_round_rect2(x, y, bx, by, r):
    qx = np.abs(x) - (bx - r); qy = np.abs(y) - (by - r)
    return np.hypot(np.maximum(qx, 0), np.maximum(qy, 0)) + np.minimum(np.maximum(qx, qy), 0) - r

# ---------- objects: sdf(p) -> d, material(p, n) -> id ----------------------
# material ids: 0 graphite metal, 1 white ceramic/concrete, 2 green lacquer, 3 brushed steel

def ibeam(p):
    L = 1.15
    top = sd_box(p - [0, 0.42, 0], [L, 0.07, 0.42], 0.025)
    bot = sd_box(p + [0, 0.42, 0], [L, 0.07, 0.42], 0.025)
    web = sd_box(p, [L, 0.42, 0.065], 0.02)
    return np.minimum(np.minimum(top, bot), web)

def ibeam_mat(p, n):
    # flanges' outer faces graphite, web green, cut ends steel
    m = np.zeros(len(p), int)
    m[np.abs(p[:, 1]) < 0.34] = 2
    m[np.abs(n[:, 0]) > 0.7] = 3
    return m

def arch2(x, y, R, w):
    # "∩" outline: semicircle on top of a rectangle, as a band of width w
    outer = np.where(y > 0, np.hypot(x, y) - R, np.maximum(np.abs(x) - R, -y - 1.0 * R))
    inner = np.where(y > 0, np.hypot(x, y) - (R - w), np.abs(x) - (R - w))
    return np.maximum(outer, -inner)

def arch(p):
    y = p[:, 1] + 0.25
    d2 = arch2(p[:, 0], y, 1.0, 0.36)
    d2 = np.maximum(d2, -y - 0.85)  # trim legs
    dz = np.abs(p[:, 2]) - 0.32
    d = np.hypot(np.maximum(d2 + 0.04, 0), np.maximum(dz + 0.04, 0)) + np.minimum(np.maximum(d2, dz), 0) - 0.04
    return d * 0.7  # under-step: the 2D arch field is not exact in the legs

def arch_mat(p, n):
    y = p[:, 1] + 0.25
    r = np.hypot(p[:, 0], y)
    m = np.ones(len(p), int)
    inner = np.where(y > 0, r < 0.7, np.abs(p[:, 0]) < 0.7)
    m[inner] = 2
    # keystone band in graphite
    m[(np.abs(p[:, 0]) < 0.13) & (y > 0.6)] = 0
    return m

BLOCKS = [((-0.55, -0.55, 0.0), 0.42), ((0.32, -0.55, 0.1), 0.42), ((-0.12, 0.3, 0.05), 0.42)]

def blocks(p):
    d = np.full(len(p), 1e9)
    for c, s in BLOCKS:
        d = np.minimum(d, sd_box(p - np.array(c), [s, s, s], 0.06))
    return d

def blocks_mat(p, n):
    ds = np.stack([sd_box(p - np.array(c), [s, s, s], 0.06) for c, s in BLOCKS], -1)
    return np.array([1, 0, 2])[ds.argmin(-1)]

def pipe(p):
    # culvert: thick tube, axis on y
    r = np.hypot(p[:, 0], p[:, 2])
    return sd_round_rect2(r - 0.82, p[:, 1], 0.2, 0.55, 0.07)

def pipe_mat(p, n):
    r = np.hypot(p[:, 0], p[:, 2])
    m = np.ones(len(p), int)
    m[r < 0.74] = 2
    m[np.abs(n[:, 1]) > 0.75] = 0
    return m

def cone(p):
    c = sd_capped_cone(p - [0, 0.12, 0], 0.78, 0.62, 0.1)
    base = sd_box(p + [0, 0.74, 0], [0.82, 0.07, 0.82], 0.05)
    return np.minimum(c, base)

def cone_mat(p, n):
    y = p[:, 1]
    m = np.zeros(len(p), int)
    m[(y > -0.66)] = 1
    m[((y > -0.2) & (y < 0.06)) | ((y > 0.38) & (y < 0.58))] = 2
    return m

OBJECTS = {
    #        sdf      material   pose (x, y, z)        scale
    'beam':   (ibeam,  ibeam_mat,  (22, -34, -8),  1.0),
    'arch':   (arch,   arch_mat,   (14, -30, 4),   1.05),
    'blocks': (blocks, blocks_mat, (24, 38, 0),    1.0),
    'pipe':   (pipe,   pipe_mat,   (58, 0, -22),   1.0),
    'cone':   (cone,   cone_mat,   (16, 20, -10),  1.05),
}

# ---------- studio ---------------------------------------------------------
LIGHTS = [  # dir, sharpness, strength, colour
    ((-0.55, 0.75, 0.65), 22, 4.2, (1.0, 0.98, 0.95)),
    ((0.85, 0.25, -0.45), 10, 1.6, (0.80, 0.95, 0.86)),   # cool-green rim
    ((0.0, 1.0, 0.1), 6, 0.6, (1, 1, 1)),
    ((0.6, -0.4, 0.7), 9, 0.5, (1.0, 0.92, 0.8)),
]
LIGHTS = [(norm(np.array(d, float)), s, k, np.array(c)) for d, s, k, c in LIGHTS]

def env(d):
    y = d[:, 1:2]
    sky = np.array([0.95, 0.97, 0.98]); hor = np.array([0.30, 0.33, 0.33]); flo = np.array([0.08, 0.09, 0.08])
    c = np.where(y > 0, hor + (sky - hor) * np.clip(y * 1.6, 0, 1) ** 0.7, hor + (flo - hor) * np.clip(-y * 2, 0, 1))
    c = c * (0.75 + 0.25 * np.clip(d[:, 0:1] + 0.6, 0, 1))
    c = c + 1.6 * np.exp(-((y - 0.18) / 0.06) ** 2)
    c = c + 1.1 * np.exp(-((d[:, 0:1] - 0.75) / 0.08) ** 2) * (y > -0.2)
    return c

def schlick(f0, ndv):
    return f0 + (1 - f0) * (1 - ndv[:, None]) ** 5

# ---------- render ---------------------------------------------------------
def render(name):
    sdf, matf, pose, scale = OBJECTS[name]
    R = rot(*pose); Ri = R.T
    f = lambda p: sdf((p / scale) @ R) * scale  # world -> object: p @ R == Ri @ p

    N = SIZE * SS
    u = (np.arange(N) + 0.5) / N * 2 - 1
    X, Y = np.meshgrid(u, -u)
    ro = np.array([0, 0, 5.0])
    rd = norm(np.stack([X * 0.33 * 1.0, Y * 0.33, -np.ones_like(X)], -1)).reshape(-1, 3)
    t = np.full(len(rd), 2.5); hit = np.zeros(len(rd), bool)
    act = np.arange(len(rd))
    for _ in range(260):
        p = ro + rd[act] * t[act, None]
        d = f(p)
        h = d < 0.0008
        hit[act[h]] = True
        t[act] += d * 0.9
        act = act[~h & (t[act] < 7.5)]
        if not len(act):
            break

    idx = np.where(hit)[0]
    p = ro + rd[idx] * t[idx, None]
    e = 0.0015
    k = np.array([[1, -1, -1], [-1, -1, 1], [-1, 1, -1], [1, 1, 1]], float)
    n = norm(sum(kk * f(p + kk * e)[:, None] for kk in k))
    v = -rd[idx]
    ndv = np.clip(dot(n, v), 0, 1)
    rf = norm(rd[idx] - 2 * dot(rd[idx], n)[:, None] * n)
    E = env(rf)

    po = (p / scale) @ R; no = n @ R
    mat = matf(po, no)

    ao = np.ones(len(p))
    for i in range(1, 6):
        h = 0.06 * i
        ao -= (h - f(p + n * h)) * 0.5 ** i * 2.4
    ao = np.clip(ao, 0.35, 1)[:, None]

    col = np.zeros((len(p), 3))
    spec = np.zeros((len(p), 3))
    for L, sharp, strength, lc in LIGHTS:
        ndl = np.clip(dot(n, L), 0, 1)[:, None]
        H = norm(L + v)
        ndh = np.clip(dot(n, H), 0, 1)[:, None]
        col += lc * ndl * strength / 4.0
        spec += lc * (ndh ** 120) * strength / 4.2

    out = np.zeros((len(p), 3))
    # 0 graphite metal (black chrome)
    m = mat == 0
    F = schlick(np.array([0.10, 0.11, 0.11]), ndv[m])
    out[m] = E[m] * F * 1.1 + 0.035 * col[m] + 1.8 * spec[m]
    # 1 white ceramic / polished concrete
    m = mat == 1
    base = np.array([0.86, 0.87, 0.86])
    F = schlick(0.04, ndv[m])
    out[m] = base * (0.30 + 0.80 * col[m]) + E[m] * F * 0.8 + 1.2 * spec[m]
    # 2 green lacquer
    m = mat == 2
    base = np.array([0.006, 0.20, 0.08])
    F = schlick(0.04, ndv[m])
    out[m] = (base * (0.35 + 0.9 * col[m]) + E[m] * F * 0.75 + 1.4 * spec[m]
              + np.array([0.05, 0.45, 0.2]) * ((1 - ndv[m]) ** 3)[:, None] * 0.35)
    # 3 brushed steel
    m = mat == 3
    F = schlick(np.array([0.56, 0.57, 0.58]), ndv[m])
    out[m] = E[m] * F * 0.7 + 0.18 * col[m] + 1.2 * spec[m]

    out *= ao
    out = 1 - np.exp(-1.75 * out)

    img = np.zeros((N * N, 4))
    img[idx, :3] = out; img[idx, 3] = 1
    img = img.reshape(N, N, 4)
    # premultiplied 2x2 downsample
    pm = img[..., :3] * img[..., 3:]
    pm = pm.reshape(SIZE, SS, SIZE, SS, 3).mean((1, 3))
    a = img[..., 3].reshape(SIZE, SS, SIZE, SS).mean((1, 3))
    rgb = np.where(a[..., None] > 0, pm / a[..., None].clip(1e-6), 0)
    arr = np.dstack([rgb.clip(0, 1) * 255, a * 255]).astype(np.uint8)
    im = Image.fromarray(arr, 'RGBA')
    bb = im.getbbox()
    im = im.crop(bb)
    side = max(im.size) + 32
    sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    sq.paste(im, ((side - im.width) // 2, (side - im.height) // 2))
    return sq.resize((OUT, OUT), Image.LANCZOS)

if __name__ == '__main__':
    out = sys.argv[1]
    names = sys.argv[2:] or list(OBJECTS)
    os.makedirs(out, exist_ok=True)
    for nm in names:
        render(nm).save(f'{out}/obj-{nm}.webp', 'WEBP', quality=90, method=6)
        print('rendered', nm)
