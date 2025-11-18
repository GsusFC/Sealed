'use client';

import { useState, useEffect, useCallback } from 'react';
import { blockchain } from '@/lib/blockchain';
import { useAuth } from '@/lib/auth-context';

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
  onTextChange?: (text: string) => void;
}

export function Editor({ fid, existingEntry, onSave, onTextChange }: EditorProps) {
  const [text, setText] = useState('');
  const [isSealing, setIsSealing] = useState(false);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (existingEntry && existingEntry.content) {
      setText(existingEntry.content);
    }
  }, [existingEntry]);

  const handleSeal = useCallback(async () => {
    if (!text.trim()) return;

    setIsSealing(true);

    // Simulate network delay for blockchain effect
    await new Promise(resolve => setTimeout(resolve, 2000));

    try {
      const endpoint = '/api/entries';
      const method = existingEntry ? 'PUT' : 'POST';

      // Save entry first
      const saveResponse = await fetch(endpoint, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: existingEntry?.id,
          fid,
          content: text,
        }),
      });

      const saveData = await saveResponse.json();

      if (!saveResponse.ok) {
        throw new Error(saveData.error || 'Failed to save entry');
      }

      const entryId = existingEntry?.id || saveData.id;
      const wordCount = text.trim().split(/\s+/).filter(Boolean).length;

      // Seal on blockchain
      const contentHash = blockchain.generateContentHash(text);
      const txHash = await blockchain.sealEntry({
        fid,
        content: text,
        wordCount,
      });

      const sealResponse = await fetch('/api/seal', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          id: entryId,
          fid,
          txHash,
          contentHash,
        }),
      });

      const sealData = await sealResponse.json();

      if (!sealResponse.ok) {
        throw new Error(sealData.error || 'Failed to seal entry');
      }

      // Clear text and navigate to vault
      setText('');
      const sealedEntry: Entry = {
        id: entryId,
        content: text,
        date: Date.now(),
        word_count: wordCount,
        is_sealed: true,
      };
      onSave(sealedEntry);

      // Navigate to archive after seal
      window.location.href = '/archive';
    } catch (err) {
      console.error('Seal error:', err);
    } finally {
      setIsSealing(false);
    }
  }, [text, fid, existingEntry, getAuthHeaders, onSave]);

  const isSealed = existingEntry?.is_sealed || false;

  return (
    <div className="flex flex-col h-full pt-20 pb-24 px-4 max-w-lg mx-auto">

      {/* Editor */}
      <div className="flex-grow relative group mt-2">
        <textarea
          className="w-full h-full bg-transparent text-slate-800 dark:text-slate-200 text-lg leading-relaxed font-mono resize-none focus:outline-none placeholder-slate-400 dark:placeholder-slate-800 p-0 transition-colors duration-300"
          placeholder="INITIATE ENTRY..."
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTextChange?.(e.target.value);
          }}
          disabled={isSealing || isSealed}
        />
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={handleSeal}
          disabled={!text.trim() || isSealing || isSealed}
          className={`
            w-full py-4 font-mono text-sm uppercase tracking-widest transition-all duration-300
            ${!text.trim() || isSealed
              ? 'border border-slate-200 dark:border-slate-900 text-slate-400 dark:text-slate-700 cursor-not-allowed bg-slate-100 dark:bg-slate-950'
              : 'bg-violet-600 hover:bg-violet-500 border border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.2)] active:scale-95'}
          `}
        >
          {isSealing ? "[ ... SEALING DATA ... ]" : isSealed ? "[ SEALED ]" : "[ PERMANENTLY SEAL ]"}
        </button>
      </div>
    </div>
  );
}
