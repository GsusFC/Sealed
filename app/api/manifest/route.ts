import { NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET() {
  const manifest = {
    version: "1",
    miniapp: {
      name: "Sealed",
      description: "Your thoughts, sealed forever",
      iconUrl: `${process.env.NEXT_PUBLIC_APP_URL}/icons/sealed.svg`,
      homeUrl: process.env.NEXT_PUBLIC_APP_URL,
      features: ["wallet"],
      primaryColor: "#1A1A1A"
    }
  };

  return NextResponse.json(manifest, {
    headers: {
      'Cache-Control': 'public, max-age=3600',
      'Content-Type': 'application/json',
    }
  });
}
