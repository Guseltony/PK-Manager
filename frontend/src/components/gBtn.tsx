"use client";

import Image from "next/image";

interface GoogleLoginButtonProps {
  isLogIn: boolean;
}

export default function GoogleLoginButton({ isLogIn }: GoogleLoginButtonProps) {
  const handleGoogleLogin = () => {
    window.location.href = "http://localhost:5000/auth/google";
  };

  return (
    <button
      onClick={handleGoogleLogin}
      style={{
        width: "100%",
        height: "48px",
        // borderRadius: "50%",
        border: "1px solid #e5e7eb",
        background: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
      }}
      aria-label="Continue with Google"
    >
      <Image src="/google-icon.svg" alt="Google" width={22} height={22} />\
      <p className=" text-black font-bold text-sm">
        {isLogIn ? "Sign in with Google" : "Sign up with Google"}
      </p>
    </button>
  );
}
