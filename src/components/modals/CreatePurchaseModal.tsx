import React, { useState, useEffect } from 'react';
import {
  X,
  Receipt,
  Plus,
  AlertCircle,
  Package,
} from 'lucide-react';
import {
  PurchaseOrder,
  Supplier,
  ProductVariant,
} from '../../types/partyInventory';

interface CreatePurchaseModalProps {
  isOpen: boolean;
  suppliers: Supplier[];
  variants: ProductVariant[];
  initialVariant?: ProductVariant | null;
  initialQty?: number;
  onClose: () => void;
  onSubmit: (po: PurchaseOrder, autoReceive?: boolean) => void;
}

export const CreatePurchaseModal: React.FC<CreatePurchaseModalProps> = ({
  isOpen,
  suppliers,
  variants,
  initialVariant,
  initialQty = 200,
  onClose,
  onSubmit,
}) => {
  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedSku, setSelectedSku] = useState(initialVariant?.sku || variants[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(initialQty);
  const [purchasePrice, setPurchasePrice] = useState<number>(initialVariant?.purchasePrice || 28);
  const [paymentStatus, setPaymentStatus] = useState<PurchaseOrder['paymentStatus']>('Paid');
  const [notes, setNotes] = useState('');
  const [autoInward, setAutoInward] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVariant) {
      setSelectedSku(initialVariant.sku);
      setPurchasePrice(initialVariant.purchasePrice);
      setQuantity(initialQty);
      if (initialVariant.supplier) {
        setSupplier(initialVariant.supplier);
      }
    }
    const inv = `INV-${Math.floor(100 + Math.random() * 900)}`;
    setInvoiceNumber(inv);
  }, [initialVariant, initialQty, isOpen]);

  if (!isOpen) return null;

  const currentVar = variants.find((v) => v.sku === selectedSku);
  const totalCost = quantity * purchasePrice;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!supplier.trim()) {
      setError('Supplier is required.');
      return;
    }
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    const poId = `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newPO: PurchaseOrder = {
      id: poId,
      supplier,
      invoiceNumber: invoiceNumber.trim() || `INV-${Date.now().toString().slice(-4)}`,
      purchaseDate: new Date().toISOString().slice(0, 10),
      variantSku: selectedSku,
      variantName: currentVar ? `${currentVar.productName} (${currentVar.variantName})` : selectedSku,
      quantity,
      purchasePrice,
      totalCost,
      paymentStatus,
      notes: notes.trim() || undefined,
      receivedDate: autoInward ? new Date().toISOString().slice(0, 10) : undefined,
    };

    onSubmit(newPO, autoInward);
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
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                New Purchase Order
              </h3>
              <p className="text-xs text-zinc-400">Order from manufacturer & restock warehouse</p>
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

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Supplier / Factory
            </label>
            <select
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
            >
              {suppliers.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name} (Lead time: {s.leadTimeDays}d)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Select Variant SKU
            </label>
            <select
              value={selectedSku}
              onChange={(e) => {
                setSelectedSku(e.target.value);
                const v = variants.find((item) => item.sku === e.target.value);
                if (v) setPurchasePrice(v.purchasePrice);
              }}
              className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-zinc-900 dark:text-white"
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
                Quantity to Inward
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
                Purchase Price (₹)
              </label>
              <input
                type="number"
                min="0.1"
                step="0.1"
                required
                value={purchasePrice}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Payment Status
              </label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as PurchaseOrder['paymentStatus'])}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              >
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
                <option value="Partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Auto Inward Checkbox */}
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-2">
            <input
              type="checkbox"
              id="autoInward"
              checked={autoInward}
              onChange={(e) => setAutoInward(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
            />
            <label htmlFor="autoInward" className="text-emerald-900 dark:text-emerald-300 font-semibold cursor-pointer">
              Directly inward stock now (+{quantity} to physical inventory)
            </label>
          </div>

          {/* Cost preview */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">
              Total PO Cost: <span className="text-emerald-600 font-mono">₹{totalCost.toLocaleString()}</span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition"
              >
                Submit Purchase
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
