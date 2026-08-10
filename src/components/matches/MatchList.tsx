import Link from "next/link";
import { OpponentDeckIcons } from "@/components/matches/OpponentDeckIcons";
import { formatEndReason } from "@/lib/parser/result-labels";
import { t } from "@/lib/i18n/vi";

export type MatchListItem = {
  id: string;
  opponentName: string;
  result: "win" | "loss";
  resultReason: string | null;
  wentFirst: string | null;
  importedAt: Date | null;
  deckName: string | null;
  opponentDeckName?: string | null;
  opponentIconIds?: number[];
};

export function MatchList({
  matches,
  compact = false,
}: {
  matches: MatchListItem[];
  compact?: boolean;
}) {
  const dict = t();
  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        Chưa có trận.{" "}
        <Link href="/matches/import" className="text-[var(--accent)] underline-offset-2 hover:underline">
          {dict.dashboard.importLog}
        </Link>
        .
      </p>
    );
  }

  return (
    <ul
      className={`divide-y divide-[var(--line)] overflow-hidden overflow-y-auto rounded-xl border border-[var(--line)] bg-[var(--surface)] ${compact ? "max-h-[calc(100vh-12rem)]" : ""}`}
    >
      {matches.map((m) => {
        const oppDeck = m.opponentDeckName ?? dict.dashboard.opponentDeckUnknown;
        const iconIds = m.opponentIconIds ?? [];

        return (
          <li key={m.id}>
            <Link
              href={`/matches/${m.id}`}
              className="flex items-center gap-3 px-4 py-3 transition hover:bg-[var(--wash)]"
            >
              <OpponentDeckIcons iconIds={iconIds} size={compact ? 36 : 40} />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-[var(--ink)]">vs {m.opponentName}</p>
                <p className="truncate text-xs text-[var(--muted)]">
                  <span className="font-medium text-[var(--accent)]">{oppDeck}</span>
                  {" · "}
                  {m.deckName ?? dict.dashboard.yourDeckUnset}
                  {" · "}
                  {formatEndReason(m.resultReason)}
                  {m.importedAt ? ` · ${new Date(m.importedAt).toLocaleString("vi-VN")}` : ""}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                  m.result === "win" ? "badge-win" : "badge-loss"
                }`}
              >
                {m.result === "win" ? dict.common.win : dict.common.loss}
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
