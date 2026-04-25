"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Save,
  X,
  Trash2,
  Loader2,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { toast } from "sonner";

export default function CreateDeckPage() {
  const router = useRouter();
  const [formTitle, setFormTitle] = useState("");
  const [formCards, setFormCards] = useState<{ front: string; back: string }[]>([
    { front: "", back: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addFormCard = () => {
    setFormCards((prev) => [...prev, { front: "", back: "" }]);
  };

  const removeFormCard = (index: number) => {
    setFormCards((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveDeck = async () => {
    if (!formTitle.trim() || formCards.some((c) => !c.front.trim() || !c.back.trim())) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: deck } = await supabase
          .from("flashcard_decks")
          .insert({
            title: formTitle,
            created_by: user.id,
            is_published: true,
          })
          .select()
          .single();

        if (deck) {
          const cardsToInsert = formCards.map((c, i) => ({
            deck_id: deck.id,
            front: c.front,
            back: c.back,
            order_index: i,
          }));

          await supabase.from("flashcards").insert(cardsToInsert);
        }
      }

      toast.success("Deck berhasil dibuat!");
      router.push("/study-cards");
    } catch (err) {
      console.error("Save error:", err);
      toast.error("Gagal membuat deck flashcard.");
    } finally {
      setSaving(false);
    }
  };

  const isValid = formTitle.trim() && formCards.every((c) => c.front.trim() && c.back.trim());

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/study-cards">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Buat Deck Flashcard
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              Buat deck baru dengan kartu-kartu pertanyaan dan jawaban.
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/study-cards">
            <Button variant="outline">
              <X className="mr-2 h-4 w-4" />
              Batal
            </Button>
          </Link>
          <Button onClick={handleSaveDeck} disabled={saving || !isValid}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Simpan
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-5 space-y-4">
          <div className="space-y-2">
            <Label>Judul Deck</Label>
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Contoh: Kosakata Bahasa Inggris"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Kartu ({formCards.length})
          </h2>
          <Button variant="outline" size="sm" onClick={addFormCard}>
            <Plus className="mr-2 h-4 w-4" />
            Tambah Kartu
          </Button>
        </div>

        {formCards.map((card, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary text-sm font-bold shrink-0 mt-1">
                    {index + 1}
                  </span>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs">Depan (Pertanyaan)</Label>
                      <Textarea
                        value={card.front}
                        onChange={(e) => {
                          const updated = [...formCards];
                          updated[index].front = e.target.value;
                          setFormCards(updated);
                        }}
                        placeholder="Tulis pertanyaan..."
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Belakang (Jawaban)</Label>
                      <Textarea
                        value={card.back}
                        onChange={(e) => {
                          const updated = [...formCards];
                          updated[index].back = e.target.value;
                          setFormCards(updated);
                        }}
                        placeholder="Tulis jawaban..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  {formCards.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFormCard(index)}
                      className="text-muted-foreground hover:text-red-400 shrink-0 mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Add more card button at bottom */}
        <motion.button
          onClick={addFormCard}
          className="w-full p-4 rounded-2xl border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary transition-all flex items-center justify-center gap-2"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Plus className="h-5 w-5" />
          Tambah Kartu Lagi
        </motion.button>
      </div>
    </div>
  );
}
