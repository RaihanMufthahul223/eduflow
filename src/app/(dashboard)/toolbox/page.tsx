"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Wrench,
  FileText,
  QrCode,
  Calendar,
  Download,
  Award,
  Loader2,
  Plus,
  Trash2,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { cn } from "@/lib/utils";

type ActiveTool = null | "pdf" | "qr" | "schedule" | "certificate";

export default function ToolboxPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (data) setProfile(data);
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const isGuru = profile?.role === "guru";

  const guruTools = [
    {
      id: "pdf" as const,
      title: "Laporan Nilai PDF",
      description: "Generate laporan nilai siswa dalam format PDF",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "qr" as const,
      title: "QR Code Generator",
      description: "Buat QR Code untuk link materi atau jadwal",
      icon: QrCode,
      color: "from-violet-500 to-purple-500",
    },
    {
      id: "schedule" as const,
      title: "Jadwal Kelas",
      description: "Kelola jadwal pelajaran dan kegiatan",
      icon: Calendar,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const siswaTools = [
    {
      id: "certificate" as const,
      title: "Sertifikat Pencapaian",
      description: "Download sertifikat untuk pencapaian yang sudah diraih",
      icon: Award,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const tools = isGuru ? guruTools : siswaTools;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Toolbox
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isGuru
            ? "Tools administrasi untuk membantu pekerjaan Anda."
            : "Download sertifikat pencapaianmu."}
        </p>
      </div>

      {/* Tool Cards */}
      {!activeTool && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn(
            "grid gap-4",
            isGuru ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 max-w-md"
          )}
        >
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:border-primary/30 transition-all group"
                onClick={() => setActiveTool(tool.id)}
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} mb-4`}
                  >
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {tool.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Tool Views */}
      {activeTool === "pdf" && (
        <PdfTool onBack={() => setActiveTool(null)} />
      )}
      {activeTool === "qr" && (
        <QrTool onBack={() => setActiveTool(null)} />
      )}
      {activeTool === "schedule" && (
        <ScheduleTool onBack={() => setActiveTool(null)} />
      )}
      {activeTool === "certificate" && (
        <CertificateTool
          profile={profile}
          onBack={() => setActiveTool(null)}
        />
      )}
    </div>
  );
}

// PDF Report Generator
function PdfTool({ onBack }: { onBack: () => void }) {
  const [generating, setGenerating] = useState(false);
  const [className, setClassName] = useState("XII-IPA-1");
  const [semester, setSemester] = useState("Genap 2025/2026");

  const generatePdf = async () => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Header
      doc.setFontSize(18);
      doc.setFont("helvetica", "bold");
      doc.text("LAPORAN NILAI SISWA", 105, 20, { align: "center" });

      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.text(`Kelas: ${className}`, 20, 35);
      doc.text(`Semester: ${semester}`, 20, 42);
      doc.text(`Tanggal: ${new Date().toLocaleDateString("id-ID")}`, 20, 49);

      // Line
      doc.setLineWidth(0.5);
      doc.line(20, 55, 190, 55);

      // Table Header
      const startY = 65;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setFillColor(99, 102, 241);
      doc.rect(20, startY - 6, 170, 10, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("No", 25, startY);
      doc.text("Nama Siswa", 35, startY);
      doc.text("MTK", 95, startY);
      doc.text("FIS", 110, startY);
      doc.text("KIM", 125, startY);
      doc.text("BIO", 140, startY);
      doc.text("B.IND", 155, startY);
      doc.text("Rata²", 172, startY);

      // Table Body
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");

      const students = [
        { name: "Ahmad Rifki", scores: [85, 78, 90, 88, 82] },
        { name: "Siti Nurhaliza", scores: [92, 88, 95, 90, 87] },
        { name: "Budi Santoso", scores: [72, 68, 75, 80, 78] },
        { name: "Dewi Lestari", scores: [88, 85, 90, 92, 86] },
        { name: "Eko Prasetyo", scores: [65, 70, 72, 68, 75] },
        { name: "Fitri Handayani", scores: [90, 88, 93, 95, 88] },
        { name: "Gilang Ramadhan", scores: [78, 75, 80, 72, 82] },
        { name: "Hana Putri", scores: [85, 82, 88, 86, 90] },
      ];

      students.forEach((s, i) => {
        const y = startY + 12 + i * 8;
        const avg = s.scores.reduce((a, b) => a + b, 0) / s.scores.length;

        if (i % 2 === 0) {
          doc.setFillColor(245, 245, 255);
          doc.rect(20, y - 5, 170, 8, "F");
        }

        doc.text(`${i + 1}`, 25, y);
        doc.text(s.name, 35, y);
        s.scores.forEach((score, j) => {
          doc.text(`${score}`, 95 + j * 15, y);
        });
        doc.setFont("helvetica", "bold");
        doc.text(avg.toFixed(1), 172, y);
        doc.setFont("helvetica", "normal");
      });

      // Footer
      const footerY = startY + 12 + students.length * 8 + 15;
      doc.setFontSize(9);
      doc.setTextColor(128, 128, 128);
      doc.text("Generated by EduFlow — Personal Learning OS", 105, footerY, {
        align: "center",
      });

      doc.save(`Laporan_Nilai_${className}_${semester.replace(/\//g, "-")}.pdf`);
    } catch (err) {
      console.error("PDF generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Kembali
        </Button>
        <h2 className="text-xl font-bold">Laporan Nilai PDF</h2>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Input
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="XII-IPA-1"
              />
            </div>
            <div className="space-y-2">
              <Label>Semester</Label>
              <Input
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="Genap 2025/2026"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            PDF akan berisi data nilai demo. Hubungkan ke Supabase untuk menggunakan data real.
          </p>

          <Button onClick={generatePdf} disabled={generating} size="lg">
            {generating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Generate & Download PDF
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// QR Code Generator
function QrTool({ onBack }: { onBack: () => void }) {
  const [text, setText] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);

  const generateQR = async () => {
    if (!text.trim()) return;
    setGenerating(true);
    try {
      const QRCode = (await import("qrcode")).default;
      const dataUrl = await QRCode.toDataURL(text, {
        width: 300,
        margin: 2,
        color: {
          dark: "#6366f1",
          light: "#ffffff",
        },
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error("QR generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qrcode-eduflow.png";
    link.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Kembali
        </Button>
        <h2 className="text-xl font-bold">QR Code Generator</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label>Teks atau URL</Label>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Masukkan URL atau teks yang ingin dijadikan QR Code..."
                className="min-h-[120px]"
              />
            </div>
            <Button onClick={generateQR} disabled={generating || !text.trim()}>
              {generating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <QrCode className="mr-2 h-4 w-4" />
              )}
              Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex flex-col items-center justify-center min-h-[300px]">
            {qrDataUrl ? (
              <div className="text-center space-y-4">
                <div className="inline-block p-4 bg-white rounded-2xl shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-64 h-64"
                  />
                </div>
                <Button onClick={downloadQR} variant="outline">
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <QrCode className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>QR Code akan muncul di sini</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}

// Schedule Manager
function ScheduleTool({ onBack }: { onBack: () => void }) {
  const [schedules, setSchedules] = useState([
    {
      id: "1",
      title: "Matematika",
      date: "2026-04-21",
      time_start: "07:30",
      time_end: "09:00",
      class_group: "XII-IPA-1",
    },
    {
      id: "2",
      title: "Fisika",
      date: "2026-04-21",
      time_start: "09:15",
      time_end: "10:45",
      class_group: "XII-IPA-1",
    },
    {
      id: "3",
      title: "Kimia",
      date: "2026-04-22",
      time_start: "07:30",
      time_end: "09:00",
      class_group: "XII-IPA-1",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    date: "",
    time_start: "",
    time_end: "",
    class_group: "XII-IPA-1",
  });

  const handleAdd = () => {
    if (!form.title || !form.date) return;
    setSchedules((prev) => [
      ...prev,
      { ...form, id: Date.now().toString() },
    ]);
    setForm({
      title: "",
      date: "",
      time_start: "",
      time_end: "",
      class_group: "XII-IPA-1",
    });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>
            ← Kembali
          </Button>
          <h2 className="text-xl font-bold">Jadwal Kelas</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
        >
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Mata Pelajaran</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Matematika"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tanggal</Label>
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, date: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mulai</Label>
                  <Input
                    type="time"
                    value={form.time_start}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time_start: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Selesai</Label>
                  <Input
                    type="time"
                    value={form.time_end}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, time_end: e.target.value }))
                    }
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAdd} className="w-full">
                    Simpan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="space-y-3">
        {schedules.map((schedule) => (
          <Card key={schedule.id}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{schedule.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(schedule.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • {schedule.time_start} - {schedule.time_end}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{schedule.class_group}</Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(schedule.id)}
                  className="text-muted-foreground hover:text-red-400"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </motion.div>
  );
}

// Certificate Generator (Siswa)
function CertificateTool({
  profile,
  onBack,
}: {
  profile: Profile | null;
  onBack: () => void;
}) {
  const [generating, setGenerating] = useState(false);

  const achievements = [
    {
      title: "Menyelesaikan Roadmap Matematika",
      date: "15 April 2026",
      type: "Roadmap",
    },
    {
      title: "Streak 30 Hari Flashcard",
      date: "10 April 2026",
      type: "Konsistensi",
    },
    {
      title: "Nilai Rata-rata ≥90",
      date: "5 April 2026",
      type: "Akademik",
    },
  ];

  const downloadCertificate = async (achievement: typeof achievements[0]) => {
    setGenerating(true);
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF({ orientation: "landscape" });

      // Background
      doc.setFillColor(30, 27, 75); // indigo-950
      doc.rect(0, 0, 297, 210, "F");

      // Decorative border
      doc.setDrawColor(99, 102, 241); // indigo-500
      doc.setLineWidth(2);
      doc.rect(15, 15, 267, 180);
      doc.setLineWidth(0.5);
      doc.rect(18, 18, 261, 174);

      // Title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(32);
      doc.setTextColor(255, 255, 255);
      doc.text("SERTIFIKAT PENCAPAIAN", 148.5, 50, { align: "center" });

      // Decorative line
      doc.setDrawColor(139, 92, 246); // violet-500
      doc.setLineWidth(1);
      doc.line(80, 58, 217, 58);

      // "Awarded to"
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(167, 139, 250); // violet-300
      doc.text("Diberikan kepada", 148.5, 75, { align: "center" });

      // Name
      doc.setFont("helvetica", "bold");
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text(profile?.full_name || "Nama Siswa", 148.5, 95, {
        align: "center",
      });

      // Achievement
      doc.setFont("helvetica", "normal");
      doc.setFontSize(14);
      doc.setTextColor(167, 139, 250);
      doc.text("atas pencapaian:", 148.5, 115, { align: "center" });

      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(achievement.title, 148.5, 130, { align: "center" });

      // Date
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text(`Tanggal: ${achievement.date}`, 148.5, 150, {
        align: "center",
      });

      // Footer
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text("EduFlow — Personal Learning OS", 148.5, 180, {
        align: "center",
      });

      doc.save(
        `Sertifikat_${achievement.title.replace(/\s+/g, "_")}.pdf`
      );
    } catch (err) {
      console.error("Certificate generation error:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>
          ← Kembali
        </Button>
        <h2 className="text-xl font-bold">Sertifikat Pencapaian</h2>
      </div>

      <div className="space-y-4">
        {achievements.map((achievement, index) => (
          <motion.div
            key={achievement.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
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
                      <span className="text-xs text-muted-foreground">
                        {achievement.date}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => downloadCertificate(achievement)}
                  disabled={generating}
                >
                  {generating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
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
