import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { InteractiveButton } from "./InteractiveButton";
import { Check, X, Building2, ArrowRight, BedDouble, ShieldCheck, FileSpreadsheet, Sparkles } from "lucide-react";
import { MarginCalculator } from "./MarginCalculator";
import { useCurrency } from "../../context/CurrencyContext";

export function ComprehensivePricing() {
  const { formatMoney } = useCurrency();

  return (
    <div className="bg-[#FAF9F5] min-h-screen pt-24 pb-16">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center md:text-left mb-16 max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 mb-4"
          >
             <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3.5 py-1.5 rounded-full font-semibold">
              GUEST OS COMMERCIAL ARCHITECTURE
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-950 mb-6"
          >
            Own Your Guest Commerce. <br className="hidden md:block" />
            <span className="text-zinc-500 font-serif italic">Keep 85%+ More Of Every Direct Booking.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-800 text-base md:text-lg max-w-2xl leading-relaxed font-light"
          >
            Ever replaces commission-heavy OTA intermediaries with a dedicated, performance-aligned hospitality infrastructure. Transparent monthly access, custom workflow engineering, and revenue alignment strictly on verified bookings.
          </motion.p>
        </div>

        {/* 4 Commercial Pillars Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-sm mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              PILLAR 1: ACCESS
            </span>
            <div className="text-base font-semibold text-zinc-900 mb-1">Dedicated Tenant Stack</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Isolated virtual container for every hotel. Zero database sharing. Floor starting at <strong className="text-zinc-900">{formatMoney(99)}/mo</strong>.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              PILLAR 2: ENGINEERING
            </span>
            <div className="text-base font-semibold text-zinc-900 mb-1">Custom PMS Setup</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              End-to-end integration for Cloudbeds, Mews, Opera, staff routing & property knowledge indexing. <strong className="text-zinc-900">Scoped per property.</strong>
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#EA6639] uppercase tracking-widest block mb-1">
              PILLAR 3: ALIGNMENT
            </span>
            <div className="text-base font-semibold text-zinc-900 mb-1">1% – 3% Performance</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              We succeed only when you drive revenue. Applied strictly to direct in-chat bookings & upsells across 10 streams.
            </p>
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest block mb-1">
              PILLAR 4: TRANSPARENCY
            </span>
            <div className="text-base font-semibold text-zinc-900 mb-1">0% Markup Pass-Through</div>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Wholesale Meta WhatsApp fees and AI token usage passed transparently at direct cost with no markup.
            </p>
          </div>
        </div>

        {/* Hospitality Infrastructure Tiers Detailed Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 text-left"
        >
          {/* Tier 1: Select Property */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                ≤ 25 ROOMS
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950 mb-1">Select Property</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-light">
                Tailored for boutique lodges, retreats, and inns seeking automated concierge and direct booking conversion.
              </p>
              
              <div className="border-t border-b border-zinc-100 py-4 mb-6 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400 font-mono uppercase">Starting Floor:</span>
                  <div className="text-2xl font-semibold font-sans text-zinc-950">
                    {formatMoney(99)}<span className="text-xs text-zinc-400 font-normal"> / mo</span>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Performance:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Setup Scope:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Dual-channel presence (Web + WhatsApp Business)",
                  "Autonomous guest FAQ & property compendium",
                  "Direct in-chat reservation & Stripe checkout",
                  "Silent hand-off to front-desk staff",
                  "Verified guest contact capture (phone & email)",
                ].map((feat, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-zinc-700 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100">
               <Link 
                 to="/help-desk"
                 className="w-full text-center block py-2.5 px-4 rounded-xl text-xs font-semibold bg-white border border-zinc-200 text-zinc-900 hover:bg-zinc-50 transition-colors"
               >
                 Schedule Infrastructure Review
               </Link>
            </div>
          </div>

          {/* Tier 2: Full-Service Estate */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-[#EA6639] shadow-lg flex flex-col justify-between relative">
            <div className="absolute -top-3 left-6 bg-[#EA6639] text-white text-[9px] font-mono uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full">
              CORE HOSPITALITY
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-[#EA6639] text-[10px] font-mono uppercase font-semibold rounded mb-3 mt-1">
                26 – 50 ROOMS
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950 mb-1">Full-Service Estate</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-light">
                Independent luxury properties requiring live PMS availability mapping, automated upsells, and folio writeback.
              </p>
              
              <div className="border-t border-b border-zinc-100 py-4 mb-6 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400 font-mono uppercase">Base Estimate:</span>
                  <div className="text-xl font-semibold font-sans text-zinc-400 italic">
                    Custom Proposal
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Performance:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Setup Scope:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Bi-directional PMS live sync (Cloudbeds, Mews, Opera)",
                  "Sub-second guest folio ledger writeback",
                  "Predictive room upgrades & late checkout",
                  "Automated abandoned inquiry follow-up",
                  "Omnichannel guest routing (WhatsApp + IG + Web)",
                ].map((feat, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-zinc-700 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100">
               <Link 
                 to="/help-desk"
                 className="w-full text-center block py-2.5 px-4 rounded-xl text-xs font-semibold bg-[#EA6639] hover:bg-[#d85e34] text-white transition-colors shadow-sm"
               >
                 Schedule Infrastructure Review
               </Link>
            </div>
          </div>

          {/* Tier 3: Resort Operations */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-zinc-200/80 shadow-sm flex flex-col justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-100 text-zinc-800 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                51 – 100 ROOMS
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-zinc-950 mb-1">Resort Operations</h3>
              <p className="text-xs text-zinc-500 leading-relaxed mb-6 font-light">
                High-amenity resort destinations requiring multi-outlet dining, spa scheduling, and cross-department routing.
              </p>
              
              <div className="border-t border-b border-zinc-100 py-4 mb-6 space-y-2">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400 font-mono uppercase">Base Estimate:</span>
                  <div className="text-xl font-semibold font-sans text-zinc-400 italic">
                    Custom Proposal
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Performance:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Setup Scope:</span>
                  <span className="font-semibold text-zinc-400 font-mono italic">Proposal scoped</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "F&B table reservations & room service orders",
                  "Spa treatment scheduling & dynamic slot hold",
                  "POS terminal integration (Micros, Toast, Lightspeed)",
                  "Departmental dispatch (Front Desk, Housekeeping, Concierge)",
                  "Custom staff notification webhooks (Slack & Teams)",
                ].map((feat, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-zinc-700 items-start">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-100">
               <Link 
                 to="/help-desk"
                 className="w-full text-center block py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white transition-colors"
               >
                 Schedule Infrastructure Review
               </Link>
            </div>
          </div>

          {/* Tier 4: Portfolio Infrastructure */}
          <div className="bg-zinc-950 rounded-3xl p-6 sm:p-7 border border-zinc-800 shadow-xl flex flex-col justify-between text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#EA6639] opacity-10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-800 text-zinc-300 text-[10px] font-mono uppercase font-semibold rounded mb-3">
                100+ ROOMS / MULTI-PROPERTY
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-white mb-1">Portfolio Infrastructure</h3>
              <p className="text-xs text-zinc-400 leading-relaxed mb-6 font-light">
                Hotel groups and management collectives requiring cross-property intelligence, custom security, and unified SLAs.
              </p>
              
              <div className="border-t border-b border-zinc-800 py-4 mb-6 space-y-2 text-white">
                <div className="flex justify-between items-baseline">
                  <span className="text-xs text-zinc-400 font-mono uppercase">Master Contract:</span>
                  <div className="text-xl font-semibold font-sans text-white">
                    Custom RFP
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Performance:</span>
                  <span className="font-semibold text-zinc-500 font-mono italic">Proposal scoped</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-zinc-400 font-mono uppercase">Service Level:</span>
                  <span className="font-semibold text-zinc-300 font-mono">99.9% Uptime Guarantee</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {[
                  "Central portfolio oversight & unified billing console",
                  "Cross-property guest recognition & profile sync",
                  "Dedicated VPC / container orchestration",
                  "Custom PMS security audit & penetration testing",
                  "Dedicated Lead Hospitality Solutions Architect",
                ].map((feat, i) => (
                  <li key={i} className="flex gap-2.5 text-xs text-zinc-300 items-start">
                    <Check className="w-3.5 h-3.5 text-[#EA6639] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 border-t border-zinc-800 relative z-10">
               <Link 
                 to="/help-desk"
                 className="w-full text-center block py-2.5 px-4 rounded-xl text-xs font-semibold bg-white hover:bg-zinc-100 text-zinc-950 transition-colors"
               >
                 Schedule Infrastructure Review
               </Link>
            </div>
          </div>
        </motion.div>

        {/* OTA Comparison Matrix */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="mb-24"
        >
           <div className="text-center mb-10 max-w-2xl mx-auto">
             <h2 className="text-3xl font-medium tracking-tight text-zinc-950 mb-2">Why Hotels Choose Ever's Guest OS</h2>
             <p className="text-sm text-zinc-500 font-light">A structural comparison between commission-draining intermediaries and dedicated direct commerce infrastructure.</p>
           </div>
           <div className="bg-white rounded-3xl border border-zinc-200/80 shadow-sm overflow-hidden overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-200 text-xs font-mono uppercase tracking-wider text-zinc-500">
                   <th className="px-6 py-5 font-semibold w-1/4">Operational Segment</th>
                   <th className="px-6 py-5 font-semibold border-l border-zinc-200 w-1/4">Traditional OTA Model</th>
                   <th className="px-6 py-5 font-semibold border-l border-zinc-200 w-1/4">Legacy Generic Chatbots</th>
                   <th className="px-6 py-5 font-semibold border-l border-t-2 border-t-[#EA6639] border-zinc-200 bg-[#EA6639]/5 text-zinc-900 w-1/4">Ever Guest OS Infrastructure</th>
                 </tr>
               </thead>
               <tbody className="text-xs">
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Commission Erosion</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-rose-600 font-semibold">15% – 25% (per booking)</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">0% (Seat license with 0 commerce)</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">1% – 3% Aligned Performance</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Guest Data Rights</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-rose-500" /> Walled by OTA platform</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-600">Locked in 3rd party SaaS database</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 flex gap-2"><Check className="w-4 h-4 text-[#EA6639]" /> 100% Property Owned</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Guest Communication Channels</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Rigid internal OTA portals</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-600">Web widget only</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 font-medium">WhatsApp, Instagram & Web</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">PMS & Folio Synchronization</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Channel manager pull only</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-rose-500" /> No folio writeback</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 font-semibold">Live Bi-Directional PMS Sync</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">In-Engine Upselling</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Captured entirely by OTAs</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-zinc-300" /> Non-Transactional</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 font-semibold">10-Stream In-Chat Commerce</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">POS & Multi-Outlet Operations</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-rose-500" /> Zero capability</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-zinc-300" /> Static link sharing</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">Full POS Sync (F&B, Spa, Amenities)</td>
                 </tr>
                 <tr className="hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Payment Gateway Payouts</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">OTA holds capital (Net 30-60)</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-zinc-300" /> Not applicable</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">Direct to Hotel Merchant Account</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </motion.div>

        {/* ROI / Commercial Economics Section */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="grid lg:grid-cols-2 gap-12 items-center mb-16"
        >
           <div className="text-left">
             <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">
               REVENUE RECOVERY
             </span>
             <h2 className="text-3xl sm:text-4xl font-medium tracking-tight text-zinc-950 mt-2 mb-6">
               Recover Lost Margin. <br />Grow Direct Property Cash Flow.
             </h2>
             <div className="space-y-4 text-zinc-800 font-light text-sm leading-relaxed">
               <p>
                 When a guest books or requests amenities through Ever's Guest OS, your property bypasses the punitive 15%–25% commission tax imposed by online travel agencies.
               </p>
               <p>
                 Our performance-aligned commercial structure ensures our fee is directly tied to the bookings and upselling revenue Ever delivers to your balance sheet.
               </p>
             </div>
             <div className="mt-8">
               <Link
                 to="/help-desk"
                 className="inline-flex items-center gap-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold px-6 py-3.5 rounded-full transition-colors"
               >
                 <FileSpreadsheet className="w-4 h-4" />
                 Schedule Infrastructure Review
               </Link>
             </div>
           </div>

           <div className="bg-[#111] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border border-zinc-800 shadow-xl text-left">
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
             <div className="relative z-10">
               <div className="mb-8">
                 <h4 className="text-xl font-medium mb-1">Illustrative Monthly Commercial Impact</h4>
                 <p className="text-xs text-zinc-400">Assuming an independent property generates <span className="text-white font-medium">{formatMoney(25000)}</span> in gross direct conversational bookings and amenity upsells.</p>
               </div>

               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs text-zinc-400 font-mono tracking-wider">OTA COMMISSION (at 18% avg)</span>
                     <span className="text-2xl text-rose-400 font-mono">-{formatMoney(4500)}</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                     <div className="bg-rose-500 h-full w-[18%]" />
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs text-zinc-400 font-mono tracking-wider">EVER GUEST OS (3% performance + {formatMoney(99)} base)</span>
                     <span className="text-2xl text-emerald-400 font-mono">-{formatMoney(849)}</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                     <div className="bg-emerald-500 h-full w-[3.4%]" />
                   </div>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                 <div className="font-medium text-xs text-zinc-300">Net Monthly Property Retained Capital</div>
                 <div className="text-3xl tracking-tight text-white flex items-center gap-1 font-mono">
                   <span className="text-emerald-400">+</span>{formatMoney(3651)} 
                 </div>
               </div>
             </div>
           </div>
        </motion.div>

        {/* Dynamic Margin Calculator */}
        <MarginCalculator />



      </div>
    </div>
  );
}
