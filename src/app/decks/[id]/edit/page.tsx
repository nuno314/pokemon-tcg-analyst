import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { DeckForm } from "@/components/decks/DeckForm";
import { getDeckWithCards } from "@/lib/db/queries";
import { requireProfile } from "@/lib/session";

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, profile } = await requireProfile();
  const { id } = await params;
  const deck = await getDeckWithCards(session.user.id, id);
  if (!deck) notFound();

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <h1 className="font-display text-3xl text-[var(--ink)]">
          Edit deck
        </h1>
        <DeckForm mode="edit" deckId={deck.id} initialName={deck.name} initialList={deck.rawList} />
      </main>
    </div>
  );
}
