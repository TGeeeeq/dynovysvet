import { test } from "node:test";
import assert from "node:assert/strict";
import { LOCALES } from "../src/lib/i18n/config";
import { legalFor, growingFor, recipesFor } from "../src/content/localised";
import { SEO } from "../src/content/seo";
import { ROUTES, ROUTE_KEYS, href, routeKeyFromSlug } from "../src/lib/i18n/routes";

/**
 * Překlady nesmí „ujet" struktuře. Chybějící recept v němčině nebo přehozený
 * odstavec v obchodních podmínkách se na webu projeví až v momentě, kdy je
 * pozdě — tenhle test to chytne při každém buildu.
 */

test("recepty mají ve všech jazycích stejnou kostru", () => {
  const cs = recipesFor("cs");
  for (const locale of LOCALES) {
    const list = recipesFor(locale);
    assert.equal(list.length, cs.length, `${locale}: jiný počet receptů`);
    list.forEach((r, i) => {
      assert.equal(r.slug, cs[i].slug, `${locale}: slug na pozici ${i}`);
      assert.equal(r.ingredients.length, cs[i].ingredients.length, `${locale}: ${r.slug} suroviny`);
      assert.equal(r.steps.length, cs[i].steps.length, `${locale}: ${r.slug} postup`);
      assert.ok(r.name.trim().length > 0, `${locale}: ${r.slug} bez názvu`);
    });
  }
});

test("rady k pěstování mají ve všech jazycích stejnou kostru", () => {
  const cs = growingFor("cs");
  for (const locale of LOCALES) {
    const g = growingFor(locale);
    assert.equal(g.sections.length, cs.sections.length, `${locale}: jiný počet sekcí`);
    g.sections.forEach((s, i) => {
      assert.equal(s.items.length, cs.sections[i].items.length, `${locale}: sekce ${i}`);
    });
    assert.ok(g.intro.trim().length > 0);
  }
});

test("právní dokumenty mají ve všech jazycích stejný počet článků i odstavců", () => {
  const cs = legalFor("cs");
  for (const locale of LOCALES) {
    const doc = legalFor(locale);
    for (const which of ["terms", "privacy"] as const) {
      const a = doc[which].articles;
      const b = cs[which].articles;
      assert.equal(a.length, b.length, `${locale}/${which}: jiný počet článků`);
      a.forEach((art, i) => {
        assert.equal(art.n, b[i].n, `${locale}/${which}: číslo článku na pozici ${i}`);
        assert.equal(art.paragraphs.length, b[i].paragraphs.length, `${locale}/${which}: článek ${art.n}`);
      });
    }
  }
});

test("každá stránka má ve všech jazycích slug, titulek i popisek", () => {
  for (const key of ROUTE_KEYS) {
    for (const locale of LOCALES) {
      const seo = SEO[key][locale];
      assert.ok(seo.title.trim().length > 0, `${key}/${locale}: chybí title`);
      assert.ok(seo.description.length > 60, `${key}/${locale}: popisek je příliš krátký`);
      assert.ok(seo.description.length <= 200, `${key}/${locale}: popisek Google utne`);
    }
  }
});

test("slugy jsou v rámci jazyka jedinečné a dají se přeložit zpátky na klíč", () => {
  for (const locale of LOCALES) {
    const seen = new Set<string>();
    for (const key of ROUTE_KEYS) {
      const slug = ROUTES[key][locale];
      assert.ok(!seen.has(slug), `${locale}: duplicitní slug "${slug}"`);
      seen.add(slug);
      if (slug) assert.equal(routeKeyFromSlug(locale, slug), key);
    }
  }
});

test("čeština nemá prefix, ostatní jazyky ano", () => {
  assert.equal(href("home", "cs"), "/");
  assert.equal(href("tickets", "cs"), "/vstupenky");
  assert.equal(href("home", "en"), "/en");
  assert.equal(href("tickets", "en"), "/en/tickets");
  assert.equal(href("home", "de"), "/de");
});
