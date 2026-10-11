import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  TrendingUp, Users, MessageSquare, AlertCircle,
  Activity, Star, RefreshCw, ArrowRight, Zap, Clock,
  CheckCircle2, Calendar, ShieldCheck, Sparkles, AlertTriangle,
  ArrowRightLeft, Radio
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, CartesianGrid, PieChart, Pie
} from "recharts";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { DateRangePicker, DateRangeValue, getDateRangeFromPreset } from "../../../shared/DateRangePicker";
import { StatusChip } from "./InboxTab";

// ─── Types ────────────────────────────────────────────────────────────────────
interface KPI {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  sub?: string;
  onClick?: () => void;
  pulse?: boolean;
}

interface HandoffEntry {
  id: string;
  session_id: string;
  guest_name?: string | null;
  reason: string;
  channel: string;
  status: string | null;
  created_at: string;
}

interface MessagePoint {
  day: string;
  messages: number;
  handoffs: number;
}

interface LeadFunnelPoint {
  stage: string;
  count: number;
  color: string;
}

interface ChannelBreakdownPoint {
  name: string;
  value: number;
  color: string;
  percentage: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function channelLabel(ch: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp", widget: "Web Widget",
    instagram: "Instagram", facebook: "Facebook", tawkto: "Tawk.to"
  };
  return map[ch] ?? ch ?? "Direct";
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dash-surface border border-dash-border rounded-xl px-3 py-2 text-xs shadow-xl backdrop-blur-md">
      {label && <p className="font-bold text-dash-text mb-1">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color || p.payload?.color || "#EA6639" }} className="font-semibold flex items-center justify-between gap-3">
          <span>{p.name}:</span>
          <span>{p.value}</span>
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-dash-surface-raised rounded-lg ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardTab({ onNavigate }: { onNavigate?: (tab: string, context?: any) => void }) {
  const { user, hotelId } = useAuth();
  const { isSandbox, data: sandboxData } = useSandbox();

  // Date Range state (defaults to last 30 days)
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getDateRangeFromPreset("30d"));

  // KPI state
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [botResolutionRate, setBotResolutionRate] = useState<number | null>(null);
  const [handoffRate, setHandoffRate] = useState<number | null>(null);
  const [openHandoffsCount, setOpenHandoffsCount] = useState<number>(0);
  const [activeStaffCount, setActiveStaffCount] = useState<number>(0);
  const [avgResponseMs, setAvgResponseMs] = useState<number | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [feedbackCount, setFeedbackCount] = useState<number>(0);
  const [totalBookings, setTotalBookings] = useState<number | null>(null);

  // Bot Health
  const [lastActivityAt, setLastActivityAt] = useState<Date | null>(null);

  // Charts state
  const [messageChart, setMessageChart] = useState<MessagePoint[]>([]);
  const [funnelData, setFunnelData] = useState<LeadFunnelPoint[]>([]);
  const [channelBreakdown, setChannelBreakdown] = useState<ChannelBreakdownPoint[]>([]);

  // Feed state
  const [recentHandoffs, setRecentHandoffs] = useState<HandoffEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  // Real-time Bot health evaluation
  const botHealth = useMemo(() => {
    if (!lastActivityAt) return { status: "unknown", label: "No Activity", color: "bg-zinc-400", pulse: false };
    const diffHours = (Date.now() - lastActivityAt.getTime()) / (1000 * 60 * 60);
    if (diffHours < 2) {
      return { status: "healthy", label: `Bot Active (${relativeTime(lastActivityAt.toISOString())})`, color: "bg-emerald-500", pulse: true };
    } else if (diffHours < 24) {
      return { status: "idle", label: `Bot Idle (${relativeTime(lastActivityAt.toISOString())})`, color: "bg-amber-500", pulse: false };
    } else {
      return { status: "inactive", label: "No Recent Inquiries", color: "bg-zinc-400", pulse: false };
    }
  }, [lastActivityAt]);

  const fetchAll = useCallback(async () => {
    if (!hotelId) return;
    setRefreshing(true);

    try {
      if (isSandbox && sandboxData) {
        // Read correlated data from SandboxDataContext
        const ad = sandboxData.analyticsData || [];
        const start = new Date(dateRange.startDate).getTime();
        const end = new Date(dateRange.endDate).getTime();

        const filteredDays = ad.filter(d => {
          const t = new Date(d.date).getTime();
          return t >= start && t <= end;
        });

        const activeDays = filteredDays.length > 0 ? filteredDays : ad.slice(-1);

        let msgCount = 0;
        let handoffCount = 0;
        let totalFeedback = 0;
        let fCount = 0;

        activeDays.forEach(d => {
          msgCount += d.totalVolume;
          handoffCount += d.staffVolume;
          if (d.feedbackScore) {
            totalFeedback += d.feedbackScore;
            fCount++;
          }
        });

        const hRate = msgCount > 0 ? Math.round((handoffCount / msgCount) * 100) : 0;
        const resRate = Math.max(0, 100 - hRate);
        const avgRating = fCount > 0 ? totalFeedback / fCount : 4.8;

        // Correlate leads with selected date range
        const rangeLeads = (sandboxData.leads || []).filter(l => {
          const t = new Date(l.created_at).getTime();
          return t >= start && t <= end;
        });
        const activeLeads = rangeLeads.length > 0 ? rangeLeads : sandboxData.leads.slice(0, Math.max(2, Math.min(sandboxData.leads.length, Math.round(activeDays.length * 1.5))));

        // Correlate bookings with selected date range
        const rangeBookings = (sandboxData.bookings || []).filter(b => {
          const t = new Date(b.created_at || b.check_in).getTime();
          return t >= start && t <= end;
        });
        const activeBookingsCount = rangeBookings.length > 0 
          ? rangeBookings.length 
          : Math.max(1, Math.min(sandboxData.bookings.length, Math.round(activeDays.length * 0.45)));

        const openCount = sandboxData.conversations.filter(s => s.handoff_status === "open").length;
        const activeCount = sandboxData.conversations.filter(s => s.handoff_status === "active" || s.handoff_status === "transferred").length;

        setTotalMessages(msgCount);
        setTotalLeads(activeLeads.length);
        setHandoffRate(hRate);
        setBotResolutionRate(resRate);
        setOpenHandoffsCount(openCount);
        setActiveStaffCount(activeCount);
        setAvgResponseMs(1450); // 1.45s avg AI response
        setFeedbackScore(Math.round(avgRating * 10) / 10);
        setFeedbackCount(fCount || Math.max(2, Math.round(activeDays.length * 0.4)));
        setTotalBookings(activeBookingsCount);
        setLastActivityAt(new Date(Date.now() - 3 * 60 * 1000)); // 3m ago

        // Recent handoff requests with unified status chips
        setRecentHandoffs(
          sandboxData.conversations
            .filter(s => s.handoff_status === "open" || s.handoff_status === "active" || s.handoff_status === "transferred" || s.handoff_status === "escalated")
            .map(s => ({
              id: s.session_id,
              session_id: s.session_id,
              guest_name: s.guest_name,
              reason: s.last_message || "Guest requested front-desk support",
              channel: s.channel,
              status: s.handoff_status,
              created_at: s.last_message_at
            }))
            .slice(0, 8)
        );

        // Correlated Lead Funnel
        const enquired = activeLeads.length;
        const captured = activeLeads.filter(l => l.status !== null && l.status !== "new").length;
        const contacted = activeLeads.filter(l => ["contacted", "booked"].includes(l.status ?? "")).length;
        const booked = activeLeads.filter(l => l.status === "booked").length;
        const lost = activeLeads.filter(l => l.status === "lost").length;

        setFunnelData([
          { stage: "Enquired", count: enquired, color: "#EA6639" },
          { stage: "Captured", count: captured, color: "#f97316" },
          { stage: "Contacted", count: contacted, color: "#7C3AED" },
          { stage: "Booked", count: booked, color: "#3ECF8E" },
          { stage: "Lost", count: lost, color: "#ef4444" }
        ]);

        // Correlated Channel Breakdown Donut
        const totalConv = sandboxData.conversations.length || 1;
        const channelsCount: Record<string, number> = {};
        sandboxData.conversations.forEach(c => {
          channelsCount[c.channel] = (channelsCount[c.channel] || 0) + 1;
        });

        const colorMap: Record<string, string> = {
          whatsapp: "#25D366",
          widget: "#EA6639",
          instagram: "#E1306C",
          facebook: "#1877F2",
          tawkto: "#03A84E"
        };

        const channelPoints: ChannelBreakdownPoint[] = Object.keys(channelsCount).map(ch => ({
          name: channelLabel(ch),
          value: channelsCount[ch],
          color: colorMap[ch] || "#8884d8",
          percentage: Math.round((channelsCount[ch] / totalConv) * 100)
        }));

        setChannelBreakdown(channelPoints.length ? channelPoints : [
          { name: "Web Widget", value: 45, color: "#EA6639", percentage: 55 },
          { name: "WhatsApp", value: 30, color: "#25D366", percentage: 35 },
          { name: "Instagram", value: 10, color: "#E1306C", percentage: 10 }
        ]);

        // Message Trend Chart across date range
        let chartPoints = activeDays;
        if (activeDays.length > 31) {
          const step = Math.ceil(activeDays.length / 20);
          chartPoints = activeDays.filter((_, idx) => idx % step === 0 || idx === activeDays.length - 1);
        }

        setMessageChart(chartPoints.map(d => ({
          day: activeDays.length <= 7
            ? new Date(d.date).toLocaleDateString("en-US", { weekday: "short" })
            : d.displayDate || new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          messages: d.totalVolume,
          handoffs: d.staffVolume
        })));

        setLoading(false);
        setRefreshing(false);
        setLastRefreshed(new Date());
        return;
      }

      // ── Live Supabase Production Queries ───────────────────────────────────
      const startDateIso = dateRange.startDate;
      const endDateIso = dateRange.endDate;

      const [
        messagesRes, leadsRes, handoffsRes, openHandoffsRes, activeHandoffsRes,
        feedbackRes, recentHandoffsRes, bookingsRes
      ] = await Promise.all([
        supabase
          .from("message_events")
          .select("id, response_ms, created_at")
          .eq("hotel_id", hotelId)
          .gte("created_at", startDateIso)
          .lte("created_at", endDateIso),

        supabase
          .from("leads")
          .select("id, status, created_at")
          .eq("hotel_id", hotelId)
          .gte("created_at", startDateIso)
          .lte("created_at", endDateIso),

        supabase
          .from("handoff_sessions")
          .select("id, created_at, status")
          .eq("hotel_id", hotelId)
          .gte("created_at", startDateIso)
          .lte("created_at", endDateIso),

        supabase
          .from("handoff_sessions")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .eq("status", "open"),

        supabase
          .from("handoff_sessions")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .in("status", ["active", "transferred"]),

        supabase
          .from("feedback")
          .select("rating")
          .eq("hotel_id", hotelId)
          .gte("created_at", startDateIso)
          .lte("created_at", endDateIso)
          .not("rating", "is", null),

        supabase
          .from("handoff_sessions")
          .select("id, session_id, reason, channel, status, created_at")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false })
          .limit(8),

        supabase
          .from("bookings")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .gte("created_at", startDateIso)
          .lte("created_at", endDateIso)
      ]);

      const messages = messagesRes.data ?? [];
      const msgCount = messages.length;
      const handoffs = handoffsRes.data ?? [];
      const handoffCount = handoffs.length;

      const hRate = msgCount > 0 ? Math.round((handoffCount / msgCount) * 100) : 0;
      const resRate = Math.max(0, 100 - hRate);

      const avgMs = messages.length
        ? messages.reduce((acc, r) => acc + (r.response_ms ?? 0), 0) / messages.length
        : 0;

      const feedbackData = feedbackRes.data ?? [];
      const avgRating = feedbackData.length
        ? feedbackData.reduce((acc, r) => acc + (r.rating ?? 0), 0) / feedbackData.length
        : null;

      // Last activity time
      if (messages.length > 0) {
        const sorted = [...messages].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setLastActivityAt(new Date(sorted[0].created_at));
      } else {
        setLastActivityAt(null);
      }

      setTotalMessages(msgCount);
      setTotalLeads(leadsRes.data?.length ?? 0);
      setHandoffRate(hRate);
      setBotResolutionRate(resRate);
      setOpenHandoffsCount(openHandoffsRes.count ?? 0);
      setActiveStaffCount(activeHandoffsRes.count ?? 0);
      setAvgResponseMs(Math.round(avgMs));
      setFeedbackScore(avgRating !== null ? Math.round(avgRating * 10) / 10 : null);
      setFeedbackCount(feedbackData.length);
      setTotalBookings(bookingsRes.count ?? 0);

      // Recent handoffs feed
      setRecentHandoffs((recentHandoffsRes.data ?? []) as HandoffEntry[]);

      // Funnel from leads
      const leads = leadsRes.data ?? [];
      const enquired = leads.length;
      const captured = leads.filter(l => l.status !== null && l.status !== "new").length;
      const contacted = leads.filter(l => ["contacted", "booked"].includes(l.status ?? "")).length;
      const booked = leads.filter(l => l.status === "booked").length;
      const lost = leads.filter(l => l.status === "lost").length;

      setFunnelData([
        { stage: "Enquired", count: enquired, color: "#EA6639" },
        { stage: "Captured", count: captured, color: "#f97316" },
        { stage: "Contacted", count: contacted, color: "#7C3AED" },
        { stage: "Booked", count: booked, color: "#3ECF8E" },
        { stage: "Lost", count: lost, color: "#ef4444" }
      ]);

      // Message Trend Chart across selected date range
      const startD = new Date(startDateIso);
      const endD = new Date(endDateIso);
      const totalSpanDays = Math.max(1, Math.min(90, Math.round((endD.getTime() - startD.getTime()) / 86400000) + 1));
      const days = Array.from({ length: totalSpanDays }, (_, i) => {
        const d = new Date(startD);
        d.setDate(d.getDate() + i);
        return d.toISOString().split("T")[0];
      });

      const msgByDay: Record<string, number> = {};
      const hndByDay: Record<string, number> = {};
      days.forEach(d => { msgByDay[d] = 0; hndByDay[d] = 0; });

      messages.forEach(r => {
        const day = r.created_at.split("T")[0];
        if (msgByDay[day] !== undefined) msgByDay[day]++;
      });
      handoffs.forEach(r => {
        const day = r.created_at.split("T")[0];
        if (hndByDay[day] !== undefined) hndByDay[day]++;
      });

      let liveChartDays = days;
      if (days.length > 31) {
        const step = Math.ceil(days.length / 20);
        liveChartDays = days.filter((_, idx) => idx % step === 0 || idx === days.length - 1);
      }

      setMessageChart(liveChartDays.map(d => ({
        day: days.length <= 7 
          ? new Date(d).toLocaleDateString("en-US", { weekday: "short" })
          : new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        messages: msgByDay[d] || 0,
        handoffs: hndByDay[d] || 0
      })));

      // Channel Breakdown
      const convRes = await supabase
        .from("conversations")
        .select("channel")
        .eq("client_id", hotelId);

      const convList = convRes.data ?? [];
      const totalC = convList.length || 1;
      const counts: Record<string, number> = {};
      convList.forEach(c => {
        const ch = c.channel || "widget";
        counts[ch] = (counts[ch] || 0) + 1;
      });

      const colorMap: Record<string, string> = {
        whatsapp: "#25D366",
        widget: "#EA6639",
        instagram: "#E1306C",
        facebook: "#1877F2",
        tawkto: "#03A84E"
      };

      const breakdownPoints = Object.keys(counts).map(ch => ({
        name: channelLabel(ch),
        value: counts[ch],
        color: colorMap[ch] || "#8884d8",
        percentage: Math.round((counts[ch] / totalC) * 100)
      }));

      setChannelBreakdown(breakdownPoints);

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefreshed(new Date());
    }
  }, [hotelId, isSandbox, sandboxData, dateRange]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Supabase Realtime Subscriptions
  useEffect(() => {
    if (!hotelId || isSandbox) return;
    const channel = supabase
      .channel("dashboard-realtime-live")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "handoff_sessions",
        filter: `hotel_id=eq.${hotelId}`
      }, () => {
        fetchAll();
      })
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "conversations",
        filter: `client_id=eq.${hotelId}`
      }, () => {
        fetchAll();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [hotelId, isSandbox, fetchAll]);

  // ─── 8 Clickable KPI card definitions ──────────────────────────────────────
  const totalActiveLive = openHandoffsCount + activeStaffCount;

  const kpis: KPI[] = [
    {
      label: "Total Messages",
      value: loading ? "—" : (totalMessages ?? 0).toLocaleString(),
      trend: dateRange.label,
      trendUp: true,
      icon: MessageSquare,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Leads Captured",
      value: loading ? "—" : (totalLeads ?? 0).toLocaleString(),
      trend: "All contacts",
      trendUp: true,
      icon: Users,
      onClick: () => onNavigate?.("crm")
    },
    {
      label: "Bot Resolution Rate",
      value: loading ? "—" : `${botResolutionRate ?? 0}%`,
      trend: (botResolutionRate ?? 0) >= 80 ? "High automation" : "Review triggers",
      trendUp: (botResolutionRate ?? 0) >= 80,
      icon: ShieldCheck,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Handoff Rate",
      value: loading ? "—" : `${handoffRate ?? 0}%`,
      trend: handoffRate !== null && handoffRate > 15 ? "Needs staff attention" : "Optimal range",
      trendUp: (handoffRate ?? 0) <= 15,
      icon: handoffRate !== null && handoffRate > 15 ? AlertCircle : TrendingUp,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Active Live Sessions",
      value: loading ? "—" : totalActiveLive,
      trend: openHandoffsCount > 0 ? `⚠️ ${openHandoffsCount} awaiting staff` : activeStaffCount > 0 ? `🔵 ${activeStaffCount} staff active` : "No open queues",
      trendUp: openHandoffsCount === 0,
      icon: Activity,
      sub: openHandoffsCount > 0 ? "⚠️ Handoff" : activeStaffCount > 0 ? "🔴 Live" : undefined,
      pulse: openHandoffsCount > 0,
      onClick: () => onNavigate?.("inbox")
    },
    {
      label: "Avg Bot Response",
      value: loading ? "—" : avgResponseMs ? `${(avgResponseMs / 1000).toFixed(1)}s` : "< 1.5s",
      trend: "Sub-second AI replies",
      trendUp: true,
      icon: Clock,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Guest Feedback",
      value: loading ? "—" : feedbackScore !== null ? `${feedbackScore} / 5` : "4.8 / 5",
      trend: feedbackCount > 0 ? `${feedbackCount} verified reviews` : "Positive sentiment",
      trendUp: (feedbackScore ?? 0) >= 4,
      icon: Star,
      onClick: () => onNavigate?.("feedback")
    },
    {
      label: "Direct Bookings",
      value: loading ? "—" : (totalBookings ?? 0).toLocaleString(),
      trend: "Level 2 PMS active",
      trendUp: true,
      icon: Calendar,
      onClick: () => onNavigate?.("bookings")
    }
  ];

  const isEmptyAccount = !loading && totalMessages === 0 && totalLeads === 0;

  return (
    <div className="p-4 md:p-6 space-y-6 dashboard-interactive animate-in fade-in duration-200">

      {/* ── Page Header & Bot Health Indicator ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-1">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-header font-bold text-dash-text">Dashboard</h2>
            
            {/* Bot Health Status Indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dash-surface border border-dash-border shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                {botHealth.pulse && (
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${botHealth.color} opacity-75`} />
                )}
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${botHealth.color}`} />
              </span>
              <span className="text-xs font-semibold text-dash-text">{botHealth.label}</span>
            </div>
          </div>
          <p className="text-body text-dash-text-sec mt-0.5">
            Real-time overview of AI concierge performance, active guest handoffs, and lead pipeline.
          </p>
        </div>

        {/* Action Controls & Shared Date Picker */}
        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border hover:border-dash-border-hover rounded-md text-xs font-medium text-dash-text flex items-center gap-1.5 transition-colors shadow-sm"
            title="Refresh dashboard data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <button
            onClick={() => onNavigate?.("inbox")}
            className="dashboard-btn compact-touch-target h-8 px-3.5 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Zap className="w-3.5 h-3.5" />
            Live Inbox
          </button>
        </div>
      </div>

      {/* ── Empty State for New / Unconfigured Accounts ── */}
      {isEmptyAccount && (
        <div className="p-6 bg-gradient-to-r from-[#EA6639]/10 via-[#EA6639]/5 to-transparent border border-[#EA6639]/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#EA6639]" />
              <h3 className="text-sm font-bold text-dash-text">Welcome to Your AI Concierge Cockpit</h3>
            </div>
            <p className="text-xs text-dash-text-sec max-w-xl">
              Connect your website widget or WhatsApp channel to begin answering guest questions 24/7 and capturing qualified booking leads automatically.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onNavigate?.("channels")}
              className="px-4 py-2 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-semibold shadow transition-colors flex items-center gap-1.5"
            >
              Connect Channels <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── 8 Clickable KPI Cards Grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
        {kpis.map((kpi, i) => (
          <button
            key={i}
            onClick={kpi.onClick}
            className={`bg-dash-surface p-3.5 rounded-xl border transition-all text-left flex flex-col justify-between group hover:shadow-md cursor-pointer ${
              kpi.pulse
                ? "border-red-500/60 ring-1 ring-red-500/30 bg-red-500/[0.03]"
                : "border-dash-border hover:border-[#EA6639]/50"
            }`}
          >
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-[11px] font-medium text-dash-text-sec leading-tight truncate">{kpi.label}</span>
              <kpi.icon className={`w-3.5 h-3.5 shrink-0 transition-colors ${kpi.pulse ? "text-red-500 animate-pulse" : "text-dash-text-muted group-hover:text-[#EA6639]"}`} />
            </div>

            <div>
              {loading ? (
                <Skeleton className="h-6 w-14 mb-1" />
              ) : (
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="text-lg font-black text-dash-text tracking-tight">{kpi.value}</span>
                  {kpi.sub && (
                    <span className="text-[10px] font-bold text-red-500 animate-pulse">{kpi.sub}</span>
                  )}
                </div>
              )}
              <span className={`text-[10px] font-medium block truncate ${kpi.trendUp ? "text-emerald-500" : "text-amber-500"}`}>
                {kpi.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Charts Grid: 3-Column Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        {/* 1. Message Volume Area Chart (6 cols) */}
        <div className="lg:col-span-6 bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-section font-semibold text-dash-text">Message &amp; Handoff Activity</h3>
              <p className="text-[11px] text-dash-text-sec">Automated AI replies vs human receptionist takeovers</p>
            </div>
            <button
              onClick={() => onNavigate?.("analytics")}
              className="text-xs text-[#EA6639] hover:underline font-medium flex items-center gap-1 shrink-0"
            >
              Analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : messageChart.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center border-2 border-dashed border-dash-border rounded-lg p-4">
              <MessageSquare className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-xs text-dash-text-sec font-medium">No message activity during this period.</p>
              <p className="text-[11px] text-dash-text-muted mt-0.5">Real-time interactions will populate here automatically.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={messageChart} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA6639" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#EA6639" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorHandoffs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="messages" name="Bot Messages" stroke="#EA6639" strokeWidth={2} fill="url(#colorMsgs)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="handoffs" name="Staff Handoffs" stroke="#7C3AED" strokeWidth={2} fill="url(#colorHandoffs)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 2. Channel Breakdown Donut Chart (3 cols) */}
        <div className="lg:col-span-3 bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-section font-semibold text-dash-text">Channels</h3>
              <p className="text-[11px] text-dash-text-sec">Traffic by connected platform</p>
            </div>
            <button
              onClick={() => onNavigate?.("channels")}
              className="text-xs text-[#EA6639] hover:underline font-medium flex items-center gap-1 shrink-0"
            >
              Config <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : channelBreakdown.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center border-2 border-dashed border-dash-border rounded-lg p-4">
              <Zap className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-xs text-dash-text-sec">No active channels.</p>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center relative">
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={channelBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {channelBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend with percentages */}
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-1 text-[11px]">
                {channelBreakdown.map((ch, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ch.color }} />
                    <span className="text-dash-text-sec">{ch.name}</span>
                    <span className="font-bold text-dash-text">{ch.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 3. Lead Conversion Funnel (3 cols) */}
        <div className="lg:col-span-3 bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border flex flex-col justify-between shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-section font-semibold text-dash-text">Lead Pipeline</h3>
              <p className="text-[11px] text-dash-text-sec">Guest conversion stages</p>
            </div>
            <button
              onClick={() => onNavigate?.("crm")}
              className="text-xs text-[#EA6639] hover:underline font-medium flex items-center gap-1 shrink-0"
            >
              CRM <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : funnelData.every(d => d.count === 0) ? (
            <div className="h-56 flex flex-col items-center justify-center text-center border-2 border-dashed border-dash-border rounded-lg p-4">
              <Users className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-xs text-dash-text-sec">No lead data recorded yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={funnelData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" strokeOpacity={0.6} vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Guests" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Handoffs & Live Activity Feed with Unified StatusChips ── */}
      <div className="bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-section font-semibold text-dash-text">Recent Staff Handoff Requests</h3>
            <p className="text-[11px] text-dash-text-sec">Conversations where guests requested human front-desk assistance</p>
          </div>
          <button
            onClick={() => onNavigate?.("inbox")}
            className="dashboard-btn compact-touch-target text-xs text-[#EA6639] hover:underline font-semibold flex items-center gap-1"
          >
            Open Live Inbox <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 w-full" />)}
          </div>
        ) : recentHandoffs.length === 0 ? (
          <div className="py-8 flex flex-col items-center text-center border-2 border-dashed border-dash-border rounded-lg">
            <CheckCircle2 className="w-8 h-8 text-emerald-500/80 mb-2" />
            <p className="text-xs text-dash-text font-semibold">No pending handoff requests!</p>
            <p className="text-[11px] text-dash-text-muted mt-0.5 max-w-sm">
              Your AI agent is currently handling 100% of guest inquiries autonomously.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentHandoffs.map((h) => (
              <button
                key={h.id}
                onClick={() => onNavigate?.("inbox", { sessionId: h.session_id })}
                className="p-3.5 bg-dash-canvas hover:bg-dash-surface-raised rounded-xl border border-dash-border hover:border-[#EA6639]/40 text-left transition-all group flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="flex justify-between items-start mb-1.5 gap-2">
                    <span className="text-xs font-bold text-dash-text truncate group-hover:text-[#EA6639] transition-colors">
                      {h.guest_name || "Guest " + h.session_id.slice(0, 6)}
                    </span>
                    <span className="text-[10px] text-dash-text-muted whitespace-nowrap">
                      {relativeTime(h.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-dash-text-sec line-clamp-1 mb-2">
                    {h.reason || "Human assistance requested"}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-1 pt-1 border-t border-dash-border-hairline">
                  <StatusChip status={h.status} />
                  <span className="text-[10px] text-[#EA6639] font-semibold flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    Join chat <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
