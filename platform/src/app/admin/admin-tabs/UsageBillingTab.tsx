import React, { useState, useEffect } from "react";
import { CreditCard, FileText, Download, TrendingUp, AlertTriangle, CheckCircle2, Clock, Loader2, ChevronDown } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

interface BillingClient {
  id: string;
  name: string;
  slug: string;
  tier: string;
  status: string;
  msgs: number;
  leads: number;
  baseFee: number;
  invoices?: any[];
}

const SANDBOX_CLIENTS: BillingClient[] = [
  { id: "c-1", name: "The Grand Horizon Resort", slug: "grand-horizon", tier: "Growth", msgs: 34120, leads: 412, baseFee: 299000, status: "Active" },
  { id: "c-2", name: "Oceanview Boutique", slug: "oceanview-boutique", tier: "Starter", msgs: 11450, leads: 180, baseFee: 99000, status: "Active" },
  { id: "c-3", name: "Alpine Lodge & Spa", slug: "alpine-lodge", tier: "Growth", msgs: 28900, leads: 320, baseFee: 299000, status: "Active" },
];

export function UsageBillingTab() {
  const { isSandbox } = useSandbox();
  const [clients, setClients] = useState<BillingClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("Current Period");
  const [generating, setGenerating] = useState(false);
  const [generateMsg, setGenerateMsg] = useState<string | null>(null);

  const fetchBilling = async () => {
    setLoading(true);
    if (isSandbox) {
      setClients(SANDBOX_CLIENTS);
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/billing");
      const data = await res.json();
      if (res.ok && data.success) {
        setClients(data.clients || []);
      }
    } catch (err) {
      console.error("[UsageBillingTab] Error fetching billing:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, [isSandbox]);

  const handleGenerateInvoices = async () => {
    setGenerating(true);
    setGenerateMsg(null);

    if (isSandbox) {
      setTimeout(() => {
        setGenerating(false);
        setGenerateMsg("Generated 3 demo invoices successfully.");
        setTimeout(() => setGenerateMsg(null), 3500);
      }, 1000);
      return;
    }

    try {
      const res = await fetch("/api/admin/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ period })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setGenerateMsg(data.message || "Invoices generated successfully.");
        await fetchBilling();
      }
    } catch (err: any) {
      setGenerateMsg(err.message || "Failed to generate invoices.");
    } finally {
      setGenerating(false);
      setTimeout(() => setGenerateMsg(null), 3500);
    }
  };

  const totalMsgs = clients.reduce((s, c) => s + (c.msgs || 0), 0);
  const totalLeads = clients.reduce((s, c) => s + (c.leads || 0), 0);
  const totalInvoice = clients.reduce((s, c) => s + (c.baseFee || 0), 0);

  return (
    <div className="p-3 md:p-5 space-y-4 h-full overflow-y-auto hide-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
        <div>
          <h2 className="text-header font-bold text-dash-text">Usage & Billing Management</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Live tenant message usage, AI attribution, and invoice ledger.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleGenerateInvoices} disabled={generating || clients.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50">
            {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5" />}
            Generate Invoices
          </button>
          <button onClick={fetchBilling} disabled={loading} className="p-1.5 bg-dash-surface border border-dash-border rounded-lg text-dash-text hover:bg-dash-surface-hover transition-colors">
            <Clock className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {generateMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{generateMsg}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-dash-surface p-4 rounded-xl border border-dash-border flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">Total Inbound Messages</span>
          <span className="text-2xl font-black text-dash-text">{totalMsgs.toLocaleString()}</span>
        </div>
        <div className="bg-dash-surface p-4 rounded-xl border border-dash-border flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">Total Captured Leads</span>
          <span className="text-2xl font-black text-emerald-500">{totalLeads.toLocaleString()}</span>
        </div>
        <div className="bg-dash-surface p-4 rounded-xl border border-dash-border flex flex-col gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">Projected Monthly Invoicing</span>
          <span className="text-2xl font-black text-[#EA6639]">₦{totalInvoice.toLocaleString()}</span>
        </div>
      </div>

      {/* Usage Table */}
      <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
            <p className="text-xs text-dash-text-sec">Aggregating live tenant telemetry...</p>
          </div>
        ) : clients.length === 0 ? (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-dash-surface-raised flex items-center justify-center mb-3">
              <CreditCard className="w-6 h-6 text-dash-text-muted" />
            </div>
            <h3 className="text-sm font-semibold text-dash-text mb-1">No Active Billing Accounts</h3>
            <p className="text-xs text-dash-text-sec max-w-sm">No client properties have active subscriptions for this period. Usage meters will track automatically once clients are onboarded.</p>
          </div>
        ) : (
          <table className="w-full text-xs text-left">
            <thead className="text-[10px] text-dash-text-sec bg-dash-canvas uppercase tracking-wider border-b border-dash-border">
              <tr>
                <th className="px-4 py-3 font-semibold">Client Property</th>
                <th className="px-4 py-3 font-semibold">Tier</th>
                <th className="px-4 py-3 font-semibold text-right">Messages</th>
                <th className="px-4 py-3 font-semibold text-right">Leads</th>
                <th className="px-4 py-3 font-semibold text-right">Contract Fee</th>
                <th className="px-4 py-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {clients.map(c => (
                <tr key={c.id || c.slug} className="hover:bg-dash-canvas/40 transition-colors">
                  <td className="px-4 py-3.5">
                    <span className="font-semibold text-dash-text block">{c.name}</span>
                    <span className="text-[10px] text-dash-text-muted font-mono">{c.slug}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-dash-canvas border border-dash-border text-dash-text">
                      {c.tier}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-right font-mono text-dash-text font-semibold">{c.msgs.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-emerald-500 font-semibold">{c.leads.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right font-mono text-dash-text font-bold">₦{c.baseFee.toLocaleString()}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      {c.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-dash-canvas/60 border-t border-dash-border font-bold text-xs">
              <tr>
                <td className="px-4 py-3 text-dash-text">Total Portfolio</td>
                <td className="px-4 py-3 text-dash-text-muted">{clients.length} properties</td>
                <td className="px-4 py-3 text-right font-mono text-dash-text">{totalMsgs.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-emerald-500">{totalLeads.toLocaleString()}</td>
                <td className="px-4 py-3 text-right font-mono text-[#EA6639]">₦{totalInvoice.toLocaleString()}</td>
                <td className="px-4 py-3" />
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}
