import React, { useState } from "react";
import { Search, Filter, Plus, Edit2, Play, Square, Settings } from "lucide-react";

export function ClientManagementTab() {
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);

  return (
    <div className="p-6 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Client Management</h2>
          <p className="text-dash-text-sec mt-1">Onboard new hotel clients, manage service tiers, and configure deployments.</p>
        </div>
        <button 
          onClick={() => setIsAddClientOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors"
        >
          <Plus className="w-4 h-4" /> Add New Client
        </button>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dash-border flex flex-wrap gap-4 items-center justify-between bg-dash-canvas">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              placeholder="Search by hotel name or slug..." 
              className="w-full pl-9 pr-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text">
              <Filter className="w-4 h-4" /> Filter Tier
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Hotel Name</th>
                <th className="px-6 py-4 font-semibold">Slug ID</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Created At</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { name: "The Grand Horizon Resort", slug: "grand-horizon", tier: "Enterprise", status: "Active", date: "2024-01-15" },
                { name: "Oceanview Boutique", slug: "oceanview-boutique", tier: "Growth", status: "Active", date: "2024-02-28" },
                { name: "Alpine Lodge & Spa", slug: "alpine-lodge", tier: "Starter", status: "Active", date: "2024-03-10" },
                { name: "Sunset Villas", slug: "sunset-villas", tier: "Starter", status: "Inactive", date: "2024-04-05" },
              ].map((client, i) => (
                <tr key={i} className="hover:bg-dash-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-dash-text">{client.name}</td>
                  <td className="px-6 py-4 text-dash-text-sec font-mono text-xs">{client.slug}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-dash-surface-raised text-dash-text rounded text-xs font-medium">
                      {client.tier}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                      client.status === 'Active' ? 'bg-emerald-100 text-emerald-700  ' : 'bg-dash-surface-raised text-dash-text-sec  '
                    }`}>
                      {client.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-dash-text-sec text-xs">{client.date}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-1.5 text-dash-text-muted hover:text-emerald-500 transition-colors" title="Deploy / Redeploy">
                        <Play className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-dash-text-muted hover:text-amber-500 transition-colors" title={client.status === 'Active' ? "Deactivate" : "Activate"}>
                        {client.status === 'Active' ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </button>
                      <button className="p-1.5 text-dash-text-muted hover:text-dash-green transition-colors" title="Edit Client">
                        <Settings className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isAddClientOpen && (
        <div className="fixed inset-0 z-[100] bg-dash-surface/40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-lg rounded-lg shadow-xl border border-dash-border overflow-hidden">
            <div className="px-6 py-4 border-b border-dash-border-hairline flex items-center justify-between">
              <h3 className="font-semibold text-dash-text">Onboard New Client</h3>
              <button onClick={() => setIsAddClientOpen(false)} className="text-dash-text-muted hover:text-dash-text-sec transition-colors">&times;</button>
            </div>
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Hotel Name</label>
                <input type="text" placeholder="e.g. The Grand Hotel" className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Hotel Slug (Auto-generated)</label>
                <input type="text" placeholder="the-grand-hotel" className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Service Tier</label>
                  <select className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                    <option>Starter</option>
                    <option>Growth</option>
                    <option>Enterprise</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Default Rep Email</label>
                  <input type="email" placeholder="admin@hotel.com" className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Initial Bot Config (JSON)</label>
                <textarea rows={5} className="w-full px-3 py-2 bg-dash-surface border border-dash-border-strong rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-[#EA6639]" defaultValue={'{\n  "botTone": "Formal",\n  "humanOnly": false\n}'}></textarea>
              </div>
            </div>
            <div className="p-4 border-t border-dash-border-hairline bg-dash-surface flex justify-end gap-2">
              <button onClick={() => setIsAddClientOpen(false)} className="px-3 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
              <button className="px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">Create & Deploy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
