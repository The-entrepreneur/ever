import React, { useState, useEffect, useMemo, useCallback, useRef, useDeferredValue } from "react";
import { 
  Calendar as CalendarIcon, Filter, Search, MoreHorizontal, 
  Download, List, X, Coffee, Clock, CheckCircle2, User, 
  CreditCard, Phone, Mail, MapPin, RefreshCw, ChevronLeft, 
  ChevronRight, ChevronDown, Ban, AlertTriangle, MessageSquare,
  Sparkles, Utensils, BellRing, Copy, Check, Eye, Trash2, ArrowUpRight,
  Layers, SlidersHorizontal, Send, FileText, Plus, ShieldAlert
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox, SandboxBooking, SandboxOrder, SandboxServiceRequest } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { StandardTable, StandardTableColumn, TableDensity } from "../../../shared/StandardTable";

// ─── Types ───────────────────────────────────────────────────────────────────
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled' | 'Refunded';

export interface StaffRemark {
  id: string;
  author: string;
  role?: string;
  content: string;
  created_at: string;
}

export interface BookingRecord {
  id: string;
  hotel_id: string;
  booking_reference: string;
  booking_id?: string;
  guest_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  booking_value?: number;
  fee_percentage?: number;
  fee_amount?: number;
  channel?: "whatsapp" | "widget" | "instagram" | "facebook" | string;
  status: BookingStatus;
  payment_status?: "Paid" | "Pending" | "Refunded";
  payment_provider?: string;
  payment_ref?: string;
  upsells_purchased?: { name: string; qty: number; price: number }[];
  guest_email?: string;
  guest_phone?: string;
  cancellation_reason?: string;
  refund_reference?: string;
  modification_history?: { timestamp: string; note: string; actor: string }[];
  created_at: string;
}

export interface OrderRecord {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  guest_name?: string;
  items: { name: string; qty: number; price?: number }[];
  total_amount: number;
  fee_amount?: number;
  status: string;
  channel?: string;
  priority?: "normal" | "rush" | "vip";
  payment_method?: string;
  special_instructions?: string;
  staff_remarks?: StaffRemark[];
  notes?: string;
  created_at: string;
}

export interface ServiceRequestRecord {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  guest_name?: string;
  service_type: string;
  details?: { notes?: string; urgency?: "normal" | "urgent" };
  scheduled_for?: string | null;
  status: "pending" | "preparing" | "completed" | string;
  channel?: string;
  assigned_staff?: string;
  staff_remarks?: StaffRemark[];
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
    return "Recently";
  }
}

interface BookingsTabProps {
  role?: string;
  propertyName?: string;
  onNavigate?: (tab: string, context?: any) => void;
}

const ROOM_TYPE_COLORS: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  "Standard King": { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" },
  "Standard Twin": { bg: "bg-teal-500/10", border: "border-teal-500/30", text: "text-teal-700 dark:text-teal-300", dot: "bg-teal-500" },
  "Deluxe Ocean View": { bg: "bg-sky-500/10", border: "border-sky-500/30", text: "text-sky-700 dark:text-sky-300", dot: "bg-sky-500" },
  "Family Suite": { bg: "bg-amber-500/10", border: "border-amber-500/30", text: "text-amber-700 dark:text-amber-300", dot: "bg-amber-500" },
  "Presidential Suite": { bg: "bg-purple-500/10", border: "border-purple-500/30", text: "text-purple-700 dark:text-purple-300", dot: "bg-purple-500" },
  "Deluxe Garden View": { bg: "bg-lime-500/10", border: "border-lime-500/30", text: "text-lime-700 dark:text-lime-300", dot: "bg-lime-500" },
  "Double Queen": { bg: "bg-indigo-500/10", border: "border-indigo-500/30", text: "text-indigo-700 dark:text-indigo-300", dot: "bg-indigo-500" },
  "Junior Suite": { bg: "bg-pink-500/10", border: "border-pink-500/30", text: "text-pink-700 dark:text-pink-300", dot: "bg-pink-500" },
  "Penthouse": { bg: "bg-violet-500/10", border: "border-violet-500/30", text: "text-violet-700 dark:text-violet-300", dot: "bg-violet-500" },
  "Accessible Room": { bg: "bg-blue-500/10", border: "border-blue-500/30", text: "text-blue-700 dark:text-blue-300", dot: "bg-blue-500" },
};

export function BookingsTab({ role = "hotel_manager", propertyName = "Dero Apartments & Resorts", onNavigate }: BookingsTabProps) {
  const { hotelId, user } = useAuth();
  const { showToast } = useToast();
  const { formatMoney } = useCurrency();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();

  // Navigation & Sub-tabs
  const [activeSubTab, setActiveSubTab] = useState<"bookings" | "orders">("bookings");
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [calendarScope, setCalendarScope] = useState<"month" | "week" | "day">("month");
  const [ordersViewMode, setOrdersViewMode] = useState<"kanban" | "table">("kanban");
  const [orderCategoryTab, setOrderCategoryTab] = useState<"orders" | "services">("orders");

  // State Collections
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedRoomTypes, setSelectedRoomTypes] = useState<string[]>([]);
  const [sortKey, setSortKey] = useState<string | null>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [tableDensity, setTableDensity] = useState<TableDensity>("default");

  // Calendar Date Navigation
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date());

  // Modals & Drawers
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [selectedServiceRequest, setSelectedServiceRequest] = useState<ServiceRequestRecord | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("Guest Request");
  const [cancelRefundNotes, setCancelRefundNotes] = useState("");
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [ordersSearchQuery, setOrdersSearchQuery] = useState("");
  const [showRoomTypeDropdown, setShowRoomTypeDropdown] = useState(false);
  const [newRemarkText, setNewRemarkText] = useState("");

  // Refs & deferred values for debounced search (React 18)
  const searchInputRef = useRef<HTMLInputElement>(null);
  const deferredSearch = useDeferredValue(searchQuery);
  const deferredOrdersSearch = useDeferredValue(ordersSearchQuery);

  const isManager = role === "super_admin" || role === "agency_staff" || role === "hotel_manager";

  // ─── Data Fetching ────────────────────────────────────────────────────────
  const fetchAllData = useCallback(async () => {
    setLoading(true);

    if (isSandbox && sandboxData) {
      const bks = (sandboxData.bookings || []).map((b: SandboxBooking) => ({
        ...b,
        booking_id: b.booking_reference,
        fee_percentage: b.fee_percentage ?? 0.0300,
        fee_amount: b.fee_amount ?? parseFloat(((b.total_amount || 0) * 0.03).toFixed(2)),
        channel: b.channel || "whatsapp",
        status: b.status as BookingStatus,
      }));
      setBookings(bks);
      setOrders((sandboxData.orders as OrderRecord[]) || []);
      setServiceRequests((sandboxData.serviceRequests as ServiceRequestRecord[]) || []);
      setLoading(false);
      return;
    }

    if (!hotelId) {
      setLoading(false);
      return;
    }

    try {
      // 1. Fetch booking_events (primary) + bookings
      const [eventsRes, bookingsRes, ordersRes, servicesRes] = await Promise.all([
        supabase
          .from("booking_events")
          .select("*")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false }),
        supabase
          .from("bookings")
          .select("*")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false }),
        supabase
          .from("service_requests")
          .select("*")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false })
      ]);

      const eventsData = eventsRes.data || [];
      const rawBookings = bookingsRes.data || [];

      // Merge booking events with bookings records for comprehensive metadata
      const unifiedBookings: BookingRecord[] = eventsData.length > 0
        ? eventsData.map((ev: any) => {
            const matchedRaw = rawBookings.find((b: any) => b.booking_reference === ev.booking_id);
            const totalVal = parseFloat(ev.booking_value || matchedRaw?.total_amount || 0);
            const feePct = parseFloat(ev.fee_percentage || 0.0300);
            const feeAmt = ev.fee_amount ? parseFloat(ev.fee_amount) : parseFloat((totalVal * feePct).toFixed(2));
            return {
              id: ev.id,
              hotel_id: ev.hotel_id,
              booking_reference: ev.booking_id || ev.id.slice(0, 8).toUpperCase(),
              booking_id: ev.booking_id,
              guest_name: ev.guest_name || "Guest",
              room_type: ev.room_type || "Standard Room",
              check_in: ev.check_in || matchedRaw?.check_in || new Date().toISOString().split("T")[0],
              check_out: ev.check_out || matchedRaw?.check_out || new Date().toISOString().split("T")[0],
              total_amount: totalVal,
              booking_value: totalVal,
              fee_percentage: feePct,
              fee_amount: feeAmt,
              channel: ev.channel || "whatsapp",
              status: (ev.status?.charAt(0).toUpperCase() + ev.status?.slice(1)) as BookingStatus,
              created_at: ev.created_at,
            };
          })
        : rawBookings.map((b: any) => {
            const totalVal = parseFloat(b.total_amount || 0);
            return {
              id: b.id,
              hotel_id: b.hotel_id,
              booking_reference: b.booking_reference || b.id.slice(0, 8).toUpperCase(),
              booking_id: b.booking_reference,
              guest_name: b.guest_name || "Guest",
              room_type: b.room_type || "Standard Room",
              check_in: b.check_in || new Date().toISOString().split("T")[0],
              check_out: b.check_out || new Date().toISOString().split("T")[0],
              total_amount: totalVal,
              booking_value: totalVal,
              fee_percentage: 0.0300,
              fee_amount: parseFloat((totalVal * 0.03).toFixed(2)),
              channel: "whatsapp",
              status: (b.status?.charAt(0).toUpperCase() + b.status?.slice(1)) as BookingStatus,
              created_at: b.created_at,
            };
          });

      setBookings(unifiedBookings);
      if (ordersRes.data) setOrders(ordersRes.data as OrderRecord[]);
      if (servicesRes.data) setServiceRequests(servicesRes.data as ServiceRequestRecord[]);
    } catch (err: any) {
      console.error("Error loading bookings data:", err);
      showToast("Failed to load bookings: " + err.message, "error");
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, showToast]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Extract all distinct room types
  const allRoomTypes = useMemo(() => {
    const set = new Set<string>();
    bookings.forEach(b => { if (b.room_type) set.add(b.room_type); });
    return Array.from(set);
  }, [bookings]);

  // Initialize selected room types when room types are loaded
  useEffect(() => {
    if (allRoomTypes.length > 0 && selectedRoomTypes.length === 0) {
      setSelectedRoomTypes(allRoomTypes);
    }
  }, [allRoomTypes]);

  // ─── Filtered Bookings (debounced + expanded search) ─────────────────────
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      // Full-text search across all identifiable fields
      if (deferredSearch.trim()) {
        const q = deferredSearch.toLowerCase();
        if (
          !b.booking_reference?.toLowerCase().includes(q) &&
          !b.guest_name?.toLowerCase().includes(q) &&
          !b.room_type?.toLowerCase().includes(q) &&
          !b.guest_email?.toLowerCase().includes(q) &&
          !b.guest_phone?.toLowerCase().includes(q) &&
          !b.channel?.toLowerCase().includes(q) &&
          !b.status?.toLowerCase().includes(q) &&
          !b.payment_ref?.toLowerCase().includes(q) &&
          !b.cancellation_reason?.toLowerCase().includes(q)
        ) return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        if (b.status.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Channel filter
      if (channelFilter !== "all") {
        if (b.channel?.toLowerCase() !== channelFilter.toLowerCase()) return false;
      }

      // Room type filter (only when user has deselected some types)
      if (allRoomTypes.length > 0 && selectedRoomTypes.length < allRoomTypes.length) {
        if (!selectedRoomTypes.includes(b.room_type)) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!sortKey) return 0;
      let valA = (a as any)[sortKey];
      let valB = (b as any)[sortKey];
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA == null) return 1;
      if (valB == null) return -1;
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [bookings, deferredSearch, statusFilter, channelFilter, allRoomTypes, selectedRoomTypes, sortKey, sortDirection]);

  // ─── Orders & Service Requests — Search-filtered ────────────────────
  const matchedOrders = useMemo(() => {
    if (!deferredOrdersSearch.trim()) return orders;
    const q = deferredOrdersSearch.toLowerCase();
    return orders.filter(o =>
      o.session_id?.toLowerCase().includes(q) ||
      o.room_number?.toLowerCase().includes(q) ||
      o.guest_name?.toLowerCase().includes(q) ||
      o.items?.some(i => i.name?.toLowerCase().includes(q)) ||
      o.status?.toLowerCase().includes(q) ||
      o.notes?.toLowerCase().includes(q) ||
      o.special_instructions?.toLowerCase().includes(q) ||
      o.priority?.toLowerCase().includes(q)
    );
  }, [orders, deferredOrdersSearch]);

  const matchedServices = useMemo(() => {
    if (!deferredOrdersSearch.trim()) return serviceRequests;
    const q = deferredOrdersSearch.toLowerCase();
    return serviceRequests.filter(s =>
      s.session_id?.toLowerCase().includes(q) ||
      s.room_number?.toLowerCase().includes(q) ||
      s.guest_name?.toLowerCase().includes(q) ||
      s.service_type?.toLowerCase().includes(q) ||
      s.details?.notes?.toLowerCase().includes(q) ||
      s.assigned_staff?.toLowerCase().includes(q) ||
      s.status?.toLowerCase().includes(q)
    );
  }, [serviceRequests, deferredOrdersSearch]);

  // Active filter count for badge + clear-all
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== "all") count++;
    if (channelFilter !== "all") count++;
    if (allRoomTypes.length > 0 && selectedRoomTypes.length < allRoomTypes.length) count++;
    return count;
  }, [searchQuery, statusFilter, channelFilter, selectedRoomTypes, allRoomTypes]);

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setStatusFilter("all");
    setChannelFilter("all");
    setSelectedRoomTypes(allRoomTypes);
    setSortKey("created_at");
    setSortDirection("desc");
  }, [allRoomTypes]);

  // ─── Status Badge Helper ──────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const s = status?.toLowerCase();
    switch (s) {
      case 'confirmed':
      case 'completed':
        return "bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30";
      case 'preparing':
        return "bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30";
      case 'pending':
        return "bg-zinc-500/15 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30";
      case 'cancelled':
        return "bg-rose-500/15 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30";
      case 'refunded':
        return "bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30";
      default:
        return "bg-zinc-500/15 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30";
    }
  };

  // ─── Channel Icon Helper ──────────────────────────────────────────────────
  const getChannelBadge = (channel?: string) => {
    const ch = (channel || "whatsapp").toLowerCase();
    switch (ch) {
      case "whatsapp":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            <MessageSquare className="w-3 h-3 text-emerald-500" /> WhatsApp
          </span>
        );
      case "widget":
      case "web":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/15 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border border-blue-500/30">
            <Sparkles className="w-3 h-3 text-blue-500" /> Web Widget
          </span>
        );
      case "instagram":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-pink-500/15 dark:bg-pink-500/20 text-pink-700 dark:text-pink-300 border border-pink-500/30">
            <MessageSquare className="w-3 h-3 text-pink-500" /> Instagram
          </span>
        );
      case "facebook":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30">
            <MessageSquare className="w-3 h-3 text-indigo-500" /> Messenger
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-500/15 dark:bg-zinc-500/20 text-zinc-700 dark:text-zinc-300 border border-zinc-500/30">
            {ch}
          </span>
        );
    }
  };

  // ─── Keyboard Shortcut: ⌘F / Ctrl+F to focus search ─────────────────────
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "f" && activeSubTab === "bookings") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.select();
      }
      if (e.key === "Escape" && document.activeElement === searchInputRef.current) {
        setSearchQuery("");
        searchInputRef.current?.blur();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [activeSubTab]);

  // ─── Realtime Bot-Engine → Dashboard (live booking_events) ───────────────
  // When the bot processes a new reservation via WhatsApp/Instagram/Widget,
  // the platform dashboard updates in real time without a manual refresh.
  useEffect(() => {
    if (isSandbox || !hotelId) return;
    const channel = supabase
      .channel(`booking-live-${hotelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "booking_events", filter: `hotel_id=eq.${hotelId}` },
        (payload) => {
          const ev = payload.new as any;
          showToast(
            `📩 New booking via ${ev.channel || "bot"} — ${ev.guest_name || ev.booking_id || "guest"}`,
            "success"
          );
          fetchAllData();
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "booking_events", filter: `hotel_id=eq.${hotelId}` },
        () => { fetchAllData(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [hotelId, isSandbox, fetchAllData, showToast]);

  // ─── Staff Booking View — Audit Trail ────────────────────────────────────
  // Non-blocking: logs every staff member's booking view to audit_log.
  const handleViewBooking = useCallback(async (b: BookingRecord) => {
    setSelectedBooking(b);
    if (!isSandbox && hotelId) {
      supabase.from("audit_log").insert({
        hotel_id: hotelId,
        action: "view_booking",
        resource: b.booking_reference,
        detail: { guest_name: b.guest_name, status: b.status, channel: b.channel }
      });
    }
  }, [isSandbox, hotelId]);

  // ─── Copy to Clipboard ────────────────────────────────────────────────────

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    setCopiedId(txt);
    showToast("Copied to clipboard!", "success");
    setTimeout(() => setCopiedId(null), 2000);
  };

  // ─── Cancellation Handler ─────────────────────────────────────────────────
  const handleConfirmCancel = async () => {
    if (!selectedBooking) return;
    setIsProcessingCancel(true);

    try {
      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          bookings: prev.bookings.map(b => 
            b.booking_reference === selectedBooking.booking_reference
              ? {
                  ...b,
                  status: "Cancelled",
                  cancellation_reason: cancelReason,
                  refund_reference: cancelRefundNotes || `REF-${Date.now().toString().slice(-6)}`,
                }
              : b
          )
        }));

        setBookings(prev => prev.map(b => 
          b.booking_reference === selectedBooking.booking_reference
            ? {
                ...b,
                status: "Cancelled",
                cancellation_reason: cancelReason,
                refund_reference: cancelRefundNotes || `REF-${Date.now().toString().slice(-6)}`,
              }
            : b
        ));

        setSelectedBooking(prev => prev ? {
          ...prev,
          status: "Cancelled",
          cancellation_reason: cancelReason,
          refund_reference: cancelRefundNotes || `REF-${Date.now().toString().slice(-6)}`,
        } : null);

        showToast(`Booking ${selectedBooking.booking_reference} has been cancelled.`, "success");
      } else {
        // Live Supabase update
        await Promise.all([
          supabase
            .from("booking_events")
            .update({ status: "cancelled" })
            .eq("booking_id", selectedBooking.booking_reference),
          supabase
            .from("bookings")
            .update({ status: "cancelled" })
            .eq("booking_reference", selectedBooking.booking_reference),
          hotelId && supabase.from("audit_log").insert({
            hotel_id: hotelId,
            action: "cancel_booking",
            resource: selectedBooking.booking_reference,
            detail: { reason: cancelReason, refund_notes: cancelRefundNotes }
          })
        ]);

        setBookings(prev => prev.map(b => 
          b.booking_reference === selectedBooking.booking_reference
            ? { ...b, status: "Cancelled", cancellation_reason: cancelReason }
            : b
        ));

        setSelectedBooking(prev => prev ? { ...prev, status: "Cancelled" } : null);
        showToast(`Booking ${selectedBooking.booking_reference} marked as cancelled in database.`, "success");
      }

      setShowCancelModal(false);
    } catch (err: any) {
      showToast("Cancellation failed: " + err.message, "error");
    } finally {
      setIsProcessingCancel(false);
    }
  };

  // ─── Order & Request Status Updates ───────────────────────────────────────
  const handleUpdateOrderStatus = async (id: string, newStatus: string) => {
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === id ? { ...o, status: newStatus } : o)
      }));
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      setSelectedOrder(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
      showToast(`Order status updated to ${newStatus}`, "success");
    } else {
      try {
        await supabase.from("orders").update({ status: newStatus }).eq("id", id);
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
        setSelectedOrder(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
        showToast(`Order status updated to ${newStatus}`, "success");
      } catch (err: any) {
        showToast("Failed to update status: " + err.message, "error");
      }
    }
  };

  const handleUpdateServiceStatus = async (id: string, newStatus: string) => {
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        serviceRequests: (prev.serviceRequests || []).map(s => s.id === id ? { ...s, status: newStatus as any } : s)
      }));
      setServiceRequests(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
      setSelectedServiceRequest(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
      showToast(`Service request updated to ${newStatus}`, "success");
    } else {
      try {
        await supabase.from("service_requests").update({ status: newStatus }).eq("id", id);
        setServiceRequests(prev => prev.map(s => s.id === id ? { ...s, status: newStatus } : s));
        setSelectedServiceRequest(prev => prev && prev.id === id ? { ...prev, status: newStatus } : prev);
        showToast(`Service request updated to ${newStatus}`, "success");
      } catch (err: any) {
        showToast("Failed to update status: " + err.message, "error");
      }
    }
  };

  // ─── Staff Remarks / Notes Handler ─────────────────────────────────────────
  const handleAddOrderRemark = (orderId: string, content: string) => {
    if (!content.trim()) return;
    const newRemark: StaffRemark = {
      id: "rem_" + Date.now(),
      author: user?.user_metadata?.full_name || "Front Desk Staff",
      role: role === "hotel_manager" ? "Manager" : "Concierge",
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        orders: prev.orders.map(o => o.id === orderId ? {
          ...o,
          staff_remarks: [...(o.staff_remarks || []), newRemark]
        } : o)
      }));
    }

    setOrders(prev => prev.map(o => o.id === orderId ? {
      ...o,
      staff_remarks: [...(o.staff_remarks || []), newRemark]
    } : o));

    setSelectedOrder(prev => prev && prev.id === orderId ? {
      ...prev,
      staff_remarks: [...(prev.staff_remarks || []), newRemark]
    } : prev);

    setNewRemarkText("");
    showToast("Operational remark recorded", "success");
  };

  const handleAddServiceRemark = (serviceId: string, content: string) => {
    if (!content.trim()) return;
    const newRemark: StaffRemark = {
      id: "rem_" + Date.now(),
      author: user?.user_metadata?.full_name || "Guest Services",
      role: role === "hotel_manager" ? "Manager" : "Staff",
      content: content.trim(),
      created_at: new Date().toISOString()
    };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        serviceRequests: (prev.serviceRequests || []).map(s => s.id === serviceId ? {
          ...s,
          staff_remarks: [...(s.staff_remarks || []), newRemark]
        } : s)
      }));
    }

    setServiceRequests(prev => prev.map(s => s.id === serviceId ? {
      ...s,
      staff_remarks: [...(s.staff_remarks || []), newRemark]
    } : s));

    setSelectedServiceRequest(prev => prev && prev.id === serviceId ? {
      ...prev,
      staff_remarks: [...(prev.staff_remarks || []), newRemark]
    } : prev);

    setNewRemarkText("");
    showToast("Operational remark recorded", "success");
  };

  // ─── Export CSV ───────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const headers = ["Booking Reference", "Guest Name", "Room Type", "Check In", "Check Out", "Total Value", "Agency Fee (3%)", "Channel", "Status", "Booked At"];
    const rows = filteredBookings.map(b => [
      `"${b.booking_reference}"`,
      `"${b.guest_name}"`,
      `"${b.room_type}"`,
      `"${b.check_in}"`,
      `"${b.check_out}"`,
      b.total_amount,
      b.fee_amount ?? (b.total_amount * 0.03).toFixed(2),
      `"${b.channel || 'whatsapp'}"`,
      `"${b.status}"`,
      `"${b.created_at}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever_bookings_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Bookings exported to CSV successfully!", "success");
  };

  // ─── StandardTable Column Definitions (Screen 8.2) ─────────────────────────
  const bookingColumns: StandardTableColumn<BookingRecord>[] = [
    {
      key: "booking_reference",
      header: "Reference",
      isSticky: true, // "Context never leaves the screen"
      width: "140px",
      render: (b) => (
        <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-dash-text">
          <span>{b.booking_reference}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); copyText(b.booking_reference); }}
            title="Copy reference"
            className="text-dash-text-muted hover:text-dash-text transition-colors p-0.5 rounded"
          >
            {copiedId === b.booking_reference ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
        </div>
      )
    },
    {
      key: "guest_name",
      header: "Guest Name",
      sortable: true,
      minWidth: "160px",
      render: (b) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-dash-canvas border border-dash-border flex items-center justify-center shrink-0">
            <User className="w-3 h-3 text-dash-text-muted" />
          </div>
          <div className="truncate">
            <p className="font-medium text-xs text-dash-text truncate">{b.guest_name}</p>
            {b.guest_phone && (
              <p className="text-[10px] text-dash-text-muted font-mono truncate">{b.guest_phone}</p>
            )}
          </div>
        </div>
      )
    },
    {
      key: "room_type",
      header: "Room Type",
      sortable: true,
      minWidth: "150px",
      render: (b) => {
        const color = ROOM_TYPE_COLORS[b.room_type] || { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-dash-text-sec", dot: "bg-zinc-400" };
        return (
          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${color.bg} ${color.border} ${color.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${color.dot}`}></span>
            <span className="truncate">{b.room_type}</span>
          </span>
        );
      }
    },
    {
      key: "check_in",
      header: "Dates & Stay",
      sortable: true,
      minWidth: "160px",
      render: (b) => {
        const start = new Date(b.check_in);
        const end = new Date(b.check_out);
        const nights = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 3600 * 24)));
        return (
          <div className="flex items-center gap-2 text-xs">
            <span className="font-mono text-dash-text-sec whitespace-nowrap">
              {start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} &rarr; {end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </span>
            <span className="px-1.5 py-0.2 rounded text-[10px] bg-dash-canvas border border-dash-border text-dash-text-muted font-medium">
              {nights}n
            </span>
          </div>
        );
      }
    },
    {
      key: "total_amount",
      header: "Total Value",
      isNumeric: true, // Numbers right-aligned, tabular lining figures
      sortable: true,
      width: "120px",
      render: (b) => (
        <span className="font-bold text-dash-text font-mono text-xs">
          {formatMoney(b.total_amount, 2)}
        </span>
      )
    },
    {
      key: "fee_amount",
      header: "Agency Fee (3%)",
      isNumeric: true, // Receipt-style comparison
      sortable: true,
      width: "130px",
      render: (b) => {
        const fee = b.fee_amount ?? (b.total_amount * 0.03);
        return (
          <div className="inline-flex items-center justify-end gap-1 font-mono text-xs text-[#EA6639] font-medium">
            <span>{formatMoney(fee, 2)}</span>
            <span className="text-[9px] px-1 py-0.2 rounded bg-[#EA6639]/10 font-bold">3%</span>
          </div>
        );
      }
    },
    {
      key: "channel",
      header: "Channel",
      width: "120px",
      render: (b) => getChannelBadge(b.channel)
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      width: "110px",
      render: (b) => (
        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide capitalize ${getStatusBadge(b.status)}`}>
          {b.status}
        </span>
      )
    },
    {
      key: "created_at",
      header: "Booked At",
      sortable: true,
      width: "120px",
      render: (b) => (
        <span className="text-dash-text-muted text-[11px] font-mono whitespace-nowrap">
          {new Date(b.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "2-digit" })}
        </span>
      )
    }
  ];

  // ─── Calendar Helpers (Screen 8.1) ────────────────────────────────────────
  // Month view
  const monthStart = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth(), 1);
  const monthEnd   = new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 0);
  const startDayOfWeek = monthStart.getDay();
  const daysInMonth    = monthEnd.getDate();

  // Week view — anchor to the Sunday of the week containing currentCalendarDate
  const weekSunday = useMemo(() => {
    const d = new Date(currentCalendarDate);
    d.setDate(d.getDate() - d.getDay());
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentCalendarDate]);
  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekSunday);
      d.setDate(weekSunday.getDate() + i);
      return d;
    })
  , [weekSunday]);

  // Day view
  const dayDate = useMemo(() => {
    const d = new Date(currentCalendarDate);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentCalendarDate]);

  // Calendar heading label per scope
  const calendarHeading = useMemo(() => {
    if (calendarScope === "month") {
      return currentCalendarDate.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    if (calendarScope === "week") {
      const end = weekDays[6];
      const startLabel = weekDays[0].toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const endLabel   = end.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
      return `${startLabel} – ${endLabel}`;
    }
    return currentCalendarDate.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  }, [calendarScope, currentCalendarDate, weekDays]);

  // Count bookings visible in the current calendar window
  const visibleBookingsCount = useMemo(() => {
    const todayStr = (d: Date) => d.toISOString().split("T")[0];
    if (calendarScope === "month") {
      const ms = todayStr(monthStart);
      const me = todayStr(monthEnd);
      return filteredBookings.filter(b => b.status !== "Cancelled" && b.check_in <= me && b.check_out >= ms).length;
    }
    if (calendarScope === "week") {
      const ws = todayStr(weekDays[0]);
      const we = todayStr(weekDays[6]);
      return filteredBookings.filter(b => b.status !== "Cancelled" && b.check_in <= we && b.check_out >= ws).length;
    }
    const ds = todayStr(dayDate);
    return filteredBookings.filter(b => b.status !== "Cancelled" && b.check_in <= ds && b.check_out >= ds).length;
  }, [calendarScope, filteredBookings, monthStart, monthEnd, weekDays, dayDate]);

  const handlePrevDate = () => {
    if (calendarScope === "month") {
      setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() - 1, 1));
    } else if (calendarScope === "week") {
      const d = new Date(currentCalendarDate);
      d.setDate(d.getDate() - 7);
      setCurrentCalendarDate(d);
    } else {
      const d = new Date(currentCalendarDate);
      d.setDate(d.getDate() - 1);
      setCurrentCalendarDate(d);
    }
  };

  const handleNextDate = () => {
    if (calendarScope === "month") {
      setCurrentCalendarDate(new Date(currentCalendarDate.getFullYear(), currentCalendarDate.getMonth() + 1, 1));
    } else if (calendarScope === "week") {
      const d = new Date(currentCalendarDate);
      d.setDate(d.getDate() + 7);
      setCurrentCalendarDate(d);
    } else {
      const d = new Date(currentCalendarDate);
      d.setDate(d.getDate() + 1);
      setCurrentCalendarDate(d);
    }
  };

  const handleToday = () => {
    setCurrentCalendarDate(new Date());
  };

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-5 h-full flex flex-col relative overflow-hidden bg-dash-canvas">
      
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-dash-border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-header font-bold text-dash-text tracking-tight">Booking Management</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/20">
              {propertyName}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-dash-surface border border-dash-border text-dash-text-muted">
              Level 2 Automation
            </span>
          </div>
          <p className="text-body text-dash-text-sec mt-0.5">
            Centralized reservation ledger, calendar scheduling, 3% agency commission tracking, and POS service requests.
          </p>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
          {activeSubTab === "bookings" && (
            <div className="flex bg-dash-surface border border-dash-border rounded-lg p-0.5 shadow-xs">
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "list" ? "bg-dash-canvas text-dash-text font-semibold shadow-xs" : "text-dash-text-muted hover:text-dash-text"}`}
              >
                <List className="w-3.5 h-3.5" /> Table
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-all ${viewMode === "calendar" ? "bg-dash-canvas text-dash-text font-semibold shadow-xs" : "text-dash-text-muted hover:text-dash-text"}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" /> Calendar
              </button>
            </div>
          )}

          <button 
            onClick={handleExportCSV}
            className="h-8 px-3.5 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-semibold hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-dash-text-muted" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Sub-tabs Header ── */}
      <div className="flex gap-6 border-b border-dash-border px-1">
        <button 
          onClick={() => setActiveSubTab("bookings")}
          className={`pb-2.5 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeSubTab === "bookings" ? "text-[#EA6639] font-semibold" : "text-dash-text-muted hover:text-dash-text"}`}
        >
          <CalendarIcon className="w-4 h-4" />
          <span>Bookings & Ledger</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-dash-canvas border border-dash-border text-dash-text-muted">
            {bookings.length}
          </span>
          {activeSubTab === "bookings" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA6639] rounded-t-full shadow-[0_0_8px_rgba(234,102,57,0.4)]"></span>}
        </button>

        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`pb-2.5 text-sm font-medium transition-colors relative flex items-center gap-2 ${activeSubTab === "orders" ? "text-[#EA6639] font-semibold" : "text-dash-text-muted hover:text-dash-text"}`}
        >
          <Coffee className="w-4 h-4" />
          <span>Orders & Requests</span>
          <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-dash-canvas border border-dash-border text-dash-text-muted">
            {orders.length + serviceRequests.length}
          </span>
          {activeSubTab === "orders" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#EA6639] rounded-t-full shadow-[0_0_8px_rgba(234,102,57,0.4)]"></span>}
        </button>
      </div>

      {/* ── Main Content Area ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden relative">

        {/* ── 1. Bookings Sub-tab ── */}
        {activeSubTab === "bookings" && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            
            {/* ── Enhanced Filter Toolbar ── */}
            <div className="space-y-2">
              <div className="p-2.5 bg-dash-surface border border-dash-border rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
                <div className="flex flex-wrap items-center gap-2 flex-1 min-w-0">

                  {/* Search — ref-bound, keyboard shortcut, active ring */}
                  <div className="relative min-w-[200px] max-w-sm flex-1 group">
                    <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                      searchQuery ? "text-[#EA6639]" : "text-dash-text-muted group-focus-within:text-[#EA6639]"
                    }`} />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Guests, refs, room, email… (⌘F)"
                      className={`w-full pl-9 pr-8 py-1.5 bg-dash-canvas border rounded-lg text-xs text-dash-text focus:outline-none transition-all placeholder:text-dash-text-muted/60 ${
                        searchQuery
                          ? "border-[#EA6639]/50 ring-1 ring-[#EA6639]/20"
                          : "border-dash-border focus:ring-1 focus:ring-[#EA6639]"
                      }`}
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-text-muted hover:text-[#EA6639] transition-colors"
                        title="Clear search (Esc)"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Status Filter — highlights when active */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={`px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#EA6639] transition-all ${
                      statusFilter !== "all"
                        ? "bg-[#EA6639]/10 border-[#EA6639]/30 text-[#EA6639]"
                        : "bg-dash-canvas border-dash-border text-dash-text"
                    }`}
                  >
                    <option value="all">Status: All</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="refunded">Refunded</option>
                  </select>

                  {/* Channel Filter — highlights when active */}
                  <select
                    value={channelFilter}
                    onChange={(e) => setChannelFilter(e.target.value)}
                    className={`px-2.5 py-1.5 border rounded-lg text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#EA6639] transition-all ${
                      channelFilter !== "all"
                        ? "bg-[#EA6639]/10 border-[#EA6639]/30 text-[#EA6639]"
                        : "bg-dash-canvas border-dash-border text-dash-text"
                    }`}
                  >
                    <option value="all">Channel: All</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="widget">Web Widget</option>
                    <option value="instagram">Instagram</option>
                    <option value="facebook">Messenger</option>
                  </select>

                  {/* Room Types Dropdown — table mode only, calendar has its own sidebar */}
                  {viewMode === "list" && allRoomTypes.length > 0 && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowRoomTypeDropdown(prev => !prev)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 border rounded-lg text-xs font-medium transition-all ${
                          selectedRoomTypes.length < allRoomTypes.length
                            ? "bg-[#EA6639]/10 border-[#EA6639]/30 text-[#EA6639]"
                            : "bg-dash-canvas border-dash-border text-dash-text-muted hover:text-dash-text"
                        }`}
                        title="Filter by room type"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Rooms</span>
                        {selectedRoomTypes.length < allRoomTypes.length && (
                          <span className="px-1 rounded-full bg-[#EA6639] text-white text-[9px] font-bold leading-none py-0.5">
                            {selectedRoomTypes.length}
                          </span>
                        )}
                        <ChevronDown className={`w-3 h-3 opacity-50 transition-transform ${showRoomTypeDropdown ? "rotate-180" : ""}`} />
                      </button>
                      {showRoomTypeDropdown && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setShowRoomTypeDropdown(false)} />
                          <div className="absolute top-full left-0 mt-1.5 z-50 bg-dash-surface border border-dash-border rounded-xl shadow-xl p-2 min-w-[210px]">
                            <div className="flex items-center justify-between px-2 py-1.5 border-b border-dash-border mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Room Types</span>
                              <div className="flex gap-2.5">
                                <button type="button" onClick={() => setSelectedRoomTypes(allRoomTypes)} className="text-[10px] text-[#EA6639] font-semibold hover:underline">All</button>
                                <button type="button" onClick={() => setSelectedRoomTypes([])} className="text-[10px] text-dash-text-muted hover:text-dash-text">None</button>
                              </div>
                            </div>
                            <div className="space-y-0.5 max-h-52 overflow-y-auto">
                              {allRoomTypes.map(room => {
                                const isSel = selectedRoomTypes.includes(room);
                                const color = ROOM_TYPE_COLORS[room] || { dot: "bg-zinc-400" };
                                const cnt = bookings.filter(b => b.room_type === room && b.status !== "Cancelled").length;
                                return (
                                  <button
                                    key={room}
                                    type="button"
                                    onClick={() => setSelectedRoomTypes(prev =>
                                      isSel ? prev.filter(r => r !== room) : [...prev, room]
                                    )}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs hover:bg-dash-canvas transition-colors"
                                  >
                                    <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`}></span>
                                    <span className="flex-1 text-left text-dash-text truncate">{room}</span>
                                    <span className="text-[10px] font-mono text-dash-text-muted">{cnt}</span>
                                    {isSel && <Check className="w-3 h-3 text-[#EA6639] shrink-0" />}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Clear-all when filters are active */}
                  {activeFilterCount > 0 && (
                    <button
                      type="button"
                      onClick={clearAllFilters}
                      className="flex items-center gap-1.5 px-2.5 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-600 rounded-lg text-xs font-semibold transition-colors"
                      title="Clear all filters"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      {activeFilterCount} active
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Right: calendar controls OR sort select */}
                <div className="flex items-center gap-2 shrink-0">
                  {viewMode === "calendar" ? (
                    <>
                      <div className="flex bg-dash-canvas border border-dash-border rounded-lg p-0.5 text-xs">
                        <button onClick={() => setCalendarScope("month")} className={`px-2 py-1 rounded font-medium transition-all ${calendarScope === "month" ? "bg-dash-surface text-dash-text shadow-xs font-semibold" : "text-dash-text-muted"}`}>Month</button>
                        <button onClick={() => setCalendarScope("week")} className={`px-2 py-1 rounded font-medium transition-all ${calendarScope === "week" ? "bg-dash-surface text-dash-text shadow-xs font-semibold" : "text-dash-text-muted"}`}>Week</button>
                        <button onClick={() => setCalendarScope("day")} className={`px-2 py-1 rounded font-medium transition-all ${calendarScope === "day" ? "bg-dash-surface text-dash-text shadow-xs font-semibold" : "text-dash-text-muted"}`}>Day</button>
                      </div>
                      <div className="flex items-center gap-1 bg-dash-canvas border border-dash-border rounded-lg p-0.5">
                        <button onClick={handlePrevDate} className="p-1 hover:bg-dash-surface rounded text-dash-text-muted hover:text-dash-text" title="Previous"><ChevronLeft className="w-4 h-4" /></button>
                        <button onClick={handleToday} className="px-2 py-0.5 text-xs font-semibold text-dash-text hover:bg-dash-surface rounded">Today</button>
                        <button onClick={handleNextDate} className="p-1 hover:bg-dash-surface rounded text-dash-text-muted hover:text-dash-text" title="Next"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                    </>
                  ) : (
                    /* Smart Sort — table mode */
                    <select
                      value={`${sortKey}:${sortDirection}`}
                      onChange={(e) => {
                        const [key, dir] = e.target.value.split(":");
                        setSortKey(key);
                        setSortDirection(dir as "asc" | "desc");
                      }}
                      className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text font-medium focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                    >
                      <option value="created_at:desc">↓ Newest Booking</option>
                      <option value="created_at:asc">↑ Oldest Booking</option>
                      <option value="check_in:asc">↑ Upcoming Check-in</option>
                      <option value="check_in:desc">↓ Recent Check-in</option>
                      <option value="total_amount:desc">↓ Value: High → Low</option>
                      <option value="total_amount:asc">↑ Value: Low → High</option>
                      <option value="guest_name:asc">A→Z Guest Name</option>
                      <option value="status:asc">Status A→Z</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Active filter pills + result count — always visible */}
              <div className="flex items-center justify-between px-1 gap-2 flex-wrap min-h-[20px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dash-surface border border-dash-border text-[11px] text-dash-text-muted">
                      <Search className="w-2.5 h-2.5" />
                      <span className="max-w-[140px] truncate">“{searchQuery}”</span>
                      <button type="button" onClick={() => setSearchQuery("")} className="ml-0.5 hover:text-rose-500 transition-colors"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  )}
                  {statusFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dash-surface border border-dash-border text-[11px] text-dash-text-muted capitalize">
                      Status: {statusFilter}
                      <button type="button" onClick={() => setStatusFilter("all")} className="ml-0.5 hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  )}
                  {channelFilter !== "all" && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dash-surface border border-dash-border text-[11px] text-dash-text-muted capitalize">
                      {channelFilter}
                      <button type="button" onClick={() => setChannelFilter("all")} className="ml-0.5 hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  )}
                  {allRoomTypes.length > 0 && selectedRoomTypes.length < allRoomTypes.length && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-dash-surface border border-dash-border text-[11px] text-dash-text-muted">
                      {selectedRoomTypes.length} room type{selectedRoomTypes.length !== 1 ? "s" : ""}
                      <button type="button" onClick={() => setSelectedRoomTypes(allRoomTypes)} className="ml-0.5 hover:text-rose-500"><X className="w-2.5 h-2.5" /></button>
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-dash-text-muted font-mono shrink-0">
                  {loading
                    ? <span className="inline-flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> loading…</span>
                    : `${filteredBookings.length}${filteredBookings.length !== bookings.length ? ` of ${bookings.length}` : ""} booking${bookings.length !== 1 ? "s" : ""}`
                  }
                </span>
              </div>
            </div>

            {/* ── Screen 8.2: Table View ("A Table Is Six Decisions") ── */}
            {viewMode === "list" ? (
              <div className="flex-1 min-h-0 flex flex-col">
                <StandardTable
                  data={filteredBookings}
                  columns={bookingColumns}
                  keyField="id"
                  density={tableDensity}
                  onDensityChange={setTableDensity}
                  showDensityToggle={true}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                  onSort={(key) => {
                    if (sortKey === key) {
                      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                    } else {
                      setSortKey(key);
                      setSortDirection("asc");
                    }
                  }}
                  onRowClick={handleViewBooking}
                  renderRowActions={(row) => (
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setSelectedBooking(row); }}
                        className="p-1 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-canvas rounded transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      {isManager && row.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setSelectedBooking(row); setShowCancelModal(true); }}
                          className="p-1 text-dash-text-muted hover:text-rose-600 hover:bg-rose-500/10 rounded transition-colors"
                          title="Cancel Booking"
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  isLoading={loading}
                  emptyMessage={
                    <div className="flex flex-col items-center justify-center p-8 text-center">
                      <div className="w-12 h-12 rounded-2xl bg-dash-canvas border border-dash-border flex items-center justify-center text-dash-text-muted mb-3 shadow-xs">
                        <CalendarIcon className="w-6 h-6 text-dash-text-muted" />
                      </div>
                      <h4 className="text-sm font-semibold text-dash-text mb-1">No reservations found</h4>
                      <p className="text-xs text-dash-text-sec max-w-sm">
                        {isSandbox
                          ? "No bookings match your selected filter criteria. Try resetting filters."
                          : "Direct reservations processed through your AI Concierge (WhatsApp, Web Widget) will appear here automatically."}
                      </p>
                      {isSandbox && (
                        <button
                          onClick={regenerate}
                          className="mt-4 px-3.5 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors text-dash-text"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Regenerate Demo Bookings
                        </button>
                      )}
                    </div>
                  }
                />
              </div>
            ) : (
              /* ── Screen 8.1: Calendar View ── */
              <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-4 overflow-hidden">
                
                {/* Room Type Filter Sidebar (Screen 8.1) */}
                <div className="w-full md:w-56 bg-dash-surface border border-dash-border rounded-xl p-4 flex flex-col shrink-0 overflow-y-auto shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-xs font-bold text-dash-text uppercase tracking-wider">Room Types</h4>
                    <span className="text-[10px] text-dash-text-muted">
                      {selectedRoomTypes.length}/{allRoomTypes.length}
                    </span>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    {allRoomTypes.map(room => {
                      const isSelected = selectedRoomTypes.includes(room);
                      const color = ROOM_TYPE_COLORS[room] || { bg: "bg-zinc-500/10", border: "border-zinc-500/20", text: "text-dash-text-sec", dot: "bg-zinc-400" };
                      const count = bookings.filter(b => b.room_type === room && b.status !== "Cancelled").length;

                      return (
                        <button
                          key={room}
                          onClick={() => {
                            setSelectedRoomTypes(prev => 
                              isSelected ? prev.filter(r => r !== room) : [...prev, room]
                            );
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                            isSelected ? "bg-dash-canvas border border-dash-border text-dash-text" : "text-dash-text-muted hover:text-dash-text opacity-50"
                          }`}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${color.dot}`}></span>
                            <span className="truncate">{room}</span>
                          </div>
                          <span className="font-mono text-[10px] text-dash-text-muted shrink-0">
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sidebar Quick Actions */}
                  <div className="pt-3 border-t border-dash-border flex justify-between text-[11px] text-[#EA6639]">
                    <button 
                      onClick={() => setSelectedRoomTypes(allRoomTypes)} 
                      className="hover:underline font-medium"
                    >
                      Select All
                    </button>
                    <button 
                      onClick={() => setSelectedRoomTypes([])} 
                      className="text-dash-text-muted hover:underline"
                    >
                      Clear
                    </button>
                  </div>
                </div>

                {/* Main Calendar Grid */}
                <div className="flex-1 bg-dash-surface border border-dash-border rounded-xl p-4 flex flex-col min-h-0 overflow-auto shadow-xs">
                  {/* Scope-aware Heading with search indicator */}
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-bold text-dash-text">{calendarHeading}</h3>
                    <div className="flex items-center gap-2">
                      {deferredSearch && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EA6639]/10 border border-[#EA6639]/30 text-[10px] text-[#EA6639] font-medium">
                          <Search className="w-3 h-3" />
                          “{deferredSearch}”
                        </span>
                      )}
                      <span className="text-xs text-dash-text-sec font-mono">
                        {visibleBookingsCount} booking{visibleBookingsCount !== 1 ? "s" : ""} in view
                      </span>
                    </div>
                  </div>

                  {/* ── MONTH VIEW ── */}
                  {calendarScope === "month" && (
                    <div className="grid grid-cols-7 gap-1 flex-1 min-h-[420px]">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-center py-1.5 text-[11px] font-bold text-dash-text-muted uppercase border-b border-dash-border">
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: startDayOfWeek }).map((_, i) => (
                        <div key={`empty-${i}`} className="bg-dash-canvas/20 rounded-md border border-dash-border/30 opacity-40 p-1 min-h-[80px]"></div>
                      ))}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const dayNum = i + 1;
                        const dateStr = `${currentCalendarDate.getFullYear()}-${String(currentCalendarDate.getMonth() + 1).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                        const isToday = new Date().toISOString().split("T")[0] === dateStr;
                        const dayBookings = filteredBookings.filter(b =>
                          b.status !== "Cancelled" && b.check_in <= dateStr && b.check_out >= dateStr
                        );
                        return (
                          <div
                            key={dayNum}
                            className={`border rounded-md p-1 min-h-[85px] flex flex-col transition-colors ${
                              isToday ? "bg-[#EA6639]/5 border-[#EA6639]/40" : "border-dash-border/60 hover:bg-dash-canvas/40 bg-dash-surface"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1 px-1">
                              <span className={`text-xs font-mono font-bold ${isToday ? "text-[#EA6639]" : "text-dash-text"}`}>{dayNum}</span>
                              {dayBookings.length > 0 && (
                                <span className="text-[9px] font-mono text-dash-text-muted font-semibold">{dayBookings.length}</span>
                              )}
                            </div>
                            <div className="space-y-1 overflow-y-auto flex-1 max-h-[75px] hide-scrollbar">
                              {dayBookings.slice(0, 3).map(b => {
                                const color = ROOM_TYPE_COLORS[b.room_type] || { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" };
                                return (
                                  <button
                                    key={b.id}
                                    type="button"
                                    onClick={() => handleViewBooking(b)}
                                    title={`${b.guest_name} (${b.room_type})`}
                                    className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium border truncate transition-transform hover:scale-[1.02] flex items-center gap-1 ${color.bg} ${color.border} ${color.text}`}
                                  >
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`}></span>
                                    <span className="truncate">{b.guest_name}</span>
                                  </button>
                                );
                              })}
                              {dayBookings.length > 3 && (
                                <div className="text-[9px] text-dash-text-muted font-bold text-center">+{dayBookings.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ── WEEK VIEW ── */}
                  {calendarScope === "week" && (
                    <div className="flex flex-col flex-1 min-h-[420px]">
                      {/* Day headers */}
                      <div className="grid grid-cols-7 gap-2 mb-2">
                        {weekDays.map(d => {
                          const todayStr = new Date().toISOString().split("T")[0];
                          const dStr = d.toISOString().split("T")[0];
                          const isToday = dStr === todayStr;
                          return (
                            <div
                              key={dStr}
                              className={`text-center py-2 rounded-lg text-xs font-bold uppercase tracking-wide border ${
                                isToday
                                  ? "bg-[#EA6639]/10 border-[#EA6639]/40 text-[#EA6639]"
                                  : "border-dash-border text-dash-text-muted bg-dash-canvas/40"
                              }`}
                            >
                              <div>{d.toLocaleDateString(undefined, { weekday: "short" })}</div>
                              <div className={`text-lg font-extrabold mt-0.5 ${isToday ? "text-[#EA6639]" : "text-dash-text"}`}>
                                {d.getDate()}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {/* Booking rows per day */}
                      <div className="grid grid-cols-7 gap-2 flex-1 overflow-y-auto">
                        {weekDays.map(d => {
                          const dStr = d.toISOString().split("T")[0];
                          const dayBookings = filteredBookings.filter(b =>
                            b.status !== "Cancelled" && b.check_in <= dStr && b.check_out >= dStr
                          );
                          return (
                            <div key={dStr} className="flex flex-col gap-1.5 min-h-[320px] p-1.5 bg-dash-canvas/30 border border-dash-border/60 rounded-xl">
                              {dayBookings.length === 0 ? (
                                <div className="flex-1 flex items-center justify-center">
                                  <span className="text-[10px] text-dash-text-muted select-none">—</span>
                                </div>
                              ) : (
                                dayBookings.map(b => {
                                  const color = ROOM_TYPE_COLORS[b.room_type] || { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" };
                                  return (
                                    <button
                                      key={b.id}
                                      type="button"
                                      onClick={() => setSelectedBooking(b)}
                                      title={`${b.guest_name} — ${b.room_type}`}
                                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-medium border transition-all hover:scale-[1.02] ${
                                        color.bg} ${color.border} ${color.text}`}
                                    >
                                      <div className="flex items-center gap-1 mb-0.5">
                                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${color.dot}`}></span>
                                        <span className="font-semibold truncate">{b.guest_name}</span>
                                      </div>
                                      <div className="text-[9px] opacity-70 truncate">{b.room_type}</div>
                                      <div className="text-[9px] font-mono opacity-60 mt-0.5">
                                        {b.check_in} → {b.check_out}
                                      </div>
                                    </button>
                                  );
                                })
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* ── DAY VIEW ── */}
                  {calendarScope === "day" && (() => {
                    const dStr = dayDate.toISOString().split("T")[0];
                    const dayBookings = filteredBookings.filter(b =>
                      b.status !== "Cancelled" && b.check_in <= dStr && b.check_out >= dStr
                    );
                    return (
                      <div className="flex flex-col flex-1 min-h-[420px] gap-3">
                        {/* Day banner */}
                        <div className="flex items-center gap-3 p-3 bg-dash-canvas border border-dash-border rounded-xl">
                          <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold border ${
                            dStr === new Date().toISOString().split("T")[0]
                              ? "bg-[#EA6639]/10 border-[#EA6639]/40 text-[#EA6639]"
                              : "bg-dash-surface border-dash-border text-dash-text"
                          }`}>
                            <span className="text-[10px] uppercase tracking-wider">
                              {dayDate.toLocaleDateString(undefined, { weekday: "short" })}
                            </span>
                            <span className="text-2xl leading-none">{dayDate.getDate()}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-dash-text">
                              {dayDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}
                            </p>
                            <p className="text-xs text-dash-text-muted">
                              {dayBookings.length} reservation{dayBookings.length !== 1 ? "s" : ""} active on this date
                            </p>
                          </div>
                        </div>

                        {/* Booking list */}
                        {dayBookings.length === 0 ? (
                          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-dash-text-muted">
                            <CalendarIcon className="w-8 h-8 opacity-30" />
                            <p className="text-xs font-medium">No bookings active on this date</p>
                          </div>
                        ) : (
                          <div className="flex-1 overflow-y-auto space-y-2">
                            {dayBookings.map(b => {
                              const color = ROOM_TYPE_COLORS[b.room_type] || { bg: "bg-emerald-500/10", border: "border-emerald-500/30", text: "text-emerald-700 dark:text-emerald-300", dot: "bg-emerald-500" };
                              const nights = Math.max(1, Math.round((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / 86400000));
                              return (
                                <button
                                  key={b.id}
                                  type="button"
                                  onClick={() => setSelectedBooking(b)}
                                  className="w-full text-left p-3.5 bg-dash-canvas border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-all group shadow-xs"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${color.dot}`}></span>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-semibold text-sm text-dash-text truncate">{b.guest_name}</span>
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${color.bg} ${color.border} ${color.text}`}>
                                          {b.room_type}
                                        </span>
                                        <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-semibold ${getStatusBadge(b.status)}`}>
                                          {b.status}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-4 text-xs text-dash-text-muted">
                                        <span className="font-mono">{b.check_in} → {b.check_out}</span>
                                        <span>{nights}n stay</span>
                                        <span className="font-mono font-bold text-dash-text ml-auto">{formatMoney(b.total_amount, 2)}</span>
                                      </div>
                                      <div className="flex items-center gap-2 mt-1.5">
                                        {getChannelBadge(b.channel)}
                                        <span className="text-[10px] font-mono text-dash-text-muted">{b.booking_reference}</span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── 2. Orders & Service Requests Sub-tab (Screen 8.4) ── */}
        {activeSubTab === "orders" && (
          <div className="flex-1 flex flex-col min-h-0 space-y-3">
            
            {/* Orders Toolbar — with search */}
            <div className="p-2.5 bg-dash-surface border border-dash-border rounded-xl flex flex-wrap items-center justify-between gap-2 shadow-xs">
              <div className="flex items-center gap-2 flex-wrap flex-1">
                {/* Category Selector */}
                <div className="flex bg-dash-canvas border border-dash-border rounded-lg p-0.5 text-xs shrink-0">
                  <button
                    onClick={() => setOrderCategoryTab("orders")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      orderCategoryTab === "orders"
                        ? "bg-dash-surface text-dash-text font-semibold shadow-xs"
                        : "text-dash-text-muted hover:text-dash-text"
                    }`}
                  >
                    <Utensils className="w-3.5 h-3.5 text-[#EA6639]" />
                    <span>Food &amp; Beverage</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-dash-border text-[10px] font-mono font-bold text-dash-text-muted">
                      {ordersSearchQuery ? matchedOrders.length : orders.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setOrderCategoryTab("services")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all ${
                      orderCategoryTab === "services"
                        ? "bg-dash-surface text-dash-text font-semibold shadow-xs"
                        : "text-dash-text-muted hover:text-dash-text"
                    }`}
                  >
                    <BellRing className="w-3.5 h-3.5 text-blue-500" />
                    <span>Guest Requests ({serviceRequests.length})</span>
                  </button>
                </div>
              </div>

              {/* View mode toggle for Orders */}
              <div className="flex bg-dash-canvas border border-dash-border rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setOrdersViewMode("kanban")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${ordersViewMode === "kanban" ? "bg-dash-surface text-dash-text font-semibold shadow-xs" : "text-dash-text-muted hover:text-dash-text"}`}
                >
                  Kanban Board
                </button>
                <button
                  onClick={() => setOrdersViewMode("table")}
                  className={`px-3 py-1.5 rounded-md font-medium transition-all ${ordersViewMode === "table" ? "bg-dash-surface text-dash-text font-semibold shadow-xs" : "text-dash-text-muted hover:text-dash-text"}`}
                >
                  Table List
                </button>
              </div>
            </div>

            {/* Orders Content Area */}
            {ordersViewMode === "kanban" ? (
              /* Kanban View */
              <div className="flex-1 min-h-0 grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                {(["Pending", "Preparing", "Completed"] as const).map(colStatus => {
                  const filteredOrders = matchedOrders.filter(o => o.status?.toLowerCase() === colStatus.toLowerCase());
                  const filteredServices = matchedServices.filter(s => s.status?.toLowerCase() === colStatus.toLowerCase());

                  const colColor = colStatus === "Pending"
                    ? { header: "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400", border: "border-amber-500/20", icon: <Clock className="w-4 h-4 text-amber-500" />, badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" }
                    : colStatus === "Preparing"
                    ? { header: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400", border: "border-sky-500/20", icon: <RefreshCw className="w-4 h-4 text-sky-500 animate-spin" />, badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" }
                    : { header: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20", icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" };

                  return (
                    <div key={colStatus} className={`flex flex-col h-full bg-dash-surface rounded-xl border ${colColor.border} shadow-sm overflow-hidden`}>
                      {/* Column Header */}
                      <div className={`p-3 border-b ${colColor.header} flex justify-between items-center transition-colors`}>
                        <div className="flex items-center gap-2">
                          {colColor.icon}
                          <h4 className="text-xs font-bold uppercase tracking-wider">{colStatus}</h4>
                        </div>
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded-full border ${colColor.badge}`}>
                          {orderCategoryTab === "orders" ? filteredOrders.length : filteredServices.length}
                        </span>
                      </div>

                      {/* Column Card List */}
                      <div className="p-3 flex-1 overflow-y-auto space-y-3">
                        {orderCategoryTab === "orders" ? (
                          filteredOrders.length === 0 ? (
                            <div className="text-center py-12 text-dash-text-muted text-xs">
                              <Utensils className="w-6 h-6 mx-auto mb-2 opacity-30" />
                              No {colStatus.toLowerCase()} orders
                            </div>
                          ) : (
                            filteredOrders.map(order => (
                              <div
                                key={order.id}
                                onClick={() => setSelectedOrder(order)}
                                className="bg-dash-canvas border border-dash-border hover:border-[#EA6639]/60 hover:shadow-md rounded-xl p-3.5 transition-all cursor-pointer group space-y-2.5"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-bold text-[#EA6639] bg-[#EA6639]/10 px-2 py-0.5 rounded font-mono">
                                      Room {order.room_number}
                                    </span>
                                    {order.priority === "rush" && (
                                      <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase">
                                        Rush
                                      </span>
                                    )}
                                    {order.priority === "vip" && (
                                      <span className="text-[9px] font-bold text-purple-600 bg-purple-500/10 border border-purple-500/30 px-1.5 py-0.5 rounded uppercase">
                                        VIP
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-dash-text-muted group-hover:text-dash-text transition-colors">
                                    {order.session_id}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-dash-text line-clamp-1">
                                      {order.guest_name || "Hotel Guest"}
                                    </p>
                                    <span className="text-[10px] text-dash-text-muted flex items-center gap-1 font-mono">
                                      <Clock className="w-2.5 h-2.5 text-dash-text-muted" /> {formatTimeAgo(order.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-dash-text-sec mt-1 line-clamp-2">
                                    {order.items?.map(i => `${i.qty}x ${i.name}`).join(", ") || "Order Items"}
                                  </p>
                                </div>

                                {order.special_instructions && (
                                  <div className="p-1.5 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-700 dark:text-amber-300 italic line-clamp-1 flex items-center gap-1">
                                    <span>Note:</span> {order.special_instructions}
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-xs text-dash-text-sec pt-2 border-t border-dash-border/80">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-dash-text text-xs">
                                      {formatMoney(order.total_amount, 2)}
                                    </span>
                                    {order.staff_remarks && order.staff_remarks.length > 0 && (
                                      <span className="text-[10px] font-medium text-dash-text-muted flex items-center gap-0.5 bg-dash-surface px-1.5 py-0.2 rounded border border-dash-border" title={`${order.staff_remarks.length} staff remarks`}>
                                        <MessageSquare className="w-2.5 h-2.5 text-blue-500" /> {order.staff_remarks.length}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {colStatus === "Pending" && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateOrderStatus(order.id, "Preparing");
                                        }}
                                        className="text-[11px] font-semibold text-[#EA6639] hover:bg-[#EA6639]/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                      >
                                        Start Prep &rarr;
                                      </button>
                                    )}
                                    {colStatus === "Preparing" && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateOrderStatus(order.id, "Completed");
                                        }}
                                        className="text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                      >
                                        Mark Delivered &rarr;
                                      </button>
                                    )}
                                    {colStatus === "Completed" && (
                                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Delivered
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )
                        ) : (
                          filteredServices.length === 0 ? (
                            <div className="text-center py-12 text-dash-text-muted text-xs">
                              <BellRing className="w-6 h-6 mx-auto mb-2 opacity-30" />
                              No {colStatus.toLowerCase()} requests
                            </div>
                          ) : (
                            filteredServices.map(service => (
                              <div
                                key={service.id}
                                onClick={() => setSelectedServiceRequest(service)}
                                className="bg-dash-canvas border border-dash-border hover:border-blue-500/60 hover:shadow-md rounded-xl p-3.5 transition-all cursor-pointer group space-y-2.5"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-[11px] font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded font-mono">
                                      Room {service.room_number}
                                    </span>
                                    {service.details?.urgency === "urgent" && (
                                      <span className="text-[9px] font-bold text-rose-600 bg-rose-500/10 border border-rose-500/30 px-1.5 py-0.5 rounded uppercase">
                                        Urgent
                                      </span>
                                    )}
                                  </div>
                                  <span className="text-[10px] font-mono text-dash-text-muted group-hover:text-dash-text transition-colors">
                                    {service.session_id}
                                  </span>
                                </div>

                                <div>
                                  <div className="flex items-center justify-between">
                                    <p className="text-xs font-bold text-dash-text line-clamp-1">
                                      {service.guest_name || "Hotel Guest"}
                                    </p>
                                    <span className="text-[10px] text-dash-text-muted flex items-center gap-1 font-mono">
                                      <Clock className="w-2.5 h-2.5 text-dash-text-muted" /> {formatTimeAgo(service.created_at)}
                                    </span>
                                  </div>
                                  <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mt-1">
                                    {service.service_type}
                                  </p>
                                  <p className="text-[11px] text-dash-text-muted mt-0.5 line-clamp-2">
                                    {service.details?.notes || "Digital concierge assistance requested"}
                                  </p>
                                </div>

                                <div className="flex items-center justify-between text-xs text-dash-text-sec pt-2 border-t border-dash-border/80">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-dash-text-sec flex items-center gap-1">
                                      <User className="w-2.5 h-2.5 text-dash-text-muted" /> {service.assigned_staff ? service.assigned_staff.split(" ")[0] : "Desk"}
                                    </span>
                                    {service.staff_remarks && service.staff_remarks.length > 0 && (
                                      <span className="text-[10px] font-medium text-dash-text-muted flex items-center gap-0.5 bg-dash-surface px-1.5 py-0.2 rounded border border-dash-border" title={`${service.staff_remarks.length} remarks`}>
                                        <MessageSquare className="w-2.5 h-2.5 text-blue-500" /> {service.staff_remarks.length}
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {colStatus === "Pending" && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateServiceStatus(service.id, "preparing");
                                        }}
                                        className="text-[11px] font-semibold text-blue-600 hover:bg-blue-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                      >
                                        Start &rarr;
                                      </button>
                                    )}
                                    {colStatus === "Preparing" && (
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleUpdateServiceStatus(service.id, "completed");
                                        }}
                                        className="text-[11px] font-semibold text-emerald-600 hover:bg-emerald-500/10 px-2 py-1 rounded transition-colors flex items-center gap-1"
                                      >
                                        Complete &rarr;
                                      </button>
                                    )}
                                    {colStatus === "Completed" && (
                                      <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                                        <Check className="w-3 h-3" /> Completed
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                          )
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Table View for Orders */
              <div className="flex-1 min-h-0 flex flex-col">
                {orderCategoryTab === "orders" ? (
                  <StandardTable<OrderRecord>
                    data={matchedOrders}
                    keyField="id"
                    columns={[
                      { key: "session_id", header: "Order Ref", isSticky: true, width: "130px", render: o => <span className="font-mono text-xs font-semibold">{o.session_id}</span> },
                      { key: "room_number", header: "Room", width: "90px", render: o => <span className="font-bold text-[#EA6639] font-mono">#{o.room_number}</span> },
                      { key: "items", header: "Items Ordered", render: o => <span className="text-xs">{o.items?.map(i => `${i.qty}x ${i.name}`).join(", ") || "—"}</span> },
                      { key: "total_amount", header: "Amount", isNumeric: true, width: "110px", render: o => <span className="font-bold font-mono text-xs">{formatMoney(o.total_amount, 2)}</span> },
                      { key: "status", header: "Status", width: "110px", render: o => <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${getStatusBadge(o.status)}`}>{o.status}</span> },
                      { key: "created_at", header: "Time", width: "120px", render: o => <span className="text-xs text-dash-text-muted font-mono">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> },
                    ]}
                    onRowClick={o => setSelectedOrder(o)}
                    renderRowActions={o => (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }}
                        className="p-1 hover:text-[#EA6639]"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  />
                ) : (
                  <StandardTable<ServiceRequestRecord>
                    data={matchedServices}
                    keyField="id"
                    columns={[
                      { key: "session_id", header: "Request Ref", isSticky: true, width: "130px", render: s => <span className="font-mono text-xs font-semibold">{s.session_id}</span> },
                      { key: "room_number", header: "Room", width: "90px", render: s => <span className="font-bold text-blue-600 font-mono">#{s.room_number}</span> },
                      { key: "service_type", header: "Service Type", render: s => <span className="text-xs font-medium">{s.service_type}</span> },
                      { key: "details", header: "Notes", render: s => <span className="text-xs text-dash-text-sec">{s.details?.notes || "—"}</span> },
                      { key: "status", header: "Status", width: "110px", render: s => <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${getStatusBadge(s.status)}`}>{s.status}</span> },
                      { key: "created_at", header: "Time", width: "120px", render: s => <span className="text-xs text-dash-text-muted font-mono">{new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> },
                    ]}
                    onRowClick={s => setSelectedServiceRequest(s)}
                    renderRowActions={s => (
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedServiceRequest(s); }}
                        className="p-1 hover:text-[#EA6639]"
                        title="View Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    )}
                  />
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Screen 8.3: Booking Detail Slide-Over Modal ── */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="p-5 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-dash-surface border border-dash-border flex items-center justify-center font-bold text-dash-text shadow-xs">
                  <User className="w-5 h-5 text-dash-text-muted" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dash-text">{selectedBooking.guest_name}</h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-xs text-dash-text-muted">{selectedBooking.booking_reference}</span>
                    <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${getStatusBadge(selectedBooking.status)}`}>
                      {selectedBooking.status}
                    </span>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-1.5 rounded-lg text-dash-text-muted hover:text-dash-text hover:bg-dash-surface transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
              
              {/* Stay Information Card */}
              <div className="bg-dash-canvas border border-dash-border rounded-xl p-4 space-y-3">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-dash-text-muted">Stay Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-dash-text-muted block text-[10px]">Room Type</span>
                    <span className="font-semibold text-dash-text">{selectedBooking.room_type}</span>
                  </div>
                  <div>
                    <span className="text-dash-text-muted block text-[10px]">Channel Source</span>
                    {getChannelBadge(selectedBooking.channel)}
                  </div>
                  <div>
                    <span className="text-dash-text-muted block text-[10px]">Check-in Date</span>
                    <span className="font-mono font-medium text-dash-text">{selectedBooking.check_in}</span>
                  </div>
                  <div>
                    <span className="text-dash-text-muted block text-[10px]">Check-out Date</span>
                    <span className="font-mono font-medium text-dash-text">{selectedBooking.check_out}</span>
                  </div>
                </div>
              </div>

              {/* Financial & 3% Agency Fee Card */}
              <div className="bg-dash-canvas border border-dash-border rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-dash-text-muted">Payment & Agency Fee</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    {selectedBooking.payment_status || "Paid"}
                  </span>
                </div>
                
                <div className="space-y-2 pt-1 border-t border-dash-border">
                  <div className="flex justify-between items-center">
                    <span className="text-dash-text-sec">Gross Booking Value</span>
                    <span className="font-mono font-bold text-sm text-dash-text">{formatMoney(selectedBooking.total_amount, 2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-[#EA6639]">
                    <span className="flex items-center gap-1">
                      Agency Commission Fee <span className="text-[10px] font-bold px-1 rounded bg-[#EA6639]/10">3%</span>
                    </span>
                    <span className="font-mono font-bold text-sm">
                      {formatMoney(selectedBooking.fee_amount ?? (selectedBooking.total_amount * 0.03), 2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-dash-text-muted pt-2 border-t border-dash-border/60">
                    <span>Payment Gateway</span>
                    <span>{selectedBooking.payment_provider || "Paystack Direct"}</span>
                  </div>
                  {selectedBooking.payment_ref && (
                    <div className="flex justify-between items-center text-dash-text-muted">
                      <span>Transaction Ref</span>
                      <span className="font-mono">{selectedBooking.payment_ref}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Upsells Purchased Card */}
              {selectedBooking.upsells_purchased && selectedBooking.upsells_purchased.length > 0 && (
                <div className="bg-dash-canvas border border-dash-border rounded-xl p-4 space-y-2.5">
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-dash-text-muted">Purchased Upsells & Add-ons</h4>
                  <div className="space-y-1.5 divide-y divide-dash-border">
                    {selectedBooking.upsells_purchased.map((up, idx) => (
                      <div key={idx} className="flex justify-between items-center pt-1.5 first:pt-0">
                        <span className="font-medium text-dash-text">{up.qty}x {up.name}</span>
                        <span className="font-mono font-semibold text-dash-text">{formatMoney(up.price * up.qty, 2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Guest Contact & Messaging Actions */}
              <div className="bg-dash-canvas border border-dash-border rounded-xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-dash-text-muted">Guest Communication</h4>
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  {selectedBooking.guest_phone && (
                    <a 
                      href={`https://wa.me/${selectedBooking.guest_phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" /> Direct WhatsApp
                    </a>
                  )}
                  {selectedBooking.guest_email && (
                    <a 
                      href={`mailto:${selectedBooking.guest_email}`}
                      className="flex-1 px-3 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg font-medium flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5 text-dash-text-muted" /> Email Guest
                    </a>
                  )}
                </div>
              </div>

              {/* Modification History Timeline */}
              <div className="bg-dash-canvas border border-dash-border rounded-xl p-4 space-y-2.5">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-dash-text-muted">Activity & Audit Timeline</h4>
                <div className="space-y-3 pl-2 border-l-2 border-dash-border ml-1">
                  <div className="relative pl-3">
                    <span className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-[#EA6639]"></span>
                    <p className="font-medium text-dash-text">Reservation created via {selectedBooking.channel || 'AI concierge'}</p>
                    <p className="text-[10px] text-dash-text-muted font-mono">{new Date(selectedBooking.created_at).toLocaleString()}</p>
                  </div>
                  {selectedBooking.modification_history?.map((mh, idx) => (
                    <div key={idx} className="relative pl-3">
                      <span className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-dash-border"></span>
                      <p className="font-medium text-dash-text">{mh.note}</p>
                      <p className="text-[10px] text-dash-text-muted font-mono">{mh.timestamp} &bull; {mh.actor}</p>
                    </div>
                  ))}
                  {selectedBooking.status === "Cancelled" && (
                    <div className="relative pl-3">
                      <span className="absolute -left-[11px] top-1 w-2 h-2 rounded-full bg-rose-500"></span>
                      <p className="font-medium text-rose-600">Reservation Cancelled</p>
                      <p className="text-[10px] text-dash-text-muted">Reason: {selectedBooking.cancellation_reason || "Guest Request"}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer / Manager Cancellation */}
            <div className="p-4 border-t border-dash-border bg-dash-canvas flex justify-between items-center gap-3">
              {isManager && selectedBooking.status !== "Cancelled" ? (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="px-3.5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 border border-rose-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Ban className="w-3.5 h-3.5" /> Cancel Reservation
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Booking Confirm Modal (Screen 8.3) ── */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-dash-surface border border-dash-border rounded-xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-dash-text">Cancel Reservation?</h3>
                <p className="text-xs text-dash-text-sec">Ref: {selectedBooking.booking_reference}</p>
              </div>
            </div>

            <p className="text-xs text-dash-text-sec">
              This action will release room holds and update the reservation status to <strong className="text-rose-600">Cancelled</strong>. Please specify the operational reason below:
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Cancellation Reason</label>
                <select
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-rose-500"
                >
                  <option value="Guest Request">Guest Request (Direct Communication)</option>
                  <option value="No-Show">Guest No-Show</option>
                  <option value="Payment Failed / Incomplete">Payment Incomplete / Card Declined</option>
                  <option value="Double Booking / PMS Conflict">Double Booking / PMS Calendar Conflict</option>
                  <option value="Emergency / Weather">Emergency / Severe Weather</option>
                  <option value="Other">Other Operational Reason</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Refund Reference / Notes</label>
                <input
                  type="text"
                  value={cancelRefundNotes}
                  onChange={(e) => setCancelRefundNotes(e.target.value)}
                  placeholder="e.g. REF-829103 or 'Full refund processed via Paystack'"
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-rose-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isProcessingCancel}
                className="px-3.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs font-semibold text-dash-text hover:bg-dash-surface transition-colors"
              >
                Keep Booking
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={isProcessingCancel}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                {isProcessingCancel ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Processing...
                  </>
                ) : (
                  <>
                    <Ban className="w-3.5 h-3.5" /> Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Order Detail Drawer Pane ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <Utensils className="w-4 h-4 text-[#EA6639]" />
                  <span className="font-mono text-xs font-bold text-dash-text">{selectedOrder.session_id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedOrder.session_id);
                    setCopiedId(selectedOrder.session_id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="p-1 rounded hover:bg-dash-surface text-dash-text-muted hover:text-dash-text transition-colors"
                  title="Copy reference"
                >
                  {copiedId === selectedOrder.session_id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Status selector directly in drawer */}
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleUpdateOrderStatus(selectedOrder.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#EA6639] ${getStatusBadge(selectedOrder.status)}`}
                >
                  <option value="Pending">Pending</option>
                  <option value="Preparing">Preparing</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>

                <button 
                  onClick={() => { setSelectedOrder(null); setNewRemarkText(""); }} 
                  className="p-1.5 rounded-lg text-dash-text-muted hover:text-dash-text hover:bg-dash-surface transition-colors"
                  title="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {/* Guest & Room Summary Card */}
              <div className="p-4 bg-dash-canvas rounded-xl border border-dash-border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Guest &amp; Location</span>
                    <h3 className="text-sm font-bold text-dash-text mt-0.5">{selectedOrder.guest_name || "Hotel Guest"}</h3>
                  </div>
                  <span className="text-sm font-bold text-[#EA6639] bg-[#EA6639]/10 border border-[#EA6639]/20 px-2.5 py-0.5 rounded-md font-mono">
                    Room {selectedOrder.room_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dash-border/60 text-dash-text-sec">
                  <div>
                    <span className="text-[10px] text-dash-text-muted block">Channel Origin</span>
                    <span className="mt-1 inline-block">{getChannelBadge(selectedOrder.channel)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dash-text-muted block">Placed At</span>
                    <span className="text-xs font-medium text-dash-text mt-1 block">
                      {new Date(selectedOrder.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <span className="text-[10px] text-dash-text-muted ml-1">({formatTimeAgo(selectedOrder.created_at)})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items & Receipt Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-dash-text-muted uppercase tracking-wider">Itemized Breakdown</h4>
                  <span className="text-[10px] font-mono text-dash-text-muted">{selectedOrder.items?.length || 0} line items</span>
                </div>

                <div className="bg-dash-canvas border border-dash-border rounded-xl p-3.5 space-y-2.5">
                  <div className="divide-y divide-dash-border/80">
                    {selectedOrder.items?.map((item, idx) => {
                      const itemPrice = item.price || 20;
                      return (
                        <div key={idx} className="flex justify-between items-center py-2 first:pt-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded bg-dash-surface flex items-center justify-center font-mono font-bold text-dash-text text-[11px] border border-dash-border">
                              {item.qty}
                            </span>
                            <span className="font-medium text-dash-text">{item.name}</span>
                          </div>
                          <span className="font-mono text-dash-text-sec">{formatMoney(itemPrice * item.qty, 2)}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-2.5 border-t border-dash-border space-y-1 text-dash-text-sec text-[11px]">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-mono">{formatMoney(selectedOrder.total_amount, 2)}</span>
                    </div>
                    {selectedOrder.fee_amount ? (
                      <div className="flex justify-between text-dash-text-muted">
                        <span>Service &amp; Delivery Fee</span>
                        <span className="font-mono">{formatMoney(selectedOrder.fee_amount, 2)}</span>
                      </div>
                    ) : null}
                    <div className="flex justify-between pt-1.5 border-t border-dash-border/60 font-bold text-dash-text text-sm">
                      <span>Total Amount</span>
                      <span className="font-mono text-[#EA6639]">{formatMoney(selectedOrder.total_amount + (selectedOrder.fee_amount || 0), 2)}</span>
                    </div>
                  </div>

                  <div className="p-2 rounded bg-dash-surface border border-dash-border flex justify-between items-center text-[10px] text-dash-text-sec">
                    <span className="flex items-center gap-1 font-medium">
                      <CreditCard className="w-3 h-3 text-dash-text-muted" /> Payment Method:
                    </span>
                    <span className="font-semibold text-dash-text">{selectedOrder.payment_method || `Charged to Room #${selectedOrder.room_number} Folio`}</span>
                  </div>
                </div>
              </div>

              {/* Special Instructions */}
              {selectedOrder.special_instructions && (
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 uppercase flex items-center gap-1">
                    <FileText className="w-3 h-3" /> Guest Special Instructions
                  </span>
                  <p className="text-xs text-amber-900 dark:text-amber-200">{selectedOrder.special_instructions}</p>
                </div>
              )}

              {/* Internal Staff Remarks & Operational Notes Section */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-dash-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    Internal Remarks &amp; Notes
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-dash-canvas border border-dash-border text-dash-text-muted">
                    {selectedOrder.staff_remarks?.length || 0}
                  </span>
                </div>

                {/* Remarks Timeline */}
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {(!selectedOrder.staff_remarks || selectedOrder.staff_remarks.length === 0) ? (
                    <div className="p-3 text-center rounded-lg bg-dash-canvas border border-dashed border-dash-border text-dash-text-muted text-[11px]">
                      No internal remarks recorded yet. Add operational notes below.
                    </div>
                  ) : (
                    selectedOrder.staff_remarks.map((rem) => (
                      <div key={rem.id} className="p-2.5 bg-dash-canvas rounded-lg border border-dash-border space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-dash-text flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-blue-500" /> {rem.author}
                            {rem.role && (
                              <span className="text-[9px] font-normal text-dash-text-muted px-1 rounded bg-dash-surface border border-dash-border">
                                {rem.role}
                              </span>
                            )}
                          </span>
                          <span className="text-dash-text-muted font-mono">{formatTimeAgo(rem.created_at)}</span>
                        </div>
                        <p className="text-xs text-dash-text-sec leading-relaxed">{rem.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Remark Input */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddOrderRemark(selectedOrder.id, newRemarkText);
                  }}
                  className="space-y-2 pt-1"
                >
                  <textarea
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    placeholder="Type internal remark (e.g. 'Food dispatched via Room Service', 'Guest confirmed receipt')..."
                    rows={2}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text placeholder:text-dash-text-muted focus:ring-1 focus:ring-[#EA6639] resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newRemarkText.trim()}
                      className="px-3 py-1.5 bg-[#EA6639] hover:bg-[#EA6639]/90 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Send className="w-3 h-3" /> Add Remark
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-dash-border bg-dash-canvas flex items-center justify-between gap-3">
              <button 
                onClick={() => { setSelectedOrder(null); setNewRemarkText(""); }} 
                className="px-4 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover rounded-lg text-xs font-semibold text-dash-text transition-colors"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {selectedOrder.status === "Pending" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "Preparing")}
                    className="px-4 py-2 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    Start Prep &rarr;
                  </button>
                )}
                {selectedOrder.status === "Preparing" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateOrderStatus(selectedOrder.id, "Completed")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Delivered
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Service Request Detail Drawer Pane ── */}
      {selectedServiceRequest && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <BellRing className="w-4 h-4 text-blue-500" />
                  <span className="font-mono text-xs font-bold text-dash-text">{selectedServiceRequest.session_id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(selectedServiceRequest.session_id);
                    setCopiedId(selectedServiceRequest.session_id);
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="p-1 rounded hover:bg-dash-surface text-dash-text-muted hover:text-dash-text transition-colors"
                  title="Copy reference"
                >
                  {copiedId === selectedServiceRequest.session_id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Status selector directly in drawer */}
                <select
                  value={selectedServiceRequest.status}
                  onChange={(e) => handleUpdateServiceStatus(selectedServiceRequest.id, e.target.value)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 capitalize ${getStatusBadge(selectedServiceRequest.status)}`}
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="completed">Completed</option>
                </select>

                <button 
                  onClick={() => { setSelectedServiceRequest(null); setNewRemarkText(""); }} 
                  className="p-1.5 rounded-lg text-dash-text-muted hover:text-dash-text hover:bg-dash-surface transition-colors"
                  title="Close details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 text-xs">
              {/* Guest & Room Summary Card */}
              <div className="p-4 bg-dash-canvas rounded-xl border border-dash-border space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] text-dash-text-muted uppercase font-bold tracking-wider">Guest &amp; Location</span>
                    <h3 className="text-sm font-bold text-dash-text mt-0.5">{selectedServiceRequest.guest_name || "Hotel Guest"}</h3>
                  </div>
                  <span className="text-sm font-bold text-blue-600 bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 rounded-md font-mono">
                    Room {selectedServiceRequest.room_number}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-dash-border/60 text-dash-text-sec">
                  <div>
                    <span className="text-[10px] text-dash-text-muted block">Channel Origin</span>
                    <span className="mt-1 inline-block">{getChannelBadge(selectedServiceRequest.channel)}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-dash-text-muted block">Requested At</span>
                    <span className="text-xs font-medium text-dash-text mt-1 block">
                      {new Date(selectedServiceRequest.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      <span className="text-[10px] text-dash-text-muted ml-1">({formatTimeAgo(selectedServiceRequest.created_at)})</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Service Details Card */}
              <div className="p-4 bg-dash-canvas border border-dash-border rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-dash-text-muted uppercase tracking-wider">Service Requested</span>
                  {selectedServiceRequest.details?.urgency === "urgent" && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 border border-rose-500/20 text-[10px] font-bold uppercase">
                      Urgent Priority
                    </span>
                  )}
                </div>

                <p className="text-sm font-bold text-dash-text">{selectedServiceRequest.service_type}</p>
                <p className="text-dash-text-sec text-xs leading-relaxed">{selectedServiceRequest.details?.notes || "Digital concierge assistance requested"}</p>

                <div className="pt-2 border-t border-dash-border/60 flex justify-between items-center text-[11px] text-dash-text-sec">
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-500" /> Assigned Staff:
                  </span>
                  <span className="font-semibold text-dash-text">
                    {selectedServiceRequest.assigned_staff || "Front Desk / Guest Services"}
                  </span>
                </div>
              </div>

              {/* Internal Staff Remarks & Operational Notes Section */}
              <div className="space-y-2.5 pt-1">
                <div className="flex justify-between items-center">
                  <h4 className="text-[11px] font-bold text-dash-text-muted uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    Internal Remarks &amp; Resolution Notes
                  </h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-dash-canvas border border-dash-border text-dash-text-muted">
                    {selectedServiceRequest.staff_remarks?.length || 0}
                  </span>
                </div>

                {/* Remarks Timeline */}
                <div className="space-y-2 max-h-44 overflow-y-auto">
                  {(!selectedServiceRequest.staff_remarks || selectedServiceRequest.staff_remarks.length === 0) ? (
                    <div className="p-3 text-center rounded-lg bg-dash-canvas border border-dashed border-dash-border text-dash-text-muted text-[11px]">
                      No operational remarks recorded yet.
                    </div>
                  ) : (
                    selectedServiceRequest.staff_remarks.map((rem) => (
                      <div key={rem.id} className="p-2.5 bg-dash-canvas rounded-lg border border-dash-border space-y-1">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-bold text-dash-text flex items-center gap-1">
                            <User className="w-2.5 h-2.5 text-blue-500" /> {rem.author}
                            {rem.role && (
                              <span className="text-[9px] font-normal text-dash-text-muted px-1 rounded bg-dash-surface border border-dash-border">
                                {rem.role}
                              </span>
                            )}
                          </span>
                          <span className="text-dash-text-muted font-mono">{formatTimeAgo(rem.created_at)}</span>
                        </div>
                        <p className="text-xs text-dash-text-sec leading-relaxed">{rem.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* New Remark Input */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleAddServiceRemark(selectedServiceRequest.id, newRemarkText);
                  }}
                  className="space-y-2 pt-1"
                >
                  <textarea
                    value={newRemarkText}
                    onChange={(e) => setNewRemarkText(e.target.value)}
                    placeholder="Type internal remark (e.g. 'Delivered extra towels to Room 304', 'Guest verified satisfaction')..."
                    rows={2}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text placeholder:text-dash-text-muted focus:ring-1 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newRemarkText.trim()}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Send className="w-3 h-3" /> Add Remark
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Drawer Footer Actions */}
            <div className="p-4 border-t border-dash-border bg-dash-canvas flex items-center justify-between gap-3">
              <button 
                onClick={() => { setSelectedServiceRequest(null); setNewRemarkText(""); }} 
                className="px-4 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover rounded-lg text-xs font-semibold text-dash-text transition-colors"
              >
                Close Drawer
              </button>

              <div className="flex items-center gap-2">
                {selectedServiceRequest.status === "pending" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateServiceStatus(selectedServiceRequest.id, "preparing")}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    Start Request &rarr;
                  </button>
                )}
                {selectedServiceRequest.status === "preparing" && (
                  <button
                    type="button"
                    onClick={() => handleUpdateServiceStatus(selectedServiceRequest.id, "completed")}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
