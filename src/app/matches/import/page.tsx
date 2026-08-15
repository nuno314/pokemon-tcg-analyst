import { AppNav } from "@/components/AppNav";
import { ImportForm } from "@/components/matches/ImportForm";
import { listDecks } from "@/lib/db/queries";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function ImportMatchPage() {
  const { session, profile } = await requireProfile();
  const decks = await listDecks(session.user.id);
  const dict = await getServerDictionary();

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-display text-3xl text-[var(--ink)]">
            {dict.import.title}
          </h1>
          <p className="text-sm text-[var(--muted)]">
            {dict.import.hint} {dict.import.matching}: <strong>{profile.ptcglName}</strong>
          </p>
        </div>
        <ImportForm
          ptcglName={profile.ptcglName}
          decks={decks.map((d) => ({ id: d.id, name: d.name }))}
        />
      </main>
    </div>
  );
}
