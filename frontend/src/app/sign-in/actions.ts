// This file no longer uses "use server" because static exports (Android APK) don't support Server Actions.
// These functions are now regular client-side functions that call the backend directly.

import { AuthActionResult } from "@/src/type/type";
import { loginSchema, registerSchema } from "./schema";
import { BACKEND_URL } from "@/src/constants/constants";
import { isNativeRuntime, setTokens } from "@/src/libs/nativeTokens";

function getProxyUrl() {
  return process.env.NODE_ENV === "development" ? "/local-api" : BACKEND_URL;
}

function nativeHeaders(): Record<string, string> {
  return isNativeRuntime() ? { "x-client": "native" } : {};
}

export async function registerAction(formData: FormData): Promise<AuthActionResult> {
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
    const proxyUrl = getProxyUrl();
    const res = await fetch(`${proxyUrl}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...nativeHeaders(),
      },
      body: JSON.stringify({ name: `${firstName} ${lastName}`, email, password }),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message:
          errorData.message ||
          errorData.error ||
          "Registration failed. Please try again.",
      };
    }

    const data = await res.json();
    if (data?.data?.accessToken || data?.data?.refreshToken) {
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
    }

    return { success: true, csrfToken: data.data?.csrfToken || data.csrfToken };
  } catch {
    return {
      success: false,
      message: "Cannot connect to server. Please try again later.",
    };
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
    const proxyUrl = getProxyUrl();
    const res = await fetch(`${proxyUrl}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...nativeHeaders(),
      },
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
    if (data?.data?.accessToken || data?.data?.refreshToken) {
      setTokens({
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
      });
    }

    return { success: true, csrfToken: data.data?.csrfToken || data.csrfToken };
  } catch {
    return {
      success: false,
      message: "Cannot connect to server. Please try again later.",
    };
  }
}

export async function logOutAction(): Promise<AuthActionResult> {
  try {
    const proxyUrl = getProxyUrl();
    const res = await fetch(`${proxyUrl}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...nativeHeaders() },
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
    return {
      success: false,
      message: "Cannot connect to server. Please try again later.",
    };
  }
}

