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
    agree: formData.get("agree") === "on",
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    // return the errors as a plain object
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { firstName, lastName, email, password } = result.data;

  const isGmail = (email: string) => email.toLowerCase().endsWith("@gmail.com");

  if (isGmail(email)) {
    return {
      success: false,
      redirectToGoogle: true,
      email,
    };
  }

  const data = {
    name: `${firstName} ${lastName}`,
    email,
    password,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Something went wrong",
      };
    }

    console.log(res);
    const resultData = await res.json();
    console.log("result:", resultData);
    return { success: true };

    // redirect("/dashboard");
  } catch (error: unknown) {
    return { success: false, message: "Server request failed", errors: error };
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
    // return the errors as a plain object
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { email, password } = result.data;

  const isGmail = (email: string) => email.toLowerCase().endsWith("@gmail.com");

  if (isGmail(email)) {
    return {
      success: false,
      redirectToGoogle: true,
      email,
    };
  }

  const data = {
    email,
    password,
  };

  try {
    const res = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Something went wrong",
      };
    }

    console.log(res);
    const resultData = await res.json();
    console.log("result:", resultData);
    return { success: true };
    // redirect("/dashboard");
  } catch (error) {
    return { success: false, message: "Server request failed", errors: error };
  }
}

export async function logOutAction(): Promise<AuthActionResult> {
  try {
    const res = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    console.log("res:", res);

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Something went wrong",
      };
    }

    console.log(res);
    const resultData = await res.json();
    console.log("result:", resultData);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Server request failed", errors: error };
  }
}
