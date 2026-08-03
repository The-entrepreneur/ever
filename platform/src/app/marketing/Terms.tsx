import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { InteractiveButton } from "./InteractiveButton";

export function Terms() {
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
            Platform Agreement
          </span>
          {/* Elegant display serif title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-light tracking-tight text-zinc-900 font-serif">
            Terms of service
          </h1>
          <p className="text-zinc-500 font-mono text-xs pt-2">Last updated: June 11, 2026</p>
        </motion.div>
      </section>

      {/* Main Content Area */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-[800px] mx-auto text-zinc-800">
        <div className="space-y-12 font-light text-[14px] leading-relaxed">
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Account Terms</h2>
            <p>
              You must be a human to register. Accounts registered by "bots" or other automated harvesting scripts are strictly prohibited and will result in immediate termination of the client keys.
            </p>
            <p>
              To complete the sign-up process, you must provide your legal full name, a valid corporate domain email address, and any other requested variables required by our syncing engines.
            </p>
            <p>
              You are responsible for maintaining the privacy and security parameters of your credentials and API key configurations. Ever will not be held liable for any loss, unauthorized token leakage, or damages that result from your failure to protect login credentials.
            </p>
            <p>
              One corporate entity or digital hotel profile may not operate more than one free testing sandboxed account. You are responsible for all data, messaging events, and digital payments generated under your provisioned interface.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Payment and Access</h2>
            <p>
              A valid credit card, debit credential, or authorized corporate billing agreement is required for paying premium accounts. Free or sandbox integrations are not required to provide credit card credentials.
            </p>
            <p>
              Should your hotel group upgrade, expand room key count, or modify premium features, your designated accounting protocol will be charged the new billing cycle values immediately on a pro-rata basis.
            </p>
            <p>
              The Ever Service is billed in advance on a scheduled monthly or annual calendar cycle. All transaction ledger fees, subscription cycles, or auxiliary setups are non-refundable once processed. There will be no refunds, exceptions, or credits for partial months of service.
            </p>
            <p>
              All fees are exclusive of standard municipal taxes, federal levies, or processing costs. You agree to pay all applicable rates, including state or international transaction fees that might be asserted through your localized gateway.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-zinc-900">Modifications to the Service and Fees</h2>
            <p>
              Ever reserves the distinct right to modify, adjust, suspend, or discontinue the digital platform services at any time with or without formal prior announcement.
            </p>
            <p>
              Ever reserves the right to modify our standard subscription plans and usage thresholds. Plan changes will be communicated via corporate email to registered administrators at least 30 days prior.
            </p>
            <p>
              Ever reserves the right to push automatic patch updates, system logic corrections, and platform revisions from time to time to maintain secure integration loops with our partner networks including Cloudbeds.
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
