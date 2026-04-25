"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Loader2,
  Frown,
  Meh,
  Smile,
  Brain,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { sm2, qualityFromButton, DEFAULT_CARD_STATE } from "@/lib/sm2";
import type { Profile, Flashcard } from "@/types/database";
import { cn } from "@/lib/utils";

// Demo cards data
const demoCards: Record<string, Flashcard[]> = {
  "1": [
    { id: "c1", deck_id: "1", front: "Abundant", back: "Berlimpah, sangat banyak", order_index: 0 },
    { id: "c2", deck_id: "1", front: "Diligent", back: "Rajin, tekun", order_index: 1 },
    { id: "c3", deck_id: "1", front: "Eloquent", back: "Fasih, pandai berbicara", order_index: 2 },
    { id: "c4", deck_id: "1", front: "Resilient", back: "Tangguh, cepat pulih", order_index: 3 },
    { id: "c5", deck_id: "1", front: "Meticulous", back: "Teliti, cermat", order_index: 4 },
    { id: "c6", deck_id: "1", front: "Pragmatic", back: "Pragmatis, praktis", order_index: 5 },
    { id: "c7", deck_id: "1", front: "Ambiguous", back: "Ambigu, bermakna ganda", order_index: 6 },
    { id: "c8", deck_id: "1", front: "Benevolent", back: "Baik hati, dermawan", order_index: 7 },
  ],
  "2": [
    { id: "c9", deck_id: "2", front: "Rumus Luas Lingkaran", back: "A = π × r²", order_index: 0 },
    { id: "c10", deck_id: "2", front: "Rumus Volume Bola", back: "V = (4/3) × π × r³", order_index: 1 },
    { id: "c11", deck_id: "2", front: "Rumus Kuadrat (abc)", back: "x = (-b ± √(b²-4ac)) / 2a", order_index: 2 },
    { id: "c12", deck_id: "2", front: "Turunan f(x) = xⁿ", back: "f'(x) = n × x^(n-1)", order_index: 3 },
    { id: "c13", deck_id: "2", front: "∫ xⁿ dx", back: "x^(n+1)/(n+1) + C", order_index: 4 },
    { id: "c14", deck_id: "2", front: "sin²θ + cos²θ", back: "= 1 (Identitas Trigonometri)", order_index: 5 },
  ],
  "3": [
    { id: "c15", deck_id: "3", front: "Mitokondria", back: "Organel penghasil energi (ATP) melalui respirasi sel", order_index: 0 },
    { id: "c16", deck_id: "3", front: "Ribosom", back: "Organel tempat sintesis protein", order_index: 1 },
    { id: "c17", deck_id: "3", front: "Retikulum Endoplasma", back: "Jaringan membran untuk transportasi zat dalam sel", order_index: 2 },
    { id: "c18", deck_id: "3", front: "Lisosom", back: "Organel pencernaan intraseluler, mengandung enzim hidrolitik", order_index: 3 },
    { id: "c19", deck_id: "3", front: "Aparatus Golgi", back: "Organel untuk modifikasi, pengemasan, dan distribusi protein", order_index: 4 },
  ],
};

const demoTitles: Record<string, string> = {
  "1": "Kosakata Bahasa Inggris - Dasar",
  "2": "Rumus Matematika Kelas XII",
  "3": "Istilah Biologi - Sel",
};

export default function StudyCardReviewPage({
  params,
}: {
  params: Promise<{ deckId: string }>;
}) {
  const { deckId } = use(params);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [deckTitle, setDeckTitle] = useState("");
  const [loading, setLoading] = useState(true);

  // Review state
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewResults, setReviewResults] = useState<
    { cardId: string; quality: "lupa" | "sulit" | "mudah" }[]
  >([]);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      const supabase = createClient();
      const { data: cardsData } = await supabase
        .from("flashcards")
        .select("*")
        .eq("deck_id", deckId)
        .order("order_index", { ascending: true });

      if (cardsData && cardsData.length > 0) {
        setCards(cardsData);
        // Also fetch deck title
        const { data: deckData } = await supabase
          .from("flashcard_decks")
          .select("title")
          .eq("id", deckId)
          .single();
        if (deckData) setDeckTitle(deckData.title);
      } else {
        // Fallback to demo data
        setCards(demoCards[deckId] || []);
        setDeckTitle(demoTitles[deckId] || "Flashcard Deck");
      }
      setLoading(false);
    };
    fetchCards();
  }, [deckId]);

  const handleRate = (quality: "lupa" | "sulit" | "mudah") => {
    const card = cards[currentIndex];
    const q = qualityFromButton(quality);
    sm2(DEFAULT_CARD_STATE, q);

    const newResults = [...reviewResults, { cardId: card.id, quality }];
    setReviewResults(newResults);

    if (currentIndex < cards.length - 1) {
      setFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    } else {
      setFinished(true);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setFlipped(false);
    setReviewResults([]);
    setFinished(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Link href="/study-cards">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Brain className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Deck ini belum memiliki kartu.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Review Summary
  if (finished) {
    const lupaCount = reviewResults.filter((r) => r.quality === "lupa").length;
    const sulitCount = reviewResults.filter((r) => r.quality === "sulit").length;
    const mudahCount = reviewResults.filter((r) => r.quality === "mudah").length;
    const accuracy = ((mudahCount + sulitCount) / cards.length * 100).toFixed(0);

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto space-y-6 py-8"
      >
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary mx-auto"
          >
            <Trophy className="h-10 w-10 text-white" />
          </motion.div>
          <h1 className="text-3xl font-bold">Sesi Selesai! 🎉</h1>
          <p className="text-muted-foreground">{deckTitle}</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Akurasi</p>
              <p className="text-4xl font-bold gradient-text">{accuracy}%</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                <Frown className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-red-400">{lupaCount}</p>
                <p className="text-xs text-muted-foreground">Lupa</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Meh className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-amber-400">{sulitCount}</p>
                <p className="text-xs text-muted-foreground">Sulit</p>
              </div>
              <div className="text-center p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <Smile className="h-5 w-5 text-emerald-400 mx-auto mb-1" />
                <p className="text-lg font-bold text-emerald-400">{mudahCount}</p>
                <p className="text-xs text-muted-foreground">Mudah</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleRestart}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Ulangi
          </Button>
          <Link href="/study-cards" className="flex-1">
            <Button className="w-full">
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Selesai
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  // Review Mode
  const currentCard = cards[currentIndex];
  const progress = ((currentIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link href="/study-cards">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali
          </Button>
        </Link>
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{deckTitle}</p>
          <p className="text-sm font-medium">
            {currentIndex + 1} / {cards.length}
          </p>
        </div>
        <div className="w-20" />
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full gradient-primary rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Flashcard */}
      <div
        className="perspective-1000 cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <motion.div
          className="relative w-full min-h-[300px]"
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl border border-border/50 bg-card p-8 flex flex-col items-center justify-center shadow-xl"
            style={{ backfaceVisibility: "hidden" }}
          >
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">
              Pertanyaan
            </p>
            <p className="text-2xl font-bold text-center">
              {currentCard.front}
            </p>
            <p className="text-sm text-muted-foreground mt-6">
              Klik untuk membalik kartu
            </p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 backface-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-card to-primary/5 p-8 flex flex-col items-center justify-center shadow-xl"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <p className="text-xs text-primary uppercase tracking-wider mb-4">
              Jawaban
            </p>
            <p className="text-2xl font-bold text-center">
              {currentCard.back}
            </p>
          </div>
        </motion.div>
      </div>

      {/* Rating Buttons */}
      <AnimatePresence>
        {flipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center gap-4"
          >
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate("lupa")}
              className="flex-1 max-w-[150px] border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Frown className="mr-2 h-5 w-5" />
              Lupa
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate("sulit")}
              className="flex-1 max-w-[150px] border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:text-amber-400"
            >
              <Meh className="mr-2 h-5 w-5" />
              Sulit
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => handleRate("mudah")}
              className="flex-1 max-w-[150px] border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-400"
            >
              <Smile className="mr-2 h-5 w-5" />
              Mudah
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
