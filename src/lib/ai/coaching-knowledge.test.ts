import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  analyzeMatchSignals,
  coachingTopicsForMatch,
  coachingTopicsForPlayer,
} from "./coaching-knowledge";
import { parseBattleLog } from "@/lib/parser/ptcgl-log";

const dir = dirname(fileURLToPath(import.meta.url));
const sampleLog = readFileSync(
  join(dir, "../parser/fixtures/sample-battle-short.txt"),
  "utf8",
);

describe("coaching-knowledge", () => {
  it("flags prize mapping when going first with early KO loss pattern", () => {
    const parsed = parseBattleLog(sampleLog);
    const signals = analyzeMatchSignals(
      sampleLog,
      parsed,
      "Fairy_VN",
      "zyfggotg",
      true,
      parsed.turns.length,
    );
    expect(signals.wentFirstMe).toBe(true);
    const topics = coachingTopicsForMatch(signals, "loss");
    expect(topics).toContain("prize_checking");
  });

  it("includes foundational topics for player assessment", () => {
    const topics = coachingTopicsForPlayer("Fairy_VN", [
      {
        opponent: "zyfggotg",
        result: "win",
        rawLog: sampleLog,
        wentFirst: "Fairy_VN",
      },
    ]);
    expect(topics).toContain("prize_checking");
  });
});
