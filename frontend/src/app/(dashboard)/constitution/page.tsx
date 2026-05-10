import ConstitutionPage from "@/src/features/constitution/ConstitutionPage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "GUSEL Constitution | PK-Manager",
  description: "The anchor and blueprint for the Foundation Era.",
};

export default function Page() {
  return <ConstitutionPage />;
}
