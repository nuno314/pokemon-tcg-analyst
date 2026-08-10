"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function OnboardingForm({ initialName = "" }: { initialName?: string }) {
  const router = useRouter();
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
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
    >
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">
        Your PTCGL name
      </h1>
      <p className="text-sm text-[var(--muted)]">
        Enter the exact display name from Pokémon TCG Live so we can detect wins/losses in your battle
        logs.
      </p>
      <label className="block space-y-1.5">
        <span className="text-sm font-medium text-[var(--ink)]">PTCGL display name</span>
        <input
          required
          value={ptcglName}
          onChange={(e) => setPtcglName(e.target.value)}
          className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
          placeholder="Fairy_VN"
        />
      </label>
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
