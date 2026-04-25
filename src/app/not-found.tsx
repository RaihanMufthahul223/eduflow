import Link from "next/link";
import { GraduationCap, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 px-6 max-w-md">
        {/* Animated 404 */}
        <div className="relative inline-block">
          <p className="text-[120px] font-black text-muted/30 leading-none select-none">
            404
          </p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary shadow-lg shadow-indigo-500/20">
              <Search className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Halaman Tidak Ditemukan</h1>
          <p className="text-muted-foreground">
            Maaf, halaman yang kamu cari tidak ada atau sudah dipindahkan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-medium shadow-lg shadow-indigo-500/20 hover:opacity-90 transition-opacity"
          >
            <GraduationCap className="h-4 w-4" />
            Ke Beranda
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border text-foreground font-medium hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
