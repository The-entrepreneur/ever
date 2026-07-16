import React, { useState } from "react";
import { Link } from "react-router-dom";
import { EverLogo } from "./EverLogo";
import { ArrowRight, Mail, Check } from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      window.location.href = `mailto:rose@eversoftware.com?subject=Schedule a discovery session&body=Hi Rose,%0D%0A%0D%0AI would like to schedule a discovery session.%0D%0A%0D%0AMy email is: ${email}`;
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer className="bg-[#09080A] text-zinc-400 pt-24 pb-12 overflow-hidden relative select-none">
      
      {/* Container holding all responsive elements */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* 1. Header Hero section inside footer - adopting Amini 85% layout */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 pb-16 border-b border-zinc-900">
          <div className="max-w-2xl space-y-3">
            <h2 className="text-3xl sm:text-4.5xl md:text-[40px] font-semibold tracking-tight text-white leading-[1.12]">
              Ready to modernize hotel operations?
            </h2>
            <p className="text-sm sm:text-base font-light text-zinc-400 leading-relaxed">
              Deploy autonomous guest infrastructure without replacing your PMS, staff or existing software stack.
            </p>
          </div>
          
          <div className="shrink-0">
            {/* Custom Yellow/Orange Pill interactive button to match Amini's exact style */}
            <Link
              to="/help-desk"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#EA6639] hover:bg-[#EA6639]/90 text-[#09080A] font-bold text-xs tracking-tight transition-all duration-300 hover:scale-[1.03] shadow-[0_4px_20px_rgba(234,102,57,0.3)] whitespace-nowrap"
            >
              <div className="w-6 h-6 rounded-full bg-[#09080A] text-[#EA6639] flex items-center justify-center shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
              <span>Book Infrastructure Review</span>
            </Link>
          </div>
        </div>

        {/* 2. Middle Block: Logo statement & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 py-16 border-b border-zinc-900">
          
          {/* Brand & Mission Statement */}
          <div className="lg:col-span-6 space-y-6">
            <Link to="/" className="inline-block hover:opacity-85 transition-opacity">
              <EverLogo height={42} showSubtitle={false} lightMode={true} />
            </Link>
            <p className="text-zinc-400 text-xs font-light max-w-sm leading-relaxed">
              We help properties lower front-desk strain and capture direct, high-margin revenue.
            </p>
          </div>

          {/* Discovery Session section */}
          <div className="lg:col-span-6 space-y-4 lg:pl-16">
            <h4 className="text-xs font-semibold text-zinc-200 uppercase tracking-widest font-mono">
              Schedule a discovery session
            </h4>
            
            <form onSubmit={handleSubscribe} className="relative">
              <div className="flex items-center gap-2 border border-zinc-800/85 bg-zinc-950/40 rounded-full px-4 py-3 focus-within:border-zinc-700/85 transition-all">
                <Mail className="w-4 h-4 text-zinc-500 shrink-0" />
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-zinc-200 placeholder-zinc-800 w-full focus:outline-none focus:ring-0 text-xs sm:text-xs"
                />

                <button
                  type="submit"
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-white flex items-center justify-center transition-transform active:scale-95 shrink-0"
                >
                  {subscribed ? <Check className="w-3.5 h-3.5 text-green-400" /> : <ArrowRight className="w-3.5 h-3.5" />}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-green-400 mt-2 font-mono ml-4">
                  ✓ Request prepared! Sending email...
                </p>
              )}
            </form>
            
            <p className="text-[9px] font-mono font-medium tracking-widest text-[#EA6639]/80 uppercase">
              By submitting you agree to our terms.
            </p>
          </div>

        </div>

        {/* 3. Link matrices categorized columns */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 py-16 text-[13px]">
          
          {/* Col 1 */}
          <div className="space-y-5">
            <h5 className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest font-bold">
              PLATFORM
            </h5>
            <ul className="space-y-3.5 font-light">
              <li>
                <Link to="/guest-concierge" className="hover:text-zinc-100 transition-colors block">
                  Guest Concierge Engine
                </Link>
              </li>
              <li>
                <Link to="/commerce-agent" className="hover:text-zinc-100 transition-colors block">
                  Hospitality Commerce Agent
                </Link>
              </li>
              <li>
                <Link to="/reporting" className="hover:text-zinc-100 transition-colors block">
                  Revenue Intelligence & Reporting
                </Link>
              </li>
              <li>
                <div className="flex items-center justify-between text-zinc-600 font-light text-[13px]">
                  <span>Guest CRM Engine</span>
                  <span className="text-[8px] tracking-wider font-mono bg-zinc-900 border border-zinc-800 text-[#EA6639] px-1.5 py-0.5 rounded-full uppercase scale-95 shrink-0 select-none">
                    Soon
                  </span>
                </div>
              </li>
              <li>
                <Link to="/use-cases" className="hover:text-zinc-100 transition-colors block text-[#EA6639]">
                  Platform Use Cases
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2 */}
          <div className="space-y-5">
            <h5 className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest font-bold">
              RESOURCES
            </h5>
            <ul className="space-y-3.5 font-light">
              <li>
                <Link to="/pricing" className="hover:text-zinc-100 transition-colors block">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/support-guide" className="hover:text-zinc-100 transition-colors block">
                  Customer Support Guide
                </Link>
              </li>
              <li>
                <Link to="/help-desk" className="hover:text-zinc-100 transition-colors block">
                  Help Desk Support
                </Link>
              </li>
              <li>
                <Link to="/integrations" className="hover:text-zinc-100 transition-colors block">
                  Integrations
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-5">
            <h5 className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest font-bold">
              COMPANY
            </h5>
            <ul className="space-y-3.5 font-light">
              <li>
                <Link to="/about" className="hover:text-zinc-100 transition-colors block">
                  About Our Brand
                </Link>
              </li>
              <li>
                <span className="text-zinc-800 cursor-not-allowed flex items-center justify-between">
                  Careers 
                  <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded-full font-semibold uppercase tracking-wider scale-90">
                    We're hiring
                  </span>
                </span>
              </li>
              <li>
                <Link to="/status" className="text-emerald-500 hover:text-emerald-400 transition-colors block font-mono flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  System Status
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4 - MARKETS */}
          <div className="space-y-5">
            <h5 className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest font-bold">
              MARKETS
            </h5>
            <ul className="space-y-3.5 font-light text-zinc-500">
              <li>
                <span className="block cursor-default hover:text-zinc-400 transition-colors">
                  Hotels & Resorts
                </span>
              </li>
              <li>
                <span className="block cursor-default hover:text-zinc-400 transition-colors">
                  Boutique Rentals
                </span>
              </li>
              <li>
                <span className="block cursor-default hover:text-zinc-400 transition-colors">
                  Aparthotels
                </span>
              </li>
            </ul>
          </div>
          
          {/* Col 5 - SOCIALS & MEDIA */}
          <div className="space-y-5">
            <h5 className="text-[11px] font-mono uppercase text-zinc-500 tracking-widest font-bold">
              SOCIALS & MEDIA
            </h5>
            <ul className="space-y-3.5 font-light">
              <li>
                <a href="https://linkedin.com/company/ever-software-inc" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors block">
                  LinkedIn
                </a>
              </li>
              <li>
                <a href="https://x.com/Ever_247" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors block">
                  X (@Ever_247)
                </a>
              </li>
              <li>
                <a href="https://instagram.com/ever24_7" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors block">
                  Instagram (@ever24_7)
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/@Ever24_7" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-100 transition-colors block">
                  YouTube Channel
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* 4. Bottom Row Credits & huge low-opacity watermark layout */}
        <div className="pt-8 border-t border-zinc-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-mono text-zinc-600 tracking-widest uppercase">
          <p>© COPYRIGHT {new Date().getFullYear()} EVER SOFTWARE, INC.</p>
          <div className="flex gap-4">
            <Link to="/terms" className="hover:text-zinc-400 transition-colors">
              TERMS OF SERVICE
            </Link>
            <span>•</span>
            <Link to="/privacy" className="hover:text-zinc-400 transition-colors">
              PRIVACY POLICY
            </Link>
          </div>
        </div>

      </div>

      {/* Massive low contrast background watermark word EVER - adopting Amini template completely */}
      <div className="absolute bottom-[-10px] sm:bottom-[-30px] md:bottom-[-60px] left-1/2 -translate-x-1/2 select-none opacity-[0.025] pointer-events-none w-full text-center">
        <span className="text-[13vw] font-black tracking-[0.18em] text-zinc-300 uppercase leading-none select-none">
          EVER
        </span>
      </div>

    </footer>
  );
}
