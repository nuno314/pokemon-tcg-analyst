export type DeckCategory = "pokemon" | "trainer" | "energy";

export type ParsedDeckCard = {
  qty: number;
  name: string;
  setCode: string;
  collectorNumber: string;
  category: DeckCategory;
};

export type ParsedDeckList = {
  cards: ParsedDeckCard[];
  pokemonTypes: number;
  trainerTypes: number;
  energyTypes: number;
  totalCards: number;
  warnings: string[];
};

const SECTION_RE = /^(Pok[eé]mon|Trainer|Energy):\s*(\d+)\s*$/i;
const CARD_RE = /^(\d+)\s+(.+?)\s+([A-Z0-9]+)\s+(\d+[a-zA-Z]?)\s*$/;
const TOTAL_RE = /^Total Cards:\s*(\d+)\s*$/i;

function normalizeCategory(label: string): DeckCategory | null {
  const key = label.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
  if (key.startsWith("pokemon")) return "pokemon";
  if (key.startsWith("trainer")) return "trainer";
  if (key.startsWith("energy")) return "energy";
  return null;
}

export function parseDeckList(raw: string): ParsedDeckList {
  const lines = raw.replace(/\r\n/g, "\n").split("\n");
  const cards: ParsedDeckCard[] = [];
  const warnings: string[] = [];
  let category: DeckCategory | null = null;
  const expectedTypes: Partial<Record<DeckCategory, number>> = {};
  let declaredTotal: number | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const section = line.match(SECTION_RE);
    if (section) {
      category = normalizeCategory(section[1]);
      if (category) {
        expectedTypes[category] = Number(section[2]);
      }
      continue;
    }

    const total = line.match(TOTAL_RE);
    if (total) {
      declaredTotal = Number(total[1]);
      continue;
    }

    const card = line.match(CARD_RE);
    if (card) {
      if (!category) {
        warnings.push(`Card before section header: ${line}`);
        continue;
      }
      cards.push({
        qty: Number(card[1]),
        name: card[2].trim(),
        setCode: card[3],
        collectorNumber: card[4],
        category,
      });
      continue;
    }

    warnings.push(`Unrecognized line: ${line}`);
  }

  const totalCards = cards.reduce((sum, c) => sum + c.qty, 0);
  const typeCounts: Record<DeckCategory, number> = {
    pokemon: cards.filter((c) => c.category === "pokemon").length,
    trainer: cards.filter((c) => c.category === "trainer").length,
    energy: cards.filter((c) => c.category === "energy").length,
  };

  for (const cat of ["pokemon", "trainer", "energy"] as DeckCategory[]) {
    const expected = expectedTypes[cat];
    if (expected != null && expected !== typeCounts[cat]) {
      warnings.push(
        `${cat} header says ${expected} types but parsed ${typeCounts[cat]}`,
      );
    }
  }

  if (declaredTotal != null && declaredTotal !== totalCards) {
    warnings.push(`Total Cards header says ${declaredTotal} but sum is ${totalCards}`);
  } else if (totalCards !== 60) {
    warnings.push(`Deck has ${totalCards} cards (expected 60)`);
  }

  if (cards.length === 0) {
    throw new Error("No cards found in deck list");
  }

  return {
    cards,
    pokemonTypes: typeCounts.pokemon,
    trainerTypes: typeCounts.trainer,
    energyTypes: typeCounts.energy,
    totalCards,
    warnings,
  };
}
