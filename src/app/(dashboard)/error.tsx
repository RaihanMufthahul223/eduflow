"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-xl font-bold">Terjadi Kesalahan</h2>
          <p className="text-sm text-muted-foreground max-w-md">
            Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba lagi
            atau kembali ke dashboard.
          </p>
        </div>
        <div className="flex gap-3 mt-2">
          <Button variant="outline" onClick={reset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Coba Lagi
          </Button>
          <Link href="/dashboard">
            <Button>
              <Home className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
