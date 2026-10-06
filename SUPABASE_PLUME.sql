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

-- ===== Compteurs par histoire : lecteurs, J'aime, favoris =====
create table if not exists public.plume_favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  story_id text not null,
  primary key (user_id, story_id)
);
alter table public.plume_favorites enable row level security;
drop policy if exists "own" on public.plume_favorites;
create policy "own" on public.plume_favorites for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create or replace view public.plume_read_counts as
  select story_id, count(distinct user_id)::int as n from public.plume_reads group by story_id;
create or replace view public.plume_story_like_counts as
  select split_part(key, ':', 1) as story_id, count(*)::int as n from public.plume_likes group by 1;
create or replace view public.plume_fav_counts as
  select story_id, count(*)::int as n from public.plume_favorites group by story_id;
grant select on public.plume_read_counts, public.plume_story_like_counts, public.plume_fav_counts to anon, authenticated;

-- ===== Lot 3 : statistiques d'auteur, signalements, blocages, suppression de compte =====

-- Dates de lecture (tendance de la semaine) et chiffres par chapitre
alter table public.plume_reads add column if not exists created_at timestamptz not null default now();
create index if not exists plume_reads_story on public.plume_reads(story_id, ch);

-- Modération : une histoire ou un commentaire peut être masqué
alter table public.plume_published add column if not exists hidden boolean not null default false;
alter table public.plume_comments add column if not exists hidden boolean not null default false;

create or replace view public.plume_chapter_reads as
  select story_id, ch, count(*)::int as n from public.plume_reads group by story_id, ch;
create or replace view public.plume_read_trend as
  select story_id,
    count(*) filter (where created_at >= now() - interval '7 days')::int as d7,
    count(*) filter (where created_at >= now() - interval '14 days' and created_at < now() - interval '7 days')::int as d14
  from public.plume_reads group by story_id;
create or replace view public.plume_comment_counts as
  select key, count(*)::int as n from public.plume_comments where not hidden group by key;
grant select on public.plume_chapter_reads, public.plume_read_trend, public.plume_comment_counts to anon, authenticated;

-- Seul l'auteur voit ses contenus masqués ; les autres ne les voient plus
drop policy if exists "plume_published read" on public.plume_published;
create policy "plume_published read" on public.plume_published for select using (not hidden or auth.uid() = author_id);
drop policy if exists "plume_comments read" on public.plume_comments;
create policy "plume_comments read" on public.plume_comments for select using (not hidden or auth.uid() = author_id);

-- Un auteur ne peut pas démasquer lui-même son contenu
create or replace function public.plume_guard_hidden() returns trigger language plpgsql as $$
begin
  if current_setting('plume.moderation', true) = 'on' then return new; end if;
  if tg_op = 'INSERT' then new.hidden := false; else new.hidden := old.hidden; end if;
  return new;
end $$;
drop trigger if exists plume_guard_hidden_pub on public.plume_published;
create trigger plume_guard_hidden_pub before insert or update on public.plume_published
  for each row execute function public.plume_guard_hidden();
drop trigger if exists plume_guard_hidden_cm on public.plume_comments;
create trigger plume_guard_hidden_cm before insert or update on public.plume_comments
  for each row execute function public.plume_guard_hidden();

-- Signalements : tout le monde peut signaler, personne ne peut les lire (sauf toi dans le SQL Editor)
create table if not exists public.plume_reports (
  id bigserial primary key,
  reporter uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('story','comment','user')),
  target_id text not null,
  reason text not null check (reason in ('sexuel','violence','harcelement','spam','plagiat','autre')),
  details text check (char_length(details) <= 500),
  created_at timestamptz not null default now(),
  unique (reporter, target_type, target_id)
);
alter table public.plume_reports enable row level security;
drop policy if exists "report insert" on public.plume_reports;
create policy "report insert" on public.plume_reports for insert with check (auth.uid() = reporter);

-- Masquage automatique à partir de 3 personnes différentes qui signalent le même contenu
create or replace function public.plume_report_threshold() returns trigger language plpgsql security definer set search_path = public as $$
declare n int;
begin
  perform set_config('plume.moderation', 'on', true);
  select count(*) into n from public.plume_reports where target_type = new.target_type and target_id = new.target_id;
  if n >= 3 then
    if new.target_type = 'story' then update public.plume_published set hidden = true where id = new.target_id;
    elsif new.target_type = 'comment' then update public.plume_comments set hidden = true where id::text = new.target_id;
    end if;
  end if;
  return new;
end $$;
drop trigger if exists plume_report_after on public.plume_reports;
create trigger plume_report_after after insert on public.plume_reports
  for each row execute function public.plume_report_threshold();

-- Masquer ou rétablir à la main (SQL Editor) : select plume_moderate('story', 'identifiant', false);
create or replace function public.plume_moderate(p_type text, p_id text, p_hidden boolean) returns void language plpgsql security definer set search_path = public as $$
begin
  perform set_config('plume.moderation', 'on', true);
  if p_type = 'story' then update public.plume_published set hidden = p_hidden where id = p_id;
  elsif p_type = 'comment' then update public.plume_comments set hidden = p_hidden where id::text = p_id;
  end if;
end $$;
revoke all on function public.plume_moderate(text, text, boolean) from public, anon, authenticated;

-- Blocages
create table if not exists public.plume_blocks (
  blocker uuid not null references auth.users(id) on delete cascade,
  blocked uuid not null references auth.users(id) on delete cascade,
  blocked_name text,
  created_at timestamptz not null default now(),
  primary key (blocker, blocked),
  check (blocker <> blocked)
);
alter table public.plume_blocks enable row level security;
drop policy if exists "own" on public.plume_blocks;
create policy "own" on public.plume_blocks for all using (auth.uid() = blocker) with check (auth.uid() = blocker);

-- Suppression de son propre compte (efface aussi ses données : elles sont liées au compte)
create or replace function public.delete_my_account() returns void language plpgsql security definer set search_path = public, auth as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
