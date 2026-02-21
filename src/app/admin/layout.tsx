import { SessionProvider } from "next-auth/react";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { ToastProvider } from "@/components/ui/Toast";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <ToastProvider>
        <div className="min-h-screen bg-admin-bg">
          <AdminSidebar />
          <main className="lg:ml-64 min-h-screen">
            <div className="p-6 lg:p-8">{children}</div>
          </main>
        </div>
      </ToastProvider>
    </SessionProvider>
  );
}
