import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { AdminNav } from "@/components/admin/AdminNav";
import { Stamp } from "@/components/site/Stamp";
import { logout } from "../actions";

/**
 * Vše za přihlášením. `requireAdmin()` běží v layoutu, takže žádná stránka
 * uvnitř nemůže zapomenout na kontrolu — a `force-dynamic` zaručuje, že se
 * nikde nezacachuje stránka jednoho uživatele pro jiného.
 */
export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  const isOwner = user.role === "majitel";

  return (
    <div className="mx-auto max-w-[84rem] lg:grid lg:grid-cols-[15rem_1fr] lg:gap-14 lg:px-8 lg:py-10">
      <aside className="lg:sticky lg:top-10 lg:self-start">
        <div className="hidden items-center gap-3 lg:flex">
          <Stamp size={46} bare className="shrink-0 text-ink/80" />
          <span className="leading-tight">
            <span className="font-display block text-[1.05rem] font-semibold">Správa webu</span>
            <span className="block text-[0.7rem] uppercase tracking-[0.16em] text-ink-faint">
              Statek u Pipků
            </span>
          </span>
        </div>

        <div className="lg:mt-8">
          <AdminNav isOwner={isOwner} />
        </div>

        <div className="hidden border-t border-ink/12 pt-5 lg:mt-10 lg:block">
          <p className="text-[0.86rem] text-ink-soft">{user.name || user.email}</p>
          <p className="text-[0.74rem] uppercase tracking-[0.16em] text-ink-faint">
            {isOwner ? "majitel" : "obsluha"}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[0.84rem]">
            <Link href="/" className="text-ink-soft underline-offset-4 hover:underline">
              Zobrazit web
            </Link>
            <form action={logout}>
              <button type="submit" className="text-ink-soft underline-offset-4 hover:underline">
                Odhlásit se
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="px-5 py-8 lg:px-0 lg:py-0">{children}</main>

      {/* Na telefonu je odhlášení až dole — nahoře by jen zabíralo místo. */}
      <div className="border-t border-ink/12 px-5 py-6 text-[0.86rem] lg:hidden">
        <p className="text-ink-soft">{user.name || user.email}</p>
        <div className="mt-2 flex gap-4">
          <Link href="/" className="underline underline-offset-4">
            Zobrazit web
          </Link>
          <form action={logout}>
            <button type="submit" className="underline underline-offset-4">
              Odhlásit se
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
