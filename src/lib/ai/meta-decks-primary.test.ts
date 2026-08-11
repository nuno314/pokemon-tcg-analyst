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

  it("does not call Rocket Mewtwo from Petrel alone", () => {
    expect(detectMetaDeckFromCards(["Team Rocket's Petrel", "Lillie's Determination"])).toBeNull();
  });

  it("detects Rocket Mewtwo, Hop's Trevenant, Beedrill, Cynthia Garchomp", () => {
    expect(detectMetaDeckFromCards(["Team Rocket's Spidops", "Team Rocket's Mewtwo ex"])?.id).toBe(
      "rocket_mewtwo",
    );
    expect(detectMetaDeckFromCards(["Hop's Trevenant", "Hop's Phantump"])?.id).toBe("hops_trevenant");
    expect(detectMetaDeckFromCards(["Weedle", "Beedrill"])?.id).toBe("beedrill");
    expect(detectMetaDeckFromCards(["Cynthia's Garchomp ex", "Gible"])?.id).toBe("cynthia_garchomp");
  });

  it("does not call Metal Maker from Metagross attacker alone", () => {
    expect(detectMetaDeckFromCards(["Metagross ex", "Genesect ex"])).toBeNull();
    expect(detectMetaDeckFromCards(["Metang", "Beldum"])?.id).toBe("metagross");
  });

  it("does not call Lopunny or Grimmsnarl from shared tech", () => {
    expect(detectMetaDeckFromCards(["Dudunsparce", "Dunsparce"])).toBeNull();
    expect(detectMetaDeckFromCards(["Munkidori", "Froslass"])).toBeNull();
    expect(detectMetaDeckFromCards(["Mega Lopunny ex"])?.id).toBe("mega_lopunny");
    expect(detectMetaDeckFromCards(["Marnie's Grimmsnarl ex", "Impidimp"])?.id).toBe("grimmsnarl");
  });

  it("labels Ogerpon Meganium from Chikorita, not Teal Ogerpon alone", () => {
    expect(detectMetaDeckFromCards(["Teal Mask Ogerpon ex"])?.id).toBe("ogerpon");
    expect(detectMetaDeckFromCards(["Teal Mask Ogerpon ex", "Chikorita"])?.id).toBe("ogerpon_meganium");
    expect(detectMetaDeckFromCards(["Hydrapple ex", "Meganium"])?.id).toBe("hydrapple");
  });

  it("detects Starmie, Greninja, Sylveon, Archaludon from core only", () => {
    expect(detectMetaDeckFromCards(["Staryu", "Mega Starmie ex"])?.id).toBe("mega_starmie");
    expect(detectMetaDeckFromCards(["Froakie", "Frogadier"])?.id).toBe("mega_greninja");
    expect(detectMetaDeckFromCards(["Sylveon"])?.id).toBe("sylveon");
    expect(detectMetaDeckFromCards(["Eevee"])).toBeNull();
    expect(detectMetaDeckFromCards(["Duraludon", "Archaludon ex"])?.id).toBe("archaludon");
    expect(detectMetaDeckFromCards(["Black Belt's Training"])).toBeNull();
  });
});
