-- Plume : tables de l'application (à exécuter une fois dans Supabase > SQL Editor)

create table if not exists public.plume_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.plume_state enable row level security;
drop policy if exists "plume_state own" on public.plume_state;
create policy "plume_state own" on public.plume_state
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.plume_published (
  id text primary key,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  story jsonb not null,
  updated_at timestamptz not null default now()
);
alter table public.plume_published enable row level security;
drop policy if exists "plume_published read" on public.plume_published;
drop policy if exists "plume_published write" on public.plume_published;
create policy "plume_published read" on public.plume_published for select using (true);
create policy "plume_published write" on public.plume_published
  for all using (auth.uid() = author_id) with check (auth.uid() = author_id);

create table if not exists public.plume_comments (
  id bigserial primary key,
  key text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text,
  body text not null check (char_length(body) between 1 and 280),
  created_at timestamptz not null default now()
);
create index if not exists plume_comments_key on public.plume_comments(key);
alter table public.plume_comments enable row level security;
drop policy if exists "plume_comments read" on public.plume_comments;
drop policy if exists "plume_comments insert" on public.plume_comments;
drop policy if exists "plume_comments delete" on public.plume_comments;
create policy "plume_comments read" on public.plume_comments for select using (true);
create policy "plume_comments insert" on public.plume_comments for insert with check (auth.uid() = author_id);
create policy "plume_comments delete" on public.plume_comments for delete using (auth.uid() = author_id);
