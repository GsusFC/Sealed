'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              pathname === '/'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            <span className="text-xs font-medium">Write</span>
          </Link>

          <Link
            href="/archive"
            className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
              pathname === '/archive'
                ? 'text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <svg
              className="w-6 h-6 mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
            <span className="text-xs font-medium">Archive</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
