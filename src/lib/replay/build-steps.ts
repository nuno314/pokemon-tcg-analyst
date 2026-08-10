import { parseBattleLog, type BattleEventType } from "@/lib/parser/ptcgl-log";

export type ReplayStep = {
  id: string;
  phase: "setup" | "turn";
  turnNumber: number | null;
  player: string | null;
  type: BattleEventType;
  text: string;
  children: string[];
};

export function buildReplaySteps(rawLog: string): ReplayStep[] {
  const parsed = parseBattleLog(rawLog);
  const steps: ReplayStep[] = [];
  let i = 0;

  for (const e of parsed.setup) {
    steps.push({
      id: String(i++),
      phase: "setup",
      turnNumber: null,
      player: null,
      type: e.type,
      text: e.text,
      children: e.children,
    });
  }

  for (const turn of parsed.turns) {
    for (const e of turn.events) {
      steps.push({
        id: String(i++),
        phase: "turn",
        turnNumber: turn.turnNumber,
        player: turn.player,
        type: e.type,
        text: e.text,
        children: e.children,
      });
    }
  }

  return steps;
}

export function replayStepLabel(step: ReplayStep): string {
  if (step.phase === "setup") return "Setup";
  return `Turn ${step.turnNumber} · ${step.player ?? "?"}`;
}
