create table public.mental_exercises (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  category text not null check (category in (
    'breathing', 'grounding', 'cognitive_reframe',
    'body_scan', 'journaling_prompt', 'distraction'
  )),
  difficulty text default 'easy' check (difficulty in ('easy', 'medium', 'hard')),
  duration_minutes integer,
  description text not null,
  steps jsonb not null,
  min_distress_level integer default 1 check (min_distress_level between 1 and 10),
  max_distress_level integer default 10 check (max_distress_level between 1 and 10),
  tags text[] default '{}',
  is_active boolean default true,
  created_at timestamptz default now() not null
);

alter table public.mental_exercises enable row level security;

create policy "Authenticated users can read exercises"
  on public.mental_exercises for select
  to authenticated
  using (is_active = true);

create table public.user_exercise_log (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  exercise_id uuid references public.mental_exercises(id) not null,
  session_id uuid references public.chat_sessions(id),
  distress_before integer check (distress_before between 1 and 10),
  distress_after integer check (distress_after between 1 and 10),
  completed boolean default false,
  feedback text,
  created_at timestamptz default now() not null
);

alter table public.user_exercise_log enable row level security;

create policy "Users can CRUD own exercise logs"
  on public.user_exercise_log for all
  using (auth.uid() = user_id);
