# Ever ⎯ The Smart Operations Backbone for Premium Hospitality

Ever is a unified guest-facing commerce layer, automated messaging engine, and global revenue intelligence platform designed specifically for hospitality groups, boutique hotels, resorts, and vacation rental portfolios.

By wrapping around legacy Property Management Systems (PMS), Ever enables hotel operators to automate high-touch guest interactions, secure direct-channel ancillary room sales, and synchronize ledgers without adding manual staff overhead.

---

## 🔑 Core Philosophy & Feature Stack

### 1. Bring Your Own API Keys (BYOK)
Ever operates under a secure sovereign-key model. Hotel networks are expected to connect their own LLM intelligence infrastructure depending on their compliance requirements and usage quotas:
* **OpenAI** (GPT-4o, GPT-4o-mini)
* **Groq AI** (Ultra-fast, low-latency inference)
* **Anthropic** (Claude 3.5 Sonnet context-rich workflows)
* **Google Gemini** (Multimodal capabilities for vision & text)
* **Cohere** (Enterprise-grade RAG & embeddings)

### 2. Live Channel & PMS Integrations
Natively synchronizes operations, guest profiles, and room bookings across standard enterprise systems, avoiding double keying or manual ledger edits:
* **PMS Suite**: Cloudbeds, Mews, Opera PMS, Guesty, WebRezPro, Sabre
* **Communication Channels**: WhatsApp Business, Facebook Messenger, Instagram DM, Telegram Core, SMS Gateway
* **Fintech & Gateways**: Stripe, Adyen, PayPal, and regional champions **Paystack** and **Flutterwave** for Africa-focused operators
* **Analytics**: Google Analytics, Mixpanel, Hotjar

### 3. Modular Product Layer
* **Guest Concierge Engine (GCE)**: Generative auto-answering that responds to repetitive guest queries (Wi-Fi, check-out protocols, local guides) under 5 seconds while retaining a highly tailored, warm luxury voice.
* **Hospitality Commerce Agent (HCA)**: Drives high-margin upsells (late checkout slots, spa bookings, champagne room delivery, airport transfers) with customized checkouts.
* **Global Revenue Intelligence**: Monitors team response latency, conversion funnels, custom ledger reporting, and active session details.

---

## 📂 Technical Implementation & Directory Layout

The application is structured as a modern, high-performance, responsive Single Page Application (SPA) utilizing:
* **Framework**: React 18 with Vite compiler.
* **Language**: Fully typed TypeScript.
* **Styling**: Tailwind CSS utilizing a minimalist, high-contrast, editorial visual layout (warm off-white canvas `#F9F6F0` and premium charcoal text `#111111` accented by brand alert coral `#EA6639`).
* **Animations**: Fluid, spring-based motion curves using `motion/react` for micro-interactions and route changes.
* **Icons**: Standard scalable visual indicators from `lucide-react`.

```text
/src
├── components/             # Reusable UI layout blocks & page views
│   ├── About.tsx           # Mission, operators, visual stats, and press board
│   ├── HelpDesk.tsx        # Dynamic lead capture form & ROI metrics (PMS sync-focused)
│   ├── Integrations.tsx    # Live BYOK catalog, dynamic status toggle & simulated configuration logs
│   ├── Navbar.tsx          # Responsive layout header with unclickable dropdown selectors for market fit
│   ├── Privacy.tsx         # Legal & GDPR compliance guidelines (editorial serif typography)
│   ├── Terms.tsx           # Account terms & platform access constraints
│   ├── Footer.tsx          # Global links & operational metrics indicator
│   └── ...                 # Interactive feature layers (RevenueIntelligence, PerfectSync, etc.)
├── data/
│   └── integrationsData.ts # Unified integration manifest (BYOK configs, Flutterwave, Paystack details)
├── App.tsx                 # Main client routing module (react-router-dom configuration)
├── index.css               # Global tailwind rules & typography integrations
└── main.tsx                # React entry mounting point
```

---

## ⚡ Getting Started

### Prerequisites
Ensure Node.js is installed on your local environment.

### Installation
Clone the repository and install dependencies:
```bash
npm install
```

### Dev Server
Launch Vite development server on port `3000`:
```bash
npm run dev
```

### Linter & Verification
Validate typescript declarations and file formatting:
```bash
npm run lint
```

### Build Pipeline
Compile the static distribution bundles to the `/dist` directory for Cloud Run container hosting:
```bash
npm run build
```

---

## 🛡️ License & Compliance
Ever Software, Inc. All Rights Reserved 2026. This platform complies fully with standard localized payment security (PCI-DSS standards) and guest GDPR requirements.
