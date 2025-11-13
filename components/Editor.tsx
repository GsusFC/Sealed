'use client';

import { useState, useEffect } from 'react';
import { blockchain } from '@/lib/blockchain';
import { formatDate } from '@/lib/utils';

interface Entry {
  id: string;
  content: string;
  mood?: string;
  date: number;
  word_count: number;
  is_sealed: boolean;
}

interface EditorProps {
  fid: number;
  existingEntry: Entry | null;
  onSave: (entry: Entry) => void;
}

export function Editor({ fid, existingEntry, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
    }
  }, [existingEntry]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something before saving');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = '/api/entries';
      const method = existingEntry ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingEntry?.id,
          fid,
          content,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }

      setSuccessMessage('Saved');

      const savedEntry: Entry = {
        id: existingEntry?.id || data.id,
        content,
        date: Date.now(),
        word_count: wordCount,
        is_sealed: false,
      };

      onSave(savedEntry);

      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeal = async () => {
    if (!existingEntry) {
      setError('Please save your entry first');
      return;
    }

    if (existingEntry.is_sealed) {
      setError('This entry is already sealed');
      return;
    }

    setIsSealing(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const contentHash = blockchain.generateContentHash(content);

      const txHash = await blockchain.sealEntry({
        fid,
        content,
        wordCount,
      });

      const response = await fetch('/api/seal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingEntry.id,
          fid,
          txHash,
          contentHash,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to seal entry');
      }

      setSuccessMessage('Entry sealed forever');

      const sealedEntry: Entry = {
        ...existingEntry,
        is_sealed: true,
      };

      onSave(sealedEntry);

      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to seal entry');
    } finally {
      setIsSealing(false);
    }
  };

  const isSealed = existingEntry?.is_sealed || false;

  return (
    <div className="w-full pb-32">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-lg text-gray-500">
            {formatDate(existingEntry?.date || Date.now())}
          </h2>
          {isSealed && (
            <span className="text-sm text-gray-400">
              Sealed
            </span>
          )}
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSealed}
        placeholder="Write your thoughts..."
        className="w-full min-h-[500px] p-0 border-none focus:ring-0 focus:outline-none resize-none text-lg leading-relaxed"
        style={{ fontFamily: 'inherit' }}
      />

      <div className="mt-8 flex items-center justify-between border-t pt-6 pb-6">
        <div className="text-sm text-gray-400">
          {wordCount} words
        </div>

        <div className="flex gap-3">
          {!isSealed && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="px-8 py-3 bg-black text-white text-base font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>

              {existingEntry && !existingEntry.is_sealed && (
                <button
                  onClick={handleSeal}
                  disabled={isSealing}
                  className="px-8 py-3 bg-gray-100 text-black text-base font-medium hover:bg-gray-200 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSealing ? 'Sealing...' : 'Seal Forever'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-4 bg-green-50 text-green-700 text-sm">
          {successMessage}
        </div>
      )}
    </div>
  );
}
