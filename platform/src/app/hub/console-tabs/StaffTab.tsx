import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Plus, Trash2, RefreshCw, Users, Mail, Bell, Shield, UserCog, X, Check, Loader2, Phone, Clock, Briefcase, Filter, Search, Edit3 } from "lucide-react";
import { supabase } from "../../../lib/supabase";
import { useAuth } from "../../../context/AuthContext";
import { useSandbox } from "../../../context/SandboxDataContext";
import { useToast } from "../../../shared/ToastContext";

export type DepartmentType = "management" | "front_desk" | "concierge" | "housekeeping" | "maintenance" | "fnb";
export type ShiftType = "morning" | "afternoon" | "night" | "flexible";
export type DutyStatusType = "on_duty" | "off_duty" | "break";

interface StaffMember {
  id: string;
  full_name: string | null;
  email: string;
  role: string;
  status: string;
  receive_handoff_alerts: boolean;
  last_login?: string | null;
  online_status?: boolean | null;
  department?: DepartmentType | null;
  shift?: ShiftType | null;
  duty_status?: DutyStatusType | null;
  mobile_number?: string | null;
}

const DEPARTMENT_LABELS: Record<string, string> = {
  management: "Management",
  front_desk: "Front Desk",
  concierge: "Concierge",
  housekeeping: "Housekeeping",
  maintenance: "Maintenance",
  fnb: "F&B Dining",
};

const SHIFT_LABELS: Record<string, string> = {
  morning: "Morning (07:00 - 15:30)",
  afternoon: "Afternoon (15:00 - 23:30)",
  night: "Night (23:00 - 07:30)",
  flexible: "Flexible / On-Call",
};

export function StaffTab({ role }: { role?: string }) {
  const { hotelId } = useAuth();
  const { isSandbox, data: sandboxData, updateData, regenerate } = useSandbox();
  const { showToast } = useToast();

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [dutyFilter, setDutyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Invite Modal
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    full_name: "",
    email: "",
    role: "hotel_receptionist",
    department: "front_desk",
    shift: "morning",
    mobile_number: "",
  });
  const [inviting, setInviting] = useState(false);

  // Edit Staff Modal
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editForm, setEditForm] = useState({
    department: "",
    shift: "",
    duty_status: "off_duty",
    mobile_number: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

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
        .select("id, full_name, email, role, status, receive_handoff_alerts, last_login, online_status, department, shift, duty_status, mobile_number")
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

      // Log to audit_log
      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Staff",
        detail: { staff_id: staffId, receive_handoff_alerts: !currentStatus }
      });

      showToast(!currentStatus ? "Handoff alerts enabled" : "Handoff alerts muted", "info");
    } catch (err) {
      console.error("Failed to update alert settings:", err);
      fetchStaff(); // Revert
      showToast("Failed to update alert settings", "error");
    }
  };

  const handleCycleDutyStatus = async (staffMember: StaffMember) => {
    if (isReadOnly || !hotelId) return;
    const current = staffMember.duty_status || "off_duty";
    const next: DutyStatusType = current === "off_duty" ? "on_duty" : current === "on_duty" ? "break" : "off_duty";

    // Optimistic UI update
    setStaff(prev => prev.map(s => s.id === staffMember.id ? { ...s, duty_status: next } : s));

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        staff: (prev.staff || []).map(s => s.id === staffMember.id ? { ...s, duty_status: next } : s)
      }));
      showToast(`${staffMember.full_name || staffMember.email} duty status changed to ${next.replace("_", " ").toUpperCase()}`, "info");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({ duty_status: next })
        .eq("id", staffMember.id)
        .eq("hotel_id", hotelId);
      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Staff",
        detail: { staff_id: staffMember.id, duty_status: next }
      });

      showToast(`${staffMember.full_name || staffMember.email} marked ${next.replace("_", " ").toUpperCase()}`, "info");
    } catch (err: any) {
      console.error("Failed to update duty status:", err);
      fetchStaff();
      showToast("Failed to update duty status", "error");
    }
  };

  const openEditModal = (member: StaffMember) => {
    setEditingStaff(member);
    setEditForm({
      department: member.department || "",
      shift: member.shift || "",
      duty_status: member.duty_status || "off_duty",
      mobile_number: member.mobile_number || "",
    });
  };

  const handleSaveStaffAssignments = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff || !hotelId) return;
    setSavingEdit(true);

    const updatedDept = (editForm.department as DepartmentType) || null;
    const updatedShift = (editForm.shift as ShiftType) || null;
    const updatedDuty = (editForm.duty_status as DutyStatusType) || null;
    const updatedMobile = editForm.mobile_number.trim() || null;

    if (isSandbox) {
      updateData(prev => ({
        ...prev,
        staff: (prev.staff || []).map(s => s.id === editingStaff.id ? {
          ...s,
          department: updatedDept || undefined,
          shift: updatedShift || undefined,
          duty_status: updatedDuty || undefined,
          mobile_number: updatedMobile || undefined,
        } : s)
      }));
      setStaff(prev => prev.map(s => s.id === editingStaff.id ? {
        ...s,
        department: updatedDept,
        shift: updatedShift,
        duty_status: updatedDuty,
        mobile_number: updatedMobile,
      } : s));
      setEditingStaff(null);
      setSavingEdit(false);
      showToast("Staff assignments updated", "success");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          department: updatedDept,
          shift: updatedShift,
          duty_status: updatedDuty,
          mobile_number: updatedMobile,
        })
        .eq("id", editingStaff.id)
        .eq("hotel_id", hotelId);

      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "UPDATE",
        resource: "Staff",
        detail: {
          staff_id: editingStaff.id,
          department: updatedDept,
          shift: updatedShift,
          duty_status: updatedDuty,
        }
      });

      setStaff(prev => prev.map(s => s.id === editingStaff.id ? {
        ...s,
        department: updatedDept,
        shift: updatedShift,
        duty_status: updatedDuty,
        mobile_number: updatedMobile,
      } : s));
      setEditingStaff(null);
      showToast("Staff assignments saved to database", "success");
    } catch (err: any) {
      showToast(err.message || "Failed to update staff assignments", "error");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleInviteStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !hotelId) return;
    setInviting(true);

    const cleanName = inviteForm.full_name.trim();
    const cleanEmail = inviteForm.email.toLowerCase().trim();
    const dept = (inviteForm.department as DepartmentType) || null;
    const shift = (inviteForm.shift as ShiftType) || null;
    const mobile = inviteForm.mobile_number.trim() || null;

    if (isSandbox) {
      const newMember: StaffMember = {
        id: crypto.randomUUID(),
        full_name: cleanName,
        email: cleanEmail,
        role: inviteForm.role,
        department: dept,
        shift: shift,
        duty_status: "off_duty",
        status: "active",
        receive_handoff_alerts: true,
        last_login: new Date().toISOString(),
        mobile_number: mobile,
      };

      setTimeout(() => {
        updateData(prev => ({
          ...prev,
          staff: [...(prev.staff || []), { ...newMember, created_at: new Date().toISOString() }]
        }));
        setStaff(prev => [...prev, newMember]);
        setShowInviteModal(false);
        setInviteForm({ full_name: "", email: "", role: "hotel_receptionist", department: "front_desk", shift: "morning", mobile_number: "" });
        setInviting(false);
        showToast(`Invited ${cleanName} to hotel workspace`, "success");
      }, 400);
      return;
    }

    try {
      const { data, error } = await supabase.from("users").insert({
        hotel_id: hotelId,
        full_name: cleanName,
        email: cleanEmail,
        role: inviteForm.role,
        department: dept,
        shift: shift,
        duty_status: "off_duty",
        status: "active",
        receive_handoff_alerts: true,
        mobile_number: mobile,
      }).select().single();

      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "CREATE",
        resource: "Staff",
        detail: { email: cleanEmail, role: inviteForm.role, department: dept, shift }
      });

      if (data) setStaff(prev => [...prev, data as StaffMember]);
      setShowInviteModal(false);
      setInviteForm({ full_name: "", email: "", role: "hotel_receptionist", department: "front_desk", shift: "morning", mobile_number: "" });
      showToast(`Invited ${cleanName} successfully`, "success");
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
        staff: (prev.staff || []).filter(s => s.id !== staffId)
      }));
      setStaff(prev => prev.filter(s => s.id !== staffId));
      showToast(`Removed ${name} from hotel workspace`, "info");
      return;
    }

    try {
      const { error } = await supabase.from("users").delete().eq("id", staffId).eq("hotel_id", hotelId);
      if (error) throw error;

      const { data: authData } = await supabase.auth.getUser();
      await supabase.from("audit_log").insert({
        hotel_id: hotelId,
        actor_id: authData.user?.id || null,
        action: "DELETE",
        resource: "Staff",
        detail: { staff_id: staffId, name }
      });

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

  // Metrics
  const metrics = useMemo(() => {
    const total = staff.length;
    const onDuty = staff.filter(s => s.duty_status === "on_duty").length;
    const onBreak = staff.filter(s => s.duty_status === "break").length;
    const offDuty = staff.filter(s => !s.duty_status || s.duty_status === "off_duty").length;
    return { total, onDuty, onBreak, offDuty };
  }, [staff]);

  // Filtered List
  const filteredStaff = useMemo(() => {
    return staff.filter(member => {
      // Department filter
      if (departmentFilter !== "all") {
        if ((member.department || "unassigned") !== departmentFilter) return false;
      }

      // Duty filter
      if (dutyFilter !== "all") {
        const duty = member.duty_status || "off_duty";
        if (duty !== dutyFilter) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (member.full_name || "").toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        const matchesDept = (member.department || "").toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept) return false;
      }

      return true;
    });
  }, [staff, departmentFilter, dutyFilter, searchQuery]);

  return (
    <div className="p-4 md:p-6 h-full flex flex-col">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Staff &amp; Operations Roster</h2>
          <p className="text-dash-text-sec mt-1">Manage departmental assignments, operational shifts, real-time duty statuses, and guest handoff alerts.</p>
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
              className="flex items-center gap-2 px-3.5 py-1.5 bg-[#EA6639] text-white rounded-md text-xs font-medium hover:bg-[#EA6639]/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" /> Invite Team Member
            </button>
          )}
        </div>
      </div>

      {/* ── Live Duty & Department Metrics ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-dash-surface p-3.5 rounded-xl border border-dash-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-dash-text-muted">Total Roster</div>
            <div className="text-lg font-bold text-dash-text mt-0.5">{metrics.total}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-dash-surface-raised border border-dash-border flex items-center justify-center text-dash-text-sec">
            <Users className="w-4 h-4" />
          </div>
        </div>

        <div className="bg-dash-surface p-3.5 rounded-xl border border-dash-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-dash-text-muted">Currently On Duty</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{metrics.onDuty}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 flex items-center justify-center text-emerald-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
        </div>

        <div className="bg-dash-surface p-3.5 rounded-xl border border-dash-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-dash-text-muted">On Break</div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-0.5">{metrics.onBreak}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 border border-amber-200/60 dark:border-amber-500/20 flex items-center justify-center text-amber-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          </div>
        </div>

        <div className="bg-dash-surface p-3.5 rounded-xl border border-dash-border flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-dash-text-muted">Off Duty</div>
            <div className="text-lg font-bold text-dash-text-sec mt-0.5">{metrics.offDuty}</div>
          </div>
          <div className="w-8 h-8 rounded-lg bg-dash-canvas border border-dash-border flex items-center justify-center text-dash-text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
          </div>
        </div>
      </div>

      {/* ── Table Container ── */}
      <div className="bg-dash-surface rounded-xl border border-dash-border flex-1 flex flex-col overflow-hidden shadow-sm">
        
        {/* Table Controls Bar */}
        <div className="p-3.5 border-b border-dash-border bg-dash-canvas/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Department Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto hide-scrollbar pb-1 md:pb-0">
            <button
              onClick={() => setDepartmentFilter("all")}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                departmentFilter === "all"
                  ? "bg-[#EA6639] text-white shadow-sm"
                  : "bg-dash-surface text-dash-text-sec hover:bg-dash-surface-hover border border-dash-border"
              }`}
            >
              All Departments ({staff.length})
            </button>
            {Object.entries(DEPARTMENT_LABELS).map(([key, label]) => {
              const count = staff.filter(s => s.department === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setDepartmentFilter(key)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
                    departmentFilter === key
                      ? "bg-[#EA6639] text-white shadow-sm"
                      : "bg-dash-surface text-dash-text-sec hover:bg-dash-surface-hover border border-dash-border"
                  }`}
                >
                  {label} {count > 0 && <span className="opacity-80 font-normal">({count})</span>}
                </button>
              );
            })}
          </div>

          {/* Search & Duty Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-56">
              <Search className="w-3.5 h-3.5 text-dash-text-muted absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search staff by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1 bg-dash-surface border border-dash-border rounded-md text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
              />
            </div>

            <select
              value={dutyFilter}
              onChange={e => setDutyFilter(e.target.value)}
              className="px-2.5 py-1 bg-dash-surface border border-dash-border rounded-md text-xs text-dash-text focus:outline-none focus:ring-1 focus:ring-[#EA6639]"
            >
              <option value="all">All Duty Statuses</option>
              <option value="on_duty">On Duty</option>
              <option value="break">On Break</option>
              <option value="off_duty">Off Duty</option>
            </select>
          </div>
        </div>

        {/* Table Body */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-dash-text-sec gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-[#EA6639]" />
              <span className="text-xs">Loading operational roster...</span>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-dash-text-sec">
              <UserCog className="w-10 h-10 mb-3 opacity-30 text-dash-text" />
              <p className="text-sm font-medium text-dash-text mb-1">
                {staff.length === 0 ? "No staff members registered" : "No staff match your filters"}
              </p>
              <p className="text-xs text-dash-text-muted max-w-sm text-center">
                {staff.length === 0 
                  ? "Invite your hotel front desk, concierge, and management team to access the console." 
                  : "Try selecting another department or clearing your search term."}
              </p>
            </div>
          ) : (
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-dash-surface border-b border-dash-border sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Staff Member</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Department &amp; Shift</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Role &amp; Permissions</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Real-Time Duty</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text">Handoff Alerts</th>
                  <th className="px-5 py-3.5 font-semibold text-dash-text text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dash-border-hairline">
                {filteredStaff.map((member) => {
                  const duty = member.duty_status || "off_duty";
                  return (
                    <tr key={member.id} className="hover:bg-dash-surface-hover/60 transition-colors group">
                      {/* Staff Member */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#EA6639]/10 border border-[#EA6639]/20 flex items-center justify-center text-[#EA6639] font-bold text-xs shrink-0 relative">
                            {(member.full_name || member.email)[0].toUpperCase()}
                            <span 
                              className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-dash-surface ${
                                member.online_status ? "bg-emerald-500 shadow-xs shadow-emerald-500/50" : "bg-zinc-400"
                              }`}
                              title={member.online_status ? "Online Now" : "Offline"}
                            />
                          </div>
                          <div>
                            <div className="font-medium text-dash-text flex items-center gap-2">
                              <span>{member.full_name || "Unassigned"}</span>
                              {member.online_status && (
                                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  Online
                                </span>
                              )}
                            </div>
                            <div className="text-dash-text-muted text-[10px] flex items-center gap-2 mt-0.5 flex-wrap">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {member.email}</span>
                              {member.mobile_number && (
                                <span className="flex items-center gap-1"><Phone className="w-2.5 h-2.5" /> {member.mobile_number}</span>
                              )}
                              {member.last_login && (
                                <span className="text-dash-text-muted/70 text-[9px]">
                                  • Active {new Date(member.last_login).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Department & Shift */}
                      <td className="px-5 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <Briefcase className="w-3 h-3 text-[#EA6639] shrink-0" />
                            <span className="font-medium text-dash-text">
                              {member.department ? DEPARTMENT_LABELS[member.department] || member.department : <span className="text-dash-text-muted italic">Unassigned</span>}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px] text-dash-text-muted">
                            <Clock className="w-3 h-3 opacity-60" />
                            <span>
                              {member.shift ? (SHIFT_LABELS[member.shift] || member.shift) : <span className="italic">No shift scheduled</span>}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role & Access */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 text-dash-text-sec">
                          <Shield className="w-3.5 h-3.5 opacity-70 text-[#EA6639]" />
                          <span className="font-medium">{formatRole(member.role)}</span>
                        </div>
                      </td>

                      {/* Real-Time Duty Status */}
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleCycleDutyStatus(member)}
                          disabled={isReadOnly}
                          title={isReadOnly ? "Read-only access" : "Click to toggle duty status (On Duty / Break / Off Duty)"}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold tracking-wide transition-colors ${
                            duty === "on_duty"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
                              : duty === "break"
                              ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                              : "bg-dash-surface-raised text-dash-text-muted border-dash-border"
                          } ${isReadOnly ? 'cursor-default' : 'cursor-pointer hover:opacity-80 shadow-xs'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            duty === "on_duty" ? "bg-emerald-500 animate-pulse" : duty === "break" ? "bg-amber-500" : "bg-slate-400"
                          }`} />
                          {duty === "on_duty" ? "ON DUTY" : duty === "break" ? "ON BREAK" : "OFF DUTY"}
                        </button>
                      </td>

                      {/* Handoff Alerts */}
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

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        {!isReadOnly && (
                          <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => openEditModal(member)}
                              className="p-1.5 text-dash-text-muted hover:text-dash-text hover:bg-dash-surface-raised rounded transition-colors" 
                              title="Edit Assignments"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeactivate(member.id, member.full_name || member.email)}
                              className="p-1.5 text-dash-text-muted hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded transition-colors" 
                              title="Deactivate Member"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
                <label className="block text-xs font-medium text-dash-text mb-1.5">Full Name <span className="text-[#EA6639]">*</span></label>
                <input 
                  required 
                  type="text" 
                  placeholder="Full name" 
                  value={inviteForm.full_name} 
                  onChange={(e) => setInviteForm({ ...inviteForm, full_name: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Email Address <span className="text-[#EA6639]">*</span></label>
                <input 
                  required 
                  type="email" 
                  placeholder="staff@hotel.com" 
                  value={inviteForm.email} 
                  onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Role &amp; Console Permissions</label>
                <select 
                  value={inviteForm.role} 
                  onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                >
                  <option value="hotel_manager">Manager (Full Console Access &amp; Settings)</option>
                  <option value="hotel_receptionist">Receptionist (Live Inbox, Bookings, Orders)</option>
                  <option value="hotel_readonly">Read-Only (View Analytics &amp; Dashboard)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Department</label>
                  <select 
                    value={inviteForm.department} 
                    onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="front_desk">Front Desk</option>
                    <option value="concierge">Concierge</option>
                    <option value="housekeeping">Housekeeping</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="fnb">F&amp;B Dining</option>
                    <option value="management">Management</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-dash-text mb-1.5">Initial Shift</label>
                  <select 
                    value={inviteForm.shift} 
                    onChange={(e) => setInviteForm({ ...inviteForm, shift: e.target.value })} 
                    className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                  >
                    <option value="morning">Morning (07:00 - 15:30)</option>
                    <option value="afternoon">Afternoon (15:00 - 23:30)</option>
                    <option value="night">Night (23:00 - 07:30)</option>
                    <option value="flexible">Flexible / On-Call</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Mobile Phone (SMS &amp; WhatsApp Handoffs)</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={inviteForm.mobile_number} 
                  onChange={(e) => setInviteForm({ ...inviteForm, mobile_number: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" 
                />
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

      {/* ── Edit Staff Assignments Modal ── */}
      {editingStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-dash-surface border border-dash-border rounded-xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-dash-border">
              <div>
                <h4 className="font-semibold text-dash-text">Edit Staff Assignments</h4>
                <p className="text-[11px] text-dash-text-muted mt-0.5">{editingStaff.full_name || editingStaff.email}</p>
              </div>
              <button onClick={() => setEditingStaff(null)} className="text-dash-text-muted hover:text-dash-text transition-colors rounded p-1 hover:bg-dash-surface-hover">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveStaffAssignments} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Department Assignment</label>
                <select 
                  value={editForm.department} 
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                >
                  <option value="">-- Unassigned --</option>
                  <option value="front_desk">Front Desk</option>
                  <option value="concierge">Concierge</option>
                  <option value="housekeeping">Housekeeping</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="fnb">F&amp;B Dining</option>
                  <option value="management">Management</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Scheduled Shift</label>
                <select 
                  value={editForm.shift} 
                  onChange={(e) => setEditForm({ ...editForm, shift: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                >
                  <option value="">-- No shift scheduled --</option>
                  <option value="morning">Morning (07:00 - 15:30)</option>
                  <option value="afternoon">Afternoon (15:00 - 23:30)</option>
                  <option value="night">Night (23:00 - 07:30)</option>
                  <option value="flexible">Flexible / On-Call</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Real-Time Duty Status</label>
                <select 
                  value={editForm.duty_status} 
                  onChange={(e) => setEditForm({ ...editForm, duty_status: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none"
                >
                  <option value="on_duty">On Duty</option>
                  <option value="break">On Break</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-dash-text mb-1.5">Mobile Phone (Alerts &amp; Escalations)</label>
                <input 
                  type="tel" 
                  placeholder="+1 (555) 000-0000" 
                  value={editForm.mobile_number} 
                  onChange={(e) => setEditForm({ ...editForm, mobile_number: e.target.value })} 
                  className="w-full px-3 py-2 bg-dash-canvas border border-dash-border rounded-lg text-xs text-dash-text focus:ring-1 focus:ring-[#EA6639] focus:outline-none" 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-dash-border">
                <button type="button" onClick={() => setEditingStaff(null)} className="flex-1 py-2 bg-dash-surface border border-dash-border text-dash-text rounded-lg text-xs font-medium hover:bg-dash-surface-hover transition-colors">Cancel</button>
                <button type="submit" disabled={savingEdit} className="flex-1 py-2 bg-[#EA6639] text-white rounded-lg text-xs font-medium hover:bg-[#EA6639]/90 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-70">
                  {savingEdit ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...</> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
