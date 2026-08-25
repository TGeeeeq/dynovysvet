import Link from "next/link";
import {
  auditActionLabel,
  auditActionsInUse,
  auditEntityLabel,
  AUDIT_PAGE_SIZE,
  listAccounts,
  listAudit,
} from "@/lib/admin/accounts";
import { dateTime } from "@/lib/admin/format";
import { requireRole } from "@/lib/admin/session";
import { hasDatabaseUrl } from "@/lib/db/client";
import {
  Button,
  Empty,
  Hint,
  LABEL_CLASS,
  Notice,
  PageTitle,
  SectionTitle,
  Table,
  Td,
} from "@/components/admin/ui";

export const metadata = { title: "Záznam změn" };

type Search = Record<string, string | string[] | undefined>;

function one(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v && v.length > 0 ? v : undefined;
}

const SELECT_CLASS =
  "mt-2 block w-full appearance-none border-0 border-b-2 border-ink/20 bg-transparent px-0 py-2.5 text-[1rem] text-ink focus:border-pumpkin focus:outline-none";

/** Odkaz na jinou stránku výpisu se stejným filtrem. */
function pageHref(sp: { akce?: string; kdo?: string }, strana: number): string {
  const params = new URLSearchParams();
  if (sp.akce) params.set("akce", sp.akce);
  if (sp.kdo) params.set("kdo", sp.kdo);
  if (strana > 1) params.set("strana", String(strana));
  const query = params.toString();
  return query ? `/admin/zaznamy?${query}` : "/admin/zaznamy";
}

/**
 * Záznam změn — jen pro majitele.
 *
 * Filtr je celý v adrese a formulář se odesílá metodou GET. Odkaz na
 * vyfiltrovaný výpis se tak dá poslat nebo uložit do záložek a stránka
 * nepotřebuje ani řádek stavu v prohlížeči.
 */
export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  await requireRole("majitel");

  const sp = await searchParams;
  const akce = one(sp.akce);
  const kdo = one(sp.kdo);
  const strana = Number(one(sp.strana) ?? "1");

  const [zaznamy, akceVSeznamu, lide] = await Promise.all([
    listAudit({ action: akce, adminUserId: kdo, page: Number.isFinite(strana) ? strana : 1 }),
    auditActionsInUse(),
    listAccounts(),
  ]);

  const filtr = { akce, kdo };
  const prvni = (zaznamy.page - 1) * AUDIT_PAGE_SIZE + 1;
  const posledni = Math.min(zaznamy.page * AUDIT_PAGE_SIZE, zaznamy.total);

  return (
    <div className="space-y-12">
      <PageTitle
        title="Záznam změn"
        hint="Kdo se přihlásil, kdo změnil cenu, kdo zrušil objednávku a kdy. Existuje kvůli tomu, aby se to dalo zpětně dohledat — ne aby někdo někoho hlídal, ale aby při sporu se zákazníkem nebo při chybě bylo z čeho vyjít."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená, záznamy se nemají odkud načíst.
        </Notice>
      )}

      <section>
        <SectionTitle>Vyhledávání</SectionTitle>
        {/* Metoda GET schválně: filtr patří do adresy, ne do paměti stránky. */}
        <form method="get" className="mt-5 grid gap-6 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label htmlFor="akce" className={LABEL_CLASS}>
              Co se dělo
            </label>
            <select id="akce" name="akce" defaultValue={akce ?? ""} className={SELECT_CLASS}>
              <option value="">všechno</option>
              {akceVSeznamu.map((a) => (
                <option key={a} value={a}>
                  {auditActionLabel(a)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="kdo" className={LABEL_CLASS}>
              Kdo
            </label>
            <select id="kdo" name="kdo" defaultValue={kdo ?? ""} className={SELECT_CLASS}>
              <option value="">kdokoli</option>
              {lide.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name || p.email}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-5">
            <Button type="submit">Vyhledat</Button>
            {(akce || kdo) && (
              <Link href="/admin/zaznamy" className="text-[0.88rem] underline-offset-4 hover:underline">
                Zrušit filtr
              </Link>
            )}
          </div>
        </form>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <SectionTitle>
            {zaznamy.total === 0
              ? "Nic k zobrazení"
              : `Záznamy ${prvni}–${posledni} z ${zaznamy.total}`}
          </SectionTitle>
          {zaznamy.pageCount > 1 && (
            <span className="tabular text-[0.84rem] text-ink-faint">
              strana {zaznamy.page} z {zaznamy.pageCount}
            </span>
          )}
        </div>

        <div className="mt-5">
          {zaznamy.rows.length === 0 ? (
            <Empty>
              {akce || kdo
                ? "Tomuhle hledání nic neodpovídá."
                : "Zatím se nic nezaznamenalo."}
            </Empty>
          ) : (
            <Table head={["Kdy", "Kdo", "Co", "Čeho se to týkalo", "Odkud", "Podrobnosti"]}>
              {zaznamy.rows.map((r) => (
                <tr key={r.id}>
                  <Td className="tabular whitespace-nowrap">{dateTime(r.createdAt)}</Td>
                  <Td>{r.userName || r.userEmail || "—"}</Td>
                  <Td>{auditActionLabel(r.action)}</Td>
                  <Td>
                    {r.entity ? (
                      <>
                        <span className="block">{auditEntityLabel(r.entity)}</span>
                        {r.entityId && (
                          <span className="tabular block break-all text-[0.78rem] text-ink-faint">
                            {r.entityId}
                          </span>
                        )}
                      </>
                    ) : (
                      "—"
                    )}
                  </Td>
                  <Td className="tabular">{r.ip ?? "—"}</Td>
                  <Td>
                    {r.detail == null ? (
                      "—"
                    ) : (
                      // Vždy jako text v <pre>, nikdy jako HTML. Do detailu se
                      // dostávají i data od zákazníků a vykreslit je jako značky
                      // by z auditu udělalo díru do administrace.
                      <details>
                        <summary className="cursor-pointer text-[0.88rem] text-ink-soft underline-offset-4 hover:underline">
                          Ukázat
                        </summary>
                        <pre className="mt-2 max-w-[26rem] overflow-x-auto whitespace-pre-wrap break-all border-l-2 border-ink/15 pl-3 text-[0.8rem] leading-relaxed text-ink-soft">
                          {JSON.stringify(r.detail, null, 2)}
                        </pre>
                      </details>
                    )}
                  </Td>
                </tr>
              ))}
            </Table>
          )}
        </div>

        {zaznamy.pageCount > 1 && (
          <nav className="mt-8 flex items-center justify-between gap-4" aria-label="Stránkování">
            {zaznamy.page > 1 ? (
              <Link
                href={pageHref(filtr, zaznamy.page - 1)}
                className="text-[0.92rem] underline-offset-4 hover:underline"
              >
                ← Novější
              </Link>
            ) : (
              <span />
            )}
            {zaznamy.page < zaznamy.pageCount ? (
              <Link
                href={pageHref(filtr, zaznamy.page + 1)}
                className="text-[0.92rem] underline-offset-4 hover:underline"
              >
                Starší →
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}

        <Hint>
          Záznamy se nedají upravit ani smazat, a to je celý smysl — kdyby šly,
          nebyly by k ničemu. Po sto položkách se výpis stránkuje, nejnovější
          jsou nahoře.
        </Hint>
      </section>
    </div>
  );
}
