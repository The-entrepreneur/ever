import React, { useState, useEffect } from "react";
import { Users, MessageSquare, DollarSign, Activity, AlertTriangle, ArrowUpRight, Loader2, Building2, Server } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface DashboardClient {
  id?: string;
  name: string;
  slug?: string;
  tier: string;
  status: string;
}

interface DashboardActivity {
  id?: string;
  hotel: string;
  event: string;
  time: string;
  type: string;
}

const SANDBOX_KPIS = [
  { label: "Active Clients", value: "3", trend: "+1", icon: Users, color: "text-[#3ECF8E]" },
  { label: "Messages", value: "74.4k", trend: "+12.5%", icon: MessageSquare, color: "text-[#3ECF8E]" },
  { label: "Leads Captured", value: "912", trend: "+8.2%", icon: ArrowUpRight, color: "text-[#3ECF8E]" },
  { label: "Projected MRR", value: "₦697,000", trend: "+15.3%", icon: DollarSign, color: "text-[#3ECF8E]" },
];

const SANDBOX_CLIENTS: DashboardClient[] = [
  { name: "The Grand Horizon Resort", tier: "Growth", status: "Operational" },
  { name: "Oceanview Boutique", tier: "Starter", status: "Operational" },
  { name: "Alpine Lodge & Spa", tier: "Growth", status: "Degraded" },
];

const SANDBOX_ACTIVITY: DashboardActivity[] = [
  { hotel: "The Grand Horizon", event: "WhatsApp channel connected and healthy", time: "2 hrs ago", type: "success" },
  { hotel: "Alpine Lodge & Spa", event: "Webhook delivery failure (SMS)", time: "45 mins ago", type: "error" },
];

export function AgencyDashboardTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { isSandbox } = useSandbox();
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<DashboardClient[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [metrics, setMetrics] = useState({
    activeClients: 0,
    messages: 0,
    leads: 0,
    mrr: 0
  });

  const loadDashboard = async () => {
    setLoading(true);
    if (isSandbox) {
      setClients(SANDBOX_CLIENTS);
      setActivities(SANDBOX_ACTIVITY);
      setMetrics({
        activeClients: 3,
        messages: 74470,
        leads: 912,
        mrr: 697000
      });
      setLoading(false);
      return;
    }

    try {
      const [billRes, depRes] = await Promise.all([
        fetch("/api/admin/billing"),
        fetch("/api/admin/deployments")
      ]);

      const billData = await billRes.json();
      const depData = await depRes.json();

      const liveClients: any[] = billData.clients || [];
      const liveDeps: any[] = depData.deployments || [];
      const liveLogs: any[] = depData.activityLogs || [];

      const totalMsgs = liveClients.reduce((sum, c) => sum + (c.msgs || 0), 0);
      const totalLeads = liveClients.reduce((sum, c) => sum + (c.leads || 0), 0);
      const totalMrr = liveClients.reduce((sum, c) => sum + (c.baseFee || 0), 0);

      setMetrics({
        activeClients: liveDeps.filter(d => d.status === "Running" || d.status === "active").length,
        messages: totalMsgs,
        leads: totalLeads,
        mrr: totalMrr
      });

      setClients(liveDeps.map(d => ({
        name: d.name,
        tier: d.tier || "Starter",
        status: d.status === "Running" ? "Operational" : d.status
      })));

      setActivities(liveLogs.slice(0, 10).map(l => ({
        id: l.id,
        hotel: l.slug,
        event: l.event,
        time: l.time,
        type: l.type
      })));

    } catch (err) {
      console.error("[AgencyDashboardTab] Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [isSandbox]);

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Agency Command Center</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Live performance metrics and tenant health across all hotel client properties.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button onClick={() => onNavigate?.("health")} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border rounded-md text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text text-center flex items-center justify-center whitespace-nowrap">
            View Errors
          </button>
          <button onClick={loadDashboard} disabled={loading} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors text-center flex items-center justify-center whitespace-nowrap">
            Refresh
          </button>
        </div>
      </div>
      
      {/* Global KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-4">
        {[
          { label: "Active Clients", value: metrics.activeClients.toString(), trend: metrics.activeClients > 0 ? "Live" : "Zero", icon: Users, color: "text-[#3ECF8E]" },
          { label: "Messages", value: metrics.messages.toLocaleString(), trend: "Live Counter", icon: MessageSquare, color: "text-[#3ECF8E]" },
          { label: "Leads Captured", value: metrics.leads.toLocaleString(), trend: "Real-time", icon: ArrowUpRight, color: "text-[#3ECF8E]" },
          { label: "Projected MRR", value: `₦${metrics.mrr.toLocaleString()}`, trend: "Monthly", icon: DollarSign, color: "text-[#3ECF8E]" },
        ].map((kpi, i) => (
          <div key={i} className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
            <div className="flex items-start justify-between gap-1 mb-2">
              <span className="text-data font-medium text-dash-text-sec leading-tight">{kpi.label}</span>
              <kpi.icon className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
            </div>
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-kpi font-black text-dash-text">{kpi.value}</span>
              <span className="text-micro font-bold text-emerald-600">
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
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#EA6639] mb-2" />
                <p className="text-xs text-dash-text-sec">Loading client properties...</p>
              </div>
            ) : clients.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Building2 className="w-8 h-8 text-dash-text-muted mb-2" />
                <p className="text-xs font-semibold text-dash-text">No Client Properties Onboarded</p>
                <p className="text-[11px] text-dash-text-sec max-w-xs mt-1 mb-3">Onboard your first hotel property to track live operational health.</p>
                <button onClick={() => onNavigate?.("provisioning")} className="px-3 py-1.5 bg-[#EA6639] text-white rounded text-xs font-semibold">
                  Provision Hotel
                </button>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="text-micro text-dash-text-sec bg-dash-canvas uppercase sticky top-0">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">Hotel Name</th>
                    <th className="px-4 py-3 font-semibold">Tier</th>
                    <th className="px-4 py-3 font-semibold">Status</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border/40">
                  {clients.map((client, i) => (
                    <tr key={i} className="hover:bg-dash-surface-hover/30 transition-colors">
                      <td className="px-4 py-3 text-body font-medium text-dash-text">{client.name}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-dash-surface-raised text-dash-text-sec rounded text-micro font-medium uppercase">
                          {client.tier}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-micro font-bold uppercase tracking-wider ${
                          client.status === 'Operational' || client.status === 'Running' ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400' : 
                          client.status === 'Degraded' ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400' :
                          'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => onNavigate?.("deployments")} className="dashboard-btn compact-touch-target text-data text-dash-text-muted hover:text-dash-text font-medium">Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Global Activity Feed */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Global Activity Feed</h3>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-[#EA6639] mb-2" />
                <p className="text-xs text-dash-text-sec">Fetching telemetry events...</p>
              </div>
            ) : activities.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Activity className="w-6 h-6 text-dash-text-muted mb-2" />
                <p className="text-xs text-dash-text-sec">No recent operational events recorded.</p>
              </div>
            ) : (
              activities.map((activity, i) => (
                <div key={activity.id || i} className="p-3 bg-dash-canvas rounded-lg border border-dash-border flex gap-3">
                  <div className="pt-0.5">
                    {activity.type === 'error' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    {activity.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                    {activity.type === 'success' && <Activity className="w-4 h-4 text-emerald-500" />}
                    {activity.type === 'info' && <MessageSquare className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-micro font-bold text-dash-text uppercase tracking-wider truncate">{activity.hotel}</span>
                      <span className="text-micro text-dash-text-muted shrink-0">{activity.time}</span>
                    </div>
                    <p className="text-data text-dash-text-sec leading-relaxed break-words">{activity.event}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
