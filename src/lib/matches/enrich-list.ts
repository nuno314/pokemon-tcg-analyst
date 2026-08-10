import type { MatchListItem } from "@/components/matches/MatchList";
import { resolveOpponentDeckDisplay } from "@/lib/ai/opponent-deck-display";

type MatchRow = {
  id: string;
  opponentName: string;
  result: "win" | "loss";
  resultReason: string | null;
  wentFirst: string | null;
  importedAt: Date | null;
  deckId: string | null;
  deckName: string | null;
  rawLog: string;
};

export function enrichMatchListItems(
  rows: MatchRow[],
  deckNameById: Map<string, string>,
): MatchListItem[] {
  return rows.map((m) => {
    const opp = resolveOpponentDeckDisplay(m.rawLog, m.opponentName);
    return {
      id: m.id,
      opponentName: m.opponentName,
      result: m.result,
      resultReason: m.resultReason,
      wentFirst: m.wentFirst,
      importedAt: m.importedAt,
      deckName: m.deckName ?? (m.deckId ? deckNameById.get(m.deckId) ?? null : null),
      opponentDeckName: opp.name,
      opponentIconIds: opp.iconIds,
    };
  });
}
