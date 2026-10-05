import React, { useState } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Box,
  Layers,
} from 'lucide-react';
import { PackagingItem } from '../../types/partyInventory';

interface PackagingViewProps {
  packaging: PackagingItem[];
  onAddPackaging: () => void;
  onAdjustStock: (item: PackagingItem, delta: number) => void;
}

export const PackagingView: React.FC<PackagingViewProps> = ({
  packaging,
  onAddPackaging,
  onAdjustStock,
}) => {
  const [search, setSearch] = useState('');

  const filtered = packaging.filter((p) => {
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.type.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <Package className="w-5 h-5 text-purple-500" />
            Packaging Materials & Consumables
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Monitor shipping boxes, clear poly bags, bopp tape, fragile stickers, bubble wrap, and thank you cards
          </p>
        </div>

        <button
          onClick={onAddPackaging}
          className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Add Packaging Material</span>
        </button>
      </div>

      {/* Packaging Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => {
          const isLow = item.currentStock <= item.minThreshold;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-3xl bg-white dark:bg-zinc-900 border shadow-xs space-y-4 ${
                isLow
                  ? 'border-amber-300 dark:border-amber-900/60 bg-amber-50/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                    {item.sku}
                  </span>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-white mt-1">
                    {item.name}
                  </h4>
                  <span className="text-xs text-zinc-400">{item.type}</span>
                </div>
                {isLow ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                    Low Stock
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    In Stock
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-zinc-50 dark:bg-zinc-800/40 p-3 rounded-2xl">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                    Current Stock
                  </span>
                  <span className="text-lg font-bold text-zinc-900 dark:text-white font-mono">
                    {item.currentStock}{' '}
                    <span className="text-xs font-normal text-zinc-400">units</span>
                  </span>
                </div>
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-bold">
                    Unit Cost
                  </span>
                  <span className="text-lg font-bold text-emerald-600 font-mono">
                    ₹{item.unitCost}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-zinc-500 pt-1">
                <span>Threshold: min {item.minThreshold}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onAdjustStock(item, -10)}
                    className="px-2 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 font-bold"
                  >
                    -10
                  </button>
                  <button
                    onClick={() => onAdjustStock(item, +50)}
                    className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 font-bold hover:bg-emerald-100"
                  >
                    +50 Restock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
