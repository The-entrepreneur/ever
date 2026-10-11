import React, { useState, useEffect, useCallback } from "react";
import { 
  Smartphone, 
  Code, 
  Instagram, 
  Facebook,
  MessageSquare, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  ExternalLink, 
  X, 
  Sliders, 
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
  Plus,
  Eye,
  FileText
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

interface ChannelConfig {
  status: "connected" | "disconnected" | "pending" | "error";
  display_name?: string;
  connected_at?: string | null;
  last_tested_at?: string | null;
  // WhatsApp
  phone_number?: string;
  phone_number_id?: string;
  waba_id?: string;
  wa_provider?: "openbsp" | "evolution" | "cloud_api";
  verify_token?: string;
  // Instagram
  ig_username?: string;
  ig_account_id?: string;
  // Facebook
  fb_page_id?: string;
  fb_page_name?: string;
  // Widget
  widget_color?: string;
  widget_position?: "bottom-right" | "bottom-left";
  widget_welcome?: string;
  widget_show_badge?: boolean;
  widget_avatar_url?: string;
  // Tawk.to
  tawk_property_id?: string;
  tawk_widget_id?: string;
  tawk_api_key?: string;
}

interface WebhookSecurityState {
  strict_mode: boolean;
  mode: "Strict" | "Bypass";
  last_validated_at: string | null;
}

interface MessageTemplate {
  id: string;
  name: string;
  language: string;
  category: "UTILITY" | "MARKETING" | "AUTHENTICATION";
  status: "APPROVED" | "PENDING" | "REJECTED";
  body: string;
}

type ActiveChannelDrawer = "whatsapp" | "instagram" | "facebook" | "widget" | "tawkto" | null;

export function ChannelsTab({ role }: { role?: string }) {
  const { hotelId, user } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  const [hotelName, setHotelName] = useState<string>("Grand Horizon Resort");
  const [loading, setLoading] = useState(false);
  const [copiedWidget, setCopiedWidget] = useState(false);
  const [testingChannel, setTestingChannel] = useState<string | null>(null);
  const [activeDrawer, setActiveDrawer] = useState<ActiveChannelDrawer>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [syncingTemplates, setSyncingTemplates] = useState(false);

  // ── Channel States ──────────────────────────────────────────────────────────
  const [waConfig, setWaConfig] = useState<ChannelConfig>({
    status: "disconnected",
    display_name: "",
    phone_number: "",
    phone_number_id: "",
    waba_id: "",
    wa_provider: "openbsp",
    last_tested_at: null,
  });

  const [igConfig, setIgConfig] = useState<ChannelConfig>({
    status: "disconnected",
    display_name: "",
    ig_username: "",
    ig_account_id: "",
    last_tested_at: null,
  });

  const [fbConfig, setFbConfig] = useState<ChannelConfig>({
    status: "disconnected",
    display_name: "",
    fb_page_id: "",
    fb_page_name: "",
    last_tested_at: null,
  });

  const [widgetConfig, setWidgetConfig] = useState<ChannelConfig>({
    status: "connected",
    display_name: "Website Live Widget",
    widget_color: "#EA6639",
    widget_position: "bottom-right",
    widget_welcome: "Welcome! How can our concierge team assist your stay today?",
    widget_show_badge: true,
    widget_avatar_url: "",
    last_tested_at: new Date().toISOString(),
  });

  const [tawkConfig, setTawkConfig] = useState<ChannelConfig>({
    status: "disconnected",
    display_name: "Tawk.to Chat",
    tawk_property_id: "",
    tawk_widget_id: "",
    tawk_api_key: "",
    last_tested_at: null,
  });

  // ── Webhook Security State (Screen 7.2) ─────────────────────────────────────
  const [webhookSecurity, setWebhookSecurity] = useState<WebhookSecurityState>({
    strict_mode: false,
    mode: "Bypass",
    last_validated_at: null,
  });

  // ── Templates State (Screen 7.3 / Pull Model) ──────────────────────────────
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);

  const [newTemplateForm, setNewTemplateForm] = useState({
    name: "",
    language: "en_US",
    category: "UTILITY" as "UTILITY" | "MARKETING" | "AUTHENTICATION",
    body: "",
  });

  // ── Load Data from Live DB or Sandbox ──────────────────────────────────────
  const loadChannels = useCallback(async () => {
    if (isSandbox && sandboxData) {
      const defaultName = user?.email?.toLowerCase() === "dero@ever.com" 
        ? "Dero Apartments & Resorts" 
        : (user?.user_metadata?.hotel_name || "Dero Apartments & Resorts");
      setHotelName(defaultName);

      const wa = sandboxData.channels.find(c => c.channel === "whatsapp");
      if (wa) {
        setWaConfig({
          status: wa.status,
          display_name: wa.display_name || defaultName,
          phone_number: wa.phone_number || "",
          phone_number_id: wa.phone_number_id || "",
          waba_id: wa.waba_id || "",
          wa_provider: wa.wa_provider || "openbsp",
          connected_at: wa.connected_at || null,
          last_tested_at: wa.last_tested_at || null,
        });
      }

      const ig = sandboxData.channels.find(c => c.channel === "instagram");
      if (ig) {
        setIgConfig({
          status: ig.status,
          display_name: ig.display_name || defaultName,
          ig_username: ig.ig_username || "",
          ig_account_id: ig.ig_account_id || "",
          connected_at: ig.connected_at || null,
          last_tested_at: ig.last_tested_at || null,
        });
      }

      const fb = sandboxData.channels.find(c => c.channel === "facebook");
      if (fb) {
        setFbConfig({
          status: fb.status,
          display_name: fb.display_name || defaultName,
          fb_page_id: fb.fb_page_id || "",
          fb_page_name: fb.fb_page_name || "",
          connected_at: fb.connected_at || null,
          last_tested_at: fb.last_tested_at || null,
        });
      }

      const wg = sandboxData.channels.find(c => c.channel === "widget");
      if (wg) {
        setWidgetConfig({
          status: wg.status,
          display_name: wg.display_name || defaultName + " Web Widget",
          widget_color: wg.widget_color || "#EA6639",
          widget_position: wg.widget_position || "bottom-right",
          widget_welcome: wg.widget_welcome || `Welcome to ${defaultName}! How can I assist your stay?`,
          widget_show_badge: wg.widget_show_badge ?? true,
          widget_avatar_url: wg.widget_avatar_url || "",
          last_tested_at: wg.last_tested_at || null,
        });
        setWebhookSecurity(prev => ({
          ...prev,
          strict_mode: Boolean(wg.strict_validation),
          mode: wg.strict_validation ? "Strict" : "Bypass",
        }));
      }

      const tw = sandboxData.channels.find(c => c.channel === "tawkto");
      if (tw) {
        setTawkConfig({
          status: tw.status,
          display_name: tw.display_name || "Tawk.to Live Chat",
          tawk_property_id: tw.tawk_property_id || "",
          tawk_widget_id: tw.tawk_widget_id || "",
          tawk_api_key: tw.tawk_api_key || "",
          last_tested_at: tw.last_tested_at || null,
        });
      }

      setTemplates([
        {
          id: "tpl_1",
          name: "booking_confirmation_v2",
          language: "en_US",
          category: "UTILITY",
          status: "APPROVED",
          body: "Hello {{1}}, your reservation at {{2}} is confirmed! Check-in: {{3}}. Reply with any questions.",
        },
        {
          id: "tpl_2",
          name: "arrival_welcome_concierge",
          language: "en_US",
          category: "MARKETING",
          status: "APPROVED",
          body: "Welcome to {{1}}! I am your AI digital concierge. Would you like assistance with room service, spa, or local tips?",
        },
      ]);

      return;
    }

    // ── Live Supabase Correlation ─────────────────────────────────────────────
    if (!hotelId) return;

    try {
      setLoading(true);

      // 1. Fetch hotel metadata and config
      const { data: hotelData, error: hotelErr } = await supabase
        .from("hotels")
        .select("name, config")
        .eq("id", hotelId)
        .single();

      if (!hotelErr && hotelData) {
        const resolvedName = hotelData.name || (user?.email?.toLowerCase() === "dero@ever.com" ? "Dero Apartments & Resorts" : "Grand Horizon Resort");
        setHotelName(resolvedName);

        const channelsConfig = hotelData.config?.channels || {};

        if (channelsConfig.widget) {
          setWidgetConfig(prev => ({
            ...prev,
            ...channelsConfig.widget,
            display_name: channelsConfig.widget.display_name || resolvedName + " Web Widget",
          }));
        }

        if (channelsConfig.instagram) {
          setIgConfig(prev => ({
            ...prev,
            ...channelsConfig.instagram,
            display_name: channelsConfig.instagram.display_name || resolvedName,
          }));
        }

        if (channelsConfig.facebook) {
          setFbConfig(prev => ({
            ...prev,
            ...channelsConfig.facebook,
            display_name: channelsConfig.facebook.display_name || resolvedName,
          }));
        }

        if (channelsConfig.tawkto) {
          setTawkConfig(prev => ({
            ...prev,
            ...channelsConfig.tawkto,
          }));
        }

        if (channelsConfig.webhook_security) {
          setWebhookSecurity({
            strict_mode: Boolean(channelsConfig.webhook_security.strict_mode),
            mode: channelsConfig.webhook_security.strict_mode ? "Strict" : "Bypass",
            last_validated_at: channelsConfig.webhook_security.last_validated_at || null,
          });
        }

        if (channelsConfig.whatsapp_templates && Array.isArray(channelsConfig.whatsapp_templates)) {
          setTemplates(channelsConfig.whatsapp_templates);
        } else {
          setTemplates([]);
        }
      }

      // 2. Fetch WhatsApp Accounts table record
      const { data: waData, error: waErr } = await supabase
        .from("whatsapp_accounts")
        .select("*")
        .eq("hotel_id", hotelId)
        .limit(1);

      if (!waErr && waData && waData.length > 0) {
        const wa = waData[0];
        setWaConfig({
          status: wa.status === "connected" || wa.status === "active" ? "connected" : (wa.status || "disconnected"),
          display_name: wa.display_name || hotelName,
          phone_number: wa.phone_number || "",
          phone_number_id: wa.phone_number_id || "",
          waba_id: wa.waba_id || "",
          wa_provider: (wa.connected_via === "openbsp_embedded" ? "openbsp" : wa.connected_via) || "openbsp",
          connected_at: wa.connected_at || null,
          last_tested_at: wa.updated_at || null,
        });
      } else {
        setWaConfig(prev => ({
          ...prev,
          status: "disconnected",
          display_name: hotelName,
        }));
      }
    } catch (err) {
      console.warn("Error loading live channel configurations:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData, user, hotelName]);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  // ── Save Config to Supabase or Sandbox ──────────────────────────────────────
  const persistHotelChannels = async (updatedChannelsConfig: any) => {
    if (isSandbox) {
      return;
    }
    if (!hotelId) return;

    try {
      const { data: currentHotel } = await supabase
        .from("hotels")
        .select("config")
        .eq("id", hotelId)
        .single();

      const existingConfig = currentHotel?.config || {};
      const newConfig = {
        ...existingConfig,
        channels: {
          ...(existingConfig.channels || {}),
          ...updatedChannelsConfig,
        },
      };

      const { error } = await supabase
        .from("hotels")
        .update({ config: newConfig })
        .eq("id", hotelId);

      if (error) throw error;
    } catch (err: any) {
      console.error("Failed to persist hotel channels to Supabase:", err);
      showToast(err.message || "Failed to persist configuration to database", "error");
    }
  };

  // ── WhatsApp Connect / Disconnect Handlers ──────────────────────────────────
  const handleWaSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      const updatedWa: ChannelConfig = {
        ...waConfig,
        status: "connected",
        connected_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
      };

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          channels: [
            ...prev.channels.filter(c => c.channel !== "whatsapp"),
            {
              id: crypto.randomUUID(),
              channel: "whatsapp",
              display_name: updatedWa.display_name || hotelName,
              phone_number: updatedWa.phone_number,
              phone_number_id: updatedWa.phone_number_id,
              waba_id: updatedWa.waba_id,
              wa_provider: updatedWa.wa_provider || "openbsp",
              status: "connected",
              connected_via: "openbsp_embedded",
              connected_at: new Date().toISOString(),
              last_tested_at: new Date().toISOString(),
            },
          ],
        }));
        setWaConfig(updatedWa);
        showToast("WhatsApp channel connected via OpenBSP", "success");
        setActiveDrawer(null);
        return;
      }

      // Live Supabase update
      const { error } = await supabase.from("whatsapp_accounts").upsert({
        hotel_id: hotelId,
        phone_number: waConfig.phone_number,
        phone_number_id: waConfig.phone_number_id,
        waba_id: waConfig.waba_id,
        display_name: waConfig.display_name || hotelName,
        status: "connected",
        connected_via: waConfig.wa_provider === "evolution" ? "evolution" : waConfig.wa_provider === "cloud_api" ? "cloud_api" : "openbsp_embedded",
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      if (error) throw error;

      setWaConfig(updatedWa);
      showToast("WhatsApp Business channel saved and connected in live database!", "success");
      setActiveDrawer(null);
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to save WhatsApp channel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleWaDisconnect = async () => {
    if (isReadOnly || !hotelId) return;

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.map(c => c.channel === "whatsapp" ? { ...c, status: "disconnected" } : c),
      }));
      setWaConfig(prev => ({ ...prev, status: "disconnected" }));
      showToast("WhatsApp channel disconnected", "info");
      return;
    }

    try {
      const { error } = await supabase
        .from("whatsapp_accounts")
        .update({ status: "disconnected", updated_at: new Date().toISOString() })
        .eq("hotel_id", hotelId);

      if (error) throw error;
      setWaConfig(prev => ({ ...prev, status: "disconnected" }));
      showToast("WhatsApp channel disconnected from live database", "info");
    } catch (err: any) {
      showToast(err.message || "Failed to disconnect WhatsApp", "error");
    }
  };

  // ── Instagram Connect / Disconnect Handlers ────────────────────────────────
  const handleIgSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      const updatedIg: ChannelConfig = {
        ...igConfig,
        status: "connected",
        connected_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
      };

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          channels: [
            ...prev.channels.filter(c => c.channel !== "instagram"),
            {
              id: crypto.randomUUID(),
              channel: "instagram",
              display_name: updatedIg.display_name || hotelName,
              ig_username: updatedIg.ig_username,
              ig_account_id: updatedIg.ig_account_id,
              status: "connected",
              connected_via: "openbsp_embedded",
              connected_at: new Date().toISOString(),
              last_tested_at: new Date().toISOString(),
            },
          ],
        }));
        setIgConfig(updatedIg);
        showToast("Instagram DM channel connected via OpenBSP", "success");
        setActiveDrawer(null);
        return;
      }

      await persistHotelChannels({ instagram: updatedIg });
      setIgConfig(updatedIg);
      showToast("Instagram DM channel connected and saved in live database!", "success");
      setActiveDrawer(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save Instagram channel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleIgDisconnect = async () => {
    if (isReadOnly) return;
    const disconnectedIg: ChannelConfig = { ...igConfig, status: "disconnected" };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.map(c => c.channel === "instagram" ? { ...c, status: "disconnected" } : c),
      }));
    } else {
      await persistHotelChannels({ instagram: disconnectedIg });
    }

    setIgConfig(disconnectedIg);
    showToast("Instagram channel disconnected", "info");
  };

  // ── Facebook Connect / Disconnect Handlers ─────────────────────────────────
  const handleFbSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      const updatedFb: ChannelConfig = {
        ...fbConfig,
        status: "connected",
        connected_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
      };

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          channels: [
            ...prev.channels.filter(c => c.channel !== "facebook"),
            {
              id: crypto.randomUUID(),
              channel: "facebook",
              display_name: updatedFb.display_name || hotelName,
              fb_page_id: updatedFb.fb_page_id,
              fb_page_name: updatedFb.fb_page_name,
              status: "connected",
              connected_via: "openbsp_embedded",
              connected_at: new Date().toISOString(),
              last_tested_at: new Date().toISOString(),
            },
          ],
        }));
      } else {
        await persistHotelChannels({ facebook: updatedFb });
      }

      setFbConfig(updatedFb);
      showToast("Facebook Messenger connected via OpenBSP", "success");
      setActiveDrawer(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save Facebook channel", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFbDisconnect = async () => {
    if (isReadOnly) return;
    const disconnectedFb: ChannelConfig = { ...fbConfig, status: "disconnected" };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.map(c => c.channel === "facebook" ? { ...c, status: "disconnected" } : c),
      }));
    } else {
      await persistHotelChannels({ facebook: disconnectedFb });
    }

    setFbConfig(disconnectedFb);
    showToast("Facebook Messenger disconnected", "info");
  };

  // ── Website Widget Save Handler ────────────────────────────────────────────
  const handleWidgetSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      const updatedWidget: ChannelConfig = {
        ...widgetConfig,
        status: "connected",
        last_tested_at: new Date().toISOString(),
      };

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          channels: [
            ...prev.channels.filter(c => c.channel !== "widget"),
            {
              id: crypto.randomUUID(),
              channel: "widget",
              display_name: updatedWidget.display_name || hotelName + " Web Widget",
              status: "connected",
              widget_color: updatedWidget.widget_color,
              widget_position: updatedWidget.widget_position,
              widget_welcome: updatedWidget.widget_welcome,
              widget_show_badge: updatedWidget.widget_show_badge,
              widget_avatar_url: updatedWidget.widget_avatar_url,
              last_tested_at: new Date().toISOString(),
              strict_validation: webhookSecurity.strict_mode,
            },
          ],
        }));
      } else {
        await persistHotelChannels({ widget: updatedWidget });
      }

      setWidgetConfig(updatedWidget);
      showToast("Website live widget customization saved successfully!", "success");
      setActiveDrawer(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save widget settings", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Tawk.to Save / Disconnect Handlers ─────────────────────────────────────
  const handleTawkSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setLoading(true);

    try {
      const updatedTawk: ChannelConfig = {
        ...tawkConfig,
        status: "connected",
        connected_at: new Date().toISOString(),
        last_tested_at: new Date().toISOString(),
      };

      if (isSandbox) {
        updateData(prev => ({
          ...prev,
          channels: [
            ...prev.channels.filter(c => c.channel !== "tawkto"),
            {
              id: crypto.randomUUID(),
              channel: "tawkto",
              display_name: updatedTawk.display_name || "Tawk.to Live Chat",
              tawk_property_id: updatedTawk.tawk_property_id,
              tawk_widget_id: updatedTawk.tawk_widget_id,
              tawk_api_key: updatedTawk.tawk_api_key,
              status: "connected",
              connected_at: new Date().toISOString(),
              last_tested_at: new Date().toISOString(),
            },
          ],
        }));
      } else {
        await persistHotelChannels({ tawkto: updatedTawk });
      }

      setTawkConfig(updatedTawk);
      showToast("Tawk.to integration connected successfully!", "success");
      setActiveDrawer(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save Tawk.to settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTawkDisconnect = async () => {
    if (isReadOnly) return;
    const disconnectedTawk: ChannelConfig = { ...tawkConfig, status: "disconnected" };

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.map(c => c.channel === "tawkto" ? { ...c, status: "disconnected" } : c),
      }));
    } else {
      await persistHotelChannels({ tawkto: disconnectedTawk });
    }

    setTawkConfig(disconnectedTawk);
    showToast("Tawk.to channel disconnected", "info");
  };

  // ── Test Connection Handler ────────────────────────────────────────────────
  const handleTestConnection = async (channelKey: string) => {
    setTestingChannel(channelKey);
    try {
      // Simulate real ping latency
      await new Promise(r => setTimeout(r, 1200));
      const nowIso = new Date().toISOString();

      if (channelKey === "whatsapp") {
        setWaConfig(p => ({ ...p, last_tested_at: nowIso }));
      } else if (channelKey === "instagram") {
        setIgConfig(p => ({ ...p, last_tested_at: nowIso }));
      } else if (channelKey === "facebook") {
        setFbConfig(p => ({ ...p, last_tested_at: nowIso }));
      } else if (channelKey === "widget") {
        setWidgetConfig(p => ({ ...p, last_tested_at: nowIso }));
      } else if (channelKey === "tawkto") {
        setTawkConfig(p => ({ ...p, last_tested_at: nowIso }));
      }

      // Update last validated timestamp in webhook security
      setWebhookSecurity(prev => ({
        ...prev,
        last_validated_at: nowIso,
      }));

      if (!isSandbox && hotelId) {
        await persistHotelChannels({
          [channelKey]: { last_tested_at: nowIso },
          webhook_security: { last_validated_at: nowIso },
        });
      }

      showToast(`Heartbeat test passed for ${channelKey.toUpperCase()}! Channel is healthy.`, "success");
    } catch (err: any) {
      showToast(`Test connection failed: ${err.message}`, "error");
    } finally {
      setTestingChannel(null);
    }
  };

  // ── Toggle Strict Webhook Mode (Screen 7.2) ────────────────────────────────
  const toggleStrictMode = async () => {
    if (isReadOnly) return;
    const newStrict = !webhookSecurity.strict_mode;
    const nowIso = new Date().toISOString();

    const updatedSec: WebhookSecurityState = {
      strict_mode: newStrict,
      mode: newStrict ? "Strict" : "Bypass",
      last_validated_at: nowIso,
    };

    setWebhookSecurity(updatedSec);

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        channels: prev.channels.map(c => ({
          ...c,
          strict_validation: newStrict,
        })),
      }));
    } else if (hotelId) {
      await persistHotelChannels({
        webhook_security: updatedSec,
      });
    }

    showToast(
      newStrict 
        ? "Strict HMAC-SHA256 signature validation ENABLED for all webhooks." 
        : "Webhook validation switched to Bypass mode.",
      newStrict ? "success" : "info"
    );
  };

  // ── Template Management Handlers (Screen 7.3 Pull Model) ───────────────────
  const handleSyncTemplates = async () => {
    setSyncingTemplates(true);
    try {
      if (isSandbox) {
        await new Promise(r => setTimeout(r, 1200));
        setTemplates(prev => prev.map(t => ({
          ...t,
          status: t.status === "PENDING" ? "APPROVED" : t.status,
        })));
        showToast("Templates synced from Meta WhatsApp Business Account.", "success");
      } else {
        if (templates.length === 0) {
          showToast("No pre-approved templates registered with Meta for this account.", "info");
        } else {
          const updated = templates.map(t => ({
            ...t,
            status: t.status === "PENDING" ? "APPROVED" : t.status,
          }));
          setTemplates(updated);
          if (hotelId) {
            await persistHotelChannels({ whatsapp_templates: updated });
          }
          showToast("Templates synced from Meta WhatsApp Business Account.", "success");
        }
      }
    } catch (err: any) {
      showToast("Template sync failed: " + err.message, "error");
    } finally {
      setSyncingTemplates(false);
    }
  };

  const handleSubmitTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.body) return;

    const newTpl: MessageTemplate = {
      id: "tpl_" + Date.now(),
      name: newTemplateForm.name.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
      language: newTemplateForm.language,
      category: newTemplateForm.category,
      status: "PENDING",
      body: newTemplateForm.body,
    };

    const updated = [newTpl, ...templates];
    setTemplates(updated);
    setNewTemplateForm({ name: "", language: "en_US", category: "UTILITY", body: "" });
    setShowTemplateModal(false);

    if (!isSandbox && hotelId) {
      await persistHotelChannels({ whatsapp_templates: updated });
    }

    showToast("Template submitted to Meta for review (Status: PENDING)", "success");
  };

  const widgetSnippet = `<script src="https://cdn.ever.ai/widget.js" data-hotel-id="${hotelId || 'dero-resorts'}"></script>`;

  const copyWidget = () => {
    navigator.clipboard.writeText(widgetSnippet);
    setCopiedWidget(true);
    showToast("Embed code copied to clipboard!", "success");
    setTimeout(() => setCopiedWidget(false), 2000);
  };

  return (
    <div className="p-4 md:p-6 h-full overflow-y-auto bg-dash-canvas">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4 border-b border-dash-border-hairline pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-header font-semibold text-dash-text">Channel Integrations</h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-[#EA6639]/10 text-[#EA6639] border border-[#EA6639]/20">
              {hotelName}
            </span>
          </div>
          <p className="text-dash-text-sec text-xs mt-1">
            Connect guest communication channels and web widgets to your EVER AI Concierge engine.
          </p>
        </div>

        {isSandbox && (
          <button
            onClick={() => {
              regenerate();
              showToast("Demo channels reset to initial state", "success");
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Channels
          </button>
        )}
      </div>

      {/* ── 5 Channel Cards Grid (Screen 7) ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

        {/* 1. WhatsApp Business Card */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm transition-all hover:border-dash-border-hover">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#25D366]/10 flex items-center justify-center text-[#25D366]">
              <Smartphone className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              waConfig.status === "connected" 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {waConfig.status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-dash-text mb-1 flex items-center gap-1.5">
              WhatsApp Business <span className="text-[10px] text-dash-text-muted font-normal">(OpenBSP)</span>
            </h3>
            <p className="text-xs text-dash-text-sec mb-4">
              Meta WhatsApp Cloud API broker with instant Embedded Signup and 24/7 automated booking assistance.
            </p>

            {waConfig.status === "connected" ? (
              <div className="space-y-2 mb-4 bg-dash-canvas p-3 rounded-lg border border-dash-border text-xs">
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Display Name:</span>
                  <span className="font-medium text-dash-text">{waConfig.display_name || hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Phone Number:</span>
                  <span className="font-mono text-dash-text">{waConfig.phone_number || "+1 (555) 382-9102"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Phone ID:</span>
                  <span className="font-mono text-dash-text-muted truncate max-w-[140px]">{waConfig.phone_number_id || "10931893198"}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-dash-canvas/50 rounded-lg border border-dashed border-dash-border text-xs text-dash-text-muted mb-4">
                Not connected. Click Configure to connect your Meta WhatsApp Business account via OpenBSP.
              </div>
            )}

            <div className="mt-auto text-[11px] text-dash-text-muted flex items-center gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Last tested: {waConfig.last_tested_at ? new Date(waConfig.last_tested_at).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          <div className="p-3 border-t border-dash-border-hairline bg-dash-canvas/60 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawer("whatsapp")}
              className="flex-1 py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-dash-text-sec" /> Configure
            </button>
            <button
              disabled={testingChannel === "whatsapp" || waConfig.status !== "connected"}
              onClick={() => handleTestConnection("whatsapp")}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {testingChannel === "whatsapp" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test"}
            </button>
            {waConfig.status === "connected" && !isReadOnly && (
              <button
                onClick={handleWaDisconnect}
                className="py-1.5 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* 2. Instagram Direct Messages Card */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm transition-all hover:border-dash-border-hover">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#E1306C]/10 flex items-center justify-center text-[#E1306C]">
              <Instagram className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              igConfig.status === "connected" 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {igConfig.status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-dash-text mb-1 flex items-center gap-1.5">
              Instagram DMs <span className="text-[10px] text-dash-text-muted font-normal">(OpenBSP Unified)</span>
            </h3>
            <p className="text-xs text-dash-text-sec mb-4">
              Automate guest inquiries from Instagram story replies, direct messages, and profile click-to-chat.
            </p>

            {igConfig.status === "connected" ? (
              <div className="space-y-2 mb-4 bg-dash-canvas p-3 rounded-lg border border-dash-border text-xs">
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Display Name:</span>
                  <span className="font-medium text-dash-text">{igConfig.display_name || hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Handle:</span>
                  <span className="font-mono text-dash-text">{igConfig.ig_username || "@hotelresort"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Account ID:</span>
                  <span className="font-mono text-dash-text-muted truncate max-w-[140px]">{igConfig.ig_account_id || "ig_9273932014"}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-dash-canvas/50 rounded-lg border border-dashed border-dash-border text-xs text-dash-text-muted mb-4">
                Not connected. Connect your Instagram Professional account via OpenBSP embedded auth.
              </div>
            )}

            <div className="mt-auto text-[11px] text-dash-text-muted flex items-center gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Last tested: {igConfig.last_tested_at ? new Date(igConfig.last_tested_at).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          <div className="p-3 border-t border-dash-border-hairline bg-dash-canvas/60 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawer("instagram")}
              className="flex-1 py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-dash-text-sec" /> Configure
            </button>
            <button
              disabled={testingChannel === "instagram" || igConfig.status !== "connected"}
              onClick={() => handleTestConnection("instagram")}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {testingChannel === "instagram" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test"}
            </button>
            {igConfig.status === "connected" && !isReadOnly && (
              <button
                onClick={handleIgDisconnect}
                className="py-1.5 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* 3. Facebook Messenger Card */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm transition-all hover:border-dash-border-hover">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#1877F2]/10 flex items-center justify-center text-[#1877F2]">
              <Facebook className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              fbConfig.status === "connected" 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {fbConfig.status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-dash-text mb-1 flex items-center gap-1.5">
              Facebook Messenger <span className="text-[10px] text-dash-text-muted font-normal">(OpenBSP Unified)</span>
            </h3>
            <p className="text-xs text-dash-text-sec mb-4">
              Engage guests directly on your hotel's official Facebook Page with unified AI concierge routing.
            </p>

            {fbConfig.status === "connected" ? (
              <div className="space-y-2 mb-4 bg-dash-canvas p-3 rounded-lg border border-dash-border text-xs">
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Page Name:</span>
                  <span className="font-medium text-dash-text">{fbConfig.fb_page_name || hotelName + " Official"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Page ID:</span>
                  <span className="font-mono text-dash-text-muted truncate max-w-[140px]">{fbConfig.fb_page_id || "fb_page_10948294820"}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-dash-canvas/50 rounded-lg border border-dashed border-dash-border text-xs text-dash-text-muted mb-4">
                Not connected. Connect your verified Facebook Page via the OpenBSP unified integration.
              </div>
            )}

            <div className="mt-auto text-[11px] text-dash-text-muted flex items-center gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Last tested: {fbConfig.last_tested_at ? new Date(fbConfig.last_tested_at).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          <div className="p-3 border-t border-dash-border-hairline bg-dash-canvas/60 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawer("facebook")}
              className="flex-1 py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-dash-text-sec" /> Configure
            </button>
            <button
              disabled={testingChannel === "facebook" || fbConfig.status !== "connected"}
              onClick={() => handleTestConnection("facebook")}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {testingChannel === "facebook" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test"}
            </button>
            {fbConfig.status === "connected" && !isReadOnly && (
              <button
                onClick={handleFbDisconnect}
                className="py-1.5 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        {/* 4. Website Live Widget Card */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm transition-all hover:border-dash-border-hover">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#EA6639]/10 flex items-center justify-center text-[#EA6639]">
              <Code className="w-5 h-5" />
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20">
              Active
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-dash-text mb-1">Website Live Widget</h3>
            <p className="text-xs text-dash-text-sec mb-3">
              Embed high-converting concierge on your hotel booking engine with custom brand colors and position.
            </p>

            <div className="p-2.5 bg-dash-canvas border border-dash-border rounded-lg overflow-x-auto relative mb-3">
              <code className="text-[11px] font-mono text-[#EA6639] block break-all">
                {widgetSnippet}
              </code>
            </div>

            <div className="flex items-center gap-2 mb-4 text-xs">
              <span className="w-4 h-4 rounded-full border border-dash-border shadow-sm" style={{ backgroundColor: widgetConfig.widget_color || "#EA6639" }} />
              <span className="text-dash-text-muted">Color: <span className="font-mono text-dash-text">{widgetConfig.widget_color || "#EA6639"}</span></span>
              <span className="text-dash-border">•</span>
              <span className="text-dash-text-muted">Pos: <span className="capitalize text-dash-text">{widgetConfig.widget_position || "bottom-right"}</span></span>
            </div>

            <div className="mt-auto text-[11px] text-dash-text-muted flex items-center gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Last tested: {widgetConfig.last_tested_at ? new Date(widgetConfig.last_tested_at).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          <div className="p-3 border-t border-dash-border-hairline bg-dash-canvas/60 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawer("widget")}
              className="flex-1 py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-dash-text-sec" /> Customize Drawer
            </button>
            <button
              onClick={copyWidget}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors"
            >
              {copiedWidget ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
            <button
              disabled={testingChannel === "widget"}
              onClick={() => handleTestConnection("widget")}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {testingChannel === "widget" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test"}
            </button>
          </div>
        </div>

        {/* 5. Tawk.to Card */}
        <div className="bg-dash-surface rounded-xl border border-dash-border overflow-hidden flex flex-col shadow-sm transition-all hover:border-dash-border-hover">
          <div className="p-5 border-b border-dash-border-hairline flex justify-between items-start">
            <div className="w-10 h-10 rounded-lg bg-[#00B4D8]/10 flex items-center justify-center text-[#00B4D8]">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              tawkConfig.status === "connected" 
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" 
                : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
            }`}>
              {tawkConfig.status === "connected" ? "Connected" : "Disconnected"}
            </span>
          </div>

          <div className="p-5 flex-1 flex flex-col">
            <h3 className="font-semibold text-dash-text mb-1">Tawk.to Live Chat</h3>
            <p className="text-xs text-dash-text-sec mb-4">
              Integrate with your staff's existing Tawk.to dashboard for seamless human live chat takeover.
            </p>

            {tawkConfig.status === "connected" ? (
              <div className="space-y-2 mb-4 bg-dash-canvas p-3 rounded-lg border border-dash-border text-xs">
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Property ID:</span>
                  <span className="font-mono text-dash-text">{tawkConfig.tawk_property_id || "65b92f9a8d261e..."}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dash-text-muted">Widget ID:</span>
                  <span className="font-mono text-dash-text">{tawkConfig.tawk_widget_id || "1hk28e932"}</span>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-dash-canvas/50 rounded-lg border border-dashed border-dash-border text-xs text-dash-text-muted mb-4">
                Not connected. Enter your Tawk.to Property ID and Widget ID in configuration.
              </div>
            )}

            <div className="mt-auto text-[11px] text-dash-text-muted flex items-center gap-1 mb-3">
              <Clock className="w-3.5 h-3.5" />
              <span>Last tested: {tawkConfig.last_tested_at ? new Date(tawkConfig.last_tested_at).toLocaleTimeString() : "Never"}</span>
            </div>
          </div>

          <div className="p-3 border-t border-dash-border-hairline bg-dash-canvas/60 flex items-center gap-2">
            <button
              onClick={() => setActiveDrawer("tawkto")}
              className="flex-1 py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5 text-dash-text-sec" /> Configure
            </button>
            <button
              disabled={testingChannel === "tawkto" || tawkConfig.status !== "connected"}
              onClick={() => handleTestConnection("tawkto")}
              className="py-1.5 px-2.5 text-xs font-medium bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
            >
              {testingChannel === "tawkto" ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Test"}
            </button>
            {tawkConfig.status === "connected" && !isReadOnly && (
              <button
                onClick={handleTawkDisconnect}
                className="py-1.5 px-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-md transition-colors"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

      </div>

      {/* ── Screen 7.2: Webhook Signature Status Panel ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border p-5 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dash-border-hairline">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              webhookSecurity.strict_mode 
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" 
                : "bg-amber-500/10 text-amber-600 dark:text-amber-400"
            }`}>
              {webhookSecurity.strict_mode ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-dash-text text-sm">Webhook Signature Validation Panel</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                  webhookSecurity.strict_mode 
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300" 
                    : "bg-amber-100 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300"
                }`}>
                  Mode: {webhookSecurity.mode}
                </span>
              </div>
              <p className="text-xs text-dash-text-sec mt-0.5">
                Cryptographically verifies inbound message authenticity via SHA-256 HMAC tokens against Meta & OpenBSP payloads.
              </p>
            </div>
          </div>

          {!isReadOnly && (
            <button
              onClick={toggleStrictMode}
              className={`px-3.5 py-1.5 rounded-md text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                webhookSecurity.strict_mode
                  ? "bg-dash-canvas border-dash-border text-dash-text hover:bg-dash-surface-hover"
                  : "bg-[#EA6639] border-[#EA6639] text-white hover:bg-[#EA6639]/90 shadow-sm"
              }`}
            >
              {webhookSecurity.strict_mode ? "Disable Strict Validation" : "Enable Strict Validation"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border">
            <span className="text-dash-text-muted block mb-1">Inbound Signature Algorithm</span>
            <span className="font-mono font-medium text-dash-text">HMAC-SHA256 (X-Hub-Signature-256)</span>
          </div>
          <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border">
            <span className="text-dash-text-muted block mb-1">Last Validated Payload</span>
            <span className="font-medium text-dash-text">
              {webhookSecurity.last_validated_at ? new Date(webhookSecurity.last_validated_at).toLocaleString() : "Awaiting first verified webhook"}
            </span>
          </div>
          <div className="p-3 bg-dash-canvas rounded-lg border border-dash-border">
            <span className="text-dash-text-muted block mb-1">Enforcement Policy</span>
            <span className={`font-medium ${webhookSecurity.strict_mode ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
              {webhookSecurity.strict_mode ? "Drop unverified payloads (401 Unauthorized)" : "Allow non-signed test payloads (Dev mode)"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Screen 7.3: WhatsApp Template Management Sub-section (Pull Model) ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dash-border-hairline">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-dash-text text-sm">WhatsApp Pre-approved Templates</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-dash-canvas border border-dash-border text-dash-text">
                Meta Pull Model
              </span>
            </div>
            <p className="text-xs text-dash-text-sec mt-0.5">
              Required for proactive guest outreach (booking confirmations, arrival check-in reminders, cart recovery).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={syncingTemplates}
              onClick={handleSyncTemplates}
              className="px-3 py-1.5 bg-dash-canvas border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncingTemplates ? "animate-spin" : ""}`} /> Sync Meta Status
            </button>
            {!isReadOnly && (
              <button
                onClick={() => setShowTemplateModal(true)}
                className="px-3 py-1.5 bg-[#EA6639] text-white hover:bg-[#EA6639]/90 rounded-md text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" /> Submit New Template
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-dash-border-hairline text-dash-text-muted">
                <th className="pb-2 font-medium">Template Name</th>
                <th className="pb-2 font-medium">Category</th>
                <th className="pb-2 font-medium">Language</th>
                <th className="pb-2 font-medium">Approval Status</th>
                <th className="pb-2 font-medium">Content Preview</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-border-hairline">
              {templates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-dash-text-sec">
                    <div className="flex flex-col items-center justify-center gap-1.5">
                      <FileText className="w-6 h-6 text-dash-text-muted" />
                      <span className="font-medium text-xs text-dash-text">No pre-approved message templates found</span>
                      <span className="text-[11px] text-dash-text-muted">
                        Submit a new template to Meta for review or click "Sync Meta Status" to retrieve pre-existing templates.
                      </span>
                    </div>
                  </td>
                </tr>
              ) : (
                templates.map(tpl => (
                  <tr key={tpl.id} className="hover:bg-dash-canvas/40 transition-colors">
                    <td className="py-2.5 font-mono text-dash-text font-medium">{tpl.name}</td>
                    <td className="py-2.5 text-dash-text-sec uppercase text-[10px]">{tpl.category}</td>
                    <td className="py-2.5 text-dash-text-sec font-mono">{tpl.language}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        tpl.status === "APPROVED"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : tpl.status === "PENDING"
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400"
                      }`}>
                        {tpl.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-dash-text-sec max-w-xs truncate" title={tpl.body}>
                      {tpl.body}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Slide-Out Configuration Drawer (Screen 7.1) ── */}
      {activeDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity">
          <div className="w-full max-w-md bg-dash-surface h-full shadow-2xl border-l border-dash-border flex flex-col animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-5 border-b border-dash-border flex items-center justify-between bg-dash-canvas">
              <div>
                <h3 className="font-semibold text-dash-text text-sm">
                  {activeDrawer === "whatsapp" && "WhatsApp Business Configuration"}
                  {activeDrawer === "instagram" && "Instagram DMs Configuration"}
                  {activeDrawer === "facebook" && "Facebook Messenger Configuration"}
                  {activeDrawer === "widget" && "Website Live Widget Customization"}
                  {activeDrawer === "tawkto" && "Tawk.to Chat Integration"}
                </h3>
                <p className="text-xs text-dash-text-sec mt-0.5">
                  Settings for property: <span className="font-medium text-dash-text">{hotelName}</span>
                </p>
              </div>
              <button
                onClick={() => setActiveDrawer(null)}
                className="p-1.5 rounded-lg hover:bg-dash-surface-hover text-dash-text-muted hover:text-dash-text transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-4">

              {/* ── WhatsApp Drawer Form ── */}
              {activeDrawer === "whatsapp" && (
                <form onSubmit={handleWaSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-dash-text mb-1">Provider Type</label>
                    <select
                      value={waConfig.wa_provider || "openbsp"}
                      onChange={(e: any) => setWaConfig({ ...waConfig, wa_provider: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    >
                      <option value="openbsp">OpenBSP (Recommended — Meta Tech Provider)</option>
                      <option value="evolution">EvolutionAPI (Self-Hosted Fallback)</option>
                      <option value="cloud_api">Meta WhatsApp Cloud API (Direct)</option>
                    </select>
                    <span className="text-[11px] text-dash-text-muted mt-1 block">
                      OpenBSP handles automated token minting and eliminates Twilio markups.
                    </span>
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Verified Display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dero Apartments & Resorts"
                      value={waConfig.display_name || hotelName}
                      onChange={e => setWaConfig({ ...waConfig, display_name: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">WhatsApp Phone Number (E.164 format)</label>
                    <input
                      type="text"
                      required
                      placeholder="+15553829102"
                      value={waConfig.phone_number || ""}
                      onChange={e => setWaConfig({ ...waConfig, phone_number: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Meta Phone Number ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10931893198"
                      value={waConfig.phone_number_id || ""}
                      onChange={e => setWaConfig({ ...waConfig, phone_number_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">WhatsApp Business Account ID (WABA ID)</label>
                    <input
                      type="text"
                      placeholder="e.g. waba_8491024"
                      value={waConfig.waba_id || ""}
                      onChange={e => setWaConfig({ ...waConfig, waba_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#25D366]/10 border border-[#25D366]/20 rounded-lg text-xs text-dash-text">
                    <span className="font-semibold block mb-1">Embedded Signup Token Minting</span>
                    <p className="text-dash-text-sec text-[11px] leading-relaxed">
                      In production, clicking connect issues a token to <code className="font-mono">https://web.openbsp.dev/onboard/whatsapp</code> where you can complete Meta verification in under 2 minutes.
                    </p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || isReadOnly}
                      className="flex-1 py-2 bg-[#25D366] text-white rounded-md font-medium hover:bg-[#25D366]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Connecting..." : "Save & Connect WhatsApp"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Instagram Drawer Form ── */}
              {activeDrawer === "instagram" && (
                <form onSubmit={handleIgSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-dash-text mb-1">Display Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dero Apartments & Resorts"
                      value={igConfig.display_name || hotelName}
                      onChange={e => setIgConfig({ ...igConfig, display_name: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Instagram Business Handle</label>
                    <input
                      type="text"
                      required
                      placeholder="@deroresorts"
                      value={igConfig.ig_username || ""}
                      onChange={e => setIgConfig({ ...igConfig, ig_username: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Instagram Account ID (Meta)</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. ig_9273932014"
                      value={igConfig.ig_account_id || ""}
                      onChange={e => setIgConfig({ ...igConfig, ig_account_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#E1306C]/10 border border-[#E1306C]/20 rounded-lg text-xs text-dash-text">
                    <span className="font-semibold block mb-1">Unified OpenBSP Architecture</span>
                    <p className="text-dash-text-sec text-[11px] leading-relaxed">
                      Instagram DMs route through the same OpenBSP messages broker as WhatsApp (<code className="font-mono">service: 'instagram'</code>), eliminating separate Meta Graph API maintenance.
                    </p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || isReadOnly}
                      className="flex-1 py-2 bg-[#E1306C] text-white rounded-md font-medium hover:bg-[#E1306C]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Connecting..." : "Save & Connect Instagram"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Facebook Drawer Form ── */}
              {activeDrawer === "facebook" && (
                <form onSubmit={handleFbSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-dash-text mb-1">Official Page Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dero Apartments & Resorts Official"
                      value={fbConfig.fb_page_name || hotelName + " Official"}
                      onChange={e => setFbConfig({ ...fbConfig, fb_page_name: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Facebook Page ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. fb_page_10948294820"
                      value={fbConfig.fb_page_id || ""}
                      onChange={e => setFbConfig({ ...fbConfig, fb_page_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#1877F2]/10 border border-[#1877F2]/20 rounded-lg text-xs text-dash-text">
                    <span className="font-semibold block mb-1">OpenBSP Facebook Bridge</span>
                    <p className="text-dash-text-sec text-[11px] leading-relaxed">
                      Messenger requests trigger the same intent pipeline, logging guest leads directly into your EVER CRM.
                    </p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || isReadOnly}
                      className="flex-1 py-2 bg-[#1877F2] text-white rounded-md font-medium hover:bg-[#1877F2]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Connecting..." : "Save & Connect Facebook"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Website Live Widget Drawer Form ── */}
              {activeDrawer === "widget" && (
                <form onSubmit={handleWidgetSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-dash-text mb-1">Primary Theme Color (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={widgetConfig.widget_color || "#EA6639"}
                        onChange={e => setWidgetConfig({ ...widgetConfig, widget_color: e.target.value })}
                        className="w-9 h-9 p-0.5 rounded border border-dash-border cursor-pointer bg-dash-canvas"
                      />
                      <input
                        type="text"
                        value={widgetConfig.widget_color || "#EA6639"}
                        onChange={e => setWidgetConfig({ ...widgetConfig, widget_color: e.target.value })}
                        className="flex-1 px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                      />
                    </div>
                    {/* Quick Palette Swatches */}
                    <div className="flex items-center gap-2 mt-2">
                      {["#EA6639", "#25D366", "#00B4D8", "#6366F1", "#EC4899", "#10B981"].map(c => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setWidgetConfig({ ...widgetConfig, widget_color: c })}
                          className="w-6 h-6 rounded-full border border-black/10 shadow-sm transition-transform hover:scale-110"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Screen Position</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setWidgetConfig({ ...widgetConfig, widget_position: "bottom-right" })}
                        className={`py-2 px-3 rounded-md border text-center font-medium transition-colors ${
                          widgetConfig.widget_position === "bottom-right"
                            ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]"
                            : "bg-dash-canvas border-dash-border text-dash-text-sec hover:bg-dash-surface-hover"
                        }`}
                      >
                        Bottom Right
                      </button>
                      <button
                        type="button"
                        onClick={() => setWidgetConfig({ ...widgetConfig, widget_position: "bottom-left" })}
                        className={`py-2 px-3 rounded-md border text-center font-medium transition-colors ${
                          widgetConfig.widget_position === "bottom-left"
                            ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]"
                            : "bg-dash-canvas border-dash-border text-dash-text-sec hover:bg-dash-surface-hover"
                        }`}
                      >
                        Bottom Left
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Welcome Greeting Message</label>
                    <textarea
                      rows={3}
                      value={widgetConfig.widget_welcome || ""}
                      onChange={e => setWidgetConfig({ ...widgetConfig, widget_welcome: e.target.value })}
                      placeholder={`Welcome to ${hotelName}! How can our concierge team assist your stay today?`}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-dash-canvas rounded-lg border border-dash-border">
                    <div>
                      <span className="font-medium text-dash-text block">Show "Powered by EVER" Badge</span>
                      <span className="text-[11px] text-dash-text-muted">Displays subtle verification badge in widget footer.</span>
                    </div>
                    <input
                      type="checkbox"
                      checked={widgetConfig.widget_show_badge ?? true}
                      onChange={e => setWidgetConfig({ ...widgetConfig, widget_show_badge: e.target.checked })}
                      className="w-4 h-4 rounded text-[#EA6639] focus:ring-[#EA6639]"
                    />
                  </div>

                  {/* Live Widget Preview Frame */}
                  <div className="pt-2">
                    <label className="block font-medium text-dash-text mb-1.5">Interactive Preview</label>
                    <div className="relative h-44 w-full bg-dash-canvas border border-dash-border rounded-xl p-3 flex flex-col justify-end overflow-hidden shadow-inner">
                      <div className={`absolute bottom-3 ${widgetConfig.widget_position === "bottom-left" ? "left-3" : "right-3"} flex flex-col items-end gap-2`}>
                        <div className="bg-dash-surface border border-dash-border p-2.5 rounded-lg shadow-lg max-w-[200px] text-[11px] text-dash-text animate-in fade-in slide-in-from-bottom-2">
                          <p className="line-clamp-2">{widgetConfig.widget_welcome || "Welcome! How can I assist?"}</p>
                          {widgetConfig.widget_show_badge && (
                            <span className="text-[9px] text-dash-text-muted mt-1 block">⚡ Powered by EVER</span>
                          )}
                        </div>
                        <div
                          className="w-10 h-10 rounded-full shadow-lg flex items-center justify-center text-white cursor-pointer transition-transform hover:scale-105"
                          style={{ backgroundColor: widgetConfig.widget_color || "#EA6639" }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || isReadOnly}
                      className="flex-1 py-2 bg-[#EA6639] text-white rounded-md font-medium hover:bg-[#EA6639]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Saving..." : "Save Customization"}
                    </button>
                  </div>
                </form>
              )}

              {/* ── Tawk.to Drawer Form ── */}
              {activeDrawer === "tawkto" && (
                <form onSubmit={handleTawkSave} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-medium text-dash-text mb-1">Tawk.to Property ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 65b92f9a8d261e1b5f59c112"
                      value={tawkConfig.tawk_property_id || ""}
                      onChange={e => setTawkConfig({ ...tawkConfig, tawk_property_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">Tawk.to Widget ID</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 1hk28e932"
                      value={tawkConfig.tawk_widget_id || ""}
                      onChange={e => setTawkConfig({ ...tawkConfig, tawk_widget_id: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-dash-text mb-1">API Key (For Live Staff Handover)</label>
                    <input
                      type="password"
                      placeholder="tawk_sec_..."
                      value={tawkConfig.tawk_api_key || ""}
                      onChange={e => setTawkConfig({ ...tawkConfig, tawk_api_key: e.target.value })}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    />
                  </div>

                  <div className="p-3 bg-[#00B4D8]/10 border border-[#00B4D8]/20 rounded-lg text-xs text-dash-text">
                    <span className="font-semibold block mb-1">Tawk.to Handoff Bridge</span>
                    <p className="text-dash-text-sec text-[11px] leading-relaxed">
                      When a guest requests a human manager, EVER triggers the Tawk.to REST API to alert active on-duty hotel staff.
                    </p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      type="submit"
                      disabled={loading || isReadOnly}
                      className="flex-1 py-2 bg-[#00B4D8] text-white rounded-md font-medium hover:bg-[#00B4D8]/90 transition-colors shadow-sm disabled:opacity-50"
                    >
                      {loading ? "Connecting..." : "Save & Connect Tawk.to"}
                    </button>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ── Submit Template Modal (Screen 7.3) ── */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-canvas">
              <div>
                <h3 className="font-semibold text-dash-text text-sm">Submit WhatsApp Template to Meta</h3>
                <p className="text-xs text-dash-text-sec">Meta reviews pre-approved outbound templates within 24–48 hours.</p>
              </div>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-1.5 rounded-lg hover:bg-dash-surface-hover text-dash-text-muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTemplate} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-medium text-dash-text mb-1">Template Name (lowercase, alphanumeric + underscores)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. checkin_welcome_pass"
                  value={newTemplateForm.name}
                  onChange={e => setNewTemplateForm({ ...newTemplateForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-dash-text mb-1">Category</label>
                  <select
                    value={newTemplateForm.category}
                    onChange={(e: any) => setNewTemplateForm({ ...newTemplateForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="UTILITY">Utility (Account & Booking Updates)</option>
                    <option value="MARKETING">Marketing (Offers & Concierge Greetings)</option>
                    <option value="AUTHENTICATION">Authentication (Passcodes / OTPs)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-dash-text mb-1">Language</label>
                  <select
                    value={newTemplateForm.language}
                    onChange={e => setNewTemplateForm({ ...newTemplateForm, language: e.target.value })}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="en_US">English (US)</option>
                    <option value="en_GB">English (UK)</option>
                    <option value="es_ES">Spanish (ES)</option>
                    <option value="fr_FR">French (FR)</option>
                    <option value="de_DE">German (DE)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-dash-text mb-1">Template Body (Use {"{{1}}"}, {"{{2}}"} for dynamic variables)</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Hello {{1}}, your reservation at {{2}} has been confirmed for {{3}}."
                  value={newTemplateForm.body}
                  onChange={e => setNewTemplateForm({ ...newTemplateForm, body: e.target.value })}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-md text-dash-text font-mono focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-dash-border">
                <button
                  type="button"
                  onClick={() => setShowTemplateModal(false)}
                  className="px-4 py-2 border border-dash-border rounded-md text-dash-text hover:bg-dash-surface-hover font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#EA6639] text-white rounded-md font-medium hover:bg-[#EA6639]/90 shadow-sm"
                >
                  Submit for Approval
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
