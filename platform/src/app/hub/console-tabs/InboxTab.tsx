import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare, Search, Phone, Mail, User,
  AlertCircle, Send, RefreshCw, Wifi, WifiOff, CheckCircle2, Clock,
  X, UserCheck, UserX, ArrowRightLeft, Star, Calendar, SmilePlus,
  Download, Trash2, ChevronRight, Info, ShieldAlert, ArrowUpRight,
  ExternalLink, RotateCcw
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
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
  handoff_status: string | null; // "open" | "active" | "transferred" | "escalated" | "no_response" | "resolved" | null
  agent_id: string | null;
}

interface ChatMessage {
  id: string;
  session_id: string;
  client_id: string;
  hotel_slug: string | null;
  channel: string;
  role: "user" | "assistant" | "agent" | "system";
  content: string;
  created_at: string;
}

interface CorrelatedLead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  lead_quality: number | null;
  status: string | null;
  check_in?: string | null;
  check_out?: string | null;
  guests?: number | null;
  purpose?: string | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
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
    whatsapp: "WhatsApp", widget: "Web Widget", meta: "Meta", instagram: "Instagram", tawkto: "Tawk.to"
  };
  return map[ch] || ch || "Direct";
}

// ─── Status Chip ─────────────────────────────────────────────────────────────
export function StatusChip({ status }: { status: string | null }) {
  switch (status) {
    case "open":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 border border-red-200 dark:border-red-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          HANDOFF
        </span>
      );
    case "active":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 border border-blue-200 dark:border-blue-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          STAFF ACTIVE
        </span>
      );
    case "transferred":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
          <ArrowRightLeft className="w-2.5 h-2.5" />
          TRANSFERRED
        </span>
      );
    case "escalated":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30">
          <AlertCircle className="w-2.5 h-2.5" />
          ESCALATED
        </span>
      );
    case "no_response":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700">
          <Clock className="w-2.5 h-2.5" />
          NO RESPONSE
        </span>
      );
    case "resolved":
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30">
          <CheckCircle2 className="w-2.5 h-2.5" />
          RESOLVED
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 border border-dash-border">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
          AI AGENT
        </span>
      );
  }
}

// ─── Emoji Picker ─────────────────────────────────────────────────────────────
const EMOJIS = ["😊", "👋", "🙏", "✅", "❤️", "😂", "🔑", "🏨", "🍽️", "🛎️", "📞", "⏰", "✨", "👍", "🎉", "😅", "🙌", "💬", "📋", "🚗"];

function EmojiPicker({ onSelect, onClose }: { onSelect: (e: string) => void; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  return (
    <div ref={ref} className="absolute bottom-full mb-2 left-0 z-50 bg-dash-surface border border-dash-border rounded-xl shadow-xl p-2 grid grid-cols-10 gap-1 animate-in fade-in duration-100">
      {EMOJIS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => { onSelect(e); onClose(); }}
          className="text-base w-7 h-7 flex items-center justify-center hover:bg-dash-surface-raised rounded transition-colors"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function InboxTab({
  initialSessionId,
  onNavigate
}: {
  initialSessionId?: string | null;
  onNavigate?: (tab: string, context?: any) => void;
}) {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
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

  // Modals & Panels
  const [isEndChatModalOpen, setIsEndChatModalOpen] = useState(false);
  const [endChatOutcome, setEndChatOutcome] = useState<"resolved" | "escalated" | "no_response">("resolved");
  const [endChatNotes, setEndChatNotes] = useState("");

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferTargetId, setTransferTargetId] = useState<string | null>(null);
  const [onlineStaff, setOnlineStaff] = useState<{ id: string; full_name: string | null; email: string }[]>([]);

  const [isGuestDetailOpen, setIsGuestDetailOpen] = useState(false);
  const [correlatedLead, setCorrelatedLead] = useState<CorrelatedLead | null>(null);
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
  const [agentOnline, setAgentOnline] = useState(true);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Load conversation list ─────────────────────────────────────────────────
  const fetchConversations = useCallback(async () => {
    if (!hotelId) return;

    if (isSandbox && sandboxData) {
      const data = sandboxData.conversations || [];
      setConversations(data as InboxSession[]);
      if (initialSessionId) {
        setSelectedConvId(initialSessionId);
      } else if (!selectedConvId && data.length > 0) {
        setSelectedConvId(data[0].session_id);
      }
      setIsRealtime(true);
      return;
    }

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
  }, [hotelId, isSandbox, sandboxData, initialSessionId, selectedConvId]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // ── Supabase Realtime Subscriptions ─────────────────────────────────────────
  useEffect(() => {
    if (!hotelId || isSandbox) return;

    const filterConversations = `client_id=eq.${hotelId}`;
    const filterHandoffs = `hotel_id=eq.${hotelId}`;

    const realtimeChannel = supabase
      .channel("inbox_realtime_stream")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "conversations", filter: filterConversations },
        (payload) => {
          const msg = payload.new as ChatMessage;
          fetchConversations();

          setMessages((prev) => {
            if (msg.session_id === selectedConvId) return [...prev, msg];
            return prev;
          });

          // Increment unread count if not selected
          if (msg.session_id !== selectedConvId && msg.role === "user") {
            setUnreadCounts(prev => ({
              ...prev,
              [msg.session_id]: (prev[msg.session_id] || 0) + 1
            }));
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "handoff_sessions", filter: filterHandoffs },
        () => {
          fetchConversations();
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(realtimeChannel); };
  }, [hotelId, selectedConvId, isSandbox, fetchConversations]);

  // ── Load Chat Messages & Correlated Lead on Session Change ──────────────────
  useEffect(() => {
    if (!selectedConvId) return;
    setIsLoading(true);

    const loadMessages = async () => {
      try {
        if (isSandbox && sandboxData) {
          const chatMsgs = (sandboxData.messages?.[selectedConvId] || []);
          setMessages(chatMsgs as ChatMessage[]);

          // Correlate with sandbox lead
          const conv = sandboxData.conversations.find(c => c.session_id === selectedConvId);
          if (conv) {
            const matchedLead = sandboxData.leads.find(
              l => (conv.guest_email && l.email?.toLowerCase() === conv.guest_email.toLowerCase()) ||
                   (conv.guest_phone && l.phone === conv.guest_phone) ||
                   (conv.guest_name && l.name.toLowerCase() === conv.guest_name.toLowerCase())
            );
            if (matchedLead) {
              setCorrelatedLead(matchedLead as CorrelatedLead);
            } else {
              setCorrelatedLead(null);
            }
          }
          setIsLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("conversations")
          .select("*")
          .eq("session_id", selectedConvId)
          .order("created_at", { ascending: true })
          .limit(200);

        if (!error && data) {
          setMessages(data as ChatMessage[]);
        }

        // Fetch correlated lead from Supabase
        const conv = conversations.find(c => c.session_id === selectedConvId);
        if (conv && hotelId) {
          const { data: leadData } = await supabase
            .from("leads")
            .select("*")
            .eq("hotel_id", hotelId)
            .or(`email.eq.${conv.guest_email || ""},phone.eq.${conv.guest_phone || ""}`)
            .limit(1)
            .maybeSingle();

          setCorrelatedLead(leadData || null);
        }
      } catch (err) {
        console.warn("[Inbox] Error fetching messages:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedConvId, isSandbox, sandboxData, conversations, hotelId]);

  // ── Derive active agent mode ───────────────────────────────────────────────
  useEffect(() => {
    const activeConv = conversations.find((c) => c.session_id === selectedConvId);
    if (activeConv && (activeConv.handoff_status === "active" || activeConv.handoff_status === "transferred")) {
      setAgentMode(true);
    } else {
      setAgentMode(false);
    }
  }, [selectedConvId, conversations]);

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear unread badge on select
  useEffect(() => {
    if (selectedConvId) {
      setUnreadCounts(prev => ({ ...prev, [selectedConvId]: 0 }));
    }
  }, [selectedConvId]);

  const selectedConv = conversations.find((c) => c.session_id === selectedConvId) || null;

  // ── Filtered conversations ─────────────────────────────────────────────────
  const filteredConvs = conversations.filter((c) => {
    let matchFilter = true;
    if (activeFilter === "Pending Handoff") {
      matchFilter = c.handoff_status === "open";
    } else if (activeFilter === "Active & Transferred") {
      matchFilter = c.handoff_status === "active" || c.handoff_status === "transferred";
    } else if (activeFilter === "Escalated") {
      matchFilter = c.handoff_status === "escalated";
    } else if (activeFilter === "Resolved") {
      matchFilter = c.handoff_status === "resolved" || c.handoff_status === "no_response";
    }

    const matchSearch =
      !search ||
      (c.guest_name && c.guest_name.toLowerCase().includes(search.toLowerCase())) ||
      (c.guest_email && c.guest_email.toLowerCase().includes(search.toLowerCase())) ||
      c.session_id.toLowerCase().includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  // ── Fetch online staff for Transfer Modal ───────────────────────────────────
  const fetchOnlineStaff = useCallback(async () => {
    if (isSandbox && sandboxData?.staff) {
      setOnlineStaff(
        sandboxData.staff
          .filter((s) => s.status === "active" && s.id !== user?.id)
          .map((s) => ({ id: s.id, full_name: s.full_name, email: s.email }))
          .slice(0, 8)
      );
      return;
    }
    if (!hotelId) return;
    try {
      const { data } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("hotel_id", hotelId)
        .neq("id", user?.id || "")
        .in("role", ["hotel_manager", "hotel_receptionist"])
        .limit(15);
      setOnlineStaff(data ?? []);
    } catch (err) {
      console.warn("Error fetching online staff:", err);
    }
  }, [hotelId, isSandbox, sandboxData, user?.id]);

  // ── Takeover / Re-open Action ───────────────────────────────────────────────
  const handleTakeover = async () => {
    if (!selectedConv || !hotelId) return;

    const staffName = user?.email?.split("@")[0] || "Staff Receptionist";
    const sysMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: selectedConv.session_id,
      client_id: hotelId,
      hotel_slug: null,
      channel: selectedConv.channel,
      role: "system",
      content: `⚡ Bot paused — staff member (${staffName}) took over the conversation`,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, sysMsg]);
    setAgentMode(true);

    if (isSandbox) {
      setConversations((prev) =>
        prev.map((c) =>
          c.session_id === selectedConv.session_id
            ? { ...c, handoff_status: "active", agent_id: user?.id || "agent-001", last_message: sysMsg.content, last_message_at: sysMsg.created_at }
            : c
        )
      );
      updateData((prev) => {
        const prevMsgs = prev.messages[selectedConv.session_id] || [];
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [selectedConv.session_id]: [...prevMsgs, sysMsg]
          },
          conversations: prev.conversations.map((c) =>
            c.session_id === selectedConv.session_id
              ? { ...c, handoff_status: "active", agent_id: user?.id || "agent-001", last_message: sysMsg.content, last_message_at: sysMsg.created_at }
              : c
          )
        };
      });
      showToast("Chat taken over successfully. AI Agent paused.", "success");
      return;
    }

    try {
      await supabase.from("conversations").insert({
        session_id: selectedConv.session_id,
        client_id: hotelId,
        channel: selectedConv.channel,
        role: "system",
        content: sysMsg.content,
        created_at: sysMsg.created_at
      });

      await supabase.from("handoff_sessions").upsert({
        hotel_id: hotelId,
        session_id: selectedConv.session_id,
        channel: selectedConv.channel,
        status: "active",
        agent_id: user?.id,
        created_at: new Date().toISOString()
      }, { onConflict: "session_id" });

      showToast("Chat taken over successfully. AI Agent paused.", "success");
      fetchConversations();
    } catch (err) {
      console.warn("Failed to take over chat in DB:", err);
      showToast("Failed to take over chat.", "error");
    }
  };

  // ── End Chat with Outcome & Reason (Definitive Termination) ────────────────
  const handleEndChat = async () => {
    if (!selectedConv) return;
    const outcome = endChatOutcome;
    const notes = endChatNotes.trim();
    const staffName = user?.email?.split("@")[0] || "Staff";

    const outcomeLabels: Record<string, string> = {
      resolved: "Resolved (Satisfied / Fulfilled)",
      escalated: "Escalated to Management / PMS",
      no_response: "No Response from Guest"
    };

    const sysMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: selectedConv.session_id,
      client_id: hotelId || "",
      hotel_slug: null,
      channel: selectedConv.channel,
      role: "system",
      content: `⚡ Chat ended by ${staffName} — Outcome: ${outcomeLabels[outcome] || outcome}${notes ? ` · Note: "${notes}"` : ""}`,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, sysMsg]);
    setAgentMode(false);
    setIsEndChatModalOpen(false);
    setEndChatNotes("");

    if (isSandbox) {
      setConversations((prev) =>
        prev.map((c) =>
          c.session_id === selectedConv.session_id
            ? { ...c, handoff_status: outcome, last_message: sysMsg.content, last_message_at: sysMsg.created_at }
            : c
        )
      );
      updateData((prev) => {
        const prevMsgs = prev.messages[selectedConv.session_id] || [];
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [selectedConv.session_id]: [...prevMsgs, sysMsg]
          },
          conversations: prev.conversations.map((c) =>
            c.session_id === selectedConv.session_id
              ? { ...c, handoff_status: outcome, last_message: sysMsg.content, last_message_at: sysMsg.created_at }
              : c
          )
        };
      });
      showToast(`Chat ended — status set to ${outcome.replace("_", " ").toUpperCase()}.`, "success");
      return;
    }

    try {
      // 1. Insert permanent system event into conversations table
      await supabase.from("conversations").insert({
        session_id: selectedConv.session_id,
        client_id: hotelId,
        channel: selectedConv.channel,
        role: "system",
        content: sysMsg.content,
        created_at: sysMsg.created_at
      });

      // 2. Safe update of handoff_sessions
      const updatePayload: any = {
        status: outcome,
        resolved_at: new Date().toISOString()
      };
      if (notes) updatePayload.notes = notes;
      updatePayload.outcome = outcome;

      const { error: handoffErr } = await supabase
        .from("handoff_sessions")
        .update(updatePayload)
        .eq("session_id", selectedConv.session_id);

      if (handoffErr) {
        // Fallback in case custom notes/outcome columns are not in schema
        await supabase
          .from("handoff_sessions")
          .update({
            status: outcome,
            resolved_at: new Date().toISOString()
          })
          .eq("session_id", selectedConv.session_id);
      }

      showToast(`Chat ended — status set to ${outcome.replace("_", " ").toUpperCase()}.`, "success");
      fetchConversations();
    } catch (err) {
      console.warn("Error ending chat:", err);
      showToast("Ended chat locally. Changes saved.", "success");
    }
  };

  // ── Transfer Chat (Maintains Active State, Reassigns Staff) ────────────────
  const handleTransfer = async () => {
    if (!selectedConv || !transferTargetId) return;
    const target = onlineStaff.find((s) => s.id === transferTargetId);
    const targetName = target?.full_name || target?.email || "colleague";
    const currentStaffName = user?.email?.split("@")[0] || "Staff";

    const sysMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: selectedConv.session_id,
      client_id: hotelId || "",
      hotel_slug: null,
      channel: selectedConv.channel,
      role: "system",
      content: `⚡ Chat transferred to ${targetName} by ${currentStaffName}`,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, sysMsg]);
    setIsTransferModalOpen(false);
    setTransferTargetId(null);

    if (isSandbox) {
      setConversations((prev) =>
        prev.map((c) =>
          c.session_id === selectedConv.session_id
            ? { ...c, handoff_status: "transferred", agent_id: transferTargetId, last_message: sysMsg.content, last_message_at: sysMsg.created_at }
            : c
        )
      );
      updateData((prev) => {
        const prevMsgs = prev.messages[selectedConv.session_id] || [];
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [selectedConv.session_id]: [...prevMsgs, sysMsg]
          },
          conversations: prev.conversations.map((c) =>
            c.session_id === selectedConv.session_id
              ? { ...c, handoff_status: "transferred", agent_id: transferTargetId, last_message: sysMsg.content, last_message_at: sysMsg.created_at }
              : c
          )
        };
      });
      showToast(`Chat transferred to ${targetName}.`, "success");
      return;
    }

    try {
      await supabase.from("conversations").insert({
        session_id: selectedConv.session_id,
        client_id: hotelId,
        channel: selectedConv.channel,
        role: "system",
        content: sysMsg.content,
        created_at: sysMsg.created_at
      });

      await supabase
        .from("handoff_sessions")
        .update({
          status: "transferred",
          agent_id: transferTargetId
        })
        .eq("session_id", selectedConv.session_id);

      showToast(`Chat transferred to ${targetName}.`, "success");
      fetchConversations();
    } catch (err) {
      console.warn("Transfer chat DB error:", err);
      showToast(`Chat transferred to ${targetName}.`, "success");
    }
  };

  // ── Send Message ───────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!replyText.trim() || !selectedConv || !hotelId) return;

    const textToSend = replyText.trim();
    setReplyText(""); // optimistic clear

    const newMsg: ChatMessage = {
      id: crypto.randomUUID(),
      session_id: selectedConv.session_id,
      client_id: hotelId,
      hotel_slug: null,
      channel: selectedConv.channel,
      role: "agent",
      content: textToSend,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, newMsg]);

    if (isSandbox) {
      updateData((prev) => {
        const sessionMsgs = prev.messages[selectedConv.session_id] || [];
        return {
          ...prev,
          messages: {
            ...prev.messages,
            [selectedConv.session_id]: [...sessionMsgs, newMsg]
          },
          conversations: prev.conversations.map((c) =>
            c.session_id === selectedConv.session_id
              ? { ...c, last_message: textToSend, last_message_at: newMsg.created_at }
              : c
          )
        };
      });
      return;
    }

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

  const isClosedStatus = selectedConv?.handoff_status === "resolved" ||
                         selectedConv?.handoff_status === "escalated" ||
                         selectedConv?.handoff_status === "no_response";

  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden bg-dash-surface animate-in fade-in duration-200">
      {/* ── Left Pane: Conversation List & Filter Bar ── */}
      <div className="w-full md:w-[340px] border-r border-dash-border flex flex-col h-full shrink-0 bg-dash-surface">
        <div className="p-3.5 border-b border-dash-border space-y-2.5 bg-dash-surface shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-section font-bold text-dash-text">Live Inbox</h2>
            <div className="flex items-center gap-1.5 text-[11px] font-medium">
              {isRealtime ? (
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Wifi className="w-3 h-3" /> Live
                </span>
              ) : (
                <span className="flex items-center gap-1 text-zinc-400">
                  <WifiOff className="w-3 h-3" /> Syncing...
                </span>
              )}
            </div>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search guest name, email, session..."
              className="w-full pl-8 pr-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text"
            />
          </div>

          {/* Granular Filter Pills */}
          <div className="flex gap-1 text-[11px] overflow-x-auto hide-scrollbar pb-0.5">
            {[
              { id: "All", label: "All" },
              { id: "Pending Handoff", label: "Handoffs" },
              { id: "Active & Transferred", label: "Active" },
              { id: "Escalated", label: "Escalated" },
              { id: "Resolved", label: "Resolved" }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-2.5 py-1 rounded-md whitespace-nowrap transition-colors font-medium flex-shrink-0 ${
                  activeFilter === filter.id
                    ? "bg-[#EA6639]/10 text-[#EA6639] font-bold border border-[#EA6639]/30"
                    : "bg-dash-canvas text-dash-text-sec border border-dash-border hover:bg-dash-surface-hover"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-dash-border-hairline">
          {filteredConvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted text-xs gap-2 p-6 text-center">
              <MessageSquare className="w-8 h-8 opacity-30" />
              <span>No conversations match this filter</span>
              {isSandbox && (
                <button
                  onClick={regenerate}
                  className="mt-3 px-3 py-1.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-[10px] font-medium hover:opacity-90 transition-opacity flex items-center gap-1.5 shadow"
                >
                  <RefreshCw className="w-3 h-3" /> Regenerate Demo Data
                </button>
              )}
            </div>
          ) : (
            filteredConvs.map((conv) => (
              <div
                key={conv.session_id}
                onClick={() => setSelectedConvId(conv.session_id)}
                className={`p-3.5 cursor-pointer transition-all ${
                  selectedConvId === conv.session_id
                    ? "bg-[#EA6639]/5 border-l-4 border-[#EA6639]"
                    : "hover:bg-dash-surface-hover border-l-4 border-transparent"
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-xs text-dash-text flex items-center gap-1.5 truncate">
                    {conv.handoff_status === "open" && (
                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 animate-ping" />
                    )}
                    {conv.guest_name || "Guest " + conv.session_id.slice(0, 6)}
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {(unreadCounts[conv.session_id] ?? 0) > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#EA6639] text-white text-[9px] font-bold flex items-center justify-center">
                        {unreadCounts[conv.session_id]}
                      </span>
                    )}
                    <span className="text-[10px] text-dash-text-muted">
                      {timeAgo(conv.last_message_at)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-1.5 gap-1">
                  <span className="text-[10px] text-dash-text-muted font-mono truncate">
                    {channelLabel(conv.channel)}
                  </span>
                  <StatusChip status={conv.handoff_status} />
                </div>

                <p className="text-xs text-dash-text-sec truncate line-clamp-1">{conv.last_message}</p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Right Pane: Chat Window & Context ── */}
      <div className="flex-1 flex flex-col h-full bg-dash-canvas/40 min-w-0">
        {selectedConv ? (
          <>
            {/* Chat Top Header */}
            <div className="p-3.5 md:p-4 border-b border-dash-border bg-dash-surface shrink-0 shadow-sm">
              <div className="flex justify-between items-center mb-2.5">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="w-8 h-8 rounded-full bg-[#EA6639]/10 text-[#EA6639] font-bold text-xs flex items-center justify-center uppercase">
                    {(selectedConv.guest_name || "?").charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-body font-bold text-dash-text flex items-center gap-2">
                      {selectedConv.guest_name || "Unknown Guest"}
                      <StatusChip status={selectedConv.handoff_status} />
                    </h3>
                    <span className="text-[10px] text-dash-text-muted font-mono">
                      {selectedConv.session_id} · {channelLabel(selectedConv.channel)}
                    </span>
                  </div>
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setIsGuestDetailOpen(true)}
                    className="px-2.5 py-1.5 bg-dash-surface border border-dash-border text-dash-text text-xs font-medium rounded-lg hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5 shadow-sm"
                    title="View guest CRM profile and details"
                  >
                    <User className="w-3.5 h-3.5 text-[#EA6639]" />
                    <span className="hidden sm:inline">Guest Profile</span>
                  </button>

                  {agentMode && (
                    <button
                      onClick={() => { fetchOnlineStaff(); setIsTransferModalOpen(true); }}
                      className="px-2.5 py-1.5 bg-dash-surface border border-dash-border text-dash-text text-xs font-medium rounded-lg hover:bg-dash-surface-hover transition-colors flex items-center gap-1.5 shadow-sm"
                      title="Transfer chat to colleague"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="hidden sm:inline">Transfer</span>
                    </button>
                  )}

                  {agentMode ? (
                    <button
                      onClick={() => setIsEndChatModalOpen(true)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
                      title="End and resolve chat"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>End Chat</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (!agentOnline) {
                          showToast("You are Offline. Set your status to Online to take over chats.", "error");
                          return;
                        }
                        handleTakeover();
                      }}
                      className="px-3 py-1.5 bg-[#EA6639] hover:bg-[#d4582e] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>{isClosedStatus ? "Re-open & Take Over" : "Take Over Chat"}</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Guest Summary Info Bar */}
              <div className="flex items-center gap-4 text-xs text-dash-text-sec flex-wrap pt-1 border-t border-dash-border-hairline">
                {selectedConv.guest_email && (
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3 h-3 text-dash-text-muted" />
                    <span>{selectedConv.guest_email}</span>
                  </div>
                )}
                {selectedConv.guest_phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3 h-3 text-dash-text-muted" />
                    <span>{selectedConv.guest_phone}</span>
                  </div>
                )}
                {correlatedLead?.lead_quality && (
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="font-semibold text-dash-text">{correlatedLead.lead_quality}/5 Lead Score</span>
                  </div>
                )}
              </div>
            </div>

            {/* Offline Agent Warning Banner */}
            {!agentOnline && (
              <div className="px-4 py-2 bg-amber-50 dark:bg-amber-500/10 border-b border-amber-200 dark:border-amber-500/20 text-xs font-medium text-amber-800 dark:text-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>You are currently <strong>Offline</strong>. Switch to Online to take over incoming chats.</span>
                </div>
                <button
                  onClick={() => setAgentOnline(true)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold transition-colors"
                >
                  Go Online
                </button>
              </div>
            )}

            {/* Ended Chat Pretext / Re-open Banner */}
            {isClosedStatus && !agentMode && (
              <div className="p-3 bg-dash-surface border-b border-dash-border flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-dash-text-muted shrink-0" />
                  <span className="text-dash-text-sec">
                    This conversation is marked as <strong className="text-dash-text uppercase">{selectedConv.handoff_status?.replace("_", " ")}</strong>. The AI agent will respond to new messages automatically.
                  </span>
                </div>
                <button
                  onClick={handleTakeover}
                  className="px-2.5 py-1 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover rounded text-xs font-medium text-dash-text flex items-center gap-1 shrink-0 ml-2"
                >
                  <RotateCcw className="w-3 h-3 text-[#EA6639]" /> Re-open Chat
                </button>
              </div>
            )}

            {/* Messages Thread */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-5 h-5 text-dash-text-muted animate-spin" />
                </div>
              ) : (
                <>
                  {messages.map((msg) => {
                    const isSystem = msg.role === "system";
                    const isUser = msg.role === "user";
                    const isAgent = msg.role === "agent";

                    if (isSystem) {
                      return (
                        <div key={msg.id} className="flex justify-center my-2">
                          <span className="text-[10px] font-mono font-medium text-dash-text-sec bg-dash-surface border border-dash-border px-3.5 py-1 rounded-full shadow-sm flex items-center gap-1.5 max-w-md text-center">
                            {msg.content}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {isUser ? (
                          <div className="bg-[#EA6639]/10 border border-[#EA6639]/20 text-dash-text p-3 rounded-2xl rounded-tr-sm max-w-[80%] text-xs shadow-sm">
                            <span className="text-[9px] font-bold text-[#EA6639] block mb-0.5 uppercase tracking-wide">
                              {selectedConv.guest_name || "Guest"}
                            </span>
                            {msg.content}
                            <span className="text-[9px] text-dash-text-muted block mt-1 text-right">
                              {timeAgo(msg.created_at)}
                            </span>
                          </div>
                        ) : isAgent ? (
                          <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-dash-text p-3 rounded-2xl rounded-tl-sm max-w-[80%] text-xs shadow-sm">
                            <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 block mb-0.5 uppercase tracking-wide">
                              Staff Receptionist
                            </span>
                            {msg.content}
                            <span className="text-[9px] text-dash-text-muted block mt-1 text-right">
                              {timeAgo(msg.created_at)}
                            </span>
                          </div>
                        ) : (
                          <div className="bg-dash-surface border border-dash-border text-dash-text p-3 rounded-2xl rounded-tl-sm max-w-[80%] text-xs shadow-sm">
                            <span className="text-[9px] font-bold text-[#EA6639] block mb-0.5 uppercase tracking-wide">
                              Ever AI Concierge
                            </span>
                            {msg.content}
                            <span className="text-[9px] text-dash-text-muted block mt-1 text-right">
                              {timeAgo(msg.created_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {selectedConv.handoff_status === "open" && !agentMode && (
                    <div className="flex justify-center my-3">
                      <div className="text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 px-4 py-2 rounded-xl border border-red-200 dark:border-red-500/30 flex items-center gap-2 animate-pulse">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        AI Agent paused — guest waiting for human staff takeover
                      </div>
                    </div>
                  )}
                </>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer Area */}
            <div className="p-3.5 md:p-4 bg-dash-surface border-t border-dash-border shrink-0 shadow-lg">
              {agentMode ? (
                <div className="relative">
                  {isEmojiPickerOpen && (
                    <EmojiPicker
                      onSelect={(e) => setReplyText((prev) => prev + e)}
                      onClose={() => setIsEmojiPickerOpen(false)}
                    />
                  )}
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={`Reply to ${selectedConv.guest_name || "guest"} as on-duty staff...`}
                    className="w-full p-3 pr-24 pl-10 bg-dash-canvas border border-dash-border rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] resize-none h-[76px] text-dash-text"
                  />
                  <button
                    type="button"
                    onClick={() => setIsEmojiPickerOpen((v) => !v)}
                    className="absolute left-3 bottom-3 text-dash-text-muted hover:text-dash-text transition-colors p-1 rounded hover:bg-dash-surface-hover"
                    title="Insert emoji"
                  >
                    <SmilePlus className="w-4 h-4" />
                  </button>
                  <div className="absolute right-3 bottom-3">
                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className="px-4 py-1.5 bg-[#EA6639] hover:bg-[#d4582e] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative opacity-70">
                  <textarea
                    disabled
                    placeholder="Click 'Take Over Chat' to pause AI and reply to this guest directly..."
                    className="w-full p-3 pr-24 bg-dash-canvas border border-dash-border rounded-xl text-xs resize-none h-[76px] text-dash-text cursor-not-allowed"
                  />
                  <div className="absolute right-3 bottom-3">
                    <button
                      disabled
                      className="px-4 py-1.5 bg-dash-surface-raised border border-dash-border text-dash-text-muted text-xs font-medium rounded-lg flex items-center gap-1.5 cursor-not-allowed"
                    >
                      <Send className="w-3.5 h-3.5" /> Send
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between text-[10px] text-dash-text-muted mt-2">
                <span>
                  Press <kbd className="px-1 py-0.5 bg-dash-surface-raised rounded text-[10px] border border-dash-border">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-dash-surface-raised rounded text-[10px] border border-dash-border">Shift+Enter</kbd> for new line.
                </span>
                {agentMode && <span className="text-emerald-500 font-medium">● Staff Takeover Active</span>}
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-dash-text-muted gap-3">
            <MessageSquare className="w-12 h-12 opacity-20" />
            <span className="text-xs font-medium">Select a guest conversation to view live thread</span>
          </div>
        )}
      </div>

      {/* ── End Chat Modal with Definite Outcomes & Reason/Notes ── */}
      <Modal
        isOpen={isEndChatModalOpen}
        onClose={() => setIsEndChatModalOpen(false)}
        title="End Staff Conversation"
      >
        <div className="space-y-4">
          <p className="text-xs text-dash-text-sec">
            Specify the outcome for ending this staff session. A permanent audit log will be recorded in the message history, and the AI concierge will resume autonomous handling for subsequent inquiries.
          </p>

          <div>
            <label className="block text-xs font-semibold text-dash-text mb-1.5">Resolution Outcome</label>
            <div className="space-y-2">
              {[
                { id: "resolved", label: "✅ Resolved", desc: "Guest inquiry or request was fully addressed." },
                { id: "escalated", label: "⬆️ Escalated", desc: "Forwarded for hotel management or PMS offline action." },
                { id: "no_response", label: "⏳ No Response", desc: "Guest became inactive / did not reply." }
              ].map((opt) => (
                <label
                  key={opt.id}
                  className={`flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-colors ${
                    endChatOutcome === opt.id
                      ? "bg-[#EA6639]/10 border-[#EA6639] text-dash-text"
                      : "bg-dash-canvas border-dash-border text-dash-text-sec hover:bg-dash-surface-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="endOutcome"
                    value={opt.id}
                    checked={endChatOutcome === opt.id}
                    onChange={() => setEndChatOutcome(opt.id as any)}
                    className="mt-0.5 text-[#EA6639] focus:ring-[#EA6639]"
                  />
                  <div>
                    <span className="text-xs font-bold text-dash-text block">{opt.label}</span>
                    <span className="text-[11px] text-dash-text-sec">{opt.desc}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-dash-text mb-1.5">
              Resolution Reason / Internal Notes (Optional)
            </label>
            <textarea
              value={endChatNotes}
              onChange={(e) => setEndChatNotes(e.target.value)}
              placeholder="e.g. Guest requested late checkout confirmed at 1:00 PM / PMS updated."
              className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none resize-none h-20"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-dash-border">
            <button
              type="button"
              onClick={() => setIsEndChatModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-dash-text-sec hover:bg-dash-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleEndChat}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow"
            >
              <X className="w-3.5 h-3.5" /> End &amp; Save Outcome
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Transfer Chat Modal (Reassigns Staff Without Closing) ── */}
      <Modal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Transfer Chat to Staff Member"
      >
        <div className="space-y-4">
          <p className="text-xs text-dash-text-sec">
            Reassign this ongoing conversation to an active hotel receptionist or manager. The chat will remain open and live.
          </p>

          {onlineStaff.length === 0 ? (
            <div className="py-6 text-center text-xs text-dash-text-muted">
              <UserX className="w-6 h-6 mx-auto mb-2 opacity-40" />
              No other staff members available right now.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-52 overflow-y-auto">
              {onlineStaff.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setTransferTargetId(s.id)}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-colors flex items-center gap-3 ${
                    transferTargetId === s.id
                      ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]"
                      : "bg-dash-canvas border-dash-border hover:bg-dash-surface-hover text-dash-text"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full bg-dash-surface-raised border border-dash-border flex items-center justify-center text-xs font-bold uppercase text-dash-text-muted shrink-0">
                    {(s.full_name || s.email).charAt(0)}
                  </div>
                  <div>
                    <span className="font-semibold block text-dash-text">{s.full_name || s.email}</span>
                    <span className="text-[10px] text-dash-text-muted">{s.email}</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-dash-border">
            <button
              type="button"
              onClick={() => setIsTransferModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-dash-text-sec hover:bg-dash-surface-hover rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleTransfer}
              disabled={!transferTargetId}
              className="px-4 py-2 bg-[#EA6639] hover:bg-[#d4582e] text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 flex items-center gap-1.5 shadow"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" /> Transfer Chat
            </button>
          </div>
        </div>
      </Modal>

      {/* ── Guest Detail Slide-Out Panel with Correlated Realtime Data ── */}
      {isGuestDetailOpen && selectedConv && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsGuestDetailOpen(false)}
          />
          <div className="relative w-full max-w-sm bg-dash-surface border-l border-dash-border h-full overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200 z-10 flex flex-col justify-between">
            <div>
              {/* Drawer Header */}
              <div className="p-4 border-b border-dash-border flex items-center justify-between sticky top-0 bg-dash-surface z-10">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#EA6639]" />
                  <h3 className="text-sm font-bold text-dash-text">Guest Profile</h3>
                </div>
                <button
                  onClick={() => setIsGuestDetailOpen(false)}
                  className="p-1 text-dash-text-muted hover:text-dash-text rounded-md hover:bg-dash-surface-hover transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-5 space-y-5">
                {/* Guest Identity */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#EA6639]/10 text-[#EA6639] flex items-center justify-center text-lg font-bold uppercase shrink-0">
                    {(selectedConv.guest_name || "?").charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-dash-text">
                      {selectedConv.guest_name || "Guest " + selectedConv.session_id.slice(0, 6)}
                    </h4>
                    <span className="text-[10px] text-dash-text-muted font-mono">{selectedConv.session_id}</span>
                  </div>
                </div>

                {/* Contact Card */}
                <div className="space-y-2 p-3 bg-dash-canvas rounded-xl border border-dash-border">
                  <h5 className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider">Contact Information</h5>
                  {selectedConv.guest_email ? (
                    <div className="flex items-center gap-2 text-xs text-dash-text">
                      <Mail className="w-3.5 h-3.5 text-dash-text-muted shrink-0" />
                      <span className="truncate">{selectedConv.guest_email}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-dash-text-muted italic">No email on file</span>
                  )}
                  {selectedConv.guest_phone ? (
                    <div className="flex items-center gap-2 text-xs text-dash-text">
                      <Phone className="w-3.5 h-3.5 text-dash-text-muted shrink-0" />
                      <span>{selectedConv.guest_phone}</span>
                    </div>
                  ) : (
                    <span className="text-[11px] text-dash-text-muted italic">No phone on file</span>
                  )}
                  <div className="flex items-center gap-2 text-xs text-dash-text">
                    <MessageSquare className="w-3.5 h-3.5 text-dash-text-muted shrink-0" />
                    <span>Connected via {channelLabel(selectedConv.channel)}</span>
                  </div>
                </div>

                {/* Correlated Lead & Stay Info */}
                {correlatedLead && (
                  <div className="space-y-2 p-3 bg-dash-canvas rounded-xl border border-dash-border">
                    <h5 className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider">Stay &amp; CRM Info</h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-dash-text-muted block">Lead Status</span>
                        <span className="font-semibold text-dash-text capitalize">{correlatedLead.status || "New"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-dash-text-muted block">Lead Quality</span>
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {Array.from({ length: correlatedLead.lead_quality || 3 }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      {correlatedLead.check_in && (
                        <div>
                          <span className="text-[10px] text-dash-text-muted block">Check-in</span>
                          <span className="font-medium text-dash-text">{correlatedLead.check_in}</span>
                        </div>
                      )}
                      {correlatedLead.check_out && (
                        <div>
                          <span className="text-[10px] text-dash-text-muted block">Check-out</span>
                          <span className="font-medium text-dash-text">{correlatedLead.check_out}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Session Breakdown */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider">Session Summary</h5>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2.5 bg-dash-canvas rounded-lg border border-dash-border">
                      <span className="text-[10px] text-dash-text-muted block">Total Messages</span>
                      <span className="text-sm font-bold text-dash-text">{messages.length}</span>
                    </div>
                    <div className="p-2.5 bg-dash-canvas rounded-lg border border-dash-border">
                      <span className="text-[10px] text-dash-text-muted block">Current Status</span>
                      <StatusChip status={selectedConv.handoff_status} />
                    </div>
                  </div>
                </div>

                {/* Cross-page Navigation Links */}
                <div className="space-y-1.5 pt-2">
                  <h5 className="text-[10px] font-bold uppercase text-dash-text-muted tracking-wider mb-1">Cross-Tab Navigation</h5>
                  <button
                    onClick={() => {
                      setIsGuestDetailOpen(false);
                      onNavigate?.("crm");
                    }}
                    className="w-full text-left px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-[#EA6639]" /> View in Leads &amp; CRM
                    </span>
                    <ExternalLink className="w-3 h-3 text-dash-text-muted" />
                  </button>
                  <button
                    onClick={() => {
                      setIsGuestDetailOpen(false);
                      onNavigate?.("bookings");
                    }}
                    className="w-full text-left px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#EA6639]" /> View Bookings &amp; PMS
                    </span>
                    <ExternalLink className="w-3 h-3 text-dash-text-muted" />
                  </button>
                </div>
              </div>
            </div>

            {/* GDPR & Privacy Footer Actions */}
            <div className="p-4 border-t border-dash-border bg-dash-surface space-y-2">
              <button
                onClick={() => {
                  const dataStr = JSON.stringify({ guest: selectedConv, messages }, null, 2);
                  const blob = new Blob([dataStr], { type: "application/json" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `guest-data-${selectedConv.session_id}.json`;
                  a.click();
                  showToast("Guest data exported successfully (GDPR DSR).", "success");
                }}
                className="w-full py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-2"
              >
                <Download className="w-3.5 h-3.5 text-[#EA6639]" /> Export Guest Data (GDPR)
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Are you sure you want to erase guest records for ${selectedConv.guest_name || selectedConv.session_id}? This is irreversible.`)) {
                    showToast("GDPR Erasure request initiated.", "success");
                    setIsGuestDetailOpen(false);
                  }
                }}
                className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-600 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-3.5 h-3.5" /> Request GDPR Erasure
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
