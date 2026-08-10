import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MatchList } from "@/components/matches/MatchList";
import { DeleteDeckButton } from "@/components/decks/DeleteDeckButton";
import { DeckCardGallery, DeckCardRow } from "@/components/decks/CardImages";
import { enrichMatchListItems } from "@/lib/matches/enrich-list";
import { getDeckWithCards, listMatches } from "@/lib/db/queries";
import { requireProfile } from "@/lib/session";

export default async function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, profile } = await requireProfile();
  const { id } = await params;
  const deck = await getDeckWithCards(session.user.id, id);
  if (!deck) notFound();

  const deckMatches = (await listMatches(session.user.id, "all")).filter((m) => m.deckId === id);
  const matchListItems = enrichMatchListItems(deckMatches, new Map([[id, deck.name]]));

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
            <h1 className="font-display text-3xl text-[var(--ink)]">
              {deck.name}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {deck.totalCards} cards · {deck.pokemonCount} Pokémon types · {deck.trainerCount}{" "}
              Trainer types · {deck.energyCount} Energy types
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/decks/${deck.id}/edit`}
              className="ui-btn-secondary px-3 py-2 text-sm"
            >
              Edit
            </Link>
            <DeleteDeckButton deckId={deck.id} />
          </div>
        </div>

        <DeckCardGallery title="Pokémon" cards={groups.pokemon} />
        <DeckCardGallery title="Trainer" cards={groups.trainer} />
        <DeckCardGallery title="Energy" cards={groups.energy} />

        <div className="grid gap-6 md:grid-cols-3">
          {(["pokemon", "trainer", "energy"] as const).map((cat) => (
            <section
              key={cat}
              className="ui-card p-4"
            >
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

        <section className="space-y-3">
          <h2 className="font-display text-xl text-[var(--ink)]">
            Matches with this deck
          </h2>
          <MatchList matches={matchListItems} />
        </section>
      </main>
    </div>
  );
}
