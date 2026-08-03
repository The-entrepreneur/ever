import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Cpu, 
  Globe, 
  MessageSquare, 
  CreditCard, 
  Layers, 
  Database, 
  Bookmark, 
  Activity, 
  ShieldAlert, 
  Workflow, 
  HelpCircle,
  Gem,
  CheckCircle2,
  Lock,
  Cloud,
  ShoppingBag,
  DollarSign,
  Users,
  Phone,
  Server,
  Shield
} from "lucide-react";

export function TrustFAQ() {
  const logoItems = [
    { id: "cloudbeds", label: "cloudbeds", icon: <Globe className="w-4 h-4 text-[#EA6639]" />, colorClass: "group-hover:border-[#EA6639]", textClass: "font-sans font-black tracking-tight text-xs text-zinc-300" },
    { id: "mews", label: "mews", icon: <Layers className="w-4 h-4 text-violet-500" />, colorClass: "group-hover:border-violet-500", textClass: "font-sans font-black tracking-widest text-xs text-zinc-300 uppercase" },
    { id: "opera", label: "OPERA", icon: <Database className="w-4 h-4 text-zinc-400" />, colorClass: "group-hover:border-zinc-400", textClass: "font-serif font-bold tracking-wider text-xs text-zinc-300 uppercase" },
    { id: "stripe", label: "stripe", icon: <CreditCard className="w-4 h-4 text-indigo-400" />, colorClass: "group-hover:border-indigo-500", textClass: "font-sans font-extrabold tracking-tight text-xs text-zinc-300" },
    { id: "siteminder", label: "siteminder", icon: <Globe className="w-4 h-4 text-sky-400" />, colorClass: "group-hover:border-sky-500", textClass: "font-sans font-bold tracking-widest text-xs text-zinc-300 uppercase" },
    { id: "whatsapp", label: "WhatsApp", icon: <MessageSquare className="w-4 h-4 text-[#25D366]" />, colorClass: "group-hover:border-emerald-500", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300" },
    { id: "guesty", label: "guesty", icon: <Workflow className="w-4 h-4 text-rose-500" />, colorClass: "group-hover:border-rose-500", textClass: "font-sans font-extrabold text-xs text-zinc-300 lowercase" },
    { id: "omnibees", label: "omnibees", icon: <Cpu className="w-4 h-4 text-[#10B981]" />, colorClass: "group-hover:border-emerald-500", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300 uppercase" },
    { id: "salesforce", label: "Salesforce", icon: <Cloud className="w-4 h-4 text-sky-400" />, colorClass: "group-hover:border-sky-400", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300" },
    { id: "shopify", label: "shopify", icon: <ShoppingBag className="w-4 h-4 text-emerald-500" />, colorClass: "group-hover:border-emerald-500", textClass: "font-sans font-black tracking-tight text-xs text-zinc-300" },
    { id: "paypal", label: "PayPal", icon: <DollarSign className="w-4 h-4 text-blue-400" />, colorClass: "group-hover:border-blue-500", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300" },
    { id: "hubspot", label: "HubSpot", icon: <Users className="w-4 h-4 text-orange-400" />, colorClass: "group-hover:border-orange-500", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300" },
    { id: "zendesk", label: "zendesk", icon: <Shield className="w-4 h-4 text-teal-400" />, colorClass: "group-hover:border-teal-500", textClass: "font-sans font-semibold tracking-wide text-xs text-zinc-300" },
    { id: "twilio", label: "twilio", icon: <Phone className="w-4 h-4 text-red-400" />, colorClass: "group-hover:border-red-500", textClass: "font-sans font-black tracking-tight text-xs text-zinc-300" },
    { id: "hostaway", label: "hostaway", icon: <Server className="w-4 h-4 text-blue-400" />, colorClass: "group-hover:border-blue-400", textClass: "font-sans font-bold tracking-tight text-xs text-zinc-300" }
  ];

  const supporters = [
    {
      id: 1,
      name: "CLOUDBEDS",
      desc: "HMS Core Partner",
      icon: <Globe className="w-5 h-5 text-[#EA6639]" />,
      badge: "Direct Sync"
    },
    {
      id: 2,
      name: "Siteminder",
      desc: "Global Channel Hub",
      icon: <Workflow className="w-5 h-5 text-zinc-500" />,
      badge: "XML Feed"
    },
    {
      id: 3,
      name: "Stripe Connect",
      desc: "Tokenized Ledger",
      icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
      badge: "0% Leakage"
    },
    {
      id: 4,
      name: "WhatsApp",
      desc: "Conversational OS",
      icon: <MessageSquare className="w-5 h-5 text-emerald-600" />,
      badge: "Verified"
    },
    {
      id: 5,
      name: "Opera Cloud",
      desc: "Legacy Enterprise",
      icon: <Database className="w-5 h-5 text-zinc-600" />,
      badge: "Enterprise"
    },
    {
      id: 6,
      name: "Mews Systems",
      desc: "Open API Engine",
      icon: <Layers className="w-5 h-5 text-violet-600" />,
      badge: "Developer Tier"
    },
    {
      id: 7,
      name: "NVIDIA AI",
      desc: "Silicon Inference",
      icon: <Cpu className="w-5 h-5 text-emerald-500" />,
      badge: "Edge Compute"
    },
    {
      id: 8,
      name: "HEIFER INT",
      desc: "ESG Governance",
      icon: <Bookmark className="w-5 h-5 text-zinc-500" />,
      badge: "Compliance"
    },
    {
      id: 9,
      name: "MIT LABS",
      desc: "Predictive Engines",
      icon: <Activity className="w-5 h-5 text-zinc-700" />,
      badge: "R&D Sync"
    },
    {
      id: 10,
      name: "AON RISK",
      desc: "Merchant Protection",
      icon: <ShieldAlert className="w-5 h-5 text-red-600" />,
      badge: "Insured"
    },
    {
      id: 11,
      name: "WORLD ECON",
      desc: "Global Standard",
      icon: <CheckCircle2 className="w-5 h-5 text-zinc-600" />,
      badge: "Framework"
    },
    {
      id: 12,
      name: "HP SECURE",
      desc: "Trusted Hardware",
      icon: <Lock className="w-5 h-5 text-stone-600" />,
      badge: "Isolated"
    }
  ];

  return (
    <section className="bg-[#0A0A0A] py-24 border-t border-b border-zinc-900 text-white relative overflow-hidden">
      {/* Background soft glow gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#EA6639]/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        
        {/* Two-Column Top Header layout representing the exact weight, alignment, and composition of the image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 mb-16 items-start">
          
          {/* Left Column Accent Title: Our Supporters */}
          <div className="lg:col-span-3">
            <span className="text-[#EA6639] text-[13px] font-bold tracking-[0.1em] uppercase font-sans">
              Our Supporters
            </span>
          </div>
          
          {/* Right Column Bold Core Mission Statement */}
          <div className="lg:col-span-9">
            <h2 className="text-[32px] sm:text-[40px] font-medium leading-[1.12] tracking-tight text-white max-w-[960px]">
              Ever partners with industry leaders, global organizations & PMS networks to establish connected guest operations.
            </h2>
          </div>
          
        </div>

        {/* 90%-Style Adopted Logo Row as an animated slider / smooth horizontal carousel */}
        <div className="py-12 bg-zinc-950/40 rounded-[32px] border border-zinc-900 transition-all duration-300 overflow-hidden relative w-full flex">
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[#0A0A0A] to-transparent z-20 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0A0A0A] to-transparent z-20 pointer-events-none"></div>

          <motion.div 
            className="flex items-center whitespace-nowrap min-w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: 35,
              repeat: Infinity
            }}
          >
            {/* First Set */}
            <div className="flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
              {logoItems.map((logo) => (
                <div key={logo.id} className="inline-flex items-center gap-2.5 group cursor-default shrink-0">
                  <div className={`w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors ${logo.colorClass}`}>
                    {logo.icon}
                  </div>
                  <span className={`${logo.textClass} group-hover:text-white transition-colors`}>{logo.label}</span>
                </div>
              ))}
            </div>

            {/* Second identical set for seamless wrap */}
            <div className="flex items-center gap-12 sm:gap-16 pr-12 sm:pr-16">
              {logoItems.map((logo) => (
                <div key={`${logo.id}-dup`} className="inline-flex items-center gap-2.5 group cursor-default shrink-0">
                  <div className={`w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center transition-colors ${logo.colorClass}`}>
                    {logo.icon}
                  </div>
                  <span className={`${logo.textClass} group-hover:text-white transition-colors`}>{logo.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Action Button block with excellent styling (without the trustpilot stars write up block) */}
        <div className="mt-12 flex flex-col items-center justify-center text-center gap-4">
          <Link
            to="/help-desk"
            className="inline-flex items-center justify-center px-10 py-3.5 bg-[#FCD060] text-zinc-950 font-bold rounded-full text-xs hover:bg-[#ffe39c] transition-all duration-300 shadow-md hover:shadow-lg hover:shadow-[#FCD060]/10 tracking-tight cursor-pointer"
          >
            Try PMS Sync System
          </Link>
        </div>
        
      </div>
    </section>
  );
}


