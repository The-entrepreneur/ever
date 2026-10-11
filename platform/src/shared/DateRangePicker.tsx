import React, { useState, useRef, useEffect } from "react";
import { Calendar as CalendarIcon, ChevronDown, Check } from "lucide-react";

export type DateRangePreset = "today" | "7d" | "30d" | "90d" | "custom";

export interface DateRangeValue {
  preset: DateRangePreset;
  startDate: string; // ISO string or YYYY-MM-DD
  endDate: string;   // ISO string or YYYY-MM-DD
  label: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (val: DateRangeValue) => void;
  className?: string;
}

export function getDateRangeFromPreset(preset: DateRangePreset, customStart?: string, customEnd?: string): DateRangeValue {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const start = new Date(now);

  switch (preset) {
    case "today":
      start.setHours(0, 0, 0, 0);
      return {
        preset: "today",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Today"
      };
    case "7d":
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      return {
        preset: "7d",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 7 days"
      };
    case "30d":
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return {
        preset: "30d",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 30 days"
      };
    case "90d":
      start.setDate(now.getDate() - 90);
      start.setHours(0, 0, 0, 0);
      return {
        preset: "90d",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 90 days"
      };
    case "custom": {
      const s = customStart ? new Date(customStart) : new Date(now.getTime() - 30 * 86400000);
      s.setHours(0, 0, 0, 0);
      const e = customEnd ? new Date(customEnd) : new Date(now);
      e.setHours(23, 59, 59, 999);
      const sStr = s.toISOString().split("T")[0];
      const eStr = e.toISOString().split("T")[0];
      return {
        preset: "custom",
        startDate: s.toISOString(),
        endDate: e.toISOString(),
        label: `${sStr} - ${eStr}`
      };
    }
    default:
      start.setDate(now.getDate() - 30);
      start.setHours(0, 0, 0, 0);
      return {
        preset: "30d",
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        label: "Last 30 days"
      };
  }
}

export function DateRangePicker({ value, onChange, className = "" }: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customStart, setCustomStart] = useState(value.startDate ? value.startDate.split("T")[0] : "");
  const [customEnd, setCustomEnd] = useState(value.endDate ? value.endDate.split("T")[0] : "");
  const ref = useRef<HTMLDivElement>(null);

  // Keep custom inputs synced when parent value changes
  useEffect(() => {
    if (value.startDate) setCustomStart(value.startDate.split("T")[0]);
    if (value.endDate) setCustomEnd(value.endDate.split("T")[0]);
  }, [value.startDate, value.endDate]);

  const presets: { id: DateRangePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "7d", label: "Last 7 days" },
    { id: "30d", label: "Last 30 days" },
    { id: "90d", label: "Last 90 days" },
    { id: "custom", label: "Custom Range" }
  ];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectPreset = (preset: DateRangePreset) => {
    if (preset === "custom") {
      const s = new Date(customStart || value.startDate);
      s.setHours(0, 0, 0, 0);
      const eDate = new Date(customEnd || value.endDate);
      eDate.setHours(23, 59, 59, 999);
      onChange({
        preset: "custom",
        startDate: s.toISOString(),
        endDate: eDate.toISOString(),
        label: `${customStart || value.startDate.split("T")[0]} - ${customEnd || value.endDate.split("T")[0]}`
      });
    } else {
      const range = getDateRangeFromPreset(preset);
      onChange(range);
      setIsOpen(false);
    }
  };

  const handleApplyCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (customStart && customEnd) {
      const s = new Date(customStart);
      s.setHours(0, 0, 0, 0);
      const eDate = new Date(customEnd);
      eDate.setHours(23, 59, 59, 999);
      onChange({
        preset: "custom",
        startDate: s.toISOString(),
        endDate: eDate.toISOString(),
        label: `${customStart} - ${customEnd}`
      });
      setIsOpen(false);
    }
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={ref}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-3 bg-dash-surface border border-dash-border hover:border-dash-border-hover rounded-md text-xs font-medium text-dash-text flex items-center gap-2 transition-colors shadow-sm focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
      >
        <CalendarIcon className="w-3.5 h-3.5 text-dash-text-muted" />
        <span>{value.label}</span>
        <ChevronDown className="w-3 h-3 text-dash-text-muted" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-64 bg-dash-surface border border-dash-border rounded-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10 z-50 p-2 text-xs animate-in fade-in duration-100">
          <div className="space-y-1 pb-2 border-b border-dash-border-hairline">
            {presets.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectPreset(p.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                  value.preset === p.id
                    ? "bg-[#EA6639]/15 dark:bg-[#EA6639]/25 text-[#EA6639] font-semibold"
                    : "text-dash-text-sec hover:bg-dash-surface-hover hover:text-dash-text"
                }`}
              >
                <span>{p.label}</span>
                {value.preset === p.id && <Check className="w-3.5 h-3.5 text-[#EA6639]" />}
              </button>
            ))}
          </div>

          {value.preset === "custom" && (
            <form onSubmit={handleApplyCustom} className="pt-2 space-y-2">
              <div>
                <label className="block text-[10px] uppercase font-bold text-dash-text-muted mb-1">Start Date</label>
                <input
                  type="date"
                  value={customStart}
                  onChange={(e) => setCustomStart(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] [color-scheme:light] dark:[color-scheme:dark]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-dash-text-muted mb-1">End Date</label>
                <input
                  type="date"
                  value={customEnd}
                  onChange={(e) => setCustomEnd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] [color-scheme:light] dark:[color-scheme:dark]"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full py-1.5 bg-[#EA6639] text-white rounded-lg font-semibold text-xs hover:bg-[#EA6639]/90 transition-colors shadow-xs"
              >
                Apply Range
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
