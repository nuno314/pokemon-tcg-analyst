"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { parseBattleLog, resolveMatchResult } from "@/lib/parser/ptcgl-log";
import { formatEndReason } from "@/lib/parser/result-labels";

type DeckOption = { id: string; name: string };

export function ImportForm({
  decks,
  ptcglName,
}: {
  decks: DeckOption[];
  ptcglName: string;
}) {
  const router = useRouter();
  const [rawLog, setRawLog] = useState("");
  const [deckId, setDeckId] = useState(decks[0]?.id ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const preview = useMemo(() => {
    if (!rawLog.trim()) return null;
    try {
      const parsed = parseBattleLog(rawLog);
      const result = resolveMatchResult(parsed, ptcglName);
      return { ok: true as const, parsed, result };
    } catch (e) {
      return { ok: false as const, message: e instanceof Error ? e.message : "Parse failed" };
    }
  }, [rawLog, ptcglName]);

  async function onFile(file: File | null) {
    if (!file) return;
    const text = await file.text();
    setRawLog(text);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/matches/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawLog, deckId: deckId || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      router.push(`/matches/${data.matchId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Import failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Deck used</span>
          <select
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[var(--ink)]"
          >
            <option value="">No deck</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Upload .txt</span>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--muted)]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">Or paste battle log</span>
          <textarea
            required
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            rows={20}
            className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 font-mono text-xs text-[var(--ink)] outline-none focus:border-[var(--accent)]"
            placeholder="Setup&#10;Player chose tails..."
          />
        </label>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}

        <button
          type="submit"
          disabled={saving || !preview?.ok}
          className="rounded-lg bg-[var(--accent)] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
        >
          {saving ? "Importing…" : "Save match"}
        </button>
      </div>

      <div className="rounded-xl border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
        {!preview ? (
          <p className="text-sm text-[var(--muted)]">Paste or upload a PTCGL battle log to preview.</p>
        ) : !preview.ok ? (
          <p className="text-sm text-rose-700">{preview.message}</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-[var(--muted)]">You:</span> {preview.result.playerName}
            </p>
            <p>
              <span className="text-[var(--muted)]">Opponent:</span> {preview.result.opponentName}
            </p>
            <p>
              <span className="text-[var(--muted)]">Result:</span>{" "}
              <strong className={preview.result.result === "win" ? "text-emerald-700" : "text-rose-700"}>
                {preview.result.result.toUpperCase()}
              </strong>
              <span className="text-[var(--muted)]">
                {" "}
                · {formatEndReason(preview.result.resultReason)}
                {preview.result.winner ? ` · Winner: ${preview.result.winner}` : ""}
              </span>
            </p>
            <p>
              <span className="text-[var(--muted)]">Went first:</span>{" "}
              {preview.parsed.wentFirst ?? "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">Turns:</span> {preview.parsed.turns.length}
            </p>
            <p>
              <span className="text-[var(--muted)]">Setup events:</span> {preview.parsed.setup.length}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
