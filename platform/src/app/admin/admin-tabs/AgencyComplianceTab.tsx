import React, { useState } from "react";
import { ShieldAlert, Download, FileText, Database, Upload, AlertTriangle, CheckCircle2 } from "lucide-react";

export function AgencyComplianceTab() {
  const [activeSubTab, setActiveSubTab] = useState<"dpa" | "subprocessors" | "audit" | "breach">("dpa");

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Agency Compliance Center</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Centralised hub for DPA tracking, sub-processors, and immutable audit logs. (NDPA & GDPR)</p>
        </div>
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
            className={`pb-2 text-sm font-medium transition-colors relative whitespace-nowrap ${activeSubTab === tab.id ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec "}`}
          >
            {tab.label}
            {activeSubTab === tab.id && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full"></span>}
          </button>
        ))}
      </div>

      <div className="bg-dash-surface p-0 rounded-lg border border-dash-border flex flex-col flex-1 min-h-[400px]">
        
        {activeSubTab === "dpa" && (
          <>
            <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-canvas/50 /50">
               <h3 className="text-section font-semibold text-dash-text">Data Processing Agreements</h3>
               <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
                 <Upload className="w-3.5 h-3.5" />
                 Upload DPA
               </button>
            </div>
            <div className="overflow-x-auto flex-1 hide-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dash-border">
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Client</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Version</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Signed By</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Review Due</th>
                    <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  <tr>
                    <td className="p-3 font-medium text-body text-dash-text">The Grand Hotel</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Signed</span></td>
                    <td className="p-3 text-data text-dash-text-sec">v1.2</td>
                    <td className="p-3">
                      <div className="text-data text-dash-text">John Manager</div>
                      <div className="text-micro text-dash-text-muted">john@grand.com</div>
                    </td>
                    <td className="p-3 text-data text-dash-text-sec">Oct 12, 2024</td>
                    <td className="p-3 text-right">
                       <button className="text-dash-text-muted hover:text-dash-green transition-colors"><Download className="w-4 h-4 ml-auto" /></button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium text-body text-dash-text">Oceanview Resort</td>
                    <td className="p-3"><span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px] font-bold">Pending</span></td>
                    <td className="p-3 text-data text-dash-text-sec">—</td>
                    <td className="p-3 text-data text-dash-text-sec">—</td>
                    <td className="p-3 text-data text-dash-text-sec">—</td>
                    <td className="p-3 text-right">
                       <button className="text-xs font-medium text-dash-green hover:underline">Send DPA</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeSubTab === "subprocessors" && (
          <div className="overflow-x-auto flex-1 hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border bg-dash-canvas/50 /50">
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Sub-Processor</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Purpose</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Transfer Mechanism</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">DPA Accepted</th>
                  <th className="p-3 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Review Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="p-3 font-medium text-body text-dash-text">Supabase</td>
                  <td className="p-3 text-data text-dash-text-sec">Database Hosting</td>
                  <td className="p-3 text-data text-dash-text-sec">EU Frankfurt (Adequacy)</td>
                  <td className="p-3 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></td>
                  <td className="p-3 text-data text-dash-text-sec">Annual</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-body text-dash-text">Groq</td>
                  <td className="p-3 text-data text-dash-text-sec">AI Inference</td>
                  <td className="p-3 text-data text-dash-text-sec">SCC (US-based)</td>
                  <td className="p-3 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></td>
                  <td className="p-3 text-data text-dash-text-sec">Annual</td>
                </tr>
                <tr>
                  <td className="p-3 font-medium text-body text-dash-text">Twilio</td>
                  <td className="p-3 text-data text-dash-text-sec">WhatsApp Delivery</td>
                  <td className="p-3 text-data text-dash-text-sec">SCC (US-based)</td>
                  <td className="p-3 text-emerald-500"><CheckCircle2 className="w-4 h-4" /></td>
                  <td className="p-3 text-data text-dash-text-sec">Annual</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
        
        {activeSubTab === "audit" && (
          <div className="flex-1 flex flex-col items-center justify-center bg-dash-canvas/50 p-6 text-center">
             <Database className="w-12 h-10 text-dash-text mb-4" />
             <h3 className="text-body font-bold text-dash-text mb-2">Immutable Audit Log</h3>
             <p className="text-data text-dash-text-muted max-w-md">Every administrative action is permanently recorded here. This view is read-only to satisfy regulatory requirements.</p>
             <button className="mt-6 flex items-center gap-2 px-3 py-1.5 border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors">
               <Download className="w-4 h-4" />
               Export Full Audit CSV
             </button>
          </div>
        )}

        {activeSubTab === "breach" && (
           <div className="flex-1 flex flex-col items-center justify-center bg-dash-canvas/50 p-6 text-center">
             <AlertTriangle className="w-12 h-10 text-dash-text mb-4" />
             <h3 className="text-body font-bold text-dash-text mb-2">Breach Incident Log</h3>
             <p className="text-data text-dash-text-muted max-w-md mb-6">No breaches recorded. Record an incident to begin the 72-hour NDPC notification countdown.</p>
             <button className="flex items-center gap-2 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-dash-text rounded-md text-xs font-medium transition-colors">
               <AlertTriangle className="w-4 h-4" />
               Report New Incident
             </button>
          </div>
        )}

      </div>
    </div>
  );
}
