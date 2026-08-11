import { NextResponse } from "next/server";
import { updateMatchNote } from "@/lib/db/queries";
import { requireApiProfile } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    const body = (await request.json()) as { note?: string };
    if (typeof body.note !== "string") {
      return NextResponse.json({ error: "note is required" }, { status: 400 });
    }
    const row = await updateMatchNote(authz.session.user.id, id, body.note);
    if (!row) {
      return NextResponse.json({ error: "Không tìm thấy trận" }, { status: 404 });
    }
    return NextResponse.json({ ok: true, userNote: row.userNote });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
