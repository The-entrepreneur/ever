import React, { useState, useEffect, useMemo, useRef } from "react";
import { 
  Search, 
  X, 
  ArrowRight, 
  LayoutDashboard, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings, 
  Blocks, 
  UserCheck, 
  Calendar, 
  BarChart3, 
  Star, 
  ShieldCheck, 
  CreditCard,
  Headphones,
  Bell,
  Sun,
  Moon,
  Sparkles,
  Command,
  CornerDownLeft,
  Wand2,
  FileText,
  Utensils,
  BellRing
} from "lucide-react";

export interface CommandPaletteItem {
  id: string;
  type: "tab" | "action";
  title: string;
  description: string;
  category: "Navigation" | "Actions" | "Preferences";
  icon: React.ElementType;
  tabKey?: string;
  badge?: string;
  action?: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tabKey: string) => void;
  onOpenSupport: () => void;
  onOpenNotifications: () => void;
  onToggleTheme: () => void;
  onToggleSandbox: () => void;
  onOpenSetupWizard: () => void;
  onOpenShortcutsHelp: () => void;
  currentTheme: "dark" | "light" | "system";
  isSandbox: boolean;
  allowedTabs?: (tabKey: string) => boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenSupport,
  onOpenNotifications,
  onToggleTheme,
  onToggleSandbox,
  onOpenSetupWizard,
  onOpenShortcutsHelp,
  currentTheme,
  isSandbox,
  allowedTabs,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Auto-focus input on open & reset search
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Define searchable items
  const allItems: CommandPaletteItem[] = useMemo(() => {
    const rawTabs: Array<{ id: string; title: string; description: string; icon: React.ElementType; tabKey: string; badge?: string }> = [
      { id: "tab-dashboard", title: "Dashboard Cockpit", description: "Executive overview, live activity feed & ARR telemetry", icon: LayoutDashboard, tabKey: "dashboard" },
      { id: "tab-inbox", title: "Live Guest Inbox", description: "Omnichannel real-time chats, AI agent & staff takeover", icon: MessageSquare, tabKey: "inbox", badge: "Live" },
      { id: "tab-crm", title: "Guest CRM Registry", description: "Guest profiles, VIP statuses, GDPR Art. 17 & past stays", icon: Users, tabKey: "crm" },
      { id: "tab-knowledge", title: "Knowledge Base Studio", description: "Property amenities, FAQs, room types & concierge guidelines", icon: BookOpen, tabKey: "knowledge_base" },
      { id: "tab-agent", title: "Agent Settings", description: "Bot persona, tone controls, language SLA & WhatsApp HSM", icon: Settings, tabKey: "agent_settings" },
      { id: "tab-channels", title: "Channel Integrations", description: "WhatsApp WABA, Instagram, Facebook, Web Widget & Tawk.to", icon: Blocks, tabKey: "channels" },
      { id: "tab-staff", title: "Staff & Shift Operations", description: "Team directory, active shifts, escalation SLAs & department roster", icon: UserCheck, tabKey: "staff" },
      { id: "tab-bookings", title: "Bookings & Direct Ledger", description: "Direct reservation ledger, 3% savings, calendar & folios", icon: Calendar, tabKey: "bookings" },
      { id: "tab-orders", title: "Dining & Orders", description: "F&B room service orders, kitchen ticket dispatch & folio charging", icon: Utensils, tabKey: "orders" },
      { id: "tab-services", title: "Guest Services", description: "Housekeeping, maintenance, laundry & concierge requests", icon: BellRing, tabKey: "services" },
      { id: "tab-analytics", title: "Analytics & Intelligence", description: "Heatmaps, intent matrices, staff benchmarks & custom report studio", icon: BarChart3, tabKey: "analytics" },
      { id: "tab-feedback", title: "Guest Feedback & NPS", description: "CSAT scorecards, sentiment analysis & autonomous review booster", icon: Star, tabKey: "feedback" },
      { id: "tab-compliance", title: "Compliance & GDPR Suite", description: "Art. 15 access, Art. 17 erasure, DPA agreements & PII masking", icon: ShieldCheck, tabKey: "compliance" },
      { id: "tab-billing", title: "Billing & Subscriptions", description: "4-tier physical estates, 10 revenue streams & net ROI engine", icon: CreditCard, tabKey: "billing" },
    ];

    const tabItems: CommandPaletteItem[] = rawTabs
      .filter(t => !allowedTabs || allowedTabs(t.tabKey))
      .map(t => ({
        ...t,
        type: "tab" as const,
        category: "Navigation" as const,
      }));

    const actionItems: CommandPaletteItem[] = [
      {
        id: "act-support",
        type: "action",
        title: "Support & Engineering Desk",
        description: "Open real-time 24/7 ticket channel to Ever core engineering",
        category: "Actions",
        icon: Headphones,
        badge: "24/7 SLA",
        action: onOpenSupport,
      },
      {
        id: "act-notifs",
        type: "action",
        title: "Notification Centre",
        description: "Review urgent guest escalations, negative reviews and alerts",
        category: "Actions",
        icon: Bell,
        action: onOpenNotifications,
      },
      {
        id: "act-theme",
        type: "action",
        title: currentTheme === "dark" ? "Switch to Light Theme" : "Switch to Dark Executive Theme",
        description: "Toggle interface between sleek obsidian dark and crisp daylight mode",
        category: "Preferences",
        icon: currentTheme === "dark" ? Sun : Moon,
        action: onToggleTheme,
      },
      {
        id: "act-sandbox",
        type: "action",
        title: isSandbox ? "Switch to Live Production Database" : "Switch to Interactive Sandbox Demo",
        description: isSandbox ? "Connect to real hotel PostgreSQL tenant tables" : "Explore risk-free with simulated guest events and reservations",
        category: "Preferences",
        icon: Sparkles,
        badge: isSandbox ? "Sandbox Active" : "Live Active",
        action: onToggleSandbox,
      },
      {
        id: "act-wizard",
        type: "action",
        title: "First-Time Property Setup Wizard",
        description: "Re-run the guided walkthrough to configure hotel name, address, and agent",
        category: "Actions",
        icon: Wand2,
        action: onOpenSetupWizard,
      },
      {
        id: "act-shortcuts",
        type: "action",
        title: "Keyboard Shortcuts Cheatsheet",
        description: "Display list of hotkeys to navigate Ever at lightning speed",
        category: "Preferences",
        icon: Command,
        badge: "?",
        action: onOpenShortcutsHelp,
      },
    ];

    return [...tabItems, ...actionItems];
  }, [
    allowedTabs, 
    onOpenSupport, 
    onOpenNotifications, 
    onToggleTheme, 
    onToggleSandbox, 
    onOpenSetupWizard, 
    onOpenShortcutsHelp, 
    currentTheme, 
    isSandbox
  ]);

  // Filtered items based on user query
  const filteredItems = useMemo(() => {
    if (!query.trim()) return allItems;
    const q = query.toLowerCase().trim();
    return allItems.filter(item => 
      item.title.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [allItems, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Ensure selected item is scrolled into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Handle keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        executeItem(item);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  const executeItem = (item: CommandPaletteItem) => {
    onClose();
    if (item.type === "tab" && item.tabKey) {
      onSelectTab(item.tabKey);
    } else if (item.action) {
      item.action();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-[10vh] sm:pt-[15vh] px-4">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
      />

      {/* Palette Container */}
      <div 
        className="relative w-full max-w-xl bg-dash-surface border border-dash-border rounded-2xl shadow-2xl overflow-hidden flex flex-col z-[130] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-dash-border shrink-0 bg-dash-surface">
          <Search className="w-5 h-5 text-dash-text-muted shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or jump to tab... (e.g. Inbox, Channels, Theme)"
            className="w-full py-4 text-sm bg-transparent text-dash-text placeholder:text-dash-text-muted focus:outline-none"
          />
          {query ? (
            <button 
              onClick={() => setQuery("")}
              className="p-1 rounded text-dash-text-muted hover:text-dash-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-dash-text-muted bg-dash-surface-raised border border-dash-border rounded">
              esc
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div 
          ref={listRef}
          className="max-h-[380px] overflow-y-auto p-2 divide-y divide-dash-border-hairline/40 scrollbar-thin scrollbar-thumb-zinc-300 dark:scrollbar-thumb-zinc-700"
        >
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-xs text-dash-text-muted">No commands or tabs match "{query}"</p>
              <p className="text-[11px] text-dash-text-sec mt-1">Try searching for "Dashboard", "Staff", or "Support"</p>
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const isSelected = index === selectedIndex;
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  data-index={index}
                  onClick={() => executeItem(item)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                    isSelected 
                      ? "bg-[#EA6639]/10 text-dash-text border border-[#EA6639]/30" 
                      : "hover:bg-dash-surface-hover/60 text-dash-text border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 pr-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected 
                        ? "bg-[#EA6639] text-white" 
                        : "bg-dash-surface-raised border border-dash-border text-dash-text-sec"
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold truncate text-dash-text">{item.title}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-[#EA6639]/15 text-[#EA6639] border border-[#EA6639]/20">
                            {item.badge}
                          </span>
                        )}
                        <span className="text-[10px] text-dash-text-muted uppercase tracking-wider hidden sm:inline">
                          • {item.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-dash-text-muted truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isSelected && (
                      <span className="hidden sm:flex items-center gap-1 text-[10px] text-[#EA6639] font-medium">
                        <span>Select</span>
                        <CornerDownLeft className="w-3 h-3" />
                      </span>
                    )}
                    <ArrowRight className={`w-4 h-4 ${isSelected ? "text-[#EA6639]" : "text-dash-text-muted/40"}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-4 py-2.5 border-t border-dash-border bg-dash-canvas/60 flex items-center justify-between text-[11px] text-dash-text-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[10px]">↑</kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[10px]">↓</kbd>
              <span>to navigate</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[10px]">↵</kbd>
              <span>to choose</span>
            </span>
            <span className="hidden sm:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[10px]">esc</kbd>
              <span>to close</span>
            </span>
          </div>

          <button 
            onClick={onOpenShortcutsHelp}
            className="hover:text-dash-text text-dash-text-sec flex items-center gap-1 transition-colors"
          >
            <span>Shortcuts</span>
            <kbd className="px-1.5 py-0.5 rounded bg-dash-surface border border-dash-border font-mono text-[10px]">?</kbd>
          </button>
        </div>
      </div>
    </div>
  );
};
