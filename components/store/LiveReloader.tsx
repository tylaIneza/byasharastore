"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LiveReloader() {
  const router = useRouter();

  useEffect(() => {
    let es: EventSource;
    let retryTimer: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource("/api/events");

      es.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as { type: string };
          if (data.type === "connected") return;
          // Refresh server components (product listings, etc.)
          router.refresh();
          // Signal client components (announcement banner) to re-fetch
          window.dispatchEvent(new CustomEvent("store-update", { detail: data }));
        } catch {}
      };

      es.onerror = () => {
        es.close();
        // Reconnect after 5 s if the connection drops
        retryTimer = setTimeout(connect, 5000);
      };
    }

    connect();

    return () => {
      es?.close();
      clearTimeout(retryTimer);
    };
  }, [router]);

  return null;
}
