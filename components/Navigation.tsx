'use client';

import { usePathname, useRouter } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="fixed bottom-6 left-4 right-4 h-12 bg-slate-50/95 dark:bg-slate-950/95 backdrop-blur border border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 z-50 max-w-lg mx-auto shadow-xl dark:shadow-none transition-colors duration-300">
      <button
        onClick={() => router.push('/')}
        className={`flex-1 h-full flex items-center justify-center transition-colors duration-300 ${
          pathname === '/' ? 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">WRITE</span>
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 transition-colors duration-300"></div>

      <button
        onClick={() => router.push('/archive')}
        className={`flex-1 h-full flex items-center justify-center transition-colors duration-300 ${
          pathname === '/archive' ? 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">VAULT</span>
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 transition-colors duration-300"></div>

      <button
        onClick={() => router.push('/stats')}
        className={`flex-1 h-full flex items-center justify-center transition-colors duration-300 ${
          pathname === '/stats' ? 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">STATS</span>
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 transition-colors duration-300"></div>

      <button
        onClick={() => router.push('/settings')}
        className={`flex-1 h-full flex items-center justify-center transition-colors duration-300 ${
          pathname === '/settings' ? 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
        }`}
      >
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest">SYSTEM</span>
      </button>
    </nav>
  );
}
