import { createHash, randomUUID } from "node:crypto";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "./index";
import { deckCards, decks, matchAnalyses, matchEvents, matches, matchTurns, playerAssessments, profiles, questCompletions } from "./schema";
import { parseDeckList } from "../parser/deck-list";
import { parseBattleLog, resolveMatchResult } from "../parser/ptcgl-log";
import type { MatchAnalysisResult, PlayerAssessmentResult } from "../ai/analyze";
import { PLAYER_ASSESSMENT_MIN_MATCHES } from "../i18n/vi";

export function hashLog(raw: string) {
  return createHash("sha256").update(raw.trim()).digest("hex");
}

export async function upsertProfile(userId: string, ptcglName: string) {
  const existing = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  if (existing[0]) {
    await db
      .update(profiles)
      .set({ ptcglName, updatedAt: new Date() })
      .where(eq(profiles.userId, userId));
  } else {
    await db.insert(profiles).values({ userId, ptcglName });
  }
}

export async function createDeck(userId: string, name: string, rawList: string) {
  const parsed = parseDeckList(rawList);
  const id = randomUUID();
  await db.insert(decks).values({
    id,
    userId,
    name,
    rawList,
    pokemonCount: parsed.pokemonTypes,
    trainerCount: parsed.trainerTypes,
    energyCount: parsed.energyTypes,
    totalCards: parsed.totalCards,
  });
  await db.insert(deckCards).values(
    parsed.cards.map((card, index) => ({
      id: randomUUID(),
      deckId: id,
      category: card.category,
      qty: card.qty,
      name: card.name,
      setCode: card.setCode,
      collectorNumber: card.collectorNumber,
      sortOrder: index,
    })),
  );
  return { id, parsed };
}

export async function updateDeck(userId: string, deckId: string, name: string, rawList: string) {
  const existing = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
  if (!existing[0]) throw new Error("Deck not found");

  const parsed = parseDeckList(rawList);
  await db.delete(deckCards).where(eq(deckCards.deckId, deckId));
  await db
    .update(decks)
    .set({
      name,
      rawList,
      pokemonCount: parsed.pokemonTypes,
      trainerCount: parsed.trainerTypes,
      energyCount: parsed.energyTypes,
      totalCards: parsed.totalCards,
      updatedAt: new Date(),
    })
    .where(eq(decks.id, deckId));
  await db.insert(deckCards).values(
    parsed.cards.map((card, index) => ({
      id: randomUUID(),
      deckId,
      category: card.category,
      qty: card.qty,
      name: card.name,
      setCode: card.setCode,
      collectorNumber: card.collectorNumber,
      sortOrder: index,
    })),
  );
  return { id: deckId, parsed };
}

export async function deleteDeck(userId: string, deckId: string) {
  const existing = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
  if (!existing[0]) throw new Error("Deck not found");
  await db.delete(decks).where(eq(decks.id, deckId));
}

export async function listDecks(userId: string) {
  return db.select().from(decks).where(eq(decks.userId, userId)).orderBy(desc(decks.updatedAt));
}

export async function getDeckWithCards(userId: string, deckId: string) {
  const deck = await db
    .select()
    .from(decks)
    .where(and(eq(decks.id, deckId), eq(decks.userId, userId)))
    .limit(1);
  if (!deck[0]) return null;
  const cards = await db
    .select()
    .from(deckCards)
    .where(eq(deckCards.deckId, deckId))
    .orderBy(deckCards.sortOrder);
  return { ...deck[0], cards };
}

export async function importMatch(opts: {
  userId: string;
  ptcglName: string;
  rawLog: string;
  deckId?: string | null;
}) {
  const parsed = parseBattleLog(opts.rawLog);
  const result = resolveMatchResult(parsed, opts.ptcglName);
  const logHash = hashLog(opts.rawLog);

  if (opts.deckId) {
    const deck = await db
      .select()
      .from(decks)
      .where(and(eq(decks.id, opts.deckId), eq(decks.userId, opts.userId)))
      .limit(1);
    if (!deck[0]) throw new Error("Selected deck not found");
  }

  const duplicate = await db
    .select()
    .from(matches)
    .where(and(eq(matches.userId, opts.userId), eq(matches.logHash, logHash)))
    .limit(1);
  if (duplicate[0]) {
    throw new Error("This battle log was already imported");
  }

  const matchId = randomUUID();
  await db.insert(matches).values({
    id: matchId,
    userId: opts.userId,
    deckId: opts.deckId ?? null,
    rawLog: opts.rawLog,
    logHash,
    opponentName: result.opponentName,
    wentFirst: result.wentFirst,
    winner: result.winner,
    result: result.result,
    resultReason: result.resultReason,
  });

  let seq = 0;
  for (const event of parsed.setup) {
    await db.insert(matchEvents).values({
      id: randomUUID(),
      matchId,
      turnId: null,
      seq: seq++,
      type: event.type,
      text: event.text,
      payload: JSON.stringify({ children: event.children, ...(event.payload ?? {}) }),
    });
  }

  for (const turn of parsed.turns) {
    const turnId = randomUUID();
    await db.insert(matchTurns).values({
      id: turnId,
      matchId,
      turnNumber: turn.turnNumber,
      player: turn.player,
    });
    for (const event of turn.events) {
      await db.insert(matchEvents).values({
        id: randomUUID(),
        matchId,
        turnId,
        seq: seq++,
        type: event.type,
        text: event.text,
        payload: JSON.stringify({ children: event.children, ...(event.payload ?? {}) }),
      });
    }
  }

  return { matchId, result, parsed };
}

/** Re-parse stored raw logs and fix winner/result after parser improvements. */
export async function repairUserMatches(userId: string, ptcglName: string) {
  const rows = await db.select().from(matches).where(eq(matches.userId, userId));
  let fixed = 0;

  for (const row of rows) {
    try {
      const parsed = parseBattleLog(row.rawLog);
      const resolved = resolveMatchResult(parsed, ptcglName);
      const needsUpdate =
        row.result !== resolved.result ||
        row.winner !== resolved.winner ||
        row.opponentName !== resolved.opponentName ||
        row.resultReason !== resolved.resultReason ||
        row.wentFirst !== resolved.wentFirst;

      if (!needsUpdate) continue;

      await db
        .update(matches)
        .set({
          result: resolved.result,
          winner: resolved.winner,
          opponentName: resolved.opponentName,
          resultReason: resolved.resultReason,
          wentFirst: resolved.wentFirst,
        })
        .where(eq(matches.id, row.id));
      fixed += 1;
    } catch {
      // Skip unreadable logs
    }
  }

  return { scanned: rows.length, fixed };
}

export type RangeFilter = "all" | "7d" | "30d";

function rangeDate(range: RangeFilter) {
  if (range === "all") return null;
  const days = range === "7d" ? 7 : 30;
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000);
}

export async function getWinRateStats(userId: string, range: RangeFilter = "all") {
  const since = rangeDate(range);
  const conditions = [eq(matches.userId, userId)];
  if (since) conditions.push(gte(matches.importedAt, since));

  const rows = await db
    .select({
      result: matches.result,
      wentFirst: matches.wentFirst,
      deckId: matches.deckId,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(matches)
    .where(and(...conditions))
    .groupBy(matches.result, matches.wentFirst, matches.deckId);

  const profile = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  const ptcglName = profile[0]?.ptcglName ?? "";

  let wins = 0;
  let losses = 0;
  let firstWins = 0;
  let firstTotal = 0;
  let secondWins = 0;
  let secondTotal = 0;
  const byDeck = new Map<string, { wins: number; losses: number }>();

  for (const row of rows) {
    const n = Number(row.count ?? 0);
    if (row.result === "win") wins += n;
    else losses += n;

    if (row.wentFirst && ptcglName && row.wentFirst.toLowerCase() === ptcglName.toLowerCase()) {
      firstTotal += n;
      if (row.result === "win") firstWins += n;
    } else if (row.wentFirst) {
      secondTotal += n;
      if (row.result === "win") secondWins += n;
    }

    const key = row.deckId ?? "__none__";
    const bucket = byDeck.get(key) ?? { wins: 0, losses: 0 };
    if (row.result === "win") bucket.wins += n;
    else bucket.losses += n;
    byDeck.set(key, bucket);
  }

  const total = wins + losses;
  return {
    wins,
    losses,
    total,
    winRate: total ? wins / total : 0,
    first: { wins: firstWins, total: firstTotal, winRate: firstTotal ? firstWins / firstTotal : 0 },
    second: {
      wins: secondWins,
      total: secondTotal,
      winRate: secondTotal ? secondWins / secondTotal : 0,
    },
    byDeck,
  };
}

export async function listMatches(userId: string, range: RangeFilter = "all") {
  const since = rangeDate(range);
  const conditions = [eq(matches.userId, userId)];
  if (since) conditions.push(gte(matches.importedAt, since));

  return db
    .select({
      id: matches.id,
      opponentName: matches.opponentName,
      result: matches.result,
      resultReason: matches.resultReason,
      wentFirst: matches.wentFirst,
      importedAt: matches.importedAt,
      deckId: matches.deckId,
      deckName: decks.name,
      rawLog: matches.rawLog,
    })
    .from(matches)
    .leftJoin(decks, eq(matches.deckId, decks.id))
    .where(and(...conditions))
    .orderBy(desc(matches.importedAt));
}

export async function listRecentMatchesWithLogs(userId: string, limit = 10) {
  return db
    .select({
      opponentName: matches.opponentName,
      result: matches.result,
      resultReason: matches.resultReason,
      wentFirst: matches.wentFirst,
      rawLog: matches.rawLog,
      userNote: matches.userNote,
      deckName: decks.name,
    })
    .from(matches)
    .leftJoin(decks, eq(matches.deckId, decks.id))
    .where(eq(matches.userId, userId))
    .orderBy(desc(matches.importedAt))
    .limit(limit);
}

export async function getMatchDetail(userId: string, matchId: string) {
  const matchRows = await db
    .select({
      id: matches.id,
      opponentName: matches.opponentName,
      result: matches.result,
      resultReason: matches.resultReason,
      wentFirst: matches.wentFirst,
      winner: matches.winner,
      importedAt: matches.importedAt,
      deckId: matches.deckId,
      deckName: decks.name,
      rawLog: matches.rawLog,
      userNote: matches.userNote,
    })
    .from(matches)
    .leftJoin(decks, eq(matches.deckId, decks.id))
    .where(and(eq(matches.id, matchId), eq(matches.userId, userId)))
    .limit(1);

  const match = matchRows[0];
  if (!match) return null;

  const turns = await db
    .select()
    .from(matchTurns)
    .where(eq(matchTurns.matchId, matchId))
    .orderBy(matchTurns.turnNumber);

  const events = await db
    .select()
    .from(matchEvents)
    .where(eq(matchEvents.matchId, matchId))
    .orderBy(matchEvents.seq);

  return { match, turns, events };
}

const MAX_USER_NOTE = 2000;

export async function updateMatchNote(userId: string, matchId: string, note: string) {
  const trimmed = note.trim().slice(0, MAX_USER_NOTE);
  const existing = await db
    .select({ id: matches.id })
    .from(matches)
    .where(and(eq(matches.id, matchId), eq(matches.userId, userId)))
    .limit(1);
  if (!existing[0]) return null;
  await db
    .update(matches)
    .set({ userNote: trimmed })
    .where(and(eq(matches.id, matchId), eq(matches.userId, userId)));
  return { id: matchId, userNote: trimmed };
}

export async function getMatchAnalysis(userId: string, matchId: string) {
  const rows = await db
    .select()
    .from(matchAnalyses)
    .where(and(eq(matchAnalyses.matchId, matchId), eq(matchAnalyses.userId, userId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function saveMatchAnalysis(
  userId: string,
  matchId: string,
  analysis: MatchAnalysisResult,
) {
  const existing = await getMatchAnalysis(userId, matchId);
  const payload = {
    summary: analysis.summary,
    goodPlays: JSON.stringify(analysis.goodPlays),
    mistakes: JSON.stringify(analysis.mistakes),
    tips: JSON.stringify(analysis.tips),
    opponentNotes: JSON.stringify(analysis.opponentNotes),
    rawJson: JSON.stringify(analysis),
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(matchAnalyses).set(payload).where(eq(matchAnalyses.id, existing.id));
    return { ...existing, ...payload, id: existing.id };
  }

  const id = randomUUID();
  await db.insert(matchAnalyses).values({
    id,
    matchId,
    userId,
    ...payload,
  });
  return { id, matchId, userId, ...payload };
}

export async function getPlayerAssessment(userId: string) {
  const rows = await db
    .select()
    .from(playerAssessments)
    .where(eq(playerAssessments.userId, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function savePlayerAssessment(
  userId: string,
  matchCount: number,
  assessment: PlayerAssessmentResult,
) {
  const existing = await getPlayerAssessment(userId);
  const payload = {
    matchCount,
    archetype: assessment.archetype,
    summary: assessment.summary,
    strengths: JSON.stringify(assessment.strengths),
    weaknesses: JSON.stringify(assessment.weaknesses),
    focus: JSON.stringify(assessment.focus),
    rawJson: JSON.stringify(assessment),
    updatedAt: new Date(),
  };

  if (existing) {
    await db.update(playerAssessments).set(payload).where(eq(playerAssessments.id, existing.id));
    return { ...existing, ...payload, id: existing.id };
  }

  const id = randomUUID();
  await db.insert(playerAssessments).values({ id, userId, ...payload });
  return { id, userId, ...payload };
}

export async function countUserMatches(userId: string) {
  const rows = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(matches)
    .where(eq(matches.userId, userId));
  return Number(rows[0]?.count ?? 0);
}

export async function countUserAnalyses(userId: string) {
  const rows = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(matchAnalyses)
    .where(eq(matchAnalyses.userId, userId));
  return Number(rows[0]?.count ?? 0);
}

export async function countUserAnalysesSince(userId: string, since: Date) {
  const rows = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(matchAnalyses)
    .where(and(eq(matchAnalyses.userId, userId), gte(matchAnalyses.createdAt, since)));
  return Number(rows[0]?.count ?? 0);
}

export async function listQuestCompletions(userId: string) {
  return db
    .select({
      questId: questCompletions.questId,
      dayKey: questCompletions.dayKey,
      completedAt: questCompletions.completedAt,
    })
    .from(questCompletions)
    .where(eq(questCompletions.userId, userId))
    .orderBy(desc(questCompletions.completedAt));
}

export async function recordDailyQuestCompletions(
  userId: string,
  day: string,
  questIds: string[],
) {
  if (questIds.length === 0) return;
  await db
    .insert(questCompletions)
    .values(
      questIds.map((questId) => ({
        id: randomUUID(),
        userId,
        questId,
        dayKey: day,
      })),
    )
    .onConflictDoNothing({
      target: [questCompletions.userId, questCompletions.dayKey, questCompletions.questId],
    });
}

export async function syncQuestCompletions(userId: string, day: string, doneQuestIds: string[]) {
  await recordDailyQuestCompletions(userId, day, doneQuestIds);
  return listQuestCompletions(userId);
}

export function parseJsonStringArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export { PLAYER_ASSESSMENT_MIN_MATCHES };
