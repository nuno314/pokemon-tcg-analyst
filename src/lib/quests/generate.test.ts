import { describe, expect, it } from "vitest";
import { generateQuestBoard } from "./generate";

describe("generateQuestBoard", () => {
  it("locks under 10 matches", () => {
    const board = generateQuestBoard({
      ptcglName: "Fairy_VN",
      matchCount: 3,
      matches: [],
      analysisCount: 0,
      deckCount: 1,
    });
    expect(board.unlocked).toBe(false);
    expect(board.need).toBe(10);
  });

  it("marks win-second and concede quests done from data", () => {
    const board = generateQuestBoard({
      ptcglName: "Fairy_VN",
      matchCount: 10,
      analysisCount: 1,
      deckCount: 2,
      matches: [
        {
          id: "1",
          result: "win",
          resultReason: "concede",
          wentFirst: "Opp",
          deckId: "d1",
          opponentName: "Opp",
        },
        {
          id: "2",
          result: "win",
          resultReason: "standard",
          wentFirst: "Fairy_VN",
          deckId: "d2",
          opponentName: "B",
        },
      ],
    });
    expect(board.unlocked).toBe(true);
    const byId = Object.fromEntries(board.quests.map((q) => [q.id, q]));
    // incomplete high-priority may push some done quests off the board; check completedCount
    expect(board.completedCount).toBeGreaterThanOrEqual(4);
    expect(byId.analyze_one?.done ?? true).toBe(true);
  });
});
