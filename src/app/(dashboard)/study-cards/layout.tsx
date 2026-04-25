import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Study Cards — EduFlow",
  description: "Berlatih menghafal dengan flashcard cerdas berbasis algoritma Spaced Repetition untuk hasil belajar maksimal.",
};

export default function StudyCardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
