import type { Metadata } from "next";
import { SectionHead } from "@/components/ui/SectionHead";
import { InquiryForm } from "@/components/ui/InquiryForm";
import { Stamp } from "@/components/site/Stamp";
import { FARM } from "@/content/farm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Statek u Pipků, Nová Ves u Leštiny 5. Dostanete se k nám autem i vlakem — vlaková zastávka je 200 m od statku, parkování zdarma.",
};

/** Výřez mapy kolem statku. Malý bbox, ať je vidět i příjezd a parkoviště. */
const BBOX = [15.3942, 49.7812, 15.4142, 49.7912].join("%2C");
const OSM_EMBED = `https://www.openstreetmap.org/export/embed.html?bbox=${BBOX}&layer=mapnik&marker=${FARM.gps.lat}%2C${FARM.gps.lng}`;
const OSM_LINK = `https://www.openstreetmap.org/?mlat=${FARM.gps.lat}&mlon=${FARM.gps.lng}#map=16/${FARM.gps.lat}/${FARM.gps.lng}`;

export default function ContactPage() {
  return (
    <>
      <div className="mx-auto max-w-[88rem] px-5 py-14 sm:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.2fr_auto] lg:items-start">
        <div>
          <p className="tabular text-[0.76rem] uppercase tracking-[0.34em] text-pumpkin">
            Nová Ves u Leštiny · Vysočina
          </p>
          <h1 className="font-display letterpress mt-5 max-w-3xl text-balance text-[clamp(2.4rem,7vw,5rem)] font-semibold">
            Dostanete se k nám autem i vlakem
          </h1>
        </div>
        <Stamp size={104} className="hidden text-ink/75 lg:block" />
      </div>

      <div className="mt-16 grid gap-14 lg:grid-cols-[22rem_1fr] lg:items-start">
        <div>
          <h2 className="text-[0.74rem] uppercase tracking-[0.28em] text-ink-faint">Statek u Pipků</h2>
          <address className="mt-4 space-y-1 text-lg not-italic leading-relaxed">
            <p>{FARM.street}</p>
            <p>{FARM.zip} Nová Ves u Leštiny</p>
          </address>
          <ul className="mt-6 space-y-2 text-lg">
            <li>
              <a href={`tel:${FARM.phone}`} className="tabular border-b-2 border-pumpkin/40 transition-colors hover:border-pumpkin hover:text-pumpkin">
                {FARM.phoneHuman}
              </a>
            </li>
            <li>
              <a href={`mailto:${FARM.email}`} className="border-b-2 border-pumpkin/40 transition-colors hover:border-pumpkin hover:text-pumpkin">
                {FARM.email}
              </a>
            </li>
            <li>
              <a href={FARM.facebook} target="_blank" rel="noreferrer noopener"
                 className="border-b-2 border-pumpkin/40 transition-colors hover:border-pumpkin hover:text-pumpkin">
                Facebook
              </a>
            </li>
          </ul>

          <dl className="mt-10 space-y-5">
            <div className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">Vlakem</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-soft">
                Přímo v Nové Vsi u Leštiny je vlaková zastávka. Ujdete pár metrů
                do kopce a jste u nás na statku.
              </dd>
            </div>
            <div className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">Autem</dt>
              <dd className="mt-1.5 leading-relaxed text-ink-soft">
                Parkování je označené směrovými tabulemi, cca 50 m od statku.
                Zdarma.
              </dd>
            </div>
            <div className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">Souřadnice</dt>
              <dd className="tabular mt-1.5 space-y-0.5 text-[0.92rem] text-ink-soft">
                <p>statek {FARM.gps.lat}, {FARM.gps.lng}</p>
                <p>parkoviště {FARM.gpsParking.lat}, {FARM.gpsParking.lng}</p>
              </dd>
            </div>
            <div className="border-t border-ink/15 pt-3">
              <dt className="text-[0.74rem] uppercase tracking-[0.2em] text-ink-faint">Wi-Fi</dt>
              <dd className="mt-1.5 text-ink-soft">V celém areálu zdarma.</dd>
            </div>
          </dl>
        </div>

        <figure>
          {/* OpenStreetMap místo Google Maps: nepotřebuje souhlas s cookies
              a nesleduje návštěvníky, takže nekomplikuje GDPR lištu. */}
          <iframe
            src={OSM_EMBED}
            title="Mapa — Statek u Pipků, Nová Ves u Leštiny 5"
            loading="lazy"
            className="aspect-[4/3] w-full border-2 border-ink/15 grayscale-[0.35] sepia-[0.18]"
          />
          <figcaption className="mt-3 text-[0.86rem] text-ink-faint">
            <a href={OSM_LINK} target="_blank" rel="noreferrer noopener"
               className="border-b border-ink/25 hover:border-pumpkin hover:text-pumpkin">
              Otevřít mapu ve větším
            </a>
          </figcaption>
        </figure>
      </div>

      </div>

      {/* Formulář si nese vlastní plnou šířku i podklad, proto stojí mimo
          kontejner stránky. */}
      <InquiryForm
        kind="obecny"
        plate="I"
        title="Napište nám"
        lead="Na e-maily odpovídáme obvykle do druhého dne. Když spěcháte, zavolejte."
        fields={{ phone: true, message: { label: "Zpráva" } }}
        submitLabel="Odeslat"
      />

      <section className="mx-auto max-w-[88rem] px-5 py-16 sm:px-8">
        <SectionHead plate="II" title="Fakturační údaje" />
        <dl className="tabular mt-8 grid gap-x-12 gap-y-4 text-[0.94rem] sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Provozovatel", `${FARM.owner}, IČ ${FARM.ico}`],
            ["Sídlo", `${FARM.street}, ${FARM.zip}`],
            ["Bankovní účet", FARM.bankAccount],
            ["Lesní programy", `${FARM.spolek}, IČO ${FARM.icoSpolek}`],
          ].map(([k, v]) => (
            <div key={k} className="border-t border-ink/15 pt-3">
              <dt className="text-[0.72rem] uppercase tracking-[0.2em] text-ink-faint">{k}</dt>
              <dd className="mt-1.5 text-ink-soft">{v}</dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
