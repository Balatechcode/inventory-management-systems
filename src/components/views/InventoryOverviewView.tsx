import React, { useState } from 'react';
import {
  Boxes,
  Search,
  Filter,
  Download,
  PlusCircle,
  ArrowRightLeft,
  Eye,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { ProductVariant, ProductCategory, StockStatus } from '../../types/partyInventory';

interface InventoryOverviewViewProps {
  variants: ProductVariant[];
  onOpenQuickAdjustment: (variant: ProductVariant) => void;
  onOpenChannelTransfer: (variant: ProductVariant) => void;
  onSelectVariant: (variant: ProductVariant) => void;
  onExportCSV: () => void;
}

export const InventoryOverviewView: React.FC<InventoryOverviewViewProps> = ({
  variants,
  onOpenQuickAdjustment,
  onOpenChannelTransfer,
  onSelectVariant,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const categories: ProductCategory[] = [
    'Balloons',
    'Banners',
    'Frills',
    'D-Light',
    'Cork Lights',
    'Curtains',
    'Candles',
    'Props',
  ];

  const filtered = variants.filter((v) => {
    const matchesCategory = selectedCategory === 'ALL' || v.category === selectedCategory;
    const matchesStatus = selectedStatus === 'ALL' || v.status === selectedStatus;
    const matchesSearch =
      v.sku.toLowerCase().includes(search.toLowerCase()) ||
      v.productName.toLowerCase().includes(search.toLowerCase()) ||
      v.variantName.toLowerCase().includes(search.toLowerCase()) ||
      v.color.toLowerCase().includes(search.toLowerCase()) ||
      v.supplier.toLowerCase().includes(search.toLowerCase()) ||
      v.storageLocation.toLowerCase().includes(search.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: StockStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300">
            Healthy
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
            Low Stock
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">
            Critical
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white">
            Out of Stock
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Boxes className="w-5 h-5 text-emerald-500" />
            Inventory Overview & Physical Stock
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Strict separation: <strong>Available Stock = Physical Stock - Reserved Stock - Damaged Stock</strong>
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export Master CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search SKU (e.g. BAL-GOLD-10), color, variant, location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-zinc-800 dark:text-zinc-200 font-semibold focus:outline-none"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Pills */}
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 p-0.5 rounded-xl">
            {(['ALL', 'HEALTHY', 'LOW_STOCK', 'CRITICAL', 'OUT_OF_STOCK'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedStatus === st
                    ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white font-bold shadow-2xs'
                    : 'text-zinc-500'
                }`}
              >
                {st === 'ALL'
                  ? 'All'
                  : st === 'LOW_STOCK'
                  ? 'Low'
                  : st === 'CRITICAL'
                  ? 'Critical'
                  : st === 'OUT_OF_STOCK'
                  ? 'Out'
                  : 'Healthy'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Master Inventory Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">SKU & Item Details</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold text-center">Physical Stock</th>
                <th className="py-3 px-4 font-semibold text-center text-blue-600">Reserved</th>
                <th className="py-3 px-4 font-semibold text-center text-rose-500">Damaged</th>
                <th className="py-3 px-4 font-semibold text-center text-emerald-600">Available</th>
                <th className="py-3 px-4 font-semibold">Pricing (Cost/Sell)</th>
                <th className="py-3 px-4 font-semibold">Location</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4">
                    <span
                      onClick={() => onSelectVariant(v)}
                      className="font-mono font-bold text-zinc-900 dark:text-white hover:text-rose-500 cursor-pointer block"
                    >
                      {v.sku}
                    </span>
                    <span className="text-zinc-600 dark:text-zinc-400 font-medium text-[11px] block">
                      {v.variantName}
                    </span>
                    <span className="text-zinc-400 text-[10px] block">
                      Color: {v.color} • Pack: {v.packQuantity} pcs
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-500 font-medium">{v.category}</td>

                  <td className="py-3.5 px-4 text-center font-bold text-zinc-900 dark:text-white font-mono text-sm">
                    {v.currentStock}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-blue-600 font-mono">
                    {v.reservedStock}
                  </td>

                  <td className="py-3.5 px-4 text-center font-mono text-zinc-400">
                    {v.damagedStock}
                  </td>

                  <td className="py-3.5 px-4 text-center font-bold text-emerald-600 font-mono text-sm">
                    {v.availableStock}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-[11px]">
                    <span className="text-zinc-400">₹{v.purchasePrice}</span> /{' '}
                    <span className="font-bold text-emerald-600">₹{v.sellingPrice}</span>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-500 text-[11px]">{v.storageLocation}</td>

                  <td className="py-3.5 px-4">{getStatusBadge(v.status)}</td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onOpenQuickAdjustment(v)}
                        title="Adjust Stock (+/-)"
                        className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onOpenChannelTransfer(v)}
                        title="Channel Reallocate"
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60"
                      >
                        <ArrowRightLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onSelectVariant(v)}
                        title="Inspect Variant Details & Barcode"
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
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
