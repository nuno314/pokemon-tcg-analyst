import Link from "next/link";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-16">
      <div className="max-w-2xl">
        <p className="font-[family-name:var(--font-display)] text-5xl leading-tight tracking-tight text-[var(--ink)] sm:text-6xl">
          PTCGL Tracker
        </p>
        <h1 className="mt-4 text-xl text-[var(--muted)] sm:text-2xl">
          Import battle logs. Track win rate by deck. Review every turn.
        </h1>
        <p className="mt-4 max-w-xl text-[var(--muted)]">
          Paste exports from Pokémon TCG Live, attach the deck you played, and build a history you can
          actually learn from.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {session ? (
            <Link
              href="/dashboard"
              className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
            >
              Open dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/register"
                className="rounded-lg bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 py-3 text-sm font-semibold text-[var(--ink)]"
              >
                Sign in
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
