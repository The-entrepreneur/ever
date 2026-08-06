import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Sparkles } from "lucide-react";
import { EverLogo } from "../../shared/EverLogo";
import { InteractiveButton } from "./InteractiveButton";
import { CurrencyToggle } from "./CurrencyToggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [platformOpen, setPlatformOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close platform dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (platformRef.current && !platformRef.current.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <>
      {/* Top Banner */}
      {!isScrolled && (
        <Link
          to="/demo"
          className="w-full bg-[#EA6639] text-[#111111] text-[11px] sm:text-xs py-2 px-4 flex justify-center items-center gap-1.5 hover:bg-[#d85e34] transition-colors relative z-[110] font-bold"
        >
          Experience Ever running a hotel in real time →
        </Link>
      )}

      {/* Main Navbar */}
      <nav
        className={`
          z-[140] transition-all duration-300 ease-in-out
          ${isScrolled
            ? "fixed top-3 left-1/2 -translate-x-1/2 max-w-[1140px] w-[calc(100%-2rem)] bg-white/95 backdrop-blur-md rounded-full shadow-[0_12px_40px_rgba(0,0,0,0.06)] border border-zinc-200/80 px-5 sm:px-6 py-2.5"
            : "relative w-full bg-[#F9F6F0] border-b border-[#111111]/10 px-0 py-0"
          }
        `}
      >
        <div className="max-w-[1600px] mx-auto w-full flex items-center justify-between">

          {/* Left gutter icon — static only */}
          {!isScrolled && (
            <div className="hidden md:flex w-[60px] border-r border-[#111111]/10 shrink-0 select-none items-center justify-center min-h-[64px]">
              <Link
                to="/"
                className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-white font-serif font-black text-xs shadow-sm hover:scale-105 transition-transform"
              >
                E
              </Link>
            </div>
          )}

          {/* Flex body */}
          <div className="flex-1 flex items-center justify-between">

            {/* LEFT: Logo + Nav links */}
            <div className="flex items-center gap-0 pl-4">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group mr-6">
                <EverLogo height={isScrolled ? 32 : 34} showSubtitle={false} className="opacity-95 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] bg-[#111111]/5 py-0.5 px-1.5 rounded text-zinc-500 font-mono font-medium tracking-normal select-none">
                  Cloud
                </span>
              </Link>

              {/* Desktop nav */}
              <div className="hidden lg:flex items-center space-x-5 border-l border-zinc-200/60 pl-6">

                {/* Platform dropdown */}
                <div className="relative" ref={platformRef}>
                  <button
                    onClick={() => setPlatformOpen(!platformOpen)}
                    className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors flex items-center gap-1 py-1"
                  >
                    Platform
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${platformOpen ? "rotate-180" : ""}`} />
                  </button>

                  {platformOpen && (
                    <div className="absolute top-full left-0 mt-3 w-[240px] bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-2 space-y-0.5 z-50">
                      <Link
                        to="/guest-concierge"
                        onClick={() => setPlatformOpen(false)}
                        className="flex flex-col px-3 py-2.5 hover:bg-[#F9F6F0] rounded-xl transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#EA6639] transition-colors leading-tight">Guest Concierge Engine</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">Automate support & operations</span>
                      </Link>
                      <Link
                        to="/commerce-agent"
                        onClick={() => setPlatformOpen(false)}
                        className="flex flex-col px-3 py-2.5 hover:bg-[#F9F6F0] rounded-xl transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#EA6639] transition-colors leading-tight">Hospitality Commerce Agent</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">Direct bookings & native payments</span>
                      </Link>
                      <div className="h-px bg-zinc-100 mx-1" />
                      <Link
                        to="/use-cases"
                        onClick={() => setPlatformOpen(false)}
                        className="flex flex-col px-3 py-2.5 hover:bg-[#F9F6F0] rounded-xl transition-colors group"
                      >
                        <span className="text-[13px] font-semibold text-[#111111] group-hover:text-[#EA6639] transition-colors leading-tight">Use Cases</span>
                        <span className="text-[11px] text-zinc-400 mt-0.5">Real-world deployments & patterns</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Interactive Demo */}
                <Link
                  to="/demo"
                  className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors flex items-center gap-1.5"
                >
                  Interactive Demo
                  <Sparkles className="w-3.5 h-3.5 text-[#EA6639] shrink-0 fill-[#EA6639]/20" />
                </Link>

                {/* Pricing */}
                <Link to="/pricing" className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors">
                  Pricing
                </Link>

                {/* Book Infrastructure Review */}
                <Link
                  to="/help-desk"
                  className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors"
                >
                  Book Infrastructure Review
                </Link>
              </div>
            </div>

            {/* RIGHT: Currency, Console, Onboard */}
            <div className="flex items-center gap-3 pr-3">
              <div className="hidden lg:block">
                <CurrencyToggle />
              </div>

              <Link
                to="/login"
                className="hidden lg:inline-flex text-[13px] font-medium text-zinc-700 hover:text-zinc-900 transition-colors px-3 py-1.5"
              >
                Console
              </Link>

              {/* Onboard — solid black */}
              <Link
                to="/signup"
                className="hidden lg:inline-flex items-center justify-center text-[13px] font-semibold text-white bg-[#111111] hover:bg-zinc-800 rounded-full px-5 py-2 transition-colors shadow-sm"
              >
                Onboard
              </Link>

              {/* Mobile trigger */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-1.5 hover:bg-zinc-100 rounded text-zinc-800 ml-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div
            className={`
              lg:hidden bg-[#F9F6F0] px-6 py-8 space-y-1 shadow-xl z-[150] w-full left-0
              ${isScrolled
                ? "absolute top-full mt-2 rounded-[24px] border border-zinc-300"
                : "absolute top-full border-t border-[#111111]/10"
              }
            `}
          >
            <Link to="/guest-concierge" onClick={() => setIsOpen(false)} className="block py-3 text-[13px] font-semibold border-b border-zinc-100 text-[#111111]">Guest Concierge Engine</Link>
            <Link to="/commerce-agent" onClick={() => setIsOpen(false)} className="block py-3 text-[13px] font-semibold border-b border-zinc-100 text-[#111111]">Hospitality Commerce Agent</Link>
            <Link to="/use-cases" onClick={() => setIsOpen(false)} className="block py-3 text-[13px] font-semibold border-b border-zinc-100 text-[#111111]">Use Cases</Link>
            <Link to="/demo" onClick={() => setIsOpen(false)} className="py-3 text-[13px] font-semibold border-b border-zinc-100 flex items-center gap-1.5 text-[#EA6639]">
              Interactive Demo <Sparkles className="w-3.5 h-3.5 shrink-0" />
            </Link>
            <Link to="/pricing" onClick={() => setIsOpen(false)} className="block py-3 text-[13px] font-semibold border-b border-zinc-100 text-[#111111]">Pricing</Link>
            <Link to="/help-desk" onClick={() => setIsOpen(false)} className="block py-3 text-[13px] font-semibold border-b border-zinc-100 text-[#111111]">Book Infrastructure Review</Link>

            <div className="pt-4 flex justify-between items-center pb-4 border-b border-zinc-100">
              <span className="text-xs font-medium text-zinc-900">Currency</span>
              <CurrencyToggle />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-[13px] font-semibold border border-[#111111]/20 rounded-full hover:bg-zinc-50">
                Console
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-[13px] font-semibold text-white bg-[#111111] rounded-full hover:bg-zinc-800">
                Onboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
