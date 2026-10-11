import React, { useState, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Plus, 
  Play, 
  Square, 
  Settings, 
  KeyRound, 
  Copy, 
  Check, 
  Send, 
  Clock, 
  Sparkles, 
  Building2, 
  BedDouble, 
  ShieldCheck, 
  Coins, 
  Layers, 
  ExternalLink,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  X
} from "lucide-react";
import { 
  getAllInvites, 
  mintOnboardingToken, 
  HospitalityTier, 
  OperationalModules, 
  OnboardingInvite,
  getTierLabel
} from "../../../utils/onboardingTokens";
import { useToast } from "../../../shared/ToastContext";

interface ClientRecord {
  id: string;
  name: string;
  slug: string;
  tier: HospitalityTier;
  roomCount: number;
  baseFee: number;
  attributionRate: number; // e.g. 0.025 for 2.5%
  onboardingFee: number;
  onboardingStatus: "paid" | "waived" | "pending";
  operationalModules: OperationalModules;
  status: "Active" | "Inactive" | "Deploying";
  createdAt: string;
  contactEmail: string;
}

const INITIAL_CLIENTS: ClientRecord[] = [
  {
    id: "c-1",
    name: "The Grand Horizon Resort",
    slug: "grand-horizon",
    tier: "resort",
    roomCount: 75,
    baseFee: 599,
    attributionRate: 0.02,
    onboardingFee: 1200,
    onboardingStatus: "paid",
    operationalModules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: true,
      maintenance: true,
      upsells: true,
    },
    status: "Active",
    createdAt: "2024-01-15",
    contactEmail: "gm@grandhorizon.com",
  },
  {
    id: "c-2",
    name: "Oceanview Boutique & Villas",
    slug: "oceanview-boutique",
    tier: "estate",
    roomCount: 36,
    baseFee: 349,
    attributionRate: 0.025,
    onboardingFee: 650,
    onboardingStatus: "waived",
    operationalModules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: false,
      maintenance: true,
      upsells: true,
    },
    status: "Active",
    createdAt: "2024-02-28",
    contactEmail: "operations@oceanviewhotel.com",
  },
  {
    id: "c-3",
    name: "Alpine Lodge & Wellness Spa",
    slug: "alpine-lodge",
    tier: "estate",
    roomCount: 42,
    baseFee: 349,
    attributionRate: 0.025,
    onboardingFee: 650,
    onboardingStatus: "paid",
    operationalModules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: true,
      maintenance: true,
      upsells: true,
    },
    status: "Active",
    createdAt: "2024-03-10",
    contactEmail: "admin@alpinelodge.com",
  },
  {
    id: "c-4",
    name: "Sunset Palms Beach Villas",
    slug: "sunset-palms",
    tier: "select",
    roomCount: 16,
    baseFee: 99,
    attributionRate: 0.03,
    onboardingFee: 300,
    onboardingStatus: "pending",
    operationalModules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: false,
      maintenance: false,
      upsells: true,
    },
    status: "Active",
    createdAt: "2024-04-05",
    contactEmail: "host@sunsetpalms.com",
  },
];

export function ClientManagementTab() {
  const { showToast } = useToast();
  const [clients, setClients] = useState<ClientRecord[]>(INITIAL_CLIENTS);
  const [invites, setInvites] = useState<OnboardingInvite[]>(() => getAllInvites());

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"clients" | "invites">("clients");

  // Modals state
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientRecord | null>(null);
  const [mintModalClient, setMintModalClient] = useState<ClientRecord | null>(null);

  // Mint modal parameters
  const [mintExpiresHours, setMintExpiresHours] = useState<number>(48);
  const [mintedResult, setMintedResult] = useState<OnboardingInvite | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [emailSending, setEmailSending] = useState(false);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    contactEmail: "",
    tier: "select" as HospitalityTier,
    roomCount: 20,
    baseFee: 99,
    attributionRate: 0.025,
    onboardingFee: 300,
    onboardingStatus: "pending" as "paid" | "waived" | "pending",
    operationalModules: {
      direct_bookings: true,
      housekeeping: true,
      room_service: false,
      maintenance: true,
      upsells: true,
    },
    mintImmediately: true,
  });

  const refreshInvites = () => {
    setInvites(getAllInvites());
  };

  const filteredClients = useMemo(() => {
    return clients.filter((c) => {
      const matchesSearch = 
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTier = tierFilter === "all" || c.tier === tierFilter;
      return matchesSearch && matchesTier;
    });
  }, [clients, searchQuery, tierFilter]);

  const handleOpenAddModal = () => {
    setFormData({
      name: "",
      slug: "",
      contactEmail: "",
      tier: "select",
      roomCount: 20,
      baseFee: 99,
      attributionRate: 0.025,
      onboardingFee: 300,
      onboardingStatus: "pending",
      operationalModules: {
        direct_bookings: true,
        housekeeping: true,
        room_service: false,
        maintenance: true,
        upsells: true,
      },
      mintImmediately: true,
    });
    setIsAddClientOpen(true);
  };

  const handleOpenEditModal = (client: ClientRecord) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      slug: client.slug,
      contactEmail: client.contactEmail,
      tier: client.tier,
      roomCount: client.roomCount,
      baseFee: client.baseFee,
      attributionRate: client.attributionRate,
      onboardingFee: client.onboardingFee,
      onboardingStatus: client.onboardingStatus,
      operationalModules: { ...client.operationalModules },
      mintImmediately: false,
    });
  };

  const handleTierChange = (newTier: HospitalityTier) => {
    let suggestedBase = 99;
    let suggestedSetup = 300;
    let suggestedRooms = 20;
    if (newTier === "estate") {
      suggestedBase = 349;
      suggestedSetup = 650;
      suggestedRooms = 36;
    } else if (newTier === "resort") {
      suggestedBase = 599;
      suggestedSetup = 1200;
      suggestedRooms = 75;
    } else if (newTier === "portfolio") {
      suggestedBase = 1200;
      suggestedSetup = 2500;
      suggestedRooms = 150;
    }

    setFormData((prev) => ({
      ...prev,
      tier: newTier,
      baseFee: suggestedBase,
      onboardingFee: suggestedSetup,
      roomCount: suggestedRooms,
    }));
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.slug || !formData.contactEmail) {
      showToast("Please fill in all required fields", "error");
      return;
    }

    if (editingClient) {
      // Update existing
      setClients((prev) =>
        prev.map((c) =>
          c.id === editingClient.id
            ? {
                ...c,
                name: formData.name,
                slug: formData.slug,
                contactEmail: formData.contactEmail,
                tier: formData.tier,
                roomCount: Number(formData.roomCount),
                baseFee: Number(formData.baseFee),
                attributionRate: Number(formData.attributionRate),
                onboardingFee: Number(formData.onboardingFee),
                onboardingStatus: formData.onboardingStatus,
                operationalModules: { ...formData.operationalModules },
              }
            : c
        )
      );
      setEditingClient(null);
      showToast(`Updated commercial parameters for ${formData.name}`, "success");
    } else {
      // Create new
      const newClient: ClientRecord = {
        id: `c-${Date.now()}`,
        name: formData.name,
        slug: formData.slug,
        contactEmail: formData.contactEmail,
        tier: formData.tier,
        roomCount: Number(formData.roomCount),
        baseFee: Number(formData.baseFee),
        attributionRate: Number(formData.attributionRate),
        onboardingFee: Number(formData.onboardingFee),
        onboardingStatus: formData.onboardingStatus,
        operationalModules: { ...formData.operationalModules },
        status: "Active",
        createdAt: new Date().toISOString().split("T")[0],
      };

      setClients((prev) => [newClient, ...prev]);
      setIsAddClientOpen(false);
      showToast(`Created client tenant: ${newClient.name}`, "success");

      if (formData.mintImmediately) {
        handleOpenMintModal(newClient);
      }
    }
  };

  const handleOpenMintModal = (client: ClientRecord) => {
    setMintModalClient(client);
    setMintExpiresHours(48);
    setMintedResult(null);
    setCopiedToken(false);
  };

  const handleExecuteMint = () => {
    if (!mintModalClient) return;

    const minted = mintOnboardingToken({
      hotel_slug: mintModalClient.slug,
      hotel_name: mintModalClient.name,
      contact_email: mintModalClient.contactEmail,
      tier: mintModalClient.tier,
      room_count: mintModalClient.roomCount,
      base_platform_fee: mintModalClient.baseFee,
      attribution_rate: mintModalClient.attributionRate,
      onboarding_fee: mintModalClient.onboardingFee,
      onboarding_status: mintModalClient.onboardingStatus,
      operational_modules: mintModalClient.operationalModules,
      expires_in_hours: mintExpiresHours,
    });

    setMintedResult(minted);
    refreshInvites();
    showToast(`Minted secure onboarding URL for ${mintModalClient.name}`, "success");
  };

  const getActivationUrl = (token: string) => {
    return `${window.location.origin}/activate?token=${token}`;
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedToken(true);
    showToast("Activation URL copied to clipboard", "success");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const handleSendEmailSimulation = () => {
    setEmailSending(true);
    setTimeout(() => {
      setEmailSending(false);
      showToast(`Activation invitation dispatched to ${mintModalClient?.contactEmail}`, "success");
    }, 1000);
  };

  const toggleClientStatus = (clientId: string) => {
    setClients((prev) =>
      prev.map((c) => {
        if (c.id === clientId) {
          const next = c.status === "Active" ? "Inactive" : "Active";
          showToast(`${c.name} is now ${next}`, "info");
          return { ...c, status: next };
        }
        return c;
      })
    );
  };

  return (
    <div className="p-6 h-full flex flex-col relative text-left">
      {/* ─── Header ─── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#EA6639]" />
            <h2 className="text-xl font-semibold text-dash-text tracking-tight">Client Management & Onboarding</h2>
          </div>
          <p className="text-dash-text-sec text-xs">
            Manage physical estate tiers, fluid commercial terms, and mint secure expiring client onboarding tokens.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="bg-dash-surface border border-dash-border rounded-lg p-0.5 flex text-xs">
            <button
              onClick={() => setViewMode("clients")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                viewMode === "clients"
                  ? "bg-[#EA6639] text-white shadow-xs"
                  : "text-dash-text-sec hover:text-dash-text"
              }`}
            >
              Active Clients ({clients.length})
            </button>
            <button
              onClick={() => {
                refreshInvites();
                setViewMode("invites");
              }}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === "invites"
                  ? "bg-[#EA6639] text-white shadow-xs"
                  : "text-dash-text-sec hover:text-dash-text"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              Token Registry ({invites.length})
            </button>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-3.5 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-semibold hover:bg-[#d85e34] transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" /> Add Hotel Tenant
          </button>
        </div>
      </div>

      {/* ─── Controls & Filter Bar ─── */}
      <div className="bg-dash-surface rounded-t-xl border border-dash-border p-3.5 flex flex-wrap gap-3 items-center justify-between border-b-0">
        <div className="relative w-full max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by hotel name, slug, or contact email..."
            className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-[#EA6639] text-dash-text"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-dash-text-sec">Filter Tier:</span>
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none"
          >
            <option value="all">All Tiers</option>
            <option value="select">Select Property (≤25)</option>
            <option value="estate">Full-Service Estate (26–50)</option>
            <option value="resort">Resort Operations (51–100)</option>
            <option value="portfolio">Portfolio Infrastructure (100+)</option>
          </select>
        </div>
      </div>

      {/* ─── Main Content Views ─── */}
      <div className="bg-dash-surface rounded-b-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-xs">
        {viewMode === "clients" ? (
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[11px] font-mono text-dash-text-sec uppercase bg-dash-canvas border-b border-dash-border tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Property &amp; Contact</th>
                  <th className="px-5 py-3.5 font-semibold">Hospitality Tier</th>
                  <th className="px-5 py-3.5 font-semibold">Rooms</th>
                  <th className="px-5 py-3.5 font-semibold">Commercial Base</th>
                  <th className="px-5 py-3.5 font-semibold">Attribution %</th>
                  <th className="px-5 py-3.5 font-semibold">Active Modules</th>
                  <th className="px-5 py-3.5 font-semibold">Tenant Status</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border/60">
                {filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-dash-surface-hover/50 transition-colors">
                    {/* Property */}
                    <td className="px-5 py-4">
                      <div>
                        <div className="font-semibold text-dash-text text-sm mb-0.5">{client.name}</div>
                        <div className="flex items-center gap-2 text-dash-text-sec text-[11px]">
                          <span className="font-mono text-zinc-400">/{client.slug}</span>
                          <span>•</span>
                          <span className="truncate max-w-[140px]">{client.contactEmail}</span>
                        </div>
                      </div>
                    </td>

                    {/* Tier */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-bold tracking-wider ${
                        client.tier === "select" ? "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200" :
                        client.tier === "estate" ? "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200" :
                        client.tier === "resort" ? "bg-[#EA6639]/15 text-[#EA6639]" :
                        "bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200"
                      }`}>
                        {client.tier}
                      </span>
                    </td>

                    {/* Rooms */}
                    <td className="px-5 py-4 font-mono font-medium text-dash-text">
                      {client.roomCount} Keys
                    </td>

                    {/* Base Fee */}
                    <td className="px-5 py-4 font-mono text-dash-text">
                      ${client.baseFee}<span className="text-dash-text-sec text-[10px]">/mo</span>
                    </td>

                    {/* Attribution */}
                    <td className="px-5 py-4 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                      {(client.attributionRate * 100).toFixed(1)}%
                    </td>

                    {/* Modules */}
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {client.operationalModules.direct_bookings && (
                          <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 rounded text-[9px] font-mono">Bookings</span>
                        )}
                        {client.operationalModules.housekeeping && (
                          <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 rounded text-[9px] font-mono">Housekeeping</span>
                        )}
                        {client.operationalModules.room_service && (
                          <span className="px-1.5 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 rounded text-[9px] font-mono">F&amp;B</span>
                        )}
                        {client.operationalModules.upsells && (
                          <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 rounded text-[9px] font-mono">Upsells</span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        client.status === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${client.status === "Active" ? "bg-emerald-500" : "bg-zinc-400"}`} />
                        {client.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleOpenMintModal(client)}
                          className="px-2.5 py-1.5 bg-[#EA6639]/10 hover:bg-[#EA6639]/20 text-[#EA6639] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                          title="Mint / Re-issue Activation URL"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Mint Link</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(client)}
                          className="p-1.5 text-dash-text-sec hover:text-dash-text rounded-md transition-colors"
                          title="Edit Commercials &amp; Modules"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleClientStatus(client.id)}
                          className={`p-1.5 rounded-md transition-colors ${
                            client.status === "Active" ? "text-amber-600 hover:text-amber-700" : "text-emerald-600 hover:text-emerald-700"
                          }`}
                          title={client.status === "Active" ? "Suspend Tenant" : "Activate Tenant"}
                        >
                          {client.status === "Active" ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* ─── Token Registry View ─── */
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[11px] font-mono text-dash-text-sec uppercase bg-dash-canvas border-b border-dash-border tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 font-semibold">Invite Token</th>
                  <th className="px-5 py-3.5 font-semibold">Target Hotel</th>
                  <th className="px-5 py-3.5 font-semibold">Tier &amp; Rooms</th>
                  <th className="px-5 py-3.5 font-semibold">Status</th>
                  <th className="px-5 py-3.5 font-semibold">Minted At</th>
                  <th className="px-5 py-3.5 font-semibold">Expires At</th>
                  <th className="px-5 py-3.5 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border/60">
                {invites.map((inv) => (
                  <tr key={inv.id} className="hover:bg-dash-surface-hover/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="font-mono text-xs text-[#EA6639] font-medium flex items-center gap-1.5">
                        <KeyRound className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate max-w-[180px]">{inv.token}</span>
                      </div>
                      <div className="text-[11px] text-dash-text-sec truncate max-w-[200px]">
                        {inv.contact_email}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-dash-text">{inv.hotel_name}</div>
                      <div className="text-[11px] text-dash-text-sec font-mono">/{inv.hotel_slug}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="capitalize font-medium text-dash-text">{inv.tier}</span>
                      <span className="text-dash-text-sec text-[11px] block">{inv.room_count} keys</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        inv.status === "claimed" ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300" :
                        inv.status === "expired" ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300" :
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-dash-text-sec text-[11px]">
                      {new Date(inv.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-4 text-dash-text-sec text-[11px]">
                      <div className="flex items-center gap-1 text-zinc-500 font-mono">
                        <Clock className="w-3 h-3 text-zinc-400" />
                        {new Date(inv.expires_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {inv.status === "pending" && (
                        <button
                          onClick={() => handleCopyUrl(getActivationUrl(inv.token))}
                          className="px-2.5 py-1.5 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium inline-flex items-center gap-1 transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy URL</span>
                        </button>
                      )}
                      {inv.status === "claimed" && (
                        <span className="text-xs text-blue-600 font-mono">Activated</span>
                      )}
                      {inv.status === "expired" && (
                        <button
                          onClick={() => {
                            const matchingClient = clients.find(c => c.slug === inv.hotel_slug);
                            if (matchingClient) handleOpenMintModal(matchingClient);
                          }}
                          className="text-xs text-[#EA6639] hover:underline font-medium"
                        >
                          Re-Mint Token
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── MODAL 1: MINT ONBOARDING TOKEN MODAL ─── */}
      {mintModalClient && (
        <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-lg rounded-2xl shadow-2xl border border-dash-border overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4.5 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#EA6639]/15 text-[#EA6639] flex items-center justify-center">
                  <KeyRound className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-dash-text text-sm">Mint Client Activation Token</h3>
                  <p className="text-[11px] text-dash-text-sec">Generate a secure, single-use onboarding URL for {mintModalClient.name}</p>
                </div>
              </div>
              <button 
                onClick={() => setMintModalClient(null)} 
                className="text-dash-text-muted hover:text-dash-text p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Hotel Overview Pill */}
              <div className="bg-dash-canvas p-3.5 rounded-xl border border-dash-border flex justify-between items-center text-xs">
                <div>
                  <div className="font-semibold text-dash-text">{mintModalClient.name}</div>
                  <div className="text-dash-text-sec font-mono text-[11px]">Recipient: {mintModalClient.contactEmail}</div>
                </div>
                <div className="text-right">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#EA6639]/15 text-[#EA6639] uppercase">
                    {mintModalClient.tier}
                  </span>
                  <div className="text-[11px] text-dash-text-sec mt-0.5">{mintModalClient.roomCount} Keys</div>
                </div>
              </div>

              {!mintedResult ? (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-dash-text mb-1.5">
                      Token Lifespan / Expiration Window
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: "24 Hours", value: 24 },
                        { label: "48 Hours (Standard)", value: 48 },
                        { label: "7 Days (RFP)", value: 168 },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMintExpiresHours(opt.value)}
                          className={`p-2.5 rounded-xl border text-xs font-medium text-center transition-all ${
                            mintExpiresHours === opt.value
                              ? "border-[#EA6639] bg-[#EA6639]/10 text-[#EA6639]"
                              : "border-dash-border bg-dash-surface text-dash-text-sec hover:border-dash-border-strong"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-dash-text-sec mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-400" />
                      After expiry, this onboarding URL will automatically refuse registration attempts.
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end gap-2">
                    <button
                      onClick={() => setMintModalClient(null)}
                      className="px-4 py-2 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleExecuteMint}
                      className="px-5 py-2 bg-[#EA6639] hover:bg-[#d85e34] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Mint &amp; Generate URL
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-200 text-xs flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <div className="font-semibold">Onboarding URL Generated</div>
                      <div className="text-[11px] opacity-90">
                        Expires in {mintedResult.expires_in_hours} hours ({new Date(mintedResult.expires_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-dash-text mb-1">
                      One-Time Activation URL
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={getActivationUrl(mintedResult.token)}
                        className="flex-1 px-3 py-2 bg-dash-canvas border border-dash-border rounded-xl text-xs font-mono text-dash-text select-all focus:outline-none"
                      />
                      <button
                        onClick={() => handleCopyUrl(getActivationUrl(mintedResult.token))}
                        className="px-3.5 py-2 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover rounded-xl text-xs font-medium text-dash-text flex items-center gap-1.5 transition-colors"
                      >
                        {copiedToken ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedToken ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-end">
                    <button
                      onClick={handleSendEmailSimulation}
                      disabled={emailSending}
                      className="px-4 py-2 border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      {emailSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                      <span>Dispatch Invitation Email</span>
                    </button>
                    <button
                      onClick={() => setMintModalClient(null)}
                      className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: ADD / EDIT CLIENT MODAL ─── */}
      {(isAddClientOpen || editingClient) && (
        <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-dash-surface w-full max-w-xl rounded-2xl shadow-2xl border border-dash-border overflow-hidden">
            <div className="px-6 py-4.5 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div>
                <h3 className="font-semibold text-dash-text text-sm">
                  {editingClient ? `Edit Commercials: ${editingClient.name}` : "Onboard New Hotel Tenant"}
                </h3>
                <p className="text-[11px] text-dash-text-sec">
                  Configure physical estate profile, commercial fees, and active operational modules.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddClientOpen(false);
                  setEditingClient(null);
                }}
                className="text-dash-text-muted hover:text-dash-text p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Hotel Identity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Hotel Property Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                      setFormData((p) => ({ ...p, name, slug: editingClient ? p.slug : slug }));
                    }}
                    placeholder="e.g. The Grand Azure Hotel"
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-xl text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Hotel Slug ID *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                    placeholder="grand-azure-hotel"
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-xl text-xs font-mono text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">General Manager / Contact Email *</label>
                <input
                  type="email"
                  required
                  value={formData.contactEmail}
                  onChange={(e) => setFormData((p) => ({ ...p, contactEmail: e.target.value }))}
                  placeholder="gm@grandazure.com"
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-xl text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
                />
              </div>

              {/* Physical Hospitality Tier */}
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Hospitality Infrastructure Tier</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { id: "select", name: "Select Property", range: "≤25 Rooms", price: "$99/mo" },
                    { id: "estate", name: "Full-Service Estate", range: "26–50 Rooms", price: "$349/mo" },
                    { id: "resort", name: "Resort Operations", range: "51–100 Rooms", price: "$599/mo" },
                    { id: "portfolio", name: "Portfolio Infra", range: "100+ Rooms", price: "Custom" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleTierChange(t.id as HospitalityTier)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        formData.tier === t.id
                          ? "border-[#EA6639] bg-[#EA6639]/10 text-dash-text"
                          : "border-dash-border bg-dash-canvas text-dash-text-sec hover:border-dash-border-strong"
                      }`}
                    >
                      <div className="font-semibold text-xs text-dash-text">{t.name}</div>
                      <div className="flex justify-between text-[11px] text-dash-text-sec mt-0.5">
                        <span>{t.range}</span>
                        <span className="font-mono text-[#EA6639]">{t.price}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Commercial Parameters */}
              <div className="bg-dash-canvas p-4 rounded-xl border border-dash-border space-y-3">
                <div className="text-xs font-semibold text-dash-text uppercase tracking-wider font-mono">
                  Fluid Commercial Agreement
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-dash-text-sec mb-1">Room Count</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={formData.roomCount}
                      onChange={(e) => setFormData((p) => ({ ...p, roomCount: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-mono text-dash-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-dash-text-sec mb-1">Base Platform Fee ($/mo)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.baseFee}
                      onChange={(e) => setFormData((p) => ({ ...p, baseFee: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-mono text-dash-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-dash-text-sec mb-1">Attribution Rate (1–3%)</label>
                    <div className="flex items-center gap-1">
                      <input
                        type="number"
                        step={0.005}
                        min={0.01}
                        max={0.05}
                        value={formData.attributionRate}
                        onChange={(e) => setFormData((p) => ({ ...p, attributionRate: Number(e.target.value) }))}
                        className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-mono text-dash-text"
                      />
                      <span className="text-[11px] font-mono text-emerald-600 font-bold">
                        {(formData.attributionRate * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] text-dash-text-sec mb-1">Setup / Onboarding Fee ($)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.onboardingFee}
                      onChange={(e) => setFormData((p) => ({ ...p, onboardingFee: Number(e.target.value) }))}
                      className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs font-mono text-dash-text"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-dash-text-sec mb-1">Onboarding Fee Status</label>
                    <select
                      value={formData.onboardingStatus}
                      onChange={(e) => setFormData((p) => ({ ...p, onboardingStatus: e.target.value as any }))}
                      className="w-full px-2.5 py-1.5 bg-dash-surface border border-dash-border rounded-lg text-xs text-dash-text capitalize"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="waived">Waived</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Operational Modules */}
              <div>
                <label className="block text-xs font-semibold text-dash-text mb-2">
                  Configured Operational Modules
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { key: "direct_bookings", label: "Direct In-Chat Bookings", desc: "Checkout & PMS writeback" },
                    { key: "housekeeping", label: "Housekeeping Dispatch", desc: "Towel/cleaning task tickets" },
                    { key: "room_service", label: "In-Room F&B Dining", desc: "POS food & beverage orders" },
                    { key: "maintenance", label: "Maintenance Routing", desc: "Facility ticket escalation" },
                    { key: "upsells", label: "10-Stream Upselling", desc: "Late checkout, upgrades & spa" },
                  ].map((mod) => (
                    <label
                      key={mod.key}
                      className="flex items-start gap-2.5 p-2.5 rounded-xl border border-dash-border bg-dash-canvas cursor-pointer hover:bg-dash-surface-hover/50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.operationalModules[mod.key as keyof OperationalModules]}
                        onChange={(e) =>
                          setFormData((p) => ({
                            ...p,
                            operationalModules: {
                              ...p.operationalModules,
                              [mod.key]: e.target.checked,
                            },
                          }))
                        }
                        className="rounded border-dash-border text-[#EA6639] focus:ring-[#EA6639] mt-0.5"
                      />
                      <div>
                        <div className="font-medium text-dash-text text-xs">{mod.label}</div>
                        <div className="text-[10px] text-dash-text-sec">{mod.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {!editingClient && (
                <label className="flex items-center gap-2 pt-2 text-xs text-dash-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.mintImmediately}
                    onChange={(e) => setFormData((p) => ({ ...p, mintImmediately: e.target.checked }))}
                    className="rounded border-dash-border text-[#EA6639] focus:ring-[#EA6639]"
                  />
                  <span>Immediately mint single-use expiring onboarding URL upon creation</span>
                </label>
              )}

              <div className="pt-4 border-t border-dash-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddClientOpen(false);
                    setEditingClient(null);
                  }}
                  className="px-4 py-2 text-xs font-medium text-dash-text-sec hover:text-dash-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#EA6639] hover:bg-[#d85e34] text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                >
                  {editingClient ? "Save Changes" : "Create Tenant & Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
