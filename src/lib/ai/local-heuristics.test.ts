import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  aggregatePlayerPatterns,
  analyzeMatchLocal,
  assessPlayerLocal,
} from "./local-heuristics";
import { parseBattleLog } from "@/lib/parser/ptcgl-log";

const dir = dirname(fileURLToPath(import.meta.url));
const sampleLog = readFileSync(
  join(dir, "../parser/fixtures/sample-battle-short.txt"),
  "utf8",
);

function noMetaText(text: string) {
  expect(text.toLowerCase()).not.toMatch(/openai/);
  expect(text.toLowerCase()).not.toMatch(/chạy local/);
  expect(text.toLowerCase()).not.toMatch(/phân tích local/);
}

describe("analyzeMatchLocal", () => {
  it("mentions turn moments and opponent, not OpenAI meta", () => {
    const parsed = parseBattleLog(sampleLog);
    const out = analyzeMatchLocal({
      ptcglName: "Fairy_VN",
      opponentName: "zyfggotg",
      result: "win",
      wentFirst: "Fairy_VN",
      deckName: "Mega Starmie",
      turnCount: parsed.turns.length,
      rawLog: sampleLog,
    });

    noMetaText(out.summary);
    expect(out.summary).toMatch(/zyfggotg/);
    const joined = [...out.goodPlays, ...out.mistakes, ...out.tips].join(" ");
    expect(joined).toMatch(/Turn \d+/);
  });
});

describe("assessPlayerLocal", () => {
  it("uses opponent names from recent logs", () => {
    const out = assessPlayerLocal({
      ptcglName: "Fairy_VN",
      matchCount: 12,
      wins: 7,
      losses: 5,
      firstWinRate: 0.5,
      secondWinRate: 0.6,
      deckStats: [{ name: "Mega Starmie", wins: 5, losses: 2 }],
      recent: [
        {
          opponent: "zyfggotg",
          result: "win",
          resultReason: "concede",
          wentFirst: "Fairy_VN",
          deck: "Mega Starmie",
          rawLog: sampleLog,
        },
        {
          opponent: "zyfggotg",
          result: "loss",
          resultReason: "standard",
          wentFirst: "zyfggotg",
          deck: "Mega Starmie",
          rawLog: sampleLog.replace("Fairy_VN wins", "zyfggotg wins"),
        },
      ],
    });

    noMetaText(out.summary);
    const all = [out.summary, ...out.strengths, ...out.weaknesses, ...out.focus].join(" ");
    expect(all).toMatch(/zyfggotg|Form|Deck/);
    expect(all).toMatch(/Prize checking|Prize mapping|Sequencing/i);
  });
});

describe("aggregatePlayerPatterns", () => {
  it("detects repeat opponents", () => {
    const patterns = aggregatePlayerPatterns("Fairy_VN", [
      {
        opponent: "Alpha",
        result: "win",
        resultReason: "concede",
        wentFirst: "Fairy_VN",
        deck: null,
        rawLog: sampleLog,
      },
      {
        opponent: "Alpha",
        result: "loss",
        resultReason: "standard",
        wentFirst: "Alpha",
        deck: null,
        rawLog: sampleLog,
      },
    ]);
    expect(patterns.some((p) => p.includes("Alpha"))).toBe(true);
  });
});
