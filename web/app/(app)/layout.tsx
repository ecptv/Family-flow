import Sidebar from "@/components/Sidebar";
import "../globals.css";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <div style={{ marginLeft: 64, minHeight: "100vh", background: "var(--bg)", transition: "background 0.3s" }}>
        {children}
      </div>
    </>
  );
}