"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (element: HTMLElement | null, config: unknown) => void;
        };
      };
    };
  }
}

const handleCredentialResponse = async (response: { credential: string }) => {
  try {
    const res = await fetch("http://localhost:5000/api/auth/google", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: response.credential }),
    });

    const data = await res.json();

    if (res.ok) {
      // Handle successful authentication
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    }
  } catch (error) {
    console.error("Error:", error);
  }
};

export default function ManualGoogleButton() {
  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      window.google.accounts.id.renderButton(
        document.getElementById("googleSignInDiv"),
        {
          theme: "outline",
          size: "large",
          type: "standard",
          text: "signin_with",
          shape: "rectangular",
          logo_alignment: "left",
        },
      );
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="googleSignInDiv"></div>;
}
