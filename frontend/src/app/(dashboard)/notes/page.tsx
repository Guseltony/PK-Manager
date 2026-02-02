import { cookies } from "next/headers";

const page = async () => {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get("refreshToken");

  const refreshCookie = refreshTokenCookie?.value;

  console.log("note cookie refreshCookie", refreshCookie);

  return <div>NOTE</div>;
};

export default page;
