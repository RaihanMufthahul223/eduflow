"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Target,
  Brain,
  BarChart3,
  Loader2,
} from "lucide-react";
import { Line, Bar } from "react-chartjs-2";
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
} from "chart.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
  Filler
);

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"]; // This could be dynamic based on the data if needed

interface SiswaDashboardProps {
  classGroup: string | null;
  grades: { subject: string; scores: number[] }[];
  avgScore: number;
  prevAvg: number;
  trend: number;
  totalSubjects: number;
  flashcardsDue: number;
  roadmapProgress: number;
  completedRoadmaps: number;
}

export function SiswaDashboard({
  classGroup,
  grades,
  avgScore,
  trend,
  totalSubjects,
  flashcardsDue,
  roadmapProgress,
  completedRoadmaps,
}: SiswaDashboardProps) {
  const router = useRouter();
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode || joinCode.length !== 6) {
      toast.error("Kode kelas harus 6 karakter");
      return;
    }
    
    setIsJoining(true);
    const supabase = createClient();
    const { data, error } = await supabase.rpc("join_class_by_code", { code: joinCode });
    
    if (error) {
      toast.error("Terjadi kesalahan sistem.");
      setIsJoining(false);
      return;
    }
    
    if (data) {
      toast.success("Berhasil bergabung ke kelas!");
      router.refresh(); 
    } else {
      toast.error("Kode kelas tidak valid atau tidak ditemukan.");
      setIsJoining(false);
    }
  };

  const badge = getScoreBadge(avgScore);

  const statsCards = [
    {
      title: "Rata-rata Nilai",
      value: avgScore.toFixed(1),
      trend: `${trend > 0 ? "+" : ""}${trend.toFixed(1)}`,
      trendUp: trend >= 0,
      icon: BarChart3,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Mata Pelajaran",
      value: totalSubjects.toString(),
      trend: "aktif",
      trendUp: true,
      icon: BookOpen,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Flashcard Due",
      value: flashcardsDue.toString(),
      trend: "hari ini",
      trendUp: flashcardsDue === 0, // Green if no flashcards due
      icon: Brain,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Roadmap Progress",
      value: `${roadmapProgress}%`,
      trend: `${completedRoadmaps} selesai`,
      trendUp: true,
      icon: Target,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const lineData = {
    labels: months,
    datasets: grades.map((s, i) => ({
      label: s.subject,
      data: s.scores,
      borderColor: [
        "#6366f1",
        "#06b6d4",
        "#f59e0b",
        "#10b981",
        "#ec4899",
      ][i % 5],
      backgroundColor: [
        "rgba(99,102,241,0.1)",
        "rgba(6,182,212,0.1)",
        "rgba(245,158,11,0.1)",
        "rgba(16,185,129,0.1)",
        "rgba(236,72,153,0.1)",
      ][i % 5],
      tension: 0.4,
      fill: false,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const barData = {
    labels: grades.map((s) => s.subject),
    datasets: [
      {
        label: "Nilai Terbaru",
        data: grades.map((s) => s.scores[s.scores.length - 1] || 0),
        backgroundColor: [
          "rgba(99,102,241,0.8)",
          "rgba(6,182,212,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(16,185,129,0.8)",
          "rgba(236,72,153,0.8)",
        ].slice(0, grades.length),
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "rgb(148, 163, 184)",
          usePointStyle: true,
          pointStyle: "circle",
          padding: 20,
        },
      },
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
  };

  if (!classGroup) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full p-8 bg-card border border-border/50 rounded-3xl shadow-xl text-center space-y-6"
        >
          <div className="mx-auto w-16 h-16 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 text-indigo-500">
            <BookOpen className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Bergabung ke Kelas</h2>
          <p className="text-muted-foreground">
            Kamu belum terdaftar di kelas manapun. Silakan masukkan Kode Kelas (6 Karakter) dari Guru kamu untuk bergabung.
          </p>
          
          <form onSubmit={handleJoinClass} className="space-y-4 pt-4">
            <Input 
              placeholder="Contoh: X7A9K2" 
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              className="text-center text-lg tracking-widest uppercase font-bold h-14 rounded-xl"
              maxLength={6}
            />
            <Button type="submit" size="lg" className="w-full rounded-xl" disabled={isJoining || joinCode.length !== 6}>
              {isJoining ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memproses...</>
              ) : "Gabung Sekarang"}
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
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
              <div className="flex items-center gap-1 text-xs">
                {stat.trendUp ? (
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-amber-500" />
                )}
                <span
                  className={
                    stat.trendUp ? "text-emerald-500" : "text-amber-500"
                  }
                >
                  {stat.trend}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Trend Nilai Terakhir</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Line data={lineData} options={chartOptions} />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  Nilai Terbaru per Mapel
                </CardTitle>
                {grades.length > 0 && <Badge className={badge.color}>{badge.label}</Badge>}
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                {grades.length > 0 ? (
                    <Bar
                    data={barData}
                    options={{
                        ...chartOptions,
                        plugins: { ...chartOptions.plugins, legend: { display: false } },
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

      {/* Recent Grades Table */}
      <motion.div variants={item}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nilai Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">
                      Mata Pelajaran
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      Nilai
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      Status
                    </th>
                    <th className="text-center py-3 px-4 text-muted-foreground font-medium">
                      Trend
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {grades.length > 0 ? grades.map((s) => {
                    const latest = s.scores[s.scores.length - 1] || 0;
                    const prev = s.scores[s.scores.length - 2] || 0;
                    const diff = latest - prev;
                    const b = getScoreBadge(latest);
                    return (
                      <tr
                        key={s.subject}
                        className="border-b border-border/30 last:border-0"
                      >
                        <td className="py-3 px-4 font-medium">{s.subject}</td>
                        <td className="py-3 px-4 text-center font-semibold">
                          {latest}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={b.color}>{b.label}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {s.scores.length > 1 ? (
                              <span
                                className={`inline-flex items-center gap-1 text-xs font-medium ${
                                diff > 0
                                    ? "text-emerald-500"
                                    : diff < 0
                                    ? "text-red-500"
                                    : "text-muted-foreground"
                                }`}
                            >
                                {diff > 0 ? (
                                <TrendingUp className="h-3 w-3" />
                                ) : diff < 0 ? (
                                <TrendingDown className="h-3 w-3" />
                                ) : null}
                                {diff > 0 ? "+" : ""}
                                {diff}
                            </span>
                          ) : (
                              <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  }) : (
                      <tr>
                          <td colSpan={4} className="text-center py-8 text-muted-foreground">
                              Belum ada data nilai
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
