"use client";

import { useMemo, useState } from "react";
import { StreamDocument } from "@/components/ai/Typewriter";
import { useTranslations } from "@/components/LocaleProvider";
import { PLAYER_ASSESSMENT_MIN_MATCHES } from "@/lib/i18n";

type Assessment = {
  matchCount?: number;
  archetype: string;
  playStyle?: string;
  tempo?: string;
  summary: string;
  strengths: string;
  weaknesses: string;
  focus: string;
  rawJson?: string | null;
};

function parseList(raw: string): string[] {
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function normalizeAssessment(row: Assessment | null): Assessment | null {
  if (!row) return null;
  if (row.rawJson) {
    try {
      const parsed = JSON.parse(row.rawJson) as Partial<Assessment> & {
        strengths?: string[];
        weaknesses?: string[];
        focus?: string[];
      };
      return {
        ...row,
        playStyle: parsed.playStyle ?? row.playStyle,
        tempo: parsed.tempo ?? row.tempo,
        summary: parsed.summary ?? row.summary,
        archetype: parsed.archetype ?? row.archetype,
        strengths: Array.isArray(parsed.strengths)
          ? JSON.stringify(parsed.strengths)
          : row.strengths,
        weaknesses: Array.isArray(parsed.weaknesses)
          ? JSON.stringify(parsed.weaknesses)
          : row.weaknesses,
        focus: Array.isArray(parsed.focus) ? JSON.stringify(parsed.focus) : row.focus,
      };
    } catch {
      /* use row as-is */
    }
  }
  return row;
}

export function PlayerStyleCard({
  matchCount,
  readOnly = false,
  initialAssessment = null,
}: {
  matchCount: number;
  readOnly?: boolean;
  initialAssessment?: Assessment | null;
}) {
  const dict = useTranslations();
  const [assessment, setAssessment] = useState<Assessment | null>(() =>
    normalizeAssessment(initialAssessment),
  );
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
      setAssessment(normalizeAssessment(data.assessment));
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
    const items: { key: string; title: string; body?: string; items?: string[] }[] = [
      {
        key: "arch",
        title: dict.playerStyle.mainStyle,
        body: assessment.playStyle ?? assessment.archetype,
      },
    ];
    if (assessment.tempo) {
      items.push({ key: "tempo", title: dict.playerStyle.tempo, body: assessment.tempo });
    }
    items.push(
      { key: "sum", title: dict.playerStyle.summary, body: assessment.summary },
      { key: "str", title: dict.playerStyle.strengths, items: parseList(assessment.strengths) },
      { key: "weak", title: dict.playerStyle.weaknesses, items: parseList(assessment.weaknesses) },
      { key: "focus", title: dict.playerStyle.focus, items: parseList(assessment.focus) },
    );
    return items;
  }, [assessment, dict.playerStyle]);

  return (
    <section className="ui-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl text-[var(--ink)]">
            {dict.dashboard.playerStyle}
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {readOnly && !assessment
              ? dict.userProfile.noPlayStyle
              : ready
                ? dict.dashboard.playerStyleBasedOn(matchCount, PLAYER_ASSESSMENT_MIN_MATCHES)
                : dict.dashboard.playerStyleNeed(matchCount, PLAYER_ASSESSMENT_MIN_MATCHES)}
          </p>
        </div>
        {readOnly ? null : (
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
                : dict.dashboard.playerStyleEvaluate}
          </button>
        )}
      </div>

      {!ready && !readOnly ? (
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
