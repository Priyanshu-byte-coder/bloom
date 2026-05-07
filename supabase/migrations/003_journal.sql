create table public.journal_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  content text not null,
  mood_score integer check (mood_score >= 1 and mood_score <= 10),
  tags text[] default '{}',
  deleted_at timestamptz,
  embedding_status text default 'pending' check (embedding_status in ('pending', 'processing', 'done', 'failed')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_journal_entries_user_id on public.journal_entries(user_id);
create index idx_journal_entries_created_at on public.journal_entries(created_at desc);
create index idx_journal_entries_embedding_status on public.journal_entries(embedding_status) where deleted_at is null;

alter table public.journal_entries enable row level security;

create policy "Users can CRUD own journal entries"
  on public.journal_entries for all
  using (auth.uid() = user_id);
