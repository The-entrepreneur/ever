import { motion } from "motion/react";
import { InvestmentCards } from "./InvestmentCards";
import { PerformanceChart } from "./PerformanceChart";

export function ROISection() {
  return (
    <section id="investment-roi" className="py-16 sm:py-24 bg-[#F9F6F0] border-t border-black/5 text-left relative overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-3"
          >
            <div className="w-2 h-2 bg-[#EA6639]"></div>
            <h4 className="font-semibold text-zinc-900 text-xs sm:text-sm uppercase tracking-wider font-mono">
              Operational Investment & Business Value
            </h4>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-medium leading-[1.1] tracking-tight text-zinc-950 mb-5"
          >
            Operational Investment. <br />
            <span className="text-zinc-500 font-serif italic">Measurable Business Outcomes.</span>
          </motion.h2>

          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-zinc-600 text-sm sm:text-base md:text-lg font-light leading-relaxed max-w-2xl"
          >
            Ever's Guest OS helps hotels strengthen guest engagement, improve operational coordination and unlock new revenue opportunities without replacing existing systems.
          </motion.p>
        </div>

        {/* Core Layout: Cards vs Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left: ROI Cards Grid */}
          <div className="lg:col-span-7">
            <InvestmentCards />
          </div>

          {/* Right: Interactive Performance Chart */}
          <div className="lg:col-span-5 h-full">
            <PerformanceChart />
          </div>
        </div>

        {/* Executive Closing Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-16 sm:mt-24 border-t border-zinc-200/80 pt-8 max-w-3xl mx-auto text-center"
        >
          <p className="text-base sm:text-lg md:text-xl font-medium tracking-tight text-zinc-900 leading-relaxed font-serif italic">
            "The strongest hospitality businesses don't operate with more systems. <br className="hidden sm:inline" /> They operate with better connected ones."
          </p>
        </motion.div>

      </div>
    </section>
  );
}

export default ROISection;
