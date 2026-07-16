import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { 
  Building, 
  Check, 
  MessageSquare, 
  ArrowRight, 
  TrendingUp, 
  Zap, 
  ShieldCheck, 
  DollarSign, 
  Clock, 
  Layers, 
  Coffee,
  Sparkles,
  Server,
  UserCheck,
  ClipboardList
} from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";

interface UseCaseCardProps {
  icon: React.ReactNode;
  category: string;
  title: string;
  pmsSync: string;
  description: string;
  bullets: string[];
  metric: { value: string; label: string };
}

/* 1. USE CASES HERO COMPONENT */
export function UseCasesHero() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative pt-32 pb-16">
      {/* Abstract background decorative overlay */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-[#EA6639]/5 rounded-full blur-[110px] pointer-events-none" />
      
      <div className="max-w-4xl text-left space-y-6 relative z-10">
        <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3.5 py-1.5 rounded-full font-semibold inline-block">
          OPERATIONAL CAPABILITIES
        </span>
        
        <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-semibold tracking-tight text-zinc-950 font-sans leading-[1.08]">
          Production-ready <span className="text-[#EA6639]">connected workflows</span> for modern hospitality.
        </h1>

        <p className="text-lg sm:text-xl text-zinc-850 font-light max-w-3xl leading-relaxed border-l-2 border-[#EA6639]/30 pl-6">
          Explore how Ever's Guest OS transforms everyday hotel operations into connected, intelligent workflows that improve guest experiences, simplify operations and strengthen direct commercial performance.
        </p>

        <div className="pt-4 flex flex-wrap gap-4">
          <InteractiveButton to="/signup" className="text-white bg-[#EA6639] border-none px-8 py-4">
            Deploy Ever
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </InteractiveButton>
          <Link
            to="/help-desk"
            className="px-8 py-4 border border-[#111111]/25 hover:border-black font-semibold rounded-full text-xs text-zinc-900 transition-all hover:bg-zinc-100 flex items-center justify-center bg-white"
          >
            Talk to Solutions Engineering
          </Link>
        </div>
      </div>
    </section>
  );
}

/* 2. USE CASE CARDS / BENTO GRID COMPONENT */
function UseCaseCard({ icon, category, title, pmsSync, description, bullets, metric }: UseCaseCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-white border border-zinc-200/80 rounded-[32px] p-8 lg:p-10 shadow-[0_4px_30px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_45px_rgba(234,102,57,0.05)] transition-all flex flex-col justify-between group relative overflow-hidden"
    >
      {/* Decorative gradient glow on hover */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#EA6639]/5 to-transparent rounded-full blur-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div>
        {/* Card Header Category + PMS Badging */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <span className="text-[10px] font-mono font-bold tracking-wider text-[#EA6639] uppercase bg-[#EA6639]/10 px-2.5 py-1 rounded-full">
            {category}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 rounded-md text-[10px] font-mono text-zinc-500">
            <Server className="w-3 h-3 text-zinc-400" />
            <span>Sync: {pmsSync}</span>
          </div>
        </div>

        {/* Title */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-8 h-8 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-[#EA6639] shrink-0 mt-1">
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl font-semibold text-zinc-950 tracking-tight leading-snug group-hover:text-[#EA6639] transition-colors">
            {title}
          </h3>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm leading-relaxed text-zinc-600 font-light mb-6">
          {description}
        </p>

        {/* Bullets */}
        <ul className="space-y-3 mb-8">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-xs text-zinc-850">
              <span className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-2.5 h-2.5 stroke-[3]" />
              </span>
              <span className="font-light">{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Outcome Footer */}
      <div className="border-t border-zinc-100 pt-5 flex flex-col justify-end mt-auto">
        <span className="text-[9px] uppercase tracking-wider font-mono text-zinc-400 font-semibold mb-1">
          {metric.value}
        </span>
        <p className="text-xs font-medium text-zinc-800 leading-normal">
          {metric.label}
        </p>
      </div>
    </motion.div>
  );
}

export function UseCaseCards() {
  const useCasesList: UseCaseCardProps[] = [
    {
      icon: <Clock className="w-4 h-4" />,
      category: "Front Desk & Operations",
      title: "Late Checkout & Early Check-In Coordination",
      pmsSync: "Two-Way Integration",
      description: "Ever enables guests to request late check-outs and early check-ins through familiar messaging channels without requiring front-desk intervention for every interaction. The platform coordinates guest communication, manages approval workflows, securely collects applicable payments and keeps operational teams informed throughout the process, creating a smoother experience for both guests and hotel staff.",
      bullets: [
        "Coordinates late departure requests and processes clean fees.",
        "Directly updates room status parameters in Opera, Mews, or Cloudbeds.",
        "Notifies housekeeping teams with real-time room priorities.",
        "Saves hours of front-desk manual triage daily."
      ],
      metric: { value: "Operational Outcome", label: "Faster guest service with fewer manual operational touchpoints." }
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      category: "Revenue & Commerce",
      title: "Direct Guest Upselling",
      pmsSync: "Live Service Catalog Mapping",
      description: "Ever delivers personalised room upgrades, premium services and ancillary offers throughout the guest journey using contextual conversations. Hotels retain complete ownership of the guest relationship while creating more opportunities to generate direct revenue from existing guests without increasing operational workload.",
      bullets: [
        "Enables bespoke room upgrades and premium amenities.",
        "Retains 100% of the guest booking value without third-party commission fees.",
        "Secures transactions inside popular messaging applications.",
        "Integrates with internal property services and local calendars."
      ],
      metric: { value: "Direct Yield", label: "More direct ancillary revenue through personalised guest engagement." }
    },
    {
      icon: <MessageSquare className="w-4 h-4" />,
      category: "Guest Support",
      title: "Instant Guest Assistance",
      pmsSync: "Real-Time Guest Mapping",
      description: "Ever provides guests with immediate answers to frequently asked questions, hotel information, service availability and operational guidance across multiple communication channels. When additional support is required, conversations are seamlessly escalated to hotel staff with the full guest context preserved.",
      bullets: [
        "Coordinates multi-channel guest questions about hotel policies and amenities.",
        "Provides frictionless transfer of conversations to on-property teams.",
        "Logs operational tickets directly to internal task systems.",
        "Relieves front-desk pressure during high-occupancy cycles."
      ],
      metric: { value: "Support Delivery", label: "Consistent guest communication with intelligent operational escalation." }
    },
    {
      icon: <ClipboardList className="w-4 h-4" />,
      category: "Operations",
      title: "Guest Requests & Service Coordination",
      pmsSync: "Auto Task Assignment",
      description: "Ever receives, understands and coordinates guest requests across hotel departments through one connected operational workflow. From housekeeping and concierge services to maintenance requests and special guest preferences, every interaction remains organised, traceable and operationally aligned.",
      bullets: [
        "Unifies guest messaging from multiple channels into a single dashboard.",
        "Bridges operations, front desk, and housekeeping departments instantly.",
        "Tracks completion status of every request in real time.",
        "Eliminates communication errors and forgotten guest requests."
      ],
      metric: { value: "Operational Alignment", label: "Connected guest service without operational bottlenecks." }
    },
    {
      icon: <Coffee className="w-4 h-4" />,
      category: "Food & Beverage",
      title: "Guest Service Ordering",
      pmsSync: "POS Integration",
      description: "Guests can conveniently request food, beverages and hotel services through conversational messaging while Ever coordinates each request with the appropriate operational teams. The experience remains simple for guests while helping hotels streamline service delivery across departments.",
      bullets: [
        "Syncs menu updates and daily items directly from point-of-sale systems.",
        "Posts incidental food and beverage charges directly to the guest folio.",
        "Automates language translation for international guest requests.",
        "Provides real-time confirmation to guests as orders are fulfilled."
      ],
      metric: { value: "Fulfillment Loop", label: "Simplified guest ordering with coordinated operational fulfilment." }
    },
    {
      icon: <UserCheck className="w-4 h-4" />,
      category: "Local Guides & Concierge",
      title: "Local Experience Recommendations",
      pmsSync: "Curated Knowledge Sync",
      description: "Ever delivers personalised recommendations for nearby attractions, restaurants, transportation and local experiences based on guest interests and the purpose of their stay. Hotels can enhance guest satisfaction while promoting trusted local experiences that add value throughout the guest journey.",
      bullets: [
        "Incorporate custom curator guides and select dining recommendations.",
        "Provide transportation guidance and local partner links.",
        "Promote trusted local partners to generate community goodwill.",
        "Strengthen property-to-guest loyalty through thoughtful, local advice."
      ],
      metric: { value: "Guest Retention", label: "More engaging guest experiences beyond the hotel room." }
    },
    {
      icon: <Layers className="w-4 h-4" />,
      category: "Enterprise",
      title: "Enterprise Capability Engineering",
      pmsSync: "Custom Engagement",
      description: "Beyond Ever's core operational capabilities, we collaborate with enterprise hospitality organisations to engineer specialised workflows where they deliver measurable operational or commercial value. Every engagement is evaluated against strategic fit, scalability and platform alignment.",
      bullets: [
        "Enables bespoke systems integration with legacy or proprietary databases.",
        "Extends standard guest workflows to accommodate complex brand standards.",
        "Co-develops specialized operational modules alongside Ever's product engineers.",
        "Strengthens security isolation with private cloud and regional deployment nodes."
      ],
      metric: { value: "Enterprise Outcome", label: "Specialised capabilities engineered for enterprise operations." }
    }
  ];

  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative pb-24">
      {/* Title & subtitle */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16">
        <div className="max-w-3xl">
          <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest font-bold flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA6639]" />
            Infrastructure modules currently deployed
          </h2>
          <p className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950 mt-2 font-sans">
            Every workflow executes autonomously while synchronizing with your PMS, booking engine and operational systems.
          </p>
        </div>
        <span className="text-xs text-zinc-500 font-mono whitespace-nowrap bg-zinc-100 border border-zinc-200 px-3 py-1.5 rounded-lg">
          *Compatible with Opera, Mews, Guesty, Cloudbeds & Apaleo
        </span>
      </div>

      {/* The Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {useCasesList.map((useCase, idx) => (
          <UseCaseCard 
            key={idx}
            icon={useCase.icon}
            category={useCase.category}
            title={useCase.title}
            pmsSync={useCase.pmsSync}
            description={useCase.description}
            bullets={useCase.bullets}
            metric={useCase.metric}
          />
        ))}
      </div>
    </section>
  );
}

/* 3. PCI PAYMENT / INCIDENTAL ENGINE COMPONENT */
export function PCIEngine() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-20 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-zinc-950 text-white rounded-[40px] p-8 sm:p-12 md:p-16 relative overflow-hidden border border-zinc-900 shadow-2xl"
      >
        {/* Spotlight overlay */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-[#EA6639]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          <div className="lg:col-span-8 space-y-6 text-left">
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/15 px-3 py-1 rounded-full border border-[#EA6639]/20 inline-block">
              Secure Middleware Sandbox
            </span>
            <h2 className="text-2xl sm:text-3.5xl font-sans font-bold text-zinc-100 tracking-tight leading-[1.12]">
              PCI-1 Compliant Incidental Charging Engine
            </h2>
            <p className="text-sm font-light text-zinc-400 max-w-2xl leading-relaxed">
              Ever securely processes guest payments through trusted payment infrastructure while reducing manual handling of sensitive payment information. Secure payment workflows help hotels simplify incidental charges and strengthen guest confidence throughout the booking and stay experience.
            </p>
            
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {[
                "GDPR & PCI-DSS V4 Secure Card token decoupling",
                "Direct token handoff via certified Hospitality API gateways",
                "Zero-latency WebSockets mapping incidentals to PMS guest Folios",
                "Supports Apple Pay, Google Pay, and localized bank rails"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-xs text-zinc-200">
                  <span className="w-5 h-5 rounded-full bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-[#EA6639]" />
                  </span>
                  <span className="font-light">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4 flex flex-col items-center justify-center text-center p-6 bg-zinc-900/60 border border-zinc-800 rounded-[28px] space-y-5">
            <ShieldCheck className="w-8 h-8 text-[#EA6639]" />
            <div>
              <div className="text-xs uppercase font-mono text-zinc-500 tracking-wider">Security Architecture</div>
              <div className="text-2xl font-bold tracking-tight text-white mt-1">PCI-DSS Level 1</div>
              <span className="text-[9px] text-zinc-400 font-mono tracking-wide mt-1 block">Certified Payment Infrastructure</span>
            </div>
            <InteractiveButton to="/signup" className="text-white w-full bg-[#EA6639] border-none">
              Verify Compliance Standards
            </InteractiveButton>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

/* 4. USE CASES CTA COMPONENT */
export function UseCasesCTA() {
  return (
    <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center pb-24">
      <div className="bg-[#FFF4EF] border border-[#EA6639]/20 rounded-[32px] py-16 px-6 sm:px-12 flex flex-col items-center max-w-4xl mx-auto shadow-xs relative overflow-hidden">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#EA6639] opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#EA6639] opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
        
        <Sparkles className="w-8 h-8 text-[#EA6639] mb-6 animate-pulse" />
        <h2 className="text-2xl sm:text-3.5xl font-semibold text-zinc-950 tracking-tight max-w-2xl leading-snug">
          Ready to modernise guest operations?
        </h2>
        <p className="text-sm sm:text-base text-zinc-700 mt-4 max-w-2xl font-light leading-relaxed">
          Discover how Ever's Guest OS helps hotels connect guest engagement, commercial execution and operational delivery through one intelligent operating platform.
        </p>
        
        <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
          <InteractiveButton
            to="/signup"
            className="text-white bg-[#EA6639] border-none px-8 py-4"
          >
            Deploy Ever
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </InteractiveButton>
          <InteractiveButton
            to="/help-desk"
            className="bg-white !text-zinc-700 hover:bg-zinc-50 border border-zinc-200 px-8 py-4"
          >
            Talk to Solutions Engineering
          </InteractiveButton>
        </div>
      </div>
    </section>
  );
}

/* MAIN COMPONENT COMPOSTION */
export function UseCases() {
  return (
    <div className="bg-[#FBFBFA] min-h-screen text-zinc-900 font-sans selection:bg-[#EA6639]/30 overflow-x-hidden">
      <UseCasesHero />
      <UseCaseCards />
      <PCIEngine />
      <UseCasesCTA />
    </div>
  );
}
