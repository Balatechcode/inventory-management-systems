import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Sparkles,
  Boxes,
  Network,
  Radio,
  ShoppingBag,
  Truck,
  RotateCcw,
  Package,
  ArrowUpDown,
  TrendingDown,
  BarChart3,
  Settings,
  X,
  FileSpreadsheet,
  AlertTriangle,
  Receipt,
} from 'lucide-react';

export type NavScreen =
  | 'dashboard'
  | 'products'
  | 'combos'
  | 'inventory'
  | 'channels'
  | 'marketplaces'
  | 'orders'
  | 'bulk_orders'
  | 'purchases'
  | 'returns'
  | 'packaging'
  | 'movements'
  | 'forecast'
  | 'reports'
  | 'settings';

interface NavItem {
  id: NavScreen;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  badgeColor?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentScreen: NavScreen;
  setCurrentScreen: (screen: NavScreen) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  lowStockCount: number;
  bulkOrdersCount: number;
  combosCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentScreen,
  setCurrentScreen,
  isOpenMobile,
  setIsOpenMobile,
  lowStockCount,
  bulkOrdersCount,
  combosCount,
}) => {
  const navSections: NavSection[] = [
    {
      title: 'Core Operations',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'products', label: 'Products & Variants', icon: Layers },
        { id: 'combos', label: 'Combos & Bundles', icon: Sparkles, badge: combosCount },
        { id: 'inventory', label: 'Inventory Overview', icon: Boxes },
        { id: 'channels', label: 'Channel Stock', icon: Network },
        { id: 'marketplaces', label: 'Marketplace APIs & Feeds', icon: Radio },
      ],
    },
    {
      title: 'Sales & Bulk Orders',
      items: [
        { id: 'orders', label: 'Sales Orders', icon: ShoppingBag },
        {
          id: 'bulk_orders',
          label: 'Local Bulk Orders',
          icon: Truck,
          badge: bulkOrdersCount > 0 ? bulkOrdersCount : undefined,
          badgeColor: 'bg-blue-600',
        },
        { id: 'returns', label: 'Returns & Damaged', icon: RotateCcw },
      ],
    },
    {
      title: 'Supply & Warehouse',
      items: [
        { id: 'purchases', label: 'Purchases & Suppliers', icon: Receipt },
        { id: 'packaging', label: 'Packaging Materials', icon: Package },
        { id: 'movements', label: 'Stock Movements (Audit)', icon: ArrowUpDown },
        {
          id: 'forecast',
          label: 'Low Stock & Forecast',
          icon: TrendingDown,
          badge: lowStockCount > 0 ? lowStockCount : undefined,
          badgeColor: 'bg-rose-600',
        },
      ],
    },
    {
      title: 'Intelligence & Config',
      items: [
        { id: 'reports', label: 'Reports & Export', icon: BarChart3 },
        { id: 'settings', label: 'Settings & Sheets Sync', icon: Settings },
      ],
    },
  ];

  const handleSelect = (id: NavScreen) => {
    setCurrentScreen(id);
    setIsOpenMobile(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden backdrop-blur-xs"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-zinc-900 border-r border-zinc-800 text-zinc-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-500 via-amber-500 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-base tracking-tight">StockFlow</span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                  Party Decor
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Multi-Channel Inventory</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpenMobile(false)}
            className="lg:hidden p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Channels Pill Strip */}
        <div className="px-4 py-2.5 bg-zinc-950/30 border-b border-zinc-800/80 text-[11px] flex items-center justify-between text-zinc-400">
          <span>Active Channels:</span>
          <div className="flex items-center gap-1 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-semibold">AMZ</span>
            <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-semibold">FK</span>
            <span className="px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300 font-semibold">MSH</span>
            <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold">LOC</span>
          </div>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 text-xs">
          {navSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">
                {sec.title}
              </div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentScreen === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id as NavScreen)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition ${
                      isActive
                        ? 'bg-rose-600 text-white font-semibold shadow-sm shadow-rose-600/30'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold text-white ${
                          item.badgeColor || 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Footer Sheet Sync Indicator */}
        <div className="p-3 border-t border-zinc-800/80 bg-zinc-950/40 text-[11px]">
          <div className="flex items-center gap-2 text-zinc-400">
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span className="truncate">Google Sheets Backend</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-0.5">Two-way variant & combo sync</p>
        </div>
      </aside>
    </>
  );
};
