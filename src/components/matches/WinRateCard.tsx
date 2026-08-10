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
    <div className="ui-card p-4">
      <p className="text-sm text-[var(--muted)]">{title}</p>
      <p className="mt-1 font-display text-3xl text-[var(--ink)]">{total ? `${pct}%` : "—"}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {wins}W – {losses}L ({total} trận)
      </p>
      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-[var(--wash)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-2)]"
          style={{ width: total ? `${(wins / total) * 100}%` : "0%" }}
        />
      </div>
    </div>
  );
}
