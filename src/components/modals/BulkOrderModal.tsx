import React, { useState } from 'react';
import {
  X,
  Truck,
  Plus,
  Trash2,
  AlertCircle,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  BulkOrder,
  BulkOrderItem,
  ProductVariant,
  ComboProduct,
  BulkOrderStatus,
} from '../../types/partyInventory';

interface BulkOrderModalProps {
  isOpen: boolean;
  variants: ProductVariant[];
  combos: ComboProduct[];
  onClose: () => void;
  onSubmit: (order: BulkOrder) => void;
}

export const BulkOrderModal: React.FC<BulkOrderModalProps> = ({
  isOpen,
  variants,
  combos,
  onClose,
  onSubmit,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerCompany, setCustomerCompany] = useState('');
  const [eventDate, setEventDate] = useState(
    new Date(Date.now() + 86400000 * 7).toISOString().slice(0, 10)
  );
  const [initialStatus, setInitialStatus] = useState<BulkOrderStatus>('Confirmed');
  const [discount, setDiscount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [notes, setNotes] = useState('');

  // Items
  const [items, setItems] = useState<BulkOrderItem[]>([]);
  const [selectedType, setSelectedType] = useState<'VARIANT' | 'COMBO'>('VARIANT');
  const [selectedSku, setSelectedSku] = useState(variants[0]?.sku || '');
  const [qtyToAdd, setQtyToAdd] = useState<number>(50);
  const [customPrice, setCustomPrice] = useState<number>(variants[0]?.sellingPrice || 65);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (selectedType === 'VARIANT') {
      const v = variants.find((item) => item.sku === selectedSku);
      if (!v) return;

      const newItem: BulkOrderItem = {
        variantId: v.id,
        sku: v.sku,
        name: `${v.productName} (${v.variantName})`,
        isCombo: false,
        quantity: qtyToAdd,
        unitPrice: customPrice,
        totalPrice: qtyToAdd * customPrice,
      };
      setItems([...items, newItem]);
    } else {
      const c = combos.find((item) => item.sku === selectedSku);
      if (!c) return;

      const newItem: BulkOrderItem = {
        comboId: c.id,
        sku: c.sku,
        name: c.name,
        isCombo: true,
        quantity: qtyToAdd,
        unitPrice: customPrice,
        totalPrice: qtyToAdd * customPrice,
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const totalAmount = Math.max(0, subtotal - discount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Decorator / Customer name is required.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one line item to the bulk order.');
      return;
    }

    const orderId = `BLK-2026-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder: BulkOrder = {
      id: orderId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerCompany: customerCompany.trim() || undefined,
      eventDate,
      orderDate: new Date().toISOString().slice(0, 10),
      status: initialStatus,
      stockReserved: initialStatus === 'Confirmed' || initialStatus === 'Stock Reserved',
      items,
      subtotal,
      discount,
      advancePaid,
      totalAmount,
      notes: notes.trim() || undefined,
    };

    onSubmit(newOrder);
    onClose();
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
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Create Local Bulk Order
              </h3>
              <p className="text-xs text-zinc-400">
                Book decor event orders with automatic stock reservations
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Customer Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Decorator / Customer Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Star Celebrations Decor"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Contact Phone
              </label>
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Event / Venue Date
              </label>
              <input
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Initial Status
              </label>
              <select
                value={initialStatus}
                onChange={(e) => setInitialStatus(e.target.value as BulkOrderStatus)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
              >
                <option value="Confirmed">Confirmed (Reserve Stock Immediately)</option>
                <option value="Quotation">Quotation (Do Not Reserve Stock)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Company / Agency (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Star Banquets"
                value={customerCompany}
                onChange={(e) => setCustomerCompany(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          {/* Add Line Items Section */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
            <span className="font-bold text-zinc-900 dark:text-white block">
              Add Products or Combos to Order
            </span>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex rounded-xl bg-zinc-100 dark:bg-zinc-800 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('VARIANT');
                    setSelectedSku(variants[0]?.sku || '');
                    setCustomPrice(variants[0]?.sellingPrice || 60);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedType === 'VARIANT'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500'
                  }`}
                >
                  Individual SKU
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedType('COMBO');
                    setSelectedSku(combos[0]?.sku || '');
                    setCustomPrice(combos[0]?.sellingPrice || 450);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    selectedType === 'COMBO'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-500'
                  }`}
                >
                  Combo Bundle
                </button>
              </div>

              <select
                value={selectedSku}
                onChange={(e) => {
                  setSelectedSku(e.target.value);
                  if (selectedType === 'VARIANT') {
                    const v = variants.find((item) => item.sku === e.target.value);
                    if (v) setCustomPrice(v.sellingPrice);
                  } else {
                    const c = combos.find((item) => item.sku === e.target.value);
                    if (c) setCustomPrice(c.sellingPrice);
                  }
                }}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
              >
                {selectedType === 'VARIANT'
                  ? variants.map((v) => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} – {v.productName} ({v.variantName}) [Avail: {v.availableStock}]
                      </option>
                    ))
                  : combos.map((c) => (
                      <option key={c.sku} value={c.sku}>
                        {c.sku} – {c.name}
                      </option>
                    ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={qtyToAdd}
                onChange={(e) => setQtyToAdd(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-center"
              />

              <input
                type="number"
                min="1"
                placeholder="Unit Price"
                value={customPrice}
                onChange={(e) => setCustomPrice(parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-center"
              />

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Item</span>
              </button>
            </div>

            {/* Line Items Table */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              {items.length === 0 ? (
                <div className="p-4 text-center text-zinc-400 text-xs">
                  No products added yet. Add items above to build order quotation.
                </div>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white block">
                        {it.name}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">
                        {it.sku} {it.isCombo && '• (Combo Bundle)'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">
                        {it.quantity} × ₹{it.unitPrice} = ₹{it.totalPrice.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        className="p-1 text-zinc-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Pricing Summary */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-800">
            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Subtotal</label>
              <div className="text-base font-bold text-zinc-900 dark:text-white font-mono">
                ₹{subtotal.toLocaleString()}
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Bulk Discount (₹)</label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-500 mb-1">Advance Received (₹)</label>
              <input
                type="number"
                min="0"
                value={advancePaid}
                onChange={(e) => setAdvancePaid(parseFloat(e.target.value) || 0)}
                className="w-full px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono font-bold text-emerald-600"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">
              Net Payable: <span className="text-blue-600">₹{totalAmount.toLocaleString()}</span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition"
              >
                Save Bulk Order
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
