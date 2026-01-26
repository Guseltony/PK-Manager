"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GoogleOneTapButton() {
  const router = useRouter();

  const handleSuccess = async (response: { credential?: string }) => {
    const idToken = response.credential;
    if (!idToken) return;

    const res = await fetch("http://localhost:5000/auth/gmail", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential: idToken }),
      credentials: "include",
    });

    const data = await res.json();
    console.log("frontend data:", data);

    if (!res.ok) throw new Error(data.message || "Google login failed");
    router.push("/dashboard");
  };

  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleSuccess,
    });
  }, []);

  return (
    <button
      onClick={() => window.google?.accounts.id.prompt()}
      className="google-auth-btn"
    >
      Continue with Google
    </button>
  );
}
