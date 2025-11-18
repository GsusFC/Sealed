'use client';

import { useState, useEffect } from 'react';
import { blockchain } from '@/lib/blockchain';
import { formatDate } from '@/lib/utils';
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
}

export function Editor({ fid, existingEntry, onSave }: EditorProps) {
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSealing, setIsSealing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSealButton, setShowSealButton] = useState(false);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const { getAuthHeaders } = useAuth();

  useEffect(() => {
    if (existingEntry && existingEntry.content) {
      setContent(existingEntry.content);
    }
  }, [existingEntry]);

  // Auto-save effect
  useEffect(() => {
    if (!content || !content.trim() || !fid) return;

    // Auto-save after 30 seconds of no changes
    const autoSaveTimer = setTimeout(async () => {
      if (content.trim() && !isSaving && !isSealing) {
        setIsAutoSaving(true);

        try {
          const endpoint = '/api/entries';
          const method = existingEntry ? 'PUT' : 'POST';

          const response = await fetch(endpoint, {
            method,
            headers: getAuthHeaders(),
            body: JSON.stringify({
              id: existingEntry?.id,
              fid,
              content,
            }),
          });

          const data = await response.json();

          if (response.ok) {
            const savedEntry: Entry = {
              id: existingEntry?.id || data.id,
              content,
              date: Date.now(),
              word_count: (content || '').trim().split(/\s+/).filter(Boolean).length,
              is_sealed: false,
            };

            onSave(savedEntry);
            setShowSealButton(true);
          }
        } catch (err) {
          console.error('Auto-save failed:', err);
        } finally {
          setIsAutoSaving(false);
        }
      }
    }, 30000); // 30 seconds

    return () => clearTimeout(autoSaveTimer);
  }, [content, fid, existingEntry, isSaving, isSealing, onSave, getAuthHeaders]);

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
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders(),
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
    <div className="fixed inset-0 pt-24 flex flex-col bg-cyber-bg">
      {/* Header arriba */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-cyber-border">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <h2 className="text-sm text-slate terminal-text">
            {formatDate(existingEntry?.date || Date.now()).toUpperCase()}
          </h2>
          {isSealed && (
            <span className="sealed-badge">
              [ SEALED ]
            </span>
          )}
        </div>
      </div>

      {/* Mensajes de error/éxito */}
      {error && (
        <div className="flex-shrink-0 px-6 mb-4">
          <div className="max-w-4xl mx-auto p-4 border border-red-500/30 bg-red-950/20 text-red-400 text-xs font-mono terminal-text">
            [ ERROR ] {error}
          </div>
        </div>
      )}

      {successMessage && (
        <div className="flex-shrink-0 px-6 mb-4">
          <div className="max-w-4xl mx-auto p-4 border border-violet/30 bg-void/20 text-violet text-xs font-mono terminal-text">
            [ SUCCESS ] {successMessage}
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
            placeholder="INITIATE ENTRY..."
            className="editor-textarea w-full p-0 border-none focus:ring-0 focus:outline-none resize-none text-base leading-relaxed overflow-auto text-foreground bg-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Botones y contador fijos abajo */}
      <div className="flex-shrink-0 border-t border-cyber-border bg-cyber-bg px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="text-xs text-slate font-mono terminal-text">
            {wordCount} WORDS
            {isAutoSaving && <span className="ml-3 text-violet">[ AUTO-SAVING... ]</span>}
          </div>

          <div className="flex gap-3">
            {!isSealed && (
              <>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !content || !content.trim()}
                  className="btn-terminal-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isSaving ? '[ SAVING... ]' : '[ SAVE ]'}
                </button>

                {showSealButton && existingEntry && !existingEntry.is_sealed && (
                  <button
                    onClick={handleSeal}
                    disabled={isSealing}
                    className="btn-terminal disabled:opacity-30 disabled:cursor-not-allowed glow-on-hover"
                  >
                    {isSealing ? '[ SEALING... ]' : '[ SEAL FOREVER ]'}
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
