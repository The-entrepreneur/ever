import React, { useState, useMemo, useEffect, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Facebook, 
  Instagram, 
  Send, 
  MessageSquare, 
  MessageCircle, 
  ShoppingBag, 
  CreditCard, 
  Link2, 
  CheckSquare, 
  Globe, 
  Search, 
  ChevronDown, 
  Plus, 
  Minus, 
  Settings, 
  Code, 
  AlertCircle, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Check,
  X,
  Sparkles,
  RefreshCw,
  Mail,
  Sliders,
  Database,
  Users,
  BarChart,
  Cpu
} from "lucide-react";
import { integrationsData } from "../data/integrationsData";

// Types
export type IntegrationCategory = "All" | "Channel integrations" | "PMS" | "POS" | "CRM" | "Payments & Accounting" | "Analytics" | "LLM APIs" | "Other";

export interface Integration {
  id: string;
  name: string;
  category: Exclude<IntegrationCategory, "All">;
  description: string;
  brandColor: string;
  iconBg: string;
  iconName: string;
  setupInstructions: string[];
  configFields: { label: string; placeholder: string; isSecret: boolean; name: string }[];
}

export function Integrations() {
  // Navigation & UI States
  const [selectedCategory, setSelectedCategory] = useState<IntegrationCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  
  // Interactive Connection State
  const [activeIntegration, setActiveIntegration] = useState<Integration | null>(null);
  const [savedConfigs, setSavedConfigs] = useState<Record<string, Record<string, string>>>(() => {
    try {
      const stored = localStorage.getItem("ever-integrations-config");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const [activeConnectionStatus, setActiveConnectionStatus] = useState<Record<string, "disconnected" | "connected" | "connecting">>(() => {
    try {
      const stored = localStorage.getItem("ever-integrations-status");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Dynamic Console Debugger Simulator
  const [inputConfigValues, setInputConfigValues] = useState<Record<string, string>>({});
  const [simulatedLogs, setSimulatedLogs] = useState<string[]>([]);
  const [isSimulatingTest, setIsSimulatingTest] = useState(false);

  // FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  // Full dataset extracted directly from the template mockup combined with new ones
  const integrations = useMemo(() => integrationsData, []);

  // Save states to localstorage
  useEffect(() => {
    localStorage.setItem("ever-integrations-config", JSON.stringify(savedConfigs));
  }, [savedConfigs]);

  useEffect(() => {
    localStorage.setItem("ever-integrations-status", JSON.stringify(activeConnectionStatus));
  }, [activeConnectionStatus]);

  // Handler for category filtering
  const filteredIntegrations = useMemo(() => {
    let result = integrations;
    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [selectedCategory, searchQuery, integrations]);

  // Triggered when an integration is clicked
  const openSetupDrawer = (integration: Integration) => {
    setActiveIntegration(integration);
    // Initialize temporary input config values with saved state
    const currentSaved = savedConfigs[integration.id] || {};
    const initialInputs: Record<string, string> = {};
    integration.configFields.forEach(field => {
      let defaultVal = "";
      if (field.isSecret) {
        defaultVal = `ever_${integration.id}_sec_${Math.random().toString(36).substring(2, 8)}`;
      } else {
        if (field.placeholder.startsWith("e.g. ")) {
          let cleanVal = field.placeholder.substring(5);
          const parenIdx = cleanVal.indexOf("(");
          if (parenIdx !== -1) {
            cleanVal = cleanVal.substring(0, parenIdx).trim();
          }
          defaultVal = cleanVal;
        } else if (field.placeholder.includes("myshopify.com")) {
          defaultVal = "sandbox-hotel.myshopify.com";
        } else if (field.placeholder.includes("salesforce.com")) {
          defaultVal = "https://sandbox-property.my.salesforce.com";
        } else if (field.placeholder.includes("smtp.mailserver.com")) {
          defaultVal = "smtp.sandbox-ever.com";
        } else if (field.placeholder.includes("bookings@propertyname.com")) {
          defaultVal = "concierge@sandbox-stay.com";
        } else {
          defaultVal = `sb_${integration.id}_token_40201`;
        }
      }
      initialInputs[field.name] = currentSaved[field.name] || defaultVal;
    });
    setInputConfigValues(initialInputs);
    setSimulatedLogs([]);
    setIsSimulatingTest(false);
  };

  // Close setup drawer
  const closeSetupDrawer = () => {
    setActiveIntegration(null);
  };

  // Simulated Connection Debugger Handler
  const handleTestConnection = (e: FormEvent) => {
    e.preventDefault();
    if (!activeIntegration) return;

    setIsSimulatingTest(true);
    setSimulatedLogs([]);

    // Custom steps logging with beautiful terminal delays
    const steps = [
      `[info] Dynamic handshake requested for service: ${activeIntegration.name}...`,
      `[info] Attempting route configuration sync with Ever Cloud Servers...`,
      `[ok] Webhooks established at HTTPS secure endpoints.`,
      `[info] Validating user configuration parameters against ${activeIntegration.name} Sandbox...`,
    ];

    let delay = 300;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setSimulatedLogs(prev => [...prev, step]);
      }, delay);
      delay += 400;
    });

    // Final outcome
    setTimeout(() => {
      const isValid = Object.values(inputConfigValues).every(val => String(val).trim().length > 0);
      if (isValid) {
        setSimulatedLogs(prev => [
          ...prev,
          `[success] Connected successfully! Initialized secure auth payload. Status: 200 OK.`,
          `[info] Live synchronization stream activated. Listening for webhook triggers.`
        ]);
        
        // Save the config parameters
        setSavedConfigs(prev => ({
          ...prev,
          [activeIntegration.id]: inputConfigValues
        }));

        // Set status to connected
        setActiveConnectionStatus(prev => ({
          ...prev,
          [activeIntegration.id]: "connected"
        }));
      } else {
        setSimulatedLogs(prev => [
          ...prev,
          `[error] Connection failed. Missing parameter values in setup fields.`,
          `[error] Please input valid API credentials and retry.`
        ]);
      }
      setIsSimulatingTest(false);
    }, delay + 200);
  };

  const handleDisconnect = () => {
    if (!activeIntegration) return;
    
    // Clear connection state
    setActiveConnectionStatus(prev => ({
      ...prev,
      [activeIntegration.id]: "disconnected"
    }));

    // Reset saved form values
    setSavedConfigs(prev => {
      const copy = { ...prev };
      delete copy[activeIntegration.id];
      return copy;
    });

    const resetInputs: Record<string, string> = {};
    activeIntegration.configFields.forEach(field => {
      resetInputs[field.name] = "";
    });
    setInputConfigValues(resetInputs);
    setSimulatedLogs([`[info] Disconnected from ${activeIntegration.name} gateway module.`]);
  };

  // Dynamic Lucide Render helper
  const renderIcon = (name: string, sizeClass = "w-6 h-6", color = "#111111") => {
    switch (name) {
      case "Facebook": return <Facebook className={sizeClass} style={{ color }} />;
      case "Instagram": return <Instagram className={sizeClass} style={{ color }} />;
      case "WhatsApp": return <MessageSquare className={sizeClass} style={{ color }} />;
      case "Telegram": return <Send className={sizeClass} style={{ color }} />;
      case "Twilio": return <MessageCircle className={sizeClass} style={{ color }} />;
      case "Shopify": return <ShoppingBag className={sizeClass} style={{ color }} />;
      case "Stripe": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Line": return <MessageSquare className={sizeClass} style={{ color }} />;
      case "Viber": return <MessageCircle className={sizeClass} style={{ color }} />;
      case "Salesforce": return <Database className={sizeClass} style={{ color }} />;
      case "Webex": return <Sliders className={sizeClass} style={{ color }} />;
      case "Email": return <Mail className={sizeClass} style={{ color }} />;
      case "Livechat": return <MessageSquare className={sizeClass} style={{ color }} />;
      case "Amazon Connect": return <Globe className={sizeClass} style={{ color }} />;
      case "Razorpay": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Iyzico": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Paylike": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Short links": return <Link2 className={sizeClass} style={{ color }} />;
      case "Paytabs": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Telr": return <CreditCard className={sizeClass} style={{ color }} />;
      case "Email signature": return <Mail className={sizeClass} style={{ color }} />;
      case "Done tracker": return <CheckSquare className={sizeClass} style={{ color }} />;
      case "Users": return <Users className={sizeClass} style={{ color }} />;
      case "BarChart": return <BarChart className={sizeClass} style={{ color }} />;
      case "Database": return <Database className={sizeClass} style={{ color }} />;
      case "Cpu": return <Cpu className={sizeClass} style={{ color }} />;
      default: return <Globe className={sizeClass} style={{ color }} />;
    }
  };

  // FAQ mock data from the image
  const faqData = [
    {
      question: "How does Ever work?",
      answer: "Ever connects directly with your property management systems (PMS) like Cloudbeds, and synchronizes real-time guest booking details, transactional payments, and operations with chat channels (WhatsApp, Facebook, Line, etc.) and native payment ledgers automatically."
    },
    {
      question: "What are the security and privacy terms for Ever?",
      answer: "Ever utilizes bank-grade SSL/TLS end-to-end encryption. All payment keys are tokenized through secure PCI-DSS level 1 compliant processors (like Stripe/Razorpay). We do not store absolute plain-text customer credit cards or raw API keys in plain sight."
    },
    {
      question: "Are there any technical requirements to use Ever?",
      answer: "No complex server infrastructure or local installations are required. Ever is a fully browser-hosted Cloud software. You only need active accounts (or sandbox/developer consoles) for whichever channels/CRM modules you wish to connect."
    },
    {
      question: "Is installation or downloading required?",
      answer: "Not at all. Everything works dynamically within Ever Cloud's web dashboard. We handle all backend server hosting, constant API heartbeats, webhook parsing, and uptime health monitoring for you."
    },
    {
      question: "How many conversations does my subscription cover?",
      answer: "Depending on your plan, our packages come with either unlimited local SMS/Telegram routes or dedicated scalable API quotas for commercial platforms like WhatsApp Business. View our main Console Pricing panel for exhaustive transaction details."
    },
    {
      question: "Is it possible to cancel my subscription at any time?",
      answer: "Yes, you can cancel or change your dynamic Ever subscription tiers anytime with a single click. There are absolute zero lock-ins, hidden setup charges, or cancellation penalties."
    },
    {
      question: "Are volume discounts available for large businesses?",
      answer: "Absolutely. We offer tailored enterprise service agreements and volume discounts for major hotel chains, multi-location boutique rental agencies, and widespread aparthotel brands. Get in touch with our commercial operations team to coordinate your customized portal limits."
    }
  ];

  return (
    <section className="bg-[#F9F6F0] min-h-screen pt-28 pb-20 text-zinc-900 transition-colors relative overflow-hidden" id="explore-integrations">
      
      {/* Visual background atmospheric lights */}
      <div className="absolute top-[5%] right-[-15%] w-[35vw] h-[35vw] rounded-full bg-[#7C3AED]/3 blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-15%] w-[35vw] h-[35vw] rounded-full bg-[#EA6639]/3 blur-[110px] pointer-events-none" />

      <div className="max-w-[1240px] mx-auto px-6 sm:px-8 mt-4 relative z-10">
        
        {/* Dynamic Navigation Indicator */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#EA6639]/10 rounded-full border border-[#EA6639]/20 text-[11px] font-mono font-bold text-[#EA6639] uppercase tracking-wider">
            <Sparkles className="w-3 h-3 text-[#EA6639]" /> Over 70+ Direct Channels Active
          </div>
        </div>

        {/* 1. Header Section */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="text-[42px] sm:text-[54px] font-serif leading-[1.1] tracking-tight text-zinc-950 font-normal mb-4">
            Explore integrations
          </h1>
          <p className="text-[15px] sm:text-[16px] text-zinc-600 font-light leading-relaxed">
            Our integrations make it easy to work with the applications your teams already love.
          </p>
        </div>

        {/* 2. Interactive Search & Category Filter bar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mb-16 max-w-xl mx-auto relative z-20">
          
          {/* Main Select Dropdown */}
          <div className="relative w-full sm:w-auto shrink-0">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="w-full sm:w-56 inline-flex items-center justify-between gap-2 px-5 py-3.5 bg-white border border-zinc-200 rounded-xl text-xs font-semibold text-zinc-800 shadow-xs hover:bg-zinc-50 hover:border-zinc-300 transition-all active:scale-[0.98]"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-zinc-400" />
                {selectedCategory === "All" ? "All Integrations" : selectedCategory}
              </span>
              <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            <AnimatePresence>
              {isCategoryDropdownOpen && (
                <>
                  {/* Overlay click-catcher */}
                  <div className="fixed inset-0 z-30" onClick={() => setIsCategoryDropdownOpen(false)} />
                  
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 mt-2 w-full sm:w-56 bg-white border border-zinc-200/80 rounded-2xl shadow-xl p-2 z-40"
                  >
                    {(["All", "Channel integrations", "PMS", "POS", "CRM", "Payments & Accounting", "Analytics", "LLM APIs", "Other"] as IntegrationCategory[]).map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setIsCategoryDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                          selectedCategory === category 
                            ? "bg-[#EA6639]/10 text-[#EA6639]" 
                            : "text-zinc-700 hover:bg-zinc-50"
                        }`}
                      >
                        {category}
                        {selectedCategory === category && <Check className="w-3.5 h-3.5 text-[#EA6639]" />}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Core Search bar input widget */}
          <div className="relative w-full">
            <Search className="absolute left-4.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search integrations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-3.5 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 placeholder:text-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-[#EA6639]/20 focus:border-[#EA6639] shadow-xs transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-zinc-600 rounded-full hover:bg-zinc-100 transition-colors"
                title="Clear query"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

        </div>

        {/* 3. Integrations Grid Block */}
        <div className="relative min-h-[300px]">
          {filteredIntegrations.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-2xl border border-zinc-200 border-dashed max-w-md mx-auto">
              <AlertCircle className="w-10 h-10 text-zinc-300 mb-3" />
              <h3 className="text-xs font-semibold text-zinc-900">No integration modules matched</h3>
              <p className="text-xs text-zinc-500 mt-1">Try updating your filters or query parameters.</p>
              <button 
                onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
                className="mt-4 px-3.5 py-1.5 bg-zinc-900 text-white rounded-lg text-xs font-semibold hover:bg-zinc-800 transition-all"
              >
                Reset filter
              </button>
            </div>
          ) : (
            <motion.div 
              layout 
              className="grid grid-cols-2 md:grid-cols-4 gap-6 items-stretch"
            >
              <AnimatePresence mode="popLayout">
                {filteredIntegrations.map((item) => {
                  const isConnected = activeConnectionStatus[item.id] === "connected";
                  return (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={item.id}
                      onClick={() => openSetupDrawer(item)}
                      id={`integration-card-${item.id}`}
                      className="bg-white hover:bg-white border hover:border-zinc-300 border-zinc-200/70 p-6 sm:p-7 rounded-2xl flex flex-col justify-between text-center items-center cursor-pointer shadow-xs hover:shadow-md transition-all duration-300 relative group overflow-hidden"
                    >
                      {/* Connection Pill status indicator */}
                      {isConnected && (
                        <div className="absolute top-3.5 right-3.5 flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider animate-fade-in">
                          <Check className="w-2.5 h-2.5" /> Saved
                        </div>
                      )}

                      <div className="flex flex-col items-center justify-center flex-1">
                        {/* Icon Container with centered element */}
                        <div 
                          className="w-16 h-16 rounded-full flex items-center justify-center mb-5 relative transition-transform duration-300 group-hover:scale-110 shadow-xs"
                          style={{ backgroundColor: item.iconBg }}
                        >
                          {renderIcon(item.iconName, "w-7 h-7", item.brandColor)}
                        </div>

                        {/* Title & category labels */}
                        <h3 className="text-[14px] font-semibold text-zinc-900 mb-1 group-hover:text-[#EA6639] transition-colors">
                          {item.name}
                        </h3>
                        <p className="text-[11px] font-mono tracking-wide text-zinc-400 font-medium">
                          {item.category}
                        </p>
                      </div>

                      {/* Small visual hover trigger bar */}
                      <div className="w-full mt-5 pt-3.5 border-t border-zinc-100 flex items-center justify-center gap-1.5 text-[11px] font-semibold text-[#7C3AED] group-hover:opacity-100 opacity-0 transition-opacity">
                        <span>Setup Integration</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* 4. Frequently Asked Questions block from visual layout matching the template */}
        <div className="border-t border-zinc-200/80 pt-24 mt-28 max-w-[800px] mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[36px] sm:text-[44px] font-serif tracking-tight text-zinc-950 font-normal">
              Frequently asked questions
            </h2>
          </div>

          <div id="faq-accordions" className="border-t border-zinc-900 divide-y divide-[#111111]/10">
            {faqData.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="py-5">
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between text-left py-2 hover:opacity-80 transition-opacity font-sans group"
                  >
                    <span className="text-[15px] sm:text-[16px] font-semibold text-zinc-900">
                      {faq.question}
                    </span>
                    <div className="w-6 h-6 rounded-full border border-zinc-300 flex items-center justify-center group-hover:border-zinc-900 transition-colors text-zinc-800 shrink-0 ml-4">
                      {isOpen ? (
                        <Minus className="w-3.5 h-3.5" />
                      ) : (
                        <Plus className="w-3.5 h-3.5" />
                      )}
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="text-[13.5px] sm:text-[14px] text-zinc-600 font-light leading-relaxed pt-2.5 pb-2.5 max-w-3xl">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 5. Custom Slide-over Drawer containing Setup Form & Connection Tester Debugger logs */}
      <AnimatePresence>
        {activeIntegration && (
          <>
            {/* Draw overlay background */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeSetupDrawer}
              className="fixed inset-0 z-40 bg-zinc-950/40 backdrop-blur-xs"
            />

            {/* Main drawer component */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 z-50 w-full sm:max-w-lg bg-white shadow-2xl border-l border-zinc-200 flex flex-col justify-between overflow-y-auto"
            >
              
              {/* Header */}
              <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: activeIntegration.iconBg }}
                  >
                    {renderIcon(activeIntegration.iconName, "w-5 h-5", activeIntegration.brandColor)}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-zinc-900">{activeIntegration.name} Integration</h3>
                    <p className="text-[11px] font-mono text-zinc-400 capitalize">{activeIntegration.category}</p>
                  </div>
                </div>
                
                <button
                  onClick={closeSetupDrawer}
                  className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Scrolling Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-8">
                
                {/* Visual Status Indicator */}
                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-500">Service Status</span>
                  {activeConnectionStatus[activeIntegration.id] === "connected" ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-zinc-100 border border-zinc-200 text-zinc-500 rounded-full">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400"></span> Not Connected
                    </span>
                  )}
                </div>

                {/* About description */}
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest font-bold text-zinc-400 uppercase mb-2">About Integration</h4>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    {activeIntegration.description}
                  </p>
                </div>

                {/* Step-by-Step Instructions */}
                <div>
                  <h4 className="text-[11px] font-mono tracking-widest font-bold text-zinc-400 uppercase mb-3">Setup Instructions</h4>
                  <ul className="space-y-2.5">
                    {activeIntegration.setupInstructions.map((step, idx) => (
                      <li key={idx} className="flex gap-2.5">
                        <span className="h-5 w-5 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-[10px] font-bold text-zinc-500 shrink-0 font-mono">
                          {idx + 1}
                        </span>
                        <span className="text-xs text-zinc-500 font-light leading-relaxed">
                          {step}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Configuration form fields */}
                <form id="integration-config-form" onSubmit={handleTestConnection} className="space-y-4">
                  <h4 className="text-[11px] font-mono tracking-widest font-bold text-zinc-400 uppercase">Configuration Settings</h4>
                  
                  {activeIntegration.configFields.map((field) => (
                    <div key={field.name} className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 block select-none">
                        {field.label}
                      </label>
                      <input
                        type={field.isSecret ? "password" : "text"}
                        placeholder={field.placeholder}
                        value={inputConfigValues[field.name] || ""}
                        required
                        onChange={(e) => setInputConfigValues(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                        className="w-full text-xs px-4 py-3 bg-zinc-50 hover:bg-zinc-100/50 focus:bg-white border border-zinc-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#EA6639]/20 focus:border-[#EA6639] transition-all"
                      />
                    </div>
                  ))}

                  {/* Buttons */}
                  <div className="flex gap-3 pt-3.5">
                    <button
                      type="submit"
                      disabled={isSimulatingTest}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-70 text-white rounded-xl text-xs font-semibold transition-all active:scale-[0.98]"
                    >
                      {isSimulatingTest ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Connection Testing...
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" /> Save & Test Gateway
                        </>
                      )}
                    </button>

                    {activeConnectionStatus[activeIntegration.id] === "connected" && (
                      <button
                        type="button"
                        onClick={handleDisconnect}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-3 bg-rose-50 hover:bg-rose-100/80 text-rose-600 rounded-xl text-xs font-bold transition-all border border-rose-100"
                        title="Disconnect Integration"
                      >
                        Disconnect
                      </button>
                    )}
                  </div>
                </form>

                {/* simulated terminal output debugging console */}
                {simulatedLogs.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-100 pt-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-[11px] font-mono tracking-widest font-bold text-zinc-400 uppercase inline-flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-zinc-400" /> Connection Log Simulator
                      </h4>
                      <button
                        type="button"
                        onClick={() => setSimulatedLogs([])}
                        className="text-[9px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest"
                      >
                        Clear terminal
                      </button>
                    </div>

                    <div className="bg-zinc-950 rounded-xl p-4.5 font-mono text-[11px] leading-relaxed select-text space-y-1.5 border border-zinc-900 max-h-48 overflow-y-auto">
                      {simulatedLogs.map((log, index) => {
                        let cls = "text-zinc-300";
                        if (log.startsWith("[error]")) cls = "text-rose-400";
                        if (log.startsWith("[success]")) cls = "text-emerald-400 font-bold";
                        if (log.startsWith("[ok]")) cls = "text-sky-400";
                        return (
                          <div key={index} className={`${cls} break-all`}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>

              {/* Sticky Footer */}
              <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-zinc-400 inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Secure SSL Connection Sandbox
                </span>
                <span className="text-[10px] font-mono font-bold text-[#EA6639] uppercase pr-1">
                  Ever Protocol 2.5
                </span>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </section>
  );
}
