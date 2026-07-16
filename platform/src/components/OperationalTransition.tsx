import { motion } from "motion/react";

export function OperationalTransition() {
  return (
    <section id="operational-transition" className="bg-[#F9F6F0] py-10 sm:py-12 border-t border-black/5 text-left">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <p className="text-sm sm:text-base font-medium text-[#111] max-w-3xl leading-relaxed">
            Together, these unified operational layers deliver Connected Guest Operations—seamlessly connecting guest touchpoints with back-of-house coordination to maximize property efficiency and high-margin revenue.
          </p>
          <div className="flex items-center gap-2 text-xs font-mono tracking-wider text-[#EA6639] uppercase shrink-0">
            <span>Ever Guest OS</span>
            <div className="w-2 h-2 rounded-full bg-[#EA6639] animate-pulse"></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
export default OperationalTransition;
