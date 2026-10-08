"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Loader2, Send, RefreshCw, ChevronLeft, ChevronRight,
  Columns3, Mail, CheckSquare, Eye, CheckCircle2, XCircle, Clock, Search, Filter,
} from "lucide-react";

import { ColumnMapping } from "@/components/column-mapper";
import { buildSelectionRejectEmailHtml } from "@/lib/email-renderer";

type Candidate = Record<string, string | number> & { _rowIndex: number };

interface SheetResponse {
  status: string;
  headers: string[];
  data: Candidate[];
  message?: string;
}

// ── field helpers ──────────────────────────────────────────────────────────────
function findHeader(headers: string[], keys: string[]): string | undefined {
  for (const key of keys) {
    const match = headers.find((h) => h.toLowerCase().trim() === key.toLowerCase().trim());
    if (match) return match;
  }
}

function getMapped(row: Candidate, mappedCol: string | undefined, fallbackKeys: string[], headers: string[]) {
  if (mappedCol) return String(row[mappedCol] ?? "");
  const h = findHeader(headers, fallbackKeys);
  return h ? String(row[h] ?? "") : "";
}

function getEmailField(row: Candidate, headers: string[], m: ColumnMapping) {
  return getMapped(row, m.email, ["to", "email", "recipient", "email id", "email address", "to email", "candidate email", "candidate mail id"], headers);
}
function getResultField(row: Candidate, headers: string[], m: ColumnMapping) {
  return getMapped(row, m.result, ["result", "status", "outcome", "decision", "interview result", "final result", "hiring status"], headers);
}
function getNameField(row: Candidate, headers: string[], m: ColumnMapping) {
  return getMapped(row, m.name, ["candidate name", "name", "full name", "candidate", "candidate_name"], headers);
}
function getCandidateIdField(row: Candidate, headers: string[], m: ColumnMapping): string {
  return getMapped(row, m.candidateId, ["candidate id", "candidateid", "id", "candidate_id", "roll no", "roll number"], headers);
}
function getRoleField(row: Candidate, headers: string[], m: ColumnMapping): string {
  return getMapped(row, m.role, ["role interviewed for", "role", "designation", "position", "applied role", "job title", "profile", "role name"], headers);
}

function buildTemplate(
  result: string,
  name: string,
  candidateId: string
): { subject: string; body: string; htmlBody: string; candidateId: string } | null {
  const r = (result || "").toLowerCase().trim();
  const FEEDBACK_URL = "https://forms.gle/Q8jMWuSXBRWjeHWQ8";

  if (r === "selected") {
    const subject = "Congratulations! You've Been Selected - FACE Prep";
    const body = `Dear ${name},

Thank you for taking the time to attend the interview at FACE Prep.

We are pleased to inform you that, based on your profile and performance in the interview, you have been selected to move forward with us. Congratulations!

We were impressed with your skills and potential, and we believe you will be a valuable addition to our team. Our team will be sharing further details regarding the next steps, including offer formalities and onboarding process, shortly.

We truly appreciate your interest in FACE Prep and the effort you put into the selection process.

We would truly value your feedback regarding your recent interview experience with us. Your input helps us enhance our process and provide a better experience for all candidates.

We kindly request you to take a few moments to share your thoughts using the link below. Your feedback is highly appreciated.

${FEEDBACK_URL}

We look forward to welcoming you to the team and wish you great success in your journey with FACE Prep.`;

    const htmlBody = buildSelectionRejectEmailHtml({
      to: "candidate@example.com",
      name,
      result: "selected",
      candidateId,
      feedbackUrl: FEEDBACK_URL,
    });

    return { subject, body, htmlBody, candidateId };
  }

  if (r === "rejected") {
    const subject = "Update on Your Application - FACE Prep";
    const body = `Dear ${name},

Thank you for taking the time to attend the interview at FACE Prep.

After careful evaluation of your profile and performance in the interview, we regret to inform you that we will not be proceeding with your application at this moment. Please know that this decision does not reflect your abilities or potential, but rather the alignment of current role requirements.

We truly appreciate your interest in FACE Prep and the effort you put into the selection process. We encourage you to apply again in the future as new opportunities arise.

We would truly value your feedback regarding your recent interview experience with us. Your input helps us enhance our process and provide a better experience for all candidates.

We kindly request you to take a few moments to share your thoughts using the link below. Your feedback is highly appreciated.

${FEEDBACK_URL}

Wishing you the very best in your job search and all your future endeavors.`;

    const htmlBody = buildSelectionRejectEmailHtml({
      to: "candidate@example.com",
      name,
      result: "rejected",
      candidateId,
      feedbackUrl: FEEDBACK_URL,
    });

    return { subject, body, htmlBody, candidateId };
  }

  return null;
}

function ResultBadge({ value }: { value: string }) {
  const v = (value || "").toLowerCase().trim();
  if (v === "selected") {
    return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 font-semibold px-2.5 py-0.5">Selected</Badge>;
  }
  if (v === "rejected") {
    return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 font-semibold px-2.5 py-0.5">Rejected</Badge>;
  }
  return <Badge variant="secondary" className="px-2 py-0.5">{value || "—"}</Badge>;
}

function EmailStatusBadge({ value }: { value: string }) {
  const v = value ?? "";
  if (!v) return <span className="text-slate-400 text-xs">—</span>;
  if (v.startsWith("✓") || v.startsWith("Sent")) {
    return <span className="text-emerald-600 text-xs font-semibold flex items-center gap-1"><CheckSquare className="h-3.5 w-3.5" />{v}</span>;
  }
  if (v.startsWith("✗") || v.toLowerCase().includes("fail")) {
    return <span className="text-rose-500 text-xs font-semibold flex items-center gap-1"><XCircle className="h-3.5 w-3.5" />{v}</span>;
  }
  return <span className="text-xs text-slate-600">{v}</span>;
}

export default function CandidatesTable({
  sheetUrl,
  columnMapping = {},
}: {
  sheetUrl: string;
  columnMapping?: ColumnMapping;
}) {
  const [headers, setHeaders] = useState<string[]>([]);
  const [allRows, setAllRows] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState<Record<number, boolean>>({});
  const [search, setSearch] = useState("");
  const [resultFilter, setResultFilter] = useState<"all" | "selected" | "rejected">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "unsent" | "sent">("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [visibleCols, setVisibleCols] = useState<Set<string>>(new Set());
  const [colsInit, setColsInit] = useState(false);
  const colsInitRef = useRef(false);

  // Multi-selection & Bulk Send
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  // Preview Dialog
  const [previewRow, setPreviewRow] = useState<Candidate | null>(null);
  const [previewTab, setPreviewTab] = useState<"visual" | "text">("visual");

  const emailStatusHeader = useMemo(() => {
    if (columnMapping.emailStatus) return columnMapping.emailStatus;
    return findHeader(headers, ["email status", "mail sent status", "status"]);
  }, [headers, columnMapping]);

  const loadData = useCallback(async () => {
    if (!sheetUrl.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sheet?url=${encodeURIComponent(sheetUrl.trim())}`);
      const data: SheetResponse = await res.json();
      if (data.status === "success") {
        setHeaders(data.headers);
        setAllRows(data.data);
        if (!colsInitRef.current) {
          colsInitRef.current = true;
          setColsInit(true);
          // Show default relevant columns
          const defaults = new Set(data.headers.slice(0, 7));
          setVisibleCols(defaults);
        }
      } else {
        toast.error(data.message || "Failed to load Google Sheet data");
      }
    } catch {
      toast.error("Network error while connecting to Google Sheet");
    } finally {
      setLoading(false);
    }
  }, [sheetUrl]);

  useEffect(() => {
    colsInitRef.current = false;
    setColsInit(false);
    setSelected(new Set());
    setPage(1);
    loadData();
  }, [sheetUrl, loadData]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    const q = search.toLowerCase().trim();
    return allRows.filter((r) => {
      const email = getEmailField(r, headers, columnMapping);
      const name = getNameField(r, headers, columnMapping);
      const id = getCandidateIdField(r, headers, columnMapping);
      const role = getRoleField(r, headers, columnMapping);
      const result = getResultField(r, headers, columnMapping).toLowerCase().trim();
      const status = emailStatusHeader ? String(r[emailStatusHeader] ?? "") : "";

      // Result filter
      if (resultFilter === "selected" && result !== "selected") return false;
      if (resultFilter === "rejected" && result !== "rejected") return false;

      // Status filter
      const isSent = status.startsWith("✓") || status.startsWith("Sent");
      if (statusFilter === "sent" && !isSent) return false;
      if (statusFilter === "unsent" && isSent) return false;

      // Text search
      if (q) {
        const rowValues = Object.values(r).map((v) => String(v).toLowerCase()).join(" ");
        const matches =
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          id.toLowerCase().includes(q) ||
          role.toLowerCase().includes(q) ||
          rowValues.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [allRows, headers, columnMapping, search, resultFilter, statusFilter, emailStatusHeader]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  // Counts & Statistics
  const stats = useMemo(() => {
    let totalSelected = 0;
    let totalRejected = 0;
    let totalSent = 0;
    let totalPending = 0;

    for (const r of allRows) {
      const res = getResultField(r, headers, columnMapping).toLowerCase().trim();
      const status = emailStatusHeader ? String(r[emailStatusHeader] ?? "") : "";
      const isSent = status.startsWith("✓") || status.startsWith("Sent");

      if (res === "selected") totalSelected++;
      if (res === "rejected") totalRejected++;
      if (isSent) totalSent++;
      else if (res === "selected" || res === "rejected") totalPending++;
    }

    return { total: allRows.length, totalSelected, totalRejected, totalSent, totalPending };
  }, [allRows, headers, columnMapping, emailStatusHeader]);

  // Selection handlers
  const toggleSelectAll = () => {
    if (selected.size === filteredRows.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filteredRows.map((r) => r._rowIndex)));
    }
  };

  const toggleSelectRow = (rowIndex: number) => {
    const next = new Set(selected);
    if (next.has(rowIndex)) next.delete(rowIndex);
    else next.add(rowIndex);
    setSelected(next);
  };

  // Send single email
  const sendEmail = async (row: Candidate) => {
    const rowIndex = row._rowIndex;
    const name = getNameField(row, headers, columnMapping) || "Candidate";
    const email = getEmailField(row, headers, columnMapping);
    const candidateId = getCandidateIdField(row, headers, columnMapping);
    const result = getResultField(row, headers, columnMapping);

    if (!email) {
      toast.error(`Missing email address for row ${rowIndex}`);
      return;
    }

    const template = buildTemplate(result, name, candidateId);
    if (!template) {
      toast.error(`Row ${rowIndex} has invalid result "${result}". Must be "Selected" or "Rejected".`);
      return;
    }

    setSending((prev) => ({ ...prev, [rowIndex]: true }));
    try {
      const res = await fetch("/api/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetUrl,
          rowIndex,
          to: email,
          subject: template.subject,
          body: template.body,
          candidateId,
          emailStatusColumn: emailStatusHeader,
        }),
      });

      const data = await res.json();
      if (data.status === "sent" || data.status === "success") {
        toast.success(`Email sent to ${name} (${email})`);
        // Update local status
        const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
        setAllRows((prev) =>
          prev.map((r) =>
            r._rowIndex === rowIndex
              ? { ...r, [emailStatusHeader || "Email Status"]: `Sent to ${email} (${timestamp})` }
              : r
          )
        );
      } else {
        toast.error(data.error || data.message || "Failed to send email");
      }
    } catch {
      toast.error("Network error while sending email");
    } finally {
      setSending((prev) => ({ ...prev, [rowIndex]: false }));
    }
  };

  // Send Bulk Emails
  const handleBulkSend = async () => {
    const targetRows = allRows.filter((r) => selected.has(r._rowIndex));
    if (targetRows.length === 0) return;

    setBulkSending(true);
    setBulkProgress({ current: 0, total: targetRows.length });

    let sentCount = 0;
    let failCount = 0;

    for (let i = 0; i < targetRows.length; i++) {
      const row = targetRows[i];
      const name = getNameField(row, headers, columnMapping) || "Candidate";
      const email = getEmailField(row, headers, columnMapping);
      const candidateId = getCandidateIdField(row, headers, columnMapping);
      const result = getResultField(row, headers, columnMapping);

      if (!email) {
        failCount++;
        continue;
      }

      const template = buildTemplate(result, name, candidateId);
      if (!template) {
        failCount++;
        continue;
      }

      try {
        const res = await fetch("/api/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sheetUrl,
            rowIndex: row._rowIndex,
            to: email,
            subject: template.subject,
            body: template.body,
            candidateId,
            emailStatusColumn: emailStatusHeader,
          }),
        });
        const data = await res.json();
        if (data.status === "sent" || data.status === "success") {
          sentCount++;
          const timestamp = new Date().toISOString().slice(0, 19).replace("T", " ");
          setAllRows((prev) =>
            prev.map((r) =>
              r._rowIndex === row._rowIndex
                ? { ...r, [emailStatusHeader || "Email Status"]: `Sent to ${email} (${timestamp})` }
                : r
            )
          );
        } else {
          failCount++;
        }
      } catch {
        failCount++;
      }

      setBulkProgress({ current: i + 1, total: targetRows.length });
      // Small pause to prevent rate limiting
      if (i < targetRows.length - 1) {
        await new Promise((r) => setTimeout(r, 600));
      }
    }

    setBulkSending(false);
    setBulkOpen(false);
    setSelected(new Set());
    toast.success(`Bulk dispatch finished: ${sentCount} sent, ${failCount} failed/skipped.`);
  };

  return (
    <div className="space-y-4">
      {/* ── STATS SUMMARY CARDS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border rounded-xl p-3 shadow-xs">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Rows</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3 shadow-xs">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" /> Selected
          </p>
          <p className="text-2xl font-bold text-emerald-900 mt-1">{stats.totalSelected}</p>
        </div>
        <div className="bg-rose-50/70 border border-rose-200 rounded-xl p-3 shadow-xs">
          <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle className="h-3.5 w-3.5" /> Rejected
          </p>
          <p className="text-2xl font-bold text-rose-900 mt-1">{stats.totalRejected}</p>
        </div>
        <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3 shadow-xs">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider flex items-center gap-1">
            <CheckSquare className="h-3.5 w-3.5" /> Mails Sent
          </p>
          <p className="text-2xl font-bold text-blue-900 mt-1">{stats.totalSent}</p>
        </div>
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 shadow-xs">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wider flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" /> Ready to Send
          </p>
          <p className="text-2xl font-bold text-amber-900 mt-1">{stats.totalPending}</p>
        </div>
      </div>

      {/* ── TOOLBAR / CONTROLS ── */}
      <div className="bg-white border rounded-xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Input */}
          <div className="relative w-64 max-w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search candidate name, email, role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-8 text-xs h-9"
            />
          </div>

          {/* Result Filter */}
          <Select
            value={resultFilter}
            onValueChange={(v) => {
              if (v) setResultFilter(v as "all" | "selected" | "rejected");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-36">
              <Filter className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
              <SelectValue placeholder="Result Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Results</SelectItem>
              <SelectItem value="selected" className="text-xs text-emerald-700 font-semibold">Selected Only</SelectItem>
              <SelectItem value="rejected" className="text-xs text-rose-700 font-semibold">Rejected Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Email Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              if (v) setStatusFilter(v as "all" | "unsent" | "sent");
              setPage(1);
            }}
          >
            <SelectTrigger className="h-9 text-xs w-36">
              <SelectValue placeholder="Email Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="unsent" className="text-xs">Unsent / Pending</SelectItem>
              <SelectItem value="sent" className="text-xs">Sent Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Sheet Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="h-9 text-xs gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Bulk Action & Column Selector */}
        <div className="flex items-center gap-2">
          {selected.size > 0 && (
            <Button
              size="sm"
              onClick={() => setBulkOpen(true)}
              className="h-9 bg-[#f05136] hover:bg-[#d94228] text-white text-xs font-semibold gap-1.5 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Send Selected ({selected.size})
            </Button>
          )}

          <Popover>
            <PopoverTrigger className="h-9 px-3 border border-slate-300 rounded-md inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer">
              <Columns3 className="h-3.5 w-3.5" />
              Columns
            </PopoverTrigger>
            <PopoverContent className="w-60 p-3 max-h-80 overflow-y-auto" align="end">
              <p className="text-xs font-bold text-slate-700 mb-2">Visible Table Columns</p>
              <div className="space-y-1.5">
                {headers.map((h) => (
                  <label key={h} className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer hover:text-slate-900">
                    <Checkbox
                      checked={visibleCols.has(h)}
                      onCheckedChange={(checked) => {
                        const next = new Set(visibleCols);
                        if (checked) next.add(h);
                        else next.delete(h);
                        setVisibleCols(next);
                      }}
                    />
                    <span className="truncate">{h}</span>
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* ── CANDIDATES DATA TABLE ── */}
      <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 border-b">
              <TableRow>
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={filteredRows.length > 0 && selected.size === filteredRows.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-12 text-xs font-bold text-slate-600">Row</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Candidate Name</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Email Address</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Candidate ID</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Role</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Outcome</TableHead>
                <TableHead className="text-xs font-bold text-slate-600">Email Status</TableHead>
                <TableHead className="w-28 text-right text-xs font-bold text-slate-600 pr-4">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="h-6 w-6 animate-spin text-[#f05136]" />
                      <span className="text-xs">Loading candidates from Google Sheet...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-40 text-center text-slate-400 text-xs">
                    {sheetUrl ? "No candidate records matched your filters." : "Please configure a Google Sheet URL in Settings."}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row) => {
                  const rowIndex = row._rowIndex;
                  const name = getNameField(row, headers, columnMapping);
                  const email = getEmailField(row, headers, columnMapping);
                  const id = getCandidateIdField(row, headers, columnMapping);
                  const role = getRoleField(row, headers, columnMapping);
                  const result = getResultField(row, headers, columnMapping);
                  const status = emailStatusHeader ? String(row[emailStatusHeader] ?? "") : "";
                  const isSendingThis = sending[rowIndex];
                  const isSelected = selected.has(rowIndex);
                  const canSend = (result.toLowerCase().trim() === "selected" || result.toLowerCase().trim() === "rejected") && email;

                  return (
                    <TableRow key={rowIndex} className={`hover:bg-slate-50/80 transition-colors ${isSelected ? "bg-orange-50/50" : ""}`}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectRow(rowIndex)}
                        />
                      </TableCell>
                      <TableCell className="text-xs font-mono text-slate-400">{rowIndex}</TableCell>
                      <TableCell className="text-xs font-semibold text-slate-800">{name || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-600 font-mono">{email || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-500">{id || "—"}</TableCell>
                      <TableCell className="text-xs text-slate-600">{role || "—"}</TableCell>
                      <TableCell>
                        <ResultBadge value={result} />
                      </TableCell>
                      <TableCell>
                        <EmailStatusBadge value={status} />
                      </TableCell>
                      <TableCell className="text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Live Preview Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setPreviewRow(row);
                              setPreviewTab("visual");
                            }}
                            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-800"
                            title="Preview Email"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          {/* Send Single Email */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => sendEmail(row)}
                            disabled={isSendingThis || !canSend}
                            className="h-8 text-xs font-medium gap-1 text-slate-700 hover:text-slate-900 border-slate-300"
                          >
                            {isSendingThis ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#f05136]" />
                            ) : (
                              <Mail className="h-3.5 w-3.5 text-[#f05136]" />
                            )}
                            Send
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── PAGINATION CONTROLS ── */}
        <div className="border-t px-4 py-3 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-700">{filteredRows.length === 0 ? 0 : (page - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-slate-700">{Math.min(page * pageSize, filteredRows.length)}</strong> of{" "}
            <strong className="text-slate-700">{filteredRows.length}</strong> candidates
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span>Rows per page:</span>
              <Select
                value={String(pageSize)}
                onValueChange={(v) => {
                  if (v) {
                    setPageSize(Number(v));
                    setPage(1);
                  }
                }}
              >
                <SelectTrigger className="h-7 text-xs w-16 bg-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-7 w-7 p-0"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-2 font-medium">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="h-7 w-7 p-0"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── EMAIL PREVIEW DIALOG ── */}
      <Dialog open={!!previewRow} onOpenChange={(open) => !open && setPreviewRow(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          {previewRow && (() => {
            const name = getNameField(previewRow, headers, columnMapping) || "Candidate";
            const email = getEmailField(previewRow, headers, columnMapping);
            const candidateId = getCandidateIdField(previewRow, headers, columnMapping);
            const result = getResultField(previewRow, headers, columnMapping);
            const template = buildTemplate(result, name, candidateId);

            return (
              <>
                <DialogHeader className="p-4 pb-2 border-b bg-slate-50 flex flex-row items-center justify-between">
                  <div>
                    <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Mail className="h-4 w-4 text-[#f05136]" />
                      Email Preview: {name}
                    </DialogTitle>
                    <DialogDescription className="text-xs text-slate-500 mt-0.5">
                      To: <span className="font-mono text-slate-700">{email || "candidate@example.com"}</span> &nbsp;|&nbsp; Outcome: <ResultBadge value={result} />
                    </DialogDescription>
                  </div>

                  <div className="flex items-center gap-2 mr-6">
                    <div className="bg-slate-200 p-0.5 rounded-lg flex text-xs">
                      <button
                        onClick={() => setPreviewTab("visual")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${previewTab === "visual" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
                      >
                        Branded HTML
                      </button>
                      <button
                        onClick={() => setPreviewTab("text")}
                        className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${previewTab === "text" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"}`}
                      >
                        Plain Text
                      </button>
                    </div>
                  </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-4 bg-slate-100 min-h-[420px]">
                  {template ? (
                    previewTab === "visual" ? (
                      <div className="bg-white rounded-lg shadow-sm border overflow-hidden max-w-xl mx-auto">
                        <iframe
                          srcDoc={template.htmlBody}
                          title="Email Preview"
                          className="w-full h-[480px] border-none"
                        />
                      </div>
                    ) : (
                      <div className="bg-white rounded-lg p-5 border text-xs font-mono whitespace-pre-wrap leading-relaxed max-w-xl mx-auto text-slate-800">
                        <div className="pb-3 mb-3 border-b text-slate-500">
                          <strong>Subject:</strong> {template.subject}
                        </div>
                        {template.body}
                      </div>
                    )
                  ) : (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      Cannot generate preview: Status is "{result}". Must be "Selected" or "Rejected".
                    </div>
                  )}
                </div>

                <DialogFooter className="p-3 border-t bg-slate-50 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setPreviewRow(null)} className="text-xs">
                    Close
                  </Button>
                  {template && email && (
                    <Button
                      size="sm"
                      onClick={() => {
                        sendEmail(previewRow);
                        setPreviewRow(null);
                      }}
                      className="bg-[#f05136] hover:bg-[#d94228] text-white text-xs font-semibold gap-1.5 shadow-sm"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Send This Email Now
                    </Button>
                  )}
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── BULK SEND CONFIRMATION DIALOG ── */}
      <Dialog open={bulkOpen} onOpenChange={(open) => !bulkSending && setBulkOpen(open)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-[#f05136]" />
              Confirm Bulk Email Dispatch
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              You are about to dispatch emails to {selected.size} selected candidate(s).
            </DialogDescription>
          </DialogHeader>

          <div className="py-3 space-y-3">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-900 leading-relaxed">
              Emails will be sent individually through your connected Google Apps Script endpoint. Each row in your Google Sheet will be stamped with the sent timestamp.
            </div>

            {bulkSending && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-slate-600 font-medium">
                  <span>Dispatching emails...</span>
                  <span>{bulkProgress.current} / {bulkProgress.total}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-[#f05136] h-2 transition-all duration-300"
                    style={{ width: `${(bulkProgress.current / Math.max(1, bulkProgress.total)) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setBulkOpen(false)}
              disabled={bulkSending}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleBulkSend}
              disabled={bulkSending}
              className="bg-[#f05136] hover:bg-[#d94228] text-white text-xs font-semibold gap-1.5"
            >
              {bulkSending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              {bulkSending ? "Sending..." : `Send ${selected.size} Emails`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
