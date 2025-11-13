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

const moods = [
  { value: 'happy', emoji: '😊', label: 'Happy' },
  { value: 'sad', emoji: '😢', label: 'Sad' },
  { value: 'excited', emoji: '🎉', label: 'Excited' },
  { value: 'calm', emoji: '😌', label: 'Calm' },
  { value: 'anxious', emoji: '😰', label: 'Anxious' },
  { value: 'grateful', emoji: '🙏', label: 'Grateful' },
  { value: 'thoughtful', emoji: '🤔', label: 'Thoughtful' },
  { value: 'creative', emoji: '🎨', label: 'Creative' },
];

export function Editor({ fid, existingEntry, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
      setMood(existingEntry.mood || '');
    }
  }, [existingEntry]);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  const handleSave = async () => {
    if (!content.trim()) {
      setError('Please write something before saving');
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const endpoint = existingEntry ? '/api/entries' : '/api/entries';
      const method = existingEntry ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: existingEntry?.id,
          fid,
          content,
          mood: mood || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save entry');
      }

      setSuccessMessage('Entry saved successfully!');

      const savedEntry: Entry = {
        id: existingEntry?.id || data.id,
        content,
        mood,
        date: Date.now(),
        word_count: wordCount,
        is_sealed: false,
      };

      onSave(savedEntry);

      setTimeout(() => setSuccessMessage(null), 3000);
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
      // Generate content hash
      const contentHash = blockchain.generateContentHash(content);

      // Seal on blockchain
      const txHash = await blockchain.sealEntry({
        fid,
        content,
        wordCount,
        mood,
      });

      // Update database
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

      setSuccessMessage('Entry sealed forever! 🔒');

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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">
            {formatDate(existingEntry?.date || Date.now())}
          </h2>
          {isSealed && (
            <span className="sealed-badge">
              🔒 Sealed
            </span>
          )}
        </div>

        {!isSealed && (
          <div className="flex flex-wrap gap-2 mb-4">
            {moods.map((m) => (
              <button
                key={m.value}
                onClick={() => setMood(m.value)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  mood === m.value
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-500'
                    : 'bg-gray-100 text-gray-700 border-2 border-transparent hover:bg-gray-200'
                }`}
              >
                {m.emoji} {m.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={isSealed}
        placeholder="Write your thoughts..."
        className="w-full min-h-[300px] p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none editor-textarea"
      />

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {wordCount} words · {charCount} characters
        </div>

        <div className="flex gap-2">
          {!isSealed && (
            <>
              <button
                onClick={handleSave}
                disabled={isSaving || !content.trim()}
                className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>

              {existingEntry && !existingEntry.is_sealed && (
                <button
                  onClick={handleSeal}
                  disabled={isSealing}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
                >
                  {isSealing ? 'Sealing...' : '🔒 Seal Forever'}
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
          {successMessage}
        </div>
      )}
    </div>
  );
}
