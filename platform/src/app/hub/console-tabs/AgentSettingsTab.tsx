import React, { useState, useEffect } from "react";
import { Save, RotateCcw, FileText, Plus, X, Loader2, Bot, Clock, Languages, MessageSquare } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

// Since there is no explicit agent_settings table yet, we mock the persistence 
// of these settings using local state. In a real scenario, this would update
// a JSONB `settings` column on the `hotels` table.

export function AgentSettingsTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  // General Settings State
  const [agentName, setAgentName] = useState("Ever AI Concierge");
  const [agentTone, setAgentTone] = useState("Friendly");
  const [languagePriority, setLanguagePriority] = useState("Auto-detect");
  const [humanOnlyMode, setHumanOnlyMode] = useState(false);
  const [startTime, setStartTime] = useState("00:00");
  const [endTime, setEndTime] = useState("23:59");
  
  const [isSaving, setIsSaving] = useState(false);

  // Templates State
  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", language: "en_US", category: "UTILITY", body: "" });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      // Mocking fetch from a future OpenBSP / Meta API integration
      setTimeout(() => {
        setTemplates([
          { id: '1', name: 'booking_confirmation', language: 'en_US', category: 'UTILITY', status: 'APPROVED' },
          { id: '2', name: 'welcome_message', language: 'en_US', category: 'MARKETING', status: 'PENDING' }
        ]);
        setTemplatesLoading(false);
      }, 1000);
    } catch (err) {
      console.error("Error fetching templates", err);
      setTemplatesLoading(false);
    }
  };

  useEffect(() => {
    if (hotelId) {
      fetchTemplates();
    }
  }, [hotelId]);

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      alert("Settings saved successfully!");
    }, 800);
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSubmittingTemplate(true);
    
    // Mocking submission
    setTimeout(() => {
      setTemplates(prev => [...prev, {
        id: Math.random().toString(),
        name: templateForm.name,
        language: templateForm.language,
        category: templateForm.category,
        status: 'PENDING'
      }]);
      setTemplateForm({ name: "", language: "en_US", category: "UTILITY", body: "" });
      setShowTemplateModal(false);
      setSubmittingTemplate(false);
    }, 1000);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Agent Personality &amp; Settings</h2>
          <p className="text-dash-text-sec mt-1">Fine-tune the agent&apos;s behavior, tone, and operational hours.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="px-3 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-6 max-w-4xl pb-10">
        {/* General Settings */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm">
          <h3 className="text-body font-semibold text-dash-text mb-4 flex items-center gap-2">
            <Bot className="w-4 h-4 text-[#EA6639]" /> General Configuration
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5">Agent Name</label>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60"
              />
              <p className="text-[10px] text-dash-text-muted mt-1.5">This name will be displayed in the web widget.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-dash-text mb-1.5 flex items-center gap-1.5">
                <Languages className="w-3.5 h-3.5" /> Language Priority
              </label>
              <select 
                value={languagePriority}
                onChange={e => setLanguagePriority(e.target.value)}
                disabled={isReadOnly}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text disabled:opacity-60"
              >
                <option>Auto-detect</option>
                <option>English First</option>
                <option>Spanish First</option>
                <option>French First</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-dash-text mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Agent Tone
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Formal", "Friendly", "Playful", "Conversational"].map((tone) => (
                  <label
                    key={tone}
                    className={`border rounded-lg p-3 flex items-center gap-2 transition-colors ${isReadOnly ? 'cursor-default' : 'cursor-pointer'} ${
                      agentTone === tone
                        ? "bg-[#EA6639]/10 border-[#EA6639]/40"
                        : "border-dash-border hover:bg-dash-surface-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      checked={agentTone === tone}
                      onChange={() => !isReadOnly && setAgentTone(tone)}
                      disabled={isReadOnly}
                      className="text-[#EA6639] focus:ring-[#EA6639]"
                    />
                    <span className={`text-xs font-medium ${agentTone === tone ? 'text-[#EA6639]' : 'text-dash-text'}`}>{tone}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Operational Settings */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm">
          <h3 className="text-body font-semibold text-dash-text mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#EA6639]" /> Operational Settings
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-dash-border-hairline pb-5">
              <div className="pr-4">
                <h4 className="text-sm font-medium text-dash-text">Human-only Mode</h4>
                <p className="text-xs text-dash-text-sec mt-1 max-w-lg">
                  Deactivate AI agent responses entirely. All incoming messages will require human intervention from the Inbox.
                </p>
              </div>
              <label className={`relative inline-flex items-center ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={humanOnlyMode}
                  onChange={e => !isReadOnly && setHumanOnlyMode(e.target.checked)}
                  disabled={isReadOnly}
                />
                <div className={`w-11 h-6 bg-dash-surface-raised peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all ${humanOnlyMode ? 'bg-[#EA6639]' : ''}`}></div>
              </label>
            </div>

            <div className={`${humanOnlyMode ? 'opacity-50 pointer-events-none' : ''} transition-opacity`}>
              <h4 className="text-sm font-medium text-dash-text mb-1">Bot Operating Hours</h4>
              <p className="text-xs text-dash-text-sec mb-4">Define when the AI agent is active. Outside these hours, it defaults to human-only mode.</p>
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
            </div>
          </div>
        </div>

        {/* Message Templates Section */}
        <div className="bg-dash-surface p-5 md:p-6 rounded-xl border border-dash-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-body font-semibold text-dash-text flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#EA6639]" />
                WhatsApp Templates (HSMs)
              </h3>
              <p className="text-xs text-dash-text-sec mt-1 max-w-lg">Manage Meta-approved WhatsApp message templates for proactive outreach.</p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowTemplateModal(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface-raised border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> New Template
              </button>
            )}
          </div>

          <div className="bg-dash-canvas rounded-lg border border-dash-border overflow-hidden">
            {templatesLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-dash-text-sec">
                <Loader2 className="w-5 h-5 animate-spin mb-2 text-[#EA6639]" /> 
                <span className="text-xs">Fetching Meta templates...</span>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-10 text-dash-text-sec">
                <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium text-dash-text">No templates found</p>
                <p className="text-xs mt-1">Create your first template to get started with WhatsApp outreach.</p>
              </div>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-dash-surface border-b border-dash-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-dash-text">Template Name</th>
                    <th className="px-4 py-3 font-semibold text-dash-text">Language</th>
                    <th className="px-4 py-3 font-semibold text-dash-text">Category</th>
                    <th className="px-4 py-3 font-semibold text-dash-text text-right">Meta Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border-hairline">
                  {templates.map((tpl) => (
                    <tr key={tpl.id} className="hover:bg-dash-surface-hover/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-dash-text font-medium">{tpl.name}</td>
                      <td className="px-4 py-3 text-dash-text-sec">{tpl.language}</td>
                      <td className="px-4 py-3 text-dash-text-sec">{tpl.category}</td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                          tpl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                          tpl.status === 'PENDING'  ? 'bg-amber-100 text-amber-700 border-amber-200' :
                          'bg-red-100 text-red-700 border-red-200'
                        }`}>{tpl.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* New Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <h4 className="font-semibold text-dash-text">Submit WhatsApp Template</h4>
              <button onClick={() => setShowTemplateModal(false)} className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1 hover:bg-dash-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSubmitTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Template Name <span className="text-dash-text-muted font-normal">(snake_case)</span></label>
                <input required type="text" placeholder="e.g. booking_confirmation" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Language</label>
                  <select value={templateForm.language} onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none">
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es_ES">Spanish</option>
                    <option value="fr_FR">French</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Category</label>
                  <select value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none">
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Message Body</label>
                <textarea required rows={4} placeholder="Hello {{1}}, your booking at {{2}} has been confirmed." value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none resize-none" />
                <p className="text-[10px] text-dash-text-muted mt-1.5">Use {"{{1}}"}, {"{{2}}"} for variables.</p>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dash-border">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={submittingTemplate} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70">
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
