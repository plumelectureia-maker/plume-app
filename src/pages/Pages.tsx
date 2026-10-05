import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import { stories as storiesService, users as usersService, chapters as chaptersService } from '../services/supabase';
import { Button, StoryItem, Loading, Input, EmptyState, Card } from '../components/Common';
import { BookOpen, Users, Heart, FileText } from 'lucide-react';
import type { Story, Chapter, User } from '../types';

// ============================================
// DISCOVER PAGE
// ============================================
export const Discover: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [genre, setGenre] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const genres = ['Romance', 'Fantasy', 'Thriller', 'Drame', 'Science-Fiction', 'Mystère', 'Horreur'];

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true);
        const { data } = await storiesService.getDiscoverStories(genre, page, 20, user?.id);
        setStories(data);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [genre, page, user]);

  return (
    <main className="main-content max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Découvrir</h1>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setGenre(undefined); setPage(1); }}
          className={`px-4 py-2 rounded-full whitespace-nowrap ${
            !genre ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
          }`}
        >
          Tous
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => { setGenre(g); setPage(1); }}
            className={`px-4 py-2 rounded-full whitespace-nowrap ${
              genre === g ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loading />
        </div>
      ) : stories.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="Aucune histoire trouvée" />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryItem
              key={story.id}
              story={story}
              onClick={() => navigate(`/story/${story.slug}`)}
            />
          ))}
        </div>
      )}
    </main>
  );
};

// ============================================
// WRITE PAGE
// ============================================
export const Write: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [showNewStoryForm, setShowNewStoryForm] = useState(false);

  useEffect(() => {
    const loadStories = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const { data } = await storiesService.getStoriesByAuthor(user.id, 1, 50);
        setStories(data);
      } catch (error) {
        console.error('Failed to load stories:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStories();
  }, [user]);

  const handleCreateStory = async () => {
    if (!user || !newStoryTitle.trim()) return;
    try {
      const newStory = await storiesService.createStory(user.id, {
        title: newStoryTitle,
        summary: '',
      });
      setStories([...stories, newStory]);
      setNewStoryTitle('');
      setShowNewStoryForm(false);
      navigate(`/story/${newStory.slug}`);
    } catch (error) {
      console.error('Failed to create story:', error);
    }
  };

  return (
    <main className="main-content max-w-4xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Mes histoires</h1>
        <Button onClick={() => setShowNewStoryForm(true)}>+ Nouvelle</Button>
      </div>

      {showNewStoryForm && (
        <Card className="mb-6 p-6">
          <h2 className="text-xl font-bold mb-4">Créer une nouvelle histoire</h2>
          <Input
            label="Titre"
            value={newStoryTitle}
            onChange={(e) => setNewStoryTitle(e.target.value)}
            placeholder="Le titre de votre histoire..."
          />
          <div className="flex gap-2 mt-4">
            <Button onClick={handleCreateStory} disabled={!newStoryTitle.trim()}>
              Créer
            </Button>
            <Button variant="secondary" onClick={() => setShowNewStoryForm(false)}>
              Annuler
            </Button>
          </div>
        </Card>
      )}

      {loading ? (
        <Loading />
      ) : stories.length === 0 ? (
        <EmptyState
          icon={<FileText size={48} />}
          title="Aucune histoire"
          description="Créez votre première histoire"
          action={{ label: 'Créer', onClick: () => setShowNewStoryForm(true) }}
        />
      ) : (
        <div className="space-y-3">
          {stories.map((story) => (
            <Card key={story.id} className="cursor-pointer hover:shadow-md" onClick={() => navigate(`/story/${story.slug}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{story.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{story.summary || 'Pas de résumé'}</p>
                </div>
                <span className={`text-sm font-semibold ${story.status === 'published' ? 'text-green-600' : 'text-orange-600'}`}>
                  {story.status === 'published' ? 'Publié' : 'Brouillon'}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
};

// ============================================
// PROFILE PAGE
// ============================================
export const Profile: React.FC<{}> = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuthStore();
  const [profile, setProfile] = useState<User | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      if (!username) return;
      try {
        setLoading(true);
        const user = await usersService.getProfileByUsername(username);
        setProfile(user);
        const { data } = await storiesService.getStoriesByAuthor(user.id, 1, 20);
        setStories(data);

        if (currentUser && currentUser.id !== user.id) {
          const following = await usersService.isFollowing(currentUser.id, user.id);
          setIsFollowing(following);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [username, currentUser]);

  const handleFollow = async () => {
    if (!profile || !currentUser) return;
    try {
      if (isFollowing) {
        await usersService.unfollow(currentUser.id, profile.id);
      } else {
        await usersService.follow(currentUser.id, profile.id);
      }
      setIsFollowing(!isFollowing);
      setProfile({ ...profile, followers_count: profile.followers_count + (isFollowing ? -1 : 1) });
    } catch (error) {
      console.error('Failed to follow:', error);
    }
  };

  if (loading) return <Loading />;
  if (!profile) return <EmptyState icon={<Users size={48} />} title="Profil non trouvé" />;

  return (
    <main className="main-content max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">{profile.username}</h1>
            <p className="text-gray-600 dark:text-gray-400">{profile.bio || 'Pas de bio'}</p>
            <div className="flex gap-6 mt-4 text-sm">
              <div><span className="font-bold">{profile.stories_count}</span> histoires</div>
              <div><span className="font-bold">{profile.followers_count}</span> followers</div>
              <div><span className="font-bold">{profile.reading_time_minutes}</span> min de lecture</div>
            </div>
          </div>
          {currentUser && currentUser.id !== profile.id && (
            <Button onClick={handleFollow} variant={isFollowing ? 'secondary' : 'primary'}>
              {isFollowing ? 'Suivi' : 'Suivre'}
            </Button>
          )}
        </div>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Histoires</h2>
      {stories.length === 0 ? (
        <EmptyState icon={<BookOpen size={48} />} title="Aucune histoire publiée" />
      ) : (
        <div className="space-y-4">
          {stories.map((story) => (
            <StoryItem key={story.id} story={story} />
          ))}
        </div>
      )}
    </main>
  );
};

// ============================================
// AUTH PAGE
// ============================================
export const Auth: React.FC<{}> = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuthStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, username);
      }
      navigate('/');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-md mx-auto p-4 flex items-center justify-center min-h-screen">
      <Card>
        <h1 className="text-3xl font-bold mb-6 text-center">Plume</h1>

        {error && <div className="p-3 mb-4 bg-red-100 text-red-700 rounded">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              label="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Mot de passe"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" loading={loading} className="w-full">
            {isLogin ? 'Se connecter' : "S'inscrire"}
          </Button>
        </form>

        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setError('');
          }}
          className="w-full mt-4 text-blue-600 hover:underline"
        >
          {isLogin ? "Créer un compte" : "Se connecter"}
        </button>
      </Card>
    </main>
  );
};

// ============================================
// STORY DETAIL PAGE
// ============================================
export const StoryDetail: React.FC<{}> = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuthStore();
  const [story, setStory] = useState<Story | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStory = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const foundStory = await storiesService.getStoryBySlug(slug, user?.id);
        if (foundStory) {
          setStory(foundStory);
          const chaps = await chaptersService.getChapters(foundStory.id);
          setChapters(chaps);
        }
      } catch (error) {
        console.error('Failed to load story:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [slug, user]);

  if (loading) return <Loading />;
  if (!story) return <EmptyState icon={<BookOpen size={48} />} title="Histoire non trouvée" />;

  const selectedChapter = chapters.find(c => c.id === selectedChapterId);
  const selectedIndex = chapters.findIndex(c => c.id === selectedChapterId);

  return (
    <main className="main-content max-w-4xl mx-auto p-4">
      {!selectedChapter ? (
        <>
          <Card>
            <h1 className="text-3xl font-bold mb-2">{story.title}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{story.author?.username}</p>
            <p className="mb-6">{story.summary}</p>
            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Heart size={20} /> {story.likes_count}
              </div>
              <div className="flex items-center gap-2">
                <FileText size={20} /> {chapters.length} chapitres
              </div>
            </div>
          </Card>

          <h2 className="text-2xl font-bold mt-8 mb-4">Chapitres</h2>
          <div className="space-y-2">
            {chapters.length === 0 ? (
              <EmptyState icon={<BookOpen size={48} />} title="Aucun chapitre publié" />
            ) : (
              chapters.map((chapter, i) => (
                <Card
                  key={chapter.id}
                  className="cursor-pointer hover:shadow-md"
                  onClick={() => setSelectedChapterId(chapter.id)}
                >
                  <h3 className="font-bold">{chapter.title || `Chapitre ${i + 1}`}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{chapter.reading_time_minutes} min de lecture</p>
                </Card>
              ))
            )}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => setSelectedChapterId(null)}
            className="mb-4 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            ← Retour à la table des matières
          </button>

          <Card>
            <h1 className="text-3xl font-bold mb-2">{selectedChapter.title || `Chapitre ${selectedIndex + 1}`}</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{story.author?.username}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{selectedChapter.reading_time_minutes} min de lecture</p>

            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="whitespace-pre-wrap">{selectedChapter.content}</p>
            </div>

            {chapters.length > 1 && (
              <div className="flex gap-2 mt-8 justify-between">
                <button
                  onClick={() => setSelectedChapterId(chapters[selectedIndex - 1].id)}
                  disabled={selectedIndex === 0}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded disabled:opacity-50 hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  ← Chapitre précédent
                </button>
                <span className="px-4 py-2">
                  {selectedIndex + 1} / {chapters.length}
                </span>
                <button
                  onClick={() => setSelectedChapterId(chapters[selectedIndex + 1].id)}
                  disabled={selectedIndex === chapters.length - 1}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50 hover:bg-blue-700"
                >
                  Chapitre suivant →
                </button>
              </div>
            )}
          </Card>
        </div>
      )}
    </main>
  );
};

// ============================================
// NOT FOUND PAGE
// ============================================
export const NotFound: React.FC<{}> = () => (
  <main className="main-content flex items-center justify-center min-h-screen">
    <EmptyState
      icon={<BookOpen size={48} />}
      title="Page non trouvée"
      description="Cette page n'existe pas"
    />
  </main>
);
