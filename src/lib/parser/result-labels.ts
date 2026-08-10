/** How the match ended (not W/L for the user). */
export type EndReason = "concede" | "standard";

export function formatEndReason(reason: string | null | undefined): string {
  switch (reason) {
    case "concede":
      return "Đối thủ/concede";
    case "standard":
    case "win":
      return "Kết thúc chuẩn (KO/prize)";
    default:
      return reason?.trim() ? reason : "Không rõ";
  }
}
