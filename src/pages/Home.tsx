import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store';
import { stories as storiesService } from '../services/supabase';
import { StoryItem, Loading, EmptyState } from '../components/Common';
import { BookOpen } from 'lucide-react';
import type { Story } from '../types';

const Home: React.FC = () => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadFeed = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await storiesService.getFeedStories(user.id, page);
        setStories(data);
      } catch (error) {
        console.error('Failed to load feed:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFeed();
  }, [user, page]);

  const handleLike = async (storyId: string) => {
    if (!user) return;
    try {
      const isLiked = await storiesService.isLiked(storyId, user.id);
      if (isLiked) {
        await storiesService.unlike(storyId, user.id);
      } else {
        await storiesService.like(storyId, user.id);
      }
      // Refresh stories
      const { data } = await storiesService.getFeedStories(user.id, page);
      setStories(data);
    } catch (error) {
      console.error('Failed to like story:', error);
    }
  };

  const handleBookmark = async (storyId: string) => {
    if (!user) return;
    try {
      const isBookmarked = await storiesService.isBookmarked(storyId, user.id);
      if (isBookmarked) {
        await storiesService.unbookmark(storyId, user.id);
      } else {
        await storiesService.bookmark(storyId, user.id);
      }
      // Refresh stories
      const { data } = await storiesService.getFeedStories(user.id, page);
      setStories(data);
    } catch (error) {
      console.error('Failed to bookmark story:', error);
    }
  };

  return (
    <main className="main-content max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Bienvenue, {user?.username}!</h1>
        <p className="text-gray-600 dark:text-gray-400">Découvrez les histoires de vos auteurs préférés</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={48} />}
          title="Aucune histoire à afficher"
          description="Suivez des auteurs pour voir leurs histoires ici"
        />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryItem
              key={story.id}
              story={story}
              onLike={() => handleLike(story.id)}
              onBookmark={() => handleBookmark(story.id)}
            />
          ))}

          {stories.length >= 10 && (
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50"
              >
                Précédent
              </button>
              <span className="px-4 py-2">Page {page}</span>
              <button
                onClick={() => setPage(page + 1)}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default Home;
