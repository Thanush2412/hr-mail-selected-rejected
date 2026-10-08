import { NextResponse } from "next/server";

export async function GET() {
  const pk = process.env.FIREBASE_PRIVATE_KEY || "";
  
  return NextResponse.json({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: {
      exists: !!pk,
      length: pk.length,
      startsWith: pk.substring(0, 30),
      endsWith: pk.substring(pk.length - 30),
      hasQuotes: pk.startsWith('"') || pk.startsWith("'"),
      newlineCount: (pk.match(/\\n/g) || []).length,
      actualNewlineCount: (pk.match(/\n/g) || []).length,
    },
    googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    hasSessionSecret: !!process.env.SESSION_SECRET,
    nodeEnv: process.env.NODE_ENV
  });
}
