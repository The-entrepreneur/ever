import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { 
  Download, Users, MessageSquare, CheckCircle2, TrendingUp, TrendingDown, 
  ChevronDown, Database, RefreshCw, AlertCircle, BarChart3, Clock, DollarSign,
  Maximize2, Minimize2, Table, Filter, Sparkles, HelpCircle, Layers, ArrowRight,
  Printer, FileText, Check, Copy, ExternalLink, Calendar, Search, SlidersHorizontal,
  Eye, X, BookOpen, AlertTriangle, ChevronRight, Zap, ShieldAlert
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush, ComposedChart
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { DateRangePicker, DateRangeValue, getDateRangeFromPreset } from "../../../shared/DateRangePicker";
import { Modal } from "../../../shared/Modal";
import { supabase } from "../../../lib/supabase";

// ─── Theme Colors ────────────────────────────────────────────────────────────
const COLORS = {
  primary: "#EA6639",      // Core brand orange
  secondary: "#10B981",    // Emerald green for AI Agent / positive
  tertiary: "#F59E0B",     // Amber for handoffs / warnings
  quaternary: "#3B82F6",   // Blue for Staff / human
  purple: "#8B5CF6",       // Violet for orders / POS
  pink: "#EC4899",         // Pink for Instagram
  grid: "rgba(255,255,255,0.08)",
  textMuted: "#8E8E96"
};

// ─── Types ───────────────────────────────────────────────────────────────────
type AnalyticsSubTab = "cockpit" | "intent" | "sla" | "revenue" | "builder";
type ChartViewMode = "area" | "line" | "bar" | "table";

interface ChartConfig {
  id: string;
  title: string;
  subtitle: string;
  data: any[];
  xAxisKey: string;
  dataKeys: { key: string; name: string; color: string; fillOpacity?: number }[];
  defaultMode?: ChartViewMode;
}

// ─── Tooltip Formatter ───────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-dash-surface/95 backdrop-blur-md p-3 rounded-xl border border-dash-border shadow-xl text-xs font-mono min-w-[170px] z-50 animate-in fade-in-50 duration-100">
      <div className="font-sans font-semibold text-dash-text border-b border-dash-border pb-1.5 mb-2">
        {label}
      </div>
      <div className="space-y-1.5">
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center justify-between gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 text-dash-text-sec">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
              {entry.name}:
            </span>
            <span className="font-bold text-dash-text">
              {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Reusable Clean Empty State Component ───────────────────────────────────
function EmptyStateBox({
  icon: Icon = BarChart3,
  title,
  description,
  actionLabel,
  onAction
}: {
  icon?: any;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dash-border bg-dash-canvas/40 min-h-[180px]">
      <div className="w-10 h-10 rounded-xl bg-dash-surface border border-dash-border flex items-center justify-center text-dash-text-muted mb-2.5 shadow-xs">
        <Icon className="w-5 h-5 stroke-[1.5]" />
      </div>
      <h4 className="text-xs font-bold text-dash-text mb-1">{title}</h4>
      <p className="text-[11px] text-dash-text-sec max-w-xs leading-relaxed mb-3">{description}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="px-3 py-1 rounded-lg bg-[#EA6639] hover:bg-[#EA6639]/90 text-white text-xs font-semibold transition-colors shadow-xs"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// ─── Interactive Chart Container with Scrubbing, Mode Switch & Download ─────
function InteractiveChartCard({
  title,
  subtitle,
  data,
  xAxisKey,
  dataKeys,
  defaultMode = "area",
  height = 280,
  allowBrush = false,
  onMaximize
}: {
  title: string;
  subtitle?: string;
  data: any[];
  xAxisKey: string;
  dataKeys: { key: string; name: string; color: string }[];
  defaultMode?: ChartViewMode;
  height?: number;
  allowBrush?: boolean;
  onMaximize?: () => void;
}) {
  const [viewMode, setViewMode] = useState<ChartViewMode>(defaultMode);
  const [showBrush, setShowBrush] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Record<string, boolean>>({});

  const toggleSeries = (key: string) => {
    setVisibleKeys(prev => ({
      ...prev,
      [key]: prev[key] === false ? true : false
    }));
  };

  const handleDownloadCSV = () => {
    if (!data.length) return;
    const headers = [xAxisKey, ...dataKeys.map(k => k.name)].join(",");
    const rows = data.map(row => 
      [row[xAxisKey], ...dataKeys.map(k => row[k.key] ?? "")].join(",")
    );
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const hasData = data && data.length > 0 && data.some(row => dataKeys.some(k => typeof row[k.key] === "number" && row[k.key] > 0));

  return (
    <div className="bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border shadow-xs flex flex-col justify-between transition-all">
      {/* Chart Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-dash-border">
        <div>
          <h3 className="text-sm font-bold text-dash-text tracking-tight flex items-center gap-2">
            {title}
          </h3>
          {subtitle && <p className="text-xs text-dash-text-sec mt-0.5">{subtitle}</p>}
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-dash-canvas p-0.5 rounded-lg border border-dash-border">
            <button
              type="button"
              onClick={() => setViewMode("area")}
              title="Area Gradient View"
              className={`p-1 rounded text-xs transition-colors ${viewMode === "area" ? "bg-dash-surface text-[#EA6639] shadow-xs font-bold" : "text-dash-text-muted hover:text-dash-text"}`}
            >
              Area
            </button>
            <button
              type="button"
              onClick={() => setViewMode("bar")}
              title="Bar Chart View"
              className={`p-1 rounded text-xs transition-colors ${viewMode === "bar" ? "bg-dash-surface text-[#EA6639] shadow-xs font-bold" : "text-dash-text-muted hover:text-dash-text"}`}
            >
              Bar
            </button>
            <button
              type="button"
              onClick={() => setViewMode("line")}
              title="Line Chart View"
              className={`p-1 rounded text-xs transition-colors ${viewMode === "line" ? "bg-dash-surface text-[#EA6639] shadow-xs font-bold" : "text-dash-text-muted hover:text-dash-text"}`}
            >
              Line
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              title="Tabular Data View"
              className={`p-1 rounded text-xs transition-colors ${viewMode === "table" ? "bg-dash-surface text-[#EA6639] shadow-xs font-bold" : "text-dash-text-muted hover:text-dash-text"}`}
            >
              <Table className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Timeline Zoom Scrubber Toggle */}
          {allowBrush && viewMode !== "table" && hasData && (
            <button
              type="button"
              onClick={() => setShowBrush(!showBrush)}
              title={showBrush ? "Hide Timeline Scrubber" : "Enable Timeline Scrubber"}
              className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                showBrush ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]" : "border-dash-border text-dash-text-muted hover:text-dash-text bg-dash-canvas"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Download CSV */}
          <button
            type="button"
            onClick={handleDownloadCSV}
            title="Export this chart as CSV"
            className="p-1.5 rounded-lg border border-dash-border bg-dash-canvas text-dash-text-muted hover:text-dash-text transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          {/* Fullscreen Maximize */}
          {onMaximize && hasData && (
            <button
              type="button"
              onClick={onMaximize}
              title="Expand Chart"
              className="p-1 rounded text-dash-text-muted hover:text-dash-text transition-colors"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Series Filter Pill Badges */}
      {viewMode !== "table" && dataKeys.length > 1 && hasData && (
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] font-bold uppercase text-dash-text-muted">Series:</span>
          {dataKeys.map(k => {
            const isVisible = visibleKeys[k.key] !== false;
            return (
              <button
                key={k.key}
                type="button"
                onClick={() => toggleSeries(k.key)}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all ${
                  isVisible 
                    ? "bg-dash-canvas border-dash-border text-dash-text" 
                    : "opacity-40 line-through border-transparent text-dash-text-muted"
                }`}
              >
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: k.color }} />
                <span>{k.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Render Visualization */}
      <div style={{ height }} className="w-full relative">
        {!hasData ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-dash-canvas/30 rounded-lg border border-dash-border">
            <BarChart3 className="w-8 h-8 text-dash-text-muted opacity-30 mb-2 stroke-[1.5]" />
            <p className="text-xs font-semibold text-dash-text">No Activity Recorded For This Period</p>
            <p className="text-[11px] text-dash-text-sec mt-1 max-w-xs">Data will populate automatically as guest conversations and events are tracked.</p>
          </div>
        ) : viewMode === "table" ? (
          <div className="h-full overflow-auto border border-dash-border rounded-lg bg-dash-canvas/40 text-xs">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-dash-surface border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                <tr>
                  <th className="px-3 py-2">{xAxisKey}</th>
                  {dataKeys.map(k => (
                    <th key={k.key} className="px-3 py-2 text-right">{k.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline font-mono text-[11px] text-dash-text">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-dash-surface-hover/50">
                    <td className="px-3 py-1.5 font-sans font-medium text-dash-text">{row[xAxisKey]}</td>
                    {dataKeys.map(k => (
                      <td key={k.key} className="px-3 py-1.5 text-right font-semibold">
                        {typeof row[k.key] === "number" ? row[k.key].toLocaleString() : (row[k.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === "bar" ? (
              <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey={xAxisKey} stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {dataKeys.map(k => visibleKeys[k.key] !== false && (
                  <Bar key={k.key} dataKey={k.key} name={k.name} fill={k.color} radius={[3, 3, 0, 0]} />
                ))}
                {allowBrush && showBrush && (
                  <Brush dataKey={xAxisKey} height={25} stroke="#EA6639" fill="var(--dash-canvas)" travellerWidth={10} />
                )}
              </BarChart>
            ) : viewMode === "line" ? (
              <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey={xAxisKey} stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {dataKeys.map(k => visibleKeys[k.key] !== false && (
                  <Line key={k.key} type="monotone" dataKey={k.key} name={k.name} stroke={k.color} strokeWidth={2.2} dot={{ r: 2 }} activeDot={{ r: 5 }} />
                ))}
                {allowBrush && showBrush && (
                  <Brush dataKey={xAxisKey} height={25} stroke="#EA6639" fill="var(--dash-canvas)" travellerWidth={10} />
                )}
              </LineChart>
            ) : (
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  {dataKeys.map(k => (
                    <linearGradient key={k.key} id={`grad_${k.key}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={k.color} stopOpacity={0.35} />
                      <stop offset="95%" stopColor={k.color} stopOpacity={0} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                <XAxis dataKey={xAxisKey} stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={8} />
                <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                {dataKeys.map(k => visibleKeys[k.key] !== false && (
                  <Area
                    key={k.key}
                    type="monotone"
                    dataKey={k.key}
                    name={k.name}
                    stroke={k.color}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={`url(#grad_${k.key})`}
                  />
                ))}
                {allowBrush && showBrush && (
                  <Brush dataKey={xAxisKey} height={25} stroke="#EA6639" fill="var(--dash-canvas)" travellerWidth={10} />
                )}
              </AreaChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

// ─── Main Analytics Component ────────────────────────────────────────────────
interface AnalyticsTabProps {
  onNavigate?: (tab: string, context?: any) => void;
}

export function AnalyticsTab({ onNavigate }: AnalyticsTabProps) {
  const { user, subscriptionStatus, hotelId } = useAuth();
  const { showToast } = useToast();
  const { formatMoney } = useCurrency();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();

  // Perspective Sub-Tabs
  const [activeSubTab, setActiveSubTab] = useState<AnalyticsSubTab>("cockpit");

  // Shared Date Range Picker (30d default)
  const [dateRange, setDateRange] = useState<DateRangeValue>(() => getDateRangeFromPreset("30d"));

  // Level 2 Feature Flag
  const isLevel2 = subscriptionStatus === "level_2" || subscriptionStatus === "active" || isSandbox;

  // Fullscreen Chart Modal State
  const [maximizedChart, setMaximizedChart] = useState<ChartConfig | null>(null);

  // Unanswered Query to KB Modal State
  const [kbModalQuery, setKbModalQuery] = useState<{ query: string; category: string } | null>(null);
  const [newFaqAnswer, setNewFaqAnswer] = useState("");

  // Report Builder State
  const [selectedReportPreset, setSelectedReportPreset] = useState<string>("exec_monthly");
  const [reportIncludedSections, setReportIncludedSections] = useState<Record<string, boolean>>({
    summary: true,
    volume: true,
    channels: true,
    intents: true,
    slas: true,
    faqs: true,
    revenue: true
  });
  const printContainerRef = useRef<HTMLDivElement>(null);

  // ─── Live Supabase Analytics State (non-sandbox) ───────────────────────────
  const [liveAnalyticsData, setLiveAnalyticsData] = useState<any[]>([]);
  const [liveStaffLeaderboard, setLiveStaffLeaderboard] = useState<{ name: string; role: string; chats: number; speed: string; res: string }[]>([]);
  const [liveChannelData, setLiveChannelData] = useState<{ name: string; value: number; color: string; share: string; mom: string }[]>([]);
  const [liveContactedLeads, setLiveContactedLeads] = useState<number>(0);
  const [liveLeadsTotal, setLiveLeadsTotal] = useState<number>(0);
  const [liveUnansweredQueries, setLiveUnansweredQueries] = useState<any[]>([]);
  const [liveHourlyTraffic, setLiveHourlyTraffic] = useState<{ h: string; volume: number; label: string }[]>([]);
  const [liveUpsellStats, setLiveUpsellStats] = useState<any[]>([]);
  const [liveUpsellMetrics, setLiveUpsellMetrics] = useState<{ rate: string; revenue: number }>({ rate: "0.0%", revenue: 0 });
  const [liveLanguages, setLiveLanguages] = useState<{ lang: string; count: number; pct: string }[]>([]);
  const [liveLatencyData, setLiveLatencyData] = useState<{ bucket: string; count: number; desc: string }[]>([]);
  const [livePercentiles, setLivePercentiles] = useState<{ p50: string; p90: string; p99: string }>({ p50: "—", p90: "—", p99: "—" });
  const [liveRating, setLiveRating] = useState<number | null>(null);
  const [isLoadingLiveData, setIsLoadingLiveData] = useState<boolean>(false);

  // ─── Fetch Live Supabase Analytics ─────────────────────────────────────────
  useEffect(() => {
    if (isSandbox || !hotelId) return;

    const sDate = dateRange.startDate.split("T")[0];
    const eDate = dateRange.endDate.split("T")[0];

    const fetchAllLiveAnalytics = async () => {
      setIsLoadingLiveData(true);
      try {
        // 1. Fetch bookings & booking_events in period
        const [bookingsRes, bookingEventsRes, convsRes, msgEventsRes, leadsRes, ordersRes, feedbackRes] = await Promise.all([
          supabase
            .from("bookings")
            .select("created_at, total_amount, fee_amount, status")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("booking_events")
            .select("created_at, booking_value, fee_amount, channel, status")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("conversations")
            .select("id, session_id, created_at, channel, role, content")
            .eq("client_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("message_events")
            .select("id, session_id, channel, intent, lang, response_ms, created_at")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("leads")
            .select("id, status, created_at")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("orders")
            .select("id, item, category, status, created_at")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59"),

          supabase
            .from("feedback")
            .select("rating, created_at")
            .eq("hotel_id", hotelId)
            .gte("created_at", sDate)
            .lte("created_at", eDate + "T23:59:59")
        ]);

        const rawBookings = bookingsRes.data || [];
        const rawBookingEvents = bookingEventsRes.data || [];
        const rawConvs = convsRes.data || [];
        const rawMsgEvents = msgEventsRes.data || [];
        const rawLeads = leadsRes.data || [];
        const rawOrders = ordersRes.data || [];
        const rawFeedback = feedbackRes.data || [];

        // Build Daily Time-Series
        const dayMap: Record<string, any> = {};

        // Aggregate message events / conversations
        const messagesSource = rawMsgEvents.length > 0 ? rawMsgEvents : rawConvs;
        messagesSource.forEach((row: any) => {
          const day = row.created_at?.split("T")[0];
          if (!day) return;
          if (!dayMap[day]) {
            dayMap[day] = {
              date: day,
              totalVolume: 0,
              agentVolume: 0,
              staffVolume: 0,
              bookingValue: 0,
              feeAmount: 0,
              bookedCount: 0,
              faqIntent: 0,
              bookingIntent: 0,
              orderIntent: 0,
              handoffIntent: 0,
            };
          }
          dayMap[day].totalVolume += 1;
          const isHandoff = row.intent === "handoff" || row.role === "assistant_escalated";
          if (isHandoff) {
            dayMap[day].staffVolume += 1;
            dayMap[day].handoffIntent += 1;
          } else {
            dayMap[day].agentVolume += 1;
          }

          if (row.intent === "booking") dayMap[day].bookingIntent += 1;
          else if (row.intent === "order") dayMap[day].orderIntent += 1;
          else dayMap[day].faqIntent += 1;
        });

        // Aggregate revenue events (booking_events takes priority, fallback to bookings)
        const revenueSource = rawBookingEvents.length > 0 ? rawBookingEvents : rawBookings;
        revenueSource.forEach((row: any) => {
          const day = row.created_at?.split("T")[0];
          if (!day) return;
          if (!dayMap[day]) {
            dayMap[day] = {
              date: day,
              totalVolume: 0,
              agentVolume: 0,
              staffVolume: 0,
              bookingValue: 0,
              feeAmount: 0,
              bookedCount: 0,
              faqIntent: 0,
              bookingIntent: 0,
              orderIntent: 0,
              handoffIntent: 0,
            };
          }
          const val = Number(row.booking_value ?? row.total_amount) || 0;
          const fee = Number(row.fee_amount) || parseFloat((val * 0.03).toFixed(2));
          dayMap[day].bookingValue += val;
          dayMap[day].feeAmount += fee;
          dayMap[day].bookedCount += 1;
        });

        const builtDaily = Object.entries(dayMap)
          .map(([date, metrics]) => {
            const d = new Date(date);
            const tv = metrics.totalVolume || 0;
            return {
              date,
              displayDate: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
              ...metrics,
              handoffRate: tv > 0 ? parseFloat(((metrics.staffVolume / tv) * 100).toFixed(1)) : 0,
            };
          })
          .sort((a, b) => a.date.localeCompare(b.date));

        setLiveAnalyticsData(builtDaily);

        // Channels aggregation
        const channelCounts: Record<string, number> = {};
        messagesSource.forEach((m: any) => {
          const ch = m.channel || "website_widget";
          channelCounts[ch] = (channelCounts[ch] || 0) + 1;
        });
        const totalLiveMsgs = messagesSource.length;
        const channelPalette: Record<string, { label: string; color: string }> = {
          website_widget: { label: "Website Live Widget", color: COLORS.primary },
          widget: { label: "Website Live Widget", color: COLORS.primary },
          whatsapp: { label: "WhatsApp Business", color: COLORS.secondary },
          instagram: { label: "Instagram Direct", color: COLORS.quaternary },
          facebook: { label: "Facebook Messenger", color: "#1877F2" },
          tawkto: { label: "Tawk.to Live Chat", color: "#03A84E" },
        };
        const builtChannels = Object.entries(channelCounts).map(([ch, count]) => {
          const info = channelPalette[ch] || { label: ch, color: "#71717A" };
          const sharePct = totalLiveMsgs > 0 ? Math.round((count / totalLiveMsgs) * 100) : 0;
          return {
            name: info.label,
            value: count,
            color: info.color,
            share: `${sharePct}%`,
            mom: "—",
          };
        });
        setLiveChannelData(builtChannels);

        // Leads Funnel
        setLiveLeadsTotal(rawLeads.length);
        const contacted = rawLeads.filter(l => l.status === "contacted" || l.status === "booked").length;
        setLiveContactedLeads(contacted);

        // Feedback Score
        if (rawFeedback.length > 0) {
          const avg = rawFeedback.reduce((acc, f) => acc + (f.rating || 0), 0) / rawFeedback.length;
          setLiveRating(parseFloat(avg.toFixed(1)));
        } else {
          setLiveRating(null);
        }

        // Hourly Traffic
        const hourMap = new Array(24).fill(0);
        messagesSource.forEach((m: any) => {
          if (m.created_at) {
            const h = new Date(m.created_at).getHours();
            if (h >= 0 && h < 24) hourMap[h]++;
          }
        });
        if (totalLiveMsgs > 0) {
          const builtHourly = [
            { h: "00:00", volume: hourMap[0], label: "Night" },
            { h: "02:00", volume: hourMap[2], label: "Night" },
            { h: "04:00", volume: hourMap[4], label: "Night" },
            { h: "06:00", volume: hourMap[6], label: "Early Morning" },
            { h: "08:00", volume: hourMap[8], label: "Morning Rush" },
            { h: "10:00", volume: hourMap[10], label: "Peak Check-in" },
            { h: "12:00", volume: hourMap[12], label: "Noon" },
            { h: "14:00", volume: hourMap[14], label: "Check-in Rush" },
            { h: "16:00", volume: hourMap[16], label: "Peak Evening" },
            { h: "18:00", volume: hourMap[18], label: "Prime Guest Hours" },
            { h: "20:00", volume: hourMap[20], label: "Dining Inquiries" },
            { h: "22:00", volume: hourMap[22], label: "Late Night" },
          ];
          setLiveHourlyTraffic(builtHourly);
        } else {
          setLiveHourlyTraffic([]);
        }

        // Language Distribution
        const langCounts: Record<string, number> = {};
        rawMsgEvents.forEach(m => {
          if (m.lang) {
            langCounts[m.lang] = (langCounts[m.lang] || 0) + 1;
          }
        });
        if (Object.keys(langCounts).length > 0) {
          const builtLangs = Object.entries(langCounts).map(([lang, count]) => ({
            lang,
            count,
            pct: `${Math.round((count / totalLiveMsgs) * 100)}%`
          }));
          setLiveLanguages(builtLangs);
        } else {
          setLiveLanguages([]);
        }

        // Latency Histogram & Percentiles
        const latencies = rawMsgEvents
          .map(m => m.response_ms)
          .filter((ms): ms is number => typeof ms === "number" && ms > 0)
          .sort((a, b) => a - b);

        if (latencies.length > 0) {
          const b1 = latencies.filter(l => l < 1000).length;
          const b2 = latencies.filter(l => l >= 1000 && l < 2000).length;
          const b3 = latencies.filter(l => l >= 2000 && l < 5000).length;
          const b4 = latencies.filter(l => l >= 5000 && l < 10000).length;
          const b5 = latencies.filter(l => l >= 10000).length;
          setLiveLatencyData([
            { bucket: "< 1s", count: b1, desc: "Instantaneous cache hit" },
            { bucket: "1 - 2s", count: b2, desc: "Normal LLM generation" },
            { bucket: "2 - 5s", count: b3, desc: "Multi-turn PMS lookups" },
            { bucket: "5 - 10s", count: b4, desc: "Complex knowledge synthesis" },
            { bucket: "> 10s", count: b5, desc: "Network timeout retries" }
          ]);
          const p50Val = latencies[Math.floor(latencies.length * 0.5)] / 1000;
          const p90Val = latencies[Math.floor(latencies.length * 0.9)] / 1000;
          const p99Val = latencies[Math.floor(latencies.length * 0.99)] / 1000;
          setLivePercentiles({
            p50: `${p50Val.toFixed(1)}s`,
            p90: `${p90Val.toFixed(1)}s`,
            p99: `${p99Val.toFixed(1)}s`,
          });
        } else {
          setLiveLatencyData([]);
          setLivePercentiles({ p50: "—", p90: "—", p99: "—" });
        }

        // Upsells from live orders
        if (rawOrders.length > 0) {
          const catMap: Record<string, { count: number; revenue: number }> = {};
          rawOrders.forEach(o => {
            const name = o.item || o.category || "Service Package";
            if (!catMap[name]) catMap[name] = { count: 0, revenue: 0 };
            catMap[name].count += 1;
            catMap[name].revenue += 35;
          });
          const builtUpsellList = Object.entries(catMap).map(([name, d]) => ({
            name,
            offered: d.count * 2,
            accepted: d.count,
            rate: "50.0%",
            revenue: `$${d.revenue.toLocaleString()}`
          }));
          const totalUpsellRev = Object.values(catMap).reduce((a, b) => a + b.revenue, 0);
          setLiveUpsellStats(builtUpsellList);
          setLiveUpsellMetrics({
            rate: `${((rawOrders.length / (rawBookings.length || 1)) * 100).toFixed(1)}%`,
            revenue: totalUpsellRev
          });
        } else {
          setLiveUpsellStats([]);
          setLiveUpsellMetrics({ rate: "0.0%", revenue: 0 });
        }

      } catch (err) {
        console.error("[AnalyticsTab] Error fetching live telemetry:", err);
      } finally {
        setIsLoadingLiveData(false);
      }
    };

    // Unanswered Queries / Knowledge Gaps from handoff sessions
    const fetchLiveGaps = async () => {
      try {
        const { data: handoffs } = await supabase
          .from("handoff_sessions")
          .select("id, reason, channel, created_at, status")
          .eq("hotel_id", hotelId)
          .in("status", ["pending", "active"]);

        if (handoffs && handoffs.length > 0) {
          const reasonMap: Record<string, number> = {};
          handoffs.forEach(h => {
            const r = h.reason || "Unrecognized inquiry";
            reasonMap[r] = (reasonMap[r] || 0) + 1;
          });
          const builtGaps = Object.entries(reasonMap).map(([query, count], idx) => ({
            id: `gap_${idx}`,
            query,
            count,
            confidence: "< 45%",
            category: "general"
          }));
          setLiveUnansweredQueries(builtGaps);
        } else {
          setLiveUnansweredQueries([]);
        }
      } catch (err) {
        console.error("[AnalyticsTab] Error fetching handoffs:", err);
      }
    };

    // Staff Leaderboard
    const fetchStaffLeaderboard = async () => {
      try {
        const { data: staffRows } = await supabase
          .from("users")
          .select("id, full_name, email, role")
          .eq("hotel_id", hotelId)
          .in("role", ["hotel_manager", "hotel_receptionist"]);

        if (!staffRows?.length) {
          setLiveStaffLeaderboard([]);
          return;
        }

        const leaderboard = await Promise.all(
          staffRows.map(async (s: any) => {
            const { count } = await supabase
              .from("handoff_sessions")
              .select("*", { count: "exact", head: true })
              .eq("agent_id", s.id)
              .eq("status", "resolved");
            return {
              name: s.full_name || s.email,
              role: s.role === "hotel_manager" ? "Hotel Manager" : "Hotel Receptionist",
              chats: count || 0,
              speed: count ? "45s" : "—",
              res: count ? "100%" : "—",
            };
          })
        );
        setLiveStaffLeaderboard(leaderboard.filter(l => l.chats > 0).sort((a, b) => b.chats - a.chats));
      } catch (err) {
        console.error("[AnalyticsTab] Staff leaderboard fetch failed:", err);
      }
    };

    fetchAllLiveAnalytics();
    fetchLiveGaps();
    fetchStaffLeaderboard();
  }, [isSandbox, hotelId, dateRange]);

  // ─── Filter Time-Series Data Dynamically ───────────────────────────────────
  const rawData = useMemo(() => {
    if (isSandbox) return sandboxData?.analyticsData || [];
    return liveAnalyticsData;
  }, [isSandbox, sandboxData, liveAnalyticsData]);

  const filteredData = useMemo(() => {
    if (!rawData.length) return [];
    const sDate = dateRange.startDate.split("T")[0];
    const eDate = dateRange.endDate.split("T")[0];
    return rawData.filter(d => d.date >= sDate && d.date <= eDate);
  }, [rawData, dateRange]);

  // In sandbox, fallback to latest 30 if date filter yields empty; in live, leave empty
  const baseDisplayData = useMemo(() => {
    if (filteredData.length > 0) return filteredData;
    if (isSandbox) return rawData.slice(-30);
    return [];
  }, [filteredData, isSandbox, rawData]);

  // ─── Safety: ensure feeAmount always exists ────────────────────────────────
  const displayData = useMemo(() =>
    baseDisplayData.map(d => ({
      ...d,
      feeAmount: typeof d.feeAmount === "number"
        ? d.feeAmount
        : parseFloat(((d.bookingValue || 0) * 0.03).toFixed(2))
    })),
  [baseDisplayData]);

  // ─── Dynamic Aggregate KPIs ────────────────────────────────────────────────
  const kpis = useMemo(() => {
    if (!displayData.length) {
      return {
        totalMessages: 0,
        agentResolved: 0,
        agentRate: 0,
        staffHandoffs: 0,
        leadsCaptured: isSandbox ? 0 : liveLeadsTotal,
        avgLatency: isSandbox ? "1.1s" : "—",
        bookingCount: 0,
        bookingRevenue: 0,
        agencyFee: 0,
        satisfaction: isSandbox ? 4.8 : (liveRating ?? 0)
      };
    }
    const totalMessages = displayData.reduce((acc, d) => acc + (d.totalVolume || 0), 0);
    const agentResolved = displayData.reduce((acc, d) => acc + (d.agentVolume || 0), 0);
    const staffHandoffs = displayData.reduce((acc, d) => acc + (d.staffVolume || 0), 0);
    const bookingCount = displayData.reduce((acc, d) => acc + (d.bookedCount || 0), 0);
    const bookingRevenue = displayData.reduce((acc, d) => acc + (d.bookingValue || 0), 0);
    const agencyFee = displayData.reduce((acc, d) => acc + (d.feeAmount || 0), 0);

    const agentRate = totalMessages > 0 ? Math.round((agentResolved / totalMessages) * 100) : 0;
    const leadsCaptured = isSandbox ? Math.round(totalMessages * 0.18) : liveLeadsTotal;

    return {
      totalMessages,
      agentResolved,
      agentRate,
      staffHandoffs,
      leadsCaptured,
      avgLatency: isSandbox ? "1.1s" : (livePercentiles.p50 !== "—" ? livePercentiles.p50 : "—"),
      bookingCount,
      bookingRevenue,
      agencyFee,
      satisfaction: isSandbox ? 4.8 : (liveRating ?? 0)
    };
  }, [displayData, isSandbox, liveLeadsTotal, livePercentiles.p50, liveRating]);

  // ─── Channel Distribution Data ─────────────────────────────────────────────
  const channelData = useMemo(() => {
    if (isSandbox) {
      const total = kpis.totalMessages || 1200;
      return [
        { name: "Website Live Widget", value: Math.round(total * 0.65), color: COLORS.primary, share: "65%", mom: "+14%" },
        { name: "WhatsApp Business", value: Math.round(total * 0.25), color: COLORS.secondary, share: "25%", mom: "+22%" },
        { name: "Instagram Direct", value: Math.round(total * 0.10), color: COLORS.quaternary, share: "10%", mom: "+8%" }
      ];
    }
    return liveChannelData;
  }, [isSandbox, kpis.totalMessages, liveChannelData]);

  // ─── Lead Funnel Data ──────────────────────────────────────────────────────
  const funnelData = useMemo(() => {
    if (isSandbox) {
      const enquired = Math.round(kpis.totalMessages * 0.35) || 450;
      const captured = kpis.leadsCaptured || 180;
      const contacted = Math.round(captured * 0.75) || 135;
      const booked = kpis.bookingCount || Math.round(contacted * 0.4) || 54;
      return [
        { step: "Enquired", count: enquired, rate: "100%", fill: "#52525b" },
        { step: "Lead Captured", count: captured, rate: `${Math.round((captured / (enquired || 1)) * 100)}%`, fill: "#71717a" },
        { step: "Contacted", count: contacted, rate: `${Math.round((contacted / (captured || 1)) * 100)}%`, fill: "#3b82f6" },
        { step: "Confirmed Booked", count: booked, rate: `${Math.round((booked / (contacted || 1)) * 100)}%`, fill: COLORS.primary }
      ];
    }
    if (kpis.totalMessages === 0 && kpis.leadsCaptured === 0) return [];
    const enquired = kpis.totalMessages;
    const captured = kpis.leadsCaptured;
    const contacted = liveContactedLeads;
    const booked = kpis.bookingCount;
    return [
      { step: "Enquired", count: enquired, rate: "100%", fill: "#52525b" },
      { step: "Lead Captured", count: captured, rate: enquired ? `${Math.round((captured / enquired) * 100)}%` : "0%", fill: "#71717a" },
      { step: "Contacted", count: contacted, rate: captured ? `${Math.round((contacted / captured) * 100)}%` : "0%", fill: "#3b82f6" },
      { step: "Confirmed Booked", count: booked, rate: contacted ? `${Math.round((booked / contacted) * 100)}%` : "0%", fill: COLORS.primary }
    ];
  }, [isSandbox, kpis, liveContactedLeads]);

  // ─── Latency Histogram Data ────────────────────────────────────────────────
  const latencyData = useMemo(() => {
    if (isSandbox) {
      const total = kpis.totalMessages || 1200;
      return [
        { bucket: "< 1s", count: Math.round(total * 0.42), desc: "Instantaneous cache hit" },
        { bucket: "1 - 2s", count: Math.round(total * 0.46), desc: "Normal LLM generation" },
        { bucket: "2 - 5s", count: Math.round(total * 0.08), desc: "Multi-turn PMS lookups" },
        { bucket: "5 - 10s", count: Math.round(total * 0.03), desc: "Complex knowledge synthesis" },
        { bucket: "> 10s", count: Math.round(total * 0.01), desc: "Network timeout retries" }
      ];
    }
    return liveLatencyData;
  }, [isSandbox, kpis.totalMessages, liveLatencyData]);

  // ─── Language Distribution Data ────────────────────────────────────────────
  const languageData = useMemo(() => {
    if (isSandbox) {
      const total = kpis.totalMessages || 1200;
      return [
        { lang: "English (en)", count: Math.round(total * 0.72), pct: "72%" },
        { lang: "French (fr)", count: Math.round(total * 0.14), pct: "14%" },
        { lang: "Spanish (es)", count: Math.round(total * 0.08), pct: "8%" },
        { lang: "German (de)", count: Math.round(total * 0.04), pct: "4%" },
        { lang: "Arabic (ar)", count: Math.round(total * 0.02), pct: "2%" }
      ];
    }
    return liveLanguages;
  }, [isSandbox, kpis.totalMessages, liveLanguages]);

  // ─── Unanswered Guest Queries Matrix (Knowledge Gaps) ──────────────────────
  const unansweredQueries = useMemo(() => {
    if (isSandbox) {
      return [
        { id: "ug_1", query: "Can I charge my Tesla / EV overnight on property?", count: 18, confidence: "44%", category: "parking" },
        { id: "ug_2", query: "What is your late checkout fee after 1 PM?", count: 14, confidence: "52%", category: "checkout" },
        { id: "ug_3", query: "Is the outdoor infinity pool heated in winter?", count: 11, confidence: "48%", category: "pool" },
        { id: "ug_4", query: "Do you have gluten-free breakfast items available?", count: 9, confidence: "61%", category: "dining" },
        { id: "ug_5", query: "Can you provide a baby crib for the Deluxe Suite?", count: 7, confidence: "58%", category: "rooms" }
      ];
    }
    return liveUnansweredQueries;
  }, [isSandbox, liveUnansweredQueries]);

  // ─── Hourly Peak Traffic Heatmap (0h to 23h) ──────────────────────────────
  const hourlyTraffic = useMemo(() => {
    if (isSandbox) {
      return [
        { h: "00:00", volume: 14, label: "Night" }, { h: "02:00", volume: 8, label: "Night" },
        { h: "04:00", volume: 4, label: "Night" }, { h: "06:00", volume: 18, label: "Early Morning" },
        { h: "08:00", volume: 54, label: "Morning Rush" }, { h: "10:00", volume: 112, label: "Peak Check-in" },
        { h: "12:00", volume: 98, label: "Noon" }, { h: "14:00", volume: 145, label: "Check-in Rush" },
        { h: "16:00", volume: 168, label: "Peak Evening" }, { h: "18:00", volume: 185, label: "Prime Guest Hours" },
        { h: "20:00", volume: 132, label: "Dining Inquiries" }, { h: "22:00", volume: 64, label: "Late Night" }
      ];
    }
    return liveHourlyTraffic;
  }, [isSandbox, liveHourlyTraffic]);

  // ─── Top Matched FAQs ──────────────────────────────────────────────────────
  const topFaqs = useMemo(() => {
    if (isSandbox) {
      return [
        { q: "What time is check-in and checkout?", count: 1245, pct: "38%" },
        { q: "Do you have on-site secure parking?", count: 890, pct: "27%" },
        { q: "Is breakfast included with standard booking?", count: 756, pct: "23%" },
        { q: "Can I bring my pet / dog?", count: 412, pct: "12%" }
      ];
    }
    return [];
  }, [isSandbox]);

  // ─── Upsell Stats (L2) ─────────────────────────────────────────────────────
  const upsellStats = useMemo(() => {
    if (isSandbox) {
      return [
        { name: "Airport Private Transfer", offered: 450, accepted: 85, rate: "18.8%", revenue: "$7,225" },
        { name: "Late Check-out Privilege", offered: 820, accepted: 142, rate: "17.3%", revenue: "$7,100" },
        { name: "Couples Spa & Massage", offered: 310, accepted: 28, rate: "9.0%", revenue: "$4,200" },
        { name: "Champagne on Arrival", offered: 195, accepted: 38, rate: "19.5%", revenue: "$2,660" }
      ];
    }
    return liveUpsellStats;
  }, [isSandbox, liveUpsellStats]);

  const upsellMetrics = useMemo(() => {
    if (isSandbox) {
      return { rate: "16.4%", revenue: 21185 };
    }
    return liveUpsellMetrics;
  }, [isSandbox, liveUpsellMetrics]);

  // ─── Staff Takeover Leaderboard ────────────────────────────────────────────
  const staffLeaderboard = useMemo(() => {
    if (isSandbox) {
      return [
        { name: "Elena Rostova", role: "Hotel Receptionist", chats: 142, speed: "42s", res: "96.4%" },
        { name: "Carlos Mendez", role: "Front Office Agent", chats: 118, speed: "55s", res: "94.2%" },
        { name: "Alex Mercer", role: "Hotel Manager", chats: 35, speed: "2m 10s", res: "98.1%" },
      ];
    }
    return liveStaffLeaderboard;
  }, [isSandbox, liveStaffLeaderboard]);

  // ─── Quick Add to Knowledge Base Handler ───────────────────────────────────
  const handleSaveToKnowledgeBase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!kbModalQuery || !newFaqAnswer.trim()) return;

    if (isSandbox && sandboxData) {
      const newFaq = {
        id: `faq_${Date.now()}`,
        question: kbModalQuery.query,
        answer: newFaqAnswer,
        category: kbModalQuery.category,
        active: true
      };
      updateData(prev => ({
        ...prev,
        faqs: [newFaq, ...(prev.faqs || [])]
      }));
      showToast(`FAQ added to Knowledge Base for "${kbModalQuery.query}"`, "success");
    } else if (hotelId) {
      try {
        const { error } = await supabase.from("faqs").insert({
          hotel_id: hotelId,
          question: kbModalQuery.query,
          answer: newFaqAnswer,
          category: kbModalQuery.category,
          active: true,
        });
        if (error) throw error;
        showToast(`FAQ published to Knowledge Base: "${kbModalQuery.query}"`, "success");
      } catch (err: any) {
        console.error("[AnalyticsTab] FAQ insert failed:", err);
        showToast(`Failed to save FAQ: ${err.message || "Unknown error"}`, "error");
        return;
      }
    } else {
      showToast("Not connected — cannot save FAQ", "error");
      return;
    }
    setKbModalQuery(null);
    setNewFaqAnswer("");
  };

  // ─── Full Report CSV Exporter ──────────────────────────────────────────────
  const handleExportFullCSV = () => {
    const csvSections: string[] = [];

    csvSections.push(`EVER HOSPITALITY INTELLIGENCE REPORT`);
    csvSections.push(`Generated: ${new Date().toLocaleString()}`);
    csvSections.push(`Period: ${dateRange.label} (${dateRange.startDate.split("T")[0]} to ${dateRange.endDate.split("T")[0]})`);
    csvSections.push(`Tier: ${isLevel2 ? "Growth (Level 2)" : "Starter"}\n`);

    csvSections.push(`EXECUTIVE SUMMARY KPIS`);
    csvSections.push(`Metric,Value`);
    csvSections.push(`Total Message Volume,${kpis.totalMessages}`);
    csvSections.push(`Agent Resolution Rate,${kpis.agentRate}%`);
    csvSections.push(`Staff Handoffs,${kpis.staffHandoffs}`);
    csvSections.push(`Leads Captured,${kpis.leadsCaptured}`);
    csvSections.push(`Avg Response Time,${kpis.avgLatency}`);
    csvSections.push(`Direct Bookings Count,${kpis.bookingCount}`);
    csvSections.push(`Direct Booking Revenue,$${kpis.bookingRevenue.toLocaleString()}`);
    csvSections.push(`Agency 3% Performance Fee,$${kpis.agencyFee.toLocaleString()}\n`);

    if (displayData.length > 0) {
      csvSections.push(`DAILY VOLUME & INTENTS`);
      csvSections.push(`Date,Total Messages,AI Resolved,Staff Escalations,Booking Value,Agency Fee`);
      displayData.forEach(d => {
        csvSections.push(`${d.date},${d.totalVolume},${d.agentVolume},${d.staffVolume},${d.bookingValue},${d.feeAmount}`);
      });
      csvSections.push("");
    }

    if (channelData.length > 0) {
      csvSections.push(`CHANNEL DISTRIBUTION`);
      csvSections.push(`Channel,Volume,Share,MoM Trend`);
      channelData.forEach(c => {
        csvSections.push(`${c.name},${c.value},${c.share},${c.mom}`);
      });
    }

    const blob = new Blob([csvSections.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ever-analytics-report-${dateRange.startDate.split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Structured multi-section CSV exported", "info");
  };

  // ─── JSON Data Downloader ──────────────────────────────────────────────────
  const handleDownloadJSON = () => {
    const payload = {
      meta: {
        hotelId: hotelId || "demo",
        generatedAt: new Date().toISOString(),
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      },
      kpis,
      dailyTrends: displayData,
      channelBreakdown: channelData,
      leadFunnel: funnelData,
      topFaqs,
      upsells: upsellStats,
      unansweredQueries
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ever-analytics-${dateRange.startDate.split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Analytics JSON payload downloaded", "info");
  };

  // ─── Printable PDF Report Handler (Scoped Iframe) ──────────────────────────
  const handlePrintReport = useCallback(() => {
    const container = printContainerRef.current;
    if (!container) return;

    const reportHtml = container.innerHTML;
    const styles = `
      @page { margin: 16mm 20mm; }
      * { box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        background: #ffffff;
        color: #111827;
        font-size: 11px;
        line-height: 1.6;
        margin: 0;
        padding: 0;
      }
      h2 { font-size: 20px; font-weight: 800; color: #111827; margin: 0 0 4px; }
      h3 { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em; color: #6b7280; margin: 0 0 12px; }
      p { margin: 0 0 6px; }
      strong { font-weight: 700; }
      table { width: 100%; border-collapse: collapse; font-size: 10.5px; }
      th { padding: 7px 10px; text-align: left; font-size: 9px; font-weight: 700;
           text-transform: uppercase; letter-spacing: .07em; color: #6b7280;
           border-bottom: 1.5px solid #e5e7eb; }
      td { padding: 7px 10px; border-bottom: 1px solid #f3f4f6; color: #111827; }
      .text-right { text-align: right; }
      .font-mono { font-family: 'SFMono-Regular', Consolas, monospace; }
      .font-bold { font-weight: 700; }
      .grid { display: grid; gap: 12px; }
      .grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
      .grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
      .rounded-xl { border-radius: 10px; }
      .border { border: 1px solid #e5e7eb; }
      .p-3\\.5, .p-3 { padding: 12px; }
      .p-4 { padding: 16px; }
      .p-6, .md\\:p-10 { padding: 0 !important; }
      .bg-dash-canvas, .bg-dash-surface { background: #f9fafb !important; }
      .text-\\[\\#EA6639\\] { color: #EA6639 !important; }
      .text-emerald-500 { color: #10b981 !important; }
      .text-amber-500 { color: #f59e0b !important; }
      .space-y-8 > * + * { margin-top: 24px; }
      .space-y-4 > * + * { margin-top: 12px; }
      .space-y-3 > * + * { margin-top: 10px; }
      .space-y-2 > * + * { margin-top: 8px; }
      .pb-6 { padding-bottom: 20px; }
      .border-b { border-bottom: 1px solid #e5e7eb; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .items-center { align-items: center; }
      .gap-2 { gap: 8px; }
      .text-dash-text-muted { color: #6b7280; }
      .text-dash-text { color: #111827; }
      .text-dash-text-sec { color: #374151; }
    `;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "none";
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ever Hospitality Intelligence Report</title>
          <style>${styles}</style>
        </head>
        <body>
          ${reportHtml}
        </body>
      </html>
    `);
    doc.close();

    const triggerPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error("[AnalyticsTab] Scoped print failed:", err);
      } finally {
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        }, 1000);
      }
    };

    iframe.onload = triggerPrint;
    setTimeout(triggerPrint, 350);
  }, []);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* ── Header Title & Master Control Bar ───────────────────────────────── */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-dash-border">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA6639]/10 text-[#EA6639] flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-base md:text-lg font-bold text-dash-text tracking-tight flex items-center gap-2">
                Hospitality Intelligence &amp; Reporting Studio
              </h1>
              <p className="text-xs text-dash-text-sec">Interactive multi-channel diagnostics, intent discovery, and report publishing.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap w-full lg:w-auto justify-end">
          {/* Universal Date Range Picker */}
          <DateRangePicker value={dateRange} onChange={setDateRange} />

          {/* Master Export Actions */}
          <button
            type="button"
            onClick={handleExportFullCSV}
            className="h-8 px-3 bg-dash-surface border border-dash-border rounded-lg text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5 shadow-xs"
            title="Download complete structured CSV"
          >
            <Download className="w-3.5 h-3.5 text-dash-text-muted" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("builder")}
            className="h-8 px-3 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 shadow-xs"
            title="Build custom executive report"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Report Studio</span>
          </button>

          {isSandbox && (
            <button
              type="button"
              onClick={() => {
                regenerate();
                showToast("Sandbox analytical trends regenerated with fresh distributions", "success");
              }}
              className="h-8 w-8 rounded-lg bg-dash-surface border border-dash-border flex items-center justify-center text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-hover transition-colors"
              title="Regenerate Demo Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Sub-Tab Navigation Bar ────────────────────────────────────────── */}
      <div className="shrink-0 bg-dash-canvas rounded-xl border border-dash-border shadow-xs overflow-hidden">
        <div className="flex items-stretch overflow-x-auto hide-scrollbar">
          {[
            { id: "cockpit", label: "Executive Cockpit", icon: BarChart3 },
            { id: "intent", label: "Conversation & Intents", icon: Sparkles },
            { id: "sla", label: "Agent & Staff SLAs", icon: Clock },
            { id: "revenue", label: "Commercial Yield & Attribution", icon: DollarSign },
            { id: "builder", label: "Report Builder Studio", icon: Printer },
          ].map((tab, idx, arr) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as AnalyticsSubTab)}
              className={`relative flex items-center gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all shrink-0 focus:outline-none ${
                idx < arr.length - 1 ? "border-r border-dash-border" : ""
              } ${
                activeSubTab === tab.id
                  ? "bg-[#EA6639]/10 text-[#EA6639]"
                  : "text-dash-text-sec hover:text-dash-text hover:bg-dash-surface"
              }`}
            >
              {activeSubTab === tab.id && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#EA6639] rounded-t-full" />
              )}
              <tab.icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 1. EXECUTIVE COCKPIT PERSPECTIVE                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "cockpit" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Executive KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { 
                label: "Total Message Volume", 
                value: kpis.totalMessages.toLocaleString(), 
                trend: isSandbox ? "+24.2%" : (kpis.totalMessages > 0 ? "Active" : "—"), 
                positive: true, 
                icon: MessageSquare, 
                note: isSandbox ? "Across 3 channels" : (kpis.totalMessages > 0 ? `${channelData.length} channels` : "No channel traffic") 
              },
              { 
                label: "Agent Resolution Rate", 
                value: `${kpis.agentRate}%`, 
                trend: isSandbox ? "+1.8%" : (kpis.totalMessages > 0 ? "Target: 85%" : "—"), 
                positive: true, 
                icon: CheckCircle2, 
                note: kpis.totalMessages > 0 ? "Without staff handoff" : "Awaiting inquiries" 
              },
              { 
                label: "Staff Handoff Count", 
                value: kpis.staffHandoffs.toLocaleString(), 
                trend: isSandbox ? "-4.5%" : (kpis.staffHandoffs > 0 ? "Handled" : "—"), 
                positive: true, 
                icon: Users, 
                note: "Handled by front desk" 
              },
              { 
                label: "Avg Response Latency", 
                value: kpis.avgLatency, 
                trend: isSandbox ? "-0.2s" : (kpis.avgLatency !== "—" ? "Target < 2s" : "—"), 
                positive: true, 
                icon: Clock, 
                note: "P50 automated reply" 
              },
              { 
                label: "Guest Satisfaction", 
                value: kpis.satisfaction > 0 ? `${kpis.satisfaction} / 5.0` : "—", 
                trend: isSandbox ? "+0.3" : (kpis.satisfaction > 0 ? "Rated" : "—"), 
                positive: true, 
                icon: Sparkles, 
                note: isSandbox ? "Based on 420 reviews" : (kpis.satisfaction > 0 ? "Live guest feedback" : "Awaiting ratings") 
              },
            ].map((kpi, i) => (
              <div key={i} className="bg-dash-surface p-4 rounded-xl border border-dash-border hover:border-[#EA6639]/30 transition-all shadow-xs flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold text-dash-text-muted tracking-wider">{kpi.label}</span>
                  <kpi.icon className="w-3.5 h-3.5 text-dash-text-muted" />
                </div>
                <div className="my-1">
                  <span className="text-2xl font-bold font-mono text-dash-text">{kpi.value}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-dash-border-hairline text-[11px]">
                  <span className={`font-bold flex items-center gap-0.5 ${kpi.trend === "—" ? "text-dash-text-muted" : kpi.positive ? "text-emerald-500" : "text-rose-500"}`}>
                    {kpi.trend !== "—" && (kpi.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
                    {kpi.trend}
                  </span>
                  <span className="text-dash-text-muted text-[10px] truncate max-w-[90px]">{kpi.note}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Primary Volume & Resolution Trend Chart */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            <div className="xl:col-span-2">
              <InteractiveChartCard
              title="Message Volume & Resolution Breakdown"
              subtitle="Drag the scrubber below to zoom in on specific spikes, weekends, or dates."
              data={displayData}
              xAxisKey="displayDate"
              height={300}
              allowBrush={true}
              dataKeys={[
                { key: "agentVolume", name: "AI Agent Resolved", color: COLORS.secondary },
                { key: "staffVolume", name: "Staff Escalations", color: COLORS.quaternary },
                { key: "totalVolume", name: "Total Messages", color: COLORS.primary },
              ]}
              onMaximize={() => setMaximizedChart({
                id: "volume_breakdown",
                title: "Message Volume & Resolution Breakdown (Detailed Inspection)",
                subtitle: "Full timeline scrub with per-turn point analysis",
                data: displayData,
                xAxisKey: "date",
                dataKeys: [
                  { key: "agentVolume", name: "AI Agent Resolved", color: COLORS.secondary },
                  { key: "staffVolume", name: "Staff Escalations", color: COLORS.quaternary },
                  { key: "totalVolume", name: "Total Messages", color: COLORS.primary },
                ]
              })}
            />
          </div>

            {/* Channel Traffic Share Donut & MoM Trends */}
            <div className="bg-dash-surface p-4 md:p-5 rounded-xl border border-dash-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-dash-border-hairline">
                <div>
                  <h3 className="text-sm font-bold text-dash-text">Channel Distribution</h3>
                  <p className="text-[11px] text-dash-text-sec">Traffic share across active channels.</p>
                </div>
                {channelData.length > 0 && (
                  <span className="text-[10px] font-bold text-[#EA6639] uppercase tracking-wider">
                    {channelData.length} Channels
                  </span>
                )}
              </div>

              {channelData.length === 0 || channelData.every(c => c.value === 0) ? (
                <EmptyStateBox
                  icon={MessageSquare}
                  title="No Channel Traffic Recorded"
                  description="Connect your channels in Channel Settings to begin receiving guest inquiries."
                  actionLabel={onNavigate ? "Configure Channels" : undefined}
                  onAction={onNavigate ? () => onNavigate("channels") : undefined}
                />
              ) : (
                <>
                  <div className="h-44 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={68} paddingAngle={3} dataKey="value" stroke="none">
                          {channelData.map((entry, idx) => (
                            <Cell key={`cell-${idx}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-dash-text">{kpis.totalMessages.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold text-dash-text-muted">Total Queries</span>
                    </div>
                  </div>

                  <div className="space-y-2 mt-2 pt-2 border-t border-dash-border">
                    {channelData.map((channel, i) => (
                      <div key={i} className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-dash-canvas/50">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: channel.color }} />
                          <span className="font-medium text-dash-text">{channel.name}</span>
                        </div>
                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-dash-text font-semibold">{channel.share}</span>
                          <span className="text-emerald-500 font-bold text-[11px]">{channel.mom}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Secondary Trends: Lead Conversion Funnel & Top FAQs */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            {/* Lead Conversion Funnel */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dash-border-hairline">
                <div>
                  <h3 className="text-sm font-bold text-dash-text">Guest Acquisition &amp; Booking Funnel</h3>
                  <p className="text-[11px] text-dash-text-sec">Conversion efficiency from first digital greeting to confirmed folio booking.</p>
                </div>
                {funnelData.length > 0 && funnelData[3] && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EA6639]/10 text-[#EA6639]">
                    {funnelData[3].rate} Net Yield
                  </span>
                )}
              </div>

              {funnelData.length === 0 || funnelData.every(f => f.count === 0) ? (
                <EmptyStateBox
                  icon={Users}
                  title="No Guest Lead Progression Yet"
                  description="Guest contact inquiries captured across chat channels will automatically populate this 4-stage funnel."
                  actionLabel={onNavigate ? "View CRM Leads" : undefined}
                  onAction={onNavigate ? () => onNavigate("crm") : undefined}
                />
              ) : (
                <div className="space-y-3 pt-2">
                  {funnelData.map((step, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-dash-text flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-dash-canvas border border-dash-border flex items-center justify-center text-[10px] font-bold text-dash-text-muted">
                            {i + 1}
                          </span>
                          {step.step}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-dash-text">{step.count.toLocaleString()}</span>
                          <span className="text-dash-text-muted text-[10px]">({step.rate})</span>
                        </div>
                      </div>
                      <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden border border-dash-border-hairline">
                        <div className="h-full rounded-full transition-all duration-500" style={{ width: step.rate, backgroundColor: step.fill }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Top FAQ Matches & Knowledge Base Insights */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-dash-border-hairline">
                <div>
                  <h3 className="text-sm font-bold text-dash-text">Highest Frequency Guest Inquiries</h3>
                  <p className="text-[11px] text-dash-text-sec">Identifies top informational requirements resolved automatically.</p>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigate ? onNavigate("knowledge_base") : null}
                  className="text-xs font-semibold text-[#EA6639] hover:underline flex items-center gap-1"
                >
                  Manage KB <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              {topFaqs.length === 0 ? (
                <EmptyStateBox
                  icon={Sparkles}
                  title="No FAQ Telemetry Recorded"
                  description="Frequently asked guest questions and autonomous knowledge resolutions will rank here."
                  actionLabel={onNavigate ? "Open Knowledge Base" : undefined}
                  onAction={onNavigate ? () => onNavigate("knowledge_base") : undefined}
                />
              ) : (
                <div className="space-y-2.5">
                  {topFaqs.map((faq, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-dash-canvas border border-dash-border flex items-center justify-between gap-3">
                      <div className="flex items-start gap-2 max-w-[70%]">
                        <span className="w-4 h-4 rounded bg-[#EA6639]/10 text-[#EA6639] font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                          #{i + 1}
                        </span>
                        <span className="text-xs font-medium text-dash-text line-clamp-1">{faq.q}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-mono font-bold text-dash-text">{faq.count}</span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border text-dash-text-muted">
                          {faq.pct}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 2. CONVERSATION & INTENT INTELLIGENCE PERSPECTIVE                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "intent" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Intent Breakdown Stacked Bar with Scrubber */}
          <InteractiveChartCard
            title="Daily Intent Breakdown & Topic Categorization"
            subtitle="Understand whether guests are inquiring about policies, booking rooms, placing food orders, or requesting front desk staff."
            data={displayData}
            xAxisKey="displayDate"
            height={300}
            defaultMode="bar"
            allowBrush={true}
            dataKeys={[
              { key: "faqIntent", name: "Property FAQs", color: COLORS.primary },
              { key: "bookingIntent", name: "Direct Booking Enquiries", color: COLORS.secondary },
              { key: "orderIntent", name: "Room Folio & POS Orders", color: COLORS.purple },
              { key: "handoffIntent", name: "Escalated to Staff", color: COLORS.tertiary },
            ]}
          />

          {/* Unanswered Queries Matrix (Knowledge Gaps to Fix) */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-2 border-b border-dash-border">
              <div>
                <h3 className="text-sm font-bold text-dash-text flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Knowledge Gap Discovery Matrix (Unanswered Queries)
                </h3>
                <p className="text-xs text-dash-text-sec mt-0.5">
                  Questions where AI confidence fell below threshold. Click "Add to KB" to instantly teach the AI agent.
                </p>
              </div>
              {unansweredQueries.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                  {unansweredQueries.length} Actionable Gaps
                </span>
              )}
            </div>

            {unansweredQueries.length === 0 ? (
              <div className="py-10 flex flex-col items-center justify-center text-center">
                <CheckCircle2 className="w-9 h-9 text-emerald-500 mb-2" />
                <h4 className="text-sm font-bold text-dash-text">Zero Knowledge Gaps Detected</h4>
                <p className="text-xs text-dash-text-sec mt-1 max-w-sm">
                  All guest inquiries are being successfully resolved by the AI agent without unrecognized questions or low-confidence fallbacks.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Unanswered Guest Query</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-right">Inquiry Frequency</th>
                      <th className="py-2.5 px-3 text-right">AI Confidence</th>
                      <th className="py-2.5 px-3 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-hairline text-xs">
                    {unansweredQueries.map(item => (
                      <tr key={item.id} className="hover:bg-dash-canvas/60 transition-colors">
                        <td className="py-3 px-3 font-medium text-dash-text">{item.query}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-dash-canvas border border-dash-border text-dash-text-muted font-bold">
                            {item.category}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dash-text">{item.count} times</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-500">{item.confidence}</td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setKbModalQuery({ query: item.query, category: item.category })}
                            className="px-3 py-1 rounded-lg bg-[#EA6639] hover:bg-[#EA6639]/90 text-white font-semibold text-xs transition-colors shadow-xs"
                          >
                            Add to KB
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 24-Hour Peak Traffic Heatmap & Language Matrix */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* Hourly Traffic Density Heatmap */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border xl:col-span-2 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-dash-border-hairline">
                <div>
                  <h3 className="text-sm font-bold text-dash-text">24-Hour Guest Traffic Heatmap</h3>
                  <p className="text-[11px] text-dash-text-sec">Highlights peak hours when human front desk staffing is most vital.</p>
                </div>
                <span className="text-[10px] font-bold text-dash-text-muted uppercase">HOTEL LOCAL TIMEZONE</span>
              </div>

              {hourlyTraffic.length === 0 || hourlyTraffic.every(h => h.volume === 0) ? (
                <EmptyStateBox
                  icon={Clock}
                  title="No Hourly Traffic Telemetry Yet"
                  description="Hour-by-hour message traffic will plot here automatically as conversations occur."
                />
              ) : (
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyTraffic} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                      <XAxis dataKey="h" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                      <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="volume" name="Queries Per Hour" fill={COLORS.primary} radius={[4, 4, 0, 0]}>
                        {hourlyTraffic.map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={entry.volume > 130 ? "#EA6639" : entry.volume > 70 ? "#F59E0B" : "#71717A"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Language Breakdown Bar Chart */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between mb-2 pb-2 border-b border-dash-border-hairline">
                <h3 className="text-sm font-bold text-dash-text">Language Detection</h3>
                <span className="text-[10px] font-bold text-dash-text-muted">AUTO-TRANSLATED</span>
              </div>

              {languageData.length === 0 ? (
                <EmptyStateBox
                  icon={Sparkles}
                  title="No Languages Detected Yet"
                  description="Guest language distribution will appear here as multi-lingual inquiries arrive."
                />
              ) : (
                <div className="space-y-3.5 my-auto">
                  {languageData.map((lang, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-dash-text">{lang.lang}</span>
                        <span className="font-mono text-dash-text">{lang.count.toLocaleString()} ({lang.pct})</span>
                      </div>
                      <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden border border-dash-border-hairline">
                        <div className="h-full bg-[#EA6639] rounded-full" style={{ width: lang.pct }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <p className="text-[11px] text-dash-text-muted pt-2 border-t border-dash-border mt-3">
                EVER auto-detects Tier-1 &amp; Tier-2 Unicode stopwords, maintaining real-time multilingual fluency.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 3. AGENT & STAFF SLA PERFORMANCE PERSPECTIVE                          */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "sla" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Response Latency Histogram with P50/P90/P99 */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 pb-2 border-b border-dash-border">
              <div>
                <h3 className="text-sm font-bold text-dash-text">Response Time Distribution &amp; Percentile SLA Latency</h3>
                <p className="text-xs text-dash-text-sec">Breakdown of system generation latency across all connected channels.</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="px-2.5 py-1 rounded-md bg-dash-canvas border border-dash-border text-dash-text">
                  P50: <strong className={isSandbox || livePercentiles.p50 !== "—" ? "text-emerald-500" : "text-dash-text-muted"}>{isSandbox ? "1.1s" : livePercentiles.p50}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-dash-canvas border border-dash-border text-dash-text">
                  P90: <strong className={isSandbox || livePercentiles.p90 !== "—" ? "text-emerald-500" : "text-dash-text-muted"}>{isSandbox ? "1.8s" : livePercentiles.p90}</strong>
                </span>
                <span className="px-2.5 py-1 rounded-md bg-dash-canvas border border-dash-border text-dash-text">
                  P99: <strong className={isSandbox || livePercentiles.p99 !== "—" ? "text-amber-500" : "text-dash-text-muted"}>{isSandbox ? "3.2s" : livePercentiles.p99}</strong>
                </span>
              </div>
            </div>

            {latencyData.length === 0 ? (
              <EmptyStateBox
                icon={Clock}
                title="No Latency Measurements Recorded"
                description="System generation and network round-trip response benchmarks will populate with live traffic."
              />
            ) : (
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={latencyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis dataKey="bucket" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Queries" fill={COLORS.secondary} radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Handoff Rate Over Time with Anomaly Flagging */}
          <InteractiveChartCard
            title="Human Staff Escalation Rate Over Time (%)"
            subtitle="Monitors the percentage of chats escalated to human receptionists. Points with >2x baseline indicate operational spikes."
            data={displayData}
            xAxisKey="displayDate"
            height={280}
            defaultMode="line"
            allowBrush={true}
            dataKeys={[
              { key: "handoffRate", name: "Staff Escalation Rate (%)", color: COLORS.tertiary },
            ]}
          />

          {/* Staff Member Takeover Leaderboard */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-xs">
            <h3 className="text-sm font-bold text-dash-text mb-3 pb-2 border-b border-dash-border">
              Staff Handoff Response &amp; Takeover Leaderboard
            </h3>
            {staffLeaderboard.length === 0 ? (
              <EmptyStateBox
                icon={Users}
                title="No Staff Takeovers Recorded"
                description="Front desk agents who resolve escalated guest chats will be tracked here with speed and resolution metrics."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Front Desk Team Member</th>
                      <th className="py-2.5 px-3">Role</th>
                      <th className="py-2.5 px-3 text-right">Escalations Taken Over</th>
                      <th className="py-2.5 px-3 text-right">Avg Response Time</th>
                      <th className="py-2.5 px-3 text-right">Resolution Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-hairline">
                    {staffLeaderboard.map((staff, i) => (
                      <tr key={i} className="hover:bg-dash-canvas/50">
                        <td className="py-3 px-3 font-semibold text-dash-text">{staff.name}</td>
                        <td className="py-3 px-3 text-dash-text-sec">{staff.role}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dash-text">{staff.chats}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-500">{staff.speed || "—"}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dash-text">{staff.res || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 4. COMMERCIAL REVENUE YIELD PERSPECTIVE (LEVEL 2)                     */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "revenue" && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Revenue KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-dash-text-muted">Total Direct Booking Value</span>
              <div className="text-2xl font-bold font-mono text-dash-text mt-1">{formatMoney(kpis.bookingRevenue)}</div>
              <span className={`text-[11px] font-semibold mt-1 block ${kpis.bookingRevenue > 0 ? "text-emerald-500" : "text-dash-text-muted"}`}>
                {isSandbox ? "+18.4% vs previous period" : (kpis.bookingRevenue > 0 ? "Live direct reservations" : "No bookings recorded yet")}
              </span>
            </div>
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-dash-text-muted">Direct Bookings Confirmed</span>
              <div className="text-2xl font-bold font-mono text-dash-text mt-1">{kpis.bookingCount}</div>
              <span className="text-[11px] font-semibold text-dash-text-sec mt-1 block">Zero OTA commission</span>
            </div>
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-dash-text-muted">Agency Performance Fee (3%)</span>
              <div className="text-2xl font-bold font-mono text-dash-text mt-1">{formatMoney(kpis.agencyFee)}</div>
              <span className="text-[11px] font-semibold text-[#EA6639] mt-1 block">Pay-on-success model</span>
            </div>
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
              <span className="text-[10px] font-bold uppercase text-dash-text-muted">Upsell Acceptance Rate</span>
              <div className="text-2xl font-bold font-mono text-dash-text mt-1">{upsellMetrics.rate}</div>
              <span className={`text-[11px] font-semibold mt-1 block ${upsellMetrics.revenue > 0 ? "text-emerald-500" : "text-dash-text-muted"}`}>
                {formatMoney(upsellMetrics.revenue)} extra revenue
              </span>
            </div>
          </div>

          {/* Daily Booking Revenue & Agency Fee Chart */}
          <InteractiveChartCard
            title="Direct Booking Revenue & Agency Fee Reconciliation ($)"
            subtitle="Tracks confirmed in-chat bookings and the corresponding 3% performance fee."
            data={displayData}
            xAxisKey="displayDate"
            height={300}
            defaultMode="bar"
            allowBrush={true}
            dataKeys={[
              { key: "bookingValue", name: "Hotel Direct Revenue ($)", color: COLORS.secondary },
              { key: "feeAmount", name: "Agency Fee (3%)", color: COLORS.primary },
            ]}
          />

          {/* Upsell Package Performance Table */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-xs">
            <h3 className="text-sm font-bold text-dash-text mb-3 pb-2 border-b border-dash-border">
              Upsell Package Conversions &amp; Folio Yield
            </h3>
            {upsellStats.length === 0 ? (
              <EmptyStateBox
                icon={DollarSign}
                title="No Upsell Conversions Yet"
                description="High-margin upsells (late checkout, room upgrades, spa packages) accepted by guests will be tracked here."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                      <th className="py-2.5 px-3">Upsell Package</th>
                      <th className="py-2.5 px-3 text-right">Offered by AI</th>
                      <th className="py-2.5 px-3 text-right">Accepted &amp; Folio-Posted</th>
                      <th className="py-2.5 px-3 text-right">Conversion Rate</th>
                      <th className="py-2.5 px-3 text-right">Total Net Yield</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-hairline">
                    {upsellStats.map((u, i) => (
                      <tr key={i} className="hover:bg-dash-canvas/50">
                        <td className="py-3 px-3 font-semibold text-dash-text">{u.name}</td>
                        <td className="py-3 px-3 text-right font-mono text-dash-text">{u.offered}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-emerald-500">{u.accepted}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-dash-text">{u.rate}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[#EA6639]">{u.revenue}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* 5. CUSTOM REPORT BUILDER STUDIO PERSPECTIVE                           */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "builder" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          
          {/* Builder Controls Ribbon */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-bold text-dash-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EA6639]" />
                Executive Brief Publishing Studio
              </h3>
              <p className="text-xs text-dash-text-sec mt-0.5">
                Generate clean, confidential PDF summaries for hotel owners, general managers, and revenue leaders.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-4 py-2 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save PDF</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-3.5 py-2 bg-dash-canvas border border-dash-border hover:bg-dash-surface text-dash-text font-semibold text-xs rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-dash-text-muted" />
                <span>Download JSON Payload</span>
              </button>
            </div>
          </div>

          {/* Section Selector Checkboxes */}
          <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-xs">
            <span className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider block mb-2.5">
              Include In Report:
            </span>
            <div className="flex flex-wrap gap-3">
              {[
                { id: "summary", label: "Executive KPIs Summary" },
                { id: "channels", label: "Channel Performance Audit" },
                { id: "faqs", label: "Knowledge Recommendations" },
                { id: "revenue", label: "Commercial Yield Reconciliation" },
              ].map(sec => (
                <label key={sec.id} className="flex items-center gap-2 text-xs font-semibold text-dash-text cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={reportIncludedSections[sec.id] !== false}
                    onChange={(e) => setReportIncludedSections(prev => ({ ...prev, [sec.id]: e.target.checked }))}
                    className="w-4 h-4 rounded text-[#EA6639] focus:ring-[#EA6639] border-dash-border"
                  />
                  <span>{sec.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Printable Report Document Preview */}
          <div 
            ref={printContainerRef}
            id="ever-report-printable"
            className="bg-dash-surface p-6 md:p-10 rounded-2xl border border-dash-border shadow-sm space-y-8 max-w-4xl mx-auto"
          >
            {/* Document Header */}
            <div className="border-b border-dash-border pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#EA6639] block mb-1">
                  EVER HOSPITALITY PLATFORM · CONFIDENTIAL
                </span>
                <h2 className="text-xl md:text-2xl font-black text-dash-text tracking-tight">
                  Hospitality Intelligence &amp; Performance Audit
                </h2>
                <p className="text-xs text-dash-text-sec mt-1">
                  Reporting Window: <strong>{dateRange.label}</strong> ({dateRange.startDate.split("T")[0]} to {dateRange.endDate.split("T")[0]})
                </p>
              </div>

              <div className="text-right text-xs font-mono text-dash-text-muted">
                <div>Generated: {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</div>
                <div className="text-[10px] text-emerald-500 font-bold">VERIFIED CORE TELEMETRY</div>
              </div>
            </div>

            {/* Included Section: Executive Summary */}
            {reportIncludedSections.summary && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted">
                  1. Executive KPI Overview
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Total Volume</span>
                    <span className="text-xl font-bold font-mono text-dash-text">{kpis.totalMessages.toLocaleString()}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Agent Autonomous Rate</span>
                    <span className="text-xl font-bold font-mono text-emerald-500">{kpis.agentRate}%</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Leads Captured</span>
                    <span className="text-xl font-bold font-mono text-dash-text">{kpis.leadsCaptured}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Direct Revenue</span>
                    <span className="text-xl font-bold font-mono text-[#EA6639]">{formatMoney(kpis.bookingRevenue)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Included Section: Channels */}
            {reportIncludedSections.channels && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted">
                  2. Channel Performance Audit
                </h3>
                {channelData.length === 0 ? (
                  <p className="text-xs text-dash-text-muted italic py-2">No channel traffic recorded for this reporting window.</p>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                        <th className="py-2">Channel Name</th>
                        <th className="py-2 text-right">Volume</th>
                        <th className="py-2 text-right">Traffic Share</th>
                        <th className="py-2 text-right">Month-over-Month</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dash-border-hairline font-mono">
                      {channelData.map((c, i) => (
                        <tr key={i}>
                          <td className="py-2 font-sans font-medium text-dash-text">{c.name}</td>
                          <td className="py-2 text-right text-dash-text">{c.value.toLocaleString()}</td>
                          <td className="py-2 text-right text-dash-text font-bold">{c.share}</td>
                          <td className="py-2 text-right text-emerald-500">{c.mom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Included Section: Knowledge Gaps */}
            {reportIncludedSections.faqs && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted">
                  3. Critical Knowledge Base Recommendations
                </h3>
                {unansweredQueries.length === 0 ? (
                  <p className="text-xs text-dash-text-muted italic py-2">Zero knowledge gaps detected — all guest inquiries resolved smoothly.</p>
                ) : (
                  <div className="space-y-2">
                    {unansweredQueries.slice(0, 3).map(ug => (
                      <div key={ug.id} className="p-3 rounded-lg bg-dash-canvas border border-dash-border flex justify-between items-center text-xs">
                        <span className="font-medium text-dash-text">{ug.query}</span>
                        <span className="text-amber-500 font-bold font-mono">Frequency: {ug.count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Included Section: Commercial Revenue */}
            {reportIncludedSections.revenue && (
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-dash-text-muted">
                  4. Commercial Yield &amp; Fee Reconciliation
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Direct Bookings</span>
                    <span className="text-lg font-bold font-mono text-dash-text">{kpis.bookingCount}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">Direct Gross Value</span>
                    <span className="text-lg font-bold font-mono text-dash-text">{formatMoney(kpis.bookingRevenue)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dash-border bg-dash-canvas">
                    <span className="text-[10px] font-bold uppercase text-dash-text-muted block mb-1">3% Agency Commission</span>
                    <span className="text-lg font-bold font-mono text-[#EA6639]">{formatMoney(kpis.agencyFee)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="pt-6 border-t border-dash-border flex flex-col sm:flex-row justify-between items-center text-[11px] text-dash-text-muted gap-2">
              <span>Ever Hospitality Solutions · Confidential Internal Report</span>
              <span>Generated in Ever Operating Hub</span>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* FULLSCREEN DETAIL INSPECTION MODAL                                    */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {maximizedChart && (
        <Modal
          isOpen={!!maximizedChart}
          onClose={() => setMaximizedChart(null)}
          title={maximizedChart.title}
          maxWidth="max-w-5xl"
        >
          <div className="space-y-5">
            <p className="text-xs text-dash-text-sec">{maximizedChart.subtitle}</p>
            
            <div className="h-96 w-full border border-dash-border rounded-xl p-3 bg-dash-canvas">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={maximizedChart.data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    {maximizedChart.dataKeys.map(k => (
                      <linearGradient key={k.key} id={`zoom_${k.key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={k.color} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={k.color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                  <XAxis dataKey={maximizedChart.xAxisKey} stroke={COLORS.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke={COLORS.textMuted} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {maximizedChart.dataKeys.map(k => (
                    <Area
                      key={k.key}
                      type="monotone"
                      dataKey={k.key}
                      name={k.name}
                      stroke={k.color}
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill={`url(#zoom_${k.key})`}
                    />
                  ))}
                  <Brush dataKey={maximizedChart.xAxisKey} height={30} stroke="#EA6639" fill="var(--dash-surface)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Granular Table View */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-dash-text uppercase tracking-wider">Tabular Data Grid</h4>
              <div className="max-h-60 overflow-y-auto border border-dash-border rounded-lg bg-dash-canvas">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="sticky top-0 bg-dash-surface border-b border-dash-border text-dash-text-muted text-[10px] uppercase font-bold">
                    <tr>
                      <th className="px-3 py-2">Date / Bucket</th>
                      {maximizedChart.dataKeys.map(k => (
                        <th key={k.key} className="px-3 py-2 text-right">{k.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-hairline font-mono text-dash-text text-[11px]">
                    {maximizedChart.data.map((row, idx) => (
                      <tr key={idx} className="hover:bg-dash-surface-hover/50">
                        <td className="px-3 py-1.5 font-sans font-medium">{row[maximizedChart.xAxisKey]}</td>
                        {maximizedChart.dataKeys.map(k => (
                          <td key={k.key} className="px-3 py-1.5 text-right font-semibold">
                            {row[k.key]?.toLocaleString() ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-dash-border">
              <button
                type="button"
                onClick={() => setMaximizedChart(null)}
                className="px-4 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-semibold hover:bg-dash-surface-hover transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* QUICK ADD TO KNOWLEDGE BASE MODAL                                      */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {kbModalQuery && (
        <Modal
          isOpen={!!kbModalQuery}
          onClose={() => setKbModalQuery(null)}
          title="Add Knowledge Base Resolution"
          maxWidth="max-w-lg"
        >
          <form onSubmit={handleSaveToKnowledgeBase} className="space-y-4">
            <div className="p-3 rounded-lg bg-dash-canvas border border-dash-border">
              <span className="text-[10px] uppercase font-bold text-dash-text-muted block mb-1">Guest Query</span>
              <p className="text-xs font-semibold text-dash-text">{kbModalQuery.query}</p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-mono bg-dash-surface border border-dash-border text-dash-text-muted uppercase">
                Category: {kbModalQuery.category}
              </span>
            </div>

            <div>
              <label className="text-xs font-bold uppercase text-dash-text-muted block mb-1.5">
                Official Answer &amp; Policy
              </label>
              <textarea
                value={newFaqAnswer}
                onChange={(e) => setNewFaqAnswer(e.target.value)}
                placeholder="Type the exact property answer the AI should deliver when asked this question..."
                rows={4}
                required
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text placeholder:text-dash-text-muted focus:outline-none focus:border-[#EA6639]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
              <button
                type="button"
                onClick={() => setKbModalQuery(null)}
                className="px-4 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs font-semibold text-dash-text hover:bg-dash-surface"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
              >
                Save &amp; Train AI
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
