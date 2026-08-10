import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "./auth";
import { db, ensureDb } from "./db";
import { profiles } from "./db/schema";

export async function getSession() {
  await ensureDb();
  return auth.api.getSession({ headers: await headers() });
}

export async function requireSession() {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getProfile(userId: string) {
  await ensureDb();
  const rows = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return rows[0] ?? null;
}

export async function requireProfile() {
  const session = await requireSession();
  const profile = await getProfile(session.user.id);
  if (!profile?.ptcglName) {
    redirect("/onboarding");
  }
  return { session, profile };
}

type ApiSession = NonNullable<Awaited<ReturnType<typeof getSession>>>;
type ApiProfile = NonNullable<Awaited<ReturnType<typeof getProfile>>>;

export async function requireApiSession(): Promise<
  { ok: true; session: ApiSession } | { ok: false; response: Response }
> {
  const session = await getSession();
  if (!session) {
    return { ok: false, response: Response.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { ok: true, session };
}

export async function requireApiProfile(): Promise<
  | { ok: true; session: ApiSession; profile: ApiProfile }
  | { ok: false; response: Response }
> {
  const base = await requireApiSession();
  if (!base.ok) return base;
  const profile = await getProfile(base.session.user.id);
  if (!profile?.ptcglName) {
    return {
      ok: false,
      response: Response.json({ error: "Complete onboarding first" }, { status: 403 }),
    };
  }
  return { ok: true, session: base.session, profile };
}
