import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check, AlertCircle } from 'lucide-react';
import { InventoryItem, MovementType } from '../types/inventory';

interface StockAdjustmentModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  initialType?: MovementType;
  userName: string;
  onClose: () => void;
  onSubmit: (
    item: InventoryItem,
    type: MovementType,
    quantityChanged: number,
    reason: string
  ) => Promise<void>;
}

export const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({
  isOpen,
  item,
  initialType = 'IN',
  userName,
  onClose,
  onSubmit,
}) => {
  const [type, setType] = useState<MovementType>(initialType);
  const [amount, setAmount] = useState<number>(1);
  const [reason, setReason] = useState<string>('Restock / Purchase');
  const [customReason, setCustomReason] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setType(initialType);
    setAmount(1);
    setError(null);
    if (initialType === 'IN') {
      setReason('Restock / Supplier Delivery');
    } else {
      setReason('Customer Order / Dispatch');
    }
    setCustomReason('');
  }, [initialType, item, isOpen]);

  if (!isOpen || !item) return null;

  const currentQty = item.quantity;
  const newQty =
    type === 'IN' ? currentQty + amount : Math.max(0, currentQty - amount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (amount <= 0) {
      setError('Amount must be greater than zero.');
      return;
    }

    if (type === 'OUT' && amount > currentQty) {
      setError(`Cannot dispatch ${amount} units. Only ${currentQty} units in stock.`);
      return;
    }

    const finalReason = reason === 'Other' ? customReason.trim() || 'Manual Adjustment' : reason;

    setIsSubmitting(true);
    try {
      await onSubmit(item, type, amount, finalReason);
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to update stock in Google Sheet';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-xl ${
                type === 'IN'
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400'
              }`}
            >
              {type === 'IN' ? (
                <ArrowDownRight className="w-5 h-5" />
              ) : (
                <ArrowUpRight className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                {type === 'IN' ? 'Stock IN (Receive)' : 'Stock OUT (Dispatch)'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
                {item.sku} - {item.name}
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

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Toggle Type */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType('IN');
                setReason('Restock / Supplier Delivery');
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                type === 'IN'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Stock IN (+)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('OUT');
                setReason('Customer Order / Dispatch');
              }}
              className={`py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition ${
                type === 'OUT'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Stock OUT (-)
            </button>
          </div>

          {/* Quantity Calculation Card */}
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Current</span>
              <div className="text-xl font-bold text-zinc-700 dark:text-zinc-300">{currentQty}</div>
            </div>
            <div className="text-zinc-400 font-bold text-lg">{type === 'IN' ? '+' : '-'}</div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Change</span>
              <div
                className={`text-xl font-bold ${
                  type === 'IN' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                }`}
              >
                {amount}
              </div>
            </div>
            <div className="text-zinc-400 font-bold text-lg">=</div>
            <div className="text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400">Result</span>
              <div className="text-xl font-bold text-zinc-900 dark:text-white">{newQty}</div>
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity to {type === 'IN' ? 'Add' : 'Deduct'}
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAmount(Math.max(1, amount - 5))}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                -5
              </button>
              <button
                type="button"
                onClick={() => setAmount(Math.max(1, amount - 1))}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                -1
              </button>
              <input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="flex-1 px-3 py-2 text-center text-sm font-bold rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
              <button
                type="button"
                onClick={() => setAmount(amount + 1)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                +1
              </button>
              <button
                type="button"
                onClick={() => setAmount(amount + 5)}
                className="px-2.5 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700"
              >
                +5
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Transaction Reason
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
            >
              {type === 'IN' ? (
                <>
                  <option value="Restock / Supplier Delivery">Restock / Supplier Delivery</option>
                  <option value="Customer Return">Customer Return</option>
                  <option value="Warehouse Transfer In">Warehouse Transfer In</option>
                  <option value="Inventory Audit Correction (+)">Inventory Audit Correction (+)</option>
                  <option value="Other">Other Reason...</option>
                </>
              ) : (
                <>
                  <option value="Customer Order / Dispatch">Customer Order / Dispatch</option>
                  <option value="Damaged / Broken Item">Damaged / Broken Item</option>
                  <option value="Expired / Spoiled Goods">Expired / Spoiled Goods</option>
                  <option value="Internal Use / Sampling">Internal Use / Sampling</option>
                  <option value="Inventory Audit Correction (-)">Inventory Audit Correction (-)</option>
                  <option value="Other">Other Reason...</option>
                </>
              )}
            </select>

            {reason === 'Other' && (
              <input
                type="text"
                placeholder="Specify reason"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            )}
          </div>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Recorded by: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{userName}</span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 text-xs font-medium text-white rounded-xl shadow-xs transition flex items-center gap-1.5 disabled:opacity-50 ${
                type === 'IN'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              Confirm {type === 'IN' ? 'Stock In' : 'Stock Out'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
