import React, { useState, useEffect } from "react";
import {
  Server, RefreshCw, Terminal, AlertCircle, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, RotateCcw,
  Activity, Cpu, Zap, Box, GitBranch, Loader2
} from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface DeploymentItem {
  id?: string;
  name: string;
  slug: string;
  status: string;
  tier?: string;
  version: string;
  date?: string;
  createdAt?: string;
  uptime?: string;
  domain?: string;
  containers: { name: string; status: string; port?: string; cpu?: string; mem?: string }[];
}

interface ActivityLogItem {
  id?: string;
  time: string;
  slug: string;
  event: string;
  type: string;
}

const SANDBOX_DEPLOYMENTS: DeploymentItem[] = [
  {
    name: "The Grand Horizon Resort", slug: "grand-horizon", status: "Running", version: "v1.2.4", date: "2 hrs ago", uptime: "14d 6h",
    containers: [
      { name: "n8n", status: "Running", cpu: "12%", mem: "245MB" },
      { name: "bot-engine", status: "Running", cpu: "8%", mem: "128MB" },
      { name: "pms-api", status: "Running", cpu: "5%", mem: "96MB" },
      { name: "redis", status: "Running", cpu: "1%", mem: "32MB" },
    ],
  },
  {
    name: "Oceanview Boutique", slug: "oceanview-boutique", status: "Running", version: "v1.2.4", date: "1 day ago", uptime: "6d 12h",
    containers: [
      { name: "n8n", status: "Running", cpu: "9%", mem: "198MB" },
      { name: "bot-engine", status: "Running", cpu: "6%", mem: "110MB" },
      { name: "pms-api", status: "Running", cpu: "3%", mem: "88MB" },
      { name: "redis", status: "Running", cpu: "1%", mem: "28MB" },
    ],
  },
  {
    name: "Alpine Lodge & Spa", slug: "alpine-lodge", status: "Error", version: "v1.2.3", date: "3 days ago", uptime: "—",
    containers: [
      { name: "n8n", status: "Error", cpu: "—", mem: "—" },
      { name: "bot-engine", status: "Running", cpu: "4%", mem: "95MB" },
      { name: "pms-api", status: "Running", cpu: "2%", mem: "80MB" },
      { name: "redis", status: "Running", cpu: "1%", mem: "22MB" },
    ],
  },
];

const SANDBOX_ACTIVITY_LOG: ActivityLogItem[] = [
  { time: "14:02:11", slug: "grand-horizon", event: "Health check passed — all 4 containers healthy", type: "success" },
  { time: "13:55:44", slug: "alpine-lodge", event: "n8n container exited with code 137 (OOM kill)", type: "error" },
  { time: "12:30:00", slug: "grand-horizon", event: "Deployed v1.2.4 — workflow push successful", type: "success" },
];

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    Running: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
    Error: "bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30",
    Stopped: "bg-zinc-500/15 text-zinc-500 border-zinc-500/30",
    Pending: "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30",
  };
  const Icon = status === "Running" ? CheckCircle2 : status === "Error" ? AlertCircle : XCircle;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${map[status] ?? map["Stopped"]}`}>
      {status === "Running" && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const ContainerDot = ({ status }: { status: string }) => {
  if (status === "Running") return <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />;
  if (status === "Error") return <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />;
  return <span className="w-2 h-2 rounded-full bg-zinc-400 shrink-0" />;
};

export function DeploymentMonitorTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { isSandbox } = useSandbox();
  const [deployments, setDeployments] = useState<DeploymentItem[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restartingSlug, setRestartingSlug] = useState<string | null>(null);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Running" | "Error" | "Stopped">("All");

  const loadData = async () => {
    setLoading(true);
    if (isSandbox) {
      setDeployments(SANDBOX_DEPLOYMENTS);
      setActivityLogs(SANDBOX_ACTIVITY_LOG);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/deployments");
      const data = await res.json();
      if (res.ok && data.success) {
        setDeployments(data.deployments || []);
        setActivityLogs(data.activityLogs || []);
      } else {
        setDeployments([]);
        setActivityLogs([]);
      }
    } catch (err) {
      console.error("[DeploymentMonitorTab] Error fetching deployments:", err);
      setDeployments([]);
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSandbox]);

  const handleRestart = async (slug: string) => {
    setRestartingSlug(slug);
    try {
      await fetch(`/api/admin/deployments/${slug}/restart`, { method: "POST" });
      await loadData();
    } catch (err) {
      console.error("[DeploymentMonitorTab] Restart failed:", err);
    } finally {
      setRestartingSlug(null);
    }
  };

  const filtered = deployments.filter(d => filter === "All" || d.status === filter);
  const running = deployments.filter(d => d.status === "Running").length;
  const errors  = deployments.filter(d => d.status === "Error").length;
  const stopped = deployments.filter(d => d.status === "Stopped" || d.status === "Pending").length;

  return (
    <div className="p-3 md:p-5 space-y-4 h-full overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-header font-bold text-dash-text">Deployment Monitor</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Live status of all hotel tenant Docker stacks and n8n instances.</p>
        </div>
        <button onClick={loadData} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Running", value: running, color: "text-emerald-600", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Error",   value: errors,  color: "text-rose-600",    bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Standby / Pending", value: stopped, color: "text-zinc-500",    bg: "bg-zinc-500/10 border-zinc-500/20" },
        ].map(k => (
          <div key={k.label} className={`p-3 rounded-xl border ${k.bg} flex flex-col gap-1`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">{k.label}</span>
            <span className={`text-2xl font-black ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="flex gap-2 flex-wrap">
        {(["All", "Running", "Error", "Stopped"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[#EA6639] text-white" : "bg-dash-surface border border-dash-border text-dash-text hover:bg-dash-surface-hover"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Deployments Table */}
      <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
            <p className="text-xs text-dash-text-sec">Connecting to container infrastructure...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-dash-surface-raised flex items-center justify-center mb-3">
              <Server className="w-6 h-6 text-dash-text-muted" />
            </div>
            <h3 className="text-sm font-semibold text-dash-text mb-1">No Active Deployments</h3>
            <p className="text-xs text-dash-text-sec max-w-sm mb-4">No tenant stacks have been deployed yet. Onboard your first property using the provisioning wizard.</p>
            <button onClick={() => onNavigate?.("provisioning")} className="px-4 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors">
              Provision First Hotel
            </button>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-dash-text-sec bg-dash-canvas uppercase tracking-wider border-b border-dash-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Instance</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold hidden sm:table-cell">Version</th>
                <th className="px-4 py-3 font-semibold hidden md:table-cell">Domain</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {filtered.map(dep => {
                const isExpanded = expandedRow === dep.slug;
                const isRestarting = restartingSlug === dep.slug;
                return (
                  <React.Fragment key={dep.slug}>
                    <tr className={`hover:bg-dash-canvas/40 transition-colors cursor-pointer ${isExpanded ? "bg-dash-canvas/60" : ""}`}
                        onClick={() => setExpandedRow(isExpanded ? null : dep.slug)}>
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-dash-text">{dep.name}</div>
                        <div className="text-[10px] text-dash-text-muted font-mono">{dep.slug}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <StatusBadge status={dep.status} />
                      </td>
                      <td className="px-4 py-3.5 text-dash-text font-mono text-[11px] hidden sm:table-cell">
                        {dep.version}
                      </td>
                      <td className="px-4 py-3.5 text-dash-text-muted font-mono text-[11px] hidden md:table-cell">
                        {dep.domain || "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestart(dep.slug)}
                            disabled={isRestarting}
                            title="Restart containers"
                            className="p-1.5 rounded-lg border border-dash-border text-dash-text hover:bg-dash-surface-hover transition-colors disabled:opacity-50"
                          >
                            <RotateCcw className={`w-3.5 h-3.5 ${isRestarting ? "animate-spin text-[#EA6639]" : ""}`} />
                          </button>
                          <button onClick={() => setExpandedRow(isExpanded ? null : dep.slug)} className="p-1.5 text-dash-text-muted hover:text-dash-text">
                            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && (
                      <tr className="bg-dash-canvas/80 border-b border-dash-border">
                        <td colSpan={5} className="px-4 py-3">
                          <div className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-2 flex items-center gap-1.5">
                            <Box className="w-3 h-3 text-[#EA6639]" /> Component Containers
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {dep.containers.map(c => (
                              <div key={c.name} className="p-2.5 rounded-lg bg-dash-surface border border-dash-border flex flex-col gap-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-mono font-semibold text-[11px] text-dash-text">{c.name}</span>
                                  <ContainerDot status={c.status} />
                                </div>
                                <div className="flex items-center justify-between text-[10px] text-dash-text-muted">
                                  <span>Port: {c.port || "3000"}</span>
                                  <span className={c.status === "Running" ? "text-emerald-500 font-bold" : "text-zinc-500"}>{c.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Activity Log */}
      <div className="bg-dash-surface rounded-xl border border-dash-border p-4 space-y-3">
        <h3 className="text-xs font-bold text-dash-text flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-[#EA6639]" /> Deployment Activity Log
        </h3>
        {activityLogs.length === 0 ? (
          <p className="text-xs text-dash-text-muted">No deployment activity recorded yet.</p>
        ) : (
          <div className="space-y-1.5 font-mono text-[11px] max-h-48 overflow-y-auto">
            {activityLogs.map((log, i) => (
              <div key={log.id || i} className="flex items-start gap-2 py-1 border-b border-dash-border/40 last:border-0">
                <span className="text-dash-text-muted shrink-0 text-[10px]">{log.time}</span>
                <span className="text-[#EA6639] shrink-0 font-semibold">[{log.slug}]</span>
                <span className={log.type === "error" ? "text-rose-500" : log.type === "warning" ? "text-amber-500" : "text-dash-text"}>
                  {log.event}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
