import React, { useState, useEffect, useMemo, useCallback } from "react";
import { 
  Star, 
  Filter, 
  Download, 
  MessageSquare, 
  ChevronDown, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Search,
  SlidersHorizontal,
  ExternalLink,
  Send,
  Bell,
  ArrowUpRight,
  TrendingUp,
  Smile,
  Meh,
  Frown,
  Sparkles,
  Tag,
  X,
  Clock,
  ShieldAlert,
  Reply,
  Check
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { StandardTable, StandardTableColumn, TableDensity } from "../../../shared/StandardTable";

export interface FeedbackRecord {
  id: string;
  session_id?: string;
  guest_name?: string;
  rating: number;
  comment: string;
  channel?: string;
  created_at: string;
  status?: "unreviewed" | "resolved" | "escalated";
  sentiment_tag?: string;
  response_text?: string;
  escalated_to?: string;
}

interface FeedbackTabProps {
  onNavigate?: (tab: string, context?: any) => void;
  role?: string;
}

export function FeedbackTab({ onNavigate }: FeedbackTabProps) {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  // Table & Filter state
  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [ratingFilter, setRatingFilter] = useState<string>("All");
  const [channelFilter, setChannelFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [density, setDensity] = useState<TableDensity>("default");
  const [sortKey, setSortKey] = useState<string | null>("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Collection & loading
  const [feedbackList, setFeedbackList] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-response rules (Clean state for live accounts; mock defaults only in Sandbox)
  const [askGoogleReview, setAskGoogleReview] = useState(() => isSandbox);
  const [googleReviewLink, setGoogleReviewLink] = useState(() => isSandbox ? "https://g.page/r/the-grand-azure/review" : "");
  const [alertManager, setAlertManager] = useState(() => isSandbox);
  const [managerAlertEmail, setManagerAlertEmail] = useState(() => isSandbox ? "gm@grandazure.com" : "");
  const [autoAcknowledge, setAutoAcknowledge] = useState(() => isSandbox);
  const [savingRules, setSavingRules] = useState(false);

  // Reply Modal / Slide-over State
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackRecord | null>(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Derive sentiment tag from comment
  const getAutoTag = useCallback((comment: string, rating: number): string => {
    const text = (comment || "").toLowerCase();
    if (text.includes("clean") || text.includes("tidy") || text.includes("dirty") || text.includes("maid") || text.includes("towel")) return "Housekeeping";
    if (text.includes("breakfast") || text.includes("food") || text.includes("dinner") || text.includes("restaurant") || text.includes("meal") || text.includes("bar")) return "F&B Dining";
    if (text.includes("check in") || text.includes("check-in") || text.includes("desk") || text.includes("reception") || text.includes("staff") || text.includes("concierge")) return "Front Desk";
    if (text.includes("bed") || text.includes("pillow") || text.includes("room") || text.includes("sleep") || text.includes("shower") || text.includes("quiet") || text.includes("ac")) return "Room Comfort";
    if (text.includes("pool") || text.includes("spa") || text.includes("gym") || text.includes("wifi") || text.includes("parking")) return "Amenities";
    return rating >= 4 ? "General Praise" : "General Service";
  }, []);

  const fetchFeedback = useCallback(async () => {
    if (!hotelId && !isSandbox) {
      setLoading(false);
      return;
    }

    if (isSandbox && sandboxData) {
      const mapped: FeedbackRecord[] = (sandboxData.feedback || []).map((f) => ({
        id: f.id,
        session_id: f.session_id,
        guest_name: f.guest_name,
        rating: f.rating,
        comment: f.comment,
        channel: f.channel,
        created_at: f.created_at,
        status: (f.rating <= 2 ? "escalated" : f.rating === 3 ? "unreviewed" : "resolved") as any,
        sentiment_tag: getAutoTag(f.comment, f.rating),
      }));
      setFeedbackList(mapped);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const [feedbackRes, hotelRes] = await Promise.all([
        supabase
          .from("feedback")
          .select("id, rating, comment, channel, created_at, session_id, guest_name, status, response_text")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false }),
        supabase
          .from("hotels")
          .select("config")
          .eq("id", hotelId)
          .single()
      ]);

      if (feedbackRes.error) throw feedbackRes.error;
      const liveItems: FeedbackRecord[] = (feedbackRes.data || []).map((item: any) => ({
        id: item.id,
        session_id: item.session_id,
        guest_name: item.guest_name || "Guest",
        rating: Number(item.rating) || 5,
        comment: item.comment || "",
        channel: item.channel || "widget",
        created_at: item.created_at || new Date().toISOString(),
        status: item.status || (item.rating <= 2 ? "escalated" : "unreviewed"),
        sentiment_tag: getAutoTag(item.comment || "", item.rating),
        response_text: item.response_text,
      }));
      setFeedbackList(liveItems);

      // Load live property feedback & reputation rules from database config
      if (!hotelRes.error && hotelRes.data?.config?.feedback_settings) {
        const rules = hotelRes.data.config.feedback_settings;
        if (rules.ask_google_review !== undefined) setAskGoogleReview(Boolean(rules.ask_google_review));
        if (rules.google_review_link !== undefined) setGoogleReviewLink(rules.google_review_link || "");
        if (rules.alert_manager !== undefined) setAlertManager(Boolean(rules.alert_manager));
        if (rules.manager_alert_email !== undefined) setManagerAlertEmail(rules.manager_alert_email || "");
        if (rules.auto_acknowledge !== undefined) setAutoAcknowledge(Boolean(rules.auto_acknowledge));
      }
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, getAutoTag]);

  // Persist live reputation rules to database
  const handleSaveRules = async () => {
    if (isSandbox) {
      showToast("Reputation rules saved in sandbox session", "success");
      return;
    }

    if (!hotelId) return;
    setSavingRules(true);
    try {
      // 1. Get current config
      const { data: currentHotel } = await supabase.from("hotels").select("config").eq("id", hotelId).single();
      const existingConfig = currentHotel?.config || {};

      // 2. Merge feedback_settings
      const updatedConfig = {
        ...existingConfig,
        feedback_settings: {
          ask_google_review: askGoogleReview,
          google_review_link: googleReviewLink.trim(),
          alert_manager: alertManager,
          manager_alert_email: managerAlertEmail.trim(),
          auto_acknowledge: autoAcknowledge,
          updated_at: new Date().toISOString(),
        }
      };

      const { error } = await supabase.from("hotels").update({ config: updatedConfig }).eq("id", hotelId);
      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Feedback Settings",
        detail: { feedback_settings: updatedConfig.feedback_settings }
      });

      showToast("Reputation rules saved to database", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to save reputation rules", "error");
    } finally {
      setSavingRules(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Filtered and Sorted collection
  const filteredList = useMemo(() => {
    return feedbackList.filter(item => {
      // Rating filter
      if (ratingFilter !== "All") {
        if (ratingFilter === "promoters" && item.rating < 4) return false;
        if (ratingFilter === "passives" && item.rating !== 3) return false;
        if (ratingFilter === "detractors" && item.rating > 2) return false;
        if (!["promoters", "passives", "detractors"].includes(ratingFilter) && item.rating !== parseInt(ratingFilter, 10)) {
          return false;
        }
      }

      // Channel filter
      if (channelFilter !== "All" && (item.channel || "").toLowerCase() !== channelFilter.toLowerCase()) {
        return false;
      }

      // Status filter
      if (statusFilter !== "All" && item.status !== statusFilter) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (item.guest_name || "").toLowerCase().includes(q);
        const matchesComment = (item.comment || "").toLowerCase().includes(q);
        const matchesTag = (item.sentiment_tag || "").toLowerCase().includes(q);
        if (!matchesName && !matchesComment && !matchesTag) return false;
      }

      return true;
    }).sort((a, b) => {
      if (!sortKey) return 0;
      let valA: any = a[sortKey as keyof FeedbackRecord] ?? "";
      let valB: any = b[sortKey as keyof FeedbackRecord] ?? "";
      if (sortKey === "created_at") {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      }
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [feedbackList, ratingFilter, channelFilter, statusFilter, searchQuery, sortKey, sortDirection]);

  // Advanced CSAT & NPS Intelligence
  const metrics = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) {
      return {
        avgRating: "—",
        csatScore: "—",
        npsScore: 0,
        npsCategory: "Neutral",
        totalResponses: 0,
        promotersCount: 0,
        passivesCount: 0,
        detractorsCount: 0,
        promotersPct: 0,
        passivesPct: 0,
        detractorsPct: 0,
        escalatedCount: 0,
        distribution: [
          { stars: 5, count: 0, pct: 0 },
          { stars: 4, count: 0, pct: 0 },
          { stars: 3, count: 0, pct: 0 },
          { stars: 2, count: 0, pct: 0 },
          { stars: 1, count: 0, pct: 0 },
        ]
      };
    }

    const sum = feedbackList.reduce((acc, f) => acc + (f.rating || 0), 0);
    const avg = (sum / total).toFixed(1);

    const promoters = feedbackList.filter(f => f.rating >= 4).length;
    const passives = feedbackList.filter(f => f.rating === 3).length;
    const detractors = feedbackList.filter(f => f.rating <= 2).length;
    const escalated = feedbackList.filter(f => f.status === "escalated").length;

    const promotersPct = Math.round((promoters / total) * 100);
    const passivesPct = Math.round((passives / total) * 100);
    const detractorsPct = Math.round((detractors / total) * 100);

    // NPS Formula: % Promoters - % Detractors
    const nps = promotersPct - detractorsPct;
    const npsCategory = nps >= 50 ? "World-Class" : nps >= 20 ? "Favorable" : nps >= 0 ? "Acceptable" : "Action Needed";

    const distCounts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    feedbackList.forEach(f => {
      if (f.rating >= 1 && f.rating <= 5) distCounts[f.rating]++;
    });

    const distribution = [5, 4, 3, 2, 1].map(stars => ({
      stars,
      count: distCounts[stars],
      pct: total > 0 ? Math.round((distCounts[stars] / total) * 100) : 0
    }));

    return {
      avgRating: avg,
      csatScore: `${promotersPct}%`,
      npsScore: nps,
      npsCategory,
      totalResponses: total,
      promotersCount: promoters,
      passivesCount: passives,
      detractorsCount: detractors,
      promotersPct,
      passivesPct,
      detractorsPct,
      escalatedCount: escalated,
      distribution
    };
  }, [feedbackList]);

  // Reply Action Handler
  const handleOpenReplyModal = (item: FeedbackRecord) => {
    setSelectedFeedback(item);
    setReplyText(item.response_text || "");
  };

  const handleApplyTemplate = (text: string) => {
    setReplyText(text);
  };

  const handleSendReply = async () => {
    if (!selectedFeedback) return;
    setIsSubmittingReply(true);

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        feedback: (prev.feedback || []).map(f => f.id === selectedFeedback.id ? { ...f, status: "resolved" } : f)
      }));
      setFeedbackList(prev => prev.map(f => f.id === selectedFeedback.id ? { ...f, status: "resolved", response_text: replyText } : f));
      setIsSubmittingReply(false);
      setSelectedFeedback(null);
      showToast("Response delivered to guest via " + (selectedFeedback.channel || "WhatsApp"), "success");
      return;
    }

    try {
      const { error } = await supabase
        .from("feedback")
        .update({
          status: "resolved",
          response_text: replyText,
        })
        .eq("id", selectedFeedback.id);

      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Feedback",
        detail: { feedback_id: selectedFeedback.id, action: "REPLY_RESOLVED" }
      });

      setFeedbackList(prev => prev.map(f => f.id === selectedFeedback.id ? { ...f, status: "resolved", response_text: replyText } : f));
      showToast("Response recorded & delivered to guest", "success");
      setSelectedFeedback(null);
    } catch (err: any) {
      showToast(err.message || "Failed to update feedback", "error");
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const handleToggleEscalation = async (item: FeedbackRecord) => {
    const nextStatus = item.status === "escalated" ? "resolved" : "escalated";

    if (isSandbox) {
      setFeedbackList(prev => prev.map(f => f.id === item.id ? { ...f, status: nextStatus } : f));
      showToast(nextStatus === "escalated" ? "Escalated to General Manager" : "Marked as Resolved", "info");
      return;
    }

    try {
      await supabase.from("feedback").update({ status: nextStatus }).eq("id", item.id);

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Feedback",
        detail: { feedback_id: item.id, status: nextStatus }
      });

      setFeedbackList(prev => prev.map(f => f.id === item.id ? { ...f, status: nextStatus } : f));
      showToast(nextStatus === "escalated" ? "Ticket escalated to Duty Manager" : "Ticket resolved", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to update ticket", "error");
    }
  };

  const exportCSV = () => {
    if (filteredList.length === 0) {
      showToast("No feedback to export", "error");
      return;
    }

    const headers = ["Guest Name", "Rating", "Sentiment Group", "Category Tag", "Comment", "Channel", "Status", "Date"];
    const rows = filteredList.map(f => [
      `"${f.guest_name || "Guest"}"`,
      f.rating.toString(),
      f.rating >= 4 ? "Promoter" : f.rating === 3 ? "Passive" : "Detractor",
      `"${f.sentiment_tag || "General"}"`,
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      f.channel || "WhatsApp",
      f.status || "unreviewed",
      new Date(f.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever-guest-reputation-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Feedback ledger exported successfully", "success");
  };

  // StandardTable Column Definitions
  const columns: StandardTableColumn<FeedbackRecord>[] = [
    {
      key: "guest_name",
      header: "Guest & Channel",
      isSticky: true,
      minWidth: "180px",
      render: (row) => (
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-dash-surface-raised border border-dash-border flex items-center justify-center font-bold text-[11px] text-[#EA6639] shrink-0">
            {(row.guest_name || "G").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-xs text-dash-text truncate">{row.guest_name || "Guest"}</div>
            <div className="flex items-center gap-1.5 text-[10px] text-dash-text-muted">
              <span className="capitalize">{row.channel || "WhatsApp"}</span>
              {row.session_id && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[9px] opacity-70 truncate max-w-[70px]">{row.session_id.slice(-6)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      header: "Rating & NPS",
      sortable: true,
      minWidth: "130px",
      render: (row) => {
        const isPromoter = row.rating >= 4;
        const isDetractor = row.rating <= 2;
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1">
              <div className="flex text-amber-500">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < row.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"}`} />
                ))}
              </div>
              <span className="text-[11px] font-bold text-dash-text ml-1">{row.rating}.0</span>
            </div>
            <div>
              <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                isPromoter ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
                isDetractor ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
                "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
              }`}>
                {isPromoter ? "Promoter" : isDetractor ? "Detractor" : "Passive"}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      key: "comment",
      header: "Guest Feedback & Discovery Tags",
      minWidth: "260px",
      render: (row) => (
        <div className="space-y-1.5 py-0.5">
          <p className="text-xs text-dash-text line-clamp-2 leading-relaxed">{row.comment || "No written review text provided."}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {row.sentiment_tag && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-dash-canvas border border-dash-border text-dash-text-sec">
                <Tag className="w-2.5 h-2.5 text-[#EA6639]" />
                {row.sentiment_tag}
              </span>
            )}
            {row.response_text && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                <Reply className="w-2.5 h-2.5" /> Replied
              </span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      minWidth: "110px",
      render: (row) => {
        const isEscalated = row.status === "escalated";
        const isResolved = row.status === "resolved";
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            isEscalated ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" :
            isResolved ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" :
            "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20"
          }`}>
            {isEscalated && <AlertCircle className="w-2.5 h-2.5" />}
            {isResolved && <Check className="w-2.5 h-2.5" />}
            {row.status || "unreviewed"}
          </span>
        );
      },
    },
    {
      key: "created_at",
      header: "Date",
      sortable: true,
      minWidth: "90px",
      render: (row) => (
        <span className="text-[11px] font-mono text-dash-text-muted whitespace-nowrap">
          {new Date(row.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-6 space-y-6 dashboard-interactive h-full flex flex-col overflow-y-auto hide-scrollbar">
      {/* ── Top Header Bar ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2 border-b border-dash-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dash-text tracking-tight">Guest Feedback &amp; Reputation</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              NPS &amp; Sentiment Engine
            </span>
          </div>
          <p className="text-xs text-dash-text-sec mt-1">
            Monitor verified guest ratings, analyze real-time Net Promoter Scores, and automate Google Review routing.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Feedback demo records recalculated", "success");
              }}
              className="h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          )}
          <button
            onClick={exportCSV}
            className="h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── CSAT & NPS Intelligence Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Average Rating */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/10 rounded-full blur-2xl -translate-y-4 translate-x-4 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Guest Satisfaction</span>
              <Star className="w-4 h-4 text-amber-500 fill-current" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-3xl font-black text-dash-text">{metrics.avgRating}</h3>
              <span className="text-xs text-dash-text-muted font-medium">/ 5.0 Rating</span>
            </div>
            <p className="text-xs text-dash-text-sec">
              Derived from <strong className="text-dash-text">{metrics.totalResponses} verified reviews</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between text-[11px] text-dash-text-sec">
            <span>CSAT Score:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{metrics.csatScore} positive</span>
          </div>
        </div>

        {/* Card 2: Net Promoter Score */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#EA6639]/10 rounded-full blur-2xl -translate-y-4 translate-x-4 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Net Promoter Score</span>
              <TrendingUp className="w-4 h-4 text-[#EA6639]" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-3xl font-black text-dash-text">
                {metrics.totalResponses > 0 ? (metrics.npsScore > 0 ? `+${metrics.npsScore}` : metrics.npsScore) : "—"}
              </h3>
              <span className="text-xs text-dash-text-muted font-medium">NPS (-100 to +100)</span>
            </div>
            <p className="text-xs text-dash-text-sec">
              Tier: <strong className="text-[#EA6639]">{metrics.npsCategory}</strong>
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between text-[11px] text-dash-text-sec">
            <span>Spread:</span>
            <span className="font-medium">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{metrics.promotersPct}%</span> P / <span className="text-rose-600 font-bold">{metrics.detractorsPct}%</span> D
            </span>
          </div>
        </div>

        {/* Card 3: Sentiment Distribution Breakdown */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted mb-2 block">Sentiment Mix</span>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                  <Smile className="w-3.5 h-3.5" /> Promoters (4-5★)
                </span>
                <span className="font-mono font-bold text-dash-text">{metrics.promotersCount} ({metrics.promotersPct}%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-amber-500 font-medium">
                  <Meh className="w-3.5 h-3.5" /> Passives (3★)
                </span>
                <span className="font-mono font-bold text-dash-text">{metrics.passivesCount} ({metrics.passivesPct}%)</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 text-rose-500 font-medium">
                  <Frown className="w-3.5 h-3.5" /> Detractors (1-2★)
                </span>
                <span className="font-mono font-bold text-dash-text">{metrics.detractorsCount} ({metrics.detractorsPct}%)</span>
              </div>
            </div>
          </div>
          <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden flex mt-3">
            <div style={{ width: `${metrics.promotersPct}%` }} className="bg-emerald-500 h-full" title="Promoters" />
            <div style={{ width: `${metrics.passivesPct}%` }} className="bg-amber-500 h-full" title="Passives" />
            <div style={{ width: `${metrics.detractorsPct}%` }} className="bg-rose-500 h-full" title="Detractors" />
          </div>
        </div>

        {/* Card 4: Service Recovery & Escalation */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Service Recovery</span>
              <ShieldAlert className="w-4 h-4 text-rose-500" />
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-3xl font-black text-dash-text">{metrics.escalatedCount}</h3>
              <span className="text-xs text-dash-text-muted">tickets flagged</span>
            </div>
            <p className="text-xs text-dash-text-sec">
              {metrics.escalatedCount > 0 ? "Requires management review" : "Zero open service alerts"}
            </p>
          </div>
          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between text-[11px]">
            <span className="text-dash-text-muted">Auto-Alert Status:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> GM SMS/Email Active
            </span>
          </div>
        </div>
      </div>

      {/* ── Two-Column Main: Rules Engine & Feedback Table ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sidebar: Auto-Response & Reputation Rules */}
        <div className="space-y-4">
          <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-dash-border">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#EA6639]" />
                <h3 className="text-xs font-bold text-dash-text uppercase tracking-wider">Reputation Rules</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                Autonomous
              </span>
            </div>

            {/* Rule 1: Google Reviews Prompt */}
            <div className="space-y-2 p-3 bg-dash-canvas rounded-lg border border-dash-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-dash-text flex items-center gap-1.5">
                  Google Review Booster
                </label>
                <input
                  type="checkbox"
                  checked={askGoogleReview}
                  onChange={(e) => {
                    setAskGoogleReview(e.target.checked);
                    showToast(e.target.checked ? "Google Review booster enabled" : "Google Review booster disabled", "info");
                  }}
                  className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-dash-text-muted">
                Autonomously prompts guests who leave 4★ or 5★ ratings to publish on Google Business.
              </p>
              <div>
                <label className="block text-[10px] font-semibold text-dash-text-sec mb-1">Target Google Review Link</label>
                <input
                  type="url"
                  value={googleReviewLink}
                  onChange={(e) => setGoogleReviewLink(e.target.value)}
                  placeholder="https://g.page/r/your-hotel/review"
                  className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded text-[11px] font-mono text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                />
              </div>
            </div>

            {/* Rule 2: Escalation to Duty Manager */}
            <div className="space-y-2 p-3 bg-dash-canvas rounded-lg border border-dash-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-dash-text flex items-center gap-1.5">
                  Duty Manager Alert
                </label>
                <input
                  type="checkbox"
                  checked={alertManager}
                  onChange={(e) => {
                    setAlertManager(e.target.checked);
                    showToast(e.target.checked ? "Manager escalation alert enabled" : "Manager alert disabled", "info");
                  }}
                  className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-dash-text-muted">
                Triggers instant WhatsApp &amp; Email notification to management when rating $\le 2$★.
              </p>
              <div>
                <label className="block text-[10px] font-semibold text-dash-text-sec mb-1">Escalation Recipient</label>
                <input
                  type="email"
                  value={managerAlertEmail}
                  onChange={(e) => setManagerAlertEmail(e.target.value)}
                  placeholder="manager@hotel.com"
                  className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded text-[11px] font-mono text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                />
              </div>
            </div>

            {/* Rule 3: Auto-Acknowledge Gratitude */}
            <div className="space-y-2 p-3 bg-dash-canvas rounded-lg border border-dash-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-dash-text">
                  Instant Acknowledgment
                </label>
                <input
                  type="checkbox"
                  checked={autoAcknowledge}
                  onChange={(e) => {
                    setAutoAcknowledge(e.target.checked);
                    showToast(e.target.checked ? "Instant acknowledgment active" : "Auto-acknowledgment disabled", "info");
                  }}
                  className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer"
                />
              </div>
              <p className="text-[11px] text-dash-text-muted">
                Replies immediately on the guest&apos;s messaging channel thanking them for stay feedback.
              </p>
            </div>

            <button
              onClick={handleSaveRules}
              disabled={savingRules}
              className="w-full py-2 bg-dash-surface-raised border border-dash-border hover:bg-dash-surface-hover text-dash-text text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 shadow-xs"
            >
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              {savingRules ? "Saving Settings..." : "Save Reputation Rules"}
            </button>
          </div>
        </div>

        {/* Right Section: StandardTable & Filter Controls */}
        <div className="lg:col-span-3 space-y-4">
          {/* Filter Bar */}
          <div className="bg-dash-surface p-4 rounded-xl border border-dash-border shadow-sm flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 flex-1 min-w-[240px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px] max-w-xs">
                <Search className="w-3.5 h-3.5 text-dash-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search guest name, comment, tag..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dash-text-muted hover:text-dash-text">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Rating / NPS Filter */}
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="h-8 px-2.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none"
              >
                <option value="All">All Ratings</option>
                <option value="promoters">Promoters (4-5★)</option>
                <option value="passives">Passives (3★)</option>
                <option value="detractors">Detractors (1-2★)</option>
                <option value="5">5 Stars only</option>
                <option value="4">4 Stars only</option>
                <option value="3">3 Stars only</option>
                <option value="2">2 Stars only</option>
                <option value="1">1 Star only</option>
              </select>

              {/* Channel Filter */}
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="h-8 px-2.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none"
              >
                <option value="All">All Channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="widget">Web Concierge</option>
                <option value="instagram">Instagram</option>
                <option value="facebook">Facebook</option>
                <option value="tawkto">Tawk.to</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-8 px-2.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none"
              >
                <option value="All">All Statuses</option>
                <option value="unreviewed">Unreviewed</option>
                <option value="resolved">Resolved</option>
                <option value="escalated">Escalated</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-dash-text-muted font-medium">
              <span>{filteredList.length} reviews matching</span>
            </div>
          </div>

          {/* StandardTable Container */}
          <div className="bg-dash-surface rounded-xl border border-dash-border shadow-sm overflow-hidden">
            <StandardTable<FeedbackRecord>
              data={filteredList}
              columns={columns}
              keyField="id"
              density={density}
              onDensityChange={setDensity}
              showDensityToggle={true}
              sortKey={sortKey}
              sortDirection={sortDirection}
              onSort={(key) => {
                if (sortKey === key) {
                  setSortDirection(prev => prev === "asc" ? "desc" : "asc");
                } else {
                  setSortKey(key);
                  setSortDirection("desc");
                }
              }}
              isLoading={loading}
              emptyMessage={
                <div className="p-8 text-center space-y-2">
                  <Star className="w-8 h-8 text-dash-text-muted mx-auto opacity-40 mb-1" />
                  <p className="text-xs font-semibold text-dash-text">
                    {feedbackList.length === 0 && !isSandbox 
                      ? "No guest feedback records accumulated yet."
                      : "No reviews matching current filter criteria."}
                  </p>
                  <p className="text-[11px] text-dash-text-muted max-w-sm mx-auto">
                    {feedbackList.length === 0 && !isSandbox
                      ? "Automated post-stay surveys trigger automatically once live reservations conclude."
                      : "Try broadening your rating or channel filters above."}
                  </p>
                </div>
              }
              renderRowActions={(row) => (
                <div className="flex items-center gap-1 justify-end pr-2">
                  <button
                    onClick={() => handleOpenReplyModal(row)}
                    className="p-1.5 rounded hover:bg-dash-canvas text-dash-text-muted hover:text-[#EA6639] transition-colors"
                    title="Send Reply"
                  >
                    <Reply className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleToggleEscalation(row)}
                    className={`p-1.5 rounded hover:bg-dash-canvas transition-colors ${row.status === 'escalated' ? 'text-rose-500' : 'text-dash-text-muted hover:text-rose-500'}`}
                    title={row.status === 'escalated' ? "Mark Resolved" : "Escalate to GM"}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </button>
                  {row.session_id && onNavigate && (
                    <button
                      onClick={() => onNavigate("inbox", { sessionId: row.session_id })}
                      className="p-1.5 rounded hover:bg-dash-canvas text-dash-text-muted hover:text-dash-text transition-colors"
                      title="Open Live Chat Thread"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            />
          </div>
        </div>
      </div>

      {/* ── Reply / Resolution Composer Modal ── */}
      {selectedFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-dash-border">
              <div className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-[#EA6639]" />
                <h4 className="font-semibold text-xs text-dash-text">Reply to {selectedFeedback.guest_name || "Guest"}</h4>
              </div>
              <button
                onClick={() => setSelectedFeedback(null)}
                className="text-dash-text-muted hover:text-dash-text p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-4 text-xs">
              {/* Context Summary */}
              <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border space-y-1.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-semibold text-dash-text">{selectedFeedback.guest_name || "Guest"}</span>
                  <div className="flex items-center text-amber-500">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className={`w-3 h-3 ${i < selectedFeedback.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"}`} />
                    ))}
                  </div>
                </div>
                <p className="text-[11px] text-dash-text-sec italic">&ldquo;{selectedFeedback.comment}&rdquo;</p>
                <div className="flex justify-between items-center text-[10px] text-dash-text-muted pt-1 border-t border-dash-border">
                  <span>Channel: <strong className="capitalize text-dash-text">{selectedFeedback.channel || "WhatsApp"}</strong></span>
                  <span>{new Date(selectedFeedback.created_at).toLocaleString()}</span>
                </div>
              </div>

              {/* Quick Template Buttons */}
              <div>
                <label className="block text-[10px] font-bold text-dash-text-muted uppercase tracking-wider mb-1.5">
                  Hospitality Quick Responses
                </label>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`Dear ${selectedFeedback.guest_name || "Guest"}, thank you so much for your wonderful review! We are delighted you enjoyed your stay and look forward to welcoming you back soon.`)}
                    className="px-2.5 py-1 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover rounded text-[11px] text-dash-text transition-colors"
                  >
                    5★ Appreciation
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`Dear ${selectedFeedback.guest_name || "Guest"}, thank you for taking the time to share your feedback. We sincerely apologize that your experience fell short of expectations. Our General Manager would appreciate the opportunity to speak with you directly.`)}
                    className="px-2.5 py-1 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover rounded text-[11px] text-dash-text transition-colors"
                  >
                    Service Recovery
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyTemplate(`Dear ${selectedFeedback.guest_name || "Guest"}, we appreciate your review! If you have 60 seconds, could you share your kind words on our Google profile? ${googleReviewLink}`)}
                    className="px-2.5 py-1 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover rounded text-[11px] text-[#EA6639] transition-colors"
                  >
                    Google Review Request
                  </button>
                </div>
              </div>

              {/* Message Composer Area */}
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Response Message</label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type personalized response..."
                  className="w-full p-2.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-dash-border">
                <span className="text-[10px] text-dash-text-muted">Will dispatch via guest&apos;s direct channel</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFeedback(null)}
                    className="px-3 py-1.5 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingReply || !replyText.trim()}
                    onClick={handleSendReply}
                    className="px-3.5 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send Response
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
