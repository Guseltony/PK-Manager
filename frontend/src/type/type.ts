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
