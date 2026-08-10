import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { MatchList } from "@/components/matches/MatchList";
import { WinRateCard } from "@/components/matches/WinRateCard";
import { PlayerStyleCard } from "@/components/matches/PlayerStyleCard";
import {
  countUserMatches,
  getPlayerAssessment,
  getWinRateStats,
  listDecks,
  listMatches,
  repairUserMatches,
  type RangeFilter,
} from "@/lib/db/queries";
import { t } from "@/lib/i18n/vi";
import { requireProfile } from "@/lib/session";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { session, profile } = await requireProfile();
  const sp = await searchParams;
  const range = (["all", "7d", "30d"].includes(sp.range ?? "") ? sp.range : "all") as RangeFilter;
  const dict = t();

  await repairUserMatches(session.user.id, profile.ptcglName);

  const [stats, matches, decks, matchCount, assessment] = await Promise.all([
    getWinRateStats(session.user.id, range),
    listMatches(session.user.id, range),
    listDecks(session.user.id),
    countUserMatches(session.user.id),
    getPlayerAssessment(session.user.id),
  ]);

  const deckName = new Map(decks.map((d) => [d.id, d.name]));

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[var(--ink)]">
              {dict.dashboard.title}
            </h1>
            <p className="text-sm text-[var(--muted)]">
              {dict.dashboard.playingAs} {profile.ptcglName}
            </p>
          </div>
          <div className="flex gap-2 text-sm">
            {(
              [
                ["all", dict.dashboard.allTime],
                ["7d", dict.dashboard.days7],
                ["30d", dict.dashboard.days30],
              ] as const
            ).map(([value, label]) => (
              <Link
                key={value}
                href={`/dashboard?range=${value}`}
                className={`rounded-full px-3 py-1.5 ${
                  range === value
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "border border-[var(--line)] bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--wash)]"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <PlayerStyleCard matchCount={matchCount} initial={assessment} />

        <div className="grid gap-4 sm:grid-cols-3">
          <WinRateCard
            title={dict.dashboard.overall}
            wins={stats.wins}
            losses={stats.losses}
            winRate={stats.winRate}
          />
          <WinRateCard
            title={dict.dashboard.goingFirst}
            wins={stats.first.wins}
            losses={stats.first.total - stats.first.wins}
            winRate={stats.first.winRate}
          />
          <WinRateCard
            title={dict.dashboard.goingSecond}
            wins={stats.second.wins}
            losses={stats.second.total - stats.second.wins}
            winRate={stats.second.winRate}
          />
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--ink)]">
              {dict.dashboard.winRateByDeck}
            </h2>
            <Link href="/decks/new" className="text-sm text-[var(--accent)] hover:underline">
              {dict.dashboard.newDeck}
            </Link>
          </div>
          {decks.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">{dict.dashboard.createDeckHint}</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {decks.map((deck) => {
                const bucket = stats.byDeck.get(deck.id) ?? { wins: 0, losses: 0 };
                const total = bucket.wins + bucket.losses;
                return (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="ui-card p-4 transition hover:bg-[var(--wash)]"
                  >
                    <p className="font-medium text-[var(--ink)]">{deck.name}</p>
                    <p className="mt-1 text-sm text-[var(--muted)]">
                      {total
                        ? `${Math.round((bucket.wins / total) * 1000) / 10}% · ${bucket.wins}W-${bucket.losses}L`
                        : dict.dashboard.noGames}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl text-[var(--ink)]">
              {dict.dashboard.recentMatches}
            </h2>
            <Link href="/matches/import" className="text-sm text-[var(--accent)] hover:underline">
              {dict.dashboard.importLog}
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
