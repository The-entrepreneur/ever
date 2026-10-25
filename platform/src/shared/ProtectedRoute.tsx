import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  requirePaidSubscription?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  requirePaidSubscription = false
}) => {
  const { user, role, subscriptionStatus, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  // Not logged in – agency routes get their own login portal
  if (!user) {
    if (location.pathname.startsWith("/agency")) {
      return <Navigate to="/agency/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If attempting to access Agency Command Center without agency privileges, show explicit barrier
    if (location.pathname.startsWith("/agency")) {
      return (
        <div className="min-h-screen bg-dash-canvas flex items-center justify-center p-4 font-sans text-dash-text">
          <div className="max-w-md w-full bg-dash-surface border border-dash-border rounded-2xl shadow-xl p-6 sm:p-8 text-center space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-[#EA6639]/10 text-[#EA6639] flex items-center justify-center mx-auto mb-2 border border-[#EA6639]/20">
              <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M12 8v4"/>
                <path d="M12 16h.01"/>
              </svg>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-dash-text tracking-tight">Agency Command Center</h2>
              <p className="text-xs text-[#EA6639] font-semibold uppercase tracking-wider mt-0.5">Access Restricted</p>
            </div>

            <p className="text-xs text-dash-text-sec leading-relaxed">
              You are currently signed in as <strong className="text-dash-text font-mono">{user.email}</strong> (<span className="capitalize">{role.replace('_', ' ')}</span>). This portal requires Agency Administrator or Super Admin credentials.
            </p>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={async () => {
                  try {
                    const { supabase } = await import("../lib/supabase");
                    await supabase.auth.signOut();
                  } catch (e) {
                    console.warn(e);
                  }
                  window.location.href = "/agency/login";
                }}
                className="w-full py-2.5 px-4 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm cursor-pointer"
              >
                Sign In with Agency Account
              </button>
              
              <button
                onClick={() => window.location.href = "/console"}
                className="w-full py-2.5 px-4 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Return to Hotel Console
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (role === "super_admin" || role === "agency_staff") {
      return <Navigate to="/agency" replace />;
    }
    return <Navigate to="/console" replace />;
  }

  // Subscription check (Trial flow)
  // If the route requires a paid subscription, and they are on trial/unsubscribed,
  // redirect them to the billing/settings page
  if (requirePaidSubscription && subscriptionStatus === "trial") {
    // We allow them to go to /console/settings to pay, so we don't redirect if they are already there
    if (!location.pathname.startsWith("/console/settings")) {
      return <Navigate to="/console/settings" replace />;
    }
  }

  return <>{children}</>;
};
