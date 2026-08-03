import React, { useEffect, useState, useCallback } from "react";
import { Plus, Edit2, Trash2, RefreshCw, Users, Mail, Bell, Shield, UserCog } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";

interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  receive_handoff_alerts: boolean;
  last_login: string | null;
}

export function StaffTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  const fetchStaff = useCallback(async () => {
    if (!hotelId) return;
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("users")
        .select("id, full_name, email, role, status, receive_handoff_alerts, last_login")
        .eq("hotel_id", hotelId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setStaff(data as StaffMember[]);
    } catch (err) {
      console.error("Failed to fetch staff:", err);
    } finally {
      setLoading(false);
    }
  }, [hotelId]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const toggleAlerts = async (staffId: string, currentStatus: boolean) => {
    if (isReadOnly || !hotelId) return;
    
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, receive_handoff_alerts: !currentStatus } : s));
    
    try {
      const { error } = await supabase
        .from("users")
        .update({ receive_handoff_alerts: !currentStatus })
        .eq("id", staffId)
        .eq("hotel_id", hotelId);
        
      if (error) throw error;
    } catch (err) {
      console.error("Failed to update alert settings:", err);
      fetchStaff(); // Revert
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
          <p className="text-dash-text-sec mt-1">Manage hotel staff who can access the Hub and receive handoff alerts.</p>
        </div>
        {!isReadOnly && (
          <button 
            onClick={() => alert("Invite staff modal would open here. This will integrate with Supabase Admin Auth.")}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors"
          >
            <Plus className="w-4 h-4" /> Invite Staff
          </button>
        )}
      </div>

      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm">
        <div className="p-4 border-b border-dash-border bg-dash-canvas/50 flex items-center justify-between">
          <div className="flex items-center gap-2 text-dash-text-sec text-xs font-medium">
            <Users className="w-4 h-4" /> 
            <span>{staff.length} Active Members</span>
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
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Role & Access</th>
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
                        <Shield className="w-3.5 h-3.5 opacity-70" />
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
                      {!isReadOnly ? (
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-1.5 text-dash-text-muted hover:text-[#EA6639] hover:bg-dash-surface-hover rounded transition-colors" title="Edit Permissions">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" title="Deactivate Access">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-dash-text-muted">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
