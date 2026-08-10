import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { createDeck, listDecks } from "@/lib/db/queries";

export async function GET() {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const items = await listDecks(authz.session.user.id);
    return NextResponse.json({ decks: items });
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
    const body = (await request.json()) as { name?: string; rawList?: string };
    const name = body.name?.trim();
    const rawList = body.rawList?.trim();
    if (!name || !rawList) {
      return NextResponse.json({ error: "Name and deck list are required" }, { status: 400 });
    }
    const { id } = await createDeck(authz.session.user.id, name, rawList);
    return NextResponse.json({ id });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 400 },
    );
  }
}
