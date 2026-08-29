import { IntroStage } from "./IntroStage";
import type { Locale } from "@/lib/i18n/config";

/**
 * Rozhodnutí, jestli se intro vůbec hraje, musí padnout dřív, než prohlížeč
 * vykreslí první snímek — jinak se překryv na okamžik mihne i tomu, kdo ho
 * dnes už viděl.
 *
 * Proto synchronní inline skript hned nad překryvem, ne `useEffect`. Skript
 * nastaví na `<html>` atribut `data-intro` a CSS podle něj překryv buď ukáže,
 * nebo ho vůbec nezobrazí. Atribut, ne třída: `className` na `<html>`
 * vykresluje React a cizí zásah do něj by při hydrataci hlásil neshodu. Když JavaScript selže nebo je vypnutý, nestane se nic — výchozí
 * stav překryvu je `display: none`.
 *
 * Pojistka na konci: překryv drží zamčený scroll, takže kdyby se animace
 * jakkoli zasekla, po dvaceti sekundách se zámek uvolní sám. Za normálního
 * běhu je do té doby intro dávno pryč.
 */
const GATE = `try{var d=document.documentElement,s=1;
try{s=sessionStorage.getItem('dvs-intro')!=='1'}catch(e){}
if(s&&!matchMedia('(prefers-reduced-motion: reduce)').matches){d.dataset.intro='open';
setTimeout(function(){d.dataset.intro='done'},20000)}
else{d.dataset.intro='done'}}catch(e){}`;

export function PumpkinIntro({ locale }: { locale: Locale }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: GATE }} />
      <IntroStage locale={locale} />
    </>
  );
}
