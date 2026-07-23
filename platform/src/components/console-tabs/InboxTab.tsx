import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Search, Phone, Mail, User,
  AlertCircle, Send, RefreshCw, Wifi, WifiOff, CheckCircle2, Clock
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Conversation {
  id: string;
  session_id: string;
  guest_name: string;
  guest_phone?: string;
  guest_email?: string;
  channel: "whatsapp" | "widget" | "meta" | string;
  status: "open" | "pending_handoff" | "agent_active" | "resolved";
  handoff_requested: boolean;
  last_message: string;
  last_message_at: string;
  created_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "agent";
  content: string;
  created_at: string;
}

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "conv-1",
    session_id: "SESS-102",
    guest_name: "Sarah Jenkins",
    guest_phone: "+1 555 0192",
    guest_email: "sarah.j@example.com",
    channel: "whatsapp",
    status: "pending_handoff",
    handoff_requested: true,
    last_message: "I'd like to speak to a human about my booking.",
    last_message_at: new Date(Date.now() - 600000).toISOString(),
    created_at: new Date(Date.now() - 900000).toISOString()
  },
  {
    id: "conv-2",
    session_id: "SESS-098",
    guest_name: "Mark Thompson",
    guest_phone: "+1 555 0248",
    guest_email: "mark.t@example.com",
    channel: "widget",
    status: "agent_active",
    handoff_requested: false,
    last_message: "Agent: We've upgraded your room to the suite.",
    last_message_at: new Date(Date.now() - 3300000).toISOString(),
    created_at: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "conv-3",
    session_id: "SESS-095",
    guest_name: "Lucia Fernandez",
    guest_phone: "+34 655 992 001",
    guest_email: "lucia.f@example.com",
    channel: "whatsapp",
    status: "open",
    handoff_requested: false,
    last_message: "Does the restaurant open at 7am?",
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 7500000).toISOString()
  }
];

const MOCK_MESSAGES: Record<string, Message[]> = {
  "conv-1": [
    {
      id: "msg-1a",
      conversation_id: "conv-1",
      role: "user",
      content: "I'd like to modify my dates, but your policy says it's non-refundable. Is there any way around this?",
      created_at: new Date(Date.now() - 900000).toISOString()
    },
    {
      id: "msg-1b",
      conversation_id: "conv-1",
      role: "assistant",
      content: "I understand you want to modify a non-refundable booking. Usually, these cannot be changed. However, let me connect you with a human agent who can look into this specific reservation for you.",
      created_at: new Date(Date.now() - 840000).toISOString()
    },
    {
      id: "msg-1c",
      conversation_id: "conv-1",
      role: "user",
      content: "I'd like to speak to a human about my booking.",
      created_at: new Date(Date.now() - 600000).toISOString()
    }
  ],
  "conv-2": [
    {
      id: "msg-2a",
      conversation_id: "conv-2",
      role: "user",
      content: "Hi, can I get a room upgrade? We have a special anniversary.",
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: "msg-2b",
      conversation_id: "conv-2",
      role: "agent",
      content: "We've upgraded your room to the suite. Congratulations on your anniversary!",
      created_at: new Date(Date.now() - 3300000).toISOString()
    }
  ],
  "conv-3": [
    {
      id: "msg-3a",
      conversation_id: "conv-3",
      role: "user",
      content: "Does the restaurant open at 7am?",
      created_at: new Date(Date.now() - 7200000).toISOString()
    }
  ]
};

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function channelLabel(ch: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp", widget: "Web Widget", meta: "Meta"
  };
  return map[ch] || ch;
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
function StatusChip({ status, handoff }: { status: string; handoff: boolean }) {
  if (handoff)
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
        HANDOFF
      </span>
    );
  if (status === "agent_active")
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
        ACTIVE
      </span>
    );
  if (status === "resolved")
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
        RESOLVED
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-100 text-zinc-600">
      OPEN
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InboxTab() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(MOCK_CONVERSATIONS[0].id);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES["conv-1"] || []);
  const [agentMode, setAgentMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [isRealtime, setIsRealtime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Try to connect to Supabase Realtime
  useEffect(() => {
    let cleanup: (() => void) | null = null;

    const initRealtime = async () => {
      try {
        const { createClient } = await import("@supabase/supabase-js");
        const url = (import.meta as any).env?.VITE_SUPABASE_URL;
        const key = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
        if (!url || !key) return;

        const supabase = createClient(url, key);

        // Load real conversations
        const { data: convData } = await supabase
          .from("conversations")
          .select("*")
          .order("last_message_at", { ascending: false })
          .limit(50);

        if (convData && convData.length > 0) {
          setConversations(convData as Conversation[]);
          setSelectedConvId(convData[0].id);
          setIsRealtime(true);
        }

        // Subscribe to new conversations
        const channel = supabase
          .channel("inbox_realtime")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "conversations" },
            (payload) => {
              if (payload.eventType === "INSERT") {
                setConversations((prev) => [payload.new as Conversation, ...prev]);
              } else if (payload.eventType === "UPDATE") {
                setConversations((prev) =>
                  prev.map((c) => (c.id === (payload.new as Conversation).id ? (payload.new as Conversation) : c))
                );
              }
            }
          )
          .on(
            "postgres_changes",
            { event: "INSERT", schema: "public", table: "messages" },
            (payload) => {
              const msg = payload.new as Message;
              setMessages((prev) => {
                if (msg.conversation_id === selectedConvId) {
                  return [...prev, msg];
                }
                return prev;
              });
            }
          )
          .subscribe();

        cleanup = () => supabase.removeChannel(channel);
      } catch (err) {
        console.warn("[Inbox] Realtime unavailable, using local simulation:", err);
      }
    };

    initRealtime();
    return () => cleanup?.();
  }, []);

  // Load messages when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;
    setIsLoading(true);

    // Use mock data if Supabase isn't available
    const mockMsgs = MOCK_MESSAGES[selectedConvId] || [];
    setTimeout(() => {
      setMessages(mockMsgs);
      setIsLoading(false);
    }, 120);

    setAgentMode(false);
  }, [selectedConvId]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations.find((c) => c.id === selectedConvId) || null;

  const filteredConvs = conversations.filter((c) => {
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending Handoff" && c.handoff_requested) ||
      (activeFilter === "My Active Chats" && c.status === "agent_active");
    const matchSearch =
      !search ||
      c.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      c.session_id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleTakeover = () => {
    setAgentMode(true);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId
          ? { ...c, status: "agent_active", handoff_requested: false }
          : c
      )
    );
  };

  const handleResolve = async () => {
    setAgentMode(false);
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConvId ? { ...c, status: "resolved" } : c))
    );

    if (selectedConv) {
      try {
        await fetch("/api/conversations/resolve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            session_id: selectedConv.session_id,
            channel: selectedConv.channel
          })
        });
      } catch (err) {
        console.warn("[Inbox] Failed to clear handoff lock:", err);
      }
    }
  };

  const handleSend = () => {
    if (!replyText.trim() || !selectedConvId) return;
    const newMsg: Message = {
      id: `local-${Date.now()}`,
      conversation_id: selectedConvId,
      role: "agent",
      content: replyText.trim(),
      created_at: new Date().toISOString()
    };
    setMessages((prev) => [...prev, newMsg]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === selectedConvId ? { ...c, last_message: `Agent: ${newMsg.content}`, last_message_at: newMsg.created_at } : c
      )
    );
    setReplyText("");
  };

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-dash-surface">
      {/* ── Left Pane: Conversation List ── */}
      <div className="w-full md:w-[300px] border-r border-dash-border flex flex-col h-full shrink-0">
        <div className="p-4 border-b border-dash-border space-y-3 bg-dash-surface shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-body font-semibold text-dash-text">Unified Live Inbox</h2>
            <div className="flex items-center gap-1.5 text-[10px] font-medium">
              {isRealtime ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-400">
                  <WifiOff className="w-3 h-3" /> Simulated
                </span>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guests or sessions..."
              className="w-full pl-9 pr-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
          <div className="flex gap-1.5 text-xs overflow-x-auto hide-scrollbar pb-0.5">
            {["All", "Pending Handoff", "My Active Chats"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors flex-shrink-0 ${
                  activeFilter === filter
                    ? "bg-[#EA6639]/10 text-[#EA6639] font-medium"
                    : "bg-dash-surface text-dash-text-sec border border-dash-border hover:bg-dash-surface-hover"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-dash-border-hairline">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted text-xs gap-2">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span>No conversations</span>
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedConvId === conv.id
                    ? "bg-[#EA6639]/5 border-l-2 border-[#EA6639]"
                    : "hover:bg-dash-surface-hover border-l-2 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs text-dash-text flex items-center gap-1.5">
                    {conv.handoff_requested && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    {conv.guest_name}
                  </span>
                  <span className="text-[10px] text-dash-text-muted shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] text-dash-text-muted font-mono">
                    {conv.session_id} • {channelLabel(conv.channel)}
                  </div>
                  <StatusChip status={conv.status} handoff={conv.handoff_requested} />
                </div>
                <p className="text-xs text-dash-text-sec truncate">{conv.last_message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right Pane: Chat Window ── */}
      <div className="flex-1 flex flex-col h-full bg-dash-canvas/50 min-w-0">
        {selectedConv ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-dash-border bg-dash-surface shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-body font-medium text-dash-text flex items-center gap-2 flex-wrap">
                  {selectedConv.guest_name}
                  <StatusChip status={selectedConv.status} handoff={selectedConv.handoff_requested} />
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  {agentMode ? (
                    <button
                      onClick={handleResolve}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve
                    </button>
                  ) : (
                    <button
                      onClick={handleTakeover}
                      className="px-3 py-1.5 bg-dash-surface text-dash-text text-xs font-medium rounded-md border border-dash-border hover:bg-dash-surface-raised transition-colors"
                    >
                      Take Over Chat
                    </button>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                {selectedConv.guest_email && (
                  <div className="flex items-center gap-1.5 text-dash-text-sec">
                    <Mail className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{selectedConv.guest_email}</span>
                  </div>
                )}
                {selectedConv.guest_phone && (
                  <div className="flex items-center gap-1.5 text-dash-text-sec">
                    <Phone className="w-3.5 h-3.5 shrink-0" />
                    {selectedConv.guest_phone}
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-dash-text-sec">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {channelLabel(selectedConv.channel)}
                </div>
                {selectedConv.handoff_requested && (
                  <div className="flex items-center gap-1.5 text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Human requested
                  </div>
                )}
                {selectedConv.status === "agent_active" && !selectedConv.handoff_requested && (
                  <div className="flex items-center gap-1.5 text-blue-500 font-medium">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    Agent active
                  </div>
                )}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-5 h-5 text-dash-text-muted animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.role === "user" ? (
                        <div className="bg-dash-surface-raised text-dash-text p-3 rounded-lg rounded-tr-sm max-w-[80%] text-xs shadow-sm">
                          {msg.content}
                        </div>
                      ) : msg.role === "agent" ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-900 p-3 rounded-lg rounded-tl-sm max-w-[80%] text-xs">
                          <span className="text-[10px] font-bold text-blue-600 block mb-1 uppercase tracking-wide">
                            Staff Agent
                          </span>
                          {msg.content}
                        </div>
                      ) : (
                        <div className="bg-dash-surface border border-dash-border text-dash-text p-3 rounded-lg rounded-tl-sm max-w-[80%] text-xs">
                          <span className="text-[10px] font-bold text-[#EA6639] block mb-1 uppercase tracking-wide">
                            Ever AI
                          </span>
                          {msg.content}
                        </div>
                      )}
                    </div>
                  ))}

                  {selectedConv.handoff_requested && !agentMode && (
                    <div className="flex justify-center">
                      <span className="text-xs font-mono text-red-500 bg-red-50 px-3 py-1 rounded-md border border-red-200">
                        Bot silenced — awaiting agent takeover
                      </span>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-dash-surface border-t border-dash-border shrink-0">
              {agentMode ? (
                <div className="relative">
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Reply to ${selectedConv.guest_name}...`}
                    className="w-full p-3 pr-24 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] resize-none h-[72px] text-dash-text"
                  />
                  <div className="absolute right-3 bottom-3">
                    <button
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-[#EA6639] text-white text-xs font-medium rounded-md hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                    >
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <textarea
                    disabled
                    placeholder="Click 'Take Over Chat' to reply to this guest..."
                    className="w-full p-3 pr-24 bg-dash-canvas border border-dash-border rounded-lg text-xs resize-none h-[72px] disabled:opacity-40 text-dash-text"
                  />
                  <div className="absolute right-3 bottom-3">
                    <button disabled className="px-4 py-1.5 bg-dash-green text-dash-green-text text-xs font-medium rounded-md opacity-40 cursor-not-allowed flex items-center gap-1.5">
                      <Send className="w-3.5 h-3.5" />
                      Send
                    </button>
                  </div>
                </div>
              )}
              <p className="text-[10px] text-dash-text-muted mt-2">
                Press <kbd className="px-1 py-0.5 bg-dash-surface-raised rounded text-[10px] border border-dash-border">Enter</kbd> to send,{" "}
                <kbd className="px-1 py-0.5 bg-dash-surface-raised rounded text-[10px] border border-dash-border">Shift+Enter</kbd> for new line.
              </p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-dash-text-muted gap-3">
            <MessageSquare className="w-10 h-10 opacity-20" />
            <span className="text-xs">Select a conversation to view</span>
          </div>
        )}
      </div>
    </div>
  );
}
