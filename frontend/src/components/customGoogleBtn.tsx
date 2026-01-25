"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CredentialResponse {
  credential?: string;
}

export default function CustomGoogleButton() {
  const router = useRouter();
  const hiddenButtonRef = useRef<HTMLDivElement>(null);

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
      console.log("frontend data:", data);

      if (!res.ok) throw new Error(data.message || "Google login failed");

      // ✅ client-side navigation
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error(
        "Google login error:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  useEffect(() => {
    if (!window.google || !hiddenButtonRef.current) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleSuccess,
      auto_select: false,
    });

    window.google.accounts.id.renderButton(hiddenButtonRef.current, {
      theme: "outline",
      size: "large",
      text: "signin_with",
    });
  }, []);

  return (
    <>
      {/* Hidden real Google button */}
      <div ref={hiddenButtonRef} style={{ display: "none" }} />

      {/* Your custom UI */}
      <button
        onClick={() => {
          const button = hiddenButtonRef.current?.querySelector(
            "div[role=button]",
          ) as HTMLElement;
          button?.click();
        }}
        aria-label="Sign in with Google"
        style={{
          width: "48px",
          height: "48px",
          borderRadius: "50%",
          border: "1px solid #e5e7eb",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
        }}
      >
        <Image src="/google-icon.svg" width={22} height={22} alt="Google" />
      </button>
    </>
  );
}
