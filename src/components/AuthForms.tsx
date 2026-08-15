"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "@/components/LocaleProvider";
import { authClient } from "@/lib/auth-client";

export function LoginForm() {
  const router = useRouter();
  const dict = useTranslations();
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
      setError(err.message ?? dict.common.error);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 ui-card p-6"
    >
      <h1 className="font-display text-2xl text-[var(--ink)]">
        {dict.auth.signIn}
      </h1>
      <Field label={dict.auth.email} type="email" value={email} onChange={setEmail} />
      <Field label={dict.auth.password} type="password" value={password} onChange={setPassword} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? dict.auth.signingIn : dict.auth.signIn}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        {dict.auth.noAccount}{" "}
        <Link href="/register" className="text-[var(--accent)] hover:underline">
          {dict.auth.register}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const dict = useTranslations();
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
      setError(err.message ?? dict.common.error);
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto w-full max-w-md space-y-4 ui-card p-6"
    >
      <h1 className="font-display text-2xl text-[var(--ink)]">
        {dict.auth.register}
      </h1>
      <Field label={dict.auth.name} type="text" value={name} onChange={setName} />
      <Field label={dict.auth.email} type="email" value={email} onChange={setEmail} />
      <Field label={dict.auth.password} type="password" value={password} onChange={setPassword} />
      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="ui-btn-primary w-full py-2.5 text-sm disabled:opacity-50"
      >
        {loading ? dict.auth.creating : dict.auth.register}
      </button>
      <p className="text-center text-sm text-[var(--muted)]">
        {dict.auth.hasAccount}{" "}
        <Link href="/login" className="text-[var(--accent)] hover:underline">
          {dict.auth.signIn}
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
        className="ui-input"
      />
    </label>
  );
}
