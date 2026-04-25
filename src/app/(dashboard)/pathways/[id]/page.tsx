"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ChevronRight,
  Edit3,
  Check,
  ArrowLeft,
  Loader2,
  Map,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Roadmap } from "@/types/database";
import Link from "next/link";
import { use } from "react";

const MermaidRenderer = dynamic(
  () => import("@/components/roadmap/MermaidRenderer"),
  { ssr: false }
);

// Demo roadmaps (for fallback if Supabase unavailable)
const demoRoadmaps: Record<string, Roadmap> = {
  "1": {
    id: "1",
    title: "Alur Belajar Matematika",
    description: "Roadmap belajar matematika dari dasar hingga lanjutan",
    mermaid_code: `graph TD
    A["📐 Aritmatika Dasar"] --> B["📊 Aljabar"]
    B --> C["📈 Fungsi & Grafik"]
    B --> D["🔢 Persamaan Linear"]
    C --> E["📉 Kalkulus Dasar"]
    D --> E
    E --> F["∫ Integral"]
    E --> G["∂ Diferensial"]
    F --> H["🎓 Kalkulus Lanjutan"]
    G --> H

    style A fill:#6366f1,stroke:#818cf8,color:#fff
    style B fill:#6366f1,stroke:#818cf8,color:#fff
    style C fill:#8b5cf6,stroke:#a78bfa,color:#fff
    style D fill:#8b5cf6,stroke:#a78bfa,color:#fff
    style E fill:#a855f7,stroke:#c084fc,color:#fff
    style F fill:#d946ef,stroke:#e879f9,color:#fff
    style G fill:#d946ef,stroke:#e879f9,color:#fff
    style H fill:#ec4899,stroke:#f472b6,color:#fff`,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-01",
  },
  "2": {
    id: "2",
    title: "Alur Belajar Bahasa Inggris",
    description: "Dari pemula hingga mahir berbahasa Inggris",
    mermaid_code: `graph TD
    A["🔤 Alphabet & Phonics"] --> B["📝 Vocabulary Dasar"]
    B --> C["💬 Grammar Dasar"]
    C --> D["📖 Reading Comprehension"]
    C --> E["✍️ Writing Dasar"]
    D --> F["🗣️ Speaking Practice"]
    E --> F
    F --> G["📚 Advanced Grammar"]
    G --> H["🎓 Fluency"]

    style A fill:#06b6d4,stroke:#22d3ee,color:#fff
    style B fill:#06b6d4,stroke:#22d3ee,color:#fff
    style C fill:#0891b2,stroke:#06b6d4,color:#fff
    style D fill:#0e7490,stroke:#0891b2,color:#fff
    style E fill:#0e7490,stroke:#0891b2,color:#fff
    style F fill:#155e75,stroke:#0e7490,color:#fff
    style G fill:#164e63,stroke:#155e75,color:#fff
    style H fill:#134e4a,stroke:#115e59,color:#fff`,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-05",
  },
};

export default function PathwayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        if (profileData) setProfile(profileData);

        // Try to fetch from Supabase
        const { data: roadmapData } = await supabase
          .from("roadmaps")
          .select("*")
          .eq("id", id)
          .single();

        if (roadmapData) {
          setRoadmap(roadmapData);
        } else {
          // Fallback to demo
          setRoadmap(demoRoadmaps[id] || null);
        }
      } else {
        setRoadmap(demoRoadmaps[id] || null);
      }

      setLoading(false);
    };
    fetchData();
  }, [id]);

  const handleNodeClick = (nodeId: string) => {
    console.log("Node clicked:", nodeId);
    // TODO: toggle node status in roadmap_progress table
  };

  const isGuru = profile?.role === "guru";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="space-y-6">
        <Link href="/pathways">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Roadmap tidak ditemukan.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/pathways">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{roadmap.title}</h1>
            {roadmap.description && (
              <p className="text-muted-foreground text-sm mt-1">
                {roadmap.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={roadmap.is_published ? "default" : "secondary"}>
            {roadmap.is_published ? "Published" : "Draft"}
          </Badge>
          {isGuru && (
            <Link href={`/pathways?edit=${roadmap.id}`}>
              <Button variant="outline" size="sm">
                <Edit3 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
          )}
        </div>
      </div>

      {!isGuru && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-accent/50 p-3 rounded-xl">
          <Check className="h-4 w-4 text-primary" />
          Klik pada node diagram untuk menandai progress belajarmu.
        </div>
      )}

      <Card>
        <CardContent className="p-8">
          <MermaidRenderer
            chart={roadmap.mermaid_code}
            onNodeClick={!isGuru ? handleNodeClick : undefined}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
