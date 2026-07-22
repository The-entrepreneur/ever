import { Router } from "express";

const router = Router();

router.post("/book", (req, res) => {
  const { date, time, name, email } = req.body;
  
  if (!date || !time || !name || !email) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Normally we would use the Google Calendar API client here:
  // const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
  // await calendar.events.insert({ ... })

  console.log(`[Google Calendar API] Mock Booked: ${date} at ${time} for ${name} <${email}>`);
  
  res.json({ success: true, message: "Calendar event successfully booked." });
});

export default router;
