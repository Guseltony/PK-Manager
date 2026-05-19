"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Image from "next/image";
import { FiArrowRight, FiShield, FiZap, FiTarget } from "react-icons/fi";
import api from "@/src/libs/api";
import { getAccessToken, isNativeRuntime } from "@/src/libs/nativeTokens";

export default function WelcomePage() {
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        // On native, if tokens exist, skip this page immediately.
        if (isNativeRuntime() && getAccessToken()) {
          if (mounted) router.replace("/dashboard");
          return;
        }

        await api.get("/user/get");
        if (mounted) router.replace("/dashboard");
      } catch {
        // not logged in
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  return (
    <div className="flex min-h-dvh flex-col items-center justify-between bg-surface-base px-6 py-12 text-text-main overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[300px] bg-brand-primary/10 blur-[100px] rounded-full" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, type: "spring" }}
          className="mb-8"
        >
          <div className="relative h-24 w-24 overflow-hidden rounded-2xl bg-surface-soft p-4 shadow-2xl border border-border">
            <Image
              src="/pkmlogo.png"
              alt="PKM Logo"
              width={96}
              height={96}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="font-display text-4xl font-bold tracking-tight text-text-main sm:text-5xl">
            Organize Your Mind.<br />
            <span className="text-brand-primary">Execute Your Ideas.</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-text-muted max-w-sm mx-auto">
            The connected workspace for builders. Notes, tasks, and goals - all in
            one place.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-12 grid grid-cols-3 gap-4 w-full max-w-sm"
        >
          {[
            { icon: <FiShield />, label: "Secure" },
            { icon: <FiZap />, label: "Fast" },
            { icon: <FiTarget />, label: "Focused" },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface-soft/50 p-4 backdrop-blur-sm"
            >
              <div className="text-brand-primary">{item.icon}</div>
              <span className="text-xs font-medium text-text-muted">
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className="relative z-10 w-full max-w-sm space-y-4"
      >
        <button
          onClick={() => router.push("/sign-in")}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-primary py-4 text-lg font-bold text-white shadow-lg shadow-brand-primary/20 transition hover:brightness-110 active:scale-[0.98]"
        >
          Get Started <FiArrowRight />
        </button>

        <p className="text-center text-sm text-text-muted">
          New here? Build your foundation today.
        </p>
      </motion.div>
    </div>
  );
}