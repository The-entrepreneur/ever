import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings, 
  Blocks,
  UserCheck,
  HelpCircle,
  Sun,
  Moon,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  User,
  Building,
  Lock,
  ChevronDown,
  Menu,
  X,
  Calendar,
  BarChart3,
  Star,
  ShieldCheck,
  CreditCard,
  Bell,
  Sparkles,
  Check,
  Headphones,
  Search,
  Command,
  Keyboard,
  Utensils,
  BellRing
} from "lucide-react";
import { useTheme } from "../../shared/ThemeProvider";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useSandbox } from "../../context/SandboxDataContext";
import { useToast } from "../../shared/ToastContext";
import { SetupWizardModal } from "./SetupWizardModal";
import { NotificationDrawer } from "./NotificationDrawer";
import { SupportTicketModal } from "./SupportTicketModal";
import { CommandPalette } from "./CommandPalette";
import { ShortcutsHelpModal } from "./ShortcutsHelpModal";
import { DashboardTab } from "./console-tabs/DashboardTab";
import { InboxTab } from "./console-tabs/InboxTab";
import { CRMTab } from "./console-tabs/CRMTab";
import { KnowledgeBaseTab } from "./console-tabs/KnowledgeBaseTab";
import { AgentSettingsTab } from "./console-tabs/AgentSettingsTab";
import { ChannelsTab } from "./console-tabs/ChannelsTab";
import { StaffTab } from "./console-tabs/StaffTab";
import { BookingsTab } from "./console-tabs/BookingsTab";
import { OrdersTab } from "./console-tabs/OrdersTab";
import { ServicesTab } from "./console-tabs/ServicesTab";
import { AnalyticsTab } from "./console-tabs/AnalyticsTab";
import { FeedbackTab } from "./console-tabs/FeedbackTab";
import { ComplianceTab } from "./console-tabs/ComplianceTab";
import { BillingTab } from "./console-tabs/BillingTab";

const PlaceholderTab = ({ title, description }: { title: string, description: string }) => (
  <div className="p-6 md:p-8 flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 bg-dash-surface-raised rounded-md flex items-center justify-center mb-4">
      <Blocks className="w-8 h-8 text-dash-text-muted" />
    </div>
    <h2 className="text-section font-bold text-dash-text mb-2">{title}</h2>
    <p className="text-dash-text-sec max-w-md">{description}</p>
  </div>
);

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function Console() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const { isSandbox, regenerate } = useSandbox();
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "crm" | "knowledge_base" | "agent_settings" | "channels" | "staff" | "bookings" | "orders" | "services" | "analytics" | "feedback" | "compliance" | "billing">("dashboard");
  const [inboxTargetId, setInboxTargetId] = useState<string | null>(null);
  
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  const handleNavigate = (tab: string, context?: any) => {
    setActiveTab(tab as any);
    if (tab === 'inbox' && context?.sessionId) {
      setInboxTargetId(context.sessionId);
    }
  };

  // Register Service Worker and Setup Web Push Subscriptions
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker.register("/sw.js")
        .then((reg) => {
          console.log("[Service Worker] Registered successfully:", reg);
          
          // Request permission
          Notification.requestPermission().then(async (permission) => {
            if (permission === "granted") {
              try {
                // Get VAPID public key
                const keyRes = await fetch("/api/push/vapid-public-key");
                const { publicKey } = await keyRes.json();
                if (!publicKey) return;

                // Subscribe
                let subscription = await reg.pushManager.getSubscription();
                if (!subscription) {
                  subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                  });
                }
                
                // Send to backend
                await fetch("/api/push/subscribe", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(subscription)
                });
                console.log("[Push Notification] Subscribed successfully!");
              } catch (err) {
                console.warn("[Push Notification] Subscription failed:", err);
              }
            }
          });
        })
        .catch((err) => {
          console.error("[Service Worker] Registration failed:", err);
        });
    }
  }, []);

  // Modal open states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isSetupWizardOpen, setIsSetupWizardOpen] = useState(false);

  const { user, hotelId, signOut, isOnline, lastLogin } = useAuth();
  const { showToast } = useToast();
  
  const [propertyProfile, setPropertyProfile] = useState({
    mobileNumber: "",
    role: "hotel_manager",
    businessAddress: "",
    propertyType: "Hotel" as string,
    propertyName: "",
    fullName: "",
    email: "",
    pms: ""
  });
  
  const [hotelData, setHotelData] = useState<any>(null);

  // Temporary states for form editing
  const [tempProfile, setTempProfile] = useState({ fullName: "", email: "", role: "" });
  const [tempProperty, setTempProperty] = useState({ propertyName: "", propertyType: "Resort" as string, pms: "", businessAddress: "", mobileNumber: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const isTabAllowed = (tabName: string) => {
    const role = (propertyProfile.role || "").toLowerCase();
    if (role === "hotel_readonly" || role.includes("readonly") || role.includes("read only")) {
      return ["dashboard", "analytics"].includes(tabName);
    }
    if (role === "hotel_receptionist" || role.includes("receptionist")) {
      return ["dashboard", "inbox", "crm", "bookings", "orders", "services", "knowledge_base", "analytics", "feedback"].includes(tabName);
    }
    return true; // hotel_manager and others can access all
  };

  useEffect(() => {
    if (!isTabAllowed(activeTab)) {
      setActiveTab("dashboard");
    }
  }, [propertyProfile.role, activeTab]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Global Keyboard Shortcuts & Navigation Sequences
  useEffect(() => {
    let pendingG = false;
    let pendingGTimeout: any = null;

    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Mod+K (Ctrl+K or Cmd+K) triggers Command Palette anywhere
      if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
        return;
      }

      // 2. Escape closes active modals/drawers in order
      if (e.key === "Escape") {
        if (isShortcutsHelpOpen) {
          setIsShortcutsHelpOpen(false);
          return;
        }
        if (isCommandPaletteOpen) {
          setIsCommandPaletteOpen(false);
          return;
        }
        if (isSupportModalOpen) {
          setIsSupportModalOpen(false);
          return;
        }
        if (isNotificationDrawerOpen) {
          setIsNotificationDrawerOpen(false);
          return;
        }
        if (isMobileSidebarOpen) {
          setIsMobileSidebarOpen(false);
          return;
        }
        if (isProfileOpen) {
          setIsProfileOpen(false);
          return;
        }
        if (isProfileModalOpen) {
          setIsProfileModalOpen(false);
          return;
        }
        if (isPasswordModalOpen) {
          setIsPasswordModalOpen(false);
          return;
        }
        return;
      }

      // Don't trigger shortcuts if user is typing in form inputs, textareas, or contentEditable
      const target = e.target as HTMLElement;
      if (
        target && 
        (target.tagName === "INPUT" || 
         target.tagName === "TEXTAREA" || 
         target.tagName === "SELECT" || 
         target.isContentEditable)
      ) {
        return;
      }

      // 3. Question mark '?' opens Shortcuts Help Modal
      if (e.key === "?" && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setIsShortcutsHelpOpen(prev => !prev);
        return;
      }

      // 4. 't' or 'T' toggles theme
      if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey && !e.altKey && !pendingG) {
        e.preventDefault();
        setTheme(theme === "dark" ? "light" : "dark");
        return;
      }

      // 5. 'g' then letter navigation sequences
      if ((e.key === "g" || e.key === "G") && !pendingG) {
        pendingG = true;
        clearTimeout(pendingGTimeout);
        pendingGTimeout = setTimeout(() => {
          pendingG = false;
        }, 1200);
        return;
      }

      if (pendingG) {
        pendingG = false;
        clearTimeout(pendingGTimeout);
        const k = e.key.toLowerCase();
        const tabMap: Record<string, string> = {
          d: "dashboard",
          i: "inbox",
          c: "crm",
          b: "bookings",
          o: "orders",
          v: "services",
          a: "analytics",
          f: "feedback",
          s: "staff",
          k: "knowledge_base",
          p: "compliance",
          r: "billing"
        };
        const targetTab = tabMap[k];
        if (targetTab && isTabAllowed(targetTab)) {
          e.preventDefault();
          setActiveTab(targetTab as any);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(pendingGTimeout);
    };
  }, [
    isShortcutsHelpOpen,
    isCommandPaletteOpen,
    isSupportModalOpen,
    isNotificationDrawerOpen,
    isMobileSidebarOpen,
    isProfileOpen,
    isProfileModalOpen,
    isPasswordModalOpen,
    theme,
    setTheme
  ]);

  const [seeding, setSeeding] = useState(false);

  // Load from Supabase
  const loadProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("users")
        .select("*, hotels(*)")
        .eq("id", user.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        const hotelObj = Array.isArray(data.hotels) ? data.hotels[0] : data.hotels;
        const hotelName = hotelObj?.name || user?.user_metadata?.business_name || "";
        const hotelAddr = data.business_address || hotelObj?.address || user?.user_metadata?.address || "";

        setPropertyProfile({
          fullName: data.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "",
          email: data.email || user?.email || "",
          role: data.role || "hotel_manager",
          propertyName: hotelName,
          propertyType: data.property_type || user?.user_metadata?.property_type || "Hotel",
          pms: data.pms || "cloudbeds",
          businessAddress: hotelAddr,
          mobileNumber: data.mobile_number || user?.user_metadata?.mobile_number || ""
        });
        
        if (hotelObj) {
          setHotelData({ ...hotelObj, name: hotelName, address: hotelAddr });
          const isDoneLocal = 
            localStorage.getItem(`ever_setup_complete_${hotelObj.id}`) === "true" ||
            (user?.id && localStorage.getItem(`ever_setup_complete_${user.id}`) === "true") ||
            localStorage.getItem("ever_setup_complete_default") === "true";

          if (hotelObj.setup_complete === false && !isDoneLocal) {
            setIsSetupWizardOpen(true);
          }
        } else if (user?.user_metadata?.business_name) {
          setHotelData({ name: user.user_metadata.business_name, address: user.user_metadata.address });
        }
      }
    } catch (err) {
      console.error("Error loading profile:", err);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleSaveProfileModal = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...propertyProfile,
      fullName: tempProfile.fullName,
      email: tempProfile.email,
      role: tempProfile.role
    };
    setPropertyProfile(updated);
    localStorage.setItem("ever_signup_form", JSON.stringify(updated));
    setIsProfileModalOpen(false);
  };

  const handleSavePropertyModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...propertyProfile,
      propertyName: tempProperty.propertyName,
      propertyType: tempProperty.propertyType,
      pms: tempProperty.pms,
      businessAddress: tempProperty.businessAddress,
      mobileNumber: tempProperty.mobileNumber
    };
    setPropertyProfile(updated);

    // Persist to Supabase
    try {
      if (hotelId) {
        await supabase.from("hotels").update({ name: tempProperty.propertyName }).eq("id", hotelId);
      }
      if (user?.id) {
        await supabase.from("users").update({
          property_type: tempProperty.propertyType,
          pms: tempProperty.pms,
          business_address: tempProperty.businessAddress,
          mobile_number: tempProperty.mobileNumber,
        }).eq("id", user.id);
      }
      showToast("Property settings saved!", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save property settings", "error");
    }

    setIsPropertyModalOpen(false);
  };

  const handleSavePasswordModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showToast("New passwords do not match!", "error");
      return;
    }
    
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });
      
      if (error) throw error;
      
      showToast("Password updated successfully!", "success");
      setPasswordSuccess(true);
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordSuccess(false);
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      }, 1500);
    } catch (err: any) {
      showToast(err.message || "Failed to update password", "error");
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-dash-canvas text-dash-text font-sans antialiased overflow-hidden selection:bg-dash-green/30 transition-colors duration-200">
      
      {/* Mobile Drawer (backdrop & container) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
          />
          
          {/* Drawer sidebar content */}
          <aside className="relative flex flex-col w-[240px] max-w-xs bg-dash-canvas border-r border-dash-border text-dash-text h-full p-4 z-50">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#EA6639"/>
                  <path d="M45 40 L60 40 L60 60 A20 20 0 0 0 80 80 L80 80 L60 80 A20 20 0 0 1 40 60 L40 45 Z" fill="white"/>
                </svg>
                <span className="text-dash-text truncate text-section">Ever Hotel Panel</span>
              </Link>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col space-y-2 w-full mb-6 dashboard-interactive">
              {[
                { tab: "dashboard", label: "Dashboard", icon: Home },
                { tab: "inbox", label: "Live Inbox", icon: MessageSquare },
                { tab: "crm", label: "Leads & CRM", icon: Users },
                { tab: "bookings", label: "Bookings", icon: Calendar },
                { tab: "orders", label: "Dining & Orders", icon: Utensils },
                { tab: "services", label: "Guest Services", icon: BellRing },
                { tab: "knowledge_base", label: "Knowledge Base", icon: BookOpen }
              ].filter(item => isTabAllowed(item.tab)).map((item) => (
                <button
                  key={item.tab}
                  onClick={() => {
                    setActiveTab(item.tab as any);
                    setIsMobileSidebarOpen(false);
                  }}
                  className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                    activeTab === item.tab
                      ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold"
                      : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                  }`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span className="text-body font-medium truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="mb-2 mt-4 dashboard-interactive">
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Insights</span></div>
              <div className="space-y-2">
                {[
                  { tab: "analytics", label: "Analytics & Reports", icon: BarChart3 },
                  { tab: "feedback", label: "Feedback & Reviews", icon: Star }
                ].filter(item => isTabAllowed(item.tab)).map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                      activeTab === item.tab
                        ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold"
                        : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-body font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 mt-4 dashboard-interactive">
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Configuration</span></div>
              <div className="space-y-2">
                {[
                  { tab: "agent_settings", label: "Agent Settings", icon: Settings },
                  { tab: "channels", label: "Channels", icon: Blocks },
                  { tab: "staff", label: "Staff", icon: UserCheck },
                  { tab: "compliance", label: "Compliance & Privacy", icon: ShieldCheck },
                  { tab: "billing", label: "Billing & Subscription", icon: CreditCard }
                ].filter(item => isTabAllowed(item.tab)).map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                      activeTab === item.tab
                        ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold"
                        : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-body font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 mt-4 dashboard-interactive">
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Support</span></div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsSupportModalOpen(true);
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full rounded-md flex items-center gap-3 h-[42px] px-3 py-2 transition-colors dashboard-btn compact-touch-target text-dash-text-sec hover:bg-dash-surface-hover/50 hover:text-dash-text"
                >
                  <Headphones className="w-5 h-5 shrink-0 text-[#EA6639]" />
                  <span className="text-body font-medium truncate">Support Desk</span>
                </button>
              </div>
            </div>

            {/* Mobile Footer: Theme, Shortcuts & Command Palette */}
            <div className="mt-auto pt-4 border-t border-dash-border space-y-2 shrink-0">
              <div className="flex items-center justify-between px-1 py-1">
                <span className="text-xs text-dash-text-sec font-medium">Appearance</span>
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="px-2.5 py-1 text-xs rounded-md bg-dash-surface border border-dash-border flex items-center gap-1.5 text-dash-text hover:bg-dash-surface-hover transition-colors"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                  <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsCommandPaletteOpen(true);
                  }}
                  className="flex-1 py-1.5 px-2 bg-dash-surface border border-dash-border rounded-lg text-xs text-dash-text-sec hover:text-dash-text flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Commands</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    setIsShortcutsHelpOpen(true);
                  }}
                  className="py-1.5 px-2.5 bg-dash-surface border border-dash-border rounded-lg text-xs text-dash-text-sec hover:text-dash-text flex items-center justify-center gap-1 transition-colors"
                  title="Keyboard shortcuts"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                  <span>?</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Left Sidebar Menu */}
      <aside 
        className={`${isSidebarExpanded ? "w-[240px]" : "w-[56px]"} bg-dash-canvas border-r border-dash-border flex flex-col justify-between shrink-0 z-20 transition-all duration-300 hidden md:flex`}
      >
        <div className="flex flex-col h-full overflow-y-auto hide-scrollbar py-4">
          <Link to="/" className={`flex items-center gap-3 px-4 mb-6 hover:opacity-90 cursor-pointer ${isSidebarExpanded ? "justify-start" : "justify-center"}`}>
            <svg className="shrink-0" width="28" height="28" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#EA6639"/>
              <path d="M45 40 L60 40 L60 60 A20 20 0 0 0 80 80 L80 80 L60 80 A20 20 0 0 1 40 60 L40 45 Z" fill="white"/>
            </svg>
            {isSidebarExpanded && <span className="text-dash-text truncate text-section">Ever Hotel Panel</span>}
          </Link>
          
          <div className="flex flex-col space-y-2 w-full px-3 mb-6 dashboard-interactive">
            {[
              { tab: "dashboard", label: "Dashboard", icon: Home },
              { tab: "inbox", label: "Live Inbox", icon: MessageSquare },
              { tab: "crm", label: "Leads & CRM", icon: Users },
              { tab: "bookings", label: "Bookings", icon: Calendar },
              { tab: "orders", label: "Dining & Orders", icon: Utensils },
              { tab: "services", label: "Guest Services", icon: BellRing },
              { tab: "knowledge_base", label: "Knowledge Base", icon: BookOpen }
            ].filter(item => isTabAllowed(item.tab)).map((item) => (
              <button 
                key={item.tab}
                onClick={() => setActiveTab(item.tab as any)}
                title={item.label}
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === item.tab 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">{item.label}</span>}
              </button>
            ))}
          </div>

          <div className="px-3 mb-2 mt-4 dashboard-interactive">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Insights</span></div>}
            <div className="space-y-2">
              {[
                { tab: "analytics", label: "Analytics & Reports", icon: BarChart3 },
                { tab: "feedback", label: "Feedback & Reviews", icon: Star }
              ].filter(item => isTabAllowed(item.tab)).map((item) => (
                <button 
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as any)}
                  title={item.label}
                  className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                    activeTab === item.tab 
                      ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                      : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                  } ${!isSidebarExpanded && "justify-center"}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarExpanded && <span className="text-body font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 mb-2 mt-4 dashboard-interactive">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Configuration</span></div>}
            <div className="space-y-2">
              {[
                { tab: "agent_settings", label: "Agent Settings", icon: Settings },
                { tab: "channels", label: "Channels", icon: Blocks },
                { tab: "staff", label: "Staff", icon: UserCheck },
                { tab: "compliance", label: "Compliance & Privacy", icon: ShieldCheck },
                { tab: "billing", label: "Billing & Subscription", icon: CreditCard }
              ].filter(item => isTabAllowed(item.tab)).map((item) => (
                <button 
                  key={item.tab}
                  onClick={() => setActiveTab(item.tab as any)}
                  title={item.label}
                  className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                    activeTab === item.tab 
                      ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                      : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                  } ${!isSidebarExpanded && "justify-center"}`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {isSidebarExpanded && <span className="text-body font-medium truncate">{item.label}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 mb-2 mt-auto">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-muted uppercase tracking-wider">Support</span></div>}
            <button 
              onClick={() => setIsSupportModalOpen(true)}
              title="Support & Engineering Desk"
              className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text ${!isSidebarExpanded && "justify-center"}`}
            >
              <Headphones className="w-5 h-5 shrink-0 text-[#EA6639]" />
              {isSidebarExpanded && <span className="text-body font-medium truncate">Support Desk</span>}
            </button>
          </div>
        </div>
        
        {/* Sidebar Toggle Control */}
        <div className="p-3 border-t border-dash-border">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`w-full rounded-md flex items-center gap-3 h-[36px] px-2 py-1.5 text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text transition-colors ${!isSidebarExpanded && "justify-center"}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarExpanded ? <PanelLeftClose className="w-4 h-4 shrink-0" /> : <PanelLeftOpen className="w-4 h-4 shrink-0" />}
            {isSidebarExpanded && <span className="text-xs font-medium truncate">Collapse sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-h-0 min-w-0 bg-dash-surface transition-colors duration-200">
        
        {/* Top Header Navbar */}
        <header className="h-[50px] border-b border-dash-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-dash-surface transition-colors duration-200">
          <div className="flex items-center gap-3 text-xs max-w-[60%] overflow-x-auto hide-scrollbar whitespace-nowrap">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden flex items-center justify-center p-1 rounded-md text-dash-text-muted hover:bg-dash-surface-hover transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <span className="font-semibold text-dash-text flex items-center gap-1.5">
              {propertyProfile.propertyName || (isSandbox ? "Dero Apartments & Resorts" : "My Property")}
            </span>
            {isSandbox && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 tracking-wide uppercase">
                Sandbox Demo
              </span>
            )}
            <span className="text-dash-text-sec">/</span>
            <span className="flex items-center gap-1.5 text-dash-text-sec hover:bg-dash-surface-hover px-2 py-1 rounded cursor-pointer transition-colors">
              User Panel
              <ChevronDown className="w-3 h-3 text-dash-text-sec" />
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
            {/* Quick Command Palette Launcher */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden sm:flex items-center gap-2 px-2.5 py-1 text-xs text-dash-text-muted hover:text-dash-text bg-dash-canvas hover:bg-dash-surface-hover border border-dash-border hover:border-[#EA6639]/40 rounded-lg transition-all shadow-2xs group cursor-pointer"
              title="Search or jump to tab (Ctrl+K / ⌘K)"
            >
              <Search className="w-3.5 h-3.5 text-dash-text-muted group-hover:text-[#EA6639] transition-colors" />
              <span className="text-[11px] font-normal text-dash-text-sec">Search or jump to...</span>
              <kbd className="ml-1 px-1.5 py-0.5 rounded text-[10px] font-mono bg-dash-surface border border-dash-border text-dash-text-muted shadow-2xs">
                {typeof window !== "undefined" && navigator.platform?.toUpperCase().includes("MAC") ? "⌘K" : "Ctrl+K"}
              </kbd>
            </button>

            {/* Mobile Quick Search Button */}
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="sm:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec hover:text-dash-text transition-colors"
              title="Quick Search (Ctrl+K)"
            >
              <Search className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              {/* Notification Centre Bell */}
              <button 
                onClick={() => setIsNotificationDrawerOpen(true)}
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec hover:text-dash-text transition-colors relative"
                title="Notification Centre"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#EA6639] ring-2 ring-dash-surface animate-pulse" />
                )}
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec hover:text-dash-text transition-colors" 
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative ml-1" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-dash-surface-raised border border-dash-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#EA6639] relative" 
                  title="Profile"
                >
                  <div className="w-full h-full bg-[#EA6639]/10 text-[#EA6639] opacity-95 flex items-center justify-center text-[11px] font-bold uppercase">
                    {propertyProfile.fullName ? propertyProfile.fullName.charAt(0) : "U"}
                  </div>
                  <span 
                    className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-dash-surface ${
                      isOnline ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-zinc-400"
                    }`}
                    title={isOnline ? "Online Now" : "Offline"}
                  />
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-60 rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 bg-dash-surface border border-dash-border overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-3 border-b border-dash-border-hairline bg-dash-surface">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="text-xs font-semibold text-dash-text truncate">{propertyProfile.fullName || "User"}</p>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${
                          isOnline ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                          {isOnline ? "Online" : "Offline"}
                        </span>
                      </div>
                      <p className="text-xs text-dash-text-sec truncate">{propertyProfile.email}</p>
                      {lastLogin && (
                        <p className="text-[10px] text-dash-text-muted mt-1.5 truncate flex items-center gap-1">
                          <span className="opacity-70">Last login:</span>
                          <span className="font-mono text-dash-text-sec">
                            {new Date(lastLogin).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => {
                          setTempProfile({ 
                            fullName: propertyProfile.fullName, 
                            email: propertyProfile.email, 
                            role: propertyProfile.role 
                          });
                          setIsProfileModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2 transition-colors"
                      >
                        <User className="w-4 h-4 text-dash-text-sec" /> Profile
                      </button>
                      <button 
                        onClick={() => {
                          setTempProperty({
                            propertyName: propertyProfile.propertyName,
                            propertyType: propertyProfile.propertyType,
                            pms: propertyProfile.pms,
                            businessAddress: propertyProfile.businessAddress,
                            mobileNumber: propertyProfile.mobileNumber
                          });
                          setIsPropertyModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2 transition-colors"
                      >
                        <Building className="w-4 h-4 text-dash-text-sec" /> Property Settings
                      </button>
                      <button 
                        onClick={() => {
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setIsPasswordModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2 transition-colors"
                      >
                        <Lock className="w-4 h-4 text-dash-text-sec" /> Change Password
                      </button>
                      {(!hotelData?.setup_complete && 
                        localStorage.getItem(`ever_setup_complete_${hotelData?.id}`) !== "true" &&
                        (!user?.id || localStorage.getItem(`ever_setup_complete_${user.id}`) !== "true") &&
                        localStorage.getItem("ever_setup_complete_default") !== "true") && (
                        <button 
                          onClick={() => {
                            setIsSetupWizardOpen(true);
                            setIsProfileOpen(false);
                          }}
                          className="w-full text-left px-4 py-1.5 text-xs text-[#EA6639] hover:bg-[#EA6639]/10 flex items-center gap-2 font-medium transition-colors"
                        >
                          <Sparkles className="w-4 h-4 text-[#EA6639]" /> First-Time Setup Wizard
                        </button>
                      )}
                    </div>
                    <div className="border-t border-dash-border-hairline py-1">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/login");
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                      >
                        <LogOut className="w-4 h-4" /> Log out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto relative min-h-0 bg-dash-canvas/50">
          {activeTab === "dashboard" && <DashboardTab onNavigate={handleNavigate as any} />}
          {activeTab === "inbox" && <InboxTab initialSessionId={inboxTargetId} onNavigate={handleNavigate as any} />}
          {activeTab === "crm" && <CRMTab onNavigate={handleNavigate as any} propertyName={propertyProfile.propertyName} role={propertyProfile.role} />}
          {activeTab === "knowledge_base" && <KnowledgeBaseTab role={propertyProfile.role} />}
          {activeTab === "agent_settings" && <AgentSettingsTab role={propertyProfile.role} />}
          {activeTab === "channels" && <ChannelsTab role={propertyProfile.role} />}
          {activeTab === "staff" && <StaffTab role={propertyProfile.role} />}
          {activeTab === "bookings" && (
            <BookingsTab 
              role={propertyProfile.role} 
              propertyName={propertyProfile.propertyName} 
              onNavigate={handleNavigate as any} 
            />
          )}
          {activeTab === "orders" && (
            <OrdersTab 
              role={propertyProfile.role} 
              propertyName={propertyProfile.propertyName} 
              onNavigate={handleNavigate as any} 
            />
          )}
          {activeTab === "services" && (
            <ServicesTab 
              role={propertyProfile.role} 
              propertyName={propertyProfile.propertyName} 
              onNavigate={handleNavigate as any} 
            />
          )}
          {activeTab === "analytics" && <AnalyticsTab onNavigate={handleNavigate as any} />}
          {activeTab === "feedback" && <FeedbackTab onNavigate={handleNavigate as any} />}
          {activeTab === "compliance" && <ComplianceTab />}
          {activeTab === "billing" && <BillingTab />}
        </div>
      </main>

      {/* Modals for Profile / Property Settings */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] bg-dash-surface/40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-md rounded-lg shadow-xl border border-dash-border overflow-hidden">
            <div className="px-6 py-4 border-b border-dash-border-hairline flex items-center justify-between">
              <h3 className="font-semibold text-dash-text">Edit Profile</h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-dash-text-muted hover:text-dash-text-sec transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSaveProfileModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Full Name</label>
                <input required type="text" value={tempProfile.fullName} onChange={(e) => setTempProfile({...tempProfile, fullName: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Email Address</label>
                <input required type="email" value={tempProfile.email} onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Role</label>
                <select value={tempProfile.role} onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                  <option value="hotel_manager">Hotel Manager</option>
                  <option value="hotel_receptionist">Hotel Receptionist</option>
                  <option value="hotel_readonly">Hotel Read-Only</option>
                </select>
              </div>

              {/* Real-time Session & Presence Telemetry */}
              <div className="p-3 rounded-lg bg-dash-canvas border border-dash-border space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-dash-text-muted">Presence Status:</span>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold ${
                    isOnline 
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                      : "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-500 animate-pulse" : "bg-zinc-400"}`} />
                    {isOnline ? "Active Now (Online)" : "Offline"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dash-text-muted">Last Authenticated Login:</span>
                  <span className="font-mono text-[11px] text-dash-text">
                    {lastLogin ? new Date(lastLogin).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Active Session"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-dash-text-muted">Session Timeout:</span>
                  <span className="text-[11px] text-dash-text-sec">30 mins idle protection</span>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors shadow-xs">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPropertyModalOpen && (
        <div className="fixed inset-0 z-[100] bg-dash-surface/40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-md rounded-lg shadow-xl border border-dash-border overflow-hidden">
            <div className="px-6 py-4 border-b border-dash-border-hairline flex items-center justify-between">
              <h3 className="font-semibold text-dash-text">Property Settings</h3>
              <button onClick={() => setIsPropertyModalOpen(false)} className="text-dash-text-muted hover:text-dash-text-sec transition-colors">&times;</button>
            </div>
            <form onSubmit={handleSavePropertyModal} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Property Name</label>
                <input required type="text" value={tempProperty.propertyName} onChange={(e) => setTempProperty({...tempProperty, propertyName: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Property Type</label>
                  <select value={tempProperty.propertyType} onChange={(e) => setTempProperty({...tempProperty, propertyType: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Aparthotel">Aparthotel</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Primary PMS</label>
                  <select value={tempProperty.pms} onChange={(e) => setTempProperty({...tempProperty, pms: e.target.value})} className="w-full px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                    <option value="cloudbeds">Cloudbeds</option>
                    <option value="mews">Mews</option>
                    <option value="opera">Opera (Oracle)</option>
                    <option value="apaleo">Apaleo</option>
                    <option value="guesty">Guesty</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-between gap-2 border-t border-dash-border-hairline mt-4 pt-4">
                {isSandbox && (
                  <button 
                    type="button" 
                    onClick={async () => {
                      if (window.confirm("Are you sure you want to delete all current data and regenerate fresh demo data?")) {
                        regenerate();
                        showToast("Sandbox data regenerated successfully!", "success");
                        setIsPropertyModalOpen(false);
                      }
                    }}
                    className="px-4 py-1.5 bg-red-600/10 text-red-600 rounded-md text-xs font-medium hover:bg-red-600/20 transition-colors"
                  >
                    Regenerate Demo Data
                  </button>
                )}
                <div className="flex gap-2">
                  <button type="button" onClick={() => setIsPropertyModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors shadow-xs">Save Settings</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-[100] bg-dash-surface/40 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-md rounded-lg shadow-xl border border-dash-border overflow-hidden">
            <div className="px-6 py-4 border-b border-dash-border-hairline flex items-center justify-between">
              <h3 className="font-semibold text-dash-text">Change Password</h3>
              <button onClick={() => setIsPasswordModalOpen(false)} className="text-dash-text-muted hover:text-dash-text-sec transition-colors">&times;</button>
            </div>
            {passwordSuccess ? (
              <div className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-dash-text text-lg">Password Updated!</h4>
                <p className="text-sm text-dash-text-sec">Your password has been successfully changed.</p>
              </div>
            ) : (
              <form onSubmit={handleSavePasswordModal} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Current Password</label>
                  <input required type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">New Password</label>
                  <input required type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Confirm New Password</label>
                  <input required type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
                </div>
                <div className="pt-2 flex justify-end gap-2 border-t border-dash-border-hairline mt-4 pt-4">
                  <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors">Update Password</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Dedicated 4-Step First-Time Setup Wizard */}
      <SetupWizardModal
        isOpen={isSetupWizardOpen}
        onClose={() => setIsSetupWizardOpen(false)}
        hotelData={hotelData}
        onComplete={() => {
          setHotelData(prev => prev ? { ...prev, setup_complete: true } : prev);
          setIsSetupWizardOpen(false);
          loadProfile();
          showToast("Property onboarding complete! Your AI agent is ready.", "success");
        }}
      />
      {/* Global Notification Centre Slide-over Drawer */}
      <NotificationDrawer
        isOpen={isNotificationDrawerOpen}
        onClose={() => setIsNotificationDrawerOpen(false)}
        onNavigate={handleNavigate}
        onUnreadCountChange={setUnreadNotifCount}
      />
      {/* Support & Engineering Desk Ticket Modal */}
      <SupportTicketModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
      />

      {/* Universal Command Palette & Tab Switcher (Ctrl+K / ⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tabKey) => {
          setActiveTab(tabKey as any);
        }}
        onOpenSupport={() => setIsSupportModalOpen(true)}
        onOpenNotifications={() => setIsNotificationDrawerOpen(true)}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onToggleSandbox={() => {
          localStorage.setItem("ever_sandbox_override", isSandbox ? "false" : "true");
          window.location.reload();
        }}
        onOpenSetupWizard={() => setIsSetupWizardOpen(true)}
        onOpenShortcutsHelp={() => setIsShortcutsHelpOpen(true)}
        currentTheme={theme}
        isSandbox={isSandbox}
        allowedTabs={isTabAllowed}
      />

      {/* Global Keyboard Shortcuts Cheatsheet Modal */}
      <ShortcutsHelpModal
        isOpen={isShortcutsHelpOpen}
        onClose={() => setIsShortcutsHelpOpen(false)}
      />
    </div>
  );
}
