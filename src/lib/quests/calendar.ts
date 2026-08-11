/** Quest daily reset timezone — Vietnam (UTC+7). */
export const QUEST_TZ_OFFSET_MINUTES = 7 * 60;

export type QuestChartRange = "week" | "month" | "year";

export type QuestChartPoint = {
  key: string;
  label: string;
  count: number;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/** Local calendar date in the quest timezone. */
export function zonedParts(date: Date, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
  return {
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  };
}

export function dayKey(date: Date, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const { year, month, day } = zonedParts(date, offsetMinutes);
  return `${year}-${pad(month)}-${pad(day)}`;
}

export function dayStartUtc(key: string, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hh = pad(Math.floor(abs / 60));
  const mm = pad(abs % 60);
  return new Date(`${key}T00:00:00${sign}${hh}:${mm}`);
}

export function nextResetAt(date: Date, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const start = dayStartUtc(dayKey(date, offsetMinutes), offsetMinutes);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
}

export function addDays(key: string, days: number, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const start = dayStartUtc(key, offsetMinutes);
  return dayKey(new Date(start.getTime() + days * 24 * 60 * 60 * 1000), offsetMinutes);
}

function weekStartKey(key: string, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const start = dayStartUtc(key, offsetMinutes);
  const shifted = new Date(start.getTime() + offsetMinutes * 60_000);
  const weekday = shifted.getUTCDay(); // 0 Sun … 6 Sat
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addDays(key, mondayOffset, offsetMinutes);
}

function monthKeyFromDay(key: string) {
  return key.slice(0, 7);
}

function formatDayLabel(key: string) {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}

function formatMonthLabel(key: string) {
  const [y, m] = key.split("-");
  return `T${Number(m)}/${y.slice(2)}`;
}

export type QuestHeatmapDay = {
  key: string;
  count: number;
  /** Outside the calendar year, or after today. */
  empty: boolean;
};

export type QuestHeatmapWeek = {
  monthLabel: string | null;
  days: QuestHeatmapDay[];
};

const MONTH_LABELS = ["Th1", "Th2", "Th3", "Th4", "Th5", "Th6", "Th7", "Th8", "Th9", "Th10", "Th11", "Th12"];

function weekdaySun0(key: string, offsetMinutes = QUEST_TZ_OFFSET_MINUTES) {
  const shifted = new Date(dayStartUtc(key, offsetMinutes).getTime() + offsetMinutes * 60_000);
  return shifted.getUTCDay();
}

/** Calendar-year grid Th1→Th12 (Sun–Sat columns), padded to full weeks. */
export function buildQuestHeatmap(
  completions: { dayKey: string }[],
  now: Date,
  offsetMinutes = QUEST_TZ_OFFSET_MINUTES,
): { weeks: QuestHeatmapWeek[]; total: number; year: number } {
  const { year } = zonedParts(now, offsetMinutes);
  const today = dayKey(now, offsetMinutes);
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const counts = new Map<string, number>();
  for (const row of completions) {
    counts.set(row.dayKey, (counts.get(row.dayKey) ?? 0) + 1);
  }

  const gridStart = addDays(yearStart, -weekdaySun0(yearStart, offsetMinutes), offsetMinutes);
  const endWd = weekdaySun0(yearEnd, offsetMinutes);
  const gridEnd = addDays(yearEnd, 6 - endWd, offsetMinutes);
  const weekCount = Math.round(
    (dayStartUtc(gridEnd, offsetMinutes).getTime() -
      dayStartUtc(gridStart, offsetMinutes).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  ) + 1;

  const weeks: QuestHeatmapWeek[] = [];
  let prevMonth = 0;
  let total = 0;

  for (let w = 0; w < weekCount; w += 1) {
    const days: QuestHeatmapDay[] = [];
    let monthLabel: string | null = null;
    for (let d = 0; d < 7; d += 1) {
      const key = addDays(gridStart, w * 7 + d, offsetMinutes);
      const inYear = key >= yearStart && key <= yearEnd;
      const afterToday = key > today;
      const empty = !inYear || afterToday;
      const count = empty ? 0 : (counts.get(key) ?? 0);
      if (!empty) total += count;
      days.push({ key, count, empty });
      const month = Number(key.slice(5, 7));
      if (inYear && month !== prevMonth) {
        monthLabel = MONTH_LABELS[month - 1] ?? null;
        prevMonth = month;
      }
    }
    weeks.push({ monthLabel, days });
  }

  return { weeks, total, year };
}

export function buildQuestChart(
  completions: { dayKey: string }[],
  range: QuestChartRange,
  now: Date,
  offsetMinutes = QUEST_TZ_OFFSET_MINUTES,
): QuestChartPoint[] {
  const today = dayKey(now, offsetMinutes);
  const counts = new Map<string, number>();
  for (const row of completions) {
    counts.set(row.dayKey, (counts.get(row.dayKey) ?? 0) + 1);
  }

  if (range === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDays(today, i - 6, offsetMinutes);
      return { key, label: formatDayLabel(key), count: counts.get(key) ?? 0 };
    });
  }

  if (range === "month") {
    const thisWeek = weekStartKey(today, offsetMinutes);
    return Array.from({ length: 4 }, (_, i) => {
      const start = addDays(thisWeek, (i - 3) * 7, offsetMinutes);
      const end = addDays(start, 6, offsetMinutes);
      let count = 0;
      for (let d = 0; d < 7; d += 1) {
        count += counts.get(addDays(start, d, offsetMinutes)) ?? 0;
      }
      return {
        key: start,
        label: `${formatDayLabel(start)}–${formatDayLabel(end)}`,
        count,
      };
    });
  }

  const { year, month } = zonedParts(now, offsetMinutes);
  return Array.from({ length: 12 }, (_, i) => {
    let m = month - 11 + i;
    let y = year;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }
    const key = `${y}-${pad(m)}`;
    let count = 0;
    for (const [day, n] of counts) {
      if (monthKeyFromDay(day) === key) count += n;
    }
    return { key, label: formatMonthLabel(key), count };
  });
}
