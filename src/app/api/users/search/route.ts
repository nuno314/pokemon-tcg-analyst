import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import { searchUsersByPtcglName } from "@/lib/db/queries";

export async function GET(request: Request) {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";
    const users = await searchUsersByPtcglName(q, authz.session.user.id);
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 },
    );
  }
}
