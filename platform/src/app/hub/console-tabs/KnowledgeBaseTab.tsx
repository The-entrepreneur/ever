import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, Search, RefreshCw, Layers, Home, Info, HelpCircle } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

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
}

export function KnowledgeBaseTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("FAQs");
  const [search, setSearch] = useState("");
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  
  const [loading, setLoading] = useState(true);

  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  const fetchData = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);

    try {
      if (activeSubTab === "FAQs") {
        const { data } = await supabase
          .from("faqs")
          .select("id, question, answer, category, active")
          .eq("hotel_id", hotelId)
          .order("display_order", { ascending: true })
          .order("created_at", { ascending: false });
        setFaqs(data || []);
      } else if (activeSubTab === "Rooms") {
        const { data } = await supabase
          .from("rooms")
          .select("id, type, rate, capacity, description, available, amenities")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false });
        setRooms(data || []);
      } else if (activeSubTab === "Upsells") {
        const { data } = await supabase
          .from("upsells")
          .select("id, name, description, price, category, active")
          .eq("hotel_id", hotelId)
          .order("created_at", { ascending: false });
        setUpsells(data || []);
      }
    } catch (err) {
      console.error(`Error fetching ${activeSubTab}:`, err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, activeSubTab]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleStatus = async (table: "faqs" | "rooms" | "upsells", id: string, currentStatus: boolean, field: string = "active") => {
    if (isReadOnly || !hotelId) return;
    
    // Optimistic update
    if (table === "faqs") setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: !currentStatus } : f));
    if (table === "rooms") setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentStatus } : r));
    if (table === "upsells") setUpsells(prev => prev.map(u => u.id === id ? { ...u, [field]: !currentStatus } : u));

    try {
      await supabase.from(table).update({ [field]: !currentStatus }).eq("id", id).eq("hotel_id", hotelId);
    } catch (err) {
      console.error("Failed to toggle status:", err);
      fetchData(); // Revert on error
    }
  };

  const syncToBot = async () => {
    // In production, this hits an n8n webhook to invalidate the vector DB cache
    alert("Syncing Knowledge Base to Bot Engine...");
  };

  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(search.toLowerCase()) || f.answer.toLowerCase().includes(search.toLowerCase()));
  const filteredRooms = rooms.filter(r => r.type.toLowerCase().includes(search.toLowerCase()) || r.description?.toLowerCase().includes(search.toLowerCase()));
  const filteredUpsells = upsells.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.description?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Knowledge Base Manager</h2>
          <p className="text-dash-text-sec mt-1">Update the bot's knowledge base for FAQs, rooms, and upsells.</p>
        </div>
        {!isReadOnly && (
          <div className="flex gap-2">
            <button 
              onClick={syncToBot}
              className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border text-dash-text rounded-md text-xs font-medium hover:bg-dash-surface-hover transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Sync to Bot
            </button>
            <button 
              onClick={() => alert(`Adding new ${activeSubTab.slice(0, -1)} modal would open here.`)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#d4582e] transition-colors"
            >
              <Plus className="w-4 h-4" /> Add New {activeSubTab.slice(0, -1)}
            </button>
          </div>
        )}
      </div>

      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="border-b border-dash-border flex items-center px-4 pt-2 bg-dash-canvas/50">
          {["FAQs", "Rooms", "Upsells"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveSubTab(tab as SubTab); setSearch(""); }}
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
            </button>
          ))}
        </div>

        <div className="p-4 border-b border-dash-border bg-dash-surface flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${activeSubTab}...`} 
              className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639] text-dash-text"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-dash-canvas/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
              <span className="text-xs">Loading {activeSubTab}...</span>
            </div>
          ) : (
            <>
              {/* FAQs View */}
              {activeSubTab === "FAQs" && (
                filteredFaqs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dash-text-muted text-center space-y-2 p-6">
                    <HelpCircle className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium text-dash-text">No FAQs found</p>
                    <p className="text-xs">Add frequently asked questions to help the bot answer guest inquiries automatically.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredFaqs.map((faq) => (
                      <div key={faq.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-colors group flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-dash-text text-sm line-clamp-2">{faq.question}</h4>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded" title="Edit"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-dash-text-sec mb-4 line-clamp-3 flex-1">{faq.answer}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border-hairline">
                          {faq.category ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-surface-raised rounded text-dash-text-sec border border-dash-border">
                              {faq.category}
                            </span>
                          ) : <span />}
                          <button 
                            onClick={() => toggleStatus("faqs", faq.id, faq.active)}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${faq.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`}></span>
                            <span className={faq.active ? 'text-emerald-600' : 'text-dash-text-muted'}>{faq.active ? 'Active' : 'Inactive'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Rooms View */}
              {activeSubTab === "Rooms" && (
                filteredRooms.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dash-text-muted text-center space-y-2 p-6">
                    <Home className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium text-dash-text">No Rooms configured</p>
                    <p className="text-xs">Add your property's room types so the bot can answer queries about availability and features.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredRooms.map((room) => (
                      <div key={room.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-colors group flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-dash-text text-sm truncate">{room.type}</h4>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-dash-text-sec mb-2 font-medium">
                          <span>${room.rate} / night</span>
                          <span>•</span>
                          <span>Up to {room.capacity} guests</span>
                        </div>
                        <p className="text-xs text-dash-text-muted mb-4 line-clamp-2 flex-1">{room.description || "No description provided."}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border-hairline">
                          <div className="flex items-center gap-1">
                            <Info className="w-3.5 h-3.5 text-dash-text-muted" />
                            <span className="text-[10px] text-dash-text-muted">{room.amenities?.length || 0} amenities</span>
                          </div>
                          <button 
                            onClick={() => toggleStatus("rooms", room.id, room.available, "available")}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${room.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></span>
                            <span className={room.available ? 'text-emerald-600' : 'text-red-500'}>{room.available ? 'Available' : 'Sold Out'}</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* Upsells View */}
              {activeSubTab === "Upsells" && (
                filteredUpsells.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-dash-text-muted text-center space-y-2 p-6">
                    <Layers className="w-8 h-8 opacity-40 mb-2" />
                    <p className="text-sm font-medium text-dash-text">No Upsells configured</p>
                    <p className="text-xs">Configure spa treatments, late check-outs, and add-ons the bot can sell to guests.</p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {filteredUpsells.map((upsell) => (
                      <div key={upsell.id} className="p-4 bg-dash-surface border border-dash-border rounded-xl hover:border-[#EA6639]/40 transition-colors group flex flex-col">
                        <div className="flex justify-between items-start mb-2 gap-2">
                          <h4 className="font-semibold text-dash-text text-sm truncate">{upsell.name}</h4>
                          {!isReadOnly && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                              <button className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded"><Edit2 className="w-3.5 h-3.5" /></button>
                              <button className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                            </div>
                          )}
                        </div>
                        <div className="text-sm font-bold text-[#EA6639] mb-2">${upsell.price}</div>
                        <p className="text-xs text-dash-text-sec mb-4 line-clamp-2 flex-1">{upsell.description || "No description provided."}</p>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border-hairline">
                          {upsell.category ? (
                            <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-surface-raised rounded text-dash-text-sec border border-dash-border">
                              {upsell.category}
                            </span>
                          ) : <span />}
                          <button 
                            onClick={() => toggleStatus("upsells", upsell.id, upsell.active)}
                            disabled={isReadOnly}
                            className={`flex items-center gap-1.5 text-xs font-medium ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                          >
                            <span className={`w-2 h-2 rounded-full ${upsell.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`}></span>
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
    </div>
  );
}
