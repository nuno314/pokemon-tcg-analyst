import Link from "next/link";
import { notFound } from "next/navigation";
import { AppNav } from "@/components/AppNav";
import { MatchTimelineFull } from "@/components/matches/MatchTimeline";
import { getMatchDetail } from "@/lib/db/queries";
import { formatEndReason } from "@/lib/parser/result-labels";
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
                Dashboard
              </Link>{" "}
              / Match
            </p>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
              vs {match.opponentName}
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {match.deckName ? (
                <>
                  Deck:{" "}
                  <Link href={`/decks/${match.deckId}`} className="text-[var(--accent)] hover:underline">
                    {match.deckName}
                  </Link>
                  {" · "}
                </>
              ) : null}
              Went first: {match.wentFirst ?? "—"} · End: {formatEndReason(match.resultReason)}
              {match.winner ? ` · Winner: ${match.winner}` : ""}
              {match.importedAt ? ` · ${new Date(match.importedAt).toLocaleString()}` : ""}
            </p>
          </div>
          <span
            className={`rounded-md px-3 py-1.5 text-sm font-semibold uppercase ${
              match.result === "win"
                ? "bg-emerald-100 text-emerald-800"
                : "bg-rose-100 text-rose-800"
            }`}
          >
            {match.result}
          </span>
        </div>

        <MatchTimelineFull setupEvents={setupEvents} turns={turns} eventsByTurn={eventsByTurn} />
      </main>
    </div>
  );
}
