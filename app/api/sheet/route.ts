import { NextRequest, NextResponse } from "next/server";
import { resolveConfig } from "@/lib/db";

function extractSheetId(url: string): string | null {
  const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

function extractGid(url: string): string | null {
  const match = url.match(/[#&?]gid=([0-9]+)/);
  return match ? match[1] : null;
}

function extractSheetName(url: string): string | null {
  const match = url.match(/[#&?]sheet=([^&#]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

async function fetchDirectFromSheet(sheetUrl: string, explicitGid?: string | null, sheetName?: string | null) {
  const sheetId = extractSheetId(sheetUrl);
  if (!sheetId) {
    throw new Error("Invalid Google Sheet URL - could not extract Sheet ID");
  }

  const gid = explicitGid || extractGid(sheetUrl);
  const sheet = sheetName || extractSheetName(sheetUrl);

  let gvizUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:json`;
  if (gid) {
    gvizUrl += `&gid=${gid}`;
  } else if (sheet) {
    gvizUrl += `&sheet=${encodeURIComponent(sheet)}`;
  }

  const res = await fetch(gvizUrl, {
    cache: "no-store",
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch sheet directly from Google (HTTP ${res.status})`);
  }

  const text = await res.text();
  const match = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);/);
  if (!match || !match[1]) {
    throw new Error("Could not parse Google Sheet visualization response");
  }

  const parsed = JSON.parse(match[1]);
  const rawCols = parsed.table?.cols || [];
  const rawRows = parsed.table?.rows || [];

  // Determine headers
  const headers = rawCols.map((c: { label?: string; id?: string }, idx: number) => {
    const label = (c.label || "").trim();
    if (label) return label;
    if (idx === 0) return "Timestamp";
    return c.id || `Column ${idx + 1}`;
  });

  // Filter out completely empty trailing columns
  const activeHeaders = headers.filter((h: string) => h && !h.match(/^[A-Z]$/i));
  const finalHeaders = activeHeaders.length > 0 ? activeHeaders : headers;

  const allRows: Record<string, unknown>[] = [];

  for (let i = rawRows.length - 1; i >= 0; i--) {
    const rowObj: Record<string, unknown> = {};
    const cells = rawRows[i]?.c || [];
    let hasMeaningfulData = false;

    for (let j = 0; j < finalHeaders.length; j++) {
      const headerName = finalHeaders[j];
      const cell = cells[j];
      let val = cell ? (cell.f !== undefined && cell.f !== null ? cell.f : cell.v) : "";
      if (val === null || val === undefined) val = "";
      rowObj[headerName] = val;
      const strVal = String(val).trim();
      if (strVal !== "" && strVal !== "#N/A" && strVal !== "#VALUE!" && strVal !== "#REF!") {
        hasMeaningfulData = true;
      }
    }

    if (hasMeaningfulData) {
      rowObj["_rowIndex"] = i + 2; // 1-based index (Row 1 is header)
      allRows.push(rowObj);
    }
  }

  return {
    status: "success",
    headers: finalHeaders,
    data: allRows,
    totalRows: allRows.length,
    gid: gid || "0",
    source: "direct_sheet",
  };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const { sheetUrl: defaultSheet, gasUrl } = await resolveConfig("selection-reject-mailer");
    const sheetUrl = searchParams.get("url") || defaultSheet;
    const gidParam = searchParams.get("gid");
    const sheetParam = searchParams.get("sheet");

    if (!sheetUrl) {
      return NextResponse.json({ status: "error", message: "No sheet URL provided" }, { status: 400 });
    }

    // Try GAS first if gasUrl configured
    if (gasUrl) {
      try {
        const page = searchParams.get("page") || "1";
        const limit = searchParams.get("limit") || "50";

        const targetUrl = new URL(gasUrl);
        targetUrl.searchParams.set("action", "getSheetData");
        targetUrl.searchParams.set("url", sheetUrl);
        if (gidParam) targetUrl.searchParams.set("gid", gidParam);
        if (sheetParam) targetUrl.searchParams.set("sheet", sheetParam);
        targetUrl.searchParams.set("page", page);
        targetUrl.searchParams.set("limit", limit);

        const res = await fetch(targetUrl.toString(), {
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.status === "success" && Array.isArray(data.data)) {
            return NextResponse.json(data);
          }
        }
      } catch (err: unknown) {
        console.warn("[sheet API] GAS fetch failed, falling back to direct sheet fetch:", err);
      }
    }

    // Direct sheet fetch fallback
    try {
      const result = await fetchDirectFromSheet(sheetUrl, gidParam, sheetParam);
      return NextResponse.json(result);
    } catch (directErr: unknown) {
      const msg = directErr instanceof Error ? directErr.message : String(directErr);
      return NextResponse.json({
        status: "error",
        message: `Failed to fetch sheet data: ${msg}`,
      }, { status: 502 });
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ status: "error", message: msg }, { status: 500 });
  }
}
