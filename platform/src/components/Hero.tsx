import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  Sparkles, 
  ChevronDown, 
  Check, 
  Zap, 
  ArrowUpRight, 
  Layers, 
  Coins, 
  Workflow, 
  Globe, 
  ShieldCheck, 
  Bot, 
  Network
} from "lucide-react";
import { useState } from "react";
import { AnimatedChat } from "./AnimatedChat";
import { InteractiveButton } from "./InteractiveButton";
import { useCurrency } from "../context/CurrencyContext";

export function Hero() {
  const { formatMoney } = useCurrency();
  // Guest Persona Simulator Selection State
  const [guestPersona, setGuestPersona] = useState<"formal" | "boutique" | "prompt" | "retreat">("formal");
  
  // Demo request state
  const [demoEmail, setDemoEmail] = useState("");
  const [demoRequested, setDemoRequested] = useState(false);

  const handleDemoRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (demoEmail.trim()) {
      window.location.href = `mailto:rose@eversoftware.com?subject=Schedule a discovery session&body=Hi Rose,%0D%0A%0D%0AI would like to schedule a discovery session.%0D%0A%0D%0AMy email is: ${demoEmail}`;
      setDemoRequested(true);
      setDemoEmail("");
    }
  };

  // Models available mapped
  const models = [
    { id: "formal", name: "Formal & Luxurious", desc: "Resort style, polite, high-end tone mapping.", rate: "Ever-Ultra" },
    { id: "boutique", name: "Boutique & Playful", desc: "Trendy, energetic, conversational tone.", rate: "Ever-Custom" },
    { id: "prompt", name: "Prompt & Expressive", desc: "Airport transit & business, ultra efficiency.", rate: "Ever-Pulse" },
    { id: "retreat", name: "Conversational & Warm", desc: "Eco resorts & holistic retreat style guidance.", rate: "Ever-Core" }
  ];

  return (
    <div className="relative overflow-hidden bg-[#F9F6F0] text-zinc-900 border-b border-[#111111]/10">
      
      {/* Editorial Wireframe Grid Alignment Container */}
      <div className="max-w-[1600px] mx-auto w-full flex flex-col md:flex-row min-h-[92vh]">
        
        {/* ================= LEFT GUTTER COLUMN ================= */}
        <div className="hidden md:flex w-[60px] border-r border-[#111111]/10 shrink-0 flex-col justify-between py-12 items-center select-none text-zinc-400">
          <div className="w-5 h-5 rounded-full border border-zinc-300 flex items-center justify-center text-[10px] font-mono font-bold text-zinc-500">
            ★
          </div>
          
          {/* Rotated vertical title resembling the aesthetic typography of the image */}
          <div className="transform -rotate-90 origin-center whitespace-nowrap text-[10px] font-mono tracking-[0.2em] uppercase text-zinc-500 font-semibold my-48">
            Actionable insights and automated workflows
          </div>

          <div className="text-[10px] font-mono">
            01/06
          </div>
        </div>

        {/* ================= MAIN COLUMN SPLIT (LEFT PANE & RIGHT PANELS) ================= */}
        <div className="flex-1 flex flex-col lg:flex-row">
          
          {/* ----------------- LEFT MAIN CONTENT PANE (70% WIDTH) ----------------- */}
          <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-[#111111]/10 px-6 sm:px-10 py-12 flex flex-col justify-between gap-12">
            
            {/* Top Section Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Dynamic tag */}
              <div className="flex items-center gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-medium bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/20">
                  <Zap className="w-3 h-3 fill-current" />
                  Ever's Guest OS
                </span>
                <span className="text-[11px] text-zinc-400 font-mono">Connected Guest Operations</span>
              </div>

              {/* Master Headline matching layout text and italic serif accent */}
              <h1 className="text-[38px] sm:text-[48px] lg:text-[68px] font-medium leading-[1.05] tracking-tight text-[#111111] max-w-4xl mb-6">
                The Connected Operating Layer for Modern <span className="font-serif italic font-light text-[#7C3AED] relative block sm:inline">Hospitality.</span>
              </h1>

              {/* Supporting Copy */}
              <p className="text-[#111111]/80 text-sm sm:text-base leading-relaxed max-w-2xl mb-8 font-light">
                Ever's Guest OS enables Connected Guest Operations by connecting guest engagement, commercial activity and operational execution into one continuous operating model.
                <br />
                <span className="font-medium">Hotels already operate powerful systems. Ever connects them.</span>
              </p>

              {/* CTAs Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                <LinkToSignup text="onboard" />
                <form onSubmit={handleDemoRequest} className="relative w-full sm:w-[280px] flex items-center shadow-sm rounded-full bg-white border border-zinc-200 overflow-hidden focus-within:border-[#EA6639]/50 focus-within:ring-1 focus-within:ring-[#EA6639]/50 transition-all">
                  <input
                    type="email"
                    value={demoEmail}
                    onChange={(e) => setDemoEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-transparent px-5 py-3 text-[13px] text-zinc-900 placeholder-zinc-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white bg-zinc-900 hover:bg-zinc-800 transition-colors px-4 py-2 rounded-full mr-1.5 whitespace-nowrap"
                  >
                    {demoRequested ? "Opening..." : "Request"}
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </motion.div>

            {/* HIGH-FIDELITY VISUAL WORKSPACE (Combining simulated chat and live PMS node ledger mapping) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#ebeae2] rounded-3xl p-6 sm:p-8 overflow-hidden border border-black/5 shadow-inner"
            >
              {/* Blueprint Grid mesh layer mimicry */}
              <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#111111_1px,transparent_1px),linear-gradient(to_bottom,#111111_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* Responsive columns inside dashboard visual mockup */}
              <div className="relative z-10 grid grid-cols-1 xl:grid-cols-2 gap-6 items-stretch">
                
                {/* Visual Segment A: The Live Interactive Chat Display inside browser frame */}
                <div className="flex flex-col bg-[#F9F6F0] rounded-2.5xl shadow-lg border border-zinc-200/50 overflow-hidden">
                  <div className="px-4 py-3 bg-[#ebeae2] border-b border-zinc-200/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400"></div>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">guest-chat-session-active</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-[9px] font-mono font-medium text-emerald-800 border border-emerald-200">Live</span>
                  </div>
                  
                  {/* Chat Content Panel */}
                  <div className="h-[360px] overflow-hidden flex flex-col">
                    <AnimatedChat />
                  </div>
                </div>

                {/* Visual Segment B: PMS Ledger Workflow Node Simulator */}
                <div className="flex flex-col bg-[#111111] text-zinc-300 rounded-2.5xl shadow-xl border border-zinc-800 overflow-hidden text-xs">
                  <div className="px-4 py-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-zinc-500">workflow-routing-ledger.config</span>
                    <span className="text-[10px] font-mono text-[#EA6639] font-medium flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#EA6639] animate-pulse"></div>
                      Listening
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-6 font-mono">
                    <div className="space-y-4">
                      {/* Node Item 1 */}
                      <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3">
                        <div className="p-1 px-1.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold">
                          01
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-semibold">Query Received</span>
                            <span className="text-[9px] bg-zinc-800 text-zinc-400 px-1 py-0.2 rounded">whatsapp</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-snug">"Is it possible to upgrade my room on Friday?"</p>
                        </div>
                      </div>

                      {/* Connection Line */}
                      <div className="flex justify-center -my-2.5">
                        <div className="w-[1px] h-6 border-l border-dashed border-zinc-700"></div>
                      </div>

                      {/* Node Item 2 */}
                      <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3">
                        <div className="p-1 px-1.5 rounded bg-[#7C3AED]/10 text-[#7C3AED] text-[10px] font-semibold">
                          02
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-semibold flex items-center gap-1">
                              <Network className="w-3 h-3 text-[#7C3AED]" />
                              Cloudbeds Sync
                            </span>
                            <span className="text-[9px] bg-[#7C3AED]/20 text-[#A855F7] px-1 py-0.2 rounded font-bold">Secured</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-snug">Locked in Junior Suite availability database mapping.</p>
                        </div>
                      </div>

                      {/* Connection Line */}
                      <div className="flex justify-center -my-2.5">
                        <div className="w-[1px] h-6 border-l border-dashed border-zinc-700"></div>
                      </div>

                      {/* Node Item 3 */}
                      <div className="p-3 bg-zinc-900/60 rounded-lg border border-zinc-800/80 flex items-start gap-3 relative overflow-hidden group">
                        <div className="absolute right-0 top-0 w-24 h-24 bg-[#EA6639]/5 rounded-full blur-xl pointer-events-none"></div>
                        <div className="p-1 px-1.5 rounded bg-[#EA6639]/10 text-[#EA6639] text-[10px] font-semibold">
                          03
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-white font-semibold flex items-center gap-1">
                              <Coins className="w-3 h-3 text-[#EA6639]" />
                              Commerce Completed
                            </span>
                            <span className="text-[10px] text-emerald-400 font-bold">{formatMoney(100)}/night</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 leading-snug">Hospitality Commerce Agent (HCA) processes direct booking and coordinates operational workflows.</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-900 flex justify-between items-center">
                      <span className="text-[10px] text-zinc-500 font-mono">Channel Connection ID: R-810A</span>
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#EA6639]"></div>
                        <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] mt-0.5"></div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

            {/* Bottom Value Proposition & Brands row mimicking lower section of image */}
            <div className="pt-8 border-t border-[#111111]/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-lg font-medium tracking-tight text-[#111111] mb-2">
                    Connected operational layer, completely integrated.
                  </h3>
                  <p className="text-zinc-500 text-xs sm:text-xs leading-relaxed max-w-md">
                    We represent the most reliable way to connect guest engagement, direct commerce, and your existing hotel systems to deliver consistent service and maximize direct revenue.
                  </p>
                </div>
                
                {/* Integration Pill Grids */}
                <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Stripe</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Paystack</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Cloudbeds PMS</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Cloudbeds API</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">WhatsApp</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Insta</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">SMS</span>
                  <span className="px-3 py-1.5 bg-white border border-[#111111]/5 rounded-full text-xs font-semibold text-zinc-800 hover:border-zinc-300 transition-colors pointer-default">Telegram</span>
                </div>
              </div>
            </div>

          </div>

          {/* ----------------- RIGHT SIDEBAR PANEL (30% WIDTH) ----------------- */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.15,
                  delayChildren: 0.4
                }
              }
            }}
            className="w-full lg:w-[30%] px-6 sm:px-10 lg:px-8 py-12 flex flex-col justify-between gap-12 select-none"
          >
                       {/* Pitch Text Box */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
              className="space-y-4"
            >
              <h4 className="text-xs font-bold tracking-[0.1em] text-zinc-400 uppercase">
                Connected Guest Operations
              </h4>
              <h2 className="text-2xl font-semibold tracking-tight leading-8 text-[#111111]">
                Hospitality infrastructure for continuous operational execution
              </h2>
              <p className="text-xs font-light text-zinc-600 leading-relaxed">
                Modern hospitality brands select Ever's Guest OS to connect guest engagement, commerce, and operational workflows. Integrate existing property management systems and messaging channels.
              </p>
            </motion.div>

            {/* Bento operations pill grid mockup matching the image block shapes */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
              className="bg-[#EBEAE2]/50 border border-black/[0.03] rounded-2xl p-5 space-y-4"
            >
              <div className="text-[11px] font-mono text-zinc-500 font-semibold uppercase tracking-wider mb-2">
                Operational Modules
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-[#F9F6F0] p-2 py-3.5 rounded-lg border border-black/[0.04] text-center">
                  <span className="text-[11px] font-medium text-zinc-600 block">Front-desk</span>
                </div>
                <div className="bg-[#F9F6F0] p-2 py-3.5 rounded-lg border border-black/[0.04] text-center">
                  <span className="text-[11px] font-medium text-zinc-600 block">Ledger API</span>
                </div>
                <div className="bg-[#F9F6F0] p-2 py-3.5 rounded-lg border border-black/[0.04] text-center">
                  <span className="text-[11px] font-medium text-zinc-600 block">Siteminder</span>
                </div>
              </div>

              {/* Colored action block pills corresponding to the yellow/purple/blue pills inside mockup */}
              <div className="grid grid-cols-1 gap-2 pt-1">
                <div className="bg-[#FCEFD2] border border-[#FADBA2] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.01] transition-transform">
                  <span className="text-xs font-semibold text-[#8C600B] flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 fill-[#8C600B]/20" />
                    Guest Concierge Engine
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div>
                </div>

                <div className="bg-[#EDE9FE] border border-[#DDD6FE] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.01] transition-transform">
                  <span className="text-xs font-semibold text-[#5B21B6] flex items-center gap-2">
                    <Workflow className="w-3.5 h-3.5" />
                    Hospitality Commerce Agent
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7C3AED]"></div>
                </div>

                <div className="bg-[#DCEBFB] border border-[#BFDBFE] px-4 py-3 rounded-lg flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.01] transition-transform">
                  <span className="text-xs font-semibold text-[#1E3A8A] flex items-center gap-2">
                    <Layers className="w-3.5 h-3.5" />
                    Connected Guest Operations
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </motion.div>

            {/* Custom Interactive Dropdown simulator selector representing "Choose your LLM" from design mockup */}
            <motion.div 
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-zinc-500 uppercase font-mono">🌟 Choose Guest Experience</span>
                <span className="text-[10px] bg-indigo-100 text-[#7C3AED] px-2 py-0.5 rounded font-mono font-bold">PRO</span>
              </div>

              <div className="bg-zinc-900 rounded-xl relative overflow-hidden border border-zinc-800 text-xs">
                {/* Active option header widget */}
                <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#EA6639]"></div>
                    <span className="text-white font-semibold">
                      {models.find(m => m.id === guestPersona)?.name}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
                </div>

                {/* Simulated Dropdown options changing actual active highlight state */}
                <div className="p-2 space-y-1">
                  {models.map((model) => (
                    <button
                       key={model.id}
                       onClick={() => setGuestPersona(model.id as any)}
                       className={`w-full text-left p-2.5 rounded-lg flex items-center justify-between transition-colors ${guestPersona === model.id ? 'bg-zinc-800/80 text-white' : 'text-zinc-400 hover:bg-zinc-800/30 hover:text-zinc-200'}`}
                    >
                      <div>
                        <div className="font-medium text-[11.5px]">{model.name}</div>
                        <div className="text-[10px] text-zinc-500 font-light mt-0.5">{model.desc}</div>
                      </div>
                      <span className="text-[9px] font-mono text-zinc-500 font-semibold px-1.5 py-0.5 bg-zinc-900 rounded border border-zinc-700/50">
                        {model.rate}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <p className="text-[11px] text-zinc-500 leading-relaxed font-light mt-2 italic text-center">
                Select tone preference above to align the Guest Concierge Engine.
              </p>
            </motion.div>

            {/* Button call out */}
            <motion.div
              variants={{
                hidden: { opacity: 0, x: 20 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
              }}
            >
              <LinkToSignup text="onboard now" secondary />
            </motion.div>

          </motion.div>

        </div>

      </div>

      {/* ================= BOTTOM ROW PARTNER LOGO CLOUD (STRETCHES ACROSS FOOTER) ================= */}
      <div className="bg-zinc-900/5 py-10 border-t border-[#111111]/10 px-6 select-none">
        <div className="max-w-[1400px] mx-auto w-full">
          <div className="text-center text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-6">
            Supported Property Management Integrations and Payments API and Counting
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
            <span className="text-zinc-800 text-xs font-bold tracking-[0.2em]">OPENTRACK</span>
            <span className="text-zinc-800 text-xs font-bold tracking-[0.05em] uppercase font-serif">Siteminder</span>
            <span className="text-zinc-800 text-xs font-bold uppercase font-mono tracking-tighter">Cloudbeds</span>
            <span className="text-zinc-800 text-xs font-light tracking-[0.1em] font-serif italic">PMS Sync</span>
            <span className="text-zinc-800 text-xs font-bold tracking-tight">STRIPE</span>
            <span className="text-zinc-800 text-xs font-bold lowercase tracking-widest">fleetilla</span>
            <span className="text-zinc-800 text-xs font-black italic tracking-normal uppercase">OUTPUT</span>
          </div>
        </div>
      </div>

    </div>
  );
}

// Inline Sub-components
function LinkToSignup({ text, secondary }: { text: string; secondary?: boolean }) {
  if (secondary) {
    return (
      <Link 
        to="/signup" 
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold rounded-full shadow-sm hover:scale-[1.01] transition-all text-center border border-[#111111]/20 hover:bg-zinc-50 text-zinc-900 bg-white"
      >
        {text}
        <ArrowRight className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <InteractiveButton to="/signup" className="px-6 py-3.5 text-[14px] flex items-center gap-2">
      {text}
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </InteractiveButton>
  );
}

function LinkToCases({ text, secondary }: { text: string; secondary?: boolean }) {
  if (secondary) {
    return (
      <a 
        href="/use-cases" 
        className="inline-flex items-center justify-center gap-2 px-6 py-3.5 text-[14px] font-semibold rounded-full shadow-sm hover:scale-[1.01] transition-all text-center border border-[#111111]/20 hover:bg-zinc-50 text-zinc-900 bg-white"
      >
        {text}
        <ArrowRight className="h-4 w-4" />
      </a>
    );
  }

  return (
    <InteractiveButton to="/use-cases" className="px-6 py-3.5 text-[14px] flex items-center gap-2">
      {text}
      <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
    </InteractiveButton>
  );
}
