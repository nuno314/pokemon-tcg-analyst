"use client";

import { useState } from "react";
import { useTranslations } from "@/components/LocaleProvider";

export function MatchUserNote({
  matchId,
  initialNote = "",
}: {
  matchId: string;
  initialNote?: string;
}) {
  const dict = useTranslations();
  const [note, setNote] = useState(initialNote);
  const [savedNote, setSavedNote] = useState(initialNote);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const dirty = note !== savedNote;

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch(`/api/matches/${matchId}/note`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      const next = typeof data.userNote === "string" ? data.userNote : note.trim();
      setNote(next);
      setSavedNote(next);
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSave} className="ui-card space-y-3 p-4">
      <div>
        <h2 className="font-display text-lg text-[var(--ink)]">{dict.match.userNoteTitle}</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">{dict.match.userNoteHint}</p>
      </div>
      <textarea
        value={note}
        onChange={(e) => {
          setNote(e.target.value);
          setSaved(false);
        }}
        rows={4}
        maxLength={2000}
        placeholder={dict.match.userNotePlaceholder}
        className="ui-input min-h-[6rem] resize-y"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-[var(--muted)]">{note.length}/2000</p>
        <div className="flex items-center gap-3">
          {error ? <p className="text-sm text-danger">{error}</p> : null}
          {saved && !dirty ? (
            <p className="text-sm text-[var(--accent-2)]">{dict.match.userNoteSaved}</p>
          ) : null}
          <button
            type="submit"
            disabled={loading || !dirty}
            className="ui-btn-primary px-4 py-2 text-sm disabled:opacity-50"
          >
            {loading ? dict.match.userNoteSaving : dict.match.userNoteSave}
          </button>
        </div>
      </div>
    </form>
  );
}
