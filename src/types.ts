export type UserRole = 'reader' | 'writer' | 'premium' | 'admin';
export type StoryGenre = 'Romance' | 'Fantasy' | 'Thriller' | 'Drame' | 'Science-Fiction' | 'Mystère' | 'Horreur';
export type StoryStatus = 'draft' | 'published' | 'completed';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  role: UserRole;
  followers_count: number;
  stories_count: number;
  reading_time_minutes: number;
  plan: string;
  plan_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  summary: string;
  cover_color_1: string;
  cover_color_2: string;
  cover_pattern: string;
  genre: StoryGenre;
  status: StoryStatus;
  reading_time_minutes: number;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  author?: User;
  is_liked?: boolean;
  is_bookmarked?: boolean;
}

export interface Chapter {
  id: string;
  story_id: string;
  title: string;
  content: string;
  chapter_number: number;
  reading_time_minutes: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  story_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface ReadingHistory {
  id: string;
  user_id: string;
  story_id: string;
  chapter_id?: string;
  progress_percent: number;
  reading_time_minutes: number;
  last_read_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'new_follower' | 'new_like' | 'new_comment' | 'new_chapter';
  from_user_id?: string;
  story_id?: string;
  is_read: boolean;
  created_at: string;
  from_user?: User;
  story?: Story;
}

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}
