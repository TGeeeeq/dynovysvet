/**
 * Testy autentizace administrace.
 *
 * Běží bez databáze – hashování hesel ani politika sílu DB nepotřebují a je to
 * ta část, kterou chceme mít ověřenou na každém commitu. Případné integrační
 * testy (session, rate limit) se přeskočí bez `DATABASE_URL`, stejně jako
 * v tests/booking.test.ts.
 */
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  checkPasswordStrength,
  dummyVerify,
  hashPassword,
  PASSWORD_POLICY,
  verifyPassword,
} from '../src/lib/admin/password';
import { rateLimit, resetRateLimit } from '../src/lib/security/rate-limit';

const SILNE = 'kombajn-visnovy-2026';

describe('hashování hesel (scrypt)', () => {
  it('projde round-trip: co zahashuju, to ověřím', async () => {
    const stored = await hashPassword(SILNE);
    assert.equal(await verifyPassword(SILNE, stored), true);
  });

  it('má očekávaný formát a neobsahuje heslo v plaintextu', async () => {
    const stored = await hashPassword(SILNE);
    const parts = stored.split('$');
    assert.equal(parts.length, 6);
    assert.equal(parts[0], 'scrypt');
    assert.equal(Number(parts[1]), 2 ** 16);
    assert.equal(Number(parts[2]), 8);
    assert.equal(Number(parts[3]), 1);
    assert.ok(!stored.includes(SILNE), 'v uloženém řetězci nesmí být heslo');
  });

  it('dvě zahashování téhož hesla se liší (náhodná sůl)', async () => {
    const a = await hashPassword(SILNE);
    const b = await hashPassword(SILNE);
    assert.notEqual(a, b);
    assert.equal(await verifyPassword(SILNE, a), true);
    assert.equal(await verifyPassword(SILNE, b), true);
  });

  it('špatné heslo neprojde', async () => {
    const stored = await hashPassword(SILNE);
    assert.equal(await verifyPassword('kombajn-visnovy-2025', stored), false);
    assert.equal(await verifyPassword('', stored), false);
    assert.equal(await verifyPassword(SILNE.toUpperCase(), stored), false);
  });

  it('poškozený, prázdný ani cizí formát nevyhodí výjimku, jen vrátí false', async () => {
    const stored = await hashPassword(SILNE);
    const rozbite = [
      '',
      '$',
      'scrypt',
      'scrypt$$$$',
      'scrypt$65536$8$1$$',
      'scrypt$65536$8$1$c29s', // chybí hash
      'scrypt$abc$8$1$c29s$aGFzaA==', // nečíselné N
      'scrypt$1073741824$8$1$c29s$aGFzaA==', // absurdní N – nesmí sežrat paměť
      'argon2id$v=19$m=65536,t=3,p=4$c29s$aGFzaA==',
      '$2b$12$abcdefghijklmnopqrstuv',
      stored.slice(0, stored.length - 4),
      stored.replace('scrypt', 'scrypty'),
    ];

    for (const bad of rozbite) {
      const res = await verifyPassword(SILNE, bad);
      assert.equal(res, false, `formát ${JSON.stringify(bad)} měl skončit false`);
    }
  });

  it('dummyVerify doběhne a nic nevyhodí', async () => {
    await dummyVerify();
    // Podruhé pro jistotu – používá se na každém přihlášení neexistujícího účtu.
    await dummyVerify();
  });
});

describe('politika hesel', () => {
  it('odmítne krátké heslo', () => {
    const res = checkPasswordStrength('kratke1');
    assert.equal(res.ok, false);
    assert.match(res.problem ?? '', /alespoň 12 znaků/);
  });

  it('odmítne prázdné heslo', () => {
    assert.equal(checkPasswordStrength('').ok, false);
  });

  it('odmítne slabé heslo ze seznamu, i s příponou a diakritikou', () => {
    for (const bad of ['password1234', 'HESLO1234567', 'dynovysvet2026', 'Dýňovýsvět2026', 'admin1234567']) {
      const res = checkPasswordStrength(bad);
      assert.equal(res.ok, false, `${bad} mělo být odmítnuto`);
      assert.ok((res.problem ?? '').length > 0);
    }
  });

  it('odmítne jeden opakovaný znak i jedinou kategorii znaků', () => {
    assert.equal(checkPasswordStrength('aaaaaaaaaaaaaa').ok, false);
    assert.equal(checkPasswordStrength('abcdefghijklm').ok, false);
  });

  it('přijme silné heslo', () => {
    for (const good of [SILNE, 'Traktor v mlze 8x', 'kridlovka-mrazivy-lestenec-41']) {
      const res = checkPasswordStrength(good);
      assert.equal(res.ok, true, `${good} mělo projít, dostal jsem: ${res.problem}`);
      assert.equal(res.problem, undefined);
    }
  });

  it('hlášky jsou české a neprozrazují heslo', () => {
    const res = checkPasswordStrength('heslo');
    assert.equal(res.ok, false);
    assert.ok(!(res.problem ?? '').includes('heslo1'), 'hláška nesmí obsahovat zadané heslo');
    assert.ok(PASSWORD_POLICY.minLength >= 12);
  });
});

describe('in-memory limiter veřejných formulářů', () => {
  it('pustí limit zásahů a další zablokuje', () => {
    const key = `test:${Math.random()}`;
    resetRateLimit(key);

    for (let i = 0; i < 3; i += 1) {
      const res = rateLimit(key, 3, 60);
      assert.equal(res.allowed, true);
      assert.equal(res.remaining, 2 - i);
    }

    const blocked = rateLimit(key, 3, 60);
    assert.equal(blocked.allowed, false);
    assert.equal(blocked.remaining, 0);
    assert.ok(blocked.retryAfterSeconds > 0 && blocked.retryAfterSeconds <= 60);

    resetRateLimit(key);
    assert.equal(rateLimit(key, 3, 60).allowed, true);
  });

  it('klíče se navzájem neovlivňují', () => {
    const a = `test-a:${Math.random()}`;
    const b = `test-b:${Math.random()}`;
    assert.equal(rateLimit(a, 1, 60).allowed, true);
    assert.equal(rateLimit(a, 1, 60).allowed, false);
    assert.equal(rateLimit(b, 1, 60).allowed, true);
  });

  it('odmítne nesmyslné parametry', () => {
    assert.throws(() => rateLimit('x', 0, 60), RangeError);
    assert.throws(() => rateLimit('x', 5, 0), RangeError);
  });
});
