import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Check, ShieldAlert, CheckCircle, HelpCircle, ArrowRight, Twitter, Github, Linkedin, MessageSquare, Phone, MapPin, Shield, Lock, X, Instagram, Youtube } from "lucide-react";
import { InteractiveButton } from "./InteractiveButton";
import { BookingModal } from "./BookingModal";

export function HelpDesk() {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.substring(1));
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth" });
        }, 100);
      }
    }
  }, [hash]);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    companyName: "",
    jobTitle: "",
    companySize: "",
    message: "",
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeAccordion, setActiveAccordion] = useState<number | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const toggleAccordion = (index: number) => {
    setActiveAccordion(activeAccordion === index ? null : index);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.companyName) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1200);
  };

  return (
    <div className="bg-[#F9F6F0] text-zinc-900 pb-24">
      {/* 1. Header Banner */}
      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1200px] mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl mx-auto"
        >
          <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase bg-[#EA6639]/10 px-3 py-1 rounded-full font-semibold">
            Support Hub & Sales Desk
          </span>
          <h1 className="text-4xl sm:text-5xl font-semibold text-zinc-900 mt-4 tracking-tight">
            Don't be shy.
          </h1>
          <p className="text-xs text-zinc-500 mt-2 font-light">
            Have questions or need assistance? Our team is standing by to help you optimize.
          </p>
        </motion.div>
      </section>

      {/* Request a Demo Section (Mimicking Reference) */}
      <section id="demo" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col md:flex-row w-full rounded-2xl overflow-hidden shadow-xl border border-zinc-200/50">
          {/* Left panel */}
          <div className="bg-[#B9DBF7] flex-1 p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <h2 className="text-3xl md:text-4xl font-light text-zinc-950 mb-4 tracking-tight">
              Hold up! Your demo isn't booked.
            </h2>
            <p className="text-zinc-800 text-lg mb-8 font-light max-w-md">
              You've come this far — grab your spot before it's gone.
            </p>
            <InteractiveButton 
              onClick={() => setIsBookingModalOpen(true)} 
              className="bg-[#F8E34C] hover:bg-[#F3DE42] !text-zinc-950 px-6 py-3 font-medium flex items-center justify-center gap-2 w-max rounded-md border border-yellow-300"
            >
              Pick a time <ArrowRight className="w-4 h-4 -rotate-45" />
            </InteractiveButton>

            <div className="mt-12 space-y-0 text-left border-t border-zinc-900/10">
              {[
                { q: "How is the demo tailored to my property?", a: "We'll use details about your property to walk you through the workflows, reports, and tools that matter most to your business." },
                { q: "What will I walk away with?", a: "A clear picture of how Ever can help you run leaner, grow faster, and elevate your competitive edge — plus straight answers to your questions. No sales scripts, just the real stuff." },
                { q: "What if I'm not ready to commit yet?", a: "Totally fine. You'll still leave with fresh ideas and practical recommendations you can use right away, whether or not you move forward with us." },
                { q: "What if I need to reschedule?", a: "Life happens. You can reschedule anytime that works better, and we'll pick up right where we left off." }
              ].map((item, i) => (
                <div key={i} className="border-b border-zinc-900/10">
                  <button 
                    onClick={() => toggleAccordion(i)}
                    className="w-full flex items-center justify-between py-5 text-left focus:outline-none"
                  >
                    <span className="text-zinc-950 font-medium text-xs md:text-base pr-4">{item.q}</span>
                    <span className="text-zinc-900 relative w-4 h-4 flex-shrink-0">
                       {activeAccordion === i ? <X className="w-4 h-4 absolute inset-0" /> : <><span className="absolute left-1/2 top-0 w-[1px] h-full bg-zinc-900 -translate-x-1/2" /><span className="absolute top-1/2 left-0 h-[1px] w-full bg-zinc-900 -translate-y-1/2" /></>}
                    </span>
                  </button>
                  <AnimatePresence>
                    {activeAccordion === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pb-5 text-xs md:text-base text-zinc-800 font-light pr-4">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Right panel */}
          <div className="bg-[#FAF9F5] flex-1 p-8 md:p-12 flex flex-col justify-between">
            <div className="space-y-6 flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 mb-6 bg-zinc-200">
                <img 
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80" 
                  alt="Flávio Ghelfond" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <blockquote className="text-2xl md:text-[28px] leading-tight font-serif italic text-zinc-900">
                "Without Ever’s full range of conversational features, we wouldn’t be selling as effectively or exploring new business opportunities as we do today."
              </blockquote>
              <div className="text-xs">
                <p className="text-zinc-900 font-semibold mb-1">Flávio Ghelfond</p>
                <p className="text-zinc-500 font-light">Co-Founder and CFO of Charlie</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-12 pt-8">
              <div className="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-sm text-center">
                <p className="text-3xl md:text-4xl font-light text-zinc-900 mb-2">20%</p>
                <p className="text-xs text-zinc-500">Increase in direct<br/>bookings</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-sm text-center">
                <p className="text-3xl md:text-4xl font-light text-zinc-900 mb-2">70+</p>
                <p className="text-xs text-zinc-500">Built-in PMS<br/>channels</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-zinc-200/60 shadow-sm text-center">
                <p className="text-3xl md:text-4xl font-light text-zinc-900 mb-2">32%</p>
                <p className="text-xs text-zinc-500">Lift in positive<br/>reviews</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-6 px-4">
          <p className="text-lg md:text-xl font-medium text-zinc-900 max-w-lg">
            Trusted by leading hotels, hospitality groups, and management companies across 150 countries.
          </p>
          <div className="flex items-center gap-3">
            <div className="flex text-[#4F46E5]">
              {"★★★★★".split("").map((star, i) => (
                <span key={i} className="text-xl">{star}</span>
              ))}
            </div>
            <div className="text-xs font-semibold flex items-center border-l border-zinc-300 pl-3">
               HotelTechReport
            </div>
          </div>
        </div>
      </section>

      {/* 2. Side-by-Side Main Section */}
      <section id="contact" className="py-12 px-4 sm:px-6 lg:px-8 max-w-[1240px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Sales Copy & ROI Indicators */}
          <div className="lg:col-span-7 space-y-12">
            
            {/* Value Checkmarks */}
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold tracking-tight text-zinc-900">
                Contact sales
              </h2>
              <p className="text-zinc-600 font-light leading-relaxed text-xs max-w-xl">
                We'll prepare a custom live demo oriented to your properties, guide you through optimal system models, or provide procurement blueprints to guarantee your team thrives with Ever.
              </p>
              
              <ul className="space-y-4">
                {[
                  "Easily connect multiple guest data channels (WhatsApp, OTA inbox, SMS)",
                  "Build absolute confidence and accelerate ancillary room sales",
                  "Let your property staff discover actionable guest metrics instantly",
                  "Standardize digital service templates across your entire hotel brand",
                  "Scale securely with robust GDPR compliance and dedicated support lines"
                ].map((bullet, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs text-zinc-700 font-light">
                    <span className="w-5 h-5 rounded-full bg-[#EA6639]/10 text-[#EA6639] flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>

              <p className="text-xs text-zinc-500 font-light pt-2">
                For product support or developers, visit our <Link to="/blog" className="text-[#EA6639] underline hover:text-[#EA6639]/80 font-medium">Help Center</Link> or join the <span className="text-[#EA6639] underline cursor-pointer font-medium">Ever Slack Group</span>.
              </p>
            </div>

            {/* Secure ROI Stats Block */}
            <div className="pt-8 border-t border-zinc-200/60">
              <h3 className="text-lg font-semibold text-zinc-900 mb-6">Secure ROI with Ever</h3>
              
              <div className="grid grid-cols-2 gap-x-8 gap-y-8">
                <div>
                  <p className="text-3xl font-light text-[#EA6639]">42%</p>
                  <p className="text-xs text-zinc-500 mt-1 font-light">of operators state automated concierge improves room service revenues¹</p>
                </div>
                <div>
                  <p className="text-3xl font-light text-[#EA6639]">$100</p>
                  <p className="text-xs text-zinc-500 mt-1 font-light">average return on every guest chat flow activated²</p>
                </div>
                <div>
                  <p className="text-3xl font-light text-[#EA6639]">74%</p>
                  <p className="text-xs text-zinc-500 mt-1 font-light">of guests provide five-star ratings when messaging is answered instantly¹</p>
                </div>
                <div>
                  <p className="text-3xl font-light text-[#EA6639]">44+</p>
                  <p className="text-xs text-zinc-500 mt-1 font-light">independent boutique hoteliers and luxury groups are using Ever</p>
                </div>
              </div>
            </div>

            {/* Partner Logo strip */}
            <div className="pt-8 border-t border-zinc-200/60 space-y-4">
              <p className="text-xs font-mono uppercase text-[#EA6639] tracking-wider font-semibold">
                Natively synchronized with leading hospitality PMS platforms & channels
              </p>
              <div className="flex flex-wrap items-center gap-x-12 gap-y-4 opacity-70 text-xs font-bold tracking-tight text-zinc-800 select-none">
                <span>Cloudbeds</span>
                <span>Mews</span>
                <span>Opera PMS</span>
                <span>Guesty</span>
                <span>WebRezPro</span>
                <span>Sabre</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Leads/Sales Form */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-zinc-200/60 rounded-3xl p-6 sm:p-8 shadow-xl relative">
              <AnimatePresence mode="wait">
                {!isSubmitted ? (
                  <motion.form
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-4 text-xs"
                  >
                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Email*</label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="you@hospitalitygroup.com"
                        className="w-full p-3 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 focus:border-[#EA6639] transition-all text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">First name*</label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Elizabeth"
                          className="w-full p-2.5 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-700 font-semibold mb-1">Last name*</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Taylor"
                          className="w-full p-2.5 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Company name*</label>
                      <input
                        type="text"
                        name="companyName"
                        required
                        value={formData.companyName}
                        onChange={handleInputChange}
                        placeholder="Grand Imperial Resorts"
                        className="w-full p-3 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 focus:border-[#EA6639] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Job title*</label>
                      <input
                        type="text"
                        name="jobTitle"
                        value={formData.jobTitle}
                        onChange={handleInputChange}
                        placeholder="VP of Digital Transformation"
                        className="w-full p-3 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 focus:border-[#EA6639] text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Company size*</label>
                      <select
                        name="companySize"
                        value={formData.companySize}
                        onChange={handleInputChange}
                        className="w-full p-3 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 focus:border-[#EA6639] text-xs text-zinc-600 font-light"
                      >
                        <option value="">Please Select</option>
                        <option value="1-10">Boutique (1 - 50 keys)</option>
                        <option value="11-50">Medium-sized (51 - 200 keys)</option>
                        <option value="51-200">Scale Luxury Portfolio (201 - 1,000 keys)</option>
                        <option value="201+">Enterprise (1,000+ keys)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-700 font-semibold mb-1">Is there any other information you'd like to share with us?</label>
                      <textarea
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder="Introduce us to your current tech infrastructure, or tell us which channels you want to sync..."
                        className="w-full p-3 bg-[#F9F6F0]/60 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#EA6639]/40 focus:border-[#EA6639] transition-all text-xs font-light resize-none"
                      />
                    </div>

                    <p className="text-[10px] text-zinc-400 font-light leading-snug">
                      Ever needs the contact info you input to keep in touch regarding products and services. You may unsubscribe or request data removal at any time under our <Link to="/privacy" className="text-[#EA6639] underline font-medium">Privacy Policy</Link> and <Link to="/terms" className="text-[#EA6639] underline font-medium">Terms of Service</Link>.
                    </p>

                    <InteractiveButton
                      type="submit"
                      disabled={isLoading}
                      className="w-full mt-4 p-3.5 bg-[#EA6639] text-white rounded-xl text-xs font-medium hover:bg-[#EA6639]/95 text-center transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? "Broadcasting Intent..." : "Submit Inquiry"}
                    </InteractiveButton>
                  </motion.form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 space-y-4"
                  >
                    <div className="w-16 h-16 bg-[#EA6639]/10 text-[#EA6639] rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-semibold text-zinc-900">Inquiry Received</h3>
                    <p className="text-zinc-500 font-light text-xs max-w-xs mx-auto">
                      Thank you! One of our Hospitality Specialist agents will review your keys or specifications and follow up within 2 business hours.
                    </p>
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-xs text-[#EA6639] underline mt-4 hover:opacity-80 font-mono"
                    >
                      Submit another request
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </section>

      {/* 3. Social / Developer Links block (From Image 2 style "Speak with optimization specialist") */}
      <section className="py-16 border-t border-zinc-200/60 bg-white/40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#FFF4EF]/70 border border-[#EA6639]/15 rounded-3xl p-8 mb-12 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-md transition-shadow">
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-zinc-900">Speak with an optimization specialist</h3>
              <p className="text-xs text-zinc-500 font-light max-w-xl">
                Ready to review complex routing or custom API requirements? Schedule a direct face-to-face video alignment.
              </p>
            </div>
            <button
              onClick={() => setIsBookingModalOpen(true)}
              className="px-6 py-3 bg-zinc-900 text-white rounded-full text-xs font-medium hover:bg-zinc-800 transition-colors flex items-center gap-2 shadow cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-zinc-900"
            >
              Book a call
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <BookingModal 
            isOpen={isBookingModalOpen} 
            onClose={() => setIsBookingModalOpen(false)} 
          />

          {/* Social Columns grid (X, Instagram, YouTube, LinkedIn) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-xs flex flex-col justify-between h-52 hover:-translate-y-1 transition-transform duration-300">
              <div className="space-y-2">
                <Twitter className="w-5 h-5 text-[#EA6639]" />
                <h4 className="font-semibold text-zinc-900">Follow us on X</h4>
                <p className="text-xs text-zinc-500 font-light">
                  Stay aligned with our latest hospitality research, products, and insights.
                </p>
              </div>
              <a
                href="https://x.com/Ever_247"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Follow @Ever_247
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-xs flex flex-col justify-between h-52 hover:-translate-y-1 transition-transform duration-300">
              <div className="space-y-2">
                <Instagram className="w-5 h-5 text-[#EA6639]" />
                <h4 className="font-semibold text-zinc-900">Instagram</h4>
                <p className="text-xs text-zinc-500 font-light">
                  Take a visual tour behind the scenes of our operations and product updates.
                </p>
              </div>
              <a
                href="https://instagram.com/ever24_7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Follow @ever24_7
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-xs flex flex-col justify-between h-52 hover:-translate-y-1 transition-transform duration-300">
              <div className="space-y-2">
                <Youtube className="w-5 h-5 text-[#EA6639]" />
                <h4 className="font-semibold text-zinc-900">YouTube</h4>
                <p className="text-xs text-zinc-500 font-light">
                  Watch our product guides, webinars, and masterclasses on hospitality tech.
                </p>
              </div>
              <a
                href="https://www.youtube.com/@Ever24_7"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Subscribe
              </a>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-zinc-200/60 shadow-xs flex flex-col justify-between h-52 hover:-translate-y-1 transition-transform duration-300">
              <div className="space-y-2">
                <Linkedin className="w-5 h-5 text-[#EA6639]" />
                <h4 className="font-semibold text-zinc-900">Connect on LinkedIn</h4>
                <p className="text-xs text-zinc-500 font-light">
                  Connect with our staff and leadership regarding corporate partnerships and careers.
                </p>
              </div>
              <a
                href="https://linkedin.com/company/ever-software-inc"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full text-center py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-semibold text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                Connect on LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Security & Call to Action Section (Stacker 85% Match Template) */}
      <section className="py-24 border-t border-zinc-200/50 bg-[#F9F6F0]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          
          {/* Security Standards Block */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-5 text-left space-y-2">
              <span className="text-[11px] font-mono tracking-widest text-[#EA6639] uppercase font-bold bg-[#EA6639]/10 px-3.5 py-1.5 rounded-full">
                SECURITY
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-semibold tracking-tight text-zinc-950 mt-4 leading-tight">
                Secure and safe
              </h2>
            </div>
            
            <div className="lg:col-span-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6 lg:pl-12">
              <p className="text-xs text-zinc-500 font-light max-w-sm leading-relaxed">
                Ever is audited and certified by industry leading Third Party standards
              </p>
              
              <div className="flex flex-wrap gap-3 items-center">
                {/* Badge 1: GDPR READY */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 relative">
                    <span className="text-[8px] absolute animate-spin-[spin_12s_linear_infinite] opacity-50">✦ ✦ ✦</span>
                    <Check className="w-3.5 h-3.5 absolute text-blue-600 font-bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-900 tracking-wider leading-none">GDPR</p>
                    <p className="text-[8px] font-mono text-zinc-400 uppercase mt-0.5 tracking-widest">READY</p>
                  </div>
                </div>

                {/* Badge 2: CCPA READY */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-900 tracking-wider leading-none">CCPA</p>
                    <p className="text-[8px] font-mono text-zinc-400 uppercase mt-0.5 tracking-widest">READY</p>
                  </div>
                </div>

                {/* Badge 3: LGPD READY */}
                <div className="flex items-center gap-2 px-3 py-2 bg-white border border-zinc-200/80 rounded-xl shadow-xs">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-650 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-purple-650" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-zinc-900 tracking-wider leading-none">LGPD</p>
                    <p className="text-[8px] font-mono text-zinc-400 uppercase mt-0.5 tracking-widest">READY</p>
                  </div>
                </div>

                {/* Badge 4: SOC 2 TYPE II CERTIFIED */}
                <div className="flex items-center gap-2 px-3.5 py-2 bg-zinc-950 text-white rounded-xl shadow-md border border-zinc-900">
                  <div className="w-8 h-8 rounded-full bg-zinc-800 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-white tracking-widest leading-none">SOC 2</div>
                    <div className="text-[7px] font-mono text-zinc-400 uppercase mt-0.5 tracking-widest leading-none">TYPE II CERTIFIED</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* colorful visual glass gradient CTA card */}
          <div className="relative overflow-hidden rounded-[40px] border border-white/60 shadow-2xl p-8 sm:p-12 md:p-16 bg-gradient-to-tr from-[#9DD3F5]/80 via-[#F3CBD4]/70 to-[#FFC4A9]/80 backdrop-blur-md">
            
            {/* Atmospheric light blobs inside */}
            <div className="absolute -top-24 -left-24 w-96 h-96 bg-cyan-300/40 rounded-full blur-[110px] pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ff6b2bc2]/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-pink-400/30 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Side: Text and CTA action triggers */}
              <div className="lg:col-span-7 text-left space-y-6">
                <h3 className="text-4xl sm:text-5xl md:text-[52px] font-semibold tracking-tight text-zinc-950 leading-[1.05] max-w-xl">
                  Start risk-free. <br />
                  Pay on performance.
                </h3>
                <p className="text-zinc-800 font-light text-xs sm:text-base leading-relaxed max-w-md">
                  Deploy Ever's vertical middleware with $100 in initial performance credits on the house. Deep PMS mapping, direct white-label channels, and zero upfront commitment.
                </p>
                
                <div className="flex flex-wrap gap-3 pt-2">
                  <InteractiveButton
                    to="/signup"
                    className="px-8 py-4 bg-zinc-950 text-white text-xs"
                  >
                    Deploy For Free
                  </InteractiveButton>
                  <InteractiveButton
                    to="/pricing"
                    className="px-8 py-4 bg-white/20 hover:bg-white/30 backdrop-blur-md border border-white/40 !text-zinc-950 rounded-full text-xs font-semibold transition-all inline-flex items-center gap-1"
                  >
                    View Pricing Models
                  </InteractiveButton>
                </div>
              </div>

              {/* Right Side: bullet list matching visual design and icons */}
              <div className="lg:col-span-5 flex flex-col justify-center sm:pl-8">
                <ul className="space-y-4">
                  {[
                    "Deep PMS Synchronization (Opera, Mews, Cloudbeds)",
                    "Unified WhatsApp, Instagram & Web Live-Chat",
                    "Direct In-Chat Settlements via Stripe Gateway",
                    "91% Query Settlement & Operational Relief",
                    "High-Availability Secure Sandbox Containers"
                  ].map((bullet, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-xs text-zinc-900 font-semibold">
                      <span className="w-5 h-5 rounded-full bg-zinc-950/10 text-zinc-950 flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5 text-zinc-950 stroke-[3]" />
                      </span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
