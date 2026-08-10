/** How the match ended (not W/L for the user). */
export type EndReason = "concede" | "standard";

export function formatEndReason(reason: string | null | undefined): string {
  switch (reason) {
    case "concede":
      return "Concede";
    case "standard":
    case "win": // legacy value from earlier builds
      return "Standard finish";
    default:
      return reason?.trim() ? reason : "Unknown";
  }
}
