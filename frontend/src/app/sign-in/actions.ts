"use server";

import { AuthActionResult } from "@/src/type/type";
import { loginSchema, registerSchema } from "./schema";
import { BACKEND_URL } from "@/src/constants/constants";

export async function registerAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    agree: formData.get("agree") === "true" || formData.get("agree") === "on",
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { firstName, lastName, email, password } = result.data;

  // Gmail users should use Google OAuth
  if (email.toLowerCase().endsWith("@gmail.com")) {
    return { success: false, redirectToGoogle: true, email };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Registration failed. Please try again.",
      };
    }

    const data = await res.json();
    return { success: true, csrfToken: data.data?.csrfToken || data.csrfToken };
  } catch {
    return { success: false, message: "Cannot connect to server. Please try again later." };
  }
}

export async function loginAction(
  formData: FormData,
): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const result = loginSchema.safeParse(rawData);

  if (!result.success) {
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  // Gmail users should use Google OAuth
  if (email.toLowerCase().endsWith("@gmail.com")) {
    return { success: false, redirectToGoogle: true, email };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Invalid email or password.",
      };
    }

    const data = await res.json();
    return { success: true, csrfToken: data.data?.csrfToken || data.csrfToken };
  } catch {
    return { success: false, message: "Cannot connect to server. Please try again later." };
  }
}

export async function logOutAction(): Promise<AuthActionResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Logout failed.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, message: "Cannot connect to server. Please try again later." };
  }
}
