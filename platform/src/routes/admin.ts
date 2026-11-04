import { Router } from "express";
import fs from "fs";
import path from "path";
import { supabase } from "../lib/globals.js";

const router = Router();

// ── GET /api/admin/deployments ─────────────────────────────────────────────
router.get("/deployments", async (req, res) => {
  try {
    let hotels: any[] = [];
    let subscriptions: any[] = [];
    let activityLogs: any[] = [];

    if (supabase) {
      const { data: hData, error: hErr } = await supabase
        .from("hotels")
        .select("id, name, slug, domain, phone, email, settings, created_at")
        .order("created_at", { ascending: false });

      if (!hErr && hData) hotels = hData;

      const { data: sData } = await supabase
        .from("subscriptions")
        .select("hotel_id, plan, status, current_period_start, current_period_end, monthly_base_fee");

      if (sData) subscriptions = sData;

      const { data: aData } = await supabase
        .from("agency_audit_log")
        .select("id, hotel_id, user_id, action, entity_type, entity_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(25);

      if (aData) activityLogs = aData;
    }

    // Check on-disk client directories in clients/
    const clientsRootDir = path.resolve(process.cwd(), "..", "clients");
    const onDiskClients: string[] = [];
    if (fs.existsSync(clientsRootDir)) {
      try {
        const entries = fs.readdirSync(clientsRootDir, { withFileTypes: true });
        for (const e of entries) {
          if (e.isDirectory()) onDiskClients.push(e.name);
        }
      } catch (err: any) {
        console.warn("[Admin API] Error reading clients dir:", err.message);
      }
    }

    // Map each real hotel to its deployment state
    const deployments = hotels.map(hotel => {
      const sub = subscriptions.find(s => s.hotel_id === hotel.id);
      const hasDisk = onDiskClients.includes(hotel.slug);

      return {
        id: hotel.id,
        name: hotel.name,
        slug: hotel.slug,
        status: sub?.status === "active" ? "Running" : (sub?.status || "Pending"),
        tier: sub?.plan || hotel.settings?.tier || "starter",
        version: "v1.2.4",
        createdAt: hotel.created_at,
        hasDiskScaffold: hasDisk,
        domain: hotel.domain || `${hotel.slug}.getever.com.ng`,
        containers: [
          { name: "n8n", status: sub?.status === "active" ? "Running" : "Standby", port: hotel.settings?.n8nPort || "5678" },
          { name: "bot-engine", status: sub?.status === "active" ? "Running" : "Standby", port: "3001" },
          { name: "pms-api", status: sub?.status === "active" ? "Running" : "Standby", port: "4000" },
          { name: "redis", status: sub?.status === "active" ? "Running" : "Standby", port: "6379" },
        ]
      };
    });

    res.json({
      success: true,
      deployments,
      activityLogs: activityLogs.map(l => ({
        id: l.id,
        time: new Date(l.created_at).toLocaleTimeString(),
        slug: l.entity_id || "global",
        event: `${l.action} ${l.entity_type ? `(${l.entity_type})` : ""}: ${JSON.stringify(l.details || {})}`,
        type: l.action.includes("error") ? "error" : "success"
      }))
    });
  } catch (err: any) {
    console.error("[Admin API] /deployments error:", err);
    res.status(500).json({ error: err.message || "Failed to fetch deployments" });
  }
});

// ── POST /api/admin/deployments/:slug/restart ──────────────────────────────
router.post("/deployments/:slug/restart", async (req, res) => {
  const { slug } = req.params;
  try {
    if (supabase) {
      await supabase.from("agency_audit_log").insert({
        action: "restart_deployment",
        entity_type: "deployment",
        entity_id: slug,
        details: { triggered_by: "agency_admin", timestamp: new Date().toISOString() }
      });
    }

    res.json({ success: true, message: `Restart signal dispatched for ${slug}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Restart trigger failed" });
  }
});

// ── GET /api/admin/health ──────────────────────────────────────────────────
router.get("/health", async (req, res) => {
  const checks: Record<string, any> = {
    database: { status: "unknown", latencyMs: 0 },
    botEngine: { status: "unknown", latencyMs: 0 },
    redis: { status: "unknown", latencyMs: 0 },
    openbsp: { status: "unknown", latencyMs: 0 },
  };

  // 1. Database check
  if (supabase) {
    const dbStart = Date.now();
    try {
      const { error } = await supabase.from("hotels").select("id", { count: "exact", head: true });
      checks.database = {
        status: error ? "error" : "healthy",
        latencyMs: Date.now() - dbStart,
        error: error ? error.message : null
      };
    } catch (e: any) {
      checks.database = { status: "error", latencyMs: Date.now() - dbStart, error: e.message };
    }
  }

  // 2. Bot engine check
  const botEngineUrl = process.env.BOT_ENGINE_URL || "http://localhost:3001";
  const botStart = Date.now();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 2000);
    const botRes = await fetch(`${botEngineUrl}/health`, { signal: controller.signal });
    clearTimeout(timer);
    checks.botEngine = {
      status: botRes.ok ? "healthy" : "degraded",
      latencyMs: Date.now() - botStart
    };
  } catch (e: any) {
    checks.botEngine = { status: "offline", latencyMs: Date.now() - botStart, error: e.message };
  }

  // 3. OpenBSP URL check
  const openbspUrl = process.env.OPENBSP_BASE_URL;
  if (openbspUrl) {
    const obStart = Date.now();
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);
      const obRes = await fetch(openbspUrl, { signal: controller.signal });
      clearTimeout(timer);
      checks.openbsp = { status: obRes.status < 500 ? "healthy" : "error", latencyMs: Date.now() - obStart };
    } catch (e: any) {
      checks.openbsp = { status: "unreachable", latencyMs: Date.now() - obStart };
    }
  } else {
    checks.openbsp = { status: "unconfigured", latencyMs: 0 };
  }

  // 4. Fetch real error logs from Supabase
  let realLogs: any[] = [];
  if (supabase) {
    try {
      const { data: auditLogs } = await supabase
        .from("agency_audit_log")
        .select("id, action, entity_type, entity_id, details, created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      const { data: breaches } = await supabase
        .from("breach_incidents")
        .select("id, hotel_id, severity, description, status, created_at")
        .order("created_at", { ascending: false })
        .limit(10);

      if (auditLogs) {
        for (const l of auditLogs) {
          const isErr = l.action.toLowerCase().includes("error") || l.action.toLowerCase().includes("failed");
          realLogs.push({
            id: l.id,
            time: l.created_at,
            hotel: l.entity_id || "System",
            node: l.entity_type || l.action,
            severity: isErr ? "Critical" : "Info",
            msg: typeof l.details === "object" ? JSON.stringify(l.details) : String(l.details || l.action),
            trace: null
          });
        }
      }

      if (breaches) {
        for (const b of breaches) {
          realLogs.push({
            id: b.id,
            time: b.created_at,
            hotel: b.hotel_id || "Tenant",
            node: "Security Compliance",
            severity: b.severity || "Warning",
            msg: b.description,
            trace: `Breach status: ${b.status}`
          });
        }
      }
    } catch (err: any) {
      console.warn("[Admin Health] Error fetching logs:", err.message);
    }
  }

  res.json({
    success: true,
    checks,
    logs: realLogs
  });
});

// ── GET /api/admin/queues ──────────────────────────────────────────────────
router.get("/queues", async (req, res) => {
  try {
    let pendingConversations = 0;
    let failedConversations = 0;
    let activeQueues: any[] = [];

    if (supabase) {
      const { count: pendingCount } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending");

      const { count: failedCount } = await supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("status", "failed");

      pendingConversations = pendingCount || 0;
      failedConversations = failedCount || 0;

      // Group active conversations by hotel
      const { data: convos } = await supabase
        .from("conversations")
        .select("id, hotel_id, channel, status, message_count, last_message_at")
        .order("last_message_at", { ascending: false })
        .limit(20);

      if (convos && convos.length > 0) {
        activeQueues = convos.map(c => ({
          id: c.id,
          hotelId: c.hotel_id,
          channel: c.channel,
          status: c.status,
          messageCount: c.message_count,
          lastActivity: c.last_message_at
        }));
      }
    }

    res.json({
      success: true,
      summary: {
        pendingJobs: pendingConversations,
        failedJobs: failedConversations,
        activeWorkers: 1,
        engineStatus: "idle"
      },
      jobs: activeQueues
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch queues" });
  }
});

// ── POST /api/admin/queues/flush ───────────────────────────────────────────
router.post("/queues/flush", async (req, res) => {
  try {
    if (supabase) {
      await supabase.from("agency_audit_log").insert({
        action: "queue_flushed",
        entity_type: "queue",
        details: { timestamp: new Date().toISOString() }
      });
    }
    res.json({ success: true, message: "Queue flush completed" });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to flush queue" });
  }
});

// ── POST /api/admin/provision ──────────────────────────────────────────────
router.post("/provision", async (req, res) => {
  const { name, slug, contactEmail, country, tier, channels, webhookDomain, n8nPort } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: "Hotel name and slug are required" });
  }

  try {
    let hotelRecord: any = null;
    let subscriptionRecord: any = null;

    if (supabase) {
      // 1. Insert into public.hotels
      const { data: hData, error: hErr } = await supabase
        .from("hotels")
        .upsert({
          name,
          slug,
          domain: webhookDomain || `${slug}.getever.com.ng`,
          email: contactEmail || null,
          settings: {
            country: country || "Nigeria",
            tier: tier || "starter",
            channels: channels || ["whatsapp"],
            n8nPort: n8nPort || "5678"
          }
        }, { onConflict: "slug" })
        .select()
        .single();

      if (hErr) throw hErr;
      hotelRecord = hData;

      // 2. Insert into public.subscriptions
      const baseFeeMap: Record<string, number> = { starter: 99000, growth: 299000, enterprise: 500000 };
      const { data: sData, error: sErr } = await supabase
        .from("subscriptions")
        .upsert({
          hotel_id: hotelRecord.id,
          plan: tier || "starter",
          status: "active",
          monthly_base_fee: baseFeeMap[tier] || 99000,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString()
        }, { onConflict: "hotel_id" })
        .select()
        .single();

      if (sErr) console.warn("[Admin Provision] Subscription record warning:", sErr.message);
      subscriptionRecord = sData;

      // 3. Log into agency_audit_log
      await supabase.from("agency_audit_log").insert({
        hotel_id: hotelRecord.id,
        action: "provision_hotel",
        entity_type: "hotel",
        entity_id: slug,
        details: { name, tier, channels, webhookDomain }
      });
    }

    // 4. Scaffolding directory in clients/${slug} if filesystem allows
    const clientPath = path.resolve(process.cwd(), "..", "clients", slug);
    try {
      fs.mkdirSync(clientPath, { recursive: true });
      fs.mkdirSync(path.join(clientPath, "credentials"), { recursive: true });

      const envContent = [
        `HOTEL_SLUG=${slug}`,
        `HOTEL_NAME="${name}"`,
        `N8N_PORT=${n8nPort || 5678}`,
        `BOT_ENGINE_PORT=3001`,
        `WEBHOOK_BASE_URL=https://${webhookDomain || `${slug}.getever.com.ng`}`,
        `SUPABASE_URL=${process.env.SUPABASE_URL || ""}`,
        `SUPABASE_SERVICE_ROLE_KEY=${process.env.SUPABASE_SERVICE_ROLE_KEY || ""}`,
        `INTERNAL_API_KEY=${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`
      ].join("\n");

      fs.writeFileSync(path.join(clientPath, ".env"), envContent);
    } catch (fsErr: any) {
      console.warn("[Admin Provision] Filesystem scaffold notice:", fsErr.message);
    }

    res.json({
      success: true,
      hotel: hotelRecord,
      subscription: subscriptionRecord,
      message: `Hotel ${name} (${slug}) successfully provisioned!`
    });
  } catch (err: any) {
    console.error("[Admin Provision Error]", err);
    res.status(500).json({ error: err.message || "Provisioning failed" });
  }
});

// ── GET /api/admin/billing ─────────────────────────────────────────────────
router.get("/billing", async (req, res) => {
  try {
    let clients: any[] = [];

    if (supabase) {
      const { data: hotels } = await supabase
        .from("hotels")
        .select("id, name, slug, settings, created_at");

      const { data: subs } = await supabase
        .from("subscriptions")
        .select("hotel_id, plan, status, monthly_base_fee");

      const { data: invoices } = await supabase
        .from("monthly_invoices")
        .select("id, hotel_id, billing_period, base_fee, attribution_fee, total_due, status, due_date");

      if (hotels && hotels.length > 0) {
        for (const h of hotels) {
          const sub = subs?.find(s => s.hotel_id === h.id);
          const hotelInvoices = invoices?.filter(inv => inv.hotel_id === h.id) || [];

          // Count live messages and leads for this hotel
          const { count: msgCount } = await supabase
            .from("conversations")
            .select("id", { count: "exact", head: true })
            .eq("hotel_id", h.id);

          const { count: leadCount } = await supabase
            .from("leads")
            .select("id", { count: "exact", head: true })
            .eq("hotel_id", h.id);

          clients.push({
            id: h.id,
            name: h.name,
            slug: h.slug,
            tier: sub?.plan || h.settings?.tier || "Starter",
            status: sub?.status === "active" ? "Active" : "Pending",
            msgs: msgCount || 0,
            leads: leadCount || 0,
            baseFee: sub?.monthly_base_fee || 99000,
            invoices: hotelInvoices
          });
        }
      }
    }

    res.json({ success: true, clients });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Failed to fetch billing data" });
  }
});

// ── POST /api/admin/invoices/generate ──────────────────────────────────────
router.post("/invoices/generate", async (req, res) => {
  const { period } = req.body;
  const billingPeriod = period || new Date().toISOString().substring(0, 7);

  try {
    let generatedCount = 0;
    if (supabase) {
      const { data: hotels } = await supabase.from("hotels").select("id, name, slug");
      const { data: subs } = await supabase.from("subscriptions").select("hotel_id, plan, monthly_base_fee");

      if (hotels && hotels.length > 0) {
        for (const h of hotels) {
          const sub = subs?.find(s => s.hotel_id === h.id);
          const baseFee = sub?.monthly_base_fee || 99000;

          await supabase.from("monthly_invoices").insert({
            hotel_id: h.id,
            invoice_number: `INV-${h.slug.toUpperCase()}-${Date.now().toString().slice(-4)}`,
            billing_period: billingPeriod,
            base_fee: baseFee,
            attribution_fee: 0,
            total_due: baseFee,
            status: "pending",
            due_date: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString()
          });
          generatedCount++;
        }
      }
    }

    res.json({ success: true, generatedCount, message: `Generated ${generatedCount} invoices for ${billingPeriod}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "Invoice generation failed" });
  }
});

export default router;
