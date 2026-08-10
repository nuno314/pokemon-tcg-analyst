import { NextResponse } from "next/server";
import { assessPlayerWithAi } from "@/lib/ai/analyze";
import {
  PLAYER_ASSESSMENT_MIN_MATCHES,
  countUserMatches,
  getPlayerAssessment,
  getWinRateStats,
  listDecks,
  listRecentMatchesWithLogs,
  savePlayerAssessment,
} from "@/lib/db/queries";
import { requireApiProfile } from "@/lib/session";

export async function GET() {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const [assessment, matchCount] = await Promise.all([
      getPlayerAssessment(authz.session.user.id),
      countUserMatches(authz.session.user.id),
    ]);
    return NextResponse.json({
      assessment,
      matchCount,
      minMatches: PLAYER_ASSESSMENT_MIN_MATCHES,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };

    const matchCount = await countUserMatches(authz.session.user.id);
    if (matchCount < PLAYER_ASSESSMENT_MIN_MATCHES) {
      return NextResponse.json(
        {
          error: `Cần ít nhất ${PLAYER_ASSESSMENT_MIN_MATCHES} trận (hiện có ${matchCount}).`,
          matchCount,
          minMatches: PLAYER_ASSESSMENT_MIN_MATCHES,
        },
        { status: 400 },
      );
    }

    const existing = await getPlayerAssessment(authz.session.user.id);
    if (existing && existing.matchCount === matchCount && !body.force) {
      return NextResponse.json({ assessment: existing, cached: true, matchCount });
    }

    const [stats, decks, recentLogs] = await Promise.all([
      getWinRateStats(authz.session.user.id, "all"),
      listDecks(authz.session.user.id),
      listRecentMatchesWithLogs(authz.session.user.id, 10),
    ]);

    const deckStats = decks.map((d) => {
      const bucket = stats.byDeck.get(d.id) ?? { wins: 0, losses: 0 };
      return { name: d.name, wins: bucket.wins, losses: bucket.losses };
    });

    const assessed = await assessPlayerWithAi({
      ptcglName: authz.profile.ptcglName,
      matchCount,
      wins: stats.wins,
      losses: stats.losses,
      firstWinRate: stats.first.winRate,
      secondWinRate: stats.second.winRate,
      deckStats,
      recent: recentLogs.map((m) => ({
        opponent: m.opponentName,
        result: m.result,
        resultReason: m.resultReason,
        deck: m.deckName,
        wentFirst: m.wentFirst,
        rawLog: m.rawLog,
      })),
    });

    const saved = await savePlayerAssessment(authz.session.user.id, matchCount, assessed);
    return NextResponse.json({ assessment: saved, cached: false, matchCount });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI assessment failed" },
      { status: 400 },
    );
  }
}
