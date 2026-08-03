import React, { useState } from "react";
import { Calendar as CalendarIcon, Filter, Search, MoreHorizontal, Download, Eye, X, Coffee, List } from "lucide-react";

export function BookingsTab() {
  const [viewMode, setViewMode] = useState<"calendar" | "list">("list");
  const [activeSubTab, setActiveSubTab] = useState<"bookings" | "orders">("bookings");

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Booking Management</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage Level 2 confirmed bookings and guest orders.</p>
        </div>
        
        {/* Toggle View & Actions */}
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          {activeSubTab === "bookings" && (
            <div className="flex bg-dash-canvas border border-dash-border rounded-md p-0.5">
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "list" ? "bg-white  text-white shadow-sm" : "text-dash-text-muted hover:text-dash-text-sec "}`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-colors ${viewMode === "calendar" ? "bg-white  text-white shadow-sm" : "text-dash-text-muted hover:text-dash-text-sec "}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>
          )}
          <button className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-dash-border">
        <button 
          onClick={() => setActiveSubTab("bookings")}
          className={`pb-2 text-sm font-medium transition-colors relative ${activeSubTab === "bookings" ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec "}`}
        >
          Bookings
          {activeSubTab === "bookings" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full"></span>}
        </button>
        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`pb-2 text-sm font-medium transition-colors relative ${activeSubTab === "orders" ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec "}`}
        >
          Orders & Service Requests
          {activeSubTab === "orders" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full"></span>}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-dash-surface p-0 rounded-lg border border-dash-border flex flex-col flex-1 min-h-[400px]">
        {activeSubTab === "bookings" ? (
          <>
            {/* Toolbar */}
            <div className="p-3 border-b border-dash-border flex flex-col sm:flex-row justify-between gap-3 bg-dash-canvas/50 /50">
              <div className="relative w-full sm:w-[240px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dash-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search bookings..." 
                  className="w-full pl-9 pr-3 py-1.5 bg-white border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text placeholder-zinc-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status: All</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Dates</span>
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="overflow-x-auto flex-1 hide-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dash-border">
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Ref</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Guest</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Room Type</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Check In/Out</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Total</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                      <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {[
                      { ref: "BK-8892", guest: "Alice Smith", room: "Deluxe Ocean View", dates: "Oct 24 - Oct 28", total: "$1,200", status: "Confirmed" },
                      { ref: "BK-8891", guest: "Bob Johnson", room: "Standard King", dates: "Oct 25 - Oct 26", total: "$250", status: "Confirmed" },
                      { ref: "BK-8890", guest: "Charlie Brown", room: "Presidential Suite", dates: "Nov 01 - Nov 05", total: "$4,500", status: "Cancelled" }
                    ].map((bk, i) => (
                      <tr key={i} className="hover:bg-dash-surface-hover transition-colors group cursor-pointer">
                        <td className="p-3 text-data font-mono text-dash-text-muted">{bk.ref}</td>
                        <td className="p-3 font-medium text-body text-dash-text">{bk.guest}</td>
                        <td className="p-3 text-data text-dash-text-sec">{bk.room}</td>
                        <td className="p-3 text-data text-dash-text-sec">{bk.dates}</td>
                        <td className="p-3 text-data text-dash-text font-mono">{bk.total}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${bk.status === "Confirmed" ? "bg-emerald-100  text-emerald-700 " : "bg-red-100  text-red-700 "}`}>
                            {bk.status}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button className="text-dash-text-muted hover:text-dash-green transition-colors"><MoreHorizontal className="w-4 h-4 ml-auto" /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-dash-canvas/50 min-h-[300px]">
                <div className="text-center">
                  <CalendarIcon className="w-8 h-8 text-dash-text mx-auto mb-3" />
                  <p className="text-data text-dash-text-muted">Calendar view is currently not populated.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="p-3 border-b border-dash-border flex flex-col sm:flex-row justify-between gap-3 bg-dash-canvas/50 /50">
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
                  <Filter className="w-3.5 h-3.5" />
                  <span>Status: Pending/Preparing</span>
                </button>
              </div>
            </div>
            <div className="overflow-x-auto flex-1 hide-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dash-border">
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Order</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Guest & Room</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Item</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Time</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3 text-data font-mono text-dash-text-muted">ORD-102</td>
                    <td className="p-3">
                      <div className="font-medium text-body text-dash-text">John Doe</div>
                      <div className="text-micro text-dash-text-muted">Room 304</div>
                    </td>
                    <td className="p-3 text-data text-dash-text-sec">
                      <div className="flex items-center gap-1.5"><Coffee className="w-3.5 h-3.5 text-amber-600" /> Club Sandwich</div>
                    </td>
                    <td className="p-3 text-data text-dash-text-muted">10 mins ago</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Preparing</span></td>
                    <td className="p-3 text-right">
                       <button className="text-xs font-medium text-dash-green hover:underline">Complete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

    </div>
  );
}
