create table public.crisis_events (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  session_id uuid references public.chat_sessions(id) on delete set null,
  message_id uuid references public.chat_messages(id) on delete set null,
  detected_keywords text[] not null,
  severity text not null check (severity in ('low', 'medium', 'high', 'critical')),
  user_message_excerpt text,
  response_action text,
  created_at timestamptz default now() not null
);

alter table public.crisis_events enable row level security;

-- Only service role can access crisis events (audit log — users cannot delete their own)
create policy "Service role only"
  on public.crisis_events for all
  using (auth.role() = 'service_role');
