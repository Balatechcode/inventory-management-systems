import React, { useState } from 'react';
import {
  X,
  AlertTriangle,
  ArrowDownRight,
  Download,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import { LowStockAlert, InventoryItem } from '../types/inventory';
import { exportLowStockReport } from '../utils/exportUtils';

interface NotificationCenterModalProps {
  isOpen: boolean;
  alerts: LowStockAlert[];
  items: InventoryItem[];
  onClose: () => void;
  onRestockItem: (item: InventoryItem) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  alerts,
  items,
  onClose,
  onRestockItem,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING'>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL';
    if (filter === 'WARNING') return a.severity === 'WARNING';
    return true;
  });

  const handleRestock = (alert: LowStockAlert) => {
    const item = items.find((i) => i.id === alert.itemId || i.sku === alert.sku);
    if (item) {
      onClose();
      onRestockItem(item);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                  Inventory Stock Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-600 text-white">
                  {alerts.length}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Automated threshold monitoring based on Google Sheets sync
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter & Export Bar */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-500 font-medium">Filter:</span>
            <button
              onClick={() => setFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'ALL'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            >
              All ({alerts.length})
            </button>
            <button
              onClick={() => setFilter('CRITICAL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'CRITICAL'
                  ? 'bg-rose-600 text-white'
                  : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
              }`}
            >
              Critical ({alerts.filter((a) => a.severity === 'CRITICAL').length})
            </button>
            <button
              onClick={() => setFilter('WARNING')}
              className={`px-2.5 py-1 rounded-lg font-medium transition ${
                filter === 'WARNING'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40'
              }`}
            >
              Warning ({alerts.filter((a) => a.severity === 'WARNING').length})
            </button>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={() => exportLowStockReport(alerts)}
              className="flex items-center gap-1 px-3 py-1.5 font-medium rounded-lg text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 transition shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-zinc-500" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                {filter === 'ALL'
                  ? 'No low stock alerts! All items have adequate inventory.'
                  : `No ${filter.toLowerCase()} severity alerts.`}
              </p>
              <p className="text-xs text-zinc-500 max-w-sm">
                When items drop below their minimum threshold in Google Sheets, automated alerts
                will appear here immediately.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const unitsShort = Math.max(0, alert.minThreshold - alert.currentQuantity);
              const isCritical = alert.severity === 'CRITICAL';

              return (
                <div
                  key={alert.itemId}
                  className={`p-4 rounded-xl border transition flex items-center justify-between gap-3 ${
                    isCritical
                      ? 'bg-rose-50/60 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                      : 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded-md ${
                          isCritical
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {alert.severity}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 font-semibold">{alert.sku}</span>
                      <span className="text-[11px] text-zinc-400">({alert.category})</span>
                    </div>

                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                      {alert.name}
                    </h4>

                    <div className="flex items-center gap-3 mt-1.5 text-xs text-zinc-600 dark:text-zinc-400">
                      <div>
                        Stock:{' '}
                        <span
                          className={`font-bold ${
                            isCritical ? 'text-rose-600 dark:text-rose-400' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {alert.currentQuantity} units
                        </span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <div>
                        Threshold: <span className="font-semibold">{alert.minThreshold} units</span>
                      </div>
                      <span className="text-zinc-300 dark:text-zinc-700">•</span>
                      <div className="text-rose-600 dark:text-rose-400 font-semibold">
                        Short: {unitsShort} units
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRestock(alert)}
                    className="shrink-0 px-3 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
                  >
                    <ArrowDownRight className="w-3.5 h-3.5" />
                    <span>Restock</span>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
