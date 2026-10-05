import React, { useState } from 'react';
import {
  ArrowUpDown,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Download,
  Calendar,
  Layers,
} from 'lucide-react';
import { StockMovement, MovementType } from '../types/inventory';
import { exportMovementsToCSV } from '../utils/exportUtils';

interface AuditLogViewProps {
  movements: StockMovement[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ movements }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | MovementType>('ALL');

  const filtered = movements.filter((m) => {
    const matchesSearch =
      m.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'ALL' || m.type === typeFilter;

    return matchesSearch && matchesType;
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xs overflow-hidden">
      {/* Header & Filter toolbar */}
      <div className="p-4 sm:p-5 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            Stock Movements & Audit Trail
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Real-time chronological ledger stored in Google Sheets tab <code>Stock Movements</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export */}
          <button
            onClick={() => exportMovementsToCSV(filtered)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-zinc-50/70 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search movements..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400"
          />
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          <Filter className="w-3.5 h-3.5 text-zinc-400" />
          <button
            onClick={() => setTypeFilter('ALL')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'ALL'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
            }`}
          >
            All ({movements.length})
          </button>
          <button
            onClick={() => setTypeFilter('IN')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'IN'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
            }`}
          >
            In ({movements.filter((m) => m.type === 'IN').length})
          </button>
          <button
            onClick={() => setTypeFilter('OUT')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'OUT'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
            }`}
          >
            Out ({movements.filter((m) => m.type === 'OUT').length})
          </button>
          <button
            onClick={() => setTypeFilter('ADJUSTMENT')}
            className={`px-2.5 py-1 rounded-lg font-medium transition ${
              typeFilter === 'ADJUSTMENT'
                ? 'bg-purple-600 text-white'
                : 'text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40'
            }`}
          >
            Adjustments ({movements.filter((m) => m.type === 'ADJUSTMENT').length})
          </button>
        </div>
      </div>

      {/* Movements Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4 font-semibold">Timestamp</th>
              <th className="py-3 px-4 font-semibold">Transaction ID</th>
              <th className="py-3 px-4 font-semibold">Product</th>
              <th className="py-3 px-4 font-semibold">Type</th>
              <th className="py-3 px-4 font-semibold">Change</th>
              <th className="py-3 px-4 font-semibold">Quantity Balance</th>
              <th className="py-3 px-4 font-semibold">Reason</th>
              <th className="py-3 px-4 font-semibold">Actor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-400">
                  <ArrowUpDown className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="font-semibold text-zinc-600 dark:text-zinc-300">
                    No transaction movements recorded
                  </p>
                  <p className="text-[11px] mt-0.5">
                    Stock adjustments made in the app are automatically synced and logged here
                  </p>
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition">
                  <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                    {new Date(m.timestamp).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}{' '}
                    <span className="text-[10px] text-zinc-400">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-400 font-semibold">
                    {m.id}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold text-zinc-900 dark:text-white">{m.itemName}</div>
                    <div className="text-[11px] font-mono text-zinc-400">{m.sku}</div>
                  </td>

                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold rounded-md ${
                        m.type === 'IN'
                          ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                          : m.type === 'OUT'
                          ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                          : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                      }`}
                    >
                      {m.type === 'IN' ? (
                        <ArrowDownRight className="w-3 h-3" />
                      ) : (
                        <ArrowUpRight className="w-3 h-3" />
                      )}
                      {m.type}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-bold">
                    <span
                      className={
                        m.type === 'IN'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                      }
                    >
                      {m.type === 'IN' ? `+${m.quantityChanged}` : `-${m.quantityChanged}`}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                    {m.previousQuantity} →{' '}
                    <span className="font-bold text-zinc-900 dark:text-white">{m.newQuantity}</span>
                  </td>

                  <td className="py-3 px-4 text-zinc-700 dark:text-zinc-300">{m.reason}</td>

                  <td className="py-3 px-4 text-zinc-500 text-[11px] truncate max-w-[120px]">
                    {m.performedBy}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
