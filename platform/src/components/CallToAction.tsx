import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight, Sparkles, MessageSquare, ShieldCheck, Zap, User, Star, Link2 } from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";

export function CallToAction() {
  return (
    <section className="bg-[#F9F6F0] py-16 px-4 sm:px-6 lg:px-8">
      {/* Golden container mimicking the 90% style of the mockup */}
      <div className="max-w-[1200px] mx-auto bg-[#FCD060] rounded-[40px] relative overflow-hidden shadow-2xl p-8 sm:p-12 md:p-16">
        
        {/* Swirling abstract lines in the background mimicking the template design */}
        <div className="absolute inset-0 pointer-events-none opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M 600 -100 C 700 100, 950 200, 950 400 C 950 600, 500 550, 450 350 C 400 150, 800 0, 900 100"
              stroke="#FFF"
              strokeWidth="24"
              strokeLinecap="round"
              fill="none"
              opacity="0.6"
            />
            <path
              d="M 800 100 C 850 150, 920 180, 980 250"
              stroke="#FFF"
              strokeWidth="12"
              fill="none"
              opacity="0.4"
            />
          </svg>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          {/* Left Column: Title, Subtitles, CTAs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* White pill "Get Started" badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block bg-white text-[#111111] text-[11px] font-mono tracking-wider font-extrabold px-4 py-1.5 rounded-full shadow-xs"
            >
              Onboard
            </motion.div>

            {/* Headline matching user's intent */}
            <motion.h2
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl md:text-5xl font-sans font-bold text-zinc-900 tracking-tight leading-[1.08] max-w-xl"
            >
              Built for today's operations.<br />Ready for tomorrow's hospitality.
            </motion.h2>

            {/* Structured responsive description with "See it in action" copy */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="space-y-4 text-zinc-800"
            >
              <p className="text-[14px] leading-relaxed font-light text-zinc-800 max-w-lg">
                Adopt Ever's Guest OS with confidence. Connect guest engagement, commerce and operations without replacing the systems your teams already trust.
              </p>

              {/* Confidence indicators */}
              <div className="space-y-2 pt-2 text-xs sm:text-sm font-medium text-zinc-900">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#EA6639] rounded-full shrink-0"></span>
                  <span>No complex implementation.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#EA6639] rounded-full shrink-0"></span>
                  <span>No disruption to existing operations.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#EA6639] rounded-full shrink-0"></span>
                  <span>Just a more connected way to run hospitality.</span>
                </div>
              </div>

              {/* Partnership statement */}
              <div className="pt-3 text-[11px] sm:text-xs italic text-zinc-800 font-serif border-t border-black/10 max-w-md">
                "Every deployment begins with understanding your operations. Technology is deployed; partnerships are built."
              </div>
            </motion.div>

            {/* Interactive Primary and Secondary action triggers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4"
            >
              <InteractiveButton
                to="/signup"
                className="px-8 py-4 bg-zinc-950 text-white text-xs font-bold"
              >
                Start Free
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </InteractiveButton>
              
              <Link
                to="/help-desk"
                className="text-xs font-bold text-zinc-950 hover:text-black underline flex items-center gap-1 cursor-pointer"
              >
                Request a Demo
              </Link>
            </motion.div>

          </div>

          {/* Right Column: Stunning Mockup Collage aligned to template 90% */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 min-h-[340px] flex items-center justify-center">
            
            {/* Swirling abstract circles behind */}
            <div className="absolute w-72 h-72 rounded-full border-[16px] border-white/25 -top-10 -right-10 pointer-events-none"></div>
            
            {/* Main Floating Card A: The Hospitality Agent Screen */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: -20, rotate: -2 }}
              whileInView={{ opacity: 1, scale: 1, x: 0, rotate: -4 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="absolute left-2 top-0 w-[210px] bg-white rounded-3xl p-4 shadow-2xl border border-zinc-100 flex flex-col justify-between z-20 hover:rotate-0 transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400 font-mono">GCE Live</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-[#FCD060] fill-[#FCD060]" />
                  <span className="text-[10px] font-bold text-zinc-700">4.9/5</span>
                </div>
              </div>

              {/* Concierge portrait mock */}
              <div className="h-28 bg-[#FFF4EF] rounded-2xl relative overflow-hidden flex items-center justify-center mb-3">
                <div className="absolute top-2 right-2 px-2 py-0.5 bg-[#EA6639] text-white rounded text-[8px] font-mono tracking-wider font-extrabold">
                  AUTO-REPLY
                </div>
                <div className="text-center p-3">
                  <p className="text-[11px] font-bold text-zinc-800">Guest Concierge Engine</p>
                  <p className="text-[9px] text-[#EA6639] font-mono font-medium mt-0.5">Operational Continuity</p>
                </div>
              </div>

              {/* Metadata display labels */}
              <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-[10px]">
                <span className="text-zinc-400 font-light">Response Latency:</span>
                <span className="font-bold text-zinc-800 font-mono">3.4 Sec</span>
              </div>
            </motion.div>

            {/* Main Floating Card B: The Action Backdrop */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 40, y: 20, rotate: 3 }}
              whileInView={{ opacity: 1, scale: 1, x: 10, y: 30, rotate: 6 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="absolute right-0 bottom-4 w-[220px] bg-zinc-950 text-white rounded-3xl p-5 shadow-2xl z-10 hover:rotate-0 transition-all duration-300 pointer-events-auto"
            >
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-[#FCD060]" />
                <span className="text-[10px] font-mono text-zinc-300 font-bold uppercase">Room 304 Checkout</span>
              </div>
              
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-2.5 mb-3">
                <p className="text-[10px] text-zinc-400 font-light">Guest: "Can we extend checkout to 2pm?"</p>
                <p className="text-[11px] text-[#FCD060] font-medium mt-1">✓ Guest OS: "Approved! Added $45 to PMS bill room 304."</p>
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-500">
                <span>#ancillary_sales</span>
                <span className="text-emerald-400 font-mono">+$45.00</span>
              </div>
            </motion.div>

            {/* White floating interactive link bar connecting cards exactly like the mockup link */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 20 }}
              whileInView={{ scale: 1, opacity: 1, y: -20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute bg-white text-zinc-800 hover:text-black border border-zinc-200 rounded-xl py-2 px-3.5 shadow-lg flex items-center gap-2 z-30 text-[10px] font-bold font-mono group select-none cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-[#EA6639]" />
              <span>https://ever.co/live-flow/concierge</span>
            </motion.div>

            {/* Tiny stylized portrait avatar floating bubbles matching mockup template */}
            <div className="absolute top-4 right-12 w-8 h-8 rounded-full border-2 border-white bg-[#FCD060] shadow-md flex items-center justify-center text-xs font-bold text-zinc-800 z-30 select-none">
              👋
            </div>
            <div className="absolute bottom-2 left-6 w-7 h-7 rounded-full border-2 border-white bg-[#EA6639] shadow-md flex items-center justify-center text-xs font-bold text-white z-30 select-none">
              ✨
            </div>
            
          </div>

        </div>
      </div>
    </section>
  );
}
