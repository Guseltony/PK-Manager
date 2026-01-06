"use client";

import { redirect } from "next/navigation";

const SignButton = () => {
  return (
    <div onClick={() => redirect("/sign-in")}>
      <button className="bg-[#6366f1] rounded-full px-2 py-2 uppercase text-xs font-bold">
        Sign Up
      </button>
    </div>
  );
};

export default SignButton;
