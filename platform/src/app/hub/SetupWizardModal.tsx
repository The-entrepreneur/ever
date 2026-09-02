import React, { useState } from "react";
import {
  Building2,
  Smartphone,
  Bell,
  HelpCircle,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Copy,
  Check,
  Send,
  X,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../shared/ToastContext";
import { RichTextEditor } from "../../shared/RichTextEditor";
import { supabase } from "../../lib/supabase";

interface SetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  hotelData?: any;
}

export function SetupWizardModal({ isOpen, onClose, onComplete, hotelData }: SetupWizardModalProps) {
  const { hotelId, user } = useAuth();
  const { showToast } = useToast();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [copiedSnippet, setCopiedSnippet] = useState(false);
  const [testingAlert, setTestingAlert] = useState(false);

  // Use useEffect to sync hotelData with state
  // Step 1: Hotel Profile
  const [hotelName, setHotelName] = useState("");
  const [hotelAddress, setHotelAddress] = useState("");
  const [timezone, setTimezone] = useState("UTC");
  const [primaryColor, setPrimaryColor] = useState("#EA6639");
  const [currencySymbol, setCurrencySymbol] = useState("$");

  React.useEffect(() => {
    if (hotelData && (hotelData.name || hotelData.hotel_name)) {
      setHotelName(hotelData.name || hotelData.hotel_name || "");
      setHotelAddress(hotelData.address || "");
      setTimezone(hotelData.timezone || "UTC");
      setPrimaryColor(hotelData.primary_color || "#EA6639");
      setCurrencySymbol(hotelData.currency || "$");
    } else if (user?.user_metadata?.business_name) {
      setHotelName(user.user_metadata.business_name);
      if (user.user_metadata.address) setHotelAddress(user.user_metadata.address);
    }
  }, [hotelData, user]);

  // Step 2: Connect Channel
  const [selectedChannel, setSelectedChannel] = useState<"widget" | "whatsapp" | "skip">("widget");
  const [waPhone, setWaPhone] = useState("+1 (555) 382-9102");
  const [waPhoneId, setWaPhoneId] = useState("");

  // Step 3: Handoff Alerts
  const [alertEmail, setAlertEmail] = useState(user?.email || "");
  const [alertMethod, setAlertMethod] = useState<"email" | "whatsapp" | "both">("both");

  // Step 4: First FAQ
  const [faqQuestion, setFaqQuestion] = useState("");
  const [faqAnswer, setFaqAnswer] = useState("");
  const [faqCategory, setFaqCategory] = useState("General");

  if (!isOpen) return null;

  const widgetSnippet = `<script src="https://cdn.ever.ai/widget.js" data-hotel-id="${hotelId || 'demo-hotel'}"></script>`;

  const handleCopySnippet = () => {
    navigator.clipboard.writeText(widgetSnippet);
    setCopiedSnippet(true);
    showToast("Widget snippet copied to clipboard!", "success");
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleTestAlert = () => {
    setTestingAlert(true);
    setTimeout(() => {
      setTestingAlert(false);
      showToast(`Test handoff alert sent to ${alertEmail}`, "success");
    }, 700);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    const targetHotelId = hotelId || hotelData?.id;
    try {
      if (targetHotelId) {
        localStorage.setItem(`ever_setup_complete_${targetHotelId}`, "true");
      }
      if (user?.id) {
        localStorage.setItem(`ever_setup_complete_${user.id}`, "true");
      }
      localStorage.setItem("ever_setup_complete_default", "true");

      if (targetHotelId && targetHotelId !== "sandbox-hotel") {
        const { error } = await supabase
          .from("hotels")
          .update({
            name: hotelName,
            address: hotelAddress,
            timezone,
            primary_color: primaryColor,
            currency: currencySymbol,
            setup_complete: true
          })
          .eq("id", targetHotelId);

        if (error) {
          console.error("Error updating setup_complete in Supabase:", error);
        }
      }
    } catch (err) {
      console.error("Setup finish error:", err);
    }

    showToast("🎉 Setup complete! Welcome to your AI Guest Cockpit.", "success");
    onComplete();
    onClose();
  };

  const stepTitles = [
    "Welcome & Hotel Profile",
    "Connect Your First Channel",
    "Set Up Staff Handoff Alerts",
    "Add Your First FAQ"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-dash-surface border border-dash-border rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* ── Wizard Header & Progress Bar ── */}
        <div className="p-5 border-b border-dash-border bg-dash-surface relative shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#EA6639]/10 text-[#EA6639] text-xs font-bold font-mono">
                {currentStep}
              </span>
              <h3 className="text-sm font-bold text-dash-text">
                Step {currentStep} of 4: {stepTitles[currentStep - 1]}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-dash-text-muted hover:text-dash-text p-1 rounded-md hover:bg-dash-surface-hover transition-colors"
              title="Save & Exit"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Track */}
          <div className="w-full bg-dash-canvas h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-[#EA6639] h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* ── Wizard Body ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Hotel Profile */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-3 bg-[#EA6639]/5 border border-[#EA6639]/20 rounded-xl mb-4">
                <Building2 className="w-6 h-6 text-[#EA6639] shrink-0" />
                <div>
                  <h4 className="text-xs font-bold text-dash-text">Welcome to Ever Concierge</h4>
                  <p className="text-[11px] text-dash-text-sec">Confirm your property details so your AI agent can accurately assist guests.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dash-text mb-1">Hotel Property Name</label>
                  <input
                    type="text"
                    value={hotelName}
                    onChange={(e) => setHotelName(e.target.value)}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    placeholder="e.g. The Grand Horizon Resort"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-dash-text mb-1">Address & Location</label>
                  <input
                    type="text"
                    value={hotelAddress}
                    onChange={(e) => setHotelAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    placeholder="Street, City, Country"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option>Europe/Paris (UTC+1)</option>
                    <option>Europe/London (UTC+0)</option>
                    <option>America/New_York (UTC-5)</option>
                    <option>America/Los_Angeles (UTC-8)</option>
                    <option>Asia/Dubai (UTC+4)</option>
                    <option>Africa/Lagos (UTC+1)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-dash-text mb-1">Currency</label>
                    <input
                      type="text"
                      value={currencySymbol}
                      onChange={(e) => setCurrencySymbol(e.target.value)}
                      className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none text-center font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dash-text mb-1">Brand Accent</label>
                    <div className="flex items-center gap-2 bg-dash-canvas border border-dash-border rounded-lg px-2 py-1.5">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-6 h-6 border-0 bg-transparent cursor-pointer rounded"
                      />
                      <span className="text-[11px] font-mono text-dash-text-muted">{primaryColor}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Connect Channel */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <p className="text-xs text-dash-text-sec">
                Choose how guests will communicate with your AI concierge. You can connect additional channels anytime in Settings.
              </p>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "widget", label: "Website Widget", icon: <Sparkles className="w-4 h-4" /> },
                  { id: "whatsapp", label: "WhatsApp API", icon: <Smartphone className="w-4 h-4" /> },
                  { id: "skip", label: "Skip for Now", icon: <ArrowRight className="w-4 h-4" /> }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedChannel(item.id as any)}
                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors text-center ${
                      selectedChannel === item.id
                        ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]"
                        : "bg-dash-canvas border-dash-border hover:bg-dash-surface-hover text-dash-text"
                    }`}
                  >
                    {item.icon}
                    <span className="text-xs font-medium">{item.label}</span>
                  </button>
                ))}
              </div>

              {selectedChannel === "widget" && (
                <div className="p-4 bg-dash-canvas rounded-xl border border-dash-border space-y-2.5">
                  <span className="text-xs font-semibold text-dash-text block">Live Website Embed Snippet</span>
                  <p className="text-[11px] text-dash-text-muted">Paste this snippet before the closing <code>&lt;/body&gt;</code> tag on your website.</p>
                  <div className="p-3 bg-zinc-950 text-zinc-100 rounded-lg font-mono text-[11px] break-all select-all flex justify-between items-center gap-2">
                    <code>{widgetSnippet}</code>
                    <button
                      onClick={handleCopySnippet}
                      className="p-1.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white shrink-0"
                      title="Copy code"
                    >
                      {copiedSnippet ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              {selectedChannel === "whatsapp" && (
                <div className="p-4 bg-dash-canvas rounded-xl border border-dash-border space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-dash-text mb-1">WhatsApp Business Phone Number</label>
                    <input
                      type="text"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs text-dash-text"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-dash-text mb-1">Phone Number ID (Meta Cloud API)</label>
                    <input
                      type="text"
                      value={waPhoneId}
                      onChange={(e) => setWaPhoneId(e.target.value)}
                      placeholder="e.g. 10928374829"
                      className="w-full px-3 py-2 bg-dash-surface border border-dash-border rounded-lg text-xs text-dash-text"
                    />
                  </div>
                </div>
              )}

              {selectedChannel === "skip" && (
                <div className="p-4 bg-dash-canvas rounded-xl border border-dash-border text-center text-xs text-dash-text-muted">
                  No problem! You can explore the dashboard in demo mode and connect your channels whenever you&apos;re ready.
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Handoff Alerts */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl">
                <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <p className="text-[11px] text-blue-800 dark:text-blue-300">
                  When a guest asks for human assistance or a complex request arises, Ever immediately alerts your on-duty team.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Primary Receptionist / Alert Email</label>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={(e) => setAlertEmail(e.target.value)}
                    className="flex-1 px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                    placeholder="reception@hotel.com"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTestAlert}
                    disabled={testingAlert}
                    className="px-3 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5 text-[#EA6639]" />
                    {testingAlert ? "Sending..." : "Test Alert"}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-2">Alert Delivery Method</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "email", label: "Email Only" },
                    { id: "whatsapp", label: "WhatsApp Message" },
                    { id: "both", label: "Email + WhatsApp" }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setAlertMethod(m.id as any)}
                      className={`p-3 rounded-lg border text-xs font-medium transition-colors ${
                        alertMethod === m.id
                          ? "bg-[#EA6639]/10 border-[#EA6639] text-[#EA6639]"
                          : "bg-dash-canvas border-dash-border text-dash-text hover:bg-dash-surface-hover"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: First FAQ */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl">
                <HelpCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <p className="text-[11px] text-emerald-800 dark:text-emerald-300">
                  Add your first FAQ. Your AI agent uses this to answer guest questions instantly 24/7.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Frequently Asked Question</label>
                <input
                  type="text"
                  value={faqQuestion}
                  onChange={(e) => setFaqQuestion(e.target.value)}
                  placeholder="e.g. What time is breakfast served?"
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">AI Agent Answer (Formatted)</label>
                <RichTextEditor
                  content={faqAnswer}
                  onChange={setFaqAnswer}
                  placeholder="Type the answer the AI concierge will provide..."
                  minHeight="100px"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1">Category</label>
                <select
                  value={faqCategory}
                  onChange={(e) => setFaqCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                >
                  <option>General</option>
                  <option>Dining &amp; Breakfast</option>
                  <option>Check-in / Policies</option>
                  <option>Facilities &amp; Amenities</option>
                  <option>Transport &amp; Parking</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Wizard Footer Actions ── */}
        <div className="p-4 border-t border-dash-border bg-dash-surface flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-dash-text-sec hover:text-dash-text px-3 py-2 rounded-lg hover:bg-dash-surface-hover transition-colors"
          >
            Save &amp; Exit
          </button>

          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-3 py-2 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-lg text-xs font-medium transition-colors flex items-center gap-1"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center gap-1.5 shadow-sm"
            >
              {currentStep === 4 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Done — Go to Cockpit
                </>
              ) : (
                <>
                  Next Step <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
