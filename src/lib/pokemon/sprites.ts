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
  yveltal: 717,
  pecharunt: 1025,
  "pecharunt ex": 1025,
  absol: 359,
  "mega absol ex": 359,
  "mega kangaskhan ex": 115,
  shaymin: 492,
  froslass: 478,
  "mega froslass ex": 478,
  snorunt: 361,
  staryu: 120,
  starmie: 121,
  "mega starmie ex": 121,
  shuppet: 353,
  banette: 354,
  dhelmise: 781,
  dunsparce: 206,
  dudunsparce: 982,
  poltchageist: 1012,
  sinistcha: 1013,
  "n's zoroark ex": 571,
  "n's zoroark": 571,
  "n's zorua": 570,
  zoroark: 571,
  crustle: 558,
  dwebble: 557,
  slowking: 199,
  slowpoke: 79,
  beldum: 374,
  metagross: 376,
  metang: 375,
  genesect: 649,
  "genesect ex": 649,
  hydrapple: 1019,
  "hydrapple ex": 1019,
  dipplin: 1011,
  applin: 840,
  meganium: 154,
  alakazam: 65,
  "alakazam ex": 65,
  abra: 63,
  kadabra: 64,
  "raging bolt ex": 1021,
  "raging bolt": 1021,
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
  mewtwo: 150,
  "team rocket's mewtwo ex": 150,
  spidops: 918,
  "team rocket's spidops": 918,
  tarountula: 917,
  mimikyu: 778,
  trevenant: 709,
  "hop's trevenant": 709,
  phantump: 708,
  "hop's phantump": 708,
  beedrill: 15,
  "beedrill ex": 15,
  weedle: 13,
  kakuna: 14,
  garchomp: 445,
  "cynthia's garchomp ex": 445,
  gible: 443,
  gabite: 444,
  roserade: 407,
  lopunny: 428,
  "mega lopunny ex": 428,
  buneary: 427,
  grimmsnarl: 861,
  "marnie's grimmsnarl ex": 861,
  impidimp: 859,
  morgrem: 860,
  greninja: 658,
  "mega greninja": 658,
  froakie: 656,
  frogadier: 657,
  chikorita: 152,
  bayleef: 153,
  sylveon: 700,
  eevee: 133,
  archaludon: 1018,
  "archaludon ex": 1018,
  duraludon: 884,
  heatran: 485,
};

export function cardNameToDexId(name: string): number | null {
  const n = normCard(name);
  if (CARD_TO_DEX[n]) return CARD_TO_DEX[n];
  const noEx = n.replace(/\s+ex$/, "").trim();
  if (CARD_TO_DEX[noEx]) return CARD_TO_DEX[noEx];

  let best: { key: string; id: number } | null = null;
  for (const [key, id] of Object.entries(CARD_TO_DEX)) {
    if (key.length < 4) continue;
    if (n.includes(key) || noEx.includes(key)) {
      if (!best || key.length > best.key.length) best = { key, id };
    }
  }
  return best?.id ?? null;
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
