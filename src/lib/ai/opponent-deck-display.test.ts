import { describe, expect, it } from "vitest";
import { resolveOpponentDeckDisplay } from "./opponent-deck-display";

const SAMPLE = `
Player1 played Dreepy.
Player2 played N's Zorua.
Player2 evolved N's Zorua to N's Zoroark ex.
Player2's N's Zoroark ex used Night Joker.
Player2 played Boss's Orders.
`;

describe("opponent-deck-display", () => {
  it("detects meta deck and icons for Zoroark", () => {
    const opp = resolveOpponentDeckDisplay(SAMPLE, "Player2");
    expect(opp.name).toBe("N's Zoroark ex");
    expect(opp.isMeta).toBe(true);
    expect(opp.iconIds).toContain(571);
  });

  it("detects Festival Lead from log", () => {
    const log = "Opp played Festival Grounds. Opp played Dipplin. Festival Lead ability.";
    const opp = resolveOpponentDeckDisplay(log, "Opp");
    expect(opp.name).toBe("Festival Lead");
    expect(opp.iconIds.length).toBeGreaterThan(0);
  });
});
