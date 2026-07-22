import { Router } from "express";
import { supabase, localCache } from "../lib/globals.js";

const router = Router();

router.get("/", async (req, res) => {
  if (supabase) {
    try {
      const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
      if (!error && data) return res.json(data);
    } catch (err) {
      console.error(err);
    }
  }
  res.json(localCache.orders);
});

router.post("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  if (!status) {
    return res.status(400).json({ error: "status is required" });
  }

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("orders")
        .update({ status })
        .eq("id", id)
        .select();
      
      if (!error && data?.length) {
        return res.json({ success: true, order: data[0] });
      }
    } catch (err) {
      console.error(err);
    }
  }

  // Memory fallback
  const ordItem = localCache.orders.find(o => o.id === id);
  if (ordItem) {
    ordItem.status = status;
    return res.json({ success: true, order: ordItem });
  }
  
  res.status(404).json({ error: "Order not found" });
});

export default router;
