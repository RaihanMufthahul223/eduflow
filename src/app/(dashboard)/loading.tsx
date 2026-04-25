"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="relative"
      >
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary"
          animate={{
            scale: [1, 1.08, 1],
            rotate: [0, 3, -3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <GraduationCap className="h-8 w-8 text-white" />
        </motion.div>
        <motion.div
          className="absolute inset-0 rounded-2xl gradient-primary blur-xl opacity-30"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.15, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
      <div className="text-center">
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}
