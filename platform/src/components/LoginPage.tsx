import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";
import { EverLogo } from "./EverLogo";

const GeometricPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white pointer-events-none">
      <svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="geometric-pattern" x="0" y="0" width="120" height="120" patternUnits="userSpaceOnUse">
            {/* Grid of shapes */}
            {/* Row 1 */}
            <path d="M 0 0 L 60 0 A 60 60 0 0 1 0 60 Z" fill="#E8DCC8" />
            <path d="M 60 60 A 60 60 0 0 0 120 0 L 120 60 Z" fill="#1C3F3A" />
            
            {/* Row 2 */}
            <circle cx="30" cy="90" r="30" fill="#F2D1A1" />
            <path d="M 60 60 L 120 60 L 120 120 L 60 120 Z" fill="#2E64A5" />
            <path d="M 60 120 A 60 60 0 0 0 120 60 L 60 60 Z" fill="#1A4A87" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="100%" height="100%" fill="url(#geometric-pattern)" />
      </svg>
    </div>
  );
};

export function LoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        if (form.email.includes("admin") || form.email.includes("agency")) {
          navigate("/agency");
        } else {
          navigate("/console");
        }
      }, 1000);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4 sm:p-8 font-sans antialiased">
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-xl flex overflow-hidden min-h-[640px] relative">
        
        {/* Left Sidebar Pattern */}
        <div className="hidden lg:block w-[340px] relative shrink-0 border-r border-zinc-100">
          <GeometricPattern />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col p-8 sm:p-12 relative bg-white">
          <div className="mb-10">
            <Link to="/" className="inline-flex items-center text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to website
            </Link>
          </div>

          <div className="max-w-[400px]">
            <AnimatePresence mode="wait">
              {!success ? (
                <motion.div
                  key="login-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="mb-8">
                    <h1 className="text-[32px] leading-tight font-semibold text-zinc-900 mb-2 tracking-tight">
                      Welcome!
                    </h1>
                    <p className="text-sm text-zinc-600">
                      <Link to="/signup" className="font-semibold text-zinc-900 underline hover:no-underline">Create a free account</Link> or log in to get started using Ever
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Email</label>
                        <span className="text-[10px] text-zinc-500 font-medium">Use 'admin@ever.ai' for Agency Command</span>
                      </div>
                      <input
                        required
                        type="email"
                        placeholder="manager@boutiquehotel.com"
                        className="w-full px-5 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 relative">
                      <label className="text-sm font-semibold text-zinc-900 ml-1">Password</label>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="w-full pl-5 pr-12 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm tracking-widest"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end py-1">
                      <Link to="/help-desk" className="text-sm font-semibold text-zinc-900 hover:underline transition-colors">Forgot password?</Link>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? "Logging in..." : "Log in"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="login-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Successfully authenticated</h3>
                  <p className="text-sm text-zinc-500">Redirecting you to the console...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}


