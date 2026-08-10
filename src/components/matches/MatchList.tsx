import Link from "next/link";
import { formatEndReason } from "@/lib/parser/result-labels";

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
  if (matches.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        No matches yet.{" "}
        <Link href="/matches/import" className="text-[var(--accent)] underline-offset-2 hover:underline">
          Import a battle log
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
                {m.deckName ?? "No deck"} · {formatEndReason(m.resultReason)}
                {m.importedAt ? ` · ${new Date(m.importedAt).toLocaleString()}` : ""}
              </p>
            </div>
            <span
              className={`rounded-md px-2 py-1 text-xs font-semibold uppercase ${
                m.result === "win"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-800"
              }`}
            >
              {m.result}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
