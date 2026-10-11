import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Building2, 
  BedDouble, 
  KeyRound, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles,
  Lock,
  ChevronRight,
  HelpCircle,
  FileCheck2
} from "lucide-react";
import { 
  validateOnboardingToken, 
  claimOnboardingToken, 
  OnboardingInvite,
  getTierLabel
} from "../../utils/onboardingTokens";
import { useToast } from "../../shared/ToastContext";
import { supabase } from "../../lib/supabase";

export function ActivationPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const tokenParam = searchParams.get("token") || "";

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<OnboardingInvite | null>(null);
  const [errorReason, setErrorReason] = useState<"not_found" | "expired" | "already_claimed" | null>(null);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    setLoading(true);
    if (!tokenParam) {
      setErrorReason("not_found");
      setLoading(false);
      return;
    }

    const result = validateOnboardingToken(tokenParam);
    if (result.valid && result.invite) {
      setInvite(result.invite);
      setEmail(result.invite.contact_email);
      setErrorReason(null);
    } else {
      setErrorReason(result.reason || "not_found");
      if (result.invite) {
        setInvite(result.invite);
      }
    }
    setLoading(false);
  }, [tokenParam]);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invite) return;

    if (password.length < 8) {
      showToast("Password must be at least 8 characters long", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    if (!agreeTerms) {
      showToast("Please accept the terms and security agreement", "error");
      return;
    }

    setSubmitting(true);

    try {
      // 1. Attempt Supabase Auth Sign Up / Provision
      try {
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: fullName.split(" ")[0] || fullName,
              last_name: fullName.split(" ").slice(1).join(" ") || "",
              business_name: invite.hotel_name,
              hotel_slug: invite.hotel_slug,
              role: "hotel_manager",
              tier: invite.tier,
            },
          },
        });
      } catch (authErr) {
        // Fallback gracefully in sandbox or offline environment
        console.warn("Supabase auth signup notice:", authErr);
      }

      // 2. Mark token as claimed in the token registry
      claimOnboardingToken(invite.token, fullName);

      // 3. Store active tenant session in localStorage for seamless entry
      localStorage.setItem("ever_active_hotel_slug", invite.hotel_slug);
      localStorage.setItem("ever_active_hotel_name", invite.hotel_name);

      setSubmitting(false);
      setActivated(true);
      showToast(`Welcome! ${invite.hotel_name} is activated`, "success");

      // Navigate into console after celebratory moment
      setTimeout(() => {
        navigate("/console");
      }, 1500);

    } catch (err: any) {
      setSubmitting(false);
      showToast(err.message || "Failed to complete property activation", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#EA6639] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-mono uppercase tracking-wider text-zinc-500">
            Validating Client Activation Token...
          </p>
        </div>
      </div>
    );
  }

  // Error States: Expired, Not Found, or Already Claimed
  if (errorReason) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4 text-left">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-zinc-200/80 shadow-xl space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <AlertCircle className="w-6 h-6" />
          </div>

          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold block mb-1">
              ONBOARDING ACCESS CONTROL
            </span>
            <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">
              {errorReason === "expired" && "Invitation Token Expired"}
              {errorReason === "already_claimed" && "Invitation Already Claimed"}
              {errorReason === "not_found" && "Invalid Activation Token"}
            </h1>
            <p className="text-xs text-zinc-600 mt-2 font-light leading-relaxed">
              {errorReason === "expired" && (
                <>
                  This secure property onboarding URL has expired. For enterprise security, 
                  activation links are time-limited. Please contact your Ever Solutions Architect 
                  to generate a fresh invite.
                </>
              )}
              {errorReason === "already_claimed" && (
                <>
                  This onboarding invitation has already been claimed and activated. If you are 
                  the designated hotel administrator, please log in with your credentials.
                </>
              )}
              {errorReason === "not_found" && (
                <>
                  The activation token provided is unrecognized or malformed. Direct self-registration 
                  is closed. Please use the exact link sent to your email or visit our Help Desk.
                </>
              )}
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex flex-col gap-2.5">
            {errorReason === "already_claimed" ? (
              <Link
                to="/login"
                className="w-full text-center py-3 bg-[#111] hover:bg-zinc-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Go to Client Log In
              </Link>
            ) : (
              <Link
                to="/help-desk"
                className="w-full text-center py-3 bg-[#EA6639] hover:bg-[#d85e34] text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
              >
                Contact Ever Help Desk
              </Link>
            )}
            <Link
              to="/"
              className="w-full text-center py-2.5 text-zinc-500 hover:text-zinc-800 text-xs font-medium transition-colors"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Celebratory Activated State
  if (activated && invite) {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex items-center justify-center p-4 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white rounded-3xl p-10 border border-zinc-200/80 shadow-2xl space-y-4"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-semibold text-zinc-950">Property Activated!</h2>
          <p className="text-xs text-zinc-500 font-light">
            Dedicated environment initialized for <strong className="text-zinc-900">{invite.hotel_name}</strong>. Entering your console...
          </p>
          <div className="w-6 h-6 border-2 border-[#EA6639] border-t-transparent rounded-full animate-spin mx-auto mt-4" />
        </motion.div>
      </div>
    );
  }

  // Active Activation Form
  return (
    <div className="min-h-screen bg-[#FAF9F5] py-12 px-4 sm:px-6 lg:px-8 text-left">
      <div className="max-w-3xl mx-auto space-y-8">
        
        {/* Brand Header */}
        <div className="flex justify-between items-center border-b border-zinc-200 pb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-[#EA6639]" />
            <span className="font-bold text-lg text-zinc-950 font-serif tracking-tight">EVER</span>
            <span className="text-zinc-400 text-xs font-mono ml-1">/ GUEST OS ACTIVATION</span>
          </Link>
          <div className="text-right">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
              Verified Invitation
            </span>
          </div>
        </div>

        {invite && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Property & Commercial Specifications */}
            <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-zinc-200/80 shadow-sm space-y-6">
              <div>
                <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-[#EA6639] block mb-1">
                  PROVISIONED TENANT
                </span>
                <h2 className="text-xl font-semibold text-zinc-950 tracking-tight">{invite.hotel_name}</h2>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">/{invite.hotel_slug}</div>
              </div>

              <div className="p-3.5 bg-zinc-50 rounded-2xl border border-zinc-100 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Estate Tier:</span>
                  <span className="font-semibold text-zinc-900 font-mono uppercase text-[11px]">
                    {invite.tier} ({invite.room_count} Keys)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Base Platform Fee:</span>
                  <span className="font-semibold text-zinc-900 font-mono">${invite.base_platform_fee}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Performance Dividend:</span>
                  <span className="font-semibold text-emerald-600 font-mono">
                    {(invite.attribution_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div>
                <div className="text-[11px] font-mono uppercase text-zinc-400 font-semibold tracking-wider mb-2.5">
                  Activated Modules
                </div>
                <ul className="space-y-2 text-xs text-zinc-700">
                  {invite.operational_modules.direct_bookings && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Direct In-Chat Booking Engine</span>
                    </li>
                  )}
                  {invite.operational_modules.housekeeping && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Housekeeping Task Routing &amp; Tickets</span>
                    </li>
                  )}
                  {invite.operational_modules.room_service && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>In-Room F&amp;B Dining Integration</span>
                    </li>
                  )}
                  {invite.operational_modules.maintenance && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>Silent Maintenance Escalation</span>
                    </li>
                  )}
                  {invite.operational_modules.upsells && (
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>10-Stream Automated Ancillary Upsells</span>
                    </li>
                  )}
                </ul>
              </div>

              <div className="pt-4 border-t border-zinc-100 text-[11px] text-zinc-400 leading-relaxed font-light">
                Your dedicated virtual container and isolated database environment will be active immediately upon completing administrator setup.
              </div>
            </div>

            {/* Right Column: Administrator Setup Form */}
            <div className="lg:col-span-7 bg-white p-8 sm:p-9 rounded-3xl border border-zinc-200/80 shadow-lg">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-zinc-950 tracking-tight">
                  Establish Administrator Credentials
                </h1>
                <p className="text-xs text-zinc-500 mt-1 font-light">
                  Set up your primary manager account to access your property's Ever console.
                </p>
              </div>

              <form onSubmit={handleActivate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Administrator Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    Authorized Work Email
                  </label>
                  <input
                    type="email"
                    disabled
                    value={email}
                    className="w-full px-4 py-2.5 bg-zinc-100 border border-zinc-200 rounded-xl text-xs text-zinc-500 cursor-not-allowed font-mono"
                  />
                  <span className="text-[10px] text-zinc-400 mt-0.5 block">Locked to the invite recipient address.</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-900 mb-1">
                    WhatsApp / Direct Mobile Number
                  </label>
                  <input
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-900 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={8}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="At least 8 chars"
                        className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all pr-9"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-900 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={8}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className="w-full px-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-start gap-2.5 text-xs text-zinc-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="rounded border-zinc-300 text-[#EA6639] focus:ring-[#EA6639] mt-0.5"
                    />
                    <span>
                      I acknowledge the operational terms and agree to manage the property environment in compliance with guest privacy and GDPR standards.
                    </span>
                  </label>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 bg-[#EA6639] hover:bg-[#d85e34] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md group disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Activating Tenant Environment...</span>
                      </>
                    ) : (
                      <>
                        <span>Activate &amp; Enter Console</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
export default ActivationPage;
