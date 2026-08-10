export function WinRateCard({
  title,
  wins,
  losses,
  winRate,
}: {
  title: string;
  wins: number;
  losses: number;
  winRate: number;
}) {
  const total = wins + losses;
  const pct = total ? Math.round(winRate * 1000) / 10 : 0;

  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)]">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-1 font-[family-name:var(--font-display)] text-3xl text-[var(--ink)]">
        {total ? `${pct}%` : "—"}
      </p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {wins}W – {losses}L ({total} games)
      </p>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--wash)]">
        <div
          className="h-full rounded-full bg-[var(--accent)]"
          style={{ width: total ? `${(wins / total) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
