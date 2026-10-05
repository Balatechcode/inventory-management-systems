import React, { useState } from 'react';
import {
  X,
  RotateCcw,
  AlertCircle,
} from 'lucide-react';
import {
  ReturnItem,
  ProductVariant,
  SalesChannel,
} from '../../types/partyInventory';

interface CreateReturnModalProps {
  isOpen: boolean;
  variants: ProductVariant[];
  onClose: () => void;
  onSubmit: (returnItem: ReturnItem) => void;
}

export const CreateReturnModal: React.FC<CreateReturnModalProps> = ({
  isOpen,
  variants,
  onClose,
  onSubmit,
}) => {
  const [orderId, setOrderId] = useState('ORD-AMZ-9901');
  const [channel, setChannel] = useState<SalesChannel>('Amazon');
  const [customerName, setCustomerName] = useState('');
  const [selectedSku, setSelectedSku] = useState(variants[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<ReturnItem['reason']>('Customer Return');
  const [condition, setCondition] = useState<ReturnItem['condition']>('Inspection Required');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVar = variants.find((v) => v.sku === selectedSku);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    const returnId = `RET-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newReturn: ReturnItem = {
      id: returnId,
      orderId: orderId.trim(),
      channel,
      customerName: customerName.trim(),
      sku: selectedSku,
      productName: currentVar ? `${currentVar.productName} (${currentVar.variantName})` : selectedSku,
      quantity,
      reason,
      condition,
      returnDate: new Date().toISOString().slice(0, 10),
      notes: notes.trim() || undefined,
    };

    onSubmit(newReturn);
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
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Log Customer / Marketplace Return
              </h3>
              <p className="text-xs text-zinc-400">Record inward return for quarantine check</p>
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Original Order ID
              </label>
              <input
                type="text"
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as SalesChannel)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Meesho">Meesho</option>
                <option value="Local">Local</option>
                <option value="Bulk Order">Bulk Order</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Customer Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Amit Trivedi"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
            />
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Returned SKU
            </label>
            <select
              value={selectedSku}
              onChange={(e) => setSelectedSku(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
            >
              {variants.map((v) => (
                <option key={v.sku} value={v.sku}>
                  {v.sku} – {v.productName} ({v.variantName})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Quantity Returned
              </label>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10) || 1)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Return Reason
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReturnItem['reason'])}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              >
                <option value="Customer Return">Customer Return</option>
                <option value="Damaged">Damaged in Transit</option>
                <option value="Wrong Product">Wrong Product Shipped</option>
                <option value="Wrong Variant">Wrong Color / Variant</option>
                <option value="Marketplace Return">Marketplace RTO / Return</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Inspection Disposition
            </label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value as ReturnItem['condition'])}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-semibold"
            >
              <option value="Inspection Required">Inspection Required (Quarantine Dock)</option>
              <option value="Sellable">Sellable (Add directly to Available Stock)</option>
              <option value="Damaged">Damaged (Move to Damaged Non-Sellable)</option>
            </select>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition"
            >
              Record Return
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
