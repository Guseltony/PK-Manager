import { registerSchema } from "./schema";

export async function registerAction(formData: FormData) {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    userName: formData.get("userName"),
    password: formData.get("password"),
    agree: formData.get("agree") === "on",
  };

  const result = registerSchema.safeParse(rawData);

  if (!result.success) {
    // return the errors as a plain object
    return { success: false, errors: result.error.flatten().fieldErrors };
  }

  const { firstName, lastName, email, userName, password } = result.data;

  const data = {
    name: `${firstName} ${lastName}`,
    username: userName,
    email,
    password,
  };

  try {
    const res = await fetch("http://localhost:5000/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    const resultData = await res.json();

    if (!res.ok) {
      const text = await res.text();
      return { success: false, message: text || "Something went wrong" };
    }

    console.log(res);
    console.log("result:", resultData);
    return { success: true };
  } catch (error) {
    return { success: false, message: "Server request failed", error: error };
  }
}
