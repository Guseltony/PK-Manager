import AuthGate from "@/src/components/AuthGate";
import Header from "@/src/components/Header";
import SideBar from "@/src/components/SideBar";
import { auth } from "@/src/libs/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authResult = await auth();
  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 py-2 pl-2">
        <Header auth={authResult} />
        <AuthGate authenticated={authResult.authenticated}>{children}</AuthGate>
      </main>
    </div>
  );
}
