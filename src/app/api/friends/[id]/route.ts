import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { removeFriendship } from "@/lib/db/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    await removeFriendship(authz.session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    const status =
      message === "Friendship not found" ? 404 : message === "Not allowed" ? 403 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
