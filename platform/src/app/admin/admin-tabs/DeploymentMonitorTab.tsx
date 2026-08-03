import React from "react";
import { Server, RefreshCw, Terminal, AlertCircle, CheckCircle2 } from "lucide-react";

export function DeploymentMonitorTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Deployment Monitor</h2>
          <p className="text-dash-text-sec mt-1">Monitor technical status and health of n8n workflows and Docker containers.</p>
        </div>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Client Instance</th>
              <th className="px-6 py-4 font-semibold">Deployment Status</th>
              <th className="px-6 py-4 font-semibold">n8n Workflow Version</th>
              <th className="px-6 py-4 font-semibold">Last Deployed At</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {[
              { name: "The Grand Horizon", slug: "grand-horizon", status: "Running", version: "v1.2.4", date: "2 hrs ago" },
              { name: "Oceanview Boutique", slug: "oceanview-boutique", status: "Running", version: "v1.2.4", date: "1 day ago" },
              { name: "Alpine Lodge & Spa", slug: "alpine-lodge", status: "Error", version: "v1.2.3", date: "3 days ago" },
              { name: "Sunset Villas", slug: "sunset-villas", status: "Stopped", version: "v1.0.0", date: "1 week ago" },
            ].map((deploy, i) => (
              <tr key={i} className="hover:bg-dash-surface-hover/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-dash-text">{deploy.name}</div>
                  <div className="text-xs text-dash-text-muted font-mono mt-0.5">{deploy.slug}-prod</div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {deploy.status === 'Running' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                    {deploy.status === 'Error' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {deploy.status === 'Stopped' && <Server className="w-4 h-4 text-dash-text-muted" />}
                    <span className={`text-xs font-bold uppercase tracking-wider ${
                      deploy.status === 'Running' ? 'text-emerald-700 ' :
                      deploy.status === 'Error' ? 'text-red-700 ' :
                      'text-dash-text-sec'
                    }`}>
                      {deploy.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-dash-text font-mono text-xs">
                  {deploy.version}
                </td>
                <td className="px-6 py-4 text-dash-text-sec text-xs">{deploy.date}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-dash-text border border-dash-border rounded hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5">
                      <RefreshCw className="w-3 h-3" /> Restart
                    </button>
                    <button className="px-3 py-1.5 text-xs font-medium text-dash-text border border-dash-border rounded hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5">
                      <Terminal className="w-3 h-3" /> Logs
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
