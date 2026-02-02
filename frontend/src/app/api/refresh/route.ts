// app/api/refresh/route.ts
import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";

export async function POST(req: Request) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const csrf = cookieHeader
      .split("; ")
      .find((c) => c.startsWith("csrf="))
      ?.split("=")[1];

    // Call backend refresh endpoint
    const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        Cookie: cookieHeader,
        "x-csrf-token": csrf ?? "",
      },
      credentials: "include",
    });

    if (!backendRes.ok) {
      return NextResponse.json(
        { message: "Refresh failed" },
        { status: backendRes.status },
      );
    }

    const res = NextResponse.json({ status: "ok" });

    // Forward set-cookie from backend to browser
    const setCookie = backendRes.headers.get("set-cookie");
    if (setCookie) res.headers.set("set-cookie", setCookie);

    return res;
  } catch (err) {
    return NextResponse.json(
      { message: err || "Refresh error" },
      { status: 500 },
    );
  }
}

// import { NextRequest, NextResponse } from "next/server";
// import { BACKEND_URL } from "@/src/constants/constants";

// export async function POST(req: NextRequest) {
//   try {
//     // 1. Read cookies from browser request
//     const cookieHeader = req.headers.get("cookie") || "";

//     // 2. Extract CSRF token from cookies
//     const csrf = cookieHeader
//       .split("; ")
//       .find((c) => c.startsWith("csrf="))
//       ?.split("=")[1];

//     // 3. Call your backend refresh endpoint
//     const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
//       method: "POST",
//       headers: {
//         Cookie: cookieHeader,
//         "x-csrf-token": csrf ?? "",
//       },
//       credentials: "include",
//     });

//     // 4. If refresh failed
//     if (!backendRes.ok) {
//       return NextResponse.json(
//         { message: "Refresh failed" },
//         { status: backendRes.status },
//       );
//     }

//     // 5. Create response to browser
//     const res = NextResponse.json({ status: "ok" });

//     // 6. Forward Set-Cookie headers to browser
//     const setCookie = backendRes.headers.get("set-cookie");

//     if (setCookie) {
//       res.headers.set("set-cookie", setCookie);
//     }

//     return res;
//   } catch (error) {
//     console.error("Refresh route error:", error);
//     return NextResponse.json(
//       { message: "Internal refresh error" },
//       { status: 500 },
//     );
//   }
// }
