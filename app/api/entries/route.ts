import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthenticatedFID } from '@/lib/auth';

/**
 * GET /api/entries - Get all entries for a user
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
    const limit = searchParams.get('limit');

    if (!requestedFID) {
      return NextResponse.json(
        { error: 'Missing fid parameter' },
        { status: 400 }
      );
    }

    // Verify user can only access their own entries
    if (authenticatedFID !== parseInt(requestedFID)) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot access other users entries' },
        { status: 403 }
      );
    }

    const entries = await db.getEntries(
      authenticatedFID,
      limit ? parseInt(limit) : 30
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching entries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/entries - Create a new entry
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { fid, content, mood } = body;

    if (!fid || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user can only create entries for themselves
    if (authenticatedFID !== fid) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot create entries for other users' },
        { status: 403 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Entry is too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    const id = await db.createEntry(fid, content, mood);

    return NextResponse.json({ id, success: true });
  } catch (error) {
    console.error('Error creating entry:', error);
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/entries - Update an existing entry
 */
export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { id, fid, content, mood } = body;

    if (!id || !fid || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify user can only update their own entries
    if (authenticatedFID !== fid) {
      return NextResponse.json(
        { error: 'Forbidden - Cannot update other users entries' },
        { status: 403 }
      );
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Entry is too long (max 10,000 characters)' },
        { status: 400 }
      );
    }

    // Check if entry exists and belongs to user
    const entry = await db.getEntry(id, fid);
    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Don't allow editing sealed entries
    if (entry.is_sealed) {
      return NextResponse.json(
        { error: 'Cannot edit sealed entry' },
        { status: 403 }
      );
    }

    await db.updateEntry(id, fid, content, mood);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating entry:', error);
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    );
  }
}
