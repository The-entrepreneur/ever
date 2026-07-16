import React from "react";
import { Users, MessageSquare, DollarSign, Activity, AlertTriangle, ArrowUpRight } from "lucide-react";

export function AgencyDashboardTab({ onNavigate }: { onNavigate?: (tab: "clients" | "health") => void }) {
  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Agency Command Center</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Global overview of agency performance across all hotel clients.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button onClick={() => onNavigate?.("health")} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border rounded-md text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text text-center flex items-center justify-center whitespace-nowrap">
            View Errors
          </button>
          <button onClick={() => window.location.reload()} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors text-center flex items-center justify-center whitespace-nowrap">
            Refresh
          </button>
        </div>
      </div>
      
      {/* Global KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 md:gap-4">
        {[
          { label: "Active Clients", value: "42", trend: "+3", icon: Users, color: "text-[#3ECF8E]" },
          { label: "Messages", value: "1.2M", trend: "+12.5%", icon: MessageSquare, color: "text-[#3ECF8E]" },
          { label: "Leads Captured", value: "8,405", trend: "+8.2%", icon: ArrowUpRight, color: "text-[#3ECF8E]" },
          { label: "API Costs (Est.)", value: "$4,250", trend: "+2.1%", icon: Activity, color: "text-amber-500" },
          { label: "Revenue (Est.)", value: "$42,000", trend: "+15.3%", icon: DollarSign, color: "text-[#3ECF8E]" },
        ].map((kpi, i) => (
          <div key={i} className={`bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between ${i === 4 ? 'col-span-2 sm:col-span-1' : ''}`}>
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-data font-medium text-dash-text-sec leading-tight">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-kpi font-black text-dash-text">{kpi.value}</span>
              <span className={`text-micro font-bold ${kpi.trend.startsWith('+') && kpi.color !== 'text-amber-500' ? 'text-emerald-600 ' : 'text-amber-600 '}`}>
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Health Overview */}
        <div className="lg:col-span-2 bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Client Health Overview</h3>
            <button onClick={() => onNavigate?.("clients")} className="dashboard-btn compact-touch-target text-data text-dash-green hover:underline font-medium">View All Clients</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="text-micro text-dash-text-sec bg-dash-canvas uppercase sticky top-0">
                <tr>
                  <th className="px-4 py-3 font-semibold rounded-tl-lg">Hotel Name</th>
                  <th className="px-4 py-3 font-semibold">Tier</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { name: "The Grand Horizon Resort", tier: "Enterprise", status: "Operational" },
                  { name: "Oceanview Boutique", tier: "Growth", status: "Operational" },
                  { name: "Alpine Lodge & Spa", tier: "Starter", status: "Degraded" },
                  { name: "Metropolitan Suites", tier: "Growth", status: "Operational" },
                  { name: "Sunset Villas", tier: "Starter", status: "Down" },
                ].map((client, i) => (
                  <tr key={i} className="hover:bg-dash-surface-hover/30 transition-colors">
                    <td className="px-4 py-3 text-body font-medium text-dash-text">{client.name}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-dash-surface-raised text-dash-text-sec rounded text-micro font-medium">
                        {client.tier}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-micro font-bold uppercase tracking-wider ${
                        client.status === 'Operational' ? 'bg-emerald-100 text-emerald-700  ' : 
                        client.status === 'Degraded' ? 'bg-amber-100 text-amber-700  ' :
                        'bg-red-100 text-red-700  '
                      }`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="dashboard-btn compact-touch-target text-data text-dash-text-muted hover:text-dash-text font-medium">Details</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Global Activity Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {[
              { hotel: "Sunset Villas", event: "Webhook delivery failure (WhatsApp)", time: "10 mins ago", type: "error" },
              { hotel: "Alpine Lodge & Spa", event: "API latency spike > 2000ms", time: "45 mins ago", type: "warning" },
              { hotel: "The Grand Horizon", event: "Deployment successful (v1.2.4)", time: "2 hrs ago", type: "success" },
              { hotel: "System", event: "Golden Template 'Starter v2' updated", time: "5 hrs ago", type: "info" },
            ].map((activity, i) => (
              <div key={i} className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline flex gap-3">
                <div className="pt-0.5">
                  {activity.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                  {activity.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                  {activity.type === 'success' && <Activity className="w-4 h-4 text-emerald-500" />}
                  {activity.type === 'info' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-micro font-bold text-dash-text uppercase tracking-wider">{activity.hotel}</span>
                    <span className="text-micro text-dash-text-muted">{activity.time}</span>
                  </div>
                  <p className="text-data text-dash-text-sec leading-relaxed">{activity.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
