import { parseBattleLog, type ParsedBattleLog } from "@/lib/parser/ptcgl-log";

const LOG_SLICE = 8000;

/** Kiến thức HLV cơ bản — prize checking, prize mapping, sequencing. */
export type CoachingTopic = "prize_checking" | "prize_mapping" | "sequencing";

export const COACHING = {
  prize_checking: {
    title: "Prize checking",
    summary:
      "Lần search deck đầu game: đếm bài quan trọng có bị prize không (Pokémon setup, Boss, Rod, Energy).",
    tips: [
      "Ở search đầu game bạn được phép lấy thêm thời gian — dùng để đếm Boss, Rare Candy, Energy, Pokémon line có prized không.",
      "Luyện prize check ngoài giờ để tốc độ ổn khi tourney; search sau vẫn có thể check thêm bài phụ.",
      "Sắp xếp deck khi check được, nhưng shuffle kỹ trước khi search xong.",
    ],
  },
  prize_mapping: {
    title: "Prize mapping",
    summary:
      "Lên kế hoạch lấy đủ 6 prize trước đối thủ — mỗi KO đổi bao nhiêu prize, ai đi trước trong prize race.",
    tips: [
      "Trước khi đánh, hình dung cần mấy lần attack để lấy 6 prize và đối thủ cần mấy — prize trade phải nhất quán.",
      "Đi trước mà bị KO Pokémon 2 prize turn 1–2 thì prize race lệch — cần plan B (1-prize attacker, bench snipe).",
      "Dùng attacker 1 prize để ép đối thủ tốn thêm turn, rồi lấy 2 prize liên tiếp — giữ nhịp mapping.",
      "Thua dù mỗi turn lấy 2 prize có thể vì đối thủ head-start từ KO sớm — review opening và giá trị prize từng target.",
    ],
  },
  sequencing: {
    title: "Sequencing",
    summary:
      "Thứ tự chơi bài trong turn ảnh hưởng xác suất hit combo — search/thin deck trước khi flip PokeStop/Iono.",
    tips: [
      "Cần Rare Candy + stage: Ultra Ball lấy stage ra trước, rồi mới PokeStop — tăng tỉ lệ hit Candy còn lại.",
      "Chơi bài loại bỏ khỏi deck (search, discard) trước bài flip/random (PokeStop, Iono) để tối đa odds.",
      "Nhiều lúc “xui” thực ra do sequencing — xem lại log: đã thin deck đúng thứ tự chưa.",
    ],
  },
} as const;

export function coachingTip(topic: CoachingTopic, index = 0): string {
  const block = COACHING[topic];
  return block.tips[index % block.tips.length];
}

export type MatchSignals = {
  myPrizes: number;
  oppPrizes: number;
  earlyMyKo: boolean;
  wentFirstMe: boolean;
  badSequencingTurns: number[];
  hadEarlySearch: boolean;
  shortGame: boolean;
  longGame: boolean;
};

const SEARCH_RE =
  /Ultra Ball|Nest Ball|Level Ball|Buddy-Buddy Poffin|Arven|Battle VIP Pass|Pok[eé] Pad|Poke Pad|Precious Trolley|Team Rocket's Petrel/i;
const THIN_BEFORE_FLIP_RE = /Pok[eé]Stop|Iono|Professor's Research|Colress's Experiment/i;

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countInLog(log: string, re: RegExp) {
  return [...log.matchAll(re)].length;
}

export function analyzeMatchSignals(
  log: string,
  parsed: ParsedBattleLog | null,
  me: string,
  opp: string,
  wentFirstMe: boolean,
  turnCount: number,
): MatchSignals {
  const myPrizes = countInLog(log, new RegExp(`${escapeRegExp(me)} took (a|\\d+) Prize`, "gi"));
  const oppPrizes = countInLog(log, new RegExp(`${escapeRegExp(opp)} took (a|\\d+) Prize`, "gi"));

  let earlyMyKo = false;
  const badSequencingTurns: number[] = [];
  let hadEarlySearch = SEARCH_RE.test(log.slice(0, 2000));

  if (parsed) {
    for (const turn of parsed.turns) {
      if (turn.turnNumber <= 3 && turn.player.toLowerCase() !== me.toLowerCase()) {
        for (const ev of turn.events) {
          if (new RegExp(`${escapeRegExp(me)}'s .+ was Knocked Out`, "i").test(ev.text)) {
            earlyMyKo = true;
          }
        }
      }

      if (turn.player.toLowerCase() !== me.toLowerCase()) continue;

      const events = turn.events.map((e) => e.text);
      const flipIdx = events.findIndex((t) => THIN_BEFORE_FLIP_RE.test(t));
      const searchIdx = events.findIndex((t) => SEARCH_RE.test(t));
      if (flipIdx >= 0 && searchIdx >= 0 && flipIdx < searchIdx) {
        badSequencingTurns.push(turn.turnNumber);
      }

      if (turn.turnNumber <= 2 && events.some((t) => SEARCH_RE.test(t))) {
        hadEarlySearch = true;
      }
    }
  }

  return {
    myPrizes,
    oppPrizes,
    earlyMyKo,
    wentFirstMe,
    badSequencingTurns,
    hadEarlySearch,
    shortGame: turnCount <= 6,
    longGame: turnCount >= 12,
  };
}

export function coachingTopicsForMatch(
  signals: MatchSignals,
  result: "win" | "loss",
): CoachingTopic[] {
  const topics: CoachingTopic[] = [];

  if (result === "loss" && signals.wentFirstMe && signals.earlyMyKo) {
    topics.push("prize_mapping");
  }
  if (result === "loss" && signals.oppPrizes > signals.myPrizes + 1) {
    topics.push("prize_mapping");
  }
  if (signals.badSequencingTurns.length > 0) {
    topics.push("sequencing");
  }
  if (result === "loss") {
    topics.push("prize_checking");
  }
  if (signals.longGame && result === "loss") {
    topics.push("prize_mapping");
  }

  return [...new Set(topics)];
}

export function coachingTopicsForPlayer(
  ptcglName: string,
  recent: { opponent: string; result: string; rawLog: string; wentFirst: string | null }[],
): CoachingTopic[] {
  const topics = new Set<CoachingTopic>(["prize_checking"]);
  let earlyKoLosses = 0;
  let sequencingIssues = 0;

  for (const m of recent.slice(0, 10)) {
    const wentFirstMe = m.wentFirst?.toLowerCase() === ptcglName.toLowerCase();
    let parsed: ParsedBattleLog | null = null;
    try {
      parsed = parseBattleLog(m.rawLog.slice(0, LOG_SLICE));
    } catch {
      /* skip */
    }
    const signals = analyzeMatchSignals(
      m.rawLog,
      parsed,
      ptcglName,
      m.opponent,
      wentFirstMe ?? false,
      parsed?.turns.length ?? 0,
    );
    if (m.result === "loss" && signals.earlyMyKo && wentFirstMe) earlyKoLosses += 1;
    if (signals.badSequencingTurns.length) sequencingIssues += 1;
  }

  if (earlyKoLosses >= 1) topics.add("prize_mapping");
  if (sequencingIssues >= 1) topics.add("sequencing");
  if (recent.filter((r) => r.result === "loss").length >= 4) topics.add("prize_mapping");

  return [...topics];
}

export function applyCoachingToMatch(
  signals: MatchSignals,
  result: "win" | "loss",
  tips: string[],
  mistakes: string[],
): void {
  const topics = coachingTopicsForMatch(signals, result);

  if (topics.includes("prize_mapping")) {
    if (result === "loss" && signals.wentFirstMe && signals.earlyMyKo) {
      mistakes.push(
        `[Prize mapping] Đi trước nhưng bị KO sớm — prize race lệch. Cần plan lấy 6 prize trước khi đối thủ, kể cả dùng attacker 1 prize.`,
      );
    } else if (result === "loss" && signals.oppPrizes > signals.myPrizes) {
      mistakes.push(
        `[Prize mapping] Đối thủ lấy ${signals.oppPrizes} prize vs bạn ${signals.myPrizes} — review từng KO đổi bao nhiêu prize.`,
      );
    }
    tips.push(`[Prize mapping] ${coachingTip("prize_mapping", 0)}`);
  }

  if (topics.includes("sequencing")) {
    mistakes.push(
      `[Sequencing] Turn ${signals.badSequencingTurns.join(", ")}: flip/search (PokeStop/Iono) trước khi search/thin deck — giảm odds hit combo.`,
    );
    tips.push(`[Sequencing] ${coachingTip("sequencing", 0)}`);
  }

  if (topics.includes("prize_checking")) {
    tips.push(`[Prize checking] ${coachingTip("prize_checking", 0)}`);
  }
}

export function applyCoachingToPlayer(focus: string[], ptcglName: string, recent: RecentForCoaching[]): void {
  for (const topic of coachingTopicsForPlayer(ptcglName, recent)) {
    if (topic === "prize_checking") {
      focus.push(`[Prize checking] ${coachingTip("prize_checking", 1)}`);
    } else if (topic === "prize_mapping") {
      focus.push(`[Prize mapping] ${coachingTip("prize_mapping", 1)}`);
    } else if (topic === "sequencing") {
      focus.push(`[Sequencing] ${coachingTip("sequencing", 1)}`);
    }
  }
}

type RecentForCoaching = {
  opponent: string;
  result: string;
  rawLog: string;
  wentFirst: string | null;
};
