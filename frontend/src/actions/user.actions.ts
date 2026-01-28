import { BACKEND_URL } from "../constants/constants";

export const User = async () => {
  try {
    const res = await fetch(`${BACKEND_URL}/user/get`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errorData.message || errorData.error || "Something went wrong",
      };
    }

    const resultData = await res.json();

    return { data: resultData };
  } catch (error) {
    return { success: false, message: "Server request failed", errors: error };
  }
};
