import React, { useState, useEffect } from 'react';
import {
  X,
  PlusCircle,
  MinusCircle,
  AlertCircle,
  Check,
  Package,
} from 'lucide-react';
import { ProductVariant, TransactionType } from '../../types/partyInventory';

interface QuickStockAdjustmentModalProps {
  isOpen: boolean;
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  userName: string;
  onClose: () => void;
  onSubmit: (variant: ProductVariant, delta: number, reason: string, type: TransactionType) => void;
}

export const QuickStockAdjustmentModal: React.FC<QuickStockAdjustmentModalProps> = ({
  isOpen,
  variants,
  selectedVariant,
  userName,
  onClose,
  onSubmit,
}) => {
  const [sku, setSku] = useState(selectedVariant?.sku || variants[0]?.sku || '');
  const [direction, setDirection] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [quantity, setQuantity] = useState<number>(50);
  const [reason, setReason] = useState<string>('New Supplier Purchase');
  const [customReason, setCustomReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedVariant) {
      setSku(selectedVariant.sku);
    } else if (variants.length > 0 && !sku) {
      setSku(variants[0].sku);
    }
  }, [selectedVariant, variants]);

  if (!isOpen) return null;

  const currentVar = variants.find((v) => v.sku === sku) || variants[0];
  const currentStock = currentVar ? currentVar.currentStock : 0;
  const delta = direction === 'ADD' ? quantity : -quantity;
  const resultingStock = Math.max(0, currentStock + delta);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (direction === 'DEDUCT' && quantity > currentStock) {
      setError(`Cannot deduct ${quantity} units. Only ${currentStock} units in physical stock.`);
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() || 'Manual Adjustment' : reason;
    let type: TransactionType = 'STOCK_ADJUSTMENT';
    if (direction === 'ADD' && reason.includes('Purchase')) type = 'PURCHASE';
    if (direction === 'DEDUCT' && reason.includes('Damage')) type = 'DAMAGED';
    if (direction === 'DEDUCT' && reason.includes('Sale')) type = 'SALE';
    if (direction === 'ADD' && reason.includes('Return')) type = 'RETURN';

    onSubmit(currentVar, delta, finalReason, type);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Quick Stock Adjustment
              </h3>
              <p className="text-xs text-zinc-400">Immediate inventory reconciliation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* SKU Picker */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Variant SKU
            </label>
            <select
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono font-medium"
            >
              {variants.map((v) => (
                <option key={v.sku} value={v.sku}>
                  {v.sku} – {v.productName} ({v.variantName})
                </option>
              ))}
            </select>
          </div>

          {/* Direction Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setDirection('ADD');
                setReason('New Supplier Purchase');
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                direction === 'ADD'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Add Stock (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setDirection('DEDUCT');
                setReason('Damaged / Defect Goods');
              }}
              className={`py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition ${
                direction === 'DEDUCT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              Deduct Stock (-)
            </button>
          </div>

          {/* Calculation Preview */}
          <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-center">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Current</span>
              <span className="font-bold text-base text-zinc-800 dark:text-zinc-200">
                {currentStock}
              </span>
            </div>
            <span className="font-bold text-lg text-zinc-400">
              {direction === 'ADD' ? '+' : '-'}
            </span>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">Adjust</span>
              <span
                className={`font-bold text-base ${
                  direction === 'ADD' ? 'text-emerald-600' : 'text-rose-600'
                }`}
              >
                {quantity}
              </span>
            </div>
            <span className="font-bold text-lg text-zinc-400">=</span>
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">New Balance</span>
              <span className="font-bold text-base text-zinc-900 dark:text-white">
                {resultingStock}
              </span>
            </div>
          </div>

          {/* Quantity Input */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity
            </label>
            <div className="flex items-center gap-2">
              {[10, 50, 100, 250].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setQuantity(amt)}
                  className={`flex-1 py-1.5 rounded-lg border font-bold text-xs ${
                    quantity === amt
                      ? 'border-rose-500 bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  {amt}
                </button>
              ))}
            </div>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="mt-2 w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
            />
          </div>

          {/* Reason Selection */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Mandatory Audit Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
            >
              {direction === 'ADD' ? (
                <>
                  <option value="New Supplier Purchase">New Supplier Purchase</option>
                  <option value="Customer Return Restock">Customer Return Restock</option>
                  <option value="Warehouse Audit Count (+)">Warehouse Audit Count (+)</option>
                  <option value="Supplier Sample Inward">Supplier Sample Inward</option>
                  <option value="Other">Other Reason...</option>
                </>
              ) : (
                <>
                  <option value="Damaged / Defect Goods">Damaged / Defect Goods</option>
                  <option value="Lost / Missing Stock">Lost / Missing Stock</option>
                  <option value="Store Display Sampling">Store Display Sampling</option>
                  <option value="Warehouse Audit Count (-)">Warehouse Audit Count (-)</option>
                  <option value="Other">Other Reason...</option>
                </>
              )}
            </select>

            {reason === 'Other' && (
              <input
                type="text"
                placeholder="Specify adjustment justification..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2 w-full px-3 py-1.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            )}
          </div>

          <div className="text-[11px] text-zinc-400">
            Audit Actor: <strong>{userName}</strong> (creates immutable stock movement log)
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 text-xs font-semibold text-white rounded-xl shadow-xs transition ${
                direction === 'ADD'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              Commit Adjustment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
