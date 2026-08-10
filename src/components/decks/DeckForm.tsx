"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseDeckList, type ParsedDeckList } from "@/lib/parser/deck-list";
import { DeckCardRow } from "@/components/decks/CardImages";

export function DeckForm({
  mode,
  deckId,
  initialName = "",
  initialList = "",
}: {
  mode: "create" | "edit";
  deckId?: string;
  initialName?: string;
  initialList?: string;
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [rawList, setRawList] = useState(initialList);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (!rawList.trim()) return null;
    try {
      return { ok: true as const, data: parseDeckList(rawList) };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Parse failed" };
    }
  }, [rawList]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(mode === "create" ? "/api/decks" : `/api/decks/${deckId}`, {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rawList }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Save failed");
      router.push(`/decks/${data.id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Deck name</span>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            placeholder="Mega Starmie Dreepy"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Paste deck list</span>
          <textarea
            required
            value={rawList}
            onChange={(e) => setRawList(e.target.value)}
            rows={22}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            placeholder="Pokémon: 9&#10;1 Meowth ex POR 62&#10;..."
          />
        </label>
        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        <button
          type="submit"
          disabled={saving || !preview?.ok}
          className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create deck" : "Save changes"}
        </button>
      </div>
      <DeckPreview preview={preview} />
    </form>
  );
}

function DeckPreview({
  preview,
}: {
  preview: { ok: true; data: ParsedDeckList } | { ok: false; message: string } | null;
}) {
  if (!preview) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--line)] bg-[var(--surface)] p-6 text-sm text-[var(--muted)]">
        Paste a PTCGL/Limitless deck list to preview.
      </div>
    );
  }
  if (!preview.ok) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">
        {preview.message}
      </div>
    );
  }

  const { data } = preview;
  const groups = {
    pokemon: data.cards.filter((c) => c.category === "pokemon"),
    trainer: data.cards.filter((c) => c.category === "trainer"),
    energy: data.cards.filter((c) => c.category === "energy"),
  };

  return (
    <div className="space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
      <div className="flex flex-wrap gap-3 text-sm">
        <Stat label="Total" value={`${data.totalCards}`} ok={data.totalCards === 60} />
        <Stat label="Pokémon" value={`${data.pokemonTypes}`} />
        <Stat label="Trainer" value={`${data.trainerTypes}`} />
        <Stat label="Energy" value={`${data.energyTypes}`} />
      </div>
      {data.warnings.length > 0 ? (
        <ul className="space-y-1 text-xs text-amber-800">
          {data.warnings.map((w) => (
            <li key={w}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}
      {(["pokemon", "trainer", "energy"] as const).map((cat) => (
        <div key={cat}>
          <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {cat}
          </h3>
          <ul className="space-y-0.5">
            {groups[cat].map((c) => (
              <DeckCardRow
                key={`${c.name}-${c.setCode}-${c.collectorNumber}`}
                qty={c.qty}
                name={c.name}
                setCode={c.setCode}
                collectorNumber={c.collectorNumber}
              />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function Stat({ label, value, ok }: { label: string; value: string; ok?: boolean }) {
  return (
    <div className="rounded-lg bg-[var(--wash)] px-3 py-2">
      <p className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</p>
      <p className={`font-semibold ${ok === false ? "text-rose-700" : "text-[var(--ink)]"}`}>{value}</p>
    </div>
  );
}
