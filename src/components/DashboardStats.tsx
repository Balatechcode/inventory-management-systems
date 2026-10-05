import React from 'react';
import { Package, DollarSign, AlertTriangle, ArrowUpDown, TrendingDown, CheckCircle2 } from 'lucide-react';
import { InventoryItem, LowStockAlert, StockMovement } from '../types/inventory';

interface DashboardStatsProps {
  items: InventoryItem[];
  alerts: LowStockAlert[];
  movements: StockMovement[];
  onFilterLowStock: () => void;
  onFilterAll: () => void;
  currentFilter: string;
}

export const DashboardStats: React.FC<DashboardStatsProps> = ({
  items,
  alerts,
  movements,
  onFilterLowStock,
  onFilterAll,
  currentFilter,
}) => {
  const totalItemsCount = items.length;
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValuation = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const criticalCount = alerts.filter((a) => a.severity === 'CRITICAL').length;
  const warningCount = alerts.filter((a) => a.severity === 'WARNING').length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayMovements = movements.filter((m) => m.timestamp.startsWith(todayStr));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Inventory Items Card */}
      <div
        onClick={onFilterAll}
        className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition cursor-pointer shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 ${
          currentFilter === 'ALL'
            ? 'border-emerald-500/50 dark:border-emerald-500/50 ring-1 ring-emerald-500/20'
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Inventory
          </span>
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
            <Package className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {totalItemsCount}{' '}
            <span className="text-xs font-normal text-zinc-500">Products</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            <span className="font-semibold text-zinc-700 dark:text-zinc-200">{totalUnits}</span> total units in stock
          </div>
        </div>
      </div>

      {/* Inventory Valuation Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Total Valuation
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Valued across {totalItemsCount} active SKUs</span>
          </div>
        </div>
      </div>

      {/* Low Stock Alerts Card (Clickable to filter) */}
      <div
        onClick={onFilterLowStock}
        className={`p-5 rounded-2xl bg-white dark:bg-zinc-900 border transition cursor-pointer shadow-xs hover:border-rose-300 dark:hover:border-rose-800 ${
          currentFilter === 'LOW_STOCK'
            ? 'border-rose-500 ring-2 ring-rose-500/20'
            : alerts.length > 0
            ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/10'
            : 'border-zinc-200 dark:border-zinc-800'
        }`}
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Low Stock Alerts
          </span>
          <div
            className={`p-2.5 rounded-xl ${
              alerts.length > 0
                ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                alerts.length > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-zinc-900 dark:text-white'
              }`}
            >
              {alerts.length}
            </span>
            <span className="text-xs text-zinc-500">items need reorder</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs">
            {criticalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold text-[11px]">
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[11px]">
                {warningCount} Warning
              </span>
            )}
            {alerts.length === 0 && (
              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> All stock healthy
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Movements & Activity Card */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
            Movement Log
          </span>
          <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
            <ArrowUpDown className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold text-zinc-900 dark:text-white">
            {movements.length}{' '}
            <span className="text-xs font-normal text-zinc-500">Total Logs</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-600 dark:text-purple-400">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>{todayMovements.length} transactions recorded today</span>
          </div>
        </div>
      </div>
    </div>
  );
};
