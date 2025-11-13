'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold">
              Sealed
            </Link>
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="fixed top-[57px] right-0 w-64 bg-white border-l border-gray-200 h-[calc(100vh-57px)] shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <Link
                href="/"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 text-lg transition-colors ' + (pathname === '/' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50')}
              >
                Write
              </Link>
              
              <Link
                href="/archive"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 text-lg transition-colors ' + (pathname === '/archive' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50')}
              >
                Archive
              </Link>
              
              <Link
                href="/stats"
                onClick={() => setIsOpen(false)}
                className={'block py-3 px-4 text-lg transition-colors ' + (pathname === '/stats' ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50')}
              >
                Stats
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
