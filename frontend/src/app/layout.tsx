import type { Metadata } from "next";
import { Rajdhani, Orbitron } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/Sidebar";

const rajdhani = Rajdhani({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rajdhani'
});

const orbitron = Orbitron({
  subsets: ["latin"],
  weight: ['400', '700', '900'],
  variable: '--font-orbitron'
});

export const metadata: Metadata = {
  title: "Project Wade OS",
  description: "Sci-Fi Planning and scheduling system",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${rajdhani.variable} ${orbitron.variable}`}>
      <body className="antialiased text-lg flex flex-col md:flex-row h-screen overflow-hidden">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
