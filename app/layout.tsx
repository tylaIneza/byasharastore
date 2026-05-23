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
    default: "BYASHARA STORE — Wholesale Electronics Rwanda & DRC",
    template: "%s | BYASHARA STORE",
  },
  description:
    "Rwanda & Eastern DRC's #1 wholesale electronics marketplace. Bulk pricing on phones, laptops, accessories and more. Order online, fast delivery.",
  keywords: ["wholesale electronics", "Rwanda electronics", "DRC electronics", "Goma electronics", "bulk order", "wholesale phones"],
  authors: [{ name: "BYASHARA STORE" }],
  creator: "BYASHARA STORE",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3210"),
  openGraph: {
    type: "website",
    locale: "en_RW",
    siteName: "BYASHARA STORE",
    title: "BYASHARA STORE — Wholesale Electronics",
    description: "Rwanda & Eastern DRC's #1 wholesale electronics marketplace.",
  },
  twitter: {
    card: "summary_large_image",
    title: "BYASHARA STORE",
    description: "Wholesale electronics for Rwanda & Eastern DRC.",
  },
  robots: { index: true, follow: true },
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
