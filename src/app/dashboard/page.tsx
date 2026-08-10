import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { MatchList } from "@/components/matches/MatchList";
import { QuestBoard } from "@/components/matches/QuestBoard";
import { WinRateCard } from "@/components/matches/WinRateCard";
import { PlayerStyleCard } from "@/components/matches/PlayerStyleCard";
import {
  countUserAnalyses,
  countUserMatches,
  getPlayerAssessment,
  getWinRateStats,
  listDecks,
  listMatches,
  repairUserMatches,
  type RangeFilter,
} from "@/lib/db/queries";
import { generateQuestBoard } from "@/lib/quests/generate";
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

  const [stats, matches, decks, matchCount, assessment, allMatches, analysisCount] =
    await Promise.all([
      getWinRateStats(session.user.id, range),
      listMatches(session.user.id, range),
      listDecks(session.user.id),
      countUserMatches(session.user.id),
      getPlayerAssessment(session.user.id),
      listMatches(session.user.id, "all"),
      countUserAnalyses(session.user.id),
    ]);

  const deckName = new Map(decks.map((d) => [d.id, d.name]));
  const questBoard = generateQuestBoard({
    ptcglName: profile.ptcglName,
    matchCount,
    matches: allMatches,
    analysisCount,
    deckCount: decks.length,
  });

  const matchListItems = matches.map((m) => ({
    ...m,
    deckName: m.deckName ?? (m.deckId ? deckName.get(m.deckId) ?? null : null),
  }));

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl text-[var(--ink)]">{dict.dashboard.title}</h1>
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

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,340px)] lg:items-start">
          <div className="space-y-6">
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

            <PlayerStyleCard matchCount={matchCount} initial={assessment} />

            <QuestBoard board={questBoard} />

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
          </div>

          <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-hidden">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-xl text-[var(--ink)]">
                {dict.dashboard.recentMatches}
              </h2>
              <Link href="/matches/import" className="text-sm text-[var(--accent)] hover:underline">
                {dict.dashboard.importLog}
              </Link>
            </div>
            <MatchList matches={matchListItems} compact />
          </aside>
        </div>
      </main>
    </div>
  );
}
