import { Router } from "express";

const router = Router();

router.post("/pause", (req, res) => {
  const { paused, channel_id } = req.body;
  
  if (paused === undefined) {
    return res.status(400).json({ error: "paused state is required" });
  }

  // Normally this would call OpenBSP's native conversation pause endpoint
  // await fetch(`${OPENBSP_URL}/rest/v1/conversations`, {
  //   method: 'PATCH',
  //   headers: { 'Content-Type': 'application/json', apikey: '...' },
  //   body: JSON.stringify({ paused, channel_id })
  // })

  console.log(`[OpenBSP] Conversation pause state set to: ${paused} for channel: ${channel_id}`);
  
  res.json({ success: true, paused, message: `Conversation pause state updated to ${paused}` });
});

export default router;
