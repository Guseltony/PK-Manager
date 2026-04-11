import AuthGate from "@/src/components/AuthGate";
import Header from "@/src/components/Header";
import SideBar from "@/src/components/SideBar";
import { auth } from "@/src/libs/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();

  if (!authResult.authenticated) redirect("/sign-in");

  console.log(authResult);
  return (
    <div className="flex min-h-screen bg-surface-base">
      {/* Sidebar - Fixed width, sticky height */}
      <SideBar />

      {/* Main content - Scrollable area */}
      <div className="flex flex-1 flex-col">
        <Header auth={authResult} />
        
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
