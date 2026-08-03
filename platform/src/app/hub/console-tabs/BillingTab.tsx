import React from "react";
import { CreditCard, Download, ExternalLink, Receipt, Package, Zap } from "lucide-react";

export function BillingTab() {
  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Billing & Subscription</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage your hotel's AI subscription plan, usage, and invoices.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <CreditCard className="w-3.5 h-3.5" />
            <span>Update Payment Method</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Current Plan Card */}
        <div className="bg-dash-surface text-dash-text p-6 rounded-lg border border-dash-border-strong flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EA6639]/20 to-purple-500/20 blur-3xl rounded-md translate-x-8 -translate-y-8"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-dash-green" />
                <h3 className="text-section font-bold text-dash-text">Growth Plan</h3>
              </div>
              <p className="text-micro text-dash-text-muted">Billed monthly</p>
            </div>
            <span className="px-2.5 py-1 bg-dash-green/20 text-dash-green text-[10px] font-bold rounded-md uppercase tracking-wider">Active</span>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-section font-black">$299</span>
              <span className="text-data text-dash-text-muted">/mo</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-8 relative z-10 flex-1">
             <div className="flex items-center gap-2 text-data text-dash-text">
               <Zap className="w-4 h-4 text-dash-green" /> 10,000 Messages / month
             </div>
             <div className="flex items-center gap-2 text-data text-dash-text">
               <Zap className="w-4 h-4 text-dash-green" /> Level 2 Booking Workflows
             </div>
             <div className="flex items-center gap-2 text-data text-dash-text">
               <Zap className="w-4 h-4 text-dash-green" /> Multi-channel Support
             </div>
          </div>
          
          <button className="w-full px-3 py-1.5 bg-white text-dash-text rounded-md text-xs font-semibold hover:bg-dash-surface-hover transition-colors relative z-10">Manage Subscription</button>
        </div>

        {/* Usage This Month */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border">
            <h3 className="text-section font-semibold text-dash-text mb-4">Usage This Month</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-data font-medium text-dash-text">Messages</span>
                  <span className="text-micro font-mono text-dash-text-muted">8,420 / 10,000</span>
                </div>
                <div className="h-2 w-full bg-dash-surface-raised rounded-md overflow-hidden">
                  <div className="h-full bg-dash-green rounded-md" style={{ width: '84.2%' }}></div>
                </div>
                <p className="text-[10px] text-dash-text-muted mt-1">Resets on Nov 1, 2023</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-data font-medium text-dash-text">Active Channels</span>
                  <span className="text-micro font-mono text-dash-text-muted">3 / 5</span>
                </div>
                <div className="h-2 w-full bg-dash-surface-raised rounded-md overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-md" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Booking Fee Summary (L2) */}
          <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-section font-semibold text-dash-text">Booking Fee Summary</h3>
               <span className="px-2 py-0.5 bg-dash-surface-raised text-dash-text-sec rounded text-[10px] font-bold">Oct 2023</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                 <span className="text-micro text-dash-text-muted block mb-1">Total Booking Value</span>
                 <span className="text-header font-bold text-dash-text">$14,250.00</span>
               </div>
               <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                 <span className="text-micro text-dash-text-muted block mb-1">Agency Fee (3%)</span>
                 <span className="text-header font-bold text-dash-green">$427.50</span>
               </div>
            </div>
            <p className="text-micro text-dash-text-muted mt-3 text-right">Fee is calculated on completed bookings only.</p>
          </div>
        </div>
      </div>

      {/* Invoice History */}
      <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border">
        <h3 className="text-section font-semibold text-dash-text mb-4">Invoice History</h3>
        <div className="overflow-x-auto hide-scrollbar border border-dash-border rounded-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-dash-border bg-dash-canvas/50 /50">
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Date</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Period</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Amount</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Download</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              <tr>
                <td className="p-3 text-data text-dash-text font-medium">Oct 1, 2023</td>
                <td className="p-3 text-data text-dash-text-sec">Sep 1 - Sep 30</td>
                <td className="p-3 text-data text-dash-text font-mono">$726.50</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Paid</span></td>
                <td className="p-3 text-right">
                  <button className="text-dash-text-muted hover:text-dash-green transition-colors"><Download className="w-4 h-4 ml-auto" /></button>
                </td>
              </tr>
              <tr>
                <td className="p-3 text-data text-dash-text font-medium">Sep 1, 2023</td>
                <td className="p-3 text-data text-dash-text-sec">Aug 1 - Aug 31</td>
                <td className="p-3 text-data text-dash-text font-mono">$654.20</td>
                <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Paid</span></td>
                <td className="p-3 text-right">
                  <button className="text-dash-text-muted hover:text-dash-green transition-colors"><Download className="w-4 h-4 ml-auto" /></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
