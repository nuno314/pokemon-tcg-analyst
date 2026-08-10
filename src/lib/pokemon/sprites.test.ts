import { describe, expect, it } from "vitest";
import { cardNameToDexId, cardNamesToDexIds } from "./sprites";

describe("pokemon sprites", () => {
  it("maps Dragapult ex to dex 887", () => {
    expect(cardNameToDexId("Dragapult ex")).toBe(887);
  });

  it("picks ex cards first for icons", () => {
    const ids = cardNamesToDexIds(["Dreepy", "Dragapult ex", "Drakloak"], 2);
    expect(ids[0]).toBe(887);
  });
});
