import { NextResponse } from "next/server";
import { requireApiSession } from "@/lib/session";
import { upsertProfile } from "@/lib/db/queries";

export async function POST(request: Request) {
  try {
    const authz = await requireApiSession();
    if (!authz.ok) return authz.response;
    const body = (await request.json()) as { ptcglName?: string };
    const ptcglName = body.ptcglName?.trim();
    if (!ptcglName) {
      return NextResponse.json({ error: "PTCGL name is required" }, { status: 400 });
    }
    await upsertProfile(authz.session.user.id, ptcglName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
