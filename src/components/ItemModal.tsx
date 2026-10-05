import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Save, AlertCircle } from 'lucide-react';
import { InventoryItem } from '../types/inventory';

interface ItemModalProps {
  isOpen: boolean;
  itemToEdit: InventoryItem | null;
  categories: string[];
  onClose: () => void;
  onSave: (itemData: Omit<InventoryItem, 'rowIndex'>) => Promise<void>;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  itemToEdit,
  categories,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    id: '',
    sku: '',
    name: '',
    category: '',
    quantity: 0,
    minThreshold: 10,
    unitPrice: 0,
    supplier: '',
    location: '',
  });

  const [customCategory, setCustomCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        id: itemToEdit.id,
        sku: itemToEdit.sku,
        name: itemToEdit.name,
        category: itemToEdit.category,
        quantity: itemToEdit.quantity,
        minThreshold: itemToEdit.minThreshold,
        unitPrice: itemToEdit.unitPrice,
        supplier: itemToEdit.supplier,
        location: itemToEdit.location,
      });
      setCustomCategory('');
    } else {
      const generatedId = `ITEM-${Math.floor(1000 + Math.random() * 9000)}`;
      const generatedSku = `SKU-${Math.floor(100 + Math.random() * 900)}`;
      setFormData({
        id: generatedId,
        sku: generatedSku,
        name: '',
        category: categories[0] || 'General',
        quantity: 10,
        minThreshold: 5,
        unitPrice: 19.99,
        supplier: '',
        location: 'Main Warehouse',
      });
      setCustomCategory('');
    }
    setError(null);
  }, [itemToEdit, isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Product name is required.');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU code is required.');
      return;
    }
    if (formData.quantity < 0) {
      setError('Quantity cannot be negative.');
      return;
    }
    if (formData.minThreshold < 0) {
      setError('Minimum threshold cannot be negative.');
      return;
    }
    if (formData.unitPrice < 0) {
      setError('Unit price cannot be negative.');
      return;
    }

    const finalCategory =
      formData.category === 'CUSTOM' ? customCategory.trim() || 'General' : formData.category;

    const status =
      formData.quantity === 0
        ? 'OUT_OF_STOCK'
        : formData.quantity <= formData.minThreshold
        ? 'LOW_STOCK'
        : 'IN_STOCK';

    setIsSubmitting(true);
    try {
      await onSave({
        ...formData,
        category: finalCategory,
        status,
        lastUpdated: new Date().toISOString(),
      });
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save item to Google Sheet';
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
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {itemToEdit ? 'Edit Inventory Item' : 'Add New Inventory Item'}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Syncs directly to your Google Sheets database
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Item ID
              </label>
              <input
                type="text"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                SKU (Barcode/Tag)
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                required
                placeholder="e.g. ELC-100"
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Product / Item Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Wireless Ergonomic Mouse"
              className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
                <option value="CUSTOM">+ Add Custom Category...</option>
              </select>

              {formData.category === 'CUSTOM' && (
                <input
                  type="text"
                  placeholder="New category name"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs rounded-lg bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Unit Price ($ USD)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: parseFloat(e.target.value) || 0 })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Current Stock Qty
              </label>
              <input
                type="number"
                min="0"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Min Threshold (Alert Level)
              </label>
              <input
                type="number"
                min="1"
                value={formData.minThreshold}
                onChange={(e) =>
                  setFormData({ ...formData, minThreshold: parseInt(e.target.value, 10) || 1 })
                }
                required
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Supplier / Vendor
              </label>
              <input
                type="text"
                placeholder="e.g. Acme Wholesale"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Warehouse Location / Bin
              </label>
              <input
                type="text"
                placeholder="e.g. Aisle 4 - Bin B"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-xl bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-white"
              />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-zinc-700/60 text-[11px] text-zinc-600 dark:text-zinc-400">
            💡 When saved, this item will be synchronized directly to the Google Sheet tab{' '}
            <code className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-zinc-900 dark:text-zinc-100">
              Inventory
            </code>
            .
          </div>

          {/* Footer Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              {itemToEdit ? 'Save Changes' : 'Create Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
