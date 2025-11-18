'use client';

import { useState, useEffect } from 'react';
import { formatDate } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface Entry {
  id: string;
  excerpt: string;
  mood?: string;
  date: number;
  word_count: number;
  is_sealed: boolean;
}

interface ArchiveProps {
  fid: number;
}

export function Archive({ fid }: ArchiveProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchEntries() {
      try {
        const response = await fetch(`/api/entries?fid=${fid}&limit=50`, {
          headers: getAuthHeaders(),
        });
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
  }, [fid, getAuthHeaders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-violet"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="border border-red-500/30 bg-red-950/20 text-red-400 p-4 font-mono terminal-text text-xs">
        [ ERROR ] {error}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-9xl font-bold text-slate-dark mb-4 font-mono">0</div>
        <h3 className="text-lg terminal-text text-violet mb-2">[ VAULT EMPTY ]</h3>
        <p className="text-slate text-sm font-mono">Immutable Local Storage</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="bg-cyber-void/30 border border-cyber-border p-6 entry-card cursor-pointer hover:bg-cyber-void/50"
        >
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-mono text-sm text-slate terminal-text">
                {formatDate(entry.date).toUpperCase()}
              </h3>
              <p className="text-xs text-slate-light mt-1 font-mono">
                {entry.word_count} WORDS
              </p>
            </div>
            {entry.is_sealed && (
              <span className="sealed-badge">
                [ SEALED ]
              </span>
            )}
          </div>

          <p className="text-foreground/80 line-clamp-3 leading-relaxed text-sm font-mono">
            {entry.excerpt}
          </p>

          <div className="mt-4 pt-4 border-t border-cyber-border">
            <span className="text-xs text-slate font-mono">
              HASH: {entry.id.substring(0, 12)}...
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
