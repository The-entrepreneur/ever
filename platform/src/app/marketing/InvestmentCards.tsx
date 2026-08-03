import { motion } from "motion/react";
import { TrendingUp, Cpu, MessageSquare, ShieldCheck } from "lucide-react";

interface CardProps {
  theme: string;
  title: string;
  description: string;
  metric: string;
  icon: React.ReactNode;
}

export function InvestmentCards() {
  const cards: CardProps[] = [
    {
      theme: "Operational Efficiency",
      title: "Reclaim Operational Leakage",
      metric: "-18%",
      description: "Automate and coordinate everyday guest communications, routing, and back-of-house task assignments with zero manual intervention.",
      icon: <ShieldCheck className="w-5 h-5 text-[#EA6639]" />,
    },
    {
      theme: "Direct Revenue Growth",
      title: "Unlock High-Margin Conversions",
      metric: "+45%",
      description: "Convert routine digital inquiries directly into direct reservations, room upgrades, and secure in-chat payments commission-free.",
      icon: <TrendingUp className="w-5 h-5 text-[#EA6639]" />,
    },
    {
      theme: "Operational Capacity",
      title: "Multiply Front-Desk Output",
      metric: "10h+",
      description: "Return valuable operational hours back to housekeeping, front-desk, and management departments every single week.",
      icon: <Cpu className="w-5 h-5 text-[#EA6639]" />,
    },
    {
      theme: "Guest Experience",
      title: "Instant Personalized Engagement",
      metric: "99%",
      description: "Answer guest requests 24/7 across WhatsApp, Instagram, and web widgets instantly, with tailored brand personality and voice.",
      icon: <MessageSquare className="w-5 h-5 text-[#EA6639]" />,
    },
  ];

  return (
    <div id="investment-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={card.theme}
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.4, delay: index * 0.08 }}
          className="bg-white border border-zinc-200/80 rounded-2xl p-5 hover:border-[#EA6639]/30 hover:shadow-md transition-all duration-300 flex flex-col justify-between text-left group"
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">
                {card.theme}
              </span>
              <div className="p-2 bg-zinc-50 rounded-xl group-hover:bg-[#EA6639]/5 transition-colors">
                {card.icon}
              </div>
            </div>
            
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-950">
                {card.metric}
              </span>
            </div>
            
            <h4 className="text-xs sm:text-sm font-semibold text-zinc-900 mb-1 group-hover:text-[#EA6639] transition-colors">
              {card.title}
            </h4>
            
            <p className="text-[11px] sm:text-xs text-zinc-500 font-light leading-relaxed">
              {card.description}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
