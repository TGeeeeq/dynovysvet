import { listAccounts } from "@/lib/admin/accounts";
import { dateTime } from "@/lib/admin/format";
import { requireRole } from "@/lib/admin/session";
import { hasDatabaseUrl } from "@/lib/db/client";
import { UserCreateForm, UserRowActions } from "@/components/admin/UserForms";
import { Badge, Empty, Hint, Notice, PageTitle, SectionTitle, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Kdo má přístup" };

/**
 * Seznam lidí, kteří se smí přihlásit do správy webu.
 *
 * Stránka je jen pro majitele — `requireRole('majitel')` hned na začátku.
 * Obsluze se neukáže ani náznakem, že něco takového existuje (`notFound()`
 * uvnitř stráže), a stejnou kontrolou začíná každá akce.
 */
export default async function UsersPage() {
  const me = await requireRole("majitel");
  const accounts = await listAccounts();
  const now = Date.now();

  return (
    <div className="space-y-14">
      <PageTitle
        title="Kdo má přístup"
        hint="Lidé, kteří se smí přihlásit do správy webu. Každý svým e-mailem a svým heslem — společný účet se v záznamu změn nedá rozpoznat."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená, seznam se nemá odkud načíst.
        </Notice>
      )}

      <section>
        <SectionTitle>Lidé</SectionTitle>
        <div className="mt-5">
          {accounts.length === 0 ? (
            <Empty>Zatím tu nikdo není.</Empty>
          ) : (
            <Table
              head={["Jméno", "E-mail", "Role", "Poslední přihlášení", "Stav", "Co s tím"]}
            >
              {accounts.map((a) => {
                const zamceny = Boolean(a.lockedUntil && a.lockedUntil.getTime() > now);
                return (
                  <tr key={a.id}>
                    <Td>{a.name || "—"}</Td>
                    <Td className="break-all">{a.email}</Td>
                    <Td>{a.role === "majitel" ? "majitel" : "obsluha"}</Td>
                    <Td className="tabular whitespace-nowrap">
                      {a.lastLoginAt ? dateTime(a.lastLoginAt) : "zatím nikdy"}
                    </Td>
                    <Td>
                      {a.disabledAt ? (
                        <Badge tone="bad">zablokovaný</Badge>
                      ) : zamceny ? (
                        <Badge tone="warn">dočasně zamčený</Badge>
                      ) : (
                        <Badge tone="ok">aktivní</Badge>
                      )}
                      {zamceny && a.lockedUntil && (
                        <span className="tabular mt-1 block text-[0.8rem] text-ink-faint">
                          po {a.failedAttempts} neúspěšných pokusech, do {dateTime(a.lockedUntil)}
                        </span>
                      )}
                      {!a.disabledAt && a.mustChangePassword && (
                        <span className="mt-1 block text-[0.8rem] text-ink-faint">
                          ještě si nezměnil počáteční heslo
                        </span>
                      )}
                    </Td>
                    <Td>
                      <UserRowActions
                        id={a.id}
                        role={a.role}
                        zablokovany={Boolean(a.disabledAt)}
                        zamceny={zamceny}
                        jaSam={a.id === me.id}
                      />
                    </Td>
                  </tr>
                );
              })}
            </Table>
          )}
        </div>

        <Hint>
          Přístup se nemaže, jen blokuje. Pod jménem každého z nich jsou podepsané
          záznamy v přehledu změn a odbavené vstupenky u brány; smazáním účtu by
          se z téhle historie stala anonymní hromada. Zablokovaný člověk se
          nepřihlásí a hned přijde i o všechna otevřená přihlášení.
        </Hint>
        <Hint>
          Dočasné zamčení si systém dělá sám po pěti špatných heslech za sebou
          a samo po čtvrthodině povolí. „Odemknout" je pro případ, že někdo
          stojí u brány a čekat nemůže.
        </Hint>
      </section>

      <section>
        <SectionTitle>Přidat člověka</SectionTitle>
        <p className="mt-4 max-w-2xl text-[0.95rem] text-ink-soft">
          Heslo vymyslí server, ne vy — vygeneruje se při založení a ukáže se
          jednou. Předejte ho osobně nebo telefonem; při prvním přihlášení si
          ho ten člověk stejně musí změnit na vlastní.
        </p>
        <UserCreateForm />
      </section>
    </div>
  );
}
