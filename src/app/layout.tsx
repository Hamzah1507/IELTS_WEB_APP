import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Vectra Foreign Services - Premium IELTS & Exam Preparation Portal",
  description: "Your ultimate portal for IELTS and other competitive exam preparation. Mock tests, practice material and progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} dashboard-layout`} suppressHydrationWarning>
        <Sidebar />
        <main className="main-content">
          <Navbar />
          <div className="content-area">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
