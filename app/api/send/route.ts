import { NextRequest, NextResponse } from "next/server";
import { resolveConfig } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body   = await req.json();
  const { gasUrl } = await resolveConfig("selection-reject-mailer");

  if (!gasUrl) {
    return NextResponse.json({ status: "error", message: "GAS_URL not configured. Please enter your Google Apps Script Web App URL in settings." }, { status: 500 });
  }

  // Ensure this is strictly a non-offer send
  body.isOffer = false;

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      redirect: "follow",
    });
    
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      if (text.includes("accounts.google.com") || text.includes("<html") || text.includes("Service invoked too many times")) {
        return NextResponse.json({ 
          status: "failed", 
          error: "Google Apps Script rejected unauthenticated request. Please open script.google.com -> Deploy -> Manage deployments -> Edit -> set 'Who has access' to 'Anyone' -> Deploy." 
        }, { status: 403 });
      }
      return NextResponse.json({ 
        status: "failed", 
        error: `GAS returned unexpected response: ${text.slice(0, 200)}` 
      }, { status: 502 });
    }
    return NextResponse.json(json);
  } catch (err: unknown) {
    return NextResponse.json({ status: "failed", error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
