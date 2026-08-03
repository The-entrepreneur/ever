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

  // Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role check
  if (allowedRoles && !allowedRoles.includes(role)) {
    // If they are an agency admin trying to access hub, maybe they want to, 
    // but usually we redirect unauthorized to a safe default page
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
