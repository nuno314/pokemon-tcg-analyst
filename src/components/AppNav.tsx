"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LanguageSelector } from "@/components/LanguageSelector";
import { useTranslations } from "@/components/LocaleProvider";
import { ThemeToggle } from "@/components/ThemeProvider";
import { authClient } from "@/lib/auth-client";

export function AppNav({ ptcglName }: { ptcglName?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const dict = useTranslations();
  const links = [
    { href: "/dashboard", label: dict.nav.dashboard },
    { href: "/decks", label: dict.nav.decks },
    { href: "/matches/import", label: dict.nav.import },
    { href: "/settings", label: dict.nav.settings },
  ];

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-[color-mix(in_srgb,var(--surface)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 font-display text-lg tracking-tight text-[var(--ink)]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/494.png"
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 object-contain"
            aria-hidden
          />
          <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-3)] to-[var(--accent-2)] bg-clip-text text-transparent">
            {dict.brand}
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          {links.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-[var(--accent)] text-white shadow-sm"
                    : "text-[var(--muted)] hover:bg-[var(--wash)] hover:text-[var(--ink)]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          {ptcglName ? (
            <Link
              href="/settings"
              className="hidden sm:inline font-semibold text-[var(--ink)] hover:text-[var(--accent)] hover:underline"
              title={dict.nav.settings}
            >
              {ptcglName}
            </Link>
          ) : null}
          <LanguageSelector />
          <ThemeToggle />
          <button
            type="button"
            onClick={signOut}
            className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-3 py-1.5 hover:bg-[var(--wash)]"
          >
            {dict.nav.signOut}
          </button>
        </div>
      </div>
    </header>
  );
}
