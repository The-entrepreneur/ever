import React, { useState } from "react";
import { Star, Filter, Download, MessageSquare, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export function FeedbackTab() {
  const [dateRange, setDateRange] = useState("Last 30 Days");

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Feedback & Reviews</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Monitor guest sentiment and configure auto-response rules.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-40 dashboard-btn compact-touch-target h-8 pl-3 pr-8 bg-dash-surface border border-dash-border rounded-md text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text focus:outline-none"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-text-muted pointer-events-none" />
          </div>
          <button className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-current" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">4.8</span>
            <span className="text-micro font-bold text-dash-text-muted">/ 5.0</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Total Responses</span>
            <MessageSquare className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">342</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Response Rate</span>
            <CheckCircle2 className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">42%</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Positive Sentiment</span>
            <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">94%</span>
            <span className="text-micro font-bold text-dash-text-muted">Rated 4-5★</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Rating Distribution & Rules */}
        <div className="flex flex-col gap-6">
          <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
            <h3 className="text-section font-semibold text-dash-text mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {[
                { stars: 5, pct: 75 },
                { stars: 4, pct: 19 },
                { stars: 3, pct: 4 },
                { stars: 2, pct: 1 },
                { stars: 1, pct: 1 }
              ].map(row => (
                <div key={row.stars} className="flex items-center gap-3">
                  <div className="flex items-center w-10 text-data font-medium text-dash-text">
                    {row.stars} <Star className="w-3 h-3 ml-1 fill-current text-dash-text-muted" />
                  </div>
                  <div className="flex-1 h-2 bg-dash-surface-raised rounded-md overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-md" style={{ width: `${row.pct}%` }}></div>
                  </div>
                  <div className="w-8 text-right text-micro text-dash-text-muted font-mono">{row.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
            <h3 className="text-section font-semibold text-dash-text mb-4">Auto-Response Rules</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                <div>
                  <h4 className="text-body font-medium text-dash-text">Ask for Google Review</h4>
                  <p className="text-micro text-dash-text-muted mt-0.5">When rating ≥ 4 stars</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-md bg-white border-4 border-dash-border appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-5 checked:border-[#EA6639]" style={{ width: '1.25rem', height: '1.25rem', top: '0', left: '0' }}/>
                  <label className="toggle-label block overflow-hidden h-5 rounded-md bg-dash-green cursor-pointer"></label>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                <div>
                  <h4 className="text-body font-medium text-dash-text">Alert Manager</h4>
                  <p className="text-micro text-dash-text-muted mt-0.5">When rating ≤ 2 stars</p>
                </div>
                <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                  <input type="checkbox" defaultChecked className="toggle-checkbox absolute block w-5 h-5 rounded-md bg-white border-4 border-dash-border appearance-none cursor-pointer transition-transform duration-200 ease-in-out translate-x-5 checked:border-[#EA6639]" style={{ width: '1.25rem', height: '1.25rem', top: '0', left: '0' }}/>
                  <label className="toggle-label block overflow-hidden h-5 rounded-md bg-dash-green cursor-pointer"></label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback Table */}
        <div className="lg:col-span-2 bg-dash-surface p-0 rounded-lg border border-dash-border flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-surface z-10 sticky top-0">
             <h3 className="text-section font-semibold text-dash-text">Recent Feedback</h3>
             <button className="flex items-center gap-1.5 px-3 py-1.5 border border-dash-border rounded-md text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
               <Filter className="w-3.5 h-3.5" />
               <span>Filter</span>
             </button>
          </div>
          <div className="overflow-x-auto flex-1 hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border bg-dash-canvas/50 /50">
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Guest</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Rating</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider w-full min-w-[200px]">Comment</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {[
                  { name: "John Smith", rating: 5, comment: "Loved the easy booking process through WhatsApp. Very fast!", date: "Today" },
                  { name: "Sarah Connor", rating: 4, comment: "Bot was helpful, but I needed to speak to a human eventually.", date: "Yesterday" },
                  { name: "Mike Davis", rating: 5, comment: "Excellent service.", date: "Oct 24" },
                  { name: "Emma Wilson", rating: 2, comment: "Room service took too long. Bot couldn't help speed it up.", date: "Oct 22" },
                  { name: "James Brown", rating: 5, comment: "Super convenient way to ask for extra towels.", date: "Oct 21" }
                ].map((fb, idx) => (
                  <tr key={idx} className="hover:bg-dash-surface-hover transition-colors group cursor-pointer">
                    <td className="p-3">
                      <div className="font-medium text-body text-dash-text whitespace-nowrap">{fb.name}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex text-amber-500">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? "fill-current" : "text-dash-text"}`} />
                        ))}
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-data text-dash-text-sec line-clamp-1">{fb.comment}</div>
                    </td>
                    <td className="p-3">
                      <div className="text-data text-dash-text-muted whitespace-nowrap">{fb.date}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
