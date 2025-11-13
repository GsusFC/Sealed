import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = {
  async createEntry(fid: number, content: string, mood?: string) {
    const id = crypto.randomUUID();
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const now = Date.now();

    await client.execute({
      sql: `
        INSERT INTO entries (
          id, fid, content, mood, date, word_count, char_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      args: [id, fid, content, mood || null, now, wordCount, charCount]
    });

    return id;
  },

  async getTodayEntry(fid: number) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result = await client.execute({
      sql: `
        SELECT * FROM entries
        WHERE fid = ? AND date >= ?
        ORDER BY date DESC
        LIMIT 1
      `,
      args: [fid, today.getTime()]
    });

    return result.rows[0];
  },

  async getEntries(fid: number, limit = 30) {
    const result = await client.execute({
      sql: `
        SELECT id, mood, date, word_count, is_sealed,
               substr(content, 1, 150) as excerpt
        FROM entries
        WHERE fid = ?
        ORDER BY date DESC
        LIMIT ?
      `,
      args: [fid, limit]
    });

    return result.rows;
  },

  async getEntry(id: string, fid: number) {
    const result = await client.execute({
      sql: `
        SELECT * FROM entries
        WHERE id = ? AND fid = ?
      `,
      args: [id, fid]
    });

    return result.rows[0];
  },

  async updateEntry(id: string, fid: number, content: string, mood?: string) {
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const charCount = content.length;
    const now = Date.now();

    await client.execute({
      sql: `
        UPDATE entries
        SET content = ?,
            mood = ?,
            word_count = ?,
            char_count = ?,
            updated_at = ?
        WHERE id = ? AND fid = ?
      `,
      args: [content, mood || null, wordCount, charCount, now, id, fid]
    });
  },

  async markSealed(id: string, txHash: string, contentHash: string) {
    await client.execute({
      sql: `
        UPDATE entries
        SET is_sealed = 1,
            sealed_at = ?,
            tx_hash = ?,
            content_hash = ?
        WHERE id = ?
      `,
      args: [Date.now(), txHash, contentHash, id]
    });
  },

  async getStats(fid: number) {
    const result = await client.execute({
      sql: `
        SELECT
          COUNT(*) as total_entries,
          SUM(word_count) as total_words,
          SUM(char_count) as total_chars,
          SUM(CASE WHEN is_sealed = 1 THEN 1 ELSE 0 END) as sealed_entries
        FROM entries
        WHERE fid = ?
      `,
      args: [fid]
    });

    return result.rows[0];
  }
};
