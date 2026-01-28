// any server component, layout, or page
import { cookies } from "next/headers";

export async function getAuth() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  const refreshToken = cookieStore.get("refreshToken")?.value;
  const csrf = cookieStore.get("csrf")?.value;

  return {
    isAuthenticated: Boolean(accessToken),
    accessToken,
    refreshToken,
    csrf,
  };
}
