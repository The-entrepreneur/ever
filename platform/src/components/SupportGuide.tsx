import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  BookOpen, 
  Search, 
  Terminal, 
  ChevronRight, 
  Copy, 
  Check, 
  CornerDownRight, 
  ThumbsUp, 
  ThumbsDown, 
  Sparkles, 
  MessageSquare, 
  ArrowRight,
  Send,
  HelpCircle,
  Menu,
  X,
  FileText
} from "lucide-react";

interface DocSection {
  title: string;
  id: string;
  subsections?: string[];
}

interface DocContent {
  category: string;
  title: string;
  description: string;
  sections: DocSection[];
  body: React.ReactNode;
}

export function SupportGuide() {
  const [activeTab, setActiveTab] = useState<"guides" | "api" | "cli" | "changelog">("guides");
  const [activeDoc, setActiveDoc] = useState<string>("internal-connections");
  const [isCopied, setIsCopied] = useState(false);
  const [useSearchQuery, setUseSearchQuery] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [chatbotActive, setChatbotActive] = useState(false);
  const [chatbotMessages, setChatbotMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const copyCodeToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleAskQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim()) return;
    
    const queryText = userQuery;
    setChatbotActive(true);
    setChatbotMessages(prev => [...prev, { role: "user", text: queryText }]);
    setUserQuery("");

    // Add a loading indicator
    setChatbotMessages(prev => [...prev, { role: "assistant", text: "..." }]);

    try {
      // Safely map previous messages to match user/model roles for @google/genai backend
      const historyPayload = chatbotMessages
        .filter(msg => msg.text !== "...")
        .map(msg => ({
          role: msg.role === "user" ? "user" : "model",
          parts: [{ text: msg.text }]
        }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt: queryText,
          history: historyPayload
        })
      });

      const data = await res.json();
      if (data.text) {
        setChatbotMessages(prev => {
          const next = [...prev];
          if (next.length > 0 && next[next.length - 1].text === "...") {
            next[next.length - 1] = { role: "assistant", text: data.text };
          } else {
            next.push({ role: "assistant", text: data.text });
          }
          return next;
        });
      } else {
        throw new Error(data.error || "Empty response from server");
      }
    } catch (err) {
      console.error("Agent error:", err);
      setChatbotMessages(prev => {
        const next = [...prev];
        const errorText = "Apologies, I hit a temporary pipeline issue contacting my model brain. Please check your config parameters or try again.";
        if (next.length > 0 && next[next.length - 1].text === "...") {
          next[next.length - 1] = { role: "assistant", text: errorText };
        } else {
          next.push({ role: "assistant", text: errorText });
        }
        return next;
      });
    }
  };

  const documents: Record<string, DocContent> = {
    "internal-connections": {
      category: "Get started",
      title: "Internal connections",
      description: "Learn how internal connections work, how permissions are managed, and how to create one.",
      sections: [
        { title: "What is an internal connection?", id: "what-is-internal" },
        { title: "How permissions work", id: "how-permissions-work" },
        { title: "Creating an internal connection", id: "creating-connection" },
        { title: "Granting page access", id: "granting-access", subsections: ["From the Developer portal", "From the Ever UI"] },
        { title: "Authentication", id: "authentication" },
        { title: "Next steps", id: "next-steps" }
      ],
      body: (
        <>
          <div id="what-is-internal" className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">What is an internal connection?</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              An internal connection is scoped to a single Ever hotel workspace. Only managers and certified tech contributors of that workspace can instantiate it. Internal connections are ideal for team-owned guest automations and PMS triggers, such as syncing guest folios from external tools, sending checkout notifications when room housekeeping updates, or powering local dashboard charts.
            </p>
            <p className="text-zinc-800 leading-relaxed text-xs font-light">
              Internal connections use a static API token for secure authentication. There is no complex multi-step OAuth redirection matrix to configure: you retrieve a cryptographically signed tenant token immediately when you instantiate the link, and pass that token for every server-to-server request.
            </p>
            <p className="text-zinc-800 leading-relaxed text-xs">
              If you require a connection token that acts representing an individual agent/manager ID (for instance, to post messages as their name), you should prefer a <span className="text-[#EA6639] hover:underline font-medium cursor-pointer">personal access token</span> instead. Those tokens maintain strict policy privileges mimicking normal credential roles.
            </p>
          </div>

          <div id="how-permissions-work" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">How permissions work</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              An internal connection starts completely sandboxed. It can only write, read, or perform actions on endpoints you explicitly toggle. Access parameters are governed by three core variables:
            </p>
            <div className="bg-white rounded-2xl border border-zinc-200 p-5 space-y-4 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <div className="font-bold text-zinc-900 mb-1 uppercase font-mono tracking-wide text-[10px] text-[#EA6639]">PMS Read Access</div>
                  <span className="text-zinc-500 font-light">Checks booking reservations, room status, guest names.</span>
                </div>
                <div className="p-3 bg-[#7C3AED]/5 rounded-xl border border-zinc-200">
                  <div className="font-bold text-zinc-900 mb-1 uppercase font-mono tracking-wide text-[10px] text-purple-600">Ledger Write Access</div>
                  <span className="text-zinc-500 font-light">Posts room service fees, excursion bookings, extended checkout surcharges.</span>
                </div>
                <div className="p-3 bg-emerald-500/5 rounded-xl border border-zinc-200">
                  <div className="font-bold text-zinc-900 mb-1 uppercase font-mono tracking-wide text-[10px] text-emerald-600">Messaging Hub</div>
                  <span className="text-zinc-500 font-light">Broadcasts Whatsapp templates and automates channel chats.</span>
                </div>
              </div>
            </div>
          </div>

          <div id="creating-connection" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Creating an internal connection</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              To build a secure tunnel webhook sync, issue an instantiate command on your terminal. Below is the secure initialization sequence:
            </p>
            
            {/* Elegant code box with COPY action */}
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden mt-4 shadow-md">
              <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="text-xs font-mono text-zinc-300 font-medium">init_ledger_tunnel.sh</span>
                </div>
                <button 
                  onClick={() => copyCodeToClipboard("curl -X POST https://api.ever.ai/v4/connections \\\n  -H \"Authorization: Bearer ev_live_token\" \\\n  -H \"Content-Type: application/json\" \\\n  -d '{\"name\": \"Housekeeping Agent\", \"role\": \"write\"}'")}
                  className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-white transition-colors py-1 px-2.5 rounded hover:bg-zinc-800"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? "Copied!" : "Copy code"}</span>
                </button>
              </div>
              <pre className="p-5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950/40">
                <code>
{`curl -X POST https://api.ever.ai/v4/connections \\
  -H "Authorization: Bearer ev_live_token" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Housekeeping Agent",
    "scopes": ["pms.read", "ledger.write"],
    "sandbox_mode": true
  }'`}
                </code>
              </pre>
            </div>
          </div>

          <div id="granting-access" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Granting page access</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              By default, connections have empty database privileges. You must link distinct guest pages to permit automated read/write tracking parameters.
            </p>
            
            <div className="pl-4 border-l-2 border-zinc-200 space-y-6 mt-4">
              <div id="from-the-developer-portal" className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#EA6639]" />
                  From the Developer portal
                </h4>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Head to the Credentials tab inside your partner dashboard, locate your Connection ID, and toggle "Active Webhook Dispatch". This guarantees immediate message callbacks.
                </p>
              </div>

              <div id="from-the-ever-ui" className="space-y-2">
                <h4 className="text-xs font-bold text-zinc-900 flex items-center gap-1">
                  <CornerDownRight className="w-3.5 h-3.5 text-[#7C3AED]" />
                  From the Ever UI
                </h4>
                <p className="text-zinc-500 text-xs font-light leading-relaxed">
                  Open any live guest itinerary list, click the settings cog wheel in the superior right corner, and click "Integrate Connection App." Choose your custom agent to immediately delegate communication.
                </p>
              </div>
            </div>
          </div>

          <div id="authentication" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Authentication</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              All REST API calls must include the authorization bearer prefix. The header is case-sensitive and must conform to safety structures.
            </p>
            <div className="bg-white border border-zinc-200 rounded-2xl p-4 font-mono text-xs text-zinc-800 shadow-sm">
              <span className="text-[#EA6639] font-bold">GET</span> /v4/guest_itinerary/room_304 <br />
              <span className="text-zinc-500">Authorization:</span> Bearer ev_live_67982a39ef01_493
            </div>
          </div>

          <div id="next-steps" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Next steps</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              Once connectivity locks-in, customize responses using the following links:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-[#EA6639] shadow-xs transition-all cursor-pointer group">
                <span className="text-xs uppercase font-mono font-bold text-[#EA6639] group-hover:underline block">Customize Persona Prompt</span>
                <span className="text-[11px] text-zinc-500 mt-1 block font-light">Train model voices to maintain luxurious hospitality vocabulary parameters.</span>
              </div>
              <div className="p-4 bg-white border border-zinc-200 rounded-2xl hover:border-[#7C3AED] shadow-xs transition-all cursor-pointer group">
                <span className="text-xs uppercase font-mono font-bold text-purple-600 group-hover:underline block">Setup WhatsApp Business Webhooks</span>
                <span className="text-[11px] text-zinc-500 mt-1 block font-light">Bridge guest inquiries directly to smart text chains.</span>
              </div>
            </div>
          </div>
        </>
      )
    },
    "quickstart": {
      category: "Get started",
      title: "Quickstart Guide",
      description: "Initialize your guest OS ledger synchronization in under 10 minutes.",
      sections: [
        { title: "Step 1: Get credentials", id: "get-credentials" },
        { title: "Step 2: Sync PMS nodes", id: "sync-pms-nodes" },
        { title: "Step 3: Auto-reply trigger", id: "auto-reply-trigger" }
      ],
      body: (
        <>
          <div id="get-credentials" className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Step 1: Get credentials</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              Sign in to your Ever Cloud portal. Navigate to <strong>Settings &gt; Keys Database</strong>. Generate a live pair token. This secure pair gives you access to full read/write properties.
            </p>
          </div>

          <div id="sync-pms-nodes" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Step 2: Sync PMS nodes</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              Submit your property's Cloudbeds, Mews, or Opera account details. Once validated, Ever parses and locks room rosters into secure runtime states.
            </p>
          </div>

          <div id="auto-reply-trigger" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Step 3: Auto-reply trigger</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              Use your API token to broadcast a dummy guest checkout request. Below is the test POST sequence:
            </p>
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden mt-4 shadow-md">
              <pre className="p-5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950/40">
                <code>
{`curl -X POST https://api.ever.ai/v4/simulator/checkout \\
  -H "Authorization: Bearer ev_test_token" \\
  -d '{"room": "205", "extend": "2 hours"}'`}
                </code>
              </pre>
            </div>
          </div>
        </>
      )
    },
    "notion-mcp": {
      category: "Agent APIs",
      title: "Notion MCP Hub",
      description: "Extend autonomous agents using Model Context Protocol and live Notion pages.",
      sections: [
        { title: "What is Notion MCP?", id: "what-is-notion-mcp" },
        { title: "Local environment layout", id: "mcp-env-layout" }
      ],
      body: (
        <>
          <div id="what-is-notion-mcp" className="space-y-4 pt-4">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">What is Notion MCP?</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              The Model Context Protocol (MCP) allows hotel managers to bind standard Notion workspaces directly to their AI concierge agents. When guests ask about local restaurant recommendations, amenities, or pool hours, the model fetches records directly from your shared Notion database dynamically.
            </p>
          </div>

          <div id="mcp-env-layout" className="space-y-4 pt-10">
            <h3 className="text-xl font-bold text-zinc-950 tracking-tight">Local environment layout</h3>
            <p className="text-zinc-800 leading-relaxed text-xs">
              Mount our pre-built Docker suite or reference the server script node within your environment:
            </p>
            <div className="bg-zinc-950 rounded-2xl border border-zinc-900 overflow-hidden mt-4 shadow-md">
              <pre className="p-5 overflow-x-auto text-xs font-mono text-zinc-300 leading-relaxed bg-zinc-950/40">
                <code>
{`npx -y @ever/mcp-server-notion \\
  --notion-key=secret_nv9k28a1... \\
  --hotel-id=hw_9043`}
                </code>
              </pre>
            </div>
          </div>
        </>
      )
    },
    "faq-hub": {
      category: "Knowledge Base",
      title: "Frequently Asked Questions",
      description: "Find answers to operations, API key handling, security credentials, and system behavior.",
      sections: [
        { title: "Knowledge Base Accordion", id: "faq-search-block" }
      ],
      body: <FaqHubWidget />
    }
  };

  const activeDocData = documents[activeDoc] || documents["internal-connections"];

  const sidebarCategories = [
    {
      name: "Get started",
      items: [
        { name: "Overview", id: "overview", comingSoon: true },
        { name: "Quickstart", id: "quickstart" },
        { name: "Personal access tokens", id: "personal-tokens", comingSoon: true },
        { name: "Internal connections", id: "internal-connections" },
        { name: "Public connections", id: "public-connections", comingSoon: true },
        { name: "Authorization", id: "auth", comingSoon: true },
        { name: "Handling API keys", id: "api-keys", comingSoon: true },
        { name: "Preparing for users", id: "preparing-users", comingSoon: true },
        { name: "List on the Marketplace", id: "marketplace", comingSoon: true }
      ]
    },
    {
      name: "Agent APIs",
      items: [
        { name: "Notion MCP", id: "notion-mcp" },
        { name: "Custom agents", id: "custom-agents", comingSoon: true }
      ]
    },
    {
      name: "API versions",
      items: [
        { name: "Upgrading to 2026-03-11", id: "v2026", comingSoon: true },
        { name: "Upgrading to 2025-09-03", id: "v2025", comingSoon: true }
      ]
    },
    {
      name: "Data APIs",
      items: [
        { name: "Working with page content", id: "page-content", comingSoon: true },
        { name: "Working with databases", id: "databases", comingSoon: true },
        { name: "Working with views", id: "views", comingSoon: true },
        { name: "Working with comments", id: "comments", comingSoon: true },
        { name: "Working with markdown", id: "markdown", comingSoon: true },
        { name: "Working with files and media", id: "files", comingSoon: true }
      ]
    },
    {
      name: "Support & FAQ",
      items: [
        { name: "FAQ Hub", id: "faq-hub" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-800 font-sans antialiased relative selection:bg-[#EA6639]/30">
      
      {/* 1. Header Toolbar (Matches Developer Docs Dark Portal layout) */}
      <header className="border-b border-zinc-200 bg-white/95 sticky top-0 z-30 backdrop-blur-md shadow-sm">
        <div className="max-w-[1600px] mx-auto px-6 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-1.5 hover:opacity-90">
              <span className="font-serif font-black text-xl text-zinc-900 tracking-tight">Ever Docs</span>
              <span className="text-[10px] bg-[#EA6639]/10 text-[#EA6639] font-mono tracking-wider px-2 py-0.5 rounded font-bold">V4</span>
            </Link>

            {/* Simulated primary nav tabs with active highlight setup */}
            <nav className="hidden lg:flex items-center gap-1">
              {[
                { name: "Guides", id: "guides" },
                { name: "API Reference", id: "api", comingSoon: true },
                { name: "CLI Reference", id: "cli", comingSoon: true },
                { name: "Changelog", id: "changelog", comingSoon: true }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => !tab.comingSoon && setActiveTab(tab.id as any)}
                  className={`text-xs px-3.5 py-1.5 rounded-md font-medium transition-colors relative ${tab.comingSoon ? 'text-zinc-400 cursor-not-allowed opacity-60' : activeTab === tab.id ? 'text-[#EA6639] bg-[#EA6639]/10' : 'text-zinc-800 hover:text-zinc-900 hover:bg-zinc-100/50'}`}
                >
                  {tab.name}
                  {tab.comingSoon && (
                    <span className="absolute -top-1 -right-1 text-[8px] bg-zinc-200 text-zinc-500 scale-75 font-mono px-1 rounded-sm uppercase">Soon</span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Center search simulation bar */}
          <div className="hidden md:flex items-center gap-2 max-w-sm w-full bg-white border border-zinc-200 rounded-full px-3 py-1.5 focus-within:border-zinc-400 transition-all shadow-xs">
            <Search className="w-3.5 h-3.5 text-zinc-400" />
            <input 
              placeholder="Search guides, connections..." 
              className="bg-transparent text-xs text-zinc-905 w-full focus:outline-none placeholder-zinc-400"
              value={useSearchQuery}
              onChange={(e) => setUseSearchQuery(e.target.value)}
            />
            <span className="text-[10px] font-mono text-zinc-400 border border-zinc-200 bg-zinc-100 px-1.5 py-0.2 rounded select-none">Ctrl K</span>
          </div>

          {/* Right Gutter quick triggers */}
          <div className="flex items-center gap-3">
            <Link 
              to="/help-desk"
              className="text-xs font-semibold text-zinc-800 hover:text-zinc-900 transition-colors"
            >
              Consult
            </Link>
            <button 
              disabled
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-zinc-100/50 text-zinc-400 border border-zinc-200 rounded-full text-xs font-semibold cursor-not-allowed select-none"
              title="Coming Soon"
            >
              <span>Developer Portal</span>
              <span className="bg-zinc-200 text-zinc-500 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-95">Soon</span>
            </button>
            
            {/* Mobile menu toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1 bg-white border border-zinc-200 rounded text-zinc-800 hover:text-zinc-900 shadow-xs"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>

        </div>
      </header>

      {/* 2. Main Page Columns split (Sidebar, Contents, Outline panel) */}
      <div className="max-w-[1600px] mx-auto flex min-h-[calc(110vh-60px)]">
        
        {/* Left Side Sidebar - Responsive slide drawer on mob, static on desktop */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} fixed lg:static inset-y-0 left-0 w-72 lg:w-68 bg-[#F9F6F0]/95 backdrop-blur-md lg:bg-transparent border-r border-[#111111]/10 p-6 lg:p-4 overflow-y-auto z-40 transition-transform duration-300 pointer-events-auto flex flex-col justify-between shrink-0`}>
          
          <div className="space-y-8">
            {sidebarCategories.map((cat, catIdx) => (
              <div key={catIdx} className="space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 block">
                  {cat.name}
                </span>
                
                <div className="space-y-1">
                  {cat.items.map((item, itemIdx) => {
                    const isActive = activeDoc === item.id;
                    return (
                      <button
                        key={itemIdx}
                        disabled={item.comingSoon}
                        onClick={() => {
                          setActiveDoc(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left rounded-full text-xs py-2 px-3 transition-colors flex items-center justify-between group ${item.comingSoon ? 'text-zinc-400 cursor-not-allowed opacity-55' : isActive ? 'bg-white text-zinc-950 font-bold border-l-2 border-[#EA6639] pl-2.5 shadow-xs' : 'text-zinc-600 hover:bg-white/60 hover:text-zinc-900'}`}
                      >
                        <span className="truncate">{item.name}</span>
                        {item.comingSoon && (
                          <span className="text-[8px] font-mono uppercase bg-zinc-200 px-1 py-0.2 rounded text-zinc-500 scale-90">Soon</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-4 border-t border-[#111111]/10 block text-[11px] text-zinc-500 font-mono tracking-tight">
            🔐 PCI Level-1 Sync Core v4.2
          </div>
        </aside>

        {/* Backdrop for mobile drawer */}
        {sidebarOpen && (
          <div 
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 xl:hidden z-35 backdrop-blur-xs"
          ></div>
        )}

        {/* Center Main documentation text canvas */}
        <main className="flex-1 max-w-4xl px-6 md:px-12 py-10 overflow-y-auto">
          
          {/* Back trace routing */}
          <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6 font-mono">
            <span>{activeDocData.category}</span>
            <ChevronRight className="w-3 h-3 font-bold" />
            <span className="text-zinc-700 font-medium">{activeDocData.title}</span>
          </div>

          {/* Main Doc Header Panel */}
          <div className="pb-8 border-b border-zinc-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-zinc-950 tracking-tight">
                {activeDocData.title}
              </h1>
              
              {/* Copied action buttons and metadata */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    copyCodeToClipboard(window.location.href);
                  }}
                  className="px-3 py-1.5 bg-white border border-zinc-200 text-xs font-semibold rounded-full hover:bg-zinc-50 text-zinc-80s transition-colors flex items-center gap-1.5 pointer-events-auto shadow-xs"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>

            <p className="text-base text-zinc-600 font-light leading-relaxed max-w-3xl">
              {activeDocData.description}
            </p>
          </div>

          {/* Dynamic document body text container */}
          <div className="py-6 space-y-10">
            {activeDocData.body}
          </div>

          {/* Interactive User Assistant Query panel at footer exactly like mockup visual */}
          <div className="mt-16 bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EA6639] fill-[#EA6639]/10" />
              <span className="text-xs font-bold font-mono tracking-wider text-zinc-800 uppercase">Ever Doc Assistant AI</span>
            </div>
            
            <p className="text-xs text-zinc-500 leading-normal">
              Need fast code configurations for custom Web Server synchronies? Write your custom target setup below to fetch node references instantly.
            </p>

            {/* Chat Messages Log */}
            {chatbotActive && (
              <div className="space-y-3 bg-zinc-50 border border-zinc-200 rounded-xl p-4 max-h-[220px] overflow-y-auto">
                {chatbotMessages.map((msg, mIdx) => (
                  <div key={mIdx} className={`flex items-start gap-2.5 text-xs ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    {msg.role !== "user" && (
                      <div className="w-5 h-5 rounded-full bg-[#EA6639]/20 text-[#EA6639] flex items-center justify-center text-[9px] font-bold select-none">
                        AI
                      </div>
                    )}
                    <div className={`p-2.5 rounded-xl max-w-[80%] leading-relaxed ${msg.role === "user" ? "bg-[#7C3AED] text-white" : "bg-white border border-zinc-200 text-zinc-800"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleAskQuestion} className="flex items-center gap-2 bg-white border border-zinc-200 rounded-xl px-3 py-2 shadow-xs">
              <input
                placeholder="Ask a question about database sync or API tokens..."
                className="bg-transparent text-xs w-full text-zinc-900 focus:outline-none placeholder-zinc-400"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="p-1 px-2.5 bg-[#EA6639] text-white hover:bg-[#ff7e54] rounded-full transition-colors flex items-center justify-center cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
            
            <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
              <span>Press enter or submit query above</span>
              <span>Ctrl+I Focus helper</span>
            </div>
          </div>

          {/* Review Helpful Poll Block */}
          <div className="border-t border-zinc-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
            <span>Was this documentation page helpful to your integrations?</span>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 text-zinc-800 transition-colors shadow-xs">
                <ThumbsUp className="w-3.5 h-3.5" /> Yes
              </button>
              <button className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-zinc-200 rounded-full hover:bg-zinc-50 text-zinc-800 transition-colors shadow-xs">
                <ThumbsDown className="w-3.5 h-3.5" /> No
              </button>
            </div>
          </div>

        </main>

        {/* Right Outline Sidebar Scrollspy layout */}
        <aside className="hidden xl:block w-64 p-6 shrink-0 border-l border-zinc-200 self-start sticky top-24 overflow-y-auto max-h-[calc(100vh-100px)]">
          <div className="space-y-4 text-xs">
            <span className="font-bold font-mono text-[10px] uppercase text-zinc-500 block tracking-wider">On this page</span>
            <div className="space-y-3 font-light text-zinc-800">
              {activeDocData.sections.map((sec, sIdx) => (
                <div key={sIdx} className="space-y-2">
                  <a 
                    href={`#${sec.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(sec.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="hover:text-[#EA6639] hover:underline transition-colors block leading-tight cursor-pointer"
                  >
                    {sec.title}
                  </a>

                  {/* Child subsection scroll outlines */}
                  {sec.subsections && (
                    <div className="pl-3 border-l border-zinc-200 space-y-2 text-[11px] text-zinc-500">
                      {sec.subsections.map((sub, subIdx) => {
                        const subId = sub.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        return (
                          <a
                            key={subIdx}
                            href={`#${subId}`}
                            onClick={(e) => {
                              e.preventDefault();
                              document.getElementById(subId)?.scrollIntoView({ behavior: "smooth" });
                            }}
                            className="hover:text-[#EA6639] hover:underline transition-colors block cursor-pointer"
                          >
                            {sub}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

      </div>

    </div>
  );
}

// Stateful 21-FAQ Interactive Accordion Widget
function FaqHubWidget() {
  const [openIds, setOpenIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<string>("All");
  const [search, setSearch] = useState<string>("");

  const toggleId = (id: string) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const categories = ["All", "Core Platform", "Webhooks & Sync", "Payments & Sec", "Channels & AI"];

  const faqs = [
    {
      id: "fk-1",
      cat: "Core Platform",
      q: "What is Ever and how does it automate hospitality guest commerce?",
      a: "Ever is a unified hospitality operations and guest commerce OS that links Property Management Systems (PMS) directly to modern messaging networks and payment processors, allowing properties to automate conversations, request native checkouts, and execute guest upsells autonomously."
    },
    {
      id: "fk-2",
      cat: "Core Platform",
      q: "Is Ever a standalone Property Management System (PMS)?",
      a: "No. Ever sits on top of your existing PMS, serving as an intelligent, real-time direct engagement and payment layer. We leverage two-way syncing APIs to keep your PMS ledger fully updated without replacing its database."
    },
    {
      id: "fk-3",
      cat: "Core Platform",
      q: "How does Ever connect to my property’s PMS?",
      a: "Connections are established either via simple API key configuration (for modern cloud PMS like Cloudbeds or Mews) or via secure tunnel protocols (for legacy enterprise PMS like Opera)."
    },
    {
      id: "fk-4",
      cat: "Core Platform",
      q: "What is the Guest Concierge Engine (GCE)?",
      a: "The Guest Concierge Engine (GCE) is our proprietary pipeline that automates guest inquiries, room requests, and check-in/out workflows using natural language understanding and real-time operational context."
    },
    {
      id: "fk-5",
      cat: "Core Platform",
      q: "What is the Hospitality Commerce Agent (HCA)?",
      a: "The Hospitality Commerce Agent (HCA) handles transactional intents. It lets guests purchase room extensions, buy visual boutique items, and pay local excursion fees natively inside WhatsApp, SMS, or Telegram."
    },
    {
      id: "fk-6",
      cat: "Core Platform",
      q: "Can I configure multiple properties under a single Ever workspace?",
      a: "Yes. Ever supports multi-tenant enterprise hotel portfolios. You can toggle across properties in the superior dashboard region and aggregate connection logs."
    },
    {
      id: "fk-7",
      cat: "Channels & AI",
      q: "Which messaging channels does Ever support natively?",
      a: "We support official WhatsApp Business APIs, Instagram DMs, Facebook Messenger, Telegram, Viber, SMS (via Twilio carriers), LINE, email, and live browser chat."
    },
    {
      id: "fk-8",
      cat: "Webhooks & Sync",
      q: "Are webhook dispatches guaranteed to fire in real-time?",
      a: "Yes. Ever operates on sub-second websocket routing. Whenever checkouts are checked or guest bills post, webhook signatures are instantly dispatched to all authorized endpoints."
    },
    {
      id: "fk-9",
      cat: "Webhooks & Sync",
      q: "How do I troubleshoot webhook delivery errors?",
      a: "You can review the integration simulation logs inside the Integrations Matrix. If an endpoint errors with a 5xx response, we automatically trigger exponential backoff retry schedules."
    },
    {
      id: "fk-10",
      cat: "Webhooks & Sync",
      q: "Can I isolate sandbox logs from real-world guest commerce states?",
      a: "Yes. Ever provides a separate environment flag (sandbox_mode: true) for all test requests to prevent mock cards from billing real merchant links."
    },
    {
      id: "fk-11",
      cat: "Webhooks & Sync",
      q: "How does the Ever Notion MCP integration work?",
      a: "The Model Context Protocol (MCP) links Notion tables directly to Ever AI Assistants. This allows the AI agent to read pool schedules or restaurant recommendations from Notion and present them to guests instantly."
    },
    {
      id: "fk-12",
      cat: "Payments & Sec",
      q: "Is Ever fully certified for PCI compliance?",
      a: "Yes. Ever is fully certified as a Level-1 PCI-DSS compliant engine. We process all payment payloads through single-use sandboxed tokenizations. Payment secrets never hit Ever servers."
    },
    {
      id: "fk-13",
      cat: "Payments & Sec",
      q: "Which billing payment processors are integrated?",
      a: "Ever interfaces with Stripe, PayPal, Square, Adyen, Braintree, Razorpay, Klarna, Iyzico, Telr, Paytabs, and Paylike."
    },
    {
      id: "fk-14",
      cat: "Payments & Sec",
      q: "How are room billing ledgers updated when guests purchase products?",
      a: "When a guest completes a purchase, Ever uses a two-way sync connection to immediately append a line item charge to their active PMS folio."
    },
    {
      id: "fk-15",
      cat: "Payments & Sec",
      q: "What is the fee or commission percentage taken by Ever?",
      a: "Ever bills on a simple flat subscription starting at $79 setup and $36/property/month with no hidden booking commissions or transaction markups on the base tier."
    },
    {
      id: "fk-16",
      cat: "Payments & Sec",
      q: "How does Ever verify guest identities to prevent fraudulent booking edits?",
      a: "Guests are authenticated via secure one-time password (OTP) codes routed directly to their booking-registered WhatsApp or SMS phone number."
    },
    {
      id: "fk-17",
      cat: "Channels & AI",
      q: "How do I customize the language and vocabulary used by the AI Concierge?",
      a: "You can train prompt parameters inside your AI Workspace under 'Instruction Guidelines', enforcing professional accents or brand-specific guidelines."
    },
    {
      id: "fk-18",
      cat: "Channels & AI",
      q: "Can Ever AI handle automatic escalation to human frontdesk managers?",
      a: "Yes. If the Guest Concierge hits policy thresholds or detects hostility, it automatically hands over the active chat socket to live responders."
    },
    {
      id: "fk-19",
      cat: "Webhooks & Sync",
      q: "What is the uptime SLA of the Ever REST gateways?",
      a: "Our enterprise service tier guarantees a 99.99% operational uptime backed by cloud failover carrier routers."
    },
    {
      id: "fk-20",
      cat: "Channels & AI",
      q: "Can I host Ever Rest APIs inside a localized sovereign cloud environment?",
      a: "Yes. Ever offers dedicated isolated database clusters for select enterprise hospitality brands seeking specific geographical persistence."
    },
    {
      id: "fk-21",
      cat: "Channels & AI",
      q: "How do I reset my API long-lived credentials?",
      a: "Navigate to your Ever Settings console and click 'Rotate Token'. Ensure to replace all client-side auth header arrays immediately."
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesFilter = filter === "All" || faq.cat === filter;
    const matchesSearch = faq.q.toLowerCase().includes(search.toLowerCase()) || faq.a.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div id="faq-search-block" className="space-y-3">
        <h3 className="text-lg font-bold text-zinc-950">Knowledge Base Search</h3>
        <p className="text-zinc-500 text-xs font-light leading-relaxed">
          Filter through our developer, operations, and commerce FAQs below.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input 
          placeholder="Filter FAQs..."
          className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-[#EA6639] shadow-xs"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {categories.map((c) => (
            <button 
              key={c}
              onClick={() => setFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${filter === c ? 'bg-[#EA6639] text-white' : 'bg-white border border-zinc-200 text-zinc-800 hover:bg-zinc-50'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredFaqs.length > 0 ? (
          filteredFaqs.map((faq) => {
            const isOpen = openIds[faq.id];
            return (
              <div key={faq.id} className="bg-white border border-zinc-300 rounded-2xl overflow-hidden shadow-xs">
                <button 
                  onClick={() => toggleId(faq.id)}
                  className="w-full pointer-events-auto px-6 py-4 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50"
                >
                  <span className="text-xs sm:text-xs font-bold text-zinc-900 tracking-tight leading-snug">{faq.q}</span>
                  <span className="text-[9px] uppercase font-mono font-bold text-zinc-400 bg-zinc-50 border border-zinc-200 px-2 py-0.5 rounded-md shrink-0 block">{faq.cat}</span>
                </button>
                
                {isOpen && (
                  <div className="px-6 pb-5 pt-2 border-t border-zinc-100 bg-zinc-50/50 text-xs text-zinc-800 leading-relaxed font-light">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-zinc-400 text-xs">No matching topics found in the knowledge base.</div>
        )}
      </div>
    </div>
  );
}
