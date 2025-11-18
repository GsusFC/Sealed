'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

interface StatsData {
  totalEntries: number;
  totalWords: number;
  totalChars: number;
  sealedEntries: number;
  currentStreak: number;
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
        <div className="animate-spin h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  // Calculate VP and level
  const voidPoints = (stats.sealedEntries * 100) + stats.totalWords + (stats.currentStreak * 50);
  const pointsPerLevel = 1000;
  const level = Math.floor(voidPoints / pointsPerLevel);
  const currentLevelPoints = voidPoints % pointsPerLevel;
  const nextLevelPoints = pointsPerLevel;
  const progress = (currentLevelPoints / nextLevelPoints) * 100;

  return (
    <div className="flex flex-col h-full pt-20 pb-24 px-4 max-w-lg mx-auto scrollbar-hide overflow-y-auto">

      {/* Level Card */}
      <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 mb-6 relative overflow-hidden transition-colors duration-300">
        <div className="relative z-10 flex flex-col items-start">
          <div className="text-violet-600 dark:text-violet-500 font-mono text-xs uppercase tracking-widest mb-1 transition-colors duration-300">User Level</div>
          <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4 font-mono uppercase tracking-tighter transition-colors duration-300">{level}</h2>

          <div className="w-full mb-2">
            <div className="flex justify-between text-[10px] font-mono text-slate-500 dark:text-slate-500 mb-2 uppercase transition-colors duration-300">
              <span>Current: {currentLevelPoints} VP</span>
              <span>Next: {nextLevelPoints} VP</span>
            </div>
            <div className="h-1 w-full bg-slate-200 dark:bg-slate-900 transition-colors duration-300">
              <div
                className="h-full bg-violet-600 transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-px bg-slate-200 dark:bg-slate-800 border border-slate-200 dark:border-slate-800 mb-8 transition-colors duration-300">
        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex flex-col gap-1 transition-colors duration-300">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Current Streak</span>
          <span className="text-2xl font-mono text-slate-800 dark:text-slate-200 transition-colors duration-300">{stats.currentStreak} <span className="text-sm text-slate-500 dark:text-slate-600">DAYS</span></span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex flex-col gap-1 transition-colors duration-300">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Total Entries</span>
          <span className="text-2xl font-mono text-slate-800 dark:text-slate-200 transition-colors duration-300">{stats.totalEntries}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex flex-col gap-1 transition-colors duration-300">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Words Written</span>
          <span className="text-2xl font-mono text-slate-800 dark:text-slate-200 transition-colors duration-300">{stats.totalWords}</span>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-4 flex flex-col gap-1 transition-colors duration-300">
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">Sealed Status</span>
          <span className="text-2xl font-mono text-violet-600 dark:text-violet-400 transition-colors duration-300">
            {stats.totalEntries > 0 ? Math.round((stats.sealedEntries / stats.totalEntries) * 100) : 100}%
          </span>
        </div>
      </div>

      {/* Rules */}
      <div className="border-t border-slate-200 dark:border-slate-900 pt-6 transition-colors duration-300">
        <h3 className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase tracking-widest mb-4 transition-colors duration-300">INCENTIVE STRUCTURE</h3>
        <ul className="space-y-3">
          <li className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors duration-300">
            <span>SEAL_ENTRY</span>
            <span className="text-violet-600 dark:text-violet-500 transition-colors duration-300">+100 VP</span>
          </li>
          <li className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors duration-300">
            <span>WORD_COUNT</span>
            <span className="text-violet-600 dark:text-violet-500 transition-colors duration-300">+1 VP / WORD</span>
          </li>
          <li className="flex justify-between text-xs text-slate-500 dark:text-slate-400 font-mono transition-colors duration-300">
            <span>DAILY_STREAK</span>
            <span className="text-violet-600 dark:text-violet-500 transition-colors duration-300">+50 VP</span>
          </li>
        </ul>
      </div>

    </div>
  );
}
