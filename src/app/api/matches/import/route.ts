import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { importMatch } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const body = (await request.json()) as { rawLog?: string; deckId?: string | null };
    const rawLog = body.rawLog?.trim();
    if (!rawLog) {
      return NextResponse.json({ error: "Battle log is required" }, { status: 400 });
    }
    const { matchId, result } = await importMatch({
      userId: authz.session.user.id,
      ptcglName: authz.profile.ptcglName,
      rawLog,
      deckId: body.deckId,
    });
    return NextResponse.json({ matchId, result });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Import failed" },
      { status: 400 },
    );
  }
}
