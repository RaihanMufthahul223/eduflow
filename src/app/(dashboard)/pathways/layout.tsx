import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pathways — EduFlow",
  description: "Jelajahi roadmap belajar interaktif dengan diagram visual yang memandu perjalanan akademik Anda.",
};

export default function PathwaysLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
