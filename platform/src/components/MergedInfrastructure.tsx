import { motion } from "motion/react";
import { ArrowRight, Check, Shield, Database, LayoutDashboard, Smartphone, Zap } from "lucide-react";

export function MergedInfrastructure() {
  return (
    <section id="enterprise-infrastructure" className="bg-[#0f1115] text-white py-14 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-white/5">
      <div className="max-w-[1240px] mx-auto">
        
        {/* Bento Header section with compact 3-column details */}
        <div className="mb-10 border-b border-white/5 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[9px] font-mono tracking-widest text-[#EA6639] uppercase mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EA6639] animate-pulse"></div>
                Enterprise Infrastructure
              </div>
              <h2 className="text-lg sm:text-xl lg:text-2xl font-medium tracking-tight leading-tight text-white max-w-lg">
                Enterprise Hospitality Infrastructure, Built for Continuous Operations.
              </h2>
            </div>
            
            <div className="lg:col-span-7">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-3 text-left">
                  <div className="text-[9px] font-mono uppercase text-[#EA6639] tracking-wider mb-1">01. Coexistence</div>
                  <p className="text-[10px] text-zinc-400 font-light leading-normal">
                    Designed to operate seamlessly alongside the critical systems your property already depends on.
                  </p>
                </div>
                <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-3 text-left">
                  <div className="text-[9px] font-mono uppercase text-[#EA6639] tracking-wider mb-1">02. Integration</div>
                  <p className="text-[10px] text-zinc-400 font-light leading-normal">
                    Unifies PMS, payment gateways, and operational platforms into a single connected ecosystem.
                  </p>
                </div>
                <div className="bg-[#1a1c23] border border-white/5 rounded-xl p-3 text-left">
                  <div className="text-[9px] font-mono uppercase text-[#EA6639] tracking-wider mb-1">03. Reliability</div>
                  <p className="text-[10px] text-zinc-400 font-light leading-normal">
                    Delivers enterprise-grade continuous reliability with zero manual data entry or workflow disruption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Card 1: Enterprise Integrations */}
          <div className="md:col-span-12 lg:col-span-6 bg-[#1a1c23] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-5 md:p-6">
             <div className="mb-4 relative w-full h-[160px] bg-white rounded-lg p-3 shadow-sm border border-[#E5E7EB] overflow-hidden flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-b from-[#F9F6F0]/50 to-white pointer-events-none"></div>
                  {/* UI Mockup for Upload */}
                  <div className="w-full max-w-[220px] bg-[#fdfdfc] border border-zinc-200 border-dashed rounded-lg p-3 flex flex-col items-center justify-center text-center shadow-sm relative z-10">
                     <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center mb-1.5">
                        <span className="text-red-600 font-semibold text-[9px] text-center leading-none">PMS</span>
                     </div>
                     <p className="text-[#111] font-semibold text-[10px] mb-0.5">PMS Integration Setup</p>
                     <p className="text-zinc-500 text-[9px] leading-tight">Verify your Property Management System, secure keyless entry, and point-of-sale systems</p>
                  </div>
                  <div className="absolute bottom-2 bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-semibold flex items-center gap-1 border border-green-200 z-10 shadow-sm">
                    <Check className="w-2.5 h-2.5" /> Integration Sync Verified
                  </div>
             </div>
             <div>
                <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
                  <Database className="w-3 h-3" /> Core Systems Connect
                </div>
                <h3 className="text-sm font-medium mb-1 text-white tracking-tight">Enterprise Integrations</h3>
                <p className="text-zinc-400 text-[10px] font-light leading-normal mb-3">
                  Connect with leading property management systems, payment gateways and hospitality platforms without replacing existing infrastructure.
                </p>
                <button className="flex items-center gap-1 text-[9px] font-semibold bg-white text-black px-2 py-0.5 rounded-full hover:bg-zinc-200 transition-colors">
                  System Integrations <ArrowRight className="w-2.5 h-2.5" />
                </button>
             </div>
          </div>

          {/* Card 2: Scalable Deployment */}
          <div className="md:col-span-12 lg:col-span-6 bg-[#1a1c23] rounded-xl overflow-hidden border border-white/5 flex flex-col justify-between p-5 md:p-6">
            <div>
               <div className="text-[9px] font-mono tracking-widest text-zinc-500 uppercase mb-1.5 flex items-center gap-1.5">
                 <Smartphone className="w-3 h-3" /> Multi-Property Deployment
               </div>
               <h3 className="text-sm font-medium mb-1 text-white tracking-tight">Scalable Deployment</h3>
               <p className="text-zinc-400 text-[10px] font-light leading-normal mb-3">
                 Deploy across independent hotels, hotel groups and multi-property portfolios while maintaining consistent operational standards.
               </p>
               <button className="flex items-center gap-1 text-[9px] font-semibold bg-white text-black px-2 py-0.5 rounded-full hover:bg-zinc-200 transition-colors mb-4">
                 Deployment Details <ArrowRight className="w-2.5 h-2.5" />
               </button>
            </div>
            
            <div className="relative w-full h-[160px] flex items-end justify-center perspective-[1000px] overflow-hidden">
               {/* Phone Mockup floating */}
               <div className="w-[85%] max-w-[200px] h-[220px] bg-white rounded-t-xl border-[4px] border-[#111] shadow-2xl relative overflow-hidden rotate-y-[-8deg] rotate-x-[8deg] translate-y-6">
                  <div className="w-full h-3 bg-[#111] flex justify-center items-end pb-0.5">
                     <div className="w-1/4 h-0.5 bg-black rounded-full"></div>
                  </div>
                  <div className="p-2.5 space-y-2">
                     <div className="bg-zinc-100 p-1.5 rounded text-[9px] leading-tight text-[#111] border border-zinc-200">
                       Deploying operational standard templates across portfolio hotels...
                     </div>
                     <div className="bg-[#EA6639] text-white p-1.5 rounded text-[9px] leading-tight self-end ml-4 shadow-sm border border-[#EA6639]">
                       Active in 12 properties.
                     </div>
                     <div className="bg-zinc-100 p-1.5 rounded text-[9px] leading-tight text-[#111] border border-zinc-200">
                       Operations synchronized. Standardized guest journey continuity live.
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Card 3: Continuous Department Orchestration */}
          <div className="md:col-span-12 bg-[#1a1c23] rounded-xl overflow-hidden border border-white/5 flex flex-col lg:flex-row items-center p-5 md:p-6 gap-6">
            <div className="flex-1 text-left">
               <div className="text-[9px] font-mono tracking-widest text-[#EA6639] uppercase mb-1.5 flex items-center gap-1.5">
                 <LayoutDashboard className="w-3 h-3" /> Operational Continuity
               </div>
               <h3 className="text-base font-medium mb-2 text-white tracking-tight">Continuous Department Orchestration</h3>
               <p className="text-zinc-400 text-[10px] font-light leading-normal mb-4">
                 Maintain uninterrupted guest engagement and operational coordination across every department, every day.
               </p>
               
               <div className="space-y-3 mb-4">
                  <div>
                    <h4 className="text-white font-medium text-[10px] flex items-center gap-1.5 mb-0.5"><Shield className="w-3 h-3 text-zinc-500" /> Active Service Continuity</h4>
                    <p className="text-zinc-400 text-[9px] pl-4.5 leading-normal">Continuous operational handovers keep guest communications and back-of-house coordination aligned in real time.</p>
                  </div>
                  <div>
                    <h4 className="text-white font-medium text-[10px] flex items-center gap-1.5 mb-0.5"><Zap className="w-3 h-3 text-zinc-500" /> Complete System Resilience</h4>
                    <p className="text-zinc-400 text-[9px] pl-4.5 leading-normal">Built-in redundancy and auto-escalation path routing ensure no guest request or service task gets overlooked.</p>
                  </div>
               </div>
               <button className="flex items-center gap-1 text-[9px] font-semibold bg-white text-black px-2 py-0.5 rounded-full hover:bg-zinc-200 transition-colors">
                 Operational Dashboard <ArrowRight className="w-2.5 h-2.5" />
               </button>
            </div>
            
            <div className="flex-1 w-full relative">
               {/* Dashboard mockup */}
               <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden border border-[#E5E7EB]">
                  <div className="h-6 bg-zinc-50 border-b border-[#E5E7EB] flex items-center px-2 gap-1">
                     <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                     <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                  </div>
                  <div className="p-3">
                     <div className="flex justify-between items-center mb-3">
                       <div className="text-left">
                         <h5 className="font-semibold text-[10px] text-[#111]">Continuous Operations</h5>
                         <p className="text-[8px] text-zinc-500">Live system coordination</p>
                       </div>
                       <div className="flex gap-2">
                         <div className="text-right">
                           <p className="text-[8px] text-zinc-500 uppercase">Coordinated</p>
                           <p className="font-semibold text-xs text-emerald-600">100%</p>
                         </div>
                         <div className="text-right">
                           <p className="text-[8px] text-zinc-500 uppercase">Continuity</p>
                           <p className="font-semibold text-xs text-[#EA6639]">Active</p>
                         </div>
                       </div>
                     </div>
                     
                     {/* Dummy stats rows */}
                     <div className="space-y-1.5">
                       <div className="flex bg-zinc-50 rounded p-1.5 justify-between items-center border border-zinc-100">
                         <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-blue-100 flex items-center justify-center text-[7px] font-bold text-blue-700">PMS</div>
                            <span className="text-[9px] font-medium text-[#111]">Property Sync</span>
                         </div>
                         <div className="w-1/2 bg-zinc-200 h-1 rounded-full overflow-hidden">
                           <div className="bg-blue-500 h-full w-full"></div>
                         </div>
                       </div>
                       <div className="flex bg-zinc-50 rounded p-1.5 justify-between items-center border border-zinc-100">
                         <div className="flex items-center gap-1">
                            <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[7px] font-bold text-emerald-700">OPS</div>
                            <span className="text-[9px] font-medium text-[#111]">Department Sync</span>
                         </div>
                         <div className="w-1/2 bg-zinc-200 h-1 rounded-full overflow-hidden">
                           <div className="bg-emerald-500 h-full w-full"></div>
                         </div>
                       </div>
                     </div>
                  </div>
               </div>
            </div>
          </div>

          {/* Stats Bottom row */}
          <div className="md:col-span-4 bg-[#1a1c23] rounded-xl border border-white/5 p-5 flex flex-col justify-center text-left">
             <p className="text-zinc-500 text-[10px] font-medium mb-0.5">Save up to</p>
             <h4 className="text-xl lg:text-2xl font-semibold text-white tracking-tight mb-0.5">10 Hours</h4>
             <p className="text-[10px] text-zinc-500 mb-3 font-medium">per week per staff member</p>
             <p className="text-[10px] text-zinc-400 font-light leading-normal pt-3 border-t border-white/5">
               Shorten time to resolution, eliminate operational gaps, and maximize service continuity.
             </p>
          </div>
          
          <div className="md:col-span-8 bg-gradient-to-br from-[#1e2335] to-[#121626] rounded-xl border border-blue-900/20 p-5 md:p-6 flex flex-col justify-center text-left">
             <p className="text-blue-400 text-[10px] font-semibold mb-0.5">Isolated Architecture</p>
             <h4 className="text-sm font-medium tracking-tight text-white mb-1">Secure Operational Layer</h4>
             <p className="text-[10px] text-zinc-300 font-light leading-relaxed mb-2">
               Protect guest interactions and operational workflows through isolated deployment architecture and secure system integrations.
             </p>
             <p className="text-[9px] text-blue-200/50 font-light leading-normal">
               GDPR Compliant · Secure Tenant Sandbox · Encrypted Data-at-Rest & Transit
             </p>
          </div>
        </div>

        {/* Business Assurance Block */}
        <div className="mt-6 bg-[#1a1c23] border border-white/5 rounded-xl p-5 text-center max-w-2xl mx-auto">
          <p className="text-xs font-medium leading-normal text-white">
            Ever's Guest OS complements your existing technology investment.
          </p>
          <p className="text-zinc-400 text-[10px] mt-1 font-light leading-relaxed max-w-lg mx-auto">
            There is no need to replace your PMS, communication platforms or operational systems. Ever strengthens what already works by connecting people, processes and systems into one operational layer.
          </p>
        </div>
      </div>
    </section>
  );
}
