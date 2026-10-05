import React, { useState } from 'react';
import {
  Boxes,
  RefreshCw,
  ExternalLink,
  Bell,
  ShieldCheck,
  LogOut,
  ChevronDown,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserProfile, UserRole, LowStockAlert } from '../types/inventory';

interface NavbarProps {
  user: UserProfile | null;
  spreadsheetId: string | null;
  spreadsheetTitle: string;
  isSyncing: boolean;
  lastSynced: Date | null;
  alerts: LowStockAlert[];
  onManualSync: () => void;
  onOpenNotifications: () => void;
  onOpenSpreadsheetSettings: () => void;
  onOpenRoleMatrix: () => void;
  onChangeRole: (role: UserRole) => void;
  onLogin: () => void;
  onLogout: () => void;
  activeTab: 'inventory' | 'movements' | 'analytics';
  setActiveTab: (tab: 'inventory' | 'movements' | 'analytics') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  spreadsheetId,
  spreadsheetTitle,
  isSyncing,
  lastSynced,
  alerts,
  onManualSync,
  onOpenNotifications,
  onOpenSpreadsheetSettings,
  onOpenRoleMatrix,
  onChangeRole,
  onLogin,
  onLogout,
  activeTab,
  setActiveTab,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never';
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 10) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'MANAGER':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'STAFF':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Main Branding */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-zinc-900 dark:text-white">
                    StockFlow
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    Sheets Sync
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 hidden sm:block">
                  Live Cloud Inventory Engine
                </p>
              </div>
            </div>

            {/* Navigation tabs */}
            <nav className="hidden md:flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'inventory'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'movements'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Stock Movements
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                  activeTab === 'analytics'
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                Insights
              </button>
            </nav>
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Google Sheets Connection Pill */}
            {spreadsheetId ? (
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-xs">
                <span className="flex h-2 w-2 relative">
                  <span
                    className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                      isSyncing ? 'bg-amber-400' : 'bg-emerald-400'
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isSyncing ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  ></span>
                </span>
                <button
                  onClick={onOpenSpreadsheetSettings}
                  className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline max-w-[140px] truncate text-left"
                  title={spreadsheetTitle}
                >
                  {spreadsheetTitle}
                </button>
                <a
                  href={`https://docs.google.com/spreadsheets/d/${spreadsheetId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  title="Open live Google Sheet in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ) : (
              <button
                onClick={onOpenSpreadsheetSettings}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Connect Sheet
              </button>
            )}

            {/* Manual Sync Button */}
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title={`Last synced: ${formatLastSync(lastSynced)}`}
              className="p-2 sm:px-3 sm:py-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
            >
              <RefreshCw
                className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 ${
                  isSyncing ? 'animate-spin text-emerald-600' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {isSyncing ? 'Syncing...' : formatLastSync(lastSynced)}
              </span>
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={onOpenNotifications}
              className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
              title="Low Stock Alerts"
            >
              <Bell className="w-5 h-5" />
              {alerts.length > 0 && (
                <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse shadow-xs">
                  {alerts.length}
                </span>
              )}
            </button>

            {/* Role Switcher Pill */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg border transition ${getRoleBadge(
                    user.role
                  )}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{user.role}</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showRoleDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in">
                    <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                      Switch Role (RBAC)
                    </div>
                    {(['ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          onChangeRole(r);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-left transition ${
                          user.role === r
                            ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                            : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              r === 'ADMIN'
                                ? 'bg-purple-500'
                                : r === 'MANAGER'
                                ? 'bg-blue-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                          <span>{r}</span>
                        </div>
                        {user.role === r && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                      </button>
                    ))}
                    <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
                    <button
                      onClick={() => {
                        setShowRoleDropdown(false);
                        onOpenRoleMatrix();
                      }}
                      className="w-full px-3 py-1.5 text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200 text-left flex items-center gap-1.5"
                    >
                      <Layers className="w-3 h-3" />
                      View Role Permissions Matrix
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* User Profile / Google Sign-In */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                      {user.displayName?.[0] || 'U'}
                    </div>
                  )}
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in">
                    <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                      <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                        {user.displayName}
                      </p>
                      <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenSpreadsheetSettings();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      Spreadsheet Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-zinc-800 dark:text-zinc-100 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition shadow-2xs"
              >
                <svg className="w-4 h-4" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  ></path>
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  ></path>
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  ></path>
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  ></path>
                </svg>
                <span>Sign in with Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Sub-Navigation */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-zinc-100 dark:border-zinc-800 text-xs">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3 py-1 font-medium rounded-lg ${
              activeTab === 'inventory'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Inventory
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1 font-medium rounded-lg ${
              activeTab === 'movements'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Movements Log
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1 font-medium rounded-lg ${
              activeTab === 'analytics'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 font-semibold'
                : 'text-zinc-600 dark:text-zinc-400'
            }`}
          >
            Insights
          </button>
        </div>
      </div>
    </header>
  );
};
