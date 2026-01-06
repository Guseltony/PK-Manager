"use client";

import { redirect } from "next/navigation";

const Register = () => {
  const handleSubmit = () => {
    redirect("/dashboard");
  };
  return (
    <div className="flex items-center justify-center h-dvh">
      <form
        className="py-20 px-16 flex flex-col gap-8 w-150 bg-amber-900/40"
        onSubmit={() => handleSubmit()}
      >
        <h1 className="text-2xl">Create an account</h1>

        <div className="flex items-center justify-between w-full">
          <input
            type="text"
            placeholder="First Name"
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0"
          />
          <input
            type="text"
            placeholder="Last Name"
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0"
          />
        </div>

        <input
          type="email"
          placeholder="Email"
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0"
        />

        <div>
          <input
            type="password"
            placeholder="Enter your password"
            className="w-full bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0"
          />
        </div>

        <div>
          <input type="checkbox" /> I agree to the Terms & Conditions
        </div>

        <input
          type="submit"
          value="Create Account"
          className="w-full rounded-2xl bg-blue-800 px-10 py-4 text-xs font-extrabold"
        />
      </form>
    </div>
  );
};

export default Register;
