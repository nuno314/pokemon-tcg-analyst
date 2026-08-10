import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  extractLastOpponentKoPokemon,
  extractOpponentCards,
  resolveOpponentDeckDisplay,
} from "./opponent-deck-display";

const dir = dirname(fileURLToPath(import.meta.url));

const SAMPLE = `
Player1 played Dreepy.
Player1 evolved Dreepy to Drakloak.
Player2 played N's Zorua.
Player2 evolved N's Zorua to N's Zoroark ex.
Player2's N's Zoroark ex used Night Joker.
Player2 played Boss's Orders.
`;

describe("opponent-deck-display", () => {
  it("detects meta deck from opponent cards only (Zoroark)", () => {
    const opp = resolveOpponentDeckDisplay(SAMPLE, "Player2");
    expect(opp.name).toBe("N's Zoroark ex");
    expect(opp.isMeta).toBe(true);
    expect(opp.iconIds).toContain(571);
  });

  it("does not label opponent as Dragapult when user plays Dragapult line", () => {
    const log = `
Fairy_VN played Dreepy to the Active Spot.
zyfggotg played Beldum to the Active Spot.
Fairy_VN evolved Dreepy to Drakloak.
Fairy_VN's Dragapult ex used Phantom Dive on zyfggotg's Beldum for 60 damage.
zyfggotg's Genesect ex was Knocked Out!
`.trim();
    const opp = resolveOpponentDeckDisplay(log, "zyfggotg");
    expect(opp.name).not.toBe("Dragapult ex");
    expect(opp.name).toMatch(/Genesect|Beldum/i);
  });

  it("uses last opponent KO pokemon when meta unknown", () => {
    const log = `
p1 played Ralts.
p2 played Beldum.
p2 evolved Beldum to Metang.
p1's Gardevoir ex used attack on p2's Metang for 100 damage.
p2's Metang was Knocked Out!
p2's Metagross ex was Knocked Out!
`.trim();
    expect(extractLastOpponentKoPokemon(log, "p2")).toBe("Metagross ex");
    const opp = resolveOpponentDeckDisplay(log, "p2");
    expect(opp.name).toBe("Metagross ex");
    expect(opp.iconIds[0]).toBe(376);
  });

  it("parses sample battle log without Dragapult false positive", () => {
    const raw = readFileSync(join(dir, "../parser/fixtures/sample-battle-short.txt"), "utf8");
    const cards = extractOpponentCards(raw, "zyfggotg");
    expect(cards.some((c) => /dragapult|dreepy|drakloak/i.test(c))).toBe(false);
    const opp = resolveOpponentDeckDisplay(raw, "zyfggotg");
    expect(opp.name).not.toBe("Dragapult ex");
    expect(opp.name).toMatch(/Genesect|Beldum/i);
  });

  it("detects Festival Lead from opponent played cards", () => {
    const log = "Opp played Festival Grounds.\nOpp played Dipplin.\nOpp played Thwackey.";
    const opp = resolveOpponentDeckDisplay(log, "Opp");
    expect(opp.name).toBe("Festival Lead");
    expect(opp.iconIds.length).toBeGreaterThan(0);
  });

  it("does not call Munkidori-only dark box Dragapult (Ryozoldyck log)", () => {
    const raw = readFileSync(
      join(dir, "../parser/fixtures/sample-battle-dark-box.txt"),
      "utf8",
    );
    const opp = resolveOpponentDeckDisplay(raw, "Ryozoldyck");
    expect(opp.name).not.toBe("Dragapult ex");
    expect(opp.name).toBe("Mega Absol ex");
    expect(opp.iconIds[0]).toBe(359);
    expect(opp.isMeta).toBe(false);
  });

  it("does not call Dudunsparce deck Alakazam (pharaon92 Banette/Dhelmise)", () => {
    const raw = readFileSync(
      join(dir, "../parser/fixtures/sample-battle-banette-dhelmise.txt"),
      "utf8",
    );
    const opp = resolveOpponentDeckDisplay(raw, "pharaon92");
    expect(opp.name).not.toMatch(/Alakazam/i);
    expect(opp.name).not.toMatch(/Dragapult/i);
    expect(opp.name).toBe("Dhelmise");
    expect(opp.iconIds[0]).toBe(781);
    expect(opp.isMeta).toBe(false);
  });
});
