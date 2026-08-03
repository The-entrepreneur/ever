import { motion } from "motion/react";
import { Check } from "lucide-react";

export function SolutionLayer() {
  return (
    <>
      {/* Frontline Support / GCE Section - Light Theme */}
      <section id="solution-layer" className="py-16 sm:py-20 bg-[#F9F6F0] border-t border-black/5">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-start">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="pt-2 text-left"
            >
              {/* Tag */}
              <div className="flex gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#E5E7EB] bg-white text-xs font-semibold text-[#111] font-mono uppercase tracking-wider">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#EA6639]"></div>
                  Guest Concierge Engine
                </span>
              </div>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium text-[#111] leading-tight mb-4 tracking-tight">
                Every Guest Request Becomes an Operational Workflow.
              </h2>
              
              <div className="text-zinc-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg font-light space-y-4">
                <p>
                  Guest conversations should not end with a response.
                </p>
                <p>
                  Whether a guest requests housekeeping, room service, maintenance, concierge assistance, a restaurant reservation or a late checkout, Ever's Guest OS routes every request to the appropriate operational team while maintaining complete visibility throughout the fulfilment process.
                </p>
              </div>

              <ul className="space-y-5">
                <li className="flex flex-col gap-1 relative pl-5 border-l-2 border-[#E5E7EB]">
                  <div className="absolute left-[-5.5px] top-2 w-[9px] h-[9px] bg-[#111]"></div>
                  <strong className="text-[#111] text-sm sm:text-base font-semibold">Guest Requests</strong>
                  <span className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-light">Capture guest requests across every communication channel.</span>
                </li>
                <li className="flex flex-col gap-1 relative pl-5 border-l-2 border-[#E5E7EB]">
                  <div className="absolute left-[-5.5px] top-2 w-[9px] h-[9px] bg-[#111]"></div>
                  <strong className="text-[#111] text-sm sm:text-base font-semibold">Department Coordination</strong>
                  <span className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-light">Route requests directly to housekeeping, maintenance, concierge, food & beverage, and other teams.</span>
                </li>
                <li className="flex flex-col gap-1 relative pl-5 border-l-2 border-[#E5E7EB]">
                  <div className="absolute left-[-5.5px] top-2 w-[9px] h-[9px] bg-[#111]"></div>
                  <strong className="text-[#111] text-sm sm:text-base font-semibold">Operational Visibility</strong>
                  <span className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-light">Track every request from submission through completion without losing guest context.</span>
                </li>
                <li className="flex flex-col gap-1 relative pl-5 border-l-2 border-[#E5E7EB]">
                  <div className="absolute left-[-5.5px] top-2 w-[9px] h-[9px] bg-[#111]"></div>
                  <strong className="text-[#111] text-sm sm:text-base font-semibold">Guest Experience</strong>
                  <span className="text-zinc-500 text-xs sm:text-sm leading-relaxed font-light">Deliver faster fulfilment while maintaining a consistent guest experience across the property.</span>
                </li>
              </ul>

              <p className="mt-8 text-zinc-500 text-xs sm:text-sm leading-relaxed font-light border-t border-black/5 pt-5 max-w-lg">
                When operational requests involve commercial services such as room upgrades, dining, spa treatments, transportation or other paid experiences, the Hospitality Commerce Agent manages the transaction while maintaining continuity across the guest journey.
              </p>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="relative bg-[#ebede8] rounded-2xl p-6 overflow-hidden min-h-[380px] flex items-center justify-center border border-black/5"
            >
               {/* Decorative structural pattern */}
               <div className="absolute inset-0 opacity-40 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]"></div>
               <div className="relative z-10 w-full max-w-sm bg-white rounded-xl shadow-md border border-[#E5E7EB] p-5 text-left">
                 <div className="text-center text-xs text-zinc-400 mb-4 font-mono">Conversation started: October 22, 13:36</div>
                 <div className="space-y-4">
                   <div className="bg-[#F9F6F0] p-4 rounded-t-lg rounded-br-lg text-xs sm:text-sm text-[#111] leading-relaxed">
                     Hi I need to know the wifi password and breakfast times for tomorrow.
                   </div>
                   <div className="flex gap-2.5 p-2.5 bg-zinc-50 rounded-lg border border-[#E5E7EB] items-center text-xs text-zinc-600 ml-6">
                     <Check className="w-4 h-4" />
                     <span>Checking property details</span>
                     <div className="flex-1"></div>
                     <Check className="w-4 h-4" />
                   </div>
                   <div className="bg-[#EA6639] text-white p-4 rounded-t-lg rounded-bl-lg text-xs sm:text-sm leading-relaxed ml-6 shadow-sm">
                     Of course! The Wi-Fi is "EverGuest" and password is "Relax2026". Breakfast is served from 6:30 AM to 10:00 AM at the Atrium. Let me know if you need anything else!
                   </div>
                 </div>
               </div>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
}
