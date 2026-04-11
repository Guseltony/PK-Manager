"use client";


import { useRouter } from "next/navigation";
import { getCookie } from "./getCookie";

import { FiLogOut } from "react-icons/fi";

const SignOut = () => {
  const router = useRouter();

  const logOut = async () => {
    const res = await fetch("/api/logout", { method: "POST" });
    console.log("logout response:", res);
    router.refresh();
  };

  return (
    <button
      onClick={logOut}
      className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border border-white/5 bg-surface-soft text-text-muted transition-all hover:bg-red-500/10 hover:text-red-400"
      title="Sign Out"
    >
      <FiLogOut size={18} />
    </button>
  );
};

export default SignOut;
