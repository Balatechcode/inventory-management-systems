import React, { useState } from 'react';
import {
  Settings,
  FileSpreadsheet,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Check,
  Ban,
  RotateCcw,
  Sparkles,
  Link2,
} from 'lucide-react';
import { UserRole } from '../../types/partyInventory';

interface PartySettingsViewProps {
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  isSyncing: boolean;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  onOpenSheetsModal: () => void;
  onManualSync: () => void;
  onResetDefaults: () => void;
}

export const PartySettingsView: React.FC<PartySettingsViewProps> = ({
  spreadsheetId,
  spreadsheetTitle,
  isSyncing,
  userRole,
  onChangeRole,
  onOpenSheetsModal,
  onManualSync,
  onResetDefaults,
}) => {
  const [resetConfirm, setResetConfirm] = useState(false);

  const permissions = [
    { name: 'View Inventory & Stock Quantities', admin: true, manager: true, staff: true },
    { name: 'Quick Stock IN & OUT adjustments', admin: true, manager: true, staff: true },
    { name: 'Log Sales & Local Walk-in Orders', admin: true, manager: true, staff: true },
    { name: 'Create & Edit Combo Products', admin: true, manager: true, staff: false },
    { name: 'Manage Local Bulk Order Reservations', admin: true, manager: true, staff: false },
    { name: 'Reallocate Stock Between Channels', admin: true, manager: true, staff: false },
    { name: 'Inward Purchases & Create POs', admin: true, manager: true, staff: false },
    { name: 'Add New Products & Delete SKUs', admin: true, manager: false, staff: false },
    { name: 'Configure Google Sheets Cloud Database', admin: true, manager: false, staff: false },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-zinc-500" />
          System Settings & Google Sheets Cloud Backend
        </h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Configure real-time Google Sheets sync, role permissions, and channel connections
        </p>
      </div>

      {/* Google Sheets Sync Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Google Sheets Database Sync
              </h3>
              <p className="text-xs text-zinc-400">
                Primary persistent store for party inventory and movement logs
              </p>
            </div>
          </div>

          <button
            onClick={onOpenSheetsModal}
            className="px-3.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl hover:bg-emerald-100 transition"
          >
            {spreadsheetId ? 'Change Spreadsheet' : 'Connect Spreadsheet'}
          </button>
        </div>

        {spreadsheetId ? (
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500">Connected Sheet Title:</span>
              <span className="font-bold text-zinc-900 dark:text-white">{spreadsheetTitle}</span>
            </div>
            <div className="flex items-center justify-between font-mono">
              <span className="text-zinc-500 font-sans">Spreadsheet ID:</span>
              <span className="text-zinc-400 truncate max-w-[280px]">{spreadsheetId}</span>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-zinc-200 dark:border-zinc-700">
              <a
                href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Open in Google Sheets</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <button
                onClick={onManualSync}
                disabled={isSyncing}
                className="px-3 py-1 font-semibold rounded-lg bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300">
            No Google Sheet connected. Local storage engine is active. Connect a Google Sheet to synchronize inventory across multiple devices.
          </div>
        )}
      </div>

      {/* Role-Based Access Control (RBAC) */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-zinc-900 dark:text-white">
                Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-zinc-400">
                Active permissions matrix for warehouse leads, inventory managers, and counter staff
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl text-xs">
            {(['ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map((r) => (
              <button
                key={r}
                onClick={() => onChangeRole(r)}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  userRole === r
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-2.5 px-3">System Permission</th>
                <th className="py-2.5 px-3 text-center text-purple-600">Admin</th>
                <th className="py-2.5 px-3 text-center text-blue-600">Manager</th>
                <th className="py-2.5 px-3 text-center text-emerald-600">Staff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-zinc-600 dark:text-zinc-400">
              {permissions.map((p, idx) => (
                <tr key={idx}>
                  <td className="py-2 px-3 font-medium text-zinc-800 dark:text-zinc-200">
                    {p.name}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {p.admin ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <Ban className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
                    {p.manager ? (
                      <Check className="w-4 h-4 text-emerald-600 mx-auto" />
                    ) : (
                      <Ban className="w-4 h-4 text-zinc-300 dark:text-zinc-600 mx-auto" />
                    )}
                  </td>
                  <td className="py-2 px-3 text-center">
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

      {/* Demo Reset */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex items-center justify-between">
        <div>
          <h4 className="font-bold text-sm text-zinc-900 dark:text-white">
            Demo Environment & Sample Data
          </h4>
          <p className="text-xs text-zinc-400">
            Reset all product variants, combos, and orders back to initial party decoration catalog
          </p>
        </div>

        {resetConfirm ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setResetConfirm(false)}
              className="px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onResetDefaults();
                setResetConfirm(false);
              }}
              className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-rose-600 text-white"
            >
              Confirm Reset
            </button>
          </div>
        ) : (
          <button
            onClick={() => setResetConfirm(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 transition"
          >
            Reset Catalog to Defaults
          </button>
        )}
      </div>
    </div>
  );
};
