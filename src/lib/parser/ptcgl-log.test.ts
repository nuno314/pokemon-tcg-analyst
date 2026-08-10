import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { parseDeckList } from "./deck-list";
import { parseBattleLog, resolveMatchResult } from "./ptcgl-log";

const dir = dirname(fileURLToPath(import.meta.url));

describe("parseDeckList", () => {
  it("parses the sample Mega Starmie list as 60 cards", () => {
    const raw = readFileSync(join(dir, "fixtures/sample-deck.txt"), "utf8");
    const parsed = parseDeckList(raw);

    expect(parsed.totalCards).toBe(60);
    expect(parsed.pokemonTypes).toBe(9);
    expect(parsed.trainerTypes).toBe(15);
    expect(parsed.energyTypes).toBe(3);
    expect(parsed.cards.find((c) => c.name.includes("Basic {W} Energy"))).toBeTruthy();
    expect(parsed.warnings.filter((w) => w.startsWith("Unrecognized"))).toHaveLength(0);
  });
});

describe("parseBattleLog", () => {
  it("parses players, turns, and concede winner", () => {
    const raw = readFileSync(join(dir, "fixtures/sample-battle-short.txt"), "utf8");
    const parsed = parseBattleLog(raw);

    expect(parsed.players).toEqual(expect.arrayContaining(["Fairy_VN", "zyfggotg"]));
    expect(parsed.wentFirst).toBe("Fairy_VN");
    expect(parsed.winner).toBe("Fairy_VN");
    expect(parsed.resultReason).toBe("concede");
    expect(parsed.turns.length).toBeGreaterThanOrEqual(4);
    expect(parsed.setup.some((e) => e.type === "coin_flip")).toBe(true);

    const result = resolveMatchResult(parsed, "Fairy_VN");
    expect(result.result).toBe("win");
    expect(result.opponentName).toBe("zyfggotg");
  });

  it("extracts winner from prize knockout sentence", () => {
    const raw = `
pharaon92 chose tails for the opening coin flip.
Fairy_VN won the coin toss.
pharaon92 decided to go first.
Fairy_VN's Turn
Fairy_VN ended their turn.
pharaon92's Turn
pharaon92 ended their turn.
Knocked Out all your opponent's Pokémon in play and took all your Prize cards. Fairy_VN wins.
`.trim();
    const parsed = parseBattleLog(raw);
    expect(parsed.winner).toBe("Fairy_VN");
    expect(parsed.resultReason).toBe("standard");
    expect(resolveMatchResult(parsed, "Fairy_VN").result).toBe("win");
  });
});
