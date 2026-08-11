import { describe, expect, it } from "vitest";
import {
  detectMetaDeck,
  detectMetaLogSignals,
  metaMatchupNotes,
  META_DECKS,
} from "./meta-decks";

describe("meta-decks", () => {
  it("detects Dragapult from card names", () => {
    const deck = detectMetaDeck(["Dreepy", "Drakloak", "Dragapult ex", "Dusknoir"]);
    expect(deck?.id).toBe("dragapult");
    expect(deck?.name).toContain("Dragapult");
  });

  it("detects Zoroark line", () => {
    const deck = detectMetaDeck(["N's Zorua", "N's Zoroark ex"]);
    expect(deck?.id).toBe("zoroark");
  });

  it("detects Festival Lead before generic Dipplin/Hydrapple", () => {
    const deck = detectMetaDeck(["Dipplin", "Thwackey"], "played Festival Grounds. Festival Lead");
    expect(deck?.id).toBe("festival_lead");
  });

  it("detects Mega Lucario from Solrock + Lucario", () => {
    const deck = detectMetaDeck(["Solrock", "Mega Lucario ex"], "Premium Power Pro attached");
    expect(deck?.id).toBe("mega_lucario");
  });

  it("returns log signals for Night Joker", () => {
    const zoro = META_DECKS.find((d) => d.id === "zoroark")!;
    const tips = detectMetaLogSignals("N's Zoroark ex used Night Joker", zoro, "loss");
    expect(tips.some((t) => /Night Joker/i.test(t))).toBe(true);
  });

  it("Crustle counter mentions non-ex", () => {
    const crustle = META_DECKS.find((d) => d.id === "crustle")!;
    expect(crustle.counters.some((c) => /non-ex/i.test(c))).toBe(true);
  });

  it("matchup notes include engine and log tips", () => {
    const drag = META_DECKS.find((d) => d.id === "dragapult")!;
    const notes = metaMatchupNotes(drag, {
      wentFirstMe: true,
      result: "loss",
      log: "Dragapult ex used Phantom Dive and put 60 damage counters",
    });
    expect(notes.opponentNotes.some((n) => /Phantom Dive/i.test(n))).toBe(true);
    expect(notes.tips.some((t) => /\[Log\]/i.test(t))).toBe(true);
    expect(notes.mistakes.some((m) => /Phantom Dive/i.test(m))).toBe(true);
  });

  it("has 24 meta entries", () => {
    expect(META_DECKS).toHaveLength(24);
  });

  it("Metal Maker notes target Metang not Active Metagross", () => {
    const deck = META_DECKS.find((d) => d.id === "metagross")!;
    expect(deck.priorityTarget).toMatch(/Metang/i);
    const notes = metaMatchupNotes(deck, { wentFirstMe: true, result: "loss" });
    expect(notes.opponentNotes.some((n) => /Target ưu tiên/i.test(n))).toBe(true);
    expect(notes.tips.some((t) => /prize map/i.test(t))).toBe(true);
  });
});
