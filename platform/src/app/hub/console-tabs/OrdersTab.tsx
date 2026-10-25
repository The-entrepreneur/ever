import React, { useState, useEffect, useMemo, useCallback, useDeferredValue } from "react";
import { 
  Utensils, Search, Filter, Clock, CheckCircle2, AlertTriangle, 
  RefreshCw, ChevronRight, X, User, DollarSign, Plus, Eye,
  Send, Sparkles, SlidersHorizontal, FileText, Check, Coffee
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox, SandboxOrder, StaffRemark } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { StandardTable, StandardTableColumn, TableDensity } from "../../../shared/StandardTable";

export interface OrderItem {
  name: string;
  qty: number;
  price?: number;
}

export interface OrderRecord {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  guest_name?: string;
  items: OrderItem[];
  total_amount: number;
  fee_amount?: number;
  status: string; // 'pending' | 'preparing' | 'delivered' | 'cancelled'
  channel?: string;
  priority?: "normal" | "rush" | "vip";
  payment_method?: string;
  folio_posted?: boolean;
  special_instructions?: string;
  staff_remarks?: StaffRemark[];
  notes?: string;
  created_at: string;
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

interface OrdersTabProps {
  role?: string;
  propertyName?: string;
  onNavigate?: (tab: string, context?: any) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ role = "hotel_manager", propertyName, onNavigate }) => {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData } = useSandbox();
  const { showToast } = useToast();
  const { formatMoney } = useCurrency();

  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
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

  // Fetch orders from Supabase or Sandbox
  const fetchOrders = useCallback(async () => {
    setLoading(true);

    if (isSandbox && sandboxData) {
      const ords: OrderRecord[] = (sandboxData.orders || []).map((o: SandboxOrder) => {
        const rawStatus = (o.status || "pending").toLowerCase();
        const normStatus = (rawStatus === "completed" ? "delivered" : rawStatus) as any;
        return {
          id: o.id,
          hotel_id: o.hotel_id,
          session_id: o.session_id,
          room_number: o.room_number,
          guest_name: o.guest_name || `Room ${o.room_number} Guest`,
          items: o.items || [],
          total_amount: o.total_amount,
          fee_amount: o.fee_amount,
          status: normStatus,
          channel: o.channel || "whatsapp",
          priority: (o.priority || "normal").toLowerCase() as any,
          payment_method: o.payment_method || "room_folio",
          folio_posted: true,
          special_instructions: o.special_instructions,
          staff_remarks: o.staff_remarks || [],
          notes: o.special_instructions,
          created_at: o.created_at,
        };
      });
      setOrders(ords);
      setLoading(false);
      return;
    }

    if (!hotelId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formatted: OrderRecord[] = (data || []).map((o: any) => {
        const rawStatus = (o.status || "pending").toLowerCase();
        const normStatus = (rawStatus === "completed" ? "delivered" : rawStatus) as any;
        return {
          id: o.id,
          hotel_id: o.hotel_id,
          session_id: o.session_id || "direct",
          room_number: o.room_number,
          guest_name: o.guest_name || `Room ${o.room_number} Guest`,
          items: Array.isArray(o.items) ? o.items : [],
          total_amount: parseFloat(o.total_amount || 0),
          status: normStatus,
          channel: o.channel || "whatsapp",
          priority: (o.priority || "normal").toLowerCase() as any,
          payment_method: o.payment_method || "room_folio",
          folio_posted: !!o.folio_posted,
          special_instructions: o.notes || o.special_instructions || "",
          staff_remarks: Array.isArray(o.staff_remarks) ? o.staff_remarks : [],
          created_at: o.created_at,
        };
      });

      setOrders(formatted);
    } catch (err: any) {
      console.error("[OrdersTab] Failed to fetch orders:", err);
      showToast("Failed to fetch dining orders", "error");
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, showToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Update order status (Pending -> Preparing -> Delivered -> Cancelled)
  const handleUpdateStatus = async (orderId: string, nextStatus: string) => {
    const updatedOrders = orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o);
    setOrders(updatedOrders);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: nextStatus } : null);
    }

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
      }));
      showToast(`Order updated to ${nextStatus}`, "success");
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: nextStatus, updated_at: new Date().toISOString() })
        .eq("id", orderId);

      if (error) throw error;
      showToast(`Order status updated to ${nextStatus}`, "success");
    } catch (err: any) {
      console.error("[OrdersTab] Update status error:", err);
      showToast(err.message || "Failed to update order status", "error");
      fetchOrders();
    }
  };

  // Add staff kitchen remark
  const handleAddRemark = async (orderId: string) => {
    if (!newRemarkText.trim()) return;

    const newRemark: StaffRemark = {
      id: "rem_" + Math.random().toString(36).substring(2, 9),
      author: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Staff",
      role: (role || "staff").replace("_", " "),
      content: newRemarkText.trim(),
      created_at: new Date().toISOString()
    };

    const targetOrder = orders.find(o => o.id === orderId);
    if (!targetOrder) return;

    const updatedRemarks = [...(targetOrder.staff_remarks || []), newRemark];

    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, staff_remarks: updatedRemarks } : o));
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, staff_remarks: updatedRemarks } : null);
    }
    setNewRemarkText("");

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? { ...o, staff_remarks: updatedRemarks } : o)
      }));
      showToast("Remark logged to kitchen ticket", "info");
      return;
    }

    try {
      const { error } = await supabase
        .from("orders")
        .update({ staff_remarks: updatedRemarks })
        .eq("id", orderId);

      if (error) throw error;
      showToast("Kitchen note recorded", "info");
    } catch (err: any) {
      console.error("[OrdersTab] Save remark error:", err);
    }
  };

  // Post to Room Folio
  const handlePostFolioCharge = async (order: OrderRecord) => {
    if (order.folio_posted) return;

    if (isSandbox) {
      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, folio_posted: true } : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => prev ? { ...prev, folio_posted: true } : null);
      }
      showToast(`Folio charge of ${formatMoney(order.total_amount)} posted to Room ${order.room_number}`, "success");
      return;
    }

    try {
      // 1. Insert into folio_charges
      const { error: chargeErr } = await supabase.from("folio_charges").insert({
        hotel_id: hotelId,
        room_number: order.room_number,
        amount: order.total_amount,
        description: `In-Room Dining: ${order.items.map(i => `${i.name} (x${i.qty})`).join(", ")}`,
        category: "dining",
        status: "posted",
        order_id: order.id,
        posted_at: new Date().toISOString()
      });

      if (chargeErr) throw chargeErr;

      // 2. Mark order as folio_posted
      await supabase.from("orders").update({ folio_posted: true }).eq("id", order.id);

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, folio_posted: true } : o));
      if (selectedOrder?.id === order.id) {
        setSelectedOrder(prev => prev ? { ...prev, folio_posted: true } : null);
      }

      showToast(`Charge of ${formatMoney(order.total_amount)} posted to Room ${order.room_number} folio`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to post folio charge", "error");
    }
  };

  // Filtered and sorted orders
  const filteredOrders = useMemo(() => {
    const list = orders.filter(o => {
      const s = (o.status || "").toLowerCase();
      if (statusFilter !== "all") {
        if (statusFilter === "pending" && s !== "pending") return false;
        if (statusFilter === "preparing" && s !== "preparing") return false;
        if (statusFilter === "delivered" && s !== "delivered" && s !== "completed") return false;
        if (statusFilter === "cancelled" && s !== "cancelled") return false;
      }
      if (priorityFilter !== "all" && (o.priority || "normal").toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        const matchesRoom = (o.room_number || "").toLowerCase().includes(q);
        const matchesGuest = (o.guest_name || "").toLowerCase().includes(q);
        const matchesItems = (o.items || []).some(i => (i.name || "").toLowerCase().includes(q));
        if (!matchesRoom && !matchesGuest && !matchesItems) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let valA: any = (a as any)[sortKey];
      let valB: any = (b as any)[sortKey];

      if (sortKey === "room_number") {
        valA = parseInt(a.room_number, 10) || a.room_number;
        valB = parseInt(b.room_number, 10) || b.room_number;
      } else if (sortKey === "total_amount") {
        valA = Number(a.total_amount) || 0;
        valB = Number(b.total_amount) || 0;
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
  }, [orders, statusFilter, priorityFilter, deferredSearch, sortKey, sortDirection]);

  // Operational metrics
  const metrics = useMemo(() => {
    const pendingCount = orders.filter(o => (o.status || "").toLowerCase() === "pending").length;
    const preparingCount = orders.filter(o => (o.status || "").toLowerCase() === "preparing").length;
    const deliveredCount = orders.filter(o => {
      const s = (o.status || "").toLowerCase();
      return s === "delivered" || s === "completed";
    }).length;
    const totalRevenue = orders
      .filter(o => (o.status || "").toLowerCase() !== "cancelled")
      .reduce((acc, o) => acc + (Number(o.total_amount) || 0), 0);

    return { pendingCount, preparingCount, deliveredCount, totalRevenue };
  }, [orders]);

  // Table Columns
  const tableColumns: StandardTableColumn<OrderRecord>[] = [
    {
      key: "room_number",
      header: "Room / Location",
      sortable: true,
      render: (o) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-400 font-bold text-xs flex items-center justify-center border border-orange-500/20 shrink-0">
            {o.room_number}
          </div>
          <div>
            <div className="font-semibold text-dash-text text-xs">{o.guest_name || `Room ${o.room_number}`}</div>
            <div className="text-[10px] text-dash-text-muted capitalize">{o.channel || "direct"}</div>
          </div>
        </div>
      )
    },
    {
      key: "items",
      header: "Ordered Items",
      render: (o) => (
        <div className="max-w-[280px]">
          <div className="truncate text-dash-text font-medium text-xs">
            {o.items.map(i => `${i.name} (x${i.qty})`).join(", ") || "No items"}
          </div>
          {o.special_instructions && (
            <div className="text-[10px] text-amber-600 dark:text-amber-400 truncate flex items-center gap-1 mt-0.5">
              <span>Note: {o.special_instructions}</span>
            </div>
          )}
        </div>
      )
    },
    {
      key: "total_amount",
      header: "Total & Folio",
      sortable: true,
      render: (o) => (
        <div>
          <div className="font-semibold text-dash-text text-xs">{formatMoney(o.total_amount)}</div>
          <div className="text-[10px] flex items-center gap-1 mt-0.5">
            {o.folio_posted ? (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <Check className="w-2.5 h-2.5" /> Room Folio
              </span>
            ) : (
              <span className="text-amber-500">Unposted</span>
            )}
          </div>
        </div>
      )
    },
    {
      key: "priority",
      header: "Priority",
      sortable: true,
      render: (o) => {
        const p = o.priority || "normal";
        return (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
            p === "vip" 
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20"
              : p === "rush"
              ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 animate-pulse"
              : "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20"
          }`}>
            {p}
          </span>
        );
      }
    },
    {
      key: "status",
      header: "Kitchen Status",
      sortable: true,
      render: (o) => {
        const s = o.status;
        return (
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
            s === "pending"
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
              : s === "preparing"
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30"
              : s === "delivered"
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
              : "bg-zinc-500/10 text-zinc-500 border-zinc-500/30"
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              s === "pending" ? "bg-amber-500 animate-ping" : s === "preparing" ? "bg-blue-500 animate-pulse" : s === "delivered" ? "bg-emerald-500" : "bg-zinc-400"
            }`} />
            <span className="capitalize">{s}</span>
          </span>
        );
      }
    },
    {
      key: "created_at",
      header: "Elapsed Time",
      sortable: true,
      render: (o) => (
        <span className="text-dash-text-muted text-xs flex items-center gap-1 font-mono">
          <Clock className="w-3 h-3 opacity-60" />
          {formatTimeAgo(o.created_at)}
        </span>
      )
    },
    {
      key: "id",
      header: "Actions",
      align: "right",
      render: (o) => (
        <button
          onClick={() => setSelectedOrder(o)}
          className="p-1.5 text-dash-text-muted hover:text-dash-text rounded-md hover:bg-dash-surface-hover transition-colors"
          title="Inspect kitchen ticket"
        >
          <Eye className="w-4 h-4" />
        </button>
      )
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-dash-surface">
      {/* Top Banner / Metrics bar */}
      <div className="p-4 md:p-6 border-b border-dash-border shrink-0 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-dash-text flex items-center gap-2">
              <Utensils className="w-5 h-5 text-[#EA6639]" />
              <span>Dining &amp; In-Room Commerce</span>
            </h1>
            <p className="text-xs text-dash-text-sec mt-0.5">
              Live kitchen ticket management, in-room orders, and automated room folio postings
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchOrders}
              className="p-2 bg-dash-surface border border-dash-border rounded-lg text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5"
              title="Refresh tickets"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium">
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === "kanban" ? "bg-dash-surface text-dash-text shadow-xs" : "text-dash-text-muted hover:text-dash-text"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  viewMode === "table" ? "bg-dash-surface text-dash-text shadow-xs" : "text-dash-text-muted hover:text-dash-text"
                }`}
              >
                Table
              </button>
            </div>
          </div>
        </div>

        {/* Operational Metrics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Kitchen Queue</div>
            <div className="text-xl font-bold text-amber-500 mt-0.5">{metrics.pendingCount + metrics.preparingCount}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">{metrics.pendingCount} pending • {metrics.preparingCount} prep</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Delivered Today</div>
            <div className="text-xl font-bold text-emerald-500 mt-0.5">{metrics.deliveredCount}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Completed orders</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Dining Revenue</div>
            <div className="text-xl font-bold text-dash-text mt-0.5">{formatMoney(metrics.totalRevenue)}</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Automated folio sync</div>
          </div>

          <div className="p-3 rounded-xl bg-dash-canvas border border-dash-border">
            <div className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Target Kitchen SLA</div>
            <div className="text-xl font-bold text-[#EA6639] mt-0.5">25 mins</div>
            <div className="text-[10px] text-dash-text-sec mt-0.5">Avg prep turnaround</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-2 flex-1 min-w-[220px]">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 text-dash-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by room, guest, or dish name..."
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
              <option value="preparing">Preparing</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
            >
              <option value="all">All Priorities</option>
              <option value="vip">VIP Guest</option>
              <option value="rush">Rush / Urgent</option>
              <option value="normal">Standard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content: Kanban or Table */}
      <div className="flex-1 overflow-auto p-4 md:p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 gap-2 text-dash-text-muted">
            <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
            <span className="text-xs">Loading kitchen tickets...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Utensils className="w-12 h-12 text-dash-text-muted/30 mb-2" />
            <h3 className="font-semibold text-dash-text text-sm">No Dining Orders Found</h3>
            <p className="text-xs text-dash-text-sec max-w-sm mt-1">
              Active in-room dining orders placed via WhatsApp or Webchat will appear here in real time.
            </p>
          </div>
        ) : viewMode === "kanban" ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Column 1: Pending */}
            <div className="flex flex-col rounded-xl bg-dash-canvas/50 border border-dash-border p-3 min-h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-dash-border mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <span className="font-bold text-xs text-dash-text uppercase tracking-wide">New Orders</span>
                </div>
                <span className="text-xs font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {filteredOrders.filter(o => o.status === "pending").length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredOrders.filter(o => o.status === "pending").map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 rounded-xl bg-dash-surface border border-dash-border hover:border-[#EA6639]/40 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-orange-500/10 text-orange-600 font-bold text-xs">
                        Room {order.room_number}
                      </span>
                      <span className="text-[10px] text-dash-text-muted font-mono">{formatTimeAgo(order.created_at)}</span>
                    </div>

                    <div className="text-xs font-semibold text-dash-text mb-1">
                      {order.guest_name || "Guest"}
                    </div>

                    <div className="text-xs text-dash-text-sec mb-3">
                      {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dash-border/60 text-xs">
                      <span className="font-bold text-dash-text">{formatMoney(order.total_amount)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order.id, "preparing");
                        }}
                        className="px-2.5 py-1 rounded bg-[#EA6639] text-white text-[11px] font-semibold hover:bg-[#d9562a] transition-colors"
                      >
                        Accept &amp; Prep
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Kitchen Preparing */}
            <div className="flex flex-col rounded-xl bg-dash-canvas/50 border border-dash-border p-3 min-h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-dash-border mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-bold text-xs text-dash-text uppercase tracking-wide">Cooking / Preparing</span>
                </div>
                <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {filteredOrders.filter(o => o.status === "preparing").length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredOrders.filter(o => o.status === "preparing").map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 rounded-xl bg-dash-surface border border-dash-border hover:border-blue-500/40 shadow-xs cursor-pointer transition-all hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-bold text-xs">
                        Room {order.room_number}
                      </span>
                      <span className="text-[10px] text-dash-text-muted font-mono">{formatTimeAgo(order.created_at)}</span>
                    </div>

                    <div className="text-xs font-semibold text-dash-text mb-1">
                      {order.guest_name || "Guest"}
                    </div>

                    <div className="text-xs text-dash-text-sec mb-3">
                      {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dash-border/60 text-xs">
                      <span className="font-bold text-dash-text">{formatMoney(order.total_amount)}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(order.id, "delivered");
                        }}
                        className="px-2.5 py-1 rounded bg-emerald-600 text-white text-[11px] font-semibold hover:bg-emerald-700 transition-colors"
                      >
                        Mark Delivered
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Delivered */}
            <div className="flex flex-col rounded-xl bg-dash-canvas/50 border border-dash-border p-3 min-h-[380px]">
              <div className="flex items-center justify-between pb-3 border-b border-dash-border mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="font-bold text-xs text-dash-text uppercase tracking-wide">Delivered / Settled</span>
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {filteredOrders.filter(o => o.status === "delivered").length}
                </span>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto">
                {filteredOrders.filter(o => o.status === "delivered").map((order) => (
                  <div
                    key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className="p-3.5 rounded-xl bg-dash-surface border border-dash-border/70 opacity-90 hover:opacity-100 shadow-xs cursor-pointer transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs">
                        Room {order.room_number}
                      </span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Folio Settled
                      </span>
                    </div>

                    <div className="text-xs text-dash-text-sec truncate mb-2">
                      {order.items.map(i => `${i.name} ×${i.qty}`).join(", ")}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-dash-border/60 text-xs">
                      <span className="font-bold text-dash-text">{formatMoney(order.total_amount)}</span>
                      <span className="text-[10px] text-dash-text-muted">{formatTimeAgo(order.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <StandardTable<OrderRecord>
            columns={tableColumns}
            data={filteredOrders}
            keyField="id"
            density={tableDensity}
            onDensityChange={setTableDensity}
            sortKey={sortKey}
            sortDirection={sortDirection}
            onSort={handleSort}
            onRowClick={(o) => setSelectedOrder(o)}
          />
        )}
      </div>

      {/* Order Detail & Folio Posting Drawer */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[150] flex justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-4 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#EA6639] text-white font-bold text-xs">
                    Room {selectedOrder.room_number}
                  </span>
                  <span className="text-xs text-dash-text-muted font-mono">{selectedOrder.id.slice(0, 8)}</span>
                </div>
                <h3 className="font-bold text-sm text-dash-text mt-1">{selectedOrder.guest_name || "Guest Ticket"}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-md text-dash-text-muted hover:text-dash-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Details */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* Status & Actions Box */}
              <div className="p-4 rounded-xl bg-dash-canvas border border-dash-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-dash-text-muted">Kitchen Status:</span>
                  <span className="capitalize font-bold text-xs text-dash-text">{selectedOrder.status}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  {selectedOrder.status === "pending" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "preparing")}
                      className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors"
                    >
                      Acknowledge &amp; Prep
                    </button>
                  )}
                  {selectedOrder.status === "preparing" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "delivered")}
                      className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors"
                    >
                      Mark Delivered to Room
                    </button>
                  )}
                  {selectedOrder.status !== "cancelled" && (
                    <button
                      onClick={() => handleUpdateStatus(selectedOrder.id, "cancelled")}
                      className="px-3 py-2 rounded-lg border border-red-500/30 text-red-600 hover:bg-red-500/10 font-semibold text-xs transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Folio Posting Card */}
              <div className="p-4 rounded-xl bg-dash-canvas border border-dash-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-dash-text flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-[#EA6639]" />
                    <span>Room Folio Ledger</span>
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedOrder.folio_posted 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/10 text-amber-600"
                  }`}>
                    {selectedOrder.folio_posted ? "Charged to Folio" : "Unposted Balance"}
                  </span>
                </div>

                <p className="text-xs text-dash-text-sec">
                  Total order value: <strong>{formatMoney(selectedOrder.total_amount)}</strong>
                </p>

                {!selectedOrder.folio_posted && (
                  <button
                    onClick={() => handlePostFolioCharge(selectedOrder)}
                    className="w-full mt-2 py-2 rounded-lg bg-[#EA6639] hover:bg-[#d9562a] text-white font-semibold text-xs transition-colors shadow-xs"
                  >
                    Post {formatMoney(selectedOrder.total_amount)} to Room {selectedOrder.room_number} Folio
                  </button>
                )}
              </div>

              {/* Itemized Cart Breakdown */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted mb-2">Itemized Order</h4>
                <div className="rounded-xl border border-dash-border divide-y divide-dash-border overflow-hidden">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-center justify-between bg-dash-surface text-xs">
                      <div>
                        <div className="font-semibold text-dash-text">{item.name}</div>
                        <div className="text-[10px] text-dash-text-muted">Quantity: {item.qty}</div>
                      </div>
                      <div className="font-mono font-medium text-dash-text">
                        {item.price ? formatMoney(item.price * item.qty) : "Included"}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-dash-canvas flex items-center justify-between text-xs font-bold text-dash-text">
                    <span>Total Amount</span>
                    <span>{formatMoney(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Special Delivery Instructions */}
              {selectedOrder.special_instructions && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300">
                  <span className="font-bold">Guest Notes:</span> {selectedOrder.special_instructions}
                </div>
              )}

              {/* Staff Kitchen Remarks Log */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted mb-2">Staff Kitchen Log</h4>
                <div className="space-y-2 mb-3">
                  {(selectedOrder.staff_remarks || []).length === 0 ? (
                    <p className="text-xs text-dash-text-muted italic">No internal remarks recorded.</p>
                  ) : (
                    selectedOrder.staff_remarks?.map((rem) => (
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

                {/* Add remark input */}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add internal kitchen remark..."
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddRemark(selectedOrder.id)}
                    className="flex-1 px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                  <button
                    onClick={() => handleAddRemark(selectedOrder.id)}
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
