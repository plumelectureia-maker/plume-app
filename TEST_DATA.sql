-- ============================================
-- PLUME - DONNÉES DE TEST
-- Copier-coller dans SQL Editor Supabase
-- ============================================

-- Créer un utilisateur de test
INSERT INTO public.users (id, email, username, bio, role, plan)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'auteur@plume.test',
  'Auteur Plume',
  'Écrivain passionné de fiction',
  'writer',
  'free'
) ON CONFLICT DO NOTHING;

-- Histoire 1: Fantasy - Les Vagues de l'Infini
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, cover_color_1, cover_color_2, reading_time_minutes, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Les Vagues de l''Infini',
  'les-vagues-de-linfini',
  'Une jeune fille découvre un secret caché sous les flots d''une île mystérieuse. Entre amour et magie, elle doit choisir entre deux mondes.',
  'Fantasy',
  'published',
  'maree',
  '#1F5F5B',
  '#2F7A6D',
  15,
  NOW()
);

-- Histoire 2: Romance - Entre les Pages
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, cover_color_1, cover_color_2, reading_time_minutes, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Entre les Pages',
  'entre-les-pages',
  'Deux écrivains se rencontrent dans une librairie de nuit. Leurs mondes fictifs s''entrelacent dans une histoire d''amour improbable.',
  'Romance',
  'published',
  'papier',
  '#E8A87C',
  '#D97D3E',
  12,
  NOW()
);

-- Histoire 3: Thriller - L'Ombre du Doute
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, cover_color_1, cover_color_2, reading_time_minutes, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'L''Ombre du Doute',
  'lombre-du-doute',
  'Un inspecteur enquête sur une série de crimes mystérieux. Mais et si le coupable était plus proche qu''il ne le pense?',
  'Thriller',
  'published',
  'verre',
  '#2C2C2C',
  '#1A1A1A',
  18,
  NOW()
);

-- Histoire 4: Science-Fiction - Demain n'existe pas
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, cover_color_1, cover_color_2, reading_time_minutes, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Demain n''existe pas',
  'demain-nexiste-pas',
  'En 2247, les voyages temporels sont interdits. Une rébelle tente de changer le passé pour sauver son père.',
  'Science-Fiction',
  'published',
  'plume',
  '#001F3F',
  '#0074D9',
  20,
  NOW()
);

-- Histoire 5: Drame - Les Silences
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, cover_color_1, cover_color_2, reading_time_minutes, published_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Les Silences',
  'les-silences',
  'Une mère et son fils ne se sont pas parlé depuis 10 ans. Quand l''une se meurt, les paroles oubliées resurgissent enfin.',
  'Drame',
  'published',
  'papier',
  '#8B4513',
  '#A0522D',
  14,
  NOW()
);

-- Ajouter des chapitres à la première histoire
INSERT INTO public.chapters (story_id, title, content, chapter_number, reading_time_minutes)
SELECT 
  id,
  'Chapitre 1: L''Appel des Flots',
  'Mina avait toujours entendu dire que la mer gardait ses secrets. Mais elle ne savait pas que l''un d''eux l''attendait depuis longtemps. Ce matin-là, en se réveillant, elle entendit quelque chose qu''elle n''aurait jamais dû entendre: une voix, douce et ancienne, qui l''appelait par son vrai nom. Celui qu''elle seule connaissait. Celui qu''elle avait caché toute sa vie.

Elle se leva avant l''aube, comme si elle était aimantée vers le rivage. L''air salé lui fouettait le visage. Ses pieds nus trouvaient leur chemin sur le sable froid. Et là, à la lisière de l''écume, elle vit quelque chose qui la figea sur place.',
  1,
  8
FROM public.stories WHERE slug = 'les-vagues-de-linfini';

INSERT INTO public.chapters (story_id, title, content, chapter_number, reading_time_minutes)
SELECT 
  id,
  'Chapitre 2: Le Choix',
  'La créature était belle et terrifiante à la fois. Ni totalement humaine, ni totalement autre. Elle souriait comme si elle attendait ce moment depuis mille ans.

"Tu dois décider," dit-elle. "Rester dans ce monde, ou me suivre dans le nôtre."

Mina tremblait. Son cœur battait la chamade. Comment pouvait-elle connaître une telle chose? Comment était-ce possible?

Mais quelque part au fond d''elle-même, elle savait déjà la réponse. Elle avait toujours su.',
  2,
  7
FROM public.stories WHERE slug = 'les-vagues-de-linfini';

-- Vérifier les données insérées
SELECT COUNT(*) as "Histoires créées" FROM public.stories WHERE author_id = '00000000-0000-0000-0000-000000000001';
SELECT COUNT(*) as "Chapitres créés" FROM public.chapters;
