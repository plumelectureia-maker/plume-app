import { createClient } from '@supabase/supabase-js';
import type { User, Story, Chapter, ReadingHistory } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// AUTH
// ============================================
export const auth = {
  signUp: async (email: string, password: string, username: string) => {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      const { error: userError } = await supabase.from('users').insert({
        id: authData.user.id,
        email,
        username,
        role: 'reader',
      });
      if (userError) throw userError;
    }

    return authData;
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  getCurrentUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  getCurrentSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },
};

// ============================================
// USERS
// ============================================
export const users = {
  getProfile: async (userId: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) throw error;
    return data;
  },

  getProfileByUsername: async (username: string): Promise<User> => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    if (error) throw error;
    return data;
  },

  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  uploadAvatar: async (userId: string, file: File) => {
    const ext = file.name.split('.').pop();
    const filename = `${userId}/avatar.${ext}`;
    const { error } = await supabase.storage
      .from('avatars')
      .upload(filename, file, { upsert: true });
    if (error) throw error;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filename);
    return data.publicUrl;
  },

  isFollowing: async (followerId: string, followingId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', followerId)
      .eq('following_id', followingId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  follow: async (followerId: string, followingId: string) => {
    const { error } = await supabase
      .from('followers')
      .insert({ follower_id: followerId, following_id: followingId });
    if (error) throw error;

    // Create notification
    await supabase.from('notifications').insert({
      user_id: followingId,
      type: 'new_follower',
      from_user_id: followerId,
    });
  },

  unfollow: async (followerId: string, followingId: string) => {
    const { error } = await supabase
      .from('followers')
      .delete()
      .eq('follower_id', followerId)
      .eq('following_id', followingId);
    if (error) throw error;
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('followers')
      .select('users!followers_follower_id_fkey(*)', { count: 'exact' })
      .eq('following_id', userId)
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data?.map(f => f.users) || [], total: count || 0 };
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('followers')
      .select('users!followers_following_id_fkey(*)', { count: 'exact' })
      .eq('follower_id', userId)
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data?.map(f => f.users) || [], total: count || 0 };
  },
};

// ============================================
// STORIES
// ============================================
export const stories = {
  getStory: async (storyId: string, userId?: string): Promise<Story> => {
    const { data, error } = await supabase
      .from('stories')
      .select('*, users(*)')
      .eq('id', storyId)
      .single();
    if (error) throw error;

    if (userId) {
      const [isLiked, isBookmarked] = await Promise.all([
        stories.isLiked(storyId, userId),
        stories.isBookmarked(storyId, userId),
      ]);
      data.is_liked = isLiked;
      data.is_bookmarked = isBookmarked;
    }

    return data;
  },

  getStoriesByAuthor: async (authorId: string, page = 1, limit = 10) => {
    const { data, error, count } = await supabase
      .from('stories')
      .select('*, users(*)', { count: 'exact' })
      .eq('author_id', authorId)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  getDiscoverStories: async (genre?: string, page = 1, limit = 20, userId?: string) => {
    let query = supabase
      .from('stories')
      .select('*, users(*)', { count: 'exact' })
      .eq('status', 'published');

    if (genre) {
      query = query.eq('genre', genre);
    }

    const { data, error, count } = await query
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    if (userId) {
      const storiesWithLikes = await Promise.all(
        (data || []).map(async story => ({
          ...story,
          is_liked: await stories.isLiked(story.id, userId),
          is_bookmarked: await stories.isBookmarked(story.id, userId),
        }))
      );
      return { data: storiesWithLikes, total: count || 0 };
    }

    return { data: data || [], total: count || 0 };
  },

  getFeedStories: async (userId: string, page = 1, limit = 10) => {
    // Récupérer les IDs des utilisateurs suivis
    const { data: followersData, error: followersError } = await supabase
      .from('followers')
      .select('following_id')
      .eq('follower_id', userId);
    if (followersError) throw followersError;
    
    const followingIds = followersData?.map(f => f.following_id) || [];
    
    // Si aucun suivi, retourner vide
    if (followingIds.length === 0) {
      return { data: [], total: 0 };
    }
    
    const { data, error, count } = await supabase
      .from('stories')
      .select('*, users(*)', { count: 'exact' })
      .in('author_id', followingIds)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    
    const storiesWithLikes = await Promise.all(
      (data || []).map(async story => ({
        ...story,
        is_liked: await stories.isLiked(story.id, userId),
        is_bookmarked: await stories.isBookmarked(story.id, userId),
      }))
    );
    
    return { data: storiesWithLikes, total: count || 0 };
  },

  createStory: async (authorId: string, story: Partial<Story>) => {
    const slug = (story.title || 'story').toLowerCase().replace(/\s+/g, '-');
    const { data, error } = await supabase
      .from('stories')
      .insert({ ...story, author_id: authorId, slug })
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  updateStory: async (storyId: string, updates: Partial<Story>) => {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteStory: async (storyId: string) => {
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);
    if (error) throw error;
  },

  publishStory: async (storyId: string) => {
    const { data, error } = await supabase
      .from('stories')
      .update({ status: 'published', published_at: new Date().toISOString() })
      .eq('id', storyId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  isLiked: async (storyId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('story_likes')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  like: async (storyId: string, userId: string) => {
    const { error } = await supabase
      .from('story_likes')
      .insert({ story_id: storyId, user_id: userId });
    if (error) throw error;

    const story = await stories.getStory(storyId);
    await supabase.from('notifications').insert({
      user_id: story.author_id,
      type: 'new_like',
      from_user_id: userId,
      story_id: storyId,
    });
  },

  unlike: async (storyId: string, userId: string) => {
    const { error } = await supabase
      .from('story_likes')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  isBookmarked: async (storyId: string, userId: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('story_id', storyId)
      .eq('user_id', userId)
      .maybeSingle();
    if (error) throw error;
    return !!data;
  },

  bookmark: async (storyId: string, userId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .insert({ story_id: storyId, user_id: userId });
    if (error) throw error;
  },

  unbookmark: async (storyId: string, userId: string) => {
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('story_id', storyId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  getBookmarks: async (userId: string, page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('bookmarks')
      .select('stories(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data?.map(b => b.stories) || [], total: count || 0 };
  },

  incrementViews: async (storyId: string) => {
    const { error } = await supabase.rpc('increment_views', { story_id: storyId });
    if (error) console.error('Error incrementing views:', error);
  },
};

// ============================================
// CHAPTERS
// ============================================
export const chapters = {
  getChapters: async (storyId: string) => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('story_id', storyId)
      .order('chapter_number', { ascending: true });
    if (error) throw error;
    return data;
  },

  getChapter: async (chapterId: string): Promise<Chapter> => {
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();
    if (error) throw error;
    return data;
  },

  createChapter: async (storyId: string, chapter: Partial<Chapter>) => {
    const { data, error } = await supabase
      .from('chapters')
      .insert({ ...chapter, story_id: storyId })
      .select()
      .single();
    if (error) throw error;

    // Create notification for followers
    const story = await stories.getStory(storyId);
    const { data: followers } = await supabase
      .from('followers')
      .select('follower_id')
      .eq('following_id', story.author_id);
    
    if (followers) {
      await supabase.from('notifications').insert(
        followers.map(f => ({
          user_id: f.follower_id,
          type: 'new_chapter',
          story_id: storyId,
        }))
      );
    }

    return data;
  },

  updateChapter: async (chapterId: string, updates: Partial<Chapter>) => {
    const { data, error } = await supabase
      .from('chapters')
      .update(updates)
      .eq('id', chapterId)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteChapter: async (chapterId: string) => {
    const { error } = await supabase
      .from('chapters')
      .delete()
      .eq('id', chapterId);
    if (error) throw error;
  },
};

// ============================================
// COMMENTS
// ============================================
export const comments = {
  getComments: async (storyId: string, page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('comments')
      .select('*, users(*)', { count: 'exact' })
      .eq('story_id', storyId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data || [], total: count || 0 };
  },

  addComment: async (storyId: string, userId: string, content: string) => {
    const { data, error } = await supabase
      .from('comments')
      .insert({ story_id: storyId, user_id: userId, content })
      .select('*, users(*)')
      .single();
    if (error) throw error;

    const story = await stories.getStory(storyId);
    await supabase.from('notifications').insert({
      user_id: story.author_id,
      type: 'new_comment',
      from_user_id: userId,
      story_id: storyId,
    });

    return data;
  },

  deleteComment: async (commentId: string) => {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);
    if (error) throw error;
  },
};

// ============================================
// READING HISTORY
// ============================================
export const readingHistory = {
  updateProgress: async (userId: string, storyId: string, progress: Partial<ReadingHistory>) => {
    const { data: existing } = await supabase
      .from('reading_history')
      .select('*')
      .eq('user_id', userId)
      .eq('story_id', storyId)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from('reading_history')
        .update(progress)
        .eq('id', existing.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      const { data, error } = await supabase
        .from('reading_history')
        .insert({ user_id: userId, story_id: storyId, ...progress })
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },

  getHistory: async (userId: string, page = 1, limit = 20) => {
    const { data, error, count } = await supabase
      .from('reading_history')
      .select('*, stories(*)', { count: 'exact' })
      .eq('user_id', userId)
      .order('last_read_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
    if (error) throw error;
    return { data: data?.map(h => ({ ...h, story: h.stories })) || [], total: count || 0 };
  },
};

// ============================================
// NOTIFICATIONS
// ============================================
export const notifications = {
  getNotifications: async (userId: string, limit = 20) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, from_user:users(*), story:stories(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data;
  },

  markAsRead: async (notificationId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    if (error) throw error;
  },

  markAllAsRead: async (userId: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
    if (error) throw error;
  },
};
