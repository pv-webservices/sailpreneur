"""Publish optimised WebP derivatives for the website.

Sources stay untouched:
  * client originals in public/*.jpeg
  * AI originals in assets-src/generated/*.png (see scripts/images/)
Output: public/media/<name>-<width>.webp plus a JSON size manifest used for width/height attributes.

Run: python scripts/optimize-images.py
"""
from pathlib import Path
import json
from PIL import Image, ImageChops, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
OUT = PUBLIC / 'media'
GENERATED = ROOT / 'assets-src' / 'generated'
OUT.mkdir(parents=True, exist_ok=True)

# Client-supplied crops: (source, crop box or None, output widths)
CLIENT = {
    'ankur-uniform': ('image-6.jpeg', (0, 0, 760, 900), [760, 420]),
    'ankur-portrait': ('Ankur kumar Mishra.jpeg', None, [893, 450]),
    'student-sahil': ('success story image-1.jpeg', (175, 352, 435, 800), [260]),
    'student-anjali': ('success story image-2.jpeg', (45, 285, 560, 1000), [515]),
    'student-amit': ('success story image-3.jpeg', (45, 428, 548, 1135), [503]),
    'expert-ashish': ('Ashish Sharma.jpeg', None, [700, 400]),
    'expert-sanjay': ('Sanjay Mamgain.jpeg', (134, 0, 1045, 911), [700, 400]),
    'expert-anirudh': ('Anirudh Prakash Mishra.jpeg', (0, 0, 1100, 1300), [700, 400]),
    'expert-kalyani': ('Kalyani Mishra.jpeg', None, [700, 400]),
    'expert-mudita': ('Mudita Mittal.jpeg', (0, 0, 1023, 1150), [700, 400]),
}

# Generated images: output widths by orientation
GENERATED_WIDTHS = {'landscape': [1920, 1200, 720], 'portrait': [900, 520], 'square': [1024, 560]}

manifest: dict = {}


def save_variants(name: str, image: Image.Image, widths: list[int], quality: int = 80) -> None:
    variants = []
    for width in sorted(set(widths), reverse=True):
        width = min(width, image.width)
        copy = image.copy()
        if copy.width > width:
            copy = copy.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
            copy = copy.filter(ImageFilter.UnsharpMask(radius=0.6, percent=40, threshold=2))
        path = OUT / f'{name}-{width}.webp'
        copy.save(path, 'WEBP', quality=quality, method=6)
        variants.append({'width': copy.width, 'height': copy.height, 'file': f'/media/{path.name}', 'bytes': path.stat().st_size})
    manifest[name] = variants


def logo_emblem() -> None:
    """Cut the gold emblem out of the navy logo card into a transparent WebP."""
    src = ImageOps.exif_transpose(Image.open(PUBLIC / 'website logo.jpeg')).convert('RGB')
    emblem = src.crop((312, 58, 742, 462))
    background = (11, 26, 53)
    red, green, _ = emblem.split()
    distance = ImageChops.lighter(red.point(lambda v: max(0, v - background[0])), green.point(lambda v: max(0, v - background[1])))
    rgba = emblem.copy()
    rgba.putalpha(distance.point(lambda v: min(255, int(v * 2.1))))
    for width in (240, 120):
        copy = rgba.resize((width, round(rgba.height * width / rgba.width)), Image.LANCZOS)
        copy.save(OUT / f'emblem-{width}.webp', 'WEBP', quality=90, method=6)
    manifest['emblem'] = [{'width': 240, 'height': round(rgba.height * 240 / rgba.width), 'file': '/media/emblem-240.webp'}]
    # Full logo card (for social sharing / schema)
    save_variants('logo-card', src, [1048], quality=86)


for name, (source, box, widths) in CLIENT.items():
    image = ImageOps.exif_transpose(Image.open(PUBLIC / source)).convert('RGB')
    if box:
        image = image.crop(box)
    save_variants(name, image, widths, quality=82)

logo_emblem()

if GENERATED.exists():
    meta = json.loads((GENERATED / 'manifest.json').read_text()) if (GENERATED / 'manifest.json').exists() else {}
    for png in sorted(GENERATED.glob('*.png')):
        image = Image.open(png).convert('RGB')
        orientation = 'landscape' if image.width > image.height else 'portrait' if image.height > image.width else 'square'
        save_variants(png.stem, image, GENERATED_WIDTHS[orientation], quality=78)
        if png.stem in meta:
            manifest[png.stem + ':meta'] = {k: meta[png.stem][k] for k in ('model', 'quality', 'alt')}

(ROOT / 'src' / 'data' / 'media.json').write_text(json.dumps(manifest, indent=1))
total = sum(v['bytes'] for k, vs in manifest.items() if not k.endswith(':meta') for v in vs if 'bytes' in v)
print(f'{len(manifest)} assets, {total / 1024:.0f} KB of WebP variants')
