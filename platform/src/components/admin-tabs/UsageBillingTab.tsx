import React from "react";
import { CreditCard, FileText, Download, TrendingUp } from "lucide-react";

export function UsageBillingTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Usage & Billing</h2>
          <p className="text-dash-text-sec mt-1">Track API usage and generate billing for clients.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
          <FileText className="w-4 h-4" /> Generate Invoices
        </button>
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 overflow-hidden">
        <div className="p-4 border-b border-dash-border bg-dash-canvas flex justify-between items-center">
          <h3 className="font-semibold text-dash-text">Current Month Usage</h3>
          <span className="text-xs text-dash-text-sec">Billing Period: June 2026</span>
        </div>
        <div className="overflow-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Client Name</th>
                <th className="px-6 py-4 font-semibold text-right">Messages Processed</th>
                <th className="px-6 py-4 font-semibold text-right">Leads Generated</th>
                <th className="px-6 py-4 font-semibold text-right">Est. API Cost</th>
                <th className="px-6 py-4 font-semibold text-right">Projected Invoice</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {[
                { name: "The Grand Horizon Resort", msgs: "45,210", leads: "1,204", cost: "$124.50", invoice: "$499.00" },
                { name: "Oceanview Boutique", msgs: "12,450", leads: "342", cost: "$35.10", invoice: "$199.00" },
                { name: "Alpine Lodge & Spa", msgs: "4,120", leads: "89", cost: "$11.20", invoice: "$99.00" },
              ].map((billing, i) => (
                <tr key={i} className="hover:bg-dash-surface-hover/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-dash-text">{billing.name}</td>
                  <td className="px-6 py-4 text-right font-mono text-dash-text-sec">{billing.msgs}</td>
                  <td className="px-6 py-4 text-right font-mono text-dash-text-sec">{billing.leads}</td>
                  <td className="px-6 py-4 text-right font-mono text-amber-600">{billing.cost}</td>
                  <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">{billing.invoice}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs text-dash-green hover:underline font-medium">View Report</button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-dash-canvas border-t border-dash-border">
              <tr>
                <td className="px-6 py-4 font-bold text-dash-text text-right">TOTAL</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-dash-text">61,780</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-dash-text">1,635</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-amber-600">$170.80</td>
                <td className="px-6 py-4 text-right font-mono font-bold text-emerald-600">$797.00</td>
                <td className="px-6 py-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
