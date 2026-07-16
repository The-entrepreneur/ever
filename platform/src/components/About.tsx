import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { InteractiveButton } from "./InteractiveButton";
import {
  ArrowRight,
  Shield,
  Layers,
  HeartHandshake,
  CheckCircle2,
  Workflow,
  Sparkles,
  Zap,
  Cpu,
  RefreshCw,
  Building2,
  ChevronRight,
  TrendingUp,
  Sliders,
  DollarSign,
  Lock,
  Compass,
  Users,
  Eye,
  Activity,
  Award,
  Linkedin
} from "lucide-react";

export function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 18,
      },
    },
  };

  const flowSteps = [
    { label: "Guest", desc: "The source of every interaction" },
    { label: "Communication", desc: "Intelligent messaging interface" },
    { label: "Payments", desc: "Secure tokenized transactions" },
    { label: "Operations", desc: "Real-time housekeeping & coordination" },
    { label: "Automation", desc: "Autonomous workflow routing" },
    { label: "Insights", desc: "Deep analytics and telemetry" },
    { label: "Revenue", desc: "Optimized direct yield" }
  ];

  return (
    <div className="bg-[#FBFBFA] text-zinc-900 pb-24 font-sans selection:bg-[#EA6639]/30 overflow-x-hidden">
      
      {/* 1. Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-4xl mx-auto text-center"
        >
          <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3.5 py-1.5 rounded-full mb-6 font-semibold inline-block">
            ABOUT EVER
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6.5xl font-semibold tracking-tight leading-[1.08] text-zinc-950">
            Building the operating infrastructure for{" "}
            <span className="text-[#EA6639]">modern hospitality.</span>
          </h1>
          
          <div className="mt-12 text-left max-w-3xl mx-auto space-y-6 border-l-2 border-[#EA6639]/30 pl-6 sm:pl-8">
            <p className="text-xl sm:text-2xl text-zinc-900 font-light leading-relaxed">
              Ever exists to solve one problem: <strong className="font-semibold text-zinc-950">hospitality technology has become fragmented.</strong>
            </p>
            <p className="text-base sm:text-lg text-zinc-700 font-light leading-relaxed">
              Hotels shouldn't need dozens of disconnected systems to communicate with guests, process payments, manage operations, automate workflows, and grow direct revenue.
            </p>
            <p className="text-base sm:text-lg text-[#EA6639] font-medium leading-relaxed">
              We're building the operating layer that unifies these experiences into one intelligent platform, giving independent hotels and resorts enterprise-grade capabilities without enterprise complexity.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Section 1: The Hospitality Software Problem */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block font-bold">
              The Industry Reality
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-semibold tracking-tight text-zinc-950 leading-[1.1]">
              Hospitality has evolved.<br />
              Its software <span className="italic font-serif text-[#EA6639]">hasn't.</span>
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-zinc-200/80 p-8 sm:p-10 rounded-[32px] shadow-xs space-y-6">
              <p className="text-base sm:text-lg text-zinc-800 font-light leading-relaxed">
                Over the last decade, hotels have adopted dozens of specialized tools.
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  "A PMS for reservations",
                  "A CRM for guests",
                  "A payment gateway",
                  "Messaging software",
                  "Booking engines",
                  "Housekeeping tools",
                  "Upsell platforms",
                  "Analytics dashboards"
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 px-4 py-3 bg-zinc-50 rounded-xl border border-zinc-150 text-xs font-mono text-zinc-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#EA6639]" />
                    {item}
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100 text-sm sm:text-base text-zinc-700 font-light leading-relaxed">
                <p>
                  Each solves one problem. Together they create operational friction.
                </p>
                <p className="font-medium text-zinc-900">
                  The result is duplicated work, fragmented guest experiences, increased staff training, expensive integrations, and technology that often works against hotel teams instead of supporting them.
                </p>
                <p>
                  Ever was created to change that.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Our Philosophy */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <span className="text-[10px] font-mono uppercase text-[#EA6639] tracking-widest block font-bold">
            OUR PHILOSOPHY
          </span>
          <h2 className="text-3xl sm:text-4.5xl md:text-5xl font-semibold tracking-tight text-zinc-950 leading-tight">
            "We believe software should disappear into operations."
          </h2>
          <div className="h-0.5 w-16 bg-[#EA6639] mx-auto my-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-left">
            {[
              { title: "Invisible", desc: "Guests shouldn't notice it." },
              { title: "Frictionless", desc: "Staff shouldn't fight it." },
              { title: "Zero-Maintenance", desc: "Owners shouldn't constantly maintain it." },
              { title: "Value-Focused", desc: "Letting properties focus on what actually creates value: Hospitality." }
            ].map((p, i) => (
              <div key={i} className="p-6 bg-white border border-zinc-200/80 rounded-2xl shadow-xs">
                <span className="text-[10px] font-mono text-[#EA6639] uppercase tracking-wider block mb-1.5 font-semibold">0{i+1}</span>
                <h4 className="text-base font-semibold text-zinc-950 mb-1">{p.title}</h4>
                <p className="text-xs text-zinc-600 font-light leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 3: What Makes Ever Different */}
      <section className="py-20 bg-zinc-900 text-white rounded-[32px] mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 md:p-16 border border-zinc-800 shadow-xl">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-12">
            <span className="text-xs font-mono text-[#EA6639] uppercase tracking-wider block mb-2 font-bold">
              PRINCIPLES
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-semibold tracking-tight text-white">
              What Makes Ever Different
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Building2 className="w-5 h-5 text-[#EA6639]" />,
                title: "Vertical by Design",
                desc: "Purpose-built exclusively for hospitality."
              },
              {
                icon: <Sliders className="w-5 h-5 text-[#EA6639]" />,
                title: "Operational First",
                desc: "Every feature must reduce operational complexity before adding functionality."
              },
              {
                icon: <TrendingUp className="w-5 h-5 text-[#EA6639]" />,
                title: "Revenue Conscious",
                desc: "Every workflow should contribute toward increasing direct revenue or reducing unnecessary operational costs."
              },
              {
                icon: <Workflow className="w-5 h-5 text-[#EA6639]" />,
                title: "Open Infrastructure",
                desc: "Ever integrates with existing hotel systems while providing the flexibility to evolve alongside them."
              }
            ].map((card, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl flex flex-col justify-between min-h-[180px] hover:border-zinc-700 transition-all">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-6">
                  {card.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white mb-2">{card.title}</h3>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Our Design Principles */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3 py-1 rounded-full font-semibold">
            STANDARDS
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 mt-4">
            Our Design Principles
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Simplicity Over Complexity",
              desc: "Less software. More outcomes.",
              sub: "We intentionally reject feature bloat. Every line of code and user interface component must earn its place by simplifying the active guest experience."
            },
            {
              title: "Automation Where It Matters",
              desc: "Automate repetitive work. Never replace human hospitality.",
              sub: "Let systems handle check-out billing, late-checkout calculations, and payments. Free your staff to provide meaningful, present hospitality."
            },
            {
              title: "Transparency",
              desc: "No hidden commissions. No unnecessary lock-ins. No opaque pricing.",
              sub: "No percentage-based capture on guest spend. No vendor holding patterns. Clear, flat alignment focused entirely on the health of your balance sheet."
            },
            {
              title: "Reliability",
              desc: "Mission-critical infrastructure demands consistency—not experimentation.",
              sub: "We design our software pipelines and sandbox instances to act as a resilient operating system. Real-time PMS ledger writes must execute flawlessly, every single time."
            },
            {
              title: "Security",
              desc: "Enterprise-grade protection built into every layer.",
              sub: "From tokenized Stripe integrations to server-side sandbox containers, we ensure raw credentials never cross insecure channels or frontend browsers."
            },
            {
              title: "Long-Term Thinking",
              desc: "We optimize for decades, not quarterly trends.",
              sub: "We are building Ever as an institution. We make platform architectural decisions designed to withstand the next generation of hospitality cycles."
            }
          ].map((principle, idx) => (
            <div key={idx} className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-xs space-y-4 hover:shadow-sm transition-all duration-300">
              <span className="text-[10px] font-mono text-[#EA6639] font-bold block">PRINCIPLE 0{idx+1}</span>
              <div className="space-y-1">
                <h4 className="text-base font-semibold text-zinc-950 tracking-tight">
                  {principle.title}
                </h4>
                <p className="text-xs text-zinc-800 font-medium">
                  {principle.desc}
                </p>
              </div>
              <p className="text-xs text-zinc-500 font-light leading-relaxed border-t border-zinc-100 pt-3">
                {principle.sub}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 5: The Ever Ecosystem (Visual Illustration) */}
      <section className="py-20 bg-zinc-50 border-y border-zinc-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto text-center">
          <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block font-bold mb-3">
            ARCHITECTURE
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
            The Ever Ecosystem
          </h2>
          <p className="text-zinc-600 mt-2 font-light text-sm max-w-lg mx-auto">
            Everything flows through one unified platform.
          </p>

          {/* Visual flowchart */}
          <div className="mt-12 max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-2 items-center relative">
              {flowSteps.map((step, idx) => (
                <div key={idx} className="relative flex flex-col md:flex-row items-center w-full">
                  <div className="bg-white border-2 border-zinc-200 p-5 rounded-2xl shadow-xs flex flex-col items-center justify-center w-full min-h-[110px] relative hover:border-[#EA6639]/40 hover:shadow-sm transition-all">
                    <span className="text-xs font-mono text-zinc-400 font-bold mb-1">0{idx+1}</span>
                    <span className="text-sm font-semibold text-zinc-900">{step.label}</span>
                    <span className="text-[9px] text-zinc-500 font-light mt-1 max-w-[120px] text-center leading-normal">{step.desc}</span>
                  </div>
                  {idx < flowSteps.length - 1 && (
                    <div className="flex items-center justify-center w-full py-2 md:py-0 md:w-auto shrink-0 z-10">
                      <ChevronRight className="w-5 h-5 text-[#EA6639] rotate-90 md:rotate-0" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Who We Build For */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="mb-12">
          <span className="text-xs font-mono text-[#EA6639] uppercase tracking-wider block mb-2 font-bold">
            PARTNERS
          </span>
          <h2 className="text-3xl sm:text-4.5xl font-semibold tracking-tight text-zinc-950">
            Who We Build For
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              title: "Independent Hotels",
              desc: "Empowering independent properties to bypass intermediary margins and regain full data ownership without a bloated, expensive custom IT setup."
            },
            {
              title: "Boutique Hotels",
              desc: "Combining high-touch curated guest personalities with automated, hyper-responsive digital operational layers that operate cleanly in the background."
            },
            {
              title: "Luxury Resorts",
              desc: "Handling complex, multi-faceted itineraries across spa, fine dining reservations, late checkouts, payment routing, and real-time PMS ledger writes."
            },
            {
              title: "Hospitality Groups",
              desc: "Providing centralized multi-property orchestration, standardized security sandboxes, global compliance rules, and aggregated financial intelligence."
            }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-zinc-200/80 p-8 rounded-2xl shadow-xs hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-xl bg-[#FFF1EB] text-[#EA6639] flex items-center justify-center">
                  <span className="font-mono text-sm font-bold">0{idx+1}</span>
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 tracking-tight">{item.title}</h3>
                <p className="text-xs text-zinc-600 font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Team Section: The People Behind Ever */}
      <section className="py-24 bg-zinc-950 text-white border-y border-zinc-800 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle background gradients for premium texture */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#EA6639]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#EA6639]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-[1240px] mx-auto">
          <div className="max-w-3xl mb-16">
            <span className="text-xs font-mono text-[#EA6639] uppercase tracking-wider block mb-2.5 font-bold">
              THE TEAM
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-semibold tracking-tight text-white leading-tight">
              The Custodians of Ever's vision
            </h2>
            <p className="text-sm sm:text-base text-zinc-400 font-light mt-4 leading-relaxed">
              Every platform reflects the people behind it. Ever is built by founders who believe hospitality deserves infrastructure that is dependable, transparent, and designed for long-term operational success.
            </p>
          </div>

          {/* Two Large Founder Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Bryant Oke Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start hover:border-zinc-700 transition-all duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#EA6639]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />
              
              {/* Profile Monogram */}
              <div className="w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EA6639]/15 to-zinc-950" />
                <span className="text-3xl font-semibold tracking-tight text-[#EA6639] relative z-10 font-mono">BO</span>
              </div>

              {/* Bio details */}
              <div className="flex-1 relative z-10 w-full">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="absolute top-0 right-0 text-zinc-500 hover:text-[#EA6639] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Bryant Oke</h3>
                <p className="text-xs font-medium text-[#EA6639] tracking-wider uppercase font-mono mt-1">
                  Founder & Chief Executive Officer
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 mb-4 pb-3 border-b border-zinc-800">
                  Vision • Strategy • Partnerships • Growth
                </p>
                
                <p className="text-xs text-zinc-300 font-light leading-relaxed mb-6">
                  Bryant leads Ever's long-term vision, ensuring every product decision aligns with the operational realities of modern hospitality. His focus is building infrastructure that enables hotels to grow independently while reducing operational complexity through thoughtful technology.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {["Hospitality Infrastructure", "Product Strategy", "Growth", "Enterprise Software"].map((chip) => (
                    <span key={chip} className="text-[9px] bg-zinc-950 border border-zinc-850 text-zinc-400 px-2.5 py-1 rounded-full font-mono">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Dero Idoghor Card */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start hover:border-zinc-700 transition-all duration-300 relative group">
              <div className="absolute inset-0 bg-gradient-to-tr from-[#EA6639]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[32px] pointer-events-none" />
              
              {/* Profile Monogram */}
              <div className="w-28 h-28 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center shrink-0 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#EA6639]/15 to-zinc-950" />
                <span className="text-3xl font-semibold tracking-tight text-[#EA6639] relative z-10 font-mono">DI</span>
              </div>

              {/* Bio details */}
              <div className="flex-1 relative z-10 w-full">
                <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="absolute top-0 right-0 text-zinc-500 hover:text-[#EA6639] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Dero Idoghor</h3>
                <p className="text-xs font-medium text-[#EA6639] tracking-wider uppercase font-mono mt-1">
                  Co-Founder & Chief Systems Architect
                </p>
                <p className="text-[10px] text-zinc-400 font-mono mt-2 mb-4 pb-3 border-b border-zinc-800">
                  Platform Architecture • AI Systems • Payments • Infrastructure
                </p>
                
                <p className="text-xs text-zinc-300 font-light leading-relaxed mb-6">
                  Dero leads Ever's product architecture and systems engineering, translating complex operational challenges into software that feels intuitive, dependable, and scalable. His focus is designing infrastructure that quietly powers exceptional hospitality experiences.
                </p>

                <div className="flex flex-wrap gap-1.5">
                  {["Systems Architecture", "Payments", "AI", "Infrastructure"].map((chip) => (
                    <span key={chip} className="text-[9px] bg-zinc-950 border border-zinc-850 text-zinc-400 px-2.5 py-1 rounded-full font-mono">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Philosophy Strip */}
          <div className="mt-20 border-t border-zinc-800 pt-16">
            <h3 className="text-xl font-semibold text-white mb-10 tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#EA6639] rounded-full" />
              What Guides Our Leadership
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Build for Operators",
                  desc: "Every decision begins with the operational realities of hotel teams. We design features that relieve friction and align with actual on-property needs."
                },
                {
                  title: "Think in Decades",
                  desc: "We're building infrastructure designed to evolve with hospitality, not fleeting trends. Our architectural choices emphasize longevity and continuous resilience."
                },
                {
                  title: "Earn Trust Daily",
                  desc: "Trust isn't a marketing message. It's earned daily and reflected in our platform's reliability, full pricing transparency, and pristine execution."
                }
              ].map((item, idx) => (
                <div key={idx} className="bg-zinc-900/50 border border-zinc-800 p-6 sm:p-8 rounded-2xl hover:border-zinc-700 transition-colors">
                  <span className="text-[10px] font-mono text-[#EA6639] font-bold block mb-2">GUIDE 0{idx+1}</span>
                  <h4 className="text-base font-semibold text-white mb-2">{item.title}</h4>
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Progression Timeline */}
          <div className="mt-20 border-t border-zinc-800 pt-16">
            <h3 className="text-xl font-semibold text-white mb-12 tracking-tight flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[#EA6639] rounded-full" />
              Our Progression Roadmap
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6 relative">
              {[
                { title: "Idea", desc: "Defining the gap in legacy PMS integration patterns." },
                { title: "Industry Research", desc: "100+ deep-dives with hotel operators, owners and revenue managers." },
                { title: "Architecture & Validation", desc: "Mapping secure sandbox container pipelines and high-availability nodes." },
                { title: "Platform Development", desc: "Engineering the core Ever Guest OS middleware engines." },
                { title: "Pilot Partnerships", desc: "Real-world private deployments with luxury boutique resorts." },
                { title: "Commercial Launch", desc: "Scaling robust operating infrastructure for modern hotels worldwide." }
              ].map((step, idx) => (
                <div key={idx} className="relative flex flex-col justify-between p-5 bg-zinc-900/40 border border-zinc-800 rounded-2xl min-h-[150px] hover:border-zinc-700 transition-all">
                  <span className="text-[10px] font-mono text-[#EA6639] font-semibold">PHASE 0{idx+1}</span>
                  <div className="mt-4">
                    <h5 className="text-xs font-bold text-white mb-1.5">{step.title}</h5>
                    <p className="text-[10px] text-zinc-400 font-light leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* Section 7: Operational Outcomes */}
      <section className="py-20 bg-zinc-900 text-white rounded-[32px] mx-4 sm:mx-6 lg:mx-8 px-6 sm:px-12 md:p-16 border border-zinc-800 shadow-xl">
        <div className="max-w-[1240px] mx-auto text-center">
          <span className="text-xs font-mono text-[#EA6639] uppercase tracking-wider block mb-3 font-bold">
            OUTCOMES
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-12">
            Designed to improve measurable outcomes.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
            {[
              { title: "Reduce Repetitive Administrative Work", desc: "Instantly offload checkout updates, payment verification, and basic concierge queries." },
              { title: "Increase Direct Bookings", desc: "Keep guests inside your proprietary ecosystem with conversational upsells and direct room upgrades." },
              { title: "Improve Guest Response Times", desc: "Provide sub-second answers to common questions, room availability, and checkout requests 24/7." },
              { title: "Simplify Payment Workflows", desc: "Isolate transactional credit logs using tokenized payment containers directly linked to billing." },
              { title: "Centralize Operational Visibility", desc: "Gain singular insights on room statuses, check-ins, up-sells, and active staff execution schedules." },
              { title: "Improve Staff Efficiency", desc: "Eliminate repetitive tasks to allow physical operators to deliver pristine experiences on property." }
            ].map((outcome, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl hover:border-zinc-700 transition-all">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-white">{outcome.title}</h4>
                    <p className="text-xs text-zinc-400 font-light leading-relaxed mt-1">{outcome.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8: Our Commitment */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3 py-1 rounded-full font-semibold">
            OUR PROMISE
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950 mt-4">
            Principles we refuse to compromise.
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: "No Manufactured Urgency", desc: "We never employ deceptive sales practices or artificial countdowns on our checkout layers." },
            { title: "No Commission-First Business Model", desc: "Your direct revenue should stay yours. We charge transparent subscriptions, never taking a percentage." },
            { title: "Customer Ownership of Data", desc: "You maintain full custody of guest relationships, contact profiles, and transaction logs. Always." },
            { title: "Transparent Pricing", desc: "No hidden activation parameters, setup surcharges, or post-integration maintenance surprises." },
            { title: "Vendor Neutrality", desc: "We integrate alongside your selected operational tools without dictating your secondary tech selections." },
            { title: "Interoperability First", desc: "We support seamless PMS connections, building on open industry standards like HTNG interoperability." },
            { title: "Privacy by Design", desc: "Complete data isolation and encryption sandbox structures built directly into Ever's container core." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white border border-zinc-200/80 p-6 rounded-xl shadow-xs hover:border-zinc-300 transition-colors flex flex-col justify-between">
              <div className="space-y-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <h4 className="text-xs font-bold text-zinc-950">{item.title}</h4>
                <p className="text-[11px] text-zinc-600 font-light leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 9: Looking Ahead */}
      <section className="py-20 bg-zinc-50 border-t border-b border-zinc-200/60 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1240px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-4">
            <span className="text-[10px] font-mono uppercase text-zinc-500 tracking-wider block font-bold">
              THE HORIZON
            </span>
            <h2 className="text-3xl sm:text-4.5xl font-semibold tracking-tight text-zinc-950 leading-[1.1]">
              Building for the next generation of hospitality.
            </h2>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border border-zinc-200 p-8 sm:p-10 rounded-[32px] shadow-xs space-y-4 text-zinc-700 font-light leading-relaxed text-sm sm:text-base">
              <p>
                Hospitality is entering an era where intelligent systems will quietly assist every stage of the guest journey, from discovery to departure.
              </p>
              <p className="font-semibold text-zinc-900">
                We believe the future isn't replacing hotel teams with AI.
              </p>
              <p>
                It's giving them infrastructure that removes operational friction so they can spend more time creating memorable guest experiences.
              </p>
              <p className="text-[#EA6639] font-medium pt-2">
                That's the future we're building toward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 text-center pt-24">
        <div className="bg-[#FFF4EF] border border-[#EA6639]/20 rounded-[32px] py-16 px-6 sm:px-12 flex flex-col items-center max-w-4xl mx-auto shadow-sm relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#EA6639] opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#EA6639] opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
          
          <Sparkles className="w-8 h-8 text-[#EA6639] mb-6" />
          <h2 className="text-2xl sm:text-3.5xl font-semibold text-zinc-950 tracking-tight max-w-2xl leading-snug">
            The future of hospitality won't be built by adding more software.
          </h2>
          <p className="text-lg text-zinc-800 mt-3 font-serif italic text-zinc-700">
            It will be built by connecting everything that already exists.
          </p>
          <p className="text-xs sm:text-xs text-zinc-600 mt-6 max-w-lg font-light leading-relaxed">
            Whether you're an independent hotel, a technology partner, or an operator rethinking how hospitality should work—we'd love to start the conversation.
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center">
            <InteractiveButton
              to="/signup"
              className="text-white bg-[#EA6639] border-none"
            >
              Explore the Platform
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </InteractiveButton>
            <InteractiveButton
              to="/help-desk"
              className="bg-white !text-zinc-700 hover:bg-zinc-50 border border-zinc-200"
            >
              Talk with Our Team
            </InteractiveButton>
          </div>
        </div>
      </section>

    </div>
  );
}
