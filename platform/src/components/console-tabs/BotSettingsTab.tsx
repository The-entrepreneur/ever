import React from "react";
import { Save, RotateCcw } from "lucide-react";

export function BotSettingsTab({ role }: { role?: string }) {
  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Bot Personality &amp; Settings</h2>
          <p className="text-dash-text-sec mt-1">Fine-tune the bot&apos;s behavior, tone, and operational hours.</p>
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
              <label className="block text-xs font-medium text-dash-text mb-1">Bot Name</label>
              <input
                type="text"
                defaultValue="Ever AI Concierge"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-dash-text mb-2">Bot Tone</label>
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
                  Deactivate bot responses entirely. All incoming messages will require human intervention.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-dash-surface-raised peer-focus:outline-none rounded-md peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-md after:h-5 after:w-5 after:transition-all peer-checked:bg-dash-green"></div>
              </label>
            </div>

            <div>
              <h4 className="text-xs font-medium text-dash-text mb-3">Operating Hours</h4>
              <p className="text-xs text-dash-text-sec mb-4">Define when the bot is active vs human-only mode.</p>
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
    </div>
  );
}
