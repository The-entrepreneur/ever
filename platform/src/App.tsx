/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "./shared/ThemeProvider";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
import { SandboxDataProvider } from "./context/SandboxDataContext";
import { ToastProvider } from "./shared/ToastContext";
import { ProtectedRoute } from "./shared/ProtectedRoute";
import { Navbar } from "./app/marketing/Navbar";
import { Hero } from "./app/marketing/Hero";
import { ProblemMatrix } from "./app/marketing/ProblemMatrix";
import { PerfectSync } from "./app/marketing/PerfectSync";
import { SolutionLayer } from "./app/marketing/SolutionLayer";
import { MergedInfrastructure } from "./app/marketing/MergedInfrastructure";
import { OperationalTransition } from "./app/marketing/OperationalTransition";
import { Pricing } from "./app/marketing/Pricing";
import { ROISection } from "./app/marketing/ROISection";
import { TrustFAQ } from "./app/marketing/TrustFAQ";
import { CallToAction } from "./app/marketing/CallToAction";
import { Footer } from "./app/marketing/Footer";
import { RevenueIntelligence } from "./app/marketing/RevenueIntelligence";
import { Integrations } from "./app/marketing/Integrations";
import { About } from "./app/marketing/About";
import { Terms } from "./app/marketing/Terms";
import { Privacy } from "./app/marketing/Privacy";
import { HelpDesk } from "./app/marketing/HelpDesk";
import { StatusPage } from "./app/marketing/StatusPage";
import { LoginPage } from "./app/auth/LoginPage";
import { ActivationPage } from "./app/auth/ActivationPage";
import { SupportGuide } from "./app/marketing/SupportGuide";
import { GuestConcierge } from "./app/marketing/GuestConcierge";
import { CommerceAgent } from "./app/marketing/CommerceAgent";
import { UseCases } from "./app/marketing/UseCases";
import { ComprehensivePricing } from "./app/marketing/ComprehensivePricing";
import { Console } from "./app/hub/Console";
import { AssistantWidget } from "./app/marketing/AssistantWidget";
import { InteractiveDemo } from "./app/marketing/InteractiveDemo";
import { AdminConsole } from "./app/admin/AdminConsole";
import { AgencyLoginPage } from "./app/admin/AgencyLoginPage";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function PageTitle() {
  const location = useLocation();
  useEffect(() => {
    const routeTitles: Record<string, string> = {
      "/": "Home | Ever",
      "/guest-concierge": "Guest Concierge | Ever",
      "/commerce-agent": "Commerce Agent | Ever",
      "/reporting": "Revenue Intelligence | Ever",
      "/integrations": "Integrations | Ever",
      "/use-cases": "Use Cases | Ever",
      "/pricing": "Pricing | Ever",
      "/about": "About | Ever",
      "/terms": "Terms of Service | Ever",
      "/privacy": "Privacy Policy | Ever",
      "/help-desk": "Help Desk | Ever",
      "/status": "System Status | Ever",
      "/signup": "Sign Up | Ever",
      "/activate": "Account Activation | Ever",
      "/login": "Login | Ever",
      "/console": "Console | Ever",
      "/agency": "Agency Command | Ever",
      "/agency/login": "Agency Login | Ever",
      "/admin": "Agency Command | Ever",
      "/demo": "Interactive Demo | Ever",
      "/support-guide": "Support Guide | Ever"
    };

    const path = location.pathname.replace(/\/$/, "") || "/";
    document.title = routeTitles[path] || "Ever";
  }, [location]);
  
  return null;
}

function HomePage() {
  return (
    <main>
      <Hero />
      <ProblemMatrix />
      <PerfectSync />
      <SolutionLayer />
      <MergedInfrastructure />
      <OperationalTransition />
      <Pricing />
      <ROISection />
      <TrustFAQ />
      <CallToAction />
    </main>
  );
}

import { NotFoundPage } from "./app/marketing/NotFoundPage";

function AppLayout() {
  const location = useLocation();
  const hideNavAndFooter = ["/status", "/login", "/signup", "/activate", "/support-guide", "/console", "/agency", "/agency/login", "/admin"].includes(location.pathname.replace(/\/$/, ""));
  const { theme } = useTheme();

  // Force light mode on marketing pages
  useEffect(() => {
    const root = window.document.documentElement;
    const isAppRoute = ["/console", "/agency", "/agency/login", "/admin"].includes(location.pathname.replace(/\/$/, ""));
    
    if (!isAppRoute) {
      root.classList.remove("dark");
      root.classList.add("light");
      root.style.colorScheme = "light";
    } else {
      // Restore theme on app routes
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
      } else {
        root.classList.add(theme);
        root.style.colorScheme = theme;
      }
    }
  }, [location.pathname, theme]);

  return (
    <div className="min-h-screen bg-[#F9F6F0] dark:bg-[#121212] font-sans selection:bg-[#EA6639]/30 text-zinc-900 dark:text-zinc-300 antialiased overflow-x-hidden transition-colors duration-200">
      {!hideNavAndFooter && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guest-concierge" element={<GuestConcierge />} />
        <Route path="/commerce-agent" element={<CommerceAgent />} />
        <Route path="/reporting" element={<RevenueIntelligence />} />
        <Route path="/integrations" element={<Integrations />} />
        <Route path="/use-cases" element={<UseCases />} />
        <Route path="/pricing" element={<ComprehensivePricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/help-desk" element={<HelpDesk />} />
        <Route path="/status" element={<StatusPage />} />
        <Route path="/signup" element={<Navigate to="/help-desk" replace />} />
        <Route path="/activate" element={<ActivationPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/console" element={
          <ProtectedRoute allowedRoles={["hotel_manager", "hotel_receptionist", "super_admin", "agency_staff"]}>
            <Console />
          </ProtectedRoute>
        } />
        <Route path="/agency/login" element={<AgencyLoginPage />} />
        <Route path="/agency" element={
          <ProtectedRoute allowedRoles={["super_admin", "agency_staff"]}>
            <AdminConsole />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={<Navigate to="/agency" replace />} />
        <Route path="/demo" element={<InteractiveDemo />} />
        <Route path="/support-guide" element={<SupportGuide />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!hideNavAndFooter && <Footer />}
      <AssistantWidget />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="ever-theme">
      <CurrencyProvider>
        <AuthProvider>
          <SandboxDataProvider>
            <ToastProvider>
              <BrowserRouter>
                <ScrollToTop />
                <PageTitle />
                <AppLayout />
              </BrowserRouter>
            </ToastProvider>
          </SandboxDataProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
