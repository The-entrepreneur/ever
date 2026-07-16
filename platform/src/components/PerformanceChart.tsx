import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ShieldAlert, Sparkles, TrendingUp } from "lucide-react";

type MetricType = "revenue" | "time" | "response";

export function PerformanceChart() {
  const [activeMetric, setActiveMetric] = useState<MetricType>("revenue");

  // Mock data for beautiful animated charts
  const chartData = {
    revenue: {
      title: "Cumulative Direct Booking Profit",
      description: "Ever Direct Model (retaining 97% direct margins) vs. OTA Model (averaging 18-25% commission leaks).",
      pmsSync: true,
      maxVal: 35000,
      points: [1200, 4800, 11500, 21000, 32000],
      otaPoints: [980, 3900, 9400, 17200, 26200],
      labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5"],
      unit: "$",
      impactText: "+$5,800 Retained Margin",
    },
    time: {
      title: "Cumulative Hours Reclaimed",
      description: "Hours saved per department per week by automating routine inquiries and standard operational handovers.",
      pmsSync: false,
      maxVal: 200,
      points: [15, 48, 92, 145, 192],
      otaPoints: [0, 5, 12, 18, 24],
      labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5"],
      unit: "h",
      impactText: "192 Total Operational Hours Saved",
    },
    response: {
      title: "Average Inquiry Response Time",
      description: "Front-desk responsiveness. Ever's instant omnichannel triage vs. traditional phone and inbox queues.",
      pmsSync: false,
      maxVal: 45,
      points: [0.2, 0.2, 0.2, 0.2, 0.2], // Instant
      otaPoints: [18, 16, 24, 21, 19], // Traditional
      labels: ["Q1", "Q2", "Q3", "Q4", "Q5"],
      unit: "m",
      impactText: "98.9% Drop in Response Delay",
    },
  };

  const active = chartData[activeMetric];

  // Helper to generate SVG Path points
  const getSvgPath = (pointsArray: number[]) => {
    const width = 450;
    const height = 140;
    const padding = 10;
    const xStep = (width - padding * 2) / (pointsArray.length - 1);
    
    return pointsArray.map((pt, i) => {
      const x = padding + i * xStep;
      // Invert Y axis for SVG coordinate system
      const y = height - padding - (pt / active.maxVal) * (height - padding * 2);
      return `${i === 0 ? "M" : "L"} ${x} ${y}`;
    }).join(" ");
  };

  return (
    <div className="bg-[#111111] border border-zinc-800 rounded-3xl p-5 sm:p-6 text-white flex flex-col justify-between h-full relative overflow-hidden text-left shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#EA6639] opacity-[0.05] rounded-full blur-3xl pointer-events-none" />
      
      <div>
        {/* Toggle Controls */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-zinc-900 rounded-xl border border-zinc-800 mb-6 w-fit">
          <button
            onClick={() => setActiveMetric("revenue")}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-all font-medium ${
              activeMetric === "revenue"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Direct Revenue
          </button>
          <button
            onClick={() => setActiveMetric("time")}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-all font-medium ${
              activeMetric === "time"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Operational Capacity
          </button>
          <button
            onClick={() => setActiveMetric("response")}
            className={`px-3 py-1.5 text-[10px] sm:text-xs rounded-lg transition-all font-medium ${
              activeMetric === "response"
                ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            Guest Experience
          </button>
        </div>

        {/* Chart Header */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold tracking-tight text-white mb-1.5">
            {active.title}
          </h4>
          <p className="text-[10px] sm:text-xs text-zinc-400 leading-normal font-light">
            {active.description}
          </p>
        </div>

        {/* Main Chart Area */}
        <div className="relative h-44 sm:h-48 border border-zinc-800/80 rounded-2xl bg-zinc-900/40 p-4 mb-5 flex flex-col justify-between overflow-hidden">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="border-b border-dashed border-zinc-700 w-full"></div>
            <div className="border-b border-dashed border-zinc-700 w-full"></div>
            <div className="border-b border-dashed border-dashed border-zinc-700 w-full"></div>
          </div>

          <div className="relative w-full h-[140px] mt-2">
            <svg viewBox="0 0 450 140" className="w-full h-full overflow-visible">
              <AnimatePresence mode="wait">
                <motion.g
                  key={activeMetric}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* OTA traditional path */}
                  <path
                    d={getSvgPath(active.otaPoints)}
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    className="opacity-70"
                  />
                  {/* Ever path */}
                  <path
                    d={getSvgPath(active.points)}
                    fill="none"
                    stroke="#EA6639"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  {/* Ever gradient fill */}
                  <path
                    d={`${getSvgPath(active.points)} L 440 130 L 10 130 Z`}
                    fill="url(#ever-grad)"
                    className="opacity-10"
                  />
                  
                  {/* Highlight points */}
                  {active.points.map((pt, i) => {
                    const width = 450;
                    const height = 140;
                    const padding = 10;
                    const xStep = (width - padding * 2) / (active.points.length - 1);
                    const x = padding + i * xStep;
                    const y = height - padding - (pt / active.maxVal) * (height - padding * 2);
                    
                    return i === active.points.length - 1 ? (
                      <circle key={i} cx={x} cy={y} r="5" fill="#EA6639" className="animate-pulse" />
                    ) : null;
                  })}
                </motion.g>
              </AnimatePresence>

              <defs>
                <linearGradient id="ever-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EA6639" />
                  <stop offset="100%" stopColor="#EA6639" stopOpacity="0" />
                </linearGradient>
              </defs>
            </svg>
          </div>

          {/* X Axis labels */}
          <div className="flex justify-between text-[9px] text-zinc-500 font-mono tracking-widest mt-1">
            {active.labels.map((lbl, idx) => (
              <span key={idx}>{lbl}</span>
            ))}
          </div>
        </div>
      </div>

      {/* KPI & Legend Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-zinc-800">
        <div className="flex gap-4 text-[10px] font-mono">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 bg-[#EA6639]"></span>
            <span className="text-zinc-300">Ever Guest OS</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-0.5 border-t border-dashed border-[#EF4444]"></span>
            <span className="text-zinc-400">Traditional Software</span>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#EA6639]/10 border border-[#EA6639]/20 rounded-xl px-3 py-1.5 w-full sm:w-auto">
          <Sparkles className="w-3.5 h-3.5 text-[#EA6639] shrink-0" />
          <span className="text-[10px] sm:text-xs text-[#EA6639] font-semibold tracking-tight">
            {active.impactText}
          </span>
        </div>
      </div>
    </div>
  );
}
