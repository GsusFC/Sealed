'use client';

import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';

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

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch(`/api/stats?fid=${fid}`);
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
  }, [fid]);

  if (isLoading) {
    return null;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(stats.totalEntries)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Total Entries</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(stats.sealedEntries)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Sealed</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {formatNumber(stats.totalWords)}
          </div>
          <div className="text-sm text-gray-600 mt-1">Words Written</div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-purple-600">
            {stats.totalEntries > 0
              ? Math.round(stats.totalWords / stats.totalEntries)
              : 0}
          </div>
          <div className="text-sm text-gray-600 mt-1">Avg per Entry</div>
        </div>
      </div>
    </div>
  );
}
