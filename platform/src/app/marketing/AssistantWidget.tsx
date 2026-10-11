import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, Loader2, Calendar, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Markdown from 'react-markdown';


interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export function AssistantWidget() {
  const location = useLocation();
  const isLoggedInRoute = ["/console", "/agency"].includes(location.pathname.replace(/\/$/, ""));

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-close on route change to console/agency
  useEffect(() => {
    if (isLoggedInRoute) {
      setIsOpen(false);
    }
  }, [location.pathname, isLoggedInRoute]);

  // Global event listener to reveal the chat from the sidebar
  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-ellie-chat', handleOpenChat);
    return () => window.removeEventListener('open-ellie-chat', handleOpenChat);
  }, []);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  // Handle auto scroll inside chat window
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Initial welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          role: 'model',
          text: 'Hello! I am Ellie, your Virtual Partner here at Ever. I can guide you through our hospitality finance automation pipelines, general ledger setups, and booking channel synchronization. Let me know what you are looking to optimize today!',
        },
      ]);
    }
  }, [isOpen, messages.length]);

  // Robust formatter to convert raw paths (like /help-desk or /privacy) into clean Markdown links
  const formatRawPathsToLinks = (text: string): string => {
    if (!text) return '';
    // Replace bare '/help-desk', '/privacy', or any other valid platform path
    // when not already inside parenthesis or brackets (helps fix broken unformatted strings)
    const validPaths = [
      'help-desk', 'privacy', 'status', 'about', 'terms', 'pricing', 
      'guest-concierge', 'commerce-agent', 'reporting', 'integrations', 'use-cases'
    ].join('|');
    
    const regex = new RegExp(`(?<!\\]\\()\\/(${validPaths})(?!\\w|\\))`, 'gi');
    return text.replace(regex, (match, pathName) => {
      const label = pathName
        .split('-')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      return `[${label}](/${pathName.toLowerCase()})`;
    });
  };

  // Re-usable API chat submit core
  const submitChatMessage = async (msgText: string, historyContext: ChatMessage[]) => {
    setIsLoading(true);
    try {
      const history = historyContext.map(msg => ({
        role: msg.role,
        text: msg.text,
        parts: [{ text: msg.text }]
      }));

      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: msgText, history }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'model', text: data.text }]);
    } catch (error) {
      console.error('Error fetching chat response:', error);
      setMessages((prev) => [
        ...prev,
        { role: 'model', text: "I'm sorry, I'm having trouble connecting to the server. Please try again later or visit our [Help Desk](/help-desk)." }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    
    const newMessages = [...messages, { role: 'user', text: userMessage } as ChatMessage];
    setMessages(newMessages);

    // Pass the message list minus the last element to server as history
    await submitChatMessage(userMessage, newMessages.slice(0, -1));
  };

  if (isLoggedInRoute && !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end" id="widget-floating-container">


      <AnimatePresence>
        {/* TAB 2: RICH EXPERIMENT MARKDOWN CHAT PANEL */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-zinc-200 rounded-2xl shadow-xl w-80 sm:w-96 flex flex-col mb-4 overflow-hidden relative text-left"
            style={{ height: '520px', maxHeight: 'calc(100vh - 120px)' }}
            id="chat-active-panel"
          >
            {/* Header */}
            <div className="bg-zinc-950 p-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=150"
                    alt="Ellie"
                    className="w-8 h-8 rounded-full object-cover border border-zinc-800"
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-zinc-950" />
                </div>
                <div>
                  <h3 className="text-white text-xs font-semibold flex items-center gap-1">
                    Ellie
                    <Sparkles className="w-3 h-3 text-[#EA6639] shrink-0" />
                  </h3>
                  <p className="text-zinc-400 text-[9px] uppercase font-mono tracking-wider">Virtual Onboarding Guide</p>
                </div>
              </div>
              <button 
                onClick={toggleOpen}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer w-7 h-7 flex items-center justify-center rounded-full hover:bg-zinc-900"
                aria-label="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Area - Styled with React Markdown for High-Craft Formatting */}
            <div className="flex-1 overflow-y-auto p-4 bg-zinc-50 space-y-4" id="chat-messages-scroller">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs overflow-hidden ${
                      msg.role === 'user' 
                        ? 'bg-[#EA6639] text-white rounded-tr-sm shadow-xs' 
                        : 'bg-white border border-zinc-200 text-zinc-800 rounded-tl-sm shadow-xs'
                    }`}
                  >
                    {msg.role === 'model' ? (
                      <div className="markdown-body text-xs sm:text-xs">
                        <Markdown
                          components={{
                            a: ({ href, children }) => {
                              const isInternal = href?.startsWith('/');
                              if (isInternal) {
                                return <Link to={href!} onClick={() => setIsOpen(false)} className="text-[#EA6639] hover:underline font-semibold">{children}</Link>;
                              }
                              return <a href={href} target="_blank" rel="noopener noreferrer" className="text-[#EA6639] hover:underline font-semibold">{children}</a>;
                            },
                            p: ({ children }) => <p className="mb-2.5 last:mb-0 leading-relaxed font-normal text-zinc-800">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-5 mb-2.5 space-y-1 mt-1 text-zinc-800 font-normal">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-5 mb-2.5 space-y-1 mt-1 text-zinc-800 font-normal">{children}</ol>,
                            li: ({ children }) => <li className="text-zinc-800 leading-relaxed font-normal">{children}</li>,
                            h1: ({ children }) => <h1 className="text-xs font-bold mb-1.5 mt-2.5 text-zinc-950 uppercase tracking-wide font-mono">{children}</h1>,
                            h2: ({ children }) => <h2 className="text-xs font-bold mb-1 mt-2 text-zinc-900 font-mono">{children}</h2>,
                            h3: ({ children }) => <h3 className="text-xs font-semibold mb-0.5 mt-1.5 text-zinc-950">{children}</h3>,
                            strong: ({ children }) => <strong className="font-semibold text-zinc-950">{children}</strong>,
                            code: ({ children }) => <code className="bg-zinc-100 text-[#EA6639] font-mono text-[11px] px-1 py-0.5 rounded">{children}</code>
                          }}
                        >
                          {formatRawPathsToLinks(msg.text)}
                        </Markdown>
                      </div>
                    ) : (
                      <span className="font-light leading-relaxed whitespace-pre-wrap">{msg.text}</span>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-zinc-200 text-zinc-700 rounded-2xl rounded-tl-sm px-4 py-3 shadow-xs">
                    <Loader2 className="w-4 h-4 animate-spin text-[#EA6639]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-zinc-200 shrink-0">
              <form onSubmit={handleSubmit} className="relative flex items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Send message on Enter key without active shifts
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (input.trim() && !isLoading) {
                        const fakeEvent = {
                          preventDefault: () => {}
                        } as React.FormEvent;
                        handleSubmit(fakeEvent);
                      }
                    }
                  }}
                  placeholder="Ask a question... (Shift+Enter for a new line)"
                  disabled={isLoading}
                  rows={2}
                  className="w-full bg-zinc-100 border border-zinc-200 rounded-xl pl-4 pr-12 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] focus:bg-white transition-all disabled:opacity-50 text-zinc-800 placeholder-zinc-400 resize-none font-light leading-relaxed min-h-[44px] max-h-[110px] overflow-y-auto"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2.5 w-8 h-8 rounded-lg bg-[#EA6639] text-white flex items-center justify-center hover:bg-[#EA6639]/90 disabled:opacity-50 disabled:hover:bg-[#EA6639] transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main chat toggle launcher */}
      {!isLoggedInRoute && (
        <button
          onClick={toggleOpen}
          className="w-14 h-14 bg-[#EA6639] text-white rounded-full shadow-lg hover:bg-[#d65a2e] transition-transform hover:scale-105 active:scale-95 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-[#EA6639]/30 cursor-pointer"
          aria-label="Open chat"
          id="chat-toggle-anchor"
        >
          {isOpen ? <X className="w-6 h-6 animate-in duration-200 rotation-45" /> : <MessageSquare className="w-6 h-6" />}
        </button>
      )}
    </div>
  );
}
