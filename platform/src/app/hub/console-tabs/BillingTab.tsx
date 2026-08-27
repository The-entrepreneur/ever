import React, { useState, useMemo } from "react";
import { CreditCard, Download, ExternalLink, Receipt, Package, Zap, CheckCircle2, RefreshCw, X, Loader2 } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { useToast } from "../../../shared/ToastContext";

export function BillingTab() {
  const { subscriptionStatus, hotelId } = useAuth();
  const { isSandbox, data: sandboxData, regenerate } = useSandbox();
  const { formatMoney } = useCurrency();
  const { showToast } = useToast();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);

  // Compute live or sandbox metrics
  const planName = subscriptionStatus === "level_2" || isSandbox ? "Growth Plan (Level 2)" : "Starter Plan";
  const planMonthlyPrice = subscriptionStatus === "level_2" || isSandbox ? 299 : 149;
  const isPlanActive = true;

  // Calculate dynamic booking volume from bookings
  const bookingMetrics = useMemo(() => {
    const bookings = sandboxData?.bookings || [];
    const confirmed = bookings.filter(b => b.status === "Confirmed");
    const totalValue = confirmed.reduce((acc, b) => acc + (b.total_amount || 0), 0);
    const agencyFee = totalValue * 0.03; // 3% Level 2 agency fee
    return {
      totalCount: confirmed.length,
      totalValue,
      agencyFee
    };
  }, [sandboxData?.bookings]);

  const invoices = useMemo(() => {
    if (isSandbox && sandboxData?.invoices) {
      return sandboxData.invoices;
    }
    return [
      { id: "INV-2026-008", date: "Aug 1, 2026", period: "Jul 1 - Jul 31", amount: 726.50, status: "Paid" as const },
      { id: "INV-2026-007", date: "Jul 1, 2026", period: "Jun 1 - Jun 30", amount: 654.20, status: "Paid" as const },
    ];
  }, [isSandbox, sandboxData?.invoices]);

  const handleDownloadInvoice = (invoiceId: string) => {
    showToast(`Downloading PDF for invoice ${invoiceId}...`, "info");
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPayment(true);
    setTimeout(() => {
      setUpdatingPayment(false);
      setShowPaymentModal(false);
      showToast("Payment method updated securely via Stripe", "success");
    }, 800);
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Billing &amp; Subscription</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage your hotel&apos;s AI subscription plan, usage limits, and invoices.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Billing demo data refreshed", "success");
              }}
              className="flex-1 sm:flex-initial h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          )}
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Update Payment Method</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── Current Plan Card ── */}
        <div className="bg-dash-surface text-dash-text p-6 rounded-xl border border-dash-border shadow-sm flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#EA6639]/20 to-purple-500/20 blur-3xl rounded-md translate-x-8 -translate-y-8 pointer-events-none"></div>
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Package className="w-5 h-5 text-[#EA6639]" />
                <h3 className="text-base font-bold text-dash-text">{planName}</h3>
              </div>
              <p className="text-[10px] text-dash-text-muted">Billed monthly via Stripe</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-bold rounded-md uppercase tracking-wider">
              {isPlanActive ? "Active" : "Trial"}
            </span>
          </div>
          
          <div className="mb-6 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-dash-text">{formatMoney(planMonthlyPrice)}</span>
              <span className="text-xs text-dash-text-muted">/month</span>
            </div>
          </div>
          
          <div className="space-y-3 mb-8 relative z-10 flex-1">
             <div className="flex items-center gap-2 text-xs text-dash-text">
               <Zap className="w-4 h-4 text-[#EA6639]" /> 10,000 AI Guest Messages / mo
             </div>
             <div className="flex items-center gap-2 text-xs text-dash-text">
               <Zap className="w-4 h-4 text-[#EA6639]" /> Level 2 Automated Booking Workflows
             </div>
             <div className="flex items-center gap-2 text-xs text-dash-text">
               <Zap className="w-4 h-4 text-[#EA6639]" /> WhatsApp + Instagram + Web Widget
             </div>
             <div className="flex items-center gap-2 text-xs text-dash-text">
               <Zap className="w-4 h-4 text-[#EA6639]" /> Unlimited Staff Seats &amp; Alerts
             </div>
          </div>
          
          <button 
            onClick={() => setShowManageModal(true)}
            className="w-full px-3 py-2 bg-dash-surface-raised border border-dash-border text-dash-text rounded-lg text-xs font-semibold hover:bg-dash-surface-hover transition-colors relative z-10 flex items-center justify-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Manage Subscription (Stripe Portal)
          </button>
        </div>

        {/* ── Usage This Month ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm">
            <h3 className="text-sm font-bold text-dash-text mb-4">Usage &amp; Quota This Month</h3>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-dash-text">AI Guest Messages</span>
                  <span className="text-xs font-mono text-dash-text-muted">8,420 / 10,000 (84.2%)</span>
                </div>
                <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden">
                  <div className="h-full bg-[#EA6639] rounded-full transition-all duration-500" style={{ width: '84.2%' }}></div>
                </div>
                <p className="text-[10px] text-dash-text-muted mt-1">Billing cycle renews on the 1st of next month.</p>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1.5">
                  <span className="text-xs font-medium text-dash-text">Active Connected Channels</span>
                  <span className="text-xs font-mono text-dash-text-muted">2 / 5</span>
                </div>
                <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: '40%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Booking Fee Summary (Level 2) ── */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
               <div>
                 <h3 className="text-sm font-bold text-dash-text">Level 2 Booking Performance Summary</h3>
                 <p className="text-[11px] text-dash-text-muted mt-0.5">Automated guest bookings generated directly by Ever AI Concierge.</p>
               </div>
               <span className="px-2.5 py-1 bg-dash-canvas border border-dash-border text-dash-text rounded-md text-[10px] font-bold">Current Cycle</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <div className="p-3.5 bg-dash-canvas rounded-xl border border-dash-border">
                 <span className="text-[10px] uppercase tracking-wider text-dash-text-muted block mb-1 font-semibold">AI Bookings</span>
                 <span className="text-xl font-bold text-dash-text">{bookingMetrics.totalCount} confirmed</span>
               </div>
               <div className="p-3.5 bg-dash-canvas rounded-xl border border-dash-border">
                 <span className="text-[10px] uppercase tracking-wider text-dash-text-muted block mb-1 font-semibold">Total Gross Booking Value</span>
                 <span className="text-xl font-bold text-dash-text">{formatMoney(bookingMetrics.totalValue)}</span>
               </div>
               <div className="p-3.5 bg-dash-canvas rounded-xl border border-dash-border">
                 <span className="text-[10px] uppercase tracking-wider text-dash-text-muted block mb-1 font-semibold">Agency Performance Fee (3%)</span>
                 <span className="text-xl font-bold text-[#EA6639]">{formatMoney(bookingMetrics.agencyFee)}</span>
               </div>
            </div>
            <p className="text-[10px] text-dash-text-muted mt-3 text-right">Agency fee is applied exclusively to verified, non-cancelled guest stays.</p>
          </div>
        </div>
      </div>

      {/* ── Invoice History ── */}
      <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm">
        <h3 className="text-sm font-bold text-dash-text mb-4">Monthly Invoices</h3>
        <div className="overflow-x-auto hide-scrollbar border border-dash-border rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dash-border bg-dash-canvas/50">
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Invoice ID</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Billing Period</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Amount</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-dash-canvas/50 transition-colors">
                  <td className="p-3 font-mono font-medium text-dash-text">{inv.id}</td>
                  <td className="p-3 text-dash-text-sec">{inv.period}</td>
                  <td className="p-3 font-mono font-semibold text-dash-text">{formatMoney(inv.amount)}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded text-[10px] font-bold">
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button 
                      onClick={() => handleDownloadInvoice(inv.id)}
                      className="text-dash-text-muted hover:text-[#EA6639] transition-colors p-1"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4 ml-auto" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Payment Method Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <h4 className="font-semibold text-dash-text">Update Payment Method</h4>
              <button onClick={() => setShowPaymentModal(false)} className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1 hover:bg-dash-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Cardholder Name</label>
                <input required type="text" placeholder="e.g. Alex Mercer" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Card Number</label>
                <input required type="text" placeholder="•••• •••• •••• 4242" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Expiry Date</label>
                  <input required type="text" placeholder="MM / YY" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">CVC / CVV</label>
                  <input required type="password" maxLength={4} placeholder="•••" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dash-border">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={updatingPayment} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70">
                  {updatingPayment ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Card...</> : "Save Payment Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Subscription Modal ── */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <Package className="w-12 h-12 text-[#EA6639] mx-auto mb-3" />
            <h4 className="text-base font-bold text-dash-text mb-1">Manage Plan &amp; Invoices</h4>
            <p className="text-xs text-dash-text-sec mb-5">You will be redirected to the secure Stripe Customer Portal to upgrade or change billing intervals.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowManageModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Close</button>
              <button onClick={() => {
                setShowManageModal(false);
                showToast("Opening Stripe Customer Portal...", "info");
              }} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Continue to Stripe
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
