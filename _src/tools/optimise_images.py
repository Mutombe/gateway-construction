"""Convert raw project photos into web-ready WebP (1600w + 800w) under assets/img/."""
import glob, os, sys
from PIL import Image, ImageOps

raw, dl, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(f'{out}/projects', exist_ok=True)
os.makedirs(f'{out}/clients', exist_ok=True)

def save(src, dst, widths=(1600, 800), q=78):
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    for w in widths:
        c = im.copy()
        if c.width > w:
            c = c.resize((w, round(c.height * w / c.width)), Image.LANCZOS)
        suffix = '' if w == widths[0] else '-sm'
        c.save(f'{dst}{suffix}.webp', 'WEBP', quality=q, method=6)

skip = {'awards/06', 'bishopslea/01', 'mazowe/02'}  # duplicates / tiny screenshot
for f in sorted(glob.glob(f'{raw}/*/*')):
    proj = os.path.basename(os.path.dirname(f))
    n = os.path.basename(f)[:2]
    if f'{proj}/{n}' in skip:
        continue
    save(f, f'{out}/projects/{proj}-{n}')

save(f'{dl}/666764a17c17fb0ff66b9f43_phases_of_construction_projects.webp', f'{out}/rebar')

logos = {
    'original-technology': 'Capture-removebg', 'thaton': '__1_', 'redan': '__2_', 'zimasco': '__3_',
    'zimtrade': '__4_', 'old-mutual': '__5_', 'simbisa': '__6_', 'stanbic': '__7_',
    'mimosa': 'mimosa-mining', 'msc': 'msc-removebg', 'valterra': 'valterra', 'iso': 'iso-removebg',
}
for name, key in logos.items():
    src = [p for p in glob.glob(f'{dl}/*.png') if key in p][0]
    im = Image.open(src).convert('RGBA'); im = im.crop(im.getbbox())
    im.save(f'{out}/clients/{name}.png', optimize=True)
z = Image.open(f'{raw}/logo8.png').convert('RGBA'); z.crop(z.getbbox()).save(f'{out}/clients/zimplats.png', optimize=True)
print('done')
