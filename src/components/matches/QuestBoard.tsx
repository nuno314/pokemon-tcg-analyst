import Link from "next/link";
import type { QuestHeatmapWeek } from "@/lib/quests/calendar";
import type { QuestBoardData } from "@/lib/quests/generate";
import { QuestProgressChart } from "@/components/matches/QuestProgressChart";
import { QuestResetCountdown } from "@/components/matches/QuestResetCountdown";

export function QuestBoard({
  board,
  heatmap,
}: {
  board: QuestBoardData;
  heatmap: QuestHeatmapWeek[];
}) {
  if (!board.unlocked) {
    return (
      <section className="ui-card p-5">
        <h2 className="font-display text-xl text-[var(--ink)]">Quest luyện tập</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Cần ít nhất {board.need} trận để mở quest ngày. Hiện có {board.matchCount}/
          {board.need}. Reset 00:00 GMT+7.
        </p>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--wash)]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
            style={{
              width: `${Math.min(100, (board.matchCount / board.need) * 100)}%`,
            }}
          />
        </div>
      </section>
    );
  }

  return (
    <section className="ui-card space-y-4 p-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">Quest luyện tập hôm nay</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Hết hạn 00:00 GMT+7 · {board.completedCount}/{board.dailyTarget} quest trong ngày
          </p>
        </div>
        <div className="flex items-center gap-2">
          <QuestResetCountdown resetsAt={board.resetsAt} />
          <Link href="/matches/import" className="text-sm text-[var(--accent)] hover:underline">
            Import log
          </Link>
        </div>
      </div>

      {board.notes.length > 0 ? (
        <ul className="space-y-2">
          {board.notes.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--wash)] px-3 py-2 text-sm text-[var(--ink)]"
            >
              <span className="mr-1 font-semibold text-[var(--accent)]">Note</span>
              {n.text}
            </li>
          ))}
        </ul>
      ) : null}

      <ul className="grid gap-3 sm:grid-cols-2">
        {board.quests.map((q) => (
          <li key={q.id}>
            <Link
              href={q.href}
              className={`block h-full rounded-xl border p-4 transition hover:bg-[var(--wash)] ${
                q.done
                  ? "border-[color-mix(in_srgb,var(--accent-2)_45%,var(--line))] bg-[color-mix(in_srgb,var(--accent-2)_10%,var(--surface))]"
                  : "border-[var(--line)] bg-[var(--surface)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-display text-base text-[var(--ink)]">{q.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    q.done ? "badge-win" : "bg-[var(--wash)] text-[var(--muted)]"
                  }`}
                >
                  {q.done ? "Xong" : `${q.progress}/${q.target}`}
                </span>
              </div>
              <p className="mt-1 text-sm text-[var(--muted)]">{q.detail}</p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--wash)]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
                  style={{
                    width: `${Math.min(100, (q.progress / q.target) * 100)}%`,
                  }}
                />
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <QuestProgressChart weeks={heatmap} />
    </section>
  );
}
