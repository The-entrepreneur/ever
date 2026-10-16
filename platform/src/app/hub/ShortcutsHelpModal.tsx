import React from "react";
import { X, Command, Keyboard } from "lucide-react";

interface ShortcutsHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsHelpModal: React.FC<ShortcutsHelpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const isMac = typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;
  const modKey = isMac ? "⌘" : "Ctrl";

  const navigationShortcuts = [
    { key: "G then D", description: "Jump to Executive Dashboard" },
    { key: "G then I", description: "Jump to Live Guest Inbox" },
    { key: "G then C", description: "Jump to Guest CRM" },
    { key: "G then B", description: "Jump to Bookings & Ledger" },
    { key: "G then A", description: "Jump to Analytics & Intelligence" },
    { key: "G then F", description: "Jump to Guest Feedback & NPS" },
    { key: "G then S", description: "Jump to Staff & Shifts" },
    { key: "G then K", description: "Jump to Knowledge Base" },
  ];

  const globalShortcuts = [
    { key: `${modKey} + K`, description: "Open Command Palette / Tab Search" },
    { key: "Esc", description: "Close active modal, drawer, or palette" },
    { key: "?", description: "Open keyboard shortcuts cheatsheet" },
    { key: "T", description: "Toggle Obsidian Dark / Daylight Light theme" },
  ];

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-dash-surface border border-dash-border rounded-2xl shadow-2xl overflow-hidden z-[160] animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-dash-border flex items-center justify-between shrink-0 bg-dash-surface">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center text-[#EA6639]">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-dash-text text-sm">Keyboard Shortcuts</h3>
              <p className="text-[11px] text-dash-text-muted mt-0.5">Speed up your daily hotel operations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-dash-text-muted hover:text-dash-text rounded hover:bg-dash-surface-hover transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* General Hotkeys */}
          <div>
            <h4 className="text-[10px] font-bold text-dash-text-muted uppercase tracking-wider mb-2.5">
              Global Hotkeys
            </h4>
            <div className="space-y-1.5">
              {globalShortcuts.map((sc, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 rounded-lg bg-dash-canvas border border-dash-border-hairline"
                >
                  <span className="text-xs text-dash-text">{sc.description}</span>
                  <kbd className="px-2 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[11px] font-semibold text-dash-text-sec shadow-xs">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Navigation Sequences */}
          <div>
            <h4 className="text-[10px] font-bold text-dash-text-muted uppercase tracking-wider mb-2.5">
              Quick Go-To Sequences (press in sequence)
            </h4>
            <div className="space-y-1.5">
              {navigationShortcuts.map((sc, i) => (
                <div 
                  key={i} 
                  className="flex items-center justify-between p-2 rounded-lg bg-dash-canvas border border-dash-border-hairline"
                >
                  <span className="text-xs text-dash-text">{sc.description}</span>
                  <div className="flex items-center gap-1">
                    {sc.key.split(" then ").map((char, ci) => (
                      <React.Fragment key={ci}>
                        <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[11px] font-semibold text-dash-text-sec shadow-xs">
                          {char}
                        </kbd>
                        {ci === 0 && <span className="text-[10px] text-dash-text-muted">then</span>}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-dash-border bg-dash-canvas/40 flex items-center justify-between text-xs text-dash-text-muted">
          <span>Shortcuts are disabled while focused inside text fields.</span>
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover rounded-md text-xs font-medium text-dash-text transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
