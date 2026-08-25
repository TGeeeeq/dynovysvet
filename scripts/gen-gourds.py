"""
Generátor siluet tykví pro ilustrační systém „Rytý herbář".

Tělo je rotační plocha: profil r(t) podle zeměpisné šířky t ∈ ⟨0,π⟩.
Žebra jsou poledníky rovnoměrně rozdělené po DÉLCE, ne po šířce obrázku —
díky tomu se samy zahušťují u okraje a tvar okamžitě čte jako trojrozměrný.
Přesně tohle chybělo první verzi, kde žebra vypadala jako papírový lampion.
"""
import math, json

def profile(t, A, B, p, pear, scallop, lobes):
    """r = poloměr rovnoběžky, y = výška. t=0 vršek, t=π dno."""
    s = math.sin(t)
    r = A * (s ** p if s > 0 else 0.0)
    # Hruškovitost: dole širší než nahoře (máslová dýně).
    r *= 1.0 + pear * (1.0 - math.cos(t)) * 0.5
    # Zubatý okraj soustředěný k rovníku (patison).
    if scallop:
        r *= 1.0 + scallop * (s ** 3) * math.cos(lobes * t)
    y = -B * math.cos(t)
    return r, y

def catmull(pts, closed):
    n = len(pts)
    d = [f"M{pts[0][0]:.1f} {pts[0][1]:.1f}"]
    for i in (range(n) if closed else range(n - 1)):
        p0, p1 = pts[(i - 1) % n], pts[i % n]
        p2, p3 = pts[(i + 1) % n], pts[(i + 2) % n]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6.0, p1[1] + (p2[1] - p0[1]) / 6.0)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6.0, p2[1] - (p3[1] - p1[1]) / 6.0)
        d.append(f"C{c1[0]:.1f} {c1[1]:.1f} {c2[0]:.1f} {c2[1]:.1f} {p2[0]:.1f} {p2[1]:.1f}")
    if closed:
        d.append("Z")
    return "".join(d)

def outline(S, **k):
    """Silueta = pravá polovina profilu zrcadlená doleva."""
    N = 34
    right = [profile(math.pi * i / (N - 1), **k) for i in range(N)]
    pts = [(r * S, y * S) for r, y in right]
    pts += [(-r * S, y * S) for r, y in reversed(right[1:-1])]
    return catmull(pts, True)

def ribs(S, count, **k):
    """
    Poledníky. Rovnoměrně po úhlu φ ∈ (−π/2, π/2), takže se u okraje
    přirozeně zahušťují — to je celé zkrácení perspektivou.
    Nekreslí se až k pólům; nahoře končí u jamky pro stopku.
    """
    if not count:
        return []
    out = []
    T0, T1 = 0.34, math.pi - 0.40      # useknuté póly (jinak křivka přestřelí)
    for j in range(count):
        phi = -math.pi / 2 + math.pi * (j + 1) / (count + 1)
        sinphi = math.sin(phi)
        pts = []
        for i in range(15):
            u = i / 14
            # Náběh (smoothstep) zahustí body uprostřed, ne na koncích —
            # tam by shluk bodů vyrobil smyčku.
            t = T0 + (T1 - T0) * (u * u * (3 - 2 * u))
            r, y = profile(t, **k)
            pts.append((r * sinphi * S, y * S))
        out.append(catmull(pts, False))
    return out

def shade(S, spread, **k):
    """
    Srp stínu vlevo dole. Je to skutečný tvar odvozený z profilu, ne
    elipsa přilepená přes obrázek — proto sedí na každé odrůdě jinak.
    """
    T0, T1 = 0.16, math.pi - 0.04
    inner_phi = -math.pi / 2 + spread        # vnitřní hranice stínu
    outer, inner = [], []
    for i in range(18):
        t = T0 + (T1 - T0) * i / 17
        r, y = profile(t, **k)
        outer.append((-r * S, y * S))
        inner.append((r * math.sin(inner_phi) * S, y * S))
    return catmull(outer + list(reversed(inner)), True)

V = [
  dict(slug="hokkaido", name="Hokaido", latin="Cucurbita maxima", ribs=9,
       use="polévka, pečení i se slupkou", weight="1–2 kg",
       k=dict(A=1.16, B=0.86, p=0.58, pear=0.04, scallop=0.0, lobes=0)),
  dict(slug="maslova", name="Máslová", latin="Cucurbita moschata", ribs=4,
       use="krémové polévky, pyré", weight="1–3 kg",
       k=dict(A=0.62, B=1.30, p=0.34, pear=0.95, scallop=0.0, lobes=0)),
  dict(slug="halloweenska", name="Halloweenská", latin="Cucurbita pepo", ribs=11,
       use="vyřezávání, dekorace", weight="4–8 kg",
       k=dict(A=1.12, B=0.94, p=0.52, pear=0.02, scallop=0.030, lobes=7)),
  dict(slug="muskatova", name="Muškátová", latin="Cucurbita moschata", ribs=10,
       use="vaření, sladké i slané", weight="3–10 kg",
       k=dict(A=1.34, B=0.62, p=0.44, pear=0.0, scallop=0.055, lobes=6)),
  dict(slug="turban", name="Turbán", latin="Cucurbita maxima", ribs=9,
       use="dekorace, plnění", weight="1–2 kg",
       k=dict(A=1.30, B=0.52, p=0.36, pear=0.34, scallop=0.030, lobes=4),
       # Turbán má na sobě druhý, menší plod — bez čepice to není turbán.
       cap=dict(A=0.62, B=0.42, p=0.55, pear=-0.10, scallop=0.0, lobes=0)),
  dict(slug="spagetova", name="Špagetová", latin="Cucurbita pepo", ribs=5,
       use="dužina se rozpadá na nitě", weight="1–2 kg",
       k=dict(A=0.78, B=1.14, p=0.42, pear=0.16, scallop=0.0, lobes=0)),
  dict(slug="patison", name="Patison", latin="Cucurbita pepo", ribs=9,
       use="smažení, grilování, plnění", weight="0,3–1 kg",
       k=dict(A=1.34, B=0.40, p=0.26, pear=0.0, scallop=0.055, lobes=4)),
  dict(slug="olejna", name="Dýně olejná", latin="Cucurbita pepo var. styriaca", ribs=8,
       use="nahá semínka, olej", weight="4–6 kg",
       k=dict(A=1.10, B=0.92, p=0.60, pear=0.05, scallop=0.018, lobes=5)),
  dict(slug="obri", name="Obří dýně", latin="Cucurbita maxima", ribs=13,
       use="výstava, soutěže", weight="30–200 kg",
       k=dict(A=1.30, B=0.78, p=0.46, pear=0.10, scallop=0.040, lobes=8)),
]

S = 44.0
out = []
for v in V:
    k = v["k"]
    top_r, top_y = profile(0.30, **k)
    out.append(dict(
        slug=v["slug"], name=v["name"], latin=v["latin"],
        use=v["use"], weight=v["weight"],
        outline=outline(S, **k), ribs=ribs(S, v["ribs"], **k),
        shade=shade(S, 1.32, **k), shadeMid=shade(S, 1.72, **k), shadeDeep=shade(S, 0.72, **k),
        cap=(outline(S * 0.86, **v["cap"]) if v.get("cap") else None),
        capRibs=(ribs(S * 0.86, 5, **v["cap"]) if v.get("cap") else None),
        capY=(round(-k["B"] * S + v["cap"]["B"] * S * 0.86 * 0.42, 1) if v.get("cap") else None),
        # Jamka, do které dosedá stopka — bez ní stopka jen visí ve vzduchu.
        wellR=round(top_r * S, 1), wellY=round(top_y * S, 1),
    ))

ts = """// SOUBOR JE GENEROVANÝ — needitovat ručně.
// Zdroj: scripts/gen-gourds.py  (`pnpm gen:gourds`)
//
// Tělo je rotační plocha; žebra jsou poledníky rovnoměrně rozdělené po délce,
// takže se u okraje samy zahušťují a tvar čte jako trojrozměrný.

export interface Gourd {
  slug: string;
  /** Český název, jak ho používají na statku. */
  name: string;
  latin: string;
  /** Na co se odrůda hodí — text z popisek ve stodole. */
  use: string;
  weight: string;
  /** Uzavřená silueta se středem v [0,0]. */
  outline: string;
  /** Poledníková žebra. */
  ribs: string[];
  /** Tři pásma stínu vlevo dole, odvozená z profilu daného tvaru.
      Tři kroky místo jednoho — jinak přechod vypadá jako nalepený pruh. */
  shade: string;
  shadeMid: string;
  shadeDeep: string;
  /** Jamka pro stopku: poloměr a výška. */
  wellR: number;
  wellY: number;
  /** Turbán nese druhý, menší plod. Ostatní odrůdy mají null. */
  cap: string | null;
  capRibs: string[] | null;
  capY: number | null;
}

export const GOURDS: Gourd[] = %s;

export const GOURD_BY_SLUG = Object.fromEntries(
  GOURDS.map((g) => [g.slug, g]),
) as Record<string, Gourd>;
""" % json.dumps(out, ensure_ascii=False, separators=(",", ":"))

open("src/lib/illustrations/gourds.ts", "w").write(ts)
print("varieties:", len(out), "| bytes:", len(ts))
