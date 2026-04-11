import type { Metadata } from "next";
import SignInForm from "./SignInForm";

export const metadata: Metadata = {
  title: "Sign In — PK-Manager",
  description: "Sign in to your PK-Manager account to access your notes, tasks, goals, and journal.",
};

export default function SignInPage() {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-surface-base">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-brand-primary/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-brand-secondary/10 blur-3xl" />

      <div className="relative z-10 w-full max-w-md px-4">
        <SignInForm />
      </div>
    </div>
  );
}
