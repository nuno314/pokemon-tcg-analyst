import { parseBattleLog, type ParsedBattleLog } from "@/lib/parser/ptcgl-log";
import {
  analyzeMatchSignals,
  applyCoachingToMatch,
  applyCoachingToPlayer,
  COACHING,
} from "./coaching-knowledge";
import {
  aggregateMetaExposure,
  detectMetaDeckFromCards,
  metaMatchupNotes,
} from "./meta-decks";
import { inferActualOpponentLabel } from "./opponent-deck-display";
import { extractOpponentCards, extractLastOpponentKoPokemon } from "./opponent-log-cards";
import {
  inferPlayStyleFromRecent,
  inferTempoLabel,
  playStyleFocusTips,
} from "./playstyles";
import type { MatchAnalysisResult, PlayerAssessmentResult } from "./analyze";

const LOG_SLICE = 8000;

type MatchInput = {
  ptcglName: string;
  opponentName: string;
  result: "win" | "loss";
  wentFirst: string | null;
  deckName: string | null;
  turnCount: number;
  rawLog: string;
  userNote?: string | null;
};

export type RecentMatchWithLog = {
  opponent: string;
  result: "win" | "loss";
  resultReason: string | null;
  wentFirst: string | null;
  deck: string | null;
  rawLog: string;
  userNote?: string | null;
};

type PlayerInput = {
  ptcglName: string;
  matchCount: number;
  wins: number;
  losses: number;
  firstWinRate: number;
  secondWinRate: number;
  deckStats: { name: string; wins: number; losses: number }[];
  recent: RecentMatchWithLog[];
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

function isMe(wentFirst: string | null, ptcglName: string) {
  if (!wentFirst) return null;
  return wentFirst.toLowerCase() === ptcglName.toLowerCase();
}

function guessArchetype(cards: string[], opponentName: string, rawLog: string): string {
  const meta = detectMetaDeckFromCards(cards);
  if (meta) return `${meta.name} (meta ~${meta.share})`;

  const lastKo = extractLastOpponentKoPokemon(rawLog, opponentName);
  const actual = inferActualOpponentLabel(cards, lastKo);
  if (actual.name) return actual.name;

  const blob = cards.join(" ").toLowerCase();
  if (/charizard|pidgeot|rare candy/.test(blob)) return "Charizard / Stage engine";
  if (/gardevoir|ralt/.test(blob)) return "Gardevoir";
  if (/lugia|archeops/.test(blob)) return "Lugia";
  if (/lost (box|zone)|comfey|mirror box/.test(blob)) return "Lost Box";
  if (/miraidon|regieleki|iron hands|future/.test(blob)) return "Future box";
  if (/terapagos|area zero/.test(blob)) return "Terapagos";
  if (/banette|shuppet|dhelmise|sinistcha|poltchageist/.test(blob)) return "Banette / Dhelmise box";
  if (cards.length >= 2) return `Line: ${cards.slice(0, 2).join(", ")}`;
  return "Archetype chưa rõ (log ít tên bài)";
}


function extractKeyMoments(
  parsed: ParsedBattleLog | null,
  me: string,
  opp: string,
  log: string,
): string[] {
  const moments: string[] = [];
  if (!parsed) return moments;

  for (const turn of parsed.turns) {
    const isMyTurn = turn.player.toLowerCase() === me.toLowerCase();
    for (const ev of turn.events) {
      const t = ev.text;
      if (isMyTurn && ev.type === "attach") {
        moments.push(`Turn ${turn.turnNumber}: ${t.replace(/\.$/, "")}.`);
      }
      if (isMyTurn && /Boss's Orders/i.test(t)) {
        moments.push(`Turn ${turn.turnNumber}: bạn chơi Boss's Orders — chọn target chủ động.`);
      }
      if (isMyTurn && ev.type === "attack") {
        const atk = t.match(/used (.+?) on/i);
        if (atk) moments.push(`Turn ${turn.turnNumber}: ${turn.player} dùng ${atk[1]}.`);
      }
      if (ev.type === "knock_out" && new RegExp(`${escapeRegExp(me)} took`, "i").test(log)) {
        if (t.includes(`${me} took`) || log.includes(`${me} took a Prize`)) {
          moments.push(`Turn ${turn.turnNumber}: KO quan trọng — bạn lấy prize.`);
        }
      }
      if (new RegExp(`${escapeRegExp(me)}'s .+ was Knocked Out`, "i").test(t)) {
        moments.push(`Turn ${turn.turnNumber}: Pokémon Active/Bench của bạn bị KO.`);
      }
      if (!isMyTurn && /Boss's Orders/i.test(t)) {
        moments.push(`Turn ${turn.turnNumber}: ${opp} chơi Boss's Orders — ép switch.`);
      }
    }
  }

  if (/Opponent conceded/i.test(log)) {
    moments.push(`Kết thúc: ${opp} concede sau áp lực prize/setup.`);
  } else if (parsed.winner?.toLowerCase() === me.toLowerCase()) {
    moments.push(`Kết thúc: bạn thắng bằng KO/prize chuẩn.`);
  }

  return unique(moments).slice(0, 6);
}

function matchMetrics(rawLog: string, ptcglName: string) {
  const log = rawLog.slice(0, LOG_SLICE);
  let turnCount = 0;
  let parsed: ParsedBattleLog | null = null;
  try {
    parsed = parseBattleLog(log);
    turnCount = parsed.turns.length;
  } catch {
    turnCount = countMatches(log, /'s Turn$/gm);
  }
  const boss = countMatches(log, new RegExp(`${escapeRegExp(ptcglName)} played Boss's Orders`, "gi"));
  return { log, parsed, turnCount, boss };
}

export function aggregatePlayerPatterns(
  ptcglName: string,
  recent: RecentMatchWithLog[],
): string[] {
  const patterns: string[] = [];
  if (recent.length === 0) return patterns;

  const oppRecord = new Map<string, { w: number; l: number }>();
  let winConcede = 0;
  let winStandard = 0;
  let lossConcede = 0;
  let lossStandard = 0;
  let bossInWins = 0;
  let bossInLosses = 0;
  let winBossN = 0;
  let lossBossN = 0;
  let shortLosses = 0;
  const deckFirst = new Map<string, { w: number; l: number }>();
  const deckSecond = new Map<string, { w: number; l: number }>();

  for (const m of recent) {
    const rec = oppRecord.get(m.opponent) ?? { w: 0, l: 0 };
    if (m.result === "win") rec.w += 1;
    else rec.l += 1;
    oppRecord.set(m.opponent, rec);

    if (m.result === "win") {
      if (m.resultReason === "concede") winConcede += 1;
      else winStandard += 1;
    } else {
      if (m.resultReason === "concede") lossConcede += 1;
      else lossStandard += 1;
    }

    const { turnCount, boss } = matchMetrics(m.rawLog, ptcglName);
    if (m.result === "win") {
      bossInWins += boss;
      winBossN += 1;
    } else {
      bossInLosses += boss;
      lossBossN += 1;
      if (turnCount > 0 && turnCount < 8) shortLosses += 1;
    }

    if (m.deck) {
      const first = isMe(m.wentFirst, ptcglName);
      const map = first ? deckFirst : first === false ? deckSecond : null;
      if (map) {
        const d = map.get(m.deck) ?? { w: 0, l: 0 };
        if (m.result === "win") d.w += 1;
        else d.l += 1;
        map.set(m.deck, d);
      }
    }
  }

  for (const [opp, { w, l }] of [...oppRecord.entries()].sort((a, b) => b[1].w + b[1].l - (a[1].w + a[1].l))) {
    if (w + l >= 2) {
      patterns.push(`Gặp ${opp} ${w + l} lần: ${w}W-${l}L.`);
      if (patterns.length >= 2) break;
    }
  }

  const winTotal = winConcede + winStandard;
  if (winTotal >= 2) {
    const parts: string[] = [];
    if (winStandard) parts.push(`${winStandard} trận thắng KO/prize`);
    if (winConcede) parts.push(`${winConcede} trận thắng nhờ concede`);
    patterns.push(`Cách thắng gần đây: ${parts.join(", ")}.`);
  }

  if (lossStandard + lossConcede >= 2 && shortLosses >= 2) {
    patterns.push(
      `${shortLosses} trận thua kết thúc trước turn 8 — thường setup chậm hoặc thiếu Boss sớm.`,
    );
  }

  if (winBossN && lossBossN) {
    const avgWin = Math.round((bossInWins / winBossN) * 10) / 10;
    const avgLoss = Math.round((bossInLosses / lossBossN) * 10) / 10;
    if (avgWin > avgLoss + 0.5) {
      patterns.push(
        `Trận thắng dùng Boss's Orders nhiều hơn trận thua (≈${avgWin} vs ≈${avgLoss} lần/trận).`,
      );
    } else if (avgLoss < 0.5 && lossBossN >= 2) {
      patterns.push(`Nhiều trận thua hầu như không chơi Boss — dễ bị kẹt Active.`);
    }
  }

  for (const [deck, { w, l }] of deckFirst) {
    if (w + l >= 2 && w / (w + l) >= 0.65) {
      patterns.push(`Deck "${deck}" mạnh khi đi trước (${w}W-${l}L trong sample gần đây).`);
      break;
    }
  }
  for (const [deck, { w, l }] of deckSecond) {
    if (w + l >= 2 && w / (w + l) >= 0.65) {
      patterns.push(`Deck "${deck}" mạnh khi đi sau (${w}W-${l}L trong sample gần đây).`);
      break;
    }
  }

  const form = recent
    .slice(0, 5)
    .map((m) => (m.result === "win" ? "W" : "L"))
    .join(" ");
  if (recent.length >= 3) {
    patterns.push(`Form 5 trận gần nhất: ${form}.`);
  }

  return unique(patterns).slice(0, 6);
}

export function analyzeMatchLocal(input: MatchInput): MatchAnalysisResult {
  const me = input.ptcglName;
  const opp = input.opponentName;
  const { log, parsed } = matchMetrics(input.rawLog, me);
  const turnCount = parsed?.turns.length ?? input.turnCount;

  const myBoss = countMatches(log, new RegExp(`${escapeRegExp(me)} played Boss's Orders`, "gi"));
  const oppBoss = countMatches(log, new RegExp(`${escapeRegExp(opp)} played Boss's Orders`, "gi"));
  const myPrizes = countMatches(log, new RegExp(`${escapeRegExp(me)} took (a|\\d+) Prize`, "gi"));
  const myRetreats = countMatches(log, new RegExp(`${escapeRegExp(me)} retreated `, "gi"));
  const myEnergyAttach = countMatches(log, new RegExp(`${escapeRegExp(me)} attached .+ Energy`, "gi"));
  const conceded = /Opponent conceded/i.test(log);
  const wentFirstMe =
    input.wentFirst?.toLowerCase() === me.toLowerCase() ||
    parsed?.wentFirst?.toLowerCase() === me.toLowerCase();

  const myCards = uniqueCardsPlayedBy(log, me);
  const oppCards = extractOpponentCards(input.rawLog, opp);
  const myArch = guessArchetype(myCards, me, log);
  const oppArch = guessArchetype(oppCards, opp, log);
  const oppMeta = detectMetaDeckFromCards(oppCards);
  const moments = extractKeyMoments(parsed, me, opp, log);

  const goodPlays: string[] = [];
  const mistakes: string[] = [];
  const tips: string[] = [];
  const opponentNotes: string[] = [];

  for (const m of moments.filter((x) => /Turn|Kết thúc/.test(x))) {
    if (input.result === "win" && (/KO quan trọng|Boss's Orders|dùng .* on|concede/.test(m))) {
      goodPlays.push(m);
    } else if (input.result === "loss" && /bị KO|Boss's Orders — ép/.test(m)) {
      mistakes.push(m);
    } else if (input.result === "win") {
      goodPlays.push(m);
    }
  }

  if (input.result === "win") {
    if (conceded) {
      goodPlays.push(`${opp} concede — áp lực prize/setup khiến đối thủ không gỡ được.`);
    } else if (myPrizes >= 2) {
      goodPlays.push(`Chốt trận qua chuỗi lấy prize (${myPrizes} lần ghi nhận trong log).`);
    }
  } else {
    mistakes.push(`Thua trước ${opp}${conceded ? " sau khi board nghiêng" : " — đối thủ chốt prize trước"}.`);
  }

  if (myBoss === 0 && turnCount >= 6) {
    mistakes.push("Không thấy Boss's Orders suốt trận — khó chọn KO hoặc phá bench đối thủ.");
    tips.push("Giữ Boss cho turn mà Active đối thủ là mục tiêu 2 prize hoặc không retreat được.");
  } else if (myBoss > 0) {
    const bossMoment = moments.find((m) => /Boss's Orders/.test(m));
    if (bossMoment) goodPlays.push(bossMoment);
  }

  if (oppBoss > myBoss + 1) {
    opponentNotes.push(
      `${opp} chủ động Boss hơn bạn (${oppBoss} vs ${myBoss}) — họ ép switch/KO dễ hơn.`,
    );
  }

  if (wentFirstMe && input.result === "loss") {
    mistakes.push("Đi trước nhưng thua — thường do turn 1–2 chưa có bench/energy hoặc bị punish sớm.");
    tips.push("Ôn lại opening: mulligan hand, bench basic, và attach turn 1–2.");
  } else if (!wentFirstMe && input.result === "win") {
    goodPlays.push("Đi sau vẫn thắng — comeback hoặc stabilize giữa trận tốt.");
  }

  if (myEnergyAttach === 0 && turnCount >= 4) {
    mistakes.push("Log gần như không attach energy — có thể bị lock energy hoặc brick hand.");
  }

  if (myRetreats >= 3) {
    tips.push(`Retreat ${myRetreats} lần — thêm Switch / Air Balloon nếu deck hay đổi Active.`);
  }

  if (turnCount <= 5 && input.result === "win") {
    goodPlays.push("Trận ngắn — áp lực sớm hoặc đối thủ gãy ngay turn đầu.");
  } else if (turnCount >= 14) {
    tips.push("Trận dài — đếm prize còn lại trước khi over-commit Boss.");
  }

  opponentNotes.push(`Đối thủ (${oppArch}): ${oppCards.slice(0, 5).join(", ") || "log ít tên bài"}.`);
  if (oppCards.length === 0) {
    opponentNotes.push("Bật hiện card ID trong export để lần sau analyst đọc bài rõ hơn.");
  }

  if (oppMeta) {
    const meta = metaMatchupNotes(oppMeta, {
      wentFirstMe: wentFirstMe ?? false,
      result: input.result,
      log,
    });
    opponentNotes.push(...meta.opponentNotes);
    tips.push(...meta.tips);
    if (input.result === "loss") mistakes.push(...meta.mistakes);
    else goodPlays.push(`[vs ${oppMeta.name}] Bạn thắng matchup meta — giữ plan tương tự lần sau.`);
  }

  tips.push(
    input.deckName
      ? `Với deck "${input.deckName}" vs ${oppArch}: luyện matchup Boss timing và prize trade.`
      : `Gắn deck khi import — hiện thấy line ${myArch}.`,
  );

  if (goodPlays.length === 0) {
    goodPlays.push("Xem timeline từng turn để tìm điểm then chốt (attach, Boss, KO).");
  }

  const signals = analyzeMatchSignals(log, parsed, me, opp, wentFirstMe ?? false, turnCount);
  applyCoachingToMatch(signals, input.result, tips, mistakes);

  const note = input.userNote?.trim();
  if (note) {
    tips.unshift(`[Ghi chú của bạn] ${note.slice(0, 280)}${note.length > 280 ? "…" : ""}`);
    tips.push(
      "Bạn đã tự ghi nhận điểm then chốt — lần phân tích lại sau khi sửa note sẽ phản ánh insight đó.",
    );
  }

  const deckPart = input.deckName ? ` với deck "${input.deckName}"` : "";
  const endPart = conceded
    ? `${opp} concede.`
    : input.result === "win"
      ? "chốt bằng KO/prize."
      : `${opp} chốt trước.`;
  const summary = [
    `Trận vs ${opp}${deckPart}: bạn ${input.result === "win" ? "thắng" : "thua"}`,
    wentFirstMe ? "đi trước" : input.wentFirst ? "đi sau" : "",
    `sau ${turnCount} turn, ${endPart}`,
    `Line bạn: ${myArch}. Đối thủ: ${oppArch}.`,
    note ? `Ghi chú người chơi: ${note.slice(0, 120)}${note.length > 120 ? "…" : ""}.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return {
    summary,
    goodPlays: unique(goodPlays).slice(0, 6),
    mistakes: unique(mistakes).slice(0, 5),
    tips: unique(tips).slice(0, 6),
    opponentNotes: unique(opponentNotes).slice(0, 6),
  };
}

export function assessPlayerLocal(input: PlayerInput): PlayerAssessmentResult {
  const total = input.wins + input.losses || 1;
  const wr = input.wins / total;
  const first = input.firstWinRate;
  const second = input.secondWinRate;
  const patterns = aggregatePlayerPatterns(input.ptcglName, input.recent);

  const playStyle = inferPlayStyleFromRecent(
    input.ptcglName,
    input.recent.map((r) => ({
      opponent: r.opponent,
      result: r.result,
      rawLog: r.rawLog,
      wentFirst: r.wentFirst,
    })),
  );
  const tempo = inferTempoLabel(wr, first, second, input.matchCount);
  const archetype = `${playStyle.label} · ${tempo}`;

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
    ? `${recentWins}/${input.recent.length} thắng trong ${input.recent.length} trận phân tích`
    : "chưa đủ sample";

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const focus: string[] = [];

  for (const p of patterns) {
    if (/mạnh khi|Cách thắng|Boss's Orders nhiều hơn trận thắng|Form.*W.*W/.test(p)) {
      strengths.push(p);
    } else if (/thua kết thúc|không chơi Boss|Gặp.*\dW-\dL.*0W|yếu/i.test(p)) {
      weaknesses.push(p);
    } else {
      strengths.push(p);
    }
  }

  if (wr >= 0.55 && strengths.length < 3) {
    strengths.push(`Win rate tổng ${Math.round(wr * 100)}% (${input.wins}W-${input.losses}L).`);
  } else if (wr < 0.45) {
    weaknesses.push(`Win rate tổng ${Math.round(wr * 100)}% — cần ổn định opening và prize trade.`);
  }

  if (first >= 0.55 && !strengths.some((s) => /đi trước/i.test(s))) {
    strengths.push(`Đi trước hiệu quả (~${Math.round(first * 100)}% win rate).`);
  } else if (first < 0.4 && first > 0) {
    weaknesses.push(`Đi trước yếu (~${Math.round(first * 100)}%) — review turn 1–2 và bench.`);
  }

  if (second >= 0.55 && !strengths.some((s) => /đi sau/i.test(s))) {
    strengths.push(`Đi sau ổn (~${Math.round(second * 100)}% win rate).`);
  } else if (second < 0.4 && second > 0) {
    weaknesses.push(`Đi sau yếu (~${Math.round(second * 100)}%) — luyện stabilize và comeback.`);
  }

  if (bestDeck && bestDeck.wins + bestDeck.losses >= 2) {
    const rate = Math.round((bestDeck.wins / (bestDeck.wins + bestDeck.losses)) * 100);
    strengths.push(`Deck "${bestDeck.name}" đang carry (${bestDeck.wins}W-${bestDeck.losses}L, ~${rate}%).`);
  }
  if (worstDeck) {
    weaknesses.push(`Deck "${worstDeck.name}" cần review (${worstDeck.wins}W-${worstDeck.losses}L).`);
    focus.push(`Chơi thêm 5 ván "${worstDeck.name}" và ghi lại vì sao thua (setup / Boss / prize).`);
  }

  if (Math.abs(first - second) >= 0.2) {
    focus.push(
      first > second
        ? "Tập trung luyện đi sau: giữ bench, tránh bị KO sớm turn 2–3."
        : "Tập trung luyện đi trước: ép prize trước turn 6, đừng over-setup.",
    );
  }

  if (weaknesses.some((w) => /Boss/i.test(w))) {
    focus.push("Mỗi trận thua: mở log xem turn nào cần Boss mà chưa có.");
  }

  applyCoachingToPlayer(
    focus,
    input.ptcglName,
    input.recent.map((r) => ({
      opponent: r.opponent,
      result: r.result,
      rawLog: r.rawLog,
      wentFirst: r.wentFirst,
    })),
  );

  for (const tip of playStyleFocusTips(playStyle.id)) {
    focus.push(`[${playStyle.label}] ${tip}`);
  }
  strengths.unshift(playStyle.summary);

  const recentNotes = input.recent
    .map((r) => r.userNote?.trim())
    .filter((n): n is string => Boolean(n && n.length > 0));
  if (recentNotes.length > 0) {
    const blob = recentNotes.join(" ").toLowerCase();
    if (/boss|gust|switch/.test(blob)) {
      focus.push("Ghi chú gần đây hay nhắc Boss/gust — ưu tiên ôn timing gust khi review trận thua.");
    }
    if (/energy|brick|attach|neo upper|metal maker/.test(blob)) {
      focus.push("Ghi chú gần đây hay nhắc energy/brick — luyện opening attach và recovery (Rod/Retrieval).");
    }
    if (/prize|map|2.?prize|ohko/.test(blob)) {
      focus.push("Ghi chú gần đây hay nhắc prize map — trước mỗi turn hỏi cần mấy prize còn lại.");
    }
    for (const n of recentNotes.slice(0, 3)) {
      focus.push(
        `[Ghi chú trận] ${n.slice(0, 100)}${n.length > 100 ? "…" : ""}`,
      );
    }
  }

  const metaExposure = aggregateMetaExposure(
    input.recent.map((r) => ({ opponent: r.opponent, result: r.result, rawLog: r.rawLog })),
  );
  for (const { deck, wins, losses } of metaExposure.slice(0, 3)) {
    const total = wins + losses;
    if (total < 1) continue;
    const line = `vs ${deck.name} (meta ~${deck.share}): ${wins}W-${losses}L.`;
    if (losses > wins) {
      weaknesses.push(line);
      focus.push(`[${deck.name}] ${deck.counters[0]}`);
      if (deck.engine) {
        const snippet = deck.engine.length > 120 ? `${deck.engine.slice(0, 120)}…` : deck.engine;
        focus.push(snippet);
      }
    } else {
      strengths.push(line);
    }
  }

  if (focus.length === 0) {
    focus.push("Import đều và đa dạng matchup để pattern rõ hơn.");
  }
  if (focus.length > 7) focus.length = 7;
  if (strengths.length === 0) strengths.push("Đã có sample — tiếp tục import để review sắc hơn.");
  if (weaknesses.length === 0) weaknesses.push("Chưa thấy lỗi lặp rõ — thêm trận vs meta khác nhau.");

  const noteBit =
    recentNotes.length > 0
      ? ` Đã đọc ${recentNotes.length} ghi chú trận gần đây.`
      : "";
  const summary = `${input.ptcglName} sau ${input.matchCount} trận: ${playStyle.label}, tempo “${tempo}”. ${form}.${noteBit} ${
    patterns[0] ?? `Win rate ${Math.round(wr * 100)}%.`
  } Nên tập trung: ${COACHING.prize_checking.title.toLowerCase()}, ${COACHING.prize_mapping.title.toLowerCase()}, ${COACHING.sequencing.title.toLowerCase()}.`;

  return {
    archetype,
    playStyle: playStyle.label,
    tempo,
    summary,
    strengths: unique(strengths).slice(0, 6),
    weaknesses: unique(weaknesses).slice(0, 5),
    focus: unique(focus).slice(0, 7),
  };
}

function unique(items: string[]) {
  return [...new Set(items.filter(Boolean))];
}
