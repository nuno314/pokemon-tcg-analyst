import { parseBattleLog } from "@/lib/parser/ptcgl-log";
import type { MatchAnalysisResult, PlayerAssessmentResult } from "./analyze";

type MatchInput = {
  ptcglName: string;
  opponentName: string;
  result: "win" | "loss";
  wentFirst: string | null;
  deckName: string | null;
  turnCount: number;
  rawLog: string;
};

type PlayerInput = {
  ptcglName: string;
  matchCount: number;
  wins: number;
  losses: number;
  firstWinRate: number;
  secondWinRate: number;
  deckStats: { name: string; wins: number; losses: number }[];
  recent: { opponent: string; result: string; deck: string | null; wentFirst: string | null }[];
};

function countMatches(log: string, re: RegExp) {
  return [...log.matchAll(re)].length;
}

function uniqueCardsPlayedBy(log: string, player: string): string[] {
  const names = new Set<string>();
  const re = new RegExp(
    `${escapeRegExp(player)} (?:played|attached|evolved .+ to) (.+?)(?:\\.| to the| in the| on )`,
    "gi",
  );
  for (const m of log.matchAll(re)) {
    const name = m[1]?.replace(/\s+to the Bench.*/i, "").trim();
    if (name && name.length < 60) names.add(name);
  }
  // Attacks / abilities: "Player's Card used Ability"
  const used = new RegExp(`${escapeRegExp(player)}'s (.+?) used `, "gi");
  for (const m of log.matchAll(used)) {
    const name = m[1]?.trim();
    if (name && name.length < 60) names.add(name);
  }
  return [...names].slice(0, 12);
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function guessArchetype(cards: string[]): string {
  const blob = cards.join(" ").toLowerCase();
  if (/charizard|pidgeot|rare candy/.test(blob)) return "Charizard / Stage engine";
  if (/dragapult|drakloak|dreepy|dusknoir/.test(blob)) return "Dragapult line";
  if (/gardevoir|ralt/.test(blob)) return "Gardevoir";
  if (/lugia|archeops/.test(blob)) return "Lugia";
  if (/lost (box|zone)|comfey|mirror box/.test(blob)) return "Lost Box";
  if (/roaring moon|ancient/.test(blob)) return "Ancient / Roaring Moon";
  if (/miraidon|regieleki|iron hands|future/.test(blob)) return "Future box";
  if (/terapagos|area zero/.test(blob)) return "Terapagos";
  if (/starmie|froslass|snorunt/.test(blob)) return "Starmie / Frost line";
  if (/metagross|beldum|genesect|cinccino/.test(blob)) return "Metal toolbox";
  if (cards.length >= 3) return `Line chính xoay quanh ${cards.slice(0, 2).join(", ")}`;
  return "Archetype chưa rõ (log ít tên bài)";
}

export function analyzeMatchLocal(input: MatchInput): MatchAnalysisResult {
  const me = input.ptcglName;
  const opp = input.opponentName;
  const log = input.rawLog;
  const parsed = (() => {
    try {
      return parseBattleLog(log);
    } catch {
      return null;
    }
  })();

  const myBoss = countMatches(log, new RegExp(`${escapeRegExp(me)} played Boss's Orders`, "gi"));
  const oppBoss = countMatches(log, new RegExp(`${escapeRegExp(opp)} played Boss's Orders`, "gi"));
  const myPrizes = countMatches(log, new RegExp(`${escapeRegExp(me)} took (a|\\d+) Prize`, "gi"));
  const oppPrizes = countMatches(log, new RegExp(`${escapeRegExp(opp)} took (a|\\d+) Prize`, "gi"));
  const myRetreats = countMatches(log, new RegExp(`${escapeRegExp(me)} retreated `, "gi"));
  const myEnergyAttach = countMatches(log, new RegExp(`${escapeRegExp(me)} attached .+ Energy`, "gi"));
  const myKos = countMatches(log, new RegExp(`was Knocked Out![\\s\\S]{0,120}${escapeRegExp(me)} took`, "gi"));
  const conceded = /Opponent conceded/i.test(log);
  const wentFirstMe =
    input.wentFirst?.toLowerCase() === me.toLowerCase() ||
    parsed?.wentFirst?.toLowerCase() === me.toLowerCase();

  const myCards = uniqueCardsPlayedBy(log, me);
  const oppCards = uniqueCardsPlayedBy(log, opp);
  const myArch = guessArchetype(myCards);
  const oppArch = guessArchetype(oppCards);

  const goodPlays: string[] = [];
  const mistakes: string[] = [];
  const tips: string[] = [];
  const opponentNotes: string[] = [];

  if (input.result === "win") {
    goodPlays.push(
      conceded
        ? "Đối thủ concede — bạn đã tạo đủ áp lực hoặc prize race nghiêng rõ."
        : `Bạn chốt được trận (${myPrizes} lần lấy prize được ghi nhận trong log).`,
    );
  } else {
    mistakes.push(
      `Thua trước ${opp}. Prize đối thủ được ghi nhận khoảng ${oppPrizes} lần lấy prize trong log.`,
    );
  }

  if (myBoss > 0) {
    goodPlays.push(`Dùng Boss's Orders ${myBoss} lần — có chủ đích sniper Active.`);
  } else if (input.turnCount >= 6) {
    mistakes.push("Hầu như không thấy Boss's Orders — dễ bị kẹt Active xấu / chậm prize.");
    tips.push("Giữ ít nhất 1–2 Boss cho cửa sổ KO 2 prize hoặc phá setup đối thủ.");
  }

  if (oppBoss > myBoss + 1) {
    opponentNotes.push(
      `${opp} dùng Boss nhiều hơn bạn (${oppBoss} vs ${myBoss}) — họ chủ động chọn target; chuẩn bị tank/switch.`,
    );
  }

  if (wentFirstMe && input.result === "win") {
    goodPlays.push("Đi trước và thắng — nhịp setup/tấn công đầu game ổn.");
  } else if (wentFirstMe && input.result === "loss") {
    mistakes.push("Đi trước nhưng vẫn thua — thường do setup chậm hoặc bị punish turn 2–3.");
    tips.push("Review lại turn 1–2: bench cơ bản, energy, và công cụ search có ra đúng nhịp không.");
  } else if (!wentFirstMe && input.result === "win") {
    goodPlays.push("Đi sau vẫn thắng — khả năng stabilize / comeback prize race tốt.");
  }

  if (myEnergyAttach === 0 && input.turnCount >= 4) {
    mistakes.push("Log gần như không thấy attach energy của bạn — có thể stuck energy hoặc bị disruption.");
    tips.push("Kiểm tra đường lấy energy (Basic/Special) và số lần attach mỗi turn.");
  } else if (myEnergyAttach >= input.turnCount) {
    goodPlays.push("Nhịp attach energy khá đều so với số turn.");
  }

  if (myRetreats >= 3) {
    tips.push(
      `Retreat khá nhiều (${myRetreats}) — cân nhắc Air Balloon / Switch / free retreat để đỡ mất tempo.`,
    );
  }

  if (input.turnCount <= 5 && input.result === "win") {
    goodPlays.push("Trận kết thúc nhanh — áp lực sớm hoặc đối thủ gãy setup.");
  } else if (input.turnCount >= 14) {
    opponentNotes.push("Trận kéo dài — đối thủ có thể grind/control; ưu tiên consistency và resource.");
    tips.push("Trong mirror/grind: đếm prize còn lại và tránh over-extend Boss sớm.");
  }

  if (myKos > 0) {
    goodPlays.push(`Có chuỗi KO dẫn tới lấy prize (ước lượng ${myKos} cụm KO liên quan bạn).`);
  }

  opponentNotes.push(`Ước lượng archetype đối thủ: ${oppArch}.`);
  if (oppCards.length) {
    opponentNotes.push(`Bài nổi bật phía ${opp}: ${oppCards.slice(0, 6).join(", ")}.`);
  } else {
    opponentNotes.push("Log ít lộ bài đối thủ — lần sau tắt Hide card IDs nếu muốn analyst chi tiết hơn.");
  }

  tips.push(
    input.deckName
      ? `Với deck "${input.deckName}" (${myArch}): ưu tiên rehearsal matchup vs ${oppArch}.`
      : `Gắn deck khi import để lần sau so matchup theo list cụ thể (hiện thấy line: ${myArch}).`,
  );

  if (goodPlays.length === 0) {
    goodPlays.push("Chưa bắt được điểm nổi bật rõ — xem lại timeline turn đầu và cửa sổ Boss.");
  }

  const summary = [
    `Trận vs ${opp}: bạn ${input.result === "win" ? "thắng" : "thua"}`,
    wentFirstMe ? "đi trước" : input.wentFirst ? "đi sau" : "không rõ ai đi trước",
    `sau khoảng ${input.turnCount} turn.`,
    `Phân tích local (không dùng OpenAI) dựa trên Boss ${myBoss}/${oppBoss}, prize events ${myPrizes}/${oppPrizes}, energy attach ~${myEnergyAttach}.`,
    `Bạn: ${myArch}. Đối thủ: ${oppArch}.`,
  ].join(" ");

  return {
    summary,
    goodPlays: unique(goodPlays),
    mistakes: unique(mistakes),
    tips: unique(tips),
    opponentNotes: unique(opponentNotes),
  };
}

export function assessPlayerLocal(input: PlayerInput): PlayerAssessmentResult {
  const total = input.wins + input.losses || 1;
  const wr = input.wins / total;
  const first = input.firstWinRate;
  const second = input.secondWinRate;

  let archetype = "All-rounder";
  if (wr >= 0.6 && first >= second + 0.1) archetype = "First-turn aggressor";
  else if (wr >= 0.6 && second >= first + 0.1) archetype = "Second-player stabilizer";
  else if (wr < 0.4) archetype = "Đang tìm nhịp (inconsistent)";
  else if (first < 0.35 && input.matchCount >= 10) archetype = "Yếu khi đi trước";
  else if (second < 0.35 && input.matchCount >= 10) archetype = "Yếu khi đi sau";

  const bestDeck = [...input.deckStats].sort(
    (a, b) => b.wins / Math.max(1, b.wins + b.losses) - a.wins / Math.max(1, a.wins + a.losses),
  )[0];
  const worstDeck = [...input.deckStats]
    .filter((d) => d.wins + d.losses >= 2)
    .sort(
      (a, b) => a.wins / Math.max(1, a.wins + a.losses) - b.wins / Math.max(1, b.wins + b.losses),
    )[0];

  const recentWins = input.recent.filter((r) => r.result === "win").length;
  const form = input.recent.length
    ? `${recentWins}/${input.recent.length} thắng ở các trận gần đây`
    : "chưa đủ lịch sử gần đây";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const focus: string[] = [];

  if (wr >= 0.55) strengths.push(`Win rate tổng ổn (~${Math.round(wr * 100)}%).`);
  else weaknesses.push(`Win rate tổng còn thấp (~${Math.round(wr * 100)}%).`);

  if (first >= 0.55) strengths.push(`Mạnh khi đi trước (~${Math.round(first * 100)}%).`);
  else if (first > 0) weaknesses.push(`Đi trước chưa hiệu quả (~${Math.round(first * 100)}%).`);

  if (second >= 0.55) strengths.push(`Mạnh khi đi sau (~${Math.round(second * 100)}%).`);
  else if (second > 0) weaknesses.push(`Đi sau còn yếu (~${Math.round(second * 100)}%).`);

  if (bestDeck && bestDeck.wins + bestDeck.losses > 0) {
    strengths.push(
      `Deck tốt nhất hiện tại: ${bestDeck.name} (${bestDeck.wins}W-${bestDeck.losses}L).`,
    );
  }
  if (worstDeck) {
    weaknesses.push(
      `Deck cần review: ${worstDeck.name} (${worstDeck.wins}W-${worstDeck.losses}L).`,
    );
    focus.push(`Spile thêm 5–10 ván ${worstDeck.name} và note vì sao thua (prize / setup / Boss).`);
  }

  if (Math.abs(first - second) >= 0.2) {
    focus.push(
      first > second
        ? "Luyện bài đi sau: stabilize turn 1–2, tránh bị KO sớm."
        : "Luyện bài đi trước: ép prize sớm, đừng over-setup.",
    );
  }

  focus.push("Sau mỗi trận dùng AI Analyst local để ghi 1 lỗi + 1 fix cụ thể.");
  if (focus.length > 3) focus.length = 3;
  if (strengths.length === 0) strengths.push("Đã có sample trận để theo dõi — tiếp tục import đều.");
  if (weaknesses.length === 0) weaknesses.push("Chưa thấy điểm yếu thống kê rõ — cần thêm đa dạng đối thủ.");

  const summary = `${input.ptcglName} sau ${input.matchCount} trận có phong cách gần với “${archetype}”. Win rate ${Math.round(wr * 100)}% (${input.wins}W-${input.losses}L), form gần đây: ${form}. Đánh giá này chạy local từ thống kê, không gọi OpenAI.`;

  return {
    archetype,
    summary,
    strengths: unique(strengths),
    weaknesses: unique(weaknesses),
    focus: unique(focus),
  };
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}
