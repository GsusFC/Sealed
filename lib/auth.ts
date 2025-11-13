// Authentication utilities for Sign In With Farcaster
import { SignJWT, jwtVerify } from 'jose';
import { verifyTypedData } from 'viem';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_ALGORITHM = 'HS256';

export interface AuthPayload {
  fid: number;
  iat?: number;
  exp?: number;
}

/**
 * Verify a Sign In With Farcaster message and signature
 */
export async function verifySIWFMessage(params: {
  message: string;
  signature: string;
}): Promise<{ valid: boolean; fid?: number }> {
  try {
    const { message, signature } = params;

    // Parse the SIWF message to extract FID
    // Format: "sealed-diary.netlify.app wants you to sign in with your Farcaster account:\nfid: 12345\n..."
    const fidMatch = message.match(/fid:\s*(\d+)/i);
    if (!fidMatch) {
      console.error('Could not extract FID from message');
      return { valid: false };
    }

    const fid = parseInt(fidMatch[1], 10);

    // For now, we trust the signature from Farcaster SDK
    // In production, you'd want to verify against Farcaster's registry
    // This requires calling Farcaster Hub API or verifying with viem

    // Basic validation: ensure signature exists and has proper format
    if (!signature || !signature.startsWith('0x') || signature.length < 132) {
      console.error('Invalid signature format');
      return { valid: false };
    }

    // TODO: In production, verify signature against Farcaster registry
    // For now, we trust signatures from the official SDK
    console.log('SIWF verification passed for FID:', fid);

    return { valid: true, fid };
  } catch (error) {
    console.error('Error verifying SIWF message:', error);
    return { valid: false };
  }
}

/**
 * Generate a JWT token for an authenticated user
 */
export async function generateJWT(fid: number): Promise<string> {
  const secret = new TextEncoder().encode(JWT_SECRET);

  const token = await new SignJWT({ fid })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setIssuedAt()
    .setExpirationTime('7d') // Token expires in 7 days
    .sign(secret);

  return token;
}

/**
 * Verify a JWT token and return the payload
 */
export async function verifyJWT(token: string): Promise<AuthPayload | null> {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);

    const { payload } = await jwtVerify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });

    return payload as unknown as AuthPayload;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Extract JWT from Authorization header
 */
export function extractToken(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  return authHeader.substring(7);
}

/**
 * Get authenticated user FID from request headers
 */
export async function getAuthenticatedFID(authHeader: string | null): Promise<number | null> {
  const token = extractToken(authHeader);
  if (!token) {
    return null;
  }

  const payload = await verifyJWT(token);
  return payload?.fid || null;
}
