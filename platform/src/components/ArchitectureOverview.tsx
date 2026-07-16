import { motion } from "motion/react";
import { Bot, RefreshCw, Cpu, Layers, Network, ArrowRight } from "lucide-react";

export function ArchitectureOverview() {
  return (
    <div className="relative bg-white border border-zinc-200/80 rounded-[2.5rem] p-6 md:p-10 shadow-sm overflow-hidden my-12" id="architecture-overview">
      {/* Subtle coordinate dot grid background */}
      <div className="absolute inset-0 opacity-25 bg-[radial-gradient(#EA6639_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none" />
      
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left conceptual column */}
        <div className="lg:col-span-5 text-left space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-[10px] font-mono tracking-widest text-[#EA6639] uppercase font-bold">
            <Network className="w-3.5 h-3.5" /> Platform Topology
          </span>
          <h4 className="text-xl sm:text-2xl font-semibold tracking-tight text-zinc-950">
            A Single, Continuous Operational Model
          </h4>
          <p className="text-zinc-600 text-xs sm:text-sm font-light leading-relaxed">
            Existing hospitality systems are built as isolated silos—chatbots don't talk to commerce, and booking tools don't coordinate with rooms. 
          </p>
          <p className="text-zinc-600 text-xs sm:text-sm font-light leading-relaxed">
            Ever's Guest OS connects these stages into a unified, server-authoritative flow. Conversations captured by the GCE seamlessly trigger commerce opportunities in the HCA and work orders for on-property teams.
          </p>
        </div>

        {/* Right visualization column */}
        <div className="lg:col-span-7 bg-[#FAF9F5] border border-zinc-200/60 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col justify-center min-h-[360px]">
          {/* Animated data flow background lines */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#EA6639]/30 to-transparent animate-pulse" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
            
            {/* Step 1: GCE Frontline */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-[170px] bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm text-left relative flex flex-col justify-between min-h-[140px] group hover:border-[#EA6639]/40 transition-colors"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center mb-3">
                  <Bot className="w-4 h-4 text-[#EA6639]" />
                </div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#EA6639]">STAGE 01</div>
                <h5 className="text-xs font-semibold text-zinc-900 mt-1">Guest Concierge</h5>
                <p className="text-[10px] text-zinc-500 font-light mt-1 leading-normal">
                  Engages, resolves inquiries, captures preferences.
                </p>
              </div>
            </motion.div>

            {/* Connecting Arrow 1 */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0">
              <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
              >
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </motion.div>
            </div>

            {/* Step 2: Guest OS Core */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="w-full md:w-[180px] bg-zinc-950 border border-zinc-800 rounded-2xl p-4 shadow-lg text-left relative flex flex-col justify-between min-h-[150px] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#EA6639]/10 blur-xl rounded-full" />
              <div>
                <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center mb-3">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-400">CORE HUB</div>
                <h5 className="text-xs font-semibold text-white mt-1">Ever's Guest OS</h5>
                <p className="text-[10px] text-zinc-400 font-light mt-1 leading-normal">
                  Dynamic routing, contextual state, deep database mappings.
                </p>
              </div>
            </motion.div>

            {/* Connecting Arrow 2 */}
            <div className="hidden md:flex flex-col items-center justify-center shrink-0">
              <motion.div 
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut", delay: 0.5 }}
              >
                <ArrowRight className="w-5 h-5 text-zinc-400" />
              </motion.div>
            </div>

            {/* Step 3: HCA & Ops Execution */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="w-full md:w-[170px] bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-sm text-left relative flex flex-col justify-between min-h-[140px] group hover:border-[#EA6639]/40 transition-colors"
            >
              <div>
                <div className="w-7 h-7 rounded-lg bg-emerald-100/60 border border-emerald-200 flex items-center justify-center mb-3">
                  <Layers className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-emerald-600">STAGE 02</div>
                <h5 className="text-xs font-semibold text-zinc-900 mt-1">Commerce & Ops</h5>
                <p className="text-[10px] text-zinc-500 font-light mt-1 leading-normal">
                  Completes bookings, payments, and coordinates teams.
                </p>
              </div>
            </motion.div>

          </div>

          <div className="mt-6 flex items-center justify-center gap-2 bg-white/80 border border-zinc-200/50 rounded-xl py-2 px-4 w-fit mx-auto shadow-sm">
            <RefreshCw className="w-3 h-3 text-[#EA6639] animate-spin" />
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest font-bold">
              Continuous Sync Active
            </span>
          </div>

        </div>
      </div>
    </div>
  );
}
export default ArchitectureOverview;
