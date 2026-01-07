"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RegisterFormData, registerSchema } from "./schema";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterFormData>({
    firstName: "",
    lastName: "",
    email: "",
    userName: "",
    password: "",
    agree: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const result = registerSchema.safeParse(form);

    if (!result.success) {
      console.log(result);

      return;
    }

    // ✅ Form is valid here
    console.log("Validated data:", result.data);

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
            name="firstName"
            placeholder="First Name"
            required
            value={form.firstName}
            onChange={handleChange}
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            required
            value={form.lastName}
            onChange={handleChange}
            className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text flex-1"
          />
        </div>

        <input
          type="text"
          name="userName"
          placeholder="username"
          required
          value={form.userName}
          onChange={handleChange}
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="email"
          placeholder="Email"
          required
          name="email"
          value={form.email}
          onChange={handleChange}
          className="bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <input
          type="password"
          placeholder="Enter your password"
          required
          name="password"
          value={form.password}
          onChange={handleChange}
          className="w-full bg-transparent rounded-md px-2 py-3 border-2 border-[#2225f5] outline-0 text-text"
        />

        <label className="flex items-center gap-2 text-text">
          <input
            type="checkbox"
            name="agree"
            required
            checked={form.agree}
            onChange={handleChange}
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
}
