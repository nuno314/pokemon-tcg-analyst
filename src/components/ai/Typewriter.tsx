"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export function useTypewriter(text: string, enabled: boolean, cps = 100) {
  const [shown, setShown] = useState(enabled ? "" : text);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      return;
    }
    setShown("");
    if (!text) return;

    let i = 0;
    const step = Math.max(4, Math.ceil(text.length / 90));
    const tickMs = Math.max(5, Math.floor(800 / cps));
    const id = window.setInterval(() => {
      i = Math.min(text.length, i + step);
      setShown(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, tickMs);

    return () => window.clearInterval(id);
  }, [text, enabled, cps]);

  return {
    text: shown,
    done: !enabled || shown.length >= text.length,
  };
}

function TypewriterText({
  text,
  enabled,
  onDone,
}: {
  text: string;
  enabled: boolean;
  onDone?: () => void;
}) {
  const { text: shown, done } = useTypewriter(text, enabled, 130);
  const onDoneRef = useRef(onDone);
  const firedRef = useRef(false);
  onDoneRef.current = onDone;

  useEffect(() => {
    firedRef.current = false;
  }, [text, enabled]);

  useEffect(() => {
    if (!enabled || !done || firedRef.current) return;
    firedRef.current = true;
    onDoneRef.current?.();
  }, [done, enabled]);

  return (
    <span>
      {shown}
      {enabled && !done ? (
        <span className="ml-0.5 inline-block h-4 w-1 animate-pulse bg-[var(--accent-2)] align-middle" />
      ) : null}
    </span>
  );
}

type DocBlock = {
  key: string;
  title: string;
  body?: string;
  items?: string[];
};

function buildLines(block: DocBlock) {
  const lines: { text: string; bullet: boolean }[] = [];
  if (block.body?.trim()) lines.push({ text: block.body, bullet: false });
  for (const item of block.items ?? []) {
    if (item.trim()) lines.push({ text: item, bullet: true });
  }
  return lines;
}

/** Top → bottom continuous stream: finishes one line, then next. */
export function StreamDocument({
  blocks,
  enabled,
}: {
  blocks: DocBlock[];
  enabled: boolean;
}) {
  const usable = useMemo(
    () => blocks.filter((b) => buildLines(b).length > 0),
    [blocks],
  );

  const [blockIndex, setBlockIndex] = useState(enabled ? 0 : usable.length);
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setBlockIndex(usable.length);
      setLineIndex(0);
      return;
    }
    setBlockIndex(0);
    setLineIndex(0);
  }, [usable, enabled]);

  function onLineDone(bi: number, totalLines: number) {
    if (!enabled) return;
    if (bi !== blockIndex) return;
    if (lineIndex + 1 < totalLines) {
      setLineIndex((n) => n + 1);
      return;
    }
    setLineIndex(0);
    setBlockIndex((n) => Math.min(usable.length, n + 1));
  }

  if (!enabled) {
    return (
      <div className="space-y-4 text-sm">
        {usable.map((b) => (
          <StaticBlock key={b.key} block={b} />
        ))}
      </div>
    );
  }

  const visible = usable.slice(0, Math.min(usable.length, blockIndex + 1));

  return (
    <div className="space-y-4 text-sm">
      {visible.map((b, bi) => {
        const lines = buildLines(b);
        const active = bi === blockIndex && blockIndex < usable.length;
        const count = active ? lineIndex + 1 : lines.length;

        return (
          <div key={b.key}>
            {b.title ? (
              <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {b.title}
              </h3>
            ) : null}
            <div className="space-y-1.5 text-[var(--ink)]">
              {lines.slice(0, count).map((line, li) => {
                const typing = active && li === lineIndex;
                const content = (
                  <TypewriterText
                    text={line.text}
                    enabled={typing}
                    onDone={typing ? () => onLineDone(bi, lines.length) : undefined}
                  />
                );
                return line.bullet ? (
                  <div key={`${b.key}-${li}`} className="flex gap-2">
                    <span className="shrink-0 text-[var(--muted)]">•</span>
                    <span>{content}</span>
                  </div>
                ) : (
                  <p key={`${b.key}-${li}`}>{content}</p>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function StaticBlock({ block }: { block: DocBlock }) {
  const lines = buildLines(block);
  if (lines.length === 0) return null;
  return (
    <div>
      {block.title ? (
        <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
          {block.title}
        </h3>
      ) : null}
      <div className="space-y-1.5 text-[var(--ink)]">
        {lines.map((line, i) =>
          line.bullet ? (
            <div key={i} className="flex gap-2">
              <span className="text-[var(--muted)]">•</span>
              <span>{line.text}</span>
            </div>
          ) : (
            <p key={i}>{line.text}</p>
          ),
        )}
      </div>
    </div>
  );
}
