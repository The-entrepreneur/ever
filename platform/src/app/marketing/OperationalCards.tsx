import React from "react";
import { AnimatePresence, motion } from "motion/react";
import { Smartphone, Star, Check, Share2 } from "lucide-react";

interface OperationalCardsProps {
  triggerFollowUpMock: (isCompleted: boolean) => void;
  reviewSubmitted: boolean;
  reviewRating: number;
  setReviewRating: (rating: number) => void;
  reviewText: string;
  setReviewText: (text: string) => void;
  handleReviewSubmit: (e: React.FormEvent) => void;
  pushedToLive: boolean;
  onResetReview: () => void;
}

export function OperationalCards({
  triggerFollowUpMock,
  reviewSubmitted,
  reviewRating,
  setReviewRating,
  reviewText,
  setReviewText,
  handleReviewSubmit,
  pushedToLive,
  onResetReview
}: OperationalCardsProps) {
  return (
    <div id="operational-cards" className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Card 1: Operational Timeline */}
      <div className="bg-white border border-dash-border rounded-lg p-5 shadow-sm space-y-4">
        <h4 className="text-body font-mono uppercase tracking-wider text-dash-text-muted flex items-center gap-1.5 border-b border-zinc-100 pb-2">
          <Smartphone className="w-4 h-4 text-emerald-500" />
          Operational Timeline
        </h4>
        
        <p className="text-sm text-zinc-600 font-normal leading-relaxed">
          The Guest OS monitors guest journeys and executes live operational flows. Below are events dispatched in response to active touchpoints:
        </p>

        {/* Real-time Event Feed */}
        <div className="space-y-3">
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-lg p-3 text-body text-emerald-800 space-y-2 font-light">
            <div className="flex justify-between items-center font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Event Dispatcher
              </span>
              <span className="text-[9px] bg-emerald-200/60 px-2 py-0.5 rounded text-emerald-900 uppercase font-bold tracking-wide">ACTIVE</span>
            </div>
            
            <div className="space-y-2 text-micro font-mono">
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-500">[00:00:00]</span>
                <p>Event: Chat Initiated &rarr; Ellie Guest OS agent mounted</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-500">[00:01:15]</span>
                <p>Event: Intent matched (RoomAvailability) &rarr; Querying PMS database</p>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-emerald-500">[00:02:40]</span>
                <p>Event: Direct payment url initialized via Flutterwave Gateway</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button 
            type="button"
            onClick={() => triggerFollowUpMock(false)}
            className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-md text-body font-semibold border border-zinc-200 cursor-pointer transition-colors"
          >
            Simulate Cart Drop-off Event
          </button>
          <button 
            type="button"
            onClick={() => triggerFollowUpMock(true)}
            className="flex-1 py-2 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 rounded-md text-body font-semibold border border-zinc-200 cursor-pointer transition-colors"
          >
            Simulate Post-Book Upgrade Event
          </button>
        </div>
      </div>

      {/* Card 2: Guest Feedback Loop */}
      <div className="bg-white border border-dash-border rounded-lg p-5 shadow-sm space-y-4">
        <h4 className="text-body font-mono uppercase tracking-wider text-dash-text-muted flex items-center gap-1.5 border-b border-zinc-100 pb-2">
          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
          Guest Feedback Loop
        </h4>
        <p className="text-sm text-zinc-600 font-normal leading-relaxed">
          The Guest OS captures real-time sentiment signals during conversational checkout, syncing high-score reviews to external hospitality channels:
        </p>

        <AnimatePresence mode="wait">
          {!reviewSubmitted ? (
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div className="flex items-center gap-1.5 justify-center py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star className={`w-6 h-6 ${
                      star <= reviewRating ? "text-amber-400 fill-amber-400" : "text-zinc-200"
                    }`} />
                  </button>
                ))}
              </div>

              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Type dynamic feedback here (e.g. 'Stunning room booking flow, fully connected and modern!')"
                rows={2}
                required
                className="w-full bg-zinc-50 border border-zinc-200 rounded-md p-2.5 text-body focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-zinc-800 placeholder-zinc-400 resize-none font-light leading-relaxed"
              />

              <button
                type="submit"
                className="w-full py-2 bg-[#EA6639] hover:bg-[#EA6639]/95 text-white rounded-md text-body font-semibold transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                Submit Feedback Event
              </button>
            </form>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-3 text-body"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-5 h-5 stroke-[3]" />
              </div>
              <div>
                <p className="font-semibold text-zinc-900">Feedback Logged Successfully</p>
                <p className="text-micro text-dash-text-sec font-light mt-1 max-w-xs mx-auto">
                  High-score event (&ge;4 stars) triggers automated cross-network publishing:
                </p>
              </div>

              {pushedToLive ? (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-blue-50 border border-blue-100 text-blue-800 rounded-md p-2 text-micro font-mono flex items-center justify-center gap-1.5"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  Pushed Live &rarr; Google Reviews & TripAdvisor
                </motion.div>
              ) : (
                <div className="text-micro font-mono text-zinc-400 animate-pulse">
                  Synchronizing sentiment dataset with global registries...
                </div>
              )}

              <button
                type="button"
                onClick={onResetReview}
                className="text-micro text-[#EA6639] underline cursor-pointer hover:opacity-80 block mx-auto mt-2"
              >
                Simulate another feedback review
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
}
