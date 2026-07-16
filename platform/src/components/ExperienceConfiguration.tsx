import React from "react";
import { Compass, ChevronRight, RefreshCw, User } from "lucide-react";

interface HotelProfile {
  id: string;
  name: string;
  city: string;
  style: string;
}

interface HandoffState {
  status: 'none' | 'initiating' | 'connecting' | 'connected';
  agentName: string;
  agentAvatar: string;
}

interface ExperienceConfigurationProps {
  level: 1 | 2;
  setLevel: (level: 1 | 2) => void;
  activeHotelId: "grand-horizon" | "aura-boutique" | "alpine-heights";
  setActiveHotelId: (id: "grand-horizon" | "aura-boutique" | "alpine-heights") => void;
  hotelProfiles: Record<string, HotelProfile>;
  onReset: () => void;
  handoffState: HandoffState;
  onEscalate: () => void;
}

export function ExperienceConfiguration({
  level,
  setLevel,
  activeHotelId,
  setActiveHotelId,
  hotelProfiles,
  onReset,
  handoffState,
  onEscalate
}: ExperienceConfigurationProps) {
  return (
    <div id="experience-configuration" className="bg-white border border-dash-border rounded-lg p-5 shadow-sm space-y-5">
      <h3 className="text-section font-semibold text-zinc-900 border-b border-zinc-100 pb-3 flex items-center gap-2">
        <Compass className="w-4 h-4 text-[#EA6639]" />
        Experience Configuration
      </h3>

      {/* Step 1: Choose Operational Layer */}
      <div className="space-y-2">
        <label className="block text-micro uppercase tracking-wider text-dash-text-muted">1. Choose Operational Layer</label>
        <div className="grid grid-cols-2 gap-3">
          {/* GCE / Operational Layer 1 */}
          <button 
            type="button"
            onClick={() => setLevel(1)}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[100px] cursor-pointer ${
              level === 1 
                ? "border-[#EA6639] bg-[#EA6639]/5 text-zinc-950" 
                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-600"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-micro font-mono tracking-widest font-black uppercase text-zinc-400">GCE LAYER</span>
              {level === 1 && <span className="w-2 h-2 rounded-md bg-[#EA6639]" />}
            </div>
            <div>
              <h4 className="text-body font-semibold leading-tight">Guest Concierge</h4>
              <p className="text-micro text-dash-text-muted mt-0.5">FAQ & Service Inquiry</p>
            </div>
          </button>

          {/* HCA / Operational Layer 2 */}
          <button 
            type="button"
            onClick={() => setLevel(2)}
            className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden flex flex-col justify-between h-[100px] cursor-pointer ${
              level === 2 
                ? "border-[#EA6639] bg-[#EA6639]/5 text-zinc-950" 
                : "border-zinc-200 hover:border-zinc-300 bg-zinc-50 text-zinc-800"
            }`}
          >
            <div className="flex justify-between items-center w-full">
              <span className="text-micro font-mono tracking-widest font-black uppercase text-[#EA6639]">HCA LAYER</span>
              {level === 2 && <span className="w-2 h-2 rounded-md bg-[#EA6639] animate-ping" />}
            </div>
            <div>
              <h4 className="text-body font-semibold leading-tight">Commerce Agent</h4>
              <p className="text-micro text-dash-text-muted mt-0.5">Direct Commerce & Booking</p>
            </div>
          </button>
        </div>
      </div>

      {/* Step 2: Choose Experience Scenario */}
      <div className="space-y-2">
        <label className="block text-micro uppercase tracking-wider text-dash-text-muted">2. Choose Experience Scenario</label>
        <div className="space-y-2">
          {Object.values(hotelProfiles).map((hotel) => (
            <button
              key={hotel.id}
              type="button"
              onClick={() => setActiveHotelId(hotel.id as any)}
              className={`w-full p-3 rounded-lg border text-left transition-all flex items-center justify-between gap-4 cursor-pointer ${
                activeHotelId === hotel.id 
                  ? "border-zinc-900 bg-zinc-900 text-white shadow" 
                  : "border-zinc-200 bg-zinc-50 hover:bg-zinc-100 text-zinc-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 ${
                  activeHotelId === hotel.id ? "bg-white/10" : "bg-zinc-200 text-zinc-700"
                }`}>
                  🏨
                </div>
                <div>
                  <h4 className="text-body font-semibold">{hotel.name}</h4>
                  <p className={`text-micro font-light ${activeHotelId === hotel.id ? "text-zinc-300" : "text-zinc-500"}`}>
                    {hotel.city} — {hotel.style.split(" & ")[0]}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 opacity-50 shrink-0" />
            </button>
          ))}
        </div>
      </div>

      {/* Reset experience session button */}
      <button 
        type="button"
        onClick={onReset}
        className="w-full py-2 bg-zinc-100 hover:bg-zinc-200/80 rounded-md text-body font-semibold text-zinc-700 transition-colors flex items-center justify-center gap-2 cursor-pointer border border-zinc-200"
      >
        <RefreshCw className="w-3.5 h-3.5" />
        Reset Experience Session
      </button>

      {/* Operational Escalation */}
      <div className="pt-4 border-t border-zinc-100 space-y-2">
        <label className="block text-micro uppercase tracking-wider text-dash-text-muted">3. Operational Escalation</label>
        <button 
          type="button"
          onClick={onEscalate}
          disabled={handoffState.status !== 'none'}
          className={`w-full py-2 rounded-md text-body font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all border ${
            handoffState.status === 'connected' 
              ? "bg-emerald-50 text-emerald-700 border-emerald-200 cursor-not-allowed" 
              : handoffState.status === 'connecting' || handoffState.status === 'initiating'
              ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
              : "bg-amber-500 hover:bg-amber-600 text-white border-amber-400 shadow-xs hover:scale-[1.01]"
          }`}
        >
          <User className={`w-3.5 h-3.5 ${handoffState.status === 'none' ? 'animate-bounce' : ''}`} />
          {handoffState.status === 'connected' ? "Staff Rep Sarah is Active" :
           handoffState.status === 'connecting' || handoffState.status === 'initiating' ? "Silently Transferring..." :
           "Escalate to Hotel Staff"}
        </button>
        <p className="text-micro text-dash-text-muted font-light leading-normal text-center">
          Triggers our live background routing engine: bridges active guest sessions instantly to the front-desk console. You can also trigger this naturally by typing <strong>"I want to speak with a human"</strong> in the chat.
        </p>
      </div>
    </div>
  );
}
