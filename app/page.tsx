'use client';

import { useEffect, useState } from 'react';
import { farcaster } from '@/lib/farcaster';
import { Editor } from '@/components/Editor';
import { Navigation } from '@/components/Navigation';
import { Header } from '@/components/Header';
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
  const [charCount, setCharCount] = useState(0);
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
            console.warn('Generating mock token for development');

            // Generate a mock token for development
            try {
              const mockAuthResponse = await fetch('/api/auth/mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  fid: userData.fid,
                }),
              });

              if (mockAuthResponse.ok) {
                const mockData = await mockAuthResponse.json();
                setToken(mockData.token);
              }
            } catch (mockError) {
              console.error('Mock auth also failed:', mockError);
            }
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

  const handleTextChange = (text: string) => {
    setCharCount(text.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-violet-600 mx-auto"></div>
          <p className="mt-4 text-slate-500 font-mono text-xs">[ LOADING... ]</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4 font-mono text-red-400">!</div>
          <h1 className="text-xl font-mono text-violet-600 mb-2">[ ERROR ]</h1>
          <p className="text-slate-500 text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4 font-mono text-violet-600">🔒</div>
          <h1 className="text-xl font-mono text-violet-600 mb-2">[ UNAUTHORIZED ]</h1>
          <p className="text-slate-500 text-sm font-mono">Please open this app from Warpcast</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Header charCount={charCount} showCharCount={true} />
      <Navigation />
      <Editor
        fid={user.fid}
        existingEntry={todayEntry}
        onSave={handleEntrySaved}
        onTextChange={handleTextChange}
      />
    </div>
  );
}
