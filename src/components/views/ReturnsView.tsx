import React, { useState } from 'react';
import {
  RotateCcw,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldAlert,
} from 'lucide-react';
import { ReturnItem, ProductVariant } from '../../types/partyInventory';

interface ReturnsViewProps {
  returns: ReturnItem[];
  variants: ProductVariant[];
  onCreateReturn: () => void;
  onInspectReturn: (returnItem: ReturnItem, newCondition: 'Sellable' | 'Damaged') => void;
}

export const ReturnsView: React.FC<ReturnsViewProps> = ({
  returns,
  variants,
  onCreateReturn,
  onInspectReturn,
}) => {
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState<string>('ALL');

  const filtered = returns.filter((r) => {
    const matchesCondition = filterCondition === 'ALL' || r.condition === filterCondition;
    const matchesSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.orderId.toLowerCase().includes(search.toLowerCase()) ||
      r.sku.toLowerCase().includes(search.toLowerCase()) ||
      r.customerName.toLowerCase().includes(search.toLowerCase()) ||
      r.productName.toLowerCase().includes(search.toLowerCase());
    return matchesCondition && matchesSearch;
  });

  const getConditionBadge = (condition: ReturnItem['condition']) => {
    switch (condition) {
      case 'Sellable':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Sellable (Restocked)</span>
          </span>
        );
      case 'Damaged':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-200 flex items-center gap-1">
            <XCircle className="w-3 h-3 text-rose-500" />
            <span>Damaged (Quarantined)</span>
          </span>
        );
      case 'Inspection Required':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Inspection Required</span>
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
            <RotateCcw className="w-5 h-5 text-amber-500" />
            Returns & Damaged Stock Quarantine
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Strict quarantine workflow: returned stock is only restored to available inventory after verified inspection
          </p>
        </div>

        <button
          onClick={onCreateReturn}
          className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Log Customer Return</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search return ID, order ID, SKU, customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {(['ALL', 'Inspection Required', 'Sellable', 'Damaged'] as const).map((cond) => (
            <button
              key={cond}
              onClick={() => setFilterCondition(cond)}
              className={`px-3 py-1.5 rounded-xl font-medium transition ${
                filterCondition === cond
                  ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {cond}
            </button>
          ))}
        </div>
      </div>

      {/* Returns Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Return ID</th>
                <th className="py-3 px-4 font-semibold">Order & Channel</th>
                <th className="py-3 px-4 font-semibold">Customer</th>
                <th className="py-3 px-4 font-semibold">Product & SKU</th>
                <th className="py-3 px-4 font-semibold">Quantity</th>
                <th className="py-3 px-4 font-semibold">Reason</th>
                <th className="py-3 px-4 font-semibold">Condition</th>
                <th className="py-3 px-4 font-semibold text-right">Inspection Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((ret) => (
                <tr key={ret.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3.5 px-4 font-mono font-bold text-zinc-900 dark:text-white">
                    {ret.id}
                    <span className="text-[10px] font-normal text-zinc-400 block font-sans">
                      {ret.returnDate}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-mono">
                    <span className="text-zinc-800 dark:text-zinc-200 font-semibold block">
                      {ret.orderId}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-sans">{ret.channel}</span>
                  </td>

                  <td className="py-3.5 px-4 font-medium text-zinc-800 dark:text-zinc-200">
                    {ret.customerName}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200 block truncate max-w-[200px]">
                      {ret.productName}
                    </span>
                    <span className="font-mono text-[11px] text-zinc-400">{ret.sku}</span>
                  </td>

                  <td className="py-3.5 px-4 font-bold text-zinc-900 dark:text-white font-mono">
                    {ret.quantity} pcs
                  </td>

                  <td className="py-3.5 px-4 text-zinc-600 dark:text-zinc-400">
                    <span className="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px] font-medium">
                      {ret.reason}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">{getConditionBadge(ret.condition)}</td>

                  <td className="py-3.5 px-4 text-right">
                    {ret.condition === 'Inspection Required' ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onInspectReturn(ret, 'Sellable')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition"
                        >
                          Pass (Restock)
                        </button>
                        <button
                          onClick={() => onInspectReturn(ret, 'Damaged')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg transition"
                        >
                          Fail (Damaged)
                        </button>
                      </div>
                    ) : (
                      <span className="text-zinc-400 text-[11px]">Processed</span>
                    )}
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
