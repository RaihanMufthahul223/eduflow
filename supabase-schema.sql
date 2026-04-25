-- ============================================
-- EduFlow Database Schema
-- Run this SQL in your Supabase SQL Editor
-- ============================================

-- 1. Enable UUID extension (biasanya sudah aktif)
create extension if not exists "uuid-ossp";

-- 2. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null check (role in ('siswa', 'guru')),
  avatar_url text,
  class_group text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Guru can view student profiles in same class
create policy "Guru can view class profiles"
  on public.profiles for select
  using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
      and p.role = 'guru'
    )
  );

-- Trigger: Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, class_group)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'User'),
    coalesce(new.raw_user_meta_data->>'role', 'siswa'),
    new.raw_user_meta_data->>'class_group'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Subjects table
create table public.subjects (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  class_group text not null,
  teacher_id uuid references public.profiles(id) on delete cascade
);

alter table public.subjects enable row level security;

create policy "Anyone can view subjects"
  on public.subjects for select
  using (true);

create policy "Guru can manage subjects"
  on public.subjects for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'guru'
    )
  );

-- 4. Grades table
create table public.grades (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  subject_id uuid references public.subjects(id) on delete cascade not null,
  score numeric not null check (score >= 0 and score <= 100),
  type text not null check (type in ('tugas', 'uts', 'uas', 'quiz')),
  created_at timestamptz default now()
);

alter table public.grades enable row level security;

create policy "Students can view own grades"
  on public.grades for select
  using (auth.uid() = student_id);

create policy "Guru can manage grades"
  on public.grades for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'guru'
    )
  );

-- 5. Roadmaps table
create table public.roadmaps (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  mermaid_code text not null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.roadmaps enable row level security;

create policy "Anyone can view published roadmaps"
  on public.roadmaps for select
  using (is_published = true or auth.uid() = created_by);

create policy "Guru can create roadmaps"
  on public.roadmaps for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'guru'
    )
  );

create policy "Guru can update own roadmaps"
  on public.roadmaps for update
  using (auth.uid() = created_by);

create policy "Guru can delete own roadmaps"
  on public.roadmaps for delete
  using (auth.uid() = created_by);

-- 6. Roadmap Progress table
create table public.roadmap_progress (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  roadmap_id uuid references public.roadmaps(id) on delete cascade not null,
  node_id text not null,
  status text not null default 'locked' check (status in ('locked', 'active', 'done')),
  completed_at timestamptz,
  unique(student_id, roadmap_id, node_id)
);

alter table public.roadmap_progress enable row level security;

create policy "Students can manage own progress"
  on public.roadmap_progress for all
  using (auth.uid() = student_id);

create policy "Guru can view progress"
  on public.roadmap_progress for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'guru'
    )
  );

-- 7. Flashcard Decks table
create table public.flashcard_decks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  subject_id uuid references public.subjects(id) on delete set null,
  created_by uuid references public.profiles(id) on delete cascade not null,
  is_published boolean default false,
  created_at timestamptz default now()
);

alter table public.flashcard_decks enable row level security;

create policy "Anyone can view published decks"
  on public.flashcard_decks for select
  using (is_published = true or auth.uid() = created_by);

create policy "Guru can create decks"
  on public.flashcard_decks for insert
  with check (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'guru'
    )
  );

create policy "Guru can update own decks"
  on public.flashcard_decks for update
  using (auth.uid() = created_by);

create policy "Guru can delete own decks"
  on public.flashcard_decks for delete
  using (auth.uid() = created_by);

-- 8. Flashcards table
create table public.flashcards (
  id uuid default uuid_generate_v4() primary key,
  deck_id uuid references public.flashcard_decks(id) on delete cascade not null,
  front text not null,
  back text not null,
  order_index integer default 0
);

alter table public.flashcards enable row level security;

create policy "Anyone can view cards of published decks"
  on public.flashcards for select
  using (
    exists (
      select 1 from public.flashcard_decks
      where id = deck_id and (is_published = true or created_by = auth.uid())
    )
  );

create policy "Guru can manage cards"
  on public.flashcards for all
  using (
    exists (
      select 1 from public.flashcard_decks
      where id = deck_id and created_by = auth.uid()
    )
  );

-- 9. Flashcard Reviews (Spaced Repetition State)
create table public.flashcard_reviews (
  id uuid default uuid_generate_v4() primary key,
  student_id uuid references public.profiles(id) on delete cascade not null,
  flashcard_id uuid references public.flashcards(id) on delete cascade not null,
  repetition integer default 0,
  efactor numeric default 2.5,
  interval integer default 0,
  next_review date default current_date,
  last_reviewed timestamptz default now(),
  unique(student_id, flashcard_id)
);

alter table public.flashcard_reviews enable row level security;

create policy "Students manage own reviews"
  on public.flashcard_reviews for all
  using (auth.uid() = student_id);

-- 10. Schedules table
create table public.schedules (
  id uuid default uuid_generate_v4() primary key,
  teacher_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  date date not null,
  time_start time not null,
  time_end time not null,
  class_group text not null
);

alter table public.schedules enable row level security;

create policy "Anyone can view schedules"
  on public.schedules for select
  using (true);

create policy "Guru can manage schedules"
  on public.schedules for all
  using (auth.uid() = teacher_id);
