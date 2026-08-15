import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { ExportBattleLogButton } from "@/components/matches/ExportBattleLogButton";
import { MatchAiAnalyst } from "@/components/matches/MatchAiAnalyst";
import { MatchReplayPlayer } from "@/components/matches/MatchReplayPlayer";
import { MatchTimelineFull } from "@/components/matches/MatchTimeline";
import { MatchUserNote } from "@/components/matches/MatchUserNote";
import { getMatchAnalysis, getMatchDetail } from "@/lib/db/queries";
import { formatEndReason } from "@/lib/parser/result-labels";
import { localeToDateLocale } from "@/lib/i18n";
import { getLocale, getServerDictionary } from "@/lib/i18n/server";
import { requireProfile } from "@/lib/session";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { session, profile } = await requireProfile();
  const { id } = await params;
  const detail = await getMatchDetail(session.user.id, id);
  if (!detail) notFound();
  const analysis = await getMatchAnalysis(session.user.id, id);
  const locale = await getLocale();
  const dict = await getServerDictionary();
  const dateLocale = localeToDateLocale(locale);

  const { match, turns, events } = detail;
  const setupEvents = events.filter((e) => !e.turnId);
  const eventsByTurn: Record<string, typeof events> = {};
  for (const turn of turns) eventsByTurn[turn.id] = [];
  for (const event of events) {
    if (event.turnId) {
      (eventsByTurn[event.turnId] ??= []).push(event);
    }
  }

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm text-[var(--muted)]">
              <Link href="/dashboard" className="hover:underline">
                {dict.match.dashboard}
              </Link>{" "}
              / {dict.match.match}
            </p>
            <h1 className="font-display text-3xl text-[var(--ink)]">
              vs {match.opponentName}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {match.deckName ? (
                <>
                  {dict.match.deck}:{" "}
                  <Link href={`/decks/${match.deckId}`} className="text-[var(--accent)] hover:underline">
                    {match.deckName}
                  </Link>
                  {" · "}
                </>
              ) : null}
              {dict.match.wentFirst}: {match.wentFirst ?? "—"} · {dict.match.end}:{" "}
              {formatEndReason(match.resultReason, dict.resultLabels)}
              {match.winner ? ` · ${dict.match.winner}: ${match.winner}` : ""}
              {match.importedAt ? ` · ${new Date(match.importedAt).toLocaleString(dateLocale)}` : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <ExportBattleLogButton rawLog={match.rawLog} />
            <span
              className={`rounded-full px-3 py-1.5 text-sm font-semibold uppercase ${
                match.result === "win" ? "badge-win" : "badge-loss"
              }`}
            >
              {match.result === "win" ? dict.common.win : dict.common.loss}
            </span>
          </div>
        </div>

        <MatchReplayPlayer rawLog={match.rawLog} ptcglName={profile.ptcglName} />

        <MatchUserNote matchId={id} initialNote={match.userNote ?? ""} />

        <MatchAiAnalyst
          matchId={id}
          initial={
            analysis
              ? {
                  summary: analysis.summary,
                  goodPlays: analysis.goodPlays,
                  mistakes: analysis.mistakes,
                  tips: analysis.tips,
                  opponentNotes: analysis.opponentNotes,
                }
              : null
          }
        />

        <MatchTimelineFull setupEvents={setupEvents} turns={turns} eventsByTurn={eventsByTurn} />
      </main>
    </div>
  );
}
