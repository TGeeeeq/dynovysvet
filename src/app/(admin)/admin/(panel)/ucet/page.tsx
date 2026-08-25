import { redirect } from "next/navigation";
import { activeSessions, describeDevice, getAccount } from "@/lib/admin/accounts";
import { dateTime } from "@/lib/admin/format";
import { PASSWORD_POLICY } from "@/lib/admin/password";
import { getAdminSession, LOGIN_PATH } from "@/lib/admin/session";
import { hasDatabaseUrl } from "@/lib/db/client";
import {
  AccountNameForm,
  AccountPasswordForm,
  AccountRevokeOthers,
} from "@/components/admin/AccountForms";
import { Badge, Empty, Hint, Notice, PageTitle, SectionTitle, Table, Td } from "@/components/admin/ui";

export const metadata = { title: "Můj účet" };

type Search = Record<string, string | string[] | undefined>;

/** Z parametru v adrese bereme vždy jen jednu hodnotu — pole by nám tu bylo k ničemu. */
function one(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function pocet(value: string | undefined): number {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 0;
}

/** Jednotné číslo se v češtině liší, množné je pro dvě i pro deset stejné. */
function zarizeni(n: number): string {
  return n === 1 ? "jedno zařízení" : `${n} zařízení`;
}

/**
 * Můj účet — jméno, heslo a přehled toho, kde všude jsem přihlášený.
 *
 * Pořadí sekcí není pevné: kdo má vynucenou změnu hesla (první přihlášení
 * po založení účtu), dostane formulář na heslo hned nahoru. Všechno ostatní
 * počká, dokud si heslo nezmění.
 */
export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const session = await getAdminSession();
  if (!session) redirect(LOGIN_PATH);

  const sp = await searchParams;
  // Čerstvá data z databáze, ne ze session: ta je v rámci requestu cachovaná
  // a po uložení jména by ukázala ještě to staré.
  const account = (await getAccount(session.user.id)) ?? session.user;
  const devices = await activeSessions(session.user.id);

  const others = devices.filter((d) => d.id !== session.sessionId).length;
  const musiZmenit = account.mustChangePassword || one(sp.zmenit) === "1";

  const heslo = (
    <section
      id="heslo"
      className={musiZmenit ? "border-l-2 border-pumpkin pl-5" : undefined}
    >
      <SectionTitle>Změna hesla</SectionTitle>
      <div className="mt-4 max-w-md">
        <p className="text-[0.95rem] text-ink-soft">Nové heslo musí splňovat tohle:</p>
        <ul className="mt-2 space-y-1 text-[0.88rem] text-ink-faint">
          <li>alespoň {PASSWORD_POLICY.minLength} znaků, čím delší, tím lepší,</li>
          <li>alespoň dva druhy znaků — písmena, číslice nebo interpunkce,</li>
          <li>bez mezery na začátku a na konci,</li>
          <li>žádné běžné výrazy jako „heslo", „admin" nebo „dynovysvet".</li>
        </ul>
        <Hint>
          Nejjistější je krátká věta, kterou si pamatujete jen vy — třeba
          „Tři dýně u stodoly!". Delší heslo je vždycky lepší než složitější.
        </Hint>
      </div>
      <AccountPasswordForm email={account.email} />
      <Hint>
        Po změně hesla vás odhlásíme ze všech ostatních zařízení. Tady, kde
        heslo měníte, zůstanete přihlášení.
      </Hint>
    </section>
  );

  return (
    <div className="space-y-14">
      <PageTitle
        title="Můj účet"
        hint="Jméno, heslo a zařízení, ze kterých jste přihlášení."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">
          Databáze zatím není připojená. Nic se nedá načíst ani uložit.
        </Notice>
      )}

      {musiZmenit && (
        <Notice tone="bad">
          Máte heslo, které vám někdo nastavil. Než budete pokračovat, změňte si
          ho na vlastní — nikdo jiný ho pak nebude znát.
        </Notice>
      )}

      {one(sp.ulozeno) === "jmeno" && <Notice>Jméno je uložené.</Notice>}

      {one(sp.zmeneno) !== undefined && (
        <Notice>
          Heslo je změněné.{" "}
          {pocet(one(sp.zmeneno)) > 0
            ? `Zároveň jsme odhlásili ${zarizeni(pocet(one(sp.zmeneno)))} — kdo byl přihlášený jinde, musí se přihlásit znovu s novým heslem.`
            : "Jinde jste přihlášení nebyli, odhlašovat se tedy nic nemuselo."}
        </Notice>
      )}

      {one(sp.odhlaseno) !== undefined && (
        <Notice>
          {pocet(one(sp.odhlaseno)) > 0
            ? `Odhlásili jsme ${zarizeni(pocet(one(sp.odhlaseno)))}. Tady zůstáváte přihlášení.`
            : "Žádné další zařízení přihlášené nebylo."}
        </Notice>
      )}

      {musiZmenit && heslo}

      <section>
        <SectionTitle>Kdo jste</SectionTitle>
        <dl className="mt-5 grid gap-x-10 gap-y-5 sm:grid-cols-2">
          <div className="border-t-2 border-ink/15 pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">Jméno</dt>
            <dd className="mt-1.5 text-[1.05rem]">{account.name || "—"}</dd>
          </div>
          <div className="border-t-2 border-ink/15 pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">E-mail</dt>
            <dd className="mt-1.5 text-[1.05rem]">{account.email}</dd>
          </div>
          <div className="border-t-2 border-ink/15 pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">Role</dt>
            <dd className="mt-1.5 text-[1.05rem]">
              {account.role === "majitel" ? "majitel" : "obsluha"}
            </dd>
          </div>
          <div className="border-t-2 border-ink/15 pt-3">
            <dt className="text-[0.7rem] uppercase tracking-[0.2em] text-ink-faint">
              Poslední přihlášení
            </dt>
            <dd className="tabular mt-1.5 text-[1.05rem]">
              {account.lastLoginAt ? dateTime(account.lastLoginAt) : "—"}
            </dd>
          </div>
        </dl>
        <Hint>
          E-mail ani roli si tady změnit nejde — o to musí požádat majitele.
        </Hint>
      </section>

      <section>
        <SectionTitle>Jméno</SectionTitle>
        <AccountNameForm jmeno={account.name ?? ""} />
      </section>

      {!musiZmenit && heslo}

      <section>
        <SectionTitle>Přihlášená zařízení</SectionTitle>
        <p className="mt-4 max-w-2xl text-[0.95rem] text-ink-soft">
          Každé přihlášení platí dvanáct hodin a pak samo vyprší. Když v seznamu
          uvidíte něco, co nepoznáváte, odhlaste ostatní zařízení a změňte si heslo.
        </p>

        <div className="mt-5">
          {devices.length === 0 ? (
            <Empty>Žádné živé přihlášení tu není.</Empty>
          ) : (
            <Table head={["Zařízení", "Přihlášeno", "Naposledy tu bylo", "Odkud"]}>
              {devices.map((d) => (
                <tr key={d.id}>
                  <Td>
                    <span className="block">{describeDevice(d.userAgent)}</span>
                    {d.id === session.sessionId && (
                      <span className="mt-1 inline-block">
                        <Badge tone="ok">toto zařízení</Badge>
                      </span>
                    )}
                  </Td>
                  <Td className="tabular whitespace-nowrap">{dateTime(d.createdAt)}</Td>
                  <Td className="tabular whitespace-nowrap">{dateTime(d.lastSeenAt)}</Td>
                  <Td className="tabular">{d.ip ?? "—"}</Td>
                </tr>
              ))}
            </Table>
          )}
        </div>

        <AccountRevokeOthers ostatnich={others} />
        <Hint>
          {others === 0
            ? "Jinde přihlášení nejste, není co odhlašovat."
            : "Ostatní zařízení se budou muset přihlásit znovu. Tady zůstanete."}
        </Hint>
      </section>
    </div>
  );
}
