/** PokeAPI official artwork — same CDN as mascots on landing. */
export function pokemonSpriteUrl(dexId: number) {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${dexId}.png`;
}

/** Normalize TCG card names for dex lookup. */
function normCard(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/['']/g, "'")
    .trim();
}

/** National dex IDs for meta / common PTCGL names. */
const CARD_TO_DEX: Record<string, number> = {
  dragapult: 887,
  "dragapult ex": 887,
  drakloak: 886,
  dreepy: 885,
  dusknoir: 477,
  munkidori: 1015,
  "n's zoroark ex": 571,
  "n's zoroark": 571,
  "n's zorua": 570,
  zoroark: 571,
  crustle: 558,
  dwebble: 557,
  slowking: 199,
  slowpoke: 79,
  metagross: 376,
  hydrapple: 1019,
  "hydrapple ex": 1019,
  dipplin: 1011,
  applin: 840,
  meganium: 154,
  alakazam: 65,
  "alakazam ex": 65,
  abra: 63,
  kadabra: 64,
  dudunsparce: 982,
  "raging bolt ex": 1021,
  "raging bolt": 1021,
  "mega kangaskhan ex": 115,
  kangaskhan: 115,
  ogerpon: 1017,
  "teal mask ogerpon ex": 1017,
  "wellspring mask ogerpon ex": 1017,
  "hearthflame mask ogerpon ex": 1017,
  "cornerstone mask ogerpon ex": 1017,
  "lillie's clefairy ex": 35,
  clefairy: 35,
  cleffa: 173,
  clefable: 36,
  honchkrow: 430,
  "rocket's honchkrow": 430,
  murkrow: 198,
  porygon2: 233,
  thwackey: 811,
  rillaboom: 812,
  solrock: 338,
  lucario: 448,
  "mega lucario ex": 448,
  "lucario ex": 448,
  charizard: 6,
  "charizard ex": 6,
  gardevoir: 282,
  miraidon: 1008,
  "miraidon ex": 1008,
};

export function cardNameToDexId(name: string): number | null {
  const n = normCard(name);
  if (CARD_TO_DEX[n]) return CARD_TO_DEX[n];
  const noEx = n.replace(/\s+ex$/, "").trim();
  if (CARD_TO_DEX[noEx]) return CARD_TO_DEX[noEx];
  for (const [key, id] of Object.entries(CARD_TO_DEX)) {
    if (n.includes(key) || key.includes(noEx)) return id;
  }
  return null;
}

export function cardNamesToDexIds(names: string[], limit = 2): number[] {
  const ids: number[] = [];
  const sorted = [...names].sort((a, b) => {
    const score = (s: string) => (/ ex$/i.test(s) ? 2 : 0) + s.length;
    return score(b) - score(a);
  });
  for (const name of sorted) {
    const id = cardNameToDexId(name);
    if (id && !ids.includes(id)) ids.push(id);
    if (ids.length >= limit) break;
  }
  return ids;
}
