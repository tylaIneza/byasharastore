import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import PageTracker from "@/components/store/PageTracker";
import { ToastProvider } from "@/components/ui/Toast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
        <PageTracker />
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
