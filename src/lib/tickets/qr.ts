/**
 * Vykreslení QR kódů do SVG.
 *
 * Záměrně SVG a ne PNG: vstupenka se tiskne doma na jehličkové tiskárně stejně
 * často jako se ukazuje z displeje, a vektor přežije obojí. Navíc jde vložit
 * přímo do HTML e-mailu i do stránky bez dalšího requestu.
 */
import QRCode from 'qrcode';

export type QrOptions = {
  /** Šířka v px zapsaná do SVG; CSS ji stejně může přebít. */
  width?: number;
  margin?: number;
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
};

/**
 * `errorCorrectionLevel: 'M'` je záměrný kompromis – 'H' by kód zahustil
 * a čtečka v šeru u brány si pak na papíru s otiskem prstu neporadí.
 */
export async function qrSvg(data: string, options: QrOptions = {}): Promise<string> {
  return QRCode.toString(data, {
    type: 'svg',
    width: options.width ?? 320,
    margin: options.margin ?? 1,
    errorCorrectionLevel: options.errorCorrectionLevel ?? 'M',
  });
}

/** QR s podepsaným tokenem vstupenky (viz `./token`). */
export async function ticketQrSvg(token: string, options: QrOptions = {}): Promise<string> {
  return qrSvg(token, options);
}
