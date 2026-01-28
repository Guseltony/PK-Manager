"use client";

import { loginAction, registerAction } from "./actions";
import { useState } from "react";
import GoogleLoginButton from "@/src/components/gBtn";
import { useRouter } from "next/navigation";
import { BACKEND_URL } from "@/src/constants/constants";
// import CustomGoogleButton from "@/src/components/customGoogleBtn";

export default function RegisterPage() {
  const [errors, setErrors] = useState<string | null>(null);
  const [isLocal, setIsLocal] = useState<boolean>(false);
  const [isLogIn, setIsLogIn] = useState<boolean>(false);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const result = isLogIn
      ? await loginAction(formData)
      : await registerAction(formData);

    if (!result?.success && result?.redirectToGoogle) {
      if (!BACKEND_URL) {
        setErrors("Authentication service is unavailable.");
        return;
      }
      window.location.href = `${BACKEND_URL}/auth/google?mode=signup&email=${encodeURIComponent(result.email || "")}`;
      return;
    }

    if (!result?.success) {
      setErrors(
        result?.errors
          ? Object.values(result?.errors).flat().join(" | ")
          : result?.message || "Unknown error",
      );
      return;
    }
    router.push("/dashboard");
    setErrors(null);
  };

  setTimeout(() => {
    if (errors) {
      setErrors("");
    }
  }, 4000);

  return (
    <div className="flex items-center flex-col justify-center min-h-screen bg-bg">
      <div
        className={`${isLogIn ? "justify-end pt-16 pb-8 gap-10" : "justify-center py-8 gap-4"} flex flex-col w-125 h-170  px-10 bg-amber-900/40 rounded-md`}
      >
        <form
          onSubmit={handleSubmit}
          className={`${isLogIn ? "gap-10" : "gap-5"} flex flex-col`}
        >
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold text-center">
              {isLogIn ? "Welcome Back" : "Create your account"}
            </h1>
            <p className="text-sm text-center">
              {isLogIn
                ? "Sign in to continue managing your projects and tasks."
                : "Get started with pk-manager and organize your projects in one place."}
            </p>
          </div>
          {!isLogIn && (
            <>
              <div className="flex items-center flex-col w-full gap-5">
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  className="bg-transparent px-2 py-3 border-2 border-[#2225f5] outline-0 w-full"
                />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  className="bg-transparent px-2 py-3 border-2 border-[#2225f5] outline-0 w-full"
                />
              </div>
            </>
          )}
          <input
            type="email"
            placeholder="Email"
            name="email"
            className="bg-transparent px-2 py-3 border-2 border-[#2225f5] outline-0"
          />
          <input
            type="password"
            placeholder="Enter your password"
            name="password"
            className="w-full bg-transparent px-2 py-3 border-2 border-[#2225f5] outline-0"
          />
          {!isLogIn && (
            <label className="flex items-center gap-2 text-text">
              <input type="checkbox" name="agree" />I agree to the Terms &
              Conditions
            </label>
          )}
          {errors && isLocal && (
            <p className="text-red-400/90 text-xs bg-red-400/20 py-2 px-2">
              {errors}
            </p>
          )}
          <button
            type="submit"
            className="w-full rounded-2xl bg-blue-800 px-10 py-4 text-xs font-extrabold text"
            onClick={() => setIsLocal(true)}
          >
            {isLogIn ? "Log In" : "Create Account"}
          </button>
        </form>
        <div>
          <div
            className={`${isLogIn ? "mb-8" : "mb-3"} flex items-center justify-center `}
          >
            <span className="border-t border-gray-600 grow"></span>
            <span className="px-4 text-xs text-gray-400 uppercase">Or</span>
            <span className="border-t border-gray-600 grow"></span>
          </div>

          <GoogleLoginButton isLogIn={isLogIn} />

          <div className="flex gap-4 mt-4">
            <p>{isLogIn ? "Not yet a member" : "Already have an account?"} </p>
            <button type="button" onClick={() => setIsLogIn((prev) => !prev)}>
              {isLogIn ? "Sign up" : "Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
