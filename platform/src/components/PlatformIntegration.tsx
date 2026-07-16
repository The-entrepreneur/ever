import { motion } from "motion/react";
import { CapabilityBlocks, CapabilityBlockItem } from "./CapabilityBlocks";
import { ArchitectureOverview } from "./ArchitectureOverview";
import { Star } from "lucide-react";

interface PlatformIntegrationProps {
  tagline?: string;
  heading?: React.ReactNode;
  subheading1?: React.ReactNode;
  subheading2?: React.ReactNode;
  closingQuote?: React.ReactNode;
  customBlocks?: CapabilityBlockItem[];
}

export function PlatformIntegration({
  tagline = "INTEGRATED SYSTEM LAYER",
  heading,
  subheading1,
  subheading2,
  closingQuote,
  customBlocks,
}: PlatformIntegrationProps = {}) {
  const defaultHeading = (
    <>
      More Than Guest Engagement.<br />
      Part of a Connected Operating Layer.
    </>
  );
  
  const defaultSubheading1 = "The Guest Concierge Engine delivers its greatest value when operating within Ever's Guest OS.";
  const defaultSubheading2 = "Instead of creating another communication platform, it connects guest engagement with commerce and hotel operations through one continuous operational model.";
  const defaultClosingQuote = "This is how Ever delivers Connected Guest Operations.";

  return (
    <section id="why-guest-os" className="py-24 bg-zinc-50 border-t border-b border-zinc-200/50 relative overflow-hidden text-center">
      {/* Subtle ambient light gradient background */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] bg-[#EA6639]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[10%] right-[10%] w-[450px] h-[450px] bg-[#EA6639]/3 blur-[140px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-4xl mx-auto mb-16 text-center space-y-4">
          <span className="text-[#EA6639] font-mono text-[10px] uppercase font-bold tracking-widest block mb-2">
            {tagline}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-semibold tracking-tight text-zinc-950 leading-[1.1] mb-6 max-w-3xl mx-auto">
            {heading || defaultHeading}
          </h2>
          <div className="space-y-4 max-w-2xl mx-auto text-zinc-600 font-light">
            <p className="text-base sm:text-lg md:text-[19px] leading-relaxed">
              {subheading1 || defaultSubheading1}
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-zinc-500 max-w-xl mx-auto">
              {subheading2 || defaultSubheading2}
            </p>
          </div>
        </div>

        {/* Component 1: ArchitectureOverview Visualization */}
        <ArchitectureOverview />

        {/* Component 2: CapabilityBlocks */}
        <CapabilityBlocks blocks={customBlocks} />

        {/* Component 3: Closing Statement & Narrative payoff */}
        <div className="mt-20 border-t border-zinc-200/80 pt-16 max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center gap-1.5 text-[#EA6639] mb-4">
            {[1, 2, 3].map((star) => (
              <Star key={star} className="w-4 h-4 fill-current text-[#EA6639]" />
            ))}
          </div>
          
          <div className="text-xl sm:text-2xl font-serif italic text-zinc-900 font-normal leading-relaxed whitespace-pre-line max-w-2xl mx-auto">
            {closingQuote || defaultClosingQuote}
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 pt-4">
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase text-[#EA6639] tracking-widest font-bold block mb-1">PLATFORM</span>
              <p className="text-zinc-950 font-semibold text-sm">One operating system.</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-zinc-200" />
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase text-[#EA6639] tracking-widest font-bold block mb-1">EXPERIENCE</span>
              <p className="text-zinc-950 font-semibold text-sm">One guest journey.</p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-zinc-200" />
            <div className="text-center">
              <span className="font-mono text-[10px] uppercase text-[#EA6639] tracking-widest font-bold block mb-1">FULFILMENT</span>
              <p className="text-zinc-950 font-semibold text-sm">One connected hotel.</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
export default PlatformIntegration;
