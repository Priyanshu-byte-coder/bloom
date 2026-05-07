create table public.chat_sessions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text,
  session_type text default 'general' check (session_type in ('general', 'crisis', 'exercise')),
  crisis_flag boolean default false,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_chat_sessions_user_id on public.chat_sessions(user_id);

alter table public.chat_sessions enable row level security;

create policy "Users can CRUD own chat sessions"
  on public.chat_sessions for all
  using (auth.uid() = user_id);

create table public.chat_messages (
  id uuid default uuid_generate_v4() primary key,
  session_id uuid references public.chat_sessions(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  crisis_detected boolean default false,
  crisis_keywords text[] default '{}',
  embedding_status text default 'pending' check (embedding_status in ('pending', 'processing', 'done', 'failed', 'skip')),
  token_count integer,
  created_at timestamptz default now() not null
);

create index idx_chat_messages_session_id on public.chat_messages(session_id);
create index idx_chat_messages_user_id on public.chat_messages(user_id);
create index idx_chat_messages_embedding_status on public.chat_messages(embedding_status)
  where role = 'user';

alter table public.chat_messages enable row level security;

create policy "Users can CRUD own chat messages"
  on public.chat_messages for all
  using (auth.uid() = user_id);
