import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  Home, 
  MessageSquare, 
  Users, 
  BookOpen, 
  Settings, 
  Blocks,
  UserCheck,
  Search,
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
  Bell
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

import { DashboardTab } from "./console-tabs/DashboardTab";
import { InboxTab } from "./console-tabs/InboxTab";
import { CRMTab } from "./console-tabs/CRMTab";
import { KnowledgeBaseTab } from "./console-tabs/KnowledgeBaseTab";
import { BotSettingsTab } from "./console-tabs/BotSettingsTab";
import { ChannelsTab } from "./console-tabs/ChannelsTab";
import { StaffTab } from "./console-tabs/StaffTab";
import { BookingsTab } from "./console-tabs/BookingsTab";
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
  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "crm" | "knowledge_base" | "bot_settings" | "channels" | "staff" | "bookings" | "analytics" | "feedback" | "compliance" | "billing">("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Registration data points state (simulated from what we collect)
  const [propertyProfile, setPropertyProfile] = useState({
    mobileNumber: "+1 (555) 382-9102",
    role: "General Manager",
    businessAddress: "742 Evergreen Terrace, Paris, France",
    propertyType: "Resort" as string,
    propertyName: "The Grand Horizon Resort",
    fullName: "Alex Mercer",
    email: "alex@boutiquehotel.com",
    pms: "cloudbeds"
  });

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
      return ["dashboard", "inbox", "crm", "bookings", "knowledge_base", "analytics", "feedback"].includes(tabName);
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

  // Load from localStorage if present (e.g. from sign up page)
  useEffect(() => {
    const saved = localStorage.getItem("ever_signup_form");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPropertyProfile(prev => ({
          ...prev,
          fullName: parsed.fullName || parsed.firstName ? `${parsed.firstName} ${parsed.lastName}` : prev.fullName,
          email: parsed.email || prev.email,
          propertyName: parsed.property || prev.propertyName,
          pms: parsed.pms || prev.pms,
          mobileNumber: parsed.mobileNumber || prev.mobileNumber || "+1 (555) 382-9102",
          role: parsed.role || prev.role || "General Manager",
          businessAddress: parsed.businessAddress || prev.businessAddress || "742 Evergreen Terrace, Paris, France",
          propertyType: parsed.propertyType || prev.propertyType || "Resort"
        }));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

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

  const handleSavePropertyModal = (e: React.FormEvent) => {
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
    localStorage.setItem("ever_signup_form", JSON.stringify(updated));
    setIsPropertyModalOpen(false);
  };

  const handleSavePasswordModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setPasswordSuccess(true);
    setTimeout(() => {
      setIsPasswordModalOpen(false);
      setPasswordSuccess(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    }, 1500);
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
                  { tab: "bot_settings", label: "Bot Settings", icon: Settings },
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
                    window.dispatchEvent(new CustomEvent('open-ellie-chat'));
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target text-dash-text-sec hover:bg-dash-surface-hover/50 hover:text-dash-text"
                >
                  <HelpCircle className="w-5 h-5 shrink-0 text-dash-green" />
                  <span className="text-body font-medium truncate">Chat with Ellie</span>
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
                { tab: "bot_settings", label: "Bot Settings", icon: Settings },
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
              onClick={() => window.dispatchEvent(new CustomEvent('open-ellie-chat'))}
              title="Chat with Ellie"
              className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text ${!isSidebarExpanded && "justify-center"}`}
            >
              <HelpCircle className="w-5 h-5 shrink-0 text-[#EA6639]" />
              {isSidebarExpanded && <span className="text-body font-medium truncate">Chat with Ellie</span>}
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
              {propertyProfile.propertyName}
            </span>
            <span className="text-dash-text-sec">/</span>
            <span className="flex items-center gap-1.5 text-dash-text-sec hover:bg-dash-surface-hover px-2 py-1 rounded cursor-pointer transition-colors">
              User Panel
              <ChevronDown className="w-3 h-3 text-dash-text-sec" />
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs shrink-0">
            <div className="hidden sm:flex items-center gap-2 bg-dash-canvas border border-dash-border hover:border-dash-border rounded px-2.5 py-1 cursor-pointer transition-colors">
              <Search className="w-3.5 h-3.5 text-dash-text-sec" />
              <span className="text-dash-text-sec text-xs mr-2">Search...</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-dash-surface-raised text-dash-text-sec border border-dash-border">Ctrl K</span>
            </div>

            <div className="flex items-center gap-1.5 ml-1">
              <Link to="/help-desk" className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec hover:text-dash-text transition-colors" title="Get Help">
                <HelpCircle className="w-4 h-4" />
              </Link>
              
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
                  className="w-7 h-7 flex items-center justify-center rounded-md bg-dash-surface-raised border border-dash-border overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#EA6639]" 
                  title="Profile"
                >
                  <div className="w-full h-full bg-[#EA6639]/10 text-[#EA6639] opacity-95 flex items-center justify-center text-[11px] font-bold uppercase">
                    {propertyProfile.fullName.charAt(0)}
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-dash-surface border border-dash-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-dash-border-hairline bg-dash-surface">
                      <p className="text-xs font-semibold text-dash-text truncate">{propertyProfile.fullName}</p>
                      <p className="text-xs text-dash-text-sec truncate">{propertyProfile.email}</p>
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
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2"
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
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2"
                      >
                        <Building className="w-4 h-4 text-dash-text-sec" /> Property Settings
                      </button>
                      <button 
                        onClick={() => {
                          setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                          setIsPasswordModalOpen(true);
                          setIsProfileOpen(false);
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-dash-text hover:bg-dash-surface-hover flex items-center gap-2"
                      >
                        <Lock className="w-4 h-4 text-dash-text-sec" /> Change Password
                      </button>
                    </div>
                    <div className="border-t border-dash-border-hairline py-1">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/login");
                        }}
                        className="w-full text-left px-4 py-1.5 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
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
          {activeTab === "dashboard" && <DashboardTab onNavigate={setActiveTab as any} />}
          {activeTab === "inbox" && <InboxTab />}
          {activeTab === "crm" && <CRMTab />}
          {activeTab === "knowledge_base" && <KnowledgeBaseTab role={propertyProfile.role} />}
          {activeTab === "bot_settings" && <BotSettingsTab role={propertyProfile.role} />}
          {activeTab === "channels" && <ChannelsTab role={propertyProfile.role} />}
          {activeTab === "staff" && <StaffTab role={propertyProfile.role} />}
          {activeTab === "bookings" && <BookingsTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
          {activeTab === "feedback" && <FeedbackTab />}
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
                <input required type="text" value={tempProfile.fullName} onChange={(e) => setTempProfile({...tempProfile, fullName: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Email Address</label>
                <input required type="email" value={tempProfile.email} onChange={(e) => setTempProfile({...tempProfile, email: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Role</label>
                <select value={tempProfile.role} onChange={(e) => setTempProfile({...tempProfile, role: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                  <option value="hotel_manager">Hotel Manager</option>
                  <option value="hotel_receptionist">Hotel Receptionist</option>
                  <option value="hotel_readonly">Hotel Read-Only</option>
                </select>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-dash-surface text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-raised transition-colors">Save Changes</button>
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
                <input required type="text" value={tempProperty.propertyName} onChange={(e) => setTempProperty({...tempProperty, propertyName: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Property Type</label>
                  <select value={tempProperty.propertyType} onChange={(e) => setTempProperty({...tempProperty, propertyType: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                    <option value="Hotel">Hotel</option>
                    <option value="Resort">Resort</option>
                    <option value="Aparthotel">Aparthotel</option>
                    <option value="Hostel">Hostel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Primary PMS</label>
                  <select value={tempProperty.pms} onChange={(e) => setTempProperty({...tempProperty, pms: e.target.value})} className="w-full px-3 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text">
                    <option value="cloudbeds">Cloudbeds</option>
                    <option value="mews">Mews</option>
                    <option value="opera">Opera (Oracle)</option>
                    <option value="apaleo">Apaleo</option>
                    <option value="guesty">Guesty</option>
                    <option value="other">Other / Custom</option>
                  </select>
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPropertyModalOpen(false)} className="px-4 py-1.5 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-dash-surface text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-raised transition-colors">Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
