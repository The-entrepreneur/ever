import React from "react";
import { useCurrency } from "../context/CurrencyContext";
import { ArrowRightLeft } from "lucide-react";

export function CurrencyToggle({ className = "" }: { className?: string }) {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      title={`Switch to ${currency === "USD" ? "Nigerian Naira (NGN)" : "US Dollar (USD)"}`}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition-all duration-200 cursor-pointer select-none ${
        currency === "USD"
          ? "bg-zinc-100 hover:bg-zinc-200/80 text-zinc-900 border-zinc-200"
          : "bg-[#008751]/10 hover:bg-[#008751]/20 text-[#008751] border-[#008751]/30 font-bold"
      } ${className}`}
    >
      <span className="flex items-center gap-1">
        {currency === "USD" ? "🇺🇸 USD ($)" : "🇳🇬 NGN (₦)"}
      </span>
      <ArrowRightLeft className="w-3 h-3 opacity-60" />
    </button>
  );
}
