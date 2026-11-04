import React, { useState } from "react";
import {
  Building2, Check, ChevronRight, Loader2, Rocket,
  ShieldCheck, Globe, Server, Zap, Copy, CheckCircle2, AlertCircle
} from "lucide-react";
import { useSandbox } from "../../../context/SandboxDataContext";

const TIERS = [
  { id: "starter",    label: "Starter",    price: "N99k/mo",  desc: "WhatsApp bot, FAQ handling, basic CRM routing", color: "border-zinc-400/30 bg-zinc-500/5" },
  { id: "growth",     label: "Growth",     price: "N299k/mo", desc: "Everything in Starter + PMS sync, sentiment analysis, leads dashboard", color: "border-blue-500/30 bg-blue-500/5" },
  { id: "enterprise", label: "Enterprise", price: "N500k/mo", desc: "Full stack: POS/PMS, multi-channel, custom AI persona, SLA guarantee", color: "border-[#EA6639]/30 bg-[#EA6639]/5" },
];

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp Business", icon: "X" },
  { id: "sms",      label: "SMS (Twilio)",       icon: "S" },
  { id: "email",    label: "Email (Brevo)",       icon: "E" },
  { id: "ig",       label: "Instagram DM",        icon: "I" },
];

const STEPS = ["Hotel Details", "Service Tier", "Channels", "Review & Deploy"];

const autoSlug = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/, "");

export function HotelProvisioningTab({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { isSandbox } = useSandbox();
  const [step, setStep]           = useState(0);
  const [deploying, setDeploying] = useState(false);
  const [deployed, setDeployed]   = useState(false);
  const [deployError, setDeployError] = useState<string | null>(null);
  const [copied, setCopied]       = useState(false);
  const [form, setForm] = useState({
    name: "", slug: "", contactEmail: "", country: "Nigeria",
    tier: "starter", channels: ["whatsapp"] as string[],
    webhookDomain: "", n8nPort: "5678",
  });

  const update = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));
  const toggleChannel = (id: string) =>
    setForm(f => ({ ...f, channels: f.channels.includes(id) ? f.channels.filter(c => c !== id) : [...f.channels, id] }));

  const domain = form.webhookDomain || `${form.slug || "hotel"}.getever.com.ng`;

  const envBlock = [
    `HOTEL_SLUG=${form.slug}`,
    `HOTEL_NAME="${form.name}"`,
    `N8N_PORT=${form.n8nPort}`,
    `BOT_ENGINE_PORT=3001`,
    `WEBHOOK_BASE_URL=https://${domain}`,
    `SUPABASE_URL=https://oieidnsppwooknzofzeq.supabase.co`,
    `SUPABASE_SERVICE_ROLE_KEY=<service-role-key>`,
    `INTERNAL_API_KEY=<generate-32-char-secret>`,
    `PMS_DATABASE_URL=<pms-postgres-connection-string>`,
    `PAYMENT_PROVIDER=paystack`,
    `PAYSTACK_SECRET_KEY=<your-paystack-secret>`,
  ].join("\n");

  const handleDeploy = async () => {
    setDeploying(true);
    setDeployError(null);

    if (isSandbox) {
      setTimeout(() => {
        setDeploying(false);
        setDeployed(true);
      }, 1500);
      return;
    }

    try {
      const res = await fetch("/api/admin/provision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Provisioning failed");
      }
      setDeployed(true);
    } catch (err: any) {
      setDeployError(err.message || "Failed to provision hotel instance");
    } finally {
      setDeploying(false);
    }
  };

  const reset = () => { setDeployed(false); setStep(0); setForm({ name: "", slug: "", contactEmail: "", country: "Nigeria", tier: "starter", channels: ["whatsapp"], webhookDomain: "", n8nPort: "5678" }); };

  if (deployed) {
    return (
      <div className="p-3 md:p-5 h-full overflow-y-auto hide-scrollbar flex flex-col items-center justify-center">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-dash-text mb-2">Deployment Initiated!</h2>
            <p className="text-sm text-dash-text-sec leading-relaxed">
              <strong className="text-dash-text">{form.name}</strong> ({form.slug}-prod) has been queued. Stack live in 2-5 mins.
            </p>
          </div>
          <div className="bg-dash-surface rounded-xl border border-dash-border p-4 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted">.env template</span>
              <button
                onClick={() => { navigator.clipboard.writeText(envBlock); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1 text-[10px] font-semibold text-dash-green hover:underline"
              >
                {copied ? <><Check className="w-3 h-3" />Copied!</> : <><Copy className="w-3 h-3" />Copy</>}
              </button>
            </div>
            <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">{envBlock}</pre>
          </div>
          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 py-2.5 px-4 bg-dash-surface border border-dash-border rounded-xl text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors">Provision Another</button>
            <button onClick={() => onNavigate?.("deployments")} className="flex-1 py-2.5 px-4 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-colors">View Deployments</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-5 space-y-5 h-full overflow-y-auto hide-scrollbar">
      <div>
        <h2 className="text-header font-bold text-dash-text">Hotel Provisioning Wizard</h2>
        <p className="text-body text-dash-text-sec mt-0.5">Deploy a new hotel client stack in minutes.</p>
      </div>

      <div className="flex items-center gap-0 flex-wrap">
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${i === step ? "bg-[#EA6639] text-white" : i < step ? "text-emerald-600 hover:bg-emerald-500/10 cursor-pointer" : "text-dash-text-muted cursor-default"}`}
            >
              {i < step ? <Check className="w-3 h-3" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight className="w-4 h-4 text-dash-text-muted shrink-0" />}
          </React.Fragment>
        ))}
      </div>

      {step === 0 && (
        <div className="bg-dash-surface rounded-xl border border-dash-border p-5 space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-dash-text flex items-center gap-2"><Building2 className="w-4 h-4 text-[#EA6639]" />Hotel Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">Hotel Name *</label>
              <input value={form.name} onChange={e => { update("name", e.target.value); update("slug", autoSlug(e.target.value)); }} placeholder="The Grand Horizon Resort"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">Hotel Slug *</label>
              <input value={form.slug} onChange={e => update("slug", autoSlug(e.target.value))} placeholder="grand-horizon"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text font-mono focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
              <p className="text-[10px] text-dash-text-muted mt-1">Used as container prefix and subdomain.</p>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">Contact Email *</label>
              <input type="email" value={form.contactEmail} onChange={e => update("contactEmail", e.target.value)} placeholder="manager@hotel.com"
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">Country</label>
              <select value={form.country} onChange={e => update("country", e.target.value)}
                className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:outline-none focus:ring-2 focus:ring-[#EA6639]">
                <option>Nigeria</option><option>Kenya</option><option>Ghana</option><option>South Africa</option><option>Other</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <button onClick={() => setStep(1)} disabled={!form.name || !form.slug || !form.contactEmail}
              className="px-5 py-2.5 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
              Next: Service Tier <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-dash-text flex items-center gap-2"><Zap className="w-4 h-4 text-[#EA6639]" />Select Service Tier</h3>
          <div className="space-y-3">
            {TIERS.map(t => (
              <button key={t.id} onClick={() => update("tier", t.id)}
                className={`w-full p-4 rounded-xl border text-left transition-all ${t.color} ${form.tier === t.id ? "ring-2 ring-[#EA6639]" : ""}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-dash-text">{t.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-dash-text-sec">{t.price}</span>
                    {form.tier === t.id && <Check className="w-4 h-4 text-[#EA6639]" />}
                  </div>
                </div>
                <p className="text-xs text-dash-text-sec">{t.desc}</p>
              </button>
            ))}
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(0)} className="px-4 py-2 bg-dash-surface border border-dash-border rounded-xl text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors">Back</button>
            <button onClick={() => setStep(2)} className="px-5 py-2.5 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-colors flex items-center gap-2">
              Next: Channels <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-dash-text flex items-center gap-2"><Globe className="w-4 h-4 text-[#EA6639]" />Communication Channels</h3>
          <div className="grid grid-cols-2 gap-3">
            {CHANNELS.map(ch => (
              <button key={ch.id} onClick={() => toggleChannel(ch.id)}
                className={`p-4 rounded-xl border text-left transition-all flex items-center gap-3 ${form.channels.includes(ch.id) ? "border-[#EA6639] bg-[#EA6639]/5 ring-1 ring-[#EA6639]" : "border-dash-border bg-dash-surface hover:bg-dash-surface-hover"}`}>
                <span className="w-7 h-7 rounded-lg bg-dash-canvas border border-dash-border flex items-center justify-center text-xs font-bold text-dash-text-muted">{ch.icon}</span>
                <span className="text-xs font-semibold text-dash-text">{ch.label}</span>
                {form.channels.includes(ch.id) && <Check className="w-4 h-4 text-[#EA6639] ml-auto" />}
              </button>
            ))}
          </div>
          <div className="bg-dash-surface rounded-xl border border-dash-border p-4 space-y-3">
            <h4 className="text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted flex items-center gap-1.5"><Server className="w-3 h-3" />Infrastructure Config</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">Webhook Domain</label>
                <input value={form.webhookDomain} onChange={e => update("webhookDomain", e.target.value)} placeholder={`${form.slug || "hotel"}.getever.com.ng`}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text font-mono focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
              </div>
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-dash-text-muted mb-1.5">n8n Port</label>
                <input value={form.n8nPort} onChange={e => update("n8nPort", e.target.value)} placeholder="5678"
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text font-mono focus:outline-none focus:ring-2 focus:ring-[#EA6639]" />
              </div>
            </div>
          </div>
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(1)} className="px-4 py-2 bg-dash-surface border border-dash-border rounded-xl text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors">Back</button>
            <button onClick={() => setStep(3)} disabled={form.channels.length === 0}
              className="px-5 py-2.5 bg-[#EA6639] hover:bg-[#EA6639]/90 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-2">
              Review and Deploy <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 max-w-2xl">
          <h3 className="text-sm font-bold text-dash-text flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#EA6639]" />Review and Deploy</h3>
          <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden">
            {[
              { label: "Hotel Name",     value: form.name },
              { label: "Slug / Prefix",  value: form.slug,        mono: true },
              { label: "Contact Email",  value: form.contactEmail },
              { label: "Country",        value: form.country },
              { label: "Service Tier",   value: TIERS.find(t => t.id === form.tier)?.label ?? form.tier },
              { label: "Channels",       value: form.channels.join(", "), mono: true },
              { label: "Webhook Domain", value: domain,           mono: true },
              { label: "n8n Port",       value: form.n8nPort,     mono: true },
            ].map((row, i) => (
              <div key={i} className={`flex justify-between items-center px-4 py-3 text-xs ${i % 2 === 0 ? "bg-dash-canvas/50" : ""}`}>
                <span className="text-dash-text-muted font-medium">{row.label}</span>
                <span className={`text-dash-text ${row.mono ? "font-mono" : "font-semibold"}`}>{row.value || "—"}</span>
              </div>
            ))}
          </div>
          {deployError && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-600">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{deployError}</span>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <button onClick={() => setStep(2)} className="px-4 py-2 bg-dash-surface border border-dash-border rounded-xl text-xs font-semibold text-dash-text hover:bg-dash-surface-hover transition-colors">Back</button>
            <button onClick={handleDeploy} disabled={deploying}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-70 flex items-center gap-2">
              {deploying ? <><Loader2 className="w-4 h-4 animate-spin" />Deploying Stack...</> : <><Rocket className="w-4 h-4" />Deploy Now</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}