import React from 'react';
import {
  X,
  AlertTriangle,
  Sparkles,
  Package,
  ShoppingCart,
  Download,
  CheckCircle2,
} from 'lucide-react';
import { ProductVariant, ComboProduct } from '../../types/partyInventory';
import { calculateComboAvailability } from '../../services/partyInventoryEngine';

interface PartyNotificationModalProps {
  isOpen: boolean;
  variants: ProductVariant[];
  combos: ComboProduct[];
  onClose: () => void;
  onCreatePurchase: (variant: ProductVariant, qty: number) => void;
  onExportLowStock: () => void;
}

export const PartyNotificationModal: React.FC<PartyNotificationModalProps> = ({
  isOpen,
  variants,
  combos,
  onClose,
  onCreatePurchase,
  onExportLowStock,
}) => {
  if (!isOpen) return null;

  const lowStockVariants = variants.filter(
    (v) => v.status === 'LOW_STOCK' || v.status === 'CRITICAL' || v.status === 'OUT_OF_STOCK'
  );

  // Combos bottlenecked (< 5 available)
  const comboShortages = combos
    .map((c) => ({
      combo: c,
      avail: calculateComboAvailability(c, variants),
    }))
    .filter((res) => res.avail.maxCombos < 5 && res.avail.limitingComponent);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                  Stock Depletion & Combo Alerts
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white">
                  {lowStockVariants.length + comboShortages.length}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Automated alerts triggered by low warehouse stock and combo bottlenecks
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs">
          {/* Combo Shortage Warnings */}
          {comboShortages.length > 0 && (
            <div className="space-y-2">
              <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Combo Bundles Stalled by Component Shortage ({comboShortages.length})
              </span>

              <div className="space-y-2">
                {comboShortages.map(({ combo, avail }) => (
                  <div
                    key={combo.id}
                    className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white">{combo.name}</h4>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                        ⚠️ Only <strong>{avail.maxCombos}</strong> complete combos can be built.
                        Limited by component: <strong>{avail.limitingComponent?.name}</strong> (
                        {avail.limitingComponent?.availableStock} available).
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        const targetVariant = variants.find(
                          (v) => v.sku === avail.limitingComponent?.sku
                        );
                        if (targetVariant) {
                          onClose();
                          onCreatePurchase(targetVariant, targetVariant.reorderQuantity || 200);
                        }
                      }}
                      className="shrink-0 px-2.5 py-1 text-[11px] font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs"
                    >
                      Reorder Component
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Physical SKUs Low Stock */}
          <div className="space-y-2">
            <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
              <Package className="w-4 h-4 text-rose-500" />
              Low Stock Variant SKUs ({lowStockVariants.length})
            </span>

            {lowStockVariants.length === 0 ? (
              <div className="p-6 text-center text-zinc-400 bg-zinc-50 dark:bg-zinc-800 rounded-2xl">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
                <p className="font-semibold text-zinc-700 dark:text-zinc-200">
                  All party variants have healthy inventory!
                </p>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                {lowStockVariants.map((v) => (
                  <div key={v.id} className="p-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-mono font-bold text-zinc-900 dark:text-white">
                          {v.sku}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            v.status === 'CRITICAL' || v.status === 'OUT_OF_STOCK'
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {v.status}
                        </span>
                      </div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-300 block">
                        {v.productName} – {v.variantName}
                      </span>
                      <span className="text-zinc-400 text-[11px]">
                        Available: <strong>{v.availableStock}</strong> | Min Threshold:{' '}
                        <strong>{v.lowStockThreshold}</strong>
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        onClose();
                        onCreatePurchase(v, v.reorderQuantity || 200);
                      }}
                      className="px-2.5 py-1 text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>PO (+{v.reorderQuantity})</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={onExportLowStock}
            className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Low Stock CSV</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
