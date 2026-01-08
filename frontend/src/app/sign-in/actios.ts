import { registerSchema } from "./schema";

export const registerAction = async (formData: FormData) => {
  const rawData = {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    userName: formData.get("userName"),
    password: formData.get("password"),
    agree: formData.get("agree") === "on",
  };

  const result = registerSchema.safeParse(rawData);

  console.log("result-action:", result);

if (!result.success) {
      const formatted = result.error.format();

      const flatErrors = Object.values(formatted)
        .flat()
        .filter(Boolean)
        .map((err) => err._errors)
        .flat();

      console.log("Validation error:", flatErrors);

      // return res.status(400).json({ message: flatErrors.join(", ") });
    }
  return result;
};
