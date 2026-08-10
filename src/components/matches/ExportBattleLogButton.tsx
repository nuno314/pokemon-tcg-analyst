"use client";

import { useEffect, useState } from "react";

export function ExportBattleLogButton({ rawLog }: { rawLog: string }) {
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(rawLog);
      setToast("Đã copy battle log");
    } catch {
      setToast("Copy thất bại — thử lại");
    }
  }

  return (
    <>
      <button type="button" onClick={onCopy} className="ui-btn-secondary px-4 py-2 text-sm">
        Copy battle log
      </button>
      {toast ? (
        <div
          role="status"
          className="ui-toast fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full border border-[var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-semibold text-[var(--ink)] shadow-[var(--shadow)]"
        >
          {toast}
        </div>
      ) : null}
    </>
  );
}
