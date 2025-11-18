'use client';

import { useState, useEffect } from 'react';

interface SettingsProps {
  toggleTheme: () => void;
  currentTheme: 'light' | 'dark';
  username?: string;
  walletAddress?: string;
}

export function Settings({ toggleTheme, currentTheme, username, walletAddress }: SettingsProps) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearData = async () => {
    if (window.confirm('WARNING: This will permanently erase all your diary entries and stats. Are you sure?')) {
      try {
        // Clear all entries via API
        const response = await fetch('/api/clear-data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          alert('All data cleared successfully');
          window.location.href = '/';
        } else {
          alert('Failed to clear data');
        }
      } catch (error) {
        console.error('Error clearing data:', error);
        alert('Failed to clear data');
      }
    }
  };

  return (
    <div className="flex flex-col h-full pt-20 pb-24 px-4 max-w-lg mx-auto scrollbar-hide overflow-y-auto">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 dark:border-slate-900 pb-2 transition-colors duration-300">
        <h2 className="text-slate-500 font-mono text-xs uppercase tracking-widest">
          SYSTEM CONFIG
        </h2>
      </div>

      {/* Visual Interface */}
      <section className="mb-8">
        <h3 className="text-[10px] font-mono text-violet-600 dark:text-violet-500 uppercase tracking-widest mb-4">Interface</h3>
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between transition-colors duration-300">
          <span className="font-mono text-sm text-slate-700 dark:text-slate-300">VISUAL_MODE</span>
          <button
            onClick={toggleTheme}
            className="bg-slate-200 dark:bg-slate-900 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-violet-500 transition-colors duration-300"
          >
            {currentTheme === 'dark' ? 'SWITCH TO LIGHT' : 'SWITCH TO DARK'}
          </button>
        </div>
      </section>

      {/* Identity */}
      <section className="mb-8">
        <h3 className="text-[10px] font-mono text-violet-600 dark:text-violet-500 uppercase tracking-widest mb-4">Identity</h3>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 mb-4 transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-500 uppercase">FARCASTER ID</span>
          </div>
          <div className="font-mono text-lg text-slate-800 dark:text-slate-200">{username || 'ANONYMOUS'}</div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-4 transition-colors duration-300">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-500 uppercase">WALLET CONNECTION</span>
            <span className={`w-2 h-2 rounded-full ${walletAddress ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`}></span>
          </div>

          {walletAddress ? (
            <div className="flex flex-col gap-3">
              <div className="font-mono text-xs text-slate-600 dark:text-slate-400 break-all bg-slate-100 dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800">
                {walletAddress}
              </div>
            </div>
          ) : (
            <div className="font-mono text-xs text-slate-500 dark:text-slate-600 py-2">
              NO WALLET CONNECTED
            </div>
          )}
        </div>
      </section>

      {/* Danger Zone */}
      <section>
        <h3 className="text-[10px] font-mono text-red-500 dark:text-red-500 uppercase tracking-widest mb-4">Danger Zone</h3>
        <div className="border border-red-900/20 bg-red-50/50 dark:bg-red-950/10 p-4 transition-colors duration-300">
          <p className="font-mono text-[10px] text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
            This action cannot be undone. All entries, stats, and reflection history will be permanently deleted from local storage.
          </p>
          <button
            onClick={handleClearData}
            className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-mono text-xs uppercase tracking-widest shadow-lg"
          >
            PURGE LOCAL DATA
          </button>
        </div>
      </section>

    </div>
  );
}
