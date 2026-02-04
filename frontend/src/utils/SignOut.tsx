"use client";


import { useRouter } from "next/navigation";
import { getCookie } from "./getCookie";

const SignOut = () => {
  const router = useRouter();

  const logOut = async () => {
    const res = await fetch("/api/logout", { method: "POST" });

    // console.log(await getCookie());

    // const data = await res.json();
    console.log("logout response:", res);

    router.refresh();

    // if (res.ok) {
    //   window.location.href = "/sign-in";
    // }
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
