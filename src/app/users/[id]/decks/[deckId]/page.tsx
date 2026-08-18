import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { DeckCardGallery, DeckCardRow } from "@/components/decks/CardImages";
import { ExportDeckButton } from "@/components/decks/ExportDeckButton";
import { getFriendDeckWithCards, getUserPublicPreview } from "@/lib/db/queries";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function FriendDeckPage({
  params,
}: {
  params: Promise<{ id: string; deckId: string }>;
}) {
  const { session, profile } = await requireProfile();
  const dict = await getServerDictionary();
  const { id, deckId } = await params;
  const owner = await getUserPublicPreview(id);
  const deck = await getFriendDeckWithCards(session.user.id, id, deckId);
  if (!owner || !deck) notFound();

  const groups = {
    pokemon: deck.cards.filter((c) => c.category === "pokemon"),
    trainer: deck.cards.filter((c) => c.category === "trainer"),
    energy: deck.cards.filter((c) => c.category === "energy"),
  };

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href={`/users/${id}`}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              ← {dict.userProfile.backToProfile}
            </Link>
            <h1 className="mt-2 font-display text-3xl text-[var(--ink)]">{deck.name}</h1>
            <p className="text-sm text-[var(--muted)]">
              {owner.ptcglName} ·{" "}
              {dict.decks.cardsLine(
                deck.totalCards,
                deck.pokemonCount,
                deck.trainerCount,
                deck.energyCount,
              )}
            </p>
          </div>
          <ExportDeckButton rawList={deck.rawList} />
        </div>

        <DeckCardGallery title="Pokémon" cards={groups.pokemon} />
        <DeckCardGallery title="Trainer" cards={groups.trainer} />
        <DeckCardGallery title="Energy" cards={groups.energy} />

        <div className="grid gap-6 md:grid-cols-3">
          {(["pokemon", "trainer", "energy"] as const).map((cat) => (
            <section key={cat} className="ui-card p-4">
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {cat}
              </h2>
              <ul className="space-y-0.5">
                {groups[cat].map((c) => (
                  <DeckCardRow
                    key={c.id}
                    qty={c.qty}
                    name={c.name}
                    setCode={c.setCode}
                    collectorNumber={c.collectorNumber}
                  />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
