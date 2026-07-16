import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, ShieldCheck } from "lucide-react";

const upsellingImg = "/src/assets/images/automated_upselling_1781018680627.png";

export function PerfectSync() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      label: "1. Guest Engagement",
      heading: "The Guest Concierge Engine.",
      body: "The Guest Concierge Engine (GCE) acts as the engagement layer within Ever's Guest OS. It handles guest communications, guides inquiries with property details, qualifies leads, and prepares conversations for meaningful commercial outcomes across 70+ channels.",
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: 1,
      label: "2. Hospitality Commerce",
      heading: "The Hospitality Commerce Agent.",
      body: "The Hospitality Commerce Agent (HCA) acts as the execution layer within Ever's Guest OS. It processes direct bookings, secure payments, and dynamic room upgrades. By executing within the chat, it connects routine interactions directly to commercial performance.",
      image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1000"
    },
    {
      id: 2,
      label: "3. Operational Execution",
      heading: "Continuous operational execution.",
      body: "Every guest interaction progresses naturally toward an outcome. Our platform integrates with existing PMS and siteminder databases to keep departments coordinated, ensuring operational continuity and effortless service delivery.",
      image: upsellingImg
    }
  ];

  return (
    <section id="perfect-sync" className="bg-[#F9F6F0] py-16 sm:py-20 px-4 sm:px-6 lg:px-8 text-[#111] overflow-hidden border-t border-black/5">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
          <div className="max-w-2xl text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-[#111] mb-4">
              Every Guest Interaction, One Connected Operation.
            </h2>
            <div className="text-sm sm:text-base text-zinc-700 font-light leading-relaxed max-w-xl">
              <p>
                Ever's Guest OS keeps those operational moments connected from the first enquiry until checkout.
              </p>
            </div>
          </div>
          
          {/* Trust Badge */}
          <div className="bg-white rounded-xl shadow-sm p-5 w-full max-w-[320px] flex flex-col gap-3 mt-2 lg:mt-0 shrink-0 border border-black/5 text-left">
            <div className="flex justify-between items-center">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-4 h-4 fill-[#7C3AED] text-[#7C3AED]" />
                ))}
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-[#F9F6F0] rounded border border-black/5 text-[#7C3AED] font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified
              </div>
            </div>
            <div className="text-xs sm:text-sm font-medium text-zinc-700">
              70+ Connected Channels
            </div>
          </div>
        </div>

        {/* Tabs Row */}
        <div className="flex gap-8 border-b border-black/10 mb-10 overflow-x-auto whitespace-nowrap scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 text-xs sm:text-sm transition-colors relative ${
                activeTab === tab.id ? "text-[#3B82F6] font-semibold" : "text-zinc-500 font-medium hover:text-[#3B82F6]"
              }`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabSync"
                  className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[#3B82F6]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content Box */}
        <div className="min-h-[320px] relative mb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center"
            >
              <div className="max-w-lg text-left">
                <h3 className="text-lg sm:text-xl font-semibold tracking-tight mb-4 text-[#111]">
                  {tabs[activeTab].heading}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-800 leading-relaxed font-light">
                  {tabs[activeTab].body}
                </p>
              </div>

              <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] min-h-[280px] sm:min-h-[360px] rounded-xl overflow-hidden shadow-md border border-black/5 bg-[#FCD060]">
                <img 
                  src={tabs[activeTab].image} 
                  alt={tabs[activeTab].heading}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{ 
                    maskImage: 'linear-gradient(to top, transparent 0%, black 20%)', 
                    WebkitMaskImage: 'linear-gradient(to top, transparent 0%, black 20%)' 
                  }}
                />
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Operational Flow */}
        <div className="my-14 bg-white/40 border border-black/5 rounded-2xl p-6 sm:p-8 text-left">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-2 h-2 bg-[#111]"></div>
            <h4 className="font-semibold text-[#111] text-xs sm:text-sm uppercase tracking-wider font-mono">Continuous Guest Journey Operational Flow</h4>
          </div>
          
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
            {[
              "Guest Engagement",
              "Lead Capture & Qualification",
              "Booking & Revenue",
              "Operational Coordination",
              "Guest Fulfillment",
              "Completed Guest Experience"
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col xl:flex-row items-center flex-1 w-full">
                <div className="bg-white px-4 py-3 rounded-lg border border-black/5 shadow-sm text-center font-medium text-xs sm:text-sm text-[#111] w-full xl:flex-1 mx-0.5 hover:border-[#EA6639]/30 transition-colors">
                  {step}
                </div>
                {idx < 5 && (
                  <div className="text-zinc-400 py-1.5 xl:py-0 xl:px-2 flex items-center justify-center font-mono font-semibold shrink-0 text-xs sm:text-sm">
                    <span className="hidden xl:inline">→</span>
                    <span className="xl:hidden">↓</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Business Narrative */}
          <p className="mt-6 text-xs sm:text-sm text-zinc-600 font-light leading-relaxed max-w-3xl">
            Connected Guest Operations ensures that every guest request reaches the right department at the right time while maintaining complete visibility across the guest journey.
          </p>
        </div>

        {/* Bottom Stats Grid */}
        <div className="mt-16 text-left">
          <div className="mb-8 max-w-3xl">
            <h3 className="text-xl sm:text-2xl font-semibold leading-tight tracking-tight text-[#111] mb-3">
              Operational Outcomes That Scale With Your Property.
            </h3>
            <p className="text-sm text-zinc-600 font-light leading-relaxed">
              Connected Guest Operations delivers measurable improvements across guest engagement, commercial performance and operational efficiency.
            </p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card One: Continuous Guest Engagement */}
            <div className="bg-[#FCD060] rounded-xl p-6 shadow-sm border border-black/5 flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[#111] leading-none">99%</div>
                <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm mb-1">Continuous Guest Engagement</h4>
              </div>
              <p className="text-xs text-[#111]/80 leading-relaxed font-light">
                Capture and qualify guest enquiries across every communication channel.
              </p>
            </div>
            
            {/* Card Two: Operational Capacity Returned */}
            <div className="bg-[#FCD060] rounded-xl p-6 shadow-sm border border-black/5 flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[#111] leading-none">−18%</div>
                <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm mb-1">Operational Capacity Returned</h4>
              </div>
              <p className="text-xs text-[#111]/80 leading-relaxed font-light">
                Coordinate housekeeping, maintenance, concierge and food services.
              </p>
            </div>
            
            {/* Card Three: Direct Revenue Growth */}
            <div className="bg-[#FCD060] rounded-xl p-6 shadow-sm border border-black/5 flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[#111] leading-none">↑45%</div>
                <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm mb-1">Direct Revenue Growth</h4>
              </div>
              <p className="text-xs text-[#111]/80 leading-relaxed font-light">
                Convert conversations into direct bookings, upgrades and revenue.
              </p>
            </div>

            {/* Card Four: Connected Operational Workflows */}
            <div className="bg-[#FCD060] rounded-xl p-6 shadow-sm border border-black/5 flex flex-col justify-between min-h-[170px]">
              <div>
                <div className="text-2xl sm:text-3xl font-bold tracking-tight mb-1 text-[#111] leading-none">100%</div>
                <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm mb-1">Connected Operational Workflows</h4>
              </div>
              <p className="text-xs text-[#111]/80 leading-relaxed font-light">
                Maintain complete operational visibility from enquiry through departure.
              </p>
            </div>
          </div>

          {/* Closing Statement */}
          <div className="mt-8 pt-6 border-t border-black/5">
            <p className="text-xs sm:text-sm text-zinc-500 font-medium italic leading-relaxed">
              Every interaction contributes to stronger operations, improved guest experiences and greater commercial performance.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}
