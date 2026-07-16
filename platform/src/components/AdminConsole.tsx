import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Users, Server, FileJson, CreditCard, AlertTriangle, ListTree,
  Sun, Moon, LogOut, PanelLeftClose, PanelLeftOpen, Search, Building2, ChevronDown,
  ShieldAlert, Menu, X, HelpCircle, DollarSign, Palette, Blocks, Calendar
} from "lucide-react";
import { useTheme } from "./ThemeProvider";

import { AgencyDashboardTab } from "./admin-tabs/AgencyDashboardTab";
import { ClientManagementTab } from "./admin-tabs/ClientManagementTab";
import { DeploymentMonitorTab } from "./admin-tabs/DeploymentMonitorTab";
import { TemplateManagerTab } from "./admin-tabs/TemplateManagerTab";
import { UsageBillingTab } from "./admin-tabs/UsageBillingTab";
import { SystemHealthTab } from "./admin-tabs/SystemHealthTab";
import { QueueManagementTab } from "./admin-tabs/QueueManagementTab";
import { RevenueTab } from "./admin-tabs/RevenueTab";
import { AgencyComplianceTab } from "./admin-tabs/AgencyComplianceTab";
import { BrandingTab } from "./admin-tabs/BrandingTab";
import { CalendarSettingsTab } from "./admin-tabs/CalendarSettingsTab";
import { checkAndSaveAccessToken } from "../utils/googleCalendar";

const PlaceholderTab = ({ title, description }: { title: string, description: string }) => (
  <div className="p-6 md:p-8 flex flex-col items-center justify-center h-full text-center">
    <div className="w-16 h-16 bg-dash-surface-raised rounded-md flex items-center justify-center mb-4">
      <Blocks className="w-8 h-8 text-dash-text-muted" />
    </div>
    <h2 className="text-section font-bold text-dash-text mb-2">{title}</h2>
    <p className="text-dash-text-sec max-w-md">{description}</p>
  </div>
);

export function AdminConsole() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"dashboard" | "clients" | "deployments" | "templates" | "billing" | "health" | "queue" | "revenue" | "compliance" | "branding" | "calendar">("dashboard");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for returned Google Calendar OAuth token and auto-switch tab if redirected
    const token = checkAndSaveAccessToken();
    if (localStorage.getItem("google_oauth_pending_booking") === "true") {
      localStorage.removeItem("google_oauth_pending_booking");
      setActiveTab("calendar");
    }

    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
          <aside className="relative flex flex-col w-[240px] max-w-xs bg-dash-canvas text-dash-text h-full p-4 z-50 border-r border-dash-border-hairline">
            <div className="flex items-center justify-between mb-6">
              <Link to="/" onClick={() => setIsMobileSidebarOpen(false)} className="flex items-center gap-3">
                <div className="w-7 h-7 bg-[#EA6639]/10 rounded flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4 text-[#EA6639]" />
                </div>
                <span className="text-dash-text truncate tracking-tight text-section">Agency Command</span>
              </Link>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-dash-surface text-dash-text-sec"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col space-y-2 w-full mb-6 dashboard-interactive">
              {[
                { tab: "dashboard", label: "Global Dashboard", icon: LayoutDashboard },
                { tab: "clients", label: "Client Management", icon: Users }
              ].map((item) => (
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
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Infrastructure</span></div>
              <div className="space-y-2">
                {[
                  { tab: "deployments", label: "Deployments", icon: Server },
                  { tab: "templates", label: "Templates", icon: FileJson },
                  { tab: "calendar", label: "Host Calendar", icon: Calendar },
                  { tab: "queue", label: "Task Queue", icon: ListTree }
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                      activeTab === item.tab
                        ? "bg-dash-green text-white"
                        : "text-dash-text-sec hover:bg-dash-surface hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-body font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 mt-4 dashboard-interactive">
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Operations</span></div>
              <div className="space-y-2">
                {[
                  { tab: "billing", label: "Usage & Billing", icon: CreditCard },
                  { tab: "health", label: "System Health", icon: AlertTriangle }
                ].map((item) => (
                  <button
                    key={item.tab}
                    onClick={() => {
                      setActiveTab(item.tab as any);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                      activeTab === item.tab
                        ? "bg-dash-green text-white"
                        : "text-dash-text-sec hover:bg-dash-surface hover:text-white"
                    }`}
                  >
                    <item.icon className="w-5 h-5 shrink-0" />
                    <span className="text-body font-medium truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-2 mt-4 dashboard-interactive">
              <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Support</span></div>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('open-ellie-chat'));
                    setIsMobileSidebarOpen(false);
                  }}
                  className="w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target text-dash-text-sec hover:bg-dash-surface hover:text-dash-text"
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
        className={`${isSidebarExpanded ? "w-[240px]" : "w-[56px]"} bg-dash-canvas text-white border-r border-dash-border-hairline flex flex-col justify-between shrink-0 z-20 transition-all duration-300 hidden md:flex`}
      >
        <div className="flex flex-col h-full overflow-y-auto hide-scrollbar py-4 dashboard-interactive">
          <Link to="/" className={`flex items-center gap-3 px-4 mb-6 hover:opacity-90 cursor-pointer ${isSidebarExpanded ? "justify-start" : "justify-center"}`}>
            <div className="w-7 h-7 bg-[#EA6639]/10 rounded flex items-center justify-center shrink-0">
              <ShieldAlert className="w-4 h-4 text-[#EA6639]" />
            </div>
            {isSidebarExpanded && <span className="text-dash-text truncate tracking-tight text-section">Agency Command</span>}
          </Link>
          
          <div className="flex flex-col space-y-2 w-full px-3 mb-6">
            <button 
              onClick={() => setActiveTab("dashboard")}
              title="Global Dashboard"
              className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                activeTab === "dashboard" 
                  ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                  : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
              } ${!isSidebarExpanded && "justify-center"}`}
            >
              <LayoutDashboard className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="text-body font-medium truncate">Global Dashboard</span>}
            </button>

            <button 
              onClick={() => setActiveTab("clients")}
              title="Client Management"
              className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                activeTab === "clients" 
                  ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                  : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
              } ${!isSidebarExpanded && "justify-center"}`}
            >
              <Users className="w-5 h-5 shrink-0" />
              {isSidebarExpanded && <span className="text-body font-medium truncate">Client Management</span>}
            </button>
          </div>

          <div className="px-3 mb-2 mt-4">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Infrastructure</span></div>}
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("deployments")}
                title="Deployment Monitor"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "deployments" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <Server className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Deployments</span>}
              </button>

              <button 
                onClick={() => setActiveTab("templates")}
                title="Template Manager"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "templates" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <FileJson className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Templates</span>}
              </button>

              <button 
                onClick={() => setActiveTab("calendar")}
                title="Host Calendar Settings"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "calendar" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <Calendar className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Host Calendar</span>}
              </button>

              <button 
                onClick={() => setActiveTab("queue")}
                title="Queue Management"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "queue" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <ListTree className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Task Queue</span>}
              </button>
              <button 
                onClick={() => setActiveTab("health")}
                title="System Health"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "health" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">System Health</span>}
              </button>
            </div>
          </div>

          <div className="px-3 mb-2 mt-4">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Business & Compliance</span></div>}
            <div className="space-y-2">
              <button 
                onClick={() => setActiveTab("billing")}
                title="Usage & Billing"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "billing" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <CreditCard className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Usage & Billing</span>}
              </button>

              <button 
                onClick={() => setActiveTab("revenue")}
                title="Revenue & Commission"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "revenue" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <DollarSign className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Revenue</span>}
              </button>
              
              <button 
                onClick={() => setActiveTab("compliance")}
                title="Agency Compliance Center"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "compliance" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <ShieldAlert className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Compliance Center</span>}
              </button>
              
              <button 
                onClick={() => setActiveTab("branding")}
                title="White-label & Branding"
                className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 transition-colors dashboard-btn compact-touch-target ${
                  activeTab === "branding" 
                    ? "bg-[#EA6639]/10 dark:bg-[#EA6639]/20 text-[#EA6639] font-semibold" 
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                } ${!isSidebarExpanded && "justify-center"}`}
              >
                <Palette className="w-5 h-5 shrink-0" />
                {isSidebarExpanded && <span className="text-body font-medium truncate">Branding</span>}
              </button>
            </div>
          </div>

          <div className="px-3 mb-2 mt-auto">
            {isSidebarExpanded && <div className="px-3 mb-2"><span className="text-micro font-bold text-dash-text-sec uppercase tracking-wider">Support</span></div>}
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
        
        <div className="p-3 border-t border-dash-border">
          <button 
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className={`w-full rounded-md flex items-center gap-3 h-[36px] px-3 py-1.5 text-dash-text-sec hover:bg-dash-surface hover:text-white transition-colors dashboard-btn compact-touch-target ${!isSidebarExpanded && "justify-center"}`}
            title={isSidebarExpanded ? "Collapse Sidebar" : "Expand Sidebar"}
          >
            {isSidebarExpanded ? <PanelLeftClose className="w-5 h-5 shrink-0" /> : <PanelLeftOpen className="w-5 h-5 shrink-0" />}
            {isSidebarExpanded && <span className="text-body font-medium truncate">Collapse sidebar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden min-h-0 min-w-0 bg-dash-surface transition-colors duration-200">
        
        {/* Top Header Navbar */}
        <header className="h-[50px] border-b border-dash-border flex items-center justify-between px-4 md:px-6 shrink-0 bg-dash-surface transition-colors duration-200 dashboard-interactive">
          <div className="flex items-center gap-3 text-body max-w-[60%] overflow-x-auto hide-scrollbar whitespace-nowrap">
            {/* Mobile Sidebar Hamburger Toggle */}
            <button 
              onClick={() => setIsMobileSidebarOpen(true)}
              className="md:hidden flex items-center justify-center p-1 rounded-md text-dash-text-muted hover:bg-dash-surface-hover transition-colors"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <span className="font-semibold text-dash-text flex items-center gap-1.5">
              Ever Hotel Panel
            </span>
            <span className="text-dash-text-sec">/</span>
            <span className="flex items-center gap-1.5 text-dash-text hover:bg-dash-surface-hover px-2 py-1 rounded cursor-pointer transition-colors">
              Admin Panel
              <ChevronDown className="w-4 h-4 text-dash-text-sec" />
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-body shrink-0">
            <div className="flex items-center gap-1.5 ml-1">
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")} 
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-dash-surface-hover text-dash-text-sec hover:text-dash-text transition-colors dashboard-btn compact-touch-target" 
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Profile Dropdown */}
              <div className="relative ml-1" ref={profileRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="w-8 h-8 flex items-center justify-center rounded-md bg-dash-surface border border-dash-border-strong overflow-hidden focus:outline-none focus:ring-2 focus:ring-[#EA6639] dashboard-btn compact-touch-target" 
                  title="Profile"
                >
                  <div className="w-full h-full bg-dash-surface-raised flex items-center justify-center text-micro font-bold text-dash-text uppercase">
                    A
                  </div>
                </button>
                
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-dash-surface border border-dash-border overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-dash-border-hairline bg-dash-canvas">
                      <p className="text-body font-semibold text-dash-text truncate">Agency Admin</p>
                      <p className="text-data text-dash-text-sec truncate">sysadmin@ever.ai</p>
                    </div>
                    <div className="border-t border-dash-border-hairline py-1">
                      <button 
                        onClick={() => {
                          setIsProfileOpen(false);
                          navigate("/login");
                        }}
                        className="w-full text-left px-4 py-1.5 text-body text-red-600 hover:bg-red-50 flex items-center gap-2 dashboard-btn compact-touch-target"
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
        <div className="flex-1 overflow-y-auto relative min-h-0 bg-dash-surface">
          {activeTab === "dashboard" && <AgencyDashboardTab onNavigate={setActiveTab as any} />}
          {activeTab === "clients" && <ClientManagementTab />}
          {activeTab === "deployments" && <DeploymentMonitorTab />}
          {activeTab === "templates" && <TemplateManagerTab />}
          {activeTab === "calendar" && <CalendarSettingsTab />}
          {activeTab === "billing" && <UsageBillingTab />}
          {activeTab === "health" && <SystemHealthTab />}
          {activeTab === "queue" && <QueueManagementTab />}
          {activeTab === "revenue" && <RevenueTab />}
          {activeTab === "compliance" && <AgencyComplianceTab />}
          {activeTab === "branding" && <BrandingTab />}
        </div>
      </main>
    </div>
  );
}
