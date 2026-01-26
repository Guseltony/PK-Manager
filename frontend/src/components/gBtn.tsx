"use client";

import Image from "next/image";

export default function GoogleLoginButton() {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        border: "1px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      aria-label="Continue with Google"
    >
      <Image src="/google-icon.svg" alt="Google" width={22} height={22} />
    </button>
  );
}
