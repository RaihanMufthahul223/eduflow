"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Wrench, FileText, QrCode, Calendar, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Profile, Subject, Schedule } from "@/types/database";
import type { StudentWithNisn, GradeWithDetails } from "./page";
import { PdfTool } from "./tools/PdfTool";
import { QrTool } from "./tools/QrTool";
import { ScheduleTool } from "./tools/ScheduleTool";
import { GradeInputTool } from "./tools/GradeInputTool";
import { CertificateTool } from "./tools/CertificateTool";

type ActiveTool = null | "grades" | "pdf" | "qr" | "schedule" | "certificate";

interface ToolboxClientProps {
  profile: Profile;
  subjects: Subject[];
  students: StudentWithNisn[];
  grades: GradeWithDetails[];
  schedules: Schedule[];
  myClass: { name: string; invite_code: string } | null;
}

export function ToolboxClient({
  profile,
  subjects,
  students,
  grades: initialGrades,
  schedules: initialSchedules,
  myClass,
}: ToolboxClientProps) {
  const [activeTool, setActiveTool] = useState<ActiveTool>(null);
  const [grades, setGrades] = useState<GradeWithDetails[]>(initialGrades);
  const [schedules, setSchedules] = useState<Schedule[]>(initialSchedules);

  const isGuru = profile.role === "guru";

  const guruTools = [
    { id: "grades" as const, title: "Input Nilai", description: "Input nilai siswa secara manual atau import dari CSV/Excel", icon: FileText, color: "from-indigo-500 to-violet-500" },
    { id: "pdf" as const, title: "Laporan Nilai PDF", description: "Generate laporan nilai siswa dalam format PDF", icon: FileText, color: "from-blue-500 to-cyan-500" },
    { id: "qr" as const, title: "QR Code Generator", description: "Buat QR Code untuk link materi atau jadwal", icon: QrCode, color: "from-violet-500 to-purple-500" },
    { id: "schedule" as const, title: "Jadwal Kelas", description: "Kelola jadwal pelajaran dan kegiatan", icon: Calendar, color: "from-emerald-500 to-teal-500" },
  ];

  const siswaTools = [
    { id: "certificate" as const, title: "Sertifikat Pencapaian", description: "Download sertifikat untuk pencapaian yang sudah diraih", icon: Award, color: "from-amber-500 to-orange-500" },
  ];

  const tools = isGuru ? guruTools : siswaTools;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Wrench className="h-6 w-6 text-primary" />
          Toolbox
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          {isGuru ? "Tools administrasi untuk membantu pekerjaan Anda." : "Download sertifikat pencapaianmu."}
        </p>
      </div>

      {!activeTool && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn("grid gap-4", isGuru ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 max-w-md")}
        >
          {tools.map((tool, index) => (
            <motion.div key={tool.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className="cursor-pointer hover:border-primary/30 transition-all group" onClick={() => setActiveTool(tool.id)}>
                <CardContent className="p-6">
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-r ${tool.color} mb-4`}>
                    <tool.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tool.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {activeTool === "grades" && (
        <GradeInputTool
          onBack={() => setActiveTool(null)}
          subjects={subjects}
          students={students}
          grades={grades}
          onGradesChange={setGrades}
          className={myClass?.name ?? profile.class_group ?? ""}
        />
      )}
      {activeTool === "pdf" && (
        <PdfTool onBack={() => setActiveTool(null)} grades={grades} subjects={subjects} students={students} className={myClass?.name ?? profile.class_group ?? ""} />
      )}
      {activeTool === "qr" && <QrTool onBack={() => setActiveTool(null)} />}
      {activeTool === "schedule" && (
        <ScheduleTool onBack={() => setActiveTool(null)} schedules={schedules} onSchedulesChange={setSchedules} teacherId={profile.id} classGroup={myClass?.name ?? profile.class_group ?? ""} />
      )}
      {activeTool === "certificate" && <CertificateTool profile={profile} onBack={() => setActiveTool(null)} />}
    </div>
  );
}
