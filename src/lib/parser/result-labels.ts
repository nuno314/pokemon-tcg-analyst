import type { Dictionary } from "@/lib/i18n/types";

/** How the match ended (not W/L for the user). */
export type EndReason = "concede" | "standard";

export function formatEndReason(
  reason: string | null | undefined,
  labels: Dictionary["resultLabels"],
): string {
  switch (reason) {
    case "concede":
      return labels.concede;
    case "standard":
    case "win":
      return labels.standard;
    default:
      return reason?.trim() ? reason : labels.unknown;
  }
}
