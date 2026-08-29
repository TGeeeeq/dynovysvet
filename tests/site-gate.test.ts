/**
 * Testy zámku nespuštěného webu.
 *
 * Běží bez databáze i bez serveru – zámek je čistá kryptografie nad jednou
 * proměnnou prostředí. Hlídá se tu především to, co se špatně vidí očima:
 * že se heslo nedá vyčíst z cookie, že cizí podpis neprojde a že se
 * návratová adresa nedá zneužít na přesměrování jinam.
 */
import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';

import {
  GATE_PATH,
  hasValidGateToken,
  isGateEnabled,
  isGateExempt,
  issueGateToken,
  passwordMatches,
  safeReturnPath,
  sitePassword,
} from '../src/lib/security/site-gate';

const HESLO = 'dyne-otevirame-v-zari';

function setHeslo(value: string | undefined): void {
  if (value === undefined) delete process.env.SITE_PASSWORD;
  else process.env.SITE_PASSWORD = value;
}

afterEach(() => setHeslo(undefined));

describe('zapnutí zámku', () => {
  it('bez proměnné je web otevřený', () => {
    setHeslo(undefined);
    assert.equal(isGateEnabled(), false);
    assert.equal(sitePassword(), null);
  });

  it('prázdná proměnná ani samé mezery zámek nezapnou', () => {
    setHeslo('');
    assert.equal(isGateEnabled(), false);
    setHeslo('   ');
    assert.equal(isGateEnabled(), false);
  });

  it('vyplněná proměnná zámek zapne', () => {
    setHeslo(HESLO);
    assert.equal(isGateEnabled(), true);
    assert.equal(sitePassword(), HESLO);
  });
});

describe('ověření hesla', () => {
  it('správné heslo projde, špatné ne', async () => {
    setHeslo(HESLO);
    assert.equal(await passwordMatches(HESLO), true);
    assert.equal(await passwordMatches(`${HESLO} `), false);
    assert.equal(await passwordMatches(HESLO.toUpperCase()), false);
    assert.equal(await passwordMatches(''), false);
    // Prefix správného hesla nesmí projít – jinak by šlo heslo uhádat po znacích.
    assert.equal(await passwordMatches(HESLO.slice(0, -1)), false);
  });

  it('na otevřeném webu neprojde žádné heslo, ani prázdné', async () => {
    setHeslo(undefined);
    assert.equal(await passwordMatches(''), false);
    assert.equal(await passwordMatches(HESLO), false);
  });
});

describe('token v cookie', () => {
  it('projde round-trip a neobsahuje heslo', async () => {
    setHeslo(HESLO);
    const token = await issueGateToken();
    assert.equal(await hasValidGateToken(token), true);
    assert.ok(!token.includes(HESLO), 'v tokenu nesmí být heslo');
    // Payload JWT je jen base64, ne šifra – ověřujeme i po dekódování.
    const payload = Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8');
    assert.ok(!payload.includes(HESLO));
  });

  it('token podepsaný starým heslem po změně neprojde', async () => {
    setHeslo(HESLO);
    const token = await issueGateToken();
    setHeslo('uplne-jine-heslo-2027');
    assert.equal(await hasValidGateToken(token), false);
  });

  it('poškozená, prázdná ani cizí cookie nevyhodí výjimku', async () => {
    setHeslo(HESLO);
    const token = await issueGateToken();
    for (const rozbite of ['', 'x', 'a.b.c', `${token}x`, token.slice(0, -3)]) {
      assert.equal(await hasValidGateToken(rozbite), false);
    }
    assert.equal(await hasValidGateToken(undefined), false);
    assert.equal(await hasValidGateToken(null), false);
  });

  it('na otevřeném webu se token nevydává a žádný neplatí', async () => {
    setHeslo(HESLO);
    const token = await issueGateToken();
    setHeslo(undefined);
    assert.equal(await hasValidGateToken(token), false);
    await assert.rejects(() => issueGateToken());
  });
});

describe('výjimky ze zámku', () => {
  it('pouští jen to, co musí projít', () => {
    for (const cesta of [GATE_PATH, '/admin', '/admin/prihlaseni', '/api/cron/uvolnit-rezervace', '/robots.txt']) {
      assert.equal(isGateExempt(cesta), true, cesta);
    }
  });

  it('veřejné stránky ani veřejné API výjimku nemají', () => {
    for (const cesta of ['/', '/vstupenky', '/en/tickets', '/api/dostupnost', '/api/poptavka', '/sitemap.xml']) {
      assert.equal(isGateExempt(cesta), false, cesta);
    }
  });

  it('podobně vypadající cesta výjimku nedostane', () => {
    // `/adminx` není administrace a `/api/cronx` není cron.
    assert.equal(isGateExempt('/adminstrace'), false);
    assert.equal(isGateExempt('/api/cronx'), false);
    // `/vstupenky` začíná stejně jako `/vstup`, ale je to veřejná stránka.
    assert.equal(isGateExempt('/vstupenky'), false);
  });
});

describe('návratová adresa', () => {
  it('vrací cestu na vlastní web včetně parametrů', () => {
    assert.equal(safeReturnPath('/vstupenky'), '/vstupenky');
    assert.equal(safeReturnPath('/en/tickets?den=2026-09-26'), '/en/tickets?den=2026-09-26');
  });

  it('cizí a nesmyslnou adresu zahodí na titulku', () => {
    for (const zle of [
      '//zlo.cz',
      '/\\zlo.cz',
      'https://zlo.cz',
      'javascript:alert(1)',
      'vstupenky',
      '',
      null,
      undefined,
    ]) {
      assert.equal(safeReturnPath(zle), '/', String(zle));
    }
  });

  it('nevrací na formulář samotný – byla by to smyčka', () => {
    assert.equal(safeReturnPath(GATE_PATH), '/');
    assert.equal(safeReturnPath(`${GATE_PATH}?dal=%2F`), '/');
  });
});
