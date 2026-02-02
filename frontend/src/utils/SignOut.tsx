"use client";

import { BACKEND_URL } from "../constants/constants";
import { getCookie } from "./getCrsf";

const SignOut = () => {
  const logOut = async () => {
    try {
      const csrfToken = await getCookie("csrf");

      const res = await fetch(`${BACKEND_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken ?? "",
        },
      });

      if (!res.ok) {
        const message = await res.text();
        throw new Error(message || "Logout failed");
      }

      const contentType = res.headers.get("content-type") ?? "";
      const resultData = contentType.includes("application/json")
        ? await res.json()
        : await res.text();
      console.log("result:", resultData);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <button
      onClick={logOut}
      className="bg-[#6366f1] rounded-full px-2 py-2 uppercase text-xs font-bold"
    >
      Log Out
    </button>
  );
};

export default SignOut;
