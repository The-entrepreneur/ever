import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, Eye, EyeOff } from "lucide-react";

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

export function SignUpPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobileNumber: "",
    businessName: "",
    role: "",
    address: "",
    propertyType: "Hotel",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    localStorage.setItem("ever_signup_form", JSON.stringify(form));
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    }, 1500);
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
                  key="signup-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <div className="mb-8">
                    <h1 className="text-[32px] leading-tight font-semibold text-zinc-900 mb-2 tracking-tight">
                      Welcome!
                    </h1>
                    <p className="text-sm text-zinc-600">
                      Create a free account or <Link to="/login" className="font-semibold text-zinc-900 underline hover:no-underline">log in</Link> to get started using Ever
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">First Name</label>
                        <input
                          required
                          type="text"
                          placeholder="First name"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.firstName}
                          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Last Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Last name"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.lastName}
                          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Work Email</label>
                        <input
                          required
                          type="email"
                          placeholder="you@company.com"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.email}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Mobile Number</label>
                        <input
                          required
                          type="tel"
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.mobileNumber}
                          onChange={(e) => setForm({ ...form, mobileNumber: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Business Entity Name</label>
                        <input
                          required
                          type="text"
                          placeholder="Company name"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.businessName}
                          onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-sm font-semibold text-zinc-900 ml-1">Job Title/Role</label>
                        <input
                          required
                          type="text"
                          placeholder="e.g. General Manager"
                          className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                          value={form.role}
                          onChange={(e) => setForm({ ...form, role: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-zinc-900 ml-1">Company Address</label>
                      <input
                        required
                        type="text"
                        placeholder="123 Hospitality Way, City, State, ZIP"
                        className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-zinc-900 ml-1">Property Type</label>
                      <select
                        required
                        className="w-full px-3 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm"
                        value={form.propertyType}
                        onChange={(e) => setForm({ ...form, propertyType: e.target.value })}
                      >
                        <option value="Hotel">Hotel</option>
                        <option value="Resort">Resort</option>
                        <option value="Boutique Hotel">Boutique Hotel</option>
                        <option value="Restaurant">Restaurant</option>
                        <option value="Aparthotels">Aparthotels</option>
                        <option value="Short Term Rental">Short Term Rental</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 relative">
                      <label className="text-sm font-semibold text-zinc-900 ml-1">Password</label>
                      <div className="relative">
                        <input
                          required
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••••••"
                          className="w-full pl-4 pr-10 py-2.5 bg-white border border-zinc-300 rounded-xl text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 transition-all shadow-sm tracking-widest"
                          value={form.password}
                          onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold rounded-xl text-sm transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                      >
                        {loading ? "Creating account..." : "Sign up"}
                      </button>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="signup-success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-16 space-y-4"
                >
                  <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-zinc-900">Account Created</h3>
                  <p className="text-sm text-zinc-500">Redirecting you to login...</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
