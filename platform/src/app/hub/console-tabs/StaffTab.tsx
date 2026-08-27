import React, { useEffect, useState, useCallback } from "react";
import { Plus, Trash2, RefreshCw, Users, Mail, Bell, Shield, UserCog, X, Check, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  receive_handoff_alerts: boolean;
  last_login?: string | null;
}

export function StaffTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ full_name: "", email: "", role: "hotel_receptionist" });
  const [inviting, setInviting] = useState(false);

  const isReadOnly =
    role === "hotel_receptionist" ||
    (role || "").toLowerCase().includes("receptionist") ||
    role === "hotel_readonly" ||
    (role || "").toLowerCase().includes("readonly");

  const fetchStaff = useCallback(async () => {
    if (!hotelId) return;

    if (isSandbox && sandboxData) {
      setStaff(sandboxData.staff as StaffMember[]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, receive_handoff_alerts, last_login")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setStaff((data || []) as StaffMember[]);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId, isSandbox, sandboxData]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleAlerts = async (staffId: string, currentStatus: boolean) => {
    if (isReadOnly || !hotelId) return;
    
    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        staff: prev.staff.map(s => s.id === staffId ? { ...s, receive_handoff_alerts: !currentStatus } : s)
      }));
      setStaff(prev => prev.map(s => s.id === staffId ? { ...s, receive_handoff_alerts: !currentStatus } : s));
      showToast(!currentStatus ? "Handoff alerts enabled" : "Handoff alerts muted", "info");
      return;
    }

    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, receive_handoff_alerts: !currentStatus } : s));
    try {
      const { error } = await supabase
        .from("users")
        .update({ receive_handoff_alerts: !currentStatus })
        .eq("id", staffId)
        .eq("hotel_id", hotelId);
        
      if (error) throw error;
      showToast(!currentStatus ? "Handoff alerts enabled" : "Handoff alerts muted", "info");
    } catch (err) {
      console.error("Failed to update alert settings:", err);
      fetchStaff(); // Revert
      showToast("Failed to update alert settings", "error");
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setInviting(true);

    if (isSandbox) {
      const newMember: StaffMember = {
        id: crypto.randomUUID(),
        full_name: inviteForm.full_name,
        email: inviteForm.email.toLowerCase(),
        role: inviteForm.role,
        status: "active",
        receive_handoff_alerts: true,
        last_login: new Date().toISOString()
      };

      setTimeout(() => {
        updateData(prev => ({
          ...prev,
          staff: [...prev.staff, { ...newMember, created_at: new Date().toISOString() }]
        }));
        setStaff(prev => [...prev, newMember]);
        setShowInviteModal(false);
        setInviteForm({ full_name: "", email: "", role: "hotel_receptionist" });
        setInviting(false);
        showToast(`Invited ${newMember.full_name} to hotel workspace`, "success");
      }, 500);
      return;
    }

    try {
      const { data, error } = await supabase.from("users").insert({
        hotel_id: hotelId,
        full_name: inviteForm.full_name,
        email: inviteForm.email.toLowerCase(),
        role: inviteForm.role,
        status: "active",
        receive_handoff_alerts: true
      }).select().single();

      if (error) throw error;
      if (data) setStaff(prev => [...prev, data as StaffMember]);
      setShowInviteModal(false);
      setInviteForm({ full_name: "", email: "", role: "hotel_receptionist" });
      showToast(`Invited ${inviteForm.full_name} successfully`, "success");
    } catch (err: any) {
      console.error(err);
      showToast(err.message || "Failed to invite staff", "error");
    } finally {
      setInviting(false);
    }
  };

  const handleDeactivate = async (staffId: string, name: string) => {
    if (isReadOnly || !hotelId) return;

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        staff: prev.staff.filter(s => s.id !== staffId)
      }));
      setStaff(prev => prev.filter(s => s.id !== staffId));
      showToast(`Removed ${name} from hotel workspace`, "info");
      return;
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", staffId).eq("hotel_id", hotelId);
      if (error) throw error;
      setStaff(prev => prev.filter(s => s.id !== staffId));
      showToast(`Removed ${name}`, "info");
    } catch (err: any) {
      showToast("Failed to remove staff member", "error");
    }
  };

  const formatRole = (dbRole: string) => {
    if (dbRole === 'hotel_manager') return 'Manager';
    if (dbRole === 'hotel_receptionist') return 'Receptionist';
    if (dbRole === 'hotel_readonly') return 'Read-Only';
    return dbRole.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Staff Management</h2>
          <p className="text-dash-text-sec mt-1">Manage team members who can access the hotel console and receive guest handoff alerts.</p>
        </div>
        <div className="flex gap-2">
          {isSandbox && (
            <button
              onClick={() => {
                regenerate();
                showToast("Staff roster reset to demo data", "success");
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-dash-surface border border-dash-border hover:bg-dash-surface-hover text-dash-text rounded-md text-xs font-medium transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset Demo Staff
            </button>
          )}
          {!isReadOnly && (
            <button 
              onClick={() => setShowInviteModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors"
            >
              <Plus className="w-4 h-4" /> Invite Staff
            </button>
          )}
        </div>
      </div>

      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-dash-border bg-dash-canvas/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dash-text-sec text-xs font-medium">
            <Users className="w-4 h-4 text-[#EA6639]" /> 
            <span>{staff.length} Active Team Members</span>
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-dash-text-sec gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
              <span className="text-xs">Loading staff members...</span>
            </div>
          ) : staff.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-dash-text-sec">
              <UserCog className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium text-dash-text mb-1">No staff found</p>
              <p className="text-xs">Invite your team members to collaborate.</p>
            </div>
          ) : (
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-dash-surface border-b border-dash-border sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Staff Member</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Role &amp; Access</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Handoff Alerts</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Status</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-dash-surface-hover/60 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center text-[#EA6639] font-bold text-xs shrink-0">
                          {(member.full_name || member.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="font-medium text-dash-text">{member.full_name || "Unknown"}</div>
                          <div className="text-dash-text-muted text-[10px] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3" /> {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-dash-text-sec">
                        <Shield className="w-3.5 h-3.5 opacity-70 text-[#EA6639]" />
                        <span className="font-medium">{formatRole(member.role)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => toggleAlerts(member.id, member.receive_handoff_alerts)}
                        disabled={isReadOnly}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold tracking-wide transition-colors ${
                          member.receive_handoff_alerts 
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10" 
                            : "bg-dash-surface-raised text-dash-text-muted border-dash-border"
                        } ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80'}`}
                      >
                        <Bell className="w-3 h-3" />
                        {member.receive_handoff_alerts ? "ENABLED" : "MUTED"}
                      </button>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></span>
                        <span className="text-dash-text-sec capitalize">{member.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      {!isReadOnly && (
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDeactivate(member.id, member.full_name || member.email)}
                            className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" 
                            title="Deactivate Access"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Invite Staff Modal ── */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <h4 className="font-semibold text-dash-text">Invite Team Member</h4>
              <button onClick={() => setShowInviteModal(false)} className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1 hover:bg-dash-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleInviteStaff} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Full Name</label>
                <input required type="text" placeholder="e.g. Elena Rostova" value={inviteForm.full_name} onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Email Address</label>
                <input required type="email" placeholder="e.g. elena@hotel.com" value={inviteForm.email} onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Role &amp; Permissions</label>
                <select value={inviteForm.role} onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none">
                  <option value="hotel_manager">Manager (Full Console Access &amp; Settings)</option>
                  <option value="hotel_receptionist">Receptionist (Live Inbox, Bookings, Orders)</option>
                  <option value="hotel_readonly">Read-Only (View Analytics &amp; Dashboard)</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4 border-t border-dash-border">
                <button type="button" onClick={() => setShowInviteModal(false)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={inviting} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70">
                  {inviting ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending...</> : "Send Invite"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
