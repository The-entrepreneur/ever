import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, CheckCircle2, ChevronRight, Settings, Info, AlertTriangle, HelpCircle } from "lucide-react";
import { EverLogo } from "./EverLogo";

interface StatusService {
  name: string;
  uptime: string;
  history: { operational: boolean; latency: number; date: string }[];
}

export function StatusPage() {
  const [hoveredBar, setHoveredBar] = useState<{ serviceIndex: number; barIndex: number } | null>(null);

  // Generate 90 days of synthetic continuous 100% uptime history
  const generate90DaysHistory = (serviceName: string) => {
    const arr = [];
    const now = new Date();
    for (let i = 89; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      // All 100% operational, matching the "all green" template
      arr.push({
        operational: true,
        latency: Math.floor(Math.random() * 80) + 120, // 120ms to 200ms
        date: formattedDate,
      });
    }
    return arr;
  };

  const services: StatusService[] = [
    { name: "Website", uptime: "100% uptime", history: generate90DaysHistory("Website") },
    { name: "Platform", uptime: "100% uptime", history: generate90DaysHistory("Platform") },
    { name: "Webhooks", uptime: "100% uptime", history: generate90DaysHistory("Webhooks") },
    { name: "CDN", uptime: "100% uptime", history: generate90DaysHistory("CDN") },
    { name: "Livechat Socket", uptime: "100% uptime", history: generate90DaysHistory("Livechat Socket") },
    { name: "Livechat API", uptime: "100% uptime", history: generate90DaysHistory("Livechat API") },
  ];

  return (
    <div className="bg-[#FAF9F6] text-[#111111] min-h-screen pb-24 font-sans antialiased">
      {/* 2. Main Page Content (Matches Mockup Uptime Template) */}
      <main className="max-w-4xl mx-auto px-6 pt-12">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-zinc-200">
          <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
            <Link to="/" className="hover:text-[#EA6639] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-zinc-800">System Status</span>
          </div>
          <Link
            to="/help-desk"
            className="text-xs font-semibold text-[#EA6639] hover:underline flex items-center gap-1"
          >
            Create Support Incident <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        {/* Dynamic Big Status Indicator Section */}
        <section className="text-center mb-12">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/15 mb-6"
          >
            <Check className="w-10 h-10 stroke-[3]" />
          </motion.div>
          
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 mb-2">
            All services are online
          </h1>
          <p className="text-xs font-mono text-zinc-400">
            Last updated {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at 5:23am UTC
          </p>
        </section>

        {/* 3. The Current Status Board Card */}
        <section className="bg-white border border-zinc-200 shadow-xl rounded-3xl overflow-hidden mb-12">
          
          {/* Card Title & Interactive indicators legend */}
          <div className="border-b border-zinc-100 bg-zinc-50/50 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-xs font-semibold text-zinc-700 tracking-tight uppercase">
              Current status by service
            </h2>
            
            {/* Status indicators like 'Operational' and system icon matrix exactly as shown */}
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Operational
              </div>
              
              <div className="flex items-center gap-2 text-zinc-400">
                <button title="Recent Incidents" className="p-1 hover:text-zinc-600 transition-colors">
                  <AlertTriangle className="w-4 h-4" />
                </button>
                <button title="Maintenance Events" className="p-1 hover:text-zinc-600 transition-colors">
                  <Info className="w-4 h-4" />
                </button>
                <button title="System Configuration" className="p-1 hover:text-zinc-600 transition-colors">
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* List of 6 services */}
          <div className="divide-y divide-zinc-100/80">
            {services.map((service, sIdx) => (
              <div key={sIdx} className="p-6">
                
                {/* Service Metadata Row */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 fill-emerald-55 border-none" />
                    <span className="text-xs font-bold text-zinc-800 tracking-tight">{service.name}</span>
                  </div>
                  <span className="text-xs font-medium text-emerald-600 font-mono tracking-tight bg-emerald-50 px-2 py-0.5 rounded">
                    {service.uptime}
                  </span>
                </div>

                {/* 90-Days Dense Horizontal Uptime Visualization */}
                <div className="relative">
                  <div className="flex justify-between items-center gap-[2.2px] h-8 bg-zinc-50/30 px-1 py-1 rounded-md">
                    {service.history.map((day, hIdx) => {
                      const isHovered =
                        hoveredBar &&
                        hoveredBar.serviceIndex === sIdx &&
                        hoveredBar.barIndex === hIdx;
                      
                      return (
                        <div
                          key={hIdx}
                          onMouseEnter={() => setHoveredBar({ serviceIndex: sIdx, barIndex: hIdx })}
                          onMouseLeave={() => setHoveredBar(null)}
                          className={`relative flex-1 h-6 rounded-xs cursor-pointer transition-all duration-150 origin-bottom ${
                            isHovered ? "bg-emerald-600 scale-y-125 scale-x-110" : "bg-emerald-500"
                          }`}
                        >
                          {/* Rich Interactive Tooltip popup on mouse hover */}
                          <AnimatePresence>
                            {isHovered && (
                              <motion.div
                                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                transition={{ duration: 0.12 }}
                                className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-zinc-900 text-white text-[10px] py-1.5 px-2.5 rounded shadow-xl whitespace-nowrap z-50 pointer-events-none flex flex-col gap-0.5 border border-zinc-700/50"
                              >
                                <span className="font-semibold text-zinc-300">{day.date}</span>
                                <span className="text-emerald-400 font-mono">100% Operational • {day.latency}ms</span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>

                  {/* Uptime timeframes foot label (90 days ago -> Today) */}
                  <div className="flex justify-between items-center text-[10px] text-zinc-400 font-mono mt-1 px-0.5">
                    <span>90 days ago</span>
                    <span>Today</span>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </section>

        {/* 4. Active Incidents / History Section */}
        <section className="bg-white border border-zinc-200 shadow-sm rounded-3xl p-6 mb-12">
          <h3 className="text-xs font-semibold text-zinc-700 uppercase tracking-tight mb-4">
            Recent Incidents & Maintenance
          </h3>
          <div className="text-center py-6 text-zinc-400 text-xs font-light">
            No incidents reported over the past 30 days. All global operations are fully nominal.
          </div>
        </section>

      </main>

      {/* 5. Clean Structured Footer (Matches "© 2026 Whelp, Inc. Powered by Better Stack") */}
      <footer className="max-w-4xl mx-auto px-6 pt-8 border-t border-zinc-200/60 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-zinc-400">
        <div>
          &copy; {new Date().getFullYear()} Ever, Inc. All Rights Reserved.
        </div>
        <div className="flex items-center gap-1 font-medium text-zinc-500">
          <span>Powered by</span>
          <span className="text-emerald-500 font-bold tracking-tight">Better Stack</span>
        </div>
      </footer>
    </div>
  );
}
