"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/decks", label: "Decks" },
  { href: "/matches/import", label: "Import" },
];

export function AppNav({ ptcglName }: { ptcglName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-[var(--line)] bg-[var(--surface)]/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/dashboard" className="font-[family-name:var(--font-display)] text-lg tracking-tight text-[var(--ink)]">
          PTCGL Tracker
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-1.5 transition ${
                  active
                    ? "bg-[var(--accent)] text-white"
                    : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3 text-sm text-[var(--muted)]">
          {ptcglName ? <span className="hidden sm:inline">{ptcglName}</span> : null}
          <button
            type="button"
            onClick={signOut}
            className="rounded-md border border-[var(--line)] px-3 py-1.5 hover:bg-[var(--wash)]"
          >
            Sign out
          </button>
        </div>
      </div>
    </header>
  );
}
