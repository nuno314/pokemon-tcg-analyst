"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LocaleProvider";
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
  const dict = useTranslations();
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
      return {
        ok: false as const,
        message: e instanceof Error ? e.message : dict.import.parseFailed,
      };
    }
  }, [rawLog, ptcglName, dict.import.parseFailed]);

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
      if (!res.ok) throw new Error(data.error ?? dict.import.importFailed);
      router.push(`/matches/${data.matchId}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.import.importFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">{dict.import.deckUsed}</span>
          <select
            value={deckId}
            onChange={(e) => setDeckId(e.target.value)}
            className="ui-input"
          >
            <option value="">{dict.import.noDeck}</option>
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">{dict.import.uploadTxt}</span>
          <input
            type="file"
            accept=".txt,text/plain"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-[var(--muted)]"
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium text-[var(--ink)]">{dict.import.pasteLog}</span>
          <textarea
            required
            value={rawLog}
            onChange={(e) => setRawLog(e.target.value)}
            rows={20}
            className="ui-input font-mono text-xs"
            placeholder="Setup&#10;Player chose tails..."
          />
        </label>

        {error ? <p className="text-sm text-danger">{error}</p> : null}

        <button
          type="submit"
          disabled={saving || !preview?.ok}
          className="ui-btn-primary px-5 py-2.5 text-sm disabled:opacity-50"
        >
          {saving ? dict.import.importing : dict.import.saveMatch}
        </button>
      </div>

      <div className="ui-card p-5">
        {!preview ? (
          <p className="text-sm text-[var(--muted)]">{dict.import.previewEmpty}</p>
        ) : !preview.ok ? (
          <p className="text-sm text-danger">{preview.message}</p>
        ) : (
          <div className="space-y-3 text-sm">
            <p>
              <span className="text-[var(--muted)]">{dict.import.you}:</span> {preview.result.playerName}
            </p>
            <p>
              <span className="text-[var(--muted)]">{dict.import.opponent}:</span>{" "}
              {preview.result.opponentName}
            </p>
            <p>
              <span className="text-[var(--muted)]">{dict.import.result}:</span>{" "}
              <strong className={preview.result.result === "win" ? "text-success" : "text-danger"}>
                {preview.result.result === "win" ? dict.common.win : dict.common.loss}
              </strong>
              <span className="text-[var(--muted)]">
                {" "}
                · {formatEndReason(preview.result.resultReason, dict.resultLabels)}
                {preview.result.winner
                  ? ` · ${dict.import.winner}: ${preview.result.winner}`
                  : ""}
              </span>
            </p>
            <p>
              <span className="text-[var(--muted)]">{dict.match.wentFirst}:</span>{" "}
              {preview.parsed.wentFirst ?? "—"}
            </p>
            <p>
              <span className="text-[var(--muted)]">{dict.import.turns}:</span>{" "}
              {preview.parsed.turns.length}
            </p>
            <p>
              <span className="text-[var(--muted)]">{dict.import.setupEvents}:</span>{" "}
              {preview.parsed.setup.length}
            </p>
          </div>
        )}
      </div>
    </form>
  );
}
