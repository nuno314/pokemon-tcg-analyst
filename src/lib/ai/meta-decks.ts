/**
 * Meta decks Mega Evolution era — detect từ log + matchup/counter local.
 */
import { extractOpponentCards } from "@/lib/ai/opponent-log-cards";
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
  | "mega_lucario"
  | "rocket_mewtwo"
  | "hops_trevenant"
  | "beedrill"
  | "cynthia_garchomp"
  | "metagross"
  | "mega_lopunny"
  | "grimmsnarl"
  | "mega_starmie"
  | "mega_greninja"
  | "ogerpon_meganium"
  | "sylveon"
  | "archaludon"
  | "hide_n_sneak";

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
  /** Engine/setup nên KO trước — không phải Active attacker. */
  priorityTarget?: string;
  /** Misplay phổ biến khi đánh deck này. */
  trap?: string;
};

export const META_DECKS: MetaDeckGuide[] = [
  {
    id: "dragapult",
    name: "Dragapult ex",
    share: "49%",
    keywords: /dragapult|phantom dive|drakloak|dreepy/i,
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
    keywords: /slowking|seek inspiration|ciphermaniac|academy at night/i,
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
    keywords: /hydrapple|syrup storm|applin/i,
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
    keywords: /alakazam|powerful hand|abra|kadabra/i,
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
    keywords: /raging bolt|bellowing thunder|climactic descent/i,
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
    keywords: /honchkrow|rocket's honchkrow|murkrow|porygon2/i,
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
  {
    id: "rocket_mewtwo",
    name: "Team Rocket's Mewtwo ex",
    share: "meta",
    keywords: /team rocket's mewtwo|erasure ball|charging up|power saver/i,
    engine:
      "Spidops Charging Up accel energy từ discard; Mewtwo ex cần ≥4 Rocket Pokémon (Power Saver) rồi Erasure Ball 280+ (Maximum Belt → 330).",
    plan: "Accel energy + fill 4 Rocket → OHKO Mega; Mimikyu/Spidops 1-prize backup.",
    keyCards: ["Team Rocket's Mewtwo ex", "Team Rocket's Spidops", "Tarountula", "Maximum Belt"],
    iconIds: [150, 918],
    logSignals: [
      {
        pattern: /erasure ball|charging up|power saver/i,
        tip: "Mewtwo Erasure Ball / Spidops Charging Up — Boss Mewtwo khi chưa đủ 4 Rocket hoặc thiếu energy; KO Tarountula/Spidops sớm.",
        onLoss: true,
      },
    ],
    counters: [
      "KO Tarountula/Spidops HP thấp trước khi Charging Up online.",
      "Spread / bench snipe (Froslass…) pick off Rocket nhỏ — họ yếu vs spread.",
      "Boss Mewtwo ex khi chưa đủ 4 Rocket trên field hoặc chưa có energy.",
      "Trade 1-prize vào Mewtwo 2-prize phá prize math của họ.",
    ],
    watch: ["Spidops Charging Up", "4 Rocket in play", "Erasure Ball", "Maximum Belt"],
    ifGoingFirst: "Snipe Tarountula/bench nhỏ; đừng để họ free evolve + attach từ discard.",
    ifGoingSecond: "Boss Mewtwo chưa setup; spread Froslass nếu deck bạn có.",
  },
  {
    id: "hops_trevenant",
    name: "Hop's Trevenant",
    share: "rogue",
    keywords: /hop's trevenant|horrifying revenge|hop's phantump|hop's choice band|splashing dodge|postwick/i,
    engine:
      "Horrifying Revenge 0 energy nếu Hop's Pokémon vừa bị KO; Choice Band lên ~220; Phantump Splashing Dodge (heads = immune turn sau).",
    plan: "1-prize revenge — trade xấu rồi swing free damage.",
    keyCards: ["Hop's Trevenant", "Hop's Phantump", "Hop's Choice Band", "Postwick"],
    iconIds: [709, 708],
    logSignals: [
      {
        pattern: /horrifying revenge|splashing dodge|hop's choice band/i,
        tip: "Trevenant revenge online hoặc Phantump dodge — đừng feed KO rẻ; trap Active không threaten.",
        onLoss: true,
      },
    ],
    counters: [
      "Spread/snipe bench 1-prize mỏng — bypass dodge 1 target.",
      "Đừng cho revenge miễn phí: trap Active yếu, kiểm soát prize map.",
      "Heal/Wally xóa chip trước khi họ pivot Trevenant lấy 2-prize.",
    ],
    watch: ["Hop's Pokémon KO", "Horrifying Revenge", "Choice Band", "Splashing Dodge"],
    ifGoingFirst: "Pressure Phantump; tránh KO rẻ nếu Trevenant sẵn sàng revenge.",
    ifGoingSecond: "Stabilize; snipe setup; đừng over-KO 1-prize.",
  },
  {
    id: "beedrill",
    name: "Beedrill swarm",
    share: "meta",
    keywords: /beedrill|rumbling bees|weedle|kakuna|forest of vitality/i,
    engine:
      "Rumbling Bees scale theo số Beedrill trên field (110+/con); Forest of Vitality / Rare Candy evolve nhanh; low energy, có line strip energy.",
    plan: "Swarm evolve → OHKO đột ngột khi đủ Beedrill.",
    keyCards: ["Beedrill", "Weedle", "Kakuna", "Forest of Vitality"],
    iconIds: [15, 13],
    logSignals: [
      {
        pattern: /rumbling bees|forest of vitality/i,
        tip: "Beedrill swarm scaling — KO từng Beedrill để giảm damage; snipe Weedle trước evolve.",
        onLoss: true,
      },
    ],
    counters: [
      "Snipe/gust Weedle bench trước Kakuna/Beedrill.",
      "Bớt swarm: mỗi Beedrill chết là damage drop mạnh.",
      "Stage 2 HP cao hoặc disruption nhanh hơn prize map của họ.",
    ],
    watch: ["Weedle count", "Forest of Vitality", "Rumbling Bees", "Rare Candy"],
    ifGoingFirst: "Spread/snipe Weedle turn 1–2.",
    ifGoingSecond: "Boss Beedrill thiếu partner; đừng để 3+ Beedrill sống.",
  },
  {
    id: "cynthia_garchomp",
    name: "Cynthia's Garchomp ex",
    share: "meta",
    keywords: /cynthia's garchomp|corkscrew dive|draconic buster|cynthia's power weight|cynthia's roserade/i,
    engine:
      "Power Weight → Garchomp ~400 HP; Corkscrew Dive draw/accel; Draconic Buster 260+ discard energy; Roserade scale theo bench/damage.",
    plan: "Hyper-offense stat-check — tank + burst 2-prize.",
    keyCards: ["Cynthia's Garchomp ex", "Cynthia's Power Weight", "Gible", "Gabite", "Cynthia's Roserade"],
    iconIds: [445, 443],
    logSignals: [
      {
        pattern: /corkscrew dive|draconic buster|power weight/i,
        tip: "Garchomp Power Weight / Buster — strip tool (Scrapper) hoặc exploit Grass weakness; snipe Roserade/Gabite.",
        onLoss: true,
      },
    ],
    counters: [
      "Grass weakness — attacker Grass nếu deck có.",
      "Tool Scrapper / bỏ Power Weight để mất 400 HP cushion.",
      "Snipe Roserade/Gabite trước swing Draconic Buster.",
    ],
    watch: ["Power Weight", "Corkscrew Dive", "Draconic Buster", "Roserade"],
    ifGoingFirst: "Pressure Gible trước Weight; giữ Grass attacker.",
    ifGoingSecond: "Strip Weight hoặc Boss thiếu energy sau Buster discard.",
  },
  {
    id: "metagross",
    name: "Metagross (Metal Maker)",
    share: "meta",
    keywords: /metal maker|metang|beldum/i,
    engine:
      "Không phải “đánh Metagross”. Metang Metal Maker (top 4 → attach Basic Metal) là engine; Energy → damage; toolbox Heatran/Genesect/Skarmory/Regigigas tùy matchup.",
    plan: "Spam Metang → charge attacker đúng matchup. Giữ 2 Metang sống > giữ attacker.",
    keyCards: ["Metang", "Beldum", "Metagross", "Metal Maker"],
    iconIds: [376, 375],
    logSignals: [
      {
        pattern: /metal maker|metang/i,
        tip: "Target Metang trước Metagross — 2 Metang online là game khó chịu. Boss Metang đang charge, không auto swing Metagross Active.",
        onLoss: true,
      },
    ],
    counters: [
      "Priority: KO Beldum/Metang trước khi engine online (snipe Metang > draw Pokémon > attacker).",
      "Boss Metang chưa charge xong thường tốt hơn đánh attacker.",
      "Ép họ attack bằng Genesect/Heatran — lấy mất toolbox option.",
      "Iono/Petrel sau khi họ Metal Maker + bench đầy — disruption lúc này đau hơn turn 1.",
      "Prize map toolbox: đừng assume 2+2+2 vào toàn ex — họ pivot Heatran/Regigigas/Articuno non-ex.",
      "Board Metagross Active + 2 Metang + Fez: KO Metang→Fez→Metang, không auto swing Metagross.",
    ],
    watch: ["Số Metang trên bench", "Metal Maker", "Heatran/Genesect pivot", "Fezandipiti"],
    ifGoingFirst: "Snipe Beldum/Metang ngay. Đừng đợi Metagross evolve.",
    ifGoingSecond: "Gust Metang; spread nếu có. 2 Metang = phải xử lý engine.",
    priorityTarget: "Metang > Fezandipiti > Metang (không auto Metagross Active)",
    trap: "Thấy Metagross Active rồi mới xử lý — lúc đó engine đã online. Board Metagross+2 Metang+Fez: target engine, không phải con đang đứng ngoài.",
  },
  {
    id: "mega_lopunny",
    name: "Mega Lopunny / Dudunsparce",
    share: "meta",
    keywords: /mega lopunny|gale thrust|buneary|lopunny ex/i,
    engine:
      "Gale Thrust: retreat Lopunny → Dudunsparce Run Away Draw → đưa Lopunny lại Active + bonus. Dudunsparce = switch engine, không chỉ draw.",
    plan: "Loop free retreat → Gale Thrust burst. 6 Regional T8, có vô địch — không phải rogue yếu.",
    keyCards: ["Mega Lopunny ex", "Buneary", "Gale Thrust"],
    iconIds: [428, 427],
    logSignals: [
      {
        pattern: /gale thrust|run away draw/i,
        tip: "Lopunny loop Gale Thrust — đừng KO Dudunsparce nếu chưa tính prize map (có thể feed prize mà engine vẫn chạy). Gust Dunsparce trước evolve.",
        onLoss: true,
      },
    ],
    counters: [
      "Team Rocket's Watchtower — punish Dudunsparce/bench setup.",
      "Fighting (Mega Lucario, Garchomp, Okidogi) demolish — đừng chơi fancy, KO Lopunny.",
      "Deny free retreat (lock stadium, bỏ Balloon, tăng retreat) → kẹt Active → damage tụt.",
      "Gust Dunsparce trước khi thành Dudunsparce — làm chậm engine rõ nhất.",
      "Đừng vội KO Dudunsparce nếu Lopunny vẫn attack được sau đó.",
    ],
    watch: ["Gale Thrust", "Dudunsparce loop", "Air Balloon", "Dunsparce opening"],
    ifGoingFirst: "Pressure Dunsparce/Buneary; Watchtower nếu có.",
    ifGoingSecond: "Fighting attacker nếu có; kẹt Lopunny Active.",
    priorityTarget: "Dunsparce trước evolve; Dudunsparce chỉ khi prize map cho phép",
    trap: "KO Dudunsparce vội = feed prize mà Gale Thrust vẫn chạy. Fighting (Lucario/Garchomp/Okidogi) thì đừng chơi fancy — KO Lopunny.",
  },
  {
    id: "grimmsnarl",
    name: "Marnie's Grimmsnarl ex",
    share: "meta",
    keywords: /grimmsnarl|impidimp|morgrem|marnie's grimmsnarl/i,
    engine:
      "Froslass chip Pokémon có Ability → Munkidori Adrena-Brain move counter → Grimmsnarl finish. Không phải hit-KO thẳng.",
    plan: "Spread + move damage rồi dọn prize. 39 Regional T8 — hiểu mechanic, đừng chỉ nhìn damage.",
    keyCards: ["Marnie's Grimmsnarl ex", "Impidimp", "Morgrem", "Grimmsnarl"],
    iconIds: [861, 859],
    logSignals: [
      {
        pattern: /adrena-brain|grimmsnarl|froslass/i,
        tip: "Grimmsnarl: KO Munkidori (biến chip thành threshold) đáng hơn Froslass. Đừng flood bench Pokémon có Ability.",
        onLoss: true,
      },
    ],
    counters: [
      "Bench gọn — ít Ability Pokémon trên field (Fez giữ tay nếu chưa cần).",
      "Priority KO: Munkidori > Froslass > Grimmsnarl (Munkidori biến spread thành usable).",
      "Big Basic / HP cao / ít Ability — spread plan yếu.",
      "KO Snorunt trước khi thành Froslass; Impidimp trước evolve.",
    ],
    watch: ["Munkidori", "Snorunt/Froslass", "Ability count trên bench", "Impidimp"],
    ifGoingFirst: "Ít bench Ability; snipe Snorunt/Impidimp.",
    ifGoingSecond: "Boss Munkidori; đừng cho nhiều target nhỏ.",
    priorityTarget: "Munkidori > Snorunt/Froslass > Impidimp",
    trap: "Bench 2 draw + 2 support + 2 engine = Froslass farm Ability. Fez giữ tay nếu chưa cần.",
  },
  {
    id: "mega_starmie",
    name: "Mega Starmie ex",
    share: "meta",
    keywords: /mega starmie|nebula beam|jetting blow|staryu/i,
    engine:
      "Tempo/spread: damage Active + Bench sớm → Nebula Beam convert thành multi-prize. Shell Froslass hoặc Dusknoir. Đáng sợ vì không biết họ lấy prize ở đâu.",
    plan: "Spread nhiều Pokémon → turn sau nhiều KO option.",
    keyCards: ["Mega Starmie ex", "Staryu", "Nebula Beam"],
    iconIds: [121, 120],
    logSignals: [
      {
        pattern: /nebula beam|jetting blow/i,
        tip: "Starmie spread — giữ bench gọn, đừng để 3 Pokémon cùng threshold 50–100 HP. Gust attacker chưa ready, không chỉ đuổi con đang đánh.",
        onLoss: true,
      },
    ],
    counters: [
      "Bench gọn; deny Psyduck/Shaymin nếu họ dùng.",
      "Kill Staryu/engine trước khi mặc định Boss Starmie.",
      "Tránh nhiều Pokémon cùng dải HP bị damage — họ convert multi-KO.",
      "Gust attacker chưa energy; họ thích đánh → retreat → attacker khác.",
    ],
    watch: ["Staryu count", "Spread on bench", "Froslass/Dusknoir shell", "HP thresholds"],
    ifGoingFirst: "Ít bench; snipe Staryu.",
    ifGoingSecond: "Heal/gộp damage vào 1 Pokémon; Boss engine.",
    priorityTarget: "Staryu / support engine (Psyduck, Shaymin) trước Mega Starmie",
    trap: "3 Pokémon cùng mất 50–100 HP = Starmie convert multi-KO. Họ đánh → retreat → attacker khác: gust con chưa ready.",
  },
  {
    id: "mega_greninja",
    name: "Mega Greninja",
    share: "meta",
    keywords: /mega greninja|froakie|frogadier|mirage barrage|neo upper/i,
    engine:
      "Stage 2: Froakie/Frogadier → Mega Greninja spread (Mirage Barrage) + attack. Neo Upper Energy bounce/đổi attacker, chống disruption, combo Wally.",
    plan: "Setup line rồi attack liên tục. Skill-intensive — ép prize race hơn là control cả board.",
    keyCards: ["Mega Greninja", "Froakie", "Frogadier", "Neo Upper Energy"],
    iconIds: [658, 656],
    logSignals: [
      {
        pattern: /mirage barrage|neo upper|frogadier/i,
        tip: "Kill Froakie/Frogadier trước evolve. Energy disruption sau khi họ commit, không quá sớm (Neo Upper bounce).",
        onLoss: true,
      },
    ],
    counters: [
      "Priority: Froakie/Frogadier — Stage 2 chết nhịp nếu Basic/Stage 1 bị KO.",
      "Disrupt energy khi họ vừa commit, còn ít energy trên board.",
      "Boss Froakie/Frogadier/support đúng lúc — ép attack sớm hoặc waste turn.",
      "Prize race: OHKO Mega Greninja 2+2+2 — họ ghét bị ép không dùng spread.",
    ],
    watch: ["Froakie/Frogadier", "Neo Upper Energy", "Rare Candy", "Energy count"],
    ifGoingFirst: "Gust Froakie; đừng sợ Mega Greninja chưa ra.",
    ifGoingSecond: "Snipe Frogadier; OHKO nếu có damage.",
    priorityTarget: "Froakie / Frogadier trước Mega Greninja",
    trap: "Disrupt energy quá sớm thì Neo Upper bounce. Ép prize race 2+2+2 nếu OHKO được — họ ghét không dùng spread.",
  },
  {
    id: "ogerpon_meganium",
    name: "Ogerpon Meganium",
    share: "meta",
    keywords: /chikorita|bayleef|meganium/i,
    engine:
      "Teal Ogerpon = engine + attacker đầu (attach-draw-attack). Meganium/Chikorita = late bulky OHKO. Đừng nghĩ Meganium luôn là target T1.",
    plan: "Charge Ogerpon sớm → Meganium payoff. Worst MU: Dragapult (Straight Pult / Pult Blaziken).",
    keyCards: ["Chikorita", "Bayleef", "Meganium", "Teal Mask Ogerpon ex"],
    iconIds: [154, 1017],
    logSignals: [
      {
        pattern: /meganium|chikorita/i,
        tip: "Gust Chikorita (future Meganium) nếu Ogerpon đang Active. Deny Grass energy trước khi họ stack 3–4. OHKO Ogerpon — đừng 2HKO cho họ thêm turn draw/setup.",
        onLoss: true,
      },
    ],
    counters: [
      "Dragapult spread là worst matchup của họ — exploit nếu bạn Pult.",
      "Kill Chikorita, không auto Boss Ogerpon.",
      "Deny Grass energy engine trước 3–4 energy.",
      "One-shot Ogerpon; để sống 2 turn = họ vừa attack vừa draw vừa setup.",
    ],
    watch: ["Chikorita bench", "Ogerpon energy count", "Meganium evolve"],
    ifGoingFirst: "Snipe Chikorita; pressure Ogerpon nếu OHKO được.",
    ifGoingSecond: "Deny attach chain; Boss Chikorita.",
    priorityTarget: "Chikorita (future Meganium) — Ogerpon là engine đầu game",
    trap: "2HKO Ogerpon = cho họ thêm turn attach-draw-attack-setup. Worst MU phía họ: Dragapult.",
  },
  {
    id: "sylveon",
    name: "Sylveon (Safeguard)",
    share: "rogue",
    keywords: /sylveon|safeguard/i,
    engine:
      "Safeguard: **ex không damage được Sylveon** (120 HP wall). Câu hỏi duy nhất: deck bạn có non-ex attacker không? Không có thì gần như không xử lý được.",
    plan: "Wall — không phải damage race. Boss target khác, prize map quanh Sylveon.",
    keyCards: ["Sylveon", "Safeguard"],
    iconIds: [700, 133],
    logSignals: [
      {
        pattern: /safeguard|sylveon/i,
        tip: "Safeguard: attack bằng **non-ex**. Đừng swing ex vào Sylveon. Kill Eevee trước evolve; Boss non-Sylveon để lấy prize.",
        onLoss: true,
      },
    ],
    counters: [
      "Counter #1: non-ex attacker — không phải type, không phải OHKO ex.",
      "Effect/ability damage có thể không bị Safeguard (đọc wording: chỉ block attack damage từ Pokémon ex).",
      "Kill Eevee trước khi evolve Sylveon.",
      "Prize map: Boss setup khác, đừng cố đập Sylveon bằng ex.",
    ],
    watch: ["Sylveon Active", "Eevee bench", "Bạn có non-ex attacker?"],
    ifGoingFirst: "KO Eevee; confirm non-ex line trong deck.",
    ifGoingSecond: "Không commit ex vào Sylveon; lấy prize chỗ khác.",
    priorityTarget: "Eevee trước evolve; sau đó non-Sylveon targets (prize map)",
    trap: "Safeguard chỉ block attack damage từ Pokémon ex — không phải bất tử. Không có non-ex thì Boss quanh wall, đừng swing ex.",
  },
  {
    id: "archaludon",
    name: "Archaludon ex",
    share: "meta",
    keywords: /archaludon|duraludon/i,
    engine:
      "Discard Energy → evolve Duraludon → Archaludon convert discard thành damage. Khác Metagross: energy trong discard là resource, không phải Metang attach.",
    plan: "Tank / brute force + Black Belt's Training (nhiều list 3 copies) + Hero's Cape.",
    keyCards: ["Archaludon ex", "Duraludon"],
    iconIds: [1018, 884],
    logSignals: [
      {
        pattern: /archaludon|duraludon|black belt/i,
        tip: "Gust Duraludon trước evolve. Đừng feed Black Belt free prize. Không OHKO được thì đổi target — đừng over-damage vào tank + Cape.",
        onLoss: true,
      },
    ],
    counters: [
      "Gust/KO Duraludon trước evolve — một turn trễ là muộn.",
      "Đừng play vào Black Belt turn (3 copies phổ biến) — không cho free prize.",
      "Không OHKO + Hero's Cape → đổi target (Munkidori/Fez/Relicanth) hơn đập 2 turn.",
      "Hit support/setup thường tốt hơn Archaludon Active.",
    ],
    watch: ["Duraludon", "Discard energy", "Black Belt's Training", "Hero's Cape"],
    ifGoingFirst: "Pressure Duraludon; đừng chip Archaludon nếu không KO.",
    ifGoingSecond: "Boss Duraludon/support; respect Black Belt math.",
    priorityTarget: "Duraludon trước evolve; support (Munkidori/Fez/Relicanth) nếu tank đã Cape",
    trap: "Chip Archaludon + Black Belt + Hero's Cape = feed prize. Không OHKO thì đổi target.",
  },
  {
    id: "hide_n_sneak",
    name: "Hide 'n' Sneak (Banette / Dhelmise)",
    share: "meta",
    keywords:
      /hide ['’]?n['’]? sneak|puppet pull|vengeful anchor|matcha spin|banette|shuppet|dhelmise|sinistcha|poltchageist|spiritomb|gwynn|prism tower/i,
    engine:
      "Không giữ Hide 'n' Sneak trên field — discard Banette/Sinistcha/line (Gwynn, Prism Tower, Dudunsparce) để scale Dhelmise/Sinistcha và Spiritomb late. Early Banette Puppet Pull = 80 + search + bait KO vào discard.",
    plan: "Bait KO Shuppet/Banette → fill discard → Dhelmise/Sinistcha scale → Spiritomb finisher khi bin đủ dày.",
    keyCards: ["Banette", "Shuppet", "Dhelmise", "Sinistcha", "Poltchageist", "Spiritomb", "Hide 'n' Sneak"],
    iconIds: [354, 781],
    logSignals: [
      {
        pattern: /puppet pull|vengeful anchor|matcha spin|hide ['’]?n['’]? sneak/i,
        tip: "Hide 'n' Sneak: đếm discard của họ — đừng free KO Banette/Shuppet nếu chưa có plan. Chip/snipe vào setup trống thường mất value (damage vanish).",
        onLoss: true,
      },
    ],
    counters: [
      "Đừng auto KO early Banette/Shuppet — họ muốn bài vào discard. Trap Active yếu hoặc ép trade xấu.",
      "Pressure Dhelmise/Sinistcha trước khi discard count max; Boss attacker đang scale.",
      "Respect Spiritomb late nếu bin đầy Hide 'n' Sneak — prize race trước finisher.",
      "Munkidori/spread vào board trống kém hiệu quả — target Pokémon họ còn cần trên field (Dudunsparce/engine) nếu gust được.",
      "Disrupt discard engine (Gwynn / Prism Tower / draw loop) sớm hơn chase Active bait.",
    ],
    watch: ["Discard Hide 'n' Sneak count", "Puppet Pull bait", "Dhelmise Vengeful Anchor", "Spiritomb late", "Gwynn/Prism Tower"],
    ifGoingFirst: "Đừng feed Banette vào bin miễn phí; identify Dhelmise/Sinistcha line.",
    ifGoingSecond: "Boss Dhelmise đang scale; đếm discard trước khi trade prize.",
    priorityTarget: "Dhelmise / Sinistcha đang attack — không free KO Shuppet/Banette bait",
    trap: "KO Banette sớm = giúp họ discard scale. Damage vào board họ đã 'ẩn' thường phí Munkidori/snipe.",
  },
];

/** Ưu tiên deck cụ thể hơn (Festival Lead trước Hydrapple vì cùng Dipplin). */
const DETECT_ORDER: MetaDeckId[] = [
  "festival_lead",
  "rocket_mewtwo",
  "hops_trevenant",
  "beedrill",
  "cynthia_garchomp",
  "mega_lucario",
  "mega_starmie",
  "mega_greninja",
  "mega_lopunny",
  "grimmsnarl",
  "metagross",
  "archaludon",
  "sylveon",
  "hydrapple",
  "ogerpon_meganium",
  "hide_n_sneak",
  "dragapult",
  "zoroark",
  "crustle",
  "slowking",
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

/** Chỉ match meta khi có thẻ **lõi** — tech chung (Dudunsparce, Munkidori, Meganium…) không đủ. */
export const META_PRIMARY_CARDS: Record<MetaDeckId, string[]> = {
  dragapult: ["Dragapult", "Drakloak", "Dreepy"],
  zoroark: ["Zoroark", "Zorua", "Night Joker"],
  crustle: ["Crustle", "Dwebble", "Rock Inn"],
  slowking: ["Slowking", "Seek Inspiration", "Ciphermaniac"],
  hydrapple: ["Hydrapple", "Syrup Storm"],
  alakazam: ["Alakazam", "Powerful Hand"],
  raging_bolt: ["Raging Bolt"],
  ogerpon: ["Ogerpon", "Ogre's Mask", "Teal Mask"],
  clefairy: ["Clefairy", "Full Moon Rondo"],
  honchkrow: ["Honchkrow", "Murkrow"],
  festival_lead: ["Festival Lead", "Festival Grounds", "Dipplin", "Thwackey"],
  mega_lucario: ["Mega Lucario", "Lucario", "Solrock"],
  rocket_mewtwo: ["Team Rocket's Mewtwo", "Mewtwo", "Spidops", "Tarountula", "Erasure Ball"],
  hops_trevenant: ["Hop's Trevenant", "Hop's Phantump", "Horrifying Revenge", "Postwick", "Hop's Choice Band"],
  beedrill: ["Beedrill", "Weedle", "Kakuna", "Rumbling Bees", "Forest of Vitality"],
  cynthia_garchomp: ["Cynthia's Garchomp", "Garchomp", "Corkscrew Dive", "Draconic Buster", "Gible", "Gabite", "Power Weight"],
  metagross: ["Metang", "Beldum", "Metal Maker"],
  mega_lopunny: ["Mega Lopunny", "Buneary", "Gale Thrust"],
  grimmsnarl: ["Grimmsnarl", "Impidimp", "Morgrem"],
  mega_starmie: ["Mega Starmie", "Staryu", "Nebula Beam", "Jetting Blow"],
  mega_greninja: ["Mega Greninja", "Froakie", "Frogadier", "Mirage Barrage", "Neo Upper"],
  ogerpon_meganium: ["Chikorita", "Bayleef", "Meganium"],
  sylveon: ["Sylveon"],
  archaludon: ["Archaludon", "Duraludon"],
  hide_n_sneak: [
    "Banette",
    "Shuppet",
    "Dhelmise",
    "Sinistcha",
    "Poltchageist",
    "Spiritomb",
    "Hide 'n' Sneak",
    "Puppet Pull",
    "Vengeful Anchor",
    "Matcha Spin",
    "Gwynn",
    "Prism Tower",
  ],
};

export function cardMatchesPrimaryName(card: string, primary: string): boolean {
  const n = card.toLowerCase().replace(/\s+ex$/, "").trim();
  const key = primary.toLowerCase().replace(/\s+ex$/, "").trim();
  if (!n || !key) return false;
  if (n.length < 4 || key.length < 4) return n === key;
  return n.includes(key) || key.includes(n);
}

export function detectMetaDeckFromCards(cards: string[]): MetaDeckGuide | null {
  if (cards.length === 0) return null;
  for (const id of DETECT_ORDER) {
    const primary = META_PRIMARY_CARDS[id];
    const matched = cards.some((c) =>
      primary.some((p) => cardMatchesPrimaryName(c, p)),
    );
    if (matched) return DECK_BY_ID.get(id)!;
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
  if (deck.priorityTarget) {
    opponentNotes.push(`Target ưu tiên: ${deck.priorityTarget}`);
  }
  const tips = [
    ...deck.counters.slice(0, 3).map((c) => `[vs ${deck.name}] ${c}`),
    opts.wentFirstMe ? `[Đi trước] ${deck.ifGoingFirst}` : `[Đi sau] ${deck.ifGoingSecond}`,
  ];
  if (deck.trap) {
    tips.push(`[vs ${deck.name}] ${deck.trap}`);
  }
  if (deck.priorityTarget) {
    tips.push(
      `[vs ${deck.name}] Đừng auto đánh Active. Stage 2 → KO Basic trước. Prize map 6-4-2 quan trọng hơn type chart.`,
    );
  }
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
    const cards = extractOpponentCards(m.rawLog, m.opponent);
    const deck = detectMetaDeckFromCards(cards);
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
