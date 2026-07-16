import React from "react";
import { AlertCircle } from "lucide-react";

interface CapabilityHighlightsProps {
  activatedCaps: {
    faq: boolean;
    availability: boolean;
    booking: boolean;
    lead: boolean;
    upsell: boolean;
    payments: boolean;
    multilingual: boolean;
  };
  level: 1 | 2;
}

export function CapabilityHighlights({ activatedCaps, level }: CapabilityHighlightsProps) {
  const chips = [
    {
      key: "faq",
      label: "Guest Engagement",
      active: activatedCaps.faq,
      desc: "Instant answers, FAQs & assistance",
    },
    {
      key: "booking",
      label: "Direct Commerce",
      active: activatedCaps.booking,
      desc: "Transactional cart-and-checkout flows",
    },
    {
      key: "lead",
      label: "Operational Coordination",
      active: activatedCaps.lead,
      desc: "Profile mapping & guest CRM sync",
    },
    {
      key: "multilingual",
      label: "Service Fulfilment",
      active: activatedCaps.multilingual,
      desc: "Multi-language request execution",
    },
    {
      key: "payments",
      label: "Secure Payments",
      active: activatedCaps.payments,
      desc: "Flutterwave sandbox settlement nodes",
    },
    {
      key: "availability",
      label: "Live Availability",
      active: activatedCaps.availability,
      desc: "Dynamic property inventory querying",
    },
    {
      key: "upsell",
      label: "Upselling",
      active: activatedCaps.upsell,
      desc: "Ancillary & premium service upselling",
    },
    {
      key: "pms",
      label: "PMS Synchronisation",
      active: level === 2,
      desc: "Real-time sync to property software",
    },
  ];

  return (
    <div id="capability-highlights" className="bg-white border border-dash-border rounded-lg p-5 shadow-sm space-y-4">
      <h3 className="text-body font-mono uppercase tracking-wider text-dash-text-muted">
        What You're Experiencing
      </h3>
      <p className="text-body text-dash-text-sec font-light">
        Interact with the Guest OS interface. Active operational layers will automatically illuminate below:
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-body">
        {chips.map((chip) => (
          <div 
            key={chip.key}
            className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
              chip.active 
                ? "bg-emerald-50/75 border-emerald-200 text-emerald-900 shadow-[0_2px_6px_rgba(16,185,129,0.03)]" 
                : "bg-zinc-50 border-zinc-200/70 text-zinc-600"
            }`}
          >
            <span className="shrink-0 select-none">{chip.active ? "✅" : "⚪"}</span>
            <div>
              <p className={`font-semibold leading-none ${chip.active ? "text-emerald-950" : "text-zinc-800"}`}>{chip.label}</p>
              <p className={`text-[10px] mt-1.5 leading-normal ${chip.active ? "text-emerald-700 font-medium" : "text-zinc-500 font-light"}`}>
                {chip.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {level === 1 && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2 text-body text-amber-800 font-light leading-relaxed">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <span>
            You are exploring the <strong>Guest Concierge Tiers</strong>. Upgrade to HCA (Commerce Agent) using the configuration panel to engage room bookings, and ancillary checkouts within this interface.
          </span>
        </div>
      )}
    </div>
  );
}
