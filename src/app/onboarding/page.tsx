import { LanguageSelector } from "@/components/LanguageSelector";
import { ProfileNameForm } from "@/components/ProfileNameForm";
import { ThemeToggle } from "@/components/ThemeProvider";
import { getProfile, requireSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function OnboardingPage() {
  const session = await requireSession();
  const profile = await getProfile(session.user.id);
  if (profile?.ptcglName) redirect("/dashboard");

  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center px-4 py-12">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <ProfileNameForm mode="onboarding" />
    </main>
  );
}
