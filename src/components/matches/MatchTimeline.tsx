type TimelineEvent = {
  id: string;
  type: string;
  text: string;
  payload: string | null;
};

type TimelineTurn = {
  id: string;
  turnNumber: number;
  player: string;
};

function childrenOf(payload: string | null): string[] {
  if (!payload) return [];
  try {
    const data = JSON.parse(payload) as { children?: string[] };
    return data.children ?? [];
  } catch {
    return [];
  }
}

export function MatchTimelineFull({
  setupEvents,
  turns,
  eventsByTurn,
}: {
  setupEvents: TimelineEvent[];
  turns: TimelineTurn[];
  eventsByTurn: Record<string, TimelineEvent[]>;
}) {
  return (
    <div className="space-y-6">
      {setupEvents.length > 0 ? (
        <section>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">Setup</h2>
          <EventBlock events={setupEvents} />
        </section>
      ) : null}

      {turns.map((turn) => (
        <section key={turn.id}>
          <h2 className="mb-2 font-[family-name:var(--font-display)] text-lg text-[var(--ink)]">
            Turn {turn.turnNumber} · {turn.player}
          </h2>
          <EventBlock events={eventsByTurn[turn.id] ?? []} />
        </section>
      ))}
    </div>
  );
}

function EventBlock({ events }: { events: TimelineEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-[var(--muted)]">No events</p>;
  }

  return (
    <ol className="space-y-2 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4">
      {events.map((event) => {
        const kids = childrenOf(event.payload);
        return (
          <li key={event.id} className="text-sm">
            <div className="flex gap-2">
              <span className="mt-0.5 shrink-0 rounded bg-[var(--wash)] px-1.5 py-0.5 font-mono text-[10px] uppercase text-[var(--muted)]">
                {event.type}
              </span>
              <div>
                <p className="text-[var(--ink)]">{event.text}</p>
                {kids.length > 0 ? (
                  <ul className="mt-1 space-y-0.5 border-l border-[var(--line)] pl-3 text-[var(--muted)]">
                    {kids.map((c, i) => (
                      <li key={`${event.id}-${i}`}>• {c}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
