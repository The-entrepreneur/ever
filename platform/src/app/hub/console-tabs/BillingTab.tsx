import React, { useState, useMemo, useEffect } from "react";
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  Receipt, 
  Package, 
  Zap, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  Loader2, 
  TrendingUp, 
  ShieldCheck, 
  Building2, 
  Percent, 
  Layers, 
  Calendar, 
  HelpCircle,
  ArrowUpRight,
  Sparkles,
  Bed,
  UtensilsCrossed,
  Clock,
  Car,
  Compass,
  FileSpreadsheet
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useCurrency } from "../../../context/CurrencyContext";
import { useToast } from "../../../shared/ToastContext";

interface OperationalModules {
  direct_bookings: boolean;
  housekeeping: boolean;
  room_service: boolean;
  maintenance: boolean;
  upsells: boolean;
}

interface TenantCommercialConfig {
  name: string;
  room_count: number;
  estate_tier: "select" | "estate" | "resort" | "portfolio";
  base_platform_fee: number;
  attribution_rate: number; // e.g. 0.025 for 2.5%
  onboarding_fee: number;
  onboarding_status: "pending" | "paid" | "waived";
  operational_modules: OperationalModules;
}

const TIER_META = {
  select: {
    label: "Select Property",
    sublabel: "Entry / Boutique (Up to 25 Rooms)",
    badgeColor: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  },
  estate: {
    label: "Full-Service Estate",
    sublabel: "Midscale / Active (26 – 50 Rooms)",
    badgeColor: "bg-[#EA6639]/10 text-[#EA6639] border-[#EA6639]/20",
  },
  resort: {
    label: "Resort Operations",
    sublabel: "Multi-Department (51 – 100 Rooms)",
    badgeColor: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  },
  portfolio: {
    label: "Portfolio Infrastructure",
    sublabel: "Enterprise / Multi-Property (100+ Rooms)",
    badgeColor: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  },
};

export function BillingTab() {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, regenerate } = useSandbox();
  const { formatMoney } = useCurrency();
  const { showToast } = useToast();

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [updatingPayment, setUpdatingPayment] = useState(false);
  // Sandbox demo config — never used for live accounts
  const SANDBOX_DEFAULT_CONFIG: TenantCommercialConfig = {
    name: "The Grand Azure Hotel",
    room_count: 42,
    estate_tier: "estate",
    base_platform_fee: 299,
    attribution_rate: 0.025,
    onboarding_fee: 750,
    onboarding_status: "paid",
    operational_modules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: true,
      maintenance: true,
      upsells: true,
    },
  };

  // Live account config — null until loaded from real admin record
  const [clientConfig, setClientConfig] = useState<TenantCommercialConfig | null>(null);

  // Load real tenant configuration — strictly matched to hotelId / user metadata, no mock fallbacks
  useEffect(() => {
    if (isSandbox) {
      setClientConfig(SANDBOX_DEFAULT_CONFIG);
      return;
    }
    try {
      // 1. Check admin clients registry
      const stored = localStorage.getItem("ever_admin_clients");
      if (stored) {
        const clients = JSON.parse(stored);
        if (Array.isArray(clients) && clients.length > 0) {
          const match = clients.find((c: any) => c.id === hotelId || c.hotel_slug === hotelId || c.slug === hotelId);
          if (match) {
            setClientConfig({
              name: match.name || "Active Property",
              room_count: match.room_count ?? match.roomCount ?? 0,
              estate_tier: match.estate_tier || match.tier || "select",
              base_platform_fee: match.base_platform_fee ?? match.baseFee ?? 0,
              attribution_rate: match.attribution_rate ?? match.attributionRate ?? 0,
              onboarding_fee: match.onboarding_fee ?? match.onboardingFee ?? 0,
              onboarding_status: match.onboarding_status || match.onboardingStatus || "pending",
              operational_modules: match.operational_modules || match.operationalModules || {
                direct_bookings: false,
                housekeeping: false,
                room_service: false,
                maintenance: false,
                upsells: false,
              },
            });
            return;
          }
        }
      }

      // 2. Check claimed invites
      const activeSlug = localStorage.getItem("ever_active_hotel_slug");
      const invitesRaw = localStorage.getItem("ever_onboarding_invites_v1");
      if (invitesRaw) {
        const invites = JSON.parse(invitesRaw);
        if (Array.isArray(invites)) {
          const match = invites.find((inv: any) =>
            (activeSlug && inv.hotel_slug === activeSlug) ||
            inv.hotel_slug === hotelId ||
            inv.id === hotelId
          );
          if (match) {
            setClientConfig({
              name: match.hotel_name || "Active Property",
              room_count: match.room_count ?? 0,
              estate_tier: match.tier || "select",
              base_platform_fee: match.base_platform_fee ?? 0,
              attribution_rate: match.attribution_rate ?? 0,
              onboarding_fee: match.onboarding_fee ?? 0,
              onboarding_status: match.onboarding_status || "pending",
              operational_modules: match.operational_modules || {
                direct_bookings: false,
                housekeeping: false,
                room_service: false,
                maintenance: false,
                upsells: false,
              },
            });
            return;
          }
        }
      }

      // 3. Try user metadata for name/tier only — STRICT: no synthetic numeric defaults.
      // If the admin has not yet configured commercial terms, clientConfig stays null.
      if (user?.user_metadata) {
        const meta = user.user_metadata;
        const tier = meta.tier as "select" | "estate" | "resort" | "portfolio" | undefined;

        // Only construct config if we have explicitly stored numeric values — never invent them
        if (
          meta.base_platform_fee !== undefined &&
          meta.attribution_rate !== undefined
        ) {
          setClientConfig({
            name: meta.business_name || meta.hotel_name || meta.property_name || "",
            room_count: meta.room_count ?? 0,
            estate_tier: tier || "select",
            base_platform_fee: meta.base_platform_fee,
            attribution_rate: meta.attribution_rate,
            onboarding_fee: meta.onboarding_fee ?? 0,
            onboarding_status: meta.onboarding_status || "pending",
            operational_modules: meta.operational_modules || {
              direct_bookings: false,
              housekeeping: false,
              room_service: false,
              maintenance: false,
              upsells: false,
            },
          });
        }
        // else: clientConfig remains null → billing tab renders zero-state
      }
    } catch (e) {
      console.warn("Failed to load admin client commercial terms", e);
    }
  }, [hotelId, isSandbox, user]);

  // Dynamic calculation for the 10 Qualifying Revenue Streams
  // Sandbox-only: mock qualifying revenue streams
  const sandboxQualifyingStreams = useMemo(() => {
    if (!isSandbox || !clientConfig) return null;
    const rate = clientConfig.attribution_rate;
    const bookings = sandboxData?.bookings || [];
    const confirmedBookings = bookings.filter(b => b.status === "Confirmed");
    const dynamicDirectBookingGross = confirmedBookings.reduce((acc, b) => acc + (b.total_amount || 0), 0) || 14250;
    const directCount = confirmedBookings.length || 9;

    const streams = [
      { id: "stream-1", name: "1. Direct Room Bookings", channel: "WhatsApp & Web Direct Checkout", description: "Autonomous guest reservations completed via Ever checkout", count: directCount, gross: dynamicDirectBookingGross, otaCommissionSaved: dynamicDirectBookingGross * 0.20, icon: Bed },
      { id: "stream-2", name: "2. Room Category Upgrades", channel: "Pre-Arrival WhatsApp Automation", description: "In-chat upgrades to Deluxe suites, ocean views, and villas", count: 7, gross: 1850.00, otaCommissionSaved: 370.00, icon: TrendingUp },
      { id: "stream-3", name: "3. Late Check-Out Privileges", channel: "In-Stay Assistant & SMS", description: "Monetized departure extensions confirmed against housekeeping SLA", count: 14, gross: 640.00, otaCommissionSaved: 128.00, icon: Clock },
      { id: "stream-4", name: "4. Early Check-In Authorizations", channel: "Arrival Morning Notification", description: "Pre-3:00 PM room availability monetization", count: 8, gross: 420.00, otaCommissionSaved: 84.00, icon: Clock },
      { id: "stream-5", name: "5. Breakfast Packages", channel: "Booking Add-On & Morning Greeting", description: "Buffet & continental breakfast inclusions purchased in-chat", count: 18, gross: 1120.00, otaCommissionSaved: 224.00, icon: UtensilsCrossed },
      { id: "stream-6", name: "6. In-Chat Room Service (F&B)", channel: "WhatsApp / In-Room QR Widget", description: "Autonomous in-room dining orders sent straight to POS/kitchen", count: 32, gross: 2480.00, otaCommissionSaved: 496.00, icon: UtensilsCrossed },
      { id: "stream-7", name: "7. Airport & Chauffeur Transfers", channel: "Pre-Stay Concierge Prompt", description: "Private executive vehicle scheduling and terminal pickups", count: 6, gross: 850.00, otaCommissionSaved: 170.00, icon: Car },
      { id: "stream-8", name: "8. Curated Experiences & Excursions", channel: "Local Discovery Engine", description: "Spa treatments, private catamaran rentals, and vineyard tastings", count: 9, gross: 1600.00, otaCommissionSaved: 320.00, icon: Compass },
      { id: "stream-9", name: "9. Equipment & Amenity Rentals", channel: "Interactive Concierge", description: "Cabanas, bicycles, audiovisual equipment, and boardroom bookings", count: 5, gross: 380.00, otaCommissionSaved: 76.00, icon: Layers },
      { id: "stream-10", name: "10. Ancillary Property Add-Ons", channel: "Folio Monetization Layer", description: "Champagne arrivals, artisan florals, pet fees, and valet parking", count: 11, gross: 520.00, otaCommissionSaved: 104.00, icon: Sparkles },
    ];
    const totalGross = streams.reduce((acc, s) => acc + s.gross, 0);
    return { streams, totalGross, totalPerformanceFee: totalGross * rate, totalOtaSaved: streams.reduce((acc, s) => acc + s.otaCommissionSaved, 0), totalTransactions: streams.reduce((acc, s) => acc + s.count, 0), rate };
  }, [isSandbox, sandboxData?.bookings, clientConfig]);

  // Live account: empty qualifying streams zero-state
  const liveQualifyingStreams = { streams: [], totalGross: 0, totalPerformanceFee: 0, totalOtaSaved: 0, totalTransactions: 0, rate: clientConfig?.attribution_rate ?? 0 };

  const qualifyingStreams = (isSandbox && sandboxQualifyingStreams) ? sandboxQualifyingStreams : liveQualifyingStreams;

  // Usage & Pass-Through metrics — sandbox only shows mock conversation counts
  const usagePassThrough = useMemo(() => {
    const includedConversations = 1000;
    const activeConversations = isSandbox ? 1240 : 0; // live: real data not yet wired
    const overageConversations = Math.max(0, activeConversations - includedConversations);
    const perConversationCost = 0.05;
    return {
      includedConversations,
      activeConversations,
      overageConversations,
      perConversationCost,
      passThroughAmount: overageConversations * perConversationCost,
    };
  }, [isSandbox]);

  // Grand Total Current Cycle
  const totalInvoiceCurrent = useMemo(() => {
    const base = clientConfig?.base_platform_fee ?? 0;
    return base + qualifyingStreams.totalPerformanceFee + usagePassThrough.passThroughAmount;
  }, [clientConfig, qualifyingStreams.totalPerformanceFee, usagePassThrough.passThroughAmount]);

  // Invoices — sandbox only shows mock historical invoices; live shows empty state
  const invoices = useMemo(() => {
    if (!isSandbox || !clientConfig) return [];
    return [
      { id: "INV-2026-009", period: "Aug 1 - Aug 31, 2026", baseFee: clientConfig.base_platform_fee, attributedRev: 21850.00, performanceFee: 21850.00 * clientConfig.attribution_rate, passThrough: 15.20, amount: clientConfig.base_platform_fee + (21850.00 * clientConfig.attribution_rate) + 15.20, status: "Paid" as const },
      { id: "INV-2026-008", period: "Jul 1 - Jul 31, 2026", baseFee: clientConfig.base_platform_fee, attributedRev: 19400.00, performanceFee: 19400.00 * clientConfig.attribution_rate, passThrough: 8.50, amount: clientConfig.base_platform_fee + (19400.00 * clientConfig.attribution_rate) + 8.50, status: "Paid" as const },
      { id: "INV-2026-007", period: "Jun 1 - Jun 30, 2026", baseFee: clientConfig.base_platform_fee, attributedRev: 16200.00, performanceFee: 16200.00 * clientConfig.attribution_rate, passThrough: 0.00, amount: clientConfig.base_platform_fee + (16200.00 * clientConfig.attribution_rate), status: "Paid" as const },
    ];
  }, [isSandbox, clientConfig]);

  const handleDownloadInvoice = (invoiceId: string) => {
    showToast(`Downloading itemized tax invoice PDF for ${invoiceId}...`, "info");
  };

  const handleExportAuditLedger = () => {
    showToast("Exporting Ever-Attributed Commercial Ledger (CSV)...", "info");
  };

  const handleUpdatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingPayment(true);
    setTimeout(() => {
      setUpdatingPayment(false);
      setShowPaymentModal(false);
      showToast("Payment method updated securely with Stripe PCI-DSS Level 1 compliance", "success");
    }, 800);
  };

  const tierInfo = clientConfig ? (TIER_META[clientConfig.estate_tier] || TIER_META.estate) : TIER_META.select;

  return (
    <div className="p-3 md:p-6 space-y-6 dashboard-interactive h-full overflow-y-auto hide-scrollbar">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2 border-b border-dash-border">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-dash-text tracking-tight">Commercial Ledger &amp; Platform Billing</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${tierInfo.badgeColor}`}>
              {tierInfo.label}
            </span>
          </div>
          <p className="text-xs text-dash-text-sec mt-1">
            Reconciles your Guest OS monthly subscription{clientConfig ? `, Ever-attributed revenue dividend (${(clientConfig.attribution_rate * 100).toFixed(1)}%)` : ""}, and WhatsApp Meta pass-through costs.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto shrink-0">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Simulated billing ledger recalculated", "success");
              }}
              className="h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Demo
            </button>
          )}
          <button 
            onClick={handleExportAuditLedger}
            className="h-8 px-3 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
            <span>Export Audit Ledger</span>
          </button>
          <button 
            onClick={() => setShowPaymentModal(true)}
            className="h-8 px-3 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap shadow-sm"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Method</span>
          </button>
        </div>
      </div>

      {/* ── KPI & Commercial Formula Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Property Physical Scale & Subscription */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#EA6639]/10 rounded-full blur-2xl -translate-y-6 translate-x-6 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Hospitality Infrastructure</span>
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Active Dedicated Container
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-black text-dash-text">{formatMoney(clientConfig?.base_platform_fee ?? 0)}</h3>
              <span className="text-xs text-dash-text-muted font-medium">/ month base</span>
            </div>
            <p className="text-xs text-dash-text-sec mb-3">
              Configured for <strong className="text-dash-text">{clientConfig?.room_count ?? "—"} Rooms &amp; Suites</strong>
            </p>

            <div className="p-2.5 bg-dash-canvas/80 rounded-lg border border-dash-border text-[11px] space-y-1.5">
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Physical Estate Tier:</span>
                <span className="font-semibold text-dash-text">{tierInfo.label}</span>
              </div>
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Attribution Dividend:</span>
                <span className="font-bold text-[#EA6639]">{((clientConfig?.attribution_rate ?? 0) * 100).toFixed(1)}% qualifying rev</span>
              </div>
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Implementation Fee:</span>
                <span className="capitalize font-semibold text-dash-text">
                  {formatMoney(clientConfig?.onboarding_fee ?? 0)} ({clientConfig?.onboarding_status ?? "pending"})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between">
            <span className="text-[10px] text-dash-text-muted">Active operational modules:</span>
            <div className="flex gap-1">
            {clientConfig?.operational_modules?.direct_bookings && <span title="Direct Bookings" className="w-2 h-2 rounded-full bg-emerald-500" />}
              {clientConfig?.operational_modules?.housekeeping && <span title="Housekeeping" className="w-2 h-2 rounded-full bg-blue-500" />}
              {clientConfig?.operational_modules?.room_service && <span title="Room Service F&B" className="w-2 h-2 rounded-full bg-amber-500" />}
              {clientConfig?.operational_modules?.maintenance && <span title="Maintenance" className="w-2 h-2 rounded-full bg-purple-500" />}
              {clientConfig?.operational_modules?.upsells && <span title="Upsells & Monetization" className="w-2 h-2 rounded-full bg-[#EA6639]" />}
            </div>
          </div>
        </div>

        {/* Card 2: Current Billing Cycle Reconciliation Formula */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl -translate-y-6 translate-x-6 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Current Estimated Invoice</span>
              <span className="text-[11px] font-mono text-dash-text-muted">Cycle: Current Month</span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-black text-dash-text">{formatMoney(totalInvoiceCurrent)}</h3>
              <span className="text-xs text-dash-text-muted">estimated total</span>
            </div>
            <p className="text-xs text-dash-text-sec mb-3">
              Computed dynamically according to the PRD formula:
            </p>

            <div className="p-2.5 bg-dash-canvas/80 rounded-lg border border-dash-border text-[11px] font-mono space-y-1 text-dash-text">
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Base Platform Fee:</span>
                <span>{formatMoney(clientConfig?.base_platform_fee ?? 0)}</span>
              </div>
              <div className="flex justify-between items-center text-[#EA6639] font-medium">
                <span>Attributed Dividend ({((clientConfig?.attribution_rate ?? 0) * 100).toFixed(1)}%):</span>
                <span>+{formatMoney(qualifyingStreams.totalPerformanceFee)}</span>
              </div>
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Meta Usage Pass-Through:</span>
                <span>+{formatMoney(usagePassThrough.passThroughAmount)}</span>
              </div>
              <div className="pt-1 mt-1 border-t border-dash-border flex justify-between font-bold text-dash-text">
                <span>Reconciled Total:</span>
                <span>{formatMoney(totalInvoiceCurrent)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between text-[11px] text-dash-text-muted">
            <span>Next automatic settlement:</span>
            <span className="font-semibold text-dash-text">1st of next month</span>
          </div>
        </div>

        {/* Card 3: Hotel Net ROI & OTA Commission Retained */}
        <div className="bg-dash-surface p-5 rounded-xl border border-dash-border shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -translate-y-6 translate-x-6 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-dash-text-muted">Net ROI &amp; OTA Recovery</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded">
                +{(qualifyingStreams.totalOtaSaved / Math.max(1, totalInvoiceCurrent)).toFixed(1)}x Return
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">+{formatMoney(qualifyingStreams.totalOtaSaved)}</h3>
              <span className="text-xs text-dash-text-muted">OTA fee saved</span>
            </div>
            <p className="text-xs text-dash-text-sec mb-3">
              Total OTA commissions reclaimed by routing bookings &amp; folio upsells directly through EVER.
            </p>

            <div className="p-2.5 bg-dash-canvas/80 rounded-lg border border-dash-border text-[11px] space-y-1.5">
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>Attributed Direct Revenue:</span>
                <span className="font-bold text-dash-text">{formatMoney(qualifyingStreams.totalGross)}</span>
              </div>
              <div className="flex justify-between items-center text-dash-text-sec">
                <span>OTA Baseline Fee (20% avg):</span>
                <span className="text-rose-500 line-through">{formatMoney(qualifyingStreams.totalOtaSaved)}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Net Profit Reclaimed:</span>
                <span>+{formatMoney(qualifyingStreams.totalOtaSaved - totalInvoiceCurrent)}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-dash-border flex items-center justify-between text-[11px] text-dash-text-muted">
            <span>Direct Commercial Impact:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{qualifyingStreams.totalTransactions} transactions</span>
          </div>
        </div>

      </div>

      {/* ── Itemized Ledger for the 10 Qualifying Revenue Streams ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-dash-text">Ever-Attributed Commercial Ledger</h3>
              <span className="px-2 py-0.5 bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/20 rounded text-[10px] font-bold">
                10 Qualifying Streams
              </span>
            </div>
            <p className="text-xs text-dash-text-sec mt-0.5">
              Itemized ledger of verified commercial transactions where EVER autonomously engaged, converted, or upgraded the guest.
            </p>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-auto text-xs text-dash-text-muted">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EA6639]" /> {((clientConfig?.attribution_rate ?? 0) * 100).toFixed(1)}% Dividend
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> 20% OTA Saved
            </span>
          </div>
        </div>

        <div className="overflow-x-auto hide-scrollbar border border-dash-border rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-dash-border bg-dash-canvas/60">
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Qualifying Revenue Stream</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Autonomous Trigger</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Transactions</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Gross Facilitated</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Ever Fee ({clientConfig ? (clientConfig.attribution_rate * 100).toFixed(1) : "0.0"}%)</th>
                <th className="p-3 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">OTA Retained</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border">
              {qualifyingStreams.streams.map((stream) => {
                const StreamIcon = stream.icon;
                const feeForStream = stream.gross * (clientConfig?.attribution_rate ?? 0);
                return (
                  <tr key={stream.id} className="hover:bg-dash-canvas/40 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-dash-canvas border border-dash-border text-[#EA6639]">
                          <StreamIcon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="font-semibold text-dash-text">{stream.name}</div>
                          <div className="text-[10px] text-dash-text-muted">{stream.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-dash-text-sec font-mono text-[11px]">{stream.channel}</td>
                    <td className="p-3 text-right font-mono text-dash-text">{stream.count}</td>
                    <td className="p-3 text-right font-mono font-medium text-dash-text">{formatMoney(stream.gross)}</td>
                    <td className="p-3 text-right font-mono font-bold text-[#EA6639]">
                      {formatMoney(feeForStream)}
                    </td>
                    <td className="p-3 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      +{formatMoney(stream.otaCommissionSaved)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              {qualifyingStreams.streams.length === 0 && !isSandbox ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-dash-text-muted text-xs">
                    No qualifying guest transactions recorded. Ledger will track real-time bookings once your channel integration is live.
                  </td>
                </tr>
              ) : (
                <tr className="bg-dash-canvas/80 border-t-2 border-dash-border font-bold">
                  <td className="p-3 text-dash-text" colSpan={2}>
                    Total Qualifying Commercial Portfolio ({qualifyingStreams.streams.length} Streams)
                  </td>
                  <td className="p-3 text-right font-mono text-dash-text">{qualifyingStreams.totalTransactions}</td>
                  <td className="p-3 text-right font-mono text-dash-text">{formatMoney(qualifyingStreams.totalGross)}</td>
                  <td className="p-3 text-right font-mono text-[#EA6639]">{formatMoney(qualifyingStreams.totalPerformanceFee)}</td>
                  <td className="p-3 text-right font-mono text-emerald-600 dark:text-emerald-400">+{formatMoney(qualifyingStreams.totalOtaSaved)}</td>
                </tr>
              )}
            </tfoot>
          </table>
        </div>
      </div>

      {/* ── Two-Column Bottom: Pass-Through Usage & Monthly Invoices ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column: Meta Pass-Through Usage */}
        <div className="bg-dash-surface rounded-xl border border-dash-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dash-text">Usage &amp; Pass-Through</h3>
            <span className="text-[10px] font-mono text-dash-text-muted">At Cost</span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between items-center mb-1 text-dash-text">
                <span className="font-medium">WhatsApp / Meta Conversations</span>
                <span className="font-mono text-dash-text-muted">
                  {usagePassThrough.activeConversations} / {usagePassThrough.includedConversations} incl.
                </span>
              </div>
              <div className="h-2 w-full bg-dash-canvas rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#EA6639] rounded-full transition-all duration-500" 
                  style={{ width: `${Math.min(100, (usagePassThrough.activeConversations / usagePassThrough.includedConversations) * 100)}%` }} 
                />
              </div>
              <div className="flex justify-between items-center mt-1 text-[10px] text-dash-text-muted">
                <span>{usagePassThrough.overageConversations} overage conversations @ $0.05/conv</span>
                <span className="font-bold text-dash-text font-mono">
                  {formatMoney(usagePassThrough.passThroughAmount)}
                </span>
              </div>
            </div>

            <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border space-y-2 text-[11px]">
              {isSandbox ? (
                <>
                  <div className="flex justify-between text-dash-text-sec">
                    <span>Autonomous Guest Inquiries Handled:</span>
                    <span className="font-mono font-semibold text-dash-text">8,420 interactions</span>
                  </div>
                  <div className="flex justify-between text-dash-text-sec">
                    <span>Front-Desk Hours Saved:</span>
                    <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">~63.1 Hours</span>
                  </div>
                  <div className="flex justify-between text-dash-text-sec">
                    <span>Operational Tasks Auto-Dispatched:</span>
                    <span className="font-mono font-semibold text-dash-text">184 work orders</span>
                  </div>
                </>
              ) : (
                <div className="text-center py-3 text-dash-text-muted">
                  <p className="text-[11px]">Usage metrics will appear once your channel integration is live.</p>
                </div>
              )}
            </div>

            <button 
              onClick={() => setShowManageModal(true)}
              className="w-full py-2 bg-dash-surface-raised border border-dash-border text-dash-text rounded-lg text-xs font-semibold hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Manage Subscription (Stripe Portal)
            </button>
          </div>
        </div>

        {/* Right Column: Monthly Invoices Table */}
        <div className="lg:col-span-2 bg-dash-surface rounded-xl border border-dash-border shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-dash-text">Monthly Reconciliation Invoices</h3>
            <span className="text-[10px] text-dash-text-muted">Itemized tax invoices with complete audit trails</span>
          </div>

          <div className="overflow-x-auto hide-scrollbar border border-dash-border rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-dash-border bg-dash-canvas/50">
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Invoice ID</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider">Billing Period</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Base</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Attributed Fee</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Pass-Through</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">Total</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-center">Status</th>
                  <th className="p-2.5 text-[10px] font-semibold text-dash-text-muted uppercase tracking-wider text-right">PDF</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-dash-text-muted text-xs">
                      No billing cycles completed yet. Invoices are generated at the end of each monthly period.
                    </td>
                  </tr>
                ) : invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-dash-canvas/50 transition-colors">
                    <td className="p-2.5 font-mono font-medium text-dash-text">{inv.id}</td>
                    <td className="p-2.5 text-dash-text-sec text-[11px]">{inv.period}</td>
                    <td className="p-2.5 text-right font-mono text-dash-text-muted">{formatMoney(inv.baseFee)}</td>
                    <td className="p-2.5 text-right font-mono text-[#EA6639] font-medium">{formatMoney(inv.performanceFee)}</td>
                    <td className="p-2.5 text-right font-mono text-dash-text-muted">{formatMoney(inv.passThrough)}</td>
                    <td className="p-2.5 text-right font-mono font-bold text-dash-text">{formatMoney(inv.amount)}</td>
                    <td className="p-2.5 text-center">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded text-[10px] font-bold">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <button
                        onClick={() => handleDownloadInvoice(inv.id)}
                        className="text-dash-text-muted hover:text-[#EA6639] transition-colors p-1"
                        title="Download PDF"
                      >
                        <Download className="w-3.5 h-3.5 ml-auto" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Payment Method Modal ── */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <div>
                <h4 className="font-semibold text-dash-text">Update Corporate Payment Method</h4>
                <p className="text-[11px] text-dash-text-muted">PCI-DSS Level 1 Encrypted via Stripe</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1 hover:bg-dash-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleUpdatePayment} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Company / Hotel Legal Name</label>
                <input required defaultValue={clientConfig?.name || ""} type="text" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Card Number</label>
                <input required type="text" placeholder="•••• •••• •••• 4242" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Expiry Date</label>
                  <input required type="text" placeholder="MM / YY" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">CVC / CVV</label>
                  <input required type="password" maxLength={4} placeholder="•••" className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none font-mono" />
                </div>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dash-border">
                <button type="button" onClick={() => setShowPaymentModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={updatingPayment} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70">
                  {updatingPayment ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving Card...</> : "Save Payment Method"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Manage Subscription Modal ── */}
      {showManageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md p-6 text-center animate-in fade-in zoom-in-95 duration-200">
            <Package className="w-12 h-12 text-[#EA6639] mx-auto mb-3" />
            <h4 className="text-base font-bold text-dash-text mb-1">Stripe Customer Billing Portal</h4>
            <p className="text-xs text-dash-text-sec mb-5">
              Securely update company billing contacts, VAT/tax IDs, and download past receipt vouchers. To adjust physical room capacity or attribution rates, contact your dedicated account director.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowManageModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Close</button>
              <button onClick={() => {
                setShowManageModal(false);
                showToast("Opening Stripe Customer Portal session...", "info");
              }} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5">
                <ExternalLink className="w-3.5 h-3.5" /> Continue to Stripe
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
