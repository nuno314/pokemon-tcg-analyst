import Link from "next/link";
import { AppNav } from "@/components/AppNav";
import { ProfileNameForm } from "@/components/ProfileNameForm";
import { requireProfile } from "@/lib/session";
import { t } from "@/lib/i18n/vi";

export default async function SettingsPage() {
  const { profile } = await requireProfile();
  const dict = t();

  return (
    <div>
      <AppNav ptcglName={profile.ptcglName} />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-[var(--accent)] hover:underline"
          >
            ← {dict.nav.dashboard}
          </Link>
          <h1 className="mt-2 font-display text-3xl text-[var(--ink)]">
            {dict.settings.pageTitle}
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">{dict.settings.pageHint}</p>
        </div>
        <ProfileNameForm initialName={profile.ptcglName} mode="settings" />
      </main>
    </div>
  );
}
