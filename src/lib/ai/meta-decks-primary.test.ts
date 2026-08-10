import { describe, expect, it } from "vitest";
import { detectMetaDeckFromCards } from "./meta-decks";

describe("detectMetaDeckFromCards", () => {
  it("requires Alakazam core — not Dudunsparce alone", () => {
    expect(detectMetaDeckFromCards(["Dudunsparce", "Dunsparce", "Banette"])).toBeNull();
  });

  it("matches Dragapult only with line core", () => {
    expect(detectMetaDeckFromCards(["Munkidori", "Pecharunt ex"])).toBeNull();
    expect(detectMetaDeckFromCards(["Drakloak", "Dreepy"])?.id).toBe("dragapult");
  });

  it("matches Alakazam with Alakazam ex", () => {
    expect(detectMetaDeckFromCards(["Alakazam ex", "Ultra Ball"])?.id).toBe("alakazam");
  });
});
