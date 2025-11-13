import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/stats - Get user statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fid = searchParams.get('fid');

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing fid parameter' },
        { status: 400 }
      );
    }

    const stats = await db.getStats(parseInt(fid));

    return NextResponse.json({
      totalEntries: Number(stats.total_entries) || 0,
      totalWords: Number(stats.total_words) || 0,
      totalChars: Number(stats.total_chars) || 0,
      sealedEntries: Number(stats.sealed_entries) || 0,
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
