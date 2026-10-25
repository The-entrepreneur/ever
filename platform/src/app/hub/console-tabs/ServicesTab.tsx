import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { 
  BellRing, Search, Filter, Clock, CheckCircle2, AlertTriangle, 
  RefreshCw, ChevronRight, X, User, Wrench, Sparkles, Shirt, 
  Eye, Check, ShieldAlert, Phone, Send, ArrowUpRight, CheckSquare
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox, SandboxServiceRequest, StaffRemark } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { StandardTable, StandardTableColumn, TableDensity } from "../../../shared/StandardTable";

export interface ServiceRequestRecord {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  guest_name?: string;
  service_type: string; // 'housekeeping' | 'maintenance' | 'laundry' | 'wakeup' | 'restaurant' | 'other'
  details?: {
    notes?: string;
    description?: string;
    item?: string;
    quantity?: number;
    urgency?: "normal" | "urgent";
    service_tier?: string;
    scheduled_time?: string;
  };
  scheduled_for?: string | null;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  channel?: string;
  assigned_staff?: string;
  staff_remarks?: StaffRemark[];
  created_at: string;
}

const SERVICE_LABELS: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  housekeeping: { label: "Housekeeping", icon: Sparkles, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
  maintenance:  { label: "Engineering", icon: Wrench, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
  laundry:      { label: "Laundry & Valet", icon: Shirt, color: "text-purple-500 bg-purple-500/10 border-purple-500/20" },
  wakeup:       { label: "Wake-Up Call", icon: Clock, color: "text-rose-500 bg-rose-500/10 border-rose-500/20" },
  restaurant:   { label: "Restaurant Table", icon: BellRing, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
  other:        { label: "General Request", icon: BellRing, color: "text-zinc-500 bg-zinc-500/10 border-zinc-500/20" },
};

export function getServiceDepartment(serviceType?: string, details?: any): string {
  const text = `${serviceType || ""} ${details?.description || ""} ${details?.notes || ""} ${details?.item || ""}`.toLowerCase();
  if (text.includes("housekeep") || text.includes("towel") || text.includes("linen") || text.includes("pillow") || text.includes("clean") || text.includes("amenit") || text.includes("bed") || text.includes("turndown") || text.includes("trash")) {
    return "housekeeping";
  }
  if (text.includes("maint") || text.includes("repair") || text.includes("ac") || text.includes("temperature") || text.includes("thermostat") || text.includes("leak") || text.includes("plumb") || text.includes("tv") || text.includes("engineer") || text.includes("light") || text.includes("bulb") || text.includes("safe") || text.includes("keycard") || text.includes("lock")) {
    return "maintenance";
  }
  if (text.includes("laund") || text.includes("valet") || text.includes("iron") || text.includes("dry clean") || text.includes("press") || text.includes("suit") || text.includes("luggage") || text.includes("bellhop") || text.includes("baggage")) {
    return "laundry";
  }
  if (text.includes("rest") || text.includes("din") || text.includes("table") || text.includes("food") || text.includes("reserv") || text.includes("breakfast") || text.includes("chef") || text.includes("bistro")) {
    return "restaurant";
  }
  if (text.includes("wake") || text.includes("alarm") || text.includes("call") || text.includes("morning")) {
    return "wakeup";
  }
  return (serviceType || "other").toLowerCase();
}

function formatTimeAgo(isoString: string): string {
  try {
    const diff = Math.max(0, Date.now() - new Date(isoString).getTime());
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  } catch {
    return isoString;
  }
}

interface ServicesTabProps {
  role?: string;
  propertyName?: string;
  onNavigate?: (tab: string, context?: any) => void;
}

export const ServicesTab: React.FC<ServicesTabProps> = ({ role = "hotel_manager", propertyName, onNavigate }) => {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData } = useSandbox();
  const { showToast } = useToast();

  const [requests, setRequests] = useState<ServiceRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [urgencyFilter, setUrgencyFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestRecord | null>(null);
  const [newRemarkText, setNewRemarkText] = useState("");
  const [tableDensity, setTableDensity] = useState<TableDensity>("default");
  const [sortKey, setSortKey] = useState<string>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const deferredSearch = useDeferredValue(searchQuery);

  // Fetch service requests
  const fetchServices = useCallback(async () => {
    setLoading(true);

    if (isSandbox && sandboxData) {
      const srvs: ServiceRequestRecord[] = (sandboxData.serviceRequests || []).map((s: SandboxServiceRequest) => ({
        id: s.id,
        hotel_id: s.hotel_id,
        session_id: s.session_id,
        room_number: s.room_number,
        guest_name: s.guest_name || `Room ${s.room_number} Guest`,
        service_type: s.service_type || "housekeeping",
        details: s.details || {},
        scheduled_for: s.scheduled_for,
        status: (s.status === "preparing" ? "in_progress" : s.status) as any,
        channel: s.channel || "whatsapp",
        assigned_staff: s.assigned_staff || "Unassigned",
        staff_remarks: s.staff_remarks || [],
        created_at: s.created_at,
      }));
      setRequests(srvs);
      setLoading(false);
      return;
    }

    if (!hotelId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("service_requests")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: ServiceRequestRecord[] = (data || []).map((s: any) => ({
        id: s.id,
        hotel_id: s.hotel_id,
        session_id: s.session_id || "direct",
        room_number: s.room_number,
        guest_name: s.guest_name || `Room ${s.room_number} Guest`,
        service_type: s.service_type || "other",
        details: typeof s.details === "object" ? s.details : { description: String(s.details || "") },
        scheduled_for: s.scheduled_for,
        status: s.status || "pending",
        channel: s.channel || "whatsapp",
        assigned_staff: s.assigned_staff || "Unassigned",
        staff_remarks: Array.isArray(s.staff_remarks) ? s.staff_remarks : [],
        created_at: s.created_at,
      }));

      setRequests(formatted);
    } catch (err: any) {
      console.error("[ServicesTab] Failed to fetch service requests:", err);
      showToast("Failed to fetch service requests", "error");
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, showToast]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Update request status
  const handleUpdateStatus = async (requestId: string, nextStatus: ServiceRequestRecord["status"]) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: nextStatus } : r));
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, status: nextStatus } : null);
    }

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        serviceRequests: prev.serviceRequests.map(r => r.id === requestId ? { ...r, status: nextStatus } : r)
      }));
      showToast(`Request marked as ${nextStatus.replace("_", " ")}`, "success");
      return;
    }

    try {
      const { error } = await supabase
        .from("service_requests")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", requestId);

      if (error) throw error;
      showToast(`Request status updated to ${nextStatus.replace("_", " ")}`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update status", "error");
      fetchServices();
    }
  };

  // Assign staff member
  const handleAssignStaff = async (requestId: string, staffName: string) => {
    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, assigned_staff: staffName } : r));
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, assigned_staff: staffName } : null);
    }

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        serviceRequests: prev.serviceRequests.map(r => r.id === requestId ? { ...r, assigned_staff: staffName } : r)
      }));
      showToast(`Assigned to ${staffName}`, "info");
      return;
    }

    try {
      await supabase.from("service_requests").update({ assigned_staff: staffName }).eq("id", requestId);
      showToast(`Assigned to ${staffName}`, "info");
    } catch (err: any) {
      console.error("[ServicesTab] Assign error:", err);
    }
  };

  // Add staff remark
  const handleAddRemark = async (requestId: string) => {
    if (!newRemarkText.trim()) return;

    const newRemark: StaffRemark = {
      id: "rem_" + Math.random().toString(36).substring(2, 9),
      author: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Staff",
      role: (role || "staff").replace("_", " "),
      content: newRemarkText.trim(),
      created_at: new Date().toISOString()
    };

    const targetReq = requests.find(r => r.id === requestId);
    if (!targetReq) return;

    const updatedRemarks = [...(targetReq.staff_remarks || []), newRemark];

    setRequests(prev => prev.map(r => r.id === requestId ? { ...r, staff_remarks: updatedRemarks } : r));
    if (selectedRequest && selectedRequest.id === requestId) {
      setSelectedRequest(prev => prev ? { ...prev, staff_remarks: updatedRemarks } : null);
    }
    setNewRemarkText("");

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        serviceRequests: prev.serviceRequests.map(r => r.id === requestId ? { ...r, staff_remarks: updatedRemarks } : r)
      }));
      showToast("Remark recorded on service ticket", "info");
      return;
    }

    try {
      await supabase.from("service_requests").update({ staff_remarks: updatedRemarks }).eq("id", requestId);
      showToast("Remark saved", "info");
    } catch (err: any) {
      console.error("[ServicesTab] Save remark error:", err);
    }
  };

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    const list = requests.filter(r => {
      if (departmentFilter !== "all") {
        const dept = getServiceDepartment(r.service_type, r.details);
        if (dept !== departmentFilter) return false;
      }
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (urgencyFilter === "urgent" && r.details?.urgency !== "urgent") return false;
      if (urgencyFilter === "normal" && r.details?.urgency === "urgent") return false;

      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        const matchesRoom = (r.room_number || "").toLowerCase().includes(q);
        const matchesGuest = (r.guest_name || "").toLowerCase().includes(q);
        const matchesType = (r.service_type || "").toLowerCase().includes(q);
        const matchesDesc = JSON.stringify(r.details || {}).toLowerCase().includes(q);
        if (!matchesRoom && !matchesGuest && !matchesType && !matchesDesc) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = (a as any)[sortKey];
      let valB: any = (b as any)[sortKey];

      if (sortKey === "room_number") {
        valA = parseInt(a.room_number, 10) || a.room_number;
        valB = parseInt(b.room_number, 10) || b.room_number;
      } else if (sortKey === "service_type") {
        valA = getServiceDepartment(a.service_type, a.details);
        valB = getServiceDepartment(b.service_type, b.details);
      } else if (sortKey === "created_at") {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else {
        valA = String(valA || "").toLowerCase();
        valB = String(valB || "").toLowerCase();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return list;
  }, [requests, departmentFilter, statusFilter, urgencyFilter, deferredSearch, sortKey, sortDirection]);

  // Operational metrics
  const metrics = useMemo(() => {
    const unassignedCount = requests.filter(r => 
      (r.status === "pending" || !r.assigned_staff || r.assigned_staff === "Unassigned") &&
      r.status !== "completed" && r.status !== "cancelled"
    ).length;
    const inProgressCount = requests.filter(r => r.status === "in_progress").length;
    const urgentCount = requests.filter(r => 
      r.details?.urgency === "urgent" && r.status !== "completed" && r.status !== "cancelled"
    ).length;
    const completedToday = requests.filter(r => r.status === "completed").length;

    return { unassignedCount, inProgressCount, urgentCount, completedToday };
  }, [requests]);

  // Table Columns
  const tableColumns: StandardTableColumn<ServiceRequestRecord>[] = [
    {
      key: "room_number",
      header: "Room / Location",
      sortable: true,
      render: (r) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-dash-surface-raised border border-dash-border text-dash-text font-bold text-xs flex items-center justify-center shrink-0">
            {r.room_number}
          </div>
          <div>
            <div className="font-semibold text-dash-text text-xs">{r.guest_name || `Room ${r.room_number}`}</div>
            <div className="text-[10px] text-dash-text-muted capitalize">{r.channel || "direct"}</div>
          </div>
        </div>
      )
    },
    {
      key: "service_type",
      header: "Department & Service",
      sortable: true,
      render: (r) => {
        const dept = getServiceDepartment(r.service_type, r.details);
        const conf = SERVICE_LABELS[dept] || SERVICE_LABELS.other;
        const Icon = conf.icon;
        return (
          <div className="flex items-center gap-1.5">
            <span className={`p-1 rounded-md border text-xs flex items-center gap-1 font-semibold ${conf.color}`}>
              <Icon className="w-3.5 h-3.5" />
              <span>{conf.label}</span>
            </span>
            {r.details?.urgency === "urgent" && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse">
                URGENT
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: "details",
      header: "Request Details",
      sortable: true,
      render: (r) => {
        const text = r.details?.description || r.details?.notes || r.details?.item || JSON.stringify(r.details) || "Request logged";
        return (
          <div className="max-w-[300px] truncate text-dash-text text-xs font-medium" title={text}>
            {text}
          </div>
        );
      }
    },
    {
      key: "assigned_staff",
      header: "Assigned Staff",
      sortable: true,
      render: (r) => (
        <span className="text-xs text-dash-text-sec flex items-center gap-1">
          <User className="w-3.5 h-3.5 opacity-60" />
          <span>{r.assigned_staff || "Unassigned"}</span>
        </span>
      )
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (r) => {
        const s = r.status;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            s === "pending"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : s === "in_progress"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
              : s === "completed"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              s === "pending" ? "bg-amber-500" : s === "in_progress" ? "bg-blue-500 animate-pulse" : s === "completed" ? "bg-emerald-500" : "bg-zinc-400"
            }`} />
            <span className="capitalize">{s.replace("_", " ")}</span>
          </span>
        );
      }
    },
    {
      key: "created_at",
      header: "Time Logged",
      sortable: true,
      render: (r) => (
        <span className="text-dash-text-muted text-xs flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 opacity-60" />
          {formatTimeAgo(r.created_at)}
        </span>
      )
    },
    {
      key: "id",
      header: "Actions",
      align: "right",
      render: (r) => (
        <button
          onClick={() => setSelectedRequest(r)}
          className="p-1.5 text-dash-text-muted hover:text-dash-text rounded-md hover:bg-dash-surface-hover transition-colors"
          title="Inspect service ticket"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-dash-surface">
      {/* Top Banner & Operational Controls */}
      <div className="p-4 md:p-6 border-b border-dash-border shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-dash-text flex items-center gap-2">
              <BellRing className="w-5 h-5 text-[#EA6639]" />
              <span>Guest Services &amp; Operations</span>
            </h1>
            <p className="text-xs text-dash-text-sec mt-0.5">
              Fulfillment desk for Housekeeping, Maintenance tickets, Laundry valet, and Guest requests
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchServices}
              className="p-2 bg-dash-surface border border-dash-border rounded-lg text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5"
              title="Refresh requests"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Unassigned Queue</div>
            <div className="text-xl font-bold text-amber-500 mt-0.5">{metrics.unassignedCount}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Awaiting staff action</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">In Progress</div>
            <div className="text-xl font-bold text-blue-500 mt-0.5">{metrics.inProgressCount}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Assigned &amp; working</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Urgent Escalations</div>
            <div className={`text-xl font-bold mt-0.5 ${metrics.urgentCount > 0 ? "text-rose-500 animate-pulse" : "text-dash-text"}`}>
              {metrics.urgentCount}
            </div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">High SLA priority</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Resolved Today</div>
            <div className="text-xl font-bold text-emerald-500 mt-0.5">{metrics.completedToday}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Completed requests</div>
          </div>
        </div>

        {/* Department Filter Tabs & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Department Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar">
            {[
              { id: "all", label: "All Services" },
              { id: "housekeeping", label: "Housekeeping" },
              { id: "maintenance", label: "Maintenance" },
              { id: "laundry", label: "Laundry & Valet" },
              { id: "restaurant", label: "Restaurant Tables" },
              { id: "wakeup", label: "Wake-Up Calls" },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDepartmentFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  departmentFilter === tab.id
                    ? "bg-[#EA6639] text-white shadow-xs"
                    : "bg-dash-canvas text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text border border-dash-border"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search & Urgency filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-dash-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>

            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
            >
              <option value="all">All Urgencies</option>
              <option value="urgent">🚨 Urgent Only</option>
              <option value="normal">Normal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table Content */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-dash-text-muted">
            <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
            <span className="text-xs">Loading operational queue...</span>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <BellRing className="w-12 h-12 text-dash-text-muted/30 mb-2" />
            <h3 className="font-semibold text-dash-text text-sm">No Service Requests Found</h3>
            <p className="text-xs text-dash-text-sec max-w-sm mt-1">
              Guest requests for room cleaning, maintenance, laundry, or amenities will appear here dynamically.
            </p>
          </div>
        ) : (
          <StandardTable<ServiceRequestRecord>
            columns={tableColumns}
            data={filteredRequests}
            keyField="id"
            density={tableDensity}
            onDensityChange={setTableDensity}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(r) => setSelectedRequest(r)}
          />
        )}
      </div>

      {/* Service Request Inspection & Assignment Drawer */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#EA6639] text-white font-bold text-xs">
                    Room {selectedRequest.room_number}
                  </span>
                  <span className="text-xs text-dash-text-muted font-mono">{selectedRequest.id.slice(0, 8)}</span>
                </div>
                <h3 className="font-bold text-sm text-dash-text mt-1">{selectedRequest.guest_name || "Guest Request"}</h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-md text-dash-text-muted hover:text-dash-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Request Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status and Action Buttons */}
              <div className="p-4 rounded-xl bg-dash-canvas border border-dash-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dash-text-muted">Workflow Status:</span>
                  <span className="capitalize font-bold text-xs text-dash-text">{selectedRequest.status.replace("_", " ")}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {selectedRequest.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, "in_progress")}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckSquare className="w-3.5 h-3.5" />
                      <span>Accept &amp; Begin Task</span>
                    </button>
                  )}
                  {selectedRequest.status === "in_progress" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, "completed")}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Completed</span>
                    </button>
                  )}
                  {selectedRequest.status !== "completed" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedRequest.id, "cancelled")}
                      className="px-3 py-2 rounded-lg border border-red-500/30 text-red-600 hover:bg-red-500/10 font-semibold text-xs transition-colors"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>

              {/* Assignment Controls */}
              <div className="p-4 rounded-xl bg-dash-canvas border border-dash-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dash-text">Assigned Operational Staff</span>
                  <span className="text-xs text-[#EA6639] font-medium">{selectedRequest.assigned_staff || "Unassigned"}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => handleAssignStaff(selectedRequest.id, user?.user_metadata?.full_name || "Self")}
                    className="flex-1 py-1.5 rounded-lg border border-dash-border hover:bg-dash-surface text-xs font-semibold text-dash-text transition-colors"
                  >
                    Assign to Me
                  </button>
                  <button
                    onClick={() => handleAssignStaff(selectedRequest.id, "On-Duty Duty Manager")}
                    className="flex-1 py-1.5 rounded-lg border border-dash-border hover:bg-dash-surface text-xs font-semibold text-dash-text transition-colors"
                  >
                    Assign to Manager
                  </button>
                </div>
              </div>

              {/* Request Description */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted mb-2">Request Specification</h4>
                <div className="p-3.5 rounded-xl bg-dash-canvas border border-dash-border text-xs text-dash-text space-y-2">
                  <div>
                    <span className="text-dash-text-muted">Type: </span>
                    <strong className="capitalize">{selectedRequest.service_type}</strong>
                  </div>
                  <div>
                    <span className="text-dash-text-muted">Details: </span>
                    <span>
                      {selectedRequest.details?.description || selectedRequest.details?.notes || selectedRequest.details?.item || JSON.stringify(selectedRequest.details)}
                    </span>
                  </div>
                  {selectedRequest.scheduled_for && (
                    <div>
                      <span className="text-dash-text-muted">Scheduled For: </span>
                      <strong className="font-mono">{selectedRequest.scheduled_for}</strong>
                    </div>
                  )}
                </div>
              </div>

              {/* Staff Remarks / Internal Operations Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted mb-2">Staff Activity &amp; Notes</h4>
                <div className="space-y-2 mb-3">
                  {(selectedRequest.staff_remarks || []).length === 0 ? (
                    <p className="text-xs text-dash-text-muted italic">No internal remarks recorded yet.</p>
                  ) : (
                    selectedRequest.staff_remarks?.map((rem) => (
                      <div key={rem.id} className="p-2.5 rounded-lg bg-dash-canvas border border-dash-border text-xs">
                        <div className="flex items-center justify-between text-[10px] text-dash-text-muted mb-1">
                          <span className="font-semibold text-dash-text">{rem.author} ({rem.role || "staff"})</span>
                          <span>{formatTimeAgo(rem.created_at)}</span>
                        </div>
                        <p className="text-dash-text">{rem.content}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add operational notes or completion confirmation..."
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRemark(selectedRequest.id)}
                    className="flex-1 px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                  <button
                    onClick={() => handleAddRemark(selectedRequest.id)}
                    className="px-3 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#d9562a] transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
