"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

type Props = {
  onSuccess: (credential: string) => void;
};

export default function CustomGoogleButton({ onSuccess }: Props) {
  useEffect(() => {
    if (!window.google) return;

    window.google.accounts.id.initialize({
      client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      callback: (response) => {
        onSuccess(response.credential);
      },

      // ✅ FedCM-safe
      use_fedcm_for_prompt: true,
    });
  }, [onSuccess]);

  const handleClick = () => {
    if (!window.google) return;

    window.google.accounts.id.prompt(); // FedCM will handle UI
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center justify-center w-12 h-12 rounded-full border hover:bg-gray-100 transition"
      aria-label="Sign in with Google"
    >
      <img src="/google.svg" alt="Google" className="w-6 h-6" />
    </button>
  );
}

// usage
<CustomGoogleButton
  onSuccess={(credential) => {
    console.log("JWT:", credential);

    fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
  }}
/>;

// in layout
<script src="https://accounts.google.com/gsi/client" async defer></script>;

// npm to install

<script src="https://accounts.google.com/gsi/client" async defer></script>;
