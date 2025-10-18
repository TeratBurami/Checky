import Navbar from "@/components/navbar";
import Sidebar from "@/components/sidebar";

const role = localStorage.getItem("role");

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <Sidebar role={`${role}`} />
      <main className="flex-1">
        <Navbar />
        {children}
      </main>
    </div>
  );
}