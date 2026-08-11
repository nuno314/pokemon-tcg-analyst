"use client";

import { useMemo, useState } from "react";
import {
  sliceHeatmapWeeks,
  type QuestChartRange,
  type QuestHeatmapWeek,
} from "@/lib/quests/calendar";

const RANGES: { id: QuestChartRange; label: string; weeks: number }[] = [
  { id: "week", label: "Tuần", weeks: 1 },
  { id: "month", label: "Tháng", weeks: 5 },
  { id: "year", label: "Năm", weeks: 53 },
];

const WEEKDAY_LABELS = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

function cellClass(count: number, empty: boolean) {
  if (empty) return "bg-transparent";
  if (count <= 0) return "bg-[var(--line)]";
  if (count === 1) return "bg-[color-mix(in_srgb,var(--accent-3)_70%,var(--wash))]";
  if (count === 2) return "bg-[color-mix(in_srgb,var(--accent)_55%,var(--accent-2))]";
  if (count === 3) return "bg-[var(--accent)]";
  return "bg-[color-mix(in_srgb,var(--accent)_40%,#9b1d5a)]";
}

export function QuestProgressChart({ weeks }: { weeks: QuestHeatmapWeek[] }) {
  const [range, setRange] = useState<QuestChartRange>("year");
  const visible = useMemo(() => {
    const n = RANGES.find((r) => r.id === range)?.weeks ?? 53;
    return sliceHeatmapWeeks(weeks, n);
  }, [weeks, range]);
  const total = useMemo(
    () => visible.reduce((sum, w) => sum + w.days.reduce((s, d) => s + (d.empty ? 0 : d.count), 0), 0),
    [visible],
  );
  const cell = range === "week" ? "size-4" : "size-2.5 sm:size-[11px]";

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-[var(--ink)]">
          {total} quest hoàn thành trong kỳ
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
                  : "bg-[var(--surface)] text-[var(--muted)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto pb-1">
        <div className="inline-flex min-w-full gap-1">
          <div className="flex shrink-0 flex-col gap-[3px] pt-3.5 text-[9px] leading-[10px] text-[var(--muted)]">
            {WEEKDAY_LABELS.map((label, i) => (
              <span key={label} className={`h-2.5 sm:h-[11px] ${i % 2 === 1 ? "" : "opacity-0"}`}>
                {i % 2 === 1 ? label : ""}
              </span>
            ))}
          </div>
          <div className="flex min-w-0 flex-1 gap-[3px]">
            {visible.map((week, wi) => (
              <div key={week.days[0]?.key ?? wi} className="flex min-w-0 flex-1 flex-col gap-[3px]">
                <span className="h-3 truncate text-[9px] text-[var(--muted)]">
                  {week.monthLabel ?? ""}
                </span>
                {week.days.map((day) => (
                  <div
                    key={day.key}
                    className={`${cell} w-full max-w-4 rounded-[2px] ${cellClass(day.count, day.empty)}`}
                    title={
                      day.empty ? "" : `${day.key}: ${day.count} quest`
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-end gap-1 text-[10px] text-[var(--muted)]">
        <span>Ít</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={`size-2.5 rounded-[2px] ${cellClass(n, false)}`} />
        ))}
        <span>Nhiều</span>
      </div>
    </div>
  );
}
