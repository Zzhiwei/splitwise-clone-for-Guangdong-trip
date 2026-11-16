import type { Metadata } from "next";
import { Inter, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";

// Inter / IBM Plex Sans stand in for BinanceNova / BinancePlex (design.md font substitutes).
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const plex = IBM_Plex_Sans({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-num" });

export const metadata: Metadata = {
  title: "Splitwize",
  description: "Vietnam trip expense splitter",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${plex.variable} font-sans bg-canvas text-body min-h-screen`}>
        <Nav />
        <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
