"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Login failed");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">Sign in</h1>
      <Field label="Email" type="email" value={email} onChange={setEmail} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        No account?{" "}
        <Link href="/register" className="text-[var(--accent)] hover:underline">
          Register
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({ email, password, name });
    setLoading(false);
    if (err) {
      setError(err.message ?? "Registration failed");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto w-full max-w-md space-y-4 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]">
      <h1 className="font-[family-name:var(--font-display)] text-2xl text-[var(--ink)]">Create account</h1>
      <Field label="Name" type="text" value={name} onChange={setName} />
      <Field label="Email" type="email" value={email} onChange={setEmail} />
      <Field label="Password" type="password" value={password} onChange={setPassword} />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-[var(--accent)] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Creating…" : "Register"}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        Already have an account?{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-sm font-medium text-[var(--ink)]">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-[var(--line)] bg-white px-3 py-2 text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
    </label>
  );
}
