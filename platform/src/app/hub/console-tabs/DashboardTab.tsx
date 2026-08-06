import React, { useEffect, useState, useCallback } from "react";
import {
  TrendingUp, TrendingDown, Users, MessageSquare, AlertCircle,
  Activity, Star, RefreshCw, ArrowRight, Zap, Clock
} from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, Cell, CartesianGrid
} from "recharts";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
interface KPI {
  label: string;
  value: string | number;
  trend: string;
  trendUp: boolean;
  icon: React.ElementType;
  sub?: string;
  onClick?: () => void;
}

interface HandoffEntry {
  id: string;
  session_id: string;
  reason: string;
  channel: string;
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

// ─── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
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
    whatsapp: "WhatsApp", widget: "Widget",
    instagram: "Instagram", facebook: "Facebook", tawkto: "Tawk.to"
  };
  return map[ch] ?? ch;
}

// ─── Custom Tooltip ───────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-dash-surface border border-dash-border rounded-lg px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-dash-text mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-dash-surface-raised rounded ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────
export function DashboardTab({ onNavigate }: { onNavigate?: (tab: string, context?: any) => void }) {
  const { user, hotelId } = useAuth();

  // KPI state
  const [totalMessages, setTotalMessages] = useState<number | null>(null);
  const [totalLeads, setTotalLeads] = useState<number | null>(null);
  const [handoffRate, setHandoffRate] = useState<number | null>(null);
  const [feedbackScore, setFeedbackScore] = useState<number | null>(null);
  const [activeSessions, setActiveSessions] = useState<number | null>(null);
  const [avgResponseMs, setAvgResponseMs] = useState<number | null>(null);

  // Chart state
  const [messageChart, setMessageChart] = useState<MessagePoint[]>([]);
  const [funnelData, setFunnelData] = useState<LeadFunnelPoint[]>([]);

  // Feed state
  const [recentHandoffs, setRecentHandoffs] = useState<HandoffEntry[]>([]);

  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!hotelId) return;
    setRefreshing(true);

    try {
      // Run all queries in parallel
      const [
        messagesRes, leadsRes, handoffsRes, activeRes,
        feedbackRes, recentHandoffsRes
      ] = await Promise.all([
        // Total messages last 30d
        supabase
          .from("message_events")
          .select("id, response_ms", { count: "exact" })
          .eq("hotel_id", hotelId)
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),

        // Total leads (guests) captured
        supabase
          .from("leads")
          .select("id, status", { count: "exact" })
          .eq("hotel_id", hotelId),

        // Handoffs last 30d (for handoff rate)
        supabase
          .from("handoff_sessions")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .gte("created_at", new Date(Date.now() - 30 * 86400000).toISOString()),

        // Active live sessions (active handoffs)
        supabase
          .from("handoff_sessions")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .eq("status", "active"),

        // Average feedback score
        supabase
          .from("feedback")
          .select("rating")
          .eq("hotel_id", hotelId)
          .not("rating", "is", null),

        // Recent handoffs feed
        supabase
          .from("handoff_sessions")
          .select("id, session_id, reason, channel, created_at")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false })
          .limit(8)
      ]);

      // KPIs
      const msgCount = messagesRes.count ?? 0;
      const handoffCount = handoffsRes.count ?? 0;
      const rate = msgCount > 0 ? Math.round((handoffCount / msgCount) * 100) : 0;
      const avgMs = messagesRes.data
        ? messagesRes.data.reduce((acc, r) => acc + (r.response_ms ?? 0), 0) / (messagesRes.data.length || 1)
        : 0;
      const avgRating = feedbackRes.data?.length
        ? feedbackRes.data.reduce((acc, r) => acc + (r.rating ?? 0), 0) / feedbackRes.data.length
        : null;

      setTotalMessages(msgCount);
      setTotalLeads(leadsRes.count ?? 0);
      setHandoffRate(rate);
      setActiveSessions(activeRes.count ?? 0);
      setAvgResponseMs(Math.round(avgMs));
      setFeedbackScore(avgRating !== null ? Math.round(avgRating * 10) / 10 : null);

      // Handoffs feed
      setRecentHandoffs((recentHandoffsRes.data ?? []) as HandoffEntry[]);

      // Lead funnel data from leads
      const leads = leadsRes.data ?? [];
      const enquired = leads.length;
      const captured = leads.filter(l => l.status !== null && l.status !== 'new').length;
      const contacted = leads.filter(l =>
        ["contacted", "booked"].includes(l.status ?? "")
      ).length;
      const booked = leads.filter(l => l.status === "booked").length;
      const lost = leads.filter(l => l.status === "lost").length;

      setFunnelData([
        { stage: "Enquired", count: enquired, color: "#EA6639" },
        { stage: "Captured", count: captured, color: "#f97316" },
        { stage: "Contacted", count: contacted, color: "#7C3AED" },
        { stage: "Booked", count: booked, color: "#3ECF8E" },
        { stage: "Lost", count: lost, color: "#ef4444" }
      ]);

      // Message chart — last 7 days
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split("T")[0];
      });

      // Fetch message counts per day
      const chartRes = await supabase
        .from("message_events")
        .select("created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      const handoffChartRes = await supabase
        .from("handoffs")
        .select("created_at")
        .eq("hotel_id", hotelId)
        .gte("created_at", new Date(Date.now() - 7 * 86400000).toISOString());

      const msgByDay: Record<string, number> = {};
      const hndByDay: Record<string, number> = {};
      days.forEach(d => { msgByDay[d] = 0; hndByDay[d] = 0; });

      (chartRes.data ?? []).forEach(r => {
        const day = r.created_at.split("T")[0];
        if (msgByDay[day] !== undefined) msgByDay[day]++;
      });
      (handoffChartRes.data ?? []).forEach(r => {
        const day = r.created_at.split("T")[0];
        if (hndByDay[day] !== undefined) hndByDay[day]++;
      });

      setMessageChart(days.map(d => ({
        day: new Date(d).toLocaleDateString("en-US", { weekday: "short" }),
        messages: msgByDay[d],
        handoffs: hndByDay[d]
      })));

    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLastRefreshed(new Date());
    }
  }, [hotelId]);

  // Initial load
  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Supabase Realtime — live session count pulsing
  useEffect(() => {
    if (!hotelId) return;
    const channel = supabase
      .channel("dashboard-realtime")
      .on("postgres_changes", {
        event: "*", schema: "public", table: "conversations",
        filter: `hotel_id=eq.${hotelId}`
      }, () => {
        // Refresh active session count on any conversation change
        supabase
          .from("conversations")
          .select("id", { count: "exact" })
          .eq("hotel_id", hotelId)
          .eq("status", "human_active")
          .then(({ count }) => setActiveSessions(count ?? 0));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [hotelId]);

  // ─── KPI card definitions ────────────────────────────────────────────────
  const kpis: KPI[] = [
    {
      label: "Total Messages",
      value: loading ? "—" : (totalMessages ?? 0).toLocaleString(),
      trend: "Last 30 days",
      trendUp: true,
      icon: MessageSquare,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Leads Captured",
      value: loading ? "—" : (totalLeads ?? 0).toLocaleString(),
      trend: "All time",
      trendUp: true,
      icon: Users,
      onClick: () => onNavigate?.("crm")
    },
    {
      label: "Handoff Rate",
      value: loading ? "—" : `${handoffRate ?? 0}%`,
      trend: handoffRate !== null && handoffRate > 15 ? "High — review triggers" : "Within normal range",
      trendUp: (handoffRate ?? 0) <= 15,
      icon: handoffRate !== null && handoffRate > 15 ? AlertCircle : TrendingUp,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Active Live Sessions",
      value: loading ? "—" : (activeSessions ?? 0),
      trend: activeSessions ? "Needs attention" : "No open sessions",
      trendUp: (activeSessions ?? 0) === 0,
      icon: Activity,
      sub: activeSessions ? "🔴 Live" : undefined,
      onClick: () => onNavigate?.("inbox")
    },
    {
      label: "Avg Response Time",
      value: loading ? "—" : avgResponseMs ? `${(avgResponseMs / 1000).toFixed(1)}s` : "N/A",
      trend: "Last 30 days",
      trendUp: (avgResponseMs ?? 0) < 5000,
      icon: Clock,
      onClick: () => onNavigate?.("analytics")
    },
    {
      label: "Feedback Score",
      value: loading ? "—" : feedbackScore !== null ? `${feedbackScore} / 5` : "N/A",
      trend: feedbackScore !== null && feedbackScore >= 4 ? "Excellent" : feedbackScore !== null ? "Needs improvement" : "No data yet",
      trendUp: (feedbackScore ?? 0) >= 4,
      icon: Star,
      onClick: () => onNavigate?.("feedback")
    }
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 dashboard-interactive">

      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-header font-bold text-dash-text">Dashboard</h2>
          <p className="text-body text-dash-text-sec mt-0.5">
            Real-time overview of your bot performance and guest activity.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-micro text-dash-text-muted hidden sm:block">
            Updated {relativeTime(lastRefreshed.toISOString())}
          </span>
          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border rounded-md text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
          <button
            onClick={() => onNavigate?.("inbox")}
            className="dashboard-btn compact-touch-target h-8 px-3 bg-[#EA6639] text-white rounded-md text-body font-semibold hover:bg-[#d4582e] transition-colors flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5" />
            Live Inbox
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <button
            key={i}
            onClick={kpi.onClick}
            className="bg-dash-surface p-3 md:p-4 rounded-xl border border-dash-border flex flex-col justify-between text-left hover:border-[#EA6639]/40 hover:shadow-sm transition-all cursor-pointer group"
          >
            <div className="flex items-start justify-between gap-1 mb-3">
              <span className="text-data font-medium text-dash-text-sec leading-tight">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5 group-hover:text-[#EA6639] transition-colors" />
            </div>
            <div>
              {loading ? (
                <Skeleton className="h-7 w-16 mb-1" />
              ) : (
                <div className="flex items-baseline gap-1 flex-wrap">
                  <span className="text-kpi font-black text-dash-text">{kpi.value}</span>
                  {kpi.sub && (
                    <span className="text-micro font-bold text-red-500 animate-pulse">{kpi.sub}</span>
                  )}
                </div>
              )}
              <span className={`text-micro font-medium ${kpi.trendUp ? "text-emerald-500" : "text-red-500"}`}>
                {kpi.trend}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Messages Per Day — Area Chart */}
        <div className="lg:col-span-2 bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Message Volume — Last 7 Days</h3>
            <button
              onClick={() => onNavigate?.("analytics")}
              className="text-data text-[#EA6639] hover:underline font-medium flex items-center gap-1"
            >
              Full analytics <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : messageChart.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center border-2 border-dashed border-dash-border rounded-lg">
              <MessageSquare className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-data text-dash-text-muted">No message data yet.</p>
              <p className="text-micro text-dash-text-muted mt-0.5">Messages will appear here as guests contact your bot.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <AreaChart data={messageChart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="colorMsgs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EA6639" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#EA6639" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorHandoffs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" strokeOpacity={0.5} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="messages" name="Messages" stroke="#EA6639" strokeWidth={2} fill="url(#colorMsgs)" dot={false} activeDot={{ r: 4 }} />
                <Area type="monotone" dataKey="handoffs" name="Handoffs" stroke="#7C3AED" strokeWidth={2} fill="url(#colorHandoffs)" dot={false} activeDot={{ r: 4 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Lead Funnel — Bar Chart */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Lead Funnel</h3>
            <button
              onClick={() => onNavigate?.("crm")}
              className="text-data text-[#EA6639] hover:underline font-medium flex items-center gap-1"
            >
              CRM <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          {loading ? (
            <Skeleton className="h-56 w-full" />
          ) : funnelData.every(d => d.count === 0) ? (
            <div className="h-56 flex flex-col items-center justify-center text-center border-2 border-dashed border-dash-border rounded-lg">
              <Users className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-data text-dash-text-muted">No leads yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={224}>
              <BarChart data={funnelData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--dash-border)" strokeOpacity={0.5} vertical={false} />
                <XAxis dataKey="stage" tick={{ fontSize: 10, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "var(--dash-text-sec)" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="Leads" radius={[4, 4, 0, 0]}>
                  {funnelData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── Recent Handoffs Feed ── */}
      <div className="bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-section font-semibold text-dash-text">Recent Handoff Requests</h3>
          <button
            onClick={() => onNavigate?.("inbox")}
            className="dashboard-btn compact-touch-target text-data text-[#EA6639] hover:underline font-medium flex items-center gap-1"
          >
            View Inbox <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
          </div>
        ) : recentHandoffs.length === 0 ? (
          <div className="py-10 flex flex-col items-center text-center border-2 border-dashed border-dash-border rounded-lg">
            <Activity className="w-8 h-8 text-dash-text-muted mb-2" />
            <p className="text-data text-dash-text-muted font-medium">No handoff requests yet.</p>
            <p className="text-micro text-dash-text-muted mt-0.5">When guests request human assistance, they'll appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {recentHandoffs.map((h) => (
              <button
                key={h.id}
                onClick={() => onNavigate?.("inbox", { sessionId: h.session_id })}
                className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline text-left hover:border-[#EA6639]/30 hover:bg-dash-canvas/80 transition-all group"
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <span className="text-data font-mono font-semibold text-dash-text truncate">{h.session_id}</span>
                  <span className="text-micro text-dash-text-muted whitespace-nowrap">{relativeTime(h.created_at)}</span>
                </div>
                <p className="text-micro text-dash-text-sec truncate mb-1.5">{h.reason || "Handoff requested"}</p>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-dash-surface-raised text-dash-text-sec border border-dash-border">
                  {channelLabel(h.channel)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
