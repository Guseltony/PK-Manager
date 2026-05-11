import ProfilePage from "@/src/features/profile/ProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile | PK-Manager",
  description: "Manage your profile settings",
};

export default function Profile() {
  return <ProfilePage />;
}
