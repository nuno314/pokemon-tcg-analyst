import { describe, expect, it } from "vitest";
import { limitlessCardImageUrl, padCollectorNumber } from "./card-images";

describe("limitlessCardImageUrl", () => {
  it("builds padded Limitless scan URLs", () => {
    expect(padCollectorNumber("62")).toBe("062");
    expect(padCollectorNumber("129")).toBe("129");
    expect(limitlessCardImageUrl("POR", "62")).toBe(
      "https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/POR/POR_062_R_EN.png",
    );
    expect(limitlessCardImageUrl("asc", "47", "thumb")).toBe(
      "https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci/ASC/ASC_047_R_EN_XS.png",
    );
  });
});
