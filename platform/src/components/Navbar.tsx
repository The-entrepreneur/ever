import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { EverLogo } from "./EverLogo";
import { InteractiveButton } from "./InteractiveButton";
import { CurrencyToggle } from "./CurrencyToggle";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleDropdown = (name: string) => {
    setActiveDropdown(activeDropdown === name ? null : name);
  };

  return (
    <>
      {/* Top Banner - hidden when scrolled to keep floating nav clean */}
      {!isScrolled && (
        <Link to="/demo" className="w-full bg-[#EA6639] text-[#111111] text-[11px] sm:text-xs py-2 px-4 flex justify-center items-center gap-1.5 cursor-pointer hover:bg-[#d85e34] transition-colors relative z-[110]">
          <span className="font-bold">Experience Ever running a hotel in real time →</span>
        </Link>
      )}

      {/* Main Responsive Navbar */}
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
          
          {/* Static state Left Gutter (60px vertical strip) - Hidden in floating mode */}
          {!isScrolled && (
            <div className="hidden md:flex w-[60px] border-r border-[#111111]/10 shrink-0 select-none items-center justify-center min-h-[72px]">
              <Link to="/" className="w-8 h-8 rounded bg-[#111111] flex items-center justify-center text-white font-serif font-black text-xs shadow-sm hover:scale-105 transition-transform cursor-pointer">
                E
              </Link>
            </div>
          )}

          {/* Main Body content containing logo, items and actions */}
          <div className="flex-1 flex items-center justify-between">
            
            {/* Left section: Brand Logo and Title */}
            <div className="flex items-center gap-6 lg:gap-10 pl-4">
              <Link to="/" className="flex items-center gap-2 cursor-pointer group">
                <EverLogo height={isScrolled ? 32 : 36} showSubtitle={false} className="opacity-95 group-hover:opacity-100 transition-opacity" />
                <span className="text-[9px] bg-[#111111]/5 py-0.5 px-1.5 rounded text-zinc-500 font-mono font-medium tracking-normal select-none">Cloud</span>
              </Link>

              {/* Desktop menu links (Centered in floating layout, lefted in static) */}
              <div className="hidden lg:flex items-center space-x-6 pl-4 border-l border-zinc-200/80">
                {/* Platform Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => toggleDropdown("platform")}
                    className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors flex items-center gap-1 py-1"
                  >
                    Platform <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${activeDropdown === "platform" ? "rotate-180" : ""}`} />
                  </button>
                  {activeDropdown === "platform" && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-zinc-200/80 rounded-xl shadow-lg p-3 grid gap-2 z-50 animate-fade-in">
                      <Link to="/guest-concierge" onClick={() => setActiveDropdown(null)} className="p-2 hover:bg-[#F9F6F0] rounded-lg block group">
                        <div className="text-xs font-semibold text-[#111111]">Guest Concierge Engine</div>
                        <div className="text-[10px] text-zinc-500">Automate support & operations</div>
                      </Link>
                      <Link to="/commerce-agent" onClick={() => setActiveDropdown(null)} className="p-2 hover:bg-[#F9F6F0] rounded-lg block group">
                        <div className="text-xs font-semibold text-[#111111]">Hospitality Commerce Agent</div>
                        <div className="text-[10px] text-zinc-500">Direct bookings & native payments</div>
                      </Link>
                    </div>
                  )}
                </div>

                <Link to="/demo" className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors flex items-center gap-1">
                  Live Sandbox
                  <Sparkles className="w-3 h-3 text-[#EA6639] shrink-0" />
                </Link>
                <Link to="/use-cases" className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors">Use Cases</Link>
                <Link to="/pricing" className="text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors">Pricing</Link>
              </div>
            </div>

            {/* Right section: Action triggers ("Console" & "onboard") */}
            <div className="flex items-center gap-3 pr-3">
              <div className="hidden lg:block">
                <CurrencyToggle />
              </div>

              <Link to="/login" className="hidden lg:inline-flex text-[13px] font-medium text-zinc-800 hover:text-[#EA6639] transition-colors bg-zinc-100 hover:bg-zinc-200/80 rounded-full py-2 px-4.5">
                Console
              </Link>
              
              {/* Premium Hover-Effect Interactive Onboard Button */}
              <div className="hidden lg:block">
                <InteractiveButton to="/signup" className="text-white">
                  Onboard
                </InteractiveButton>
              </div>

              {/* Mobile Menu Trigger */}
              <button 
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden p-1.5 hover:bg-zinc-100 rounded text-zinc-800 ml-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>

        </div>

        {/* Mobile slide-down menu */}
        {isOpen && (
          <div 
            className={`
              lg:hidden bg-[#F9F6F0] px-6 py-8 space-y-4 shadow-xl z-[150] w-full left-0
              ${isScrolled 
                ? "absolute top-full mt-2 rounded-[24px] border border-zinc-300" 
                : "absolute top-full border-t border-[#111111]/10"
              }
            `}
          >
            <Link to="/guest-concierge" onClick={() => setIsOpen(false)} className="block py-2.5 text-xs font-medium border-b border-zinc-200">Guest Concierge Engine</Link>
            <Link to="/commerce-agent" onClick={() => setIsOpen(false)} className="block py-2.5 text-xs font-medium border-b border-zinc-200">Hospitality Commerce Agent</Link>
            <Link to="/demo" onClick={() => setIsOpen(false)} className="block py-2.5 text-xs font-medium border-b border-zinc-200 flex items-center gap-1 text-[#EA6639]">
              Live Sandbox Demo <Sparkles className="w-3.5 h-3.5 text-[#EA6639] shrink-0" />
            </Link>
            <Link to="/use-cases" onClick={() => setIsOpen(false)} className="block py-2.5 text-xs font-medium border-b border-zinc-200">Use Cases</Link>
            <Link to="/pricing" onClick={() => setIsOpen(false)} className="block py-2.5 text-xs font-medium border-b border-zinc-200">Pricing</Link>
            
            <div className="pt-4 flex justify-between items-center pb-4 border-b border-zinc-200 lg:hidden">
               <span className="text-xs font-medium text-zinc-900">Currency</span>
               <CurrencyToggle />
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Link to="/login" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-xs font-semibold border border-[#111111]/20 rounded-full hover:bg-zinc-50">
                Console
              </Link>
              <Link to="/signup" onClick={() => setIsOpen(false)} className="w-full text-center py-3 text-xs font-semibold text-white bg-[#7C3AED] rounded-full hover:bg-[#6D28D9]">
                Onboard
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
