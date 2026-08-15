"use client";

import { LOCALE_OPTIONS, type Locale } from "@/lib/i18n";
import { useLocale } from "@/components/LocaleProvider";

export function LanguageSelector({ className = "" }: { className?: string }) {
  const { locale, setLocale, dict } = useLocale();

  return (
    <label className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="sr-only">{dict.language.label}</span>
      <select
        value={locale}
        onChange={(e) => void setLocale(e.target.value as Locale)}
        aria-label={dict.language.label}
        className="rounded-full border border-[var(--line)] bg-[var(--surface)] px-2 py-1.5 text-xs text-[var(--ink)] hover:bg-[var(--wash)]"
      >
        {LOCALE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}
