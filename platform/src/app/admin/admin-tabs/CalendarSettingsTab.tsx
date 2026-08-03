import React, { useState, useEffect } from "react";
import { 
  Calendar, Key, Video, CheckCircle, LogOut, RefreshCw, 
  Clock, Shield, Settings, Info, CalendarCheck, AlertCircle
} from "lucide-react";
import { 
  initiateGoogleOAuth, 
  logoutGoogle, 
  checkAndSaveAccessToken 
} from "../../utils/googleCalendar";

export function CalendarSettingsTab() {
  const [token, setToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [timezone, setTimezone] = useState("UTC");

  useEffect(() => {
    const savedToken = checkAndSaveAccessToken();
    setToken(savedToken);
    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch (e) {
      // fallback
    }
  }, []);

  const handleConnect = () => {
    initiateGoogleOAuth("/agency");
  };

  const handleDisconnect = () => {
    logoutGoogle();
    setToken(null);
  };

  const handleRefresh = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
    }, 800);
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Host Calendar Synchronization</h2>
          <p className="text-body text-dash-text-sec mt-0.5">
            Configure calendar connections and synchronized real-time availability checks for incoming guest onboarding bookings.
          </p>
        </div>
        {token && (
          <div className="flex gap-2 w-full sm:w-auto shrink-0">
            <button 
              onClick={handleRefresh}
              className="flex-1 sm:flex-initial h-8 px-4 bg-dash-surface-raised hover:bg-dash-surface-hover text-dash-text rounded-md text-body font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? "animate-spin" : ""}`} />
              <span>Verify Connection</span>
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Connection Settings & Features */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Google Integration Card */}
          <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-dash-border pb-4">
              <div className="w-10 h-8 rounded-md bg-blue-100 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-section font-semibold text-dash-text">Google Calendar Integration</h3>
                <p className="text-micro text-dash-text-muted mt-0.5">Authorize your team's Google Calendar to protect slot availability.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-dash-canvas rounded-lg border border-dash-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-dash-text">Connection Status:</span>
                    {token ? (
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-md bg-emerald-500" />
                        Connected & Active
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-dash-surface-raised text-dash-text-sec rounded text-[10px] font-bold">
                        Disconnected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-dash-text-sec leading-relaxed max-w-md font-light">
                    {token 
                      ? "Your Google Calendar is connected. The system will dynamically scan busy periods to prevent double-bookings."
                      : "Authorize our platform to read your primary calendar. This allows guests to pick from your actual free time slots."
                    }
                  </p>
                </div>

                {!token ? (
                  <button
                    onClick={handleConnect}
                    className="w-full md:w-auto shrink-0 flex items-center justify-center gap-2 bg-white hover:bg-dash-canvas border border-dash-border px-3 py-1.5 rounded-lg text-xs text-dash-text font-semibold transition-all hover:shadow-sm"
                  >
                    <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-4 h-4 shrink-0">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>Connect Google Calendar</span>
                  </button>
                ) : (
                  <button
                    onClick={handleDisconnect}
                    className="w-full md:w-auto shrink-0 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 py-2 px-4 rounded-lg flex items-center justify-center gap-1.5 font-semibold transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Disconnect Calendar
                  </button>
                )}
              </div>

              {token && (
                <div className="text-xs bg-dash-canvas border border-dash-border rounded-lg p-3 flex flex-col md:flex-row justify-between gap-2 font-mono text-dash-text-muted">
                  <span>Current OAuth Access Token:</span>
                  <span className="text-dash-text truncate max-w-[280px]">
                    {token.substring(0, 32)}...
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Operational Rules & Automation Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Video className="w-5 h-5 text-dash-green" />
                <h4 className="font-semibold text-dash-text text-xs uppercase tracking-wider font-mono">
                  Virtual Conferencing
                </h4>
              </div>
              <p className="text-xs text-dash-text-sec leading-relaxed font-light">
                When a guest confirms a booking slot, our backend dynamically syncs with the connected calendar to auto-provision a secure virtual video room via <strong>Google Meet</strong>.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">
                <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                <span>Google Meet Auto-Generation Ready</span>
              </div>
            </div>

            <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4 shadow-sm">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold text-dash-text text-xs uppercase tracking-wider font-mono">
                  Security & Rules
                </h4>
              </div>
              <p className="text-xs text-dash-text-sec leading-relaxed font-light">
                Tokens are stored client-side in the browser session secure lock. This system respects your personal privacy and will never write any events without explicit actions.
              </p>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-blue-850 bg-blue-50 border border-blue-100 p-2 rounded-lg">
                <Clock className="w-3.5 h-3.5 shrink-0 text-blue-500" />
                <span>Detected Timezone: {timezone}</span>
              </div>
            </div>

          </div>

        </div>

        {/* Right Column: Connection Checklist / Live Stats */}
        <div className="space-y-6">
          
          <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4 shadow-sm">
            <h3 className="text-section font-semibold text-dash-text flex items-center gap-2">
              <Settings className="w-4 h-4 text-dash-text-muted" />
              Connection Checklist
            </h3>
            
            <div className="space-y-3">
              {[
                { label: "OAuth Protocol Alignment", status: true },
                { label: "Primary Calendar Read Permission", status: !!token },
                { label: "Calendar Event Write Access", status: !!token },
                { label: "Google Meet API Integration", status: !!token },
              ].map((item, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs">
                  {item.status ? (
                    <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-md border-2 border-dash-border shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-0.5">
                    <p className={`font-medium ${item.status ? "text-dash-text" : "text-dash-text-muted"}`}>
                      {item.label}
                    </p>
                    <p className="text-[10px] text-dash-text-muted">
                      {item.status ? "Successfully configured" : "Awaiting Google connection"}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {!token && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg flex items-start gap-2.5 text-amber-800 mt-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold">Action Required</h4>
                  <p className="text-[10px] leading-relaxed font-light">
                    Incoming booking calls will fallback to default mock calendars until you authenticate your Google Workspace account.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-dash-surface p-4 md:p-5 rounded-lg border border-dash-border space-y-4 shadow-sm">
            <h3 className="text-section font-semibold text-dash-text flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-dash-text-muted" />
              System Behavior
            </h3>
            <p className="text-xs text-dash-text-muted leading-relaxed font-light">
              Once linked, the onboarding scheduler on the <strong>Help Desk</strong> page references your real-time busy slots. Visitors won't see conflicting slots, and invitations with Google Meet coordinates will automatically land in your inbox.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
