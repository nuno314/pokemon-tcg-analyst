import { AppNav } from "@/components/AppNav";
import { ImportForm } from "@/components/matches/ImportForm";
import { listDecks } from "@/lib/db/queries";
import { requireProfile } from "@/lib/session";

export default async function ImportMatchPage() {
  const { session, profile } = await requireProfile();
  const decks = await listDecks(session.user.id);

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
            Import battle log
          </h1>
          <p className="text-sm text-[var(--muted)]">
            Export from the PTCGL results screen (clipboard), paste here, and attach the deck you
            used. Matching player: <strong>{profile.ptcglName}</strong>
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
