"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Download, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { Profile } from "@/types/database";

interface CertificateToolProps {
  profile: Profile | null;
  onBack: () => void;
}

const ACHIEVEMENTS = [
  { title: "Menyelesaikan Roadmap Matematika", date: "15 April 2026", type: "Roadmap" },
  { title: "Streak 30 Hari Flashcard", date: "10 April 2026", type: "Konsistensi" },
  { title: "Nilai Rata-rata ≥90", date: "5 April 2026", type: "Akademik" },
];

export function CertificateTool({ profile, onBack }: CertificateToolProps) {
  const [generating, setGenerating] = useState<string | null>(null);

  const downloadCertificate = async (achievement: typeof ACHIEVEMENTS[0]) => {
    setGenerating(achievement.title);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });

      doc.setFillColor(30, 27, 75);
      doc.rect(0, 0, 297, 210, "F");
      doc.setDrawColor(99, 102, 241);
      doc.setLineWidth(2);
      doc.rect(15, 15, 267, 180);
      doc.setLineWidth(0.5);
      doc.rect(18, 18, 261, 174);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.text("SERTIFIKAT PENCAPAIAN", 148.5, 50, { align: "center" });

      doc.setDrawColor(139, 92, 246);
      doc.setLineWidth(1);
      doc.line(80, 58, 217, 58);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(167, 139, 250);
      doc.text("Diberikan kepada", 148.5, 75, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text(profile?.full_name || "Nama Siswa", 148.5, 95, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(167, 139, 250);
      doc.text("atas pencapaian:", 148.5, 115, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(achievement.title, 148.5, 130, { align: "center" });

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184);
      doc.text(`Tanggal: ${achievement.date}`, 148.5, 150, { align: "center" });

      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("EduFlow — Personal Learning OS", 148.5, 180, { align: "center" });

      doc.save(`Sertifikat_${achievement.title.replace(/\s+/g, "_")}.pdf`);
    } catch (err) {
      console.error("Certificate generation error:", err);
    } finally {
      setGenerating(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>← Kembali</Button>
        <h2 className="text-xl font-bold">Sertifikat Pencapaian</h2>
      </div>
      <div className="space-y-4">
        {ACHIEVEMENTS.map((achievement, index) => (
          <motion.div key={achievement.title} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Card>
              <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-orange-500">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{achievement.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{achievement.type}</Badge>
                      <span className="text-xs text-muted-foreground">{achievement.date}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" onClick={() => downloadCertificate(achievement)} disabled={generating === achievement.title}>
                  {generating === achievement.title ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                  Download
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
