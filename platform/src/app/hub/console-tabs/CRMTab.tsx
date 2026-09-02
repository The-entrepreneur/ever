import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Search, Download, Filter, Eye, CheckCircle2, RefreshCw, AlertCircle,
  Phone, Mail, FileText, Calendar, Users, Target, Trash2, ExternalLink,
  MessageSquare, Star, CheckSquare, Square, ShieldAlert, ArrowUpDown,
  X, Check, Lock, ChevronRight, SlidersHorizontal
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { Modal } from "../../../shared/Modal";
import { useToast } from "../../../shared/ToastContext";
import { DateRangePicker, DateRangeValue, getDateRangeFromPreset } from "../../../shared/DateRangePicker";

interface Lead {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  status: string | null; // "new" | "captured" | "contacted" | "booked" | "lost"
  lead_quality: number | null;
  check_in?: string | null;
  check_out?: string | null;
  guests?: number | null;
  purpose?: string | null;
  channel?: string | null;
  session_id?: string | null;
}

interface CRMTabProps {
  onNavigate?: (tab: string, context?: any) => void;
  propertyName?: string;
  role?: string;
}

export function CRMTab({ onNavigate, propertyName = "My Hotel", role = "hotel_manager" }: CRMTabProps) {
  const { hotelId, user } = useAuth();
  const { showToast } = useToast();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All"); // All, new, captured, contacted, booked, lost
  const [minLeadQuality, setMinLeadQuality] = useState<number>(1);
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getDateRangeFromPreset("90d"));

  // Selection & Bulk Actions
  const [selectedLeadIds, setSelectedLeadIds] = useState<Set<string>>(new Set());

  // Modals
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [erasureLead, setErasureLead] = useState<Lead | null>(null);
  const [confirmPropertyName, setConfirmPropertyName] = useState("");
  const [isErasing, setIsErasing] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const [totalCount, setTotalCount] = useState(0);

  const isManager = role === "hotel_manager" || role === "super_admin" || role === "agency_staff";

  // ── Fetch Leads from Supabase or Sandbox ────────────────────────────────────
  const fetchLeads = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);

    if (isSandbox && sandboxData) {
      let filtered = [...(sandboxData.leads || [])];

      // Search
      if (searchTerm) {
        const s = searchTerm.toLowerCase();
        filtered = filtered.filter(
          l => (l.name && l.name.toLowerCase().includes(s)) ||
               (l.email && l.email.toLowerCase().includes(s)) ||
               (l.phone && l.phone.toLowerCase().includes(s))
        );
      }

      // Status Filter
      if (statusFilter !== "All") {
        if (statusFilter === "Action Needed") {
          filtered = filtered.filter(l => l.status === "captured" || l.status === "new");
        } else {
          filtered = filtered.filter(l => l.status?.toLowerCase() === statusFilter.toLowerCase());
        }
      }

      // Lead Quality Filter
      if (minLeadQuality > 1) {
        filtered = filtered.filter(l => (l.lead_quality || 1) >= minLeadQuality);
      }

      // Date Range Filter (created_at)
      const startMs = new Date(dateRange.startDate).getTime();
      const endMs = new Date(dateRange.endDate).getTime();
      filtered = filtered.filter(l => {
        const createdMs = new Date(l.created_at).getTime();
        return createdMs >= startMs && createdMs <= endMs;
      });

      setTotalCount(filtered.length);
      setLeads(filtered.slice(page * pageSize, (page + 1) * pageSize) as Lead[]);
      setLoading(false);
      return;
    }

    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("hotel_id", hotelId)
        .gte("created_at", dateRange.startDate)
        .lte("created_at", dateRange.endDate)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "All") {
        if (statusFilter === "Action Needed") {
          query = query.in("status", ["captured", "new"]);
        } else {
          query = query.eq("status", statusFilter.toLowerCase());
        }
      }

      if (minLeadQuality > 1) {
        query = query.gte("lead_quality", minLeadQuality);
      }

      // Pagination
      query = query.range(page * pageSize, (page + 1) * pageSize - 1);

      const { data, count, error } = await query;

      if (!error && data) {
        setLeads(data as Lead[]);
        setTotalCount(count ?? 0);
      }
    } catch (err) {
      console.error("Failed to fetch CRM guests:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, searchTerm, statusFilter, minLeadQuality, dateRange, page]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Update Single Lead Status ──────────────────────────────────────────────
  const updateLeadStatus = async (leadId: string, newStatus: string) => {
    if (!hotelId) return;

    try {
      if (isSandbox) {
        setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: newStatus } : l)));
        updateData(prev => ({
          ...prev,
          leads: prev.leads.map(l => (l.id === leadId ? { ...l, status: newStatus } : l))
        }));
        showToast(`Lead status updated to ${newStatus}.`, "success");
        return;
      }

      setLeads(prev => prev.map(l => (l.id === leadId ? { ...l, status: newStatus } : l)));

      const { error } = await supabase
        .from("leads")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", leadId)
        .eq("hotel_id", hotelId);

      if (error) throw error;
      showToast(`Lead status updated to ${newStatus}.`, "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update lead status.", "error");
      fetchLeads();
    }
  };

  // ── Bulk Mark as Contacted ──────────────────────────────────────────────────
  const handleBulkMarkContacted = async () => {
    if (selectedLeadIds.size === 0 || !hotelId) return;
    const ids = Array.from(selectedLeadIds);

    if (isSandbox) {
      setLeads(prev => prev.map(l => (selectedLeadIds.has(l.id) ? { ...l, status: "contacted" } : l)));
      updateData(prev => ({
        ...prev,
        leads: prev.leads.map(l => (selectedLeadIds.has(l.id) ? { ...l, status: "contacted" } : l))
      }));
      showToast(`Marked ${ids.length} leads as contacted.`, "success");
      setSelectedLeadIds(new Set());
      return;
    }

    try {
      const { error } = await supabase
        .from("leads")
        .update({ status: "contacted", updated_at: new Date().toISOString() })
        .in("id", ids)
        .eq("hotel_id", hotelId);

      if (error) throw error;

      // Log to audit log
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: user?.id || null,
        action: "bulk_status_update",
        resource: "leads",
        detail: { count: ids.length, new_status: "contacted", lead_ids: ids },
        ip_address: null
      });

      showToast(`Marked ${ids.length} leads as contacted.`, "success");
      setSelectedLeadIds(new Set());
      fetchLeads();
    } catch (err) {
      console.error("Bulk update failed:", err);
      showToast("Bulk update failed.", "error");
    }
  };

  // ── Select All / Toggle ─────────────────────────────────────────────────────
  const handleToggleSelectAll = () => {
    if (selectedLeadIds.size === leads.length && leads.length > 0) {
      setSelectedLeadIds(new Set());
    } else {
      setSelectedLeadIds(new Set(leads.map(l => l.id)));
    }
  };

  const handleToggleSelectOne = (id: string) => {
    setSelectedLeadIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // ── Export CSV & Log to Audit Log ──────────────────────────────────────────
  const exportCSV = async () => {
    if (leads.length === 0) return;

    const headers = ["Name", "Email", "Phone", "Date Captured", "Lead Quality", "Status", "Channel", "Check In", "Check Out", "Guests"];
    const rows = leads.map(l => [
      l.name || "",
      l.email || "",
      l.phone || "",
      new Date(l.created_at).toLocaleDateString(),
      (l.lead_quality || 1).toString(),
      l.status || "new",
      l.channel || "direct",
      l.check_in || "",
      l.check_out || "",
      (l.guests || "").toString()
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map(e => e.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Leads CSV exported successfully.", "success");

    // Record export in audit_log
    if (!isSandbox && hotelId) {
      try {
        await supabase.from("audit_log").insert({
          hotel_id: hotelId,
          actor_id: user?.id || null,
          action: "export_leads_csv",
          resource: "leads",
          detail: { exported_count: leads.length, filter: statusFilter, date_range: dateRange.label },
          ip_address: null
        });
      } catch (err) {
        console.warn("Audit log error on export:", err);
      }
    }
  };

  // ── Export Single Guest GDPR DSR JSON ───────────────────────────────────────
  const exportSingleGuestGDPR = (lead: Lead) => {
    const guestData = {
      gdpr_type: "Data Subject Access Request (DSR) Export",
      exported_at: new Date().toISOString(),
      lead_profile: lead,
      rights_notice: "Generated by Ever Concierge in compliance with GDPR Art. 15 (Right of Access) & Art. 20 (Data Portability)."
    };

    const blob = new Blob([JSON.stringify(guestData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gdpr-guest-export-${lead.id.slice(0, 8)}.json`;
    a.click();
    showToast("GDPR Guest profile exported.", "success");
  };

  // ── GDPR Hard Erasure Execution ─────────────────────────────────────────────
  const handleExecuteErasure = async () => {
    if (!erasureLead || !hotelId) return;
    if (confirmPropertyName.trim().toLowerCase() !== propertyName.trim().toLowerCase()) {
      showToast(`Type exact property name "${propertyName}" to confirm erasure.`, "error");
      return;
    }

    setIsErasing(true);

    if (isSandbox) {
      setLeads(prev => prev.filter(l => l.id !== erasureLead.id));
      updateData(prev => ({
        ...prev,
        leads: prev.leads.filter(l => l.id !== erasureLead.id)
      }));
      setIsErasing(false);
      setErasureLead(null);
      setConfirmPropertyName("");
      showToast(`Guest record for ${erasureLead.name || "guest"} permanently deleted.`, "success");
      return;
    }

    try {
      // 1. Delete from leads
      await supabase.from("leads").delete().eq("id", erasureLead.id).eq("hotel_id", hotelId);

      // 2. Delete marketing optins
      await supabase.from("marketing_optins").delete().eq("guest_id", erasureLead.id).eq("hotel_id", hotelId);

      // 3. Delete conversations if matching session_id
      if (erasureLead.session_id) {
        await supabase.from("conversations").delete().eq("session_id", erasureLead.session_id);
        await supabase.from("handoff_sessions").delete().eq("session_id", erasureLead.session_id);
      }

      // 4. Log to audit_log
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: user?.id || null,
        action: "gdpr_erasure_hard_delete",
        resource: "leads",
        detail: {
          guest_id: erasureLead.id,
          guest_name: erasureLead.name,
          guest_email: erasureLead.email,
          reason: "User requested GDPR Article 17 Right to Erasure"
        },
        ip_address: null
      });

      showToast(`Guest record for ${erasureLead.name || "guest"} permanently deleted.`, "success");
      setErasureLead(null);
      setSelectedLead(null);
      setConfirmPropertyName("");
      fetchLeads();
    } catch (err) {
      console.error("GDPR Erasure error:", err);
      showToast("Failed to complete GDPR erasure.", "error");
    } finally {
      setIsErasing(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col space-y-4 animate-in fade-in duration-200">
      {/* ── Page Header & Top Controls ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Leads &amp; CRM</h2>
          <p className="text-body text-dash-text-sec mt-0.5">
            Capture, filter, and convert high-intent hotel guest inquiries with automated lead scoring.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <button
            onClick={exportCSV}
            disabled={leads.length === 0}
            className="dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border hover:border-dash-border-hover text-dash-text rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-50"
            title="Export leads to CSV and log audit"
          >
            <Download className="w-3.5 h-3.5 text-[#EA6639]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Bulk Actions Floating / Top Bar ── */}
      {selectedLeadIds.size > 0 && (
        <div className="p-3 bg-[#EA6639]/10 border border-[#EA6639]/30 rounded-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#EA6639]">
            <CheckSquare className="w-4 h-4" />
            <span>{selectedLeadIds.size} {selectedLeadIds.size === 1 ? "lead" : "leads"} selected</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkMarkContacted}
              className="px-3 py-1.5 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark as Contacted
            </button>
            <button
              onClick={() => setSelectedLeadIds(new Set())}
              className="px-2.5 py-1.5 bg-dash-surface border border-dash-border text-dash-text-sec hover:text-dash-text rounded-lg text-xs font-medium transition-colors"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* ── Filter Bar: Search, Status Pills & Quality Range Slider ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border p-3.5 space-y-3 shadow-sm">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-dash-text-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              placeholder="Search by guest name, email, or phone..."
              className="w-full pl-8 pr-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text"
            />
          </div>

          {/* Lead Quality Stepper / Filter */}
          <div className="flex items-center gap-2 bg-dash-canvas border border-dash-border px-3 py-1.5 rounded-lg text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-dash-text-muted" />
            <span className="text-[11px] text-dash-text-sec whitespace-nowrap">Min Quality:</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((stars) => (
                <button
                  key={stars}
                  type="button"
                  onClick={() => { setMinLeadQuality(stars); setPage(0); }}
                  className={`p-1 rounded transition-colors ${
                    minLeadQuality >= stars
                      ? "text-amber-500"
                      : "text-zinc-300 dark:text-zinc-700 hover:text-amber-400"
                  }`}
                  title={`Show leads with ${stars}+ stars`}
                >
                  <Star className={`w-3.5 h-3.5 ${minLeadQuality >= stars ? "fill-amber-500" : ""}`} />
                </button>
              ))}
              {minLeadQuality > 1 && (
                <button
                  onClick={() => setMinLeadQuality(1)}
                  className="text-[10px] text-dash-text-muted hover:text-dash-text ml-1 underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Status Filter Buttons */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar pt-1 border-t border-dash-border-hairline">
          {[
            { id: "All", label: "All Leads" },
            { id: "Action Needed", label: "⚠️ Action Needed" },
            { id: "contacted", label: "Contacted" },
            { id: "booked", label: "Booked" },
            { id: "lost", label: "Lost" }
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => { setStatusFilter(filter.id); setPage(0); }}
              className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === filter.id
                  ? "bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/30 font-bold"
                  : "bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover text-dash-text-sec"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted space-y-3 p-8">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
              <span className="text-xs font-medium">Loading CRM leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 bg-dash-surface-raised border border-dash-border rounded-2xl flex items-center justify-center shadow-sm mb-3">
                <Users className="w-7 h-7 text-dash-text-muted" />
              </div>
              <h3 className="text-section font-bold text-dash-text mb-1">No Leads Found</h3>
              <p className="text-xs text-dash-text-sec max-w-sm mb-4">
                {isSandbox
                  ? "No demo guests match your search or filters."
                  : "Inquiries captured by your AI agent will automatically be analyzed, scored, and logged here."}
              </p>
              {isSandbox && (
                <button
                  onClick={regenerate}
                  className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-xs font-semibold shadow hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Regenerate Demo Data
                </button>
              )}
              {(searchTerm || statusFilter !== "All" || minLeadQuality > 1) && (
                <button
                  onClick={() => { setSearchTerm(""); setStatusFilter("All"); setMinLeadQuality(1); }}
                  className="mt-3 text-xs text-[#EA6639] hover:underline font-medium"
                >
                  Clear all active filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-[10px] text-dash-text-sec bg-dash-canvas/80 uppercase border-b border-dash-border sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-3 py-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="text-dash-text-muted hover:text-dash-text transition-colors"
                    >
                      {selectedLeadIds.size === leads.length && leads.length > 0 ? (
                        <CheckSquare className="w-4 h-4 text-[#EA6639]" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                  </th>
                  <th className="px-4 py-3 font-semibold">Guest Contact</th>
                  <th className="px-4 py-3 font-semibold">Lead Score</th>
                  <th className="px-4 py-3 font-semibold">Target Dates</th>
                  <th className="px-4 py-3 font-semibold">Date Captured</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className={`hover:bg-dash-surface-hover/60 transition-colors group ${
                      selectedLeadIds.has(lead.id) ? "bg-[#EA6639]/5" : ""
                    }`}
                  >
                    <td className="px-3 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleSelectOne(lead.id)}
                        className="text-dash-text-muted hover:text-dash-text transition-colors"
                      >
                        {selectedLeadIds.has(lead.id) ? (
                          <CheckSquare className="w-4 h-4 text-[#EA6639]" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="font-bold text-xs text-dash-text block">
                          {lead.name || "Guest " + lead.id.slice(0, 6)}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] text-dash-text-sec mt-0.5">
                          {lead.email && <span className="truncate max-w-[140px]">{lead.email}</span>}
                          {lead.phone && <span>· {lead.phone}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${
                              i < (lead.lead_quality || 1) ? "fill-amber-500 text-amber-500" : "text-zinc-200 dark:text-zinc-700"
                            }`}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-dash-text-sec">
                      {lead.check_in ? (
                        <div className="flex items-center gap-1.5 font-medium">
                          <Calendar className="w-3 h-3 text-dash-text-muted shrink-0" />
                          <span>{new Date(lead.check_in).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                          {lead.check_out && <span>– {new Date(lead.check_out).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>}
                        </div>
                      ) : (
                        <span className="text-dash-text-muted italic">Flexible</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-dash-text-muted font-mono text-[11px]">
                      {new Date(lead.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status === "captured" || lead.status === "new" ? "captured" : (lead.status || "captured")}
                        onChange={(e) => updateLeadStatus(lead.id, e.target.value)}
                        className={`text-xs px-2.5 py-1 rounded-lg border font-semibold appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-[#EA6639] transition-colors ${
                          lead.status === "captured" || lead.status === "new"
                            ? "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border-amber-300 dark:border-amber-500/30"
                            : lead.status === "contacted"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-400 border-blue-300 dark:border-blue-500/30"
                            : lead.status === "booked"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30"
                            : "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700"
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.3rem center`,
                          backgroundRepeat: `no-repeat`,
                          backgroundSize: `1.1em 1.1em`
                        }}
                      >
                        <option value="captured">Action Needed</option>
                        <option value="contacted">Contacted</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {lead.session_id && (
                          <button
                            onClick={() => onNavigate?.("inbox", { sessionId: lead.session_id })}
                            className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-[#EA6639]/10 rounded-md transition-colors"
                            title="View live conversation thread"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-hover rounded-md transition-colors"
                          title="View complete guest profile & GDPR actions"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination Footer ── */}
        <div className="p-3 border-t border-dash-border bg-dash-canvas/50 text-xs text-dash-text-muted flex justify-between items-center">
          <span>
            {totalCount > 0 ? (
              <>Showing <span className="font-bold text-dash-text">{page * pageSize + 1}</span> to <span className="font-bold text-dash-text">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-bold text-dash-text">{totalCount}</span> total leads</>
            ) : (
              "0 leads recorded"
            )}
          </span>
          <div className="flex gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-3 py-1 border border-dash-border rounded-md bg-dash-surface hover:bg-dash-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-dash-text"
            >
              Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-3 py-1 border border-dash-border rounded-md bg-dash-surface hover:bg-dash-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-dash-text"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* ── Enhanced Guest Detail Modal ── */}
      <Modal
        isOpen={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        title="Guest CRM Profile"
      >
        {selectedLead && (
          <div className="space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-dash-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#EA6639]/10 text-[#EA6639] font-bold text-sm flex items-center justify-center uppercase">
                  {(selectedLead.name || "?").charAt(0)}
                </div>
                <div>
                  <h4 className="text-base font-bold text-dash-text">{selectedLead.name || "Guest " + selectedLead.id.slice(0, 6)}</h4>
                  <p className="text-xs text-dash-text-sec">
                    Captured via {selectedLead.channel || "Web Widget"} · {new Date(selectedLead.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < (selectedLead.lead_quality || 1) ? "fill-amber-500" : "text-zinc-200 dark:text-zinc-700"}`}
                  />
                ))}
              </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl border border-dash-border bg-dash-canvas space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#EA6639]" /> Email Address
                </span>
                <p className="font-medium text-dash-text truncate">
                  {selectedLead.email || "Not provided"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-dash-border bg-dash-canvas space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#EA6639]" /> Phone Number
                </span>
                <p className="font-medium text-dash-text">
                  {selectedLead.phone || "Not provided"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-dash-border bg-dash-canvas space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#EA6639]" /> Target Stay Dates
                </span>
                <p className="font-medium text-dash-text">
                  {selectedLead.check_in
                    ? `${new Date(selectedLead.check_in).toLocaleDateString()} – ${selectedLead.check_out ? new Date(selectedLead.check_out).toLocaleDateString() : "?"}`
                    : "Flexible / General Inquiry"}
                </p>
              </div>

              <div className="p-3 rounded-xl border border-dash-border bg-dash-canvas space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#EA6639]" /> Party Size
                </span>
                <p className="font-medium text-dash-text">
                  {selectedLead.guests ? `${selectedLead.guests} Guests` : "1–2 Guests"}
                </p>
              </div>
            </div>

            {selectedLead.purpose && (
              <div className="p-3 rounded-xl border border-dash-border bg-dash-canvas space-y-1 text-xs">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-[#EA6639]" /> Purpose of Stay &amp; Guest Preferences
                </span>
                <p className="text-dash-text font-medium">{selectedLead.purpose}</p>
              </div>
            )}

            {/* Deep-link actions */}
            <div className="space-y-2 pt-2 border-t border-dash-border">
              <h5 className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider">Quick Actions</h5>
              <div className="flex gap-2">
                {selectedLead.session_id && (
                  <button
                    onClick={() => {
                      const sid = selectedLead.session_id;
                      setSelectedLead(null);
                      onNavigate?.("inbox", { sessionId: sid });
                    }}
                    className="flex-1 py-2 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-[#EA6639]" /> View Live Chat Thread
                  </button>
                )}
                {selectedLead.email && (
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 py-2 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Mail className="w-3.5 h-3.5" /> Direct Email
                  </a>
                )}
              </div>
            </div>

            {/* GDPR & Privacy Controls */}
            <div className="p-3 bg-dash-canvas rounded-xl border border-dash-border space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-dash-text-muted">GDPR Compliance</span>
                <button
                  onClick={() => exportSingleGuestGDPR(selectedLead)}
                  className="text-xs text-[#EA6639] hover:underline font-medium flex items-center gap-1"
                >
                  <Download className="w-3 h-3" /> Export DSR JSON
                </button>
              </div>

              {isManager && (
                <button
                  onClick={() => {
                    setErasureLead(selectedLead);
                  }}
                  className="w-full py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Request Hard Erasure (Right to be Forgotten)
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ── GDPR Erasure Hard-Delete Modal (Manager Only with Typed Confirmation) ── */}
      <Modal
        isOpen={!!erasureLead}
        onClose={() => { setErasureLead(null); setConfirmPropertyName(""); }}
        title="GDPR Article 17 Erasure Confirmation"
      >
        {erasureLead && (
          <div className="space-y-4">
            <div className="p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 rounded-xl text-xs text-red-800 dark:text-red-300 flex items-start gap-2.5">
              <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Irreversible Data Erasure Scope:</strong>
                <p className="mt-0.5">
                  This action permanently purges all records for <strong>{erasureLead.name || erasureLead.email || erasureLead.id}</strong> across leads, conversations, handoff sessions, and marketing opt-ins.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs text-dash-text-sec mb-1.5">
                To confirm permanent deletion, type your property name <strong className="text-dash-text">{propertyName}</strong> below:
              </label>
              <input
                type="text"
                value={confirmPropertyName}
                onChange={(e) => setConfirmPropertyName(e.target.value)}
                placeholder={propertyName}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-dash-border">
              <button
                type="button"
                onClick={() => { setErasureLead(null); setConfirmPropertyName(""); }}
                className="px-4 py-2 text-xs font-medium text-dash-text-sec hover:bg-dash-surface-hover rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteErasure}
                disabled={confirmPropertyName.trim().toLowerCase() !== propertyName.trim().toLowerCase() || isErasing}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow"
              >
                {isErasing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm Hard Erasure
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
