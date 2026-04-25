import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiswaDashboard } from "@/components/dashboard/siswa-dashboard";
import { GuruDashboard } from "@/components/dashboard/guru-dashboard";

export const metadata = {
  title: "Dashboard - EduFlow",
  description: "Pantau progres belajar dan statistik Anda di EduFlow.",
};

export default async function DashboardPage() {
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
    return (
      <div className="p-8 text-center text-muted-foreground">
        <h2 className="text-xl font-semibold mb-2 text-foreground">Profil Belum Ditemukan</h2>
        <p>Silakan muat ulang halaman atau hubungi administrator.</p>
      </div>
    );
  }

  const isGuru = profile.role === "guru";

  // Data fetching based on role
  let siswaProps = null;
  let guruProps = null;

  if (!isGuru) {
    // Fetch Siswa Data
    
    // 1. Fetch Grades
    const { data: gradesData } = await supabase
      .from("grades")
      .select("score, created_at, subjects(name)")
      .eq("student_id", user.id)
      .order("created_at", { ascending: true });

    // Group grades by subject
    const subjectGrades: Record<string, number[]> = {};
    if (gradesData) {
      gradesData.forEach((g: any) => {
        const subjectName = g.subjects?.name || "Unknown";
        if (!subjectGrades[subjectName]) {
          subjectGrades[subjectName] = [];
        }
        subjectGrades[subjectName].push(g.score);
      });
    }

    const formattedGrades = Object.entries(subjectGrades).map(([subject, scores]) => ({
      subject,
      scores,
    }));

    // Calculate Averages
    let avgScore = 0;
    let prevAvg = 0;
    let trend = 0;

    if (formattedGrades.length > 0) {
      const latestScores = formattedGrades.map(g => g.scores[g.scores.length - 1] || 0);
      avgScore = latestScores.reduce((a, b) => a + b, 0) / latestScores.length;

      const prevScores = formattedGrades.map(g => g.scores[g.scores.length - 2] || g.scores[g.scores.length - 1] || 0);
      prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
      
      trend = avgScore - prevAvg;
    }

    // 2. Fetch Flashcards Due
    const today = new Date().toISOString();
    const { count: flashcardsDue } = await supabase
      .from("flashcard_reviews")
      .select("*", { count: 'exact', head: true })
      .eq("student_id", user.id)
      .lte("next_review", today);

    // 3. Fetch Roadmap Progress
    const { data: roadmapData } = await supabase
      .from("roadmap_progress")
      .select("status")
      .eq("student_id", user.id);
    
    let completedRoadmaps = 0;
    let roadmapProgress = 0;
    
    if (roadmapData && roadmapData.length > 0) {
        completedRoadmaps = roadmapData.filter(r => r.status === 'done').length;
        roadmapProgress = Math.round((completedRoadmaps / roadmapData.length) * 100);
    }

    siswaProps = {
      classGroup: profile.class_group,
      grades: formattedGrades,
      avgScore,
      prevAvg,
      trend,
      totalSubjects: formattedGrades.length,
      flashcardsDue: flashcardsDue || 0,
      roadmapProgress,
      completedRoadmaps,
    };
  } else {
    // Fetch Guru Data
    
    // 1. Get subjects taught by this teacher
    const { data: subjects } = await supabase
      .from("subjects")
      .select("id")
      .eq("teacher_id", user.id);

    const subjectIds = subjects?.map(s => s.id) || [];

    let studentsStats: { name: string; avg: number }[] = [];

    if (subjectIds.length > 0) {
      // 2. Get grades for these subjects along with student profiles
      const { data: grades } = await supabase
        .from("grades")
        .select("score, student_id, profiles!grades_student_id_fkey(full_name)")
        .in("subject_id", subjectIds);

      if (grades) {
        // Group by student
        const studentGrades: Record<string, { name: string; scores: number[] }> = {};
        
        grades.forEach((g: any) => {
          const studentId = g.student_id;
          const studentName = g.profiles?.full_name || "Unknown Student";
          
          if (!studentGrades[studentId]) {
            studentGrades[studentId] = { name: studentName, scores: [] };
          }
          studentGrades[studentId].scores.push(g.score);
        });

        // Calculate average for each student
        studentsStats = Object.values(studentGrades).map(student => ({
          name: student.name,
          avg: student.scores.reduce((a, b) => a + b, 0) / student.scores.length
        }));
      }
    } else {
        // If teacher has no subjects, we could fallback to all students or just return empty
        // For demonstration, let's fetch all students if no subjects are assigned
        const { data: allSiswa } = await supabase
            .from("profiles")
            .select("id, full_name")
            .eq("role", "siswa");
            
        if (allSiswa) {
            studentsStats = allSiswa.map(s => ({ name: s.full_name, avg: 0 }));
        }
    }

    const { data: myClass } = await supabase
      .from("classes")
      .select("invite_code, name")
      .eq("teacher_id", user.id)
      .single();

    guruProps = {
      className: myClass?.name || null,
      inviteCode: myClass?.invite_code || null,
      studentsStats,
    };
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Halo, {profile.full_name?.split(" ")[0] || "User"} 👋
        </h1>
        <p className="text-muted-foreground">
          {isGuru
            ? "Pantau statistik dan progres kelas Anda."
            : "Lihat progres belajar dan estimasi nilaimu."}
        </p>
      </div>

      {isGuru && guruProps ? (
        <GuruDashboard {...guruProps} />
      ) : siswaProps ? (
        <SiswaDashboard {...siswaProps} />
      ) : null}
    </div>
  );
}
