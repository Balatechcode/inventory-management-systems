import React from 'react';
import {
  X,
  Package,
  MapPin,
  Truck,
  Tag,
  ArrowDownRight,
  ArrowUpRight,
  Clock,
  Barcode,
  Layers,
} from 'lucide-react';
import { InventoryItem, StockMovement, UserRole } from '../types/inventory';

interface ItemDetailModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  movements: StockMovement[];
  role: UserRole;
  onClose: () => void;
  onStockAction: (item: InventoryItem, type: 'IN' | 'OUT') => void;
  onEdit: (item: InventoryItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  isOpen,
  item,
  movements,
  role,
  onClose,
  onStockAction,
  onEdit,
}) => {
  if (!isOpen || !item) return null;

  const itemMovements = movements.filter(
    (m) => m.itemId === item.id || m.sku === item.sku
  );

  const getStatusBadge = () => {
    switch (item.status) {
      case 'IN_STOCK':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            In Stock
          </span>
        );
      case 'LOW_STOCK':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse">
            Low Stock Alert
          </span>
        );
      case 'OUT_OF_STOCK':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-100 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            Out of Stock
          </span>
        );
    }
  };

  // Pseudo barcode pattern from SKU characters
  const generateBarcodeLines = (sku: string) => {
    const chars = sku.toUpperCase().split('');
    return chars.flatMap((char, i) => {
      const code = char.charCodeAt(0);
      const isThick = code % 2 === 0;
      const isWide = (code + i) % 3 === 0;
      return [
        <div
          key={`bar-${i}-1`}
          className={`${isThick ? 'w-1' : 'w-0.5'} bg-zinc-900 dark:bg-zinc-100 h-10`}
        />,
        <div
          key={`bar-${i}-2`}
          className={`${isWide ? 'w-1' : 'w-0.5'} bg-transparent h-10`}
        />,
        <div
          key={`bar-${i}-3`}
          className={`${code % 4 === 0 ? 'w-1.5' : 'w-0.5'} bg-zinc-900 dark:bg-zinc-100 h-10`}
        />,
      ];
    });
  };

  const canEdit = role === 'ADMIN' || role === 'MANAGER';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              <span className="text-xs font-mono text-zinc-500">{item.id}</span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 dark:text-white">{item.name}</h3>
            <p className="text-xs text-zinc-500 font-mono">SKU: {item.sku}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Current Quantity</span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {item.quantity} <span className="text-xs font-normal text-zinc-500">units</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Min Alert Threshold</span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {item.minThreshold} <span className="text-xs font-normal text-zinc-500">units</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Unit Price</span>
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                ${item.unitPrice.toFixed(2)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Total Asset Value</span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                ${(item.quantity * item.unitPrice).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Barcode & SKU Card */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 mb-2">
              <Barcode className="w-4 h-4" />
              <span>Standard Scan Barcode</span>
            </div>
            <div className="flex items-center gap-0.5 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700">
              {generateBarcodeLines(item.sku)}
            </div>
            <span className="mt-1.5 font-mono text-xs font-bold tracking-widest text-zinc-700 dark:text-zinc-300">
              *{item.sku}*
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <Tag className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Category</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.category}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <Truck className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Supplier / Vendor</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.supplier || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <MapPin className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Location / Bin</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">{item.location || 'N/A'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
              <Clock className="w-4 h-4 text-zinc-400" />
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-semibold">Last Synchronized</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {new Date(item.lastUpdated).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Item Specific Transaction History */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                Stock Activity History ({itemMovements.length})
              </h4>
            </div>

            {itemMovements.length === 0 ? (
              <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/30 text-center text-xs text-zinc-500">
                No recent transactions recorded for this item.
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800 max-h-48 overflow-y-auto">
                {itemMovements.map((m) => (
                  <div key={m.id} className="p-3 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg ${
                          m.type === 'IN'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-600'
                        }`}
                      >
                        {m.type === 'IN' ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-zinc-900 dark:text-white">
                          {m.type === 'IN' ? '+' : '-'}
                          {m.quantityChanged} units ({m.reason})
                        </div>
                        <div className="text-[11px] text-zinc-400">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}{' '}
                          by {m.performedBy}
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] font-mono text-zinc-500">
                      {m.previousQuantity} → <span className="font-bold text-zinc-900 dark:text-white">{m.newQuantity}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            {canEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit(item);
                }}
                className="px-3 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-xl transition"
              >
                Edit Product Info
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                onClose();
                onStockAction(item, 'OUT');
              }}
              disabled={item.quantity === 0}
              className="px-3 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              Dispatch Stock
            </button>
            <button
              onClick={() => {
                onClose();
                onStockAction(item, 'IN');
              }}
              className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              Receive Restock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
