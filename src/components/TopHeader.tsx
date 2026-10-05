import React, { useState } from 'react';
import {
  Menu,
  Search,
  PlusCircle,
  Bell,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  LogOut,
  Layers,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/partyInventory';

interface TopHeaderProps {
  onToggleMobileNav: () => void;
  user: UserProfile | null;
  spreadsheetId: string | null;
  isSyncing: boolean;
  lastSynced: Date | null;
  lowStockCount: number;
  onManualSync: () => void;
  onOpenQuickAdjustment: () => void;
  onOpenNotifications: () => void;
  onOpenSheetsSettings: () => void;
  onChangeRole: (role: UserRole) => void;
  onLogin: () => void;
  onLogout: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (query: string) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onToggleMobileNav,
  user,
  spreadsheetId,
  isSyncing,
  lastSynced,
  lowStockCount,
  onManualSync,
  onOpenQuickAdjustment,
  onOpenNotifications,
  onOpenSheetsSettings,
  onChangeRole,
  onLogin,
  onLogout,
  globalSearchQuery,
  setGlobalSearchQuery,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Not synced';
    const sec = Math.floor((Date.now() - date.getTime()) / 1000);
    if (sec < 10) return 'Just now';
    if (sec < 60) return `${sec}s ago`;
    return `${Math.floor(sec / 60)}m ago`;
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Mobile Toggle & Global Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          onClick={onToggleMobileNav}
          className="lg:hidden p-2 rounded-xl text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search party items, SKUs (e.g. BAL-GOLD-10, COM-BDAY), combos, orders..."
            value={globalSearchQuery}
            onChange={(e) => setGlobalSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition"
          />
          {globalSearchQuery && (
            <button
              onClick={() => setGlobalSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 hover:text-zinc-600"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Right: Quick Adjust, Sheets Sync, Alerts, Role, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Stock Adjust Button */}
        <button
          onClick={onOpenQuickAdjustment}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Quick Adjust</span>
        </button>

        {/* Google Sheets Sync Pill */}
        {spreadsheetId ? (
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs">
            <span className="flex h-2 w-2 relative">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSyncing ? 'bg-amber-400' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSyncing ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
              />
            </span>
            <button
              onClick={onOpenSheetsSettings}
              className="font-medium text-zinc-700 dark:text-zinc-300 hover:underline text-left max-w-[120px] truncate"
            >
              Sheets Sync
            </button>
            <button
              onClick={onManualSync}
              disabled={isSyncing}
              title={`Last synced: ${formatLastSync(lastSynced)}`}
              className="p-1 text-zinc-400 hover:text-emerald-500"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenSheetsSettings}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-300 rounded-xl border border-amber-200 dark:border-amber-800 hover:bg-amber-100 transition"
          >
            Connect Sheets
          </button>
        )}

        {/* Low Stock Notification Bell */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition"
          title="Stock Alerts"
        >
          <Bell className="w-5 h-5" />
          {lowStockCount > 0 && (
            <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-600 rounded-full animate-pulse shadow-xs">
              {lowStockCount}
            </span>
          )}
        </button>

        {/* Role Switcher Pill */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>{user.role}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-1.5 z-50 animate-in fade-in">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                  Switch Active Role
                </div>
                {(['ADMIN', 'MANAGER', 'STAFF'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      onChangeRole(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-1.5 text-xs text-left ${
                      user.role === r
                        ? 'bg-zinc-100 dark:bg-zinc-800 font-bold text-zinc-900 dark:text-white'
                        : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                    }`}
                  >
                    <span>{r}</span>
                    {user.role === r && <span className="w-2 h-2 rounded-full bg-rose-600"></span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* User Account / Google Sign-in */}
        {user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName}
                  className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-700"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">
                  {user.displayName?.[0] || 'U'}
                </div>
              )}
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-zinc-200 dark:border-zinc-800 py-2 z-50 animate-in fade-in">
                <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-800">
                  <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {user.displayName}
                  </p>
                  <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                </div>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onOpenSheetsSettings();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Google Sheets Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserDropdown(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={onLogin}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs"
          >
            <span>Sign In</span>
          </button>
        )}
      </div>
    </header>
  );
};
