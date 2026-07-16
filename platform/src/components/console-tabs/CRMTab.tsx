import React from "react";
import { Search, Download, Filter, Eye, CheckCircle } from "lucide-react";

export function CRMTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Leads & CRM</h2>
          <p className="text-dash-text-sec mt-1">Manage and view all captured guest leads for follow-up.</p>
        </div>
        <button onClick={() => alert("Downloading leads as CSV...")} className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors">
          <Download className="w-4 h-4" /> Export Leads
        </button>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dash-border flex flex-wrap gap-4 items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              placeholder="Search by name, email, or phone..." 
              className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium text-dash-text">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Guest</th>
                <th className="px-6 py-4 font-semibold">Contact</th>
                <th className="px-6 py-4 font-semibold">Dates</th>
                <th className="px-6 py-4 font-semibold">Source</th>
                <th className="px-6 py-4 font-semibold">Quality</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { name: "Sarah Jenkins", email: "sarah.j@example.com", phone: "+1 555 0192", dates: "Oct 12 - Oct 15", source: "WhatsApp", quality: "High" },
                { name: "Mark Thompson", email: "m.thompson@example.com", phone: "+44 7700 900077", dates: "Nov 01 - Nov 05", source: "Web Widget", quality: "Medium" },
                { name: "Elena Rodriguez", email: "elena.r@example.com", phone: "+34 600 123 456", dates: "Dec 20 - Dec 27", source: "Instagram", quality: "Hot" },
              ].map((lead, i) => (
                <tr key={i} className="hover:bg-dash-surface-hover/50">
                  <td className="px-6 py-4 font-medium text-dash-text">{lead.name}</td>
                  <td className="px-6 py-4 text-dash-text-sec">
                    <div className="truncate">{lead.email}</div>
                    <div className="text-xs text-dash-text-muted">{lead.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-dash-text-sec whitespace-nowrap">{lead.dates}</td>
                  <td className="px-6 py-4 text-dash-text-sec">{lead.source}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      lead.quality === 'Hot' ? 'bg-red-100 text-red-700  ' :
                      lead.quality === 'High' ? 'bg-emerald-100 text-emerald-700  ' :
                      'bg-amber-100 text-amber-700  '
                    }`}>
                      {lead.quality}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-dash-text-muted hover:text-dash-green transition-colors" title="Mark as Contacted">
                        <CheckCircle className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-dash-text-muted hover:text-dash-text transition-colors" title="View Details">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-dash-border bg-dash-canvas text-xs text-dash-text-muted flex justify-between items-center">
          <span>Showing 1 to 3 of 248 entries</span>
          <div className="flex gap-1">
            <button className="px-2 py-1 border border-dash-border rounded hover:bg-white disabled:opacity-50">Prev</button>
            <button className="px-2 py-1 border border-dash-border rounded hover:bg-white">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
}
