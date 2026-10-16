import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Bell, 
  X, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  MessageSquare, 
  Star, 
  Calendar, 
  ShieldAlert, 
  Blocks, 
  Trash2, 
  ExternalLink, 
  Clock, 
  Sparkles,
  ChevronRight,
  Filter,
  CheckCircle2
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useSandbox } from "../../context/SandboxDataContext";
import { useToast } from "../../shared/ToastContext";

export interface ConsoleNotification {
  id: string;
  hotel_id?: string;
  user_id?: string;
  type: "guest_escalation" | "negative_feedback" | "channel_alert" | "booking_alert" | "compliance_alert" | "system";
  title: string;
  body: string;
  read: boolean;
  link?: string;
  created_at: string;
  priority?: "urgent" | "normal" | "low";
}

const SANDBOX_SEED_NOTIFICATIONS: ConsoleNotification[] = [
  {
    id: "notif-demo-1",
    type: "guest_escalation",
    title: "Urgent: Human Handoff Requested",
    body: "Guest Marcus Sterling in Villa Penthouse 4 requested front desk assistance regarding late arrival chauffeur transfer.",
    read: false,
    link: "inbox:sess-demo-01",
    created_at: new Date(Date.now() - 15 * 60000).toISOString(),
    priority: "urgent",
  },
  {
    id: "notif-demo-2",
    type: "negative_feedback",
    title: "2★ Detractor Review Escalated",
    body: "Guest Elena Rostova reported room service breakfast delay. Service recovery ticket automatically dispatched to Duty Manager.",
    read: false,
    link: "feedback",
    created_at: new Date(Date.now() - 65 * 60000).toISOString(),
    priority: "urgent",
  },
  {
    id: "notif-demo-3",
    type: "booking_alert",
    title: "New Direct Booking Confirmed",
    body: "David & Sarah Chen confirmed 3 nights in Ocean Executive Suite ($1,350.00). Ever performance fee attributed and folio synced to PMS.",
    read: true,
    link: "bookings",
    created_at: new Date(Date.now() - 3 * 3600000).toISOString(),
    priority: "normal",
  },
  {
    id: "notif-demo-4",
    type: "channel_alert",
    title: "Meta WhatsApp Cloud API Healthy",
    body: "All OpenBSP & Meta WABA webhooks operational. 142 guest concierge sessions routed with sub-second response latency.",
    read: true,
    link: "channels",
    created_at: new Date(Date.now() - 6 * 3600000).toISOString(),
    priority: "normal",
  },
  {
    id: "notif-demo-5",
    type: "compliance_alert",
    title: "DPA Annual Audit Schedule Active",
    body: "Controller-to-Processor agreement binding. All sub-processors verified under GDPR Art. 28 and NDPA schedules.",
    read: true,
    link: "compliance",
    created_at: new Date(Date.now() - 24 * 3600000).toISOString(),
    priority: "low",
  },
];

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, context?: any) => void;
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDrawer({
  isOpen,
  onClose,
  onNavigate,
  onUnreadCountChange,
}: NotificationDrawerProps) {
  const { hotelId, user } = useAuth();
  const { isSandbox } = useSandbox();
  const { showToast } = useToast();

  const [notifications, setNotifications] = useState<ConsoleNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "unread" | "escalations" | "system">("all");

  // Load Notifications
  const loadNotifications = useCallback(async () => {
    if (isSandbox) {
      // Check session cache or fallback to seed
      const cached = sessionStorage.getItem("ever_sandbox_notifications");
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          setNotifications(parsed);
          return;
        } catch (e) {
          // ignore
        }
      }
      setNotifications(SANDBOX_SEED_NOTIFICATIONS);
      sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(SANDBOX_SEED_NOTIFICATIONS));
      return;
    }

    if (!hotelId) return;

    setLoading(true);
    try {
      // 1. Fetch from public.notifications
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(40);

      if (error && error.code !== "PGRST116") {
        console.warn("Notifications table query warning:", error);
      }

      let liveList: ConsoleNotification[] = (data || []).map((row: any) => ({
        id: row.id,
        hotel_id: row.hotel_id,
        user_id: row.user_id,
        type: row.type || "system",
        title: row.title || "Operational Alert",
        body: row.body || "",
        read: Boolean(row.read),
        link: row.link,
        created_at: row.created_at || new Date().toISOString(),
        priority: row.type?.includes("escalation") || row.type?.includes("negative") ? "urgent" : "normal",
      }));

      // 2. Defensive query: check for live open feedback escalations if no notification rows exist
      if (liveList.length === 0) {
        const { data: escalatedFeedback } = await supabase
          .from("feedback")
          .select("id, guest_name, rating, comment, created_at, status")
          .eq("hotel_id", hotelId)
          .eq("status", "escalated")
          .order("created_at", { ascending: false })
          .limit(5);

        if (escalatedFeedback && escalatedFeedback.length > 0) {
          const feedbackNotifs: ConsoleNotification[] = escalatedFeedback.map((f: any) => ({
            id: `live-fb-${f.id}`,
            hotel_id: hotelId,
            type: "negative_feedback",
            title: `${f.rating}★ Escalated Guest Feedback`,
            body: `${f.guest_name || "Guest"}: "${(f.comment || "").slice(0, 100)}..."`,
            read: false,
            link: "feedback",
            created_at: f.created_at,
            priority: "urgent",
          }));
          liveList = [...liveList, ...feedbackNotifs];
        }
      }

      setNotifications(liveList);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Sync Unread Count to Parent Navbar
  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Mark a single notification as read/unread
  const handleToggleRead = async (e: React.MouseEvent, item: ConsoleNotification) => {
    e.stopPropagation();
    const nextRead = !item.read;

    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: nextRead } : n));

    if (isSandbox) {
      const updated = notifications.map(n => n.id === item.id ? { ...n, read: nextRead } : n);
      sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(updated));
      return;
    }

    if (item.id.startsWith("live-fb-")) return; // Virtual notification

    try {
      await supabase.from("notifications").update({ read: nextRead }).eq("id", item.id);
    } catch (err) {
      console.warn("Failed to update notification read status:", err);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

    if (isSandbox) {
      const updated = notifications.map(n => ({ ...n, read: true }));
      sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(updated));
      showToast("All notifications marked as read", "info");
      return;
    }

    if (!hotelId) return;

    try {
      await supabase.from("notifications").update({ read: true }).eq("hotel_id", hotelId);
      showToast("All notifications marked as read", "info");
    } catch (err) {
      console.warn("Failed to mark all notifications as read:", err);
    }
  };

  // Clear single notification
  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotifications(prev => prev.filter(n => n.id !== id));

    if (isSandbox) {
      const updated = notifications.filter(n => n.id !== id);
      sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(updated));
      return;
    }

    if (id.startsWith("live-fb-")) return;

    try {
      await supabase.from("notifications").delete().eq("id", id);
    } catch (err) {
      console.warn("Failed to delete notification:", err);
    }
  };

  // Clear all read notifications
  const handleClearRead = async () => {
    const unreadOnly = notifications.filter(n => !n.read);
    setNotifications(unreadOnly);

    if (isSandbox) {
      sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(unreadOnly));
      showToast("Cleared read notifications", "info");
      return;
    }

    if (!hotelId) return;

    try {
      await supabase.from("notifications").delete().eq("hotel_id", hotelId).eq("read", true);
      showToast("Cleared read notifications", "info");
    } catch (err) {
      console.warn("Failed to clear read notifications:", err);
    }
  };

  // Deep Link Navigation Handler
  const handleItemClick = (item: ConsoleNotification) => {
    // Automatically mark as read
    if (!item.read) {
      setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
      if (isSandbox) {
        const updated = notifications.map(n => n.id === item.id ? { ...n, read: true } : n);
        sessionStorage.setItem("ever_sandbox_notifications", JSON.stringify(updated));
      } else if (!item.id.startsWith("live-fb-")) {
        supabase.from("notifications").update({ read: true }).eq("id", item.id);
      }
    }

    if (item.link) {
      if (item.link.startsWith("inbox:")) {
        const sessionId = item.link.split(":")[1];
        onNavigate("inbox", { sessionId });
      } else {
        onNavigate(item.link);
      }
      onClose();
    }
  };

  // Filtered Notifications
  const filteredNotifications = useMemo(() => {
    return notifications.filter(item => {
      if (filter === "unread" && item.read) return false;
      if (filter === "escalations" && item.type !== "guest_escalation" && item.type !== "negative_feedback") return false;
      if (filter === "system" && (item.type === "guest_escalation" || item.type === "negative_feedback")) return false;
      return true;
    });
  }, [notifications, filter]);

  // Format Relative Timestamp
  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Notification Icon & Accent Resolver
  const getNotificationIcon = (type: string, priority?: string) => {
    switch (type) {
      case "guest_escalation":
        return {
          icon: ShieldAlert,
          bg: "bg-red-50 dark:bg-red-500/10",
          text: "text-red-600 dark:text-red-400",
          border: "border-red-200 dark:border-red-500/30",
        };
      case "negative_feedback":
        return {
          icon: Star,
          bg: "bg-amber-50 dark:bg-amber-500/10",
          text: "text-amber-600 dark:text-amber-400",
          border: "border-amber-200 dark:border-amber-500/30",
        };
      case "booking_alert":
        return {
          icon: Calendar,
          bg: "bg-emerald-50 dark:bg-emerald-500/10",
          text: "text-emerald-600 dark:text-emerald-400",
          border: "border-emerald-200 dark:border-emerald-500/30",
        };
      case "channel_alert":
        return {
          icon: Blocks,
          bg: "bg-blue-50 dark:bg-blue-500/10",
          text: "text-blue-600 dark:text-blue-400",
          border: "border-blue-200 dark:border-blue-500/30",
        };
      case "compliance_alert":
        return {
          icon: Clock,
          bg: "bg-purple-50 dark:bg-purple-500/10",
          text: "text-purple-600 dark:text-purple-400",
          border: "border-purple-200 dark:border-purple-500/30",
        };
      default:
        return {
          icon: Bell,
          bg: "bg-dash-surface-raised",
          text: "text-[#EA6639]",
          border: "border-dash-border",
        };
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs z-[65] animate-in fade-in duration-150"
      />

      {/* Slide-out Drawer Panel */}
      <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-dash-surface z-[70] border-l border-dash-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 border-b border-dash-border flex items-center justify-between shrink-0 bg-dash-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center text-[#EA6639]">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-dash-text text-sm">Notification Centre</h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#EA6639] text-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-dash-text-muted mt-0.5">Live guest escalations &amp; system alerts</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] text-dash-text-sec hover:text-[#EA6639] p-1.5 rounded transition-colors flex items-center gap-1 font-medium"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mark read</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-dash-text-muted hover:text-dash-text rounded hover:bg-dash-surface-hover transition-colors"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter Tabs Bar */}
        <div className="px-4 py-2 border-b border-dash-border-hairline bg-dash-canvas/40 flex items-center gap-1.5 shrink-0 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setFilter("all")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
              filter === "all" ? "bg-[#EA6639] text-white shadow-xs" : "text-dash-text-sec hover:bg-dash-surface border border-dash-border/60"
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setFilter("unread")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
              filter === "unread" ? "bg-[#EA6639] text-white shadow-xs" : "text-dash-text-sec hover:bg-dash-surface border border-dash-border/60"
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setFilter("escalations")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
              filter === "escalations" ? "bg-red-600 text-white shadow-xs" : "text-dash-text-sec hover:bg-dash-surface border border-dash-border/60"
            }`}
          >
            Escalations
          </button>
          <button
            onClick={() => setFilter("system")}
            className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors shrink-0 ${
              filter === "system" ? "bg-blue-600 text-white shadow-xs" : "text-dash-text-sec hover:bg-dash-surface border border-dash-border/60"
            }`}
          >
            Channels &amp; Folios
          </button>
        </div>

        {/* Notification List Body */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-48 text-dash-text-muted gap-2 text-xs">
              <span className="w-5 h-5 rounded-full border-2 border-[#EA6639] border-t-transparent animate-spin" />
              <span>Fetching live alerts...</span>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center px-4">
              <div className="w-12 h-12 rounded-full bg-dash-surface-raised border border-dash-border flex items-center justify-center text-emerald-500 mb-3 shadow-xs">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-xs font-semibold text-dash-text">All Clear</h4>
              <p className="text-[11px] text-dash-text-muted mt-1 max-w-xs leading-relaxed">
                {filter === "unread" 
                  ? "You have caught up with all incoming alerts." 
                  : "No unresolved alerts or guest escalations pending."}
              </p>
            </div>
          ) : (
            filteredNotifications.map(item => {
              const { icon: ItemIcon, bg, text, border } = getNotificationIcon(item.type, item.priority);

              return (
                <div
                  key={item.id}
                  onClick={() => handleItemClick(item)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer group relative ${
                    item.read
                      ? "bg-dash-surface hover:bg-dash-surface-hover/70 border-dash-border text-dash-text-sec"
                      : "bg-[#EA6639]/[0.03] hover:bg-[#EA6639]/[0.06] border-[#EA6639]/30 text-dash-text shadow-xs"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Category Icon */}
                    <div className={`w-8 h-8 rounded-lg ${bg} ${border} border flex items-center justify-center shrink-0 ${text}`}>
                      <ItemIcon className="w-4 h-4" />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="font-semibold text-xs text-dash-text truncate">
                          {item.title}
                        </span>
                        {!item.read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EA6639] shrink-0" />
                        )}
                      </div>

                      <p className="text-[11px] text-dash-text-sec leading-relaxed line-clamp-2">
                        {item.body}
                      </p>

                      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-dash-border-hairline text-[10px] text-dash-text-muted">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(item.created_at)}
                        </span>

                        {item.link && (
                          <span className="flex items-center gap-1 text-[#EA6639] font-medium group-hover:underline">
                            Action deep-link <ChevronRight className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Mark Read & Dismiss Buttons */}
                    <div className="absolute right-2.5 top-2.5 flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleRead(e, item)}
                        className={`p-1 rounded hover:bg-dash-surface-raised transition-colors ${
                          item.read ? "text-dash-text-muted" : "text-[#EA6639]"
                        }`}
                        title={item.read ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={(e) => handleDismiss(e, item.id)}
                        className="p-1 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors"
                        title="Dismiss notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-3 border-t border-dash-border bg-dash-surface shrink-0 flex items-center justify-between text-[11px] text-dash-text-muted">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Real-time notifications active</span>
          </div>
          {notifications.some(n => n.read) && (
            <button
              onClick={handleClearRead}
              className="text-dash-text-sec hover:text-red-500 transition-colors"
            >
              Clear read
            </button>
          )}
        </div>

      </div>
    </>
  );
}
