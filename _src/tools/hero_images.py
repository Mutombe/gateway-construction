"""Export hero-grade WebP images (full resolution up to 2400w, light sharpening, q88) to assets/img/hero/."""
import glob, os, sys
from PIL import Image, ImageOps, ImageFilter

raw, dl, out = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(out, exist_ok=True)

SOURCES = {
    'site-aerial': f'{dl}/DJI_20260923145514_0848_D.jpg1-s53h8r70Wfc4pGBqiY858Q.jpeg',
    **{k: f'{raw}/{k.rsplit("-", 1)[0]}/{k.rsplit("-", 1)[1]}-*' for k in [
        'kenilworth-03', 'quinnington-02', 'church-02', 'eaglesvale-01', 'mazowe-03', 'puma-03',
        'msc-05', 'otfactory-01', 'quinnington-04', 'shungu-01', 'mazowe-00', 'eaglesvale-00']},
}

for name, pattern in SOURCES.items():
    src = glob.glob(pattern)[0]
    im = ImageOps.exif_transpose(Image.open(src)).convert('RGB')
    if im.width > 2400:
        im = im.resize((2400, round(im.height * 2400 / im.width)), Image.LANCZOS)
    im = im.filter(ImageFilter.UnsharpMask(radius=1.3, percent=55, threshold=3))
    im.save(f'{out}/{name}.webp', 'WEBP', quality=88, method=6)
    print(name, im.size, os.path.getsize(f'{out}/{name}.webp') // 1024, 'KB')
