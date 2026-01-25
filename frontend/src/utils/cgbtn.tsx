"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface CredentialResponse {
  credential?: string;
}

export default function CustomGoogleButton() {
  const router = useRouter();

  // 🔹 Called when Google returns the ID token
  const handleSuccess = async (response: CredentialResponse) => {
    const idToken = response.credential;
    if (!idToken) return;

    try {
      const res = await fetch("http://localhost:5000/auth/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: idToken }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Google login failed");
      }

      console.log("Google login success:", data);

      router.push("/dashboard");
    } catch (err) {
      console.error("Google login error:", err);
    }
  };

  // 🔹 Initialize Google once on mount
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: handleSuccess,
      auto_select: false,
      use_fedcm_for_prompt: true, // ✅ future-proof (removes FedCM warning)
    });
  }, []);

  // 🔹 Trigger Google popup
  const handleClick = () => {
    window.google.accounts.id.prompt();
  };

  return (
    <button
      onClick={handleClick}
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
  );
}
