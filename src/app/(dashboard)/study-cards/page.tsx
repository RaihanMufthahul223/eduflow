"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Plus,
  BookOpen,
  Layers,
  Clock,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import type { Profile, FlashcardDeck } from "@/types/database";

// Demo data
const demoDeck: FlashcardDeck[] = [
  {
    id: "1",
    title: "Kosakata Bahasa Inggris - Dasar",
    subject_id: null,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-01",
    _count: 8,
  },
  {
    id: "2",
    title: "Rumus Matematika Kelas XII",
    subject_id: null,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-03",
    _count: 6,
  },
  {
    id: "3",
    title: "Istilah Biologi - Sel",
    subject_id: null,
    created_by: "demo",
    is_published: true,
    created_at: "2026-04-05",
    _count: 5,
  },
];

export default function StudyCardsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [decks, setDecks] = useState<FlashcardDeck[]>(demoDeck);
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

        // Try fetch flashcard decks
        const { data: deckData } = await supabase
          .from("flashcard_decks")
          .select("*, flashcards(count)")
          .order("created_at", { ascending: false });

        if (deckData && deckData.length > 0) {
          setDecks(deckData.map((d: any) => ({
            ...d,
            _count: d.flashcards?.[0]?.count || 0,
          })));
        }
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const isGuru = profile?.role === "guru";

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-40 bg-muted animate-pulse rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Study Cards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isGuru
              ? "Buat bank soal flashcard untuk siswa."
              : "Berlatih menghafal dengan spaced repetition."}
          </p>
        </div>
        {isGuru && (
          <Link href="/study-cards/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Buat Deck
            </Button>
          </Link>
        )}
      </div>

      {/* Stats for siswa */}
      {!isGuru && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Due Hari Ini</p>
                <p className="text-xl font-bold text-amber-500">18</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
                <Zap className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-xl font-bold text-emerald-500">5 hari</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10">
                <Layers className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Kartu</p>
                <p className="text-xl font-bold text-indigo-500">
                  {decks.reduce((a, d) => a + (d._count || 0), 0)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Deck Grid */}
      {decks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">
              {isGuru
                ? "Belum ada deck. Buat deck pertamamu!"
                : "Belum ada deck flashcard yang tersedia."}
            </p>
            {isGuru && (
              <Link href="/study-cards/create" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Deck
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {decks.map((deck, index) => (
            <motion.div
              key={deck.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="group hover:border-primary/30 transition-all h-full flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base group-hover:text-primary transition-colors">
                      {deck.title}
                    </CardTitle>
                    <Badge variant="secondary">
                      {deck._count || 0} kartu
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        {deck._count || 0} kartu
                      </span>
                    </div>
                    <Link href={`/study-cards/${deck.id}`}>
                      <Button size="sm">
                        <BookOpen className="mr-1 h-3 w-3" />
                        {isGuru ? "Preview" : "Mulai"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
