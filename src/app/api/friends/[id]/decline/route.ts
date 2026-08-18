import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { declineFriendRequest } from "@/lib/db/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    await declineFriendRequest(authz.session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    const status =
      message === "Friend request not found"
        ? 404
        : message === "Not allowed" || message === "Friend request is not pending"
          ? 403
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
