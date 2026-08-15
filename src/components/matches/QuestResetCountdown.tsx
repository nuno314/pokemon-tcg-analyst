"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "@/components/LocaleProvider";

function formatRemaining(ms: number, locale: string, resetting: string) {
  if (ms <= 0) return resetting;
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (locale === "vi") {
    if (h > 0) return `${h}g ${m}p`;
    return m > 0 ? `${m}p ${s}s` : `${s}s`;
  }

  if (h > 0) return `${h}h ${m}m`;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function QuestResetCountdown({ resetsAt }: { resetsAt: string }) {
  const { locale } = useLocale();
  const dict = useTranslations();
  const [label, setLabel] = useState("");

  useEffect(() => {
    const tick = () => {
      setLabel(
        formatRemaining(
          new Date(resetsAt).getTime() - Date.now(),
          locale,
          dict.quests.resetting,
        ),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [resetsAt, locale, dict.quests.resetting]);

  if (!label) return null;

  return (
    <span className="rounded-full bg-[var(--wash)] px-2 py-0.5 text-xs font-semibold text-[var(--muted)]">
      {dict.quests.resetIn(label)}
    </span>
  );
}
