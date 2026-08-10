import { detectMetaDeckFromCards, type MetaDeckGuide } from "@/lib/ai/meta-decks";
import {
  extractLastOpponentKoPokemon,
  extractOpponentCards,
  isTrainerOrEnergy,
} from "@/lib/ai/opponent-log-cards";
import { cardNameToDexId, cardNamesToDexIds } from "@/lib/pokemon/sprites";

export type OpponentDeckDisplay = {
  name: string | null;
  iconIds: number[];
  isMeta: boolean;
};

export { extractLastOpponentKoPokemon, extractOpponentCards };

function metaIconIds(deck: MetaDeckGuide, cards: string[]): number[] {
  const matched = cards.filter((c) =>
    deck.keyCards.some((k) => {
      const key = k.toLowerCase().replace(/\s+ex$/, "");
      return c.toLowerCase().includes(key);
    }),
  );
  const fromLog = cardNamesToDexIds(matched, 2);
  if (fromLog.length > 0) return fromLog;
  return deck.iconIds.slice(0, 1);
}

function scorePokemon(name: string) {
  return (/ ex$/i.test(name) ? 3 : 0) + (cardNameToDexId(name) ? 1 : 0);
}

/** Nhãn thực tế từ log — không ép meta. */
export function inferActualOpponentLabel(
  cards: string[],
  lastKo: string | null,
): { name: string; iconIds: number[] } {
  if (lastKo) {
    const id = cardNameToDexId(lastKo);
    return {
      name: lastKo,
      iconIds: id ? [id] : cardNamesToDexIds([lastKo], 1),
    };
  }

  const pokemon = cards.filter((c) => !isTrainerOrEnergy(c));
  const unique = [...new Set(pokemon)].sort((a, b) => scorePokemon(b) - scorePokemon(a));
  const exes = unique.filter((c) => / ex$/i.test(c));
  const top = (exes.length > 0 ? exes : unique).slice(0, 2);

  if (top.length === 0) {
    return { name: "", iconIds: [] };
  }
  if (top.length === 1) {
    return { name: top[0], iconIds: cardNamesToDexIds(top, 1) };
  }
  return {
    name: `${top[0]} · ${top[1]}`,
    iconIds: cardNamesToDexIds(top, 2),
  };
}

export function resolveOpponentDeckDisplay(
  rawLog: string,
  opponentName: string,
): OpponentDeckDisplay {
  const cards = extractOpponentCards(rawLog, opponentName);
  const lastKo = extractLastOpponentKoPokemon(rawLog, opponentName);
  const meta = detectMetaDeckFromCards(cards);

  if (meta) {
    return {
      name: meta.name,
      iconIds: metaIconIds(meta, cards),
      isMeta: true,
    };
  }

  const actual = inferActualOpponentLabel(cards, lastKo);
  return {
    name: actual.name || null,
    iconIds: actual.iconIds,
    isMeta: false,
  };
}
