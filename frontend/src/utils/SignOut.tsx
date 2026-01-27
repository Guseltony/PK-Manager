"use client";

import { getCookie } from "./getCrsf";

const SignOut = () => {
  const logOut = async () => {
    try {
      const csrfToken = getCookie("csrf");

      const res = await fetch("http://localhost:5000/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      });

      const resultData = await res.json();
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
