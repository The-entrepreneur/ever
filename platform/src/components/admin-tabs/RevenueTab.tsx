import React, { useState } from "react";
import { Download, ChevronDown, DollarSign, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";

export function RevenueTab() {
  const [dateRange, setDateRange] = useState("This Month");

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Revenue & Commission</h2>
          <p className="text-body text-dash-text-sec mt-0.5">View agency MRR, client revenue breakdown, and invoice reconciliation.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-40 dashboard-btn compact-touch-target h-8 pl-3 pr-8 bg-dash-surface border border-dash-border rounded-lg text-body font-medium hover:bg-dash-surface-hover transition-colors text-dash-text focus:outline-none"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Quarter</option>
              <option>Year to Date</option>
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
            <span className="text-data font-medium text-dash-text-sec leading-tight">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-dash-green shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">$42,850</span>
            <span className="text-micro font-bold text-emerald-600">+12.5%</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Total MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">$12,400</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Performance Fees</span>
            <DollarSign className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">$30,450</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Pending Invoices</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">$4,200</span>
            <span className="text-micro font-bold text-amber-500">3 Overdue</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Revenue Breakdown Chart */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-section font-semibold text-dash-text">Revenue Breakdown</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-md bg-emerald-500"></div><span className="text-micro text-dash-text-muted">MRR</span></div>
              <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-md bg-dash-green"></div><span className="text-micro text-dash-text-muted">Fees</span></div>
            </div>
          </div>
          <div className="h-64 border border-dashed border-dash-border rounded-lg flex items-center justify-center bg-dash-canvas">
            <span className="text-data text-dash-text-muted font-mono">[Stacked Bar Chart: Subscription vs Performance Fees]</span>
          </div>
        </div>

        {/* Invoice Reconciliation */}
        <div className="bg-dash-surface p-4 rounded-lg border border-dash-border flex flex-col h-full">
           <h3 className="text-section font-semibold text-dash-text mb-4">Invoice Reconciliation</h3>
           <div className="overflow-x-auto flex-1 hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border">
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Client</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Amount</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Stripe Match</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-3 text-data text-dash-text">The Grand Hotel</td>
                  <td className="py-3 text-data font-mono">$1,250.00</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Paid</span></td>
                  <td className="py-3 text-right"><span className="text-emerald-500 flex justify-end"><CheckCircle2 className="w-4 h-4" /></span></td>
                </tr>
                <tr>
                  <td className="py-3 text-data text-dash-text">Oceanview Resort</td>
                  <td className="py-3 text-data font-mono">$850.00</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Pending</span></td>
                  <td className="py-3 text-right"><span className="text-dash-text-muted text-xs">—</span></td>
                </tr>
                <tr>
                  <td className="py-3 text-data text-dash-text">Mountain Lodge</td>
                  <td className="py-3 text-data font-mono">$420.00</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Overdue</span></td>
                  <td className="py-3 text-right"><span className="text-red-500 flex justify-end"><AlertTriangle className="w-4 h-4" /></span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Client Revenue Ranking */}
      <div className="bg-dash-surface p-0 rounded-lg border border-dash-border flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-canvas/50 /50">
           <h3 className="text-section font-semibold text-dash-text">Client Revenue Ranking</h3>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dash-border">
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Client</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Plan / MRR</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Booking Value (L2)</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Performance Fee</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Total Rev (YTD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { name: "The Grand Hotel", plan: "Enterprise ($500)", bookingVal: "$42,500", perfFee: "$1,275", ytd: "$14,200" },
                { name: "Oceanview Resort", plan: "Growth ($299)", bookingVal: "$18,200", perfFee: "$546", ytd: "$8,540" },
                { name: "City Plaza Suites", plan: "Starter ($99)", bookingVal: "$0", perfFee: "$0", ytd: "$1,188" }
              ].map((row, idx) => (
                <tr key={idx} className="hover:bg-dash-surface-hover transition-colors group">
                  <td className="p-3 font-medium text-body text-dash-text">{row.name}</td>
                  <td className="p-3 text-data text-dash-text-sec">{row.plan}</td>
                  <td className="p-3 text-data font-mono text-dash-text-sec">{row.bookingVal}</td>
                  <td className="p-3 text-data font-mono text-dash-green font-medium">{row.perfFee}</td>
                  <td className="p-3 text-data font-mono text-dash-text font-semibold">{row.ytd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

