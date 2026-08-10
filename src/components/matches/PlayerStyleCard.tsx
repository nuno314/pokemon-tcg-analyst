"use client";

import { useMemo, useState } from "react";
import { StreamDocument } from "@/components/ai/Typewriter";
import { PLAYER_ASSESSMENT_MIN_MATCHES, t } from "@/lib/i18n/vi";

type Assessment = {
  matchCount: number;
  archetype: string;
  summary: string;
  strengths: string;
  weaknesses: string;
  focus: string;
};

function parseList(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

export function PlayerStyleCard({
  matchCount,
  initial,
}: {
  matchCount: number;
  initial: Assessment | null;
}) {
  const dict = t();
  const [assessment, setAssessment] = useState(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stream, setStream] = useState(false);
  const [streamKey, setStreamKey] = useState(0);
  const ready = matchCount >= PLAYER_ASSESSMENT_MIN_MATCHES;

  async function run(force = false) {
    setLoading(true);
    setError(null);
    setStream(false);
    try {
      const res = await fetch("/api/ai/player-assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      setAssessment(data.assessment);
      setStream(true);
      setStreamKey((k) => k + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  const blocks = useMemo(() => {
    if (!assessment) return [];
    return [
      { key: "arch", title: "Phong cách", body: assessment.archetype },
      { key: "sum", title: "Tóm tắt", body: assessment.summary },
      { key: "str", title: "Điểm mạnh", items: parseList(assessment.strengths) },
      { key: "weak", title: "Điểm yếu", items: parseList(assessment.weaknesses) },
      { key: "focus", title: "Nên tập trung", items: parseList(assessment.focus) },
    ];
  }, [assessment]);

  return (
    <section className="ui-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">
            {dict.dashboard.playerStyle}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {ready
              ? `Dựa trên ${matchCount} trận (tối thiểu ${PLAYER_ASSESSMENT_MIN_MATCHES}). Chạy local, không dùng OpenAI.`
              : dict.dashboard.playerStyleNeed(matchCount, PLAYER_ASSESSMENT_MIN_MATCHES)}
          </p>
        </div>
        <button
          type="button"
          disabled={!ready || loading}
          onClick={() => run(Boolean(assessment))}
          className="ui-btn-primary px-4 py-2 text-sm disabled:opacity-50"
        >
          {loading
            ? dict.dashboard.playerStyleGenerating
            : assessment
              ? dict.dashboard.playerStyleRefresh
              : "Đánh giá AI"}
        </button>
      </div>

      {!ready ? (
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--wash)]">
          <div
            className="h-full rounded-full bg-[var(--accent-2)]"
            style={{
              width: `${Math.min(100, (matchCount / PLAYER_ASSESSMENT_MIN_MATCHES) * 100)}%`,
            }}
          />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}

      {assessment ? (
        <div key={streamKey} className="mt-4">
          <StreamDocument blocks={blocks} enabled={stream} />
        </div>
      ) : null}
    </section>
  );
}
