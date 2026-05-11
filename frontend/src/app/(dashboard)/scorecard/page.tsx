import ScorecardPage from "@/src/features/scorecard/ScorecardPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Monthly Scorecard | PK-Manager",
  description: "Auto-generated monthly performance reviews based on your habit logs and constitutional pillars.",
};

export default function Page() {
  return <ScorecardPage />;
}
