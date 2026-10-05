-- ============================================
-- PLUME - INSERT TEST DATA
-- Remplace UUID_ICI par ton vrai user ID de Supabase
-- ============================================

-- Remplace dc48646f-aae6-4559-971b-5a4e18120b11 par ton UUID si différent

-- 5 histoires de test
INSERT INTO public.stories (author_id, title, slug, summary, genre, status, cover_pattern, reading_time_minutes, published_at)
VALUES 
(
  'dc48646f-aae6-4559-971b-5a4e18120b11',
  'Les Vagues de l''Infini',
  'les-vagues-de-linfini',
  'Une jeune fille découvre un secret caché sous les flots d''une île mystérieuse',
  'Fantasy',
  'published',
  'maree',
  15,
  NOW() - INTERVAL '1 day'
),
(
  'dc48646f-aae6-4559-971b-5a4e18120b11',
  'Entre les Pages',
  'entre-les-pages',
  'Deux écrivains se rencontrent dans une librairie de nuit et leurs mondes fictifs s''entrelacent',
  'Romance',
  'published',
  'papier',
  12,
  NOW() - INTERVAL '2 days'
),
(
  'dc48646f-aae6-4559-971b-5a4e18120b11',
  'L''Ombre du Doute',
  'lombre-du-doute',
  'Un inspecteur enquête sur une série de crimes mystérieux. Mais le coupable est plus proche qu''il ne le pense',
  'Thriller',
  'published',
  'verre',
  18,
  NOW() - INTERVAL '3 days'
),
(
  'dc48646f-aae6-4559-971b-5a4e18120b11',
  'Demain n''existe pas',
  'demain-nexiste-pas',
  'En 2247, les voyages temporels sont interdits. Une rébelle tente de changer le passé',
  'Science-Fiction',
  'published',
  'plume',
  20,
  NOW() - INTERVAL '4 days'
),
(
  'dc48646f-aae6-4559-971b-5a4e18120b11',
  'Les Silences',
  'les-silences',
  'Une mère et son fils ne se sont pas parlé depuis 10 ans. Quand l''une se meurt, les paroles resurgissent enfin',
  'Drame',
  'published',
  'papier',
  14,
  NOW() - INTERVAL '5 days'
)
ON CONFLICT (slug) DO NOTHING;

-- Ajouter des chapitres à la première histoire (Les Vagues)
INSERT INTO public.chapters (story_id, title, content, chapter_number, reading_time_minutes)
SELECT 
  id,
  'Chapitre 1: L''Appel des Flots',
  'Mina avait toujours entendu dire que la mer gardait ses secrets. Mais elle ne savait pas que l''un d''eux l''attendait depuis longtemps. Ce matin-là, en se réveillant, elle entendit quelque chose qu''elle n''aurait jamais dû entendre: une voix, douce et ancienne, qui l''appelait par son vrai nom.

Elle se leva avant l''aube, comme si elle était aimantée vers le rivage. L''air salé lui fouettait le visage. Ses pieds nus trouvaient leur chemin sur le sable froid. Et là, à la lisière de l''écume, elle vit quelque chose qui la figea sur place.',
  1,
  8
FROM public.stories WHERE slug = 'les-vagues-de-linfini'
ON CONFLICT DO NOTHING;

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
FROM public.stories WHERE slug = 'les-vagues-de-linfini'
ON CONFLICT DO NOTHING;

-- Vérifier les données insérées
SELECT 
  COUNT(*) as "Stories crées",
  (SELECT COUNT(*) FROM public.chapters) as "Chapters total"
FROM public.stories 
WHERE author_id = 'dc48646f-aae6-4559-971b-5a4e18120b11';
