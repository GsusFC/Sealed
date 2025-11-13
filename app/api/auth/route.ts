import { NextRequest, NextResponse } from 'next/server';
import { verifySIWFMessage, generateJWT } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, signature } = body;

    if (!message || !signature) {
      return NextResponse.json(
        { error: 'Missing message or signature' },
        { status: 400 }
      );
    }

    // Verify the SIWF message and signature
    const verificationResult = await verifySIWFMessage({ message, signature });

    if (!verificationResult.valid || !verificationResult.fid) {
      return NextResponse.json(
        { error: 'Invalid signature or message' },
        { status: 401 }
      );
    }

    // Generate JWT for the authenticated user
    const token = await generateJWT(verificationResult.fid);

    return NextResponse.json({
      success: true,
      token,
      fid: verificationResult.fid,
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
