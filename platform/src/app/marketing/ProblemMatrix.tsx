import { motion } from "motion/react";
import { AlertCircle, Clock, MessageSquareOff } from "lucide-react";

export function ProblemMatrix() {
  const problems = [
    {
      icon: <AlertCircle className="w-5 h-5 text-[#111]" />,
      title: "Guest Conversations Become Operational Work.",
      description: "Every guest message creates an operational task. Without coordination, information slows down, departments become disconnected and service consistency declines.",
    },
    {
      icon: <Clock className="w-5 h-5 text-[#111]" />,
      title: "Revenue Opportunities Are Easily Missed.",
      description: "Guest conversations contain booking opportunities, upgrades, late check-outs, dining requests and additional services. When engagement is disconnected from operations, commercial opportunities are lost.",
    },
    {
      icon: <MessageSquareOff className="w-5 h-5 text-[#111]" />,
      title: "Operational Teams Need Shared Visibility.",
      description: "Housekeeping, concierge, maintenance and food services perform best when every guest request moves through one connected operational layer instead of isolated communication channels.",
    }
  ];

  return (
    <section id="problem-matrix" className="py-16 sm:py-20 bg-[#D8EDF2] border-t border-black/5">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="mb-12">
           <div className="flex items-center gap-2 mb-3">
             <div className="w-2 h-2 bg-[#111]"></div>
             <h4 className="font-semibold text-[#111] text-xs sm:text-sm uppercase tracking-wider font-mono">Operational Fragmentation</h4>
           </div>
           <h2 className="text-2xl sm:text-3xl lg:text-4xl font-medium leading-tight tracking-tight text-[#111] max-w-2xl whitespace-pre-line">
             {"Hospitality Runs on Systems.\nGuests Experience One Journey."}
           </h2>
           <div className="mt-5 text-sm sm:text-base text-zinc-700 font-light max-w-2xl leading-relaxed space-y-3">
             <p>
               Hotels rely on specialised systems across reservations, guest communications, housekeeping, food and beverage, maintenance and front office operations.
             </p>
             <p>
               The challenge is rarely the systems themselves. It is keeping every interaction connected from arrival to departure.
             </p>
           </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="bg-white rounded-xl p-6 sm:p-7 shadow-sm border border-black/5 flex flex-col h-full text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#F9F6F0] flex items-center justify-center mb-5 border border-black/5">
                {problem.icon}
              </div>
              <h3 className="text-base sm:text-lg font-semibold text-[#111] mb-2 leading-snug">
                {problem.title}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 leading-relaxed font-light">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Narrative Transition Statement */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-12 pt-8 border-t border-black/10 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
        >
          <p className="text-sm sm:text-base font-medium text-[#111] max-w-2xl leading-normal text-left">
            Connected Guest Operations brings these operational moments together through one continuous operating layer.
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
