"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LocaleProvider";

type ProfileNameFormProps = {
  initialName?: string;
  mode?: "onboarding" | "settings";
};

export function ProfileNameForm({
  initialName = "",
  mode = "onboarding",
}: ProfileNameFormProps) {
  const router = useRouter();
  const dict = useTranslations();
  const copy = mode === "settings" ? dict.settings : dict.onboarding;
  const [ptcglName, setPtcglName] = useState(initialName);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ptcglName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? dict.common.error);
      if (mode === "settings") {
        setSaved(true);
        router.refresh();
      } else {
        router.push("/dashboard");
        router.refresh();
      }
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
      <h1 className="font-display text-2xl text-[var(--ink)]">{copy.title}</h1>
      <p className="text-sm text-[var(--muted)]">{copy.hint}</p>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ink)]">{copy.label}</span>
        <input
          required
          value={ptcglName}
          onChange={(e) => {
            setPtcglName(e.target.value);
            setSaved(false);
          }}
          className="ui-input"
          placeholder="Fairy_VN"
          autoComplete="username"
        />
      </label>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      {saved && mode === "settings" ? (
        <p className="text-sm text-[var(--accent-2)]">{dict.settings.saved}</p>
      ) : null}
      <button
        type="submit"
        disabled={loading || !ptcglName.trim()}
        className="ui-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? copy.saving : copy.submit}
      </button>
    </form>
  );
}
