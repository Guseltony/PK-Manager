"use client";

import { registerAction } from "./actions";
import { useState } from "react";

export default function RegisterPage() {
  const [errors, setErrors] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await registerAction(formData);

    if (!result.success) {
      setErrors(
        result.errors
          ? Object.values(result.errors).flat().join(" | ")
          : result.message || "Unknown error"
      );
      return;
    }
    setErrors(null);
  };

  setTimeout(() => {
    if (errors) {
      setErrors("");
    }
  }, 4000);

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <form
        onSubmit={handleSubmit}
        className="py-20 px-16 flex flex-col gap-8 w-150 bg-amber-900/40 rounded-md"
      >
        <h1 className="text-2xl font-bold text-text">Create an account</h1>

        <div className="flex items-center justify-between w-full gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
        </div>

        <input
          type="text"
          name="userName"
          placeholder="username"
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="email"
          placeholder="Email"
          name="email"
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="password"
          placeholder="Enter your password"
          name="password"
          className="w-full bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <label className="flex items-center gap-2 text-text">
          <input type="checkbox" name="agree" />I agree to the Terms &
          Conditions
        </label>

        {errors && (
          <p className="text-red-400/90 text-xs bg-red-400/20 py-2 px-2">
            {errors}
          </p>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-800 px-10 py-4 text-xs font-extrabold text-text"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
