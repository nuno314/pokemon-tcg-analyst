import Link from "next/link";
import { HOME_MASCOTS } from "@/components/FloatingMascots";
import { ThemeToggle } from "@/components/ThemeProvider";
import { getSession } from "@/lib/session";
import { t } from "@/lib/i18n/vi";

export default async function HomePage() {
  const session = await getSession();
  const dict = t();

  return (
    <main className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-center px-4 py-16">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <span className="poke-orb left-[8%] top-[18%] h-24 w-24 bg-[var(--accent-3)]" />
      <span
        className="poke-orb right-[12%] top-[28%] h-32 w-32 bg-[var(--accent-2)]"
        style={{ animationDelay: "1.2s" }}
      />
      <span
        className="poke-orb bottom-[16%] left-[20%] h-20 w-20 bg-[var(--accent)]"
        style={{ animationDelay: "0.6s" }}
      />

      <div className="relative z-[1] grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="max-w-xl">
          <p className="font-display text-5xl leading-tight tracking-tight text-[var(--ink)] sm:text-6xl">
            <span className="bg-gradient-to-r from-[var(--accent)] via-[var(--accent-3)] to-[var(--accent-2)] bg-clip-text text-transparent">
              {dict.home.title}
            </span>
          </p>
          <h1 className="mt-4 text-xl font-semibold text-[var(--muted)] sm:text-2xl">
            {dict.home.subtitle}
          </h1>
          <p className="mt-4 max-w-xl text-[var(--muted)]">{dict.home.body}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            {session ? (
              <Link href="/dashboard" className="ui-btn-primary px-6 py-3 text-sm">
                {dict.home.openDashboard}
              </Link>
            ) : (
              <>
                <Link href="/register" className="ui-btn-primary px-6 py-3 text-sm">
                  {dict.home.getStarted}
                </Link>
                <Link href="/login" className="ui-btn-secondary px-6 py-3 text-sm">
                  {dict.home.signIn}
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {HOME_MASCOTS.map((m, i) => (
            <figure
              key={m.id}
              className="ui-card poke-card-bob flex flex-col items-center p-4 transition hover:-translate-y-1 hover:shadow-[var(--shadow)]"
              style={{ animationDelay: `${i * -0.7}s` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${m.id}.png`}
                alt={m.name}
                width={120}
                height={120}
                className="poke-spin-soft h-24 w-24 object-contain drop-shadow-md sm:h-28 sm:w-28"
                loading="eager"
              />
              <figcaption className="mt-2 font-display text-sm text-[var(--ink)]">{m.name}</figcaption>
              <p className="text-[11px] text-[var(--muted)]">{m.tip}</p>
            </figure>
          ))}
        </div>
      </div>
    </main>
  );
}
