import { Router } from "express";
import { supabase, localCache } from "../lib/globals.js";

// Extend local cache to include instagram accounts
if (!('instagramAccounts' in localCache)) {
  (localCache as any).instagramAccounts = [];
}

const router = Router();

router.post("/whatsapp/connect", async (req, res) => {
  const { phone_number, phone_number_id, waba_id, display_name } = req.body;
  if (!phone_number || !phone_number_id) {
    return res.status(400).json({ error: "phone_number and phone_number_id are required" });
  }

  const newAccount = {
    id: `wa-${Math.floor(Math.random() * 1000)}`,
    phone_number,
    phone_number_id,
    waba_id: waba_id || "waba-mock-id",
    display_name: display_name || "Hotel WhatsApp",
    status: "connected",
    connected_via: "openbsp_embedded",
    connected_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("whatsapp_accounts")
        .upsert({
          phone_number,
          phone_number_id,
          waba_id: newAccount.waba_id,
          display_name: newAccount.display_name,
          status: "connected",
          connected_via: "openbsp_embedded",
          connected_at: newAccount.connected_at
        }, { onConflict: "phone_number_id" })
        .select();
      
      if (error) throw error;
      return res.json({ success: true, account: data?.[0] || newAccount });
    } catch (err: any) {
      console.error("[Supabase WA Connect Error]", err.message);
    }
  }

  // Memory fallback
  const existingIndex = localCache.whatsappAccounts.findIndex(acc => acc.phone_number_id === phone_number_id);
  if (existingIndex >= 0) {
    localCache.whatsappAccounts[existingIndex] = { ...localCache.whatsappAccounts[existingIndex], ...newAccount };
  } else {
    localCache.whatsappAccounts.push(newAccount);
  }

  res.json({ success: true, account: newAccount });
});

router.get("/whatsapp", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("whatsapp_accounts").select("*");
      if (!error && data) return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  res.json(localCache.whatsappAccounts);
});

// Instagram Connect (via OpenBSP Embedded Signup — service: "instagram")
router.post("/instagram/connect", async (req, res) => {
  const { ig_username, ig_account_id, display_name, service } = req.body;
  if (!ig_username || !ig_account_id) {
    return res.status(400).json({ error: "ig_username and ig_account_id are required" });
  }

  const newAccount = {
    id: `ig-${Date.now()}`,
    ig_username,
    ig_account_id,
    display_name: display_name || ig_username,
    service: service || "instagram",
    status: "connected",
    connected_via: "openbsp_embedded",
    connected_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("instagram_accounts")
        .upsert({
          ig_username,
          ig_account_id,
          display_name: newAccount.display_name,
          status: "connected",
          connected_via: "openbsp_embedded",
          connected_at: newAccount.connected_at
        }, { onConflict: "ig_account_id" })
        .select();
      if (error) throw error;
      return res.json({ success: true, account: data?.[0] || newAccount });
    } catch (err: any) {
      console.error("[Supabase IG Connect Error]", err.message);
    }
  }

  // Memory fallback
  const igAccounts = (localCache as any).instagramAccounts;
  const existingIndex = igAccounts.findIndex((a: any) => a.ig_account_id === ig_account_id);
  if (existingIndex >= 0) {
    igAccounts[existingIndex] = { ...igAccounts[existingIndex], ...newAccount };
  } else {
    igAccounts.push(newAccount);
  }

  res.json({ success: true, account: newAccount });
});

// Instagram Accounts Fetch
router.get("/instagram", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("instagram_accounts").select("*");
      if (!error && data) return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  res.json((localCache as any).instagramAccounts || []);
});

export default router;
