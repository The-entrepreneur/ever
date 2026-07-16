import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { Clock, BedDouble, RefreshCw, FileText, CreditCard } from "lucide-react";

type Message = {
  id: string;
  type: "user" | "agent" | "action";
  text: string;
  delay: number;
};

const scenarios = {
  checkout: [
    { id: "1", type: "user", text: "Hi, I need a late checkout for tomorrow if possible.", delay: 600 },
    { id: "2", type: "action", text: "Identifying intent", delay: 1000 },
    { id: "3", type: "action", text: "Checking availability", delay: 1500 },
    { id: "4", type: "agent", text: "I can arrange that for you. Our standard late checkout is 2:00 PM. Would you like me to confirm this?", delay: 1500 },
    { id: "5", type: "user", text: "Yes, 2:00 PM is perfect.", delay: 1200 },
    { id: "6", type: "action", text: "Updating reservation", delay: 1000 },
    { id: "7", type: "agent", text: "All set! Your late checkout for 2:00 PM tomorrow has been confirmed.", delay: 1000 },
  ],
  upgrade: [
    { id: "1", type: "user", text: "Is it possible to upgrade my room to a suite for my stay this weekend?", delay: 600 },
    { id: "2", type: "action", text: "Identifying intent", delay: 1000 },
    { id: "3", type: "action", text: "Checking availability", delay: 1500 },
    { id: "4", type: "agent", text: "I see you're booked in a Standard King. We do have a Junior Suite available for a $50/night upgrade. Would you like to proceed?", delay: 1800 },
    { id: "5", type: "user", text: "Yes, let's do the upgrade.", delay: 1200 },
    { id: "6", type: "action", text: "Processing upgrade", delay: 1000 },
    { id: "7", type: "agent", text: "Great, I've upgraded your room to a Junior Suite. You'll receive a confirmation email shortly.", delay: 1000 },
  ],
} as const;

export function AnimatedChat() {
  const [activeTab, setActiveTab] = useState<"checkout" | "upgrade">("checkout");
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Reset state when switching tabs
    setMessages([]);
    setCurrentIndex(0);
  }, [activeTab]);

  useEffect(() => {
    const currentScenario = scenarios[activeTab];
    if (currentIndex < currentScenario.length) {
      const nextMessage = currentScenario[currentIndex];
      
      const timeoutId = window.setTimeout(() => {
        setMessages((prev) => {
          // If the new message is an action, and the last one was an action, replace it
          if (nextMessage.type === "action" && prev.length > 0 && prev[prev.length - 1].type === "action") {
            const newArray = [...prev];
            newArray[prev.length - 1] = nextMessage;
            return newArray;
          }
          // If the new message is an agent message, and last one was action, remove the action
          if (nextMessage.type === "agent" && prev.length > 0 && prev[prev.length - 1].type === "action") {
             const newArray = [...prev];
             newArray.pop();
             return [...newArray, nextMessage];
          }
          return [...prev, nextMessage];
        });
        
        setCurrentIndex((prev) => prev + 1);
      }, nextMessage.delay);

      return () => clearTimeout(timeoutId);
    }
  }, [currentIndex, activeTab]);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleReplay = () => {
    setMessages([]);
    setCurrentIndex(0);
  };

  const isCompleted = currentIndex >= scenarios[activeTab].length;

  return (
    <div className="w-full max-w-2xl mx-auto bg-white dark:bg-zinc-900 shadow-2xl rounded-3xl border border-zinc-200/60 dark:border-zinc-800 overflow-hidden flex flex-col h-[500px]">
      {/* Tabs */}
      <div className="flex justify-center p-4 border-b border-zinc-100 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md z-10 sticky top-0">
        <div className="inline-flex items-center gap-2 bg-zinc-50 dark:bg-zinc-950/50 p-1 rounded-full border border-zinc-200/60 dark:border-zinc-800">
          <button 
            onClick={() => setActiveTab("checkout")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === 'checkout' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <Clock className="w-4 h-4" /> Late checkout
          </button>
          <button 
            onClick={() => setActiveTab("upgrade")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeTab === 'upgrade' ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-zinc-100 border border-zinc-200/50 dark:border-zinc-700' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
          >
            <BedDouble className="w-4 h-4" /> Room upgrade
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto bg-[#FAFAFA] dark:bg-zinc-950 flex flex-col gap-6 relative" ref={containerRef}>
        <AnimatePresence mode="popLayout">
          {messages.map((msg) => (
            <motion.div
               key={msg.id}
               initial={{ opacity: 0, y: 10, scale: 0.98 }}
               animate={{ opacity: 1, y: 0, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               transition={{ duration: 0.3, type: "spring", stiffness: 200, damping: 20 }}
               className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} w-full`}
            >
              {msg.type === 'action' && (
                 <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 ml-2 mt-2">
                    <RefreshCw className="w-4 h-4 animate-spin opacity-70" />
                    {msg.text}
                 </div>
              )}
              {msg.type === 'agent' && (
                 <div className="flex flex-col gap-1.5 max-w-[85%] sm:max-w-[75%]">
                   <div className="bg-white dark:bg-zinc-800 p-4 sm:p-5 rounded-[20px] rounded-tl-sm shadow-[0_2px_10px_-4px_rgba(0,0,0,0.1)] border border-black/[0.04] dark:border-white/[0.04] text-zinc-800 dark:text-zinc-200 text-[15px] leading-relaxed">
                     {msg.text}
                   </div>
                   <span className="text-xs text-zinc-400 dark:text-zinc-500 ml-1">AI agent</span>
                 </div>
              )}
              {msg.type === 'user' && (
                 <div className="bg-[#413F3B] dark:bg-zinc-100 text-white dark:text-zinc-900 p-4 sm:p-5 rounded-[20px] rounded-tr-sm shadow-md text-[15px] leading-relaxed max-w-[85%] sm:max-w-[75%]">
                   {msg.text}
                 </div>
              )}
            </motion.div>
          ))}
          {isCompleted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-4 flex justify-center !mb-12"
            >
              <button 
                onClick={handleReplay}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors bg-zinc-100 dark:bg-zinc-800/50 rounded-full"
              >
                <RefreshCw className="w-4 h-4" /> Replay conversation
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Typing indicator logic could go here, but action text serves that purpose well */}
      </div>
    </div>
  );
}
