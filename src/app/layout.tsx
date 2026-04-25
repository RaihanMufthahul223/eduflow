import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "EduFlow — Personal Learning OS",
  description:
    "Platform belajar cerdas yang membantu siswa mengelola proses belajar dan guru mengelola administrasi akademik.",
  keywords: ["education", "learning", "dashboard", "flashcard", "roadmap"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      {children}
      <Toaster position="top-center" richColors />
    </ThemeProvider>
  );
}
