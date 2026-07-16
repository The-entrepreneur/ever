/**
 * @file GuestConcierge.tsx
 * @description Comprehensive, article-style product page for Ever's Guest Concierge Engine (GCE).
 *
 * DESIGN TEMPLATE EXTRACTION (JSON Format)
 * ----------------------------------------
 * {
 *   "designSystem": {
 *     "background": "Cream-white background (#FAF9F5) with soft light-orange (#EA6639) highlight accents",
 *     "typography": {
 *       "headings": "Space Grotesk / Inter, tracking-tight, bold, elegant leading",
 *       "article": "Editorial serif details, elegant lettrines, deep semantic formatting",
 *       "monospace": "JetBrains Mono for metrics, category tags, technical data parameters"
 *     },
 *     "layout": {
 *       "hero": {
 *         "badge": "Uppercase container-less or pill badge with subtle borders",
 *         "headline": "Massive display type (3xl to 7xl) focusing on single autonomous value",
 *         "mockup": "Central smartphone interface showing high-fidelity chat threads, flanked by floaters"
 *       },
 *       "socialProof": "Symmetrical horizontal track of grayed-out core hospitality PMS logos",
 *       "interactiveTabs": "Integrated, responsive tab lists allowing visitors to explore features by category",
 *       "bentoGrid": {
 *         "structure": "Asymmetrical row-span and col-span configurations (2x2, 1x3, 3x1)",
 *         "cards": {
 *           "heroCard": "High contrast brand background (#EA6639) with crisp white display parameters",
 *           "dataCard": "Clean border-drawn white elements representing technical database and webhook flows"
 *         }
 *       },
 *       "faqAccordion": "Expandable accordion lines with smooth rotation-controlled chevron vectors",
 *       "footerCTACards": "Three equal-width container cards displaying distinctive onboarding pathways"
 *     }
 *   }
 * }
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  MessageSquare, 
  Bot, 
  Zap, 
  Globe, 
  Shield, 
  ChevronDown, 
  Star, 
  Building2, 
  HelpCircle, 
  Sparkles, 
  Users, 
  Layers, 
  Cpu, 
  Clock, 
  ArrowUpRight, 
  BookOpen, 
  ArrowRightLeft,
  Play,
  X
} from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";
import { useState } from "react";
import { PlatformIntegration } from "./PlatformIntegration";

export function GuestConcierge() {
  const [activeTab, setActiveTab] = useState<"all" | "operations" | "technology" | "leads">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const faqs = [
    {
      q: "Which specific channel does the GCE deploy onto besides the web chat?",
      a: "The GCE supports the property's website live chat ecosystem plus one additional choice channel selected by the hotel. This is typically WhatsApp Business or Instagram DMs, ensuring a tight, high-focus single-channel strategy."
    },
    {
      q: "Does the GCE write directly to our PMS?",
      a: "No, GCE does not feature direct PMS write synchronization. It focuses purely on non-transactional front-desk queries, knowledge ingestions, and lead captures. PMS checks are isolated to secure read-only layers. If you require full reservations and live transaction folio transfers, the HCA (Hospitality Commerce Agent) tier is required."
    },
    {
      q: "How does the silent staff escalation protocol work?",
      a: "When the GCE encounters an on-property dispute, a maintenance emergency, or a sentiment threshold breach, the agent silently halts autonomous responses and immediate alerts room operations. The full conversational history is packaged and routed directly to your team's desktop or Slack channel."
    },
    {
      q: "What training corpus formats are supported?",
      a: "The GCE directly ingests unformatted hotel operational manuals, resort guidelines, custom FAQs, property menus, local dining suggestions, and direct URLs via our isolated container indexing pipeline."
    }
  ];

  const features = [
    {
      id: "support-247",
      category: "operations",
      title: "Unified Guest Engagement",
      metric: "90% resolution",
      desc: "Connects and manages non-transactional guest interactions instantly in any language, ensuring a consistent brand experience.",
      icon: Clock,
      badge: "Engagement Layer"
    },
    {
      id: "dual-channel",
      category: "operations",
      title: "Centralised Guest Conversations",
      metric: "Consolidated",
      desc: "Consolidates all incoming guest communications into a single coordinated flow across your web and primary messaging channels.",
      icon: ArrowRightLeft,
      badge: "Unified Inbox"
    },
    {
      id: "unstructured-kb",
      category: "technology",
      title: "Operational Context",
      metric: "Sub-Second Ingestion",
      desc: "Directly reads unformatted PDFs, local guides, menu lists, and URLs, matching the exact tone of your brand voice with sub-second accuracy.",
      icon: BookOpen,
      badge: "Context Engine"
    },
    {
      id: "silent-escalation",
      category: "operations",
      title: "Request Coordination",
      metric: "Instant Escalate",
      desc: "Transforms conversation logs into structured tasks and route alerts instantly to the physical team when custom assistance is needed.",
      icon: Users,
      badge: "Staff Workflow"
    },
    {
      id: "lead-capture",
      category: "leads",
      title: "Intelligent Lead Capture",
      metric: "Qualified Leads",
      desc: "Captures and structures prospective guest preferences, contact details, and intent during chats to seamlessly qualify high-value sales leads.",
      icon: Users,
      badge: "Acquisition Layer"
    },
    {
      id: "container-grade",
      category: "technology",
      title: "Engagement Insights",
      metric: "Real-time Metrics",
      desc: "Delivers deep operational insights and communication metrics to understand guest sentiment and continuously optimize response quality.",
      icon: Shield,
      badge: "Analytics Engine"
    }
  ];

  const filteredFeatures = activeTab === "all" 
    ? features 
    : features.filter(f => f.category === activeTab);

  return (
    <div className="bg-[#FAF9F5] min-h-screen font-sans selection:bg-[#EA6639]/30 text-zinc-900 overflow-x-hidden">
      
      {/* 1. Hero Section - Overhauled to Polished Light Aesthetic matching the Vectara Template */}
      <section className="relative bg-[#FAF9F5] text-zinc-905 pt-32 pb-24 overflow-hidden border-b border-zinc-200/60">
        {/* Ambient background glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#EA6639]/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content Column */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 text-left flex flex-col items-start"
            >
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#EA6639]/20 bg-[#EA6639]/5 text-[#EA6639] font-mono text-[10px] uppercase tracking-wider mb-6">
                <span className="w-1.5 h-1.5 bg-[#EA6639] rounded-full" /> Ever's Guest OS
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-semibold text-zinc-950 tracking-tight leading-[1.08] mb-6 font-sans">
                The Guest Engagement Layer of Ever's Guest OS.
              </h1>
              
              <p className="text-zinc-800 font-light text-base md:text-lg leading-relaxed max-w-lg mb-8 whitespace-pre-line">
                The Guest Concierge Engine (GCE) manages guest engagement, captures and qualifies enquiries, and coordinates non-transactional guest operations across every communication channel.

                It creates the operational foundation that enables Connected Guest Operations.
              </p>
              
              <div className="flex flex-wrap items-center gap-5">
                <InteractiveButton to="/signup" className="text-white">
                  Start Free
                </InteractiveButton>
                <button 
                  onClick={() => setIsVideoOpen(true)}
                  className="text-zinc-700 hover:text-[#EA6639] transition-colors font-semibold text-xs flex items-center gap-2 group cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current text-[#EA6639]" /> Watch Demo
                </button>
              </div>
            </motion.div>

            {/* Right Visual Mesh Column */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="lg:col-span-7 relative flex justify-center items-center"
            >
              <div className="relative w-full max-w-[550px] aspect-square rounded-[2rem] flex items-center justify-center p-6 bg-white border border-zinc-200/60 shadow-xl overflow-hidden">
                
                {/* 1. Technical Coordinate Grid Mesh Overlay (Pixel-perfect extracted coordinates) */}
                <div className="absolute inset-0 pointer-events-none grid grid-cols-6 grid-rows-6 opacity-40 select-none">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="relative border-r border-zinc-900/[0.08] border-b border-zinc-900/[0.08]"
                    >
                      {/* Grid node intersection points */}
                      <span className="absolute bottom-[-3px] right-[-3px] w-1.5 h-1.5 rounded-full bg-zinc-400 border border-white z-10 shadow-sm" />
                    </div>
                  ))}
                </div>

                {/* 2. Embedded Demo Video */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10 w-[85%] h-[85%] rounded-[1.5rem] overflow-hidden group shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-zinc-200/50 bg-black"
                >
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/slWAWmqdicY"
                    title="Guest Concierge System Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </motion.div>
                
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Brand Trust bar (Grayscale alignment points, styled matching light theme) */}
      <section className="border-b border-zinc-200/50 bg-[#FAF9F5] py-8 text-center text-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-mono tracking-widest text-[#EA6639] font-bold uppercase">SEAMLESS INTEGRATION PATHWAYS</span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-zinc-500 font-mono grayscale opacity-65 font-bold text-lg tracking-tighter">
            <div>MEWS PMS</div>
            <div className="font-serif italic font-medium">OPERA</div>
            <div>CLOUDBEDS</div>
            <div className="font-sans">APALEO</div>
            <div>INFOR HOSPITALITY</div>
          </div>
        </div>
      </section>

      {/* 3. Deep In-Length Article Section */}
      <section id="article" className="py-28 max-w-4xl mx-auto px-4 md:px-6 scroll-mt-20">
        <article className="prose prose-zinc prose-lg mx-auto font-light leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#EA6639] prose-headings:text-zinc-950 text-zinc-700">
          <span className="text-[11px] font-mono text-[#EA6639] tracking-widest uppercase font-bold block mb-3">Operational Brief</span>
          <h2 className="text-3xl md:text-5xl text-zinc-950 mb-8 font-semibold tracking-tight leading-tight">
            Guest Conversations Don't End with Replies.<br />They Begin Operations.
          </h2>
          
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-[#EA6639] first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] mb-8">
            E<span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">very guest conversation creates operational intent.</span> A room service request, a maintenance issue, an early check-in, or a simple question all require action beyond the conversation itself.
          </p>
          
          <p className="mb-10">
            When guest communication and hotel operations remain disconnected, requests slow down, teams lose context and service quality becomes inconsistent.
          </p>

          {/* Symmetrical Quote/Insight Block */}
          <div className="my-14 border-l-4 border-[#EA6639] pl-6 bg-white py-8 pr-8 rounded-r-3xl shadow-sm">
            <p className="italic text-zinc-900 text-lg leading-relaxed font-normal mb-2">
              "The challenge isn't responding to guests. It's ensuring every conversation reaches the right team with the right context at the right time."
            </p>
            <cite className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold not-italic">
              — Ever Guest OS Operations Insight
            </cite>
          </div>

          <p className="mb-12 text-zinc-900 font-medium">
            The Guest Concierge Engine transforms guest conversations into structured operational workflows, creating the foundation for Connected Guest Operations.
          </p>

          <h3 className="text-2xl text-zinc-950 font-semibold mb-4 mt-12 tracking-tight">
            The GCE Philosophy: Absolute Context and Narrow Scopes.
          </h3>
          <p className="mb-8">
            The **Guest Concierge Engine (GCE)** approaches operations differently. It operates on a sandboxed architecture, strictly training on unformatted property manuals, operational FAQs, guidelines, menus, and local recommendations. Through native, multi-format knowledge ingestion, GCE acts as an omnipresent digital extension of your front desk.
          </p>
          <p className="mb-8">
            To prevent over-engineering and ensure maximum operational safety, GCE adopts a deliberate dual-channel constraint. It deploys natively only on the boutique website and one primary channel (such as WhatsApp Business). Operating exclusively behind an isolated, read-only PMS proxy layer, the GCE securely intercepts guest traffic before it reaches the team.
          </p>
          <p className="mb-8">
            When GCE encounters complex scenarios, maintenance issues, or negative sentiment thresholds, it executes a silent contextual hand-off process. The agent packages the full historical conversation log and triggers an internal alert to your team's desktop dashboard, allowing front-desk personnel to step in instantly without losing momentum.
          </p>

          <h3 className="text-2xl text-zinc-950 font-semibold mb-4 mt-12 tracking-tight">
            The Hand-off: Where Engagement Meets Commerce.
          </h3>
          <p className="mb-8">
            The Guest Concierge Engine is deliberately built as an engagement, qualification, and non-transactional support layer. It does not touch direct card transactions, PMS write-backs, or live booking modifications. By design, GCE is focused on answering inquiries and routing alerts to protect on-property operations.
          </p>
          <p className="mb-8">
            To unlock direct revenue, hotels require transactional capabilities. That is where the Hospitality Commerce Agent (HCA) takes over, integrating deeply with global payment processors and PMS write-backs to handle real-time bookings, upsells, and digital checkouts.
          </p>

          {/* Core Strategic Callout */}
          <div className="my-12 border-t border-b border-zinc-200 py-8 text-center px-4">
            <p className="text-xl md:text-2xl font-serif italic text-zinc-900 leading-relaxed font-medium">
              "The Guest Concierge Engine starts the guest journey. The Hospitality Commerce Agent completes it."
            </p>
            <span className="text-[10px] font-mono text-[#EA6639] uppercase tracking-widest font-bold mt-3 block">
              Ever's Guest OS Operational Core
            </span>
          </div>
        </article>
      </section>

      {/* 4. Interactive Tabs Section (Perk Feature Tabs style) */}
      <section className="py-24 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase font-bold mb-4 block">
              SYSTEM BLUEPRINT
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold tracking-tight text-zinc-950 leading-[1.08] mb-6 max-w-2xl mx-auto">
              The Guest Engagement Layer of Ever's Guest OS.
            </h2>
            <div className="space-y-4 max-w-2xl mx-auto">
              <p className="text-zinc-700 text-base sm:text-lg md:text-[19px] font-light leading-relaxed">
                The Guest Concierge Engine (GCE) centralises guest communication across every channel, captures and qualifies enquiries, and manages non-transactional guest operations.
              </p>
              <p className="text-zinc-500 text-xs sm:text-sm font-light leading-relaxed max-w-xl mx-auto">
                It provides hotels with one consistent engagement layer that keeps conversations connected, contextual and operationally actionable.
              </p>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-10 bg-[#FAF9F5] p-1.5 rounded-full border border-zinc-200 w-fit mx-auto">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "all" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                All Capabilities
              </button>
              <button 
                onClick={() => setActiveTab("operations")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "operations" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Operations
              </button>
              <button 
                onClick={() => setActiveTab("technology")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "technology" ? "bg-[#EA6639] text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Technology
              </button>
              <button 
                onClick={() => setActiveTab("leads")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "leads" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Lead Capture
              </button>
            </div>
          </div>

          {/* Bento Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredFeatures.map((f) => {
              const IconComp = f.icon;
              const isAccent = f.title === "Unified Guest Engagement";
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  key={f.id}
                  className={`rounded-[2rem] p-8 border flex flex-col justify-between transition-all duration-300 ${isAccent ? 'bg-[#EA6639] border-[#EA6639] text-white shadow-xl shadow-[#EA6639]/10' : 'bg-white hover:bg-[#FAF9F5]/40 border-zinc-200/80 shadow-sm'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[9px] font-mono uppercase tracking-widest font-semibold px-3 py-1 rounded-md ${isAccent ? 'bg-white/15 text-white' : 'bg-zinc-100 text-zinc-600 border border-zinc-200'}`}>
                        {f.badge}
                      </span>
                      <IconComp className={`w-5 h-5 ${isAccent ? 'text-white' : 'text-[#EA6639]'}`} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">{f.title}</h3>
                    <p className={`text-xs font-normal leading-relaxed ${isAccent ? 'text-white/90' : 'text-zinc-600'}`}>{f.desc}</p>
                  </div>
                  
                  <div className="border-t border-current/10 pt-4 mt-6 flex justify-between items-center">
                    <span className="font-mono text-[10px] uppercase tracking-wider font-semibold opacity-75">Target metrics</span>
                    <span className="font-bold text-xs">{f.metric}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>


        </div>
      </section>

      {/* 4.5. Section 4 — How the Guest Concierge Engine Works */}
      <section className="py-24 bg-[#FAF9F5] border-t border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Transition Statement */}
          <div className="text-center max-w-2xl mx-auto">
            <p className="text-zinc-900 font-serif italic text-lg sm:text-xl leading-relaxed mb-4">
              "Every interaction leaves the Guest Concierge Engine with complete context, allowing operational teams or the Hospitality Commerce Agent to continue the guest journey without repeating conversations or losing information."
            </p>
            <span className="text-[10px] font-mono text-[#EA6639] uppercase tracking-widest font-bold mt-2 block">
              COORDINATION PRINCIPLE
            </span>
          </div>
        </div>
      </section>

      {/* 5. Direct Side-by-Side Capability Matrix Table */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-[#FAF9F5] border border-zinc-200 rounded-[2.5rem] p-8 md:p-12">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">FRAMEWORK ARCHITECTURE</span>
            <h2 className="text-3xl md:text-4xl text-zinc-950 font-semibold tracking-tight mt-1">GCE vs. HCA Capability Matrix</h2>
            <p className="text-zinc-500 font-light text-xs mt-3">
              Understanding where the Guest Concierge Engine stops and where the Hospitality Commerce Agent begins is crucial for proper property strategic allocation (p. 3).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-light text-xs">
              <thead>
                <tr className="border-b border-zinc-300 font-medium text-zinc-950">
                  <th className="py-4 pr-4">PLATFORM COMPONENT</th>
                  <th className="py-4 px-4 bg-zinc-200/40 rounded-t-xl">GUEST CONCIERGE ENGINE (GCE)</th>
                  <th className="py-4 pl-4">HOSPITALITY COMMERCE AGENT (HCA)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Deployment Channels</td>
                  <td className="py-4 px-4 bg-zinc-200/40">Dual-Channel Max (Web system + 1 Choice Channel)</td>
                  <td className="py-4 pl-4">Complete Omnichannel Suite (WhatsApp Business, IG, FB, Telegram, SMS, Voice)</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Direct PMS Integration</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-red-500 dark:text-red-650 font-medium font-mono text-xs flex items-center gap-1">
                    ❌ OFF (Read-only isolated proxy limit)
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ ACTIVE (Opera, Cloudbeds, Mews)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">In-Chat Reservations</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Full direct transactions
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Financial Checkouts</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Integrated Payment Gateways (Stripe, Paystack, etc.)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Revenue Upselling</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Predictive late checkouts & amenity offers
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Silent Escalation Briefs</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Active
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Active
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Pricing Layout */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6 relative">
         <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-5 space-y-6">
               <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">Standard Model</span>
               <h2 className="text-3xl md:text-5xl font-semibold text-zinc-950 tracking-tight leading-[1.05]">
                  Clear upfront setup value. Zero complex cuts.
               </h2>
               <p className="text-zinc-600 font-light leading-relaxed">
                  We formulate our GCE pricing plan strictly around operational relief. Because your focus is preserving high-fidelity human resources, we charge zero margins or commissions on agent resolution. 
               </p>
               <p className="text-zinc-600 font-light leading-relaxed">
                  You acquire an isolated, dedicated environment trained perfectly to your hotel profile, maintained for a predictable flat monthly rate.
               </p>
            </div>

            <div className="md:col-span-7 bg-white rounded-[2.5rem] border border-zinc-200/80 shadow-xl overflow-hidden p-8 md:p-12 relative flex flex-col justify-between">
               <div className="absolute top-0 right-0 bg-[#EA6639] text-white text-[10px] font-mono uppercase tracking-widest font-bold py-2 px-6 rounded-bl-3xl">GCE Tier</div>
               
               <div>
                  <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold mb-6">UPFRONT ENVIRONMENT SETUP</div>
                  <div className="flex items-end gap-2 mb-8 border-b border-zinc-200 pb-8">
                     <span className="text-6xl font-semibold tracking-tighter text-zinc-950">$79</span>
                     <span className="text-zinc-500 mb-2 font-mono text-xs uppercase tracking-wider font-semibold">/ One-time setup fee</span>
                  </div>

                  <div className="font-mono text-xs text-zinc-500 uppercase tracking-widest mb-2 font-bold mb-6">CORE SYSTEM RECURRING LICENSE</div>
                  <div className="flex items-end gap-2 mb-8">
                     <span className="text-6xl font-semibold tracking-tighter text-zinc-950">$36</span>
                     <span className="text-zinc-500 mb-2 font-mono text-xs uppercase tracking-wider font-semibold">/ property / month</span>
                  </div>

                  <hr className="border-zinc-200 my-8" />
                  
                  <ul className="space-y-4 mb-2">
                     <li className="flex gap-4 text-xs text-zinc-600">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Dedicated software environment and security upkeep.
                     </li>
                     <li className="flex gap-4 text-xs text-zinc-800">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Customized property indexing & custom knowledge base mapping.
                     </li>
                     <li className="flex gap-4 text-xs text-zinc-800">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Zero commission fees (0% Performance Alignment Fee).
                     </li>
                  </ul>
               </div>

               <Link to="/signup" className="w-full text-center bg-zinc-950 text-white font-semibold py-4 rounded-xl shadow-lg hover:bg-zinc-800 transition-colors mt-10">
                  Deploy Custom GCE Model
               </Link>
            </div>
         </div>
      </section>

      {/* 2. GCE Performance & Operational Outcomes (Statistics Row) */}
      <section className="border-b border-zinc-200/60 bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">90%+</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Guest Enquiries<br/>Managed</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-l border-zinc-100 lg:border-l-0">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-[#EA6639] font-sans">&lt; 15s</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Average<br/>Response Time</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-t lg:border-t-0 border-zinc-100 lg:border-l lg:border-zinc-100">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">34%</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Lead<br/>Qualification Rate</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-t lg:border-t-0 border-zinc-100 border-l border-zinc-100">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">100%</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Operational<br/>Requests Coordinated</span>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Business Outcomes Section — Business Outcomes That Extend Beyond Guest Communication */}
      <section className="py-24 bg-zinc-950 text-white relative border-t border-zinc-900 leading-relaxed overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EA6639] via-transparent to-transparent"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="max-w-3xl mx-auto mb-16">
            <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-3">BUSINESS OUTCOMES</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white mb-6 leading-tight">
              Business Outcomes That Extend Beyond Guest Communication.
            </h2>
            <p className="text-zinc-400 font-light text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              The Guest Concierge Engine helps hotels respond faster, operate with greater consistency and create more meaningful guest experiences by keeping every interaction connected and actionable.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative max-w-6xl mx-auto"
          >
            <div className="min-h-[550px] bg-[#111111] rounded-[2.5rem] overflow-hidden border-4 border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative flex items-center justify-center p-6 md:p-12">
               <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EA6639] via-zinc-950 to-zinc-950"></div>
               
               {/* Symmetrical mockup items */}
               <div className="relative z-10 w-full h-full flex justify-center gap-8 items-center flex-col lg:flex-row">
                  
                  {/* Left Column: OutcomeCards - Card 1 & Card 2 */}
                  <div className="w-full lg:w-[280px] flex flex-col gap-5 text-left">
                    {/* Card 1: Continuous Guest Engagement */}
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-[#EA6639]/30 transition-all duration-300 min-h-[140px]">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded">
                            01 / ENGAGEMENT
                          </span>
                          <MessageSquare className="w-4.5 h-4.5 text-[#EA6639]" />
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight mb-2">Continuous Guest Engagement</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                          Deliver timely, consistent guest communication across every touchpoint.
                        </p>
                      </div>
                    </div>

                    {/* Card 2: Qualified Opportunities */}
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-[#EA6639]/30 transition-all duration-300 min-h-[140px]">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded">
                            02 / OPPORTUNITIES
                          </span>
                          <Cpu className="w-4.5 h-4.5 text-[#EA6639]" />
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight mb-2">Qualified Opportunities</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                          Capture and qualify guest enquiries before they become missed commercial opportunities.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Central Smartphone Mockup representing direct chat workflow */}
                  <div className="w-[300px] md:w-[320px] h-[500px] bg-[#1A1A1A] rounded-2xl border border-zinc-800 shadow-xl flex flex-col relative overflow-hidden text-left shrink-0">
                    <div className="px-5 py-3 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/90">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-[#EA6639]/20 flex items-center justify-center border border-[#EA6639]/30">
                          <Bot className="w-3.5 h-3.5 text-[#EA6639]" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-white">Boutique Guest Concierge</p>
                          <p className="text-[8px] text-[#EA6639] font-mono tracking-widest font-bold mt-0.5">ONLINE RESOLUTION</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 p-5 flex flex-col gap-3 font-light text-[11px] overflow-y-auto bg-zinc-950/20">
                        <div className="self-end max-w-[85%] bg-[#EA6639] text-white p-3 rounded-2xl rounded-tr-sm shadow-sm leading-relaxed">
                          Hi, do you have standard Wi-Fi, and when does the fitness center lock up tonight?
                        </div>
                        <div className="self-start max-w-[85%] bg-zinc-800 text-zinc-200 p-3 rounded-2xl rounded-tl-sm shadow-sm border border-zinc-700/40 space-y-2 leading-relaxed">
                          <p>Standard Wi-Fi is complimentary! Connect to <strong>Boutique_Guest</strong>. No password is required.</p>
                          <p>The fitness center is on the lower lobby level and remains open 24/7 for all checked-in guests using your keycard.</p>
                        </div>
                    </div>
                  </div>

                  {/* Right Column: OutcomeCards - Card 3 & Card 4 */}
                  <div className="w-full lg:w-[280px] flex flex-col gap-5 text-left">
                    {/* Card 3: Operational Consistency */}
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-[#EA6639]/30 transition-all duration-300 min-h-[140px]">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded">
                            03 / OPERATIONAL
                          </span>
                          <Layers className="w-4.5 h-4.5 text-[#EA6639]" />
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight mb-2">Operational Consistency</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                          Provide hotel teams with complete guest context to reduce delays and improve service delivery.
                        </p>
                      </div>
                    </div>

                    {/* Card 4: Actionable Insights */}
                    <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-zinc-800/80 p-6 flex flex-col justify-between hover:border-[#EA6639]/30 transition-all duration-300 min-h-[140px]">
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[8px] font-mono uppercase tracking-widest font-semibold px-2 py-0.5 bg-zinc-800/60 text-zinc-400 border border-zinc-700/50 rounded">
                            04 / INSIGHTS
                          </span>
                          <Sparkles className="w-4.5 h-4.5 text-[#EA6639]" />
                        </div>
                        <h4 className="text-sm font-semibold text-white tracking-tight mb-2">Actionable Insights</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                          Understand guest behaviour and engagement trends to continuously improve operations.
                        </p>
                      </div>
                    </div>
                  </div>

               </div>
            </div>
          </motion.div>

          {/* Closing Statement & Explicit Transition to Hospitality Commerce Agent */}
          <div className="mt-20 text-center max-w-4xl mx-auto border-t border-zinc-900 pt-12 space-y-6">
            <p className="text-zinc-100 font-serif italic text-lg sm:text-2xl leading-relaxed max-w-3xl mx-auto">
              "Every connected conversation strengthens guest relationships, improves operational visibility and prepares the next stage of the guest journey."
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-5 text-left max-w-3xl mx-auto">
              <span className="text-[#EA6639] font-mono text-[9px] uppercase font-bold tracking-widest bg-[#EA6639]/10 border border-[#EA6639]/20 px-3 py-1.5 rounded-lg shrink-0">
                TRANSITION TO HCA
              </span>
              <p className="text-zinc-400 text-xs font-light leading-relaxed">
                While the Guest Concierge Engine manages engagement and operational context, the Hospitality Commerce Agent transforms qualified opportunities into bookings, revenue and coordinated service delivery.
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* Why Ever's Guest OS Section — Platform pay-off */}
      <PlatformIntegration />

      {/* 7. FAQ Section */}
      <section className="py-24 bg-white border-t border-zinc-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 text-zinc-950 tracking-tight">Questions & Answers</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="border-b border-zinc-200">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-6 pr-8 text-left relative flex items-center justify-between group"
                  >
                    <span className="text-base font-semibold text-zinc-900 group-hover:text-[#EA6639] transition-colors">{faq.q}</span>
                    <ChevronDown className={`w-5 h-5 text-zinc-400 absolute right-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  {isOpen && (
                    <p className="pb-6 text-xs text-zinc-500 leading-relaxed font-light">{faq.a}</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Cards block in dark theme mimicking template image */}
      <section className="py-24 bg-zinc-950 text-white leading-relaxed">
        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15
              }
            }
          }}
          className="max-w-[1400px] mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          
          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="h-full">
            <Link
              to="/signup"
              className="h-full bg-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">DEPLOY ENGINE</span>
                <h3 className="text-2xl font-semibold mb-3">Initiate GCE Pilot</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Deploy the Guest Concierge Engine for a $79 setup investment to immediately resolve routine lobby operational bottlenecks.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 border border-zinc-700 px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-white group-hover:text-black transition-colors mt-8">
                Onboard <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="h-full">
            <Link
              to="/commerce-agent"
              className="h-full bg-gradient-to-br from-zinc-950 to-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-2xl relative"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#EA6639]/10 blur-3xl rounded-full"></div>
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">TRANSACTIONAL UPGRADE</span>
                <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                  Discover HCA <Sparkles className="w-5 h-5 text-[#EA6639]" />
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Shift from non-transactional support to direct conversational commerce with full live PMS mappings & secure checkouts.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 bg-[#EA6639] text-white px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-[#ff7a4f] transition-colors mt-8 shadow-md">
                View Commerce Agent <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } }} className="h-full">
            <Link
              to="/help-desk#demo"
              className="h-full bg-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">LIVE EVALUATION</span>
                <h3 className="text-2xl font-semibold mb-3">See it in action</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Evaluate a fully simulated WhatsApp concierge chat trained on a sample property dataset. Explore structural escalation metrics.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 border border-zinc-700 px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-white group-hover:text-black transition-colors mt-8">
                Request a demo <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </section>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden border border-zinc-800">
            <button 
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 bg-black/50 text-white hover:bg-black/80 p-2 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/slWAWmqdicY?autoplay=1"
              title="Guest Concierge System Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}
