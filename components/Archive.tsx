'use client';

import { useState, useEffect } from 'react';
import { formatDate, getMoodEmoji } from '@/lib/utils';

interface Entry {
  id: string;
  mood?: string;
  date: number;
  word_count: number;
  is_sealed: boolean;
  excerpt: string;
}

interface ArchiveProps {
  fid: number;
}

export function Archive({ fid }: ArchiveProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch(`/api/entries?fid=${fid}&limit=50`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch entries');
        }

        setEntries(data.entries || []);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load entries');
        setIsLoading(false);
      }
    }

    fetchEntries();
  }, [fid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-lg">
        {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-semibold mb-2">No entries yet</h3>
        <p className="text-gray-600">Start writing your first entry!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 entry-card hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{getMoodEmoji(entry.mood)}</span>
              <div>
                <h3 className="font-semibold">{formatDate(entry.date)}</h3>
                <p className="text-sm text-gray-600">
                  {entry.word_count} words
                </p>
              </div>
            </div>
            {entry.is_sealed && (
              <span className="sealed-badge">
                🔒 Sealed
              </span>
            )}
          </div>

          <p className="text-gray-700 line-clamp-3">
            {entry.excerpt}
          </p>
        </div>
      ))}
    </div>
  );
}
