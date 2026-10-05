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

-- ===== Réactions, J'aime, lectures, abonnements (compteurs partagés) =====
create table if not exists public.plume_reactions (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  reaction text not null check (reaction in ('love','frisson','emu','drole','decroche')),
  primary key (user_id, key)
);
create table if not exists public.plume_likes (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  primary key (user_id, key)
);
create table if not exists public.plume_reads (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null,
  ch int not null,
  primary key (user_id, story_id, ch)
);
create table if not exists public.plume_follows (
  follower uuid not null references auth.users(id) on delete cascade,
  followee text not null,
  primary key (follower, followee)
);
alter table public.plume_reactions enable row level security;
alter table public.plume_likes enable row level security;
alter table public.plume_reads enable row level security;
alter table public.plume_follows enable row level security;
drop policy if exists "own" on public.plume_reactions;
drop policy if exists "own" on public.plume_likes;
drop policy if exists "own" on public.plume_reads;
drop policy if exists "own" on public.plume_follows;
create policy "own" on public.plume_reactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.plume_likes for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.plume_reads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own" on public.plume_follows for all using (auth.uid() = follower) with check (auth.uid() = follower);

-- Totaux publics (les vues ne révèlent pas qui a réagi)
create or replace view public.plume_reaction_counts as
  select key, reaction, count(*)::int as n from public.plume_reactions group by key, reaction;
create or replace view public.plume_like_counts as
  select key, count(*)::int as n from public.plume_likes group by key;
create or replace view public.plume_read_counts as
  select story_id, count(*)::int as n from public.plume_reads group by story_id;
create or replace view public.plume_follow_counts as
  select followee, count(*)::int as n from public.plume_follows group by followee;
grant select on public.plume_reaction_counts, public.plume_like_counts, public.plume_read_counts, public.plume_follow_counts to anon, authenticated;
create index if not exists plume_reactions_key on public.plume_reactions(key);
create index if not exists plume_likes_key on public.plume_likes(key);

-- ===== Forfaits attribués (seul l'administrateur les modifie, ici dans le SQL Editor) =====
create table if not exists public.plume_entitlements (
  email text primary key,
  plan text not null check (plan in ('plus','pp'))
);
alter table public.plume_entitlements enable row level security;
drop policy if exists "read own plan" on public.plume_entitlements;
create policy "read own plan" on public.plume_entitlements
  for select using (lower(email) = lower(auth.jwt() ->> 'email'));
insert into public.plume_entitlements (email, plan) values ('plume.lecture.ia@gmail.com', 'pp')
  on conflict (email) do update set plan = excluded.plan;

-- ===== Jaquettes =====
insert into storage.buckets (id, name, public) values ('covers', 'covers', true)
  on conflict (id) do update set public = true;
drop policy if exists "covers read" on storage.objects;
drop policy if exists "covers insert" on storage.objects;
drop policy if exists "covers delete" on storage.objects;
create policy "covers read" on storage.objects for select using (bucket_id = 'covers');
create policy "covers insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "covers delete" on storage.objects for delete to authenticated
  using (bucket_id = 'covers' and (storage.foldername(name))[1] = auth.uid()::text);

-- ===== Crédits du coach IA (une ligne par utilisation, ni modifiable ni supprimable par l'utilisateur) =====
create table if not exists public.plume_ai_usage (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  credits int not null check (credits between 1 and 10),
  kind text,
  created_at timestamptz not null default now()
);
alter table public.plume_ai_usage enable row level security;
create index if not exists plume_ai_usage_user on public.plume_ai_usage(user_id, created_at);
drop policy if exists "usage read own" on public.plume_ai_usage;
drop policy if exists "usage insert own" on public.plume_ai_usage;
create policy "usage read own" on public.plume_ai_usage for select using (auth.uid() = user_id);
create policy "usage insert own" on public.plume_ai_usage for insert with check (auth.uid() = user_id);
