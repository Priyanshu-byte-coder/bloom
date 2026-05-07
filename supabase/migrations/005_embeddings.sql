create table public.embeddings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  source_type text not null check (source_type in ('journal', 'chat_message')),
  source_id uuid not null,
  content_chunk text not null,
  embedding vector(384) not null,
  metadata jsonb default '{}',
  created_at timestamptz default now() not null
);

create index idx_embeddings_vector on public.embeddings
  using ivfflat (embedding vector_cosine_ops) with (lists = 100);

create index idx_embeddings_user_id on public.embeddings(user_id);
create index idx_embeddings_source on public.embeddings(source_type, source_id);

alter table public.embeddings enable row level security;

create policy "Users can view own embeddings"
  on public.embeddings for select
  using (auth.uid() = user_id);

create policy "Service role can manage embeddings"
  on public.embeddings for all
  using (auth.role() = 'service_role');

create or replace function match_user_embeddings(
  query_embedding vector(384),
  match_user_id uuid,
  match_threshold float default 0.7,
  match_count int default 5
)
returns table (
  id uuid,
  source_type text,
  source_id uuid,
  content_chunk text,
  similarity float,
  metadata jsonb
)
language sql stable
as $$
  select
    e.id,
    e.source_type,
    e.source_id,
    e.content_chunk,
    1 - (e.embedding <=> query_embedding) as similarity,
    e.metadata
  from public.embeddings e
  where
    e.user_id = match_user_id
    and 1 - (e.embedding <=> query_embedding) > match_threshold
  order by e.embedding <=> query_embedding
  limit match_count;
$$;
