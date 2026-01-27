// any server component, layout, or page
import { cookies } from "next/headers";

export async function getAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken");

  return {
    isAuthenticated: Boolean(accessToken),
  };
}
