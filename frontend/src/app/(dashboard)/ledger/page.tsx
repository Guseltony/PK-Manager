import LedgerDashboard from "@/features/ledger/LedgerDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ledger | PK-Manager",
  description: "Task execution history and productivity patterns.",
};

export default function LedgerPage() {
  return <LedgerDashboard />;
}
