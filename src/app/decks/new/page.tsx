import { AppNav } from "@/components/AppNav";
import { DeckForm } from "@/components/decks/DeckForm";
import { requireProfile } from "@/lib/session";

export default async function NewDeckPage() {
  const { profile } = await requireProfile();
  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
          New deck
        </h1>
        <DeckForm mode="create" />
      </main>
    </div>
  );
}
