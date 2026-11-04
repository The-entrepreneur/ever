import React, { useState, useEffect } from "react";
import { Download, ChevronDown, DollarSign, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, Loader2, CreditCard } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface RevenueItem {
  id: string;
  name: string;
  amount: number;
  status: "Paid" | "Pending" | "Overdue";
  matched: boolean;
}

const SANDBOX_REVENUE: RevenueItem[] = [
  { id: "rev-1", name: "The Grand Horizon Resort", amount: 299000, status: "Paid", matched: true },
  { id: "rev-2", name: "Oceanview Boutique", amount: 99000, status: "Pending", matched: false },
  { id: "rev-3", name: "Alpine Lodge & Spa", amount: 299000, status: "Overdue", matched: false },
];

export function RevenueTab() {
  const { isSandbox } = useSandbox();
  const [dateRange, setDateRange] = useState("This Month");
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<RevenueItem[]>([]);
  const [totals, setTotals] = useState({
    totalRevenue: 0,
    mrr: 0,
    pending: 0,
    overdueCount: 0
  });

  const loadRevenue = async () => {
    setLoading(true);
    if (isSandbox) {
      setItems(SANDBOX_REVENUE);
      setTotals({
        totalRevenue: 697000,
        mrr: 697000,
        pending: 398000,
        overdueCount: 1
      });
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/billing");
      const data = await res.json();
      if (res.ok && data.success && Array.isArray(data.clients)) {
        const revItems: RevenueItem[] = [];
        let mrrSum = 0;
        let pendingSum = 0;
        let overdueCount = 0;

        for (const c of data.clients) {
          mrrSum += c.baseFee || 0;
          const invoiceList = c.invoices || [];
          if (invoiceList.length > 0) {
            for (const inv of invoiceList) {
              const isPaid = inv.status === "paid";
              const isOverdue = inv.status === "overdue" || (inv.status === "pending" && new Date(inv.due_date) < new Date());
              if (!isPaid) pendingSum += inv.total_due || 0;
              if (isOverdue) overdueCount++;

              revItems.push({
                id: inv.id,
                name: c.name,
                amount: inv.total_due || c.baseFee || 0,
                status: isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending",
                matched: isPaid
              });
            }
          } else {
            revItems.push({
              id: c.id,
              name: c.name,
              amount: c.baseFee || 0,
              status: c.status === "Active" ? "Pending" : "Overdue",
              matched: false
            });
          }
        }

        setItems(revItems);
        setTotals({
          totalRevenue: mrrSum,
          mrr: mrrSum,
          pending: pendingSum,
          overdueCount
        });
      }
    } catch (err) {
      console.error("[RevenueTab] Error loading revenue data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRevenue();
  }, [isSandbox]);

  const handleExportCSV = () => {
    if (items.length === 0) return;
    const rows = [
      ["Client", "Amount", "Status"],
      ...items.map(i => [i.name, i.amount.toString(), i.status])
    ];
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever_revenue_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Revenue & Commission</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Live agency MRR, client portfolio fees, and invoice reconciliation.</p>
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
          <button onClick={handleExportCSV} disabled={items.length === 0} className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap disabled:opacity-50">
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Total Contract Value</span>
            <DollarSign className="w-4 h-4 text-dash-green shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">₦{totals.totalRevenue.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Total MRR</span>
            <TrendingUp className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">₦{totals.mrr.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Uncollected / Pending</span>
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">₦{totals.pending.toLocaleString()}</span>
          </div>
        </div>
        <div className="bg-dash-surface p-3 md:p-4 rounded-lg border border-dash-border flex flex-col justify-between">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-medium text-dash-text-sec leading-tight">Overdue Invoices</span>
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-kpi font-black text-dash-text">{totals.overdueCount}</span>
            <span className="text-micro font-bold text-rose-500">Action Required</span>
          </div>
        </div>
      </div>

      {/* Invoice Reconciliation */}
      <div className="bg-dash-surface p-4 rounded-lg border border-dash-border flex flex-col min-h-[300px]">
        <h3 className="text-section font-semibold text-dash-text mb-4">Invoice Reconciliation Ledger</h3>
        <div className="overflow-x-auto flex-1 hide-scrollbar">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
              <p className="text-xs text-dash-text-sec">Reconciling ledger records...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8">
              <CreditCard className="w-8 h-8 text-dash-text-muted mb-2" />
              <p className="text-xs font-semibold text-dash-text">No Revenue Records for This Period</p>
              <p className="text-[11px] text-dash-text-sec max-w-sm mt-1">Once client hotels are billed, invoices and gateway payment receipts will appear here.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border text-micro font-semibold text-dash-text-muted uppercase tracking-wider">
                  <th className="pb-2">Client Property</th>
                  <th className="pb-2">Contract Fee</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Gateway Settlement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border/40">
                {items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 text-data text-dash-text font-medium">{item.name}</td>
                    <td className="py-3 text-data font-mono">₦{item.amount.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === "Paid" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400" :
                        item.status === "Pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400" :
                        "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400"
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {item.matched ? (
                        <span className="text-emerald-500 inline-flex items-center gap-1 text-xs font-semibold">
                          <CheckCircle2 className="w-4 h-4" /> Settled
                        </span>
                      ) : (
                        <span className="text-dash-text-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
