import React, { useEffect, useState } from "react";
import { Clock, ShieldAlert, LogOut, CheckCircle2 } from "lucide-react";

interface InactivityModalProps {
  isOpen: boolean;
  countdownSeconds: number;
  onStaySignedIn: () => void;
  onSignOut: () => void;
}

export const InactivityModal: React.FC<InactivityModalProps> = ({
  isOpen,
  countdownSeconds,
  onStaySignedIn,
  onSignOut,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(countdownSeconds);
      return;
    }

    setSecondsLeft(countdownSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, countdownSeconds, onSignOut]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 text-center transform animate-in zoom-in-95 duration-150">
        <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
          <Clock className="w-7 h-7 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-1">
          Are you still there?
        </h3>
        
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5 leading-relaxed">
          You have been idle for 30 minutes. To protect guest confidentiality, active folios, and PMS records, inactive sessions are automatically locked.
        </p>

        <div className="p-3 mb-6 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs font-medium text-amber-700 dark:text-amber-400 flex items-center justify-center gap-2">
          <ShieldAlert className="w-4 h-4 shrink-0 text-amber-500" />
          <span>
            Signing out automatically in <strong className="font-mono font-bold text-sm text-amber-600 dark:text-amber-300">{secondsLeft}s</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onSignOut}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>

          <button
            onClick={onStaySignedIn}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#EA6639] hover:bg-[#d9562a] text-white text-xs font-semibold shadow-md shadow-[#EA6639]/20 transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Stay Signed In</span>
          </button>
        </div>
      </div>
    </div>
  );
};
