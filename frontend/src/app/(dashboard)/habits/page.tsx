import HabitsPage from "@/src/features/habits/HabitsPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Habits & Consistency | PK-Manager",
  description: "Track your foundational streaks and non-negotiable habits.",
};

export default function Page() {
  return <HabitsPage />;
}
