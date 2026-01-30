import { cookies } from "next/headers";
import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "@/src/type/type";

export type AuthResult =
  | { user: User; authenticated: true }
  | { user: null; authenticated: false };

export async function GET(): Promise<AuthResult> {
  console.log("🔥 /api/user HIT");

  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) {
      return { user: null, authenticated: false };
    }

    console.log("🍪 Cookie header:", cookieHeader);

    const res = await fetch(`${BACKEND_URL}/user/get`, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
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
