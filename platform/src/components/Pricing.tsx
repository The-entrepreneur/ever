import { motion } from "motion/react";
import { InteractiveButton } from "./InteractiveButton";
import { useCurrency } from "../context/CurrencyContext";
import { MarginCalculator } from "./MarginCalculator";

export function Pricing() {
  const { formatMoney } = useCurrency();
  return (
    <section id="pricing" className="py-16 sm:py-20 bg-[#F9F6F0] border-t border-black/5 text-left">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2 mb-3"
        >
          <div className="w-2 h-2 bg-[#111]"></div>
          <h4 className="font-semibold text-[#111] text-xs sm:text-sm uppercase tracking-wider font-mono">Pricing</h4>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-[#111] mb-10"
        >
          Predictable Capital Investment.
        </motion.h2>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          className="grid lg:grid-cols-3 gap-6"
        >
          {/* Featured Card */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="lg:col-span-3 bg-white p-6 sm:p-8 rounded-xl flex flex-col md:flex-row gap-8 items-center border border-[#E5E7EB] shadow-sm"
          >
            <div className="flex-1 w-full text-left">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EA6639]"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-zinc-500 font-mono">Premium Solution</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-[#111] mb-3 tracking-tight">The Hospitality Commerce Agent</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed mb-6 max-w-xl font-light">
                The commercial execution layer for direct bookings, payments and revenue coordination.
              </p>
              
               <div className="space-y-3 mb-3 max-w-md">
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-2 text-xs sm:text-sm">
                    <span className="text-zinc-500 font-light">Implementation Fee</span>
                    <span className="font-semibold text-[#111]">Custom</span>
                  </div>
                  <div className="flex justify-between border-b border-[#E5E7EB] pb-2 text-xs sm:text-sm">
                    <span className="text-zinc-500 font-light">Core Subscription</span>
                    <span className="font-semibold text-[#111]">{formatMoney(99)} / month</span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span className="text-zinc-500 font-light">Performance Dividend</span>
                    <span className="font-semibold text-emerald-600">3%</span>
                  </div>
               </div>
            </div>
            
            <div className="w-full md:w-[260px] shrink-0 bg-[#111] text-white rounded-lg p-6 aspect-auto flex flex-col items-center justify-center relative overflow-hidden min-h-[180px]">
               {/* Minimalist wireframe inside black box */}
               <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]"></div>
               <div className="w-24 h-24 border border-white/20 flex items-center justify-center mb-3">
                 <div className="w-12 h-12 border border-[#EA6639]/30 flex items-center justify-center bg-[#EA6639]/10 text-[#EA6639] font-mono text-xs font-bold">HCA</div>
               </div>
               <span className="text-xs text-zinc-400 font-mono tracking-wider">HCA CORE SYNCHRONIZED</span>
            </div>
          </motion.div>

          {/* Small Card 1 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between text-left min-h-[220px]"
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#111] mb-2.5 tracking-tight">Guest Concierge Engine</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-6 font-light">
                The operational layer for guest engagement, enquiry management and concierge automation.
              </p>
            </div>
            <div className="space-y-2 mt-auto">
               <div className="flex justify-between text-xs sm:text-sm border-b border-[#E5E7EB] pb-2">
                 <span className="text-zinc-500 font-light">Implementation Fee</span><span className="font-semibold text-[#111]">{formatMoney(79)}</span>
               </div>
               <div className="flex justify-between text-xs sm:text-sm border-b border-[#E5E7EB] pb-2">
                 <span className="text-zinc-500 font-light">Core</span><span className="font-semibold text-[#111]">{formatMoney(36)}/mo</span>
               </div>
               <div className="flex justify-between text-xs sm:text-sm">
                 <span className="text-zinc-500 font-light">Performance Dividend</span><span className="font-semibold text-zinc-400">0%</span>
               </div>
            </div>
          </motion.div>

          {/* Small Card 2 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between text-left min-h-[220px]"
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#111] mb-2.5 tracking-tight">Custom Enterprise Audit</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-6 font-light">
                Need a specific deployment rule, custom PMS security, or multi-property rollouts?
              </p>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-auto pt-4 border-t border-[#E5E7EB] font-light">
              Contact our solutions team for custom SLA terms.
            </p>
          </motion.div>

          {/* Small Card 3 */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
            }}
            className="bg-white p-6 rounded-xl border border-[#E5E7EB] shadow-sm flex flex-col justify-between text-left min-h-[220px]"
          >
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-[#111] mb-2.5 tracking-tight">Brand Whitelabeling</h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed mb-6 font-light">
                100% invisible architecture ensuring your property commands the complete direct passenger relationship.
              </p>
            </div>
            <p className="text-xs sm:text-sm text-zinc-500 mt-auto pt-4 border-t border-[#E5E7EB] font-light">
              Standard inclusion across premium tiers.
            </p>
          </motion.div>
        </motion.div>

        <div className="flex justify-center mt-10 mb-10">
          <InteractiveButton to="/pricing" className="bg-white border border-[#E5E7EB] hover:bg-zinc-50 !text-[#111] !text-xs sm:!text-sm !py-2 !px-5">
            View all pricing options & ROI details →
          </InteractiveButton>
        </div>

        <MarginCalculator />
      </div>
    </section>
  );
}
