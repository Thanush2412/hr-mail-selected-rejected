"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CandidatesTable from "@/components/candidates-table";
import ColumnMapper, { ColumnMapping } from "@/components/column-mapper";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from "@/components/ui/sheet";
import {
  Settings, Loader2, Columns3,
  LogOut, User, UserPlus, Trash2, Shield, Mail, CheckCircle2,
} from "lucide-react";

interface Admin { email: string; name: string | null; }

export default function Home() {
  const router = useRouter();

  // Config
  const [sheetUrl, setSheetUrl]               = useState("");
  const [gasUrl, setGasUrl]                   = useState("");
  const [googleClientId, setGoogleClientId]   = useState("");
  const [googleClientSec, setGoogleClientSec] = useState("");
  const [sessionSecret, setSessionSecret]     = useState("");
  const [activeUrl, setActiveUrl]             = useState("");
  const [settingsOpen, setSettingsOpen]       = useState(false);
  const [saving, setSaving]                   = useState(false);
  const [configLoaded, setConfigLoaded]       = useState(false);
  const [userName, setUserName]               = useState("");
  const [settingsTab, setSettingsTab]         = useState<"settings" | "columns" | "admins">("settings");

  // Column mapping
  const [sheetHeaders, setSheetHeaders]     = useState<string[]>([]);
  const [columnMapping, setColumnMapping]   = useState<ColumnMapping>({});
  const [activeMapping, setActiveMapping]   = useState<ColumnMapping>({});
  const [loadingHeaders, setLoadingHeaders] = useState(false);

  // Admin management
  const [admins, setAdmins]               = useState<Admin[]>([]);
  const [adminsLoading, setAdminsLoading] = useState(false);
  const [newEmail, setNewEmail]           = useState("");
  const [newName, setNewName]             = useState("");
  const [addingAdmin, setAddingAdmin]     = useState(false);

  // Load session + config on mount
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => { if (d.name) setUserName(d.name); })
      .catch(() => {});

    fetch("/api/config")
      .then((r) => r.json())
      .then((d) => {
        if (d.sheetUrl) { setSheetUrl(d.sheetUrl); setActiveUrl(d.sheetUrl); }
        if (d.gasUrl)         setGasUrl(d.gasUrl);
        if (d.googleClientId) setGoogleClientId(d.googleClientId);
        if (d.columnMapping) { setColumnMapping(d.columnMapping); setActiveMapping(d.columnMapping); }
        setConfigLoaded(true);
      })
      .catch(() => setConfigLoaded(true));
  }, []);

  // Load sheet headers when columns tab opens
  useEffect(() => {
    if (!settingsOpen || !sheetUrl.trim() || settingsTab !== "columns") return;
    setLoadingHeaders(true);
    fetch(`/api/sheet?url=${encodeURIComponent(sheetUrl.trim())}`)
      .then((r) => r.json())
      .then((d) => { if (d.headers) setSheetHeaders(d.headers.filter((h: string) => h.trim())); })
      .catch(() => {})
      .finally(() => setLoadingHeaders(false));
  }, [settingsOpen, settingsTab, sheetUrl]);

  // Load admins when admins tab opens
  function loadAdmins() {
    setAdminsLoading(true);
    fetch("/api/auth/admins")
      .then((r) => r.json())
      .then((d) => { if (d.admins) setAdmins(d.admins); })
      .catch(() => {})
      .finally(() => setAdminsLoading(false));
  }
  useEffect(() => {
    if (settingsOpen && settingsTab === "admins") loadAdmins();
  }, [settingsOpen, settingsTab]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login"); router.refresh();
  }

  async function addAdmin() {
    if (!newEmail.trim()) return;
    setAddingAdmin(true);
    try {
      const res = await fetch("/api/auth/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), name: newName.trim() || undefined }),
      });
      const data = await res.json();
      if (data.status === "added") {
        toast.success(`Added ${newEmail.trim()}`);
        setNewEmail(""); setNewName("");
        loadAdmins();
      } else {
        toast.error(data.message || "Failed to add admin");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setAddingAdmin(false);
    }
  }

  async function deleteAdmin(email: string) {
    try {
      const res = await fetch(`/api/auth/admins?email=${encodeURIComponent(email)}`, { method: "DELETE" });
      const data = await res.json();
      if (data.status === "deleted") {
        toast.success(`Removed ${email}`);
        setAdmins((prev) => prev.filter((a) => a.email !== email));
      } else {
        toast.error(data.message || "Failed to remove admin");
      }
    } catch {
      toast.error("Network error");
    }
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sheetUrl:        sheetUrl.trim()        || undefined,
          gasUrl:          gasUrl.trim()          || undefined,
          googleClientId:  googleClientId.trim()  || undefined,
          googleClientSec: googleClientSec.trim() || undefined,
          sessionSecret:   sessionSecret.trim()   || undefined,
          columnMapping,
        }),
      });
      const data = await res.json();
      if (data.status === "saved") {
        toast.success("Settings saved successfully");
        setActiveUrl(sheetUrl.trim());
        setActiveMapping(columnMapping);
        setSettingsOpen(false);
      } else {
        toast.error(data.message || "Failed to save settings");
      }
    } catch {
      toast.error("Network error saving settings");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans">
      <Toaster position="top-right" richColors />

      {/* ── TOP NAVBAR ── */}
      <header className="bg-[#1e293b] text-white border-b border-slate-700 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#f05136] flex items-center justify-center font-bold text-white shadow-xs text-sm">
              FP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">FACE Prep</span>
                <span className="text-[10px] font-semibold bg-[#f05136] text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Selection / Rejection Mailer
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Automated Candidate Selection &amp; Rejection Email Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {userName && (
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 text-xs px-3 py-1.5 rounded-lg">
                <User className="h-3.5 w-3.5 text-[#f05136]" />
                <span className="font-medium">{userName}</span>
              </div>
            )}

            {/* SETTINGS DRAWER */}
            <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
              <SheetTrigger className="h-9 px-3 bg-slate-800 border border-slate-700 text-slate-200 hover:bg-slate-700 text-xs font-semibold rounded-md inline-flex items-center gap-1.5 transition-colors cursor-pointer">
                <Settings className="h-3.5 w-3.5 text-[#f05136]" />
                Settings
              </SheetTrigger>
              <SheetContent className="w-full sm:max-w-lg flex flex-col p-0 overflow-hidden bg-white">
                <SheetHeader className="p-5 pb-3 border-b bg-slate-50">
                  <SheetTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <Settings className="h-4 w-4 text-[#f05136]" />
                    Mailer Configuration
                  </SheetTitle>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSettingsTab("settings")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${settingsTab === "settings" ? "bg-[#f05136] text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                    >
                      General
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab("columns")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${settingsTab === "columns" ? "bg-[#f05136] text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                    >
                      <Columns3 className="h-3 w-3" />
                      Columns
                    </button>
                    <button
                      type="button"
                      onClick={() => setSettingsTab("admins")}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${settingsTab === "admins" ? "bg-[#f05136] text-white" : "bg-slate-200 text-slate-700 hover:bg-slate-300"}`}
                    >
                      <Shield className="h-3 w-3" />
                      Admins
                    </button>
                  </div>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-5 space-y-5">
                  {/* GENERAL SETTINGS */}
                  {settingsTab === "settings" && (
                    <form id="settings-form" onSubmit={handleSaveSettings} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Google Sheet URL</label>
                        <Input
                          placeholder="https://docs.google.com/spreadsheets/d/..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="text-xs font-mono h-9"
                        />
                        <p className="text-[11px] text-slate-400">Google Sheet containing candidates with "Selected" or "Rejected" outcomes.</p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Google Apps Script Web App URL</label>
                        <Input
                          placeholder="https://script.google.com/macros/s/.../exec"
                          value={gasUrl}
                          onChange={(e) => setGasUrl(e.target.value)}
                          className="text-xs font-mono h-9"
                        />
                        <p className="text-[11px] text-slate-400">The deployed GAS web app endpoint (code.gs doPost).</p>
                      </div>

                      <div className="border-t pt-4 space-y-3">
                        <p className="text-xs font-bold text-slate-700">OAuth Credentials (Optional)</p>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-600">Google Client ID</label>
                          <Input
                            placeholder="...apps.googleusercontent.com"
                            value={googleClientId}
                            onChange={(e) => setGoogleClientId(e.target.value)}
                            className="text-xs font-mono h-9"
                          />
                        </div>
                      </div>
                    </form>
                  )}

                  {/* COLUMN MAPPING */}
                  {settingsTab === "columns" && (
                    <div className="space-y-4">
                      {loadingHeaders ? (
                        <div className="py-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                          <Loader2 className="h-4 w-4 animate-spin text-[#f05136]" />
                          Fetching sheet headers...
                        </div>
                      ) : sheetHeaders.length === 0 ? (
                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                          Please enter a valid Google Sheet URL in the General tab first to load column headers.
                        </div>
                      ) : (
                        <ColumnMapper
                          headers={sheetHeaders}
                          mapping={columnMapping}
                          onChange={setColumnMapping}
                        />
                      )}
                    </div>
                  )}

                  {/* ADMINS */}
                  {settingsTab === "admins" && (
                    <div className="space-y-4">
                      <div className="bg-slate-50 border p-3 rounded-lg space-y-2">
                        <p className="text-xs font-bold text-slate-700">Add Authorized Administrator</p>
                        <div className="flex gap-2">
                          <Input
                            placeholder="admin@faceprep.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="text-xs h-8 flex-1 font-mono"
                          />
                          <Input
                            placeholder="Name (optional)"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="text-xs h-8 w-32"
                          />
                          <Button size="sm" onClick={addAdmin} disabled={addingAdmin || !newEmail.trim()} className="h-8 bg-[#f05136] text-white text-xs gap-1">
                            {addingAdmin ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3 w-3" />}
                            Add
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Authorized Admins ({admins.length})</p>
                        {adminsLoading ? (
                          <div className="py-4 text-center text-xs text-slate-400">Loading admins...</div>
                        ) : admins.length === 0 ? (
                          <p className="text-xs text-slate-400">No custom admins added. (Authorized domains in auth.config apply)</p>
                        ) : (
                          admins.map((a) => (
                            <div key={a.email} className="flex items-center justify-between p-2 rounded-md border text-xs bg-white">
                              <div>
                                <span className="font-semibold text-slate-800">{a.name || a.email}</span>
                                {a.name && <span className="text-slate-400 ml-1.5 font-mono">({a.email})</span>}
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => deleteAdmin(a.email)} className="h-6 w-6 p-0 text-slate-400 hover:text-rose-600">
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-4 border-t bg-slate-50 flex items-center justify-between">
                  <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(false)} className="text-xs">
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSaveSettings}
                    disabled={saving}
                    className="bg-[#f05136] hover:bg-[#d94228] text-white text-xs font-semibold gap-1.5 shadow-sm"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                    Save Settings
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* LOGOUT */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="h-9 text-slate-300 hover:text-white hover:bg-slate-800 p-2"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 w-full">
        {configLoaded && (
          <CandidatesTable
            sheetUrl={activeUrl}
            columnMapping={activeMapping}
          />
        )}
      </main>
    </div>
  );
}
