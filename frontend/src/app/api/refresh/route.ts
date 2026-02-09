// // app/api/refresh/route.ts
// import { NextResponse } from "next/server";
// import { BACKEND_URL } from "@/src/constants/constants";

// export async function POST(req: Request) {
//   const cookieHeader = req.headers.get("cookie") || "";

//   const csrf = cookieHeader
//     .split("; ")
//     .find((c) => c.startsWith("csrf="))
//     ?.split("=")[1];

//   const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
//     method: "POST",
//     headers: {
//       Cookie: cookieHeader,
//       "x-csrf-token": csrf ?? "",
//     },
//     credentials: "include",
//   });

//   if (!backendRes.ok) {
//     return NextResponse.json(
//       { message: "Refresh failed" },
//       { status: backendRes.status },
//     );
//   }

//   const res = NextResponse.json({ ok: true });

//   const setCookie = backendRes.headers.get("set-cookie");
//   if (setCookie) {
//     res.headers.set("set-cookie", setCookie);
//   }

//   return res;
// }

// app/api/refresh/route.ts

// src/app/api/refresh/route.ts
import { NextResponse } from "next/server";
import { BACKEND_URL } from "@/src/constants/constants";

async function handleRefresh(req: Request) {
  console.log("getting the api/refresh");

  const cookieHeader = req.headers.get("cookie") || "";

  const csrf = cookieHeader
    .split("; ")
    .find((c) => c.startsWith("csrf="))
    ?.split("=")[1];

  const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      Cookie: cookieHeader,
      "x-csrf-token": csrf ?? "",
    },
    credentials: "include",
  });

  if (!backendRes.ok) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const next = new URL(req.url).searchParams.get("next") ?? "/";
  const res = NextResponse.redirect(new URL(next, req.url));

  const setCookie = backendRes.headers.get("set-cookie");
  if (setCookie) res.headers.set("set-cookie", setCookie);

  return res;
}

export const GET = handleRefresh;
export const POST = handleRefresh;


// import { NextResponse } from "next/server";
// import { BACKEND_URL } from "@/src/constants/constants";

// export async function POST(req: Request) {
//   console.log("getting the api/refresh");

//   const cookieHeader = req.headers.get("cookie") || "";

//   const csrf = cookieHeader
//     .split("; ")
//     .find((c) => c.startsWith("csrf="))
//     ?.split("=")[1];

//   const backendRes = await fetch(`${BACKEND_URL}/auth/refresh`, {
//     method: "POST",
//     headers: {
//       Cookie: cookieHeader,
//       "x-csrf-token": csrf ?? "",
//     },
//     credentials: "include",
//   });

//   if (!backendRes.ok) {
//     return NextResponse.redirect(new URL("/sign-in", req.url));
//   }

//   const next = new URL(req.url).searchParams.get("next") ?? "/";
//   const res = NextResponse.redirect(new URL(next, req.url));

//   const setCookie = backendRes.headers.get("set-cookie");
//   if (setCookie) res.headers.set("set-cookie", setCookie);

//   return res;
// }
