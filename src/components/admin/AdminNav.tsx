"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV } from "@/lib/admin/nav";

/**
 * Boční rejstřík administrace. Na širokém displeji stojí vlevo, na telefonu
 * se skládá do rozbalovacího seznamu — majitel se do administrace dívá
 * i z traktoru.
 */
export function AdminNav({ isOwner }: { isOwner: boolean }) {
  const pathname = usePathname() ?? "";
  const [open, setOpen] = useState(false);

  const groups = ADMIN_NAV.map((g) => ({
    ...g,
    links: g.links.filter((l) => isOwner || !l.ownerOnly),
  })).filter((g) => g.links.length > 0);

  const active = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const current = [{ href: "/admin", label: "Přehled" }, ...groups.flatMap((g) => g.links)].find(
    (l) => (l.href === "/admin" ? pathname === "/admin" : active(l.href)),
  );

  return (
    <>
      {/* Mobilní přepínač. Ukazuje, kde jsem — to je na malém displeji
          důležitější než seznam všeho ostatního. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between border-b-2 border-ink/15 px-5 py-3.5 text-left lg:hidden"
      >
        <span className="font-display text-lg font-semibold">{current?.label ?? "Správa webu"}</span>
        <span className="text-[0.78rem] uppercase tracking-[0.18em] text-ink-faint">
          {open ? "Zavřít" : "Nabídka"}
        </span>
      </button>

      <nav
        aria-label="Správa webu"
        className={`${open ? "block" : "hidden"} border-b-2 border-ink/15 px-5 pb-8 pt-4 lg:block lg:border-b-0 lg:px-0 lg:pt-0`}
      >
        <ul className="space-y-1">
          <li>
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className={`block rounded-sm py-1.5 transition-colors ${
                pathname === "/admin" ? "text-pumpkin" : "text-ink hover:text-pumpkin"
              }`}
            >
              Přehled
            </Link>
          </li>
        </ul>

        {groups.map((g) => (
          <div key={g.title} className="mt-8">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-ink-faint">{g.title}</p>
            <hr className="rule-hand my-2.5" />
            <ul className="space-y-1">
              {g.links.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    aria-current={active(l.href) ? "page" : undefined}
                    className={`block py-1.5 leading-snug transition-colors ${
                      active(l.href) ? "text-pumpkin" : "text-ink-soft hover:text-ink"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
