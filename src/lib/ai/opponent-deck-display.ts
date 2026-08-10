import { detectMetaDeck, type MetaDeckGuide } from "@/lib/ai/meta-decks";
import { cardNameToDexId, cardNamesToDexIds } from "@/lib/pokemon/sprites";

export type OpponentDeckDisplay = {
  name: string | null;
  iconIds: number[];
  isMeta: boolean;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function extractOpponentCards(rawLog: string, opponentName: string): string[] {
  const log = rawLog.slice(0, 8000);
  const player = opponentName.trim();
  if (!player) return [];

  const names = new Set<string>();
  const played = new RegExp(`${escapeRegExp(player)} played ([^.]+?)\\.`, "gi");
  for (const m of log.matchAll(played)) {
    const name = m[1]?.trim();
    if (name && name.length < 60) names.add(name);
  }
  const evolved = new RegExp(`${escapeRegExp(player)} evolved .+ to ([^.]+?)\\.`, "gi");
  for (const m of log.matchAll(evolved)) {
    const name = m[1]?.trim();
    if (name && name.length < 60) names.add(name);
  }
  const used = new RegExp(`${escapeRegExp(player)}'s (.+?) used `, "gi");
  for (const m of log.matchAll(used)) {
    const name = m[1]?.trim();
    if (name && name.length < 60) names.add(name);
  }

  return [...names].slice(0, 16);
}

function opponentLogSnippet(rawLog: string, opponentName: string): string {
  const player = opponentName.trim().toLowerCase();
  if (!player) return "";
  return rawLog
    .split("\n")
    .filter((line) => line.toLowerCase().includes(player))
    .join("\n")
    .slice(0, 4000);
}

function metaIconIds(deck: MetaDeckGuide): number[] {
  if (deck.iconIds?.length) return deck.iconIds;
  return cardNamesToDexIds(deck.keyCards, 2);
}

export function resolveOpponentDeckDisplay(
  rawLog: string,
  opponentName: string,
): OpponentDeckDisplay {
  const cards = extractOpponentCards(rawLog, opponentName);
  const snippet = opponentLogSnippet(rawLog, opponentName);
  const meta = detectMetaDeck(cards, snippet);

  if (meta) {
    return {
      name: meta.name,
      iconIds: metaIconIds(meta),
      isMeta: true,
    };
  }

  const iconIds = cardNamesToDexIds(cards, 2);
  if (iconIds.length > 0) {
    const lead = cards.find((c) => cardNamesToDexIds([c], 1).length > 0) ?? cards[0];
    return {
      name: lead ?? null,
      iconIds,
      isMeta: false,
    };
  }

  return { name: null, iconIds: [], isMeta: false };
}
