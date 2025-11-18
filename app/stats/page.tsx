'use client';

import { useEffect, useState } from 'react';
import { farcaster } from '@/lib/farcaster';
import { Stats } from '@/components/Stats';
import { Navigation } from '@/components/Navigation';
import { useAuth } from '@/lib/auth-context';

export default function StatsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ fid: number } | null>(null);
  const { token, setToken } = useAuth();

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

        // Authenticate if no token
        if (!token) {
          try {
            const signInResult = await farcaster.signIn();
            const authResponse = await fetch('/api/auth', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                message: signInResult.message,
                signature: signInResult.signature,
              }),
            });

            const authData = await authResponse.json();
            if (authResponse.ok && authData.token) {
              setToken(authData.token);
            }
          } catch (authError) {
            console.error('Authentication error:', authError);
            // Try mock token for development
            try {
              const mockAuthResponse = await fetch('/api/auth/mock', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fid: userData.fid }),
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
        setIsLoading(false);
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize app');
        setIsLoading(false);
      }
    }

    initApp();
  }, [token, setToken]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-violet mx-auto"></div>
          <p className="mt-4 text-slate font-mono terminal-text text-xs">[ LOADING... ]</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4 font-mono text-red-400">!</div>
          <h1 className="text-xl font-mono terminal-text text-violet mb-2">[ ERROR ]</h1>
          <p className="text-slate text-sm font-mono">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cyber-bg">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4 font-mono text-violet">🔒</div>
          <h1 className="text-xl font-mono terminal-text text-violet mb-2">[ UNAUTHORIZED ]</h1>
          <p className="text-slate text-sm font-mono">Please open this app from Warpcast</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cyber-bg pt-24">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <header className="mb-12 border-b border-cyber-border pb-6">
            <h1 className="text-xl font-mono terminal-text text-violet mb-2">[ STATS ]</h1>
            <p className="text-slate text-xs font-mono">Writing Metrics — Performance Analysis</p>
          </header>

          <Stats fid={user.fid} />
        </div>
      </div>
    </>
  );
}
