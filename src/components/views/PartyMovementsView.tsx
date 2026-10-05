import React, { useState } from 'react';
import {
  ArrowUpDown,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Truck,
  RotateCcw,
  ArrowRightLeft,
  ShoppingBag,
  PackagePlus,
  AlertTriangle,
} from 'lucide-react';
import { StockMovement, TransactionType } from '../../types/partyInventory';

interface PartyMovementsViewProps {
  movements: StockMovement[];
  onExportCSV: () => void;
}

export const PartyMovementsView: React.FC<PartyMovementsViewProps> = ({
  movements,
  onExportCSV,
}) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const types: { key: string; label: string }[] = [
    { key: 'ALL', label: 'All Transactions' },
    { key: 'PURCHASE', label: 'Purchase (+)' },
    { key: 'SALE', label: 'Direct Sale (-)' },
    { key: 'COMBO_SALE', label: 'Combo Component Sale (-)' },
    { key: 'BULK_ORDER_RESERVATION', label: 'Bulk Order Reserve' },
    { key: 'BULK_ORDER_RELEASE', label: 'Bulk Order Release' },
    { key: 'CHANNEL_TRANSFER', label: 'Channel Transfer' },
    { key: 'DAMAGED', label: 'Damaged Stock' },
    { key: 'RETURN', label: 'Customer Return' },
    { key: 'STOCK_ADJUSTMENT', label: 'Manual Adjustment' },
  ];

  const filtered = movements.filter((m) => {
    const matchesType = selectedType === 'ALL' || m.type === selectedType;
    const matchesSearch =
      m.sku.toLowerCase().includes(search.toLowerCase()) ||
      m.productName.toLowerCase().includes(search.toLowerCase()) ||
      m.reason.toLowerCase().includes(search.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(search.toLowerCase()) ||
      (m.referenceId && m.referenceId.toLowerCase().includes(search.toLowerCase()));

    return matchesType && matchesSearch;
  });

  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'PURCHASE':
        return 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border-emerald-200';
      case 'SALE':
        return 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 border-blue-200';
      case 'COMBO_SALE':
        return 'bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border-rose-200';
      case 'BULK_ORDER_RESERVATION':
        return 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 border-purple-200';
      case 'BULK_ORDER_RELEASE':
        return 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border-teal-200';
      case 'CHANNEL_TRANSFER':
        return 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border-amber-200';
      case 'DAMAGED':
      case 'LOST':
        return 'bg-zinc-800 text-zinc-100 border-zinc-700';
      case 'RETURN':
        return 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border-indigo-200';
      default:
        return 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
            <ArrowUpDown className="w-5 h-5 text-rose-500" />
            Immutable Stock Movement History & Audit Ledger
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Chronological audit trail of all purchases, sales, combo component deductions, channel transfers, and bulk reservations
          </p>
        </div>

        <button
          onClick={onExportCSV}
          className="px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs flex items-center justify-center gap-1.5"
        >
          <Download className="w-3.5 h-3.5 text-zinc-400" />
          <span>Export Ledger CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs flex flex-col gap-3 text-xs">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search SKU (e.g. BAL-GOLD-10), order ID, reason, or user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white"
            />
          </div>

          <span className="text-zinc-400 text-[11px] self-end sm:self-auto">
            Showing <strong>{filtered.length}</strong> of <strong>{movements.length}</strong> events
          </span>
        </div>

        {/* Type Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
          {types.map((t) => (
            <button
              key={t.key}
              onClick={() => setSelectedType(t.key)}
              className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 ${
                selectedType === t.key
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Movements Table */}
      <div className="rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Transaction Type</th>
                <th className="py-3 px-4 font-semibold">SKU & Item</th>
                <th className="py-3 px-4 font-semibold text-center">Qty Change</th>
                <th className="py-3 px-4 font-semibold text-center">Balance</th>
                <th className="py-3 px-4 font-semibold">Channel / Ref</th>
                <th className="py-3 px-4 font-semibold">Audit Justification</th>
                <th className="py-3 px-4 font-semibold text-right">User / System</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/40 transition">
                  <td className="py-3 px-4 text-zinc-500 font-mono text-[11px] whitespace-nowrap">
                    {new Date(m.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    <span className="text-[10px] text-zinc-400">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold border inline-block ${getTypeBadge(
                        m.type
                      )}`}
                    >
                      {m.type}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                      {m.sku}
                    </span>
                    <span className="text-zinc-500 text-[11px] truncate max-w-[180px] block">
                      {m.productName}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-bold font-mono text-sm">
                    <span
                      className={
                        m.quantityChanged > 0
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : m.quantityChanged < 0
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-zinc-400'
                      }
                    >
                      {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-400 whitespace-nowrap">
                    {m.previousQuantity} →{' '}
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">
                      {m.newQuantity}
                    </span>
                  </td>

                  <td className="py-3 px-4">
                    <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                      {m.channel || 'Warehouse'}
                    </span>
                    {m.referenceId && (
                      <span className="font-mono text-[10px] text-zinc-400 block">
                        Ref: {m.referenceId}
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300 max-w-[280px]">
                    <span className="line-clamp-2">{m.reason}</span>
                  </td>

                  <td className="py-3 px-4 text-right text-zinc-400 text-[11px] font-medium">
                    {m.performedBy}
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
