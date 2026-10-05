import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Plus,
  Trash2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import {
  SalesOrder,
  SalesOrderItem,
  OrderChannel,
  ProductVariant,
  ComboProduct,
} from '../../types/partyInventory';

interface CreateSalesOrderModalProps {
  isOpen: boolean;
  variants: ProductVariant[];
  combos: ComboProduct[];
  onClose: () => void;
  onSubmit: (order: SalesOrder) => void;
}

export const CreateSalesOrderModal: React.FC<CreateSalesOrderModalProps> = ({
  isOpen,
  variants,
  combos,
  onClose,
  onSubmit,
}) => {
  const [channel, setChannel] = useState<OrderChannel>('Amazon');
  const [customerName, setCustomerName] = useState('');
  const [discount, setDiscount] = useState<number>(0);
  const [shipping, setShipping] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<SalesOrder['paymentStatus']>('Paid');

  // Order line items
  const [items, setItems] = useState<SalesOrderItem[]>([]);
  const [itemType, setItemType] = useState<'VARIANT' | 'COMBO'>('COMBO');
  const [selectedSku, setSelectedSku] = useState(combos[0]?.sku || variants[0]?.sku || '');
  const [quantity, setQuantity] = useState<number>(1);
  const [unitPrice, setUnitPrice] = useState<number>(combos[0]?.sellingPrice || 499);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddItem = () => {
    if (itemType === 'COMBO') {
      const c = combos.find((item) => item.sku === selectedSku);
      if (!c) return;

      const newItem: SalesOrderItem = {
        comboId: c.id,
        sku: c.sku,
        name: c.name,
        isCombo: true,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
      setItems([...items, newItem]);
    } else {
      const v = variants.find((item) => item.sku === selectedSku);
      if (!v) return;

      const newItem: SalesOrderItem = {
        variantId: v.id,
        sku: v.sku,
        name: `${v.productName} (${v.variantName})`,
        isCombo: false,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
      };
      setItems([...items, newItem]);
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);
  const total = Math.max(0, subtotal - discount + shipping + tax);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!customerName.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (items.length === 0) {
      setError('Please add at least one product or combo to the order.');
      return;
    }

    const orderId = `ORD-${channel.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: SalesOrder = {
      id: orderId,
      channel,
      customerName: customerName.trim(),
      orderDate: new Date().toISOString(),
      items,
      subtotal,
      discount,
      shipping,
      tax,
      total,
      paymentStatus,
      orderStatus: channel === 'Local' ? 'Delivered' : 'Processing',
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
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900 dark:text-white">
                Log New Sales Order
              </h3>
              <p className="text-xs text-zinc-400">
                Supports single items and combos with automatic component stock reduction
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

          {/* Channel and Customer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Sales Channel
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as OrderChannel)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-semibold"
              >
                <option value="Amazon">Amazon</option>
                <option value="Flipkart">Flipkart</option>
                <option value="Meesho">Meesho</option>
                <option value="Local">Local Store / Walk-in</option>
                <option value="Bulk">Bulk Order</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Customer Name / Marketplace Buyer
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-medium"
              />
            </div>
          </div>

          {/* Add Items Box */}
          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <span className="font-bold text-zinc-900 dark:text-white block">
              + Add Ordered Items (Individual SKUs or Combos)
            </span>

            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex rounded-xl bg-zinc-200 dark:bg-zinc-700 p-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setItemType('COMBO');
                    setSelectedSku(combos[0]?.sku || '');
                    setUnitPrice(combos[0]?.sellingPrice || 499);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    itemType === 'COMBO'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Combo Bundle ✨
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setItemType('VARIANT');
                    setSelectedSku(variants[0]?.sku || '');
                    setUnitPrice(variants[0]?.sellingPrice || 75);
                  }}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                    itemType === 'VARIANT'
                      ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-2xs'
                      : 'text-zinc-600 dark:text-zinc-400'
                  }`}
                >
                  Single Variant SKU
                </button>
              </div>

              <select
                value={selectedSku}
                onChange={(e) => {
                  setSelectedSku(e.target.value);
                  if (itemType === 'COMBO') {
                    const c = combos.find((item) => item.sku === e.target.value);
                    if (c) setUnitPrice(c.sellingPrice);
                  } else {
                    const v = variants.find((item) => item.sku === e.target.value);
                    if (v) setUnitPrice(v.sellingPrice);
                  }
                }}
                className="flex-1 min-w-[200px] px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-mono text-xs"
              >
                {itemType === 'COMBO'
                  ? combos.map((c) => (
                      <option key={c.sku} value={c.sku}>
                        {c.sku} – {c.name} (₹{c.sellingPrice})
                      </option>
                    ))
                  : variants.map((v) => (
                      <option key={v.sku} value={v.sku}>
                        {v.sku} – {v.productName} ({v.variantName}) [Avail: {v.availableStock}]
                      </option>
                    ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Qty"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-16 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-center"
              />

              <input
                type="number"
                min="1"
                placeholder="Price"
                value={unitPrice}
                onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                className="w-20 px-3 py-2 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 font-bold text-center"
              />

              <button
                type="button"
                onClick={handleAddItem}
                className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>

            {/* Line Items List */}
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
              {items.length === 0 ? (
                <div className="p-3 text-center text-zinc-400 text-xs">
                  No items added yet. Choose a combo or variant and click Add.
                </div>
              ) : (
                items.map((it, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                        {it.name}
                        {it.isCombo && (
                          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-rose-100 text-rose-700">
                            Combo (Auto-deducts components)
                          </span>
                        )}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">{it.sku}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                        {it.quantity} × ₹{it.unitPrice} = ₹{it.totalPrice}
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

          {/* Pricing Adjustments */}
          <div className="grid grid-cols-4 gap-2.5 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40">
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                Subtotal
              </label>
              <span className="font-bold text-sm text-zinc-800 dark:text-zinc-200 font-mono">
                ₹{subtotal}
              </span>
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                Discount (₹)
              </label>
              <input
                type="number"
                min="0"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                Shipping (₹)
              </label>
              <input
                type="number"
                min="0"
                value={shipping}
                onChange={(e) => setShipping(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-400 mb-0.5">
                Tax (₹)
              </label>
              <input
                type="number"
                min="0"
                value={tax}
                onChange={(e) => setTax(parseFloat(e.target.value) || 0)}
                className="w-full px-2 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <span className="font-bold text-sm text-zinc-900 dark:text-white">
              Total Order Value: <span className="text-emerald-600">₹{total}</span>
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
                className="px-5 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition"
              >
                Process & Deduct Stock
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
