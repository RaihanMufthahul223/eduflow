"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  BookOpen,
  Target,
  Brain,
  BarChart3,
  Users,
  Award,
} from "lucide-react";
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
import { Line, Bar, Doughnut } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Grade } from "@/types/database";
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

// Demo data for when Supabase is not connected
const demoGradesSiswa = [
  { subject: "Matematika", scores: [78, 82, 85, 80, 88, 92] },
  { subject: "Fisika", scores: [70, 75, 72, 80, 78, 85] },
  { subject: "Kimia", scores: [85, 88, 82, 90, 87, 93] },
  { subject: "Biologi", scores: [90, 88, 92, 85, 94, 91] },
  { subject: "B. Indonesia", scores: [82, 85, 80, 88, 86, 90] },
];

const demoGradesGuru = [
  { name: "Ahmad Rifki", avg: 87.5 },
  { name: "Siti Nurhaliza", avg: 92.3 },
  { name: "Budi Santoso", avg: 75.8 },
  { name: "Dewi Lestari", avg: 88.1 },
  { name: "Eko Prasetyo", avg: 69.5 },
  { name: "Fitri Handayani", avg: 91.0 },
  { name: "Gilang Ramadhan", avg: 78.2 },
  { name: "Hana Putri", avg: 85.6 },
];

const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun"];

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
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
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80 bg-muted animate-pulse rounded-2xl" />
          <div className="h-80 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  const isGuru = profile?.role === "guru";

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Halo, {profile?.full_name?.split(" ")[0] || "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          {isGuru
            ? "Pantau statistik dan progres kelas Anda."
            : "Lihat progres belajar dan estimasi nilaimu."}
        </p>
      </div>

      {isGuru ? <GuruDashboard /> : <SiswaDashboard />}
    </div>
  );
}

function SiswaDashboard() {
  const avgScore =
    demoGradesSiswa.reduce(
      (acc, s) => acc + s.scores[s.scores.length - 1],
      0
    ) / demoGradesSiswa.length;
  const prevAvg =
    demoGradesSiswa.reduce(
      (acc, s) => acc + s.scores[s.scores.length - 2],
      0
    ) / demoGradesSiswa.length;
  const trend = avgScore - prevAvg;
  const badge = getScoreBadge(avgScore);

  const statsCards = [
    {
      title: "Rata-rata Nilai",
      value: avgScore.toFixed(1),
      trend: `${trend > 0 ? "+" : ""}${trend.toFixed(1)}`,
      trendUp: trend > 0,
      icon: BarChart3,
      color: "from-indigo-500 to-violet-500",
    },
    {
      title: "Mata Pelajaran",
      value: demoGradesSiswa.length.toString(),
      trend: "aktif",
      trendUp: true,
      icon: BookOpen,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Flashcard Due",
      value: "18",
      trend: "hari ini",
      trendUp: false,
      icon: Brain,
      color: "from-amber-500 to-orange-500",
    },
    {
      title: "Roadmap Progress",
      value: "68%",
      trend: "3 selesai",
      trendUp: true,
      icon: Target,
      color: "from-emerald-500 to-teal-500",
    },
  ];

  const lineData = {
    labels: months,
    datasets: demoGradesSiswa.map((s, i) => ({
      label: s.subject,
      data: s.scores,
      borderColor: [
        "#6366f1",
        "#06b6d4",
        "#f59e0b",
        "#10b981",
        "#ec4899",
      ][i],
      backgroundColor: [
        "rgba(99,102,241,0.1)",
        "rgba(6,182,212,0.1)",
        "rgba(245,158,11,0.1)",
        "rgba(16,185,129,0.1)",
        "rgba(236,72,153,0.1)",
      ][i],
      tension: 0.4,
      fill: false,
      borderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  };

  const barData = {
    labels: demoGradesSiswa.map((s) => s.subject),
    datasets: [
      {
        label: "Nilai Terbaru",
        data: demoGradesSiswa.map((s) => s.scores[s.scores.length - 1]),
        backgroundColor: [
          "rgba(99,102,241,0.8)",
          "rgba(6,182,212,0.8)",
          "rgba(245,158,11,0.8)",
          "rgba(16,185,129,0.8)",
          "rgba(236,72,153,0.8)",
        ],
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
        min: 50,
        max: 100,
      },
    },
  };

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
              <CardTitle className="text-base">Trend Nilai per Bulan</CardTitle>
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
                <Badge className={badge.color}>{badge.label}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <Bar
                  data={barData}
                  options={{
                    ...chartOptions,
                    plugins: { ...chartOptions.plugins, legend: { display: false } },
                  }}
                />
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
                  {demoGradesSiswa.map((s) => {
                    const latest = s.scores[s.scores.length - 1];
                    const prev = s.scores[s.scores.length - 2];
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
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

function GuruDashboard() {
  const totalSiswa = demoGradesGuru.length;
  const classAvg =
    demoGradesGuru.reduce((a, s) => a + s.avg, 0) / totalSiswa;
  const passCount = demoGradesGuru.filter((s) => s.avg >= 75).length;
  const topStudent = demoGradesGuru.sort((a, b) => b.avg - a.avg)[0];

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
      subtitle: classAvg >= 75 ? "Di atas KKM" : "Di bawah KKM",
      icon: BarChart3,
      color: "from-cyan-500 to-blue-500",
    },
    {
      title: "Lulus KKM",
      value: `${passCount}/${totalSiswa}`,
      subtitle: `${((passCount / totalSiswa) * 100).toFixed(0)}% lulus`,
      icon: Award,
      color: "from-emerald-500 to-teal-500",
    },
    {
      title: "Siswa Terbaik",
      value: topStudent.name.split(" ")[0],
      subtitle: `Nilai: ${topStudent.avg}`,
      icon: Target,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const barData = {
    labels: demoGradesGuru.map((s) => s.name.split(" ")[0]),
    datasets: [
      {
        label: "Rata-rata Nilai",
        data: demoGradesGuru.map((s) => s.avg),
        backgroundColor: demoGradesGuru.map((s) =>
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
          demoGradesGuru.filter((s) => s.avg >= 85).length,
          demoGradesGuru.filter((s) => s.avg >= 75 && s.avg < 85).length,
          demoGradesGuru.filter((s) => s.avg >= 60 && s.avg < 75).length,
          demoGradesGuru.filter((s) => s.avg < 60).length,
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
                  {[...demoGradesGuru]
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
                            {s.avg}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge className={b.color}>{b.label}</Badge>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
