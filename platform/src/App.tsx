/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ThemeProvider, useTheme } from "./shared/ThemeProvider";
import { CurrencyProvider } from "./context/CurrencyContext";
import { AuthProvider } from "./context/AuthContext";
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
import { SignUpPage } from "./app/auth/SignUpPage";
import { LoginPage } from "./app/auth/LoginPage";
import { SupportGuide } from "./app/marketing/SupportGuide";
import { GuestConcierge } from "./app/marketing/GuestConcierge";
import { CommerceAgent } from "./app/marketing/CommerceAgent";
import { UseCases } from "./app/marketing/UseCases";
import { ComprehensivePricing } from "./app/marketing/ComprehensivePricing";
import { Console } from "./app/hub/Console";
import { AssistantWidget } from "./app/marketing/AssistantWidget";
import { InteractiveDemo } from "./app/marketing/InteractiveDemo";
import { AdminConsole } from "./app/admin/AdminConsole";

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
      "/login": "Login | Ever",
      "/console": "Console | Ever",
      "/agency": "Agency Command | Ever",
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

function UnfinishedPage() {
  const { pathname } = useLocation();
  const pageName = pathname.substring(1).split('-').join(' ').toUpperCase();
  
  return (
    <main className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center bg-[#F9F6F0] dark:bg-[#121212]">
      <div className="text-4xl mb-4">🚧</div>
      <h1 className="text-3xl font-semibold mb-2 text-zinc-900 dark:text-white">{pageName || "PAGE"}</h1>
      <p className="text-zinc-500 dark:text-zinc-400">This page is yet to be edited.</p>
    </main>
  );
}

function AppLayout() {
  const location = useLocation();
  const hideNavAndFooter = ["/status", "/login", "/signup", "/support-guide", "/console", "/agency"].includes(location.pathname.replace(/\/$/, ""));
  const { theme } = useTheme();

  // Force light mode on marketing pages
  useEffect(() => {
    const root = window.document.documentElement;
    const isAppRoute = ["/console", "/agency"].includes(location.pathname.replace(/\/$/, ""));
    
    if (!isAppRoute) {
      root.classList.remove("dark");
      root.classList.add("light");
    } else {
      // Restore theme on app routes
      root.classList.remove("light", "dark");
      if (theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        root.classList.add(systemTheme);
      } else {
        root.classList.add(theme);
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
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/console" element={
          <ProtectedRoute allowedRoles={["hotel_manager", "hotel_receptionist"]}>
            <Console />
          </ProtectedRoute>
        } />
        <Route path="/agency" element={
          <ProtectedRoute allowedRoles={["super_admin", "agency_staff"]}>
            <AdminConsole />
          </ProtectedRoute>
        } />
        <Route path="/demo" element={<InteractiveDemo />} />
        <Route path="/support-guide" element={<SupportGuide />} />
        <Route path="*" element={<UnfinishedPage />} />
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
          <ToastProvider>
            <BrowserRouter>
              <ScrollToTop />
              <PageTitle />
              <AppLayout />
            </BrowserRouter>
          </ToastProvider>
        </AuthProvider>
      </CurrencyProvider>
    </ThemeProvider>
  );
}
