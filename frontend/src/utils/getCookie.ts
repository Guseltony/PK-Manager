import { cookies } from "next/headers";

export const getCookies = async () => {
  try {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; ");

    return cookieHeader;
  } catch {
    return "";
  }
};


export const getCookie = async () => {
  const allCookies = await getCookies();

  const csrf = allCookies.split("; ");

  console.log("getting specific cookie", csrf);
};
