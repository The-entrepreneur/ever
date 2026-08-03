import React from "react";
import { ListTree, RotateCcw, Trash2, Activity } from "lucide-react";

export function QueueManagementTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Queue Management</h2>
          <p className="text-dash-text-sec mt-1">Monitor BullMQ & Redis asynchronous tasks.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors">
          <Trash2 className="w-4 h-4" /> Clear Completed
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Waiting", value: "14", color: "text-dash-text" },
          { label: "Active", value: "3", color: "text-blue-500" },
          { label: "Completed", value: "1,402", color: "text-emerald-500" },
          { label: "Failed", value: "2", color: "text-red-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-dash-surface p-5 rounded-lg border border-dash-border flex flex-col justify-between">
            <span className="text-xs font-medium text-dash-text-sec">{stat.label}</span>
            <span className={`text-section font-bold mt-2 ${stat.color}`}>{stat.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-dash-border bg-dash-canvas">
          <h3 className="font-semibold text-dash-text">Recent Failed & Active Jobs</h3>
        </div>
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Job ID</th>
                <th className="px-6 py-4 font-semibold">Target Client</th>
                <th className="px-6 py-4 font-semibold">Payload (Truncated)</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { id: "job_99823", client: "grand-horizon", payload: '{"event":"abandoned_cart","data":{...}}', status: "Failed" },
                { id: "job_99824", client: "alpine-lodge", payload: '{"event":"follow_up_sms","data":{...}}', status: "Failed" },
                { id: "job_99830", client: "oceanview-boutique", payload: '{"event":"pms_sync","data":{...}}', status: "Active" },
              ].map((job, i) => (
                <tr key={i} className="hover:bg-dash-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-xs text-dash-text-sec">{job.id}</td>
                  <td className="px-6 py-4 font-mono text-xs text-dash-text">{job.client}</td>
                  <td className="px-6 py-4 font-mono text-xs text-dash-text-sec truncate max-w-[200px]">{job.payload}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      job.status === 'Failed' ? 'bg-red-100 text-red-700  ' : 'bg-blue-100 text-blue-700  '
                    }`}>
                      {job.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {job.status === 'Failed' && (
                      <button className="px-3 py-1.5 text-xs font-medium text-dash-text border border-dash-border rounded hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5 ml-auto">
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    )}
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
