import React, { useState } from "react";
import { ShieldCheck, Download, AlertTriangle, FileText, Database, UserCheck, ToggleLeft, ToggleRight, CheckCircle2 } from "lucide-react";

export function ComplianceTab() {
  const [consentMode, setConsentMode] = useState(true);

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Compliance & Privacy</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage GDPR/NDPA privacy notices, data retention, and consent records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Privacy Notice & Consent Settings */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6">
          <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-emerald-100 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Privacy Settings</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Configure how the bot handles data collection</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-data font-semibold text-dash-text mb-1.5">Privacy Notice URL <span className="text-red-500">*</span></label>
              <input type="url" defaultValue="https://hotel.com/privacy" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              <p className="text-[10px] text-dash-text-muted mt-1">Bot includes this link in the first-message disclosure.</p>
            </div>
            
            <div>
              <label className="block text-data font-semibold text-dash-text mb-1.5">First-Message Disclosure</label>
              <textarea rows={3} defaultValue="Hi! I'm Aria, your digital concierge. Before we begin, please note that we process your data in accordance with our Privacy Policy." className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"></textarea>
            </div>

            <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
              <div>
                <h4 className="text-body font-medium text-dash-text">Consent Capture Mode</h4>
                <p className="text-micro text-dash-text-muted mt-0.5 max-w-[250px]">Required for GDPR. Bot asks "May I save your details?" before appending [LEAD] tag.</p>
              </div>
              <button onClick={() => setConsentMode(!consentMode)} className="focus:outline-none shrink-0 ml-4">
                {consentMode ? (
                  <ToggleRight className="w-8 h-8 text-dash-green" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-dash-text-muted" />
                )}
              </button>
            </div>
            
            <button className="px-4 py-1.5 bg-dash-surface text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-raised transition-colors">Save Privacy Settings</button>
          </div>
        </div>

        {/* DPA & Sub-Processors */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6">
           <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-blue-100 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Data Processing Agreement</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Controller-Processor contract status</p>
            </div>
          </div>
          
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-body font-bold text-emerald-900">DPA Signed & Active</h4>
              <p className="text-data text-emerald-700 mt-1">Signed by: John Manager on Oct 12, 2023</p>
              <p className="text-data text-emerald-700">Version: 1.2</p>
              <div className="mt-3 flex gap-2">
                 <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-emerald-200 rounded-md text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors">
                   <Download className="w-3.5 h-3.5" />
                   Download PDF
                 </button>
              </div>
            </div>
          </div>

          <div>
             <h4 className="text-body font-semibold text-dash-text mb-2">Sub-Processors</h4>
             <p className="text-data text-dash-text-sec mb-3">The following sub-processors are authorized under your DPA.</p>
             <div className="space-y-2">
               <div className="flex justify-between items-center p-2.5 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                 <span className="text-data font-medium text-dash-text">Supabase</span>
                 <span className="text-micro text-dash-text-muted">Database Hosting (EU Frankfurt)</span>
               </div>
               <div className="flex justify-between items-center p-2.5 bg-dash-canvas rounded-lg border border-dash-border-hairline">
                 <span className="text-data font-medium text-dash-text">Groq</span>
                 <span className="text-micro text-dash-text-muted">AI Inference (SCC US-based)</span>
               </div>
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Data Subject Request (DSR) Handler */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4 flex flex-col">
          <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-amber-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Data Subject Requests</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Handle guest requests for data erasure or export</p>
            </div>
          </div>
          
          <div className="flex-1 overflow-x-auto hide-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-dash-border">
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Email</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Type</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                  <th className="pb-2 text-micro font-semibold text-dash-text-muted uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                <tr>
                  <td className="py-3 text-data text-dash-text">alex.m***@gmail.com</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-[10px] font-bold">Erasure</span></td>
                  <td className="py-3"><span className="text-data text-dash-text-muted">Pending</span></td>
                  <td className="py-3 text-right"><button className="text-dash-green text-xs font-medium hover:underline">Process</button></td>
                </tr>
                <tr>
                  <td className="py-3 text-data text-dash-text">s.connor***@hotmail.com</td>
                  <td className="py-3"><span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-bold">Export</span></td>
                  <td className="py-3"><span className="text-data text-emerald-600">Completed</span></td>
                  <td className="py-3 text-right"><span className="text-dash-text-muted text-xs">—</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Data Retention */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4">
          <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-purple-100 flex items-center justify-center">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Data Retention</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Storage limitation rules</p>
            </div>
          </div>
          
          <div className="space-y-4">
             <div className="flex justify-between items-center p-3 border border-dash-border rounded-lg">
               <div>
                 <h4 className="text-body font-medium text-dash-text">Chat Histories</h4>
                 <p className="text-micro text-dash-text-muted mt-0.5">Delete conversations older than 90 days</p>
               </div>
               <div className="flex items-center gap-3">
                 <span className="text-micro font-medium text-emerald-600">Active</span>
                 <button className="px-3 py-1.5 bg-dash-surface-raised hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors">Edit</button>
               </div>
             </div>
             <div className="flex justify-between items-center p-3 border border-dash-border rounded-lg">
               <div>
                 <h4 className="text-body font-medium text-dash-text">Guest Profiles</h4>
                 <p className="text-micro text-dash-text-muted mt-0.5">Delete inactive profiles older than 2 years</p>
               </div>
               <div className="flex items-center gap-3">
                 <span className="text-micro font-medium text-emerald-600">Active</span>
                 <button className="px-3 py-1.5 bg-dash-surface-raised hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors">Edit</button>
               </div>
             </div>
             
             <button className="w-full mt-2 px-3 py-1.5 border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex justify-center items-center gap-2">
               <Database className="w-3.5 h-3.5" />
               Run Cleanup Now
             </button>
          </div>
        </div>

      </div>
    </div>
  );
}
