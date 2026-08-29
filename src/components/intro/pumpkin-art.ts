/**
 * Geometrie dýně pro úvodní animaci.
 *
 * Držíme ji mimo komponentu, protože se nemění a nemá cenu ji při každém
 * renderu procházet znovu.
 *
 * Tvar dělají laloky, ne obrys. Obrys je klidný, výrazně široký ovál —
 * dýni z něj udělá teprve stínování rýh, které se sbíhají k prohlubni u
 * stopky a ke dnu. Zubatá silueta vypadá jako broskev, ne jako dýně, a
 * vysoký ovál jako cibule; halloweenská dýně je vždycky širší než vyšší.
 */

export const VIEW_BOX = "40 112 520 486";

/** Obrys těla. Poměr stran 1,4 : 1 — dýně je zavalitá. */
export const BODY = `
M 300 208
C 384 208 458 234 498 276
C 526 306 538 342 538 380
C 538 420 524 452 496 482
C 456 524 384 550 300 550
C 216 550 144 524 104 482
C 76 452 62 420 62 380
C 62 342 74 306 102 276
C 142 234 216 208 300 208
Z`;

/**
 * Rýhy i osy laloků vycházejí ze stejné křivky — sbíhají se do prohlubně u
 * stopky a do dna. Liší se jen tím, jak moc se vyklenou do stran.
 */
const groove = (k: number) => `M 300 224 C ${300 + k} 284, ${300 + k} 498, 300 546`;

/** Rýhy mezi laloky. Čtyři výrazné, dvě u obrysu jen naznačené. */
export const RIB_PATHS: readonly string[] = [-330, -226, -104, 104, 226, 330].map(groove);
/** Jak hluboká je která rýha. Vpravo je jich vidět víc — světlo jde zleva. */
export const RIB_DEPTH: readonly number[] = [0.3, 0.46, 0.42, 0.5, 0.55, 0.42];

/** Osy laloků — kudy vede jejich nejvyšší, nejsvětlejší místo. */
export const LOBE_PATHS: readonly string[] = [-290, -172, 0, 172, 290].map(groove);
/** Kolik světla lalok dostane. Zleva shora, takže vpravo skoro nic. */
export const LOBE_LIGHT: readonly number[] = [0.14, 0.3, 0.22, 0.09, 0.035];

/** Odražené světlo na pravé hraně. Odděluje dýni od tmy za ní. */
export const RIM = "M 476 260 C 516 296 538 338 538 380 C 538 422 522 456 492 490";

/**
 * Stopka. Krátká, dřevnatá, useknutá — a hlavně nakloněná, protože rovná
 * stopka uprostřed vypadá jako knoflík.
 */
export const STEM = `
M 264 240
C 254 204 258 172 276 152
C 288 139 308 134 322 142
C 336 151 341 168 336 182
C 329 202 324 220 324 240
Z`;

/** Useknutý konec stopky. Světlejší — je to čerstvý řez, ne slupka. */
export const STEM_CUT = { cx: 306, cy: 145, rx: 27, ry: 11, rotate: -22 };

/** Žebra na stopce. Bez nich je to hladká gumová trubka. */
export const STEM_LINES: readonly string[] = [
  "M 278 238 C 270 204 274 176 288 158",
  "M 296 238 C 290 206 294 178 306 160",
  "M 312 238 C 308 208 312 182 322 166",
];

/**
 * Řezy v pořadí, ve kterém se vyřezávají, a jejich podíl na celkovém tahu.
 * Oči zaberou víc než nos — jsou první a člověk u nich teprve pochopí, že
 * se tahem něco děje.
 */
export interface Cut {
  id: string;
  d: string;
  /** Odkud kam na ose celkového postupu (0–1) se tenhle řez kreslí. */
  from: number;
  to: number;
}

export const CUTS: readonly Cut[] = [
  { id: "eye-left", d: "M 198 318 L 278 360 L 192 382 Z", from: 0.0, to: 0.26 },
  { id: "eye-right", d: "M 402 318 L 322 360 L 408 382 Z", from: 0.26, to: 0.52 },
  { id: "nose", d: "M 300 374 L 327 420 L 273 420 Z", from: 0.52, to: 0.66 },
  {
    id: "mouth",
    d: `M 176 446
        L 218 452 L 234 478 L 260 456 L 286 482
        L 300 458 L 314 482 L 340 456 L 366 478
        L 382 452 L 424 446
        C 420 486 392 512 342 520
        C 314 525 286 525 258 520
        C 208 512 180 486 176 446 Z`,
    from: 0.66,
    to: 1.0,
  },
];

/**
 * Vlásečnice na slupce. Kopírují směr laloků, jen jemněji — bez nich vypadá
 * plocha mezi rýhami jako lakovaná koule. Málo a slabě: hustý svazek čar
 * udělá z dýně cibuli.
 */
export const SKIN_LINES: readonly string[] = Array.from({ length: 13 }, (_, i) =>
  groove(-312 + i * 52),
);
