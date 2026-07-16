import { motion } from "motion/react";
import { MessageSquare, ShoppingBag, ClipboardList } from "lucide-react";

export interface CapabilityBlockItem {
  id: string;
  badge: string;
  title: string;
  desc: string;
  icon: any;
  color: string;
  iconColor: string;
}

interface CapabilityBlocksProps {
  blocks?: CapabilityBlockItem[];
}

export function CapabilityBlocks({ blocks: customBlocks }: CapabilityBlocksProps) {
  const defaultBlocks = [
    {
      id: "connected-engagement",
      badge: "ENGAGEMENT",
      title: "Connected Engagement",
      desc: "Every guest conversation begins with complete context, regardless of the communication channel.",
      icon: MessageSquare,
      color: "from-blue-500/10 to-transparent",
      iconColor: "text-blue-600",
    },
    {
      id: "connected-commerce",
      badge: "COMMERCE",
      title: "Connected Commerce",
      desc: "Qualified opportunities move seamlessly to the Hospitality Commerce Agent for bookings, payments and revenue generation.",
      icon: ShoppingBag,
      color: "from-[#EA6639]/10 to-transparent",
      iconColor: "text-[#EA6639]",
    },
    {
      id: "connected-operations",
      badge: "OPERATIONS",
      title: "Connected Operations",
      desc: "Operational requests continue directly to hotel teams with full guest context, improving coordination and service delivery.",
      icon: ClipboardList,
      color: "from-emerald-500/10 to-transparent",
      iconColor: "text-emerald-600",
    },
  ];

  const blocks = customBlocks || defaultBlocks;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12" id="capability-blocks">
      {blocks.map((block) => {
        const IconComp = block.icon;
        return (
          <motion.div
            key={block.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.5 }}
            className="group relative bg-white border border-zinc-200/80 rounded-[2rem] p-8 flex flex-col justify-between transition-all duration-300 hover:border-[#EA6639]/30 hover:shadow-xl hover:shadow-[#EA6639]/5 overflow-hidden text-left"
          >
            {/* Soft decorative background glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-b opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none -z-10" />
            
            <div>
              <div className="flex justify-between items-center mb-6">
                <span className="text-[9px] font-mono uppercase tracking-widest font-semibold px-2.5 py-1 bg-zinc-100 text-zinc-500 border border-zinc-200 rounded-md">
                  {block.badge}
                </span>
                <div className={`w-9 h-9 rounded-xl bg-zinc-50 border border-zinc-100 flex items-center justify-center transition-transform duration-300 group-hover:scale-110 group-hover:bg-[#EA6639]/5 group-hover:border-[#EA6639]/10`}>
                  <IconComp className={`w-4.5 h-4.5 ${block.iconColor}`} />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 tracking-tight mb-3">
                {block.title}
              </h3>
              <p className="text-zinc-600 text-xs sm:text-sm font-light leading-relaxed">
                {block.desc}
              </p>
            </div>
            
            <div className="border-t border-zinc-100 pt-4 mt-6 flex items-center gap-1.5 text-[10px] font-mono uppercase text-[#EA6639] font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Active Layer Integration
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
export default CapabilityBlocks;
