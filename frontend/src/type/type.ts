import { IconType } from "react-icons";

export type NavLink = { href: string; name: string; icon: IconType };

export type RegisterForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  agree: boolean;
};

export type AuthActionResult =
  | { success: true }
  | {
      success: false;
      errors?: Record<string, string[]> | unknown;
      message?: string;
      redirectToGoogle?: true;
      email?: string;
    }
  | {
      success: false;
      redirectToGoogle: true;
      email: string;
    };

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  username: string | null;
  provider: "GOOGLE" | "EMAIL";
  googleId: string | null;
  emailVerified: boolean;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

// export type AuthResult =
//   | { user: User; authenticated: true }
//   | { user: null; authenticated: false };

export type UserApiResponse = {
  message: string;
  data: User;
};
