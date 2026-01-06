"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const Register = () => {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!agree) {
      alert("You must agree to the Terms & Conditions");
      return;
    }

    // TODO: Call your backend API to create account
    console.log({ firstName, lastName, email, password });

    // Redirect to dashboard after successful registration
    router.push("/dashboard");
  };

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
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
          <input
            type="text"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
        </div>

        <input
          type="text"
          placeholder="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <label className="flex items-center gap-2 text-text">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
          />
          I agree to the Terms & Conditions
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-800 px-10 py-4 text-xs font-extrabold text-text"
        >
          Create Account
        </button>
      </form>
    </div>
  );
};

export default Register;
