import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { inferPlayStyleFromRecent } from "./playstyles";

const dir = dirname(fileURLToPath(import.meta.url));
const froslassLog = readFileSync(
  join(dir, "../parser/fixtures/sample-battle-banette-dhelmise.txt"),
  "utf8",
);

describe("playstyles", () => {
  it("infers aggressive from fast OHKO wins", () => {
    const log = `
p1's Turn
p1's Charizard ex used attack on p2's Active for 280 damage.
p2's Active was Knocked Out!
p1 took 2 Prize cards.
All Prize cards taken. p1 wins.
`.trim();
    const style = inferPlayStyleFromRecent("p1", [
      { opponent: "p2", result: "win", wentFirst: "p1", rawLog: log },
      { opponent: "p2", result: "win", wentFirst: "p1", rawLog: log },
    ]);
    expect(style.id).toBe("aggressive");
  });

  it("infers disruptive/heavy from Iono and Boss usage", () => {
    const log = `
Fairy_VN played Iono.
Fairy_VN played Boss's Orders.
Fairy_VN's Mega Froslass ex used Resentful Refrain on opp's Active for 250 damage.
opp's Active was Knocked Out!
`.trim();
    const style = inferPlayStyleFromRecent("Fairy_VN", [
      { opponent: "opp", result: "win", wentFirst: "Fairy_VN", rawLog: log },
    ]);
    expect(["disruptive", "aggressive", "hybrid"]).toContain(style.id);
  });

  it("does not force aggressive on long banette control sample alone", () => {
    const style = inferPlayStyleFromRecent("pharaon92", [
      { opponent: "Fairy_VN", result: "loss", wentFirst: "pharaon92", rawLog: froslassLog },
    ]);
    expect(style.id).not.toBe("aggressive");
  });
});
