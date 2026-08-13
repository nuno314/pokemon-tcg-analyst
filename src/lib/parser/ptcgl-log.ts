export type BattleEventType =
  | "coin_flip"
  | "go_first"
  | "draw"
  | "play"
  | "attach"
  | "evolve"
  | "retreat"
  | "ability"
  | "attack"
  | "knock_out"
  | "take_prize"
  | "end_turn"
  | "concede"
  | "win"
  | "other";

export type ParsedBattleEvent = {
  type: BattleEventType;
  text: string;
  children: string[];
  payload?: Record<string, unknown>;
};

export type ParsedBattleTurn = {
  turnNumber: number;
  player: string;
  events: ParsedBattleEvent[];
};

export type ParsedBattleLog = {
  players: string[];
  winner: string | null;
  resultReason: string | null;
  wentFirst: string | null;
  setup: ParsedBattleEvent[];
  turns: ParsedBattleTurn[];
};

const TURN_RE = /^(.+)'s Turn$/;
/** Capture only the player name before "wins" (not the whole preceding sentence). */
const WINS_RE = /(?:Opponent conceded\.\s*)?(\S+)\s+wins\.?\s*$/i;
const CONCEDE_RE = /Opponent conceded/i;

function extractWinner(text: string, knownPlayers: string[] = []): string | null {
  const m = text.trim().match(WINS_RE);
  if (!m) return null;
  const raw = m[1].trim();
  const known = knownPlayers.find((p) => p.toLowerCase() === raw.toLowerCase());
  if (known) return known;
  // Fallback: if regex still grabbed junk, find a known player ending the line
  const bySuffix = knownPlayers.find((p) =>
    new RegExp(`(?:^|[\\s.])${escapeRegExp(p)}\\s+wins\\.?\\s*$`, "i").test(text),
  );
  return bySuffix ?? raw;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function resolveWinnerName(winnerRaw: string, players: string[]): string {
  const exact = players.find((p) => p.toLowerCase() === winnerRaw.toLowerCase());
  if (exact) return exact;
  const contained = players.find((p) => winnerRaw.toLowerCase().includes(p.toLowerCase()));
  return contained ?? winnerRaw;
}

function classifyEvent(text: string): { type: BattleEventType; payload?: Record<string, unknown> } {
  const t = text.trim();

  if (/chose (heads|tails) for the opening coin flip/i.test(t) || /won the coin toss/i.test(t)) {
    return { type: "coin_flip" };
  }
  if (/decided to go first/i.test(t)) {
    const m = t.match(/^(.+?)\s+decided to go first/i);
    return { type: "go_first", payload: { player: m?.[1], choice: "first" } };
  }
  if (/decided to go second/i.test(t)) {
    const m = t.match(/^(.+?)\s+decided to go second/i);
    return { type: "go_first", payload: { player: m?.[1], choice: "second" } };
  }
  if (/drew /i.test(t)) {
    return { type: "draw" };
  }
  if (/attached .+ to /i.test(t)) {
    return { type: "attach" };
  }
  if (/evolved .+ to /i.test(t)) {
    return { type: "evolve" };
  }
  if (/was Knocked Out/i.test(t)) {
    return { type: "knock_out" };
  }
  if (/took (a|\d+) Prize card/i.test(t)) {
    return { type: "take_prize" };
  }
  if (/ended their turn/i.test(t)) {
    return { type: "end_turn" };
  }
  if (CONCEDE_RE.test(t) || WINS_RE.test(t)) {
    if (CONCEDE_RE.test(t) && WINS_RE.test(t)) {
      const winner = extractWinner(t);
      return { type: "concede", payload: { winner } };
    }
    if (WINS_RE.test(t)) {
      const winner = extractWinner(t);
      return { type: "win", payload: { winner } };
    }
    return { type: "concede" };
  }
  if (/ used .+ for \d+ damage/i.test(t)) {
    const dmg = t.match(/for (\d+) damage/i);
    return { type: "attack", payload: { damage: dmg ? Number(dmg[1]) : undefined } };
  }
  if (/ used [A-Za-z]/.test(t)) {
    return { type: "ability" };
  }
  if (/played /i.test(t)) {
    return { type: "play" };
  }
  if (/retreated /i.test(t)) {
    return { type: "retreat" };
  }
  if (/is now in the Active Spot/i.test(t)) {
    return { type: "retreat" };
  }

  return { type: "other" };
}

function collectPlayers(lines: string[]): string[] {
  const names = new Set<string>();
  for (const line of lines) {
    const turn = line.match(TURN_RE);
    if (turn) names.add(turn[1].trim());

    const first = line.match(/^(.+?)\s+decided to go first/i);
    if (first) names.add(first[1].trim());

    const second = line.match(/^(.+?)\s+decided to go second/i);
    if (second) names.add(second[1].trim());

    const coin = line.match(/^(.+?)\s+won the coin toss/i);
    if (coin) names.add(coin[1].trim());

    const chose = line.match(/^(.+?)\s+chose (heads|tails)/i);
    if (chose) names.add(chose[1].trim());
  }
  return [...names];
}

export function parseBattleLog(raw: string): ParsedBattleLog {
  const lines = raw.replace(/\r\n/g, "\n").split("\n").map((l) => l.replace(/\s+$/g, ""));
  const players = collectPlayers(lines);
  const setup: ParsedBattleEvent[] = [];
  const turns: ParsedBattleTurn[] = [];

  let currentTurn: ParsedBattleTurn | null = null;
  let currentEvent: ParsedBattleEvent | null = null;
  let turnCounter = 0;
  let wentFirst: string | null = null;
  let wentSecondChooser: string | null = null;
  let winner: string | null = null;
  let resultReason: string | null = null;

  const pushEvent = (event: ParsedBattleEvent) => {
    if (currentTurn) currentTurn.events.push(event);
    else setup.push(event);
  };

  const flushEvent = () => {
    if (!currentEvent) return;
    pushEvent(currentEvent);
    currentEvent = null;
  };

  const startEvent = (text: string) => {
    flushEvent();
    const { type, payload } = classifyEvent(text);
    currentEvent = { type, text, children: [], payload };

    if (type === "go_first" && payload?.player) {
      const chooser = String(payload.player);
      if (payload.choice === "second") {
        wentSecondChooser = chooser;
      } else {
        wentFirst = chooser;
      }
    }
    if ((type === "concede" || type === "win") && payload?.winner) {
      winner = resolveWinnerName(String(payload.winner), players);
      resultReason = type === "concede" ? "concede" : "standard";
    }
  };

  const appendChild = (text: string) => {
    if (currentEvent) {
      currentEvent.children.push(text);
      return;
    }
    startEvent(text);
  };

  for (const line of lines) {
    if (!line.trim()) continue;
    if (/^Setup$/i.test(line.trim())) continue;

    const turnMatch = line.match(TURN_RE);
    if (turnMatch) {
      flushEvent();
      turnCounter += 1;
      currentTurn = {
        turnNumber: turnCounter,
        player: turnMatch[1].trim(),
        events: [],
      };
      turns.push(currentTurn);
      continue;
    }

    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    if (
      trimmed.startsWith("•") ||
      (trimmed.startsWith("-") && indent > 0) ||
      (trimmed.startsWith("- ") && currentEvent)
    ) {
      appendChild(trimmed.replace(/^[-•]\s*/, "").trim());
      continue;
    }

    if (
      /^Damage breakdown:/i.test(trimmed) ||
      /^\(Attack\)/i.test(trimmed) ||
      /^Base damage:/i.test(trimmed) ||
      /^Total damage:/i.test(trimmed)
    ) {
      appendChild(trimmed);
      continue;
    }

    if (indent === 0 || !currentEvent) {
      startEvent(trimmed);
      continue;
    }

    appendChild(trimmed);
  }

  flushEvent();

  if (!winner) {
    for (const line of lines) {
      const extracted = extractWinner(line, players);
      if (extracted) {
        winner = resolveWinnerName(extracted, players);
        resultReason = CONCEDE_RE.test(line) ? "concede" : "standard";
      }
    }
  } else {
    winner = resolveWinnerName(winner, players);
  }

  if (players.length < 2) {
    throw new Error("Could not identify both players from the battle log");
  }

  if (!wentFirst && wentSecondChooser) {
    wentFirst =
      players.find((p) => p.toLowerCase() !== wentSecondChooser!.toLowerCase()) ?? null;
  }
  if (!wentFirst && turns[0]?.player) {
    wentFirst = turns[0].player;
  }

  return {
    players,
    winner,
    resultReason,
    wentFirst,
    setup,
    turns,
  };
}

export function resolveMatchResult(parsed: ParsedBattleLog, ptcglName: string) {
  const name = ptcglName.trim();
  const matchPlayer = parsed.players.find((p) => p.toLowerCase() === name.toLowerCase());
  if (!matchPlayer) {
    throw new Error(
      `Your PTCGL name "${ptcglName}" was not found in this log. Players: ${parsed.players.join(", ")}`,
    );
  }
  if (!parsed.winner) {
    throw new Error("Could not determine the winner from this battle log");
  }

  const opponent = parsed.players.find((p) => p !== matchPlayer) ?? "Unknown";
  const winner = resolveWinnerName(parsed.winner, parsed.players);
  const result = winner.toLowerCase() === matchPlayer.toLowerCase() ? "win" : "loss";

  return {
    playerName: matchPlayer,
    opponentName: opponent,
    result: result as "win" | "loss",
    winner,
    wentFirst: parsed.wentFirst,
    resultReason: parsed.resultReason,
  };
}
