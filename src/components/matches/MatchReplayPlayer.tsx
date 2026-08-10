"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  buildReplaySteps,
  replayStepLabel,
  type ReplayStep,
} from "@/lib/replay/build-steps";
import type { BattleEventType } from "@/lib/parser/ptcgl-log";

const TYPE_STYLE: Record<string, string> = {
  attack: "bg-[color-mix(in_srgb,var(--accent)_25%,var(--surface))] text-[var(--accent)]",
  knock_out: "bg-[color-mix(in_srgb,var(--accent)_30%,var(--surface))] text-[var(--accent)]",
  take_prize: "bg-[color-mix(in_srgb,var(--accent-2)_30%,var(--surface))] text-[color-mix(in_srgb,var(--accent-2)_80%,var(--ink))]",
  play: "bg-[var(--wash)] text-[var(--ink)]",
  attach: "bg-[color-mix(in_srgb,var(--accent-2)_20%,var(--surface))] text-[var(--ink)]",
  evolve: "bg-[color-mix(in_srgb,var(--accent-3)_25%,var(--surface))] text-[var(--ink)]",
  concede: "bg-[color-mix(in_srgb,var(--accent)_20%,var(--surface))] text-[var(--accent)]",
  win: "bg-[color-mix(in_srgb,var(--accent-2)_25%,var(--surface))] text-[color-mix(in_srgb,var(--accent-2)_80%,var(--ink))]",
};

function typeBadge(type: BattleEventType) {
  return TYPE_STYLE[type] ?? "bg-[var(--wash)] text-[var(--muted)]";
}

export function MatchReplayPlayer({
  rawLog,
  ptcglName,
}: {
  rawLog: string;
  ptcglName: string;
}) {
  const steps = useMemo(() => {
    try {
      return buildReplaySteps(rawLog);
    } catch {
      return [] as ReplayStep[];
    }
  }, [rawLog]);

  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const current = steps[index] ?? null;
  const atEnd = index >= steps.length - 1;

  const tick = useCallback(() => {
    setIndex((i) => {
      if (i >= steps.length - 1) {
        setPlaying(false);
        return i;
      }
      return i + 1;
    });
  }, [steps.length]);

  useEffect(() => {
    if (!playing || steps.length === 0) return;
    const id = window.setInterval(tick, 1400);
    return () => window.clearInterval(id);
  }, [playing, tick, steps.length]);

  useEffect(() => {
    setIndex(0);
    setPlaying(false);
  }, [rawLog]);

  if (steps.length === 0) {
    return (
      <section className="ui-card p-5">
        <h2 className="font-display text-xl text-[var(--ink)]">Recap trận</h2>
        <p className="mt-2 text-sm text-[var(--muted)]">Không parse được log để recap.</p>
      </section>
    );
  }

  return (
    <section className="ui-card overflow-hidden p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-xl text-[var(--ink)]">Recap trận</h2>
        <p className="text-xs text-[var(--muted)]">
          {index + 1}/{steps.length} bước
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          className="ui-btn-primary px-3 py-1.5 text-sm"
          onClick={() => {
            if (atEnd && !playing) {
              setIndex(0);
              setPlaying(true);
            } else {
              setPlaying((p) => !p);
            }
          }}
        >
          {playing ? "Tạm dừng" : atEnd ? "Phát lại" : "Phát"}
        </button>
        <button
          type="button"
          disabled={index === 0}
          className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.max(0, i - 1));
          }}
        >
          Trước
        </button>
        <button
          type="button"
          disabled={atEnd}
          className="ui-btn-secondary px-3 py-1.5 text-sm disabled:opacity-40"
          onClick={() => {
            setPlaying(false);
            setIndex((i) => Math.min(steps.length - 1, i + 1));
          }}
        >
          Sau
        </button>
        {atEnd ? (
          <button
            type="button"
            className="text-sm text-[var(--accent)] hover:underline"
            onClick={() => {
              setIndex(0);
              setPlaying(false);
            }}
          >
            Về đầu
          </button>
        ) : null}
      </div>

      <input
        type="range"
        min={0}
        max={Math.max(0, steps.length - 1)}
        value={index}
        onChange={(e) => {
          setPlaying(false);
          setIndex(Number(e.target.value));
        }}
        className="mt-3 w-full accent-[var(--accent)]"
      />

      {current ? (
        <article
          key={current.id}
          className="replay-step-enter mt-4 rounded-xl border border-[var(--line)] bg-[var(--wash)] p-4"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm text-[var(--ink)]">
              {replayStepLabel(current)}
            </span>
            <span
              className={`rounded-md px-2 py-0.5 font-mono text-[10px] uppercase ${typeBadge(current.type)}`}
            >
              {current.type}
            </span>
            {current.player?.toLowerCase() === ptcglName.toLowerCase() ? (
              <span className="rounded-full bg-[var(--accent)] px-2 py-0.5 text-[10px] font-bold text-white">
                Bạn
              </span>
            ) : current.player ? (
              <span className="rounded-full border border-[var(--line)] px-2 py-0.5 text-[10px] text-[var(--muted)]">
                Đối thủ
              </span>
            ) : null}
          </div>
          <p className="mt-3 text-[var(--ink)]">{current.text}</p>
          {current.children.length > 0 ? (
            <ul className="mt-2 space-y-1 border-l-2 border-[var(--line)] pl-3 text-sm text-[var(--muted)]">
              {current.children.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          ) : null}
        </article>
      ) : null}

      <ul className="mt-4 max-h-36 space-y-1 overflow-y-auto text-xs text-[var(--muted)]">
        {steps.slice(Math.max(0, index - 2), index + 1).map((s) => (
          <li
            key={s.id}
            className={`truncate rounded px-2 py-1 ${s.id === current?.id ? "bg-[var(--accent)]/15 font-medium text-[var(--ink)]" : ""}`}
          >
            {replayStepLabel(s)} — {s.text}
          </li>
        ))}
      </ul>
    </section>
  );
}
