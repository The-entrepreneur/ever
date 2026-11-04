import React, { useState, useEffect } from "react";
import { ShieldAlert, Download, FileText, Database, Upload, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";
import { supabase } from "../../../lib/supabase";

interface DpaRecord {
  id: string;
  client_name?: string;
  hotel_id?: string;
  status: string;
  version: string;
  signed_by_name?: string;
  signed_by_email?: string;
  review_due?: string;
}

interface SubProcessor {
  id: string;
  name: string;
  purpose: string;
  transfer_mechanism: string;
  dpa_accepted: boolean;
  review_due: string;
}

const DEFAULT_SUBPROCESSORS: SubProcessor[] = [
  { id: "sp-1", name: "Supabase Inc.", purpose: "PostgreSQL & Auth Hosting", transfer_mechanism: "EU Frankfurt (Adequacy)", dpa_accepted: true, review_due: "Annual (Q1 2027)" },
  { id: "sp-2", name: "Meta Platforms (WhatsApp)", purpose: "Guest Messaging API", transfer_mechanism: "SCC / Meta Embedded Terms", dpa_accepted: true, review_due: "Annual (Q2 2027)" },
  { id: "sp-3", name: "Groq Cloud", purpose: "Zero-Retention AI Inference", transfer_mechanism: "SCC / Commercial DPA", dpa_accepted: true, review_due: "Annual (Q3 2027)" },
  { id: "sp-4", name: "Paystack / Stripe", purpose: "PCI-DSS Level 1 Payments", transfer_mechanism: "Local CBN / Adequacy", dpa_accepted: true, review_due: "Annual (Q4 2027)" },
];

export function AgencyComplianceTab() {
  const { isSandbox } = useSandbox();
  const [activeSubTab, setActiveSubTab] = useState<"dpa" | "subprocessors" | "audit" | "breach">("dpa");
  const [loading, setLoading] = useState(true);
  const [dpas, setDpas] = useState<DpaRecord[]>([]);
  const [subprocessors, setSubprocessors] = useState<SubProcessor[]>(DEFAULT_SUBPROCESSORS);
  const [auditCount, setAuditCount] = useState<number>(0);
  const [breaches, setBreaches] = useState<any[]>([]);

  useEffect(() => {
    async function loadCompliance() {
      setLoading(true);
      if (isSandbox) {
        setDpas([
          { id: "dpa-1", client_name: "The Grand Horizon", status: "Signed", version: "v1.2", signed_by_name: "GM Office", signed_by_email: "gm@grandhorizon.com", review_due: "2027-01-15" }
        ]);
        setAuditCount(142);
        setBreaches([]);
        setLoading(false);
        return;
      }

      try {
        if (supabase) {
          const { data: dData } = await supabase.from("dpa_records").select("*");
          if (dData) setDpas(dData);

          const { data: spData } = await supabase.from("sub_processors").select("*");
          if (spData && spData.length > 0) setSubprocessors(spData);

          const { count } = await supabase.from("agency_audit_log").select("id", { count: "exact", head: true });
          if (count !== null) setAuditCount(count);

          const { data: bData } = await supabase.from("breach_incidents").select("*");
          if (bData) setBreaches(bData);
        }
      } catch (err) {
        console.error("[AgencyComplianceTab] Error loading compliance records:", err);
      } finally {
        setLoading(false);
      }
    }

    loadCompliance();
  }, [isSandbox]);

  const handleExportAuditCSV = async () => {
    try {
      if (!supabase) return;
      const { data } = await supabase
        .from("agency_audit_log")
        .select("created_at, action, entity_type, entity_id, details")
        .order("created_at", { ascending: false })
        .limit(500);

      if (!data || data.length === 0) return;
      const rows = [
        ["Timestamp", "Action", "Entity Type", "Entity ID", "Details"],
        ...data.map(d => [d.created_at, d.action, d.entity_type || "", d.entity_id || "", JSON.stringify(d.details || {})])
      ];
      const csv = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
      const encodedUri = encodeURI(csv);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `agency_audit_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("[Export Audit CSV Error]", err);
    }
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col">
      <div>
        <h2 className="text-header font-bold text-dash-text">Agency Compliance Center</h2>
        <p className="text-body text-dash-text-sec mt-0.5">Centralised hub for DPA tracking, sub-processors, and immutable audit logs (NDPA & GDPR).</p>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-4 border-b border-dash-border overflow-x-auto hide-scrollbar">
        {[
          { id: "dpa", label: "DPA Tracker" },
          { id: "subprocessors", label: "Sub-Processor Registry" },
          { id: "audit", label: "Agency Audit Log" },
          { id: "breach", label: "Breach Incident Log" }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={`pb-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeSubTab === tab.id ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec"}`}
          >
            {tab.label}
            {activeSubTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full" />}
          </button>
        ))}
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex flex-col flex-1 min-h-[400px]">
        {activeSubTab === "dpa" && (
          <>
            <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-canvas/50">
              <h3 className="text-section font-semibold text-dash-text">Data Processing Agreements</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
                <Upload className="w-3.5 h-3.5" /> Upload DPA
              </button>
            </div>
            <div className="overflow-x-auto flex-1 hide-scrollbar">
              {loading ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#EA6639] mb-2" />
                  <p className="text-xs text-dash-text-sec">Loading DPA registry...</p>
                </div>
              ) : dpas.length === 0 ? (
                <div className="p-8 text-center flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-dash-text-muted mb-2" />
                  <p className="text-xs font-semibold text-dash-text">No DPA Records Registered</p>
                  <p className="text-[11px] text-dash-text-sec max-w-sm mt-1">Once client properties execute their Data Processing Agreements, their signature timestamp and review cycles will be tracked here.</p>
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dash-border text-micro font-semibold text-dash-text-muted uppercase tracking-wider">
                      <th className="p-3">Client</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Version</th>
                      <th className="p-3">Signed By</th>
                      <th className="p-3">Review Due</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border/40">
                    {dpas.map(dpa => (
                      <tr key={dpa.id}>
                        <td className="p-3 font-medium text-body text-dash-text">{dpa.client_name || dpa.hotel_id}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 rounded text-[10px] font-bold">
                            {dpa.status}
                          </span>
                        </td>
                        <td className="p-3 text-data text-dash-text-sec">{dpa.version}</td>
                        <td className="p-3">
                          <div className="text-data text-dash-text">{dpa.signed_by_name || "—"}</div>
                          <div className="text-micro text-dash-text-muted">{dpa.signed_by_email || ""}</div>
                        </td>
                        <td className="p-3 text-data text-dash-text-sec">{dpa.review_due || "Annual"}</td>
                        <td className="p-3 text-right">
                          <button className="text-dash-text-muted hover:text-dash-green transition-colors">
                            <Download className="w-4 h-4 ml-auto" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        {activeSubTab === "subprocessors" && (
          <div className="overflow-x-auto flex-1 hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border bg-dash-canvas/50 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">
                  <th className="p-3">Sub-Processor</th>
                  <th className="p-3">Purpose</th>
                  <th className="p-3">Transfer Mechanism</th>
                  <th className="p-3">DPA Accepted</th>
                  <th className="p-3">Review Cycle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border/40">
                {subprocessors.map(sp => (
                  <tr key={sp.id}>
                    <td className="p-3 font-semibold text-body text-dash-text">{sp.name}</td>
                    <td className="p-3 text-data text-dash-text-sec">{sp.purpose}</td>
                    <td className="p-3 text-data text-dash-text-sec font-mono text-[11px]">{sp.transfer_mechanism}</td>
                    <td className="p-3 text-emerald-500">
                      {sp.dpa_accepted ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-amber-500">Pending</span>}
                    </td>
                    <td className="p-3 text-data text-dash-text-sec">{sp.review_due}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {activeSubTab === "audit" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-dash-canvas/50 p-6 text-center">
            <Database className="w-12 h-10 text-dash-text mb-4" />
            <h3 className="text-body font-bold text-dash-text mb-2">Immutable Agency Audit Log</h3>
            <p className="text-data text-dash-text-muted max-w-md">
              Every administrative action, deployment, and security signal is permanently recorded in Supabase.
              Currently tracking <strong className="text-dash-text">{auditCount}</strong> verified entries.
            </p>
            <button onClick={handleExportAuditCSV} disabled={auditCount === 0} className="mt-6 flex items-center gap-2 px-3 py-1.5 border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors disabled:opacity-50">
              <Download className="w-4 h-4" /> Export Full Audit CSV
            </button>
          </div>
        )}

        {activeSubTab === "breach" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-dash-canvas/50 p-6 text-center">
            <AlertTriangle className="w-12 h-10 text-dash-text mb-4" />
            <h3 className="text-body font-bold text-dash-text mb-2">Breach Incident Log</h3>
            <p className="text-data text-dash-text-muted max-w-md mb-6">
              {breaches.length === 0
                ? "No data breaches or NDPA incidents recorded. System is operating with clean regulatory standing."
                : `${breaches.length} incident(s) currently open under regulatory review.`}
            </p>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold transition-colors">
              <AlertTriangle className="w-4 h-4" /> Report New Incident
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
