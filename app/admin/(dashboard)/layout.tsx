import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/Sidebar";
import AdminHeader from "@/components/admin/Header";
import { ToastProvider } from "@/components/ui/Toast";
import SessionWrapper from "@/components/admin/SessionWrapper";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <SessionWrapper>
      <ToastProvider>
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
          <AdminSidebar />
          <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
            <AdminHeader />
            <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </ToastProvider>
    </SessionWrapper>
  );
}
