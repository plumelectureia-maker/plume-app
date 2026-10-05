/**
 * Configuration avancée de Plume
 * Copier en config.ts et modifier selon vos besoins
 */

export const config = {
  // Authentification
  auth: {
    minPasswordLength: 8,
    requireEmailVerification: false,
    sessionTimeout: 24 * 60 * 60 * 1000, // 24h
  },

  // Stories
  stories: {
    maxTitleLength: 200,
    maxSummaryLength: 500,
    minChapterLength: 100,
    maxChapterLength: 50000,
    paginationLimit: 20,
  },

  // Commentaires
  comments: {
    maxLength: 1000,
    requireApproval: false,
    nestingLevel: 0, // 0 = pas de réponses imbriquées
  },

  // Notifications
  notifications: {
    enableEmailNotifications: false,
    notificationRetention: 30 * 24 * 60 * 60 * 1000, // 30 jours
  },

  // Modération
  moderation: {
    enableAutoModeration: false,
    profanityFilter: false,
    minReputationToPost: 0,
  },

  // Forfaits
  plans: {
    free: {
      maxStoriesPerMonth: 2,
      maxChaptersPerStory: 10,
      storageGB: 1,
      price: 0,
    },
    premium: {
      maxStoriesPerMonth: 999,
      maxChaptersPerStory: 999,
      storageGB: 100,
      price: 4.99,
    },
    pro: {
      maxStoriesPerMonth: 999,
      maxChaptersPerStory: 999,
      storageGB: 500,
      analytics: true,
      price: 9.99,
    },
  },

  // Features
  features: {
    enableAI: false, // À implémenter avec OpenAI/Claude
    enablePDFExport: false, // À implémenter
    enableSearch: false, // À implémenter avec Meilisearch
    enableRecommendations: false, // À implémenter avec ML
    enableOfflineMode: false, // À implémenter avec Service Workers
  },

  // Analytics
  analytics: {
    enableGoogleAnalytics: false,
    googleAnalyticsId: '',
    enableSentry: false,
    sentryDSN: '',
  },

  // Stockage
  storage: {
    avatarMaxSizeMB: 5,
    coverMaxSizeMB: 10,
    supportedImageFormats: ['jpg', 'jpeg', 'png', 'webp'],
  },

  // UI
  ui: {
    defaultTheme: 'system', // 'light' | 'dark' | 'system'
    animationsEnabled: true,
    mobileBreakpoint: 640,
  },

  // Limites de taux (rate limiting)
  rateLimiting: {
    loginAttemptsPerHour: 5,
    apiCallsPerMinute: 60,
    storiesPerDay: 5,
  },
};

export type Config = typeof config;
