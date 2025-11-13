'use client';

import { useEffect, useState } from 'react';
import { farcaster } from '@/lib/farcaster';
import { Archive } from '@/components/Archive';
import { Navigation } from '@/components/Navigation';

export default function ArchivePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ fid: number } | null>(null);

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
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app');
        setIsLoading(false);
      }
    }

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
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
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold mb-2">Not authenticated</h1>
          <p className="text-gray-600">Please open this app from Warpcast</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <header className="mb-12">
            <h1 className="text-2xl font-semibold mb-1">Archive</h1>
            <p className="text-gray-500 text-sm">Your past entries</p>
          </header>

          <Archive fid={user.fid} />
        </div>
      </div>
    </>
  );
}
