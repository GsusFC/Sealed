'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';

interface StatsData {
  totalEntries: number;
  totalWords: number;
  totalChars: number;
  sealedEntries: number;
}

interface StatsProps {
  fid: number;
}

export function Stats({ fid }: StatsProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/stats?fid=${fid}`, {
          headers: getAuthHeaders(),
        });
        const data = await response.json();

        if (response.ok) {
          setStats(data);
        }
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
        setIsLoading(false);
      }
    }

    fetchStats();
  }, [fid, getAuthHeaders]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-b-2 border-violet"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="border border-red-500/30 bg-red-950/20 text-red-400 p-4 font-mono terminal-text text-xs">
        [ ERROR ] Failed to load stats
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Entries */}
        <div className="bg-cyber-void/30 border border-cyber-border p-8 hover:bg-cyber-void/50 transition-all">
          <div className="text-6xl font-bold text-violet font-mono mb-2">
            {formatNumber(stats.totalEntries)}
          </div>
          <div className="text-xs text-slate terminal-text">
            TOTAL ENTRIES
          </div>
        </div>

        {/* Sealed Entries */}
        <div className="bg-cyber-void/30 border border-violet/30 p-8 hover:border-violet hover:bg-cyber-void/50 transition-all">
          <div className="text-6xl font-bold text-violet-light font-mono mb-2">
            {formatNumber(stats.sealedEntries)}
          </div>
          <div className="text-xs text-violet terminal-text">
            [ SEALED FOREVER ]
          </div>
        </div>

        {/* Total Words */}
        <div className="bg-cyber-void/30 border border-cyber-border p-8 hover:bg-cyber-void/50 transition-all">
          <div className="text-6xl font-bold text-foreground font-mono mb-2">
            {formatNumber(stats.totalWords)}
          </div>
          <div className="text-xs text-slate terminal-text">
            WORDS WRITTEN
          </div>
        </div>

        {/* Average per Entry */}
        <div className="bg-cyber-void/30 border border-cyber-border p-8 hover:bg-cyber-void/50 transition-all">
          <div className="text-6xl font-bold text-slate-light font-mono mb-2">
            {stats.totalEntries > 0
              ? Math.round(stats.totalWords / stats.totalEntries)
              : 0}
          </div>
          <div className="text-xs text-slate terminal-text">
            AVG PER ENTRY
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="border-t border-cyber-border pt-6">
        <div className="text-xs text-slate font-mono">
          <p>TOTAL CHARACTERS: {formatNumber(stats.totalChars)}</p>
          <p className="mt-2">
            SEAL RATIO: {stats.totalEntries > 0
              ? ((stats.sealedEntries / stats.totalEntries) * 100).toFixed(1)
              : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
