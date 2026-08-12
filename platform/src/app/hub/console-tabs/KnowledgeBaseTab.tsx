import React, { useEffect, useState, useCallback } from "react";
import {
  Plus, Edit2, Trash2, Search, RefreshCw, Layers, Home, Info,
  HelpCircle, X, Sparkles, CheckCircle2, AlertCircle, Database
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../shared/ToastContext";

type SubTab = "FAQs" | "Rooms" | "Upsells";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string | null;
  active: boolean;
}

interface Room {
  id: string;
  room_id: string | null;
  type: string;
  rate: number;
  capacity: number;
  description: string;
  available: boolean;
  amenities: string[] | null;
}

interface Upsell {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string | null;
  active: boolean;
  conversion_count: number;
}

// ─── Modal Component ────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-dash-surface border border-dash-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-dash-border">
          <h3 className="text-base font-bold text-dash-text">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-dash-surface-hover text-dash-text-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

// ─── Form field helper ──────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-sm text-dash-text placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#EA6639]/50 transition-shadow";
const textareaCls = `${inputCls} resize-none`;
const btnPrimaryCls = "px-4 py-2 bg-[#EA6639] text-white rounded-lg text-sm font-medium hover:bg-[#d4582e] transition-colors disabled:opacity-50";
const btnSecCls = "px-4 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-sm font-medium hover:bg-dash-surface-hover transition-colors";

// ─── Seed Data ──────────────────────────────────────────────────────────────
const SEED_FAQS = [
  { question: "What time is check-in and check-out?", answer: "Check-in is from 3:00 PM and check-out is by 11:00 AM. Early check-in and late check-out may be available upon request, subject to availability.", category: "General" },
  { question: "Is breakfast included in the room rate?", answer: "Our bed & breakfast packages include a complimentary continental or buffet breakfast. Room-only rates do not include breakfast, but it can be added for an additional charge.", category: "Dining" },
  { question: "Do you have parking facilities?", answer: "Yes, we offer both self-parking and valet parking. Self-parking is complimentary for hotel guests, and valet parking is available for a daily fee.", category: "Facilities" },
  { question: "Is there a swimming pool?", answer: "Yes, we have an outdoor infinity pool open daily from 7:00 AM to 9:00 PM. Pool towels are provided complimentary at the poolside.", category: "Facilities" },
  { question: "Do you offer airport shuttle service?", answer: "Yes, we provide a complimentary airport shuttle service. Please contact the front desk at least 24 hours in advance to schedule your pickup.", category: "Transport" },
  { question: "What is your cancellation policy?", answer: "Free cancellation up to 48 hours before the check-in date. Cancellations within 48 hours will incur a charge equal to one night's stay.", category: "Policies" },
  { question: "Do you allow pets?", answer: "We welcome small pets (under 10kg) in select pet-friendly rooms for an additional cleaning fee of $50 per stay. Service animals are always welcome at no extra charge.", category: "Policies" },
  { question: "Is there a gym or fitness center?", answer: "Yes, our fully equipped fitness center is open 24/7 for hotel guests. We also offer complimentary yoga mats in each room upon request.", category: "Facilities" },
  { question: "Do you have conference or meeting rooms?", answer: "We have three meeting rooms accommodating 10 to 80 people, equipped with projectors, whiteboards, and high-speed Wi-Fi. Please contact events@hotel.com for bookings.", category: "Events" },
  { question: "What dining options are available?", answer: "We have a signature restaurant (open for lunch and dinner), a rooftop bar, 24-hour room service, and a poolside café serving light snacks and beverages.", category: "Dining" },
  { question: "Is Wi-Fi free?", answer: "Yes, high-speed Wi-Fi is complimentary throughout the hotel, including all guest rooms, lobby, and common areas.", category: "General" },
  { question: "Do you offer laundry services?", answer: "Yes, same-day laundry and dry cleaning services are available. Items collected before 9:00 AM will be returned by 6:00 PM the same day.", category: "Services" },
];

const SEED_ROOMS = [
  { room_id: "STD-K", type: "Standard King", rate: 150.00, capacity: 2, description: "A comfortable room featuring a king-size bed, work desk, 42\" smart TV, and city views. Perfect for solo travellers or couples.", amenities: ["King Bed", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: true },
  { room_id: "STD-T", type: "Standard Twin", rate: 140.00, capacity: 2, description: "Twin room with two single beds, ideal for friends or colleagues travelling together. Includes all standard amenities.", amenities: ["Twin Beds", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: true },
  { room_id: "DLX-OV", type: "Deluxe Ocean View", rate: 280.00, capacity: 2, description: "Spacious deluxe room with floor-to-ceiling windows offering stunning ocean panoramas. Features a seating area and premium bathroom.", amenities: ["King Bed", "Ocean View", "Bathtub", "Nespresso Machine", "Smart TV", "Balcony", "Premium Toiletries"], available: true },
  { room_id: "FAM-S", type: "Family Suite", rate: 350.00, capacity: 4, description: "Generous two-room suite with a master bedroom and a kids' room. Includes a living area and kitchenette.", amenities: ["King Bed", "Bunk Beds", "Kitchenette", "Living Area", "2 Smart TVs", "Board Games", "Sofa Bed"], available: true },
  { room_id: "PRES", type: "Presidential Suite", rate: 850.00, capacity: 4, description: "Our flagship suite spanning 120sqm with a separate living room, dining area, and a private terrace with panoramic views.", amenities: ["King Bed", "Living Room", "Dining Room", "Private Terrace", "Jacuzzi", "Butler Service", "Premium Bar"], available: true },
  { room_id: "DLX-GV", type: "Deluxe Garden View", rate: 220.00, capacity: 2, description: "Elegantly appointed room overlooking the lush hotel gardens. Features rain shower and premium bedding.", amenities: ["King Bed", "Garden View", "Rain Shower", "Nespresso Machine", "Smart TV", "Balcony"], available: true },
  { room_id: "DBL-Q", type: "Double Queen", rate: 200.00, capacity: 4, description: "Comfortable room with two queen-size beds, ideal for families or groups needing extra space.", amenities: ["2 Queen Beds", "Smart TV", "Mini Fridge", "Work Desk", "Free Wi-Fi", "Air Conditioning"], available: false },
];

const SEED_UPSELLS = [
  { name: "Romantic Turndown Package", description: "Rose petals, champagne, chocolates, and candlelight arranged in your room before arrival.", price: 120.00, category: "Romance", active: true },
  { name: "Airport Transfer (Return)", description: "Private sedan transfer to and from the airport. Driver meets you at arrivals with a name sign.", price: 85.00, category: "Transport", active: true },
  { name: "Late Check-out (until 4 PM)", description: "Extend your stay until 4:00 PM on checkout day. Subject to availability.", price: 50.00, category: "Stay", active: true },
  { name: "Spa Day Pass", description: "Full-day access to the spa facilities including sauna, steam room, and a 30-minute massage.", price: 150.00, category: "Wellness", active: true },
  { name: "Breakfast in Bed", description: "Continental or full English breakfast delivered to your room at your chosen time.", price: 35.00, category: "Dining", active: true },
  { name: "Welcome Fruit Basket", description: "A curated basket of fresh seasonal fruits and artisanal snacks placed in your room.", price: 28.00, category: "Amenities", active: true },
  { name: "City Tour (Half Day)", description: "Guided half-day tour of top attractions with private transport and a local guide.", price: 95.00, category: "Experiences", active: true },
  { name: "Premium Wi-Fi Upgrade", description: "Upgrade to 100Mbps dedicated connection for streaming and video calls.", price: 15.00, category: "Technology", active: false },
];

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════
export function KnowledgeBaseTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("FAQs");
  const [search, setSearch] = useState("");

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>([]);

  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<any>(null);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{ table: string; id: string; label: string } | null>(null);

  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  // ─── Fetch ──────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);
    try {
      const [faqRes, roomRes, upsellRes] = await Promise.all([
        supabase.from("faqs").select("id, question, answer, category, active").eq("hotel_id", hotelId).order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        supabase.from("rooms").select("id, room_id, type, rate, capacity, description, available, amenities").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
        supabase.from("upsells").select("id, name, description, price, category, active, conversion_count").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
      ]);
      setFaqs(faqRes.data || []);
      setRooms(roomRes.data || []);
      setUpsells(upsellRes.data || []);
    } catch (err) {
      console.error("Error fetching knowledge base:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ─── Toggle Status ────────────────────────────────────────────────────
  const toggleStatus = async (table: "faqs" | "rooms" | "upsells", id: string, currentStatus: boolean, field: string = "active") => {
    if (isReadOnly || !hotelId) return;
    if (table === "faqs") setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: !currentStatus } : f));
    if (table === "rooms") setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentStatus } : r));
    if (table === "upsells") setUpsells(prev => prev.map(u => u.id === id ? { ...u, [field]: !currentStatus } : u));
    try {
      const { error } = await supabase.from(table).update({ [field]: !currentStatus }).eq("id", id).eq("hotel_id", hotelId);
      if (error) throw error;
    } catch (err) {
      console.error("Failed to toggle status:", err);
      showToast("Failed to update status", "error");
      fetchData();
    }
  };

  // ─── Delete ───────────────────────────────────────────────────────────
  const confirmDelete = async () => {
    if (!deleteTarget || !hotelId) return;
    try {
      const { error } = await supabase.from(deleteTarget.table).delete().eq("id", deleteTarget.id).eq("hotel_id", hotelId);
      if (error) throw error;
      showToast(`Deleted "${deleteTarget.label}" successfully`, "success");
      fetchData();
    } catch (err) {
      console.error("Failed to delete:", err);
      showToast("Failed to delete item", "error");
    }
    setDeleteTarget(null);
  };

  // ─── Save (Add/Edit) ─────────────────────────────────────────────────
  const handleSave = async (data: Record<string, any>) => {
    if (!hotelId) return;
    const table = activeSubTab === "FAQs" ? "faqs" : activeSubTab === "Rooms" ? "rooms" : "upsells";
    try {
      if (modalMode === "add") {
        const { error } = await supabase.from(table).insert({ ...data, hotel_id: hotelId });
        if (error) throw error;
        showToast(`Added new ${activeSubTab.slice(0, -1)} successfully`, "success");
      } else {
        const { error } = await supabase.from(table).update(data).eq("id", editingItem.id).eq("hotel_id", hotelId);
        if (error) throw error;
        showToast(`Updated ${activeSubTab.slice(0, -1)} successfully`, "success");
      }
      setModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err: any) {
      console.error("Save failed:", err);
      showToast(err.message || "Failed to save", "error");
    }
  };

  // ─── Open modals ──────────────────────────────────────────────────────
  const openAdd = () => { setModalMode("add"); setEditingItem(null); setModalOpen(true); };
  const openEdit = (item: any) => { setModalMode("edit"); setEditingItem(item); setModalOpen(true); };

  // ─── Filters ──────────────────────────────────────────────────────────
  const s = search.toLowerCase();
  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s) || (f.category || "").toLowerCase().includes(s));
  const filteredRooms = rooms.filter(r => r.type.toLowerCase().includes(s) || (r.description || "").toLowerCase().includes(s));
  const filteredUpsells = upsells.filter(u => u.name.toLowerCase().includes(s) || (u.description || "").toLowerCase().includes(s) || (u.category || "").toLowerCase().includes(s));

  const isEmpty = faqs.length === 0 && rooms.length === 0 && upsells.length === 0;

  // ─── Counts for tabs ─────────────────────────────────────────────────
  const counts: Record<SubTab, number> = { FAQs: faqs.length, Rooms: rooms.length, Upsells: upsells.length };

  return (
    <div className="p-3 md:p-5 space-y-4 h-full flex flex-col relative overflow-hidden dashboard-interactive">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text tracking-tight">Knowledge Base</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage the bot's knowledge — FAQs, rooms & upsells.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2 shrink-0">
            <button
              onClick={openAdd}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#d4582e] transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Add {activeSubTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      {/* Main Card */}
      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm relative z-10">
        {/* Sub-tabs */}
        <div className="border-b border-dash-border flex items-center px-4 pt-1 bg-dash-canvas/50">
          {(["FAQs", "Rooms", "Upsells"] as SubTab[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveSubTab(tab); setSearch(""); }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${
                activeSubTab === tab
                  ? "border-[#EA6639] text-[#EA6639]"
                  : "border-transparent text-dash-text-muted hover:text-dash-text-sec"
              }`}
            >
              {tab === "FAQs" && <HelpCircle className="w-4 h-4" />}
              {tab === "Rooms" && <Home className="w-4 h-4" />}
              {tab === "Upsells" && <Layers className="w-4 h-4" />}
              {tab}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                activeSubTab === tab ? "bg-[#EA6639]/10 text-[#EA6639]" : "bg-dash-canvas text-dash-text-muted border border-dash-border"
              }`}>{counts[tab]}</span>
            </button>
          ))}
        </div>

        {/* Search bar */}
        <div className="p-3 border-b border-dash-border bg-dash-surface flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeSubTab.toLowerCase()}...`}
              className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639]/50 text-dash-text placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 bg-dash-canvas/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
              <span className="text-xs">Loading {activeSubTab}...</span>
            </div>
          ) : isEmpty ? (
            /* Global empty state */
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-full">
              <div className="w-16 h-16 bg-dash-surface border border-dash-border rounded-2xl flex items-center justify-center shadow-sm mb-4">
                <Sparkles className="w-8 h-8 text-dash-text-muted" />
              </div>
              <h3 className="text-header font-semibold text-dash-text mb-1">Knowledge Base is Empty</h3>
              <p className="text-body text-dash-text-sec mb-6 max-w-sm">Seed demo data to see the UI in action, or start adding your own FAQs, rooms and upsells.</p>
              {!isReadOnly && (
                <button
                  onClick={seedDemoData}
                  disabled={seeding}
                  className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                >
                  {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Database className="w-4 h-4" />}
                  {seeding ? "Generating..." : "Generate Demo Data"}
                </button>
              )}
            </div>
          ) : (
            <>
              {/* ── FAQs ──────────────────────────────────────────── */}
              {activeSubTab === "FAQs" && (
                filteredFaqs.length === 0 ? (
                  <EmptySubTab icon={<HelpCircle className="w-8 h-8 opacity-40" />} title="No FAQs found" subtitle="Add frequently asked questions to help the bot answer guest inquiries." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredFaqs.map(faq => (
                      <div key={faq.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-all group flex flex-col hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-dash-text text-sm line-clamp-2">{faq.question}</h4>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => openEdit(faq)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTarget({ table: "faqs", id: faq.id, label: faq.question })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-dash-text-sec mb-4 line-clamp-3 flex-1">{faq.answer}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                          {faq.category ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-canvas rounded text-dash-text-sec border border-dash-border">{faq.category}</span>
                          ) : <span />}
                          <button
                            onClick={() => toggleStatus("faqs", faq.id, faq.active)}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${faq.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`} />
                            <span className={faq.active ? 'text-emerald-600' : 'text-dash-text-muted'}>{faq.active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Rooms ─────────────────────────────────────────── */}
              {activeSubTab === "Rooms" && (
                filteredRooms.length === 0 ? (
                  <EmptySubTab icon={<Home className="w-8 h-8 opacity-40" />} title="No Rooms configured" subtitle="Add your property's room types so the bot can answer availability queries." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredRooms.map(room => (
                      <div key={room.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-all group flex flex-col hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <div>
                            <h4 className="font-semibold text-dash-text text-sm truncate">{room.type}</h4>
                            {room.room_id && <span className="text-[10px] font-mono text-dash-text-muted">{room.room_id}</span>}
                          </div>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => openEdit(room)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTarget({ table: "rooms", id: room.id, label: room.type })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-dash-text-sec mb-2 font-medium">
                          <span className="text-[#EA6639] font-bold">${room.rate} / night</span>
                          <span>•</span>
                          <span>Up to {room.capacity} guests</span>
                        </div>
                        <p className="text-xs text-dash-text-muted mb-3 line-clamp-2 flex-1">{room.description || "No description."}</p>
                        {room.amenities && room.amenities.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {room.amenities.slice(0, 4).map((a, i) => (
                              <span key={i} className="text-[10px] px-1.5 py-0.5 bg-dash-canvas border border-dash-border rounded text-dash-text-muted">{a}</span>
                            ))}
                            {room.amenities.length > 4 && <span className="text-[10px] px-1.5 py-0.5 text-dash-text-muted">+{room.amenities.length - 4}</span>}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                          <div className="flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-dash-text-muted" />
                            <span className="text-[10px] text-dash-text-muted">{room.amenities?.length || 0} amenities</span>
                          </div>
                          <button
                            onClick={() => toggleStatus("rooms", room.id, room.available, "available")}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${room.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                            <span className={room.available ? 'text-emerald-600' : 'text-red-500'}>{room.available ? 'Available' : 'Sold Out'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* ── Upsells ───────────────────────────────────────── */}
              {activeSubTab === "Upsells" && (
                filteredUpsells.length === 0 ? (
                  <EmptySubTab icon={<Layers className="w-8 h-8 opacity-40" />} title="No Upsells configured" subtitle="Configure add-ons the bot can sell to guests." />
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredUpsells.map(upsell => (
                      <div key={upsell.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-all group flex flex-col hover:-translate-y-0.5 hover:shadow-md">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-dash-text text-sm truncate">{upsell.name}</h4>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button onClick={() => openEdit(upsell)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button onClick={() => setDeleteTarget({ table: "upsells", id: upsell.id, label: upsell.name })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#EA6639] mb-2">${upsell.price}</div>
                        <p className="text-xs text-dash-text-sec mb-4 line-clamp-2 flex-1">{upsell.description || "No description."}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                          <div className="flex items-center gap-2">
                            {upsell.category ? (
                              <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-canvas rounded text-dash-text-sec border border-dash-border">{upsell.category}</span>
                            ) : <span />}
                            {upsell.conversion_count > 0 && (
                              <span className="text-[10px] font-mono text-dash-text-muted">{upsell.conversion_count} sold</span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleStatus("upsells", upsell.id, upsell.active)}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${upsell.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`} />
                            <span className={upsell.active ? 'text-emerald-600' : 'text-dash-text-muted'}>{upsell.active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Add/Edit Modal ──────────────────────────────────────────────── */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditingItem(null); }}
        title={`${modalMode === "add" ? "Add" : "Edit"} ${activeSubTab.slice(0, -1)}`}
      >
        {activeSubTab === "FAQs" && (
          <FAQForm
            initial={modalMode === "edit" ? editingItem : undefined}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditingItem(null); }}
          />
        )}
        {activeSubTab === "Rooms" && (
          <RoomForm
            initial={modalMode === "edit" ? editingItem : undefined}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditingItem(null); }}
          />
        )}
        {activeSubTab === "Upsells" && (
          <UpsellForm
            initial={modalMode === "edit" ? editingItem : undefined}
            onSave={handleSave}
            onCancel={() => { setModalOpen(false); setEditingItem(null); }}
          />
        )}
      </Modal>

      {/* ── Delete Confirmation ─────────────────────────────────────────── */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-300">This action cannot be undone.</p>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">You are about to delete: <strong>"{deleteTarget?.label}"</strong></p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button onClick={() => setDeleteTarget(null)} className={btnSecCls}>Cancel</button>
            <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">Delete</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// Sub-components
// ═════════════════════════════════════════════════════════════════════════════
function EmptySubTab({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-dash-text-muted text-center space-y-2 p-6">
      {icon}
      <p className="text-sm font-medium text-dash-text">{title}</p>
      <p className="text-xs max-w-xs">{subtitle}</p>
    </div>
  );
}

// ─── FAQ Form ───────────────────────────────────────────────────────────────
function FAQForm({ initial, onSave, onCancel }: { initial?: FAQ; onSave: (d: any) => void; onCancel: () => void }) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [active, setActive] = useState(initial?.active ?? true);

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ question, answer, category: category || null, active }); }} className="space-y-4">
      <Field label="Question">
        <input className={inputCls} value={question} onChange={e => setQuestion(e.target.value)} placeholder="e.g. What time is check-in?" required />
      </Field>
      <Field label="Answer">
        <textarea className={textareaCls} rows={4} value={answer} onChange={e => setAnswer(e.target.value)} placeholder="The detailed answer the bot will give..." required />
      </Field>
      <Field label="Category">
        <input className={inputCls} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. General, Policies, Dining" />
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded" />
        <span className="text-sm text-dash-text">Active (bot will use this FAQ)</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add FAQ"}</button>
      </div>
    </form>
  );
}

// ─── Room Form ──────────────────────────────────────────────────────────────
function RoomForm({ initial, onSave, onCancel }: { initial?: Room; onSave: (d: any) => void; onCancel: () => void }) {
  const [type, setType] = useState(initial?.type || "");
  const [roomId, setRoomId] = useState(initial?.room_id || "");
  const [rate, setRate] = useState(initial?.rate?.toString() || "");
  const [capacity, setCapacity] = useState(initial?.capacity?.toString() || "2");
  const [description, setDescription] = useState(initial?.description || "");
  const [amenitiesStr, setAmenitiesStr] = useState((initial?.amenities || []).join(", "));
  const [available, setAvailable] = useState(initial?.available ?? true);

  return (
    <form onSubmit={e => {
      e.preventDefault();
      onSave({
        type,
        room_id: roomId || null,
        rate: parseFloat(rate),
        capacity: parseInt(capacity),
        description,
        amenities: amenitiesStr.split(",").map(a => a.trim()).filter(Boolean),
        available
      });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Room Type">
          <input className={inputCls} value={type} onChange={e => setType(e.target.value)} placeholder="e.g. Deluxe King" required />
        </Field>
        <Field label="Room ID">
          <input className={inputCls} value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="e.g. DLX-K" />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rate ($/night)">
          <input className={inputCls} type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} placeholder="150.00" required />
        </Field>
        <Field label="Max Guests">
          <input className={inputCls} type="number" value={capacity} onChange={e => setCapacity(e.target.value)} placeholder="2" required />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={textareaCls} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="A brief description of the room..." />
      </Field>
      <Field label="Amenities (comma-separated)">
        <input className={inputCls} value={amenitiesStr} onChange={e => setAmenitiesStr(e.target.value)} placeholder="King Bed, Smart TV, Mini Fridge, Wi-Fi" />
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded" />
        <span className="text-sm text-dash-text">Available for booking</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add Room"}</button>
      </div>
    </form>
  );
}

// ─── Upsell Form ────────────────────────────────────────────────────────────
function UpsellForm({ initial, onSave, onCancel }: { initial?: Upsell; onSave: (d: any) => void; onCancel: () => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [active, setActive] = useState(initial?.active ?? true);

  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, price: parseFloat(price), description, category: category || null, active }); }} className="space-y-4">
      <Field label="Name">
        <input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Late Check-out" required />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price ($)">
          <input className={inputCls} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} placeholder="50.00" required />
        </Field>
        <Field label="Category">
          <input className={inputCls} value={category} onChange={e => setCategory(e.target.value)} placeholder="e.g. Wellness, Transport" />
        </Field>
      </div>
      <Field label="Description">
        <textarea className={textareaCls} rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="What does the guest get?" />
      </Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded" />
        <span className="text-sm text-dash-text">Active (bot will offer this to guests)</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add Upsell"}</button>
      </div>
    </form>
  );
}
