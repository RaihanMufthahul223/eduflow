"use client";

import { motion } from "framer-motion";
import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  Map,
  Brain,
  Wrench,
  ArrowRight,
  Sparkles,
  ChevronRight,
  Sun,
  Moon,
  Rocket,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";

const features = [
  {
    icon: LayoutDashboard,
    title: "Dashboard Akademik",
    description:
      "Lacak nilai & progress belajar dengan visualisasi chart yang intuitif.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Map,
    title: "Interactive Roadmap",
    description:
      "Peta belajar visual interaktif yang memandu setiap langkah perjalanan akademik.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: Brain,
    title: "Smart Flashcards",
    description:
      "Sistem hafalan cerdas dengan algoritma Spaced Repetition untuk hasil maksimal.",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Wrench,
    title: "Educator Toolbox",
    description:
      "Generator PDF, QR Code, dan tools administrasi yang menghemat waktu guru.",
    color: "from-emerald-500 to-teal-500",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const developers = [
  {
    name: "Raihan Mufthahul",
    role: "Founder & Lead Developer",
    image: "/img/raihan.jpeg",
    gradient: "from-blue-500 to-indigo-500",
  },
  {
    name: "Andhika Putra",
    role: "UI/UX Designer",
    image: "/img/andhika.jpeg",
    gradient: "from-violet-500 to-purple-500",
  },
  {
    name: "Satria Salam",
    role: "Frontend Engineer",
    image: "/img/satria.jpeg",
    gradient: "from-amber-500 to-orange-500",
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 via-white to-slate-50 dark:from-slate-950 dark:via-indigo-950/40 dark:to-slate-950 transition-colors duration-500" />
        <motion.div
          animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -40, 0], y: [0, 50, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-500/10 dark:bg-violet-500/15 rounded-full blur-3xl"
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50 dark:border-white/5 transition-colors duration-500">
        <div className="mx-auto max-w-7xl px-6 backdrop-blur-xl bg-white/70 dark:bg-slate-950/50 transition-colors duration-500">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="relative h-9 w-9 overflow-hidden rounded-xl shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Image src="/img/logo.jpeg" alt="EduFlow Logo" fill className="object-cover" />
              </div>
              <span className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-500">
                Edu<span className="gradient-text">Flow</span>
              </span>
            </Link>
            <div className="flex items-center gap-2 md:gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              <Link href="/login" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
                  Masuk
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="shadow-lg shadow-indigo-500/20">
                  Mulai Sekarang
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            className="text-center mt-8 relative"
          >
            {/* Decorative Floating Icons */}
            <motion.div 
              animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} 
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-0 left-4 md:left-20 text-indigo-500/30 dark:text-indigo-400/20 hidden md:block"
            >
              <Brain className="w-16 h-16" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, 25, 0], rotate: [0, -15, 10, 0] }} 
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute top-10 right-4 md:right-20 text-violet-500/30 dark:text-violet-400/20 hidden md:block"
            >
              <Rocket className="w-12 h-12" />
            </motion.div>
            <motion.div 
              animate={{ y: [0, -15, 0], scale: [1, 1.1, 1] }} 
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
              className="absolute bottom-10 left-10 md:left-40 text-amber-500/30 dark:text-amber-400/20 hidden md:block"
            >
              <BookOpen className="w-10 h-10" />
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: -20 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300 } },
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-sm font-bold mb-8 shadow-sm transition-colors duration-500"
            >
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </motion.div>
              Transformasi Pendidikan Digital
            </motion.div>

            <motion.h1 
              variants={{
                hidden: { opacity: 0, scale: 0.9 },
                visible: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 200 } },
              }}
              className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white leading-tight mb-6 transition-colors duration-500"
            >
              Belajar Lebih{" "}
              <span className="gradient-text">Cerdas</span>
              <br />
              Mengajar Lebih{" "}
              <span className="gradient-text">Efisien</span>
            </motion.h1>

            <motion.p 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm transition-colors duration-500"
            >
              Platform modern yang mendigitalisasi proses pendidikan. Dilengkapi sistem evaluasi cerdas, Spaced Repetition, dan *Roadmap* Pembelajaran Interaktif.
            </motion.p>

            <motion.div 
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link href="/register">
                <Button size="xl" className="group shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] hover:-translate-y-1 transition-all">
                  Mulai Transformasi Sekarang
                  <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="xl" className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-500">
                  <BookOpen className="mr-2 h-5 w-5 opacity-70" />
                  Punya Akun EduFlow
                </Button>
              </Link>
            </motion.div>
          </motion.div>

    
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white mb-6 transition-colors duration-500">
              Semua yang Kamu Butuhkan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg max-w-xl mx-auto transition-colors duration-500">
              Fitur cerdas untuk siswa dan guru yang terkemas dalam satu platform interaktif.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                className="group relative rounded-2xl border border-slate-200 dark:border-white/5 bg-white/70 dark:bg-slate-900/50 p-8 hover:shadow-lg dark:hover:border-white/10 transition-all duration-300"
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} mb-6 shadow-lg shadow-${feature.color.split("-")[1]}-500/20`}
                >
                  <feature.icon className="h-7 w-7 text-white drop-shadow-sm" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3 transition-colors duration-500">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-medium transition-colors duration-500">
                  {feature.description}
                </p>
                <div className="absolute inset-0 border border-indigo-500/0 group-hover:border-indigo-500/20 dark:border-white/0 dark:group-hover:border-white/10 rounded-2xl transition-colors duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Role Section */}
      <section className="py-24 px-6 bg-slate-100/50 dark:bg-slate-900/20 transition-colors duration-500 rounded-3xl mx-4 lg:mx-10 mb-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 gap-10"
          >
            {/* Siswa Card */}
            <motion.div
              whileHover={{ y: -12, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="relative rounded-3xl border border-indigo-200 dark:border-indigo-500/20 bg-white dark:bg-slate-900/50 p-10 shadow-xl shadow-indigo-100 dark:shadow-none transition-colors duration-500"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-sm font-bold mb-8 transition-colors duration-500">
                <BookOpen className="h-4 w-4" />
                UNTUK SISWA
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors duration-500">
                Kelola Perjalanan Belajarmu
              </h3>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400 transition-colors duration-500 font-medium tracking-wide">
                {[
                  "Lihat progres & estimasi nilai di dashboard",
                  "Ikuti roadmap belajar interaktif",
                  "Hafal materi dengan Spaced Repetition",
                  "Raih kompetensi dengan mudah",
                ].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + idx * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Guru Card */}
            <motion.div
              whileHover={{ y: -12, scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              className="relative rounded-3xl border border-violet-200 dark:border-violet-500/20 bg-white dark:bg-slate-900/50 p-10 shadow-xl shadow-violet-100 dark:shadow-none transition-colors duration-500"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-sm font-bold mb-8 transition-colors duration-500">
                <GraduationCap className="h-4 w-4" />
                UNTUK GURU
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6 transition-colors duration-500">
                Lacak Kelas Lebih Efisien
              </h3>
              <ul className="space-y-4 text-slate-600 dark:text-slate-400 transition-colors duration-500 font-medium tracking-wide">
                {[
                  "Pantau statistik rata-rata progres murid",
                  "Buat & bagikan kurikulum / roadmap belajar",
                  "Distribusi deck Smart Flashcard",
                  "Generate form evaluasi & PDF tools",
                ].map((item, idx) => (
                  <motion.li 
                    key={idx} 
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.1 }}
                    className="flex items-center gap-4"
                  >
                    <div className="h-2 w-2 rounded-full bg-violet-500 shrink-0 shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                    {item}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6">
        <div className="mx-auto max-w-4xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl gradient-primary p-16 relative overflow-hidden shadow-2xl shadow-indigo-500/30"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDJWMGgtMnYzNHptMC0zNGgydjM0aC0yVjB6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            <div className="relative z-10 w-full flex flex-col items-center">
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
                Siap Memulai Perjalanan Belajar?
              </h2>
              <p className="text-indigo-100 font-medium text-lg md:text-xl mb-10 max-w-xl">
                Bergabung hari ini dan rasakan pengalaman edukasi serba digital yang paling mutakhir.
              </p>
              <Link href="/register">
                <Button
                  size="xl"
                  className="bg-white text-indigo-100 hover:bg-slate-50 hover:text-indigo-800 shadow-xl shadow-black/10 rounded-full px-8 py-6 text-lg font-bold"
                >
                  Daftar Akun Gratis Sekarang
                  <ArrowRight className="ml-3 h-6 w-6" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Developer Section */}
      <section className="pt-20 pb-16 px-6 border-t border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-950/30 transition-colors duration-500">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white mb-4 transition-colors duration-500">
              Dikembangkan Oleh
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-lg font-medium mx-auto transition-colors duration-500">
              Tim kreatif di balik terwujudnya aplikasi ini.
            </p>
          </motion.div>

          <motion.div
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            {developers.map((dev) => (
              <motion.div
                key={dev.name}
                variants={item}
                className="group relative rounded-3xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 p-8 text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-md dark:shadow-none"
              >
                {/* Glow behind card */}
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b ${dev.gradient} opacity-0 group-hover:opacity-10 blur-3xl transition-opacity duration-500`} />
                
                <div className="relative mb-6 inline-block">
                  <div className={`absolute inset-0 bg-gradient-to-br ${dev.gradient} opacity-20 blur-xl rounded-full group-hover:opacity-40 transition-opacity duration-300`} />
                  <img
                    src={dev.image}
                    alt={dev.name}
                    className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-800 shadow-xl group-hover:border-indigo-100 dark:group-hover:border-white/20 relative z-10 bg-slate-100 dark:bg-slate-800 object-cover transition-colors"
                  />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-purple-600 dark:group-hover:from-white dark:group-hover:to-slate-400 transition-all">
                  {dev.name}
                </h3>
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8 bg-slate-100 dark:bg-slate-950/50 inline-block px-4 py-1.5 rounded-full border border-slate-200 dark:border-white/5 transition-colors duration-500">
                  {dev.role}
                </p>

                <div className="flex items-center justify-center gap-4">
                  {/* Facebook Icon */}
                  <a href="#" className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#1877F2] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                    </svg>
                  </a>
                  {/* Instagram Icon */}
                  <a href="#" className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#E4405F] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-10 px-6 bg-white dark:bg-slate-950 transition-colors duration-500">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="relative h-8 w-8 overflow-hidden rounded-xl shadow-sm">
              <Image src="/img/logo.jpeg" alt="EduFlow Logo" fill className="object-cover" />
            </div>
            <span className="text-base font-bold text-slate-900 dark:text-white transition-colors">EduFlow</span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">
            © 2026 EduFlow. Personal Learning OS.
          </p>
        </div>
      </footer>
    </div>
  );
}
