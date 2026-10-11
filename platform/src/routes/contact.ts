import { Router } from "express";
import fs from "fs";
import path from "path";
import { localCache, supabase } from "../lib/globals.js";

const router = Router();
const LEADS_FILE_PATH = path.join(process.cwd(), "data", "inbound_leads.json");

// Helper to ensure data directory and file exist
function persistLeadToFile(lead: any) {
  try {
    const dir = path.dirname(LEADS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    let existing: any[] = [];
    if (fs.existsSync(LEADS_FILE_PATH)) {
      try {
        const raw = fs.readFileSync(LEADS_FILE_PATH, "utf8");
        existing = JSON.parse(raw);
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }
    }
    existing.unshift(lead);
    fs.writeFileSync(LEADS_FILE_PATH, JSON.stringify(existing, null, 2), "utf8");
  } catch (err) {
    console.warn("[Inbound Lead] Could not write to fallback file:", err);
  }
}

/**
 * POST /api/contact
 * Captures inbound leads from Help Desk and marketing touchpoints
 */
router.post("/", async (req, res) => {
  try {
    const { email, firstName, lastName, companyName, jobTitle, companySize, message, source } = req.body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "A valid email address is required." });
    }

    if (!firstName || typeof firstName !== "string" || !firstName.trim()) {
      return res.status(400).json({ error: "First name is required." });
    }

    if (!companyName || typeof companyName !== "string" || !companyName.trim()) {
      return res.status(400).json({ error: "Company or property name is required." });
    }

    const leadId = `lead-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newLead = {
      id: leadId,
      email: email.trim().toLowerCase(),
      firstName: firstName.trim(),
      lastName: (lastName || "").trim(),
      companyName: companyName.trim(),
      jobTitle: (jobTitle || "").trim(),
      companySize: (companySize || "").trim(),
      message: (message || "").trim(),
      source: (source || "help_desk_contact_form").trim(),
      status: "new",
      createdAt: new Date().toISOString(),
      ip: req.ip || req.headers["x-forwarded-for"] || "127.0.0.1",
    };

    // 1. In-memory cache
    localCache.contactSubmissions.unshift(newLead);

    // 2. Persistent local disk JSON backup
    persistLeadToFile(newLead);

    // 3. Supabase persistence (gracefully catches if table does not exist)
    if (supabase) {
      try {
        await supabase.from("inquiries").insert({
          id: leadId,
          email: newLead.email,
          first_name: newLead.firstName,
          last_name: newLead.lastName,
          company_name: newLead.companyName,
          job_title: newLead.jobTitle,
          company_size: newLead.companySize,
          message: newLead.message,
          source: newLead.source,
          status: newLead.status,
          created_at: newLead.createdAt,
        });
      } catch (dbErr: any) {
        // Fallback gracefully without dropping the submission
        console.warn("[Inbound Lead] Supabase table insert skipped/failed:", dbErr?.message || dbErr);
      }
    }

    console.log(`[INBOUND LEAD CAPTURED] ${newLead.companyName} (${newLead.firstName} <${newLead.email}>)`);

    return res.status(200).json({
      success: true,
      id: leadId,
      message: "Thank you! Your infrastructure inquiry has been successfully captured. An onboarding specialist will review your property within 24 hours.",
    });
  } catch (error: any) {
    console.error("[Inbound Lead] Submission error:", error);
    return res.status(500).json({
      error: "An unexpected error occurred while capturing your inquiry. Please try again or email support@eversoftware.com directly.",
    });
  }
});

/**
 * GET /api/contact
 * Admin endpoint to retrieve all captured inbound leads
 */
router.get("/", (req, res) => {
  try {
    let fileLeads: any[] = [];
    if (fs.existsSync(LEADS_FILE_PATH)) {
      try {
        fileLeads = JSON.parse(fs.readFileSync(LEADS_FILE_PATH, "utf8"));
      } catch {
        fileLeads = [];
      }
    }

    const all = [...localCache.contactSubmissions];
    // Merge file leads if not in memory
    for (const fl of fileLeads) {
      if (!all.some(l => l.id === fl.id)) {
        all.push(fl);
      }
    }

    all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return res.json({
      success: true,
      count: all.length,
      leads: all,
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to read leads.", details: err?.message });
  }
});

export default router;
