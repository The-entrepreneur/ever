import React from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

export function StaffTab({ role }: { role?: string }) {
  const isReadOnly = role === "hotel_receptionist" || (role || "").toLowerCase().includes("receptionist") || role === "hotel_readonly" || (role || "").toLowerCase().includes("readonly");

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-header font-semibold text-dash-text">Staff Management</h2>
          <p className="text-dash-text-sec mt-1">Manage hotel staff who can access the User Panel and receive handoff alerts.</p>
        </div>
        {!isReadOnly && (
          <button className="flex items-center gap-2 px-3 py-1.5 bg-dash-green text-dash-green-text rounded-md text-xs font-medium hover:bg-dash-green-hover transition-colors">
            <Plus className="w-4 h-4" /> Add New Staff
          </button>
        )}
      </div>

      <div className="bg-dash-surface rounded-lg border border-dash-border flex-1 overflow-hidden">
        <table className="w-full text-xs text-left">
          <thead className="text-xs text-dash-text-sec bg-dash-canvas uppercase border-b border-dash-border">
            <tr>
              <th className="px-6 py-4 font-semibold">Name</th>
              <th className="px-6 py-4 font-semibold">Email</th>
              <th className="px-6 py-4 font-semibold">Role</th>
              <th className="px-6 py-4 font-semibold">Alerts</th>
              <th className="px-6 py-4 font-semibold">Status</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {[
              { name: "Alex Mercer", email: "alex@boutiquehotel.com", role: "Manager", alerts: true, status: "Active" },
              { name: "Jordan Lee", email: "jordan.l@boutiquehotel.com", role: "Receptionist", alerts: true, status: "Active" },
              { name: "Casey Smith", email: "casey@boutiquehotel.com", role: "Receptionist", alerts: false, status: "Inactive" },
            ].map((staff, i) => (
              <tr key={i} className="hover:bg-dash-surface-hover/50">
                <td className="px-6 py-4 font-medium text-dash-text">{staff.name}</td>
                <td className="px-6 py-4 text-dash-text-sec">{staff.email}</td>
                <td className="px-6 py-4 text-dash-text-sec">{staff.role}</td>
                <td className="px-6 py-4">
                  {staff.alerts ? (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700">Enabled</span>
                  ) : (
                    <span className="px-2 py-1 rounded text-xs font-medium bg-dash-surface-raised text-dash-text-sec">Disabled</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    staff.status === 'Active' ? 'bg-emerald-100 text-emerald-700  ' : 'bg-red-100 text-red-700  '
                  }`}>
                    {staff.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  {!isReadOnly ? (
                    <div className="flex justify-end gap-2">
                      <button className="p-1.5 text-dash-text-muted hover:text-dash-text transition-colors" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-dash-text-muted hover:text-red-500 transition-colors" title="Deactivate">
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
      </div>
    </div>
  );
}
