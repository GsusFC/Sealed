import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db-edge';

export const runtime = 'edge';

/**
 * POST /api/seal - Mark an entry as sealed with blockchain transaction hash
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, fid, txHash, contentHash } = body;

    if (!id || !fid || !txHash || !contentHash) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify entry exists and belongs to user
    const entry = await db.getEntry(id, fid);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Check if already sealed
    if (entry.is_sealed) {
      return NextResponse.json(
        { error: 'Entry is already sealed' },
        { status: 400 }
      );
    }

    // Mark as sealed
    await db.markSealed(id, txHash, contentHash);

    return NextResponse.json({
      success: true,
      message: 'Entry sealed successfully'
    });
  } catch (error) {
    console.error('Error sealing entry:', error);
    return NextResponse.json(
      { error: 'Failed to seal entry' },
      { status: 500 }
    );
  }
}
