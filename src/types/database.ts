export type UserRole = "siswa" | "guru";

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  avatar_url: string | null;
  class_group: string | null;
  nisn: string | null;
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  class_group: string;
  teacher_id: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  score: number;
  type: "tugas" | "uts" | "uas" | "quiz";
  created_at: string;
  subjects?: Subject;
}

export interface Roadmap {
  id: string;
  title: string;
  description: string | null;
  mermaid_code: string;
  created_by: string;
  is_published: boolean;
  created_at: string;
  profiles?: Profile;
}

export interface RoadmapProgress {
  id: string;
  student_id: string;
  roadmap_id: string;
  node_id: string;
  status: "locked" | "active" | "done";
  completed_at: string | null;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subject_id: string | null;
  created_by: string;
  is_published: boolean;
  created_at: string;
  subjects?: Subject;
  profiles?: Profile;
  flashcards?: Flashcard[];
  _count?: number;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  order_index: number;
}

export interface FlashcardReview {
  id: string;
  student_id: string;
  flashcard_id: string;
  repetition: number;
  efactor: number;
  interval: number;
  next_review: string;
  last_reviewed: string;
}

export interface Schedule {
  id: string;
  teacher_id: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string;
  class_group: string;
}

// Navigation types
export interface NavItem {
  title: string;
  href: string;
  icon: string;
  description?: string;
}
