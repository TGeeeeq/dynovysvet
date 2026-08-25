import { NewsForm } from "@/components/admin/NewsForm";
import { Notice, PageTitle } from "@/components/admin/ui";
import { hasDatabaseUrl } from "@/lib/db/client";

export const metadata = { title: "Nová aktualita" };

/** Prázdný formulář. Adresa se dopíše sama z nadpisu, viz `NewsForm`. */
export default function NewNews() {
  return (
    <div className="space-y-10">
      <PageTitle
        title="Nová aktualita"
        hint="Dokud nevyplníte datum zveřejnění, zůstane aktualita konceptem a na webu ji nikdo neuvidí."
      />

      {!hasDatabaseUrl() && (
        <Notice tone="bad">Databáze není připojená, aktualitu teď nejde uložit.</Notice>
      )}

      <NewsForm
        values={{
          id: "",
          slug: "",
          titleCs: "",
          titleEn: "",
          titleDe: "",
          bodyCs: "",
          bodyEn: "",
          bodyDe: "",
          publishedAt: "",
          pinnedUntil: "",
          imagePath: "",
        }}
      />
    </div>
  );
}
