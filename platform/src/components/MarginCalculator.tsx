import React, { useState } from "react";
import { motion } from "motion/react";
import { Asterisk } from "lucide-react";
import { useCurrency } from "../context/CurrencyContext";

export function MarginCalculator() {
  const { formatMoney } = useCurrency();
  const [arr, setArr] = useState(240);
  const [stays, setStays] = useState(450);
  const [otaFee, setOtaFee] = useState(18);

  const totalRevenue = arr * stays;
  const otaLoss = (totalRevenue * otaFee) / 100;
  const everCommission = (totalRevenue * 3) / 100;
  const saved = otaLoss - everCommission;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
      className="mt-16 sm:mt-24 mb-12 bg-[#1A1A1A] rounded-2xl sm:rounded-3xl p-4 sm:p-8 lg:p-12 relative overflow-hidden"
    >
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 sm:translate-x-1/2 opacity-20 pointer-events-none">
        <Asterisk className="w-[150px] h-[150px] sm:w-[300px] sm:h-[300px] text-[#C9D645]" />
      </div>

      <div className="mb-8 sm:mb-10 relative z-10 text-left">
        <div className="inline-block bg-[#2E201B] text-[#EA6639] text-[9px] sm:text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded mb-3">
          MARGIN CAPTURE CALCULATOR
        </div>
        <h2 className="text-xl sm:text-2xl md:text-4xl font-semibold text-white mb-2 sm:mb-3">Direct Revenue Impact Simulator</h2>
        <p className="text-zinc-400 text-[11px] sm:text-xs md:text-base font-light">Explore how increasing direct bookings can influence revenue retention and long-term commercial performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
        <div className="lg:col-span-3 bg-[#222222] border border-zinc-800 rounded-2xl p-4 sm:p-6 lg:p-8 text-left">
          <h3 className="text-white font-semibold mb-6 sm:mb-8 uppercase text-[10px] sm:text-xs tracking-wider">SIMULATOR SETTINGS</h3>
          
          <div className="space-y-6 sm:space-y-10">
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-zinc-400 text-[11px] sm:text-xs">Average Nightly Rate (ARR)</label>
                <span className="text-white font-mono text-xs sm:text-sm font-semibold">{formatMoney(arr)}</span>
              </div>
              <input 
                type="range" 
                min="50" 
                max="1000" 
                step="10"
                value={arr} 
                onChange={(e) => setArr(Number(e.target.value))}
                className="w-full accent-[#EA6639] h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-zinc-400 text-[11px] sm:text-xs">Estimated Monthly Bookings</label>
                <span className="text-white font-mono text-xs sm:text-sm font-semibold">{stays} stays</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="2000" 
                step="10"
                value={stays} 
                onChange={(e) => setStays(Number(e.target.value))}
                className="w-full accent-[#EA6639] h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-zinc-400 text-[11px] sm:text-xs">Target OTA Commission Fee (%)</label>
                <span className="text-white font-mono text-xs sm:text-sm font-semibold">{otaFee}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="35" 
                step="1"
                value={otaFee} 
                onChange={(e) => setOtaFee(Number(e.target.value))}
                className="w-full accent-[#EA6639] h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer"
              />
            </div>
          </div>
          
          <p className="text-[9px] sm:text-[10px] text-zinc-500 font-mono mt-8 sm:mt-10">
            *Commission calculations are securely processed corresponding to default PMS folio configurations.
          </p>
        </div>

        <div className="lg:col-span-2 bg-[#2E201B] border border-[#4A2D22] rounded-2xl p-5 sm:p-8 flex flex-col justify-center text-center">
          <div className="mb-6 sm:mb-8">
            <h4 className="text-[#EA6639] uppercase tracking-widest text-[10px] sm:text-xs font-mono font-bold mb-2">SIMULATED CAPTURES</h4>
            <p className="text-zinc-400 text-[11px] sm:text-xs font-light">Reclaimed commission fees currently paid to Expedia, Booking.com, etc.</p>
          </div>
          
          <div className="mb-6 sm:mb-8 space-y-1.5">
            <div className="text-zinc-500 text-[9px] sm:text-[10px] uppercase font-mono tracking-widest">ESTIMATED MONTHLY LOSS TO OTAS</div>
            <div className="text-2xl sm:text-3xl text-white font-mono font-bold">{formatMoney(otaLoss)}</div>
          </div>

          <div className="bg-[#2E201B]/40 rounded-xl p-4 sm:p-6 border border-[#4A2D22]">
             <div className="text-[#EA6639] text-[9px] sm:text-[10px] uppercase font-mono tracking-widest mb-1.5 font-bold">DIRECT COMMISSION SAVED BY EVER</div>
             <div className="text-3xl sm:text-4xl text-white font-mono font-bold tracking-tight">{formatMoney(saved)}</div>
             <div className="text-zinc-500 text-[9px] sm:text-[10px] mt-1.5">Per Month Reclaimed Revenue</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
