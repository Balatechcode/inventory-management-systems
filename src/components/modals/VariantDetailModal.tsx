import React from 'react';
import {
  X,
  Package,
  MapPin,
  Truck,
  TrendingDown,
  ArrowRightLeft,
  PlusCircle,
  Barcode,
  Layers,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { ProductVariant, StockMovement } from '../../types/partyInventory';

interface VariantDetailModalProps {
  isOpen: boolean;
  variant: ProductVariant | null;
  movements: StockMovement[];
  onClose: () => void;
  onOpenQuickAdjustment: (variant: ProductVariant) => void;
  onOpenChannelTransfer: (variant: ProductVariant) => void;
}

export const VariantDetailModal: React.FC<VariantDetailModalProps> = ({
  isOpen,
  variant,
  movements,
  onClose,
  onOpenQuickAdjustment,
  onOpenChannelTransfer,
}) => {
  if (!isOpen || !variant) return null;

  const variantMovements = movements.filter((m) => m.sku === variant.sku);

  // Barcode visualization
  const generateBarcode = (text: string) => {
    return text.split('').map((char, idx) => {
      const code = char.charCodeAt(0);
      const isThick = code % 2 === 0;
      return (
        <span
          key={idx}
          className={`h-10 inline-block bg-zinc-900 dark:bg-zinc-100 ${
            isThick ? 'w-1' : 'w-0.5'
          } mx-[1px]`}
        />
      );
    });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                {variant.sku}
              </span>
              <span className="text-xs text-zinc-400">• {variant.category}</span>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {variant.productName} – {variant.variantName}
            </h3>
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
          {/* Stock Metrics Quadrant */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block">
                Physical Stock
              </span>
              <div className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {variant.currentStock}{' '}
                <span className="text-xs font-normal text-zinc-500">units</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-blue-500 block">
                Reserved Stock
              </span>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {variant.reservedStock}{' '}
                <span className="text-xs font-normal text-zinc-500">bulk</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-emerald-500 block">
                Available Stock
              </span>
              <div className="text-2xl font-bold text-emerald-600 mt-1">
                {variant.availableStock}{' '}
                <span className="text-xs font-normal text-zinc-500">free</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
              <span className="text-[10px] uppercase font-bold text-rose-500 block">
                Damaged / Quarantined
              </span>
              <div className="text-2xl font-bold text-rose-600 mt-1">
                {variant.damagedStock}{' '}
                <span className="text-xs font-normal text-zinc-500">units</span>
              </div>
            </div>
          </div>

          {/* Barcode & Storage Location */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                {generateBarcode(variant.sku)}
              </div>
              <span className="mt-1 font-mono text-[11px] font-bold text-zinc-700 dark:text-zinc-300">
                *{variant.sku}*
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs w-full sm:w-auto">
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Location</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {variant.storageLocation}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Supplier</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  {variant.supplier}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Prices</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  Cost: ₹{variant.purchasePrice} | Sell: ₹{variant.sellingPrice}
                </span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[10px] uppercase font-bold">Velocity</span>
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                  ~{variant.avgDailySales} pcs/day ({variant.last30DaysSales} /mo)
                </span>
              </div>
            </div>
          </div>

          {/* Channel Stock Allocation Breakdown */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-900 dark:text-white">
                Sales Channel Allocation
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenChannelTransfer(variant);
                }}
                className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
              >
                <ArrowRightLeft className="w-3.5 h-3.5" /> Reallocate Stock
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60">
                <span className="text-[10px] text-amber-600 font-bold block">Amazon</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.channelAllocation.amazon || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60">
                <span className="text-[10px] text-blue-600 font-bold block">Flipkart</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.channelAllocation.flipkart || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-pink-50/60 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800/60">
                <span className="text-[10px] text-pink-600 font-bold block">Meesho</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.channelAllocation.meesho || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-[10px] text-emerald-600 font-bold block">Local Store</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.channelAllocation.local || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60">
                <span className="text-[10px] text-purple-600 font-bold block">Bulk Res.</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.reservedStock || 0}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
                <span className="text-[10px] text-zinc-400 font-bold block">Buffer</span>
                <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                  {variant.channelAllocation.unallocated || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Movement History for this SKU */}
          <div className="space-y-2">
            <span className="font-bold text-zinc-900 dark:text-white block">
              Recent Movements ({variantMovements.length})
            </span>

            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-40 overflow-y-auto">
              {variantMovements.length === 0 ? (
                <div className="p-3 text-center text-zinc-400 text-xs">
                  No recent movements recorded for this SKU.
                </div>
              ) : (
                variantMovements.map((m) => (
                  <div key={m.id} className="p-2.5 flex items-center justify-between text-[11px]">
                    <div>
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {m.reason}
                      </span>
                      <span className="text-zinc-400 block text-[10px]">
                        {new Date(m.timestamp).toLocaleString()} by {m.performedBy}
                      </span>
                    </div>
                    <span
                      className={`font-mono font-bold text-xs ${
                        m.quantityChanged > 0 ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {m.quantityChanged > 0 ? `+${m.quantityChanged}` : m.quantityChanged}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenQuickAdjustment(variant);
            }}
            className="px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl hover:bg-rose-100 transition flex items-center gap-1.5"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Quick Stock Adjust</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-100 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
