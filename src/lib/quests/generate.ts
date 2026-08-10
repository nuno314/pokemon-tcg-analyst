import { PLAYER_ASSESSMENT_MIN_MATCHES } from "@/lib/i18n/vi";

export type QuestMatch = {
  id: string;
  result: "win" | "loss";
  resultReason: string | null;
  wentFirst: string | null;
  deckId: string | null;
  opponentName: string;
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
};

function isMe(wentFirst: string | null, ptcglName: string) {
  if (!wentFirst) return null;
  return wentFirst.toLowerCase() === ptcglName.toLowerCase();
}

function countWhere(matches: QuestMatch[], pred: (m: QuestMatch) => boolean) {
  return matches.filter(pred).length;
}

function hasWinStreak(matches: QuestMatch[], len: number) {
  // matches expected newest-first
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

/** Sinh quest + note local từ lịch sử trận (không OpenAI). */
export function generateQuestBoard(input: {
  ptcglName: string;
  matchCount: number;
  matches: QuestMatch[];
  analysisCount: number;
  deckCount: number;
}): QuestBoardData {
  const need = PLAYER_ASSESSMENT_MIN_MATCHES;
  const unlocked = input.matchCount >= need;
  const me = input.ptcglName;
  const matches = input.matches;

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
  const winDecks = new Set(
    matches.filter((m) => m.result === "win" && m.deckId).map((m) => m.deckId as string),
  );

  const candidates: (QuestItem & { weight: number })[] = [
    {
      id: "win_first",
      title: "Thắng khi đi trước",
      detail: "Import 1 trận thắng mà bạn là người đi trước.",
      href: "/matches/import",
      progress: Math.min(1, winFirst),
      target: 1,
      done: winFirst >= 1,
      weight: winFirst >= 1 ? 0 : 40,
    },
    {
      id: "win_second",
      title: "Thắng khi đi sau",
      detail: "Import 1 trận thắng khi đối thủ đi trước (bạn đi sau).",
      href: "/matches/import",
      progress: Math.min(1, winSecond),
      target: 1,
      done: winSecond >= 1,
      weight: winSecond >= 1 ? 0 : 45,
    },
    {
      id: "win_concede",
      title: "Thắng nhờ concede",
      detail: "Import 1 trận thắng khi đối thủ concede / bỏ cuộc.",
      href: "/matches/import",
      progress: Math.min(1, winConcede),
      target: 1,
      done: winConcede >= 1,
      weight: winConcede >= 1 ? 0 : 35,
    },
    {
      id: "win_standard",
      title: "Thắng kết thúc chuẩn",
      detail: "Import 1 trận thắng bằng KO / lấy hết prize (không phải concede).",
      href: "/matches/import",
      progress: Math.min(1, winStandard),
      target: 1,
      done: winStandard >= 1,
      weight: winStandard >= 1 ? 0 : 35,
    },
    {
      id: "attach_deck",
      title: "Gắn deck khi import",
      detail: "Import 3 trận có chọn deck đã dùng — để win rate theo deck chính xác.",
      href: "/matches/import",
      progress: Math.min(3, withDeck),
      target: 3,
      done: withDeck >= 3,
      weight: withDeck >= 3 ? 0 : 30,
    },
    {
      id: "analyze_one",
      title: "Chạy AI Analyst 1 trận",
      detail: "Mở 1 trận bất kỳ và bấm AI Analyst.",
      href: matches[0] ? `/matches/${matches[0].id}` : "/dashboard",
      progress: Math.min(1, input.analysisCount),
      target: 1,
      done: input.analysisCount >= 1,
      weight: input.analysisCount >= 1 ? 0 : 50,
    },
    {
      id: "win_streak_2",
      title: "Chuỗi 2 trận thắng",
      detail: "Import để có 2 trận thắng liên tiếp trong lịch sử.",
      href: "/matches/import",
      progress: hasWinStreak(matches, 2) ? 1 : 0,
      target: 1,
      done: hasWinStreak(matches, 2),
      weight: hasWinStreak(matches, 2) ? 0 : 25,
    },
    {
      id: "win_two_decks",
      title: "Thắng với 2 deck",
      detail:
        input.deckCount < 2
          ? "Tạo thêm deck rồi import trận thắng cho ít nhất 2 list."
          : "Import trận thắng gắn với 2 deck khác nhau.",
      href: input.deckCount < 2 ? "/decks/new" : "/matches/import",
      progress: Math.min(2, winDecks.size),
      target: 2,
      done: winDecks.size >= 2,
      weight: winDecks.size >= 2 ? 0 : 28,
    },
  ];

  // Prefer incomplete high-weight, then fill with completed for progress feel
  const incomplete = candidates
    .filter((q) => !q.done)
    .sort((a, b) => b.weight - a.weight);
  const complete = candidates.filter((q) => q.done);
  const picked = [...incomplete.slice(0, 4), ...complete.slice(0, Math.max(0, 4 - incomplete.length))].slice(
    0,
    4,
  );

  const notes: CoachNote[] = [];
  if (winSecond === 0) {
    notes.push({
      id: "note_second",
      text: "Chưa có sample thắng đi sau — thêm vài trận kiểu này giúp đánh giá ổn định hơn.",
    });
  }
  if (winFirst === 0) {
    notes.push({
      id: "note_first",
      text: "Chưa có sample thắng đi trước — import để so sánh first/second cho công bằng.",
    });
  }
  if (winConcede === 0 && winStandard === 0) {
    notes.push({
      id: "note_end",
      text: "Hãy đa dạng cách thắng (concede vs KO/prize) để quest và phân tích phong phú hơn.",
    });
  } else if (withDeck < Math.min(3, matches.length)) {
    notes.push({
      id: "note_deck",
      text: "Nhiều trận chưa gắn deck — gắn list khi import để win rate theo deck đúng.",
    });
  }
  if (input.analysisCount === 0 && matches.length > 0) {
    notes.push({
      id: "note_ai",
      text: "Thử AI Analyst trên 1 trận gần đây (Boss timing, prize race…).",
    });
  }
  if (notes.length === 0) {
    notes.push({
      id: "note_good",
      text: "Data đã đa dạng khá tốt — tiếp tục import đều và làm quest còn lại.",
    });
  }

  return {
    unlocked,
    matchCount: input.matchCount,
    need,
    quests: picked.map(({ weight: _w, ...q }) => q),
    notes: notes.slice(0, 2),
    completedCount: candidates.filter((q) => q.done).length,
  };
}
