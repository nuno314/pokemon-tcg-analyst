import { analyzeMatchLocal, assessPlayerLocal, type RecentMatchWithLog } from "./local-heuristics";

export type MatchAnalysisResult = {
  summary: string;
  goodPlays: string[];
  mistakes: string[];
  tips: string[];
  opponentNotes: string[];
};

export type PlayerAssessmentResult = {
  archetype: string;
  playStyle: string;
  tempo: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  focus: string[];
};

/** AI luôn chạy local heuristics — không gọi OpenAI. */
export function useOpenAiProvider() {
  return false;
}

export async function analyzeMatchWithAi(input: {
  ptcglName: string;
  opponentName: string;
  result: "win" | "loss";
  wentFirst: string | null;
  deckName: string | null;
  turnCount: number;
  rawLog: string;
}): Promise<MatchAnalysisResult> {
  return analyzeMatchLocal(input);
}

export async function assessPlayerWithAi(input: {
  ptcglName: string;
  matchCount: number;
  wins: number;
  losses: number;
  firstWinRate: number;
  secondWinRate: number;
  deckStats: { name: string; wins: number; losses: number }[];
  recent: RecentMatchWithLog[];
}): Promise<PlayerAssessmentResult> {
  return assessPlayerLocal(input);
}
