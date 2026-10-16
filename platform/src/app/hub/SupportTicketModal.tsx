import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  LifeBuoy, 
  X, 
  Plus, 
  MessageSquare, 
  Send, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Headphones, 
  Sparkles, 
  Wrench, 
  ArrowLeft, 
  Loader2,
  Check,
  ChevronRight,
  Filter
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useSandbox } from "../../context/SandboxDataContext";
import { useToast } from "../../shared/ToastContext";

export interface SupportTicket {
  id: string;
  hotel_id?: string;
  creator_id?: string;
  creator_name?: string;
  creator_email: string;
  category: string;
  priority: "urgent" | "high" | "normal" | "low";
  status: "open" | "in_progress" | "resolved" | "closed";
  subject: string;
  description: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_role: "hotel_staff" | "ever_engineering" | "ever_admin";
  sender_name: string;
  sender_email?: string;
  message: string;
  created_at: string;
}

const SANDBOX_SEED_TICKETS: SupportTicket[] = [
  {
    id: "ticket-demo-1",
    category: "PMS & POS Integrations",
    priority: "urgent",
    status: "in_progress",
    subject: "Opera Cloud PMS Folio Sync Verification",
    description: "We recently rotated our Oracle Hospitality Opera Cloud API secrets. Please verify that direct booking webhooks and room charge settlement folios are passing through without timeout.",
    creator_name: "Alexander Vance",
    creator_email: "gm@grandazure.com",
    assigned_to: "Ever Senior Systems Engineering",
    created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 35 * 60000).toISOString(),
  },
  {
    id: "ticket-demo-2",
    category: "WhatsApp & Channel Messaging",
    priority: "normal",
    status: "resolved",
    subject: "Meta WABA Template Approval: Late Departure Privilege",
    description: "Requesting verification of our custom 24h interactive template for late checkout upsells on WhatsApp.",
    creator_name: "Elena Rostova",
    creator_email: "frontdesk@grandazure.com",
    assigned_to: "Ever Operations Desk",
    created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 12 * 3600000).toISOString(),
  },
];

const SANDBOX_SEED_MESSAGES: Record<string, SupportMessage[]> = {
  "ticket-demo-1": [
    {
      id: "msg-101",
      ticket_id: "ticket-demo-1",
      sender_role: "hotel_staff",
      sender_name: "Alexander Vance",
      sender_email: "gm@grandazure.com",
      message: "We recently rotated our Oracle Hospitality Opera Cloud API secrets. Please verify that direct booking webhooks and room charge settlement folios are passing through without timeout.",
      created_at: new Date(Date.now() - 4 * 3600000).toISOString(),
    },
    {
      id: "msg-102",
      ticket_id: "ticket-demo-1",
      sender_role: "ever_engineering",
      sender_name: "Liam O'Connor (Lead Systems Engineer)",
      sender_email: "engineering@ever.hospitality",
      message: "Hello Alexander. We have inspected your endpoint traces. The OAuth 2.0 handshake with Opera Cloud was successfully re-authenticated at 04:12 UTC. Average round-trip webhook latency is 38ms. All room charge folios are streaming in real-time.",
      created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
    },
    {
      id: "msg-103",
      ticket_id: "ticket-demo-1",
      sender_role: "hotel_staff",
      sender_name: "Alexander Vance",
      sender_email: "gm@grandazure.com",
      message: "Confirmed on our front desk terminal. Thank you for the rapid turnaround!",
      created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    },
  ],
  "ticket-demo-2": [
    {
      id: "msg-201",
      ticket_id: "ticket-demo-2",
      sender_role: "hotel_staff",
      sender_name: "Elena Rostova",
      sender_email: "frontdesk@grandazure.com",
      message: "Requesting verification of our custom 24h interactive template for late checkout upsells on WhatsApp.",
      created_at: new Date(Date.now() - 26 * 3600000).toISOString(),
    },
    {
      id: "msg-202",
      ticket_id: "ticket-demo-2",
      sender_role: "ever_admin",
      sender_name: "Sarah Jenkins (Platform Admin)",
      sender_email: "admin@ever.hospitality",
      message: "Your Meta WhatsApp utility template has been reviewed and approved directly with Meta Business Manager. Active and live across all guest concierge flows.",
      created_at: new Date(Date.now() - 12 * 3600000).toISOString(),
    },
  ],
};

interface SupportTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportTicketModal({ isOpen, onClose }: SupportTicketModalProps) {
  const { hotelId, user } = useAuth();
  const { isSandbox } = useSandbox();
  const { showToast } = useToast();

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<Record<string, SupportMessage[]>>({});
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [view, setView] = useState<"list" | "create" | "detail">("list");
  const [loading, setLoading] = useState(false);

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "PMS & POS Integrations",
    priority: "normal" as "urgent" | "high" | "normal" | "low",
    description: "",
  });
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Reply Input State
  const [replyInput, setReplyInput] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    if (isSandbox) {
      const cachedTickets = sessionStorage.getItem("ever_sandbox_tickets");
      const cachedMessages = sessionStorage.getItem("ever_sandbox_ticket_messages");

      if (cachedTickets && cachedMessages) {
        try {
          setTickets(JSON.parse(cachedTickets));
          setMessages(JSON.parse(cachedMessages));
          return;
        } catch (e) {
          // fallback to seed
        }
      }

      setTickets(SANDBOX_SEED_TICKETS);
      setMessages(SANDBOX_SEED_MESSAGES);
      sessionStorage.setItem("ever_sandbox_tickets", JSON.stringify(SANDBOX_SEED_TICKETS));
      sessionStorage.setItem("ever_sandbox_ticket_messages", JSON.stringify(SANDBOX_SEED_MESSAGES));
      return;
    }

    if (!hotelId) return;

    setLoading(true);
    try {
      // 1. Fetch tickets
      const { data: ticketsData, error: ticketsErr } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (ticketsErr && ticketsErr.code !== "42P01") {
        console.warn("Tickets fetch error:", ticketsErr);
      }

      const loadedTickets = (ticketsData || []) as SupportTicket[];
      setTickets(loadedTickets);

      // 2. If tickets exist, fetch messages
      if (loadedTickets.length > 0) {
        const ticketIds = loadedTickets.map(t => t.id);
        const { data: msgsData } = await supabase
          .from("support_ticket_messages")
          .select("*")
          .in("ticket_id", ticketIds)
          .order("created_at", { ascending: true });

        const mapped: Record<string, SupportMessage[]> = {};
        (msgsData || []).forEach((m: any) => {
          if (!mapped[m.ticket_id]) mapped[m.ticket_id] = [];
          mapped[m.ticket_id].push(m);
        });
        setMessages(mapped);
      }
    } catch (err) {
      console.error("Failed to load support tickets:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox]);

  useEffect(() => {
    if (isOpen) {
      fetchTickets();
    }
  }, [isOpen, fetchTickets]);

  // Scroll to bottom of message thread
  useEffect(() => {
    if (view === "detail" && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, view, activeTicketId]);

  // Create Ticket Submit
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      showToast("Please provide both a subject and details for your ticket", "error");
      return;
    }

    setSubmittingTicket(true);
    const creatorName = user?.user_metadata?.full_name || "Hotel Operator";
    const creatorEmail = user?.email || "operator@hotel.com";

    const ticketId = crypto.randomUUID();
    const createdDate = new Date().toISOString();

    const createdTicket: SupportTicket = {
      id: ticketId,
      hotel_id: hotelId || undefined,
      creator_name: creatorName,
      creator_email: creatorEmail,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "open",
      subject: newTicket.subject.trim(),
      description: newTicket.description.trim(),
      assigned_to: "Ever Engineering & Operations Desk",
      created_at: createdDate,
      updated_at: createdDate,
    };

    const initialMessage: SupportMessage = {
      id: crypto.randomUUID(),
      ticket_id: ticketId,
      sender_role: "hotel_staff",
      sender_name: creatorName,
      sender_email: creatorEmail,
      message: newTicket.description.trim(),
      created_at: createdDate,
    };

    if (isSandbox) {
      const updatedTickets = [createdTicket, ...tickets];
      const updatedMessages = {
        ...messages,
        [ticketId]: [initialMessage],
      };

      setTickets(updatedTickets);
      setMessages(updatedMessages);
      sessionStorage.setItem("ever_sandbox_tickets", JSON.stringify(updatedTickets));
      sessionStorage.setItem("ever_sandbox_ticket_messages", JSON.stringify(updatedMessages));

      // Simulate an automated engineering acknowledgment after 1.5 seconds in sandbox
      setTimeout(() => {
        const engAck: SupportMessage = {
          id: crypto.randomUUID(),
          ticket_id: ticketId,
          sender_role: "ever_engineering",
          sender_name: "Ever Autonomous Engineering Desk",
          sender_email: "support@ever.hospitality",
          message: `Ticket received and routed to Level-2 Engineering. Incident priority [${createdTicket.priority.toUpperCase()}]. We are inspecting telemetry logs and will reply directly in this thread.`,
          created_at: new Date().toISOString(),
        };

        setMessages(prev => {
          const next = { ...prev, [ticketId]: [...(prev[ticketId] || []), engAck] };
          sessionStorage.setItem("ever_sandbox_ticket_messages", JSON.stringify(next));
          return next;
        });
      }, 1500);

      setSubmittingTicket(false);
      setNewTicket({ subject: "", category: "PMS & POS Integrations", priority: "normal", description: "" });
      setActiveTicketId(ticketId);
      setView("detail");
      showToast("Support ticket dispatched to Ever Engineering Desk", "success");
      return;
    }

    try {
      // 1. Insert into public.support_tickets
      const { data: ticketRes, error: ticketErr } = await supabase
        .from("support_tickets")
        .insert({
          hotel_id: hotelId,
          creator_id: user?.id,
          creator_name: creatorName,
          creator_email: creatorEmail,
          category: newTicket.category,
          priority: newTicket.priority,
          status: "open",
          subject: newTicket.subject.trim(),
          description: newTicket.description.trim(),
          assigned_to: "Ever Engineering & Operations Desk",
        })
        .select()
        .single();

      if (ticketErr) throw ticketErr;

      const realTicketId = ticketRes.id;

      // 2. Insert initial message
      await supabase.from("support_ticket_messages").insert({
        ticket_id: realTicketId,
        sender_role: "hotel_staff",
        sender_name: creatorName,
        sender_email: creatorEmail,
        message: newTicket.description.trim(),
      });

      // 3. Log to audit_log
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: user?.id || null,
        action: "CREATE_SUPPORT_TICKET",
        resource: "Support",
        detail: {
          ticket_id: realTicketId,
          subject: newTicket.subject,
          priority: newTicket.priority,
        }
      });

      setTickets(prev => [ticketRes as SupportTicket, ...prev]);
      setMessages(prev => ({
        ...prev,
        [realTicketId]: [{
          id: crypto.randomUUID(),
          ticket_id: realTicketId,
          sender_role: "hotel_staff",
          sender_name: creatorName,
          sender_email: creatorEmail,
          message: newTicket.description.trim(),
          created_at: createdDate,
        }]
      }));

      setNewTicket({ subject: "", category: "PMS & POS Integrations", priority: "normal", description: "" });
      setActiveTicketId(realTicketId);
      setView("detail");
      showToast("Support ticket opened successfully. Engineering notified.", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to create support ticket", "error");
    } finally {
      setSubmittingTicket(false);
    }
  };

  // Send Reply in Conversation Thread
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim() || !activeTicketId) return;

    setSendingReply(true);
    const creatorName = user?.user_metadata?.full_name || "Hotel Operator";
    const creatorEmail = user?.email || "operator@hotel.com";
    const now = new Date().toISOString();

    const newMsg: SupportMessage = {
      id: crypto.randomUUID(),
      ticket_id: activeTicketId,
      sender_role: "hotel_staff",
      sender_name: creatorName,
      sender_email: creatorEmail,
      message: replyInput.trim(),
      created_at: now,
    };

    if (isSandbox) {
      const currentList = messages[activeTicketId] || [];
      const updatedMessages = {
        ...messages,
        [activeTicketId]: [...currentList, newMsg],
      };

      setMessages(updatedMessages);
      sessionStorage.setItem("ever_sandbox_ticket_messages", JSON.stringify(updatedMessages));
      setReplyInput("");
      setSendingReply(false);

      // Simulate engineer follow-up
      setTimeout(() => {
        const engReply: SupportMessage = {
          id: crypto.randomUUID(),
          ticket_id: activeTicketId,
          sender_role: "ever_engineering",
          sender_name: "Ever Systems Engineering",
          sender_email: "support@ever.hospitality",
          message: "Follow-up noted. We are actively investigating and maintaining live sync on your tenant cluster.",
          created_at: new Date().toISOString(),
        };

        setMessages(prev => {
          const next = { ...prev, [activeTicketId]: [...(prev[activeTicketId] || []), engReply] };
          sessionStorage.setItem("ever_sandbox_ticket_messages", JSON.stringify(next));
          return next;
        });
      }, 1200);

      return;
    }

    try {
      await supabase.from("support_ticket_messages").insert({
        ticket_id: activeTicketId,
        sender_role: "hotel_staff",
        sender_name: creatorName,
        sender_email: creatorEmail,
        message: replyInput.trim(),
      });

      // Update ticket updated_at
      await supabase
        .from("support_tickets")
        .update({ updated_at: now })
        .eq("id", activeTicketId);

      setMessages(prev => ({
        ...prev,
        [activeTicketId]: [...(prev[activeTicketId] || []), newMsg],
      }));
      setReplyInput("");
    } catch (err: any) {
      showToast(err.message || "Failed to post message", "error");
    } finally {
      setSendingReply(false);
    }
  };

  const activeTicket = useMemo(() => {
    return tickets.find(t => t.id === activeTicketId) || null;
  }, [tickets, activeTicketId]);

  const activeMessages = useMemo(() => {
    if (!activeTicketId) return [];
    return messages[activeTicketId] || [];
  }, [messages, activeTicketId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-2xl h-[640px] max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* ── Modal Header ── */}
        <div className="p-4 border-b border-dash-border flex items-center justify-between shrink-0 bg-dash-surface">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center text-[#EA6639]">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-dash-text text-sm">Support &amp; Engineering Desk</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  LIVE 24/7 SLA
                </span>
              </div>
              <p className="text-[11px] text-dash-text-muted mt-0.5">
                Direct communication channel with Ever core engineering &amp; hospitality operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {view !== "list" && (
              <button
                onClick={() => setView("list")}
                className="px-2.5 py-1 text-xs text-dash-text-sec hover:text-dash-text hover:bg-dash-surface-hover rounded-md transition-colors flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> All Tickets
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-dash-text-muted hover:text-dash-text rounded hover:bg-dash-surface-hover transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── View 1: Tickets List ── */}
        {view === "list" && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Action Bar */}
            <div className="p-3.5 border-b border-dash-border bg-dash-canvas/40 flex items-center justify-between">
              <span className="text-xs font-medium text-dash-text-sec">
                {tickets.length} Active Tickets
              </span>
              <button
                onClick={() => setView("create")}
                className="px-3 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Open New Support Ticket
              </button>
            </div>

            {/* List Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {loading ? (
                <div className="flex flex-col items-center justify-center h-48 text-dash-text-muted text-xs gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-[#EA6639]" />
                  <span>Loading support tickets...</span>
                </div>
              ) : tickets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center px-4">
                  <div className="w-12 h-12 rounded-full bg-dash-surface-raised border border-dash-border flex items-center justify-center text-dash-text-muted mb-3">
                    <Headphones className="w-6 h-6 text-[#EA6639]" />
                  </div>
                  <h4 className="text-xs font-semibold text-dash-text">No Support Tickets Logged</h4>
                  <p className="text-[11px] text-dash-text-muted mt-1 max-w-sm leading-relaxed">
                    Have a question regarding your PMS integration, WhatsApp webhooks, attribution rates, or need emergency engineering support? Open a ticket below.
                  </p>
                  <button
                    onClick={() => setView("create")}
                    className="mt-4 px-3.5 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Create Ticket Now
                  </button>
                </div>
              ) : (
                tickets.map(ticket => {
                  const isUrgent = ticket.priority === "urgent";
                  const isHigh = ticket.priority === "high";
                  const isResolved = ticket.status === "resolved" || ticket.status === "closed";

                  return (
                    <div
                      key={ticket.id}
                      onClick={() => {
                        setActiveTicketId(ticket.id);
                        setView("detail");
                      }}
                      className="p-3.5 bg-dash-canvas hover:bg-dash-surface-hover/60 border border-dash-border rounded-xl transition-all cursor-pointer group flex items-start justify-between gap-3 shadow-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${
                            isUrgent 
                              ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400"
                              : isHigh
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400"
                              : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400"
                          }`}>
                            {ticket.priority}
                          </span>
                          <span className="text-[10px] text-dash-text-muted bg-dash-surface px-2 py-0.5 rounded border border-dash-border">
                            {ticket.category}
                          </span>
                        </div>

                        <h4 className="font-semibold text-xs text-dash-text group-hover:text-[#EA6639] transition-colors truncate">
                          {ticket.subject}
                        </h4>
                        <p className="text-[11px] text-dash-text-sec mt-1 line-clamp-1 leading-relaxed">
                          {ticket.description}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] text-dash-text-muted">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </span>
                          {ticket.assigned_to && (
                            <span className="truncate">
                              Assigned: <strong className="text-dash-text-sec">{ticket.assigned_to}</strong>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isResolved 
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}>
                          {ticket.status.replace("_", " ").toUpperCase()}
                        </span>
                        <ChevronRight className="w-4 h-4 text-dash-text-muted group-hover:text-[#EA6639] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ── View 2: Create New Ticket Form ── */}
        {view === "create" && (
          <form onSubmit={handleCreateTicket} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs custom-scrollbar">
            <div>
              <label className="block text-xs font-semibold text-dash-text mb-1">
                Ticket Subject <span className="text-[#EA6639]">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Opera Cloud PMS webhook timeout during checkout sync"
                value={newTicket.subject}
                onChange={e => setNewTicket({ ...newTicket, subject: e.target.value })}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-dash-text mb-1">System Category</label>
                <select
                  value={newTicket.category}
                  onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                >
                  <option value="PMS & POS Integrations">PMS &amp; POS Integrations (Opera, Mews, Lightspeed)</option>
                  <option value="WhatsApp & Channel Messaging">WhatsApp &amp; Channel Messaging (Meta WABA)</option>
                  <option value="Billing, Attribution & Ledger">Billing, Attribution &amp; Commercial Terms</option>
                  <option value="AI Concierge Tuning">AI Concierge Tuning &amp; Knowledge Base</option>
                  <option value="Incident or Bug Report">Incident or Bug Report</option>
                  <option value="General Consultation">General Consultation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-dash-text mb-1">Severity / Urgency</label>
                <select
                  value={newTicket.priority}
                  onChange={e => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                >
                  <option value="urgent">Urgent — Production Impasse / Guests Waiting</option>
                  <option value="high">High — Channel or PMS Disruption</option>
                  <option value="normal">Normal — General Operations / Query</option>
                  <option value="low">Low — Feature Request / Configuration</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-dash-text mb-1">
                Detailed Incident Description <span className="text-[#EA6639]">*</span>
              </label>
              <textarea
                required
                rows={6}
                placeholder="Please describe what happened, any error messages displayed, and timestamps. Ever engineers will review telemetry logs for your property."
                value={newTicket.description}
                onChange={e => setNewTicket({ ...newTicket, description: e.target.value })}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639] resize-none"
              />
            </div>

            <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border text-[11px] text-dash-text-muted flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-[#EA6639] shrink-0 mt-0.5" />
              <span>
                Tickets are routed directly to the on-call Ever Engineering and Operations pod. Urgent tickets dispatch automated SMS &amp; Slack alerts to senior engineers.
              </span>
            </div>

            <div className="flex gap-3 pt-3 border-t border-dash-border">
              <button
                type="button"
                onClick={() => setView("list")}
                className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingTicket}
                className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-xs"
              >
                {submittingTicket ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Dispatch Support Ticket
              </button>
            </div>
          </form>
        )}

        {/* ── View 3: Conversational Live Thread ── */}
        {view === "detail" && activeTicket && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Ticket Summary Banner */}
            <div className="p-3.5 border-b border-dash-border bg-dash-canvas/60 shrink-0 flex items-center justify-between">
              <div className="min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-dash-text truncate">{activeTicket.subject}</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#EA6639]/10 text-[#EA6639]">
                    {activeTicket.category}
                  </span>
                </div>
                <div className="text-[10px] text-dash-text-muted mt-0.5 flex items-center gap-2">
                  <span>Assigned: <strong>{activeTicket.assigned_to || "Ever Engineering"}</strong></span>
                  <span>•</span>
                  <span>Priority: <strong className="uppercase">{activeTicket.priority}</strong></span>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                activeTicket.status === "resolved" 
                  ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
              }`}>
                {activeTicket.status.toUpperCase()}
              </span>
            </div>

            {/* Live Message Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-dash-canvas/20">
              {activeMessages.map(msg => {
                const isStaff = msg.sender_role === "hotel_staff";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[10px] text-dash-text-muted">
                      {!isStaff && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      )}
                      <span className="font-semibold text-dash-text">
                        {isStaff ? "You (" + msg.sender_name + ")" : msg.sender_name}
                      </span>
                      <span>•</span>
                      <span>{new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed whitespace-pre-wrap ${
                        isStaff
                          ? "bg-[#EA6639] text-white rounded-br-none shadow-sm"
                          : "bg-dash-surface border border-dash-border text-dash-text rounded-bl-none shadow-xs"
                      }`}
                    >
                      {msg.message}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Composer */}
            <form onSubmit={handleSendReply} className="p-3 border-t border-dash-border bg-dash-surface shrink-0 flex items-center gap-2">
              <input
                type="text"
                placeholder="Type your response to the Ever Engineering team..."
                value={replyInput}
                onChange={e => setReplyInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              />
              <button
                type="submit"
                disabled={sendingReply || !replyInput.trim()}
                className="px-4 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
              >
                {sendingReply ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Send
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
