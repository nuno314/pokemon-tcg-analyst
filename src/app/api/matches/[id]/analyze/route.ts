import { NextResponse } from "next/server";
import { analyzeMatchWithAi } from "@/lib/ai/analyze";
import {
  getMatchAnalysis,
  getMatchDetail,
  saveMatchAnalysis,
} from "@/lib/db/queries";
import { requireApiProfile } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    const analysis = await getMatchAnalysis(authz.session.user.id, id);
    return NextResponse.json({ analysis });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };

    const existing = await getMatchAnalysis(authz.session.user.id, id);
    if (existing && !body.force) {
      return NextResponse.json({ analysis: existing, cached: true });
    }

    const detail = await getMatchDetail(authz.session.user.id, id);
    if (!detail) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }

    const analyzed = await analyzeMatchWithAi({
      ptcglName: authz.profile.ptcglName,
      opponentName: detail.match.opponentName,
      result: detail.match.result,
      wentFirst: detail.match.wentFirst,
      deckName: detail.match.deckName,
      turnCount: detail.turns.length,
      rawLog: detail.match.rawLog,
    });

    const saved = await saveMatchAnalysis(authz.session.user.id, id, analyzed);
    return NextResponse.json({ analysis: saved, cached: false });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "AI analysis failed" },
      { status: 400 },
    );
  }
}
