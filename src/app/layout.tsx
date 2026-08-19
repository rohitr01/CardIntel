import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CompareProvider } from "@/lib/context/compare-context";
import { CompareTray } from "@/components/compare/compare-tray";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "CardIntel — India's Verified Credit Card Intelligence Platform",
    template: "%s | CardIntel India",
  },
  description:
    "India's most comprehensive and source-verified credit card intelligence platform. Multi-faceted filtering across all 50+ Indian banks, RuPay UPI, cashback, airport lounge, and zero forex cards with zero fabricated claims.",
  keywords: [
    "credit cards India",
    "best credit card India",
    "compare credit cards India",
    "RuPay UPI credit card",
    "cashback credit card India",
    "airport lounge credit cards",
    "zero forex credit card",
    "lifetime free credit card",
    "HDFC credit card",
    "SBI credit card",
    "ICICI credit card",
  ],
  authors: [{ name: "CardIntel Research" }],
  openGraph: {
    title: "CardIntel — India's Verified Credit Card Intelligence Platform",
    description:
      "Find your perfect credit card with multi-faceted filtering, transparent fee structures, and field-level official source provenance.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 selection:bg-emerald-500 selection:text-white">
        <CompareProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CompareTray />
        </CompareProvider>
      </body>
    </html>
  );
}
