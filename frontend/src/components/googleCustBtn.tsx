"use client";

import { useGoogleLogin } from "@react-oauth/google";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function CustomGoogleButton() {
  const router = useRouter();

  const login = useGoogleLogin({
    flow: "implicit", // ID token
    onSuccess: async (tokenResponse) => {
      const accessToken = tokenResponse.access_token;
      if (!accessToken) return;

      const res = await fetch("http://localhost:5000/auth/gmail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ credential: accessToken }),
        credentials: "include",
      });

      const data = await res.json();
      console.log("frontend data:", data);

      if (!res.ok) throw new Error(data.message || "Google login failed");

      router.push("/dashboard");
    },
    onError: () => console.error("Google login failed"),
  });

  return (
    <button
      onClick={() => login()}
      aria-label="Sign in with Google"
      style={{
        width: "100%",
        // height: "100px",
        borderRadius: "20px",
        border: "1px solid #e5e7eb",
        backgroundColor: "transparent",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
    >
      <Image src="/google-icon.svg" width={22} height={22} alt="Google" />
      Sign In with Google
    </button>
  );
}
