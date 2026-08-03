/**
 * @file CommerceAgent.tsx
 * @description Comprehensive, article-style product page for Ever's Hospitality Commerce Agent (HCA).
 *
 * DESIGN TEMPLATE EXTRACTION (JSON Format)
 * ----------------------------------------
 * {
 *   "designSystem": {
 *     "background": "Cream-white background (#FAF9F5) with intense warm-orange (#EA6639) transaction status colors",
 *     "typography": {
 *       "headings": "Space Grotesk / Inter bold tracking-tight displays",
 *       "article": "Rich typography, classic lettrines, pull-quotes, and detailed parameters",
 *       "monospace": "JetBrains Mono for currency metrics, commission values, and webhook properties"
 *     },
 *     "layout": {
 *       "hero": {
 *         "badge": "Pill containers depicting commerce-aligned status symbols",
 *         "headline": "Bold display tracking of direct-to-consumer transaction parameters",
 *         "mockup": "Central checkout terminal showing a Stripe link in WhatsApp with dynamic ledger synchronization"
 *       },
 *       "socialProof": "Grayscale row tracking of premium regional payment gateways and PMS partners",
 *       "interactiveTabs": "Responsive button arrays enabling instant categorization of commerce technologies",
 *       "bentoGrid": {
 *         "structure": "Asymmetrical multi-column blocks supporting high-fidelity component graphics",
 *         "cards": {
 *           "premiumCard": "Luxurious pitch-black card with glowing status states depicting sub-second ledger sync",
 *           "chartCard": "Bento blocks displaying live booking commissions and net margin curves"
 *         }
 *       },
 *       "faqAccordion": "Stacked disclosure components with linear arrow indicators",
 *       "footerCTACards": "Three distinctive transactional and demo request cards styled on custom borders"
 *     }
 *   }
 * }
 */

import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { 
  ArrowRight, 
  ShoppingCart, 
  CreditCard, 
  ChevronDown, 
  Star, 
  Building2, 
  Sparkles, 
  Users, 
  ShieldCheck, 
  Layers, 
  Repeat, 
  Percent, 
  TrendingUp, 
  Coins, 
  Receipt,
  Play,
  X,
  Calendar,
  MessageSquare,
  ClipboardList,
  ShoppingBag
} from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";
import { useState } from "react";
import { PlatformIntegration } from "./PlatformIntegration";

export function CommerceAgent() {
  const [activeTab, setActiveTab] = useState<"all" | "billing" | "revenue" | "pms">("all");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  const faqs = [
    {
      q: "Does Ever take a commission on offline checkout or lobby swipes?",
      a: "No. The 3% Performance Dividend success fee applies strictly and exclusively to guest reservations and transactions completed autonomously by the HCA in-chat funnel. Any self-booked, lobby-swiped, or direct web booking remains entirely commission-free."
    },
    {
      q: "How does the sub-second PMS ledger writeback operate?",
      a: "As soon as the financial gateway (Stripe, Paystack, or Adyen) returns a successful charge hook, the HCA securely speaks to your PMS API. It locates the guest's folio by booking ID or verified phone number and appends the customized transaction amount as a finalized room charge, formatted for instant reconciliation."
    },
    {
      q: "What payment processors are natively supported by the checkout engine?",
      a: "We support industry-leading global gateways including Stripe, Adyen, and regional merchant systems like Paystack and Flutterwave, allowing secure multi-currency checkouts natively in-chat."
    },
    {
      q: "Is sensitive guest cardholder data stored on Ever's servers?",
      a: "Never. The HCA leverages end-to-end tokenization. Guest credit card fields are loaded via PCI-DSS compliant secure frames provided directly by the gateway. Ever only handles transient webhook payloads and never retains raw card configurations."
    }
  ];

  const features = [
    {
      id: "direct-booking",
      category: "revenue",
      title: "Direct Booking Execution",
      metric: "18.4% Conv Rate",
      desc: "Convert qualified guest intent into confirmed direct bookings through a frictionless booking journey.",
      icon: Building2,
      badge: "Direct Commerce"
    },
    {
      id: "integrated-payments",
      category: "billing",
      title: "Integrated Payments",
      metric: "< 15 Sec Settled",
      desc: "Deliver secure, connected payment experiences that support the entire guest journey.",
      icon: CreditCard,
      badge: "Revenue Operations"
    },
    {
      id: "operational-fulfilment",
      category: "pms",
      title: "Operational Fulfilment",
      metric: "99.2% Executed",
      desc: "Coordinate fulfilment across departments with complete commercial and guest context.",
      icon: Receipt,
      badge: "Operational Fulfilment"
    },
    {
      id: "revenue-intelligence",
      category: "revenue",
      title: "Revenue Intelligence",
      metric: "Real-Time ROI",
      desc: "Understand commercial performance and identify opportunities to improve direct revenue.",
      icon: TrendingUp,
      badge: "Commercial Execution"
    },
    {
      id: "commerce-automation",
      category: "billing",
      title: "Commerce Automation",
      metric: "100% Controlled",
      desc: "Standardise repeatable commercial workflows while keeping hotel teams in control.",
      icon: ShieldCheck,
      badge: "Direct Commerce"
    },
    {
      id: "connected-guest-fulfilment",
      category: "pms",
      title: "Connected Guest Fulfilment",
      metric: "Zero Friction",
      desc: "Ensure every confirmed transaction reaches the right operational teams without unnecessary manual coordination.",
      icon: Layers,
      badge: "Operational Fulfilment"
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
        <div className="absolute bottom-12 right-1/4 w-[500px] h-[500px] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none" />

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
                The Commercial Operating Layer<br />of Ever's Guest OS.
              </h1>
              
              <p className="text-zinc-800 font-light text-base md:text-lg leading-relaxed max-w-lg mb-8">
                The Hospitality Commerce Agent (HCA) transforms qualified guest intent into bookings, payments and coordinated operational fulfilment.
                <br /><br />
                By connecting commerce with hotel operations, the HCA enables hotels to capture more direct revenue while delivering a seamless guest journey.
              </p>
              
              <div className="flex flex-wrap items-center gap-5">
                <InteractiveButton to="/signup" className="text-white">
                  Start Free
                </InteractiveButton>
                <button 
                  onClick={() => setIsVideoOpen(true)}
                  className="text-zinc-700 hover:text-[#005BFF] transition-colors font-semibold text-xs flex items-center gap-1 group cursor-pointer"
                >
                  Watch Demo <Play className="w-4 h-4 transition-transform group-hover:scale-110 text-[#EA6639] fill-current" />
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
                    title="Commerce Agent System Demo Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </motion.div>
                
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 2. socialProof Gateway Logos (styled matching light alignment theme) */}
      <section className="border-b border-zinc-200/50 bg-[#FAF9F5] py-8 text-center text-zinc-800">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <span className="text-[10px] font-mono tracking-widest text-[#EA6639] font-bold uppercase">VERIFIED FINANCIAL INTEGRATION MATCHPOINTS</span>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 text-zinc-500 font-mono grayscale opacity-65 font-bold text-lg tracking-tighter">
            <div>STRIPE GATEWAY</div>
            <div className="font-sans font-black">Adyen</div>
            <div>PAYSTACK API</div>
            <div className="font-serif italic font-medium">Flutterwave</div>
            <div>OPERA MEWS RECONCILED</div>
          </div>
        </div>
      </section>

      {/* 3. Deep Article Section */}
      <section id="article" className="py-28 max-w-4xl mx-auto px-4 md:px-6 scroll-mt-20">
        <article className="prose prose-zinc prose-lg mx-auto font-light leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[#EA6639] prose-headings:text-zinc-950 text-zinc-700">
          <span className="text-[11px] font-mono text-[#EA6639] tracking-widest uppercase font-bold block mb-3">Enterprise Brief</span>
          <h2 className="text-3xl md:text-5xl text-zinc-950 mb-8 font-semibold tracking-tight leading-tight">
            Hospitality Doesn't Have a Demand Problem.<br />It Has a Commerce Problem.
          </h2>
          
          <p className="first-letter:text-6xl first-letter:font-bold first-letter:text-[#EA6639] first-letter:mr-3 first-letter:float-left first-letter:leading-[0.8] mb-8">
            E<span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-sans">very day, hotels lose high-intent guests</span> through disconnected booking journeys, fragmented payment experiences and operational delays.
          </p>

          <p className="mb-8">
            Guest intent is created in one system, bookings happen in another and fulfilment depends on multiple disconnected teams. The result is unnecessary friction, lower direct revenue and inconsistent guest experiences.
          </p>

          {/* Symmetrical Quote Block */}
          <div className="my-14 border-l-4 border-[#EA6639] pl-6 bg-white py-8 pr-8 rounded-r-3xl shadow-sm">
            <p className="italic text-zinc-900 text-lg leading-relaxed font-normal mb-2">
              "Revenue isn't lost because guests aren't interested.<br /><br />It's lost when commercial intent cannot move seamlessly from conversation to confirmation."
            </p>
            <cite className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold not-italic">
              — Ever Guest OS Commerce Insight
            </cite>
          </div>

          <p className="mb-12 text-zinc-900 font-medium">
            The Hospitality Commerce Agent was built to eliminate this disconnect by bringing commerce, payments and operational fulfilment into one continuous workflow.
          </p>

          <h3 className="text-2xl text-zinc-950 font-semibold mb-4 mt-12 tracking-tight">
            The Hospitality Commerce Agent: Unifying Commercial Execution.
          </h3>
          <p className="mb-8">
            The **Hospitality Commerce Agent (HCA)** was architected to eliminate these inefficiencies. Moving beyond passive guides, HCA is a direct commerce engine designed to communicate directly with existing Property Management Systems (Opera, Cloudbeds, Mews) to locate live room inventories and append line-item charges instantly to guest folios.
          </p>
          <p className="mb-8">
            HCA operates on a fully unified omnichannel footprint, handling concurrent guest interactions across WhatsApp, Instagram, Facebook Messenger, SMS, and Conversational Voice lines. When a guest requests an upgrade, late checkout, or dining package, the HCA determines availability, generates secure payment tokens, and settles the payment natively using your connected Stripe, Paystack, or Adyen processor, keeping card details completely secure.
          </p>
          <p className="mb-8">
            To protect property margins from high-volume transaction costs, the HCA bypasses traditional commissions in favor of a predictable monthly SaaS base combined with a risk-aligned performance fee computed exclusively on transaction revenue generated directly by the agent, strengthening existing commercial operations.
          </p>
        </article>
      </section>

      {/* 4. Interactive Tabs Section (Perk Feature Tabs style) */}
      <section className="py-24 bg-white border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-950">
              The Commercial Execution Layer of Ever's Guest OS.
            </h2>
            <p className="text-zinc-800 font-light text-base mt-4 leading-relaxed max-w-2xl mx-auto">
              The Hospitality Commerce Agent (HCA) transforms qualified guest intent into confirmed bookings, secure payments and coordinated service delivery.
              <br /><br />
              By connecting commercial activity with hotel operations, the HCA enables every transaction to move seamlessly from decision to fulfilment.
            </p>

            {/* Filter buttons */}
            <div className="flex flex-wrap justify-center gap-2 mt-8 bg-[#FAF9F5] p-1.5 rounded-full border border-zinc-200 w-fit mx-auto">
              <button 
                onClick={() => setActiveTab("all")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "all" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                All Features
              </button>
              <button 
                onClick={() => setActiveTab("billing")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "billing" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Settlement
              </button>
              <button 
                onClick={() => setActiveTab("revenue")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "revenue" ? "bg-[#EA6639] text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                Revenue
              </button>
              <button 
                onClick={() => setActiveTab("pms")}
                className={`px-5 py-2 rounded-full text-xs font-semibold uppercase tracking-wider transition-all ${activeTab === "pms" ? "bg-zinc-900 text-white shadow-md" : "text-zinc-600 hover:text-zinc-900"}`}
              >
                PMS Sync
              </button>
            </div>
          </div>

          {/* Bento Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
            {filteredFeatures.map((f) => {
              const IconComp = f.icon;
              const isAccent = f.title === "Operational Fulfilment";
              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5 }}
                  key={f.id}
                  className={`rounded-[2rem] p-8 border flex flex-col justify-between transition-all duration-300 ${isAccent ? 'bg-zinc-950 border-zinc-900 text-white shadow-2xl' : 'bg-[#FAF9F5]/30 hover:bg-[#FAF9F5]/75 border-zinc-200'}`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-6">
                      <span className={`text-[9px] font-mono uppercase tracking-widest font-bold px-3 py-1 rounded-md ${isAccent ? 'bg-zinc-800 text-zinc-300 border border-zinc-700' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'}`}>
                        {f.badge}
                      </span>
                      <IconComp className={`w-5 h-5 ${isAccent ? 'text-[#EA6639]' : 'text-zinc-900'}`} />
                    </div>
                    <h3 className="text-xl font-bold tracking-tight mb-2">{f.title}</h3>
                    <p className={`text-xs font-light leading-relaxed ${isAccent ? 'text-zinc-400' : 'text-zinc-500'}`}>{f.desc}</p>
                  </div>
                  
                  <div className="border-t border-current/10 pt-4 mt-6 flex justify-between items-center">
                    <span className="font-mono text-xs uppercase tracking-wider font-semibold opacity-75">Target metrics</span>
                    <span className="font-bold text-xs text-[#EA6639] font-mono">{f.metric}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Section Transition */}
          <div className="mt-16 text-center max-w-3xl mx-auto border-t border-zinc-100 pt-12">
            <p className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-3">Seamless Transition</p>
            <p className="text-zinc-800 font-light text-sm md:text-base leading-relaxed">
              The Hospitality Commerce Agent ensures every commercial interaction continues with the same context established by the Guest Concierge Engine, creating one uninterrupted guest journey from enquiry to fulfilment.
            </p>
          </div>
        </div>
      </section>

      {/* 4. From Intent to Fulfilment (Section 4) */}
      <section className="py-24 bg-[#FAF9F5] border-t border-b border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          
          {/* Section Heading & Supporting Copy */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-3">Operational Life Cycle</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-zinc-950 font-sans">
              From Guest Intent to Operational Fulfilment.
            </h2>
            <p className="text-zinc-800 font-light text-base mt-4 leading-relaxed max-w-2xl mx-auto">
              The Hospitality Commerce Agent connects every stage of the commercial journey, ensuring bookings, payments and operational fulfilment happen within one continuous workflow instead of disconnected systems.
            </p>
          </div>

          {/* Operational Workflow Steps Diagram */}
          <div className="relative mb-20">
            {/* Desktop Line Connector */}
            <div className="absolute top-[35px] left-[5%] right-[5%] h-[1px] bg-zinc-200 hidden lg:block" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-8 lg:gap-4 relative z-10">
              {[
                { number: "01", label: "Qualified Guest Intent", desc: "Guest shows purchase intent in conversation" },
                { number: "02", label: "Offer & Recommendation", desc: "HCA queries inventory and presents contextual options" },
                { number: "03", label: "Booking Confirmation", desc: "Frictionless in-chat reservation lock in real-time" },
                { number: "04", label: "Secure Payment", desc: "Native tokenized settlement directly linked to folio" },
                { number: "05", label: "Operational Fulfilment", desc: "Automated routing of tasks to housekeeping, spa, or kitchen" },
                { number: "06", label: "Guest Experience Delivered", desc: "Seamless service delivery at the physical property" },
                { number: "07", label: "Commercial Insights", desc: "Real-time ROI, direct booking logs & revenue analysis" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col items-center text-center group">
                  {/* Circle Node */}
                  <div className="w-[70px] h-[70px] rounded-full bg-white border border-zinc-200 flex items-center justify-center shadow-sm group-hover:border-[#EA6639] group-hover:shadow-md transition-all duration-300 relative">
                    <span className="font-mono text-sm text-[#EA6639] font-bold">{step.number}</span>
                    {/* Dynamic Indicator */}
                    <div className="absolute -bottom-1 w-2 h-2 rounded-full bg-[#EA6639] scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </div>
                  
                  {/* Step Labels */}
                  <p className="mt-4 font-semibold text-zinc-900 text-xs tracking-tight leading-snug px-2">
                    {step.label}
                  </p>
                  
                  <p className="mt-1.5 text-zinc-500 font-light text-[10px] leading-relaxed max-w-[130px] mx-auto transition-colors duration-200 group-hover:text-zinc-800">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Transition Statement Block */}
          <div className="text-center max-w-2xl mx-auto border border-zinc-200/80 bg-white/60 backdrop-blur-sm p-6 rounded-2xl shadow-sm mb-20">
            <p className="text-zinc-800 font-serif italic text-base md:text-lg leading-relaxed">
              "The Hospitality Commerce Agent doesn't simply complete transactions. It ensures every commercial commitment is successfully fulfilled across the hotel."
            </p>
          </div>

          {/* Capability Cards (4 cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EA6639]/5 border border-[#EA6639]/10 flex items-center justify-center mb-5 group-hover:bg-[#EA6639]/10 transition-colors">
                  <Sparkles className="w-5 h-5 text-[#EA6639]" />
                </div>
                <h4 className="font-semibold text-zinc-950 text-base tracking-tight mb-2">Offer Intelligence</h4>
                <p className="text-zinc-800 font-light text-xs leading-relaxed">
                  Present relevant rooms, upgrades and services based on guest intent and operational availability.
                </p>
              </div>
              <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest pt-4 mt-4 border-t border-zinc-100 font-bold">
                Intent Segmentation
              </div>
            </div>
            
            {/* Card 2 */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EA6639]/5 border border-[#EA6639]/10 flex items-center justify-center mb-5 group-hover:bg-[#EA6639]/10 transition-colors">
                  <Calendar className="w-5 h-5 text-[#EA6639]" />
                </div>
                <h4 className="font-semibold text-zinc-950 text-base tracking-tight mb-2">Booking Execution</h4>
                <p className="text-zinc-800 font-light text-xs leading-relaxed">
                  Manage direct bookings through a streamlined, friction-free confirmation process.
                </p>
              </div>
              <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest pt-4 mt-4 border-t border-zinc-100 font-bold">
                Direct Transactions
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EA6639]/5 border border-[#EA6639]/10 flex items-center justify-center mb-5 group-hover:bg-[#EA6639]/10 transition-colors">
                  <CreditCard className="w-5 h-5 text-[#EA6639]" />
                </div>
                <h4 className="font-semibold text-zinc-950 text-base tracking-tight mb-2">Payment Coordination</h4>
                <p className="text-zinc-800 font-light text-xs leading-relaxed">
                  Connect secure payments directly with guest bookings and operational workflows.
                </p>
              </div>
              <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest pt-4 mt-4 border-t border-zinc-100 font-bold">
                Secure Settlement
              </div>
            </div>

            {/* Card 4 */}
            <div className="bg-white border border-zinc-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 flex flex-col justify-between group">
              <div>
                <div className="w-10 h-10 rounded-xl bg-[#EA6639]/5 border border-[#EA6639]/10 flex items-center justify-center mb-5 group-hover:bg-[#EA6639]/10 transition-colors">
                  <Layers className="w-5 h-5 text-[#EA6639]" />
                </div>
                <h4 className="font-semibold text-zinc-950 text-base tracking-tight mb-2">Fulfilment Coordination</h4>
                <p className="text-zinc-800 font-light text-xs leading-relaxed">
                  Automatically notify the right operational teams with complete booking and guest context.
                </p>
              </div>
              <div className="font-mono text-[9px] text-zinc-400 uppercase tracking-widest pt-4 mt-4 border-t border-zinc-100 font-bold">
                Operational Writes
              </div>
            </div>
          </div>

          {/* Strategic Editorial Note */}
          <div className="mt-16 text-center max-w-3xl mx-auto border-t border-zinc-200/60 pt-12">
            <p className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-4">Core Philosophy</p>
            <p className="text-2xl md:text-3xl font-serif italic text-zinc-900 leading-relaxed max-w-2xl mx-auto mb-4">
              "Hospitality isn't measured by completed bookings.<br className="hidden md:inline" /> It's measured by fulfilled promises."
            </p>
            <p className="text-zinc-800 font-light text-sm md:text-base leading-relaxed">
              Every confirmed booking becomes an operational commitment, ensuring guest expectations are delivered consistently across every department.
            </p>
          </div>

        </div>
      </section>

      {/* 5. GCE vs HCA Comparative Table Matrix */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6">
        <div className="bg-[#FAF9F5] border border-zinc-200 rounded-[2.5rem] p-8 md:p-12">
          <div className="max-w-2xl mb-12">
            <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">FRAMEWORK ARCHITECTURE</span>
            <h2 className="text-3xl md:text-4xl text-zinc-950 font-semibold tracking-tight mt-1">HCA vs. GCE Capability Matrix</h2>
            <p className="text-zinc-500 font-light text-xs mt-3">
              Review where the Hospitality Commerce Agent steps forward to establish live, autonomous in-chat reservations and ledger writes (p. 3).
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-light text-xs">
              <thead>
                <tr className="border-b border-zinc-300 font-medium text-zinc-950">
                  <th className="py-4 pr-4">PLATFORM COMPONENT</th>
                  <th className="py-4 px-4 bg-zinc-200/40 rounded-t-xl">HOSPITALITY COMMERCE AGENT (HCA)</th>
                  <th className="py-4 pl-4">GUEST CONCIERGE ENGINE (GCE)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-zinc-800">
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Deployment Channels</td>
                  <td className="py-4 px-4 bg-zinc-200/40 font-medium">Complete Omnichannel Suite (WhatsApp, IG, FB, Telegram, SMS, Voice)</td>
                  <td className="py-4 pl-4">Dual-Channel Max (Web system + 1 Choice Channel)</td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Direct PMS Integration</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs">
                    ✓ ACTIVE (Opera, Cloudbeds, Mews)
                  </td>
                  <td className="py-4 pl-4 text-red-500 font-medium font-mono text-xs">
                    ❌ OFF (Read-only isolated proxy limit)
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">In-Chat Reservations</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs animate-pulse">
                    ✓ Full direct transactions
                  </td>
                  <td className="py-4 pl-4 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Financial Checkouts</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Native payment gateway syncing
                  </td>
                  <td className="py-4 pl-4 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Revenue Upselling</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Active predictive extensions & upgrades
                  </td>
                  <td className="py-4 pl-4 text-red-500 font-medium font-mono text-xs">
                    ❌ Disabled
                  </td>
                </tr>
                <tr>
                  <td className="py-4 pr-4 font-semibold text-zinc-900">Tenant Isolation Security</td>
                  <td className="py-4 px-4 bg-zinc-200/40 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Active sandboxing
                  </td>
                  <td className="py-4 pl-4 text-emerald-600 font-medium font-mono text-xs">
                    ✓ Active sandboxing
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 6. Pricing Plan & Representative Unit Economics */}
      <section className="py-24 max-w-7xl mx-auto px-4 md:px-6 relative">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-6">
               <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">Premium Core Model</span>
               <h2 className="text-3xl md:text-5xl font-semibold text-zinc-950 tracking-tight leading-[1.05]">
                  Predicitve return. Aligning with your transaction growth.
               </h2>
               <p className="text-zinc-800 font-light leading-relaxed">
                  We align our pricing model directly with your direct-booking success. Backed by a clean, flat recurring hosting base, our performance fee is computed exclusively on transactions processed natively by the agent.
               </p>
               <p className="text-zinc-800 font-light leading-relaxed">
                  There are no hidden computational data liabilities. All variable processing overhead is passed cleanly to your tenant setup, ensuring total operational safety for Ever owners as transactions scale.
               </p>
            </div>

            <div className="lg:col-span-7 bg-zinc-950 text-white rounded-[2.5rem] p-8 md:p-12 relative flex flex-col justify-between border border-zinc-900 shadow-2xl overflow-hidden">
               <div className="absolute top-0 right-0 bg-[#EA6639] text-white text-[10px] font-mono uppercase tracking-widest font-bold py-2 px-6 rounded-bl-3xl animate-pulse">HCA Tier</div>
               
               <div>
                  <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1 font-bold">UPFRONT IMPLEMENTATION INVESTMENT</div>
                  <div className="flex items-end gap-2 mb-8 border-b border-zinc-800 pb-8 mt-2">
                     <span className="text-3xl font-semibold tracking-tight">Custom Base Quote</span>
                     <span className="text-zinc-500 mb-1.5 font-mono text-xs uppercase tracking-wider font-semibold">/ Variable setup fee</span>
                  </div>

                  <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1 font-bold">CORE PLATFORM MONTHLY LICENSE</div>
                  <div className="flex items-end gap-2 mb-8">
                     <span className="text-6xl font-semibold tracking-tighter text-white">$99</span>
                     <span className="text-zinc-500 mb-2 font-mono text-xs uppercase tracking-wider font-semibold">/ property / month</span>
                  </div>

                  <div className="font-mono text-xs text-zinc-400 uppercase tracking-widest mb-1 font-bold">AUTONOMOUS PERFORMANCE DIVIDEND</div>
                  <div className="flex items-end gap-2 mb-8">
                     <span className="text-6xl font-semibold tracking-tighter text-[#EA6639]">3%</span>
                     <span className="text-zinc-500 mb-2 font-mono text-xs uppercase tracking-wider font-semibold">/ On Agent-Generated Gross booking</span>
                  </div>

                  <hr className="border-zinc-800 my-8" />
                  
                  <ul className="space-y-4 mb-2">
                     <li className="flex gap-4 text-xs text-zinc-300">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Complete enterprise mapping, custom PMS integration, and financial gateway onboarding.
                     </li>
                     <li className="flex gap-4 text-xs text-zinc-300">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Permanent structural conversation archives and synchronized guest profiles (p. 3).
                     </li>
                     <li className="flex gap-4 text-xs text-zinc-300">
                        <Star className="w-4.5 h-4.5 text-[#EA6639] fill-current shrink-0 mt-0.5" />
                        Fully managed, high-availability dedicated virtualizer container.
                     </li>
                  </ul>
               </div>

               <Link to="/signup" className="w-full text-center bg-white text-zinc-950 font-semibold py-4 rounded-xl shadow-lg hover:bg-zinc-100 transition-colors mt-10">
                  Request Custom Integration Map
               </Link>
            </div>
         </div>
      </section>

      {/* 2b. HCA Performance & Commercial Outcomes (Statistics Row) */}
      <section className="border-y border-zinc-200/60 bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">$140k+</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Direct Revenue<br/>Captured</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-l border-zinc-100 lg:border-l-0">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-[#EA6639] font-sans">18.4%</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Booking<br/>Conversion</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-t lg:border-t-0 border-zinc-100 lg:border-l lg:border-zinc-100">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">99.2%</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Operational Workflows<br/>Executed</span>
            </div>
            <div className="flex flex-row items-center justify-center gap-3 text-center p-1 border-t lg:border-t-0 border-zinc-100 border-l border-zinc-100">
              <span className="text-lg sm:text-xl font-semibold tracking-tight text-zinc-950 font-sans">14,200+</span>
              <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 font-medium text-left">Guest Transactions<br/>Managed</span>
            </div>
          </div>
        </div>
      </section>

      {/* Moved Interactive System Mockup Section */}
      <section className="py-24 bg-zinc-950 text-white relative border-t border-zinc-900 leading-relaxed overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#EA6639] via-transparent to-transparent"></div>
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="max-w-2xl mx-auto mb-12">
            <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">LIVE TRANSACTION PREVIEW</span>
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white">Hospitality Commerce Agent Terminal</h2>
            <p className="text-zinc-400 font-light mt-2 text-xs">
              Observe how automated upsells, upgrades, and late checkout transactions sync instantly with core PMS systems.
            </p>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="min-h-[550px] bg-[#E8E6DF] rounded-[2.5rem] overflow-hidden border-4 border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] relative flex flex-col md:flex-row items-center justify-center p-6 md:p-12 gap-8 md:gap-12">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>

              {/* Smartphone Checkout Emulator */}
              <div className="w-[300px] md:w-[320px] h-[550px] bg-[#111111] rounded-[2rem] shadow-2xl border-4 border-zinc-900 overflow-hidden flex flex-col relative shrink-0 text-left">
                 <div className="absolute top-0 w-full h-5 bg-zinc-900 flex justify-center items-center">
                   <div className="w-16 h-3.5 bg-black rounded-b-md"></div>
                 </div>
                 
                 <div className="mt-6 px-4 border-b border-zinc-800 pb-2 bg-zinc-950/80 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-[11px] leading-tight">Palazzo Resort Chat</h4>
                      <p className="text-[8px] font-mono text-emerald-400 font-bold uppercase">SECURE COMMERCE ACTIVE</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                 </div>

                 <div className="flex-1 p-4 bg-zinc-900/60 flex flex-col gap-3 font-light text-[10px] overflow-y-auto">
                   <div className="self-end max-w-[80%] bg-[#EA6639] text-white p-2.5 rounded-2xl rounded-tr-sm leading-relaxed">
                     Awesome, can we book the private pool villa upgrade for tonight instead? 
                   </div>
                   
                   <div className="self-start max-w-[85%] bg-zinc-800 text-zinc-400 p-2.5 rounded-2xl rounded-tl-sm border border-zinc-700/50 space-y-1 session-text">
                     <p>Checking live inventory...</p>
                     <p className="text-emerald-400 font-semibold">✓ Villa 12 is available!</p>
                     <p>Would you like to authorize the upgrade charge of $180.00?</p>
                   </div>

                   <div className="self-start max-w-[85%] bg-zinc-800/40 text-zinc-300 p-3 rounded-2xl rounded-tl-sm border border-zinc-700 w-full space-y-2 mt-1">
                      <div className="flex justify-between font-semibold border-b border-zinc-700 pb-1.5 font-sans">
                         <span>Pool Villa Upgrade</span>
                         <span className="text-[#EA6639] font-mono font-bold">$180.00</span>
                      </div>
                      <button className="w-full bg-emerald-600 text-white py-1.5 rounded-md font-bold uppercase font-mono text-[9px] hover:bg-emerald-500 transition-colors">
                         Tap to confirm booking
                      </button>
                   </div>
                 </div>
              </div>

              {/* Symmetrical ledger sync panel representing direct writes */}
              <div className="flex-1 max-w-sm w-full block text-left">
                <div className="bg-[#111111] rounded-2xl p-6 shadow-2xl border border-zinc-800 text-white flex flex-col justify-between h-full min-h-[280px]">
                   <div>
                     <div className="flex justify-between items-center border-b border-zinc-800 pb-4 mb-4">
                       <h4 className="font-bold text-xs tracking-tight text-zinc-200">PMS API Ledger Injector</h4>
                       <span className="bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold tracking-wider">SECURE WRITE</span>
                     </div>

                     <div className="space-y-4">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-[#EA6639]/10 flex items-center justify-center border border-[#EA6639]/30">
                           <Receipt className="w-4 h-4 text-[#EA6639]" />
                         </div>
                         <div className="flex-1">
                           <p className="text-xs font-bold text-zinc-100 font-sans">Folio Append: Villa Upgrade</p>
                           <p className="text-[10px] text-zinc-500 font-mono">STATUS: COMMITTED (LINE_ID_904)</p>
                         </div>
                         <span className="text-xs font-mono font-bold text-emerald-400">+$180.00</span>
                       </div>

                       <div className="flex items-center gap-3 opacity-40">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-zinc-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-zinc-300 font-sans">Late Checkout Room 14</p>
                            <p className="text-[10px] text-zinc-500 font-mono">RECONCILED • STRIPE</p>
                          </div>
                          <span className="text-xs font-mono">+$45.00</span>
                       </div>
                     </div>
                   </div>

                   <div className="pt-4 border-t border-zinc-800 mt-4 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                     <span>Target Socket: mews-websocket</span>
                     <span>Uptime: 99.98%</span>
                   </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Ever's Guest OS Section — Platform pay-off */}
      <PlatformIntegration
        tagline="CONNECTED PLATFORM"
        heading={
          <>
            Commercial Execution Is More Powerful<br className="hidden md:inline" /> When Everything Is Connected.
          </>
        }
        subheading1="The Hospitality Commerce Agent is designed to operate as part of Ever's Guest OS."
        subheading2="Working alongside the Guest Concierge Engine, it creates one continuous operating model where guest engagement, commerce and hotel operations remain connected from the first enquiry to the final guest experience."
        customBlocks={[
          {
            id: "gce-block",
            badge: "ENGAGEMENT",
            title: "Guest Concierge Engine",
            desc: "Captures guest intent, qualifies enquiries and manages non-transactional guest engagement.",
            icon: MessageSquare,
            color: "from-blue-500/10 to-transparent",
            iconColor: "text-blue-600",
          },
          {
            id: "hca-block",
            badge: "COMMERCE",
            title: "Hospitality Commerce Agent",
            desc: "Transforms qualified intent into bookings, payments and coordinated operational fulfilment.",
            icon: ShoppingBag,
            color: "from-[#EA6639]/10 to-transparent",
            iconColor: "text-[#EA6639]",
          },
          {
            id: "guest-os-block",
            badge: "PLATFORM",
            title: "Ever's Guest OS",
            desc: "Connects both operational layers into one continuous operating environment for modern hospitality.",
            icon: ClipboardList,
            color: "from-emerald-500/10 to-transparent",
            iconColor: "text-emerald-600",
          }
        ]}
        closingQuote={
          "Connected Guest Operations begins with engagement, continues through commerce and is completed through coordinated operational delivery.\n\nThat's the operating model behind Ever's Guest OS."
        }
      />

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
      <section className="py-24 bg-zinc-950 text-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          
          {/* Final CTA Header Block */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-3">NEXT STEPS</span>
            <h2 className="text-3xl md:text-5xl font-semibold tracking-tight text-white font-sans">
              Ready to Modernise Guest Operations?
            </h2>
            <p className="text-zinc-400 font-light text-base mt-4 leading-relaxed max-w-2xl mx-auto">
              See how Ever's Guest OS connects guest engagement, commerce and operations into one continuous guest journey.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <Link
              to="/signup"
              className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">DEPLOY SYSTEM</span>
                <h3 className="text-2xl font-semibold mb-3">Initiate HCA Setup</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Begin advanced security synchronization to directly sync your Mews or Cloudbeds accounts to our isolated Docker setup.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 border border-zinc-700 px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-white group-hover:text-black transition-colors mt-8">
                Onboard <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/guest-concierge"
              className="bg-gradient-to-br from-zinc-950 to-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-2xl relative"
            >
              <div className="absolute right-0 top-0 w-32 h-32 bg-[#EA6639]/10 blur-3xl rounded-full"></div>
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">OPERATIONAL BASE</span>
                <h3 className="text-2xl font-semibold mb-3 flex items-center gap-2">
                  Discover GCE <Sparkles className="w-5 h-5 text-[#EA6639]" />
                </h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Review how the Guest Concierge Engine acts as an ambient front-desk extension, resolving ninety percent of repetitive FAQs for $36/month.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 bg-[#EA6639] text-white px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-[#ff7a4f] transition-colors mt-8 shadow-md">
                View Guest Concierge <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

            <Link
              to="/help-desk#demo"
              className="bg-[#1A1A1A] border border-zinc-800 p-8 rounded-[2rem] hover:bg-zinc-900 hover:border-zinc-700 transition-all group relative overflow-hidden flex flex-col justify-between min-h-[320px]"
            >
              <div>
                <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">LIVE EVALUATION</span>
                <h3 className="text-2xl font-semibold mb-3">See it in action</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm">
                  Request a custom integration map to align payment gateways (Stripe, Paystack) with your local currency ledger specs.
                </p>
              </div>
              <div className="inline-flex items-center w-fit gap-2 border border-zinc-700 px-5 py-2.5 rounded-full text-xs font-semibold group-hover:bg-white group-hover:text-black transition-colors mt-8">
                Request a demo <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>

          </div>
        </div>
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
              title="Hospitality Commerce Agent System Demo Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

    </div>
  );
}
