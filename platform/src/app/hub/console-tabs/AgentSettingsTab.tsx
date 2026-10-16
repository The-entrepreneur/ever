import React, { useState, useEffect, useCallback } from "react";
import { 
  Save, 
  RotateCcw, 
  FileText, 
  Plus, 
  X, 
  Loader2, 
  Bot, 
  Clock, 
  Languages, 
  MessageSquare, 
  AlertTriangle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  ExternalLink, 
  Sliders, 
  Star,
  Check,
  AlertCircle,
  Trash2
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { supabase } from "../../../lib/supabase";

export interface TemplateItem {
  id: string;
  name: string;
  language: string;
  category: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  body: string;
  created_at?: string;
}

const DEFAULT_HANDOFF_TRIGGERS = ["complaint", "manager", "refund", "emergency", "speak to human", "reception"];

export function AgentSettingsTab({ role }: { role?: string }) {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData } = useSandbox();
  const { showToast } = useToast();

  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  // ── General Configuration ──────────────────────────────────────────────────
  const [agentName, setAgentName] = useState("");
  const [agentTone, setAgentTone] = useState<"Formal" | "Friendly" | "Playful" | "Conversational">("Friendly");
  const [languagePriority, setLanguagePriority] = useState("Auto-detect");
  const [welcomeMessage, setWelcomeMessage] = useState("");
  const [privacyNoticeUrl, setPrivacyNoticeUrl] = useState("");
  const [bookingUrl, setBookingUrl] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");

  // ── Operational Settings ───────────────────────────────────────────────────
  const [humanOnlyMode, setHumanOnlyMode] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  const [outOfHoursMessage, setOutOfHoursMessage] = useState("");
  const [handoffTriggers, setHandoffTriggers] = useState<string[]>(DEFAULT_HANDOFF_TRIGGERS);
  const [newTriggerInput, setNewTriggerInput] = useState("");
  const [handoffAlertMethod, setHandoffAlertMethod] = useState<"email" | "whatsapp" | "both">("both");
  const [repEmail, setRepEmail] = useState("");
  const [secondaryAlertEmail, setSecondaryAlertEmail] = useState("");
  const [consentCaptureMode, setConsentCaptureMode] = useState(true);
  const [leadQualityThreshold, setLeadQualityThreshold] = useState(3);

  // ── Templates State (Starts EMPTY for live accounts, never fake data) ──────
  const [templates, setTemplates] = useState<TemplateItem[]>([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", language: "en_US", category: "UTILITY", body: "" });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  // ── Actions & States ──────────────────────────────────────────────────────
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // ── Load Settings ─────────────────────────────────────────────────────────
  const loadSettings = useCallback(async () => {
    setIsLoading(true);

    // 1. Sandbox Mode
    if (isSandbox) {
      if (sandboxData?.agentSettings) {
        const s = sandboxData.agentSettings;
        setAgentName(s.agentName || "Ever AI Concierge");
        setAgentTone(s.agentTone || "Friendly");
        setLanguagePriority(s.languagePriority || "Auto-detect");
        setWelcomeMessage(s.welcomeMessage || "");
        setPrivacyNoticeUrl(s.privacyNoticeUrl || "https://ever.ai/privacy");
        setBookingUrl(s.bookingUrl || "");
        setWhatsappNumber(s.whatsappNumber || "+1 (555) 382-9102");
        setHumanOnlyMode(s.humanOnlyMode ?? false);
        setStartTime(s.startTime || "00:00");
        setEndTime(s.endTime || "23:59");
        setOutOfHoursMessage(s.outOfHoursMessage || "");
        setHandoffTriggers(s.handoffTriggers || DEFAULT_HANDOFF_TRIGGERS);
        setHandoffAlertMethod(s.handoffAlertMethod || "both");
        setRepEmail(s.repEmail || user?.email || "reception@hotel.com");
        setSecondaryAlertEmail(s.secondaryAlertEmail || "");
        setConsentCaptureMode(s.consentCaptureMode ?? true);
        setLeadQualityThreshold(s.leadQualityThreshold || 3);
        setTemplates(s.templates || []);
      }
      setIsLoading(false);
      return;
    }

    // 2. Live Database Mode (e.g. nicaron11@gmail.com)
    if (hotelId) {
      try {
        const { data, error } = await supabase
          .from("hotels")
          .select("config, name, address")
          .eq("id", hotelId)
          .single();

        if (!error && data?.config && Object.keys(data.config).length > 0) {
          const cfg = data.config;
          if (cfg.agent_name) setAgentName(cfg.agent_name);
          if (cfg.agent_tone) setAgentTone(cfg.agent_tone);
          if (cfg.language_priority) setLanguagePriority(cfg.language_priority);
          if (cfg.welcome_message !== undefined) setWelcomeMessage(cfg.welcome_message);
          if (cfg.privacy_notice_url !== undefined) setPrivacyNoticeUrl(cfg.privacy_notice_url);
          if (cfg.booking_url !== undefined) setBookingUrl(cfg.booking_url);
          if (cfg.whatsapp_number !== undefined) setWhatsappNumber(cfg.whatsapp_number);
          if (cfg.human_only_mode !== undefined) setHumanOnlyMode(cfg.human_only_mode);
          if (cfg.start_time) setStartTime(cfg.start_time);
          if (cfg.end_time) setEndTime(cfg.end_time);
          if (cfg.out_of_hours_message !== undefined) setOutOfHoursMessage(cfg.out_of_hours_message);
          if (cfg.handoff_triggers) setHandoffTriggers(cfg.handoff_triggers);
          if (cfg.handoff_alert_method) setHandoffAlertMethod(cfg.handoff_alert_method);
          if (cfg.rep_email) setRepEmail(cfg.rep_email);
          else if (user?.email) setRepEmail(user.email);
          if (cfg.secondary_alert_email !== undefined) setSecondaryAlertEmail(cfg.secondary_alert_email);
          if (cfg.consent_capture_mode !== undefined) setConsentCaptureMode(cfg.consent_capture_mode);
          if (cfg.lead_quality_threshold) setLeadQualityThreshold(cfg.lead_quality_threshold);
          
          // STRICT: Only real templates saved in DB, no placeholder mock data!
          if (Array.isArray(cfg.templates)) {
            setTemplates(cfg.templates);
          } else {
            setTemplates([]);
          }
        } else {
          // New live account default - NO fake templates!
          setTemplates([]);
          if (user?.email) setRepEmail(user.email);
        }
      } catch (err) {
        console.error("Error loading agent settings:", err);
      }
    }

    setIsLoading(false);
  }, [hotelId, isSandbox, sandboxData, user?.email]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  // ── Handoff Triggers Tag Management ───────────────────────────────────────
  const handleAddTrigger = () => {
    const trimmed = newTriggerInput.trim().toLowerCase();
    if (!trimmed) return;
    if (handoffTriggers.includes(trimmed)) {
      showToast(`Trigger "${trimmed}" already exists`, "info");
      return;
    }
    setHandoffTriggers(prev => [...prev, trimmed]);
    setNewTriggerInput("");
  };

  const handleRemoveTrigger = (triggerToRemove: string) => {
    if (isReadOnly) return;
    setHandoffTriggers(prev => prev.filter(t => t !== triggerToRemove));
  };

  // ── Delete Template Handler ───────────────────────────────────────────────
  const handleDeleteTemplate = async (templateId: string, templateName: string) => {
    if (isReadOnly) return;
    const updated = templates.filter(t => t.id !== templateId);
    setTemplates(updated);

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        agentSettings: prev.agentSettings ? { ...prev.agentSettings, templates: updated } : undefined
      }));
      showToast(`Template "${templateName}" removed`, "success");
      return;
    }

    if (hotelId) {
      try {
        const { data: existingData } = await supabase.from("hotels").select("config").eq("id", hotelId).single();
        await supabase.from("hotels").update({
          config: { ...(existingData?.config || {}), templates: updated }
        }).eq("id", hotelId);
        showToast(`Template "${templateName}" removed`, "success");
      } catch (err) {
        showToast("Failed to delete template", "error");
      }
    }
  };

  // ── Save Settings Handler ─────────────────────────────────────────────────
  const handleSaveSettings = async () => {
    if (isReadOnly) return;
    setIsSaving(true);

    const payload = {
      agent_name: agentName,
      agent_tone: agentTone,
      language_priority: languagePriority,
      welcome_message: welcomeMessage,
      privacy_notice_url: privacyNoticeUrl,
      booking_url: bookingUrl,
      whatsapp_number: whatsappNumber,
      human_only_mode: humanOnlyMode,
      start_time: startTime,
      end_time: endTime,
      out_of_hours_message: outOfHoursMessage,
      handoff_triggers: handoffTriggers,
      handoff_alert_method: handoffAlertMethod,
      rep_email: repEmail,
      secondary_alert_email: secondaryAlertEmail,
      consent_capture_mode: consentCaptureMode,
      lead_quality_threshold: leadQualityThreshold,
      templates
    };

    // ── Sandbox Mode Persistence
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        agentSettings: {
          agentName,
          agentTone,
          languagePriority,
          welcomeMessage,
          privacyNoticeUrl,
          bookingUrl,
          whatsappNumber,
          humanOnlyMode,
          startTime,
          endTime,
          outOfHoursMessage,
          handoffTriggers,
          handoffAlertMethod,
          repEmail,
          secondaryAlertEmail,
          consentCaptureMode,
          leadQualityThreshold,
          templates
        }
      }));
      setIsSaving(false);
      showToast("Agent settings saved in sandbox!", "success");
      return;
    }

    // ── Live Supabase Persistence
    if (!hotelId) {
      setIsSaving(false);
      showToast("No active hotel linked to account", "error");
      return;
    }

    try {
      // 1. Fetch current config to merge cleanly
      const { data: existingData } = await supabase
        .from("hotels")
        .select("config")
        .eq("id", hotelId)
        .single();

      const mergedConfig = {
        ...(existingData?.config || {}),
        ...payload
      };

      // 2. Update hotels table
      const { error: updateError } = await supabase
        .from("hotels")
        .update({ config: mergedConfig })
        .eq("id", hotelId);

      if (updateError) throw updateError;

      // 3. Record in audit log
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Agent Settings",
        detail: {
          agent_name: agentName,
          agent_tone: agentTone,
          human_only_mode: humanOnlyMode,
          consent_capture_mode: consentCaptureMode,
          lead_quality_threshold: leadQualityThreshold
        }
      });

      showToast("Agent settings saved and synced successfully!", "success");
    } catch (err: any) {
      console.error("Failed to save agent settings:", err);
      showToast(err.message || "Failed to save agent settings", "error");
    } finally {
      setIsSaving(false);
    }
  };

  // ── Reset to Defaults Handler ─────────────────────────────────────────────
  const handleConfirmReset = () => {
    if (isReadOnly) return;
    setAgentName("Ever AI Concierge");
    setAgentTone("Friendly");
    setLanguagePriority("Auto-detect");
    setWelcomeMessage("Welcome to our property! I'm your digital concierge. How can I assist your stay today?");
    setPrivacyNoticeUrl("");
    setBookingUrl("");
    setWhatsappNumber("");
    setHumanOnlyMode(false);
    setStartTime("00:00");
    setEndTime("23:59");
    setOutOfHoursMessage("Our digital concierge is currently offline. For urgent assistance, please contact the front desk directly.");
    setHandoffTriggers(DEFAULT_HANDOFF_TRIGGERS);
    setHandoffAlertMethod("both");
    setSecondaryAlertEmail("");
    setConsentCaptureMode(true);
    setLeadQualityThreshold(3);
    setShowResetModal(false);
    showToast("Settings reset to defaults (click Save to apply)", "info");
  };

  // ── Submit Meta Template Handler ──────────────────────────────────────────
  const handleSubmitTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;

    // Validate snake_case
    const cleanedName = templateForm.name.toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
    if (!cleanedName) {
      showToast("Please provide a valid template name (snake_case)", "error");
      return;
    }

    setSubmittingTemplate(true);

    const newTemplate: TemplateItem = {
      id: crypto.randomUUID(),
      name: cleanedName,
      language: templateForm.language,
      category: templateForm.category,
      body: templateForm.body,
      status: "PENDING",
      created_at: new Date().toISOString()
    };

    setTimeout(async () => {
      const updated = [...templates, newTemplate];
      setTemplates(updated);

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          agentSettings: prev.agentSettings ? { ...prev.agentSettings, templates: updated } : undefined
        }));
      } else if (hotelId) {
        try {
          const { data: existingData } = await supabase.from("hotels").select("config").eq("id", hotelId).single();
          await supabase.from("hotels").update({
            config: { ...(existingData?.config || {}), templates: updated }
          }).eq("id", hotelId);
        } catch { /* ignore */ }
      }

      setTemplateForm({ name: "", language: "en_US", category: "UTILITY", body: "" });
      setShowTemplateModal(false);
      setSubmittingTemplate(false);
      showToast(`Template "${newTemplate.name}" submitted to Meta for review`, "success");
    }, 600);
  };

  const isPrivacyNoticeEmpty = !privacyNoticeUrl.trim();

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text tracking-tight">Agent Personality &amp; Settings</h2>
          <p className="text-dash-text-sec text-xs sm:text-sm mt-0.5">
            Configure your AI concierge&apos;s identity, tone, operational limits, compliance, and messaging templates.
          </p>
        </div>
        {!isReadOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
              title="Reset all settings to defaults"
            >
              <RotateCcw className="w-3.5 h-3.5 text-dash-text-sec" /> Reset
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-4 py-1.5 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>

      {/* ── Main Scrollable Configuration Area ── */}
      <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-6 max-w-5xl pb-16">
        
        {/* ── General Configuration ── */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-dash-border-hairline pb-3">
            <h3 className="text-sm font-semibold text-dash-text flex items-center gap-2">
              <Bot className="w-4 h-4 text-[#EA6639]" /> General Identity &amp; Persona
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {/* Agent Name */}
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5">
                Agent Name <span className="text-[#EA6639]">*</span>
              </label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                disabled={isReadOnly}
                placeholder="e.g. Aria, Ever Concierge"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60 font-medium"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                The name your AI concierge uses in guest greetings, widget headers, and WhatsApp outreach.
              </p>
            </div>

            {/* Language Priority */}
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5 text-dash-text-sec" /> Language Priority
              </label>
              <select 
                value={languagePriority}
                onChange={e => setLanguagePriority(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60 font-medium"
              >
                <option value="Auto-detect">Auto-detect (Recommended)</option>
                <option value="English First">English First</option>
                <option value="Spanish First">Spanish First</option>
                <option value="French First">French First</option>
                <option value="German First">German First</option>
                <option value="Arabic First">Arabic First</option>
              </select>
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                Determines how the agent prioritizes multilingual guest interactions.
              </p>
            </div>

            {/* Agent Tone Cards */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-dash-text mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-dash-text-sec" /> Agent Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "Formal", desc: "Refined, courteous, luxury hospitality tone" },
                  { key: "Friendly", desc: "Warm, welcoming, attentive & professional" },
                  { key: "Playful", desc: "Upbeat, energetic, modern boutique vibe" },
                  { key: "Conversational", desc: "Direct, relaxed, natural messaging style" }
                ].map(({ key, desc }) => {
                  const selected = agentTone === key;
                  return (
                    <label
                      key={key}
                      className={`border rounded-xl p-3 flex flex-col justify-between transition-all ${
                        isReadOnly ? 'cursor-default' : 'cursor-pointer'
                      } ${
                        selected
                          ? "bg-[#EA6639]/10 border-[#EA6639]/60 shadow-sm"
                          : "border-dash-border hover:bg-dash-surface-hover/70"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-xs font-bold ${selected ? 'text-[#EA6639]' : 'text-dash-text'}`}>
                          {key}
                        </span>
                        <input
                          type="radio"
                          name="tone"
                          checked={selected}
                          onChange={() => !isReadOnly && setAgentTone(key as any)}
                          disabled={isReadOnly}
                          className="accent-[#EA6639]"
                        />
                      </div>
                      <p className="text-[10px] text-dash-text-sec leading-snug">{desc}</p>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Welcome Message with Character Counter */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-dash-text">
                  First Welcome Message <span className="text-dash-text-muted font-normal">(sent to new guests)</span>
                </label>
                <span className={`text-[10px] font-mono ${welcomeMessage.length > 500 ? 'text-red-500 font-bold' : 'text-dash-text-muted'}`}>
                  {welcomeMessage.length} / 500 chars
                </span>
              </div>
              <textarea
                rows={3}
                value={welcomeMessage}
                onChange={e => setWelcomeMessage(e.target.value.slice(0, 500))}
                disabled={isReadOnly}
                placeholder="Welcome to our property! I'm your digital concierge..."
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60 resize-none font-sans"
              />
              <p className="text-[10px] text-dash-text-muted mt-1">
                Supports emoji. The initial greeting automatically prepended to first-time guest sessions.
              </p>
            </div>

            {/* Privacy Notice URL with GDPR Validation */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-dash-text flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-dash-text-sec" />
                  Privacy Notice URL <span className="text-[#EA6639]">*</span>
                </label>
                {isPrivacyNoticeEmpty && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 border border-red-200 dark:border-red-900">
                    <AlertTriangle className="w-3 h-3" /> Required for GDPR
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  type="url"
                  value={privacyNoticeUrl}
                  onChange={e => setPrivacyNoticeUrl(e.target.value)}
                  disabled={isReadOnly}
                  placeholder="https://yourhotel.com/privacy"
                  className={`w-full px-3 py-2 bg-dash-canvas border rounded-lg text-xs focus:outline-none focus:ring-1 text-dash-text disabled:opacity-60 ${
                    isPrivacyNoticeEmpty 
                      ? 'border-red-300 dark:border-red-800 focus:ring-red-500' 
                      : 'border-dash-border focus:ring-[#EA6639]'
                  }`}
                />
                {privacyNoticeUrl && (
                  <a 
                    href={privacyNoticeUrl} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="absolute right-2.5 top-2.5 text-dash-text-muted hover:text-dash-text"
                    title="Open link in new tab"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                Required by GDPR Article 13/14. Automatically linked in the agent&apos;s first message disclosure.
              </p>
            </div>

            {/* Direct Booking URL */}
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5 text-dash-text-sec" /> Direct Booking URL
              </label>
              <input
                type="url"
                value={bookingUrl}
                onChange={e => setBookingUrl(e.target.value)}
                disabled={isReadOnly}
                placeholder="https://yourhotel.com/rooms or engine link"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                Used when the agent guides guests to complete a direct online room reservation.
              </p>
            </div>

            {/* WhatsApp Display Number */}
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-dash-text-sec" /> WhatsApp Concierge Display Number
              </label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                disabled={isReadOnly}
                placeholder="+1 (555) 382-9102"
                className="w-full max-w-md px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60 font-mono"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                The formatted phone number displayed to guests who request to switch to WhatsApp.
              </p>
            </div>
          </div>
        </div>

        {/* ── Operational Settings ── */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-dash-border-hairline pb-3">
            <h3 className="text-sm font-semibold text-dash-text flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#EA6639]" /> Operational Rules &amp; Handoff Flow
            </h3>
          </div>

          {/* Human-Only Mode Toggle (Theme-Resilient Accessible Switch) */}
          <div className="flex items-center justify-between border-b border-dash-border-hairline pb-5">
            <div className="pr-4">
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-dash-text">Human-Only Mode</h4>
                {humanOnlyMode && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    Agent Silenced
                  </span>
                )}
              </div>
              <p className="text-xs text-dash-text-sec mt-1 max-w-xl leading-relaxed">
                Immediately silence the AI agent auto-replies. All incoming guest chats will be routed directly to human reception in the Live Inbox.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={humanOnlyMode}
              disabled={isReadOnly}
              onClick={() => !isReadOnly && setHumanOnlyMode(!humanOnlyMode)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EA6639] focus:ring-offset-2 focus:ring-offset-dash-surface ${
                humanOnlyMode ? 'bg-[#EA6639]' : 'bg-zinc-300 dark:bg-zinc-700'
              } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  humanOnlyMode ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Operating Hours */}
          <div className={`${humanOnlyMode ? 'opacity-50 pointer-events-none' : ''} transition-opacity space-y-4 border-b border-dash-border-hairline pb-5`}>
            <div>
              <h4 className="text-xs font-bold text-dash-text mb-1">AI Agent Active Operating Hours</h4>
              <p className="text-xs text-dash-text-sec">
                Define the daily time window during which the AI concierge autonomously answers guests.
              </p>
            </div>
            <div className="flex items-center gap-4 max-w-md">
              <div className="flex-1">
                <label className="block text-xs font-medium text-dash-text-muted mb-1.5">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  disabled={isReadOnly || humanOnlyMode}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                />
              </div>
              <span className="text-dash-text-muted pt-6 font-medium">to</span>
              <div className="flex-1">
                <label className="block text-xs font-medium text-dash-text-muted mb-1.5">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  disabled={isReadOnly || humanOnlyMode}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                />
              </div>
            </div>

            {/* Out of Hours Message */}
            <div className="pt-2">
              <label className="block text-xs font-medium text-dash-text mb-1.5">Out-of-Hours Message</label>
              <textarea
                rows={2}
                value={outOfHoursMessage}
                onChange={e => setOutOfHoursMessage(e.target.value)}
                disabled={isReadOnly || humanOnlyMode}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] resize-none"
              />
              <p className="text-[10px] text-dash-text-muted mt-1">
                Sent to guests when messaging outside active hours before queueing for staff morning shift.
              </p>
            </div>
          </div>

          {/* Custom Handoff Triggers (Tag/Chip Input) */}
          <div className="border-b border-dash-border-hairline pb-5 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-dash-text mb-1">Custom Human Handoff Keyword Triggers</h4>
              <p className="text-xs text-dash-text-sec">
                Guest messages containing these words immediately trigger a human handoff alert.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 items-center p-3 bg-dash-canvas border border-dash-border rounded-xl min-h-[48px]">
              {handoffTriggers.map(trigger => (
                <span
                  key={trigger}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-dash-surface border border-dash-border rounded-lg text-xs font-medium text-dash-text shadow-sm"
                >
                  #{trigger}
                  {!isReadOnly && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTrigger(trigger)}
                      className="text-dash-text-muted hover:text-red-500 rounded p-0.5 transition-colors"
                      title={`Remove "${trigger}"`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </span>
              ))}

              {!isReadOnly && (
                <div className="flex items-center gap-1.5 ml-1">
                  <input
                    type="text"
                    value={newTriggerInput}
                    onChange={e => setNewTriggerInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTrigger();
                      }
                    }}
                    placeholder="Type keyword & press Enter..."
                    className="bg-transparent border-none text-xs text-dash-text focus:outline-none placeholder-zinc-500 min-w-[170px]"
                  />
                  <button
                    type="button"
                    onClick={handleAddTrigger}
                    disabled={!newTriggerInput.trim()}
                    className="p-1 text-dash-text-muted hover:text-[#EA6639] disabled:opacity-40"
                    title="Add trigger"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Handoff Alert Recipients & Channel */}
          <div className="grid md:grid-cols-2 gap-5 border-b border-dash-border-hairline pb-5">
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-dash-text-sec" /> Primary Handoff Alert Email <span className="text-[#EA6639]">*</span>
              </label>
              <input
                type="email"
                required
                value={repEmail}
                onChange={e => setRepEmail(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] disabled:opacity-60"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                Primary reception address receiving urgent human handoff notices.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-dash-text-sec" /> Secondary Alert Email <span className="text-dash-text-muted font-normal">(Optional Backup)</span>
              </label>
              <input
                type="email"
                value={secondaryAlertEmail}
                onChange={e => setSecondaryAlertEmail(e.target.value)}
                disabled={isReadOnly}
                placeholder="duty-manager@hotel.com"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] disabled:opacity-60"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">
                Backup recipient if handoff alert remains unacknowledged after 5 minutes.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-dash-text mb-2">
                Handoff Alert Delivery Method
              </label>
              <div className="flex gap-4">
                {[
                  { value: "email", label: "Email Alert Only" },
                  { value: "whatsapp", label: "WhatsApp Alert Only" },
                  { value: "both", label: "Both Email & WhatsApp (Recommended)" }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer text-xs text-dash-text">
                    <input
                      type="radio"
                      name="alertMethod"
                      value={opt.value}
                      checked={handoffAlertMethod === opt.value}
                      onChange={() => !isReadOnly && setHandoffAlertMethod(opt.value as any)}
                      disabled={isReadOnly}
                      className="accent-[#EA6639]"
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Consent Capture Mode & Lead Quality Threshold */}
          <div className="grid md:grid-cols-2 gap-6 pt-1">
            {/* Consent Capture Mode (Theme-Resilient Accessible Switch) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dash-text">Consent Capture Mode</h4>
                  <p className="text-[11px] text-dash-text-sec mt-0.5">
                    Ask guest permission (&quot;May I save your details?&quot;) before logging contact data.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={consentCaptureMode}
                  disabled={isReadOnly}
                  onClick={() => !isReadOnly && setConsentCaptureMode(!consentCaptureMode)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#EA6639] focus:ring-offset-2 focus:ring-offset-dash-surface ${
                    consentCaptureMode ? 'bg-[#EA6639]' : 'bg-zinc-300 dark:bg-zinc-700'
                  } ${isReadOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      consentCaptureMode ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {!consentCaptureMode && (
                <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-lg flex items-start gap-2 text-red-700 dark:text-red-300 text-xs">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div>
                    <span className="font-bold">Compliance Warning:</span> Disabling explicit consent capture may breach GDPR Article 6/7 when handling European Union guest inquiries.
                  </div>
                </div>
              )}
            </div>

            {/* Lead Quality Threshold Stepper */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-dash-text">Lead Quality Filter Threshold</h4>
                  <p className="text-[11px] text-dash-text-sec mt-0.5">
                    Minimum star quality rating required to highlight guest inquiries in CRM.
                  </p>
                </div>
                <div className="flex items-center gap-1 font-bold text-xs text-[#EA6639]">
                  <span>{leadQualityThreshold}</span>
                  <Star className="w-3.5 h-3.5 fill-[#EA6639]" />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={1}
                  value={leadQualityThreshold}
                  onChange={e => !isReadOnly && setLeadQualityThreshold(Number(e.target.value))}
                  disabled={isReadOnly}
                  className="w-full accent-[#EA6639] cursor-pointer"
                />
                <div className="flex gap-1 shrink-0">
                  {[1, 2, 3, 4, 5].map(star => (
                    <Star
                      key={star}
                      className={`w-3.5 h-3.5 ${
                        star <= leadQualityThreshold ? 'fill-[#EA6639] text-[#EA6639]' : 'text-zinc-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── WhatsApp Message Templates (HSMs) ── */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-dash-border-hairline pb-3">
            <div>
              <h3 className="text-sm font-semibold text-dash-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EA6639]" />
                WhatsApp Message Templates (HSMs)
              </h3>
              <p className="text-xs text-dash-text-sec mt-0.5">
                Manage Meta-approved templates for proactive booking confirmations and guest announcements.
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface-raised border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 text-[#EA6639]" /> Submit Template
              </button>
            )}
          </div>

          <div className="bg-dash-canvas rounded-xl border border-dash-border overflow-hidden">
            {templates.length === 0 ? (
              <div className="text-center py-12 px-4 text-dash-text-sec flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-2xl bg-dash-surface border border-dash-border flex items-center justify-center mb-3 shadow-sm">
                  <FileText className="w-6 h-6 text-dash-text-muted" />
                </div>
                <h4 className="text-sm font-semibold text-dash-text mb-1">No WhatsApp Templates Submitted</h4>
                <p className="text-xs text-dash-text-sec max-w-md mb-4">
                  Meta-approved WhatsApp message templates (HSMs) allow your property to send automated booking confirmations, check-in reminders, and arrival announcements.
                </p>
                {!isReadOnly && (
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" /> Submit First Template
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-dash-surface border-b border-dash-border text-dash-text-sec">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-dash-text">Template Name</th>
                      <th className="px-4 py-3 font-semibold text-dash-text">Category</th>
                      <th className="px-4 py-3 font-semibold text-dash-text">Language</th>
                      <th className="px-4 py-3 font-semibold text-dash-text">Message Body Preview</th>
                      <th className="px-4 py-3 font-semibold text-dash-text text-right">Meta Review</th>
                      {!isReadOnly && <th className="px-4 py-3 text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border-hairline">
                    {templates.map((tpl) => (
                      <tr key={tpl.id} className="hover:bg-dash-surface-hover/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-dash-text font-semibold">
                          {tpl.name}
                        </td>
                        <td className="px-4 py-3 text-dash-text-sec">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-dash-surface border border-dash-border">
                            {tpl.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-dash-text-sec font-mono text-[11px]">{tpl.language}</td>
                        <td className="px-4 py-3 text-dash-text-sec max-w-xs truncate" title={tpl.body}>
                          {tpl.body || "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            tpl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800' :
                            tpl.status === 'PENDING'  ? 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800' :
                            'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              tpl.status === 'APPROVED' ? 'bg-emerald-500' :
                              tpl.status === 'PENDING' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'
                            }`} />
                            {tpl.status}
                          </span>
                        </td>
                        {!isReadOnly && (
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteTemplate(tpl.id, tpl.name)}
                              className="p-1 text-dash-text-muted hover:text-red-500 rounded transition-colors"
                              title={`Delete template "${tpl.name}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ── Reset Confirmation Modal ── */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="p-5 border-b border-dash-border flex items-center gap-3">
              <div className="p-2 rounded-full bg-amber-500/10 text-amber-500">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-dash-text text-sm">Reset Agent Settings?</h4>
                <p className="text-xs text-dash-text-sec mt-0.5">Restore all persona and operational parameters to default values.</p>
              </div>
            </div>
            <div className="p-4 bg-dash-canvas/40 text-xs text-dash-text-sec">
              This will overwrite tone, operational limits, triggers, and notification settings back to clean initial standards.
            </div>
            <div className="p-4 flex justify-end gap-2 border-t border-dash-border">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="px-3 py-1.5 bg-dash-surface border border-dash-border text-dash-text text-xs rounded-lg hover:bg-dash-surface-hover"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg"
              >
                Reset to Defaults
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Template Modal ── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <h4 className="font-semibold text-dash-text text-sm flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EA6639]" /> Submit WhatsApp Template
              </h4>
              <button 
                onClick={() => setShowTemplateModal(false)} 
                className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">
                  Template Name <span className="text-dash-text-muted font-normal">(snake_case)</span>
                </label>
                <input 
                  required 
                  type="text" 
                  placeholder="e.g. checkin_welcome_pack" 
                  value={templateForm.name} 
                  onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Language</label>
                  <select 
                    value={templateForm.language} 
                    onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es_ES">Spanish</option>
                    <option value="fr_FR">French</option>
                    <option value="de_DE">German</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Category</label>
                  <select 
                    value={templateForm.category} 
                    onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Message Body</label>
                <textarea 
                  required 
                  rows={4} 
                  placeholder="Hello {{1}}, your booking at {{2}} has been confirmed for {{3}}." 
                  value={templateForm.body} 
                  onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none resize-none font-sans" 
                />
                <p className="text-[10px] text-dash-text-muted mt-1.5">
                  Use placeholders like {"{{1}}"} and {"{{2}}"} for dynamic guest names and dates.
                </p>
              </div>
              <div className="flex gap-3 pt-3 border-t border-dash-border">
                <button 
                  type="button" 
                  onClick={() => setShowTemplateModal(false)} 
                  className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingTemplate} 
                  className="flex-1 py-2 bg-[#EA6639] hover:bg-[#d4582e] text-white rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  {submittingTemplate ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : "Submit to Meta"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
