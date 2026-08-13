import { parseBattleLog } from "@/lib/parser/ptcgl-log";
import { analyzeMatchSignals } from "@/lib/ai/coaching-knowledge";

export type PlayStyleId = "aggressive" | "defensive" | "disruptive" | "hybrid";

export type PlayStyleGuide = {
  id: PlayStyleId;
  label: string;
  summary: string;
  tips: string[];
};

export const PLAY_STYLES: Record<PlayStyleId, PlayStyleGuide> = {
  aggressive: {
    id: "aggressive",
    label: "Aggressive (OHKO / rush prize)",
    summary:
      "Ép prize sớm — setup attacker mạnh, KO 2–3 prize trước khi đối thủ ổn định. Phù hợp meta Mega era.",
    tips: [
      "Map prize trước turn 3: cần mấy attack để lấy 6 prize, target nào 2 prize trước.",
      "Đi trước: bench tối thiểu nhưng đủ — tránh bị snipe turn 2 rồi mất nhịp.",
      "Giữ Boss cho turn Active đối thủ là ex và không retreat được.",
    ],
  },
  defensive: {
    id: "defensive",
    label: "Defensive (outlast / sustain)",
    summary:
      "Kéo dài game — heal, tank, hoặc stall để đối thủ hết resource trước khi bạn hết prize.",
    tips: [
      "Biết khi nào chậm lại prize trade thay vì rush — đừng over-commit Boss khi chưa cần.",
      "Theo dõi deck/hand đối thủ; thắng dài thường nhờ resource advantage turn 10+.",
      "Vs aggro meta: stabilize bench và heal trước khi swing back.",
    ],
  },
  disruptive: {
    id: "disruptive",
    label: "Disruptive (hand / energy / status)",
    summary:
      "Phá combo — Iono, discard energy, Boss ép switch, status để đối thủ không execute plan.",
    tips: [
      "Timing disruption: Iono sau khi opp search/setup, không trước khi bạn cần thin deck.",
      "Boss ép Active yếu hoặc setup Pokémon trước turn damage lớn của họ.",
      "Kết hợp status + prize pressure — disruption không thay thế prize map.",
    ],
  },
  hybrid: {
    id: "hybrid",
    label: "Hybrid (đa phong cách)",
    summary: "Trộn aggro, sustain và disruption — linh hoạt theo matchup và opening.",
    tips: [
      "Gắn deck khi import để thấy deck nào bạn chơi aggro vs control.",
      "Mỗi matchup chọn plan: rush prize hay disrupt trước setup.",
      "Review log trận thua — có lẽ chọn sai plan (rush vào stall hoặc grind vs OHKO).",
    ],
  },
};

type RecentForStyle = {
  opponent: string;
  result: "win" | "loss";
  rawLog: string;
  wentFirst: string | null;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countInLog(log: string, re: RegExp) {
  return [...log.matchAll(re)].length;
}

function scoreMatchForStyles(log: string, me: string, opp: string, turnCount: number) {
  const scores = { aggressive: 0, defensive: 0, disruptive: 0 };
  const p = escapeRegExp(me);

  let parsed = null;
  try {
    parsed = parseBattleLog(log.slice(0, 8000));
    turnCount = parsed.turns.length || turnCount;
  } catch {
    /* partial log */
  }

  const wentFirstMe =
    parsed?.wentFirst?.toLowerCase() === me.toLowerCase() ||
    new RegExp(`${p} decided to go first`, "i").test(log) ||
    new RegExp(`${escapeRegExp(opp)} decided to go second`, "i").test(log);
  const signals = analyzeMatchSignals(log, parsed, me, opp, wentFirstMe, turnCount);

  const myBoss = countInLog(log, new RegExp(`${p} played Boss's Orders`, "gi"));
  const myIono = countInLog(log, new RegExp(`${p} played Iono`, "gi"));
  const highDamage = countInLog(log, new RegExp(`${p}'s .+ for (1[89]\\d|[2-9]\\d{2}) damage`, "gi"));
  const heal = countInLog(log, new RegExp(`${p}'s .+ healed \\d+ damage|${p} played Wally's Compassion`, "gi"));
  const status = countInLog(log, /is now (Poisoned|Burned|Asleep|Confused|Paralyzed)/gi);
  const discardEnergy = countInLog(
    log,
    new RegExp(`${p} moved .+ Energy to the discard pile`, "gi"),
  );
  const tookMultiPrize = countInLog(log, new RegExp(`${p} took [2-9] Prize`, "gi"));

  if (signals.shortGame) scores.aggressive += 2;
  if (signals.longGame) scores.defensive += 2;
  if (highDamage >= 1) scores.aggressive += 2;
  if (tookMultiPrize >= 1) scores.aggressive += 2;
  if (heal >= 1) scores.defensive += 2;
  if (myIono >= 1) scores.disruptive += 2;
  if (myBoss >= 1) scores.disruptive += 1;
  if (status >= 1) scores.disruptive += 1;
  if (discardEnergy >= 1) scores.disruptive += 1;
  if (turnCount >= 14) scores.defensive += 1;
  if (turnCount <= 7 && highDamage >= 1) scores.aggressive += 1;

  return scores;
}

export function inferPlayStyleFromRecent(
  ptcglName: string,
  recent: RecentForStyle[],
): { id: PlayStyleId; label: string; summary: string } {
  const totals = { aggressive: 0, defensive: 0, disruptive: 0 };

  for (const m of recent.slice(0, 10)) {
    const me = ptcglName;
    const log = m.rawLog.slice(0, 8000);
    let turnCount = 0;
    try {
      turnCount = parseBattleLog(log).turns.length;
    } catch {
      turnCount = countInLog(log, /'s Turn$/gm);
    }
    const s = scoreMatchForStyles(log, me, m.opponent, turnCount);
    const weight = m.result === "win" ? 1.2 : 1;
    totals.aggressive += s.aggressive * weight;
    totals.defensive += s.defensive * weight;
    totals.disruptive += s.disruptive * weight;
  }

  const ranked = (Object.entries(totals) as [Exclude<PlayStyleId, "hybrid">, number][]).sort(
    (a, b) => b[1] - a[1],
  );

  const samples = Math.min(recent.length, 10);
  if (samples < 2 || ranked[0][1] < 4) {
    const h = PLAY_STYLES.hybrid;
    return { id: "hybrid", label: h.label, summary: h.summary };
  }

  if (ranked[0][1] < 2) {
    const h = PLAY_STYLES.hybrid;
    return { id: "hybrid", label: h.label, summary: h.summary };
  }

  const top = ranked[0][1];
  const second = ranked[1]?.[1] ?? 0;
  if (second >= top - 2 && second >= 3) {
    const h = PLAY_STYLES.hybrid;
    return { id: "hybrid", label: h.label, summary: h.summary };
  }

  const id = ranked[0][0];
  const guide = PLAY_STYLES[id];
  return { id, label: guide.label, summary: guide.summary };
}

export function inferTempoLabel(
  wr: number,
  firstWr: number,
  secondWr: number,
  matchCount: number,
): string {
  if (matchCount >= 10 && firstWr < 0.35 && firstWr > 0) return "Yếu khi đi trước";
  if (matchCount >= 10 && secondWr < 0.35 && secondWr > 0) return "Yếu khi đi sau";
  if (wr >= 0.6 && firstWr >= secondWr + 0.1) return "Đi trước mạnh";
  if (wr >= 0.6 && secondWr >= firstWr + 0.1) return "Đi sau ổn";
  if (wr < 0.4) return "Đang tìm nhịp";
  return "All-rounder (tempo)";
}

export function playStyleFocusTips(id: PlayStyleId): string[] {
  return PLAY_STYLES[id].tips.slice(0, 2);
}
