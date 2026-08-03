import React, { useState } from "react";
import { Plus, Edit2, Trash2, Search } from "lucide-react";

export function KnowledgeBaseTab({ role }: { role?: string }) {
  const [activeSubTab, setActiveSubTab] = useState("FAQs");
  
  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Knowledge Base Manager</h2>
          <p className="text-dash-text-sec mt-1">Update the bot's knowledge base for FAQs, rooms, and upsells.</p>
        </div>
        {!isReadOnly && (
          <button className="flex items-center gap-2 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
            <Plus className="w-4 h-4" /> Add New {activeSubTab.slice(0, -1)}
          </button>
        )}
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 flex flex-col overflow-hidden">
        <div className="border-b border-dash-border flex items-center px-4 pt-2 bg-dash-canvas">
          {["FAQs", "Rooms", "Upsells"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeSubTab === tab 
                  ? "border-[#EA6639] text-dash-green" 
                  : "border-transparent text-dash-text-muted hover:text-dash-text-sec "
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-dash-border bg-dash-surface">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              placeholder={`Search ${activeSubTab}...`} 
              className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {activeSubTab === "FAQs" && (
            <div className="space-y-3">
              {[
                { q: "What time is check-in?", a: "Standard check-in is at 3:00 PM. Early check-in is subject to availability.", status: true },
                { q: "Do you have parking?", a: "Yes, valet parking is available for $45 per night.", status: true },
                { q: "Is breakfast included?", a: "Breakfast is included in select room rates. Otherwise, it is $25 per person.", status: false },
              ].map((faq, i) => (
                <div key={i} className="p-4 border border-dash-border rounded-lg hover:border-dash-border transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-dash-text">{faq.q}</h4>
                    {!isReadOnly && (
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-dash-text-muted hover:text-dash-text"><Edit2 className="w-4 h-4" /></button>
                        <button className="p-1 text-dash-text-muted hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-dash-text-sec mb-3 line-clamp-2">{faq.a}</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-md ${faq.status ? 'bg-emerald-500' : 'bg-dash-surface-raised '}`}></span>
                    <span className="text-xs text-dash-text-muted">{faq.status ? 'Active' : 'Inactive'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          {activeSubTab !== "FAQs" && (
            <div className="h-full flex items-center justify-center text-dash-text-sec text-xs">
              No {activeSubTab.toLowerCase()} configured yet. Click "Add New" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
