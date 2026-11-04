import React, { useState, useEffect } from "react";
import { ListTree, RefreshCw, Trash2, RotateCcw, AlertTriangle, CheckCircle2, Clock, Play, Loader2 } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface QueueJob {
  id: string;
  hotelId?: string;
  channel?: string;
  client?: string;
  type?: string;
  payload?: string;
  status: string;
  attempts?: number;
  messageCount?: number;
  lastActivity?: string;
}

const SANDBOX_JOBS: QueueJob[] = [
  { id: "job-101", client: "The Grand Horizon", type: "WhatsApp Msg", payload: "Guest check-in inquiry #8821", status: "In Progress", attempts: 1, lastActivity: "2s ago" },
  { id: "job-102", client: "Oceanview Boutique", type: "SMS Dispatch", payload: "Booking confirmation SMS to +234...", status: "Queued", attempts: 0, lastActivity: "12s ago" },
  { id: "job-103", client: "Alpine Lodge & Spa", type: "Email Webhook", payload: "Folio invoice PDF dispatch", status: "Retrying", attempts: 2, lastActivity: "1m ago" },
];

export function QueueManagementTab() {
  const { isSandbox } = useSandbox();
  const [jobs, setJobs] = useState<QueueJob[]>([]);
  const [summary, setSummary] = useState({ pendingJobs: 0, failedJobs: 0, activeWorkers: 1, engineStatus: "idle" });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [flushing, setFlushing] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchQueues = async () => {
    setLoading(true);
    if (isSandbox) {
      setJobs(SANDBOX_JOBS);
      setSummary({ pendingJobs: 2, failedJobs: 1, activeWorkers: 2, engineStatus: "active" });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/queues");
      const data = await res.json();
      if (res.ok && data.success) {
        setJobs(data.jobs || []);
        setSummary(data.summary || summary);
      }
    } catch (err) {
      console.error("[QueueManagementTab] Error fetching queues:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueues();
  }, [isSandbox]);

  const handleFlush = async () => {
    setFlushing(true);
    try {
      await fetch("/api/admin/queues/flush", { method: "POST" });
      await fetchQueues();
      setShowConfirm(false);
    } catch (err) {
      console.error("[QueueManagementTab] Error flushing queue:", err);
    } finally {
      setFlushing(false);
    }
  };

  const filtered = jobs.filter(j => {
    if (filter === "All") return true;
    return j.status.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="p-3 md:p-5 space-y-4 h-full overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-header font-bold text-dash-text">Queue Management</h2>
          <p className="text-body text-dash-text-sec mt-0.5">BullMQ & Redis job queues for guest messages, notifications, and webhooks.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowConfirm(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-600 rounded-lg text-xs font-semibold hover:bg-rose-500/20 transition-colors">
            <Trash2 className="w-3.5 h-3.5" /> Flush Queue
          </button>
          <button onClick={fetchQueues} disabled={loading} className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-dash-surface rounded-2xl border border-dash-border max-w-sm w-full p-5 space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-sm font-bold text-dash-text">Confirm Queue Flush</h3>
              <p className="text-xs text-dash-text-sec mt-1">This will clear all pending jobs in the Redis worker pool. This action cannot be undone.</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 rounded-xl border border-dash-border text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors">
                Cancel
              </button>
              <button onClick={handleFlush} disabled={flushing} className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5">
                {flushing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Flush Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Pending Jobs", value: summary.pendingJobs, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
          { label: "Failed Jobs", value: summary.failedJobs, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
          { label: "Active Workers", value: summary.activeWorkers, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Engine Status", value: summary.engineStatus.toUpperCase(), color: "text-dash-text", bg: "bg-dash-surface border-dash-border" },
        ].map(k => (
          <div key={k.label} className={`p-3.5 rounded-xl border ${k.bg} flex flex-col gap-1`}>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">{k.label}</span>
            <span className={`text-xl font-black ${k.color}`}>{k.value}</span>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["All", "Pending", "In Progress", "Failed"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${filter === f ? "bg-[#EA6639] text-white" : "bg-dash-surface border border-dash-border text-dash-text hover:bg-dash-surface-hover"}`}>
            {f}
          </button>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
            <p className="text-xs text-dash-text-sec">Connecting to Redis BullMQ dispatcher...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold text-dash-text mb-1">Task Queues Clear</h3>
            <p className="text-xs text-dash-text-sec max-w-sm">No queued, active, or failed worker jobs. Message dispatcher is idling cleanly.</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-dash-text-sec bg-dash-canvas uppercase tracking-wider border-b border-dash-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Job ID</th>
                <th className="px-4 py-3 font-semibold">Channel / Client</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Messages</th>
                <th className="px-4 py-3 font-semibold text-right">Last Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {filtered.map(j => (
                <tr key={j.id} className="hover:bg-dash-canvas/40 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-dash-text">{j.id}</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-dash-text">{j.channel || j.type || "WhatsApp"}</span>
                    {j.client && <span className="text-[10px] text-dash-text-muted block font-mono">{j.client}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-dash-text">{j.messageCount || 1}</td>
                  <td className="px-4 py-3 text-right text-dash-text-muted font-mono">{j.lastActivity || "Just now"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
