import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedFID } from '@/lib/auth';

/**
 * GET /api/stats - Get user statistics
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const authenticatedFID = await getAuthenticatedFID(authHeader);

    if (!authenticatedFID) {
      return NextResponse.json(
        { error: 'Unauthorized - Invalid or missing token' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedFID = searchParams.get('fid');

    if (!requestedFID) {
      return NextResponse.json(
        { error: 'Missing fid parameter' },
        { status: 400 }
      );
    }

    // Verify user can only access their own stats
    if (authenticatedFID !== parseInt(requestedFID)) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot access other users stats' },
        { status: 403 }
      );
    }

    const stats = await db.getStats(authenticatedFID);

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
