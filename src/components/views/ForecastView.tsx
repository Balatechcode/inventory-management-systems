import React, { useState } from 'react';
import {
  TrendingDown,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Package,
  ArrowRight,
  Download,
  Search,
  ShoppingCart,
} from 'lucide-react';
import { ProductVariant } from '../../types/partyInventory';

interface ForecastViewProps {
  variants: ProductVariant[];
  onCreatePurchaseFromForecast: (variant: ProductVariant, suggestedQty: number) => void;
  onExportReport: () => void;
}

export const ForecastView: React.FC<ForecastViewProps> = ({
  variants,
  onCreatePurchaseFromForecast,
  onExportReport,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'REORDER_NOW' | 'SOON'>('ALL');
  const [search, setSearch] = useState('');

  // Compute forecast metrics for each variant
  const forecastData = variants.map((v) => {
    const daily = Math.max(0.5, v.avgDailySales || 1);
    const daysRemaining = Number((v.availableStock / daily).toFixed(1));

    let forecastStatus: 'CRITICAL_REORDER' | 'REORDER_SOON' | 'HEALTHY' = 'HEALTHY';
    if (v.availableStock === 0 || daysRemaining <= 3) {
      forecastStatus = 'CRITICAL_REORDER';
    } else if (daysRemaining <= 10 || v.availableStock <= v.lowStockThreshold) {
      forecastStatus = 'REORDER_SOON';
    }

    // Suggested reorder date: today + daysRemaining - leadTime (approx 3 days)
    const reorderDaysBuffer = Math.max(0, Math.floor(daysRemaining - 3));
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + reorderDaysBuffer);

    return {
      ...v,
      daysRemaining,
      forecastStatus,
      suggestedDate: targetDate.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    };
  });

  const filtered = forecastData.filter((item) => {
    const matchesFilter =
      filterType === 'ALL' ||
      (filterType === 'REORDER_NOW' && item.forecastStatus === 'CRITICAL_REORDER') ||
      (filterType === 'SOON' && item.forecastStatus === 'REORDER_SOON');

    const matchesSearch =
      item.sku.toLowerCase().includes(search.toLowerCase()) ||
      item.productName.toLowerCase().includes(search.toLowerCase()) ||
      item.variantName.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-rose-500" />
            Stock Forecast & Automated Reorder Suggestions
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Predictive stock depletion models based on daily sales velocity across marketplaces and local orders
          </p>
        </div>

        <button
          onClick={onExportReport}
          className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export Forecast CSV</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search SKU or variant for reorder forecast..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'ALL'
                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            All Items
          </button>
          <button
            onClick={() => setFilterType('REORDER_NOW')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'REORDER_NOW'
                ? 'bg-rose-600 text-white font-bold'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            Reorder Critical (≤ 3 Days)
          </button>
          <button
            onClick={() => setFilterType('SOON')}
            className={`px-3 py-1.5 rounded-xl font-medium transition ${
              filterType === 'SOON'
                ? 'bg-amber-600 text-white font-bold'
                : 'text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40'
            }`}
          >
            Reorder Soon (4–10 Days)
          </button>
        </div>
      </div>

      {/* Forecast Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU Code</th>
                <th className="py-3 px-4 font-semibold">Variant Name</th>
                <th className="py-3 px-4 font-semibold">Available Stock</th>
                <th className="py-3 px-4 font-semibold">Avg Daily Sales</th>
                <th className="py-3 px-4 font-semibold">30-Day Velocity</th>
                <th className="py-3 px-4 font-semibold">Stock Duration</th>
                <th className="py-3 px-4 font-semibold">Suggested Reorder</th>
                <th className="py-3 px-4 font-semibold text-right">Instant Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                    {item.sku}
                  </td>

                  <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {item.variantName}
                    <span className="text-[11px] text-zinc-400 block font-normal">
                      Supplier: {item.supplier}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                    {item.availableStock} pcs
                  </td>

                  <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                    ~{item.avgDailySales} pcs/day
                  </td>

                  <td className="py-3.5 px-4 font-mono text-zinc-600 dark:text-zinc-400">
                    {item.last30DaysSales} sold
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`font-mono font-bold ${
                        item.daysRemaining <= 3
                          ? 'text-rose-600'
                          : item.daysRemaining <= 10
                          ? 'text-amber-600'
                          : 'text-emerald-600'
                      }`}
                    >
                      {item.daysRemaining} days left
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    {item.forecastStatus === 'CRITICAL_REORDER' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 inline-block">
                        Order Now (+{item.reorderQuantity} pcs)
                      </span>
                    ) : item.forecastStatus === 'REORDER_SOON' ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 inline-block">
                        By {item.suggestedDate} (+{item.reorderQuantity} pcs)
                      </span>
                    ) : (
                      <span className="text-emerald-600 text-[11px] font-medium">Stock Healthy</span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() =>
                        onCreatePurchaseFromForecast(item, item.reorderQuantity || 200)
                      }
                      className="px-2.5 py-1 text-[11px] font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition inline-flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>PO (+{item.reorderQuantity})</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
