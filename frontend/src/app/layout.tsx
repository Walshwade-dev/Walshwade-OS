import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import Sidebar from "@/components/Sidebar";
import Greeting from "@/components/Greeting";

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
    <html lang="en">
      <body className="antialiased text-lg flex flex-col md:flex-row h-screen overflow-hidden">
        <Providers>
          <Sidebar />
          <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 relative">
            <Greeting />
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
