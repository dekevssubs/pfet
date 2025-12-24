import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PFET - Personal Finance and Expense Tracker",
    template: "%s | PFET",
  },
  description: "Track your finances, manage expenses, set budgets, and achieve your financial goals with PFET - the personal finance tracker designed for Kenyan salary workers.",
  keywords: ["finance", "expense tracker", "budget", "PAYE", "Kenya", "salary", "personal finance"],
  authors: [{ name: "Kevin Kelly" }],
  creator: "Kevin Kelly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
