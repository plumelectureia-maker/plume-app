/**
 * Formater un nombre avec séparateurs de milliers
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

/**
 * Formater une date
 */
export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
};

/**
 * Formater une date relative ("il y a 2 jours")
 */
export const formatRelativeTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return 'à l\'instant';
  if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)}h`;
  if (seconds < 2592000) return `il y a ${Math.floor(seconds / 86400)}j`;

  return formatDate(d);
};

/**
 * Générer un slug à partir d'une chaîne
 */
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Tronquer un texte avec points de suspension
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
};

/**
 * Calculer le temps de lecture (200 mots/minute)
 */
export const calculateReadingTime = (text: string): number => {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

/**
 * Valider un email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valider un username (3-20 caractères, alphanumérique + underscore)
 */
export const isValidUsername = (username: string): boolean => {
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
};

/**
 * Obtenir l'initiale de couleur d'avatar
 */
export const getAvatarColor = (username: string): string => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
  ];
  const index = username.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Copier dans le presse-papiers
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
};

/**
 * Parser une réponse d'erreur Supabase
 */
export const parseSupabaseError = (error: any): string => {
  if (typeof error === 'string') return error;
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  return 'Une erreur est survenue';
};

/**
 * Créer un délai (utile pour les animations)
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Obtenir les initiales d'un nom
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Classements (top X)
 */
export const rankItems = <T extends { [key: string]: number }>(
  items: T[],
  key: keyof T,
  limit = 10
): T[] => {
  return items
    .sort((a, b) => (b[key] as number) - (a[key] as number))
    .slice(0, limit);
};
