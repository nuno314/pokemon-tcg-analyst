import type { QuestHeatmapWeek } from "@/lib/quests/calendar";
import type { Dictionary } from "@/lib/i18n/types";

function cellClass(count: number, empty: boolean) {
  if (empty) return "bg-transparent";
  if (count <= 0) return "bg-[var(--line)]";
  if (count === 1) return "bg-[color-mix(in_srgb,var(--accent-3)_70%,var(--wash))]";
  if (count === 2) return "bg-[color-mix(in_srgb,var(--accent)_55%,var(--accent-2))]";
  if (count === 3) return "bg-[var(--accent)]";
  return "bg-[color-mix(in_srgb,var(--accent)_40%,#9b1d5a)]";
}

export function QuestProgressChart({
  weeks,
  year,
  dict,
}: {
  weeks: QuestHeatmapWeek[];
  year: number;
  dict: Dictionary["quests"];
}) {
  const total = weeks.reduce(
    (sum, w) => sum + w.days.reduce((s, d) => s + (d.empty ? 0 : d.count), 0),
    0,
  );

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--wash)] p-3">
      <p className="mb-2 text-sm font-medium text-[var(--ink)]">
        {dict.heatmapTitle(total, year)}
      </p>

      <div
        className="grid w-full min-w-0"
        style={{
          gridTemplateColumns: `1.15rem repeat(${Math.max(weeks.length, 1)}, minmax(0, 1fr))`,
          gridTemplateRows: "0.75rem repeat(7, auto)",
          columnGap: 3,
          rowGap: 3,
        }}
      >
        <div />
        {weeks.map((week, wi) => (
          <div key={`m-${week.days[0]?.key ?? wi}`} className="relative min-w-0 overflow-visible">
            {week.monthLabel ? (
              <span className="absolute left-0 top-0 z-[1] whitespace-nowrap text-[9px] leading-3 text-[var(--muted)]">
                {week.monthLabel}
              </span>
            ) : null}
          </div>
        ))}

        {dict.weekdayLabels.map((label, di) => (
          <div key={label} className="contents">
            <span className="flex items-center justify-end pr-0.5 text-[9px] leading-none text-[var(--muted)]">
              {di % 2 === 1 ? label : ""}
            </span>
            {weeks.map((week) => {
              const day = week.days[di];
              if (!day) return null;
              return (
                <div
                  key={day.key}
                  className={`aspect-square min-h-0 min-w-0 rounded-[2px] ${cellClass(day.count, day.empty)}`}
                  title={day.empty ? undefined : dict.heatmapDayTitle(day.key, day.count)}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-end gap-1 text-[10px] text-[var(--muted)]">
        <span>{dict.less}</span>
        {[0, 1, 2, 3, 4].map((n) => (
          <span key={n} className={`size-2.5 rounded-[2px] ${cellClass(n, false)}`} />
        ))}
        <span>{dict.more}</span>
      </div>
    </div>
  );
}
