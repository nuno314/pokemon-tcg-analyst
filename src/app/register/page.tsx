import { RegisterForm } from "@/components/AuthForms";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <main className="mx-auto flex min-h-screen w-full items-center px-4 py-12">
      <RegisterForm />
    </main>
  );
}
