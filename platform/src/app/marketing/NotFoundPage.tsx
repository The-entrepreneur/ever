import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowLeft, Home, Compass, MessageSquare, ShieldCheck, Sparkles } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  const location = useLocation();

  return (
    <main className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-[#F9F6F0] dark:bg-[#121212] transition-colors duration-200">
      <div className="max-w-2xl w-full text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/20 mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Error 404 • Resource Not Found</span>
        </div>

        {/* Big Code */}
        <h1 className="text-7xl sm:text-9xl font-black tracking-tight text-zinc-900 dark:text-white font-mono mb-4">
          4<span className="text-[#EA6639]">0</span>4
        </h1>

        {/* Heading */}
        <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
          This Page Does Not Exist
        </h2>

        {/* Description */}
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-md mx-auto mb-2 leading-relaxed">
          The link you followed (<code className="px-1.5 py-0.5 rounded bg-zinc-200/70 dark:bg-zinc-800 text-xs font-mono text-zinc-800 dark:text-zinc-300 break-all">{location.pathname}</code>) could not be located on the Ever hospitality platform.
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-500 mb-8">
          It may have been moved, renamed, or mistyped.
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#EA6639] hover:bg-[#d9562a] text-white text-sm font-semibold shadow-md shadow-[#EA6639]/20 transition-all active:scale-[0.98]"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>

          <Link
            to="/console"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/60 text-sm font-semibold transition-all"
          >
            <Compass className="w-4 h-4 text-[#EA6639]" />
            <span>Client Console</span>
          </Link>
        </div>

        {/* Quick Nav Links Box */}
        <div className="pt-8 border-t border-zinc-200/80 dark:border-zinc-800/80 text-left">
          <p className="text-xs uppercase tracking-wider font-semibold text-zinc-400 dark:text-zinc-500 mb-3 text-center">
            Popular Destinations
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <Link
              to="/guest-concierge"
              className="p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-[#EA6639]/40 hover:text-[#EA6639] transition-all text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Guest Concierge →
            </Link>
            <Link
              to="/commerce-agent"
              className="p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-[#EA6639]/40 hover:text-[#EA6639] transition-all text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Commerce Agent →
            </Link>
            <Link
              to="/pricing"
              className="p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-[#EA6639]/40 hover:text-[#EA6639] transition-all text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Platform Pricing →
            </Link>
            <Link
              to="/help-desk"
              className="p-2.5 rounded-lg border border-zinc-200/60 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 hover:border-[#EA6639]/40 hover:text-[#EA6639] transition-all text-zinc-700 dark:text-zinc-300 font-medium"
            >
              Support &amp; Contact →
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};
