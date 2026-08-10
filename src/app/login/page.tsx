import { LoginForm } from "@/components/AuthForms";
import { ThemeToggle } from "@/components/ThemeProvider";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function LoginPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <main className="relative mx-auto flex min-h-screen w-full items-center px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <LoginForm />
    </main>
  );
}
