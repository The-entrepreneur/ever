import React, { useState, useEffect, useRef } from "react";
import {
  MessageSquare, Search, Phone, Mail, User,
  AlertCircle, Send, RefreshCw, Wifi, WifiOff, CheckCircle2, Clock
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../shared/ToastContext";
import { Modal } from "../../../shared/Modal";

// ─── Types ───────────────────────────────────────────────────────────────────
interface InboxSession {
  session_id: string;
  hotel_id: string;
  last_message_at: string;
  last_message: string;
  channel: string;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  handoff_status: string | null;
  agent_id: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string;
  client_id: string;
  hotel_slug: string | null;
  channel: string;
  role: "user" | "assistant" | "agent";
  content: string;
  created_at: string;
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function timeAgo(dateStr: string) {
  if (!dateStr) return "";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function channelLabel(ch: string) {
  const map: Record<string, string> = {
    whatsapp: "WhatsApp", widget: "Web Widget", meta: "Meta", instagram: "Instagram"
  };
  return map[ch] || ch || "Unknown";
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
function StatusChip({ status }: { status: string | null }) {
  if (status === "open")
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700">
        HANDOFF
      </span>
    );
  if (status === "active")
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
      BOT
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InboxTab({ initialSessionId }: { initialSessionId?: string | null }) {
  const { hotelId, user } = useAuth();
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState("All");
  const [conversations, setConversations] = useState<InboxSession[]>([]);
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [agentMode, setAgentMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [search, setSearch] = useState("");
  const [isRealtime, setIsRealtime] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Resolve Confirmation Modal state
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversation list
  const fetchConversations = async () => {
    if (!hotelId) return;
    try {
      const { data, error } = await supabase
        .from("inbox_sessions")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("last_message_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setConversations(data as InboxSession[]);
        if (initialSessionId) {
          setSelectedConvId(initialSessionId);
        } else if (!selectedConvId && data.length > 0) {
          setSelectedConvId(data[0].session_id);
        }
        setIsRealtime(true);
      }
    } catch (err) {
      console.warn("[Inbox] Failed to load conversations:", err);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hotelId, initialSessionId]);

  useEffect(() => {
    if (!hotelId) return;

    // Subscriptions for real-time live inbox updates
    const filterConversations = `client_id=eq.${hotelId}`;
    const filterHandoffs = `hotel_id=eq.${hotelId}`;

    const realtimeChannel = supabase
      .channel("inbox_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations", filter: filterConversations },
        (payload) => {
          const msg = payload.new as ChatMessage;
          // Refresh list to update the last_message and last_message_at
          fetchConversations();
          
          // Append to open chat if it matches
          setMessages((prev) => {
            if (msg.session_id === selectedConvId) return [...prev, msg];
            return prev;
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "handoff_sessions", filter: filterHandoffs },
        () => {
          // Re-fetch conversation list if a handoff state changes
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(realtimeChannel); };
  }, [hotelId, selectedConvId]);

  // Load chat history when selected conversation changes
  useEffect(() => {
    if (!selectedConvId) return;
    setIsLoading(true);

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("session_id", selectedConvId)
          .order("created_at", { ascending: true })
          .limit(200);

        if (!error && data) {
          setMessages(data as ChatMessage[]);
        }
      } catch (err) {
        console.warn("[Inbox] Error fetching messages", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedConvId]);

  // Derive agent mode from the current selected conversation's handoff status
  useEffect(() => {
    const activeConv = conversations.find((c) => c.session_id === selectedConvId);
    if (activeConv && activeConv.handoff_status === "active") {
      setAgentMode(true);
    } else {
      setAgentMode(false);
    }
  }, [selectedConvId, conversations]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const selectedConv = conversations.find((c) => c.session_id === selectedConvId) || null;

  const filteredConvs = conversations.filter((c) => {
    const matchFilter =
      activeFilter === "All" ||
      (activeFilter === "Pending Handoff" && c.handoff_status === "open") ||
      (activeFilter === "My Active Chats" && c.handoff_status === "active");
    const matchSearch =
      !search ||
      (c.guest_name && c.guest_name.toLowerCase().includes(search.toLowerCase())) ||
      c.session_id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleTakeover = async () => {
    if (!selectedConv || !hotelId) return;
    setAgentMode(true);
    
    try {
      const { error } = await supabase.from("handoff_sessions").upsert({
        hotel_id: hotelId,
        session_id: selectedConv.session_id,
        channel: selectedConv.channel,
        status: "active",
        agent_id: user?.id,
        created_at: new Date().toISOString()
      }, { onConflict: "session_id" });
      
      if (error) throw error;
      showToast("Chat taken over successfully. AI paused.", "success");
      fetchConversations();
    } catch (err) {
      setAgentMode(false);
      showToast("Failed to take over chat.", "error");
    }
  };

  const handleResolve = async () => {
    if (!selectedConv) return;
    
    try {
      const { error } = await supabase
        .from("handoff_sessions")
        .update({ status: "resolved", resolved_at: new Date().toISOString() })
        .eq("session_id", selectedConv.session_id);
        
      if (error) throw error;
      
      setAgentMode(false);
      setIsResolveModalOpen(false);
      showToast("Chat resolved. AI resumed.", "success");
      fetchConversations();
    } catch (err) {
      showToast("Failed to resolve chat.", "error");
    }
  };

  const handleSend = async () => {
    if (!replyText.trim() || !selectedConv || !hotelId) return;
    
    const textToSend = replyText.trim();
    setReplyText(""); // optimistic clear
    
    try {
      const { error } = await supabase.from("conversations").insert({
        session_id: selectedConv.session_id,
        client_id: hotelId,
        channel: selectedConv.channel,
        role: "agent",
        content: textToSend,
        created_at: new Date().toISOString()
      });
      if (error) throw error;
    } catch (err) {
      showToast("Failed to send message", "error");
      setReplyText(textToSend); // restore on fail
    }
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
                  <WifiOff className="w-3 h-3" /> Connecting...
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
                key={conv.session_id}
                onClick={() => setSelectedConvId(conv.session_id)}
                className={`p-4 cursor-pointer transition-colors ${
                  selectedConvId === conv.session_id
                    ? "bg-[#EA6639]/5 border-l-2 border-[#EA6639]"
                    : "hover:bg-dash-surface-hover border-l-2 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium text-xs text-dash-text flex items-center gap-1.5">
                    {conv.handoff_status === "open" && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                    )}
                    {conv.guest_name || "Unknown Guest"}
                  </span>
                  <span className="text-[10px] text-dash-text-muted shrink-0">
                    {timeAgo(conv.last_message_at)}
                  </span>
                </div>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-[10px] text-dash-text-muted font-mono">
                    {conv.session_id} • {channelLabel(conv.channel)}
                  </div>
                  <StatusChip status={conv.handoff_status} />
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
                  {selectedConv.guest_name || "Unknown Guest"}
                  <StatusChip status={selectedConv.handoff_status} />
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  {agentMode ? (
                    <button
                      onClick={() => setIsResolveModalOpen(true)}
                      className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Resolve Chat
                    </button>
                  ) : (
                    <button
                      onClick={handleTakeover}
                      className="px-3 py-1.5 bg-dash-surface text-dash-text text-xs font-medium rounded-md border border-dash-border hover:bg-dash-surface-raised transition-colors shadow-sm"
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
                {selectedConv.handoff_status === "open" && (
                  <div className="flex items-center gap-1.5 text-red-500 font-medium">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    Human requested
                  </div>
                )}
                {selectedConv.handoff_status === "active" && (
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

                  {selectedConv.handoff_status === "open" && !agentMode && (
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
                    placeholder={`Reply to ${selectedConv.guest_name || "guest"}...`}
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

      {/* Resolve Confirmation Modal */}
      <Modal
        isOpen={isResolveModalOpen}
        onClose={() => setIsResolveModalOpen(false)}
        title="Resolve Conversation"
      >
        <div className="space-y-4">
          <p className="text-sm text-dash-text-sec">
            Are you sure you want to resolve this conversation? The AI bot will resume handling any new messages from the guest.
          </p>
          <div className="flex justify-end gap-2 pt-4 border-t border-dash-border">
            <button
              onClick={() => setIsResolveModalOpen(false)}
              className="px-4 py-2 text-dash-text text-sm font-medium hover:bg-dash-surface-hover rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleResolve}
              className="px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-md hover:bg-emerald-700 transition-colors"
            >
              Confirm & Resolve
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
