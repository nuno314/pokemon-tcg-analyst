/**
 * Limitless TCG hosts English print scans using set code + collector number.
 * Example: POR 62 → .../tpci/POR/POR_062_R_EN.png
 */
const LIMITLESS_BASE =
  "https://limitlesstcg.nyc3.digitaloceanspaces.com/tpci";

export function padCollectorNumber(collectorNumber: string): string {
  const match = collectorNumber.trim().match(/^(\d+)([a-zA-Z]?)$/);
  if (!match) return collectorNumber.trim().padStart(3, "0");
  return `${match[1].padStart(3, "0")}${match[2]}`;
}

export function limitlessCardImageUrl(
  setCode: string,
  collectorNumber: string,
  size: "full" | "thumb" = "full",
): string {
  const set = setCode.trim().toUpperCase();
  const num = padCollectorNumber(collectorNumber);
  const suffix = size === "thumb" ? "_R_EN_XS.png" : "_R_EN.png";
  return `${LIMITLESS_BASE}/${set}/${set}_${num}${suffix}`;
}
