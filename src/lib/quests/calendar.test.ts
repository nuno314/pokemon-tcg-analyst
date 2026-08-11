import { describe, expect, it } from "vitest";
import { buildQuestChart, dayKey, nextResetAt } from "./calendar";

describe("quest calendar", () => {
  it("uses Vietnam day keys", () => {
    expect(dayKey(new Date("2026-08-11T00:30:00+07:00"))).toBe("2026-08-11");
    expect(dayKey(new Date("2026-08-10T23:30:00+07:00"))).toBe("2026-08-10");
  });

  it("resets at next 00:00 GMT+7", () => {
    const reset = nextResetAt(new Date("2026-08-11T15:00:00+07:00"));
    expect(reset.toISOString()).toBe("2026-08-11T17:00:00.000Z");
  });

  it("aggregates completions by week/month/year", () => {
    const now = new Date("2026-08-11T10:00:00+07:00");
    const completions = [
      { dayKey: "2026-08-11" },
      { dayKey: "2026-08-11" },
      { dayKey: "2026-08-10" },
      { dayKey: "2026-07-02" },
    ];
    const week = buildQuestChart(completions, "week", now);
    expect(week).toHaveLength(7);
    expect(week.at(-1)?.count).toBe(2);

    const month = buildQuestChart(completions, "month", now);
    expect(month).toHaveLength(4);

    const year = buildQuestChart(completions, "year", now);
    expect(year).toHaveLength(12);
    expect(year.at(-1)?.count).toBe(3);
    expect(year.find((p) => p.key === "2026-07")?.count).toBe(1);
  });
});
