import { cookies } from "next/headers";

export const getCookies = async () => {
  const cookieStore = await cookies();

  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return cookieHeader;
};


export const getCookie = async () => {
  const allCookies = await getCookies();

  const csrf = allCookies.split("; ");

  console.log("getting specific cookie", csrf);
};
