import { redirect } from "next/navigation";
import LoginForm from "@/components/login-form";
import { getServerSession } from "@/lib/auth/session";
import { AUTH_ROUTES } from "@/config/auth";
import { Suspense } from "react";

async function LoginContent() {
  const session = await getServerSession();

  if (session?.user) {
    redirect(AUTH_ROUTES.DASHBOARD);
  }

  return <LoginForm />;
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginForm />}>
      <LoginContent />
    </Suspense>
  );
}
