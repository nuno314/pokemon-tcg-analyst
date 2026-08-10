/**
 * Meta decks Mega Evolution era — detect từ log + matchup/counter local.
 */
export type MetaDeckId =
  | "dragapult"
  | "zoroark"
  | "crustle"
  | "slowking"
  | "hydrapple"
  | "alakazam"
  | "raging_bolt"
  | "ogerpon"
  | "clefairy"
  | "honchkrow"
  | "festival_lead"
  | "mega_lucario";

export type MetaLogSignal = {
  pattern: RegExp;
  tip: string;
  onLoss?: boolean;
};

export type MetaDeckGuide = {
  id: MetaDeckId;
  name: string;
  share: string;
  keywords: RegExp;
  engine: string;
  plan: string;
  keyCards: string[];
  iconIds: number[];
  logSignals: MetaLogSignal[];
  counters: string[];
  watch: string[];
  ifGoingFirst: string;
  ifGoingSecond: string;
};

export const META_DECKS: MetaDeckGuide[] = [
  {
    id: "dragapult",
    name: "Dragapult ex",
    share: "49%",
    keywords: /dragapult|phantom dive|drakloak|dreepy|dusknoir|munkidori/i,
    engine:
      "Phantom Dive spread 60 damage lên bench; Drakloak draw engine; Munkidori/Dusknoir manipulate damage để pick off Mega ex setup trước multi-prize turn.",
    plan: "Bench snipe + spread — xé Mega ex và setup trước khi finish.",
    keyCards: ["Dragapult ex", "Drakloak", "Dusknoir", "Munkidori", "Dreepy"],
    iconIds: [887, 477],
    logSignals: [
      {
        pattern: /phantom dive|60 damage counters/i,
        tip: "Phantom Dive đã spread bench — giảm bench yếu, heal/switch Active, KO partner setup (Dusknoir/Munkidori) trước.",
        onLoss: true,
      },
      { pattern: /dusknoir|munkidori/i, tip: "Partner damage manipulation on field — ưu tiên Boss lên Dusknoir/Munkidori." },
    ],
    counters: [
      "Bench ít và HP cao turn 1–2; Phantom Dive punish bench mỏng.",
      "Boss Dusknoir/Munkidori trước khi Dragapult chain multi-prize.",
      "Prize map: họ snipe setup Mega — cần pressure Active hoặc 2-prize sớm.",
      "Rescue Board / Air Balloon tránh trade Active xấu sau spread.",
    ],
    watch: ["Phantom Dive", "Dusknoir/Munkidori", "Dragapult ex turn 2–3"],
    ifGoingFirst: "Bench tanky tối thiểu; attach sớm; đừng flood bench trước turn 2.",
    ifGoingSecond: "Stabilize; Boss partner Pokémon; clear bench damage carriers.",
  },
  {
    id: "zoroark",
    name: "N's Zoroark ex",
    share: "8%",
    keywords: /n's zoroark|n's zorua|night joker|trade ability/i,
    engine:
      "Trade discard→draw 2; acceleration cụ thể; Night Joker copy attack nặng từ bench N's Pokémon — toolbox disruptive.",
    plan: "Draw engine + copy attack — pressure liên tục, linh hoạt theo bench.",
    keyCards: ["N's Zoroark ex", "N's Zorua", "Night Joker"],
    iconIds: [571],
    logSignals: [
      { pattern: /night joker|copied.*attack/i, tip: "Night Joker copy attack — xem bench N's Pokémon nào bị copy; Boss target đó hoặc Zoroark ex." },
      { pattern: /trade/i, tip: "Trade engine chạy — Iono sau khi họ discard/draw nhiều." },
    ],
    counters: [
      "Iono timing sau khi engine setup; reset hand.",
      "KO bench Pokémon bị copy (Night Joker targets) trước.",
      "Finish Zoroark ex; tránh grind 1-prize vào Zorua vô ích.",
    ],
    watch: ["N's Zorua turn 1", "Night Joker", "Discard pile lớn"],
    ifGoingFirst: "Pressure turn 2; chuẩn bị Iono turn 3–4.",
    ifGoingSecond: "Identify copy target; Boss Zoroark ex khi lộ.",
  },
  {
    id: "crustle",
    name: "Crustle (Mysterious Rock Inn)",
    share: "6%",
    keywords: /crustle|dwebble|mysterious rock inn|rock inn/i,
    engine:
      "Mysterious Rock Inn: Crustle **không nhận damage từ attack của Pokémon ex** — stall/damage denial.",
    plan: "Tank non-ex immune + lock game — win dài hoặc out-resource.",
    keyCards: ["Crustle", "Dwebble", "Mysterious Rock Inn"],
    iconIds: [558],
    logSignals: [
      {
        pattern: /mysterious rock inn|didn't take any damage.*ex/i,
        tip: "Rock Inn active — attack bằng **non-ex** hoặc ability damage; đừng chỉ swing ex vào Crustle.",
        onLoss: true,
      },
    ],
    counters: [
      "Answer bằng non-ex attacker hoặc ability damage (không phải ex attack).",
      "Race prize trước stall; đừng grind dài.",
      "KO Dwebble line sớm trước khi Crustle + Inn ổn định.",
    ],
    watch: ["Crustle Active", "Mysterious Rock Inn trigger", "Turn count >8"],
    ifGoingFirst: "Identify Crustle turn 1–2; chuyển sang non-ex plan ngay.",
    ifGoingSecond: "Max prize pressure; không over-setup.",
  },
  {
    id: "slowking",
    name: "Slowking (Seek Inspiration)",
    share: "6%",
    keywords: /slowking|seek inspiration|ciphermaniac|academy at night|metagross/i,
    engine:
      "Seek Inspiration discard top deck, copy attack non-Rule Box; Ciphermaniac/Academy at Night stack top cho burst (Metagross-style).",
    plan: "Top-deck manipulation + copy huge attack.",
    keyCards: ["Slowking", "Ciphermaniac's Codebreaking", "Academy at Night", "Metagross"],
    iconIds: [199, 376],
    logSignals: [
      { pattern: /seek inspiration/i, tip: "Seek Inspiration copy — biết top deck họ setup gì; pressure trước copy turn." },
      { pattern: /ciphermaniac|academy at night/i, tip: "Top deck stacked — Boss Slowking hoặc disrupt trước burst turn." },
    ],
    counters: [
      "Race prize; họ scale turn 3–5 sau stack top.",
      "Boss Slowking trước copy Metagross-level damage.",
      "Iono sau Ciphermaniac/Academy setup.",
    ],
    watch: ["Seek Inspiration", "Top deck tutors", "Slowking Active"],
    ifGoingFirst: "Pressure nếu có; Iono trước engine.",
    ifGoingSecond: "Boss Slowking sớm; đừng pass nhiều turn.",
  },
  {
    id: "hydrapple",
    name: "Hydrapple ex",
    share: "5%",
    keywords: /hydrapple|syrup storm|meganium|applin/i,
    engine:
      "Meganium double Grass attach; Teal Mask Ogerpon accel; Syrup Storm scale damage + heal board.",
    plan: "Energy snowball → infinite-scaling Syrup Storm OHKO.",
    keyCards: ["Hydrapple ex", "Meganium", "Teal Mask Ogerpon ex", "Dipplin"],
    iconIds: [1019, 154],
    logSignals: [
      { pattern: /syrup storm/i, tip: "Syrup Storm scaling — KO Hydrapple ex hoặc strip energy trước turn damage lớn." },
      { pattern: /meganium/i, tip: "Meganium double attach online — ưu tiên Boss Meganium hoặc rush trước snowball." },
    ],
    counters: [
      "Boss Hydrapple/Meganium trước Syrup Storm scale.",
      "Fire weakness nếu deck bạn có.",
      "Chặn Rare Candy + attach chain turn 2–3.",
    ],
    watch: ["Meganium", "Grass energy stack", "Syrup Storm"],
    ifGoingFirst: "Boss bench grass trước Candy.",
    ifGoingSecond: "Snipe Meganium; không để free attach turn.",
  },
  {
    id: "alakazam",
    name: "Alakazam (Powerful Hand)",
    share: "5%",
    keywords: /alakazam|powerful hand|dudunsparce|abra|kadabra/i,
    engine: "Alakazam draw flood + Dudunsparce; Powerful Hand OHKO Active từ hand lớn.",
    plan: "Draw engine → one-shot Active.",
    keyCards: ["Alakazam", "Dudunsparce", "Powerful Hand"],
    iconIds: [65],
    logSignals: [
      { pattern: /powerful hand/i, tip: "Powerful Hand OHKO window — Iono trước hoặc switch/tank Active turn này.", onLoss: true },
      { pattern: /dudunsparce/i, tip: "Dudunsparce draw online — hand disruption càng sớm càng tốt." },
    ],
    counters: [
      "Iono sau draw engine; hand size là win condition họ.",
      "KO Alakazam line trước Powerful Hand turn.",
      "Tank Active nếu biết họ có OHKO line.",
    ],
    watch: ["Hand size opp", "Dudunsparce", "Powerful Hand"],
    ifGoingFirst: "Hand disruption turn 3.",
    ifGoingSecond: "Boss Alakazam nếu lộ turn 1–2.",
  },
  {
    id: "raging_bolt",
    name: "Raging Bolt ex",
    share: "4%",
    keywords: /raging bolt|bellowing thunder|climactic descent|mega kangaskhan/i,
    engine:
      "Mega Kangaskhan + Teal Ogerpon draw/accel; discard Basic Energy fuel Bellowing Thunder OHKO Mega ex.",
    plan: "Aggressive scaling OHKO high-HP Mega.",
    keyCards: ["Raging Bolt ex", "Mega Kangaskhan ex", "Teal Mask Ogerpon ex"],
    iconIds: [1021, 115],
    logSignals: [
      { pattern: /bellowing thunder|climactic descent/i, tip: "Bellowing Thunder turn — Boss Bolt thiếu energy hoặc tank nếu chưa fuel đủ.", onLoss: true },
      { pattern: /mega kangaskhan/i, tip: "Mega Kangaskhan draw engine — disrupt hoặc pressure trước Bolt setup." },
    ],
    counters: [
      "Energy denial trước Bellowing Thunder.",
      "Boss Raging Bolt khi chưa discard fuel.",
      "Bench không overextend vs OHKO line.",
    ],
    watch: ["Energy discard", "Raging Bolt ex", "Mega Kangaskhan"],
    ifGoingFirst: "Safe bench; có answer turn 2 opp.",
    ifGoingSecond: "Stabilize + Boss; race prize.",
  },
  {
    id: "ogerpon",
    name: "Ogerpon Box (Slop Box)",
    share: "3%",
    keywords: /ogerpon|ogre's mask|wellspring|hearthflame|cornerstone|crispin|teal mask ogerpon/i,
    engine:
      "Teal Mask Ogerpon draw/accel; Ogre's Mask cycle forms; Crispin multi-type — toolbox control/burst.",
    plan: "Form cycle + tech attackers theo matchup.",
    keyCards: ["Teal Mask Ogerpon ex", "Ogre's Mask", "Crispin"],
    iconIds: [1017],
    logSignals: [
      { pattern: /ogre's mask|ogres mask/i, tip: "Ogre's Mask form swap — identify form hiện tại để chọn Boss target đúng." },
      { pattern: /crispin/i, tip: "Crispin energy fix — expect multi-type attack next turn." },
    ],
    counters: [
      "Answer đúng form (Water/Fire/Rock/Grass).",
      "KO Teal Ogerpon engine khi overextended.",
      "Đừng Boss sai target sau mask swap.",
    ],
    watch: ["Form change", "Teal Mask Ogerpon", "Crispin"],
    ifGoingFirst: "Pressure first form; track mask.",
    ifGoingSecond: "Identify form → Boss đúng type weak.",
  },
  {
    id: "clefairy",
    name: "Lillie's Clefairy ex",
    share: "2%",
    keywords: /lillie's clefairy|clefairy ex|full moon rondo|cleffa|clefable/i,
    engine:
      "Full Moon Rondo scale theo **tổng bench**; hard counter Dragon (Dragapult); Lillie support toolbox.",
    plan: "Low bench on your side = less damage; họ muốn nhiều bench để scale.",
    keyCards: ["Lillie's Clefairy ex", "Full Moon Rondo", "Lillie"],
    iconIds: [35],
    logSignals: [
      {
        pattern: /full moon rondo/i,
        tip: "Full Moon Rondo scales với bench — **giữ bench thấp (2–3)** để giảm damage.",
        onLoss: true,
      },
    ],
    counters: [
      "Giữ bench thấp vs Clefairy — đừng flood bench.",
      "Dragon weak — nếu bạn Dragapult line, expect hard counter.",
      "Boss Clefairy ex; Iono khi support chain.",
    ],
    watch: ["Full Moon Rondo", "Total bench count", "Lillie supporter"],
    ifGoingFirst: "Minimal bench; attach fast.",
    ifGoingSecond: "Stabilize với bench ít; Boss Clefairy.",
  },
  {
    id: "honchkrow",
    name: "Rocket's Honchkrow",
    share: "2%",
    keywords: /honchkrow|rocket's honchkrow|team rocket|murkrow|porygon2/i,
    engine:
      "1-prize anti-meta; Team Rocket supporter scale damage; OHKO Mega ex.",
    plan: "Single-prize aggro — trade 2-for-1 prize vs Mega ex.",
    keyCards: ["Rocket's Honchkrow", "Team Rocket's", "Murkrow"],
    iconIds: [430],
    logSignals: [
      { pattern: /team rocket|rocket's/i, tip: "Rocket engine scaling — hand disruption; tránh feed easy 2-prize KO line.", onLoss: true },
    ],
    counters: [
      "Prize trade: đừng để Honchkrow OHKO Mega ex rồi chỉ lấy 1 prize.",
      "Boss Honchkrow; pressure trước supporter chain.",
      "Non-ex attackers hoặc 1-prize pivot nếu có.",
    ],
    watch: ["Murkrow/Honchkrow", "Rocket supporter", "Damage scaling"],
    ifGoingFirst: "Search Boss; pressure turn 2.",
    ifGoingSecond: "Identify anti-meta line sớm.",
  },
  {
    id: "festival_lead",
    name: "Festival Lead",
    share: "meta",
    keywords: /festival lead|festival grounds|boom boom groove|thwackey|gladion|brave bangle/i,
    engine:
      "Dipplin + Festival Grounds: Festival Lead cho **attack 2 lần**/turn; Thwackey Boom Boom Groove search; Brave Bangle/Gladion boost — burst OHKO Mega.",
    plan: "Double attack turn under Stadium → combined damage xé Mega ex.",
    keyCards: ["Dipplin", "Festival Grounds", "Festival Lead", "Thwackey", "Brave Bangle"],
    iconIds: [1011, 811],
    logSignals: [
      {
        pattern: /festival grounds|festival lead/i,
        tip: "Festival Grounds + Lead online — expect **2 attacks** this turn; tank/switch hoặc KO Dipplin/Thwackey trước.",
        onLoss: true,
      },
      { pattern: /boom boom groove|thwackey/i, tip: "Thwackey search engine — disrupt stadium hoặc Boss Thwackey." },
      { pattern: /brave bangle|gladion/i, tip: "Damage modifier attached — damage higher than expected; respect OHKO math." },
    ],
    counters: [
      "Counter/Break stadium Festival Grounds nếu deck có (hoặc Boss Pokémon setup).",
      "KO Dipplin/Thwackey trước double-attack turn.",
      "Tính damage x2 attack + Bangle — đừng leave Active trong OHKO range.",
      "Race prize trước khi combo online turn 3–4.",
    ],
    watch: ["Festival Grounds in play", "Festival Lead", "Thwackey", "Double attack same turn"],
    ifGoingFirst: "Pressure setup; stadium answer in deck.",
    ifGoingSecond: "Boss Dipplin turn 2 nếu Grounds down.",
  },
  {
    id: "mega_lucario",
    name: "Mega Lucario ex (LBD)",
    share: "meta",
    keywords: /mega lucario|lucario ex|solrock|premium power pro|league battle/i,
    engine:
      "Solrock 1-prize accel energy → Mega Lucario ex 270+ damage; Premium Power Pro cho OHKO Mega ex.",
    plan: "Early Solrock setup → single-turn Mega Lucario burst.",
    keyCards: ["Mega Lucario ex", "Solrock", "Premium Power Pro", "Lucario"],
    iconIds: [448, 338],
    logSignals: [
      { pattern: /solrock/i, tip: "Solrock accel online — expect Mega Lucario attack turn 2–3; Boss Solrock sớm." },
      {
        pattern: /premium power pro|mega lucario|270|280|290/i,
        tip: "Mega Lucario + modifier — OHKO range on Mega ex; switch/tank hoặc KO trước swing.",
        onLoss: true,
      },
    ],
    counters: [
      "Boss Solrock turn 1–2 trước energy accel.",
      "Không để Mega Lucario free attach + Premium Power Pro turn.",
      "Prize map: họ dùng 1-prize setup cho 2-prize KO — trade efficiently.",
    ],
    watch: ["Solrock turn 1", "Mega Lucario ex", "Premium Power Pro"],
    ifGoingFirst: "Pressure Solrock; bench safe Active.",
    ifGoingSecond: "Boss Solrock; stabilize before Lucario online.",
  },
];

/** Ưu tiên deck cụ thể hơn (Festival Lead trước Hydrapple vì cùng Dipplin). */
const DETECT_ORDER: MetaDeckId[] = [
  "festival_lead",
  "mega_lucario",
  "dragapult",
  "zoroark",
  "crustle",
  "slowking",
  "hydrapple",
  "alakazam",
  "raging_bolt",
  "ogerpon",
  "clefairy",
  "honchkrow",
];

const DECK_BY_ID = new Map(META_DECKS.map((d) => [d.id, d]));

export function detectMetaDeck(cards: string[], logSnippet = ""): MetaDeckGuide | null {
  const blob = `${cards.join(" ")} ${logSnippet}`;
  for (const id of DETECT_ORDER) {
    const deck = DECK_BY_ID.get(id)!;
    if (deck.keywords.test(blob)) return deck;
  }
  return null;
}

export function detectMetaLogSignals(
  log: string,
  deck: MetaDeckGuide,
  result: "win" | "loss",
): string[] {
  const tips: string[] = [];
  for (const sig of deck.logSignals) {
    if (sig.onLoss && result !== "loss") continue;
    if (sig.pattern.test(log)) {
      tips.push(`[Log] ${sig.tip}`);
    }
  }
  return [...new Set(tips)].slice(0, 3);
}

export function metaMatchupNotes(
  deck: MetaDeckGuide,
  opts: { wentFirstMe: boolean; result: "win" | "loss"; log?: string },
): { opponentNotes: string[]; tips: string[]; mistakes: string[] } {
  const opponentNotes = [
    `[Meta ${deck.share}] ${deck.name}`,
    deck.engine,
    `Theo dõi: ${deck.watch.slice(0, 3).join("; ")}.`,
  ];
  const tips = [
    ...deck.counters.slice(0, 3).map((c) => `[vs ${deck.name}] ${c}`),
    opts.wentFirstMe ? `[Đi trước] ${deck.ifGoingFirst}` : `[Đi sau] ${deck.ifGoingSecond}`,
  ];
  if (opts.log) {
    tips.push(...detectMetaLogSignals(opts.log, deck, opts.result));
  }
  const mistakes: string[] = [];
  if (opts.result === "loss") {
    mistakes.push(
      `[vs ${deck.name}] Thua matchup meta — review: ${deck.plan}`,
    );
    if (opts.log) {
      const lossSignals = deck.logSignals.filter((s) => s.onLoss && s.pattern.test(opts.log!));
      for (const s of lossSignals.slice(0, 2)) {
        mistakes.push(`[vs ${deck.name}] ${s.tip}`);
      }
    }
  }
  return { opponentNotes, tips, mistakes };
}

export function aggregateMetaExposure(
  recent: { opponent: string; result: string; rawLog: string }[],
): { deck: MetaDeckGuide; wins: number; losses: number }[] {
  const map = new Map<MetaDeckId, { deck: MetaDeckGuide; wins: number; losses: number }>();

  for (const m of recent) {
    const cards: string[] = [];
    const cardRe = /(?:played|evolved .+ to|attached) ([^.]+?)(?:\.| to )/gi;
    for (const hit of m.rawLog.matchAll(cardRe)) {
      const name = hit[1]?.trim();
      if (name && name.length < 50) cards.push(name);
    }
    const deck = detectMetaDeck(cards, m.rawLog.slice(0, 4000));
    if (!deck) continue;
    const row = map.get(deck.id) ?? { deck, wins: 0, losses: 0 };
    if (m.result === "win") row.wins += 1;
    else row.losses += 1;
    map.set(deck.id, row);
  }

  return [...map.values()].sort(
    (a, b) => b.wins + b.losses - (a.wins + a.losses),
  );
}
