"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { toast } from "sonner";
import {
  Map,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Save,
  X,
  Check,
  Loader2,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, Roadmap } from "@/types/database";

const MermaidRenderer = dynamic(
  () => import("@/components/roadmap/MermaidRenderer"),
  { ssr: false }
);

const templateRoadmaps = [
  {
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
  },
  {
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
  },
];

// Demo roadmaps
const demoRoadmaps: Roadmap[] = [
  {
    id: "1",
    title: "Alur Belajar Matematika",
    description: "Roadmap belajar matematika dari dasar hingga lanjutan",
    mermaid_code: templateRoadmaps[0].mermaid_code,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-01",
  },
  {
    id: "2",
    title: "Alur Belajar Bahasa Inggris",
    description: "Dari pemula hingga mahir berbahasa Inggris",
    mermaid_code: templateRoadmaps[1].mermaid_code,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-05",
  },
];

export default function PathwaysPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roadmaps, setRoadmaps] = useState<Roadmap[]>(demoRoadmaps);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoadmap, setEditingRoadmap] = useState<Roadmap | null>(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    mermaid_code: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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

        // Try to fetch roadmaps from Supabase
        const { data: roadmapData } = await supabase
          .from("roadmaps")
          .select("*")
          .order("created_at", { ascending: false });

        if (roadmapData && roadmapData.length > 0) {
          setRoadmaps(roadmapData);
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const isGuru = profile?.role === "guru";

  const handleCreate = () => {
    setEditForm({ title: "", description: "", mermaid_code: templateRoadmaps[0].mermaid_code });
    setIsEditing(true);
    setEditingRoadmap(null);
  };

  const handleEdit = (roadmap: Roadmap) => {
    setEditForm({
      title: roadmap.title,
      description: roadmap.description || "",
      mermaid_code: roadmap.mermaid_code,
    });
    setIsEditing(true);
    setEditingRoadmap(roadmap);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      if (editingRoadmap && editingRoadmap.id !== "1" && editingRoadmap.id !== "2") {
        // Update existing
        await supabase
          .from("roadmaps")
          .update({
            title: editForm.title,
            description: editForm.description,
            mermaid_code: editForm.mermaid_code,
          })
          .eq("id", editingRoadmap.id);
      } else {
        // Create new
        const { data } = await supabase
          .from("roadmaps")
          .insert({
            title: editForm.title,
            description: editForm.description,
            mermaid_code: editForm.mermaid_code,
            created_by: user.id,
            is_published: true,
          })
          .select()
          .single();

        if (data) {
          setRoadmaps((prev) => [data, ...prev]);
        }
      }

      setIsEditing(false);
      toast.success("Roadmap berhasil disimpan!");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Gagal menyimpan roadmap.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Editing/Creating view
  if (isEditing && isGuru) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {editingRoadmap ? "Edit Roadmap" : "Buat Roadmap Baru"}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Tulis kode Mermaid.js untuk membuat diagram roadmap.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(false)}
            >
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 space-y-4">
                <div className="space-y-2">
                  <Label>Judul Roadmap</Label>
                  <Input
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, title: e.target.value }))
                    }
                    placeholder="Contoh: Alur Belajar Matematika"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Deskripsi</Label>
                  <Input
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm((f) => ({
                        ...f,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Deskripsi singkat tentang roadmap"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Mermaid Code</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editForm.mermaid_code}
                  onChange={(e) =>
                    setEditForm((f) => ({
                      ...f,
                      mermaid_code: e.target.value,
                    }))
                  }
                  className="font-mono text-xs min-h-[300px]"
                  placeholder="graph TD&#10;    A[Start] --> B[Step 1]&#10;    B --> C[Step 2]"
                />
              </CardContent>
            </Card>

            {/* Templates */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Template</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templateRoadmaps.map((tmpl) => (
                    <button
                      key={tmpl.title}
                      onClick={() =>
                        setEditForm({
                          title: tmpl.title,
                          description: tmpl.description,
                          mermaid_code: tmpl.mermaid_code,
                        })
                      }
                      className="w-full text-left p-3 rounded-xl border border-border/50 hover:bg-accent transition-colors text-sm"
                    >
                      <p className="font-medium">{tmpl.title}</p>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {tmpl.description}
                      </p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <Card className="sticky top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Preview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="min-h-[400px] flex items-center justify-center">
                {editForm.mermaid_code ? (
                  <MermaidRenderer chart={editForm.mermaid_code} />
                ) : (
                  <p className="text-muted-foreground text-sm">
                    Ketik mermaid code untuk melihat preview...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Map className="h-6 w-6 text-primary" />
            Pathways
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isGuru
              ? "Buat dan kelola roadmap belajar untuk siswa."
              : "Ikuti roadmap belajar yang tersedia."}
          </p>
        </div>
        {isGuru && (
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Buat Roadmap
          </Button>
        )}
      </div>

      {roadmaps.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Map className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {isGuru
                ? "Belum ada roadmap. Buat roadmap pertamamu!"
                : "Belum ada roadmap yang tersedia."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {roadmaps.map((roadmap, index) => (
            <motion.div
              key={roadmap.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/pathways/${roadmap.id}`}>
                <Card className="cursor-pointer hover:border-primary/30 transition-all group h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {roadmap.title}
                        </CardTitle>
                        {roadmap.description && (
                          <CardDescription className="mt-1">
                            {roadmap.description}
                          </CardDescription>
                        )}
                      </div>
                      <Badge variant={roadmap.is_published ? "default" : "secondary"}>
                        {roadmap.is_published ? "Published" : "Draft"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-32 overflow-hidden rounded-xl bg-accent/30 flex items-center justify-center">
                      <MermaidRenderer
                        chart={roadmap.mermaid_code}
                        className="scale-50 origin-center pointer-events-none"
                      />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
