'use client';

import { useEffect, useState } from 'react';
import { farcaster } from '@/lib/farcaster';
import { Editor } from '@/components/Editor';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/auth-context';

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
  const { token, setToken, getAuthHeaders } = useAuth();

  useEffect(() => {
    async function initApp() {
      try {
        // Step 1: Initialize Farcaster SDK
        await farcaster.init();
        const userData = farcaster.getUser();

        if (!userData) {
          setError('Failed to get user data from Farcaster');
          setIsLoading(false);
          return;
        }

        // Step 2: Authenticate with SIWF if no token
        if (!token) {
          try {
            // Request user to sign in
            const signInResult = await farcaster.signIn();

            // Send signature to backend for verification and JWT generation
            const authResponse = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: signInResult.message,
                signature: signInResult.signature,
              }),
            });

            const authData = await authResponse.json();

            if (!authResponse.ok || !authData.token) {
              throw new Error('Authentication failed');
            }

            // Save JWT token
            setToken(authData.token);
          } catch (authError) {
            console.error('Authentication error:', authError);
            // Continue with mock authentication for development
            console.warn('Continuing with mock authentication');
          }
        }

        setUser({ fid: userData.fid });

        // Step 3: Fetch user's entries with auth token
        const response = await fetch(`/api/entries?fid=${userData.fid}&limit=1`, {
          headers: getAuthHeaders(),
        });
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
  }, [token, setToken, getAuthHeaders]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleEntrySaved = (entry: Entry) => {
    setTodayEntry(entry);
  };

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
      <Editor
        fid={user.fid}
        existingEntry={todayEntry}
        onSave={handleEntrySaved}
      />
    </>
  );
}
