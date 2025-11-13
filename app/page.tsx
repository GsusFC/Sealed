'use client';

import { useEffect, useState } from 'react';
import { farcaster } from '@/lib/farcaster';
import { Editor } from '@/components/Editor';
import { Navigation } from '@/components/Navigation';
import { Stats } from '@/components/Stats';

interface Entry {
  id: string;
  content: string;
  mood?: string;
  date: number;
  word_count: number;
  is_sealed: boolean;
}

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ fid: number } | null>(null);
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null);

  useEffect(() => {
    async function initApp() {
      try {
        await farcaster.init();
        const userData = farcaster.getUser();

        if (!userData) {
          setError('Failed to get user data from Farcaster');
          setIsLoading(false);
          return;
        }

        setUser({ fid: userData.fid });

        // Fetch today's entry
        const response = await fetch(`/api/entries?fid=${userData.fid}&limit=1`);
        const data = await response.json();

        if (data.entries && data.entries.length > 0) {
          const entry = data.entries[0];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const entryDate = new Date(entry.date);
          entryDate.setHours(0, 0, 0, 0);

          if (entryDate.getTime() === today.getTime()) {
            setTodayEntry(entry);
          }
        }

        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app');
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  const handleEntrySaved = (entry: Entry) => {
    setTodayEntry(entry);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Not authenticated</h1>
          <p className="text-gray-600">Please open this app from Warpcast</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Sealed</h1>
          <p className="text-gray-600">Your thoughts, sealed forever</p>
        </header>

        <Stats fid={user.fid} />

        <div className="mt-8">
          <Editor
            fid={user.fid}
            existingEntry={todayEntry}
            onSave={handleEntrySaved}
          />
        </div>
      </div>

      <Navigation />
    </div>
  );
}
