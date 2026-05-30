import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BYASHARA STORE",
    template: "%s | BYASHARA STORE",
  },
  description:
    "Shop electronics, accessories, and more. Order online with fast delivery.",
  keywords: ["electronics", "Rwanda electronics", "accessories", "chargers", "speakers", "power banks"],
  authors: [{ name: "BYASHARA STORE" }],
  creator: "BYASHARA STORE",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3210"),
  openGraph: {
    type: "website",
    locale: "en_RW",
    siteName: "BYASHARA STORE",
    title: "BYASHARA STORE",
    description: "Shop electronics, accessories, and more.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BYASHARA STORE",
    description: "Shop electronics, accessories, and more.",
  },
  robots: { index: true, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32", type: "image/x-icon" },
      { url: "/logo.png", sizes: "any", type: "image/png" },
    ],
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
