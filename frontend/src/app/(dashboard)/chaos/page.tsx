import ChaosLedgerPage from "@/src/features/chaos/ChaosLedgerPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chaos Ledger | PK-Manager",
  description: "Log your triggers, patterns, and resolutions to break cycles of self-sabotage.",
};

export default function Page() {
  return <ChaosLedgerPage />;
}
