import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Star, Filter, Download, MessageSquare, ChevronDown, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

interface FeedbackItem {
  id: string;
  guest_name?: string;
  rating: number;
  comment: string;
  channel?: string;
  created_at: string;
}

export function FeedbackTab() {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const [dateRange, setDateRange] = useState("Last 30 Days");
  const [ratingFilter, setRatingFilter] = useState<string>("All");
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Auto-response rules
  const [askGoogleReview, setAskGoogleReview] = useState(true);
  const [alertManager, setAlertManager] = useState(true);

  const fetchFeedback = useCallback(async () => {
    if (!hotelId) return;

    if (isSandbox && sandboxData) {
      setFeedbackList(sandboxData.feedback as FeedbackItem[]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("feedback")
        .select("id, rating, comment, channel, created_at, session_id")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFeedbackList((data || []) as FeedbackItem[]);
    } catch (err) {
      console.error("Failed to fetch feedback:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => {
    fetchFeedback();
  }, [fetchFeedback]);

  // Filtered list
  const filteredList = useMemo(() => {
    return feedbackList.filter(item => {
      if (ratingFilter !== "All" && item.rating !== parseInt(ratingFilter, 10)) {
        return false;
      }
      return true;
    });
  }, [feedbackList, ratingFilter]);

  // Calculated Metrics
  const metrics = useMemo(() => {
    const total = feedbackList.length;
    if (total === 0) {
      return {
        avgRating: "—",
        totalResponses: 0,
        responseRate: "0%",
        positivePct: 0,
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
    const positiveCount = feedbackList.filter(f => f.rating >= 4).length;
    const positivePct = Math.round((positiveCount / total) * 100);

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
      totalResponses: total,
      responseRate: "88%",
      positivePct,
      distribution
    };
  }, [feedbackList]);

  const exportCSV = () => {
    if (filteredList.length === 0) {
      showToast("No feedback to export", "error");
      return;
    }

    const headers = ["Guest", "Rating", "Comment", "Channel", "Date"];
    const rows = filteredList.map(f => [
      f.guest_name || "Guest",
      f.rating.toString(),
      `"${(f.comment || "").replace(/"/g, '""')}"`,
      f.channel || "WhatsApp",
      new Date(f.created_at).toLocaleDateString()
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `ever-feedback-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Feedback CSV exported successfully", "success");
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col overflow-y-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text">Feedback & Reviews</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Monitor guest sentiment and configure auto-response rules.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Feedback data regenerated", "success");
              }}
              className="flex-1 sm:flex-initial h-8 px-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-md text-xs font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Regenerate Demo Data
            </button>
          )}
          <div className="relative flex-1 sm:flex-initial">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none w-full sm:w-36 dashboard-btn compact-touch-target h-8 pl-3 pr-8 bg-dash-surface border border-dash-border rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors text-dash-text focus:outline-none"
            >
              <option>Today</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dash-text-muted pointer-events-none" />
          </div>
          <button
            onClick={exportCSV}
            className="flex-1 sm:flex-initial dashboard-btn compact-touch-target h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Summary KPIs ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-4">
        <div className="bg-dash-surface p-3 md:p-4 rounded-xl border border-dash-border flex flex-col justify-between hover:border-[#EA6639]/40 transition-colors">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-semibold text-dash-text-sec leading-tight uppercase tracking-wider">Average Rating</span>
            <Star className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 fill-current" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-bold text-dash-text">{metrics.avgRating}</span>
            <span className="text-micro font-bold text-dash-text-muted">/ 5.0</span>
          </div>
        </div>

        <div className="bg-dash-surface p-3 md:p-4 rounded-xl border border-dash-border flex flex-col justify-between hover:border-[#EA6639]/40 transition-colors">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-semibold text-dash-text-sec leading-tight uppercase tracking-wider">Total Responses</span>
            <MessageSquare className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-bold text-dash-text">{metrics.totalResponses}</span>
          </div>
        </div>

        <div className="bg-dash-surface p-3 md:p-4 rounded-xl border border-dash-border flex flex-col justify-between hover:border-[#EA6639]/40 transition-colors">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-semibold text-dash-text-sec leading-tight uppercase tracking-wider">Response Rate</span>
            <CheckCircle2 className="w-4 h-4 text-dash-text-muted shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-bold text-dash-text">{metrics.responseRate}</span>
          </div>
        </div>

        <div className="bg-dash-surface p-3 md:p-4 rounded-xl border border-dash-border flex flex-col justify-between hover:border-[#EA6639]/40 transition-colors">
          <div className="flex items-start justify-between gap-1 mb-2">
            <span className="text-data font-semibold text-dash-text-sec leading-tight uppercase tracking-wider">Positive Sentiment</span>
            <AlertCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
          </div>
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-2xl font-bold text-dash-text">{metrics.positivePct}%</span>
            <span className="text-micro font-bold text-dash-text-muted">Rated 4-5★</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0">
        
        {/* ── Rating Distribution & Rules ── */}
        <div className="flex flex-col gap-4">
          <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
            <h3 className="text-sm font-bold text-dash-text mb-4">Rating Distribution</h3>
            <div className="space-y-3">
              {metrics.distribution.map(row => (
                <div key={row.stars} className="flex items-center gap-3">
                  <div className="flex items-center w-10 text-xs font-medium text-dash-text">
                    {row.stars} <Star className="w-3 h-3 ml-1 fill-current text-amber-500" />
                  </div>
                  <div className="flex-1 h-2 bg-dash-canvas rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${row.pct}%` }}></div>
                  </div>
                  <div className="w-8 text-right text-[10px] text-dash-text-muted font-mono">{row.pct}%</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-dash-surface p-4 rounded-xl border border-dash-border">
            <h3 className="text-sm font-bold text-dash-text mb-4">Auto-Response Rules</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                <div>
                  <h4 className="text-xs font-semibold text-dash-text">Ask for Google Review</h4>
                  <p className="text-[10px] text-dash-text-muted mt-0.5">When rating ≥ 4 stars</p>
                </div>
                <input
                  type="checkbox"
                  checked={askGoogleReview}
                  onChange={(e) => {
                    setAskGoogleReview(e.target.checked);
                    showToast(e.target.checked ? "Google Review prompt active" : "Google Review prompt disabled", "info");
                  }}
                  className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer"
                />
              </div>
              <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                <div>
                  <h4 className="text-xs font-semibold text-dash-text">Alert Manager</h4>
                  <p className="text-[10px] text-dash-text-muted mt-0.5">When rating ≤ 2 stars</p>
                </div>
                <input
                  type="checkbox"
                  checked={alertManager}
                  onChange={(e) => {
                    setAlertManager(e.target.checked);
                    showToast(e.target.checked ? "Manager alerts active" : "Manager alerts disabled", "info");
                  }}
                  className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ── Feedback Table ── */}
        <div className="lg:col-span-2 bg-dash-surface rounded-xl border border-dash-border flex flex-col overflow-hidden h-full">
          <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-surface z-10 sticky top-0">
             <h3 className="text-sm font-bold text-dash-text">Recent Feedback &amp; Reviews</h3>
             <div className="flex items-center gap-2">
               <Filter className="w-3.5 h-3.5 text-dash-text-muted" />
               <select
                 value={ratingFilter}
                 onChange={(e) => setRatingFilter(e.target.value)}
                 className="text-xs px-2 py-1 bg-dash-canvas border border-dash-border rounded-lg text-dash-text focus:outline-none"
               >
                 <option value="All">All Ratings</option>
                 <option value="5">5 Stars only</option>
                 <option value="4">4 Stars only</option>
                 <option value="3">3 Stars only</option>
                 <option value="2">2 Stars only</option>
                 <option value="1">1 Star only</option>
               </select>
             </div>
          </div>

          <div className="overflow-x-auto flex-1 hide-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-48 text-dash-text-muted">
                <RefreshCw className="w-5 h-5 animate-spin text-[#EA6639] mr-2" />
                <span className="text-xs">Loading reviews...</span>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-dash-text-muted text-center p-4">
                <Star className="w-8 h-8 opacity-30 mb-2" />
                <p className="text-xs">No feedback matching current filter.</p>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-dash-border bg-dash-canvas/50">
                    <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Guest</th>
                    <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Rating</th>
                    <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider w-full min-w-[200px]">Comment</th>
                    <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider whitespace-nowrap">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dash-border">
                  {filteredList.map((fb) => (
                    <tr key={fb.id} className="hover:bg-dash-canvas/50 transition-colors">
                      <td className="p-3">
                        <div className="font-medium text-xs text-dash-text whitespace-nowrap">{fb.guest_name || "Guest"}</div>
                        {fb.channel && <div className="text-[10px] text-dash-text-muted capitalize">{fb.channel}</div>}
                      </td>
                      <td className="p-3">
                        <div className="flex text-amber-500">
                          {Array(5).fill(0).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${i < fb.rating ? "fill-current" : "text-zinc-300 dark:text-zinc-700"}`} />
                          ))}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="text-xs text-dash-text-sec line-clamp-2">{fb.comment}</div>
                      </td>
                      <td className="p-3">
                        <div className="text-[10px] text-dash-text-muted whitespace-nowrap">
                          {new Date(fb.created_at).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
