import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ToolboxClient } from "./ToolboxClient";
import type { Profile, Subject, Grade, Schedule } from "@/types/database";

export const metadata = {
  title: "Toolbox - EduFlow",
  description: "Tools administrasi dan utilitas untuk guru dan siswa EduFlow.",
};

export interface StudentWithNisn {
  id: string;
  full_name: string;
  nisn: string | null;
  class_group: string | null;
}

export interface GradeWithDetails {
  id: string;
  student_id: string;
  subject_id: string;
  score: number;
  type: "tugas" | "uts" | "uas" | "quiz";
  created_at: string;
  student_name: string;
  subject_name: string;
}

export default async function ToolboxPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login");
  }

  const isGuru = profile.role === "guru";

  let subjects: Subject[] = [];
  let students: StudentWithNisn[] = [];
  let grades: GradeWithDetails[] = [];
  let schedules: Schedule[] = [];
  let myClass: { name: string; invite_code: string } | null = null;

  if (isGuru) {
    // 1. Fetch class info
    const { data: classData } = await supabase
      .from("classes")
      .select("name, invite_code")
      .eq("teacher_id", user.id)
      .maybeSingle();

    myClass = classData ?? null;

    // 2. Fetch subjects owned by this teacher
    const { data: subjectsData } = await supabase
      .from("subjects")
      .select("*")
      .eq("teacher_id", user.id)
      .order("name");

    subjects = subjectsData ?? [];

    // 3. Fetch students in the same class group
    if (profile.class_group) {
      const { data: studentsData } = await supabase
        .from("profiles")
        .select("id, full_name, nisn, class_group")
        .eq("role", "siswa")
        .eq("class_group", profile.class_group)
        .order("full_name");

      students = (studentsData ?? []) as StudentWithNisn[];
    }

    // 4. Fetch grades for teacher's subjects with student names
    if (subjects.length > 0) {
      const subjectIds = subjects.map((s) => s.id);
      const { data: gradesData } = await supabase
        .from("grades")
        .select(
          "id, student_id, subject_id, score, type, created_at, profiles(full_name), subjects(name)"
        )
        .in("subject_id", subjectIds)
        .order("created_at", { ascending: false });

      grades = (gradesData ?? []).map((g: any) => ({
        id: g.id,
        student_id: g.student_id,
        subject_id: g.subject_id,
        score: g.score,
        type: g.type,
        created_at: g.created_at,
        student_name: g.profiles?.full_name ?? "Unknown",
        subject_name: g.subjects?.name ?? "Unknown",
      }));
    }

    // 5. Fetch schedules for this teacher
    const { data: schedulesData } = await supabase
      .from("schedules")
      .select("*")
      .eq("teacher_id", user.id)
      .order("date", { ascending: true });

    schedules = (schedulesData ?? []) as Schedule[];
  }

  return (
    <ToolboxClient
      profile={profile as Profile}
      subjects={subjects}
      students={students}
      grades={grades}
      schedules={schedules}
      myClass={myClass}
    />
  );
}
