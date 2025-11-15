import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { APP_NAME } from "@/lib/constants";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: `${APP_NAME} - Human-Verified Leads Marketplace`,
    template: `%s | ${APP_NAME}`,
  },
  description:
    "Connect companies with pre-qualified leads through our network of professional scouts. Fair pricing, verified quality.",
  keywords: [
    "B2B leads",
    "lead generation",
    "qualified leads",
    "business development",
    "sales leads",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
