'use client';

interface HeaderProps {
  charCount: number;
  showCharCount: boolean;
}

export function Header({ charCount, showCharCount }: HeaderProps) {
  const formattedDate = new Date()
    .toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    .toUpperCase();

  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 z-50 transition-colors duration-300">
      <div className="flex items-center gap-3">
        <div className="w-3 h-3 bg-violet-600 shadow-[0_0_10px_rgba(124,58,237,0.5)]"></div>
        <span className="font-mono font-bold text-lg tracking-tighter text-slate-900 dark:text-slate-100 uppercase transition-colors duration-300">SEALED</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-500 uppercase tracking-widest">
          {formattedDate}
        </span>
        {showCharCount && (
          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-600 border-l border-slate-300 dark:border-slate-800 pl-3 transition-colors duration-300">
            {charCount} CHARS
          </span>
        )}
      </div>
    </header>
  );
}
