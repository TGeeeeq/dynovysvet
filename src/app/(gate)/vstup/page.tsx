import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { Stamp } from "@/components/site/Stamp";
import { AFLogo } from "@/components/site/AFLogo";
import { GateForm } from "@/components/site/GateForm";
import {
  GATE_COOKIE,
  RETURN_PARAM,
  hasValidGateToken,
  isGateEnabled,
  safeReturnPath,
} from "@/lib/security/site-gate";

export const metadata = { title: "Zatím jen pro zvané" };
// Čte cookie a parametr z adresy — předgenerovat nejde a ani se nesmí.
export const dynamic = "force-dynamic";

export default async function GatePage({ searchParams }: PageProps<"/vstup">) {
  const params = await searchParams;
  const raw = params[RETURN_PARAM];
  const target = safeReturnPath(Array.isArray(raw) ? raw[0] : raw);

  // Otevřený web žádný zámek nemá; stránka by na něm byla jen matoucí slepá
  // ulička (a v navigaci na ni nikde nevede odkaz).
  if (!isGateEnabled()) redirect("/");

  // Kdo už jednou heslo zadal, nemá ho zadávat znovu — třeba když si adresu
  // `/vstup` uložil do záložek.
  const jar = await cookies();
  if (await hasValidGateToken(jar.get(GATE_COOKIE)?.value)) redirect(target);

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Stamp size={110} className="text-ink/85" />
          <h1 className="font-display mt-8 text-3xl font-semibold">Ještě jsme neotevřeli</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">
            Nový web Dýňového světa se dodělává. Máte-li heslo, zadejte ho a pojďte
            se podívat.
          </p>
        </div>

        <GateForm target={target} />

        <p lang="en" className="mt-10 text-center text-[0.8rem] text-ink-faint/85">
          The site is not open to the public yet. Enter the password to continue.
        </p>

        <div className="mt-10 flex justify-center">
          <a
            href="https://www.antoninfigueroa.cz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Web vytvořil Antonín Figueroa"
            className="group inline-flex"
          >
            <AFLogo
              size={44}
              className="ring-1 ring-[#d4a45a]/20 transition duration-500 ease-out group-hover:scale-105 group-hover:ring-[#d4a45a]/45 group-hover:shadow-[0_0_22px_rgba(212,164,90,0.28)]"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
