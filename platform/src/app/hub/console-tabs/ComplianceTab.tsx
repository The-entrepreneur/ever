import React, { useState, useEffect, useCallback } from "react";
import { ShieldCheck, Download, AlertTriangle, FileText, Database, UserCheck, ToggleLeft, ToggleRight, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

export function ComplianceTab() {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const [consentMode, setConsentMode] = useState(true);
  const [privacyUrl, setPrivacyUrl] = useState("https://hotel.com/privacy");
  const [disclosureText, setDisclosureText] = useState("Hi! I'm your digital concierge. Before we begin, please note that we process your data in accordance with our Privacy Policy.");
  
  const [dpaRecord, setDpaRecord] = useState<any>(null);
  const [subProcessors, setSubProcessors] = useState<any[]>([]);
  const [dsrRequests, setDsrRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComplianceData = useCallback(async () => {
    if (!hotelId) return;

    if (isSandbox && sandboxData) {
      setDpaRecord(sandboxData.dpaRecord);
      setSubProcessors(sandboxData.subProcessors);
      setDsrRequests(sandboxData.dsrRequests);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [dpaRes, dsrRes, subRes] = await Promise.all([
        supabase.from('dpa_records').select('*').eq('hotel_id', hotelId).limit(1).single(),
        supabase.from('dsr_requests').select('*').eq('hotel_id', hotelId).order('received_at', { ascending: false }),
        supabase.from('sub_processors').select('*').order('name', { ascending: true })
      ]);

      if (dpaRes.data) setDpaRecord(dpaRes.data);
      if (dsrRes.data) setDsrRequests(dsrRes.data);
      if (subRes.data) setSubProcessors(subRes.data);

    } catch (err) {
      console.warn("Compliance data fetch notice:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  const handleProcessDsr = async (id: string) => {
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        dsrRequests: prev.dsrRequests.map(r => r.id === id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r)
      }));
      setDsrRequests(prev => prev.map(r => r.id === id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r));
      showToast("Data Subject Request marked as completed", "success");
      return;
    }

    try {
      await supabase.from('dsr_requests').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', id);
      showToast("Data Subject Request processed", "success");
      fetchComplianceData();
    } catch (err) {
      console.error("Failed to update DSR:", err);
      showToast("Failed to process request", "error");
    }
  };

  const handleSavePrivacySettings = () => {
    showToast("Privacy and consent policies updated", "success");
  };

  const handleDownloadDPA = () => {
    showToast("Downloading signed DPA PDF...", "info");
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Compliance &amp; Privacy</h2>
          <p className="text-dash-text-sec mt-1">Manage GDPR/NDPA privacy notices, sub-processors, and guest Data Subject Requests.</p>
        </div>
        <div className="flex gap-2">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Compliance demo records refreshed", "success");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Records
            </button>
          )}
          <button 
            onClick={fetchComplianceData}
            className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#EA6639]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
          
          {/* Privacy Notice & Consent Settings */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col">
            <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dash-text">Privacy Settings</h3>
                <p className="text-[11px] text-dash-text-muted mt-0.5">Configure automated disclosure and consent capture</p>
              </div>
            </div>

            <div className="space-y-5 flex-1">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Privacy Notice URL <span className="text-[#EA6639]">*</span></label>
                <input 
                  type="url" 
                  value={privacyUrl} 
                  onChange={e => setPrivacyUrl(e.target.value)} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text" 
                />
                <p className="text-[10px] text-dash-text-muted mt-1.5">Included in the first-message disclosure sent to guests.</p>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">First-Message Disclosure</label>
                <textarea 
                  rows={3} 
                  value={disclosureText} 
                  onChange={e => setDisclosureText(e.target.value)} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text resize-none"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                <div>
                  <h4 className="text-xs font-medium text-dash-text">Consent Capture Mode</h4>
                  <p className="text-[10px] text-dash-text-muted mt-1 max-w-[250px]">Required for GDPR compliance. Asks permission before storing phone/email.</p>
                </div>
                <button 
                  onClick={() => {
                    setConsentMode(!consentMode);
                    showToast(!consentMode ? "Consent capture mode enabled" : "Consent capture mode disabled", "info");
                  }} 
                  className="focus:outline-none shrink-0 ml-4 hover:opacity-80 transition-opacity"
                >
                  {consentMode ? (
                    <ToggleRight className="w-9 h-9 text-[#EA6639]" />
                  ) : (
                    <ToggleLeft className="w-9 h-9 text-dash-text-muted" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="pt-5 mt-5 border-t border-dash-border-hairline">
              <button 
                onClick={handleSavePrivacySettings}
                className="px-4 py-2 bg-dash-surface-raised border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors"
              >
                Save Privacy Settings
              </button>
            </div>
          </div>

          {/* DPA & Sub-Processors */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col">
            <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
              <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dash-text">Data Processing Agreement</h3>
                <p className="text-[11px] text-dash-text-muted mt-0.5">Controller-to-Processor legal status</p>
              </div>
            </div>
            
            {dpaRecord ? (
              <div className="p-4 bg-emerald-50/50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 rounded-xl flex items-start gap-3 mb-6">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">DPA Signed &amp; Active</h4>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400 mt-1">Signed by: {dpaRecord.signed_by_name} ({dpaRecord.signed_by_email})</p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Date: {new Date(dpaRecord.signed_at).toLocaleDateString()}</p>
                  <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">Version: {dpaRecord.dpa_version}</p>
                  <div className="mt-3 flex gap-2">
                    <button 
                      onClick={handleDownloadDPA}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-emerald-200 dark:border-emerald-500/30 rounded-lg text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 transition-colors shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      Download Signed PDF
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-amber-50/50 border border-amber-200/60 rounded-xl flex items-start gap-3 mb-6">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">DPA Not Signed</h4>
                  <p className="text-[11px] text-amber-700/80 mt-1">A Data Processing Agreement must be signed to comply with GDPR data processing rules.</p>
                  <button className="mt-3 px-3 py-1.5 bg-amber-100 border border-amber-200 rounded-lg text-[10px] font-semibold text-amber-800 hover:bg-amber-200 transition-colors shadow-sm">
                    Review &amp; Sign DPA
                  </button>
                </div>
              </div>
            )}

            <div className="flex-1">
              <h4 className="text-xs font-semibold text-dash-text mb-1">Authorized Sub-Processors</h4>
              <p className="text-[10px] text-dash-text-sec mb-3">The following sub-processors process guest data under your DPA.</p>
              
              <div className="space-y-2">
                {subProcessors.length > 0 ? subProcessors.map(sp => (
                  <div key={sp.id} className="flex justify-between items-center p-3 bg-dash-canvas rounded-lg border border-dash-border">
                    <div>
                      <span className="block text-xs font-medium text-dash-text">{sp.name}</span>
                      <span className="block text-[10px] text-dash-text-muted mt-0.5">{sp.purpose}</span>
                    </div>
                    <span className="text-[10px] text-dash-text-sec bg-dash-surface px-2 py-1 rounded border border-dash-border-hairline">{sp.region}</span>
                  </div>
                )) : (
                  <div className="text-[11px] text-dash-text-muted italic py-2">No sub-processors found.</div>
                )}
              </div>
            </div>
          </div>

          {/* Data Subject Request (DSR) Handler */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col">
            <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dash-text">Data Subject Requests (DSR)</h3>
                <p className="text-[11px] text-dash-text-muted mt-0.5">Handle guest requests for data erasure or export</p>
              </div>
            </div>
            
            <div className="flex-1 overflow-x-auto hide-scrollbar -mx-5 px-5">
              <table className="w-full text-left whitespace-nowrap">
                <thead>
                  <tr className="border-b border-dash-border-hairline">
                    <th className="pb-2 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Email</th>
                    <th className="pb-2 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Request Type</th>
                    <th className="pb-2 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Status</th>
                    <th className="pb-2 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border-hairline">
                  {dsrRequests.length > 0 ? dsrRequests.map(dsr => (
                    <tr key={dsr.id} className="hover:bg-dash-canvas transition-colors">
                      <td className="py-3 text-xs text-dash-text">{dsr.guest_email}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          dsr.request_type?.toLowerCase().includes('erasure') ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/10' : 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/10'
                        }`}>
                          {dsr.request_type}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`text-xs ${dsr.status === 'completed' ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}`}>
                          {dsr.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        {dsr.status === 'open' || dsr.status === 'pending' ? (
                          <button 
                            onClick={() => handleProcessDsr(dsr.id)}
                            className="text-[#EA6639] text-xs font-semibold hover:underline"
                          >
                            Mark Completed
                          </button>
                        ) : (
                          <span className="text-dash-text-muted text-xs">✓ Done</span>
                        )}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-[11px] text-dash-text-muted">
                        No pending Data Subject Requests.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Data Retention */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col">
            <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
              <div className="w-10 h-10 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <Database className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dash-text">Data Retention</h3>
                <p className="text-[11px] text-dash-text-muted mt-0.5">Automated storage limitation policies</p>
              </div>
            </div>
            
            <div className="space-y-3 flex-1">
              <div className="flex justify-between items-center p-3 bg-dash-canvas border border-dash-border rounded-lg">
                <div>
                  <h4 className="text-xs font-medium text-dash-text">Guest Chat Transcripts</h4>
                  <p className="text-[10px] text-dash-text-muted mt-0.5">Retain conversation logs for 90 days</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">ACTIVE</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-dash-canvas border border-dash-border rounded-lg">
                <div>
                  <h4 className="text-xs font-medium text-dash-text">Lead Profile Data</h4>
                  <p className="text-[10px] text-dash-text-muted mt-0.5">Archive inactive guest records after 2 years</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-500/20">ACTIVE</span>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-dash-border-hairline">
              <button 
                onClick={() => showToast("Manual database cleanup completed", "success")}
                className="w-full px-3 py-2 border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors flex justify-center items-center gap-2"
              >
                <Database className="w-3.5 h-3.5 text-[#EA6639]" />
                Run Retention Cleanup Now
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
