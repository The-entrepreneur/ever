import React from "react";
import { AlertTriangle, Search, Filter, ShieldAlert } from "lucide-react";

export function SystemHealthTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">System Health & Error Logs</h2>
          <p className="text-dash-text-sec mt-1">Centralized monitoring of all system errors across all client instances.</p>
        </div>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dash-border flex flex-wrap gap-4 items-center justify-between bg-dash-canvas">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              placeholder="Search error messages..." 
              className="w-full pl-9 pr-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
          <div className="flex gap-2">
            <select className="px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text focus:outline-none">
              <option>All Severities</option>
              <option>Critical</option>
              <option>Warning</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Timestamp</th>
                <th className="px-6 py-4 font-semibold">Client / Node</th>
                <th className="px-6 py-4 font-semibold">Severity</th>
                <th className="px-6 py-4 font-semibold">Error Message</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { time: "2026-06-27 18:02:14", hotel: "Sunset Villas", node: "WhatsApp Trigger", severity: "Critical", msg: "Authentication failed. Token expired or revoked." },
                { time: "2026-06-27 17:45:00", hotel: "Alpine Lodge & Spa", node: "LLM Completion", severity: "Warning", msg: "API response latency > 2000ms threshold." },
                { time: "2026-06-27 16:30:22", hotel: "The Grand Horizon", node: "Postgres Sync", severity: "Critical", msg: "Connection refused. DB host unreachable." },
              ].map((log, i) => (
                <tr key={i} className="hover:bg-dash-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 text-dash-text-sec font-mono text-xs">{log.time}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-dash-text text-xs">{log.hotel}</div>
                    <div className="text-[10px] text-dash-text-muted font-mono">{log.node}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      log.severity === 'Critical' ? 'bg-red-100 text-red-700  ' : 'bg-amber-100 text-amber-700  '
                    }`}>
                      {log.severity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dash-text text-xs font-mono truncate max-w-xs">{log.msg}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-dash-green hover:underline font-medium">Trace</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
