"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RegisterForm = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  agree: boolean;
};

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<RegisterForm>({
    firstName: "",
    lastName: "",
    email: "",
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

    if (!form.agree) {
      alert("You must agree to the Terms & Conditions");
      return;
    }

    // Here you can call your backend API
    console.log(form);

    // Redirect after successful signup
    router.push("/dashboard");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg">
      <form
        onSubmit={handleSubmit}
        className="py-20 px-16 flex flex-col gap-6 w-150 bg-content rounded-md"
      >
        <h1 className="text-2xl font-bold text-text">Create an account</h1>

        <div className="flex gap-4">
          <input
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            placeholder="First Name"
            className="flex-1 bg-transparent border-2 border-primary rounded-md px-3 py-2 text-text outline-none"
          />
          <input
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            placeholder="Last Name"
            className="flex-1 bg-transparent border-2 border-primary rounded-md px-3 py-2 text-text outline-none"
          />
        </div>

        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="bg-transparent border-2 border-primary rounded-md px-3 py-2 text-text outline-none"
        />

        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Enter your password"
          className="bg-transparent border-2 border-primary rounded-md px-3 py-2 text-text outline-none"
        />

        <label className="flex items-center gap-2 text-text">
          <input
            type="checkbox"
            name="agree"
            checked={form.agree}
            onChange={handleChange}
          />
          I agree to the Terms & Conditions
        </label>

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-4 py-3 font-bold text-text"
        >
          Create Account
        </button>
      </form>
    </div>
  );
}
