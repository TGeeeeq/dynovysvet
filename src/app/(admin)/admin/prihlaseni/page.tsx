import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { Stamp } from "@/components/site/Stamp";
import { AFLogo } from "@/components/site/AFLogo";
import { LoginForm } from "@/components/admin/LoginForm";

export const metadata = { title: "Přihlášení" };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdminSession()) redirect("/admin");

  return (
    <main className="grid min-h-dvh place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Stamp size={110} className="text-ink/85" />
          <h1 className="font-display mt-8 text-3xl font-semibold">Správa webu</h1>
          <p className="mt-2 text-[0.95rem] text-ink-soft">
            Přihlaste se e-mailem a heslem.
          </p>
        </div>

        <LoginForm />

        <div className="mt-10 flex justify-center">
          <a
            href="https://www.antoninfigueroa.cz"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Web vytvořil Antonín Figueroa"
            className="group inline-flex"
          >
            <AFLogo
              size={38}
              className="ring-1 ring-[#d4a45a]/20 transition duration-500 ease-out group-hover:scale-105 group-hover:ring-[#d4a45a]/45 group-hover:shadow-[0_0_22px_rgba(212,164,90,0.28)]"
            />
          </a>
        </div>
      </div>
    </main>
  );
}
