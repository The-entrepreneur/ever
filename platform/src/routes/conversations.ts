import { Router } from "express";

const router = Router();

router.post("/resolve", async (req, res) => {
  const { session_id, channel } = req.body;
  
  if (!session_id) {
    return res.status(400).json({ error: "session_id is required" });
  }

  try {
    // Forward the resolve request to the Bot Engine to clear the Redis lock
    const botEngineUrl = process.env.BOT_ENGINE_URL || "http://localhost:3001";
    
    // Import node-fetch dynamically as it's an ES module or rely on global fetch if Node 18+
    const fetchRes = await fetch(`${botEngineUrl}/resolve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session_id, channel })
    });

    if (!fetchRes.ok) {
      const text = await fetchRes.text();
      console.warn(`[Conversations] Bot Engine /resolve failed: ${text}`);
      return res.status(500).json({ error: "Failed to resolve handoff at Bot Engine" });
    }

    console.log(`[Conversations] Handoff resolved for session: ${session_id}`);
    res.json({ success: true, message: "Handoff lock cleared successfully" });
  } catch (err: any) {
    console.error(`[Conversations] Error calling Bot Engine /resolve:`, err.message);
    res.status(500).json({ error: "Internal server error connecting to Bot Engine" });
  }
});

export default router;
