import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { InteractiveButton } from "./InteractiveButton";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  MessageSquare, 
  Globe, 
  Calendar, 
  ArrowRight, 
  RotateCcw, 
  BarChart3, 
  Users, 
  Share2, 
  Download, 
  Tag, 
  Sparkles, 
  ChevronLeft, 
  ChevronRight,
  Database,
  Layers,
  HelpCircle,
  Play,
  Volume2
} from "lucide-react";

type ChannelType = "All" | "WhatsApp" | "Facebook" | "Telegram" | "Twilio" | "SMS";

interface StatItem {
  label: string;
  count: number;
  change: string;
  isPositive: boolean;
  history: number[];
}

export function RevenueIntelligence() {
  // Navigation & Simulation State
  const [selectedChannel, setSelectedChannel] = useState<ChannelType>("All");
  const [simulationSpeed, setSimulationSpeed] = useState<"standard" | "boosted">("standard");
  const [pulseCount, setPulseCount] = useState<number>(0);
  
  // Calendar states mimicking the design template
  const [startDay, setStartDay] = useState<number>(18);
  const [endDay, setEndDay] = useState<number>(31);
  const [activeMonth, setActiveMonth] = useState<"October" | "November">("October");

  // Dynamic simulation multipliers
  const pulseMultiplier = useMemo(() => {
    let multiplier = 1.0;
    if (selectedChannel === "WhatsApp") multiplier = 1.15;
    if (selectedChannel === "Facebook") multiplier = 0.95;
    if (selectedChannel === "Telegram") multiplier = 1.08;
    if (selectedChannel === "Twilio") multiplier = 0.88;
    if (selectedChannel === "SMS") multiplier = 1.05;
    return multiplier + (pulseCount * 0.02);
  }, [selectedChannel, pulseCount]);

  // Main interactive statistics
  const coreStats = useMemo(() => {
    return {
      avgHandlingTime: {
        val: `${(5 * pulseMultiplier).toFixed(1)}m ${(24 * pulseMultiplier).toFixed(0)}s`,
        change: "+6.4%",
        isPositive: false,
        desc: "Avg duration of transactional checkout syncs"
      },
      conversations: {
        val: Math.round(252 * pulseMultiplier),
        change: "+0.2%",
        isPositive: true,
        answered: Math.round(186 * pulseMultiplier),
        received: Math.round(66 * pulseMultiplier)
      },
      handlingAnalysis: {
        current: `${(8 * pulseMultiplier).toFixed(1)}m ${(36 * pulseMultiplier).toFixed(0)}s`,
        change: "+2.5%",
        isPositive: false,
        avgLimit: "6m 12s",
        points: [30, 45, 25, 60, 40, 75, 45, 90, 50, 70, 40, 85, 30] // SVG Path Coordinates
      },
      firstResponse: {
        current: `${(12 * pulseMultiplier).toFixed(0)}m ${(45 * pulseMultiplier).toFixed(0)}s`,
        change: "-0.2%",
        isPositive: true,
        avgLimit: "15m 00s",
        points: [70, 50, 80, 40, 65, 35, 90, 45, 75, 55, 60, 40, 50] // SVG Path Coordinates
      },
      chatbotPerformance: {
        received: Math.round(832 * pulseMultiplier),
        receivedChange: "+0.9%",
        closed: Math.round(627 * pulseMultiplier),
        closedChange: "-0.8%",
        points: [120, 180, 150, 240, 190, 310, 160] // Stacked/vertical offsets
      }
    };
  }, [pulseMultiplier]);

  // Table rows matching the image
  const tableData = [
    { name: "Facebook Messenger", slug: "Facebook", handTime: "4m 06s", handChg: "+2.8%", handPos: false, respTime: "5m 27s", respChg: "-0.3%", respPos: true, icon: <FacebookIcon /> },
    { name: "WhatsApp Business", slug: "WhatsApp", handTime: "3m 28s", handChg: "-0.4%", handPos: true, respTime: "2m 48s", respChg: "-2.4%", respPos: true, icon: <WhatsAppIcon /> },
    { name: "Telegram Agent", slug: "Telegram", handTime: "5m 16s", handChg: "+3.7%", handPos: false, respTime: "6m 32s", respChg: "+0.7%", respPos: false, icon: <TelegramIcon /> },
    { name: "Twilio API (SMS)", slug: "Twilio", handTime: "2m 45s", handChg: "+2.3%", handPos: false, respTime: "1m 23s", respChg: "-3.6%", respPos: true, icon: <TwilioIcon /> },
    { name: "Direct Native SMS", slug: "SMS", handTime: "2m 12s", handChg: "-1.5%", handPos: true, respTime: "0m 52s", respChg: "-4.2%", respPos: true, icon: <MessageSquare className="w-4 h-4 text-zinc-500" /> }
  ];

  // Helper trigger to simulate instant transaction pulse
  const triggerPulse = () => {
    setPulseCount(prev => prev + 1);
  };

  const resetPulse = () => {
    setPulseCount(0);
    setSelectedChannel("All");
    setStartDay(18);
    setEndDay(31);
  };

  // Quick select day on calendar Simulation
  const handleDayClick = (day: number) => {
    if (day < startDay) {
      setStartDay(day);
    } else {
      setEndDay(day);
    }
    setPulseCount(prev => prev + 1);
  };

  return (
    <section className="bg-[#FAF9F5] min-h-screen text-zinc-900 pt-32 pb-24 relative overflow-hidden transition-all duration-500">
      
      {/* Absolute Designer BG Deco Elements */}
      <div className="absolute top-[10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#EA6639]/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[10%] right-[-10%] w-[35vw] h-[35vw] rounded-full bg-[#7C3AED]/5 blur-[100px] pointer-events-none" />

      <div className="max-w-[1300px] mx-auto px-6 sm:px-8 lg:px-10 relative z-10">
        
        {/* Top Control Header bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12 border-b border-zinc-200 pb-6">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EA6639] animate-pulse"></span>
            <span className="text-[12px] font-bold text-[#EA6639] tracking-widest uppercase font-mono">
              Live Core Sync Active
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            <InteractiveButton 
              onClick={triggerPulse}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Simulate Core Pulse
            </InteractiveButton>
            <InteractiveButton 
              onClick={resetPulse}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-zinc-200/50 hover:bg-zinc-200 !text-zinc-700 rounded-lg text-xs font-semibold transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Data Source
            </InteractiveButton>
          </div>
        </div>

        {/* 1. Hero Overview Block */}
        <div className="grid lg:grid-cols-12 gap-12 items-start mb-24">
          
          <div className="lg:col-span-6 flex flex-col justify-center h-full">
            <h1 className="text-[40px] md:text-[56px] font-serif leading-[1.05] tracking-tight text-zinc-950 font-normal mb-6">
              Track all transactional guest data on one console.
            </h1>
            <p className="text-[16px] text-zinc-600 font-light leading-relaxed mb-8 max-w-lg">
              Aggregate full conversational commerce, automated payment ledgers, real-time response trends, and agent performance metrics in high fidelity.
            </p>
            
            <div className="flex flex-wrap gap-4 items-center">
              <InteractiveButton 
                to="#interactive-suite" 
                className="text-white"
              >
                Launch Intelligence Suite
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </InteractiveButton>
              <div className="flex items-center gap-2 ml-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider font-mono">
                  Cloudbeds API Verified
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero Cards aligned to the visual layout shown in the image */}
          <div className="lg:col-span-6 grid sm:grid-cols-2 gap-6 w-full">
            
            {/* Top right card: Average handling time (sparkline & direct layout mimicking image templates) */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                  Average handling time
                </span>
                <Clock className="w-4 h-4 text-zinc-400" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-[32px] font-medium tracking-tight font-sans text-zinc-900">
                  {coreStats.avgHandlingTime.val}
                </span>
                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <TrendingDown className="w-2.5 h-2.5" /> 6.4%
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-6">
                Average duration of total guest conversational flows
              </p>
              
              {/* Splendid interactive Sparkline path */}
              <div className="h-16 w-full mt-4">
                <svg viewBox="0 0 100 30" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.1" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  {/* Grid baseline */}
                  <line x1="0" y1="20" x2="100" y2="20" stroke="#f1f1f1" strokeWidth="0.5" strokeDasharray="2" />
                  {/* sparkline path */}
                  <motion.path 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1 }}
                    d="M 0 18 Q 15 10 30 22 T 60 12 T 90 20 T 100 15" 
                    fill="none" 
                    stroke="#3B82F6" 
                    strokeWidth="1.5" 
                    strokeLinecap="round"
                  />
                  {/* Area fill */}
                  <path d="M 0 18 Q 15 10 30 22 T 60 12 T 90 20 T 100 15 L 100 30 L 0 30 Z" fill="url(#sparklineGrad)" />
                  {/* Indicator peak element */}
                  <circle cx="60" cy="12" r="2.5" fill="#3B82F6" className="animate-ping" />
                  <circle cx="60" cy="12" r="1.5" fill="#1D4ED8" />
                </svg>
              </div>
            </div>

            {/* Bottom/Right card: Count of conversations (with stacked bar aesthetics exactly mimicking the image template) */}
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-sm hover:shadow-md transition-all relative">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[11px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                  Count of conversations
                </span>
                <MessageSquare className="w-4 h-4 text-zinc-400" />
              </div>
              
              <div className="flex items-baseline gap-2 mb-4">
                <span className="text-[32px] font-medium tracking-tight text-zinc-900">
                  {coreStats.conversations.val}
                </span>
                <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <TrendingUp className="w-2.5 h-2.5" /> 0.2%
                </span>
              </div>

              {/* Stacked legends */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7C3AED]"></span>
                  <span className="text-[11px] font-medium text-zinc-500">Answered ({coreStats.conversations.answered})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FB7185]"></span>
                  <span className="text-[11px] font-medium text-zinc-500">Received ({coreStats.conversations.received})</span>
                </div>
              </div>

              {/* Column Bar Charts */}
              <div className="grid grid-cols-5 gap-3 h-20 items-end mt-4">
                {[
                  { answered: 14, received: 6 },
                  { answered: 18, received: 8 },
                  { answered: 12, received: 11 },
                  { answered: 22, received: 4 },
                  { answered: 16, received: 7 }
                ].map((bar, idx) => (
                  <div key={idx} className="flex flex-col gap-0.5 h-full justify-end">
                    <div className="w-full flex flex-col justify-end h-full relative group">
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                        Ans: {bar.answered} / Rec: {bar.received}
                      </div>
                      <div 
                        className="w-full bg-[#FB7185] rounded-t-sm transition-all duration-500" 
                        style={{ height: `${(bar.received / 30) * 100}%` }}
                      />
                      <div 
                        className="w-full bg-[#7C3AED] rounded-t-sm transition-all duration-500" 
                        style={{ height: `${(bar.answered / 30) * 100}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-zinc-400 text-center font-mono mt-1">Oct {24 + idx}</span>
                  </div>
                ))}
              </div>

            </div>

          </div>

        </div>

        {/* 2. Monitor your Average Handling Time + First Response Times Section */}
        <div id="interactive-suite" className="border-t border-zinc-200/80 pt-20 mb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center mb-16">
            
            {/* Average Handling Time Visualization Graphic */}
            <div className="lg:col-span-6 bg-white border border-zinc-200/60 rounded-2xl p-8 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-[13px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                    Average Handling Time
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-medium tracking-tight text-zinc-900">{coreStats.handlingAnalysis.current}</span>
                    <span className="text-[11px] font-bold text-[#EA6639] bg-[#EA6639]/10 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingUp className="w-2.5 h-2.5" /> {coreStats.handlingAnalysis.change}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#3B82F6]"></span> Handling time</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> Limit Average ({coreStats.handlingAnalysis.avgLimit})</span>
                </div>
              </div>

              {/* Main Vector line chart representing the image */}
              <div className="h-56 w-full relative">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaHandling" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Chart Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="110" x2="300" y2="110" stroke="#e2e8f0" strokeWidth="0.8" />

                  {/* Limit line matching the target dotted average indicator */}
                  <line x1="0" y1="65" x2="300" y2="65" stroke="rgb(245, 158, 11)" strokeWidth="1.2" strokeDasharray="3" />
                  <text x="280" y="61" className="text-[7px] fill-amber-500 font-bold uppercase tracking-widest font-mono">Avg Limit</text>

                  {/* Live SVG path with animatable coordinates */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2 }}
                    d={`M 0 ${coreStats.handlingAnalysis.points[0]} 
                        L 30 ${coreStats.handlingAnalysis.points[1]} 
                        L 60 ${coreStats.handlingAnalysis.points[2]} 
                        L 90 ${coreStats.handlingAnalysis.points[3]} 
                        L 120 ${coreStats.handlingAnalysis.points[4]} 
                        L 150 ${coreStats.handlingAnalysis.points[5]} 
                        L 180 ${coreStats.handlingAnalysis.points[6]} 
                        L 210 ${coreStats.handlingAnalysis.points[7]} 
                        L 240 ${coreStats.handlingAnalysis.points[8]} 
                        L 270 ${coreStats.handlingAnalysis.points[9]} 
                        L 300 ${coreStats.handlingAnalysis.points[10]}`}
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Dynamic Shaded area */}
                  <path 
                    d={`M 0 ${coreStats.handlingAnalysis.points[0]} 
                        L 30 ${coreStats.handlingAnalysis.points[1]} 
                        L 60 ${coreStats.handlingAnalysis.points[2]} 
                        L 90 ${coreStats.handlingAnalysis.points[3]} 
                        L 120 ${coreStats.handlingAnalysis.points[4]} 
                        L 150 ${coreStats.handlingAnalysis.points[5]} 
                        L 180 ${coreStats.handlingAnalysis.points[6]} 
                        L 210 ${coreStats.handlingAnalysis.points[7]} 
                        L 240 ${coreStats.handlingAnalysis.points[8]} 
                        L 270 ${coreStats.handlingAnalysis.points[9]} 
                        L 300 ${coreStats.handlingAnalysis.points[10]} L 300 110 L 0 110 Z`}
                    fill="url(#areaHandling)"
                  />

                  {/* Point circles */}
                  <circle cx="150" cy={coreStats.handlingAnalysis.points[5]} r="4" fill="#3B82F6" className="animate-ping" />
                  <circle cx="150" cy={coreStats.handlingAnalysis.points[5]} r="2.5" fill="#1D4ED8" />

                </svg>
              </div>

              {/* X Axis indicators */}
              <div className="flex justify-between items-center px-2 mt-3 text-[10px] font-mono text-zinc-400 font-semibold uppercase">
                <span>Oct 1</span>
                <span>Oct 10</span>
                <span>Oct 20</span>
                <span>Oct 31</span>
              </div>
            </div>

            {/* Right Column copy writing */}
            <div className="lg:col-span-6 lg:pl-8">
              <h3 className="text-[28px] sm:text-[36px] font-serif tracking-tight leading-[1.1] text-zinc-950 font-medium mb-6">
                Monitor your Average Handling Time
              </h3>
              <p className="text-[15px] text-zinc-600 font-light leading-relaxed mb-6">
                Configure operational windows to measure and monitor your property's Average Handling Time. Automatically identify areas of high customer friction, payment synchronization latency, and routing failures.
              </p>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <span className="p-1 px-2 text-[10px] font-mono font-bold bg-[#EA6639]/15 text-[#EA6639] rounded mt-0.5">01</span>
                  <div>
                    <h5 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-wider">Dynamic Threshold Alerts</h5>
                    <p className="text-[12px] text-zinc-500 font-light mt-0.5">Threshold triggers auto-escalate lingering guest inquiries if AI syncs stall.</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="p-1 px-2 text-[10px] font-mono font-bold bg-violet-100 text-violet-700 rounded mt-0.5">02</span>
                  <div>
                    <h5 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-wider">Staff Shift Optimization</h5>
                    <p className="text-[12px] text-zinc-500 font-light mt-0.5">Align front-office rosters with volume spikes shown in handling charts.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* First Response analytics block */}
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column Copy */}
            <div className="lg:col-span-6 lg:pr-8 order-2 lg:order-1">
              <h3 className="text-[28px] sm:text-[36px] font-serif tracking-tight leading-[1.1] text-zinc-950 font-medium mb-6">
                First response time analysis
              </h3>
              <p className="text-[15px] text-zinc-600 font-light leading-relaxed mb-6">
                Ever's telemetry includes state-of-the-art tools to capture first-touch response intervals. Track how efficiently direct API ledgers register bookings from cold leads without human friction.
              </p>
              
              <div className="flex items-center gap-3 bg-white p-4.5 rounded-xl border border-zinc-200/60 max-w-md shadow-xs">
                <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h6 className="text-[13px] font-semibold text-zinc-900 uppercase tracking-widest font-mono">92% Real-Time Auto-Resolution</h6>
                  <p className="text-[11px] text-zinc-500">Autonomous checkout rules respond within seconds.</p>
                </div>
              </div>
            </div>

            {/* Right Column First Response Graphic */}
            <div className="lg:col-span-6 bg-white border border-zinc-200/60 rounded-2xl p-8 shadow-sm order-1 lg:order-2">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <div>
                  <h4 className="text-[13px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                    First Response Time
                  </h4>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-medium tracking-tight text-zinc-900">{coreStats.firstResponse.current}</span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                      <TrendingDown className="w-2.5 h-2.5" /> {coreStats.firstResponse.change}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-[11px] font-semibold text-zinc-500">
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Response intervals</span>
                  <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400"></span> System Average</span>
                </div>
              </div>

              {/* Mint Green Line chart replicating image aesthetics */}
              <div className="h-56 w-full relative">
                <svg viewBox="0 0 300 120" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="areaResponse" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10B981" stopOpacity="0.12" />
                      <stop offset="100%" stopColor="#10B981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Grid Lines */}
                  <line x1="0" y1="20" x2="300" y2="20" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="50" x2="300" y2="50" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="80" x2="300" y2="80" stroke="#f1f3f5" strokeWidth="0.8" />
                  <line x1="0" y1="110" x2="300" y2="110" stroke="#e2e8f0" strokeWidth="0.8" />

                  {/* Limit line */}
                  <line x1="0" y1="60" x2="300" y2="60" stroke="#fb923c" strokeWidth="1.2" strokeDasharray="3" />

                  {/* Spline Path */}
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.4 }}
                    d={`M 0 ${coreStats.firstResponse.points[0]} 
                        C 40 ${coreStats.firstResponse.points[1]}, 80 ${coreStats.firstResponse.points[2]}, 120 ${coreStats.firstResponse.points[3]} 
                        C 160 ${coreStats.firstResponse.points[4]}, 200 ${coreStats.firstResponse.points[5]}, 240 ${coreStats.firstResponse.points[6]} 
                        C 260 ${coreStats.firstResponse.points[7]}, 280 ${coreStats.firstResponse.points[8]}, 300 ${coreStats.firstResponse.points[9]}`}
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Gradient area */}
                  <path 
                    d={`M 0 ${coreStats.firstResponse.points[0]} 
                        C 40 ${coreStats.firstResponse.points[1]}, 80 ${coreStats.firstResponse.points[2]}, 120 ${coreStats.firstResponse.points[3]} 
                        C 160 ${coreStats.firstResponse.points[4]}, 200 ${coreStats.firstResponse.points[5]}, 240 ${coreStats.firstResponse.points[6]} 
                        L 300 110 L 0 110 Z`}
                    fill="url(#areaResponse)"
                  />

                  {/* Pulse point */}
                  <circle cx="200" cy={coreStats.firstResponse.points[5]} r="4" fill="#10B981" className="animate-ping" />
                  <circle cx="200" cy={coreStats.firstResponse.points[5]} r="2.5" fill="#047857" />

                </svg>
              </div>

              {/* Axis dates */}
              <div className="flex justify-between items-center px-2 mt-3 text-[10px] font-mono text-zinc-400 font-semibold uppercase">
                <span>Oct 1</span>
                <span>Oct 10</span>
                <span>Oct 20</span>
                <span>Oct 31</span>
              </div>

            </div>

          </div>
        </div>

        {/* 3. Bar Chart + Channels Specific Block */}
        <div className="border-t border-zinc-200/80 pt-20 mb-24 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Agent performance interactive bar chart */}
          <div className="lg:col-span-6 bg-white border border-zinc-200/60 rounded-2xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h4 className="text-[13px] font-mono font-bold tracking-widest uppercase text-zinc-400">
                  Agent performance reports
                </h4>
                <p className="text-[11px] text-zinc-500 mt-1">
                  Volume of core automated handovers
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-bold font-mono">
                <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded flex items-center gap-0.5">Rec: {coreStats.chatbotPerformance.received}</span>
                <span className="bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded flex items-center gap-0.5">Closed: {coreStats.chatbotPerformance.closed}</span>
              </div>
            </div>

            {/* Custom Interactive Column Graphs matching layout */}
            <div className="h-48 grid grid-cols-6 gap-4 items-end mt-8 relative">
              <div className="absolute inset-x-0 top-0 border-b border-zinc-100 pb-1">
                <span className="text-[8px] font-mono text-zinc-400 font-semibold uppercase">Peak Limit Threshold (500 limit)</span>
              </div>
              {[
                { label: "Oct 1", rec: 320, cls: 280, color: "bg-[#EA6639]" },
                { label: "Oct 10", rec: 450, cls: 390, color: "bg-[#7C3AED]" },
                { label: "Oct 18", rec: 290, cls: 210, color: "bg-amber-400" },
                { label: "Oct 24", rec: 490, cls: 410, color: "bg-[#FB7185]" },
                { label: "Oct 28", rec: 380, cls: 350, color: "bg-emerald-500" },
                { label: "Oct 31", rec: 520, cls: 480, color: "bg-[#3B82F6]" }
              ].map((bar, idx) => {
                const totalHeight = 520; // scale
                const recHeight = (bar.rec / totalHeight) * 100;
                const clsHeight = (bar.cls / totalHeight) * 100;
                return (
                  <div key={idx} className="h-full flex flex-col justify-end">
                    <div className="w-full flex justify-center gap-1.5 h-full items-end">
                      {/* Received Bar */}
                      <div className="w-4 bg-zinc-200 hover:bg-zinc-300 transition-colors rounded-t-sm h-full relative group">
                        <div 
                          style={{ height: `${recHeight}%` }} 
                          className="absolute bottom-0 w-full bg-zinc-400 opacity-60 rounded-t-sm"
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap mb-1 z-10">
                          Rec: {bar.rec}
                        </div>
                      </div>
                      {/* Resolved/Closed Bar */}
                      <div className="w-4 bg-zinc-100 hover:bg-zinc-200 transition-colors rounded-t-sm h-full relative group">
                        <div 
                          style={{ height: `${clsHeight}%` }} 
                          className={`absolute bottom-0 w-full ${bar.color} rounded-t-sm`}
                        />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap mb-1 z-10">
                          Closed: {bar.cls}
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-zinc-400 text-center font-mono mt-2 tracking-tighter">{bar.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column copywriting */}
          <div className="lg:col-span-6 lg:pl-10">
            <h3 className="text-[28px] sm:text-[36px] font-serif tracking-tight leading-[1.1] text-zinc-950 font-medium mb-6">
              Agent performance reports
            </h3>
            <p className="text-[15px] text-zinc-600 font-light leading-relaxed mb-6">
              Secure in-depth insight into your AI guest concierge automation logs. Track successful checkout funnels completed autonomously, alongside escalations handled by human property managers.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-100/60 border border-zinc-200/40 rounded-xl">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Automation rate</span>
                <div className="text-xl font-bold text-zinc-900 mt-1">84%</div>
              </div>
              <div className="p-4 bg-zinc-100/60 border border-zinc-200/40 rounded-xl">
                <span className="text-[10px] font-mono text-zinc-400 uppercase font-bold">Sync reliability</span>
                <div className="text-xl font-bold text-zinc-900 mt-1">99.9%</div>
              </div>
            </div>
          </div>

        </div>

        {/* 4. Table: Channel-Specific Reports */}
        <div id="channel-reports" className="border-t border-zinc-200/80 pt-20 mb-24">
          <div className="grid lg:grid-cols-12 gap-12 items-baseline mb-12">
            <div className="lg:col-span-5">
              <h3 className="text-[28px] sm:text-[32px] font-serif tracking-tight font-medium text-zinc-950">
                Channel-specific reports
              </h3>
              <p className="text-[14px] text-zinc-500 font-light mt-2">
                Evaluate guest responsiveness by digital channel, filtering out physical SMS bottlenecks from WhatsApp.
              </p>
            </div>
            
            {/* Interactive horizontal filter category pins */}
            <div className="lg:col-span-7 flex flex-wrap gap-2 justify-start lg:justify-end">
              {(["All", "WhatsApp", "Facebook", "Telegram", "Twilio", "SMS"] as ChannelType[]).map((channel) => (
                <button
                  key={channel}
                  onClick={() => setSelectedChannel(channel)}
                  className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all ${
                    selectedChannel === channel 
                      ? "bg-zinc-950 text-white shadow-sm" 
                      : "bg-white hover:bg-zinc-100 border border-zinc-200 text-zinc-600"
                  }`}
                >
                  {channel}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white border border-zinc-200/60 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50/50 border-b border-zinc-200 text-[11px] font-bold font-mono text-zinc-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Channel Medium</th>
                    <th className="py-4 px-6 text-center">Avg Handling Time</th>
                    <th className="py-4 px-6 text-center">First Response Time</th>
                    <th className="py-4 px-6 text-right">Operational Health</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-[13px]">
                  {tableData
                    .filter(row => selectedChannel === "All" || row.slug === selectedChannel)
                    .map((row, idx) => (
                      <tr 
                        key={idx} 
                        className={`hover:bg-zinc-50/40 transition-colors ${
                          selectedChannel === row.slug ? "bg-amber-50/30" : ""
                        }`}
                      >
                        <td className="py-4 px-6 font-semibold text-zinc-900">
                          <div className="flex items-center gap-3">
                            <span className="p-1.5 rounded-lg bg-zinc-50 border border-zinc-100 flex items-center justify-center">
                              {row.icon}
                            </span>
                            <span>{row.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 font-medium font-mono text-zinc-800">
                            {row.handTime}
                            <span className={`text-[10px] font-extrabold px-1 rounded ${
                              row.handPos ? "text-emerald-600 bg-emerald-50" : "text-[#EA6639] bg-rose-50"
                            }`}>
                              {row.handChg}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-1.5 font-medium font-mono text-zinc-800">
                            {row.respTime}
                            <span className={`text-[10px] font-extrabold px-1 rounded ${
                              row.respPos ? "text-emerald-600 bg-emerald-50" : "text-[#EA6639] bg-rose-50"
                            }`}>
                              {row.respChg}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 font-bold">Excellent</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 5. Reports Overview Sparkline grid */}
        <div className="border-t border-zinc-200/80 pt-20 mb-24">
          <div className="max-w-2xl mb-12">
            <h3 className="text-[28px] sm:text-[32px] font-serif tracking-tight font-medium text-zinc-950">
              Reports overview
            </h3>
            <p className="text-[15px] font-light text-zinc-600 mt-2">
              Deep comparison panels charting transactional volume aggregates across guest databases.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Closed conversations", val: "458", chg: "+3.5%", color: "text-emerald-600 bg-emerald-50", pts: [20, 45, 15, 60, 30, 80] },
              { title: "Received conversations", val: "876", chg: "+2.8%", color: "text-emerald-600 bg-emerald-50", pts: [40, 20, 65, 30, 75, 45] },
              { title: "Answered conversations", val: "236", chg: "-0.2%", color: "text-[#EA6639] bg-rose-50", pts: [30, 50, 40, 70, 55, 60] },
              { title: "Reopened conversations", val: "125", chg: "+0.3%", color: "text-emerald-600 bg-emerald-50", pts: [60, 40, 70, 35, 50, 20] }
            ].map((card, idx) => (
              <div key={idx} className="bg-white border border-zinc-200/60 rounded-2xl p-5 hover:shadow-sm transition-shadow">
                <span className="text-[10px] font-mono tracking-wider font-bold text-zinc-400 uppercase">
                  {card.title}
                </span>
                
                <div className="flex items-baseline gap-2 mt-2 mb-4">
                  <span className="text-2xl font-bold text-zinc-900 font-mono">{card.val}</span>
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${card.color}`}>
                    {card.chg}
                  </span>
                </div>

                {/* Sparkling SVG graph inside each Overview card */}
                <div className="h-10 w-full mt-2">
                  <svg viewBox="0 0 100 30" width="100%" height="100%" preserveAspectRatio="none">
                    <path 
                      d={`M 0 ${card.pts[0]} Q 20 ${card.pts[1]} 40 ${card.pts[2]} T 80 ${card.pts[3]} T 100 ${card.pts[4]}`} 
                      fill="none" 
                      stroke="#A855F7" 
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 6. Calendar Range Selector Widget */}
        <div id="calendar-custom-selector" className="border-t border-zinc-200/80 pt-20 mb-24 grid lg:grid-cols-12 gap-12 items-center bg-white border border-zinc-200/60 rounded-3xl p-8 sm:p-12 shadow-xs">
          
          <div className="lg:col-span-5">
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#EA6639] uppercase">
              Dynamic Date Scope Filter
            </span>
            <h3 className="text-[28px] sm:text-[36px] font-serif tracking-tight leading-[1.1] text-zinc-950 font-medium mt-3 mb-6">
              Custom date range filter
            </h3>
            <p className="text-[15px] font-light text-zinc-600 leading-relaxed mb-6">
              Filter full platform metrics down to precise shift intervals. Match guest transaction rates against local holidays, summer check-in waves, or peak hours.
            </p>
            
            <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl inline-block">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-500" />
                <span className="text-[12px] font-mono font-bold">Selected Scope:</span>
                <span className="text-[12px] font-mono text-[#EA6639] font-bold">
                  {startDay} {activeMonth} 2026 — {endDay} {activeMonth} 2026
                </span>
              </div>
            </div>
          </div>

          {/* Interactive mockup of Calendar shown in the image */}
          <div className="lg:col-span-7 flex justify-center">
            <div className="bg-white border text-zinc-900 border-zinc-200 p-6 rounded-2xl w-full max-w-sm shadow-md">
              <div className="flex items-center justify-between mb-4 border-b border-zinc-100 pb-3">
                <button 
                  onClick={() => setActiveMonth("October")}
                  className={`text-[12px] font-bold flex items-center ${activeMonth === "October" ? "text-zinc-800" : "text-zinc-400"}`}
                >
                  <ChevronLeft className="w-4 h-4" /> October
                </button>
                <span className="text-[13px] font-bold font-mono tracking-wider text-zinc-800 uppercase">
                  {activeMonth} 2026
                </span>
                <button 
                  onClick={() => setActiveMonth("November")}
                  className={`text-[12px] font-bold flex items-center ${activeMonth === "November" ? "text-zinc-800" : "text-zinc-400"}`}
                >
                  November <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] font-bold font-mono text-zinc-400 mb-2 uppercase">
                <span>Mo</span>
                <span>Tu</span>
                <span>We</span>
                <span>Th</span>
                <span>Fr</span>
                <span>Sa</span>
                <span>Su</span>
              </div>

              {/* Calendar Days loop */}
              <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = i + 1;
                  const isSelected = day >= startDay && day <= endDay;
                  const isBoundary = day === startDay || day === endDay;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => handleDayClick(day)}
                      className={`h-8 w-8 rounded-full flex items-center justify-center font-bold tracking-tight transition-all relative ${
                        isBoundary 
                          ? "bg-[#EA6639] text-white font-extrabold focus:ring-2 focus:ring-[#EA6639]/30" 
                          : isSelected 
                          ? "bg-[#EA6639]/15 text-[#EA6639]" 
                          : "text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* Reset calendar range button */}
              <div className="mt-4 pt-3 border-t border-zinc-100 flex justify-end">
                <button 
                  onClick={() => { setStartDay(18); setEndDay(31); }}
                  className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest hover:text-zinc-600 transition-colors"
                >
                  Reset calendar
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* 7. Bento Feature Grid / Supporters styled list at the bottom */}
        <div className="border-t border-zinc-200/80 pt-20">
          <div className="max-w-2xl mb-16">
            <span className="text-[11px] font-mono font-bold tracking-widest text-violet-600 uppercase">
              Full Reporting Suite
            </span>
            <h3 className="text-[28px] sm:text-[36px] font-serif tracking-tight leading-[1.1] text-zinc-950 font-medium mt-3">
              One operational standard. Unlimited intelligence.
            </h3>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 mb-6">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Company reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Aggregated statistics across all property sub-brands, room catalogs, and dynamic geographical zones.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600 mb-6 font-mono font-bold text-xs">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Agent reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Analyze and coordinate human shift performance, tracking manual reservation takeovers and response rates.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-[#EA6639]/10 flex items-center justify-center text-[#EA6639] mb-6">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Agent reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Log autonomous checkout completion sequences and AI natural-language handling confidence parameters.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 mb-6">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Tag reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Group logs automatically using contextual AI classification parameters, cataloging guest issues like billing.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 mb-6">
                <Database className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Integration Reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Verify absolute latency spikes of live ledger formats, validating API and SMS sync triggers.
              </p>
            </div>

            <div className="bg-white border border-zinc-200/60 p-6 rounded-2xl relative group hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800 mb-6">
                <Download className="w-5 h-5" />
              </div>
              <h4 className="text-[15px] font-semibold text-zinc-900 tracking-wide uppercase font-sans mb-2">Export Reports</h4>
              <p className="text-[13px] text-zinc-500 font-light leading-relaxed">
                Generate tokenized, immutable accounting sheets instantly in standard CSV, Excel, or real-time JSON webhooks.
              </p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

// Custom icons to avoid external svg loading
function FacebookIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b5998" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0088cc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function TwilioIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F22F46" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}
