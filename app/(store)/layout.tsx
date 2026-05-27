import Navbar from "@/components/store/Navbar";
import Footer from "@/components/store/Footer";
import PageTracker from "@/components/store/PageTracker";
import AnnouncementBanner from "@/components/store/AnnouncementBanner";
import LiveReloader from "@/components/store/LiveReloader";
import { ToastProvider } from "@/components/ui/Toast";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <div className="flex flex-col min-h-screen bg-white dark:bg-slate-950">
        <PageTracker />
        <LiveReloader />
        <Navbar />
        <main className="flex-1 pt-16">
          <AnnouncementBanner />
          {children}
        </main>
        <Footer />
      </div>
    </ToastProvider>
  );
}
