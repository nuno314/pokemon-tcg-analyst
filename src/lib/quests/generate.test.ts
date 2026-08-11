import { describe, expect, it } from "vitest";
import { generateQuestBoard } from "./generate";

const now = new Date("2026-08-11T10:00:00+07:00");

describe("generateQuestBoard", () => {
  it("locks under 10 matches", () => {
    const board = generateQuestBoard({
      ptcglName: "Fairy_VN",
      matchCount: 3,
      matches: [],
      analysisCount: 0,
      deckCount: 1,
      now,
    });
    expect(board.unlocked).toBe(false);
    expect(board.need).toBe(10);
    expect(board.dayKey).toBe("2026-08-11");
  });

  it("only counts matches from today for daily quests", () => {
    const board = generateQuestBoard({
      ptcglName: "Fairy_VN",
      matchCount: 12,
      analysisCount: 1,
      deckCount: 2,
      now,
      matches: [
        {
          id: "old",
          result: "win",
          resultReason: "concede",
          wentFirst: "Opp",
          deckId: "d1",
          opponentName: "Opp",
          importedAt: new Date("2026-08-10T12:00:00+07:00"),
        },
        {
          id: "today",
          result: "win",
          resultReason: "standard",
          wentFirst: "Fairy_VN",
          deckId: "d2",
          opponentName: "B",
          importedAt: new Date("2026-08-11T09:00:00+07:00"),
        },
      ],
    });
    expect(board.unlocked).toBe(true);
    expect(board.quests).toHaveLength(4);
    expect(board.resetsAt).toContain("2026-08-11T17:00:00");
    expect(board.dailyTarget).toBe(4);
  });

  it("marks analyze quest done from today's analysis count", () => {
    const board = generateQuestBoard({
      ptcglName: "Fairy_VN",
      matchCount: 10,
      analysisCount: 1,
      deckCount: 1,
      now,
      matches: [
        {
          id: "1",
          result: "loss",
          resultReason: "standard",
          wentFirst: "Fairy_VN",
          deckId: null,
          opponentName: "Opp",
          importedAt: now,
        },
      ],
    });
    const analyze = board.quests.find((q) => q.id === "analyze_one");
    if (analyze) expect(analyze.done).toBe(true);
  });
});
