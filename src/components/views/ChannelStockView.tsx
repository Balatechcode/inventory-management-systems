import React, { useState } from 'react';
import {
  Network,
  ArrowRightLeft,
  Search,
  Filter,
  Download,
  AlertCircle,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { ProductVariant, SalesChannel } from '../../types/partyInventory';

interface ChannelStockViewProps {
  variants: ProductVariant[];
  onOpenTransferModal: (variant: ProductVariant) => void;
  onExportCSV: () => void;
  onNavigateToMarketplaces?: () => void;
  onBroadcastFeeds?: () => void;
}

export const ChannelStockView: React.FC<ChannelStockViewProps> = ({
  variants,
  onOpenTransferModal,
  onExportCSV,
  onNavigateToMarketplaces,
  onBroadcastFeeds,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filtered = variants.filter((v) => {
    const matchesCat = categoryFilter === 'ALL' || v.category === categoryFilter;
    const matchesSearch =
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.variantName.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Calculate totals across channels
  const totalPhysical = variants.reduce((sum, v) => sum + v.currentStock, 0);
  const totalAmazon = variants.reduce((sum, v) => sum + (v.channelAllocation.amazon || 0), 0);
  const totalFlipkart = variants.reduce((sum, v) => sum + (v.channelAllocation.flipkart || 0), 0);
  const totalMeesho = variants.reduce((sum, v) => sum + (v.channelAllocation.meesho || 0), 0);
  const totalLocal = variants.reduce((sum, v) => sum + (v.channelAllocation.local || 0), 0);
  const totalBulk = variants.reduce((sum, v) => sum + (v.channelAllocation.bulk || 0), 0);
  const totalUnallocated = variants.reduce((sum, v) => sum + (v.channelAllocation.unallocated || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Network className="w-5 h-5 text-blue-500" />
            Marketplace & Channel Stock Allocation
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Allocate and balance physical inventory across Amazon, Flipkart, Meesho, Local counter, and Bulk reserves
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToMarketplaces && (
            <button
              onClick={onNavigateToMarketplaces}
              className="px-3 py-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-xl hover:bg-indigo-100 transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Network className="w-3.5 h-3.5" />
              <span>Official APIs & SP-API</span>
            </button>
          )}

          {onBroadcastFeeds && (
            <button
              onClick={onBroadcastFeeds}
              className="px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-2xs flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Broadcast Feeds</span>
            </button>
          )}

          <button
            onClick={onExportCSV}
            className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5 text-zinc-400" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Channel Allocation KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-amber-500 block">Amazon FBA/FBM</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalAmazon.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">
            {Math.round((totalAmazon / Math.max(1, totalPhysical)) * 100)}% of stock
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-blue-500 block">Flipkart</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalFlipkart.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">
            {Math.round((totalFlipkart / Math.max(1, totalPhysical)) * 100)}% of stock
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-pink-500 block">Meesho</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalMeesho.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">
            {Math.round((totalMeesho / Math.max(1, totalPhysical)) * 100)}% of stock
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-emerald-500 block">Local Direct</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalLocal.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">
            {Math.round((totalLocal / Math.max(1, totalPhysical)) * 100)}% of stock
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-purple-500 block">Bulk Reserved</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalBulk.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">Locked for orders</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-zinc-400 block">Unallocated Buffer</span>
          <div className="text-xl font-bold text-zinc-900 dark:text-white mt-1">
            {totalUnallocated.toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">Available to assign</span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search SKU or product for channel allocation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-zinc-400">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Balloons">Balloons</option>
            <option value="Banners">Banners</option>
            <option value="Frills">Frills</option>
            <option value="D-Light">D-Light</option>
            <option value="Cork Lights">Cork Lights</option>
            <option value="Curtains">Curtains</option>
            <option value="Candles">Candles</option>
            <option value="Props">Props</option>
          </select>
        </div>
      </div>

      {/* Main Channel Stock Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU & Variant</th>
                <th className="py-3 px-4 font-semibold text-center">Total Physical</th>
                <th className="py-3 px-4 font-semibold text-center text-amber-600 dark:text-amber-400">Amazon</th>
                <th className="py-3 px-4 font-semibold text-center text-blue-600 dark:text-blue-400">Flipkart</th>
                <th className="py-3 px-4 font-semibold text-center text-pink-600 dark:text-pink-400">Meesho</th>
                <th className="py-3 px-4 font-semibold text-center text-emerald-600 dark:text-emerald-400">Local</th>
                <th className="py-3 px-4 font-semibold text-center text-purple-600 dark:text-purple-400">Bulk Res.</th>
                <th className="py-3 px-4 font-semibold text-center text-zinc-500">Unallocated</th>
                <th className="py-3 px-4 font-semibold text-right">Transfer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                      {v.sku}
                    </span>
                    <span className="text-zinc-500 text-[11px] truncate max-w-[200px] block">
                      {v.variantName}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold text-zinc-900 dark:text-white font-mono">
                    {v.currentStock}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-amber-700 dark:text-amber-400 font-mono">
                    {v.channelAllocation.amazon || 0}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-blue-700 dark:text-blue-400 font-mono">
                    {v.channelAllocation.flipkart || 0}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-pink-700 dark:text-pink-400 font-mono">
                    {v.channelAllocation.meesho || 0}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-emerald-700 dark:text-emerald-400 font-mono">
                    {v.channelAllocation.local || 0}
                  </td>

                  <td className="py-3 px-4 text-center font-semibold text-purple-700 dark:text-purple-400 font-mono">
                    {v.reservedStock || 0}
                  </td>

                  <td className="py-3 px-4 text-center text-zinc-500 font-mono">
                    {v.channelAllocation.unallocated || 0}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenTransferModal(v)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-[11px] font-semibold transition"
                    >
                      <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                      <span>Reallocate</span>
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
