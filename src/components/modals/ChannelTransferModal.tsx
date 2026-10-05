import React, { useState } from 'react';
import { X, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { ProductVariant, ChannelAllocation } from '../../types/partyInventory';

interface ChannelTransferModalProps {
  isOpen: boolean;
  variant: ProductVariant | null;
  userName: string;
  onClose: () => void;
  onTransfer: (
    variant: ProductVariant,
    fromChannel: keyof ChannelAllocation,
    toChannel: keyof ChannelAllocation,
    quantity: number
  ) => void;
}

export const ChannelTransferModal: React.FC<ChannelTransferModalProps> = ({
  isOpen,
  variant,
  userName,
  onClose,
  onTransfer,
}) => {
  const [fromChannel, setFromChannel] = useState<keyof ChannelAllocation>('unallocated');
  const [toChannel, setToChannel] = useState<keyof ChannelAllocation>('amazon');
  const [quantity, setQuantity] = useState<number>(20);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !variant) return null;

  const availableInFrom = variant.channelAllocation[fromChannel] || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (fromChannel === toChannel) {
      setError('Source channel and destination channel must be different.');
      return;
    }

    if (quantity <= 0) {
      setError('Transfer quantity must be greater than zero.');
      return;
    }

    if (quantity > availableInFrom) {
      setError(
        `Cannot transfer ${quantity} units from ${String(fromChannel).toUpperCase()}. Only ${availableInFrom} units available.`
      );
      return;
    }

    onTransfer(variant, fromChannel, toChannel, quantity);
    onClose();
  };

  const channelOptions: { key: keyof ChannelAllocation; label: string }[] = [
    { key: 'amazon', label: 'Amazon' },
    { key: 'flipkart', label: 'Flipkart' },
    { key: 'meesho', label: 'Meesho' },
    { key: 'local', label: 'Local Store Counter' },
    { key: 'unallocated', label: 'Unallocated Buffer' },
  ];

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
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Channel Stock Transfer
              </h3>
              <p className="text-xs font-mono text-zinc-400">{variant.sku} – {variant.variantName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Allocations Strip */}
          <div className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1.5">
              Current Allocation Breakdown
            </span>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="text-[10px] text-amber-500 font-semibold block">Amazon</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.channelAllocation.amazon || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-blue-500 font-semibold block">Flipkart</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.channelAllocation.flipkart || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-pink-500 font-semibold block">Meesho</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.channelAllocation.meesho || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-emerald-500 font-semibold block">Local</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.channelAllocation.local || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-purple-500 font-semibold block">Bulk Res.</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.reservedStock || 0}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 font-semibold block">Buffer</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200 font-mono">
                  {variant.channelAllocation.unallocated || 0}
                </span>
              </div>
            </div>
          </div>

          {/* Transfer From / To Selectors */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Transfer From:
              </label>
              <select
                value={fromChannel}
                onChange={(e) => setFromChannel(e.target.value as keyof ChannelAllocation)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                {channelOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label} ({variant.channelAllocation[opt.key] || 0})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Transfer To:
              </label>
              <select
                value={toChannel}
                onChange={(e) => setToChannel(e.target.value as keyof ChannelAllocation)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                {channelOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transfer Quantity */}
          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Quantity to Transfer
            </label>
            <input
              type="number"
              min="1"
              max={availableInFrom}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-bold"
            />
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
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
            >
              Transfer Units
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
