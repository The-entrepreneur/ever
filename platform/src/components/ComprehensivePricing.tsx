import { motion } from "motion/react";
import { InteractiveButton } from "./InteractiveButton";
import { Check, X, Building2, ArrowRight } from "lucide-react";
import { MarginCalculator } from "./MarginCalculator";
import { useCurrency } from "../context/CurrencyContext";

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
              COMMERCIAL INFRASTRUCTURE, DEPLOYED YOUR WAY
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-950 mb-6"
          >
            Own Your Guest Commerce. <br className="hidden md:block" />
            <span className="text-zinc-500 font-serif italic">Keep More Of Every Booking.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-800 text-base md:text-lg max-w-2xl leading-relaxed font-light"
          >
            Ever's Guest OS gives hotels the freedom to grow direct revenue without relying on commission-heavy intermediaries. Deploy only the operational layers you need and expand as your business grows.
          </motion.p>
        </div>

        {/* Pricing Tiers Detailed */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid md:grid-cols-2 gap-8 mb-8"
        >
          {/* GCE Tier */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-200/60 shadow-sm flex flex-col">
            <div className="mb-8">
              <h3 className="text-2xl font-medium tracking-tight text-zinc-950 mb-2">Guest Concierge Engine</h3>
              <p className="text-xs text-zinc-500 leading-relaxed h-12">
                The operational layer for guest engagement, enquiry management and concierge automation.
              </p>
            </div>
            
            <div className="flex gap-8 mb-8 border-b border-zinc-100 pb-8">
              <div>
                <p className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider mb-1">Setup</p>
                <div className="text-3xl font-medium font-sans">{formatMoney(79)}<span className="text-xs text-zinc-400 font-normal"> / one-time</span></div>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-400 font-bold uppercase tracking-wider mb-1">Core Access</p>
                <div className="text-3xl font-medium font-sans">{formatMoney(36)}<span className="text-xs text-zinc-400 font-normal"> / mo</span></div>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1">
              {[
                "Dual-channel presence (Web Widget + WhatsApp/FB/IG)",
                "Answers standard queries (Check-out, Wi-Fi, rules)",
                "Trains on custom property PDFs & web links",
                "Silent hand-off to human staff",
                "Extracts guest phone & email directly",
              ].map((feat, i) => (
                <li key={i} className="flex gap-3 text-xs text-zinc-700 items-start">
                  <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-zinc-100">
               <InteractiveButton to="/guest-concierge" className="w-full justify-center bg-white border border-zinc-200 !text-zinc-900 hover:bg-zinc-50">
                 Deploy GCE Workspace
               </InteractiveButton>
            </div>
          </div>

          {/* HCA Tier */}
          <div className="bg-zinc-950 rounded-3xl p-8 border border-zinc-800 shadow-xl flex flex-col relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA6639] opacity-[0.06] rounded-full blur-3xl pointer-events-none" />
            <div className="mb-8 relative z-10">
              <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#EA6639]/10 text-[#EA6639] text-[10px] uppercase tracking-widest font-bold rounded mb-4">
                 Full Commerce Suite
              </div>
              <h3 className="text-2xl font-medium tracking-tight text-white mb-2">Hospitality Commerce Agent</h3>
              <p className="text-xs text-zinc-400 leading-relaxed h-12">
                The commercial execution layer for direct bookings, payments and revenue coordination.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-8 mb-8 border-b border-zinc-800 pb-8 relative z-10 text-white">
              <div>
                <p className="text-[11px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1">Setup</p>
                <div className="text-3xl font-medium font-sans text-emerald-400">Custom</div>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1">Core Access</p>
                <div className="text-3xl font-medium font-sans">{formatMoney(99)}<span className="text-xs text-zinc-500 font-normal"> / mo</span></div>
              </div>
              <div>
                <p className="text-[11px] font-mono text-zinc-500 font-bold uppercase tracking-wider mb-1">Commission</p>
                <div className="text-3xl font-medium font-sans text-emerald-400">3%</div>
              </div>
            </div>

            <ul className="space-y-4 mb-10 flex-1 relative z-10">
              {[
                "Complete omnichannel presence (Web, WhatsApp, IG, Telegram, SMS)",
                "Full PMS live availability mapping (Cloudbeds, Mews, Opera)",
                "POS Integration (Room Service, Laundry, Spa, Activities)",
                "In-chat native booking & secure checkout (Stripe, target aggregators)",
                "Predictive upsells (Room upgrades, late check-out packages)",
                "Automated cart & booking abandonment recovery",
              ].map((feat, i) => (
                <li key={i} className="flex gap-3 text-xs text-zinc-300 items-start">
                  <Check className="w-4 h-4 text-[#EA6639] shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>

            <div className="pt-4 border-t border-zinc-800 relative z-10">
               <InteractiveButton to="/commerce-agent" className="w-full justify-center text-white bg-[#EA6639] hover:bg-[#EA6639]/90 border-none">
                 Deploy Full Commerce Suite
               </InteractiveButton>
            </div>
          </div>
        </motion.div>

        {/* Subtle note beneath pricing cards */}
        <div className="text-center mt-2 mb-20 text-xs sm:text-sm text-zinc-500 font-light font-sans italic">
          Start with one operational layer. Expand into Ever's Guest OS as your hotel grows.
        </div>

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
             <p className="text-sm text-zinc-500 font-light">A comparison between commission-dependent operations and a connected direct commerce infrastructure.</p>
           </div>
           <div className="bg-white rounded-3xl border border-zinc-200/60 shadow-sm overflow-hidden overflow-x-auto">
             <table className="w-full text-left border-collapse min-w-[800px]">
               <thead>
                 <tr className="bg-zinc-50/50 border-b border-zinc-200 text-xs font-mono uppercase tracking-wider text-zinc-500">
                   <th className="px-6 py-5 font-semibold w-1/4">Capability Segment</th>
                   <th className="px-6 py-5 font-semibold border-l border-zinc-200 w-1/4">Traditional OTA Model</th>
                   <th className="px-6 py-5 font-semibold border-l border-b-2 border-b-zinc-400 border-zinc-200 w-1/4">Ever Guest Concierge (GCE)</th>
                   <th className="px-6 py-5 font-semibold border-l border-t-2 border-t-[#EA6639] border-zinc-200 bg-[#EA6639]/5 text-zinc-900 w-1/4">Ever Commerce Agent (HCA)</th>
                 </tr>
               </thead>
               <tbody className="text-xs">
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Commission Erosion</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-rose-600 font-semibold">15% - 25% (per booking)</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-600">0% (Flat operational fee)</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">3% (Performance aligned)</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Guest Data Rights</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-rose-500" /> Walled by OTA platform</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800 flex gap-2"><Check className="w-4 h-4 text-emerald-500" /> Completely Owned</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 flex gap-2"><Check className="w-4 h-4 text-[#EA6639]" /> Integrated to CRM/PMS</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Guest Communication</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Rigid internal portals</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800">Real-time chat & WhatsApp</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800">Omnichannel & Automated</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">System Integration</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Aggregates into Channel Manager</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800">Support-Focused AI rules</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800">Deep, Live Bi-Directional PMS Sync</td>
                 </tr>
                  <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">In-Engine Upselling</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Captured entirely by OTAs</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-zinc-300" /> Non-Transactional</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 font-semibold">Yes (Late checkout, Room upgrades)</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">POS & Operations</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-rose-500" /> No access</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800">Support/Task Ticketing</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">Full POS Sync (F&B, Spa, Laundry)</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Mobile App Dependency</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Forces OTA App Download</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800">Native to Browser & WhatsApp</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800">Native to Browser & WhatsApp</td>
                 </tr>
                 <tr className="border-b border-zinc-100 hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Payment Gateway</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">OTA holds funds, delayed payouts</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500 flex gap-2"><X className="w-4 h-4 text-zinc-300" /> Not applicable</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-emerald-600 font-semibold">Direct to Property's Stripe/Gateway</td>
                 </tr>
                 <tr className="hover:bg-zinc-50/30">
                   <td className="px-6 py-5 font-medium text-zinc-900">Modification Handling</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-500">Requires support tickets</td>
                   <td className="px-6 py-5 border-l border-zinc-100 text-zinc-800">Agent routes to staff</td>
                   <td className="px-6 py-5 border-l border-zinc-100 bg-[#EA6639]/[0.02] text-zinc-800 font-semibold">Instant & Automated in-chat</td>
                 </tr>
               </tbody>
             </table>
           </div>
        </motion.div>

        {/* ROI / Complement Section */}
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true, margin: "-100px" }}
           transition={{ duration: 0.6 }}
           className="grid lg:grid-cols-2 gap-12 items-center"
        >
           <div>
             <h2 className="text-3xl font-medium tracking-tight text-zinc-950 mb-6">Reduce Dependency. Increase Direct Control.</h2>
                           <div className="space-y-4 text-zinc-800 font-light text-sm leading-relaxed">
                <p>
                  Ever doesn't replace every distribution channel. It strengthens the one your hotel owns.
                </p>
                <p>
                  By increasing direct engagement and commercial execution, hotels retain greater control over guest relationships, revenue and long-term profitability while continuing to use external channels where they make strategic sense.
                </p>
              </div>
           </div>

           <div className="bg-[#111] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden border border-zinc-800 shadow-xl">
             <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
             <div className="relative z-10">
               <div className="mb-8">
                 <h4 className="text-xl font-medium mb-1">Illustrative Commercial Impact</h4>
                 <p className="text-xs text-zinc-400">Assuming an independent property generates <span className="text-white font-medium">{formatMoney(15000)}</span> in gross monthly direct conversational bookings.</p>
               </div>

               <div className="space-y-6">
                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs text-zinc-400 font-mono tracking-wider">OTA TAX (averaging 18%)</span>
                     <span className="text-2xl text-rose-400 font-mono">-{formatMoney(2700)}</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                     <div className="bg-rose-500 h-full w-[18%]" />
                   </div>
                 </div>

                 <div>
                   <div className="flex justify-between items-end mb-2">
                     <span className="text-xs text-zinc-400 font-mono tracking-wider">EVER HCA ENGINE (3% + {formatMoney(99)} tier)</span>
                     <span className="text-2xl text-emerald-400 font-mono">-{formatMoney(549)}</span>
                   </div>
                   <div className="w-full bg-zinc-800 h-2 rounded overflow-hidden">
                     <div className="bg-emerald-500 h-full w-[3.66%]" />
                   </div>
                 </div>
               </div>

               <div className="mt-8 pt-6 border-t border-zinc-800 flex items-center justify-between">
                 <div className="font-medium text-xs">Monthly Net Savings</div>
                 <div className="text-3xl tracking-tight text-white flex items-center gap-2">
                   <span className="text-emerald-400">+</span>{formatMoney(2151)} 
                 </div>
               </div>
             </div>
           </div>
        </motion.div>

        <MarginCalculator />

      </div>
    </div>
  );
}
