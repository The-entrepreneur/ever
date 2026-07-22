import { Router } from "express";

const router = Router();

// Mock template storage
const templates = [
  {
    id: "tpl-1",
    name: "booking_confirmation",
    language: "en_US",
    category: "UTILITY",
    status: "APPROVED",
    created_at: new Date().toISOString()
  },
  {
    id: "tpl-2",
    name: "payment_reminder",
    language: "en_US",
    category: "MARKETING",
    status: "PENDING",
    created_at: new Date().toISOString()
  }
];

router.get("/", (req, res) => {
  // Normally this would fetch from OpenBSP:
  // await fetch(`${OPENBSP_URL}/v1/templates`, { headers: { apikey: ... } })
  res.json({ success: true, templates });
});

router.post("/", (req, res) => {
  const { name, language, category, body } = req.body;
  if (!name || !language || !category) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  // Normally this would post to OpenBSP:
  // await fetch(`${OPENBSP_URL}/v1/templates`, { method: "POST", ... })
  
  const newTemplate = {
    id: `tpl-${Date.now()}`,
    name,
    language,
    category,
    status: "PENDING",
    created_at: new Date().toISOString()
  };
  
  templates.push(newTemplate);
  res.json({ success: true, template: newTemplate });
});

export default router;
