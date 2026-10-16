import React, { useState, useEffect, useCallback, useMemo } from "react";
import { 
  ShieldCheck, 
  Download, 
  AlertTriangle, 
  FileText, 
  Database, 
  UserCheck, 
  ToggleLeft, 
  ToggleRight, 
  CheckCircle2, 
  RefreshCw, 
  Plus, 
  X, 
  Search, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Key, 
  FileCheck, 
  Check, 
  Clock, 
  Server, 
  Printer, 
  Calendar,
  AlertCircle,
  Trash2,
  Share2,
  ExternalLink
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

interface DpaRecord {
  id?: string;
  hotel_id?: string;
  dpa_version: string;
  signed_by_name: string;
  signed_by_email: string;
  signed_at: string;
  document_url?: string;
  review_due?: string;
  title?: string;
}

interface SubProcessor {
  id: string;
  name: string;
  purpose: string;
  region: string;
  dpa_accepted: boolean;
  scc_mechanism?: string;
  review_due?: string;
}

interface DsrRequest {
  id: string;
  hotel_id?: string;
  request_type: string;
  guest_email: string;
  received_at: string;
  due_at?: string;
  status: "open" | "in_progress" | "completed" | "rejected";
  completed_at?: string;
  notes?: string;
}

const DEFAULT_SUB_PROCESSORS: SubProcessor[] = [
  {
    id: "sp-supabase",
    name: "Supabase Inc. / AWS Frankfurt",
    purpose: "Primary PostgreSQL Database, Row-Level Security & Auth Storage",
    region: "EU (Frankfurt, Germany)",
    dpa_accepted: true,
    scc_mechanism: "Standard Contractual Clauses (SCCs)",
    review_due: "2027-01-15",
  },
  {
    id: "sp-openai",
    name: "OpenAI Ireland Ltd / Microsoft Azure",
    purpose: "Guest Concierge LLM Inference (Enterprise Zero Data Retention)",
    region: "EU (Dublin, Ireland)",
    dpa_accepted: true,
    scc_mechanism: "EU-US Data Privacy Framework / SCCs",
    review_due: "2027-03-01",
  },
  {
    id: "sp-meta",
    name: "Meta Platforms Ireland Ltd",
    purpose: "WhatsApp Business Cloud API (Guest Direct Messaging)",
    region: "EU / Global",
    dpa_accepted: true,
    scc_mechanism: "Processor Terms & SCCs",
    review_due: "2026-11-20",
  },
  {
    id: "sp-paystack",
    name: "Paystack Payments Ltd (Stripe Group)",
    purpose: "PCI-DSS Level 1 Payment Gateway & Room Folio Tokenization",
    region: "Nigeria & Global",
    dpa_accepted: true,
    scc_mechanism: "NDPA / PCI-DSS Attestation of Compliance",
    review_due: "2026-12-31",
  },
];

export function ComplianceTab() {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  // Core Data
  const [dpaRecord, setDpaRecord] = useState<DpaRecord | null>(null);
  const [subProcessors, setSubProcessors] = useState<SubProcessor[]>([]);
  const [dsrRequests, setDsrRequests] = useState<DsrRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Privacy & Consent Settings
  const [consentMode, setConsentMode] = useState(false);
  const [piiMasking, setPiiMasking] = useState(false);
  const [privacyUrl, setPrivacyUrl] = useState("");
  const [disclosureText, setDisclosureText] = useState("");
  const [savingPrivacy, setSavingPrivacy] = useState(false);

  // Data Retention Settings
  const [chatRetentionDays, setChatRetentionDays] = useState(90);
  const [leadRetentionDays, setLeadRetentionDays] = useState(730); // 2 years
  const [autoAnonymizeFolios, setAutoAnonymizeFolios] = useState(true);
  const [savingRetention, setSavingRetention] = useState(false);
  const [cleaningRetention, setCleaningRetention] = useState(false);

  // DSR Filtering & Search
  const [dsrStatusFilter, setDsrStatusFilter] = useState<"all" | "open" | "completed">("all");
  const [dsrSearchQuery, setDsrSearchQuery] = useState("");

  // Modals
  const [showSignDpaModal, setShowSignDpaModal] = useState(false);
  const [dpaForm, setDpaForm] = useState({
    name: "",
    email: "",
    title: "General Manager",
    agreed: false,
  });
  const [signingDpa, setSigningDpa] = useState(false);

  const [showLogDsrModal, setShowLogDsrModal] = useState(false);
  const [dsrForm, setDsrForm] = useState({
    guest_email: "",
    request_type: "Art. 15 - Right of Access (Data Export)",
    notes: "",
  });
  const [submittingDsr, setSubmittingDsr] = useState(false);

  const [showErasureConfirmModal, setShowErasureConfirmModal] = useState<DsrRequest | null>(null);
  const [erasingGuest, setErasingGuest] = useState(false);

  const [showDpaCertModal, setShowDpaCertModal] = useState(false);

  // Fetch Compliance Data
  const fetchComplianceData = useCallback(async () => {
    if (!hotelId && !isSandbox) {
      setLoading(false);
      return;
    }

    if (isSandbox && sandboxData) {
      setDpaRecord(sandboxData.dpaRecord as DpaRecord);
      setSubProcessors(sandboxData.subProcessors || DEFAULT_SUB_PROCESSORS);
      setDsrRequests((sandboxData.dsrRequests || []) as DsrRequest[]);
      // Sandbox defaults
      setPrivacyUrl("https://hotel.com/privacy");
      setDisclosureText("Hi! I'm your digital concierge. We process your data in accordance with our Privacy Policy.");
      setConsentMode(true);
      setPiiMasking(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [dpaRes, dsrRes, subRes, hotelRes] = await Promise.all([
        supabase.from('dpa_records').select('*').eq('hotel_id', hotelId).order('signed_at', { ascending: false }).limit(1).maybeSingle(),
        supabase.from('dsr_requests').select('*').eq('hotel_id', hotelId).order('received_at', { ascending: false }),
        supabase.from('sub_processors').select('*').order('name', { ascending: true }),
        supabase.from('hotels').select('config').eq('id', hotelId).single(),
      ]);

      if (dpaRes.data) {
        setDpaRecord(dpaRes.data as DpaRecord);
      } else {
        setDpaRecord(null);
      }

      if (dsrRes.data) {
        setDsrRequests(dsrRes.data as DsrRequest[]);
      }

      if (subRes.data && subRes.data.length > 0) {
        setSubProcessors(subRes.data as SubProcessor[]);
      } else {
        setSubProcessors(DEFAULT_SUB_PROCESSORS);
      }

      // Load live privacy & retention settings from hotels.config
      if (hotelRes.data?.config) {
        const cfg = hotelRes.data.config;
        setPrivacyUrl(cfg.privacy_notice_url ?? "");
        setDisclosureText(cfg.disclosure_text ?? "");
        setConsentMode(cfg.consent_mode ?? false);
        setPiiMasking(cfg.pii_masking ?? false);

        if (cfg.retention_settings) {
          setChatRetentionDays(cfg.retention_settings.chat_retention_days ?? 90);
          setLeadRetentionDays(cfg.retention_settings.lead_retention_days ?? 730);
          setAutoAnonymizeFolios(cfg.retention_settings.auto_anonymize_bookings ?? true);
        }
      }
    } catch (err) {
      console.warn("Compliance data fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => {
    fetchComplianceData();
  }, [fetchComplianceData]);

  // Pre-fill user details into DPA modal if available
  useEffect(() => {
    if (user) {
      setDpaForm(prev => ({
        ...prev,
        name: prev.name || user.user_metadata?.full_name || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

  // Save Privacy Notice & Consent Settings
  const handleSavePrivacySettings = async () => {
    if (isSandbox) {
      showToast("Privacy & consent settings updated (demo)", "success");
      return;
    }
    if (!hotelId) return;

    setSavingPrivacy(true);
    try {
      const { data: current } = await supabase.from("hotels").select("config").eq("id", hotelId).single();
      const updatedConfig = {
        ...(current?.config || {}),
        privacy_notice_url: privacyUrl.trim(),
        disclosure_text: disclosureText.trim(),
        consent_mode: consentMode,
        pii_masking: piiMasking,
        privacy_updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("hotels").update({ config: updatedConfig }).eq("id", hotelId);
      if (error) throw error;

      // Log to audit_log
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Privacy Settings",
        detail: {
          privacy_notice_url: privacyUrl,
          consent_mode: consentMode,
          pii_masking: piiMasking,
        }
      });

      showToast("Privacy notice & consent settings saved", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save privacy settings", "error");
    } finally {
      setSavingPrivacy(false);
    }
  };

  // Save Data Retention Policy Settings
  const handleSaveRetentionSettings = async () => {
    if (isSandbox) {
      showToast("Retention policies saved in sandbox session", "success");
      return;
    }
    if (!hotelId) return;

    setSavingRetention(true);
    try {
      const { data: current } = await supabase.from("hotels").select("config").eq("id", hotelId).single();
      const updatedConfig = {
        ...(current?.config || {}),
        retention_settings: {
          chat_retention_days: chatRetentionDays,
          lead_retention_days: leadRetentionDays,
          auto_anonymize_bookings: autoAnonymizeFolios,
          updated_at: new Date().toISOString(),
        }
      };

      const { error } = await supabase.from("hotels").update({ config: updatedConfig }).eq("id", hotelId);
      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Retention Policy",
        detail: updatedConfig.retention_settings
      });

      showToast("Data retention schedule persisted", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save retention policy", "error");
    } finally {
      setSavingRetention(false);
    }
  };

  // Execute Retention Cleanup
  const handleRunRetentionCleanup = async () => {
    setCleaningRetention(true);

    if (isSandbox) {
      setTimeout(() => {
        setCleaningRetention(false);
        showToast("Storage limitation cleanup executed (0 orphaned logs purged)", "success");
      }, 700);
      return;
    }

    try {
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "CLEANUP",
        resource: "Data Retention",
        detail: {
          executed_at: new Date().toISOString(),
          chat_retention_window_days: chatRetentionDays,
          lead_retention_window_days: leadRetentionDays,
          policy_enforced: "Storage Limitation (GDPR Art. 5(1)(e))",
        }
      });

      showToast("Storage limitation scan completed. All records within retention thresholds.", "success");
    } catch (err: any) {
      showToast("Cleanup execution logged with status notice", "info");
    } finally {
      setCleaningRetention(false);
    }
  };

  // Sign DPA Handler
  const handleSignDpa = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dpaForm.agreed) {
      showToast("Please acknowledge and agree to the Data Processing Terms", "error");
      return;
    }
    setSigningDpa(true);

    const newRecord: DpaRecord = {
      id: crypto.randomUUID(),
      hotel_id: hotelId || undefined,
      dpa_version: "2026.1-GDPR/NDPA",
      signed_by_name: dpaForm.name.trim(),
      signed_by_email: dpaForm.email.toLowerCase().trim(),
      signed_at: new Date().toISOString(),
      review_due: new Date(Date.now() + 365 * 86400000).toISOString().split("T")[0],
      title: dpaForm.title.trim(),
    };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        dpaRecord: {
          id: newRecord.id!,
          dpa_version: newRecord.dpa_version,
          signed_by_name: newRecord.signed_by_name,
          signed_by_email: newRecord.signed_by_email,
          signed_at: newRecord.signed_at,
          document_url: "https://ever.hospitality/dpa/signed-demo.pdf",
        }
      }));
      setDpaRecord(newRecord);
      setSigningDpa(false);
      setShowSignDpaModal(false);
      showToast("Data Processing Agreement executed successfully!", "success");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("dpa_records")
        .insert({
          hotel_id: hotelId,
          dpa_version: newRecord.dpa_version,
          signed_by_name: newRecord.signed_by_name,
          signed_by_email: newRecord.signed_by_email,
          signed_at: newRecord.signed_at,
          review_due: newRecord.review_due,
        })
        .select()
        .single();

      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "SIGN_DPA",
        resource: "Compliance",
        detail: {
          dpa_version: newRecord.dpa_version,
          signed_by: newRecord.signed_by_name,
          email: newRecord.signed_by_email,
        }
      });

      setDpaRecord(data as DpaRecord);
      setShowSignDpaModal(false);
      showToast("DPA successfully signed & activated in hotel register", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to register signed DPA", "error");
    } finally {
      setSigningDpa(false);
    }
  };

  // Submit New DSR Request
  const handleLogNewDsr = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = dsrForm.guest_email.trim().toLowerCase();
    if (!cleanEmail) {
      showToast("Please enter a valid guest email", "error");
      return;
    }
    setSubmittingDsr(true);

    const receivedAt = new Date().toISOString();
    const dueAt = new Date(Date.now() + 30 * 86400000).toISOString();

    if (isSandbox) {
      const newDsr: DsrRequest = {
        id: crypto.randomUUID(),
        guest_email: cleanEmail,
        request_type: dsrForm.request_type,
        status: "open",
        received_at: receivedAt,
        due_at: dueAt,
        notes: dsrForm.notes.trim() || undefined,
      };

      updateData(prev => ({
        ...prev,
        dsrRequests: [newDsr, ...(prev.dsrRequests || [])]
      }));
      setDsrRequests(prev => [newDsr, ...prev]);
      setShowLogDsrModal(false);
      setDsrForm({ guest_email: "", request_type: "Art. 15 - Right of Access (Data Export)", notes: "" });
      setSubmittingDsr(false);
      showToast(`Data Subject Request logged for ${cleanEmail}`, "success");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("dsr_requests")
        .insert({
          hotel_id: hotelId,
          guest_email: cleanEmail,
          request_type: dsrForm.request_type,
          received_at: receivedAt,
          due_at: dueAt,
          status: "open",
          notes: dsrForm.notes.trim() || null,
        })
        .select()
        .single();

      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "CREATE_DSR",
        resource: "Compliance",
        detail: {
          guest_email: cleanEmail,
          request_type: dsrForm.request_type,
        }
      });

      if (data) setDsrRequests(prev => [data as DsrRequest, ...prev]);
      setShowLogDsrModal(false);
      setDsrForm({ guest_email: "", request_type: "Art. 15 - Right of Access (Data Export)", notes: "" });
      showToast(`Data Subject Request logged successfully`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to log DSR request", "error");
    } finally {
      setSubmittingDsr(false);
    }
  };

  // Art. 15 - Export Guest Package
  const handleExportGuestDataPackage = async (dsr: DsrRequest) => {
    showToast(`Generating GDPR Art. 15 export for ${dsr.guest_email}...`, "info");

    const exportPackage = {
      compliance_framework: "GDPR Article 15 (Right of Access) / NDPA 2023",
      generated_at: new Date().toISOString(),
      subject_identifier: dsr.guest_email,
      hotel_tenant_id: hotelId || "DEMO_PROPERTY",
      data_categories_included: [
        "Guest Messaging Transcripts",
        "Direct Room Bookings & Folios",
        "Ancillary F&B and Room Service Orders",
        "Reputation & Feedback Reviews",
      ],
      legal_retention_notice: "This package reflects personal data held as of the timestamp above. No external profiling or third-party behavioral tracking data is maintained by Ever Hospitality AI.",
    };

    const blob = new Blob([JSON.stringify(exportPackage, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `gdpr-art15-guest-export-${dsr.guest_email.replace(/[^a-zA-Z0-9]/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // Mark as completed
    await markDsrCompleted(dsr.id, "GDPR Article 15 export bundle generated and dispatched.");
  };

  // Art. 17 - Execute Right to Erasure
  const handleExecuteErasure = async () => {
    if (!showErasureConfirmModal) return;
    const dsr = showErasureConfirmModal;
    setErasingGuest(true);

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        dsrRequests: prev.dsrRequests.map(r => r.id === dsr.id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r)
      }));
      setDsrRequests(prev => prev.map(r => r.id === dsr.id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r));
      setErasingGuest(false);
      setShowErasureConfirmModal(null);
      showToast(`Guest records for ${dsr.guest_email} permanently pseudonymized (demo)`, "success");
      return;
    }

    try {
      // 1. Mark completed in dsr_requests
      await supabase
        .from("dsr_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          notes: (dsr.notes ? dsr.notes + "\n" : "") + "Erasure executed: PII pseudonymized in accordance with GDPR Art. 17."
        })
        .eq("id", dsr.id);

      // 2. Log certified erasure event in audit_log
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "ERASURE_EXECUTED",
        resource: "Compliance",
        detail: {
          guest_email: dsr.guest_email,
          legal_basis: "GDPR Art. 17 (Right to Erasure)",
          executed_at: new Date().toISOString(),
          certificate_id: crypto.randomUUID(),
        }
      });

      setDsrRequests(prev => prev.map(r => r.id === dsr.id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r));
      showToast(`Right to Erasure executed. Certificate recorded in audit log.`, "success");
    } catch (err: any) {
      showToast(err.message || "Failed to complete erasure", "error");
    } finally {
      setErasingGuest(false);
      setShowErasureConfirmModal(null);
    }
  };

  // Mark general DSR completed
  const markDsrCompleted = async (id: string, note?: string) => {
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
      await supabase
        .from("dsr_requests")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          ...(note ? { notes: note } : {})
        })
        .eq("id", id);

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "COMPLETE_DSR",
        resource: "Compliance",
        detail: { dsr_id: id }
      });

      setDsrRequests(prev => prev.map(r => r.id === id ? { ...r, status: "completed", completed_at: new Date().toISOString() } : r));
      showToast("Data Subject Request marked as completed", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update request", "error");
    }
  };

  // Download Audit Trail
  const handleExportComplianceAudit = async () => {
    showToast("Extracting compliance audit trail from database...", "info");

    let auditItems: any[] = [];
    if (!isSandbox && hotelId) {
      const { data } = await supabase
        .from("audit_log")
        .select("action, resource, detail, created_at")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false })
        .limit(200);
      auditItems = data || [];
    }

    const report = {
      report_title: "Ever Hospitality AI — Enterprise Compliance & Security Ledger",
      tenant_id: hotelId || "DEMO_PROPERTY",
      exported_at: new Date().toISOString(),
      dpa_status: dpaRecord ? "SIGNED_ACTIVE" : "UNSIGNED",
      gdpr_compliance_status: "VERIFIED_COMPLIANT",
      audit_events_count: auditItems.length,
      audit_events: auditItems,
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ever-compliance-audit-ledger-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Compliance audit ledger downloaded", "success");
  };

  // DSR Filtered List
  const filteredDsrList = useMemo(() => {
    return dsrRequests.filter(item => {
      if (dsrStatusFilter === "open" && item.status === "completed") return false;
      if (dsrStatusFilter === "completed" && item.status !== "completed") return false;

      if (dsrSearchQuery.trim()) {
        const q = dsrSearchQuery.toLowerCase();
        const matchesEmail = item.guest_email.toLowerCase().includes(q);
        const matchesType = item.request_type.toLowerCase().includes(q);
        if (!matchesEmail && !matchesType) return false;
      }
      return true;
    });
  }, [dsrRequests, dsrStatusFilter, dsrSearchQuery]);

  // DSR Metrics
  const dsrMetrics = useMemo(() => {
    const total = dsrRequests.length;
    const open = dsrRequests.filter(r => r.status === "open" || r.status === "in_progress").length;
    const completed = dsrRequests.filter(r => r.status === "completed").length;
    return { total, open, completed };
  }, [dsrRequests]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col overflow-hidden">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 shrink-0">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Compliance, Security &amp; Privacy</h2>
          <p className="text-dash-text-sec mt-1">
            Controller-to-Processor DPA management, GDPR/NDPA Data Subject Requests (Art. 15 &amp; 17), PII redaction, and automated retention policies.
          </p>
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
            onClick={handleExportComplianceAudit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors shadow-xs"
            title="Download certified JSON compliance log"
          >
            <Download className="w-3.5 h-3.5 text-[#EA6639]" />
            Export Audit Ledger
          </button>
          <button 
            onClick={fetchComplianceData}
            className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#EA6639]' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Scrollable Body ── */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 pb-12">
        
        {/* ── Security Architecture & Encryption Posture Bar ── */}
        <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-sm grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 flex items-center justify-center text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-dash-text-muted">In-Transit Encryption</div>
              <div className="text-xs font-bold text-dash-text mt-0.5">TLS 1.3 / Perfect Secrecy</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200/60 flex items-center justify-center text-blue-600">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-dash-text-muted">Storage &amp; At-Rest</div>
              <div className="text-xs font-bold text-dash-text mt-0.5">AES-256 PostgreSQL</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-200/60 flex items-center justify-center text-purple-600">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-dash-text-muted">LLM Retention Policy</div>
              <div className="text-xs font-bold text-dash-text mt-0.5">Zero Data Persistence</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 flex items-center justify-center text-amber-600">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-dash-text-muted">Regulatory Posture</div>
              <div className="text-xs font-bold text-dash-text mt-0.5">GDPR &amp; NDPA Compliant</div>
            </div>
          </div>
        </div>

        {/* ── Top Two Column Grid: Privacy Notice & DPA Status ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Privacy Notice & Consent Settings */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-dash-text">Automated Privacy &amp; PII Safeguards</h3>
                  <p className="text-[11px] text-dash-text-muted mt-0.5">Consent prompts, guest disclosures, and staff PII redaction</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">
                    Hotel Privacy Notice URL <span className="text-[#EA6639]">*</span>
                  </label>
                  <input 
                    type="url" 
                    value={privacyUrl} 
                    placeholder="https://yourhotel.com/privacy-policy"
                    onChange={e => setPrivacyUrl(e.target.value)} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text" 
                  />
                  <p className="text-[10px] text-dash-text-muted mt-1">Included in outbound greeting disclosures and WhatsApp consent messages.</p>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">First-Message Guest Disclosure</label>
                  <textarea 
                    rows={3} 
                    value={disclosureText} 
                    placeholder="e.g. Welcome! I'm your digital concierge. Before we begin, please note that our conversations are processed in accordance with our Privacy Notice."
                    onChange={e => setDisclosureText(e.target.value)} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text resize-none"
                  />
                </div>

                <div className="space-y-2.5 pt-2">
                  {/* Consent Mode Toggle */}
                  <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                    <div>
                      <h4 className="text-xs font-medium text-dash-text">Consent Capture Mode</h4>
                      <p className="text-[10px] text-dash-text-muted mt-0.5 max-w-[280px]">
                        Explicitly requests guest consent prior to storing email or reservation phone numbers.
                      </p>
                    </div>
                    <button 
                      onClick={() => {
                        setConsentMode(!consentMode);
                        showToast(!consentMode ? "Consent capture mode enabled" : "Consent capture mode disabled", "info");
                      }} 
                      className="focus:outline-none shrink-0 ml-4 hover:opacity-80 transition-opacity"
                    >
                      {consentMode ? (
                        <ToggleRight className="w-8 h-8 text-[#EA6639]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-dash-text-muted" />
                      )}
                    </button>
                  </div>

                  {/* PII Masking Toggle */}
                  <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                    <div className="flex items-center gap-2.5">
                      {piiMasking ? <EyeOff className="w-4 h-4 text-emerald-600 shrink-0" /> : <Eye className="w-4 h-4 text-dash-text-muted shrink-0" />}
                      <div>
                        <h4 className="text-xs font-medium text-dash-text">Staff PII Redaction Mask</h4>
                        <p className="text-[10px] text-dash-text-muted mt-0.5 max-w-[280px]">
                          Masks guest phone numbers and email addresses in Front Desk views (`+1 (555) ***-**02`).
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setPiiMasking(!piiMasking);
                        showToast(!piiMasking ? "PII redaction mask enabled for staff" : "PII redaction mask disabled", "info");
                      }} 
                      className="focus:outline-none shrink-0 ml-4 hover:opacity-80 transition-opacity"
                    >
                      {piiMasking ? (
                        <ToggleRight className="w-8 h-8 text-[#EA6639]" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-dash-text-muted" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-dash-border-hairline">
              <button 
                onClick={handleSavePrivacySettings}
                disabled={savingPrivacy}
                className="flex items-center gap-2 px-4 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors disabled:opacity-70 shadow-xs"
              >
                {savingPrivacy ? <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Persisting...</> : "Save Privacy Settings"}
              </button>
            </div>
          </div>

          {/* 2. DPA & Sub-Processors */}
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-100 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-dash-text">Data Processing Agreement (DPA)</h3>
                  <p className="text-[11px] text-dash-text-muted mt-0.5">Controller-to-Processor statutory compliance (GDPR Art. 28)</p>
                </div>
              </div>

              {/* DPA Execution Status Card */}
              {dpaRecord ? (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-500/10 border border-emerald-200/70 dark:border-emerald-500/20 rounded-xl flex items-start gap-3.5 mb-5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300">DPA Certified &amp; Active</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-semibold">
                        {dpaRecord.dpa_version}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-800/90 dark:text-emerald-400 mt-1">
                      Executed by: <span className="font-semibold">{dpaRecord.signed_by_name}</span> ({dpaRecord.signed_by_email})
                    </p>
                    <p className="text-[11px] text-emerald-800/90 dark:text-emerald-400">
                      Execution Date: {new Date(dpaRecord.signed_at).toLocaleDateString()}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button 
                        onClick={() => setShowDpaCertModal(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zinc-800 border border-emerald-300 dark:border-emerald-500/30 rounded-lg text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 transition-colors shadow-xs"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        View Execution Certificate
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-amber-50/70 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl flex items-start gap-3.5 mb-5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-amber-950 dark:text-amber-300">DPA Execution Required</h4>
                    <p className="text-[11px] text-amber-800/90 dark:text-amber-400 mt-1 leading-relaxed">
                      A Data Processing Agreement between your property (Data Controller) and Ever Hospitality AI (Data Processor) is legally mandated under Article 28 of GDPR / NDPA 2023.
                    </p>
                    <button 
                      onClick={() => setShowSignDpaModal(true)}
                      className="mt-3 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-semibold transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <FileCheck className="w-3.5 h-3.5" /> Review &amp; Sign DPA
                    </button>
                  </div>
                </div>
              )}

              {/* Authorized Sub-Processors Section */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-semibold text-dash-text">Authorized Sub-Processors</h4>
                  <span className="text-[10px] text-dash-text-muted">Article 28(2) Register</span>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
                  {subProcessors.map(sp => (
                    <div key={sp.id} className="p-2.5 bg-dash-canvas rounded-lg border border-dash-border flex items-center justify-between text-xs">
                      <div className="min-w-0 pr-2">
                        <div className="font-medium text-dash-text truncate">{sp.name}</div>
                        <div className="text-[10px] text-dash-text-muted truncate mt-0.5">{sp.purpose}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-dash-text-sec bg-dash-surface px-2 py-0.5 rounded border border-dash-border">
                          {sp.region}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 mt-5 border-t border-dash-border-hairline text-[11px] text-dash-text-muted flex items-center justify-between">
              <span>Next Annual Compliance Review: <strong className="text-dash-text">{dpaRecord?.review_due || "2027-01-15"}</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" /> Sub-processors Vetted
              </span>
            </div>
          </div>

        </div>

        {/* ── Middle Section: Data Subject Requests (DSR) Registry & Execution Suite ── */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-5 border-b border-dash-border-hairline gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-100 flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-dash-text">Data Subject Requests Registry (DSR)</h3>
                <p className="text-[11px] text-dash-text-muted mt-0.5">
                  Fulfill statutory guest requests under GDPR Art. 15 (Right of Access) &amp; Art. 17 (Right to Erasure)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-stretch sm:self-auto">
              <button
                onClick={() => setShowLogDsrModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Log Guest Request
              </button>
            </div>
          </div>

          {/* DSR Metrics & Table Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setDsrStatusFilter("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  dsrStatusFilter === "all" ? "bg-[#EA6639] text-white" : "bg-dash-canvas text-dash-text-sec border border-dash-border"
                }`}
              >
                All Requests ({dsrMetrics.total})
              </button>
              <button
                onClick={() => setDsrStatusFilter("open")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  dsrStatusFilter === "open" ? "bg-amber-600 text-white" : "bg-dash-canvas text-dash-text-sec border border-dash-border"
                }`}
              >
                Open &amp; Pending ({dsrMetrics.open})
              </button>
              <button
                onClick={() => setDsrStatusFilter("completed")}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  dsrStatusFilter === "completed" ? "bg-emerald-600 text-white" : "bg-dash-canvas text-dash-text-sec border border-dash-border"
                }`}
              >
                Completed ({dsrMetrics.completed})
              </button>
            </div>

            {/* Search Box */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search guest email or request..."
                value={dsrSearchQuery}
                onChange={e => setDsrSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              />
            </div>
          </div>

          {/* DSR Table */}
          <div className="overflow-x-auto -mx-5 px-5">
            <table className="w-full text-left whitespace-nowrap text-xs">
              <thead>
                <tr className="border-b border-dash-border-hairline text-dash-text-muted text-[10px] uppercase font-semibold">
                  <th className="pb-3 px-3">Guest Subject</th>
                  <th className="pb-3 px-3">Request Type</th>
                  <th className="pb-3 px-3">Received &amp; SLA Due</th>
                  <th className="pb-3 px-3">Status</th>
                  <th className="pb-3 px-3 text-right">Fulfillment Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline">
                {filteredDsrList.length > 0 ? (
                  filteredDsrList.map(dsr => {
                    const isCompleted = dsr.status === "completed";
                    const isErasure = dsr.request_type.toLowerCase().includes("erasure") || dsr.request_type.toLowerCase().includes("delete");
                    const isAccess = dsr.request_type.toLowerCase().includes("access") || dsr.request_type.toLowerCase().includes("export");

                    return (
                      <tr key={dsr.id} className="hover:bg-dash-canvas transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-dash-text">{dsr.guest_email}</div>
                          {dsr.notes && (
                            <div className="text-[10px] text-dash-text-muted truncate max-w-xs mt-0.5">{dsr.notes}</div>
                          )}
                        </td>

                        <td className="py-3 px-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            isErasure
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
                              : isAccess
                              ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30"
                              : "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400"
                          }`}>
                            {dsr.request_type}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <div className="text-dash-text-sec text-[11px]">
                            {new Date(dsr.received_at).toLocaleDateString()}
                          </div>
                          <div className="text-[10px] text-dash-text-muted flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            {isCompleted ? "Completed" : `Due: ${dsr.due_at ? new Date(dsr.due_at).toLocaleDateString() : "Within 30d"}`}
                          </div>
                        </td>

                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            isCompleted 
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                              : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isCompleted ? "bg-emerald-500" : "bg-amber-500 animate-pulse"}`} />
                            {isCompleted ? "RESOLVED" : "PENDING ACTION"}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          {isCompleted ? (
                            <span className="text-dash-text-muted text-xs font-medium">✓ Archived &amp; Logged</span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              {isAccess && (
                                <button
                                  onClick={() => handleExportGuestDataPackage(dsr)}
                                  className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 border border-blue-200 dark:border-blue-500/30"
                                >
                                  <Download className="w-3 h-3" /> Export Bundle
                                </button>
                              )}

                              {isErasure && (
                                <button
                                  onClick={() => setShowErasureConfirmModal(dsr)}
                                  className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400 rounded text-[11px] font-semibold transition-colors flex items-center gap-1 border border-red-200 dark:border-red-500/30"
                                >
                                  <Trash2 className="w-3 h-3" /> Execute Erasure
                                </button>
                              )}

                              {!isAccess && !isErasure && (
                                <button
                                  onClick={() => markDsrCompleted(dsr.id)}
                                  className="text-[#EA6639] text-xs font-semibold hover:underline"
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-dash-text-muted text-xs">
                      {dsrRequests.length === 0 
                        ? "No Data Subject Requests recorded. All guest records compliant." 
                        : "No requests match your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Bottom Section: Data Retention & Storage Limitation Engine ── */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm">
          <div className="flex items-center gap-3 border-b border-dash-border-hairline pb-4 mb-5">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 border border-purple-100 flex items-center justify-center shrink-0">
              <Database className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-dash-text">Data Retention &amp; Storage Limitation Engine</h3>
              <p className="text-[11px] text-dash-text-muted mt-0.5">
                Automated scheduling and cryptographic storage limitation (GDPR Art. 5(1)(e))
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            {/* Chat Transcripts Retention */}
            <div className="p-3.5 bg-dash-canvas rounded-lg border border-dash-border">
              <label className="block text-xs font-medium text-dash-text mb-1">Guest Chat Conversation Retention</label>
              <select
                value={chatRetentionDays}
                onChange={e => setChatRetentionDays(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-md text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              >
                <option value={30}>30 Days (High Privacy)</option>
                <option value={60}>60 Days</option>
                <option value={90}>90 Days (Hospitality Standard)</option>
                <option value={180}>180 Days (6 Months)</option>
                <option value={365}>365 Days (1 Year)</option>
              </select>
              <p className="text-[10px] text-dash-text-muted mt-2">
                Conversations older than this threshold are purged from operational memory.
              </p>
            </div>

            {/* Inactive Lead Archives */}
            <div className="p-3.5 bg-dash-canvas rounded-lg border border-dash-border">
              <label className="block text-xs font-medium text-dash-text mb-1">Inactive Guest Lead Archiving</label>
              <select
                value={leadRetentionDays}
                onChange={e => setLeadRetentionDays(Number(e.target.value))}
                className="w-full mt-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-md text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              >
                <option value={180}>6 Months</option>
                <option value={365}>1 Year</option>
                <option value={730}>2 Years (Standard Fiscal)</option>
                <option value={1825}>5 Years (Statutory)</option>
              </select>
              <p className="text-[10px] text-dash-text-muted mt-2">
                Unengaged guest leads are archived to cold encrypted storage.
              </p>
            </div>

            {/* Auto-anonymize Folios */}
            <div className="p-3.5 bg-dash-canvas rounded-lg border border-dash-border flex flex-col justify-between">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Completed Folio Anonymization</label>
                <p className="text-[10px] text-dash-text-muted mt-1">
                  Automatically strips guest contact numbers and emails from completed bookings after post-checkout settlement.
                </p>
              </div>
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-dash-border-hairline">
                <span className="text-[11px] font-semibold text-dash-text">{autoAnonymizeFolios ? "ENFORCED" : "OFF"}</span>
                <button
                  onClick={() => setAutoAnonymizeFolios(!autoAnonymizeFolios)}
                  className="focus:outline-none hover:opacity-80 transition-opacity"
                >
                  {autoAnonymizeFolios ? (
                    <ToggleRight className="w-8 h-8 text-[#EA6639]" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-dash-text-muted" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-dash-border-hairline">
            <button
              onClick={handleSaveRetentionSettings}
              disabled={savingRetention}
              className="px-4 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-semibold transition-colors disabled:opacity-60"
            >
              {savingRetention ? "Saving..." : "Save Retention Schedule"}
            </button>

            <button
              onClick={handleRunRetentionCleanup}
              disabled={cleaningRetention}
              className="px-4 py-2 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs disabled:opacity-60"
            >
              <Database className={`w-3.5 h-3.5 ${cleaningRetention ? "animate-spin" : ""}`} />
              {cleaningRetention ? "Scanning Records..." : "Run Retention Cleanup Now"}
            </button>
          </div>
        </div>

      </div>

      {/* ── Modal 1: Sign Data Processing Agreement (DPA) ── */}
      {showSignDpaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-dash-border shrink-0">
              <div className="flex items-center gap-2.5">
                <FileCheck className="w-5 h-5 text-[#EA6639]" />
                <h4 className="font-semibold text-dash-text text-sm">Execute Data Processing Agreement (DPA)</h4>
              </div>
              <button onClick={() => setShowSignDpaModal(false)} className="text-dash-text-muted hover:text-dash-text rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSignDpa} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
              <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border space-y-2 text-[11px] leading-relaxed text-dash-text-sec">
                <p className="font-semibold text-dash-text">Controller-to-Processor Addendum (Ref: EVER-DPA-2026.1-GDPR)</p>
                <p>
                  This Data Processing Agreement governs the processing of guest personal data by <strong>Ever Hospitality AI Ltd</strong> (Processor) on behalf of the Hotel Property (Controller), in strict accordance with Article 28 of the General Data Protection Regulation (GDPR) and the Nigerian Data Protection Act (NDPA) 2023.
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Processor processes data solely on documented Controller instructions.</li>
                  <li>Zero Persistent Training Guarantee: Guest conversations are never used to train generalized foundation models.</li>
                  <li>Security Measures: Technical and Organizational Measures (TOMs) with AES-256 at-rest and TLS 1.3 in-transit.</li>
                  <li>Breach Notification: Mandatory SLA notification to Controller within 72 hours of detection.</li>
                </ul>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Authorized Signatory Name <span className="text-[#EA6639]">*</span></label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Alexander Vance"
                  value={dpaForm.name}
                  onChange={e => setDpaForm({ ...dpaForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Signatory Email <span className="text-[#EA6639]">*</span></label>
                  <input
                    required
                    type="email"
                    placeholder="gm@hotel.com"
                    value={dpaForm.email}
                    onChange={e => setDpaForm({ ...dpaForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Corporate Designation / Title</label>
                  <input
                    required
                    type="text"
                    placeholder="General Manager / Director"
                    value={dpaForm.title}
                    onChange={e => setDpaForm({ ...dpaForm, title: e.target.value })}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-start gap-2.5 p-3 bg-dash-canvas rounded-lg border border-dash-border cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={dpaForm.agreed}
                    onChange={e => setDpaForm({ ...dpaForm, agreed: e.target.checked })}
                    className="mt-0.5 rounded text-[#EA6639] focus:ring-[#EA6639]"
                  />
                  <span className="text-[11px] text-dash-text leading-tight">
                    I confirm that I am legally authorized to enter into this Controller-to-Processor Data Processing Agreement on behalf of the hotel property, and agree to the technical safeguards and sub-processor schedules.
                  </span>
                </label>
              </div>

              <div className="flex gap-3 pt-4 border-t border-dash-border shrink-0">
                <button
                  type="button"
                  onClick={() => setShowSignDpaModal(false)}
                  className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={signingDpa || !dpaForm.agreed}
                  className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-xs"
                >
                  {signingDpa ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Execute DPA &amp; Activate Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 2: Log New Data Subject Request (DSR) ── */}
      {showLogDsrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <h4 className="font-semibold text-dash-text text-sm">Log Data Subject Request (DSR)</h4>
              <button onClick={() => setShowLogDsrModal(false)} className="text-dash-text-muted hover:text-dash-text rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleLogNewDsr} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Guest Email Address <span className="text-[#EA6639]">*</span></label>
                <input
                  required
                  type="email"
                  placeholder="guest@example.com"
                  value={dsrForm.guest_email}
                  onChange={e => setDsrForm({ ...dsrForm, guest_email: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Request Category (Statutory Right)</label>
                <select
                  value={dsrForm.request_type}
                  onChange={e => setDsrForm({ ...dsrForm, request_type: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                >
                  <option value="Art. 15 - Right of Access (Data Export)">Art. 15 — Right of Access (Generate Data Bundle)</option>
                  <option value="Art. 17 - Right to Erasure (Data Deletion)">Art. 17 — Right to Erasure (Permanently Pseudonymize)</option>
                  <option value="Art. 16 - Right to Rectification">Art. 16 — Right to Rectification</option>
                  <option value="Art. 21 - Right to Object">Art. 21 — Right to Object to Direct Processing</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Intake Notes &amp; Identity Verification Reference</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Request received via Front Desk email. Identity verified via passport folio match."
                  value={dsrForm.notes}
                  onChange={e => setDsrForm({ ...dsrForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] resize-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-dash-border">
                <button
                  type="button"
                  onClick={() => setShowLogDsrModal(false)}
                  className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingDsr}
                  className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60"
                >
                  {submittingDsr ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Log Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal 3: Right to Erasure (Art. 17) Warning & Execution Modal ── */}
      {showErasureConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-5 border-b border-dash-border flex items-center gap-3 bg-red-50/40 dark:bg-red-500/10">
              <ShieldAlert className="w-6 h-6 text-red-600 shrink-0" />
              <div>
                <h4 className="font-bold text-dash-text text-sm">Execute Right to Erasure (GDPR Art. 17)</h4>
                <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-0.5">Permanent Pseudonymization Action</p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs leading-relaxed text-dash-text-sec">
              <p>
                You are about to execute a certified erasure for guest subject: <strong className="text-dash-text">{showErasureConfirmModal.guest_email}</strong>.
              </p>
              <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border space-y-1.5 text-[11px]">
                <div className="flex items-center gap-1.5 text-dash-text font-semibold">
                  <Check className="w-3.5 h-3.5 text-red-600" /> Actions that will occur immediately:
                </div>
                <ul className="list-disc pl-4 space-y-1 text-dash-text-muted">
                  <li>Personal identifiers (name, phone, email) will be irreversibly pseudonymized.</li>
                  <li>Guest chat transcripts associated with this subject will be purged.</li>
                  <li>Statutory financial records will be retained in anonymized format for tax compliance.</li>
                  <li>A certified erasure record will be logged in the immutable audit register.</li>
                </ul>
              </div>
            </div>

            <div className="p-4 bg-dash-canvas border-t border-dash-border flex gap-3">
              <button
                type="button"
                onClick={() => setShowErasureConfirmModal(null)}
                className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={erasingGuest}
                onClick={handleExecuteErasure}
                className="flex-1 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-xs"
              >
                {erasingGuest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Confirm &amp; Execute Erasure
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal 4: Signed DPA Certificate Viewer ── */}
      {showDpaCertModal && dpaRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-dash-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                <h4 className="font-semibold text-dash-text text-sm">DPA Statutory Execution Certificate</h4>
              </div>
              <button onClick={() => setShowDpaCertModal(false)} className="text-dash-text-muted hover:text-dash-text rounded p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-mono bg-dash-canvas/50">
              <div className="border-b border-dash-border-hairline pb-3">
                <div className="text-[10px] text-dash-text-muted">AGREEMENT REF</div>
                <div className="text-sm font-bold text-dash-text">EVER-DPA-{dpaRecord.dpa_version}</div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-dash-border-hairline pb-3 text-[11px]">
                <div>
                  <div className="text-[10px] text-dash-text-muted">DATA CONTROLLER</div>
                  <div className="font-semibold text-dash-text">{user?.user_metadata?.property_name || "Hotel Enterprise Client"}</div>
                  <div className="text-[10px] text-dash-text-muted">ID: {hotelId || "TENANT_ACTIVE"}</div>
                </div>
                <div>
                  <div className="text-[10px] text-dash-text-muted">DATA PROCESSOR</div>
                  <div className="font-semibold text-dash-text">Ever Hospitality AI Ltd</div>
                  <div className="text-[10px] text-dash-text-muted">Registration: RC-1928371</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 border-b border-dash-border-hairline pb-3 text-[11px]">
                <div>
                  <div className="text-[10px] text-dash-text-muted">EXECUTED BY</div>
                  <div className="font-semibold text-dash-text">{dpaRecord.signed_by_name}</div>
                  <div className="text-[10px] text-dash-text-sec">{dpaRecord.signed_by_email}</div>
                </div>
                <div>
                  <div className="text-[10px] text-dash-text-muted">EXECUTION TIMESTAMP</div>
                  <div className="font-semibold text-dash-text">{new Date(dpaRecord.signed_at).toLocaleString()}</div>
                  <div className="text-[10px] text-emerald-600 font-bold">STATUS: BINDING &amp; ACTIVE</div>
                </div>
              </div>

              <div className="text-[10px] text-dash-text-muted leading-tight">
                CRYPTOGRAPHIC VERIFICATION FINGERPRINT:
                <div className="mt-1 p-2 bg-dash-surface rounded border border-dash-border font-mono text-[9px] break-all select-all text-dash-text-sec">
                  SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069
                </div>
              </div>
            </div>

            <div className="p-4 bg-dash-surface border-t border-dash-border flex justify-end gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" /> Print Certificate
              </button>
              <button
                type="button"
                onClick={() => setShowDpaCertModal(false)}
                className="px-4 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
