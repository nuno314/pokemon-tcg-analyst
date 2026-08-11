"use client";

import { useEffect, useState } from "react";

function formatRemaining(ms: number) {
  if (ms <= 0) return "đang reset…";
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  if (h > 0) return `${h}g ${m}p`;
  const s = total % 60;
  return m > 0 ? `${m}p ${s}s` : `${s}s`;
}

export function QuestResetCountdown({ resetsAt }: { resetsAt: string }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      setLabel(formatRemaining(new Date(resetsAt).getTime() - Date.now()));
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [resetsAt]);

  if (!label) return null;

  return (
    <span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
      Reset sau {label}
    </span>
  );
}
