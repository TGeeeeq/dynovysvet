"""
Sjednocení fotek ze statku.

Materiál je smíšený: pár slušných zrcadlovkových snímků a hodně mobilních.
Jediné, co je spolehlivě spojí do jedné sady, je společný barevný grading —
tak, jak se to dělá u tiskového katalogu. Bez něj vedle sebe vypadají jako
náhodně posbírané obrázky, a to je přesně ten dojem, kterému se vyhýbáme.

Recept: mírné odsycení, teplé stíny do hněda, světla do krémova, jemná
S-křivka a špetka zrna. Nic dramatického — cílem není filtr, ale to, aby
fotka seděla na papírovém podkladu webu.
"""
import json, os, sys
from PIL import Image, ImageEnhance, ImageOps

SRC, OUT = "assets-original", "public/foto"
WIDTHS = [1600, 1000, 640]

# Cílové krajní body split toningu — stejné jako tokeny `ink` a `paper-bright`.
SHADOW = (34, 26, 20)
HIGHLIGHT = (250, 245, 236)


def tone_curve() -> list[int]:
    """Jemná S-křivka. Přidá kontrast, ale nezalepí stíny."""
    lut = []
    for i in range(256):
        x = i / 255
        y = x * x * (3 - 2 * x)          # smoothstep
        y = x * 0.62 + y * 0.38          # jen z části, ať to není tvrdé
        lut.append(max(0, min(255, round(y * 255))))
    return lut


def warm_channels(img: Image.Image) -> Image.Image:
    """
    Kanálový posun. Modrá obloha a syté oranžové dýně z mobilu jsou o dva
    tóny křiklavější než papírová paleta webu; tohle je stáhne k sobě, aniž
    by z fotky udělalo sépii.
    """
    r, g, b = img.split()
    r = r.point(lambda v: min(255, round(v * 1.03 + 6)))
    g = g.point(lambda v: min(255, round(v * 0.995 + 3)))
    b = b.point(lambda v: min(255, round(v * 0.90 + 2)))
    return Image.merge("RGB", (r, g, b))


def split_tone(img: Image.Image, strength: float = 0.30) -> Image.Image:
    """Stíny táhne do teplé hnědé, světla do krémové."""
    gray = ImageOps.grayscale(img)
    duo = ImageOps.colorize(gray, SHADOW, HIGHLIGHT)
    return Image.blend(img, duo, strength)


def grade(path: str) -> Image.Image:
    img = Image.open(path).convert("RGB")
    img = ImageOps.exif_transpose(img)
    lut = tone_curve()
    img = img.point(lut * 3)
    img = ImageEnhance.Color(img).enhance(0.72)
    img = warm_channels(img)
    img = split_tone(img)
    img = ImageEnhance.Sharpness(img).enhance(1.15)
    return img


def main(names: list[str]) -> None:
    os.makedirs(OUT, exist_ok=True)
    manifest = []
    for name in names:
        src = os.path.join(SRC, name)
        if not os.path.exists(src):
            print("chybí:", name, file=sys.stderr)
            continue
        base = os.path.splitext(name)[0]
        graded = grade(src)
        w0, h0 = graded.size
        for w in WIDTHS:
            if w > w0:
                continue
            im = graded.resize((w, round(h0 * w / w0)), Image.LANCZOS)
            im.save(os.path.join(OUT, f"{base}-{w}.webp"), "WEBP", quality=82, method=6)
        manifest.append({"base": base, "width": w0, "height": h0})
        print(f"{base}  {w0}×{h0}")
    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)


if __name__ == "__main__":
    main(sys.argv[1:])
