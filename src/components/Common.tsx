import React from 'react';
import { Heart, Bookmark, MessageCircle, Loader, X } from 'lucide-react';
import type { Story } from '../types';

// ============================================
// BUTTON COMPONENTS
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, className, ...props }, ref) => {
    const baseClass = 'inline-flex items-center justify-center font-semibold rounded-lg transition-colors';
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-white',
      ghost: 'hover:bg-gray-100 dark:hover:bg-gray-800',
      danger: 'bg-red-600 text-white hover:bg-red-700',
    };
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseClass} ${variants[variant]} ${sizes[size]} ${className || ''}`}
        disabled={loading || props.disabled}
        {...props}
      >
        {loading && <Loader className="w-4 h-4 mr-2 animate-spin" />}
        {children}
      </button>
    );
  }
);

// ============================================
// CARD COMPONENTS
// ============================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', onClick }) => (
  <div className={`rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800 ${className}`} onClick={onClick}>
    {children}
  </div>
);

// ============================================
// STORY COVER
// ============================================
interface StoryCoverProps {
  story: Story;
  size?: 'sm' | 'md' | 'lg';
  onClick?: (e?: React.MouseEvent) => void;
}

const PATTERNS = {
  maree: '<path d="M0 104q12.5-9 25 0t25 0 25 0 25 0v36H0z" fill-opacity=".3" stroke="none"/><path d="M0 118q12.5-9 25 0t25 0 25 0 25 0v22H0z" fill-opacity=".45" stroke="none"/><rect x="58" y="34" width="9" height="52" rx="1" stroke="none" fill-opacity=".85"/><path d="M62 30 100 10v30z" fill-opacity=".2" stroke="none"/>',
  papier: '<g transform="rotate(-7 50 61)"><rect x="24" y="26" width="52" height="70" rx="2" fill-opacity=".22" stroke="none"/><path d="M34 44h30M34 54h24M34 64h28M34 74h18" fill="none" stroke-width="2" stroke-linecap="round" opacity=".6"/><path d="M56 26l6 12-8 8 8 10-6 14" fill="none" stroke-width="2" opacity=".85"/></g>',
  verre: '<circle cx="32" cy="40" r="14" fill-opacity=".2" stroke="none"/><circle cx="68" cy="40" r="14" fill-opacity=".34" stroke="none"/><circle cx="32" cy="78" r="14" fill-opacity=".34" stroke="none"/><circle cx="68" cy="78" r="14" fill-opacity=".14" stroke="none"/>',
  plume: '<g transform="translate(24 34) scale(2.2)" fill="none" stroke-width="1.1" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><path d="M16 8 2 22"/><path d="M17.5 15H9"/></g>',
};

export const StoryCover: React.FC<StoryCoverProps> = ({ story, size = 'md', onClick }) => {
  const sizeClass = {
    sm: 'w-24 h-32',
    md: 'w-32 h-44',
    lg: 'w-48 h-64',
  }[size];

  const pattern = PATTERNS[story.cover_pattern as keyof typeof PATTERNS] || PATTERNS.plume;

  return (
    <button
      onClick={onClick}
      className={`${sizeClass} rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer flex-shrink-0 overflow-hidden`}
      style={{
        background: `linear-gradient(160deg, ${story.cover_color_1}, ${story.cover_color_2})`,
      }}
    >
      <svg
        className="w-full h-full opacity-30"
        viewBox="0 0 100 140"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`pattern-${story.id}`} patternUnits="userSpaceOnUse" width="100" height="140">
            {pattern && <g dangerouslySetInnerHTML={{ __html: pattern }} />}
          </pattern>
        </defs>
        <rect width="100" height="140" fill={`url(#pattern-${story.id})`} />
      </svg>
      <div className="absolute inset-0 flex flex-col justify-end p-3 text-white">
        <h3 className="font-bold text-sm line-clamp-2">{story.title}</h3>
      </div>
    </button>
  );
};

// ============================================
// STORY ITEM
// ============================================
interface StoryItemProps {
  story: Story;
  onLike?: () => void;
  onBookmark?: () => void;
  onComment?: () => void;
  onClick?: () => void;
}

export const StoryItem: React.FC<StoryItemProps> = ({
  story,
  onLike,
  onBookmark,
  onComment,
  onClick,
}) => (
  <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
    <div className="flex gap-4">
      <StoryCover story={story} size="sm" onClick={(e) => { e.stopPropagation(); onClick?.(); }} />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-lg truncate">{story.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">{story.author?.username}</p>
        <p className="text-sm mt-2 line-clamp-2">{story.summary}</p>
        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>{story.likes_count} j'aime</span>
          <span>{story.comments_count} commentaires</span>
          <span>{story.views_count} lectures</span>
        </div>
        <div className="flex gap-2 mt-3">
          <button
            onClick={(e) => { e.stopPropagation(); onLike?.(); }}
            className="p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition"
          >
            <Heart size={18} className={story.is_liked ? 'fill-red-600 text-red-600' : ''} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onBookmark?.(); }}
            className="p-1 hover:bg-yellow-100 dark:hover:bg-yellow-900 rounded transition"
          >
            <Bookmark size={18} className={story.is_bookmarked ? 'fill-yellow-600 text-yellow-600' : ''} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onComment?.(); }}
            className="p-1 hover:bg-blue-100 dark:hover:bg-blue-900 rounded transition"
          >
            <MessageCircle size={18} />
          </button>
        </div>
      </div>
    </div>
  </Card>
);

// ============================================
// MODAL
// ============================================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="relative w-full md:w-full md:max-w-md bg-white dark:bg-gray-800 rounded-t-2xl md:rounded-lg md:shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2 className="text-lg font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

// ============================================
// INPUT
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold mb-2">{label}</label>}
      <input
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className || ''}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
);

// ============================================
// TEXTAREA
// ============================================
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-semibold mb-2">{label}</label>}
      <textarea
        ref={ref}
        className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          error ? 'border-red-500' : 'border-gray-300'
        } ${className || ''}`}
        {...props}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  )
);

// ============================================
// LOADING SPINNER
// ============================================
export const Loading: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClass = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' }[size];
  return <Loader className={`${sizeClass} animate-spin`} />;
};

// ============================================
// EMPTY STATE
// ============================================
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 text-center">
    <div className="text-gray-400 mb-4">{icon}</div>
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    {description && <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>}
    {action && (
      <Button onClick={action.onClick} size="sm">
        {action.label}
      </Button>
    )}
  </div>
);
