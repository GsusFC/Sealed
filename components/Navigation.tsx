'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-cyber-bg border-b border-cyber-border z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-lg font-mono terminal-text text-violet hover:text-violet-light transition-colors">
              0xSEALED
            </Link>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate hover:text-violet hover:bg-cyber-void/30 transition-colors border border-transparent hover:border-violet/30"
              aria-label="Menu"
            >
              {isOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="fixed top-[57px] right-0 w-72 bg-cyber-bg border-l border-violet/30 h-[calc(100vh-57px)] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="mb-6 pb-4 border-b border-cyber-border">
                <span className="text-xs text-slate font-mono terminal-text">[ NAVIGATION ]</span>
              </div>

              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 font-mono text-sm terminal-text transition-all border-l-2 ' + (pathname === '/' ? 'border-violet bg-cyber-void/50 text-violet' : 'border-transparent text-slate hover:border-violet/50 hover:bg-cyber-void/30 hover:text-violet')}
              >
                [ WRITE ]
              </Link>

              <Link
                href="/archive"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 font-mono text-sm terminal-text transition-all border-l-2 mt-2 ' + (pathname === '/archive' ? 'border-violet bg-cyber-void/50 text-violet' : 'border-transparent text-slate hover:border-violet/50 hover:bg-cyber-void/30 hover:text-violet')}
              >
                [ VAULT ]
              </Link>

              <Link
                href="/stats"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 font-mono text-sm terminal-text transition-all border-l-2 mt-2 ' + (pathname === '/stats' ? 'border-violet bg-cyber-void/50 text-violet' : 'border-transparent text-slate hover:border-violet/50 hover:bg-cyber-void/30 hover:text-violet')}
              >
                [ STATS ]
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
