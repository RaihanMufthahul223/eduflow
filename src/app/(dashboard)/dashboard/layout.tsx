import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — EduFlow",
  description: "Lihat progres belajar dan statistik akademik Anda di dashboard EduFlow.",
};

export default function DashboardPageLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
