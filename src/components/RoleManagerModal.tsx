import React from 'react';
import { X, ShieldCheck, Check, Ban } from 'lucide-react';
import { UserRole } from '../types/inventory';

interface RoleManagerModalProps {
  isOpen: boolean;
  currentRole: UserRole;
  onClose: () => void;
  onSelectRole: (role: UserRole) => void;
}

export const RoleManagerModal: React.FC<RoleManagerModalProps> = ({
  isOpen,
  currentRole,
  onClose,
  onSelectRole,
}) => {
  if (!isOpen) return null;

  const permissions = [
    {
      feature: 'View Inventory & Stock Quantities',
      admin: true,
      manager: true,
      staff: true,
    },
    {
      feature: 'Receive Stock IN (Restock deliveries)',
      admin: true,
      manager: true,
      staff: true,
    },
    {
      feature: 'Dispatch Stock OUT (Orders/Damage)',
      admin: true,
      manager: true,
      staff: true,
    },
    {
      feature: 'Export Inventory & Movement CSV Reports',
      admin: true,
      manager: true,
      staff: true,
    },
    {
      feature: 'Add New Products / SKUs',
      admin: true,
      manager: true,
      staff: false,
    },
    {
      feature: 'Edit Product Details, Prices & Min Thresholds',
      admin: true,
      manager: true,
      staff: false,
    },
    {
      feature: 'Delete Items from Google Sheet (Permanent)',
      admin: true,
      manager: false,
      staff: false,
    },
    {
      feature: 'Configure / Switch Google Sheets Database',
      admin: true,
      manager: false,
      staff: false,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-100 dark:bg-purple-950/70 text-purple-600 dark:text-purple-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Enforces operational permissions across warehouse teams
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Quick Role Select Buttons */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              Active Role (Select to simulate):
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => onSelectRole(r)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    currentRole === r
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30 ring-2 ring-purple-500/20'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-zinc-900 dark:text-white">{r}</span>
                    {currentRole === r && (
                      <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    {r === 'ADMIN'
                      ? 'Full System Authority'
                      : r === 'MANAGER'
                      ? 'Inventory Operations'
                      : 'Stock Counter & Logistics'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Permissions Matrix Table */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Capability / Permission</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-purple-600">Admin</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-blue-600">Manager</th>
                  <th className="py-2.5 px-3 text-center font-semibold text-emerald-600">Staff</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
                {permissions.map((p, idx) => (
                  <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20">
                    <td className="py-2.5 px-3 text-zinc-800 dark:text-zinc-200 font-medium">
                      {p.feature}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.admin ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Ban className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.manager ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Ban className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {p.staff ? (
                        <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <Ban className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 rounded-xl hover:opacity-90 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
