import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { deleteDeck, updateDeck } from "@/lib/db/queries";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    const body = (await request.json()) as { name?: string; rawList?: string };
    const name = body.name?.trim();
    const rawList = body.rawList?.trim();
    if (!name || !rawList) {
      return NextResponse.json({ error: "Name and deck list are required" }, { status: 400 });
    }
    await updateDeck(authz.session.user.id, id, name, rawList);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { id } = await ctx.params;
    await deleteDeck(authz.session.user.id, id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}
