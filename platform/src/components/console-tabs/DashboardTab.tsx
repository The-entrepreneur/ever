import React from "react";
import { TrendingUp, Users, MessageSquare, AlertCircle } from "lucide-react";

export function DashboardTab({ onNavigate }: { onNavigate?: (tab: "inbox" | "crm") => void }) {
  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Main Dashboard</h2>
          <p className="text-body text-dash-text-sec mt-0.5">High-level overview of bot performance and key operational metrics.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button onClick={() => onNavigate?.("crm")} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border rounded-md text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text text-center flex items-center justify-center whitespace-nowrap">
            View Leads
          </button>
          <button onClick={() => onNavigate?.("inbox")} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors text-center flex items-center justify-center whitespace-nowrap">
            Live Inbox
          </button>
        </div>
      </div>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        {[
          { label: "Total Leads Captured", value: "248", trend: "+12%", icon: Users, color: "text-[#3ECF8E]" },
          { label: "Booking Conversion Rate", value: "8.4%", trend: "+2.1%", icon: TrendingUp, color: "text-[#3ECF8E]" },
          { label: "Bot Resolution Rate", value: "92%", trend: "+1.5%", icon: MessageSquare, color: "text-[#3ECF8E]" },
          { label: "Human Handoff Rate", value: "8%", trend: "-1.5%", icon: AlertCircle, color: "text-red-500" },
        ].map((kpi, i) => (
          <div key={i} className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-data font-medium text-dash-text-sec leading-tight">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-kpi font-black text-dash-text">{kpi.value}</span>
              <span className={`text-micro font-bold ${kpi.trend.startsWith('+') ? 'text-emerald-600 ' : 'text-red-600 '}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Charts Placeholder */}
        <div className="lg:col-span-2 bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border h-80 flex flex-col">
          <h3 className="text-section font-semibold text-dash-text mb-4">Performance Trends</h3>
          <div className="flex-1 border-2 border-dashed border-dash-border rounded flex items-center justify-center bg-dash-canvas">
            <span className="text-data text-dash-text-muted font-mono">[Chart visualization area]</span>
          </div>
        </div>

        {/* Activity Feed / Recent Handoffs */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border h-80 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Recent Handoffs</h3>
            <button onClick={() => onNavigate?.("inbox")} className="dashboard-btn compact-touch-target text-data text-dash-green hover:underline font-medium">View Inbox</button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {[
              { id: "SESS-102", reason: "Guest requested human", time: "2 min ago" },
              { id: "SESS-098", reason: "Complex booking modification", time: "15 min ago" },
              { id: "SESS-095", reason: "Complaint escalation", time: "1 hr ago" },
            ].map((handoff, i) => (
              <div key={i} className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-data font-mono font-semibold text-dash-text">{handoff.id}</span>
                  <span className="text-micro text-dash-text-muted">{handoff.time}</span>
                </div>
                <p className="text-data text-dash-text-sec">{handoff.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
