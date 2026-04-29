"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus, Trash2, Loader2, Upload, AlertTriangle,
  CheckCircle2, ClipboardList, TableProperties, FileUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";
import { cn, getScoreBadge } from "@/lib/utils";
import type { Subject } from "@/types/database";
import type { StudentWithNisn, GradeWithDetails } from "../page";

interface GradeInputToolProps {
  onBack: () => void;
  subjects: Subject[];
  students: StudentWithNisn[];
  grades: GradeWithDetails[];
  onGradesChange: (g: GradeWithDetails[]) => void;
  className: string;
}

type GradeType = "tugas" | "uts" | "uas" | "quiz";
type Tab = "manual" | "import" | "list";

interface CsvRow {
  nisn: string;
  subject_name: string;
  type: GradeType;
  score: number;
  student_id?: string;
  subject_id?: string;
  student_name?: string;
  error?: string;
}

export function GradeInputTool({ onBack, subjects, students, grades, onGradesChange, className }: GradeInputToolProps) {
  const [tab, setTab] = useState<Tab>("manual");

  // Manual form state
  const [manualForm, setManualForm] = useState({
    student_id: "",
    subject_id: "",
    type: "tugas" as GradeType,
    score: "",
  });
  const [saving, setSaving] = useState(false);

  // CSV import state
  const fileRef = useRef<HTMLInputElement>(null);
  const [csvRows, setCsvRows] = useState<CsvRow[]>([]);
  const [importing, setImporting] = useState(false);

  // List state
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStudent, setFilterStudent] = useState("all");
  const [filterSubject, setFilterSubject] = useState("all");

  // ─── Helpers ───────────────────────────────────────────────────────────────
  const gradeTypes: GradeType[] = ["tugas", "uts", "uas", "quiz"];

  const nisnToStudent = Object.fromEntries(
    students.filter((s) => s.nisn).map((s) => [s.nisn!, s])
  );
  const nameToSubject = Object.fromEntries(subjects.map((s) => [s.name.toLowerCase(), s]));

  // ─── Manual Submit ──────────────────────────────────────────────────────────
  const handleManualSave = async () => {
    const score = parseFloat(manualForm.score);
    if (!manualForm.student_id || !manualForm.subject_id || isNaN(score) || score < 0 || score > 100) {
      toast.error("Lengkapi semua field dengan benar (nilai 0–100).");
      return;
    }
    setSaving(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("grades")
        .insert({
          student_id: manualForm.student_id,
          subject_id: manualForm.subject_id,
          type: manualForm.type,
          score,
        })
        .select("id, student_id, subject_id, score, type, created_at, profiles(full_name), subjects(name)")
        .single();

      if (error) throw error;

      const newGrade: GradeWithDetails = {
        id: (data as any).id,
        student_id: (data as any).student_id,
        subject_id: (data as any).subject_id,
        score: (data as any).score,
        type: (data as any).type,
        created_at: (data as any).created_at,
        student_name: (data as any).profiles?.full_name ?? "Unknown",
        subject_name: (data as any).subjects?.name ?? "Unknown",
      };

      onGradesChange([newGrade, ...grades]);
      setManualForm({ student_id: "", subject_id: "", type: "tugas", score: "" });
      toast.success("Nilai berhasil disimpan!");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal menyimpan nilai.");
    } finally {
      setSaving(false);
    }
  };

  // ─── CSV Parse ──────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split(/\r?\n/).filter(Boolean);
      // Skip header row if it contains "nisn"
      const dataLines = lines[0]?.toLowerCase().includes("nisn") ? lines.slice(1) : lines;

      const parsed: CsvRow[] = dataLines.map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const [nisnRaw, subjectNameRaw, typeRaw, scoreRaw] = cols;
        const nisn = (nisnRaw ?? "").replace(/\D/g, "");
        const subject_name = (subjectNameRaw ?? "").trim();
        const type = (typeRaw ?? "tugas").toLowerCase() as GradeType;
        const score = parseFloat(scoreRaw ?? "0");

        const student = nisnToStudent[nisn];
        const subject = nameToSubject[subject_name.toLowerCase()];

        let error: string | undefined;
        if (!student) error = `NISN ${nisn} tidak ditemukan`;
        else if (!subject) error = `Mapel "${subject_name}" tidak ditemukan`;
        else if (!gradeTypes.includes(type)) error = `Tipe "${type}" tidak valid`;
        else if (isNaN(score) || score < 0 || score > 100) error = `Nilai "${scoreRaw}" tidak valid`;

        return {
          nisn,
          subject_name,
          type: gradeTypes.includes(type) ? type : "tugas",
          score: isNaN(score) ? 0 : score,
          student_id: student?.id,
          subject_id: subject?.id,
          student_name: student?.full_name,
          error,
        };
      });

      setCsvRows(parsed);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  const validRows = csvRows.filter((r) => !r.error);
  const invalidRows = csvRows.filter((r) => r.error);

  const handleImport = async () => {
    if (validRows.length === 0) return;
    setImporting(true);
    try {
      const supabase = createClient();
      const payload = validRows.map((r) => ({
        student_id: r.student_id!,
        subject_id: r.subject_id!,
        type: r.type,
        score: r.score,
      }));

      const { data, error } = await supabase
        .from("grades")
        .insert(payload)
        .select("id, student_id, subject_id, score, type, created_at, profiles(full_name), subjects(name)");

      if (error) throw error;

      const newGrades: GradeWithDetails[] = (data ?? []).map((g: any) => ({
        id: g.id,
        student_id: g.student_id,
        subject_id: g.subject_id,
        score: g.score,
        type: g.type,
        created_at: g.created_at,
        student_name: g.profiles?.full_name ?? "Unknown",
        subject_name: g.subjects?.name ?? "Unknown",
      }));

      onGradesChange([...newGrades, ...grades]);
      setCsvRows([]);
      toast.success(`${newGrades.length} nilai berhasil diimport!`);
      setTab("list");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal mengimport nilai.");
    } finally {
      setImporting(false);
    }
  };

  // ─── Delete Grade ───────────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("grades").delete().eq("id", id);
      if (error) throw error;
      onGradesChange(grades.filter((g) => g.id !== id));
      toast.success("Nilai dihapus.");
    } catch (err: any) {
      toast.error(err.message ?? "Gagal menghapus nilai.");
    } finally {
      setDeletingId(null);
    }
  };

  // ─── Filtered grades for list tab ──────────────────────────────────────────
  const filteredGrades = grades.filter((g) => {
    if (filterStudent !== "all" && g.student_id !== filterStudent) return false;
    if (filterSubject !== "all" && g.subject_id !== filterSubject) return false;
    return true;
  });

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={onBack}>← Kembali</Button>
        <div>
          <h2 className="text-xl font-bold">Input Nilai</h2>
          <p className="text-sm text-muted-foreground">Kelas: {className || "-"}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {([["manual", "Input Manual", ClipboardList], ["import", "Import CSV", FileUp], ["list", "Daftar Nilai", TableProperties]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id as Tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-4 w-4" />
            {label}
            {id === "list" && grades.length > 0 && (
              <Badge variant="secondary" className="ml-1 text-xs">{grades.length}</Badge>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Manual ── */}
      {tab === "manual" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Input Nilai Manual</CardTitle>
            <CardDescription>Masukkan nilai satu siswa per satu.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {students.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Belum ada siswa di kelas ini. Pastikan siswa sudah bergabung via kode kelas.</span>
              </div>
            ) : subjects.length === 0 ? (
              <div className="flex items-center gap-2 text-amber-500 text-sm">
                <AlertTriangle className="h-4 w-4" />
                <span>Belum ada mata pelajaran. Tambahkan mata pelajaran terlebih dahulu.</span>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Siswa</Label>
                    <select
                      value={manualForm.student_id}
                      onChange={(e) => setManualForm((f) => ({ ...f, student_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Pilih siswa...</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.full_name}{s.nisn ? ` (${s.nisn})` : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Mata Pelajaran</Label>
                    <select
                      value={manualForm.subject_id}
                      onChange={(e) => setManualForm((f) => ({ ...f, subject_id: e.target.value }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Pilih mata pelajaran...</option>
                      {subjects.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Tipe Nilai</Label>
                    <select
                      value={manualForm.type}
                      onChange={(e) => setManualForm((f) => ({ ...f, type: e.target.value as GradeType }))}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="tugas">Tugas</option>
                      <option value="quiz">Quiz</option>
                      <option value="uts">UTS</option>
                      <option value="uas">UAS</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Nilai (0–100)</Label>
                    <Input
                      type="number"
                      min={0} max={100}
                      value={manualForm.score}
                      onChange={(e) => setManualForm((f) => ({ ...f, score: e.target.value }))}
                      placeholder="Contoh: 85"
                    />
                  </div>
                </div>
                <Button onClick={handleManualSave} disabled={saving}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Simpan Nilai
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Tab: Import CSV ── */}
      {tab === "import" && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Import Nilai via CSV</CardTitle>
              <CardDescription>
                Upload file CSV dengan kolom: <code className="bg-muted px-1 rounded text-xs">nisn, nama_mapel, tipe, nilai</code>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl text-sm space-y-1 font-mono text-muted-foreground">
                <p className="text-xs text-foreground font-sans font-medium mb-2">Format contoh:</p>
                <p>nisn,nama_mapel,tipe,nilai</p>
                <p>1234567890,Matematika,tugas,85</p>
                <p>1234567890,Fisika,uts,78</p>
                <p>0987654321,Matematika,quiz,92</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• Tipe yang valid: <code className="bg-muted px-1 rounded">tugas</code>, <code className="bg-muted px-1 rounded">quiz</code>, <code className="bg-muted px-1 rounded">uts</code>, <code className="bg-muted px-1 rounded">uas</code></p>
                <p>• NISN harus sesuai dengan yang terdaftar di sistem</p>
                <p>• Nama mata pelajaran harus persis sama (case-insensitive)</p>
              </div>
              <div>
                <input ref={fileRef} type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
                <Button variant="outline" onClick={() => fileRef.current?.click()}>
                  <Upload className="mr-2 h-4 w-4" />Pilih File CSV
                </Button>
              </div>
            </CardContent>
          </Card>

          {csvRows.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preview Import</CardTitle>
                <CardDescription>
                  <span className="text-emerald-500">{validRows.length} valid</span>
                  {invalidRows.length > 0 && <span className="text-red-400 ml-2">{invalidRows.length} error</span>}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="overflow-x-auto max-h-72 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b border-border/50">
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">NISN</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Nama Siswa</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Mata Pelajaran</th>
                        <th className="text-center py-2 px-3 text-muted-foreground font-medium">Tipe</th>
                        <th className="text-center py-2 px-3 text-muted-foreground font-medium">Nilai</th>
                        <th className="text-left py-2 px-3 text-muted-foreground font-medium">Keterangan</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvRows.map((row, i) => (
                        <tr key={i} className={cn("border-b border-border/30 last:border-0", row.error ? "bg-red-500/5" : "")}>
                          <td className="py-2 px-3">
                            {row.error
                              ? <AlertTriangle className="h-4 w-4 text-red-400" />
                              : <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                          </td>
                          <td className="py-2 px-3 font-mono text-xs">{row.nisn}</td>
                          <td className="py-2 px-3">{row.student_name ?? <span className="text-muted-foreground">-</span>}</td>
                          <td className="py-2 px-3">{row.subject_name}</td>
                          <td className="py-2 px-3 text-center">
                            <Badge variant="secondary" className="text-xs uppercase">{row.type}</Badge>
                          </td>
                          <td className="py-2 px-3 text-center font-semibold">{row.score}</td>
                          <td className="py-2 px-3 text-xs text-red-400">{row.error ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button onClick={handleImport} disabled={importing || validRows.length === 0}>
                    {importing
                      ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      : <Upload className="mr-2 h-4 w-4" />}
                    Import {validRows.length} Data Valid
                  </Button>
                  <Button variant="ghost" onClick={() => setCsvRows([])}>Batal</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ── Tab: Daftar Nilai ── */}
      {tab === "list" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filterStudent}
              onChange={(e) => setFilterStudent(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">Semua Siswa</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.full_name}</option>)}
            </select>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            >
              <option value="all">Semua Mapel</option>
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <span className="ml-auto self-center text-sm text-muted-foreground">{filteredGrades.length} data</span>
          </div>

          <Card>
            <CardContent className="p-0">
              {filteredGrades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <TableProperties className="h-12 w-12 mb-3 opacity-20" />
                  <p>Belum ada data nilai</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/50">
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Nama Siswa</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Mata Pelajaran</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Tipe</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Nilai</th>
                        <th className="text-center py-3 px-4 text-muted-foreground font-medium">Status</th>
                        <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tanggal</th>
                        <th className="py-3 px-4" />
                      </tr>
                    </thead>
                    <tbody>
                      {filteredGrades.map((g) => {
                        const badge = getScoreBadge(g.score);
                        return (
                          <tr key={g.id} className="border-b border-border/30 last:border-0 hover:bg-muted/30 transition-colors">
                            <td className="py-3 px-4 font-medium">{g.student_name}</td>
                            <td className="py-3 px-4 text-muted-foreground">{g.subject_name}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge variant="secondary" className="text-xs uppercase">{g.type}</Badge>
                            </td>
                            <td className="py-3 px-4 text-center font-semibold text-lg">{g.score}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge className={badge.color}>{badge.label}</Badge>
                            </td>
                            <td className="py-3 px-4 text-muted-foreground text-xs">
                              {new Date(g.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="py-3 px-4">
                              <Button
                                variant="ghost" size="icon"
                                onClick={() => handleDelete(g.id)}
                                disabled={deletingId === g.id}
                                className="text-muted-foreground hover:text-red-400"
                              >
                                {deletingId === g.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </motion.div>
  );
}
