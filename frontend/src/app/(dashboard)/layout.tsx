import Header from "@/src/components/Header";
import SideBar, { MobileSidebarDrawer } from "@/src/components/SideBar";
import GlobalInboxCapture from "@/src/features/inbox/GlobalInboxCapture";
import { auth } from "@/src/libs/auth";
import { redirect } from "next/navigation";
import BottomNav from "@/src/components/BottomNav";
import InstallPrompt from "@/src/components/InstallPrompt";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();

  if (!authResult.authenticated) redirect("/sign-in");

  return (
    <div className="flex min-h-dvh bg-surface-base">
      <MobileSidebarDrawer />
      {/* Desktop Sidebar - hidden on mobile */}
      <SideBar />

      {/* Main content area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header auth={authResult} />

        <main className="flex-1 overflow-hidden pb-16 lg:pb-0">{children}</main>
        <GlobalInboxCapture />
        <BottomNav />
        <InstallPrompt />
      </div>
    </div>
  );
}
