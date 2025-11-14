import { NextRequest, NextResponse } from 'next/server';
import { generateJWT } from '@/lib/auth';

/**
 * POST /api/auth/mock - Generate mock JWT for development/testing
 * ONLY use when Farcaster SDK fails to initialize
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fid } = body;

    if (!fid) {
      return NextResponse.json(
        { error: 'Missing fid' },
        { status: 400 }
      );
    }

    // Generate JWT for the mock FID
    const token = await generateJWT(fid);

    console.log(`[MOCK AUTH] Generated token for FID: ${fid}`);

    return NextResponse.json({
      success: true,
      token,
      fid,
      mock: true,
    });
  } catch (error) {
    console.error('Mock auth error:', error);
    return NextResponse.json(
      { error: 'Mock authentication failed' },
      { status: 500 }
    );
  }
}
