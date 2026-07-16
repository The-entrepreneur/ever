import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Bell, ArrowRight } from "lucide-react";
import { DemoHero } from "./DemoHero";
import { ExperienceConfiguration } from "./ExperienceConfiguration";
import { ExperienceConsole } from "./ExperienceConsole";
import { CapabilityHighlights } from "./CapabilityHighlights";
import { OperationalCards } from "./OperationalCards";

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface FlutterwaveState {
  isOpen: boolean;
  reference: string;
  hotel: string;
  room: string;
  amount: string;
  currency: string;
  guestName: string;
  guestEmail: string;
  paymentMethod: 'card' | 'bank' | 'ussd' | 'transfer';
  cardNumber: string;
  cardExpiry: string;
  cardCvv: string;
  paymentStep: 'form' | 'processing' | 'success';
}

const HOTEL_PROFILES = {
  "grand-horizon": {
    id: "grand-horizon",
    name: "The Grand Horizon Hotel",
    city: "London",
    style: "Classic British Luxury & Sophisticated City Comfort",
    bg: "bg-[#F3F4F6] text-zinc-900 border-zinc-300",
    color: "#EA6639",
    tagline: "Classic urban luxury overlooking the London skyline.",
    suggestions: {
      1: [
        "What are your check-in and check-out times?",
        "Show me your room types and pricing",
        "Do you have gym or parking facilities?"
      ],
      2: [
        "I'd like to check room availability for next week",
        "Book a Deluxe Room for 2 nights for 2 guests",
        "Can I add champagne & spa pass to my stay?"
      ]
    },
    rooms: [
      { name: "Standard Room", price: "£89", desc: "Cozy queen bed, rain shower, city view" },
      { name: "Deluxe Room", price: "£129", desc: "King bed, marble bathtub, free minibar" },
      { name: "Executive Penthouse Suite", price: "£199", desc: "Panoramic skyline views, private lounge, butler service" }
    ],
    upsells: [
      { name: "Airport Chauffeur Transfer", price: "£25", desc: "Premium single-trip transfer" },
      { name: "Champagne & Strawberries on arrival", price: "£45", desc: "Chilled bottle with local organic strawberries" },
      { name: "Royal Spa Access Pass", price: "£60", desc: "All-day pass to thermal pools and sauna" }
    ]
  },
  "aura-boutique": {
    id: "aura-boutique",
    name: "Aura Beachfront Resort",
    city: "Bali",
    style: "Eco-Luxury Tropical Oasis & Zen Oceanfront Serenity",
    bg: "bg-[#E6F3F0] text-[#1D3E35] border-[#BCE1D8]",
    color: "#00C9A7",
    tagline: "Eco-chic luxury private villas nestled on Bali's sands.",
    suggestions: {
      1: [
        "Where is the resort located?",
        "What's included in breakfast and pool hours?",
        "What languages do you speak?"
      ],
      2: [
        "I want to book a Private Pool Canopy Villa",
        "Check room availability for this weekend",
        "Can I add a volcanic sunrise trek or massage?"
      ]
    },
    rooms: [
      { name: "Garden Villa", price: "$120", desc: "Open-air rain shower, private canopy terrace" },
      { name: "Oceanfront Bungalow", price: "$180", desc: "Hamock, direct beach stepdown, pristine surf view" },
      { name: "Private Pool Canopy Villa", price: "$290", desc: "Elevated jungle canopy vista, private stone plunge pool" }
    ],
    upsells: [
      { name: "Private Airport Pickup Shuttle", price: "$30", desc: "Air-conditioned private resort shuttle" },
      { name: "Romantic Sunset Beach Dinner", price: "$75", desc: "Under canopy, organic 3-course chef menu" },
      { name: "90-Min Traditional Balinese Massage", price: "$50", desc: "Deep tissue massage in forest pavilion" }
    ]
  },
  "alpine-heights": {
    id: "alpine-heights",
    name: "Alpine Heights Lodge",
    city: "Aspen",
    style: "Warm Fireside Mountain Charm & Premium Ski-In/Ski-Out Chalet",
    bg: "bg-[#EDF2FA] text-[#1B355A] border-[#C3D4ED]",
    color: "#7B61FF",
    tagline: "Cozy mountain lodge with immediate ski-in ski-out access.",
    suggestions: {
      1: [
        "Is there a shuttle service or ski storage?",
        "What are check-in times and address?",
        "Tell me about the fireside cocoa hour"
      ],
      2: [
        "Are there any fireside cabins available?",
        "Book a Mountain View Studio for 3 guests",
        "I'd like to add ski rental and private lessons"
      ]
    },
    rooms: [
      { name: "Pine Ridge Cozy Room", price: "$140", desc: "Wood-burning fireplace, pine forest views" },
      { name: "Mountain View Studio", price: "$220", desc: "Fitted kitchen, panoramic ski-slope views" },
      { name: "Ski-In Luxury Cabin", price: "$420", desc: "Cedar hot tub, private master cabin layout" }
    ],
    upsells: [
      { name: "Premium Ski & Snowboard Gear Rental", price: "$50/day", desc: "All-mountain high-performance carving gear" },
      { name: "Private 1-on-1 Ski Lesson", price: "$80/hr", desc: "Tailored instructional powder clinics" },
      { name: "Fireside Wine & Fondue Hamper", price: "$65", desc: "Artisanal cheeses, chocolate, fine Pinot Noir" }
    ]
  }
};

export function InteractiveDemo() {
  const [level, setLevel] = useState<1 | 2>(2);
  const [activeHotelId, setActiveHotelId] = useState<"grand-horizon" | "aura-boutique" | "alpine-heights">("grand-horizon");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Human escalation state
  const [handoffState, setHandoffState] = useState<{
    status: 'none' | 'initiating' | 'connecting' | 'connected';
    agentName: string;
    agentAvatar: string;
  }>({
    status: 'none',
    agentName: 'Sarah',
    agentAvatar: '👩‍💼'
  });

  // Message queue states
  const messageQueue = useRef<string[]>([]);
  const isProcessing = useRef(false);
  const processedHistoryRef = useRef<ChatMessage[]>([]);
  
  // Flutterwave payment state
  const [flwState, setFlwState] = useState<FlutterwaveState | null>(null);

  // Capability detection state
  const [activatedCaps, setActivatedCaps] = useState<{
    faq: boolean;
    availability: boolean;
    booking: boolean;
    lead: boolean;
    upsell: boolean;
    payments: boolean;
    multilingual: boolean;
  }>({
    faq: false,
    availability: false,
    booking: false,
    lead: false,
    upsell: false,
    payments: false,
    multilingual: false
  });

  // Follow up simulation states
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  
  // Review manager states
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [pushedToLive, setPushedToLive] = useState(false);

  const activeHotel = HOTEL_PROFILES[activeHotelId];

  // Scroll to top of the window when navigating to the interactive page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Initialize messages on transition/change
  useEffect(() => {
    resetChat();
  }, [level, activeHotelId]);

  const initiateHumanHandoff = () => {
    if (handoffState.status !== 'none') return;

    setHandoffState({
      status: 'initiating',
      agentName: 'Sarah',
      agentAvatar: '👩‍💼'
    });

    // Add immediate silent routing status message
    setMessages(prev => [
      ...prev,
      { role: 'model', text: '⏱️ *Silently searching for an available Guest Representative...* Transferring session in the background.' }
    ]);

    setTimeout(() => {
      setHandoffState(prev => ({ ...prev, status: 'connecting' }));
      setMessages(prev => [
        ...prev,
        { role: 'model', text: '🔔 *Connecting you to Sarah (Guest Relations Manager)...*' }
      ]);

      setTimeout(() => {
        setHandoffState({
          status: 'connected',
          agentName: 'Sarah',
          agentAvatar: '👩‍💼'
        });

        const sarahWelcome = `Hello! 👋 My name is **Sarah**, and I am the Guest Relations Manager here at the front desk of **${activeHotel.name}**.\n\nI have just taken over this chat silently to assist you personally! I can see your previous questions with Ellie, so no need to repeat yourself.\n\nI can set up early check-in or late checkout, apply special seasonal discount rates, or customize premium experiences for you. What can I do to make your stay amazing?`;

        setMessages(prev => [
          ...prev,
          { role: 'model', text: sarahWelcome }
        ]);

        processedHistoryRef.current.push({ role: 'model', text: sarahWelcome });

        setNotificationMsg("Connected to Sarah (Guest Relations Manager).");
        setShowNotification(true);
      }, 1600);

    }, 1200);
  };

  const resetChat = () => {
    setHandoffState({
      status: 'none',
      agentName: 'Sarah',
      agentAvatar: '👩‍💼'
    });

    const welcome = level === 1 
      ? `Hello! 👋 Welcome to **${activeHotel.name}** in ${activeHotel.city}. I'm **Ellie**, your virtual Guest Concierge Agent powered by GCE.\n\nI can assist you instantly with room rates, reservation details, check-in schedules, and amenities. Let me know what you are looking to discover today!`
      : `Hello! 👋 Welcome to **${activeHotel.name}** in ${activeHotel.city}. I'm **Ellie**, your smart Hotel Commerce Agent powered by HCA.\n\nI can check live room availability, book your stay directly inside this chat, configure luxury custom upgrades, and handle secure settlements instantly. When would you like to stay with us?`;

    setMessages([{ role: "model", text: welcome }]);
    processedHistoryRef.current = [{ role: "model", text: welcome }];
    messageQueue.current = [];
    isProcessing.current = false;
    setIsLoading(false);

    setActivatedCaps({
      faq: false,
      availability: false,
      booking: false,
      lead: false,
      upsell: false,
      payments: false,
      multilingual: false
    });
  };

  // Analyze text for capability activation to visually showcase highlights
  const analyzeCapability = (text: string, source: 'user' | 'model') => {
    const lower = text.toLowerCase();
    
    // Check faq
    if (lower.includes("check-in") || lower.includes("checkout") || lower.includes("parking") || lower.includes("wifi") || lower.includes("pool") || lower.includes("gym") || lower.includes("address") || lower.includes("where") || lower.includes("breakfast") || lower.includes("cocoa") || lower.includes("shuttle")) {
      setActivatedCaps(prev => ({ ...prev, faq: true }));
    }
    // Check multilingual
    if (lower.includes("bonjour") || lower.includes("parlez") || lower.includes("français") || lower.includes("marhaban") || lower.includes("arabic") || lower.includes("hola") || lower.includes("gracias") || lower.includes("merci")) {
      setActivatedCaps(prev => ({ ...prev, multilingual: true }));
    }
    // Check availability
    if (lower.includes("availability") || lower.includes("available") || lower.includes("dates") || lower.includes("next week") || lower.includes("weekend")) {
      setActivatedCaps(prev => ({ ...prev, availability: true }));
    }
    // Check booking & lead capture
    if (lower.includes("book") || lower.includes("reserve") || lower.includes("stay") || lower.includes("nights") || lower.includes("room type")) {
      setActivatedCaps(prev => ({ ...prev, booking: true }));
    }
    if (lower.includes("@") || source === 'model' && (lower.includes("reference") || lower.includes("ev-") || lower.includes("reserved") || lower.includes("details"))) {
      setActivatedCaps(prev => ({ ...prev, lead: true }));
    }
    // Check upsell
    if (lower.includes("upgrade") || lower.includes("airport") || lower.includes("champagne") || lower.includes("spa") || lower.includes("massage") || lower.includes("dinner") || lower.includes("lesson") || lower.includes("rent") || lower.includes("add") || lower.includes("upsell") || lower.includes("would you like to add")) {
      setActivatedCaps(prev => ({ ...prev, upsell: true }));
    }
    // Check payments
    if (lower.includes("flutterwave") || lower.includes("stripe") || lower.includes("payment") || lower.includes("checkout") || lower.includes("secure") || lower.includes("reference id") || lower.includes("confirm")) {
      setActivatedCaps(prev => ({ ...prev, payments: true }));
    }
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend) return;

    if (!customText) setInput("");

    // Push User message immediately
    setMessages(prev => [...prev, { role: "user" as const, text: textToSend }]);
    analyzeCapability(textToSend, 'user');

    // Auto-detect human representative request
    const lower = textToSend.toLowerCase();
    const wantsHuman = lower.includes("human") || lower.includes("representative") || lower.includes("agent") || lower.includes("person") || lower.includes("support") || lower.includes("sarah") || lower.includes("speak to someone") || lower.includes("talk to someone");

    if (wantsHuman && handoffState.status === 'none') {
      initiateHumanHandoff();
      return;
    }

    // Add user prompt to the queue
    messageQueue.current.push(textToSend);

    // Trigger queue processing asynchronously
    processQueue();
  };

  const processQueue = async () => {
    if (isProcessing.current) {
      return;
    }

    isProcessing.current = true;
    setIsLoading(true);

    while (messageQueue.current.length > 0) {
      const textToSend = messageQueue.current[0]; // peek

      try {
        const response = await fetch('/api/gemini/demo-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: textToSend,
            history: processedHistoryRef.current.map(m => ({
              role: m.role,
              text: m.text
            })),
            level: level,
            hotelId: activeHotelId
          })
        });

        if (!response.ok) {
          throw new Error('Failed response from server');
        }

        const data = await response.json();
        const replyText = data.text;

        setMessages(prev => [...prev, { role: 'model', text: replyText }]);
        analyzeCapability(replyText, 'model');

        // Sync internal history list
        processedHistoryRef.current.push({ role: 'user', text: textToSend });
        processedHistoryRef.current.push({ role: 'model', text: replyText });

      } catch (err) {
        console.error(err);
        const fallbackText = `I apologize, but I am experiencing a brief connection delay to the hotel registry. What specific details can I check for your stay?`;
        setMessages(prev => [...prev, { role: 'model', text: fallbackText }]);
      }

      // Remove item we just finished processing
      messageQueue.current.shift();
    }

    isProcessing.current = false;
    setIsLoading(false);
  };

  const extractGuestDetails = (msgs: ChatMessage[]) => {
    let name = "Simulated Guest";
    let email = "guest@example.com";

    // Trace backward for details
    for (let i = msgs.length - 1; i >= 0; i--) {
      const txt = msgs[i].text;
      if (txt.includes("@")) {
        const emailMatch = txt.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
        if (emailMatch) {
          email = emailMatch[1];
        }
      }
    }
    return { name, email };
  };

  const openFlutterwaveCheckout = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const room = parsedUrl.searchParams.get("room") || "Deluxe Room";
      const hotel = parsedUrl.searchParams.get("hotel") || activeHotel.name;
      const rawAmount = parsedUrl.searchParams.get("amount") || "129";
      const ref = parsedUrl.searchParams.get("reference") || `EV-FLW-${Math.floor(Math.random() * 90000 + 10000)}`;

      const cleanHotel = decodeURIComponent(hotel).replace(/_/g, " ");
      const cleanRoom = decodeURIComponent(room).replace(/_/g, " ");

      // Get currency and amounts
      let amountNum = "129";
      let currency = "USD";
      if (rawAmount.includes("£") || cleanHotel.toLowerCase().includes("london") || cleanHotel.toLowerCase().includes("horizon")) {
        currency = "GBP";
        amountNum = rawAmount.replace(/[^0-9]/g, "") || "129";
      } else if (rawAmount.includes("$")) {
        currency = "USD";
        amountNum = rawAmount.replace(/[^0-9]/g, "") || "180";
      } else {
        amountNum = rawAmount.replace(/[^0-9]/g, "") || "150";
      }

      const guest = extractGuestDetails(messages);

      setFlwState({
        isOpen: true,
        reference: ref,
        hotel: cleanHotel,
        room: cleanRoom,
        amount: amountNum,
        currency: currency,
        guestName: guest.name, 
        guestEmail: guest.email,
        paymentMethod: 'card',
        cardNumber: "4000 1234 5678 9010",
        cardExpiry: "12 / 28",
        cardCvv: "382",
        paymentStep: 'form'
      });
    } catch (e) {
      const guest = extractGuestDetails(messages);
      setFlwState({
        isOpen: true,
        reference: `EV-FLW-${Math.floor(Math.random() * 90000 + 10000)}`,
        hotel: activeHotel.name,
        room: activeHotel.rooms[1].name,
        amount: "150",
        currency: "USD",
        guestName: guest.name,
        guestEmail: guest.email,
        paymentMethod: 'card',
        cardNumber: "4000 1234 5678 9010",
        cardExpiry: "12 / 28",
        cardCvv: "382",
        paymentStep: 'form'
      });
    }
  };

  const handlePaySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!flwState) return;

    setFlwState(prev => prev ? { ...prev, paymentStep: 'processing' } : null);

    setTimeout(() => {
      setFlwState(prev => prev ? { ...prev, paymentStep: 'success' } : null);
    }, 2200);
  };

  const closeFlutterwaveWithVoucher = () => {
    if (!flwState) return;

    const voucherRef = `EV-VOUCH-${Math.floor(Math.random() * 900000 + 100000)}`;
    const flwRef = flwState.reference;

    const voucherMsg = `### 🎉 Payment Confirmed via Flutterwave!\n\n**Flutterwave Ref:** \`${flwRef}\`  \n**Billing Status:** Fully Paid & Secured  \n**Voucher ID:** \`${voucherRef}\`  \n**Guest Name:** \`${flwState.guestName}\`  \n\nThank you, **${flwState.guestName}**! Your booking for the **${flwState.room}** at **${flwState.hotel}** has been successfully secured and synced with our Property Management System (PMS).\n\nA real-time confirmation email containing your digital door barcode, check-in packet, and Flutterwave payment receipt has been dispatched to **${flwState.guestEmail}**.\n\nEnjoy your stay! Let me know if you would like to explore luxury dining reservations, pre-arrange peak-season tours, or add special check-in arrangements!`;

    const updatedMessages = [
      ...messages,
      { role: "model" as const, text: voucherMsg }
    ];

    setMessages(updatedMessages);
    processedHistoryRef.current = updatedMessages; 
    setActivatedCaps(prev => ({ ...prev, payments: true }));

    setTimeout(() => {
      setNotificationMsg(`📱 Operational Flow: "Hi ${flwState.guestName}! Your booking (${voucherRef}) is officially paid! 🌟 Click here to preview your room or schedule a direct shuttle pickup!"`);
      setShowNotification(true);
    }, 2500);

    setFlwState(null);
  };

  const triggerFollowUpMock = (isCompleted: boolean) => {
    setTimeout(() => {
      if (isCompleted) {
        setNotificationMsg(`📱 Operational Flow: "Thank you for choosing ${activeHotel.name}! 🌟 Your secure reservation is processed. Need extra pillows or customized dinner requests? Simply type them here!"`);
      } else {
        setNotificationMsg(`📱 Operational Flow: "Hey! We noticed you left checking our luxury ${activeHotel.rooms[1].name}. Complete your booking in the next 1 hour using code STAY10 to enjoy a 10% direct discount!"`);
      }
      setShowNotification(true);
    }, 4500);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) return;

    setReviewSubmitted(true);
    setTimeout(() => {
      setPushedToLive(true);
    }, 1500);
  };

  const handleResetReview = () => {
    setReviewSubmitted(false);
    setPushedToLive(false);
    setReviewText("");
  };

  const convertToNgnStr = (amount: string, currency: string) => {
    const rate = currency === "GBP" ? 1900 : 1550;
    const val = parseInt(amount) * rate;
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div id="interactive-demo-page" className="bg-[#F9F6F0] min-h-screen pt-28 pb-20 px-4 sm:px-6 lg:px-8 max-w-[1500px] mx-auto text-zinc-900">
      
      {/* Toast Notification Simulation */}
      <AnimatePresence>
        {showNotification && (
          <motion.div 
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-4 sm:right-8 z-[200] max-w-sm w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg shadow-2xl p-4 flex gap-3 items-start cursor-pointer hover:scale-[1.02] transition-transform"
            onClick={() => setShowNotification(false)}
          >
            <div className="w-9 h-9 rounded-md bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-micro font-mono tracking-wider text-emerald-400 uppercase font-semibold">Operational Flow Sync</span>
                <span className="text-[9px] text-zinc-500">Just now</span>
              </div>
              <p className="text-body text-zinc-300 mt-1 font-light leading-relaxed">{notificationMsg}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <DemoHero />

      {/* Grid Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start max-w-[1360px] mx-auto">
        
        {/* Left Side: Setup & Capabilities Controls (Col-span 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          <ExperienceConfiguration 
            level={level}
            setLevel={setLevel}
            activeHotelId={activeHotelId}
            setActiveHotelId={setActiveHotelId}
            hotelProfiles={HOTEL_PROFILES}
            onReset={resetChat}
            handoffState={handoffState}
            onEscalate={initiateHumanHandoff}
          />

          <CapabilityHighlights 
            activatedCaps={activatedCaps}
            level={level}
          />

        </div>

        {/* Right Side: Chat Simulator & Active Interactive Views (Col-span 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          <ExperienceConsole 
            messages={messages}
            isLoading={isLoading}
            input={input}
            setInput={setInput}
            handleSendMessage={handleSendMessage}
            level={level}
            activeHotel={activeHotel}
            handoffState={handoffState}
            resetChat={resetChat}
            flwState={flwState}
            setFlwState={setFlwState}
            openFlutterwaveCheckout={openFlutterwaveCheckout}
            handlePaySubmit={handlePaySubmit}
            closeFlutterwaveWithVoucher={closeFlutterwaveWithVoucher}
            convertToNgnStr={convertToNgnStr}
          />

          <OperationalCards 
            triggerFollowUpMock={triggerFollowUpMock}
            reviewSubmitted={reviewSubmitted}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewText={reviewText}
            setReviewText={setReviewText}
            handleReviewSubmit={handleReviewSubmit}
            pushedToLive={pushedToLive}
            onResetReview={handleResetReview}
          />

        </div>

      </div>

      {/* Trust & Deployment Details Footer Section */}
      <section className="mt-20 border-t border-zinc-200/60 pt-16 max-w-[1200px] mx-auto text-center space-y-8">
        <h3 className="text-header font-semibold tracking-tight text-zinc-950">
          Integrate Ever's Guest OS into your existing hospitality stack
        </h3>
        <p className="text-zinc-500 font-light text-body max-w-2xl mx-auto leading-relaxed">
          Ever maps natively onto Cloudbeds, Mews, Opera PMS, and Guesty channels. You don't need to replace your current booking calendar, property software, or CRM. We layer our guest-facing operational interface over them to run connected operations seamlessly.
        </p>

        <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto pt-4 text-body font-mono text-zinc-600">
          <div className="bg-white p-4 rounded-lg border border-zinc-200/50 shadow-xs">
            <p className="text-[#EA6639] font-black text-xl">91%</p>
            <p className="text-micro text-zinc-400 mt-1 uppercase font-semibold">Inquiry Settlement</p>
          </div>
          <div className="bg-white p-4 rounded-lg border border-zinc-200/50 shadow-xs">
            <p className="text-[#EA6639] font-black text-xl">24/7</p>
            <p className="text-micro text-zinc-400 mt-1 uppercase font-semibold">Active Presence</p>
          </div>
        </div>

        <div className="pt-6">
          <Link 
            to="/signup" 
            className="inline-flex items-center gap-2 bg-zinc-950 text-white hover:bg-zinc-800 transition-colors px-6 py-3 rounded-lg text-body font-semibold shadow-md"
          >
            Start Your Free 14-Day Trial
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>

    </div>
  );
}
export default InteractiveDemo;
