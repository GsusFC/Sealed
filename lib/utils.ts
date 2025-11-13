/**
 * Merge CSS class names
 */
export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format date for display
 */
export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
}

/**
 * Format time for display
 */
export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Calculate reading time in minutes
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 200;
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Truncate text to specified length
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

/**
 * Get mood emoji
 */
export function getMoodEmoji(mood?: string): string {
  const moodMap: Record<string, string> = {
    happy: '😊',
    sad: '😢',
    excited: '🎉',
    calm: '😌',
    anxious: '😰',
    grateful: '🙏',
    thoughtful: '🤔',
    creative: '🎨',
  };

  return mood ? moodMap[mood] || '📝' : '📝';
}

/**
 * Validate entry content
 */
export function validateEntry(content: string): { valid: boolean; error?: string } {
  if (!content || content.trim().length === 0) {
    return { valid: false, error: 'Entry cannot be empty' };
  }

  if (content.length > 10000) {
    return { valid: false, error: 'Entry is too long (max 10,000 characters)' };
  }

  return { valid: true };
}

/**
 * Get streak count
 */
export function calculateStreak(entries: Array<{ date: number }>): number {
  if (entries.length === 0) return 0;

  const sortedEntries = [...entries].sort((a, b) => b.date - a.date);
  let streak = 0;
  let currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  for (const entry of sortedEntries) {
    const entryDate = new Date(entry.date);
    entryDate.setHours(0, 0, 0, 0);

    const diffInDays = Math.floor(
      (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffInDays === streak) {
      streak++;
      currentDate = entryDate;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}
