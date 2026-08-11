"use client";

import { useMemo, useState } from "react";
import type { QuestChartPoint, QuestChartRange } from "@/lib/quests/calendar";

const RANGES: { id: QuestChartRange; label: string }[] = [
  { id: "week", label: "Tuần" },
  { id: "month", label: "Tháng" },
  { id: "year", label: "Năm" },
];

export function QuestProgressChart({
  week,
  month,
  year,
}: {
  week: QuestChartPoint[];
  month: QuestChartPoint[];
  year: QuestChartPoint[];
}) {
  const [range, setRange] = useState<QuestChartRange>("week");
  const series = range === "week" ? week : range === "month" ? month : year;
  const max = Math.max(1, ...series.map((p) => p.count));
  const total = useMemo(() => series.reduce((sum, p) => sum + p.count, 0), [series]);

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">
          Quest hoàn thành · {total} trong kỳ
        </p>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                range === r.id
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--surface)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex h-28 items-end gap-1.5">
        {series.map((p) => {
          const h = Math.round((p.count / max) * 100);
          return (
            <div key={p.key} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-semibold text-[var(--ink)]">{p.count}</span>
              <div className="flex h-20 w-full items-end justify-center">
                <div
                  className="w-[70%] max-w-8 rounded-t-md bg-gradient-to-t from-[var(--accent)] to-[var(--accent-2)]"
                  style={{ height: `${Math.max(p.count > 0 ? 8 : 2, h)}%` }}
                  title={`${p.label}: ${p.count}`}
                />
              </div>
              <span className="w-full truncate text-center text-[9px] text-[var(--muted)]">
                {p.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
