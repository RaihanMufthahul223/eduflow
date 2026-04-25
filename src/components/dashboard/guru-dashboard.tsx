"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Users, BarChart3, Award, Target, Copy, Check } from "lucide-react";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement,
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getScoreBadge } from "@/lib/utils";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface StudentStat {
  name: string;
  avg: number;
}

interface GuruDashboardProps {
  className: string | null;
  inviteCode: string | null;
  studentsStats: StudentStat[];
}

export function GuruDashboard({ className, inviteCode, studentsStats }: GuruDashboardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (inviteCode) {
      navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      toast.success("Kode kelas disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const totalSiswa = studentsStats.length;
  const classAvg = totalSiswa > 0
    ? studentsStats.reduce((a, s) => a + s.avg, 0) / totalSiswa
    : 0;
  const passCount = studentsStats.filter((s) => s.avg >= 75).length;
  const topStudent = studentsStats.length > 0 
    ? [...studentsStats].sort((a, b) => b.avg - a.avg)[0]
    : null;

  const statsCards = [
    {
      title: "Total Siswa",
      value: totalSiswa.toString(),
      subtitle: "siswa aktif",
      icon: Users,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Rata-rata Kelas",
      value: classAvg.toFixed(1),
      subtitle: classAvg >= 75 ? "Di atas KKM" : totalSiswa > 0 ? "Di bawah KKM" : "-",
      icon: BarChart3,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Lulus KKM",
      value: `${passCount}/${totalSiswa}`,
      subtitle: totalSiswa > 0 ? `${((passCount / totalSiswa) * 100).toFixed(0)}% lulus` : "-",
      icon: Award,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Siswa Terbaik",
      value: topStudent ? topStudent.name.split(" ")[0] : "-",
      subtitle: topStudent ? `Nilai: ${topStudent.avg.toFixed(1)}` : "-",
      icon: Target,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const barData = {
    labels: studentsStats.map((s) => s.name.split(" ")[0]),
    datasets: [
      {
        label: "Rata-rata Nilai",
        data: studentsStats.map((s) => s.avg),
        backgroundColor: studentsStats.map((s) =>
          s.avg >= 85
            ? "rgba(16,185,129,0.8)"
            : s.avg >= 75
            ? "rgba(99,102,241,0.8)"
            : s.avg >= 60
            ? "rgba(245,158,11,0.8)"
            : "rgba(239,68,68,0.8)"
        ),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const donutData = {
    labels: ["Sangat Baik (≥85)", "Baik (75-84)", "Cukup (60-74)", "Perlu Perbaikan (<60)"],
    datasets: [
      {
        data: [
          studentsStats.filter((s) => s.avg >= 85).length,
          studentsStats.filter((s) => s.avg >= 75 && s.avg < 85).length,
          studentsStats.filter((s) => s.avg >= 60 && s.avg < 75).length,
          studentsStats.filter((s) => s.avg < 60).length,
        ],
        backgroundColor: [
          "rgba(16,185,129,0.8)",
          "rgba(99,102,241,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(239,68,68,0.8)",
        ],
        borderWidth: 0,
      },
    ],
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Class Code Widget */}
      <motion.div variants={item}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl gap-4">
          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-100">
              Kelas: {className || "Belum ditentukan"}
            </h3>
            <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mt-1">
              Bagikan kode ini agar siswa bisa bergabung ke kelas Anda.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border border-indigo-100 dark:border-indigo-500/30">
            <span className="text-sm text-muted-foreground font-medium">Kode:</span>
            <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 tracking-wider">
              {inviteCode || "------"}
            </span>
            <button
              onClick={handleCopy}
              disabled={!inviteCode}
              className="ml-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/30 transition-colors"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={item}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {statsCards.map((stat) => (
          <Card key={stat.title} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r ${stat.color}`}
                >
                  <stat.icon className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={item} className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Rata-rata Nilai per Siswa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {studentsStats.length > 0 ? (
                    <Bar
                    data={barData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                        legend: { display: false },
                        },
                        scales: {
                        x: {
                            grid: { color: "rgba(148,163,184,0.1)" },
                            ticks: { color: "rgb(148,163,184)" },
                        },
                        y: {
                            grid: { color: "rgba(148,163,184,0.1)" },
                            ticks: { color: "rgb(148,163,184)" },
                            min: 0,
                            max: 100,
                        },
                        },
                    }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Belum ada data siswa
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Distribusi Nilai</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72 flex items-center justify-center">
                  {studentsStats.length > 0 ? (
                    <Doughnut
                    data={donutData}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                        legend: {
                            position: "bottom",
                            labels: {
                            color: "rgb(148,163,184)",
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 12,
                            font: { size: 11 },
                            },
                        },
                        },
                        cutout: "65%",
                    }}
                    />
                ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        Belum ada data nilai
                    </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Student Rankings */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Peringkat Siswa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Nama Siswa
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      Rata-rata
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentsStats.length > 0 ? [...studentsStats]
                    .sort((a, b) => b.avg - a.avg)
                    .map((s, i) => {
                      const b = getScoreBadge(s.avg);
                      return (
                        <tr
                          key={s.name}
                          className="border-b border-border/30 last:border-0"
                        >
                          <td className="py-3 px-4 text-muted-foreground">
                            {i + 1}
                          </td>
                          <td className="py-3 px-4 font-medium">{s.name}</td>
                          <td className="py-3 px-4 text-center font-semibold">
                            {s.avg.toFixed(1)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={b.color}>{b.label}</Badge>
                          </td>
                        </tr>
                      );
                    }) : (
                        <tr>
                            <td colSpan={4} className="text-center py-8 text-muted-foreground">
                                Belum ada data siswa
                            </td>
                        </tr>
                    )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
