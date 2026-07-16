import React from "react";
import { FileJson, Upload, PlayCircle, Code } from "lucide-react";

export function TemplateManagerTab() {
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Global Template Manager</h2>
          <p className="text-dash-text-sec mt-1">Manage the "Golden" n8n workflow templates for different service tiers.</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
          <Upload className="w-4 h-4" /> Upload New Template
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        <div className="lg:col-span-4 bg-dash-surface rounded-lg border border-dash-border flex flex-col overflow-hidden">
          <div className="p-4 border-b border-dash-border bg-dash-canvas">
            <h3 className="font-semibold text-dash-text">Template Library</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {[
              { name: "Level 1 Starter", version: "v1.0.0", desc: "Basic workflow for Whatsapp and FAQs.", date: "1 month ago", active: true },
              { name: "Level 2 Growth", version: "v1.2.4", desc: "Includes advanced CRM routing and sentiment analysis.", date: "2 days ago", active: false },
              { name: "Level 3 Enterprise", version: "v2.0.1", desc: "Full POS/PMS integration node layout.", date: "1 week ago", active: false },
            ].map((tpl, i) => (
              <div key={i} className={`p-4 border rounded-lg cursor-pointer transition-colors ${tpl.active ? 'border-[#EA6639] bg-dash-green/5 ' : 'border-dash-border hover:border-dash-border '}`}>
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-medium text-dash-text text-xs">{tpl.name}</h4>
                  <span className="text-[10px] font-mono text-dash-text-muted bg-dash-canvas px-1.5 py-0.5 rounded">{tpl.version}</span>
                </div>
                <p className="text-xs text-dash-text-sec mb-3">{tpl.desc}</p>
                <div className="text-[10px] text-dash-text-muted text-right">Updated {tpl.date}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-8 bg-dash-surface rounded-lg border border-dash-border-strong flex flex-col overflow-hidden shadow-inner">
          <div className="p-4 border-b border-dash-border-strong flex justify-between items-center bg-dash-canvas">
            <div className="flex items-center gap-2">
              <FileJson className="w-4 h-4 text-dash-text-muted" />
              <span className="text-xs font-mono text-dash-text">Level 1 Starter (v1.0.0).json</span>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 text-xs font-medium text-dash-text border border-dash-border-strong rounded hover:bg-dash-surface-raised transition-colors flex items-center gap-1.5">
                <Code className="w-3 h-3" /> Format
              </button>
              <button className="px-3 py-1.5 text-xs font-medium text-dash-text bg-blue-600 rounded hover:bg-blue-700 transition-colors flex items-center gap-1.5">
                <PlayCircle className="w-3 h-3" /> Deploy to Clients
              </button>
            </div>
          </div>
          <div className="flex-1 p-4 overflow-auto">
            <pre className="text-xs font-mono text-emerald-400">
{`{
  "name": "Level 1 Starter",
  "nodes": [
    {
      "parameters": {},
      "id": "c6114eb9-408c-49dc-8c46-7c980b182069",
      "name": "Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [ 250, 300 ],
      "webhookId": "ever-inbound"
    },
    {
      "parameters": {
        "model": "gemini-1.5-flash",
        "options": {}
      },
      "id": "e2f18370-1798-466d-9b59-9069d27f8a70",
      "name": "Google Gemini",
      "type": "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      "position": [ 450, 300 ]
    }
  ],
  "connections": {
    "Webhook": {
      "main": [
        [
          {
            "node": "Google Gemini",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
