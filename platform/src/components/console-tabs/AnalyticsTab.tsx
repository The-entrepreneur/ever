import React, { useState } from "react";
import { BarChart3, Download, Filter, TrendingUp, TrendingDown, Users, MessageSquare, AlertCircle, CheckCircle2, ChevronDown, PieChart } from "lucide-react";

export function AnalyticsTab() {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Analytics & Reports</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Comprehensive data on message volume, intent, and conversions.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-40 dashboard-btn compact-touch-target h-8 pl-3 pr-8 bg-dash-surface border border-dash-border rounded-lg text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text focus:outline-none"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-text-muted pointer-events-none" />
          </div>
          <button className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        {[
          { label: "Total Messages", value: "14,285", trend: "+24%", icon: MessageSquare, color: "text-[#EA6639]" },
          { label: "Leads Captured", value: "842", trend: "+12%", icon: Users, color: "text-[#EA6639]" },
          { label: "Bot Resolution Rate", value: "92.4%", trend: "+1.2%", icon: CheckCircle2, color: "text-[#EA6639]" },
          { label: "Avg Response Time", value: "1.2s", trend: "-0.3s", icon: TrendingDown, color: "text-[#EA6639]" },
        ].map((kpi, i) => (
          <div key={i} className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-data font-medium text-dash-text-sec leading-tight">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-kpi font-black text-dash-text">{kpi.value}</span>
              <span className={`text-micro font-bold ${kpi.trend.startsWith('-') && kpi.label.includes('Response Time') ? 'text-emerald-600 ' : kpi.trend.startsWith('+') ? 'text-emerald-600 ' : 'text-red-600 '}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Message Volume Over Time */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Message Volume</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-md bg-dash-green"></div><span className="text-micro text-dash-text-muted">Bot</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-md bg-dash-surface-raised"></div><span className="text-micro text-dash-text-muted">Agent</span></div>
            </div>
          </div>
          <div className="h-64 border border-dashed border-dash-border rounded-lg flex items-center justify-center bg-dash-canvas">
            <span className="text-data text-dash-text-muted font-mono">[Line Chart: Messages per Day]</span>
          </div>
        </div>

        {/* Lead Funnel */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
          <h3 className="text-section font-semibold text-dash-text mb-4">Lead Conversion Funnel</h3>
          <div className="h-64 border border-dashed border-dash-border rounded-lg flex items-center justify-center bg-dash-canvas">
            <span className="text-data text-dash-text-muted font-mono">[Funnel Chart: Enquired &rarr; Captured &rarr; Booked]</span>
          </div>
        </div>

        {/* Intent Breakdown */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
          <h3 className="text-section font-semibold text-dash-text mb-4">Intent Breakdown</h3>
          <div className="h-64 border border-dashed border-dash-border rounded-lg flex items-center justify-center bg-dash-canvas">
            <span className="text-data text-dash-text-muted font-mono">[Stacked Bar Chart: FAQs vs Bookings vs Handoffs]</span>
          </div>
        </div>

        {/* Channel Distribution */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
          <h3 className="text-section font-semibold text-dash-text mb-4">Channel Distribution</h3>
          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="h-48 w-48 border border-dashed border-dash-border rounded-md flex items-center justify-center bg-dash-canvas">
              <span className="text-data text-dash-text-muted font-mono text-center px-4">[Donut Chart]</span>
            </div>
            <div className="flex-1 w-full space-y-3">
              {[
                { name: "Website Widget", percent: "65%", value: "9,285" },
                { name: "WhatsApp", percent: "25%", value: "3,571" },
                { name: "Instagram DM", percent: "10%", value: "1,429" }
              ].map((channel, idx) => (
                <div key={idx} className="flex flex-col gap-1">
                  <div className="flex justify-between items-end">
                    <span className="text-data font-medium text-dash-text">{channel.name}</span>
                    <span className="text-micro font-mono text-dash-text-muted">{channel.value} ({channel.percent})</span>
                  </div>
                  <div className="h-1.5 w-full bg-dash-surface-raised rounded-md overflow-hidden">
                    <div className="h-full bg-dash-green rounded-md" style={{ width: channel.percent }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
