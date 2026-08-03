import React, { useState, useEffect } from "react";
import { Smartphone, Code, Instagram, MessageCircle } from "lucide-react";

interface ChannelAccount {
  id: string;
  display_name?: string;
  phone_number?: string;
  phone_number_id?: string;
  ig_username?: string;
  ig_account_id?: string;
  status: string;
  connected_via?: string;
  connected_at?: string;
}

export function ChannelsTab({ role }: { role?: string }) {
  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");
  
  const [waAccounts, setWaAccounts] = useState<ChannelAccount[]>([]);
  const [igAccounts, setIgAccounts] = useState<ChannelAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [igLoading, setIgLoading] = useState(false);

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

  const fetchWaAccounts = async () => {
    try {
      const res = await fetch("/api/channels/whatsapp");
      const data = await res.json();
      setWaAccounts(data || []);
    } catch (err) {
      console.error("Error fetching WA accounts", err);
    }
  };

  const fetchIgAccounts = async () => {
    try {
      const res = await fetch("/api/channels/instagram");
      const data = await res.json();
      setIgAccounts(data || []);
    } catch (err) {
      // Instagram not yet wired to Supabase - gracefully ignore
      console.log("Instagram channel fetch skipped:", err);
    }
  };

  useEffect(() => {
    fetchWaAccounts();
    fetchIgAccounts();
  }, []);

  const handleWaConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setLoading(true);
    try {
      const res = await fetch("/api/channels/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(waForm)
      });
      const data = await res.json();
      if (data.success) {
        await fetchWaAccounts();
        setWaForm({ phone_number: "", phone_number_id: "", waba_id: "", display_name: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIgConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIgLoading(true);
    try {
      const res = await fetch("/api/channels/instagram/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...igForm,
          service: "instagram"  // OpenBSP token mint with service=instagram
        })
      });
      const data = await res.json();
      if (data.success) {
        await fetchIgAccounts();
        setIgForm({ ig_username: "", ig_account_id: "", display_name: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIgLoading(false);
    }
  };

  const isWaConnected = waAccounts.length > 0;
  const isIgConnected = igAccounts.length > 0;
  const connectedWa = waAccounts[0];
  const connectedIg = igAccounts[0];

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-header font-semibold text-dash-text">Channel Integrations</h2>
        <p className="text-dash-text-sec mt-1">Self-service setup for connecting guest messaging channels.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* WhatsApp Card */}
        <div className="bg-dash-surface rounded-lg border border-dash-border overflow-hidden flex flex-col">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-8 rounded-md bg-[#25D366]/10 flex items-center justify-center text-[#25D366] mb-3">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${isWaConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
              {isWaConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">WhatsApp Business (OpenBSP)</h3>
            <p className="text-xs text-dash-text-sec mb-4">Connect via OpenBSP Embedded Signup for global messaging reach.</p>
            
            {isWaConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Display Name</label>
                  <input type="text" value={connectedWa.display_name} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">WhatsApp Number</label>
                  <input type="text" value={connectedWa.phone_number} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Phone Number ID</label>
                  <input type="text" value={connectedWa.phone_number_id} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
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
                  <button type="submit" disabled={loading} className="w-full py-2 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors mt-2">
                    {loading ? "Connecting..." : "Connect via OpenBSP"}
                  </button>
                )}
              </form>
            )}
          </div>
          {isWaConnected && !isReadOnly && (
            <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
              <button onClick={() => setWaAccounts([])} className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Disconnect</button>
            </div>
          )}
        </div>

        {/* Instagram Card */}
        <div className="bg-dash-surface rounded-lg border border-dash-border overflow-hidden flex flex-col">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-8 rounded-md bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C] mb-3">
              <Instagram className="w-5 h-5" />
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${isIgConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-zinc-100 text-zinc-600'}`}>
              {isIgConnected ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">Instagram DMs (OpenBSP)</h3>
            <p className="text-xs text-dash-text-sec mb-4">Connect your Instagram Business account via OpenBSP Embedded Signup to receive and reply to guest DMs.</p>

            {isIgConnected ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Display Name</label>
                  <input type="text" value={connectedIg.display_name} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Instagram Username</label>
                  <input type="text" value={connectedIg.ig_username} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">IG Account ID</label>
                  <input type="text" value={connectedIg.ig_account_id} readOnly className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-xs text-dash-text-muted" />
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
                  <button type="submit" disabled={igLoading} className="w-full py-2 bg-[#E1306C] text-white rounded-md text-xs font-medium hover:bg-[#E1306C]/90 transition-colors mt-2">
                    {igLoading ? "Connecting..." : "Connect via OpenBSP"}
                  </button>
                )}
              </form>
            )}
          </div>
          {isIgConnected && !isReadOnly && (
            <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
              <button onClick={() => setIgAccounts([])} className="flex-1 py-2 text-xs font-medium text-red-600 border border-red-200 rounded-md hover:bg-red-50 transition-colors">Disconnect</button>
            </div>
          )}
        </div>

        {/* Website Widget Card */}
        <div className="bg-dash-surface rounded-lg border border-dash-border overflow-hidden flex flex-col">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-8 rounded-md bg-dash-green/10 flex items-center justify-center text-dash-green mb-3">
              <Code className="w-5 h-5" />
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-emerald-100 text-emerald-700">Connected</span>
          </div>
          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">Website Widget</h3>
            <p className="text-xs text-dash-text-sec mb-4">Embed our native floating chat widget on your site.</p>
            <div className="p-3 bg-dash-surface rounded-md overflow-x-auto">
              <code className="text-xs text-emerald-400 whitespace-nowrap">
                &lt;script src="https://cdn.ever.ai/widget.js" data-token="ev_xyz"&gt;&lt;/script&gt;
              </code>
            </div>
          </div>
          <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
            <button disabled={isReadOnly} className="flex-1 py-2 text-xs font-medium text-dash-text border border-dash-border rounded-md hover:bg-white transition-colors disabled:opacity-50">Configure Colors</button>
          </div>
        </div>

        {/* Messenger Card */}
        <div className="bg-dash-surface rounded-lg border border-dash-border overflow-hidden flex flex-col">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-8 rounded-md bg-blue-50 flex items-center justify-center text-blue-500 mb-3">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="px-2 py-1 rounded text-xs font-medium bg-zinc-100 text-zinc-600">Disconnected</span>
          </div>
          <div className="p-5 flex-1">
            <h3 className="font-semibold text-dash-text mb-1">Facebook Messenger</h3>
            <p className="text-xs text-dash-text-sec mb-4">Connect your Facebook Page to receive Messenger conversations.</p>
            <div className="text-xs text-dash-text-muted bg-dash-canvas p-3 rounded-md border border-dash-border-hairline">
              Requires Facebook Page Admin access to authorize the Ever AGI application.
            </div>
          </div>
          <div className="p-4 border-t border-dash-border-hairline bg-dash-canvas flex gap-2">
            <button disabled={isReadOnly} className="flex-1 py-2 text-xs font-medium bg-dash-green text-dash-green-text rounded-md hover:bg-dash-green-hover transition-colors disabled:opacity-50">Connect Account</button>
          </div>
        </div>

      </div>
    </div>
  );
}
