import React, { useEffect, useState, useCallback } from "react";
import {
  Plus, Edit2, Trash2, Search, RefreshCw, Layers, Home, Info,
  HelpCircle, X, Sparkles, AlertCircle, Database, Download, FileText, Link, Table
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";
import { RichTextEditor } from "../../../shared/RichTextEditor";

type SubTab = "FAQs" | "Rooms" | "Upsells" | "Data Sources";

interface FAQ { id: string; question: string; answer: string; category: string | null; active: boolean; }
interface Room { id: string; room_id: string | null; type: string; rate: number; capacity: number; description: string; available: boolean; amenities: string[] | null; }
interface Upsell { id: string; name: string; description: string; price: number; category: string | null; active: boolean; conversion_count: number; }
interface DataSource { id: string; type: string; name: string; config: any; status: string; last_synced: string | null; }

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
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-dash-text-muted uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-sm text-dash-text placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[#EA6639]/50 transition-shadow";
const btnPrimaryCls = "px-4 py-2 bg-[#EA6639] text-white rounded-lg text-sm font-medium hover:bg-[#d4582e] transition-colors disabled:opacity-50";
const btnSecCls = "px-4 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-sm font-medium hover:bg-dash-surface-hover transition-colors";

export function KnowledgeBaseTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("FAQs");
  const [search, setSearch] = useState("");

  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [upsells, setUpsells] = useState<Upsell[]>([]);
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ table: string; id: string; label: string } | null>(null);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  const logAudit = async (action: string, resource: string, detail: any) => {
    if (!hotelId) return;
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("audit_log").insert({
      hotel_id: hotelId,
      actor_id: userData.user?.id || null,
      action,
      resource,
      detail
    });
  };

  const fetchData = useCallback(async () => {
    if (!hotelId && !isSandbox) {
      setLoading(false);
      return;
    }
    if (isSandbox && sandboxData) {
      setFaqs((sandboxData.faqs || []) as FAQ[]);
      setRooms((sandboxData.rooms || []) as Room[]);
      setUpsells((sandboxData.upsells || []) as Upsell[]);
      setDataSources([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [faqRes, roomRes, upsellRes, sourceRes] = await Promise.all([
        supabase.from("faqs").select("*").eq("hotel_id", hotelId).order("display_order", { ascending: true }).order("created_at", { ascending: false }),
        supabase.from("rooms").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
        supabase.from("upsells").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
        supabase.from("knowledge_sources").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false })
      ]);
      setFaqs(faqRes.data || []);
      setRooms(roomRes.data || []);
      setUpsells(upsellRes.data || []);
      setDataSources(sourceRes.data || []);
    } catch (err) {
      console.error("Error fetching knowledge base:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- Supabase Realtime subscriptions for live DB correlation ---
  useEffect(() => {
    if (!hotelId || isSandbox) return;

    const channel = supabase
      .channel(`knowledge-base:${hotelId}`)
      // FAQs
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'faqs', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setFaqs(prev => [payload.new as FAQ, ...prev.filter(f => f.id !== (payload.new as FAQ).id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'faqs', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setFaqs(prev => prev.map(f => f.id === (payload.new as FAQ).id ? (payload.new as FAQ) : f));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'faqs', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setFaqs(prev => prev.filter(f => f.id !== (payload.old as FAQ).id));
      })
      // Rooms
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'rooms', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setRooms(prev => [payload.new as Room, ...prev.filter(r => r.id !== (payload.new as Room).id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setRooms(prev => prev.map(r => r.id === (payload.new as Room).id ? (payload.new as Room) : r));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'rooms', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setRooms(prev => prev.filter(r => r.id !== (payload.old as Room).id));
      })
      // Upsells
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'upsells', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setUpsells(prev => [payload.new as Upsell, ...prev.filter(u => u.id !== (payload.new as Upsell).id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'upsells', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setUpsells(prev => prev.map(u => u.id === (payload.new as Upsell).id ? (payload.new as Upsell) : u));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'upsells', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setUpsells(prev => prev.filter(u => u.id !== (payload.old as Upsell).id));
      })
      // Knowledge Sources (also reflects edge function status updates live)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'knowledge_sources', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setDataSources(prev => [payload.new as DataSource, ...prev.filter(d => d.id !== (payload.new as DataSource).id)]);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'knowledge_sources', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setDataSources(prev => prev.map(d => d.id === (payload.new as DataSource).id ? (payload.new as DataSource) : d));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'knowledge_sources', filter: `hotel_id=eq.${hotelId}` }, (payload) => {
        setDataSources(prev => prev.filter(d => d.id !== (payload.old as DataSource).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [hotelId, isSandbox]);

  // Reset selection on tab change
  useEffect(() => { setSelectedIds(new Set()); setSearch(""); }, [activeSubTab]);

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getTableName = (tab: SubTab) => tab === "FAQs" ? "faqs" : tab === "Rooms" ? "rooms" : tab === "Upsells" ? "upsells" : "knowledge_sources";
  const getActiveField = (tab: SubTab) => tab === "Rooms" ? "available" : "active";

  const handleBulkToggle = async () => {
    if (isReadOnly || (!hotelId && !isSandbox) || activeSubTab === "Data Sources") return;
    const table = getTableName(activeSubTab);
    const field = getActiveField(activeSubTab);
    const ids = Array.from(selectedIds);
    
    // Optimistic update
    if (activeSubTab === "FAQs") setFaqs(prev => prev.map(f => ids.includes(f.id) ? { ...f, [field]: true } : f));
    if (activeSubTab === "Rooms") setRooms(prev => prev.map(r => ids.includes(r.id) ? { ...r, [field]: true } : r));
    if (activeSubTab === "Upsells") setUpsells(prev => prev.map(u => ids.includes(u.id) ? { ...u, [field]: true } : u));

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        faqs: activeSubTab === "FAQs" ? prev.faqs.map(f => ids.includes(f.id) ? { ...f, [field]: true } : f) : prev.faqs,
        rooms: activeSubTab === "Rooms" ? prev.rooms.map(r => ids.includes(r.id) ? { ...r, [field]: true } : r) : prev.rooms,
        upsells: activeSubTab === "Upsells" ? prev.upsells.map(u => ids.includes(u.id) ? { ...u, [field]: true } : u) : prev.upsells,
      }));
      showToast(`Activated ${ids.length} items`, "success");
      setSelectedIds(new Set());
      return;
    }

    try {
      const { error } = await supabase.from(table).update({ [field]: true }).in("id", ids).eq("hotel_id", hotelId);
      if (error) throw error;
      await logAudit("BULK_ACTIVATE", activeSubTab, { ids });
      showToast(`Activated ${ids.length} items`, "success");
      setSelectedIds(new Set());
    } catch (err) {
      showToast("Failed to bulk activate", "error");
      fetchData(); // Rollback
    }
  };

  const handleBulkDelete = async () => {
    if (isReadOnly || (!hotelId && !isSandbox)) return;
    const table = getTableName(activeSubTab);
    const ids = Array.from(selectedIds);
    
    // Optimistic update
    if (activeSubTab === "FAQs") setFaqs(prev => prev.filter(f => !ids.includes(f.id)));
    if (activeSubTab === "Rooms") setRooms(prev => prev.filter(r => !ids.includes(r.id)));
    if (activeSubTab === "Upsells") setUpsells(prev => prev.filter(u => !ids.includes(u.id)));
    if (activeSubTab === "Data Sources") setDataSources(prev => prev.filter(d => !ids.includes(d.id)));

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        faqs: activeSubTab === "FAQs" ? prev.faqs.filter(f => !ids.includes(f.id)) : prev.faqs,
        rooms: activeSubTab === "Rooms" ? prev.rooms.filter(r => !ids.includes(r.id)) : prev.rooms,
        upsells: activeSubTab === "Upsells" ? prev.upsells.filter(u => !ids.includes(u.id)) : prev.upsells,
      }));
      showToast(`Deleted ${ids.length} items`, "success");
      setSelectedIds(new Set());
      return;
    }

    try {
      const { error } = await supabase.from(table).delete().in("id", ids).eq("hotel_id", hotelId);
      if (error) throw error;
      await logAudit("BULK_DELETE", activeSubTab, { ids });
      showToast(`Deleted ${ids.length} items`, "success");
      setSelectedIds(new Set());
    } catch (err) {
      showToast("Failed to bulk delete", "error");
      fetchData(); // Rollback
    }
  };

  const toggleStatus = async (table: string, id: string, currentStatus: boolean, field: string = "active") => {
    if (isReadOnly) return;
    
    // Optimistic update (works for both sandbox and live)
    if (table === "faqs") setFaqs(prev => prev.map(f => f.id === id ? { ...f, [field]: !currentStatus } : f));
    if (table === "rooms") setRooms(prev => prev.map(r => r.id === id ? { ...r, [field]: !currentStatus } : r));
    if (table === "upsells") setUpsells(prev => prev.map(u => u.id === id ? { ...u, [field]: !currentStatus } : u));
    if (table === "knowledge_sources") setDataSources(prev => prev.map(d => d.id === id ? { ...d, [field]: !currentStatus } : d));

    // Sandbox: persistent in-memory update
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        faqs: table === "faqs" ? prev.faqs.map(f => f.id === id ? { ...f, [field]: !currentStatus } : f) : prev.faqs,
        rooms: table === "rooms" ? prev.rooms.map(r => r.id === id ? { ...r, [field]: !currentStatus } : r) : prev.rooms,
        upsells: table === "upsells" ? prev.upsells.map(u => u.id === id ? { ...u, [field]: !currentStatus } : u) : prev.upsells,
      }));
      showToast("Status updated", "success");
      return;
    }

    if (!hotelId) return;

    try {
      const { error } = await supabase.from(table).update({ [field]: !currentStatus }).eq("id", id).eq("hotel_id", hotelId);
      if (error) throw error;
      await logAudit("TOGGLE_STATUS", table, { id, [field]: !currentStatus });
    } catch (err) {
      showToast("Failed to update status", "error");
      fetchData(); // Rollback
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { table, id, label } = deleteTarget;

    // Optimistic remove from UI immediately
    if (table === "faqs") setFaqs(prev => prev.filter(f => f.id !== id));
    if (table === "rooms") setRooms(prev => prev.filter(r => r.id !== id));
    if (table === "upsells") setUpsells(prev => prev.filter(u => u.id !== id));
    if (table === "knowledge_sources") setDataSources(prev => prev.filter(d => d.id !== id));
    setDeleteTarget(null);

    // Sandbox: persistent in-memory deletion
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        faqs: table === "faqs" ? prev.faqs.filter(f => f.id !== id) : prev.faqs,
        rooms: table === "rooms" ? prev.rooms.filter(r => r.id !== id) : prev.rooms,
        upsells: table === "upsells" ? prev.upsells.filter(u => u.id !== id) : prev.upsells,
      }));
      showToast(`Deleted "${label}" successfully`, "success");
      return;
    }

    if (!hotelId) return;

    try {
      const { error } = await supabase.from(table).delete().eq("id", id).eq("hotel_id", hotelId);
      if (error) throw error;
      await logAudit("DELETE", table, { id, label });
      showToast(`Deleted "${label}" successfully`, "success");
    } catch (err) {
      showToast("Failed to delete item", "error");
      fetchData(); // Rollback
    }
  };

  const handleSave = async (data: any) => {
    if (!hotelId && !isSandbox) return;
    const table = getTableName(activeSubTab);
    const tempId = `kb-${Math.random().toString(36).substring(2, 10)}`;

    // --- SANDBOX in-memory persistent CRUD ---
    if (isSandbox) {
      if (modalMode === "add") {
        const newItem = { ...data, id: tempId, hotel_id: hotelId || "sandbox", active: data.active ?? true, available: data.available ?? true, conversion_count: 0 };
        if (activeSubTab === "FAQs") {
          setFaqs(prev => [newItem as FAQ, ...prev]);
          updateData(prev => ({ ...prev, faqs: [newItem as any, ...(prev.faqs || [])] }));
        }
        if (activeSubTab === "Rooms") {
          setRooms(prev => [newItem as Room, ...prev]);
          updateData(prev => ({ ...prev, rooms: [newItem as any, ...(prev.rooms || [])] }));
        }
        if (activeSubTab === "Upsells") {
          setUpsells(prev => [newItem as Upsell, ...prev]);
          updateData(prev => ({ ...prev, upsells: [newItem as any, ...(prev.upsells || [])] }));
        }
        if (activeSubTab === "Data Sources") {
          const newSource: DataSource = { id: tempId, type: data.type, name: data.name, config: data.config || {}, status: "synced", last_synced: new Date().toISOString() };
          setDataSources(prev => [newSource, ...prev]);
        }
        showToast(`Added successfully`, "success");
      } else if (modalMode === "edit" && editingItem) {
        const updatedItem = { ...editingItem, ...data };
        if (activeSubTab === "FAQs") {
          setFaqs(prev => prev.map(f => f.id === editingItem.id ? updatedItem as FAQ : f));
          updateData(prev => ({ ...prev, faqs: (prev.faqs || []).map(f => f.id === editingItem.id ? updatedItem : f) }));
        }
        if (activeSubTab === "Rooms") {
          setRooms(prev => prev.map(r => r.id === editingItem.id ? updatedItem as Room : r));
          updateData(prev => ({ ...prev, rooms: (prev.rooms || []).map(r => r.id === editingItem.id ? updatedItem : r) }));
        }
        if (activeSubTab === "Upsells") {
          setUpsells(prev => prev.map(u => u.id === editingItem.id ? updatedItem as Upsell : u));
          updateData(prev => ({ ...prev, upsells: (prev.upsells || []).map(u => u.id === editingItem.id ? updatedItem : u) }));
        }
        showToast(`Updated successfully`, "success");
      }
      setModalOpen(false);
      setEditingItem(null);
      return;
    }

    // --- LIVE Supabase CRUD ---
    try {
      if (table === "knowledge_sources") {
        if (data.type === "pdf" && data.file) {
          const fileExt = data.file.name.split('.').pop();
          const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `${hotelId}/${fileName}`;
          const { error: uploadError } = await supabase.storage.from('knowledge_files').upload(filePath, data.file);
          if (uploadError) throw uploadError;
          const { data: insertedSource, error: dbError } = await supabase
            .from(table)
            .insert({ hotel_id: hotelId, type: data.type, name: data.name, config: { path: filePath }, status: 'syncing' })
            .select()
            .single();
          if (dbError) throw dbError;
          if (insertedSource) setDataSources(prev => [insertedSource as DataSource, ...prev]);
        } else {
          const { data: insertedSource, error } = await supabase
            .from(table)
            .insert({ hotel_id: hotelId, type: data.type, name: data.name, config: data.config, status: 'syncing' })
            .select()
            .single();
          if (error) throw error;
          if (insertedSource) setDataSources(prev => [insertedSource as DataSource, ...prev]);
        }
        await logAudit("CREATE", "Data Sources", { type: data.type, name: data.name });
        showToast("Source added and syncing...", "success");
      } else {
        if (modalMode === "add") {
          const { data: inserted, error } = await supabase
            .from(table)
            .insert({ ...data, hotel_id: hotelId })
            .select()
            .single();
          if (error) throw error;
          if (inserted) {
            if (activeSubTab === "FAQs") setFaqs(prev => [inserted as FAQ, ...prev]);
            if (activeSubTab === "Rooms") setRooms(prev => [inserted as Room, ...prev]);
            if (activeSubTab === "Upsells") setUpsells(prev => [inserted as Upsell, ...prev]);
          }
          await logAudit("CREATE", activeSubTab, data);
          showToast(`Added successfully`, "success");
        } else {
          const { error } = await supabase.from(table).update(data).eq("id", editingItem.id).eq("hotel_id", hotelId);
          if (error) throw error;
          if (activeSubTab === "FAQs") setFaqs(prev => prev.map(f => f.id === editingItem.id ? { ...f, ...data } : f));
          if (activeSubTab === "Rooms") setRooms(prev => prev.map(r => r.id === editingItem.id ? { ...r, ...data } : r));
          if (activeSubTab === "Upsells") setUpsells(prev => prev.map(u => u.id === editingItem.id ? { ...u, ...data } : u));
          await logAudit("UPDATE", activeSubTab, { id: editingItem.id, ...data });
          showToast(`Updated successfully`, "success");
        }
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch (err: any) {
      showToast(err.message || "Failed to save", "error");
    }
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    if (activeSubTab === "FAQs") {
      headers = ["Question", "Answer", "Category", "Active"];
      rows = faqs.map(f => [f.question, f.answer.replace(/<[^>]*>?/gm, ''), f.category || "", f.active.toString()]);
    } else if (activeSubTab === "Rooms") {
      headers = ["Room Type", "Room ID", "Rate", "Capacity", "Available"];
      rows = rooms.map(r => [r.type, r.room_id || "", r.rate.toString(), r.capacity.toString(), r.available.toString()]);
    } else if (activeSubTab === "Upsells") {
      headers = ["Name", "Price", "Category", "Active", "Conversion Count"];
      rows = upsells.map(u => [u.name, u.price.toString(), u.category || "", u.active.toString(), u.conversion_count.toString()]);
    } else if (activeSubTab === "Data Sources") {
      headers = ["Name", "Type", "Status", "Last Synced"];
      rows = dataSources.map(d => [d.name, d.type, d.status, d.last_synced || ""]);
    }
    const csvContent = [headers.join(","), ...rows.map(r => r.map(cell => `"${(cell || "").replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `${hotelId}_${activeSubTab.toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    logAudit("EXPORT_CSV", activeSubTab, { format: "csv" });
  };

  const openAdd = () => { setModalMode("add"); setEditingItem(null); setModalOpen(true); };
  const openEdit = (item: any) => { setModalMode("edit"); setEditingItem(item); setModalOpen(true); };

  const s = search.toLowerCase();
  const filteredFaqs = faqs.filter(f => f.question.toLowerCase().includes(s) || f.answer.toLowerCase().includes(s));
  const filteredRooms = rooms.filter(r => r.type.toLowerCase().includes(s) || (r.description || "").toLowerCase().includes(s));
  const filteredUpsells = upsells.filter(u => u.name.toLowerCase().includes(s) || (u.description || "").toLowerCase().includes(s));
  const filteredSources = dataSources.filter(d => d.name.toLowerCase().includes(s) || d.type.toLowerCase().includes(s));

  const isEmpty = faqs.length === 0 && rooms.length === 0 && upsells.length === 0 && dataSources.length === 0;
  const counts: Record<SubTab, number> = { FAQs: faqs.length, Rooms: rooms.length, Upsells: upsells.length, "Data Sources": dataSources.length };

  return (
    <div className="p-3 md:p-5 space-y-4 h-full flex flex-col relative overflow-hidden dashboard-interactive">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text tracking-tight">Knowledge Base</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Manage your AI agent's knowledge sources, FAQs, rooms &amp; upsells.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={handleExportCsv} className="flex items-center gap-2 px-3 py-1.5 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors shadow-sm">
            <Download className="w-4 h-4" /> Export CSV
          </button>
          {!isReadOnly && (
            <button onClick={openAdd} className="flex items-center gap-2 px-3 py-1.5 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#d4582e] transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Add {activeSubTab === "Data Sources" ? "Source" : activeSubTab.slice(0, -1)}
            </button>
          )}
        </div>
      </div>

      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm relative z-10">
        <div className="border-b border-dash-border flex items-center px-4 pt-1 bg-dash-canvas/50">
          {(["FAQs", "Rooms", "Upsells", "Data Sources"] as SubTab[]).map(tab => (
            <button key={tab} onClick={() => setActiveSubTab(tab)} className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-colors ${activeSubTab === tab ? "border-[#EA6639] text-[#EA6639]" : "border-transparent text-dash-text-muted hover:text-dash-text-sec"}`}>
              {tab === "FAQs" && <HelpCircle className="w-4 h-4" />}
              {tab === "Rooms" && <Home className="w-4 h-4" />}
              {tab === "Upsells" && <Layers className="w-4 h-4" />}
              {tab === "Data Sources" && <Database className="w-4 h-4" />}
              {tab}
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${activeSubTab === tab ? "bg-[#EA6639]/10 text-[#EA6639]" : "bg-dash-canvas text-dash-text-muted border border-dash-border"}`}>{counts[tab]}</span>
            </button>
          ))}
        </div>

        <div className="p-3 border-b border-dash-border bg-dash-surface flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-dash-text-muted" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={`Search ${activeSubTab.toLowerCase()}...`} className="w-full pl-9 pr-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#EA6639]/50 text-dash-text placeholder-zinc-500" />
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4 bg-dash-canvas/30">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full text-dash-text-muted">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639] mb-2" />
              <span className="text-xs">Loading {activeSubTab}...</span>
            </div>
          ) : isEmpty ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10 h-full">
              <div className="w-16 h-16 bg-dash-surface border border-dash-border rounded-2xl flex items-center justify-center shadow-sm mb-4"><Sparkles className="w-8 h-8 text-dash-text-muted" /></div>
              <h3 className="text-header font-semibold text-dash-text mb-1">Knowledge Base is Empty</h3>
              <p className="text-body text-dash-text-sec mb-6 max-w-sm">No data available. Add your own FAQs, rooms and upsells.</p>
              {!isReadOnly && isSandbox && (
                <button onClick={regenerate} className="px-5 py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
                  <Database className="w-4 h-4" /> Regenerate Demo Data
                </button>
              )}
            </div>
          ) : (
            <>
              {activeSubTab === "FAQs" && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredFaqs.map(faq => (
                    <div key={faq.id} className={`relative p-4 bg-dash-surface border rounded-xl transition-all flex flex-col hover:shadow-md ${selectedIds.has(faq.id) ? "border-[#EA6639] ring-1 ring-[#EA6639]/20" : "border-dash-border hover:border-[#EA6639]/40"}`}>
                      <input type="checkbox" checked={selectedIds.has(faq.id)} onChange={() => toggleSelection(faq.id)} className="absolute top-3 left-3 w-4 h-4 accent-[#EA6639] cursor-pointer" />
                      <div className="pl-6 flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-semibold text-dash-text text-sm line-clamp-2">{faq.question}</h4>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEdit(faq)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded" title="Edit FAQ"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ table: "faqs", id: faq.id, label: faq.question })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-dash-surface-hover rounded" title="Delete FAQ"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-dash-text-sec mb-4 line-clamp-3 flex-1 pl-6" dangerouslySetInnerHTML={{ __html: faq.answer }} />
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                        {faq.category ? <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-canvas rounded text-dash-text-sec border border-dash-border">{faq.category}</span> : <span />}
                        <button onClick={() => toggleStatus("faqs", faq.id, faq.active)} disabled={isReadOnly} className="flex items-center gap-1.5 text-xs font-medium">
                          <span className={`w-2 h-2 rounded-full ${faq.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`} />
                          <span className={faq.active ? 'text-emerald-600' : 'text-dash-text-muted'}>{faq.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeSubTab === "Rooms" && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredRooms.map(room => (
                    <div key={room.id} className={`relative p-4 bg-dash-surface border rounded-xl transition-all flex flex-col hover:shadow-md ${selectedIds.has(room.id) ? "border-[#EA6639] ring-1 ring-[#EA6639]/20" : "border-dash-border hover:border-[#EA6639]/40"}`}>
                      <input type="checkbox" checked={selectedIds.has(room.id)} onChange={() => toggleSelection(room.id)} className="absolute top-3 left-3 w-4 h-4 accent-[#EA6639] cursor-pointer" />
                      <div className="pl-6 flex justify-between items-start mb-2 gap-2">
                        <div>
                          <h4 className="font-semibold text-dash-text text-sm truncate">{room.type}</h4>
                          {room.room_id && <span className="text-[10px] font-mono text-dash-text-muted">{room.room_id}</span>}
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEdit(room)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded" title="Edit Room"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ table: "rooms", id: room.id, label: room.type })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-dash-surface-hover rounded" title="Delete Room"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-dash-text-sec mb-2 font-medium pl-6"><span className="text-[#EA6639] font-bold">${room.rate} / night</span><span>•</span><span>Up to {room.capacity} guests</span></div>
                      <div className="text-xs text-dash-text-muted mb-3 line-clamp-2 flex-1 pl-6" dangerouslySetInnerHTML={{ __html: room.description || "No description." }} />
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                        <div className="flex items-center gap-1"><Info className="w-3.5 h-3.5 text-dash-text-muted" /><span className="text-[10px] text-dash-text-muted">{room.amenities?.length || 0} amenities</span></div>
                        <button onClick={() => toggleStatus("rooms", room.id, room.available, "available")} disabled={isReadOnly} className="flex items-center gap-1.5 text-xs font-medium">
                          <span className={`w-2 h-2 rounded-full ${room.available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`} />
                          <span className={room.available ? 'text-emerald-600' : 'text-red-500'}>{room.available ? 'Available' : 'Sold Out'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeSubTab === "Upsells" && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {filteredUpsells.map(upsell => (
                    <div key={upsell.id} className={`relative p-4 bg-dash-surface border rounded-xl transition-all flex flex-col hover:shadow-md ${selectedIds.has(upsell.id) ? "border-[#EA6639] ring-1 ring-[#EA6639]/20" : "border-dash-border hover:border-[#EA6639]/40"}`}>
                      <input type="checkbox" checked={selectedIds.has(upsell.id)} onChange={() => toggleSelection(upsell.id)} className="absolute top-3 left-3 w-4 h-4 accent-[#EA6639] cursor-pointer" />
                      <div className="pl-6 flex justify-between items-start mb-2 gap-2">
                        <h4 className="font-semibold text-dash-text text-sm truncate">{upsell.name}</h4>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => openEdit(upsell)} className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded" title="Edit Upsell"><Edit2 className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteTarget({ table: "upsells", id: upsell.id, label: upsell.name })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-dash-surface-hover rounded" title="Delete Upsell"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[#EA6639] mb-2 pl-6">${upsell.price}</div>
                      <div className="text-xs text-dash-text-sec mb-4 line-clamp-2 flex-1 pl-6" dangerouslySetInnerHTML={{ __html: upsell.description || "No description." }} />
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                        <div className="flex items-center gap-2">
                          {upsell.category ? <span className="text-[10px] font-medium px-2 py-0.5 bg-dash-canvas rounded text-dash-text-sec border border-dash-border">{upsell.category}</span> : <span />}
                        </div>
                        <button onClick={() => toggleStatus("upsells", upsell.id, upsell.active)} disabled={isReadOnly} className="flex items-center gap-1.5 text-xs font-medium">
                          <span className={`w-2 h-2 rounded-full ${upsell.active ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-zinc-400'}`} />
                          <span className={upsell.active ? 'text-emerald-600' : 'text-dash-text-muted'}>{upsell.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {activeSubTab === "Data Sources" && (
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredSources.map(source => (
                    <div key={source.id} className={`relative p-4 bg-dash-surface border rounded-xl transition-all flex flex-col hover:shadow-md ${selectedIds.has(source.id) ? "border-[#EA6639] ring-1 ring-[#EA6639]/20" : "border-dash-border hover:border-[#EA6639]/40"}`}>
                      <input type="checkbox" checked={selectedIds.has(source.id)} onChange={() => toggleSelection(source.id)} className="absolute top-3 left-3 w-4 h-4 accent-[#EA6639] cursor-pointer" />
                      <div className="pl-6 flex justify-between items-start mb-2 gap-2">
                        <div className="flex items-center gap-2">
                          {source.type === 'pdf' && <FileText className="w-4 h-4 text-rose-500" />}
                          {source.type === 'notion' && <Link className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />}
                          {source.type === 'gsheets' && <Table className="w-4 h-4 text-emerald-500" />}
                          <h4 className="font-semibold text-dash-text text-sm truncate">{source.name}</h4>
                        </div>
                        {!isReadOnly && (
                          <div className="flex items-center gap-1 shrink-0">
                            <button onClick={() => setDeleteTarget({ table: "knowledge_sources", id: source.id, label: source.name })} className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-dash-surface-hover rounded" title="Delete Source"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-dash-text-sec mb-4 pl-6">Type: <span className="uppercase font-mono text-[10px]">{source.type}</span></div>
                      <div className="flex items-center justify-between mt-auto pt-3 border-t border-dash-border/50">
                        <span className="text-[10px] text-dash-text-muted">{source.last_synced ? `Synced: ${new Date(source.last_synced).toLocaleDateString()}` : "Never synced"}</span>
                        <div className="flex items-center gap-1.5 text-xs font-medium">
                          <span className={`w-2 h-2 rounded-full ${source.status === 'synced' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : source.status === 'syncing' ? 'bg-amber-500 animate-pulse' : 'bg-red-500'}`} />
                          <span className={source.status === 'synced' ? 'text-emerald-600' : source.status === 'syncing' ? 'text-amber-500' : 'text-red-500'}>{source.status}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-dash-surface border border-dash-border shadow-xl rounded-full px-6 py-3 flex items-center gap-4 z-50 animate-in slide-in-from-bottom-5">
          <span className="text-sm font-medium text-dash-text">{selectedIds.size} selected</span>
          <div className="w-px h-4 bg-dash-border"></div>
          {activeSubTab !== "Data Sources" && <button onClick={handleBulkToggle} className="text-sm font-medium text-dash-text hover:text-[#EA6639] transition-colors">Toggle Active</button>}
          <button onClick={handleBulkDelete} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Delete</button>
          <button onClick={() => setSelectedIds(new Set())} className="p-1 rounded-full hover:bg-dash-surface-hover"><X className="w-4 h-4 text-dash-text-muted" /></button>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditingItem(null); }} title={`${modalMode === "add" ? "Add" : "Edit"} ${activeSubTab === "Data Sources" ? "Source" : activeSubTab.slice(0, -1)}`}>
        {activeSubTab === "FAQs" && <FAQForm initial={modalMode === "edit" ? editingItem : undefined} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
        {activeSubTab === "Rooms" && <RoomForm initial={modalMode === "edit" ? editingItem : undefined} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
        {activeSubTab === "Upsells" && <UpsellForm initial={modalMode === "edit" ? editingItem : undefined} onSave={handleSave} onCancel={() => setModalOpen(false)} />}
        {activeSubTab === "Data Sources" && <DataSourceForm onSave={handleSave} onCancel={() => setModalOpen(false)} />}
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Confirm Deletion">
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

function FAQForm({ initial, onSave, onCancel }: any) {
  const [question, setQuestion] = useState(initial?.question || "");
  const [answer, setAnswer] = useState(initial?.answer || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [active, setActive] = useState(initial?.active ?? true);
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ question, answer, category: category || null, active }); }} className="space-y-4">
      <Field label="Question"><input className={inputCls} value={question} onChange={e => setQuestion(e.target.value)} required /></Field>
      <Field label="Answer"><RichTextEditor content={answer} onChange={setAnswer} placeholder="The detailed answer..." minHeight="110px" /></Field>
      <Field label="Category"><input className={inputCls} value={category} onChange={e => setCategory(e.target.value)} /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer" />
        <span className="text-sm text-dash-text">Active (AI agent will use this FAQ)</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add FAQ"}</button>
      </div>
    </form>
  );
}

function RoomForm({ initial, onSave, onCancel }: any) {
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
      onSave({ type, room_id: roomId || null, rate: parseFloat(rate), capacity: parseInt(capacity), description, amenities: amenitiesStr.split(",").map((a: string) => a.trim()).filter(Boolean), available });
    }} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Room Type"><input className={inputCls} value={type} onChange={e => setType(e.target.value)} required /></Field>
        <Field label="Room ID"><input className={inputCls} value={roomId} onChange={e => setRoomId(e.target.value)} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Rate ($/night)"><input className={inputCls} type="number" step="0.01" value={rate} onChange={e => setRate(e.target.value)} required /></Field>
        <Field label="Max Guests"><input className={inputCls} type="number" value={capacity} onChange={e => setCapacity(e.target.value)} required /></Field>
      </div>
      <Field label="Description"><RichTextEditor content={description} onChange={setDescription} minHeight="90px" /></Field>
      <Field label="Amenities (comma-separated)"><input className={inputCls} value={amenitiesStr} onChange={e => setAmenitiesStr(e.target.value)} /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={available} onChange={e => setAvailable(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer" />
        <span className="text-sm text-dash-text">Available for booking</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add Room"}</button>
      </div>
    </form>
  );
}

function UpsellForm({ initial, onSave, onCancel }: any) {
  const [name, setName] = useState(initial?.name || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [category, setCategory] = useState(initial?.category || "");
  const [active, setActive] = useState(initial?.active ?? true);
  return (
    <form onSubmit={e => { e.preventDefault(); onSave({ name, price: parseFloat(price), description, category: category || null, active }); }} className="space-y-4">
      <Field label="Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} required /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Price ($)"><input className={inputCls} type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required /></Field>
        <Field label="Category"><input className={inputCls} value={category} onChange={e => setCategory(e.target.value)} /></Field>
      </div>
      <Field label="Description"><RichTextEditor content={description} onChange={setDescription} minHeight="90px" /></Field>
      <div className="flex items-center gap-2">
        <input type="checkbox" checked={active} onChange={e => setActive(e.target.checked)} className="w-4 h-4 accent-[#EA6639] rounded cursor-pointer" />
        <span className="text-sm text-dash-text">Active (AI agent will offer this)</span>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>{initial ? "Save Changes" : "Add Upsell"}</button>
      </div>
    </form>
  );
}

function DataSourceForm({ onSave, onCancel }: any) {
  const [type, setType] = useState<"pdf" | "notion" | "gsheets">("pdf");
  const [name, setName] = useState("");
  const [configVal, setConfigVal] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (type === "pdf" && file) onSave({ type, name: name || file.name, file });
    else onSave({ type, name, config: { url_or_token: configVal } });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field label="Source Type">
        <select className={inputCls} value={type} onChange={e => setType(e.target.value as any)}>
          <option value="pdf">PDF File Upload</option>
          <option value="notion">Notion Integration</option>
          <option value="gsheets">Google Sheets</option>
        </select>
      </Field>
      {type === "pdf" ? (
        <>
          <Field label="Name (Optional)"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder="Leave blank to use filename" /></Field>
          <Field label="PDF File">
            <input type="file" accept="application/pdf" onChange={e => setFile(e.target.files?.[0] || null)} className="w-full text-sm text-dash-text file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#EA6639]/10 file:text-[#EA6639] hover:file:bg-[#EA6639]/20" required />
          </Field>
        </>
      ) : (
        <>
          <Field label="Integration Name"><input className={inputCls} value={name} onChange={e => setName(e.target.value)} placeholder={type === "notion" ? "e.g. Hotel Handbook" : "e.g. Pricing Sheet"} required /></Field>
          <Field label={type === "notion" ? "Notion Page URL / Token" : "Google Sheets URL"}>
            <input className={inputCls} value={configVal} onChange={e => setConfigVal(e.target.value)} required />
          </Field>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2 border-t border-dash-border">
        <button type="button" onClick={onCancel} className={btnSecCls}>Cancel</button>
        <button type="submit" className={btnPrimaryCls}>Connect Source</button>
      </div>
    </form>
  );
}
