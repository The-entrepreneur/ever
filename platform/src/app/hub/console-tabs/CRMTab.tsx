import React, { useEffect, useState, useCallback } from "react";
import { Search, Download, Filter, Eye, CheckCircle, RefreshCw, AlertCircle, Phone, Mail, FileText, Calendar, Users, Target } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { Modal } from "../../../shared/Modal";
import { useToast } from "../../../shared/ToastContext";

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  status: string | null;
  lead_quality: number | null;
  check_in?: string | null;
  check_out?: string | null;
  guests?: number | null;
  purpose?: string | null;
  channel?: string | null;
}

export function CRMTab() {
  const { hotelId } = useAuth();
  const { showToast } = useToast();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All"); // All, Action Needed, Contacted, Booked, Lost
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Pagination
  const [page, setPage] = useState(0);
  const pageSize = 15;
  const [totalCount, setTotalCount] = useState(0);

  const fetchGuests = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);

    try {
      let query = supabase
        .from("leads")
        .select("*", { count: "exact" })
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (searchTerm) {
        query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
      }

      if (statusFilter !== "All") {
        if (statusFilter === "Action Needed") {
          query = query.eq("status", "captured");
        } else {
          query = query.eq("status", statusFilter.toLowerCase());
        }
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
  }, [hotelId, searchTerm, statusFilter, page]);

  useEffect(() => {
    fetchGuests();
  }, [fetchGuests]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    if (!hotelId) return;
    // For dropdown, "Action Needed" corresponds to "captured"
    const actualStatus = newStatus === "" ? "captured" : newStatus;
    
    try {
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: actualStatus } : l));
      
      const { error } = await supabase
        .from("leads")
        .update({ status: actualStatus })
        .eq("id", leadId)
        .eq("hotel_id", hotelId);
        
      if (error) throw error;
      showToast(`Status updated to ${actualStatus}`, 'success');
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast('Failed to update lead status', 'error');
      // Revert on failure by refetching
      fetchGuests();
    }
  };

  const exportCSV = () => {
    if (leads.length === 0) return;
    
    const headers = ["Name", "Email", "Phone", "Date Captured", "Quality", "Status"];
    const rows = leads.map(l => [
      l.name || "",
      l.email || "",
      l.phone || "",
      new Date(l.created_at).toLocaleDateString(),
      (l.lead_quality || 0).toString(),
      l.status || "captured"
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever-leads-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Leads & CRM</h2>
          <p className="text-dash-text-sec mt-1">Manage and view all captured guest leads for follow-up.</p>
        </div>
        <button 
          onClick={exportCSV} 
          disabled={leads.length === 0}
          className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Download className="w-4 h-4" /> Export Leads
        </button>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dash-border flex flex-wrap gap-4 items-center justify-between bg-dash-canvas/50">
          <div className="relative w-full md:max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-9 pr-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
            {["All", "Action Needed", "Contacted", "Booked", "Lost"].map(filter => (
              <button
                key={filter}
                onClick={() => { setStatusFilter(filter); setPage(0); }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                  statusFilter === filter 
                    ? "bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/30" 
                    : "bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text-sec"
                }`}
              >
                {filter === "Action Needed" && <AlertCircle className="w-3.5 h-3.5" />}
                {filter}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted space-y-3">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
              <span className="text-xs">Loading leads...</span>
            </div>
          ) : leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted space-y-3 p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-dash-canvas flex items-center justify-center mb-2">
                <FileText className="w-6 h-6 text-dash-text-sec opacity-50" />
              </div>
              <p className="text-body font-medium text-dash-text">No leads found</p>
              <p className="text-xs text-dash-text-sec max-w-sm">
                {searchTerm || statusFilter !== "All" 
                  ? "Try adjusting your search or filters to see results." 
                  : "Leads captured by Ever AI will automatically appear here."}
              </p>
              {(searchTerm || statusFilter !== "All") && (
                <button 
                  onClick={() => { setSearchTerm(""); setStatusFilter("All"); }}
                  className="mt-2 text-xs text-[#EA6639] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="text-[10px] text-dash-text-sec bg-dash-canvas/80 uppercase border-b border-dash-border sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3 font-semibold">Guest Name</th>
                  <th className="px-4 py-3 font-semibold">Contact Info</th>
                  <th className="px-4 py-3 font-semibold">Quality</th>
                  <th className="px-4 py-3 font-semibold">Date Captured</th>
                  <th className="px-4 py-3 font-semibold">Lead Status</th>
                  <th className="px-4 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-dash-surface-hover/60 transition-colors group">
                    <td className="px-4 py-3.5 font-medium text-dash-text">
                      {lead.name}
                    </td>
                    <td className="px-4 py-3.5 text-dash-text-sec">
                      <div className="flex flex-col gap-1">
                        {lead.email && (
                          <div className="flex items-center gap-1.5">
                            <Mail className="w-3 h-3 opacity-60 shrink-0" />
                            <span className="truncate max-w-[150px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3 h-3 opacity-60 shrink-0" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                        {!lead.email && !lead.phone && (
                          <span className="text-dash-text-muted italic">No contact provided</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-dash-text-sec">
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < (lead.lead_quality || 0)
                                ? "text-amber-400 fill-amber-400"
                                : "text-zinc-200 fill-zinc-200"
                            }`}
                            viewBox="0 0 20 20"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-dash-text-sec">
                      {new Date(lead.created_at).toLocaleDateString(undefined, { 
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <select 
                        value={lead.status === "captured" ? "" : (lead.status || "")}
                        onChange={(e) => updateStatus(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded border appearance-none cursor-pointer pr-6 focus:outline-none focus:ring-1 focus:ring-[#EA6639] ${
                          lead.status === 'captured' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                          lead.status === 'contacted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                          lead.status === 'booked' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                          lead.status === 'lost' ? 'bg-red-100 text-red-800 border-red-200' :
                          'bg-zinc-100 text-zinc-800 border-zinc-200'
                        }`}
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: `right 0.25rem center`,
                          backgroundRepeat: `no-repeat`,
                          backgroundSize: `1.25em 1.25em`
                        }}
                      >
                        <option value="">Action Needed</option>
                        <option value="contacted">Contacted</option>
                        <option value="booked">Booked</option>
                        <option value="lost">Lost</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {lead.status === 'captured' && (
                          <button 
                            onClick={() => updateStatus(lead.id, "contacted")}
                            className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-[#EA6639]/10 rounded transition-colors" 
                            title="Mark as Contacted"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        <button 
                          onClick={() => setSelectedLead(lead)}
                          className="p-1.5 text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-hover rounded transition-colors" 
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        <div className="p-3 border-t border-dash-border bg-dash-canvas/50 text-xs text-dash-text-muted flex justify-between items-center">
          <span>
            {totalCount > 0 ? (
              <>Showing <span className="font-medium text-dash-text">{page * pageSize + 1}</span> to <span className="font-medium text-dash-text">{Math.min((page + 1) * pageSize, totalCount)}</span> of <span className="font-medium text-dash-text">{totalCount}</span> leads</>
            ) : (
              "No leads"
            )}
          </span>
          <div className="flex gap-1">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="px-2.5 py-1.5 border border-dash-border rounded bg-dash-surface hover:bg-dash-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Prev
            </button>
            <button 
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages - 1 || loading}
              className="px-2.5 py-1.5 border border-dash-border rounded bg-dash-surface hover:bg-dash-surface-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Lead Profile Modal */}
      <Modal 
        isOpen={!!selectedLead} 
        onClose={() => setSelectedLead(null)}
        title="Guest Profile"
      >
        {selectedLead && (
          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-semibold text-dash-text">{selectedLead.name}</h4>
              <p className="text-sm text-dash-text-sec flex items-center gap-2 mt-1">
                Captured via {selectedLead.channel || 'Website'} 
                <span className="w-1 h-1 rounded-full bg-dash-border"></span>
                {new Date(selectedLead.created_at).toLocaleDateString(undefined, { 
                  month: 'long', day: 'numeric', year: 'numeric' 
                })}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg border border-dash-border bg-dash-surface-raised space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Mail className="w-3 h-3" /> Email
                </span>
                <p className="text-sm font-medium text-dash-text truncate" title={selectedLead.email || ''}>
                  {selectedLead.email || 'Not provided'}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-dash-border bg-dash-surface-raised space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Phone className="w-3 h-3" /> Phone
                </span>
                <p className="text-sm font-medium text-dash-text">
                  {selectedLead.phone || 'Not provided'}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-dash-border bg-dash-surface-raised space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Target Dates
                </span>
                <p className="text-sm font-medium text-dash-text">
                  {selectedLead.check_in ? `${new Date(selectedLead.check_in).toLocaleDateString()} - ${selectedLead.check_out ? new Date(selectedLead.check_out).toLocaleDateString() : '?'}` : 'Flexible'}
                </p>
              </div>
              <div className="p-3 rounded-lg border border-dash-border bg-dash-surface-raised space-y-1">
                <span className="text-[10px] uppercase font-bold text-dash-text-muted flex items-center gap-1.5">
                  <Users className="w-3 h-3" /> Party Size
                </span>
                <p className="text-sm font-medium text-dash-text">
                  {selectedLead.guests ? `${selectedLead.guests} Guests` : 'Unknown'}
                </p>
              </div>
            </div>

            {selectedLead.purpose && (
              <div>
                <h5 className="text-xs font-semibold text-dash-text-muted uppercase mb-2 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" /> Purpose of Visit
                </h5>
                <p className="text-sm text-dash-text bg-dash-surface-raised p-3 rounded-lg border border-dash-border">
                  {selectedLead.purpose}
                </p>
              </div>
            )}
            
            <div className="pt-4 border-t border-dash-border flex justify-end">
              <button
                onClick={() => {
                  window.location.href = `mailto:${selectedLead.email}`;
                }}
                disabled={!selectedLead.email}
                className="px-4 py-2 bg-[#EA6639] text-white rounded-md text-sm font-medium hover:bg-[#EA6639]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Mail className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
