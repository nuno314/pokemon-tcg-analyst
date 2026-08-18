import { NextResponse } from "next/server";
import { requireApiProfile } from "@/lib/session";
import {
  listFriends,
  listPendingIncoming,
  listPendingOutgoing,
  sendFriendRequest,
} from "@/lib/db/queries";

export async function GET() {
  try {
    const authz = await requireApiProfile();
    if (!authz.ok) return authz.response;
    const userId = authz.session.user.id;
    const [friends, incoming, outgoing] = await Promise.all([
      listFriends(userId),
      listPendingIncoming(userId),
      listPendingOutgoing(userId),
    ]);
    return NextResponse.json({ friends, incoming, outgoing });
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
    const body = (await request.json()) as { userId?: string };
    const userId = body.userId?.trim();
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    const result = await sendFriendRequest(authz.session.user.id, userId);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed";
    const status =
      message === "User not found"
        ? 404
        : message === "Cannot friend yourself" ||
            message === "Already friends" ||
            message === "Friend request already sent"
          ? 400
          : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
