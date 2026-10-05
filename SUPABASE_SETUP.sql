-- ============================================
-- PLUME APP - SCHEMA SUPABASE
-- Copier-coller dans l'éditeur SQL de Supabase
-- ============================================

-- Enable extensions
create extension if not exists "uuid-ossp";

-- Enum types
create type user_role as enum ('reader', 'writer', 'premium', 'admin');
create type story_genre as enum ('Romance', 'Fantasy', 'Thriller', 'Drame', 'Science-Fiction', 'Mystère', 'Horreur');

-- ============================================
-- UTILISATEURS
-- ============================================
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  username text not null unique,
  avatar_url text,
  bio text,
  role user_role default 'reader',
  followers_count int default 0,
  stories_count int default 0,
  reading_time_minutes int default 0,
  plan text default 'free', -- free, premium, writer
  plan_expires_at timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- STORIES (Histoires)
-- ============================================
create table public.stories (
  id uuid primary key default uuid_generate_v4(),
  author_id uuid not null references public.users(id) on delete cascade,
  title text not null,
  slug text unique,
  summary text,
  cover_color_1 text default '#1F5F5B',
  cover_color_2 text default '#2F7A6D',
  cover_pattern text default 'plume',
  genre story_genre,
  status text default 'draft', -- draft, published, completed
  reading_time_minutes int default 5,
  views_count int default 0,
  likes_count int default 0,
  comments_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  published_at timestamp with time zone
);

-- ============================================
-- CHAPTERS (Chapitres)
-- ============================================
create table public.chapters (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  title text not null,
  content text not null,
  chapter_number int not null,
  reading_time_minutes int default 5,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- COMMENTS (Commentaires)
-- ============================================
create table public.comments (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  content text not null,
  likes_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- LIKES (Likes sur stories)
-- ============================================
create table public.story_likes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(story_id, user_id)
);

-- ============================================
-- BOOKMARKS (Signets)
-- ============================================
create table public.bookmarks (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references public.stories(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(story_id, user_id)
);

-- ============================================
-- FOLLOWERS
-- ============================================
create table public.followers (
  id uuid primary key default uuid_generate_v4(),
  follower_id uuid not null references public.users(id) on delete cascade,
  following_id uuid not null references public.users(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(follower_id, following_id),
  check (follower_id != following_id)
);

-- ============================================
-- READING HISTORY (Historique de lecture)
-- ============================================
create table public.reading_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  story_id uuid not null references public.stories(id) on delete cascade,
  chapter_id uuid references public.chapters(id) on delete cascade,
  progress_percent int default 0,
  reading_time_minutes int default 0,
  last_read_at timestamp with time zone default now(),
  unique(user_id, story_id)
);

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table public.notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null, -- new_follower, new_like, new_comment, new_chapter
  from_user_id uuid references public.users(id) on delete cascade,
  story_id uuid references public.stories(id) on delete cascade,
  is_read bool default false,
  created_at timestamp with time zone default now()
);

-- ============================================
-- INDEX (pour performance)
-- ============================================
create index stories_author_id on public.stories(author_id);
create index stories_genre on public.stories(genre);
create index stories_published_at on public.stories(published_at);
create index chapters_story_id on public.chapters(story_id);
create index comments_story_id on public.comments(story_id);
create index comments_user_id on public.comments(user_id);
create index story_likes_user_id on public.story_likes(user_id);
create index bookmarks_user_id on public.bookmarks(user_id);
create index followers_follower_id on public.followers(follower_id);
create index reading_history_user_id on public.reading_history(user_id);
create index notifications_user_id on public.notifications(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.stories enable row level security;
alter table public.chapters enable row level security;
alter table public.comments enable row level security;
alter table public.story_likes enable row level security;
alter table public.bookmarks enable row level security;
alter table public.followers enable row level security;
alter table public.reading_history enable row level security;
alter table public.notifications enable row level security;

-- Users: lire profil public, modifier le sien
create policy "Users can view profiles" on public.users
  for select using (true);

create policy "Users can update their own profile" on public.users
  for update using (auth.uid() = id);

-- Stories: lire publiques, créer et modifier ses propres
create policy "Anyone can view published stories" on public.stories
  for select using (status = 'published' or author_id = auth.uid());

create policy "Users can create stories" on public.stories
  for insert with check (auth.uid() = author_id);

create policy "Users can update their own stories" on public.stories
  for update using (auth.uid() = author_id);

-- Chapitres: lire si story accessible, modifier si author
create policy "Anyone can read chapters of accessible stories" on public.chapters
  for select using (
    exists (
      select 1 from public.stories
      where stories.id = chapters.story_id
      and (stories.status = 'published' or stories.author_id = auth.uid())
    )
  );

create policy "Users can insert chapters to their stories" on public.chapters
  for insert with check (
    exists (
      select 1 from public.stories
      where stories.id = chapters.story_id
      and stories.author_id = auth.uid()
    )
  );

-- Commentaires: lire tous, poster les siens
create policy "Anyone can read comments" on public.comments
  for select using (true);

create policy "Authenticated users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

-- Likes, bookmarks, followers: gérer les siens
create policy "Users can manage their own likes" on public.story_likes
  for all using (auth.uid() = user_id);

create policy "Users can manage their own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id);

create policy "Users can manage their own followers" on public.followers
  for all using (auth.uid() = follower_id);

-- Reading history: gérer la sienne
create policy "Users can manage their reading history" on public.reading_history
  for all using (auth.uid() = user_id);

-- Notifications: lire les siennes
create policy "Users can read their notifications" on public.notifications
  for select using (auth.uid() = user_id);

create policy "Users can update their notifications" on public.notifications
  for update using (auth.uid() = user_id);

-- ============================================
-- FONCTIONS
-- ============================================

-- Mettre à jour followers_count quand quelqu'un follow
create or replace function update_followers_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.users set followers_count = followers_count + 1 where id = new.following_id;
  elsif tg_op = 'DELETE' then
    update public.users set followers_count = followers_count - 1 where id = old.following_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger followers_count_trigger
after insert or delete on public.followers
for each row execute function update_followers_count();

-- Mettre à jour stories_count
create or replace function update_stories_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' and new.status = 'published' then
    update public.users set stories_count = stories_count + 1 where id = new.author_id;
  elsif tg_op = 'UPDATE' and old.status != 'published' and new.status = 'published' then
    update public.users set stories_count = stories_count + 1 where id = new.author_id;
  elsif tg_op = 'DELETE' and old.status = 'published' then
    update public.users set stories_count = stories_count - 1 where id = old.author_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger stories_count_trigger
after insert or update or delete on public.stories
for each row execute function update_stories_count();

-- Mettre à jour likes_count sur stories
create or replace function update_story_likes_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.stories set likes_count = likes_count + 1 where id = new.story_id;
  elsif tg_op = 'DELETE' then
    update public.stories set likes_count = likes_count - 1 where id = old.story_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger story_likes_count_trigger
after insert or delete on public.story_likes
for each row execute function update_story_likes_count();

-- Mettre à jour comments_count sur stories
create or replace function update_comments_count()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    update public.stories set comments_count = comments_count + 1 where id = new.story_id;
  elsif tg_op = 'DELETE' then
    update public.stories set comments_count = comments_count - 1 where id = old.story_id;
  end if;
  return null;
end;
$$ language plpgsql;

create trigger comments_count_trigger
after insert or delete on public.comments
for each row execute function update_comments_count();
