"use client";

import GoogleBtn from "@/src/components/GoogleBtn";
import { registerAction } from "./actions";
import { useState } from "react";
import CustomGoogleButton from "@/src/components/googleCustBtn";
import GoogleOneTapButton from "@/src/utils/googleOneTap";
import { GoogleLogin } from "@react-oauth/google";
import GoogleLoginButton from "@/src/components/gBtn";
// import CustomGoogleButton from "@/src/components/customGoogleBtn";

export default function RegisterPage() {
  const [errors, setErrors] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = await registerAction(formData);

    if (!result.success) {
      setErrors(
        result.errors
          ? Object.values(result.errors).flat().join(" | ")
          : result.message || "Unknown error",
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
        {errors && isLocal && (
          <p className="text-red-400/90 text-xs bg-red-400/20 py-2 px-2">
            {errors}
          </p>
        )}
        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-800 px-10 py-4 text-xs font-extrabold text-text"
          onClick={() => setIsLocal(true)}
        >
          Create Account
        </button>
        <div className="flex items-center justify-center mb-4">
          <span className="border-t border-gray-600 grow"></span>
          <span className="px-4 text-xs text-gray-400 uppercase">
            Sign In With Google
          </span>
          <span className="border-t border-gray-600 grow"></span>
        </div>
        <GoogleBtn />
        <p>Redirect method</p>
        <GoogleLoginButton />
        <GoogleOneTapButton />
        <CustomGoogleButton />
        {/* <CustomGoogleButton /> */}
      </form>
    </div>
  );
}
