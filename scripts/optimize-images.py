"""Publish optimised AVIF + WebP derivatives, the share image and the favicon set.

Masters stay outside the deployed output:
  * client originals in source-files/client/<category>/
  * AI originals in source-files/generated/*.png (git-ignored; see scripts/images/)
Output:
  * public/images/<category>/<name>-<width>.{avif,webp}
  * public/images/brand/og-default.jpg (1200x630 share image)
  * public/favicon.* , public/apple-touch-icon.png, public/icon-*.png
  * src/data/media.json (sizes manifest used for width/height/srcset)

Run: python scripts/optimize-images.py   (npm run images:optimize)
"""
from pathlib import Path
import base64
import io
import json
import time
from PIL import Image, ImageChops, ImageDraw, ImageOps, ImageFilter

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
IMAGES = PUBLIC / 'images'
CLIENT_DIR = ROOT / 'source-files' / 'client'
GENERATED = ROOT / 'source-files' / 'generated'
NAVY = (7, 26, 48)  # --navy-900, also the manifest theme colour

# Client-supplied crops: name -> (source, crop box or None, output widths, category)
CLIENT = {
    'ankur-uniform': ('founder/ankur-career-captain-banner.jpeg', (0, 0, 760, 900), [760, 420], 'founder'),
    'ankur-portrait': ('founder/ankur-kumar-mishra-portrait.jpeg', None, [893, 450], 'founder'),
    'student-sahil': ('students/sahil.webp', None, [720, 420], 'students'),
    'student-anjali': ('students/anjali-rawat.webp', None, [720, 420], 'students'),
    'student-amit': ('students/amit-kumar.webp', None, [720, 420], 'students'),
    'student-rohit': ('students/rohit.webp', None, [720, 420], 'students'),
    'expert-ashish': ('experts/ashish-sharma.jpeg', None, [700, 400], 'experts'),
    'expert-sanjay': ('experts/sanjay-mamgain.jpeg', (134, 0, 1045, 911), [700, 400], 'experts'),
    'expert-anirudh': ('experts/anirudh-prakash-mishra.jpeg', (0, 0, 1100, 1300), [700, 400], 'experts'),
    'expert-kalyani': ('experts/kalyani-mishra.jpeg', None, [700, 400], 'experts'),
    'expert-mudita': ('experts/mudita-mittal.jpeg', (0, 0, 1023, 1150), [700, 400], 'experts'),
}

# Generated images: output widths by orientation; category by name prefix
GENERATED_WIDTHS = {'landscape': [1536, 1200, 720], 'portrait': [900, 520], 'square': [1024, 560]}
# Photographic backgrounds tolerate stronger compression than faces.
QUALITY = {'photo': (62, 42), 'people': (80, 62), 'brand': (88, 70)}  # (webp, avif)

manifest: dict = {}


def write_image(image: Image.Image, path: Path, fmt: str, **options) -> None:
    """Encode in memory, then write; retries ride out brief Windows file locks (indexer/antivirus)."""
    buffer = io.BytesIO()
    image.save(buffer, fmt, **options)
    for attempt in range(5):
        try:
            path.write_bytes(buffer.getvalue())
            return
        except OSError:
            if attempt == 4:
                raise
            time.sleep(0.5)


def category_for(name: str) -> str:
    return 'departments' if name.startswith(('dept-', 'program-')) else 'editorial'


def save_variants(name: str, image: Image.Image, widths: list[int], category: str, kind: str = 'photo') -> None:
    webp_q, avif_q = QUALITY[kind]
    out = IMAGES / category
    out.mkdir(parents=True, exist_ok=True)
    variants = []
    for width in sorted(set(min(w, image.width) for w in widths), reverse=True):
        copy = image.copy()
        if copy.width > width:
            copy = copy.resize((width, round(image.height * width / image.width)), Image.LANCZOS)
            copy = copy.filter(ImageFilter.UnsharpMask(radius=0.6, percent=40, threshold=2))
        webp = out / f'{name}-{width}.webp'
        avif = out / f'{name}-{width}.avif'
        write_image(copy, webp, 'WEBP', quality=webp_q, method=6)
        write_image(copy, avif, 'AVIF', quality=avif_q, speed=4)
        variants.append({'width': copy.width, 'height': copy.height, 'file': f'/images/{category}/{webp.name}',
                         'avif': f'/images/{category}/{avif.name}', 'bytes': webp.stat().st_size, 'avifBytes': avif.stat().st_size})
    manifest[name] = variants


EMBLEM_BOX = (312, 66, 740, 486)  # full circular emblem on the logo card
SAIL_BOX = (369, 103, 679, 413)  # just the "A" sail, for icons that must read at 16px
EMBLEM_CENTRE, SAIL_RADIUS = (525.5, 276.5), 176  # radius inside the emblem's outer ring


def emblem_rgba(box: tuple[int, int, int, int] = EMBLEM_BOX) -> Image.Image:
    """Cut the gold emblem out of the navy logo card into a transparent image."""
    src = ImageOps.exif_transpose(Image.open(CLIENT_DIR / 'brand/website-logo-card.jpeg')).convert('RGB')
    emblem = src.crop(box)
    background = (11, 26, 53)
    red, green, _ = emblem.split()
    distance = ImageChops.lighter(red.point(lambda v: max(0, v - background[0])), green.point(lambda v: max(0, v - background[1])))
    rgba = emblem.copy()
    alpha = distance.point(lambda v: min(255, int(v * 2.1)))
    if box == SAIL_BOX:  # drop the ring fragments that fall inside the square crop
        ring = Image.new('L', alpha.size, 0)
        cx, cy = EMBLEM_CENTRE[0] - box[0], EMBLEM_CENTRE[1] - box[1]
        ImageDraw.Draw(ring).ellipse((cx - SAIL_RADIUS, cy - SAIL_RADIUS, cx + SAIL_RADIUS, cy + SAIL_RADIUS), fill=255)
        alpha = ImageChops.multiply(alpha, ring)
    rgba.putalpha(alpha)
    return rgba.crop(rgba.getbbox())


def brand_assets() -> None:
    rgba = emblem_rgba()
    out = IMAGES / 'brand'
    out.mkdir(parents=True, exist_ok=True)
    copy = rgba.resize((120, round(rgba.height * 120 / rgba.width)), Image.LANCZOS)
    write_image(copy, out / 'emblem-120.webp', 'WEBP', quality=90, method=6)
    manifest['emblem'] = [{'width': copy.width, 'height': copy.height, 'file': '/images/brand/emblem-120.webp'}]
    card = ImageOps.exif_transpose(Image.open(CLIENT_DIR / 'brand/website-logo-card.jpeg')).convert('RGB')
    save_variants('logo-card', card, [1048, 520], 'brand', kind='brand')
    favicons(emblem_rgba(SAIL_BOX))


def square_icon(rgba: Image.Image, size: int, padding: float = 0.08) -> Image.Image:
    """Emblem centred on a solid navy square; readable down to 16px."""
    canvas = Image.new('RGB', (size, size), NAVY)
    inner = round(size * (1 - 2 * padding))
    scale = inner / max(rgba.size)
    mark = rgba.resize((round(rgba.width * scale), round(rgba.height * scale)), Image.LANCZOS)
    canvas.paste(mark, ((size - mark.width) // 2, (size - mark.height) // 2), mark)
    return canvas


def favicons(rgba: Image.Image) -> None:
    master = square_icon(rgba, 1024)
    for size, name in [(48, 'favicon-48x48.png'), (96, 'favicon-96x96.png'), (192, 'icon-192.png'), (512, 'icon-512.png'), (180, 'apple-touch-icon.png')]:
        write_image(master.resize((size, size), Image.LANCZOS), PUBLIC / name, 'PNG', optimize=True)
    write_image(master.resize((48, 48), Image.LANCZOS), PUBLIC / 'favicon.ico', 'ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    # SVG wrapper around a crisp raster of the real emblem (the emblem is a photographic gold texture, not a vector).
    buffer = io.BytesIO()
    master.resize((128, 128), Image.LANCZOS).save(buffer, 'PNG', optimize=True)
    data = base64.b64encode(buffer.getvalue()).decode()
    (PUBLIC / 'favicon.svg').write_text(
        '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 128 128" width="128" height="128">'
        f'<image width="128" height="128" href="data:image/png;base64,{data}"/></svg>\n')


def share_image() -> None:
    """1200x630 Open Graph image: hero ship with the emblem."""
    source = GENERATED / 'hero-ship.png'
    if not source.exists():
        return
    image = ImageOps.fit(Image.open(source).convert('RGB'), (1200, 630), Image.LANCZOS, centering=(0.6, 0.55))
    mark = emblem_rgba()
    mark.thumbnail((150, 150), Image.LANCZOS)
    image.paste(mark, (56, 630 - 56 - mark.height), mark)
    write_image(image, IMAGES / 'brand' / 'og-default.jpg', 'JPEG', quality=82, optimize=True, progressive=True)


for name, (source, box, widths, category) in CLIENT.items():
    image = ImageOps.exif_transpose(Image.open(CLIENT_DIR / source)).convert('RGB')
    if box:
        image = image.crop(box)
    save_variants(name, image, widths, category, kind='people')

brand_assets()

if GENERATED.exists():
    meta = json.loads((GENERATED / 'manifest.json').read_text()) if (GENERATED / 'manifest.json').exists() else {}
    for png in sorted(GENERATED.glob('*.png')):
        image = Image.open(png).convert('RGB')
        orientation = 'landscape' if image.width > image.height else 'portrait' if image.height > image.width else 'square'
        save_variants(png.stem, image, GENERATED_WIDTHS[orientation], category_for(png.stem))
        if png.stem in meta:
            manifest[png.stem + ':meta'] = {k: meta[png.stem][k] for k in ('model', 'quality', 'alt')}


def hospitality_collage() -> None:
    """2x2 collage of the department photos for the Hospitality Knowledge program."""
    tiles = ['dept-fnb', 'dept-galley', 'dept-housekeeping', 'dept-hotel']
    if not all((GENERATED / f'{t}.png').exists() for t in tiles):
        return
    cell_w, cell_h, gap = 768, 512, 8
    canvas = Image.new('RGB', (cell_w * 2 + gap, cell_h * 2 + gap), (6, 21, 41))
    for i, tile in enumerate(tiles):
        image = ImageOps.fit(Image.open(GENERATED / f'{tile}.png').convert('RGB'), (cell_w, cell_h), Image.LANCZOS, centering=(0.5, 0.3))
        canvas.paste(image, ((i % 2) * (cell_w + gap), (i // 2) * (cell_h + gap)))
    save_variants('program-hospitality', canvas, GENERATED_WIDTHS['landscape'], 'departments')
    manifest['program-hospitality:meta'] = {'model': 'collage', 'quality': 'n/a', 'alt': 'Cruise hospitality departments: a bartender, a chef, a housekeeping attendant and a guest services officer'}


hospitality_collage()
share_image()

(ROOT / 'src' / 'data' / 'media.json').write_text(json.dumps(manifest, indent=1))
total = sum(v['bytes'] for k, vs in manifest.items() if not k.endswith(':meta') for v in vs if 'bytes' in v)
total_avif = sum(v.get('avifBytes', 0) for k, vs in manifest.items() if not k.endswith(':meta') for v in vs)
print(f'{len(manifest)} assets, {total / 1024:.0f} KB WebP, {total_avif / 1024:.0f} KB AVIF')
