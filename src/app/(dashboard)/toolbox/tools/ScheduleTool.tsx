"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import type { Schedule } from "@/types/database";

interface ScheduleToolProps {
  onBack: () => void;
  schedules: Schedule[];
  onSchedulesChange: (s: Schedule[]) => void;
  teacherId: string;
  classGroup: string;
}

export function ScheduleTool({ onBack, schedules, onSchedulesChange, teacherId, classGroup }: ScheduleToolProps) {
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", date: "", time_start: "", time_end: "" });

  const handleAdd = async () => {
    if (!form.title || !form.date || !form.time_start || !form.time_end) {
      toast.error("Lengkapi semua field.");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("schedules")
        .insert({ ...form, teacher_id: teacherId, class_group: classGroup, description: null })
        .select()
        .single();

      if (error) throw error;
      onSchedulesChange([...schedules, data as Schedule].sort((a, b) => a.date.localeCompare(b.date)));
      setForm({ title: "", date: "", time_start: "", time_end: "" });
      setShowForm(false);
      toast.success("Jadwal berhasil ditambahkan!");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal menyimpan jadwal.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
      onSchedulesChange(schedules.filter((s) => s.id !== id));
      toast.success("Jadwal dihapus.");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal menghapus jadwal.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack}>← Kembali</Button>
          <h2 className="text-xl font-bold">Jadwal Kelas</h2>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="mr-2 h-4 w-4" />Tambah Jadwal
        </Button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card>
            <CardContent className="p-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Mata Pelajaran</Label>
                  <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Matematika" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Tanggal</Label>
                  <Input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Mulai</Label>
                  <Input type="time" value={form.time_start} onChange={(e) => setForm((f) => ({ ...f, time_start: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Selesai</Label>
                  <Input type="time" value={form.time_end} onChange={(e) => setForm((f) => ({ ...f, time_end: e.target.value }))} />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAdd} className="w-full" disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {schedules.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Calendar className="h-12 w-12 mb-3 opacity-20" />
          <p>Belum ada jadwal</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((schedule) => (
            <Card key={schedule.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{schedule.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(schedule.date + "T00:00:00").toLocaleDateString("id-ID", {
                        weekday: "long", year: "numeric", month: "long", day: "numeric",
                      })}{" "}• {schedule.time_start} - {schedule.time_end}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{schedule.class_group}</Badge>
                  <Button
                    variant="ghost" size="icon"
                    onClick={() => handleDelete(schedule.id)}
                    disabled={deletingId === schedule.id}
                    className="text-muted-foreground hover:text-red-400"
                  >
                    {deletingId === schedule.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </motion.div>
  );
}
