import React, { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Markdown from "react-markdown";
import { 
  Sparkles, Send, Check, Shield, Info, ArrowRight, User 
} from "lucide-react";

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

interface ExperienceConsoleProps {
  messages: ChatMessage[];
  isLoading: boolean;
  input: string;
  setInput: (val: string) => void;
  handleSendMessage: (customText?: string) => void;
  level: 1 | 2;
  activeHotel: {
    name: string;
    city: string;
    suggestions: Record<number, string[]>;
    rooms: Array<{ name: string; price: string; desc: string }>;
  };
  handoffState: {
    status: 'none' | 'initiating' | 'connecting' | 'connected';
    agentName: string;
    agentAvatar: string;
  };
  resetChat: () => void;
  flwState: FlutterwaveState | null;
  setFlwState: React.Dispatch<React.SetStateAction<FlutterwaveState | null>>;
  openFlutterwaveCheckout: (url: string) => void;
  handlePaySubmit: (e: React.FormEvent) => void;
  closeFlutterwaveWithVoucher: () => void;
  convertToNgnStr: (amount: string, currency: string) => string;
}

export function ExperienceConsole({
  messages,
  isLoading,
  input,
  setInput,
  handleSendMessage,
  level,
  activeHotel,
  handoffState,
  resetChat,
  flwState,
  setFlwState,
  openFlutterwaveCheckout,
  handlePaySubmit,
  closeFlutterwaveWithVoucher,
  convertToNgnStr
}: ExperienceConsoleProps) {
  const chatScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatScrollerRef.current) {
      chatScrollerRef.current.scrollTo({
        top: chatScrollerRef.current.scrollHeight,
        behavior: messages.length <= 1 ? "auto" : "smooth"
      });
    }
  }, [messages, isLoading]);

  const handleSuggestionClick = (suggestion: string) => {
    handleSendMessage(suggestion);
  };

  return (
    <div id="experience-console" className="space-y-6">
      
      {/* Flutterwave Secure Payment Checkout Simulation Portal Modal */}
      <AnimatePresence>
        {flwState && flwState.isOpen && (
          <div className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-[300] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-lg overflow-hidden shadow-2xl max-w-2xl w-full border border-zinc-200 grid grid-cols-1 md:grid-cols-12 min-h-[480px]"
            >
              
              {/* Sidebar Panel: Payment Options */}
              <div className="md:col-span-4 bg-zinc-50 border-r border-zinc-200 p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-zinc-200">
                    <span className="text-xl">💳</span>
                    <h3 className="text-micro font-mono tracking-wider text-zinc-400 uppercase font-bold">Payments</h3>
                  </div>

                  <div className="space-y-1.5">
                    <button 
                      type="button"
                      onClick={() => setFlwState(prev => prev ? { ...prev, paymentMethod: 'card' as const } : null)}
                      className={`w-full text-left p-2.5 rounded-lg text-body transition-all font-medium ${
                        flwState.paymentMethod === 'card' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      Pay with Card
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFlwState(prev => prev ? { ...prev, paymentMethod: 'bank' as const } : null)}
                      className={`w-full text-left p-2.5 rounded-lg text-body transition-all font-medium ${
                        flwState.paymentMethod === 'bank' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      Pay with Bank
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFlwState(prev => prev ? { ...prev, paymentMethod: 'ussd' as const } : null)}
                      className={`w-full text-left p-2.5 rounded-lg text-body transition-all font-medium ${
                        flwState.paymentMethod === 'ussd' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      Pay with USSD
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFlwState(prev => prev ? { ...prev, paymentMethod: 'transfer' as const } : null)}
                      className={`w-full text-left p-2.5 rounded-lg text-body transition-all font-medium ${
                        flwState.paymentMethod === 'transfer' 
                          ? 'bg-amber-500 text-white shadow-xs' 
                          : 'hover:bg-zinc-100 text-zinc-800'
                      }`}
                    >
                      Bank Transfer
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-200">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-[10px] text-zinc-400 font-mono">SECURE FLW SERVER</span>
                  </div>
                </div>
              </div>

              {/* Main Checkout Panel */}
              <div className="md:col-span-8 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start border-b border-zinc-100 pb-4 mb-4">
                    <div>
                      <span className="text-micro font-mono text-zinc-400 uppercase tracking-widest">Hotel Reservation</span>
                      <h4 className="text-body font-bold text-zinc-800 mt-1 truncate max-w-[280px]">{flwState.hotel}</h4>
                      <p className="text-micro text-zinc-500 font-light mt-0.5">{flwState.room}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-body font-black text-zinc-950">{flwState.currency} {flwState.amount}</p>
                      <p className="text-[10px] text-zinc-400 font-mono mt-0.5">~{convertToNgnStr(flwState.amount, flwState.currency)}</p>
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {flwState.paymentStep === 'form' && (
                      <motion.div 
                        key="form"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <form onSubmit={handlePaySubmit} className="space-y-3">
                          {flwState.paymentMethod === 'card' && (
                            <div className="space-y-3 text-body">
                              <div>
                                <label className="block text-micro text-zinc-400 uppercase font-mono mb-1">Card Holder Name</label>
                                <input 
                                  type="text" 
                                  value={flwState.guestName} 
                                  onChange={(e) => setFlwState(prev => prev ? { ...prev, guestName: e.target.value } : null)}
                                  required 
                                  className="w-full bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-body focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800"
                                />
                              </div>

                              <div>
                                <label className="block text-micro text-zinc-400 uppercase font-mono mb-1">Card Number</label>
                                <input 
                                  type="text" 
                                  value={flwState.cardNumber} 
                                  onChange={(e) => setFlwState(prev => prev ? { ...prev, cardNumber: e.target.value } : null)}
                                  required 
                                  className="w-full bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-body focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800 font-mono"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div>
                                  <label className="block text-micro text-zinc-400 uppercase font-mono mb-1">Card Expiry</label>
                                  <input 
                                    type="text" 
                                    value={flwState.cardExpiry} 
                                    onChange={(e) => setFlwState(prev => prev ? { ...prev, cardExpiry: e.target.value } : null)}
                                    required 
                                    placeholder="MM / YY"
                                    className="w-full bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-body focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800 font-mono text-center"
                                  />
                                </div>
                                <div>
                                  <label className="block text-micro text-zinc-400 uppercase font-mono mb-1">CVV</label>
                                  <input 
                                    type="text" 
                                    value={flwState.cardCvv} 
                                    onChange={(e) => setFlwState(prev => prev ? { ...prev, cardCvv: e.target.value } : null)}
                                    required 
                                    placeholder="123"
                                    className="w-full bg-zinc-50 border border-zinc-200 p-2 rounded-lg text-body focus:ring-1 focus:ring-amber-500 focus:bg-white text-zinc-800 font-mono text-center"
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {flwState.paymentMethod === 'bank' && (
                            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 space-y-3 text-body">
                              <p className="font-semibold text-zinc-800">Select Bank to pay directly:</p>
                              <select className="w-full bg-white border border-zinc-200 p-2 rounded-lg focus:ring-1 focus:ring-amber-500 text-zinc-800">
                                <option>Access Bank Plc</option>
                                <option>GTBank (Guaranty Trust Bank)</option>
                                <option>Zenith Bank Plc</option>
                                <option>United Bank for Africa (UBA)</option>
                                <option>First Bank of Nigeria</option>
                              </select>
                              <div className="p-2 bg-blue-50 border border-blue-100 rounded-lg text-micro text-blue-700 font-light flex gap-1.5 leading-relaxed">
                                <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                <span>We will securely redirect you to your bank portal to authenticate your token instantly.</span>
                              </div>
                            </div>
                          )}

                          {flwState.paymentMethod === 'ussd' && (
                            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 space-y-3 text-body">
                              <p className="font-semibold text-zinc-800">Select Bank for USSD Dial Code:</p>
                              <select className="w-full bg-white border border-zinc-200 p-2 rounded-lg text-zinc-800">
                                <option>GTBank — *737#</option>
                                <option>Zenith Bank — *966#</option>
                                <option>UBA — *919#</option>
                                <option>FirstBank — *894#</option>
                              </select>
                              <div className="p-3 bg-zinc-100 rounded-lg font-mono text-center text-body font-bold text-zinc-700">
                                Dial: *737*1*2*{flwState.amount}#
                              </div>
                            </div>
                          )}

                          {flwState.paymentMethod === 'transfer' && (
                            <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-200 space-y-2 text-body font-light">
                              <p className="font-semibold text-zinc-800">Transfer exactly the converted amount:</p>
                              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg space-y-1 text-micro text-amber-900 font-mono">
                                <p>Bank Name: <strong>Wema Bank / Flutterwave</strong></p>
                                <p>Account Name: <strong>Ever Hospitality Tech Ltd</strong></p>
                                <p>Account Number: <strong>9920391203</strong></p>
                                <p>Reference: <strong>{flwState.reference}</strong></p>
                              </div>
                              <p className="text-micro text-zinc-400 italic">Please click 'Pay' once you make the transfer to simulate confirmation.</p>
                            </div>
                          )}

                          <button
                            type="submit"
                            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg text-body transition-colors shadow-md mt-4 cursor-pointer flex items-center justify-center gap-1"
                          >
                            <Shield className="w-4 h-4" />
                            Pay {flwState.currency} {flwState.amount} via Flutterwave
                          </button>
                        </form>
                      </motion.div>
                    )}

                    {flwState.paymentStep === 'processing' && (
                      <motion.div 
                        key="processing"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-12 h-12 rounded-lg border-4 border-amber-500/20 border-t-amber-500 animate-spin mx-auto" />
                        <div>
                          <p className="font-semibold text-zinc-900 text-body">Securing Settlement...</p>
                          <p className="text-body text-zinc-500 font-light mt-1 max-w-xs mx-auto">
                            Flutterwave is verifying credit limit and authenticating security hashes. Please do not refresh or close this modal window.
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {flwState.paymentStep === 'success' && (
                      <motion.div 
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-4"
                      >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mx-auto shadow-inner">
                          <Check className="w-7 h-7 stroke-[3]" />
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900 text-section">Payment Completed Successfully!</p>
                          <p className="text-body text-zinc-500 font-light mt-1 max-w-sm mx-auto">
                            Transaction cleared on Flutterwave API nodes. Room reservations have been verified and pushed directly into the hotel PMS registry.
                          </p>
                        </div>

                        <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3.5 text-left text-micro font-mono text-zinc-600 space-y-1 max-w-sm mx-auto">
                          <p>• Trans ID: FLW-TX-{Math.floor(Math.random() * 900000 + 100000)}</p>
                          <p>• Settlement: {flwState.currency} {flwState.amount} (~{convertToNgnStr(flwState.amount, flwState.currency)})</p>
                          <p>• Channel: Flutterwave Secure Web Checkout</p>
                        </div>

                        <button
                          type="button"
                          onClick={closeFlutterwaveWithVoucher}
                          className="bg-zinc-950 hover:bg-zinc-800 text-white font-semibold py-2.5 px-6 rounded-lg text-body transition-colors mt-2 cursor-pointer shadow"
                        >
                          Confirm & Return to Concierge
                        </button>
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Footer brand */}
                <div className="border-t border-zinc-100 pt-4 flex justify-between items-center text-micro text-zinc-400">
                  <span className="font-light">Secured with Flutterwave Standard API v3</span>
                  <span className="font-mono uppercase font-black tracking-wider text-zinc-300">flutterwave</span>
                </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Chat Frame */}
      <div className="bg-white border border-dash-border rounded-lg overflow-hidden shadow-md flex flex-col h-[600px]">
        
        {/* Chat Widget Header */}
        <div className="bg-zinc-950 px-5 py-4 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              {handoffState.status === 'connected' ? (
                <div className="w-10 h-10 rounded-lg bg-amber-500 border border-amber-400 flex items-center justify-center text-lg shadow-inner">
                  👩‍💼
                </div>
              ) : handoffState.status === 'connecting' || handoffState.status === 'initiating' ? (
                <div className="w-10 h-10 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-lg shadow-inner animate-pulse">
                  ⏳
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-[#EA6639] to-[#7B61FF] flex items-center justify-center text-lg shadow-inner">
                  🏨
                </div>
              )}
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-md border-2 border-zinc-950 ${
                handoffState.status === 'connected' ? "bg-emerald-500" :
                handoffState.status === 'connecting' || handoffState.status === 'initiating' ? "bg-amber-450 animate-ping" : "bg-emerald-500"
              }`} />
            </div>
            <div>
              <h3 className="text-body font-semibold flex items-center gap-1">
                {handoffState.status === 'connected' ? "Sarah" : handoffState.status === 'connecting' || handoffState.status === 'initiating' ? "Connecting Staff..." : "Ellie"}
                {handoffState.status === 'none' && <Sparkles className="w-3.5 h-3.5 text-[#EA6639] animate-pulse" />}
                {handoffState.status === 'connected' && <span className="text-micro bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">Live Staff</span>}
              </h3>
              <p className="text-[10px] text-zinc-400 font-mono tracking-widest uppercase">
                {handoffState.status === 'connected' ? "Guest Relations Manager" :
                 handoffState.status === 'connecting' || handoffState.status === 'initiating' ? "Silently transferring..." :
                 level === 1 ? "Guest Concierge" : "Commerce Agent"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <span className="text-micro font-mono uppercase bg-white/10 px-2 py-1 rounded text-zinc-300 tracking-wider">
              {activeHotel.city} Location
            </span>
          </div>
        </div>

        {/* Dynamic Connected Guest OS Subtle Header Badge */}
        <div className="bg-emerald-50 border-b border-emerald-100 px-5 py-2 flex items-center justify-center gap-1.5 text-micro font-mono tracking-wider text-emerald-800 uppercase font-semibold shrink-0">
          <span className="w-1.5 h-1.5 rounded-md bg-emerald-500 animate-pulse" />
          LIVE GUEST EXPERIENCE
        </div>

        {/* Status alert banner when live handoff is active or in progress */}
        {handoffState.status !== 'none' && (
          <div className={`px-5 py-2.5 flex items-center justify-between text-body border-b ${
            handoffState.status === 'connected' 
              ? 'bg-emerald-50 text-emerald-800 border-emerald-150' 
              : 'bg-amber-50 text-amber-800 border-amber-150 animate-pulse'
          }`}>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-md opacity-75 ${handoffState.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-md h-2 w-2 ${handoffState.status === 'connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <span className="font-light">
              {handoffState.status === 'connected' 
                ? <span>Connected with <strong>Sarah</strong> (Live Staff Representative) in chat.</span>
                : <span>Searching for an available representative... routing in background.</span>
              }
            </span>
          </div>
          {handoffState.status === 'connected' && (
            <button 
              type="button"
              onClick={resetChat}
              className="text-micro text-zinc-500 underline hover:text-zinc-800 cursor-pointer"
            >
              Return to Ellie (AI)
            </button>
          )}
          </div>
        )}

        {/* Chat Body scroller */}
        <div ref={chatScrollerRef} className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-4">
          {messages.map((msg, idx) => {
            const isUser = msg.role === 'user';
            return (
              <div key={idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-3 text-body overflow-hidden ${
                  isUser 
                    ? 'bg-[#EA6639] text-white rounded-tr-none shadow-xs' 
                    : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-none shadow-xs'
                }`}>
                  {isUser ? (
                    <p className="whitespace-pre-wrap leading-relaxed font-light">{msg.text}</p>
                  ) : (
                    <div className="markdown-body text-body leading-relaxed space-y-2 font-normal">
                      <Markdown
                        components={{
                          a: ({ href, children }) => {
                            if (href && href.includes("flutterwave.com/pay")) {
                              return (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    openFlutterwaveCheckout(href);
                                  }}
                                  className="inline-flex items-center gap-1.5 text-white hover:bg-amber-600 font-bold bg-amber-500 hover:scale-[1.03] transition-all px-3 py-1.5 rounded-md shadow-xs cursor-pointer my-2 font-sans text-body shrink-0 border-0"
                                >
                                  💳 Pay via Flutterwave <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              );
                            }
                            return (
                              <span className="inline-flex items-center gap-0.5 text-[#EA6639] hover:underline font-bold bg-[#EA6639]/5 px-1.5 py-0.5 rounded cursor-pointer">
                                {children} <ArrowRight className="w-2.5 h-2.5 -rotate-45" />
                              </span>
                            );
                          },
                          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed font-normal text-zinc-800">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1 mt-1 text-zinc-800 font-normal">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1 mt-1 text-zinc-800 font-normal">{children}</ol>,
                          li: ({ children }) => <li className="text-zinc-800 leading-relaxed font-normal">{children}</li>,
                          strong: ({ children }) => <strong className="font-semibold text-zinc-950">{children}</strong>,
                        }}
                      >
                        {msg.text}
                      </Markdown>

                      {/* Fallback Payment Button if link is detected in text */}
                      {(() => {
                        const match = msg.text.match(/(https:\/\/flutterwave\.com\/pay\/[^\s\)\"\'>]+)/);
                        if (match) {
                          const flwUrl = match[1];
                          return (
                            <div className="mt-3 pt-2.5 border-t border-zinc-200 flex flex-col gap-1.5">
                              <p className="text-micro text-zinc-400 font-medium font-sans uppercase tracking-wider">💳 Live Flutterwave Invoice Generated</p>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openFlutterwaveCheckout(flwUrl);
                                }}
                                className="w-full flex items-center justify-center gap-2 text-white hover:bg-amber-600 font-bold bg-amber-500 hover:scale-[1.01] active:scale-95 transition-all py-3 px-4 rounded-md shadow-md cursor-pointer border-0 font-sans text-body"
                              >
                                💳 Open Flutterwave Sandbox Portal <ArrowRight className="w-4 h-4 animate-pulse" />
                              </button>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-zinc-200 rounded-lg rounded-tl-none px-4 py-3 text-zinc-500 text-body flex items-center gap-2">
                <span className="w-2 h-2 bg-[#EA6639] rounded-md animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-[#EA6639] rounded-md animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-[#EA6639] rounded-md animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Suggested Prompts Area */}
        <div className="px-3 py-1.5 bg-white border-t border-zinc-100 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none shrink-0">
          {activeHotel.suggestions[level].map((s, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSuggestionClick(s)}
              className="bg-zinc-50 hover:bg-[#EA6639]/5 hover:text-[#EA6639] hover:border-[#EA6639]/30 text-zinc-600 text-body px-3 py-1.5 rounded-md border border-zinc-200 transition-all shrink-0 cursor-pointer font-light"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input Box - Queued, non-blocking and fully accessible during load states */}
        <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
          <div className="relative flex items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={isLoading ? "Replying..." : "Type here to experience the operational flow..."}
              rows={2}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-lg pl-4 pr-12 py-2.5 text-body focus:outline-none focus:ring-1 focus:ring-[#EA6639] focus:bg-white transition-all text-zinc-800 placeholder-zinc-400 resize-none font-light leading-relaxed min-h-[44px] max-h-[110px] overflow-y-auto"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!input.trim()}
              className="absolute right-2 bottom-2 w-8 h-8 rounded-md bg-[#EA6639] text-white flex items-center justify-center hover:bg-[#EA6639]/90 disabled:opacity-50 transition-all cursor-pointer border-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="flex justify-between items-center mt-2 px-1">
            <span className="text-[9px] text-zinc-400 font-light">
              Press <strong>Enter</strong> for a new paragraph. Click <strong>Send</strong> (or press <strong>Ctrl+Enter</strong>) to submit.
            </span>
            <span className="text-[9px] text-zinc-400 font-mono">
              Guest OS v2.5
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
