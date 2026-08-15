import { PLAYER_ASSESSMENT_MIN_MATCHES, getDictionary, type Locale } from "@/lib/i18n";
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

type QuestPoolKey = keyof ReturnType<typeof getDictionary>["quests"]["pool"];

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

function questFromPool(
  id: QuestPoolKey,
  copy: ReturnType<typeof getDictionary>["quests"]["pool"][QuestPoolKey],
  item: Omit<QuestItem, "id" | "title" | "detail">,
): QuestItem {
  return { ...item, id, title: copy.title, detail: copy.detail };
}

/** Daily quests (reset 00:00 GMT+7) from today's matches. */
export function generateQuestBoard(input: {
  ptcglName: string;
  matchCount: number;
  matches: QuestMatch[];
  analysisCount: number;
  deckCount: number;
  locale?: Locale;
  now?: Date;
}): QuestBoardData {
  const dict = getDictionary(input.locale ?? "en");
  const q = dict.quests;
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

  const pool: Record<QuestPoolKey, QuestItem> = {
    win_today: questFromPool("win_today", q.pool.win_today, {
      href: "/matches/import",
      progress: Math.min(1, wins),
      target: 1,
      done: wins >= 1,
    }),
    import_two: questFromPool("import_two", q.pool.import_two, {
      href: "/matches/import",
      progress: Math.min(2, imports),
      target: 2,
      done: imports >= 2,
    }),
    win_first: questFromPool("win_first", q.pool.win_first, {
      href: "/matches/import",
      progress: Math.min(1, winFirst),
      target: 1,
      done: winFirst >= 1,
    }),
    win_second: questFromPool("win_second", q.pool.win_second, {
      href: "/matches/import",
      progress: Math.min(1, winSecond),
      target: 1,
      done: winSecond >= 1,
    }),
    win_concede: questFromPool("win_concede", q.pool.win_concede, {
      href: "/matches/import",
      progress: Math.min(1, winConcede),
      target: 1,
      done: winConcede >= 1,
    }),
    win_standard: questFromPool("win_standard", q.pool.win_standard, {
      href: "/matches/import",
      progress: Math.min(1, winStandard),
      target: 1,
      done: winStandard >= 1,
    }),
    attach_deck: questFromPool("attach_deck", q.pool.attach_deck, {
      href: "/matches/import",
      progress: Math.min(1, withDeck),
      target: 1,
      done: withDeck >= 1,
    }),
    analyze_one: questFromPool("analyze_one", q.pool.analyze_one, {
      href: input.matches[0] ? `/matches/${input.matches[0].id}` : "/dashboard",
      progress: Math.min(1, input.analysisCount),
      target: 1,
      done: input.analysisCount >= 1,
    }),
    win_streak_2: questFromPool("win_streak_2", q.pool.win_streak_2, {
      href: "/matches/import",
      progress: hasWinStreak(matches, 2) ? 1 : 0,
      target: 1,
      done: hasWinStreak(matches, 2),
    }),
  };

  const dailyIds = pickDailyIds(todayKey, Object.keys(pool), 4);
  const quests = dailyIds.map((id) => pool[id as QuestPoolKey]!);
  const completedCount = quests.filter((item) => item.done).length;

  const notes: CoachNote[] = [];
  if (!unlocked) {
    notes.push({ id: "note_lock", text: q.notes.lock(need) });
  } else if (completedCount === quests.length) {
    notes.push({ id: "note_done", text: q.notes.done });
  } else if (imports === 0) {
    notes.push({ id: "note_import", text: q.notes.import });
  } else if (input.deckCount < 1) {
    notes.push({ id: "note_deck", text: q.notes.deck });
  } else {
    notes.push({
      id: "note_go",
      text: q.notes.go(quests.length - completedCount, quests.length),
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
