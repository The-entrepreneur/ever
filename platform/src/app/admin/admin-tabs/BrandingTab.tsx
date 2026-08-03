import React from "react";
import { Palette, Globe, Mail, Upload, Save, Eye } from "lucide-react";

export function BrandingTab() {
  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">White-label & Branding</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Configure agency branding, custom domains, and white-labelled notification emails.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <button className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-4 bg-dash-green text-dash-green-text rounded-md text-body font-medium hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap">
            <Save className="w-4 h-4" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual Identity */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6">
          <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-purple-100 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Visual Identity</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Used in notification emails and "Powered by" badges.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-data font-semibold text-dash-text mb-2">Agency Logo</label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-lg border border-dash-border bg-dash-canvas flex items-center justify-center overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/shapes/svg?seed=agency" alt="Logo" className="w-10 h-8" />
                </div>
                <button className="px-3 py-1.5 bg-dash-surface border border-dash-border rounded-md text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Change Logo
                </button>
              </div>
            </div>

            <div>
              <label className="block text-data font-semibold text-dash-text mb-2">Primary Color (Hex)</label>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-dash-green border-2 border-white shadow-sm"></div>
                <input type="text" defaultValue="#EA6639" className="w-32 px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
            </div>
          </div>
        </div>

        {/* Domain Configuration */}
        <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6">
          <div className="flex items-center gap-3 border-b border-dash-border pb-4">
            <div className="w-10 h-8 rounded-md bg-blue-100 flex items-center justify-center">
              <Globe className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Domain Settings</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Custom subdomains for client panels.</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-data font-semibold text-dash-text mb-1.5">Agency Base Domain</label>
              <div className="flex items-center">
                <span className="px-3 py-2 bg-dash-canvas border border-r-0 border-dash-border rounded-l-xl text-xs text-dash-text-muted">https://</span>
                <input type="text" defaultValue="clients.myagency.com" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-r-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <p className="text-[10px] text-dash-text-muted mt-1.5">Ensure you have configured a wildcard DNS A record pointing to the application server.</p>
            </div>
            
            <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border-hairline flex items-center justify-between">
              <div>
                <h4 className="text-body font-medium text-dash-text">SSL Certificates</h4>
                <p className="text-micro text-dash-text-muted mt-0.5">Automated via Let's Encrypt</p>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold">Active</span>
            </div>
          </div>
        </div>

      </div>

      {/* Email Templates */}
      <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6">
        <div className="flex items-center justify-between border-b border-dash-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-8 rounded-md bg-emerald-100 flex items-center justify-center">
              <Mail className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-section font-semibold text-dash-text">Email Configuration</h3>
              <p className="text-micro text-dash-text-muted mt-0.5">Customize sending domain and notification templates.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1 space-y-4 border-r border-dash-border pr-4">
            <div>
              <label className="block text-data font-semibold text-dash-text mb-1.5">Sending Address</label>
              <input type="email" defaultValue="notifications@myagency.com" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
            </div>
            
            <div>
              <label className="block text-data font-semibold text-dash-text mb-2">Templates</label>
              <div className="space-y-1">
                <button className="w-full text-left px-3 py-2 bg-dash-surface-raised text-dash-text rounded-lg text-xs font-medium">Handoff Alert</button>
                <button className="w-full text-left px-3 py-2 text-dash-text-sec hover:bg-dash-surface-hover rounded-lg text-xs font-medium transition-colors">DSR Notification</button>
                <button className="w-full text-left px-3 py-2 text-dash-text-sec hover:bg-dash-surface-hover rounded-lg text-xs font-medium transition-colors">Client Invoice</button>
                <button className="w-full text-left px-3 py-2 text-dash-text-sec hover:bg-dash-surface-hover rounded-lg text-xs font-medium transition-colors">Welcome Email</button>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-body font-semibold text-dash-text">Editing: Handoff Alert</h4>
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border rounded-md text-[10px] font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
            </div>
            <div className="flex-1 min-h-[250px] border border-dash-border rounded-lg bg-dash-canvas p-4 font-mono text-xs text-dash-text">
              <p>{"<p>Hello {{staff_name}},</p>"}</p>
              <p>{"<p>A guest requires human assistance on the {{channel}} channel.</p>"}</p>
              <br/>
              <p>{"<p><strong>Reason:</strong> {{handoff_reason}}</p>"}</p>
              <br/>
              <p>{"<a href=\"{{inbox_url}}\" style=\"background-color: {{agency_color}}; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;\">View Conversation</a>"}</p>
              <br/>
              <p>{"<p>Powered by {{agency_name}}</p>"}</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
