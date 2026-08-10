import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { MatchList } from "@/components/matches/MatchList";
import { WinRateCard } from "@/components/matches/WinRateCard";
import {
  getWinRateStats,
  listDecks,
  listMatches,
  repairUserMatches,
  type RangeFilter,
} from "@/lib/db/queries";
import { requireProfile } from "@/lib/session";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { session, profile } = await requireProfile();
  const sp = await searchParams;
  const range = (["all", "7d", "30d"].includes(sp.range ?? "") ? sp.range : "all") as RangeFilter;

  // Heal matches imported before winner-parsing fixes
  await repairUserMatches(session.user.id, profile.ptcglName);

  const [stats, matches, decks] = await Promise.all([
    getWinRateStats(session.user.id, range),
    listMatches(session.user.id, range),
    listDecks(session.user.id),
  ]);

  const deckName = new Map(decks.map((d) => [d.id, d.name]));

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              Dashboard
            </h1>
            <p className="text-sm text-[var(--muted)]">Playing as {profile.ptcglName}</p>
          </div>
          <div className="flex gap-2 text-sm">
            {(
              [
                ["all", "All time"],
                ["7d", "7 days"],
                ["30d", "30 days"],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={`/dashboard?range=${value}`}
                className={`rounded-md px-3 py-1.5 ${
                  range === value
                    ? "bg-[var(--accent)] text-white"
                    : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <WinRateCard
            title="Overall"
            wins={stats.wins}
            losses={stats.losses}
            winRate={stats.winRate}
          />
          <WinRateCard
            title="Going first"
            wins={stats.first.wins}
            losses={stats.first.total - stats.first.wins}
            winRate={stats.first.winRate}
          />
          <WinRateCard
            title="Going second"
            wins={stats.second.wins}
            losses={stats.second.total - stats.second.wins}
            winRate={stats.second.winRate}
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
              Win rate by deck
            </h2>
            <Link href="/decks/new" className="text-sm text-[var(--accent)] hover:underline">
              New deck
            </Link>
          </div>
          {decks.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">Create a deck to track matchups by list.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {decks.map((deck) => {
                const bucket = stats.byDeck.get(deck.id) ?? { wins: 0, losses: 0 };
                const total = bucket.wins + bucket.losses;
                return (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 transition hover:bg-[var(--wash)]"
                  >
                    <p className="font-medium text-[var(--ink)]">{deck.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {total
                        ? `${Math.round((bucket.wins / total) * 1000) / 10}% · ${bucket.wins}W-${bucket.losses}L`
                        : "No games yet"}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
              Recent matches
            </h2>
            <Link href="/matches/import" className="text-sm text-[var(--accent)] hover:underline">
              Import log
            </Link>
          </div>
          <MatchList
            matches={matches.map((m) => ({
              ...m,
              deckName: m.deckName ?? (m.deckId ? deckName.get(m.deckId) ?? null : null),
            }))}
          />
        </section>
      </main>
    </div>
  );
}
