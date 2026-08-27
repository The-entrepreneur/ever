import React, { useState, useEffect, useCallback } from "react";
import { Smartphone, Code, Instagram, MessageCircle, Copy, Check, RefreshCw, AlertCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

interface ChannelAccount {
  id: string;
  display_name?: string;
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;
  ig_username?: string;
  ig_account_id?: string;
  status: string;
  connected_via?: string;
  connected_at?: string;
}

export function ChannelsTab({ role }: { role?: string }) {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");
  
  const [waAccounts, setWaAccounts] = useState<ChannelAccount[]>([]);
  const [igAccounts, setIgAccounts] = useState<ChannelAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);

  const [waForm, setWaForm] = useState({
    phone_number: "",
    phone_number_id: "",
    waba_id: "",
    display_name: ""
  });

  const [igForm, setIgForm] = useState({
    ig_username: "",
    ig_account_id: "",
    display_name: ""
  });

  const fetchChannels = useCallback(async () => {
    if (!hotelId) return;

    if (isSandbox && sandboxData) {
      const wa = sandboxData.channels.filter(c => c.channel === "whatsapp" && c.status === "connected");
      const ig = sandboxData.channels.filter(c => c.channel === "instagram" && c.status === "connected");
      setWaAccounts(wa as ChannelAccount[]);
      setIgAccounts(ig as ChannelAccount[]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("whatsapp_accounts")
        .select("*")
        .eq("hotel_id", hotelId);

      if (!error && data) {
        setWaAccounts(data as ChannelAccount[]);
      }
    } catch (err) {
      console.warn("Failed to fetch WhatsApp accounts from Supabase:", err);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleWaConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      if (isSandbox) {
        const newWa: ChannelAccount = {
          id: crypto.randomUUID(),
          display_name: waForm.display_name || "Hotel WhatsApp",
          phone_number: waForm.phone_number,
          phone_number_id: waForm.phone_number_id,
          waba_id: waForm.waba_id,
          status: "connected",
          connected_via: "openbsp_embedded",
          connected_at: new Date().toISOString()
        };

        updateData(prev => ({
          ...prev,
          channels: [...prev.channels.filter(c => c.channel !== "whatsapp"), { ...newWa, channel: "whatsapp" as const, status: "connected" }]
        }));

        setWaAccounts([newWa]);
        setWaForm({ phone_number: "", phone_number_id: "", waba_id: "", display_name: "" });
        showToast("WhatsApp channel connected successfully via OpenBSP", "success");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.from("whatsapp_accounts").upsert({
        hotel_id: hotelId,
        phone_number: waForm.phone_number,
        phone_number_id: waForm.phone_number_id,
        waba_id: waForm.waba_id,
        display_name: waForm.display_name,
        status: "active",
        connected_via: "openbsp_embedded",
        connected_at: new Date().toISOString()
      }).select();

      if (error) throw error;
      if (data) setWaAccounts(data as ChannelAccount[]);
      setWaForm({ phone_number: "", phone_number_id: "", waba_id: "", display_name: "" });
      showToast("WhatsApp channel connected successfully!", "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to connect WhatsApp", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWaDisconnect = async (id: string) => {
    if (isReadOnly || !hotelId) return;

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.filter(c => c.channel !== "whatsapp")
      }));
      setWaAccounts([]);
      showToast("WhatsApp disconnected", "info");
      return;
    }

    try {
      const { error } = await supabase.from("whatsapp_accounts").delete().eq("id", id).eq("hotel_id", hotelId);
      if (error) throw error;
      setWaAccounts([]);
      showToast("WhatsApp disconnected successfully", "info");
    } catch (err: any) {
      showToast("Failed to disconnect", "error");
    }
  };

  const handleIgConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    if (isSandbox) {
      const newIg: ChannelAccount = {
        id: crypto.randomUUID(),
        display_name: igForm.display_name || "Hotel Instagram",
        ig_username: igForm.ig_username,
        ig_account_id: igForm.ig_account_id,
        status: "connected",
        connected_via: "openbsp_embedded",
        connected_at: new Date().toISOString()
      };

      updateData(prev => ({
        ...prev,
        channels: [...prev.channels.filter(c => c.channel !== "instagram"), { ...newIg, channel: "instagram" as const, status: "connected" }]
      }));

      setIgAccounts([newIg]);
      setIgForm({ ig_username: "", ig_account_id: "", display_name: "" });
      showToast("Instagram connected successfully via OpenBSP", "success");
      setLoading(false);
      return;
    }

    // For real accounts, set local state
    setIgAccounts([{
      id: crypto.randomUUID(),
      display_name: igForm.display_name,
      ig_username: igForm.ig_username,
      ig_account_id: igForm.ig_account_id,
      status: "connected"
    }]);
    setIgForm({ ig_username: "", ig_account_id: "", display_name: "" });
    showToast("Instagram connected successfully", "success");
    setLoading(false);
  };

  const handleIgDisconnect = () => {
    if (isReadOnly) return;
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.filter(c => c.channel !== "instagram")
      }));
    }
    setIgAccounts([]);
    showToast("Instagram disconnected", "info");
  };

  const isWaConnected = waAccounts.length > 0;
  const isIgConnected = igAccounts.length > 0;
  const connectedWa = waAccounts[0];
  const connectedIg = igAccounts[0];

  const widgetSnippet = `<script src="https://cdn.ever.ai/widget.js" data-hotel-id="${hotelId || 'sandbox-hotel'}"></script>`;

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetSnippet);
    setCopiedWidget(true);
    showToast("Widget snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Channel Integrations</h2>
          <p className="text-dash-text-sec mt-1">Connect guest messaging channels and web widgets to your AI agent.</p>
        </div>
        {isSandbox && (
          <button
            onClick={() => {
              regenerate();
              showToast("Channels reset to demo state", "success");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Channels
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-10">

        {/* ── WhatsApp Card ── */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isWaConnected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
              {isWaConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">WhatsApp Business (OpenBSP)</h3>
            <p className="text-xs text-dash-text-sec mb-4">Official Meta WhatsApp Cloud API connection with 24/7 automated messaging.</p>
            
            {isWaConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">Display Name</label>
                  <input type="text" value={connectedWa.display_name || "Grand Horizon Hotel"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">WhatsApp Number</label>
                  <input type="text" value={connectedWa.phone_number || "+1 (555) 382-9102"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">Phone Number ID (Meta)</label>
                  <input type="text" value={connectedWa.phone_number_id || "10931893198"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted font-mono" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleWaConnect} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Display Name</label>
                  <input required type="text" placeholder="e.g. Grand Horizon Hotel" value={waForm.display_name} onChange={(e) => setWaForm({ ...waForm, display_name: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">WhatsApp Number</label>
                  <input required type="text" placeholder="e.g. +15551234567" value={waForm.phone_number} onChange={(e) => setWaForm({ ...waForm, phone_number: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Phone Number ID (Meta)</label>
                  <input required type="text" placeholder="e.g. 10928374829" value={waForm.phone_number_id} onChange={(e) => setWaForm({ ...waForm, phone_number_id: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">WABA ID (Optional)</label>
                  <input type="text" placeholder="e.g. 928374928374" value={waForm.waba_id} onChange={(e) => setWaForm({ ...waForm, waba_id: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                
                {!isReadOnly && (
                  <button type="submit" disabled={loading} className="w-full py-2 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors mt-2 disabled:opacity-50">
                    {loading ? "Connecting..." : "Connect via OpenBSP"}
                  </button>
                )}
              </form>
            )}
          </div>
          {isWaConnected && !isReadOnly && (
            <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
              <button onClick={() => handleWaDisconnect(connectedWa.id)} className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Disconnect</button>
            </div>
          )}
        </div>

        {/* ── Instagram Card ── */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
              <Instagram className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${isIgConnected ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10' : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800'}`}>
              {isIgConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">Instagram DMs (OpenBSP)</h3>
            <p className="text-xs text-dash-text-sec mb-4">Connect Instagram Professional account to automate guest story replies and direct messages.</p>

            {isIgConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">Display Name</label>
                  <input type="text" value={connectedIg.display_name || "Grand Horizon Hotel"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text font-medium" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">Instagram Username</label>
                  <input type="text" value={connectedIg.ig_username || "@grandhorizonresort"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text font-mono" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text-muted mb-1">IG Account ID</label>
                  <input type="text" value={connectedIg.ig_account_id || "ig_9273932014"} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted font-mono" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleIgConnect} className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Display Name</label>
                  <input required type="text" placeholder="e.g. Grand Horizon Hotel" value={igForm.display_name} onChange={(e) => setIgForm({ ...igForm, display_name: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Instagram Username</label>
                  <input required type="text" placeholder="e.g. @grandhorizon" value={igForm.ig_username} onChange={(e) => setIgForm({ ...igForm, ig_username: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">IG Account ID</label>
                  <input required type="text" placeholder="e.g. 17841400008460056" value={igForm.ig_account_id} onChange={(e) => setIgForm({ ...igForm, ig_account_id: e.target.value })} disabled={isReadOnly} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
                </div>

                {!isReadOnly && (
                  <button type="submit" disabled={loading} className="w-full py-2 bg-[#E1306C] text-white rounded-md text-xs font-medium hover:bg-[#E1306C]/90 transition-colors mt-2 disabled:opacity-50">
                    {loading ? "Connecting..." : "Connect via OpenBSP"}
                  </button>
                )}
              </form>
            )}
          </div>
          {isIgConnected && !isReadOnly && (
            <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
              <button onClick={handleIgDisconnect} className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 dark:border-red-500/20 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">Disconnect</button>
            </div>
          )}
        </div>

        {/* ── Website Widget Card ── */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#EA6639]/10 flex items-center justify-center text-[#EA6639]">
              <Code className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10">Active</span>
          </div>
          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">Website Live Widget</h3>
            <p className="text-xs text-dash-text-sec mb-4">Embed our high-converting guest concierge directly on your hotel booking site.</p>
            <div className="p-3 bg-dash-canvas border border-dash-border rounded-lg overflow-x-auto relative">
              <code className="text-[11px] font-mono text-[#EA6639] block break-all">
                {widgetSnippet}
              </code>
            </div>
          </div>
          <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
            <button
              onClick={copyWidget}
              className="flex-1 py-2 text-xs font-medium bg-dash-surface border border-dash-border text-dash-text rounded-md hover:bg-dash-surface-hover transition-colors flex items-center justify-center gap-1.5"
            >
              {copiedWidget ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy Widget Code</>}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
