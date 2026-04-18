import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";
import { User, UserApiResponse } from "@/src/type/type";

export type AuthResult =
  | { user: User; authenticated: true }
  | { user: null; authenticated: false };

export async function GET() {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    if (!cookieHeader) {
      return NextResponse.json<AuthResult>({
        user: null,
        authenticated: false,
      });
    }

    const res = await fetch(`${BACKEND_URL}/user/get`, {
      headers: {
        Cookie: cookieHeader,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json<AuthResult>({
        user: null,
        authenticated: false,
      });
    }

    const result: UserApiResponse = await res.json();

    return NextResponse.json<AuthResult>({
      user: result.data,
      authenticated: true,
    });
  } catch {
    return NextResponse.json<AuthResult>({
      user: null,
      authenticated: false,
    });
  }
}
