import React from 'react';
import {
  PieChart,
  TrendingUp,
  BarChart3,
  DollarSign,
  PackageCheck,
  AlertCircle,
} from 'lucide-react';
import { InventoryItem, StockMovement } from '../types/inventory';

interface AnalyticsViewProps {
  items: InventoryItem[];
  movements: StockMovement[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ items, movements }) => {
  // Category breakdown
  const categoryMap: Record<string, { count: number; totalVal: number; units: number }> = {};
  items.forEach((item) => {
    const cat = item.category || 'General';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { count: 0, totalVal: 0, units: 0 };
    }
    categoryMap[cat].count += 1;
    categoryMap[cat].totalVal += item.quantity * item.unitPrice;
    categoryMap[cat].units += item.quantity;
  });

  const categories = Object.entries(categoryMap).sort((a, b) => b[1].totalVal - a[1].totalVal);

  const totalValuation = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  // Top 5 highest valued SKUs
  const topValuedItems = [...items]
    .sort((a, b) => b.quantity * b.unitPrice - a.quantity * a.unitPrice)
    .slice(0, 5);

  // Inflow vs Outflow volume
  const totalInflow = movements
    .filter((m) => m.type === 'IN')
    .reduce((sum, m) => sum + m.quantityChanged, 0);

  const totalOutflow = movements
    .filter((m) => m.type === 'OUT')
    .reduce((sum, m) => sum + m.quantityChanged, 0);

  const inStockCount = items.filter((i) => i.status === 'IN_STOCK').length;
  const lowStockCount = items.filter((i) => i.status === 'LOW_STOCK').length;
  const outOfStockCount = items.filter((i) => i.status === 'OUT_OF_STOCK').length;

  return (
    <div className="space-y-6">
      {/* Top Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stock Health Composition */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Stock Health Status
            </h4>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">In Stock</span>
                <span className="font-bold text-emerald-600">
                  {inStockCount} ({Math.round((inStockCount / Math.max(1, items.length)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(inStockCount / Math.max(1, items.length)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Low Stock Alert</span>
                <span className="font-bold text-amber-600">
                  {lowStockCount} ({Math.round((lowStockCount / Math.max(1, items.length)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full"
                  style={{ width: `${(lowStockCount / Math.max(1, items.length)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-semibold text-zinc-700 dark:text-zinc-300">Out of Stock</span>
                <span className="font-bold text-rose-600">
                  {outOfStockCount} ({Math.round((outOfStockCount / Math.max(1, items.length)) * 100)}%)
                </span>
              </div>
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(outOfStockCount / Math.max(1, items.length)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Movement Turnover Ratio */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Inventory Movement Ratio
            </h4>
            <TrendingUp className="w-4 h-4 text-purple-600" />
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase">
                Stock Received (IN)
              </span>
              <div className="text-xl font-bold text-emerald-800 dark:text-emerald-300 mt-1">
                +{totalInflow} <span className="text-xs font-normal">units</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800">
              <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 uppercase">
                Stock Dispatched (OUT)
              </span>
              <div className="text-xl font-bold text-rose-800 dark:text-rose-300 mt-1">
                -{totalOutflow} <span className="text-xs font-normal">units</span>
              </div>
            </div>
          </div>
          <p className="text-[11px] text-zinc-400 mt-3">
            Calculated across {movements.length} total logged events in Google Sheets.
          </p>
        </div>

        {/* Total Capital Committed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
              Total Capital Invested
            </h4>
            <DollarSign className="w-4 h-4 text-blue-600" />
          </div>

          <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-2">
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            Average SKU unit price:{' '}
            <span className="font-semibold text-zinc-800 dark:text-zinc-200">
              $
              {(
                totalValuation /
                Math.max(1, items.reduce((sum, i) => sum + i.quantity, 0))
              ).toFixed(2)}
            </span>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-blue-500" />
            <span>Values update dynamically with cell changes</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown & Top SKUs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-600" />
            Category Value Distribution
          </h4>

          <div className="space-y-3">
            {categories.map(([catName, stats]) => {
              const percentage = Math.round((stats.totalVal / Math.max(1, totalValuation)) * 100);
              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                      {catName}{' '}
                      <span className="text-[11px] text-zinc-400 font-normal">
                        ({stats.count} SKUs, {stats.units} units)
                      </span>
                    </span>
                    <span className="font-bold text-zinc-900 dark:text-white font-mono">
                      ${stats.totalVal.toFixed(2)} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Valued Products */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <h4 className="text-sm font-bold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-purple-600" />
            Highest Capital Products
          </h4>

          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {topValuedItems.map((item, idx) => {
              const val = item.quantity * item.unitPrice;
              return (
                <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 rounded-md bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-bold text-[10px] text-zinc-500">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-zinc-900 dark:text-white">{item.name}</div>
                      <div className="text-[11px] text-zinc-400 font-mono">
                        {item.sku} • {item.quantity} units @ ${item.unitPrice.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right font-bold text-zinc-900 dark:text-white font-mono">
                    ${val.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
