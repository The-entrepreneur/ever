import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { InteractiveButton } from "./InteractiveButton";
import { useCurrency } from "../../context/CurrencyContext";
import { MarginCalculator } from "./MarginCalculator";
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Check, 
  Layers, 
  ShieldCheck, 
  Coins, 
  Cpu, 
  BedDouble, 
  CalendarClock,
  FileSpreadsheet
} from "lucide-react";

export function Pricing() {
  const { formatMoney } = useCurrency();

  return (
    <section id="pricing" className="py-16 sm:py-24 bg-[#F9F6F0] border-t border-black/5 text-left">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2 mb-3"
            >
              <div className="w-2 h-2 bg-[#EA6639]"></div>
              <h4 className="font-semibold text-[#111] text-xs sm:text-sm uppercase tracking-wider font-mono">
                HOSPITALITY INFRASTRUCTURE PRICING
              </h4>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className="text-2xl sm:text-4xl lg:text-5xl font-medium leading-tight tracking-tight text-[#111]"
            >
              Aligned With Property Performance. <br className="hidden sm:block" />
              <span className="text-zinc-500 font-serif italic">Not Arbitrary Software Seats.</span>
            </motion.h2>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col items-start md:items-end gap-2"
          >
            <Link
              to="/help-desk"
              className="inline-flex items-center gap-2 bg-[#EA6639] hover:bg-[#d85e34] text-white text-xs font-semibold px-5 py-3 rounded-full transition-all shadow-md group"
            >
              <FileSpreadsheet className="w-4 h-4" />
              Schedule Infrastructure Review
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <span className="text-[11px] text-zinc-500 font-mono">
              Transparent floor starting from {formatMoney(99)}/month
            </span>
          </motion.div>
        </div>

        {/* 4-Component Commercial Framework Summary Pill Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-14"
        >
          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                COMPONENT 1
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">Property Access Base</h4>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Dedicated virtualized container for your hotel. Predictable hosting, starting from <strong className="text-zinc-900">{formatMoney(99)}/mo</strong>.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium">
              <Check className="w-3.5 h-3.5" /> No per-agent seat tax
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                COMPONENT 2
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">Setup & Integration</h4>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                PMS synchronization, knowledge base compilation, staff escalation routing, and gateway webhooks.
              </p>
            </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-zinc-500 font-medium">
            <span>One-time setup &mdash; scoped per property</span>
          </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#EA6639] block mb-1">
                COMPONENT 3
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">Performance Dividend</h4>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Aligns directly with direct commerce. Charged strictly on verified in-chat bookings & upsells across 10 streams.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-emerald-600 font-medium font-mono">
              <span>Success-aligned &mdash; proposal scoped</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                COMPONENT 4
              </span>
              <h4 className="text-sm font-semibold text-zinc-900 mb-1">Zero-Markup Pass-Through</h4>
              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                Raw LLM tokens and official WhatsApp business messages billed directly at wholesale cost with 0% margin.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center gap-1.5 text-[11px] text-zinc-600 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" /> Transparent consumption
            </div>
          </div>
        </motion.div>

        {/* Hospitality Infrastructure Tiers Grid */}
        <div className="mb-14">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
              DEPLOYMENT PROFILES ACCORDING TO ROOM INVENTORY
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Tier 1: Select Property */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between relative hover:border-[#EA6639]/40 transition-colors"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                  ≤ 25 ROOMS
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 mb-1">Select Property</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed mb-5">
                  Boutique hotels, lodges, and luxury inns requiring automated guest communication and direct booking capture.
                </p>

                <div className="py-4 border-y border-zinc-100 mb-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-500">Starting Floor:</span>
                    <span className="text-xl font-semibold text-zinc-950 font-mono">{formatMoney(99)}<span className="text-xs font-normal text-zinc-400">/mo</span></span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Performance Fee:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Setup Scope:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-600 mb-6">
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>WhatsApp & Web live chat concierge</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Native in-chat direct booking & checkout</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Silent staff escalation dispatch</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/help-desk"
                className="w-full text-center block py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Schedule Infrastructure Review
              </Link>
            </motion.div>

            {/* Tier 2: Full-Service Estate */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border-2 border-[#EA6639] shadow-lg flex flex-col justify-between relative"
            >
              <div className="absolute -top-3 left-6 bg-[#EA6639] text-white text-[9px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
                MOST POPULAR
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-[#EA6639] text-[10px] font-mono uppercase font-semibold rounded mb-3 mt-1">
                  26 – 50 ROOMS
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 mb-1">Full-Service Estate</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed mb-5">
                  High-touch lifestyle hotels requiring real-time PMS writeback, room service, and automated pre-arrival upselling.
                </p>

                <div className="py-4 border-y border-zinc-100 mb-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-500">Base Estimate:</span>
                    <span className="text-base font-semibold text-zinc-400 font-mono italic">Custom Proposal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Performance Fee:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Setup Scope:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-600 mb-6">
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Direct PMS sync (Cloudbeds, Mews, Opera)</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Sub-second guest folio ledger writeback</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Predictive room upgrade & late checkout upsell</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/help-desk"
                className="w-full text-center block py-2.5 px-4 bg-[#EA6639] hover:bg-[#d85e34] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
              >
                Schedule Infrastructure Review
              </Link>
            </motion.div>

            {/* Tier 3: Resort Operations */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm flex flex-col justify-between relative hover:border-[#EA6639]/40 transition-colors"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                  51 – 100 ROOMS
                </div>
                <h3 className="text-lg font-semibold text-zinc-950 mb-1">Resort Operations</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed mb-5">
                  Complex resorts with dining outlets, wellness spas, and multi-department operational dispatch.
                </p>

                <div className="py-4 border-y border-zinc-100 mb-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-500">Base Estimate:</span>
                    <span className="text-base font-semibold text-zinc-400 font-mono italic">Custom Proposal</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Performance Fee:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Setup Scope:</span>
                    <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-600 mb-6">
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>F&B table booking & spa scheduling</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>POS integration (Micros, Toast, Lightspeed)</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>Multi-department Slack/Teams alert routing</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/help-desk"
                className="w-full text-center block py-2.5 px-4 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
              >
                Schedule Infrastructure Review
              </Link>
            </motion.div>

            {/* Tier 4: Portfolio Infrastructure */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="bg-zinc-950 text-white rounded-2xl p-6 border border-zinc-800 shadow-xl flex flex-col justify-between relative"
            >
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                  100+ ROOMS / MULTI-HOTEL
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Portfolio Infrastructure</h3>
                <p className="text-xs text-zinc-400 font-light leading-relaxed mb-5">
                  Hotel groups and hospitality management collectives requiring cross-property pooling and custom SLAs.
                </p>

                <div className="py-4 border-y border-zinc-800 mb-5 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-zinc-400">Master Contract:</span>
                    <span className="text-base font-semibold text-white font-mono">Custom Enterprise</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Performance Fee:</span>
                    <span className="font-semibold text-zinc-500 font-mono italic">Proposal scoped</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">SLA:</span>
                    <span className="font-semibold text-zinc-300 font-mono">99.9% Uptime Guarantee</span>
                  </div>
                </div>

                <ul className="space-y-2.5 text-xs text-zinc-300 mb-6">
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Multi-property portfolio dashboard</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Cross-property inventory & guest recognition</span>
                  </li>
                  <li className="flex gap-2 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>Custom VPC deployment & dedicated support engineer</span>
                  </li>
                </ul>
              </div>

              <Link
                to="/help-desk"
                className="w-full text-center block py-2.5 px-4 bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-semibold rounded-xl transition-colors"
              >
                Schedule Infrastructure Review
              </Link>
            </motion.div>

          </div>
        </div>

        {/* Action Link to Comprehensive View */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 mb-12">
          <InteractiveButton to="/pricing" className="bg-white border border-[#E5E7EB] hover:bg-zinc-50 !text-[#111] !text-xs sm:!text-sm !py-2.5 !px-6">
            Compare Detailed Operational Layers & Matrices →
          </InteractiveButton>
        </div>

        {/* OTA Margin Recovery Calculator */}
        <MarginCalculator />


      </div>
    </section>
  );
}
