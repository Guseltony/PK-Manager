import { cookies } from "next/headers";
import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "../type/type";
export type AuthResult =
  | { user: User; authenticated: true }
  | { user: null; authenticated: false };

export async function auth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    console.log("cookieHeader:", cookieHeader);

    if (!cookieHeader) {
      return { user: null, authenticated: false };
    }

    const res = await fetch(`${BACKEND_URL}/user/get`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
      },
      cache: "no-store", // 👈 correct for auth
    });

    if (!res.ok) {
      return { user: null, authenticated: false };
    }

    const result: UserApiResponse = await res.json();

    return {
      user: result.data, // 👈 unwrap here
      authenticated: true,
    };
  } catch {
    return { user: null, authenticated: false };
  }
}
