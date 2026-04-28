import AuthGate from "@/src/components/AuthGate";
import Header from "@/src/components/Header";
import SideBar, { MobileSidebarDrawer } from "@/src/components/SideBar";
import GlobalInboxCapture from "@/src/features/inbox/GlobalInboxCapture";
import { auth } from "@/src/libs/auth";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();

  if (!authResult.authenticated) redirect("/sign-in");

  return (
    <div className="flex min-h-screen bg-surface-base">
      <MobileSidebarDrawer />
      {/* Desktop Sidebar - hidden on mobile */}
      <SideBar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header auth={authResult} />

        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <GlobalInboxCapture />
      </div>
    </div>
  );
}
