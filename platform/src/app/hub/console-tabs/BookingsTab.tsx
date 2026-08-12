import React, { useState, useEffect } from "react";
import { 
  Calendar as CalendarIcon, Filter, Search, MoreHorizontal, 
  Download, List, X, Coffee, Clock, CheckCircle2, User, 
  CreditCard, Phone, Mail, MapPin, AlignLeft, RefreshCw
} from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useToast } from "../../../shared/ToastContext";

// ─── Types ───────────────────────────────────────────────────────────────────
type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';
type OrderCategory = 'Room Service' | 'Housekeeping' | 'Maintenance';
type OrderStatus = 'Pending' | 'Preparing' | 'Completed';

interface Booking {
  id: string;
  hotel_id: string;
  booking_reference: string;
  guest_name: string;
  room_type: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  status: BookingStatus;
  created_at: string;
}

interface Order {
  id: string;
  hotel_id: string;
  session_id: string;
  room_number: string;
  items: { name: string, qty: number }[];
  total_amount: number;
  status: string;
  created_at: string;
}

export function BookingsTab() {
  const { hotelId } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [activeSubTab, setActiveSubTab] = useState<"bookings" | "orders">("bookings");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (hotelId) {
      fetchData();
    }
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, ordersRes] = await Promise.all([
        supabase.from("bookings").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false }),
        supabase.from("orders").select("*").eq("hotel_id", hotelId).order("created_at", { ascending: false })
      ]);
      if (bookingsRes.data) setBookings(bookingsRes.data as Booking[]);
      if (ordersRes.data) setOrders(ordersRes.data as Order[]);
    } catch (err) {
      console.error("Error fetching bookings/orders:", err);
    }
    setLoading(false);
  };

  const seedMockData = async () => {
    if (!hotelId) return;
    setSeeding(true);
    try {
      const today = new Date();
      const formatYMD = (d: Date) => d.toISOString().split('T')[0];
      
      const names = ["Alice Smith", "Bob Johnson", "Charlie Brown", "David Lee", "Emma Davis", "Fiona Gallagher", "George Miller", "Hannah White", "Ian Black", "Julia Roberts"];
      const roomTypes = ["Deluxe Ocean View", "Standard King", "Presidential Suite", "Family Suite", "Double Queen"];
      const statuses: BookingStatus[] = ['Confirmed', 'Pending', 'Cancelled'];
      const orderStatuses: OrderStatus[] = ['Pending', 'Preparing', 'Completed'];
      const categories: OrderCategory[] = ['Room Service', 'Housekeeping', 'Maintenance'];
      const items = ["Club Sandwich", "Extra Towels", "Room Cleaning", "Heineken Beer", "Spa Massage", "Airport Transfer", "Pillows", "Coffee & Croissant"];

      const newBookings = [];
      for (let i = 0; i < 25; i++) {
         const offset = Math.floor(Math.random() * 20) - 5; // -5 to +15 days
         const duration = Math.floor(Math.random() * 5) + 1;
         const checkIn = new Date(today); checkIn.setDate(today.getDate() + offset);
         const checkOut = new Date(checkIn); checkOut.setDate(checkIn.getDate() + duration);
         
         newBookings.push({
           hotel_id: hotelId,
           booking_reference: `BK-${Math.floor(Math.random()*90000)+10000}`,
           guest_name: names[Math.floor(Math.random() * names.length)],
           room_type: roomTypes[Math.floor(Math.random() * roomTypes.length)],
           check_in: formatYMD(checkIn),
           check_out: formatYMD(checkOut),
           total_amount: Math.floor(Math.random() * 2000) + 150,
           status: statuses[Math.floor(Math.random() * statuses.length)]
         });
      }

      const { data: bData, error: bErr } = await supabase.from("bookings").insert(newBookings).select();
      if (bErr) throw new Error("Failed to insert bookings: " + bErr.message);

      const newOrders = [];
      for (let i = 0; i < 30; i++) {
         const hasBooking = Math.random() > 0.3 && bData && bData.length > 0;
         const b = hasBooking ? bData![Math.floor(Math.random() * bData!.length)] : null;
         newOrders.push({
           hotel_id: hotelId,
           session_id: `ORD-${Math.floor(Math.random()*90000)+10000}`,
           room_number: `${Math.floor(Math.random() * 5) + 1}0${Math.floor(Math.random() * 9)}`,
           items: [{ name: items[Math.floor(Math.random() * items.length)], qty: 1 }],
           total_amount: Math.floor(Math.random() * 80) + 10,
           status: orderStatuses[Math.floor(Math.random() * orderStatuses.length)]
         });
      }

      const { error: oErr } = await supabase.from("orders").insert(newOrders);
      if (oErr) throw new Error("Failed to insert orders: " + oErr.message);

      await fetchData();
      showToast("Successfully generated bulk demo data!", "success");
    } catch (err: any) {
      console.error("Failed to seed data", err);
      showToast(err.message || "Failed to generate demo data. Did you run the migration?", "error");
    }
    setSeeding(false);
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await supabase.from("orders").update({ status: newStatus }).eq("id", id);
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  // Status Badge Helper
  const getStatusBadge = (status: string) => {
    const s = status?.charAt(0).toUpperCase() + status?.slice(1).toLowerCase();
    switch (s) {
      case 'Confirmed':
      case 'Completed':
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case 'Preparing':
        return "bg-amber-500/10 text-amber-600 border-amber-500/20 glow-badge";
      case 'Pending':
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20 dark:text-zinc-300";
      case 'Cancelled':
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    }
  };

  return (
    <div className="p-3 md:p-5 space-y-4 md:space-y-4 dashboard-interactive h-full flex flex-col relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-header font-bold text-dash-text tracking-tight">Booking Management</h2>
          <p className="text-body text-dash-text-sec mt-0.5">Sophisticated overview of bookings and real-time orders.</p>
        </div>
        
        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          {activeSubTab === "bookings" && (
            <div className="flex bg-dash-canvas border border-dash-border rounded-lg p-1">
              <button 
                onClick={() => setViewMode("list")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "list" ? "bg-white dark:bg-zinc-800 text-dash-text shadow-sm" : "text-dash-text-muted hover:text-dash-text-sec"}`}
              >
                <List className="w-3.5 h-3.5" />
                List
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${viewMode === "calendar" ? "bg-white dark:bg-zinc-800 text-dash-text shadow-sm" : "text-dash-text-muted hover:text-dash-text-sec"}`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                Calendar
              </button>
            </div>
          )}
          <button className="flex-1 sm:flex-initial h-8 px-4 bg-dash-green text-dash-green-text rounded-lg text-xs font-semibold hover:bg-dash-green-hover transition-colors flex items-center justify-center gap-1.5 shadow-sm hover-scale">
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-6 border-b border-dash-border">
        <button 
          onClick={() => setActiveSubTab("bookings")}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${activeSubTab === "bookings" ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec"}`}
        >
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-4 h-4" /> Bookings
          </div>
          {activeSubTab === "bookings" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full shadow-[0_0_8px_rgba(234,102,57,0.5)]"></span>}
        </button>
        <button 
          onClick={() => setActiveSubTab("orders")}
          className={`pb-2.5 text-sm font-medium transition-colors relative ${activeSubTab === "orders" ? "text-dash-green" : "text-dash-text-muted hover:text-dash-text-sec"}`}
        >
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4" /> Orders & Requests
          </div>
          {activeSubTab === "orders" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-dash-green rounded-t-full shadow-[0_0_8px_rgba(234,102,57,0.5)]"></span>}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-dash-surface rounded-xl border border-dash-border flex flex-col flex-1 min-h-[500px] overflow-hidden shadow-sm relative z-10">
        
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
             <div className="w-6 h-6 border-2 border-dash-green border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (bookings.length === 0 && orders.length === 0) ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-dash-canvas/30 text-center p-6">
            <div className="w-16 h-16 bg-dash-surface border border-dash-border rounded-2xl flex items-center justify-center shadow-sm mb-4">
              <CalendarIcon className="w-8 h-8 text-dash-text-muted" />
            </div>
            <h3 className="text-header font-semibold text-dash-text mb-1">No Data Found</h3>
            <p className="text-body text-dash-text-sec mb-6 max-w-sm">There are currently no bookings or orders for this hotel in the database.</p>
            <button 
              onClick={seedMockData}
              disabled={seeding}
              className="px-4 py-2 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
            >
              {seeding ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {seeding ? "Generating..." : "Generate Demo Data"}
            </button>
          </div>
        ) : activeSubTab === "bookings" ? (
          <>
            {/* Toolbar */}
            <div className="p-3 border-b border-dash-border flex flex-col sm:flex-row justify-between gap-3 bg-dash-surface">
              <div className="relative w-full sm:w-[280px] shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dash-text-muted" />
                <input 
                  type="text" 
                  placeholder="Search guest or reference..." 
                  className="w-full pl-9 pr-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EA6639]/50 text-dash-text placeholder-zinc-500 smooth-transition"
                />
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-canvas border border-dash-border rounded-lg text-xs font-medium text-dash-text hover:bg-dash-surface-hover transition-colors">
                  <Filter className="w-3.5 h-3.5" /> Status: All
                </button>
              </div>
            </div>

            {viewMode === "list" ? (
              <div className="overflow-x-auto flex-1 hide-scrollbar bg-dash-surface">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-dash-border bg-dash-canvas/50">
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Reference</th>
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Guest</th>
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Room Type</th>
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Dates</th>
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Total</th>
                      <th className="p-4 text-xs font-medium text-dash-text-muted uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dash-border">
                    {bookings.map((bk) => (
                      <tr 
                        key={bk.id} 
                        onClick={() => setSelectedBooking(bk)}
                        className="hover:bg-dash-surface-hover transition-colors group cursor-pointer"
                      >
                        <td className="p-4 text-sm font-mono text-dash-text-muted">{bk.booking_reference}</td>
                        <td className="p-4 text-sm font-medium text-dash-text flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-dash-canvas border border-dash-border flex items-center justify-center">
                            <User className="w-3 h-3 text-dash-text-muted" />
                          </div>
                          {bk.guest_name}
                        </td>
                        <td className="p-4 text-sm text-dash-text-sec">{bk.room_type}</td>
                        <td className="p-4 text-sm text-dash-text-sec">{bk.check_in} &rarr; {bk.check_out}</td>
                        <td className="p-4 text-sm font-mono text-dash-text">${bk.total_amount.toFixed(2)}</td>
                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${getStatusBadge(bk.status)}`}>
                            {bk.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex-1 bg-dash-canvas/20 overflow-auto p-4 relative">
                 {/* Bespoke Calendar View */}
                 <div className="min-w-[800px]">
                    <div className="grid grid-cols-[150px_repeat(14,1fr)] gap-2 mb-2">
                       <div className="font-medium text-xs text-dash-text-muted uppercase tracking-wider flex items-end pb-2">Room / Date</div>
                       {Array.from({length: 14}).map((_, i) => {
                          const d = new Date(); d.setDate(d.getDate() + i);
                          return (
                            <div key={i} className="text-center pb-2 border-b border-dash-border">
                               <div className="text-[10px] text-dash-text-muted uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                               <div className="text-sm font-bold text-dash-text">{d.getDate()}</div>
                            </div>
                          )
                       })}
                    </div>
                    {/* Dummy rows for visual structure */}
                    {['Deluxe Ocean View', 'Standard King', 'Presidential Suite'].map((room, ri) => (
                      <div key={ri} className="grid grid-cols-[150px_repeat(14,1fr)] gap-2 py-3 border-b border-dash-border/50 group">
                         <div className="text-xs font-medium text-dash-text-sec truncate pr-2">{room}</div>
                         <div className="col-span-14 relative h-8 bg-dash-canvas rounded-md border border-dash-border/50">
                            {/* Map bookings that match this room type to timeline blocks */}
                            {bookings.filter(b => b.room_type === room).map(b => {
                               // Highly simplified date math for visual demo
                               const startOffset = Math.max(0, Math.floor((new Date(b.check_in).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));
                               const duration = Math.max(1, Math.floor((new Date(b.check_out).getTime() - new Date(b.check_in).getTime()) / (1000 * 3600 * 24)));
                               
                               if (startOffset > 13) return null; // Outside view
                               
                               return (
                                 <div 
                                    key={b.id}
                                    onClick={() => setSelectedBooking(b)}
                                    className={`absolute top-0 h-full rounded-md shadow-sm border p-1 px-2 cursor-pointer smooth-transition hover-scale truncate text-[10px] font-bold text-white flex items-center ${b.status === 'Confirmed' ? 'bg-emerald-500 border-emerald-600' : 'bg-amber-500 border-amber-600'}`}
                                    style={{ left: `${(startOffset / 14) * 100}%`, width: `${Math.min((duration / 14) * 100, 100 - (startOffset / 14) * 100)}%`, zIndex: 10 }}
                                 >
                                    {b.guest_name}
                                 </div>
                               )
                            })}
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex flex-col h-full bg-dash-canvas/30 p-4">
             {/* Kanban Board */}
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
                {(['Pending', 'Preparing', 'Completed'] as const).map(status => {
                  const matchFn = (o: Order) => o.status?.toLowerCase() === status.toLowerCase();
                  return (
                  <div key={status} className="flex flex-col h-full bg-dash-surface rounded-xl border border-dash-border shadow-sm overflow-hidden">
                     <div className="p-3 border-b border-dash-border bg-dash-canvas/50 flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-dash-text flex items-center gap-2">
                           {status === 'Pending' && <Clock className="w-4 h-4 text-zinc-500" />}
                           {status === 'Preparing' && <RefreshCw className="w-4 h-4 text-amber-500" />}
                           {status === 'Completed' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                           {status}
                        </h4>
                        <span className="text-xs font-mono bg-dash-canvas border border-dash-border rounded-full px-2 py-0.5 text-dash-text-muted">
                          {orders.filter(matchFn).length}
                        </span>
                     </div>
                     <div className="p-3 flex-1 overflow-y-auto space-y-3">
                        {orders.filter(matchFn).map(order => (
                           <div 
                              key={order.id} 
                              onClick={() => setSelectedOrder(order)}
                              className="bg-dash-canvas border border-dash-border rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer group hover:-translate-y-0.5"
                           >
                              <div className="flex justify-between items-start mb-2">
                                 <span className="text-[10px] font-mono text-dash-text-muted">{order.session_id}</span>
                                 <span className="text-[10px] font-bold text-dash-green bg-dash-green/10 px-1.5 py-0.5 rounded">{order.room_number}</span>
                              </div>
                              <p className="text-sm font-medium text-dash-text mb-1">{order.items?.[0]?.name || "Order"}</p>
                              
                              {status !== 'Completed' && (
                                <div className="pt-3 border-t border-dash-border flex justify-end">
                                   <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        updateOrderStatus(order.id, status === 'Pending' ? 'Preparing' : 'Completed');
                                      }}
                                      className="text-xs font-medium text-dash-green hover:text-dash-green-hover transition-colors flex items-center gap-1"
                                   >
                                      {status === 'Pending' ? 'Start Prep' : 'Complete'} &rarr;
                                   </button>
                                </div>
                              )}
                           </div>
                        ))}
                     </div>
                  </div>
                )})}
             </div>
          </div>
        )}
      </div>

      {/* Slide-Over Modals (using conditional rendering and absolute positioning for demo) */}
      {(selectedBooking || selectedOrder) && (
        <div className="absolute inset-0 z-50 flex justify-end">
           {/* Backdrop */}
           <div 
             className="absolute inset-0 bg-black/20 backdrop-blur-sm" 
             onClick={() => { setSelectedBooking(null); setSelectedOrder(null); }}
           />
           {/* Panel */}
           <div className="relative w-full max-w-md h-full bg-dash-surface border-l border-dash-border shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="p-4 border-b border-dash-border flex justify-between items-center bg-dash-canvas/50">
                 <h3 className="text-base font-bold text-dash-text">
                   {selectedBooking ? 'Booking Details' : 'Order Details'}
                 </h3>
                 <button 
                   onClick={() => { setSelectedBooking(null); setSelectedOrder(null); }}
                   className="p-1.5 rounded-md hover:bg-dash-surface-hover text-dash-text-muted transition-colors"
                 >
                   <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 {selectedBooking && (
                   <>
                     <div className="text-center pb-6 border-b border-dash-border">
                        <div className="w-16 h-16 rounded-full bg-dash-canvas border border-dash-border flex items-center justify-center mx-auto mb-3 shadow-sm">
                           <User className="w-8 h-8 text-dash-text-muted" />
                        </div>
                        <h2 className="text-xl font-bold text-dash-text">{selectedBooking.guest_name}</h2>
                        <p className="text-sm font-mono text-dash-text-sec mt-1">{selectedBooking.booking_reference}</p>
                        <div className="mt-3 inline-flex">
                          <span className={`px-3 py-1 rounded-full border text-xs font-semibold tracking-wide ${getStatusBadge(selectedBooking.status)}`}>
                            {selectedBooking.status}
                          </span>
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-dash-text-muted uppercase tracking-wider">Stay Information</h4>
                        <div className="bg-dash-canvas rounded-xl p-4 border border-dash-border space-y-3">
                           <div className="flex items-center gap-3">
                              <MapPin className="w-4 h-4 text-dash-green" />
                              <div>
                                <p className="text-xs text-dash-text-muted">Room Type</p>
                                <p className="text-sm font-medium text-dash-text">{selectedBooking.room_type}</p>
                              </div>
                           </div>
                           <div className="flex items-center gap-3 pt-3 border-t border-dash-border">
                              <CalendarIcon className="w-4 h-4 text-dash-green" />
                              <div>
                                <p className="text-xs text-dash-text-muted">Check-In / Check-Out</p>
                                <p className="text-sm font-medium text-dash-text">{selectedBooking.check_in} &mdash; {selectedBooking.check_out}</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h4 className="text-xs font-bold text-dash-text-muted uppercase tracking-wider">Payment</h4>
                        <div className="bg-dash-canvas rounded-xl p-4 border border-dash-border flex justify-between items-center">
                           <div className="flex items-center gap-3">
                              <CreditCard className="w-4 h-4 text-dash-text-sec" />
                              <span className="text-sm font-medium text-dash-text">Total Amount</span>
                           </div>
                           <span className="text-base font-bold font-mono text-dash-text">${selectedBooking.total_amount.toFixed(2)}</span>
                        </div>
                     </div>
                   </>
                 )}

                 {selectedOrder && (
                   <>
                      <div className="pb-6 border-b border-dash-border">
                         <div className="flex justify-between items-start mb-4">
                            <span className={`px-2.5 py-1 rounded-full border text-[11px] font-semibold tracking-wide ${getStatusBadge(selectedOrder.status as any)}`}>
                              {selectedOrder.status}
                            </span>
                            <span className="text-sm font-mono text-dash-text-muted">{selectedOrder.session_id}</span>
                         </div>
                         <h2 className="text-2xl font-bold text-dash-text mb-2">{selectedOrder.items?.[0]?.name || "Order"}</h2>
                         <div className="flex items-center gap-2 text-sm text-dash-text-sec">
                            <span className="font-bold text-dash-green bg-dash-green/10 px-2 py-0.5 rounded">Room {selectedOrder.room_number}</span>
                            &bull;
                            <span className="font-mono">${selectedOrder.total_amount?.toFixed(2) || '0.00'}</span>
                         </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-dash-text-muted uppercase tracking-wider">Order Timeline</h4>
                        <div className="relative pl-4 space-y-6 before:absolute before:inset-y-0 before:left-[7px] before:w-px before:bg-dash-border">
                           <div className="relative">
                              <div className="absolute -left-6 w-3 h-3 bg-dash-green rounded-full shadow-[0_0_0_4px_var(--dash-canvas)]"></div>
                              <p className="text-sm font-medium text-dash-text">Order Placed</p>
                              <p className="text-xs text-dash-text-muted">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                           </div>
                           {selectedOrder.status !== 'Pending' && (
                             <div className="relative">
                                <div className="absolute -left-6 w-3 h-3 bg-amber-500 rounded-full shadow-[0_0_0_4px_var(--dash-canvas)]"></div>
                                <p className="text-sm font-medium text-dash-text">Preparation Started</p>
                                <p className="text-xs text-dash-text-muted">Shortly after</p>
                             </div>
                           )}
                           {selectedOrder.status === 'Completed' && (
                             <div className="relative">
                                <div className="absolute -left-6 w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_0_4px_var(--dash-canvas)]"></div>
                                <p className="text-sm font-medium text-dash-text">Delivered / Completed</p>
                                <p className="text-xs text-dash-text-muted">Task finished</p>
                             </div>
                           )}
                        </div>
                      </div>
                   </>
                 )}
              </div>
              
              <div className="p-4 border-t border-dash-border bg-dash-canvas/50">
                 <button 
                   onClick={() => { setSelectedBooking(null); setSelectedOrder(null); }}
                   className="w-full py-2.5 bg-dash-surface border border-dash-border rounded-lg text-sm font-medium text-dash-text hover:bg-dash-surface-hover transition-colors"
                 >
                   Close Details
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
