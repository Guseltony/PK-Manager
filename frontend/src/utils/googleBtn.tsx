"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CredentialResponse {
  credential?: string;
}

export default function CustomGoogleButton() {
  const router = useRouter();

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) return;

    try {
      const res = await fetch("http://localhost:5000/auth/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: idToken }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Google login failed");

      console.log("Login successful:", data);

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(
        "Google login error:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    // @ts-ignore
    window.google?.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleSuccess,
    });
  }, []);

  const handleClick = () => {
    type PromptNotification = { disable_auto_select?: boolean };
    // Extend the type to include 'prompt' for TypeScript
    const accountsId = window.google?.accounts
      .id as typeof window.google.accounts.id & {
      prompt?: (callback?: (notification: PromptNotification) => void) => void;
    };
    accountsId?.prompt?.((notification: PromptNotification) => {
      notification.disable_auto_select = true; // ⚡ force account picker
    });
  };

  return (
    <button
      onClick={handleClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 8,
        border: "1px solid #ddd",
        background: "#4285F4",
        color: "#fff",
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Image src="/google-icon.svg" alt="Google" width={20} height={20} />
      Sign in with Google
    </button>
  );
}
