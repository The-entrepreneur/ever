import React, { useState, useEffect } from "react";
import { Save, RotateCcw, FileText, Plus, X, Loader2 } from "lucide-react";

export function AgentSettingsTab({ role }: { role?: string }) {
  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  const [templates, setTemplates] = useState<any[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateForm, setTemplateForm] = useState({ name: "", language: "en_US", category: "UTILITY", body: "" });
  const [submittingTemplate, setSubmittingTemplate] = useState(false);

  const fetchTemplates = async () => {
    setTemplatesLoading(true);
    try {
      const res = await fetch("/api/templates");
      const data = await res.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error("Error fetching templates", err);
    } finally {
      setTemplatesLoading(false);
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setSubmittingTemplate(true);
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(templateForm)
      });
      const data = await res.json();
      if (data.success) {
        await fetchTemplates();
        setTemplateForm({ name: "", language: "en_US", category: "UTILITY", body: "" });
        setShowTemplateModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingTemplate(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Agent Personality &amp; Settings</h2>
          <p className="text-dash-text-sec mt-1">Fine-tune the agent&apos;s behavior, tone, and operational hours.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button className="px-3 py-1.5 border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors flex items-center gap-2">
              <RotateCcw className="w-4 h-4" /> Reset
            </button>
            <button className="px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors flex items-center gap-2">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        )}
      </div>

      <fieldset disabled={isReadOnly} className="space-y-6 max-w-3xl">
        {/* General Settings */}
        <div className="bg-dash-surface p-6 rounded-lg border border-dash-border">
          <h3 className="text-body font-medium text-dash-text mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-dash-text mb-1">Agent Name</label>
              <input
                type="text"
                defaultValue="Ever AI Concierge"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dash-text mb-2">Agent Tone</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["Formal", "Friendly", "Playful", "Conversational"].map((tone) => (
                  <label
                    key={tone}
                    className={`border border-dash-border rounded-lg p-3 flex items-center gap-2 cursor-pointer transition-colors ${
                      tone === "Friendly"
                        ? "bg-dash-green/5 border-[#EA6639]/30"
                        : "hover:bg-dash-surface-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="tone"
                      defaultChecked={tone === "Friendly"}
                      className="text-dash-green focus:ring-[#EA6639]"
                    />
                    <span className="text-xs font-medium text-dash-text">{tone}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-dash-text mb-1">Language Priority</label>
              <select className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                <option>Auto-detect</option>
                <option>English First</option>
                <option>Spanish First</option>
                <option>French First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Operational Settings */}
        <div className="bg-dash-surface p-6 rounded-lg border border-dash-border">
          <h3 className="text-body font-medium text-dash-text mb-4">Operational Settings</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-dash-border-hairline pb-4">
              <div>
                <h4 className="text-xs font-medium text-dash-text">Human-only Mode</h4>
                <p className="text-xs text-dash-text-sec mt-1">
                  Deactivate agent responses entirely. All incoming messages will require human intervention.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-dash-surface-raised peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-dash-green"></div>
              </label>
            </div>

            <div>
              <h4 className="text-xs font-medium text-dash-text mb-3">Operating Hours</h4>
              <p className="text-xs text-dash-text-sec mb-4">Define when the agent is active vs human-only mode.</p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs text-dash-text-muted mb-1">Start Time</label>
                  <input
                    type="time"
                    defaultValue="00:00"
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-dash-text-muted mb-1">End Time</label>
                  <input
                    type="time"
                    defaultValue="23:59"
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </fieldset>

      {/* Message Templates Section */}
      <div className="mt-8 max-w-3xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-body font-medium text-dash-text flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Message Templates (HSMs)
            </h3>
            <p className="text-xs text-dash-text-sec mt-1">Manage Meta-approved WhatsApp &amp; Instagram message templates via OpenBSP.</p>
          </div>
          {!isReadOnly && (
            <button
              onClick={() => setShowTemplateModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> New Template
            </button>
          )}
        </div>

        <div className="bg-dash-surface rounded-lg border border-dash-border overflow-hidden">
          {templatesLoading ? (
            <div className="flex items-center justify-center p-8 text-dash-text-sec gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading templates...
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center p-8 text-dash-text-sec">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs">No templates found. Create your first template to get started.</p>
            </div>
          ) : (
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-dash-border-hairline bg-dash-canvas">
                  <th className="text-left px-4 py-3 text-dash-text-muted font-medium">Name</th>
                  <th className="text-left px-4 py-3 text-dash-text-muted font-medium">Language</th>
                  <th className="text-left px-4 py-3 text-dash-text-muted font-medium">Category</th>
                  <th className="text-left px-4 py-3 text-dash-text-muted font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((tpl) => (
                  <tr key={tpl.id} className="border-b border-dash-border-hairline hover:bg-dash-surface-hover transition-colors">
                    <td className="px-4 py-3 font-mono text-dash-text">{tpl.name}</td>
                    <td className="px-4 py-3 text-dash-text-sec">{tpl.language}</td>
                    <td className="px-4 py-3 text-dash-text-sec">{tpl.category}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        tpl.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                        tpl.status === 'PENDING'  ? 'bg-amber-100 text-amber-700' :
                        'bg-red-100 text-red-700'
                      }`}>{tpl.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-5 border-b border-dash-border-hairline">
              <h4 className="font-semibold text-dash-text">Submit New Template</h4>
              <button onClick={() => setShowTemplateModal(false)} className="text-dash-text-muted hover:text-dash-text transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmitTemplate} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Template Name <span className="text-dash-text-muted">(snake_case)</span></label>
                <input required type="text" placeholder="e.g. booking_confirmation" value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Language</label>
                  <select value={templateForm.language} onChange={(e) => setTemplateForm({ ...templateForm, language: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none">
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es_ES">Spanish</option>
                    <option value="fr_FR">French</option>
                    <option value="de_DE">German</option>
                    <option value="pt_BR">Portuguese (BR)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Category</label>
                  <select value={templateForm.category} onChange={(e) => setTemplateForm({ ...templateForm, category: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none">
                    <option value="UTILITY">Utility</option>
                    <option value="MARKETING">Marketing</option>
                    <option value="AUTHENTICATION">Authentication</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Template Body</label>
                <textarea required rows={4} placeholder="Hello {{1}}, your booking at {{2}} has been confirmed." value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowTemplateModal(false)} className="flex-1 py-2 border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={submittingTemplate} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5">
                  {submittingTemplate ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...</> : "Submit Template"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
