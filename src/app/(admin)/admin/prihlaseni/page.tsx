import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/session";
import { Stamp } from "@/components/site/Stamp";
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

        <p className="mt-10 text-center text-[0.82rem] text-ink-faint">
          Heslo jste zapomněli? Zavolejte tomu, kdo web spravuje — z bezpečnostních
          důvodů se nedá obnovit e-mailem.
        </p>
      </div>
    </main>
  );
}
