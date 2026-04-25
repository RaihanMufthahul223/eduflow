import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Toolbox — EduFlow",
  description: "Akses tools administrasi: generator PDF laporan nilai, QR Code, manajemen jadwal, dan sertifikat pencapaian.",
};

export default function ToolboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
