import Link from "next/link";
import { Stamp } from "./Stamp";
import { FARM } from "@/content/farm";

export function Footer() {
  return (
    <footer className="mt-32 border-t-2 border-ink/15 bg-paper-deep/60">
      <div className="mx-auto grid max-w-[88rem] gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[auto_1fr_1fr_1fr]">
        <div className="max-w-56">
          <Stamp size={92} className="text-ink/80" />
        </div>

        <div>
          <h2 className="font-display text-lg font-semibold">Kde nás najdete</h2>
          <address className="mt-3 space-y-1 text-[0.94rem] not-italic leading-relaxed text-ink-soft">
            <p>{FARM.street}</p>
            <p>{FARM.zip} Nová Ves u Leštiny</p>
            <p className="pt-2">
              <a className="underline decoration-pumpkin underline-offset-4" href={`tel:${FARM.phone}`}>
                {FARM.phoneHuman}
              </a>
            </p>
            <p>
              <a className="underline decoration-pumpkin underline-offset-4" href={`mailto:${FARM.email}`}>
                {FARM.email}
              </a>
            </p>
          </address>
          <p className="mt-4 text-[0.86rem] text-ink-faint">
            Vlaková zastávka Nová Ves u Leštiny je 200 m od statku.
          </p>
        </div>

        <nav aria-label="Patička" className="text-[0.94rem]">
          <h2 className="font-display text-lg font-semibold">Na statku</h2>
          <ul className="mt-3 space-y-1.5 text-ink-soft">
            {[
              ["/dynovy-svet", "Dýňový svět"],
              ["/vstupenky", "Vstupenky"],
              ["/skoly", "Školy a skupiny dětí"],
              ["/statek", "Pronájem statku"],
              ["/blesi-trh", "Dětský bleší trh"],
              ["/recepty", "Recepty z dýní"],
              ["/pestovani", "Rady na pěstování"],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="hover:text-ink hover:underline underline-offset-4">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="text-[0.94rem]">
          <h2 className="font-display text-lg font-semibold">Provozovatel</h2>
          <div className="mt-3 space-y-1.5 text-ink-soft">
            <p>{FARM.owner}, IČ {FARM.ico}</p>
            <p className="text-[0.86rem] text-ink-faint">
              Zemědělský podnikatel, plátce DPH.
            </p>
            <p className="pt-2 text-[0.86rem] text-ink-faint">
              Lesní programy provozuje {FARM.spolek}, IČO {FARM.icoSpolek}.
            </p>
          </div>
          <ul className="mt-4 space-y-1.5 text-ink-soft">
            <li>
              <a href={FARM.facebook} className="hover:text-ink hover:underline underline-offset-4"
                 rel="noreferrer noopener" target="_blank">
                Facebook
              </a>
            </li>
            <li><Link href="/obchodni-podminky" className="hover:text-ink hover:underline underline-offset-4">Obchodní podmínky</Link></li>
            <li><Link href="/ochrana-soukromi" className="hover:text-ink hover:underline underline-offset-4">Ochrana soukromí</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-ink/10">
        <div className="mx-auto flex max-w-[88rem] flex-wrap items-center gap-x-6 gap-y-2 px-5 py-5 text-[0.8rem] text-ink-faint sm:px-8">
          <p>© {new Date().getFullYear()} {FARM.name}</p>
          <p className="ml-auto">
            Spolupracujeme:{" "}
            <a href="https://www.kudyznudy.cz/" className="underline underline-offset-4" rel="noreferrer noopener" target="_blank">Kudy z nudy</a>
            {" · "}
            <a href="https://www.szif.cz" className="underline underline-offset-4" rel="noreferrer noopener" target="_blank">Program rozvoje venkova</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
