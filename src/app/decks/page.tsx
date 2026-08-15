import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { getWinRateStats, listDecks } from "@/lib/db/queries";
import { getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function DecksPage() {
  const { session, profile } = await requireProfile();
  const dict = await getServerDictionary();
  const [decks, stats] = await Promise.all([
    listDecks(session.user.id),
    getWinRateStats(session.user.id, "all"),
  ]);

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex items-center justify-between gap-4">
          <h1 className="font-display text-3xl text-[var(--ink)]">{dict.decks.title}</h1>
          <Link href="/decks/new" className="ui-btn-primary px-4 py-2 text-sm">
            {dict.decks.new}
          </Link>
        </div>

        {decks.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
            {dict.decks.empty}
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {decks.map((deck) => {
              const bucket = stats.byDeck.get(deck.id) ?? { wins: 0, losses: 0 };
              const total = bucket.wins + bucket.losses;
              const pct = total ? Math.round((bucket.wins / total) * 1000) / 10 : 0;
              return (
                <li key={deck.id}>
                  <Link
                    href={`/decks/${deck.id}`}
                    className="ui-card block p-5 transition hover:bg-[var(--wash)]"
                  >
                    <p className="font-display text-xl text-[var(--ink)]">{deck.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {dict.decks.cardsLine(
                        deck.totalCards,
                        deck.pokemonCount,
                        deck.trainerCount,
                        deck.energyCount,
                      )}
                    </p>
                    <p className="mt-2 text-sm text-[var(--ink)]">
                      {total
                        ? dict.decks.winRateLine(pct, bucket.wins, bucket.losses)
                        : dict.decks.noMatchesYet}
                    </p>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
