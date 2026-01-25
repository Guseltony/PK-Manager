"use client";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";

const GoogleBtn = () => {
  const router = useRouter();

  interface CredentialResponse {
    credential?: string;
  }

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

  return (
    <div>
      <p>OR</p>
      {/* Constrain button width slightly */}
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => console.log("can't sign in using google")}
        theme="outline"
        size="large"
        shape="rectangular"
        logo_alignment="left"
        text="signin_with"
        type="standard"
      />
    </div>
  );
};

export default GoogleBtn;
