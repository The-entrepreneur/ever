import React from "react";
import { motion } from "motion/react";

export function DemoHero() {
  return (
    <div id="demo-hero" className="max-w-[1200px] mx-auto text-center mb-12">
      <motion.span 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3 py-1.5 rounded-md font-semibold"
      >
        EVER'S GUEST OS EXPERIENCE
      </motion.span>
      
      <motion.h1 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-zinc-950 mt-4 font-sans leading-tight"
      >
        Experience Connected Guest Operations.
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="text-sm sm:text-base text-zinc-600 max-w-2xl mx-auto mt-4 font-normal leading-relaxed"
      >
        Explore a live simulation of Ever's Guest OS. Configure a hotel environment, engage with our AI agents and experience how guest engagement, commercial execution and hotel operations work together in one connected platform.
      </motion.p>
    </div>
  );
}
