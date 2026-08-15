"use client";

import { useMemo, useState } from "react";
import { StreamDocument } from "@/components/ai/Typewriter";
import { useTranslations } from "@/components/LocaleProvider";

type Analysis = {
  summary: string;
  goodPlays: string;
  mistakes: string;
  tips: string;
  opponentNotes: string;
};

function parseList(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function MatchAiAnalyst({
  matchId,
  initial,
}: {
  matchId: string;
  initial: Analysis | null;
}) {
  const dict = useTranslations();
  const [analysis, setAnalysis] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState(false);
  const [streamKey, setStreamKey] = useState(0);

  async function run(force = false) {
    setLoading(true);
    setError(null);
    setStream(false);
    try {
      const res = await fetch(`/api/matches/${matchId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      setAnalysis(data.analysis);
      setStream(true);
      setStreamKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  const blocks = useMemo(() => {
    if (!analysis) return [];
    return [
      { key: "summary", title: dict.match.summary, body: analysis.summary },
      { key: "good", title: dict.match.good, items: parseList(analysis.goodPlays) },
      { key: "improve", title: dict.match.improve, items: parseList(analysis.mistakes) },
      { key: "tips", title: dict.match.tips, items: parseList(analysis.tips) },
      { key: "vs", title: dict.match.vsNotes, items: parseList(analysis.opponentNotes) },
    ];
  }, [analysis, dict]);

  return (
    <section className="space-y-4 ui-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-[var(--ink)]">
          {dict.match.aiAnalyst}
        </h2>
        <button
          type="button"
          disabled={loading}
          onClick={() => run(Boolean(analysis))}
          className="ui-btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading
            ? dict.match.aiAnalyzing
            : analysis
              ? dict.match.aiAgain
              : dict.match.aiAnalyst}
        </button>
      </div>

      {error ? <p className="text-sm text-danger">{error}</p> : null}

      {analysis ? (
        <div key={streamKey}>
          <StreamDocument blocks={blocks} enabled={stream} />
        </div>
      ) : (
        <p className="text-sm text-[var(--muted)]">{dict.match.aiAnalystHint}</p>
      )}
    </section>
  );
}
