import Link from "next/link";
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
};

export function MatchList({ matches }: { matches: MatchListItem[] }) {
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
    <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)]">
      {matches.map((m) => (
        <li key={m.id}>
          <Link
            href={`/matches/${m.id}`}
            className="flex items-center justify-between gap-3 px-4 py-3 transition hover:bg-[var(--wash)]"
          >
            <div>
              <p className="font-medium text-[var(--ink)]">vs {m.opponentName}</p>
              <p className="text-xs text-[var(--muted)]">
                {m.deckName ?? "Chưa gắn deck"} · {formatEndReason(m.resultReason)}
                {m.importedAt ? ` · ${new Date(m.importedAt).toLocaleString("vi-VN")}` : ""}
              </p>
            </div>
            <span
              className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${
                m.result === "win" ? "badge-win" : "badge-loss"
              }`}
            >
              {m.result === "win" ? dict.common.win : dict.common.loss}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
