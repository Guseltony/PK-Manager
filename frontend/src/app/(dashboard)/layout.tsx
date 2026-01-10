import Header from "@/src/components/Header";
import SideBar from "@/src/components/SideBar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex flex-1">
      {/* Sidebar */}
      <SideBar />

      {/* Main content */}
      <main className="flex-1 py-2 pl-2">
        <Header />
        {children}
      </main>
    </div>
  );
}
