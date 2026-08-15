import { RegisterForm } from "@/components/AuthForms";
import { LanguageSelector } from "@/components/LanguageSelector";
import { ThemeToggle } from "@/components/ThemeProvider";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center px-4 py-12">
      <div className="absolute right-4 top-4 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>
      <RegisterForm />
    </main>
  );
}
