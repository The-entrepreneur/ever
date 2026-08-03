import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { InteractiveButton } from "./InteractiveButton";
import { ShieldCheck, ArrowRight } from "lucide-react";

export function Privacy() {
  return (
    <div className="bg-[#F9F6F0] text-zinc-900 pb-24">
      {/* Editorial Header */}
      <section className="pt-36 pb-16 px-4 sm:px-6 lg:px-8 max-w-[1000px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <span className="text-[10px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3 py-1 rounded-full font-semibold">
            Data Handling Blueprint
          </span>
          {/* Elegant display serif title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-zinc-900 font-serif">
            Privacy policy
          </h1>
          <p className="text-zinc-500 font-mono text-xs pt-2">Last updated: June 11, 2026</p>
        </motion.div>
      </section>

      {/* Main content area containing legal structure */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto text-zinc-800">
        <div className="space-y-12 font-light text-[14px] leading-relaxed">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Introduction</h2>
            <p>
              Welcome to Ever Software, Inc. ("Ever", "we", "us", and "our"). Ever provides software and services that unify guest database systems, coordinate digital commerce, and automate conversational message routing. This policy governs all platform channels including www.ever.ai, app.ever.ai, and related software webhooks.
            </p>
            <p>
              As a champion of hotel operator autonomy, we respect the privacy of both our direct customers (hotel operators) and their end guests. This document clarifies what info we process and how we maintain 5-star security.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Purpose of this Privacy Policy</h2>
            <p>
              The purpose of this "Privacy Policy" is to inform you of the type of personal data we collect when you use our Services, why we collect the data, how it is used, and what rights you hold. If you do not agree with this Privacy Policy, please do not activate accounts or access our Services.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Personal Data We Collect</h2>
            <p>
              <strong>Personal Data that you provide to us:</strong> When you register for an Ever account, you are required to provide certain basic contact details such as your full name, organization name, corporate email address, and billing parameters. When syncing your Property Management Systems (PMS) like Cloudbeds, we temporarily import guest profiles required to dispatch automated reservation confirmations on your behalf.
            </p>
            <p>
              <strong>Automatically collected data:</strong> When you interact with Ever through the web console, we automatically collect basic operational parameters including device identifiers, geographic country estimates, interface loading metrics, and security routing statistics. This data is leveraged to provide real-time latency optimization across our global server cluster.
            </p>
            <p>
              <strong>Data from other service integrations:</strong> To perform critical tasks matching your requirements, we integrate with third-party service frameworks. Our system adheres to direct security guidelines, ensuring no unauthorized telemetry is passed outside verified boundaries.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Data Security</h2>
            <p>
              We take all necessary security precautions, as well as appropriate organizational and technical measures, to protect credentials, API keys, and guest details from accidental loss or destruction. Credentials and database storage layers are fully encrypted both in transit and at rest using modern AES-256 protocols.
            </p>
            <p>
              Our server boundaries are audited, verifying secure sandbox environments. Furthermore, because of our "Bring Your Own Key" alignment models, your LLM variables are injected directly into securely handled environment threads and never sold or persisted for model training.
            </p>
          </div>

        </div>
      </section>

      {/* Modern, Luxury "Onboard now!" CTA under Whelp styling guideline */}
      <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="bg-[#FFF4EF] border border-[#EA6639]/20 rounded-3xl p-8 sm:p-12 text-center max-w-3xl mx-auto shadow-md">
          <h2 className="text-2xl sm:text-3xl font-serif font-light text-zinc-900">Onboard now!</h2>
          <p className="text-xs text-zinc-500 font-light mt-3 max-w-lg mx-auto leading-relaxed">
            Sign up now to improve your customer support, automate guest touchpoints, and increase direct digital booking revenues with Ever.
          </p>
          
          <div className="mt-8 flex justify-center gap-4">
            <InteractiveButton
              to="/signup"
              className="text-white"
            >
              Onboard
            </InteractiveButton>
            <InteractiveButton
              to="/pricing"
              className="px-6 py-2.5 bg-white border border-zinc-200 !text-zinc-700 rounded-full text-xs font-semibold hover:bg-zinc-50 transition-colors"
            >
              View pricing
            </InteractiveButton>
          </div>
        </div>
      </section>
    </div>
  );
}
