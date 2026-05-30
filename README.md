# ever_agent_core — Hotel Chatbot Automation System

A scalable, template-driven automation system for deploying AI-powered Customer Support Systems for hotels and guest houses. Each client (hotel/guest house) gets their own dedicated, isolated, containerised stack.

---

## Service Tiers

| Package | Setup | Monthly | Includes |
|---|---|---|---|
| **Level 1 — Starter** | $199 | $56/mo | FAQ automation, multilingual, 5 channels |
| **Level 2 — Growth** | $468 | $99/mo | Direct booking engine, upsells, PMS integration, payments |

---

## Tech Stack

- **Orchestration:** n8n (self-hosted)
- **Bot Engine (L2):** Node.js + Express + BullMQ
- **State & Queues:** Redis 7
- **PMS Adapter:** FastAPI (Python)
- **Agency Database:** PostgreSQL (Neon/Supabase)
- **Routing:** Nginx reverse proxy

---

## Directory Structure

```
ever_agent_core/
├── base/
│   ├── n8n-workflows/        # Workflow templates (level1.json, level2.json)
│   ├── bot-engine/           # Node.js stateful bot engine (Level 2)
│   │   ├── adapters/         # PMS abstraction layer
│   │   ├── handlers/         # Booking, upsell, lead dialog handlers
│   │   ├── queues/           # BullMQ follow-up scheduler
│   │   └── redis/            # Session & lock management
│   ├── pms-api/              # FastAPI PMS layer (coming in Phase 2)
│   ├── templates/            # .env, faq.json, rooms.json, nginx templates
│   └── docker/               # Docker Compose files for L1 and L2
├── clients/                  # Per-client deployments (auto-generated)
├── nginx/                    # Per-client Nginx configs (auto-generated)
├── widget/                   # Embeddable JS chat widget
│   ├── widget.js             # Development source
│   └── widget.min.js         # Production build
├── tracker/
│   └── schema.sql            # Agency PostgreSQL schema
└── scripts/
    └── new-client.sh         # Client provisioning script
```

---

## Quick Start — New Client Deployment

```bash
# 1. Clone this repo onto your VPS
git clone https://github.com/your-org/ever_agent_core.git
cd ever_agent_core

# 2. Provision a new Level 1 client
#    Usage: ./scripts/new-client.sh <slug> <level1|level2> <n8n-port> [bot-port]
./scripts/new-client.sh grand-horizon level1 5679

# 3. Edit the generated .env
nano clients/grand-horizon/.env

# 4. Start the stack
cd clients/grand-horizon && docker-compose up -d

# 5. Link Nginx and SSL
sudo ln -sf $(pwd)/nginx/grand-horizon.conf /etc/nginx/sites-enabled/
sudo certbot --nginx -d grand-horizon.youragency.com
```

---

## Widget Embed (Client Side)

Clients paste this one line before `</body>` on their website:

```html
<script
  src="https://widgets.youragency.com/widget.min.js"
  data-hotel="grand-horizon"
  data-webhook="https://grand-horizon.youragency.com/webhook/hotel-chatbot"
  data-color="#1E90FF"
  data-name="Grand Horizon Hotel"
  defer>
</script>
```

---

## Supported Channels

- ✅ Website widget (embed)
- ✅ WhatsApp (Twilio / EvolutionAPI / Cloud API)
- ✅ Instagram DM
- ✅ Facebook Messenger
- ✅ Tawk.to

---

*Internal Build — Agency Use Only*
