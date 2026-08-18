"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "@/components/LocaleProvider";

export function ExportDeckButton({ rawList }: { rawList: string }) {
  const dict = useTranslations();
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2200);
    return () => window.clearTimeout(id);
  }, [toast]);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(rawList);
      setToast(dict.decks.copyListDone);
    } catch {
      setToast(dict.decks.copyListFailed);
    }
  }

  return (
    <>
      <button type="button" onClick={onCopy} className="ui-btn-secondary px-3 py-2 text-sm">
        {dict.decks.copyList}
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
