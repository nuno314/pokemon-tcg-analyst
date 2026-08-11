import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/session";
import { repairUserMatches, upsertProfile } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const authz = await requireApiSession();
    if (!authz.ok) return authz.response;
    const body = (await request.json()) as { ptcglName?: string };
    const ptcglName = body.ptcglName?.trim();
    if (!ptcglName) {
      return NextResponse.json({ error: "PTCGL name is required" }, { status: 400 });
    }
    if (ptcglName.length > 40) {
      return NextResponse.json({ error: "PTCGL name is too long" }, { status: 400 });
    }
    const userId = authz.session.user.id;
    await upsertProfile(userId, ptcglName);
    const repaired = await repairUserMatches(userId, ptcglName);
    return NextResponse.json({ ok: true, repaired });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
