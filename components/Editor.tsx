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
  const [showSealButton, setShowSealButton] = useState(false);

  useEffect(() => {
    if (existingEntry && existingEntry.content) {
      setContent(existingEntry.content);
    }
  }, [existingEntry]);

  const wordCount = (content || '').trim().split(/\s+/).filter(Boolean).length;

  const handleSave = async () => {
    if (!content || !content.trim()) {
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
      setShowSealButton(true);

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
    <div className="fixed inset-0 pt-24 flex flex-col bg-white">
      {/* Header arriba */}
      <div className="flex-shrink-0 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="flex-shrink-0 px-6 mb-4">
          <div className="max-w-4xl mx-auto p-4 bg-red-50 text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex-shrink-0 px-6 mb-4">
          <div className="max-w-4xl mx-auto p-4 bg-green-50 text-green-700 text-sm">
            {successMessage}
          </div>
        </div>
      )}

      {/* Área de escritura: texto empieza abajo */}
      <div className="flex-1 overflow-hidden px-6">
        <div className="max-w-4xl mx-auto h-full flex flex-col justify-end">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isSealed}
            placeholder="Write your thoughts..."
            className="w-full p-0 border-none focus:ring-0 focus:outline-none resize-none text-lg leading-relaxed overflow-auto"
            style={{ fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Botones y contador fijos abajo */}
      <div className="flex-shrink-0 border-t bg-white px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {wordCount} words
          </div>

          <div className="flex gap-3">
            {!isSealed && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !content || !content.trim()}
                  className="px-8 py-3 bg-black text-white text-base font-medium hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>

                {showSealButton && existingEntry && !existingEntry.is_sealed && (
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
      </div>
    </div>
  );
}
