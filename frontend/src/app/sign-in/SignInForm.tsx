"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff, FiAlertCircle } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import { loginSchema, registerSchema, type RegisterFormData, type LoginFormData } from "./schema";
import { loginAction, registerAction } from "./actions";
import { setManualCsrfToken } from "@/src/libs/api";
import Image from "next/image";
import { SocialLogin } from "@capgo/capacitor-social-login";
import { useIsMobile } from "@/src/hooks/useIsMobile";

export default function SignInForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  });

  const activeForm = isLogin ? loginForm : registerForm;
  const { formState: { errors } } = activeForm;

  const handleLogin = async (data: LoginFormData) => {
    setServerError(null);
    const formData = new FormData();
    formData.append("email", data.email);
    formData.append("password", data.password);

    const result = await loginAction(formData);
    if (!result?.success && "redirectToGoogle" in result && result.redirectToGoogle) {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem("oauth_state", state);

      const params = new URLSearchParams({
        client_id: googleClientId || "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        prompt: "select_account",
        login_hint: result.email || "",
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return;
    }
    if (!result?.success) {
      setServerError("message" in result ? result.message || "Login failed" : "Login failed");
      return;
    }
    if (result.csrfToken) {
      setManualCsrfToken(result.csrfToken);
    }
    router.push("/dashboard");
  };

  const handleRegister = async (data: RegisterFormData) => {
    setServerError(null);
    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, String(v)));

    const result = await registerAction(formData);
    if (!result?.success && "redirectToGoogle" in result && result.redirectToGoogle) {
      const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      const redirectUri = `${window.location.origin}/auth/callback`;
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem("oauth_state", state);

      const params = new URLSearchParams({
        client_id: googleClientId || "",
        redirect_uri: redirectUri,
        response_type: "code",
        scope: "openid email profile",
        state: state,
        prompt: "select_account",
        login_hint: result.email || "",
      });

      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      return;
    }
    if (!result?.success) {
      setServerError("message" in result ? result.message || "Registration failed" : "Registration failed");
      return;
    }
    if (result.csrfToken) {
      setManualCsrfToken(result.csrfToken);
    }
    router.push("/dashboard");
  };

  const { isNative } = useIsMobile();

  const handleGoogleAuth = async () => {
    if (isNative) {
      try {
        const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
        console.log("Starting Native Google Login with Client ID:", googleClientId);

        const result = await SocialLogin.login({
          provider: "google",
          options: {
            // webClientId is handled via capacitor.config.ts
            scopes: ["email", "profile"],
          },
        });

        if (result.provider === "google") {
          const googleResult = result.result;
          if (googleResult.responseType === "online" && googleResult.idToken) {
            console.log("Native Google login successful, verifying with backend...");
            // Send to backend for native verification
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/google/native`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ idToken: googleResult.idToken }),
            });

            if (response.ok) {
              const body = await response.json();
              if (body.data?.csrfToken) {
                setManualCsrfToken(body.data.csrfToken);
              }
              router.push("/dashboard");
              return;
            } else {
              const errData = await response.json();
              console.error("Backend Native Auth Error:", errData);
              setServerError(errData.error || "Server failed to verify Google account");
            }
          } else if (googleResult.responseType === "offline") {
             setServerError("Offline login mode not supported yet");
          } else {
            console.error("Unexpected Google login result:", googleResult);
            setServerError("Google login returned invalid response");
          }
        }
      } catch (err: unknown) {
        console.error("Native Google Login Plugin Error:", err);
        // Stringify the error so the user can see full details on mobile screen
        const errorDetail = typeof err === 'object' ? JSON.stringify(err) : String(err);
        setServerError(`Native Google Login failed: ${errorDetail}`);
      }
      return;
    }

    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = `${window.location.origin}/auth/callback`;
    
    // Generate simple state
    const state = Math.random().toString(36).substring(2);
    localStorage.setItem("oauth_state", state);

    const params = new URLSearchParams({
      client_id: googleClientId || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state,
      prompt: "select_account",
    });

    window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError(null);
    startTransition(() => {
      if (isLogin) {
        loginForm.handleSubmit(handleLogin)(e as React.BaseSyntheticEvent);
      } else {
        registerForm.handleSubmit(handleRegister)(e as React.BaseSyntheticEvent);
      }
    });
  };

  const switchMode = () => {
    setIsLogin((prev) => !prev);
    setServerError(null);
    loginForm.clearErrors();
    registerForm.clearErrors();
  };

  return (
    <div className="w-full rounded-2xl border border-border bg-surface-soft p-8 shadow-2xl shadow-black/40">
      {/* Brand Header */}
      <div className="mb-8 flex flex-col items-center gap-3">
        <Image src="/pkmlogo.png" alt="PKM Logo" width={60} height={60} priority className="w-16 h-16 object-cover" />
        <div className="text-center">
          <h1 className="text-2xl font-display font-bold text-text-main">
            {isLogin ? "Welcome back" : "Create account"}
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {isLogin
              ? "Sign in to your PKM workspace"
              : "Start your knowledge journey today"}
          </p>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="mb-6 flex rounded-xl border border-border bg-surface-base p-1">
        {(["Sign In", "Register"] as const).map((tab) => {
          const active = tab === "Sign In" ? isLogin : !isLogin;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setIsLogin(tab === "Sign In")}
              className={`flex-1 cursor-pointer rounded-lg py-2 text-sm font-semibold transition-all duration-200 ${
                active
                  ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/40"
                  : "text-text-muted hover:text-text-main"
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* Error Banner */}
      {serverError && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
          <FiAlertCircle className="shrink-0 text-red-400" />
          <p className="text-sm text-red-400">{serverError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
        {/* Register-only fields */}
        {!isLogin && (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted" htmlFor="firstName">
                First Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  {...registerForm.register("firstName")}
                  className={`w-full cursor-text rounded-xl border bg-surface-base py-3 pl-10 pr-3 text-sm text-text-main placeholder:text-text-muted/60 transition-all outline-none focus:ring-2 ${
                    errors && "firstName" in errors ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-brand-primary/50 focus:ring-brand-primary/20"
                  }`}
                />
              </div>
              {"firstName" in errors && errors.firstName && (
                <p className="text-xs text-red-400">{errors.firstName.message}</p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-text-muted" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                <input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  {...registerForm.register("lastName")}
                  className={`w-full cursor-text rounded-xl border bg-surface-base py-3 pl-10 pr-3 text-sm text-text-main placeholder:text-text-muted/60 transition-all outline-none focus:ring-2 ${
                    errors && "lastName" in errors ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-brand-primary/50 focus:ring-brand-primary/20"
                  }`}
                />
              </div>
              {"lastName" in errors && errors.lastName && (
                <p className="text-xs text-red-400">{errors.lastName.message}</p>
              )}
            </div>
          </div>
        )}

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-text-muted" htmlFor="email">
            Email address
          </label>
          <div className="relative">
            <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              {...(isLogin ? loginForm.register("email") : registerForm.register("email"))}
              className={`w-full cursor-text rounded-xl border bg-surface-base py-3 pl-10 pr-3 text-sm text-text-main placeholder:text-text-muted/60 transition-all outline-none focus:ring-2 ${
                errors.email ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-brand-primary/50 focus:ring-brand-primary/20"
              }`}
            />
          </div>
          {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-medium text-text-muted" htmlFor="password">
              Password
            </label>
            {isLogin && (
              <button type="button" className="cursor-pointer text-xs text-brand-primary hover:underline">
                Forgot password?
              </button>
            )}
          </div>
          <div className="relative">
            <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder={isLogin ? "Enter your password" : "Min. 8 characters"}
              {...(isLogin ? loginForm.register("password") : registerForm.register("password"))}
              className={`w-full cursor-text rounded-xl border bg-surface-base py-3 pl-10 pr-10 text-sm text-text-main placeholder:text-text-muted/60 transition-all outline-none focus:ring-2 ${
                errors.password ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:border-brand-primary/50 focus:ring-brand-primary/20"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-text-muted hover:text-text-main transition-colors"
            >
              {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
        </div>

        {/* Terms Checkbox — Register only */}
        {!isLogin && (
          <div className="flex flex-col gap-1">
            <label className="flex cursor-pointer items-center gap-2.5 text-sm text-text-muted">
              <input
                type="checkbox"
                {...registerForm.register("agree")}
                className="h-4 w-4 cursor-pointer rounded border-white/20 accent-brand-primary"
              />
              I agree to the{" "}
              <span className="cursor-pointer text-brand-primary hover:underline">Terms & Conditions</span>
            </label>
            {"agree" in errors && errors.agree && (
              <p className="text-xs text-red-400">{errors.agree.message}</p>
            )}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          className="mt-1 w-full cursor-pointer rounded-xl bg-brand-primary py-3 text-sm font-bold text-white shadow-lg shadow-brand-primary/25 transition-all hover:bg-brand-primary/90 hover:shadow-brand-primary/40 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isPending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              {isLogin ? "Signing in..." : "Creating account..."}
            </span>
          ) : isLogin ? "Sign In" : "Create Account"}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 border-t border-border" />
        <span className="text-xs font-medium uppercase tracking-widest text-text-muted/50">or</span>
        <div className="flex-1 border-t border-border" />
      </div>

      {/* Google OAuth */}
      <button
        type="button"
        onClick={handleGoogleAuth}
        className="flex w-full cursor-pointer items-center justify-center gap-3 rounded-xl border border-border bg-surface-mutes/50 py-3 text-sm font-semibold text-text-main transition-all hover:border-white/20 hover:bg-white/10 active:scale-[0.98]"
      >
        <FcGoogle size={20} />
        {isLogin ? "Continue with Google" : "Sign up with Google"}
      </button>

      {/* Switch Mode */}
      <p className="mt-6 text-center text-sm text-text-muted">
        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={switchMode}
          className="cursor-pointer font-semibold text-brand-primary hover:underline"
        >
          {isLogin ? "Create one" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
