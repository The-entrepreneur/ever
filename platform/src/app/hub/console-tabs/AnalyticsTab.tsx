import React, { useState, useMemo } from "react";
import { 
  Download, Users, MessageSquare, CheckCircle2, TrendingDown, 
  ChevronDown, Database, RefreshCw, AlertCircle, BarChart3, Clock, DollarSign
} from "lucide-react";
import { 
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../shared/ToastContext";

// ─── Shared Theme Colors ──────────────────────────────────────────────────
const COLORS = {
  primary: "#EA6639", // Core brand orange
  secondary: "#10B981", // Emerald green for positive/bot
  tertiary: "#F59E0B", // Amber for warnings/handoffs
  quaternary: "#3B82F6", // Blue for agent/human
  bg: "transparent",
  grid: "rgba(255,255,255,0.05)",
  textMuted: "#71717A"
};

// ─── Helper for Chart Tooltips ────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg shadow-xl text-xs">
        <p className="font-semibold text-zinc-100 mb-2">{label}</p>
        {payload.map((entry: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-zinc-400">{entry.name}:</span>
            <span className="font-mono font-medium text-zinc-100">
              {entry.value}{entry.name.includes('Rate') || entry.name.includes('%') ? '%' : ''}
              {entry.name.includes('Revenue') || entry.name.includes('Fee') ? '$' : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function AnalyticsTab() {
  const { user, subscriptionStatus } = useAuth();
  const { showToast } = useToast();
  
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [seeding, setSeeding] = useState(false);
  const [dataGenerated, setDataGenerated] = useState(false);

  // ─── Access & Tier Logic ──────────────────────────────────────────────
  const isSandbox = user?.email?.toLowerCase().includes("dero") || 
                    user?.email?.toLowerCase().includes("test") || 
                    user?.email?.toLowerCase().includes("demo");
                    
  // Assume L2 features (Bookings, Orders) are for Growth/Pro tiers, or Sandbox
  const isLevel2 = subscriptionStatus === "pro" || subscriptionStatus === "enterprise" || subscriptionStatus === "growth" || isSandbox;

  // ─── Mock Data Generators ─────────────────────────────────────────────
  const generateData = () => {
    // Generate 30 days of daily data
    const days = [];
    let baseVolume = 150;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      // Random walk for volume
      baseVolume = Math.max(50, baseVolume + (Math.random() - 0.4) * 40);
      
      const botCount = Math.floor(baseVolume * (0.8 + Math.random() * 0.15));
      const agentCount = Math.floor(baseVolume - botCount);
      const handoffRate = (agentCount / baseVolume) * 100;
      
      const enquired = Math.floor(baseVolume * 0.4);
      const booked = Math.floor(enquired * 0.15);
      const bookingValue = booked * 250;
      const feeAmount = bookingValue * 0.03; // 3% fee

      days.push({
        date: dateStr,
        botVolume: botCount,
        agentVolume: agentCount,
        totalVolume: Math.floor(baseVolume),
        faqIntent: Math.floor(baseVolume * 0.5),
        bookingIntent: Math.floor(baseVolume * 0.3),
        handoffIntent: agentCount,
        orderIntent: Math.floor(baseVolume * 0.1),
        handoffRate: parseFloat(handoffRate.toFixed(1)),
        feedbackScore: parseFloat((4.2 + (Math.random() * 0.6 - 0.3)).toFixed(1)),
        bookedCount: booked,
        bookingValue: parseFloat(bookingValue.toFixed(2)),
        feeAmount: parseFloat(feeAmount.toFixed(2)),
      });
    }
    return days;
  };

  const timeSeriesData = useMemo(() => dataGenerated ? generateData() : [], [dataGenerated, dateRange]);

  // Channel Distribution
  const channelData = [
    { name: "Website Widget", value: 9285, color: COLORS.primary },
    { name: "WhatsApp", value: 3571, color: COLORS.secondary },
    { name: "Instagram DM", value: 1429, color: COLORS.quaternary },
  ];

  // Lead Funnel
  const funnelData = [
    { step: "Enquired", value: 4500, fill: "#3f3f46" },
    { step: "Captured", value: 2800, fill: "#52525b" },
    { step: "Contacted", value: 2100, fill: "#71717a" },
    { step: "Booked", value: 842, fill: COLORS.primary },
  ];

  // Response Time Histogram
  const responseTimeData = [
    { bucket: "< 1s", count: 4200 },
    { bucket: "1-2s", count: 8500 },
    { bucket: "2-5s", count: 1200 },
    { bucket: "5-10s", count: 300 },
    { bucket: "> 10s", count: 85 },
  ];

  // Language Distribution
  const languageData = [
    { lang: "English (en)", count: 10500 },
    { lang: "French (fr)", count: 2100 },
    { lang: "Spanish (es)", count: 1200 },
    { lang: "Arabic (ar)", count: 485 },
  ];

  const topFaqs = [
    { q: "What time is check-in?", count: 1245 },
    { q: "Do you have parking?", count: 890 },
    { q: "Is breakfast included?", count: 756 },
    { q: "Can I bring my dog?", count: 412 },
  ];

  const upsellStats = [
    { name: "Airport Transfer", offered: 450, accepted: 85, rate: "18.8%", revenue: "$7,225" },
    { name: "Late Check-out", offered: 820, accepted: 142, rate: "17.3%", revenue: "$7,100" },
    { name: "Spa Package", offered: 310, accepted: 28, rate: "9.0%", revenue: "$4,200" },
  ];

  const handleSeed = () => {
    setSeeding(true);
    setTimeout(() => {
      setDataGenerated(true);
      setSeeding(false);
      showToast("Generated 30 days of mock analytics data", "success");
    }, 800);
  };

  return (
    <div className="p-3 md:p-5 space-y-4 h-full flex flex-col relative overflow-hidden dashboard-interactive overflow-y-auto">
      
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 shrink-0">
        <div>
          <h2 className="text-header font-bold text-dash-text tracking-tight">Analytics & Reports</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Comprehensive data on message volume, intent, and conversions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          {isSandbox && (
            <button 
              onClick={handleSeed}
              disabled={seeding || dataGenerated}
              className="flex-1 sm:flex-initial h-8 px-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50"
            >
              {seeding ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Database className="w-3.5 h-3.5" />}
              {dataGenerated ? "Data Seeded" : "Generate Demo Data"}
            </button>
          )}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-36 h-8 pl-3 pr-8 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors text-dash-text focus:outline-none"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dash-text-muted pointer-events-none" />
          </div>
          <button className="flex-1 sm:flex-initial h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {!dataGenerated ? (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-dash-border rounded-xl bg-dash-canvas/50 m-4 p-8 text-center min-h-[400px]">
          <BarChart3 className="w-12 h-12 text-dash-text-muted mb-4 opacity-50" />
          <h3 className="text-base font-bold text-dash-text mb-2">No Analytical Data</h3>
          <p className="text-sm text-dash-text-sec max-w-sm mb-6">There is not enough historical data to generate robust analytics for this period.</p>
          {isSandbox && (
            <button onClick={handleSeed} className="px-4 py-2 bg-[#EA6639] text-white rounded-lg text-sm font-medium hover:bg-[#d4582e] transition-colors flex items-center gap-2">
              <Database className="w-4 h-4" /> Seed Sandbox Data
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4 pb-10">
          {/* ── Summary Stats ────────────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[
              { label: "Total Messages", value: "14,285", trend: "+24%", icon: MessageSquare },
              { label: "Leads Captured", value: "2,800", trend: "+12%", icon: Users },
              { label: "Bot Resolution Rate", value: "92.4%", trend: "+1.2%", icon: CheckCircle2 },
              { label: "Avg Response Time", value: "1.2s", trend: "-0.3s", icon: Clock },
              { label: "Booking Revenue (L2)", value: "$42,500", trend: "+18%", icon: DollarSign, isL2: true },
            ].filter(kpi => !kpi.isL2 || isLevel2).map((kpi, i) => (
              <div key={i} className="bg-dash-surface p-4 rounded-xl border border-dash-border flex flex-col justify-between hover:border-[#EA6639]/40 transition-colors group">
                <div className="flex items-start justify-between gap-1 mb-3">
                  <span className="text-xs font-semibold text-dash-text-sec uppercase tracking-wider">{kpi.label}</span>
                  <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 group-hover:text-[#EA6639] transition-colors" />
                </div>
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-2xl font-bold text-dash-text">{kpi.value}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${kpi.trend.startsWith('-') && kpi.label.includes('Response Time') ? 'bg-emerald-500/10 text-emerald-500' : kpi.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {kpi.trend}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            
            {/* ── Message Volume Over Time ────────────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border xl:col-span-2">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-bold text-dash-text">Message Volume</h3>
                <div className="flex items-center gap-3 text-xs font-medium">
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS.secondary}}/>Bot Resolved</div>
                  <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: COLORS.quaternary}}/>Agent Handoff</div>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={timeSeriesData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBot" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAgent" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.quaternary} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={COLORS.quaternary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="botVolume" name="Bot" stroke={COLORS.secondary} strokeWidth={2} fillOpacity={1} fill="url(#colorBot)" />
                    <Area type="monotone" dataKey="agentVolume" name="Agent" stroke={COLORS.quaternary} strokeWidth={2} fillOpacity={1} fill="url(#colorAgent)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Channel Distribution ────────────────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
              <h3 className="text-sm font-bold text-dash-text mb-2">Channel Distribution</h3>
              <div className="h-48 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={channelData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={2} dataKey="value" stroke="none">
                      {channelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center metric */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-xl font-bold text-dash-text">14.2k</span>
                  <span className="text-[10px] text-dash-text-muted">Total</span>
                </div>
              </div>
              <div className="space-y-3 mt-2">
                {channelData.map((channel, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: channel.color}} />
                      <span className="text-xs font-medium text-dash-text">{channel.name}</span>
                    </div>
                    <span className="text-xs font-mono text-dash-text-sec">{channel.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Intent Breakdown (Stacked Bar) ──────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border xl:col-span-2">
              <h3 className="text-sm font-bold text-dash-text mb-6">Intent Breakdown</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={timeSeriesData.slice(-14)} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                    <Bar dataKey="faqIntent" name="FAQs" stackId="a" fill={COLORS.primary} radius={[0,0,2,2]} />
                    <Bar dataKey="bookingIntent" name="Booking Enquiry" stackId="a" fill={COLORS.secondary} />
                    <Bar dataKey="orderIntent" name="Orders/Service" stackId="a" fill={COLORS.quaternary} />
                    <Bar dataKey="handoffIntent" name="Handoffs" stackId="a" fill={COLORS.tertiary} radius={[2,2,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Lead Funnel ─────────────────────────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
              <h3 className="text-sm font-bold text-dash-text mb-6">Lead Conversion Funnel</h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 20, left: 20, bottom: 0 }}>
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="step" stroke={COLORS.textMuted} fontSize={11} tickLine={false} axisLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="value" name="Leads" fill={COLORS.primary} radius={[0,4,4,0]} barSize={24}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Response Time Histogram ─────────────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
              <h3 className="text-sm font-bold text-dash-text mb-6">Response Time Distribution</h3>
              <div className="h-52 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={responseTimeData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                    <XAxis dataKey="bucket" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                    <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="count" name="Messages" fill={COLORS.primary} radius={[4,4,0,0]} barSize={32} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-between items-center mt-2 px-2 text-xs font-medium border-t border-dash-border pt-3">
                <div className="text-dash-text-sec">P50: <span className="text-dash-text">1.1s</span></div>
                <div className="text-dash-text-sec">P90: <span className="text-dash-text">1.8s</span></div>
                <div className="text-dash-text-sec">P99: <span className="text-dash-text">3.2s</span></div>
              </div>
            </div>

            {/* ── Top FAQs Table ──────────────────────────────────────────── */}
            <div className="bg-dash-surface p-4 rounded-xl border border-dash-border xl:col-span-2">
              <h3 className="text-sm font-bold text-dash-text mb-4">Top FAQ Matches</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-dash-border">
                      <th className="pb-2 text-xs font-semibold text-dash-text-muted uppercase">Question Matched</th>
                      <th className="pb-2 text-xs font-semibold text-dash-text-muted uppercase text-right">Trigger Count</th>
                      <th className="pb-2 text-xs font-semibold text-dash-text-muted uppercase text-right">% of Total</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {topFaqs.map((faq, i) => (
                      <tr key={i} className="border-b border-dash-border/50 hover:bg-dash-canvas/50 transition-colors">
                        <td className="py-2.5 font-medium text-dash-text truncate max-w-[200px]">{faq.q}</td>
                        <td className="py-2.5 text-right font-mono text-dash-text-sec">{faq.count}</td>
                        <td className="py-2.5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-xs text-dash-text-sec">{Math.round((faq.count/3303)*100)}%</span>
                            <div className="w-16 h-1.5 bg-dash-canvas rounded-full overflow-hidden">
                              <div className="h-full bg-[#EA6639] rounded-full" style={{width: `${Math.round((faq.count/3303)*100)}%`}} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── Level 2 Features (Bookings/Upsells) ────────────────────── */}
            {isLevel2 && (
              <>
                <div className="bg-dash-surface p-4 rounded-xl border border-dash-border xl:col-span-2">
                  <h3 className="text-sm font-bold text-dash-text mb-6">Booking Revenue (Level 2)</h3>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData.slice(-14)} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={COLORS.grid} />
                        <XAxis dataKey="date" stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} dy={10} />
                        <YAxis stroke={COLORS.textMuted} fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                        <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} iconType="circle" />
                        <Bar dataKey="bookingValue" name="Hotel Revenue" stackId="a" fill={COLORS.secondary} radius={[0,0,2,2]} />
                        <Bar dataKey="feeAmount" name="Agency Fee (3%)" stackId="a" fill={COLORS.tertiary} radius={[2,2,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
                  <h3 className="text-sm font-bold text-dash-text mb-4">Upsell Performance</h3>
                  <div className="space-y-4">
                    {upsellStats.map((upsell, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex justify-between items-end">
                          <span className="text-sm font-medium text-dash-text">{upsell.name}</span>
                          <span className="text-xs font-bold text-emerald-500">{upsell.revenue}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-dash-text-muted uppercase font-semibold">
                          <span>Offered: {upsell.offered}</span>
                          <span>Conv: {upsell.rate}</span>
                        </div>
                        <div className="h-1.5 w-full bg-dash-canvas rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: upsell.rate }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
