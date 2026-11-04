import React, { useState, useEffect, useMemo } from "react";
import { AlertTriangle, Search, ShieldAlert, XCircle, AlertCircle, Info, CheckCircle2, ChevronDown, ChevronUp, RefreshCw, Loader2, Activity } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface HealthLog {
  id: string;
  time: string;
  hotel: string;
  node: string;
  severity: "Critical" | "Warning" | "Info";
  msg: string;
  trace: string | null;
}

const SANDBOX_LOGS: HealthLog[] = [
  { id: "err_001", time: "2026-10-25 14:02:14", hotel: "Sunset Villas", node: "WhatsApp Trigger", severity: "Critical", msg: "Authentication failed. Token expired or revoked.", trace: "Error: 401 Unauthorized\n  at WATrigger.connect (node_modules/n8n-nodes-base/dist/nodes/WhatsApp/WhatsApp.node.js:148)" },
  { id: "err_002", time: "2026-10-25 13:45:00", hotel: "Alpine Lodge & Spa", node: "LLM Completion", severity: "Warning", msg: "API response latency > 2000ms threshold.", trace: "WARN: Gemini API took 2340ms (threshold: 2000ms)" },
  { id: "err_003", time: "2026-10-25 12:30:22", hotel: "The Grand Horizon", node: "Postgres Sync", severity: "Critical", msg: "Connection refused. DB host unreachable.", trace: "Error: ECONNREFUSED 10.0.0.5:5432" },
];

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; icon: React.ElementType }> = {
  Critical: { color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/15 border-rose-500/30", icon: XCircle },
  Warning:  { color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-500/15 border-amber-500/30", icon: AlertTriangle },
  Info:     { color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-500/15 border-blue-500/30", icon: Info },
};

export function SystemHealthTab() {
  const { isSandbox } = useSandbox();
  const [logs, setLogs] = useState<HealthLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [checks, setChecks] = useState<{
    database: { status: string; latencyMs: number };
    botEngine: { status: string; latencyMs: number };
    redis: { status: string; latencyMs: number };
    openbsp: { status: string; latencyMs: number };
  }>({
    database: { status: "unknown", latencyMs: 0 },
    botEngine: { status: "unknown", latencyMs: 0 },
    redis: { status: "unknown", latencyMs: 0 },
    openbsp: { status: "unknown", latencyMs: 0 },
  });

  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const fetchHealth = async () => {
    setLoading(true);
    if (isSandbox) {
      setChecks({
        database: { status: "healthy", latencyMs: 14 },
        botEngine: { status: "healthy", latencyMs: 28 },
        redis: { status: "healthy", latencyMs: 8 },
        openbsp: { status: "healthy", latencyMs: 45 },
      });
      setLogs(SANDBOX_LOGS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/health");
      const data = await res.json();
      if (res.ok && data.success) {
        setChecks(data.checks || checks);
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("[SystemHealthTab] Error fetching health:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, [isSandbox]);

  const visible = useMemo(() => {
    return logs.filter(l => {
      if (dismissed.has(l.id)) return false;
      if (severityFilter !== "All" && l.severity !== severityFilter) return false;
      if (search && !`${l.hotel} ${l.node} ${l.msg}`.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, search, severityFilter, dismissed]);

  const criticalCount = logs.filter(l => l.severity === "Critical" && !dismissed.has(l.id)).length;
  const warningCount  = logs.filter(l => l.severity === "Warning"  && !dismissed.has(l.id)).length;
  const infoCount     = logs.filter(l => l.severity === "Info"     && !dismissed.has(l.id)).length;

  return (
    <div className="p-3 md:p-5 space-y-4 h-full overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-header font-bold text-dash-text">System Health & Telemetry</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Live connectivity checks and error monitoring across infrastructure services.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDismissed(new Set())} className="px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
            Reset Filters
          </button>
          <button onClick={fetchHealth} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Ping Services
          </button>
        </div>
      </div>

      {/* Live Services Connectivity Probes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { name: "Supabase Cloud DB", key: "database", ...checks.database },
          { name: "Bot Engine Service", key: "botEngine", ...checks.botEngine },
          { name: "Redis Memory Queue", key: "redis", ...checks.redis },
          { name: "OpenBSP Meta Gateway", key: "openbsp", ...checks.openbsp },
        ].map(srv => {
          const isHealthy = srv.status === "healthy";
          return (
            <div key={srv.key} className="bg-dash-surface p-3.5 rounded-xl border border-dash-border flex flex-col justify-between gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-dash-text">{srv.name}</span>
                <span className={`w-2 h-2 rounded-full ${isHealthy ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
              </div>
              <div className="flex items-baseline justify-between text-xs font-mono">
                <span className={isHealthy ? "text-emerald-500 font-semibold" : "text-amber-500"}>
                  {srv.status.toUpperCase()}
                </span>
                <span className="text-dash-text-muted">{srv.latencyMs}ms</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Severity KPIs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Critical", count: criticalCount, color: "text-rose-600", bg: "bg-rose-500/10 border-rose-500/20", icon: XCircle },
          { label: "Warning",  count: warningCount,  color: "text-amber-600", bg: "bg-amber-500/10 border-amber-500/20", icon: AlertTriangle },
          { label: "Info",     count: infoCount,     color: "text-blue-600", bg: "bg-blue-500/10 border-blue-500/20",  icon: Info },
        ].map(k => {
          const Icon = k.icon;
          return (
            <button key={k.label} onClick={() => setSeverityFilter(severityFilter === k.label ? "All" : k.label)}
              className={`p-3 rounded-xl border ${k.bg} flex items-center justify-between text-left transition-transform active:scale-95`}>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted block">{k.label}</span>
                <span className={`text-2xl font-black ${k.color}`}>{k.count}</span>
              </div>
              <Icon className={`w-6 h-6 ${k.color} opacity-40`} />
            </button>
          );
        })}
      </div>

      {/* Search & Filter */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-dash-text-muted pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Filter by tenant, service, or message..."
            className="w-full pl-9 pr-3 py-2 bg-dash-surface border border-dash-border rounded-xl text-xs text-dash-text placeholder-dash-text-muted focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
        </div>
        <button onClick={() => setSeverityFilter("All")}
          className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${severityFilter === "All" ? "bg-[#EA6639] text-white" : "bg-dash-surface border border-dash-border text-dash-text hover:bg-dash-surface-hover"}`}>
          All ({logs.length})
        </button>
      </div>

      {/* Error Log List */}
      <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
            <p className="text-xs text-dash-text-sec">Checking live service diagnostics...</p>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-dash-text mb-1">All Systems Operational</h3>
            <p className="text-xs text-dash-text-sec max-w-sm">No error logs or incident alerts recorded. All connected services are passing live health probes.</p>
          </div>
        ) : (
          <div className="divide-y divide-dash-border">
            {visible.map(log => {
              const cfg = SEVERITY_CONFIG[log.severity] ?? SEVERITY_CONFIG["Info"];
              const Icon = cfg.icon;
              const isExpanded = expandedId === log.id;
              return (
                <div key={log.id} className="p-3.5 hover:bg-dash-canvas/40 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <span className={`p-1.5 rounded-lg border shrink-0 mt-0.5 ${cfg.bg}`}>
                        <Icon className={`w-3.5 h-3.5 ${cfg.color}`} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-semibold text-xs text-dash-text">{log.hotel}</span>
                          <span className="text-[10px] font-mono text-dash-text-muted bg-dash-canvas px-1.5 py-0.5 rounded border border-dash-border">
                            {log.node}
                          </span>
                          <span className="text-[10px] text-dash-text-muted">{log.time}</span>
                        </div>
                        <p className="text-xs text-dash-text-sec">{log.msg}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {log.trace && (
                        <button onClick={() => setExpandedId(isExpanded ? null : log.id)}
                          className="flex items-center gap-1 text-[10px] font-semibold text-dash-text-muted hover:text-dash-text">
                          {isExpanded ? <><ChevronUp className="w-3 h-3" />Hide</> : <><ChevronDown className="w-3 h-3" />Trace</>}
                        </button>
                      )}
                      <button onClick={() => setDismissed(d => new Set(d).add(log.id))}
                        className="text-[10px] font-semibold text-dash-text-muted hover:text-rose-500 transition-colors">
                        Dismiss
                      </button>
                    </div>
                  </div>
                  {isExpanded && log.trace && (
                    <div className="mt-3 p-3 bg-dash-canvas rounded-lg border border-dash-border text-[11px] font-mono text-dash-text-muted whitespace-pre-wrap overflow-x-auto">
                      {log.trace}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
