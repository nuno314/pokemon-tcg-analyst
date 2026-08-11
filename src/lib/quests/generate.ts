import { PLAYER_ASSESSMENT_MIN_MATCHES } from "@/lib/i18n/vi";
import { dayKey, dayStartUtc, nextResetAt, QUEST_TZ_OFFSET_MINUTES } from "./calendar";

export type QuestMatch = {
  id: string;
  result: "win" | "loss";
  resultReason: string | null;
  wentFirst: string | null;
  deckId: string | null;
  opponentName: string;
  importedAt?: Date | null;
};

export type QuestItem = {
  id: string;
  title: string;
  detail: string;
  href: string;
  progress: number;
  target: number;
  done: boolean;
};

export type CoachNote = {
  id: string;
  text: string;
};

export type QuestBoardData = {
  unlocked: boolean;
  matchCount: number;
  need: number;
  quests: QuestItem[];
  notes: CoachNote[];
  completedCount: number;
  dayKey: string;
  resetsAt: string;
  dailyTarget: number;
};

function isMe(wentFirst: string | null, ptcglName: string) {
  if (!wentFirst) return null;
  return wentFirst.toLowerCase() === ptcglName.toLowerCase();
}

function countWhere(matches: QuestMatch[], pred: (m: QuestMatch) => boolean) {
  return matches.filter(pred).length;
}

function hasWinStreak(matches: QuestMatch[], len: number) {
  let streak = 0;
  for (const m of [...matches].reverse()) {
    if (m.result === "win") {
      streak += 1;
      if (streak >= len) return true;
    } else {
      streak = 0;
    }
  }
  return false;
}

function hashDay(key: string) {
  let h = 2166136261;
  for (let i = 0; i < key.length; i += 1) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickDailyIds(day: string, pool: string[], count: number) {
  const ids = [...pool];
  let seed = hashDay(day);
  for (let i = ids.length - 1; i > 0; i -= 1) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [ids[i], ids[j]] = [ids[j]!, ids[i]!];
  }
  return ids.slice(0, count);
}

function inToday(m: QuestMatch, start: Date) {
  if (!m.importedAt) return false;
  return m.importedAt.getTime() >= start.getTime();
}

/** Sinh quest ngày (reset 00:00 GMT+7) từ trận hôm nay. */
export function generateQuestBoard(input: {
  ptcglName: string;
  matchCount: number;
  matches: QuestMatch[];
  analysisCount: number;
  deckCount: number;
  now?: Date;
}): QuestBoardData {
  const need = PLAYER_ASSESSMENT_MIN_MATCHES;
  const unlocked = input.matchCount >= need;
  const me = input.ptcglName;
  const now = input.now ?? new Date();
  const todayKey = dayKey(now, QUEST_TZ_OFFSET_MINUTES);
  const start = dayStartUtc(todayKey, QUEST_TZ_OFFSET_MINUTES);
  const resetsAt = nextResetAt(now, QUEST_TZ_OFFSET_MINUTES).toISOString();
  const matches = input.matches.filter((m) => inToday(m, start));

  const winFirst = countWhere(
    matches,
    (m) => m.result === "win" && isMe(m.wentFirst, me) === true,
  );
  const winSecond = countWhere(
    matches,
    (m) => m.result === "win" && isMe(m.wentFirst, me) === false,
  );
  const winConcede = countWhere(
    matches,
    (m) => m.result === "win" && m.resultReason === "concede",
  );
  const winStandard = countWhere(
    matches,
    (m) => m.result === "win" && (m.resultReason === "standard" || m.resultReason === "win"),
  );
  const withDeck = countWhere(matches, (m) => Boolean(m.deckId));
  const wins = countWhere(matches, (m) => m.result === "win");
  const imports = matches.length;

  const pool: Record<string, QuestItem> = {
    win_today: {
      id: "win_today",
      title: "Thắng 1 trận hôm nay",
      detail: "Import 1 trận thắng trong ngày.",
      href: "/matches/import",
      progress: Math.min(1, wins),
      target: 1,
      done: wins >= 1,
    },
    import_two: {
      id: "import_two",
      title: "Import 2 trận hôm nay",
      detail: "Ghi lại 2 trận trong ngày để quest và win rate cập nhật.",
      href: "/matches/import",
      progress: Math.min(2, imports),
      target: 2,
      done: imports >= 2,
    },
    win_first: {
      id: "win_first",
      title: "Thắng khi đi trước",
      detail: "Hôm nay thắng 1 trận mà bạn đi trước.",
      href: "/matches/import",
      progress: Math.min(1, winFirst),
      target: 1,
      done: winFirst >= 1,
    },
    win_second: {
      id: "win_second",
      title: "Thắng khi đi sau",
      detail: "Hôm nay thắng 1 trận khi đối thủ đi trước.",
      href: "/matches/import",
      progress: Math.min(1, winSecond),
      target: 1,
      done: winSecond >= 1,
    },
    win_concede: {
      id: "win_concede",
      title: "Thắng nhờ concede",
      detail: "Import 1 trận thắng khi đối thủ concede hôm nay.",
      href: "/matches/import",
      progress: Math.min(1, winConcede),
      target: 1,
      done: winConcede >= 1,
    },
    win_standard: {
      id: "win_standard",
      title: "Thắng kết thúc chuẩn",
      detail: "Hôm nay thắng bằng KO / lấy hết prize (không concede).",
      href: "/matches/import",
      progress: Math.min(1, winStandard),
      target: 1,
      done: winStandard >= 1,
    },
    attach_deck: {
      id: "attach_deck",
      title: "Gắn deck khi import",
      detail: "Import 1 trận hôm nay có chọn deck đã dùng.",
      href: "/matches/import",
      progress: Math.min(1, withDeck),
      target: 1,
      done: withDeck >= 1,
    },
    analyze_one: {
      id: "analyze_one",
      title: "Chạy AI Analyst hôm nay",
      detail: "Mở 1 trận và bấm AI Analyst trong ngày.",
      href: input.matches[0] ? `/matches/${input.matches[0].id}` : "/dashboard",
      progress: Math.min(1, input.analysisCount),
      target: 1,
      done: input.analysisCount >= 1,
    },
    win_streak_2: {
      id: "win_streak_2",
      title: "Chuỗi 2 trận thắng",
      detail: "Hôm nay import 2 trận thắng liên tiếp.",
      href: "/matches/import",
      progress: hasWinStreak(matches, 2) ? 1 : 0,
      target: 1,
      done: hasWinStreak(matches, 2),
    },
  };

  const dailyIds = pickDailyIds(todayKey, Object.keys(pool), 4);
  const quests = dailyIds.map((id) => pool[id]!);
  const completedCount = quests.filter((q) => q.done).length;

  const notes: CoachNote[] = [];
  if (!unlocked) {
    notes.push({
      id: "note_lock",
      text: `Cần ${need} trận tổng để mở quest ngày. Quest reset 00:00 GMT+7.`,
    });
  } else if (completedCount === quests.length) {
    notes.push({
      id: "note_done",
      text: "Xong hết quest hôm nay — mai reset bộ mới lúc 00:00 GMT+7.",
    });
  } else if (imports === 0) {
    notes.push({
      id: "note_import",
      text: "Chưa có trận nào hôm nay — import log để làm quest trong ngày.",
    });
  } else if (input.deckCount < 1) {
    notes.push({
      id: "note_deck",
      text: "Tạo deck rồi gắn khi import để quest gắn deck và win rate theo list đúng.",
    });
  } else {
    notes.push({
      id: "note_go",
      text: `Còn ${quests.length - completedCount}/${quests.length} quest hôm nay. Hết hạn lúc 00:00 GMT+7.`,
    });
  }

  return {
    unlocked,
    matchCount: input.matchCount,
    need,
    quests,
    notes: notes.slice(0, 2),
    completedCount,
    dayKey: todayKey,
    resetsAt,
    dailyTarget: quests.length,
  };
}
