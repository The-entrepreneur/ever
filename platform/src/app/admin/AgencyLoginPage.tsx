import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ShieldCheck, Eye, EyeOff, Lock, Mail, ArrowRight, ShieldAlert, Sparkles, Building2 } from "lucide-react";
import { supabase } from "../../lib/supabase";

export function AgencyLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    email: "admin@ever.ai",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });

      if (authError) {
        throw new Error(authError.message || "Invalid agency credentials");
      }

      if (!data?.user) {
        throw new Error("Authentication failed: No user record returned.");
      }

      // Check role authorization for agency command
      let userRole = data.user.user_metadata?.role;
      if (!userRole) {
        try {
          const { data: profile } = await supabase
            .from("users")
            .select("role")
            .eq("id", data.user.id)
            .single();
          if (profile?.role) {
            userRole = profile.role;
          }
        } catch (profileErr) {
          console.warn("Could not query user profile role:", profileErr);
        }
      }

      // Fallback: designated admin email
      if (!userRole && form.email.toLowerCase().includes("admin@ever.ai")) {
        userRole = "super_admin";
      }

      if (userRole !== "super_admin" && userRole !== "agency_staff") {
        await supabase.auth.signOut();
        throw new Error("Access Denied: This account is not authorized for Agency Command.");
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/agency", { replace: true });
      }, 700);
    } catch (err: any) {
      setError(err.message || "Failed to authenticate agency account.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-4 sm:p-8 font-sans antialiased text-white selection:bg-[#EA6639]/30 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#EA6639]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 mb-4 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-[#EA6639] animate-pulse" />
            <span>Restricted Gateway</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[#EA6639] font-mono">Agency v2.4</span>
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#EA6639] to-orange-500 flex items-center justify-center shadow-lg shadow-[#EA6639]/20 border border-orange-400/30">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-white mb-1.5">
            Ever Agency Command
          </h1>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
            Administrative access point for agency operators, platform engineers, and system administrators.
          </p>
        </div>

        {/* Card Box */}
        <div className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative">
          
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="agency-login-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                {error && (
                  <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex items-start gap-2.5">
                    <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Agency Email */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
                      Agency Email
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="email"
                        placeholder="admin@ever.ai"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EA6639] focus:ring-1 focus:ring-[#EA6639] transition-all font-mono"
                      />
                      <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="text-xs font-semibold text-zinc-300">
                        Master Key / Password
                      </label>
                      <span className="text-[10px] text-zinc-500 font-mono">256-bit AES</span>
                    </div>
                    <div className="relative">
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full pl-10 pr-11 py-2.5 bg-zinc-950/70 border border-zinc-800 rounded-xl text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#EA6639] focus:ring-1 focus:ring-[#EA6639] transition-all font-mono tracking-wider"
                      />
                      <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 px-4 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-[#EA6639]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {loading ? (
                        <>
                          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Authenticating Agency...</span>
                        </>
                      ) : (
                        <>
                          <span>Enter Agency Command</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="mt-6 pt-5 border-t border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500">
                  <Link to="/login" className="hover:text-zinc-300 transition-colors flex items-center gap-1">
                    <Building2 className="w-3 h-3" />
                    <span>Hotel Client Login</span>
                  </Link>
                  <Link to="/" className="hover:text-zinc-300 transition-colors">
                    Back to Website
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="agency-login-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-3"
              >
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-white">Agency Clearance Granted</h3>
                <p className="text-xs text-zinc-400">Loading Agency Control Plane...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Security Note */}
        <p className="text-center text-[10px] text-zinc-600 mt-6 font-mono">
          UNAUTHORIZED ACCESS STRICTLY PROHIBITED • ALL SESSIONS AUDITED &amp; LOGGED
        </p>

      </div>
    </div>
  );
}
