"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { t } from "@/lib/i18n/vi";

export function OnboardingForm({ initialName = "" }: { initialName?: string }) {
  const router = useRouter();
  const dict = t();
  const [ptcglName, setPtcglName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ptcglName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : dict.common.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 ui-card p-6"
    >
      <h1 className="font-display text-2xl text-[var(--ink)]">
        {dict.onboarding.title}
      </h1>
      <p className="text-sm text-[var(--muted)]">{dict.onboarding.hint}</p>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ink)]">{dict.onboarding.label}</span>
        <input
          required
          value={ptcglName}
          onChange={(e) => setPtcglName(e.target.value)}
          className="ui-input"
          placeholder="Fairy_VN"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? dict.onboarding.saving : dict.onboarding.continue}
      </button>
    </form>
  );
}
